import React, { useState, useMemo } from "react";
import { Icon } from "./Icon";
import { fmt, fmtShort, today } from "../utils/formatters";

export const TransactionForm = ({ type, products, parties, accounts, onSubmit, onClose }) => {
    const [date, setDate] = useState(today());
    const [partyId, setPartyId] = useState("");
    const [paymentMode, setPaymentMode] = useState("cash");
    const [partySearch, setPartySearch] = useState("");
    const [items, setItems] = useState([{ productId: "", qty: 1, unitPrice: 0 }]);
    const [errors, setErrors] = useState({});

    const filteredParties = parties.filter(p =>
        (type === "purchase" ? p.type === "vendor" : p.type === "client") &&
        p.name.toLowerCase().includes(partySearch.toLowerCase())
    );

    const total = useMemo(() => items.reduce((s, it) => s + (it.qty * it.unitPrice), 0), [items]);

    const addItem = () => setItems(prev => [...prev, { productId: "", qty: 1, unitPrice: 0 }]);
    const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));

    const updateItem = (i, field, value) => {
        setItems(prev => {
            const next = [...prev];
            next[i] = { ...next[i], [field]: value };
            if (field === "productId") {
                const prod = products.find(p => p.id === value);
                if (prod) next[i].unitPrice = type === "purchase" ? prod.purchasePrice : prod.salePrice;
            }
            return next;
        });
    };

    const validate = () => {
        const errs = {};
        if (!partyId) errs.party = "Party required";
        if (!date) errs.date = "Date required";
        items.forEach((it, i) => {
            if (!it.productId) errs[`item_${i}`] = "Select product";
            if (type === "sale") {
                const prod = products.find(p => p.id === it.productId);
                if (prod && prod.stock < it.qty) errs[`item_${i}_qty`] = `Only ${prod.stock} in stock`;
                if (prod && prod.stock === 0) errs[`item_${i}_qty`] = "Out of stock";
            }
        });
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        const party = parties.find(p => p.id === partyId);
        const voucherItems = items.map(it => {
            const prod = products.find(p => p.id === it.productId);
            return { productId: it.productId, name: prod?.name || "", qty: Number(it.qty), unitPrice: Number(it.unitPrice), subtotal: it.qty * it.unitPrice };
        });
        onSubmit({ type, date, party: party.name, partyId, paymentMode, total, items: voucherItems });
    };

    const inputStyle = (err) => ({ width: "100%", padding: "9px 12px", border: `1.5px solid ${err ? "#dc2626" : "#e2e8f0"}`, borderRadius: 8, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: "#f8fafc" });
    const labelStyle = { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5, display: "block" };

    return (
        <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                    <label style={labelStyle}>Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle(errors.date)} />
                </div>
                <div>
                    <label style={labelStyle}>Payment Mode</label>
                    <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} style={inputStyle()}>
                        <option value="cash">Cash</option>
                        <option value="bank">Bank (HBL)</option>
                    </select>
                </div>
            </div>
            <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>{type === "purchase" ? "Vendor" : "Client"}</label>
                <input value={partySearch} onChange={e => setPartySearch(e.target.value)} placeholder={`Search ${type === "purchase" ? "vendor" : "client"}...`} style={inputStyle(errors.party)} />
                {partySearch && filteredParties.length > 0 && (
                    <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 8, marginTop: 4, maxHeight: 140, overflowY: "auto", background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
                        {filteredParties.map(p => (
                            <div key={p.id} onClick={() => { setPartyId(p.id); setPartySearch(p.name); }} style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13, color: "#334155", borderBottom: "1px solid #f1f5f9" }}
                                onMouseEnter={e => e.target.style.background = "#eff6ff"}
                                onMouseLeave={e => e.target.style.background = ""}>
                                {p.name}
                            </div>
                        ))}
                    </div>
                )}
                {errors.party && <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>{errors.party}</div>}
            </div>

            <div style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ ...labelStyle, margin: 0 }}>Line Items</label>
                <button onClick={addItem} style={{ display: "flex", alignItems: "center", gap: 5, background: "#eff6ff", color: "#1e40af", border: "none", borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    <Icon name="plus" size={13} /> Add Item
                </button>
            </div>
            <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr auto", gap: 0, background: "#f8fafc", padding: "8px 14px", fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                    <span>Product</span><span>Qty</span><span>Unit Price</span><span></span>
                </div>
                {items.map((item, i) => {
                    const prod = products.find(p => p.id === item.productId);
                    return (
                        <div key={i} style={{ padding: "10px 14px", borderTop: "1px solid #f1f5f9", display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr auto", gap: 8, alignItems: "start" }}>
                            <div>
                                <select value={item.productId} onChange={e => updateItem(i, "productId", e.target.value)} style={{ ...inputStyle(errors[`item_${i}`]), padding: "8px 10px" }}>
                                    <option value="">-- Select --</option>
                                    {products.map(p => <option key={p.id} value={p.id} disabled={type === "sale" && p.stock === 0}>{p.name} {type === "sale" && p.stock === 0 ? "(OOS)" : ""}</option>)}
                                </select>
                                {errors[`item_${i}`] && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 2 }}>{errors[`item_${i}`]}</div>}
                                {prod && type === "sale" && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Stock: {prod.stock}</div>}
                            </div>
                            <div>
                                <input type="number" min="1" value={item.qty} onChange={e => updateItem(i, "qty", Number(e.target.value))} style={{ ...inputStyle(errors[`item_${i}_qty`]), padding: "8px 10px" }} />
                                {errors[`item_${i}_qty`] && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 2 }}>{errors[`item_${i}_qty`]}</div>}
                            </div>
                            <div>
                                <input type="number" value={item.unitPrice} onChange={e => updateItem(i, "unitPrice", Number(e.target.value))} style={{ ...inputStyle(), padding: "8px 10px" }} />
                                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>= {fmt(item.qty * item.unitPrice)}</div>
                            </div>
                            <button onClick={() => items.length > 1 && removeItem(i)} style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 7, padding: 7, cursor: "pointer", display: "flex", alignItems: "center", marginTop: 2 }}>
                                <Icon name="trash" size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>

            <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b", marginBottom: 4 }}><span>Subtotal</span><span>{fmt(total)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: "#0f172a" }}><span>Total</span><span style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(total)}</span></div>
                <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
                    Double-entry: {type === "purchase"
                        ? `Debit Inventory +${fmtShort(total)} / Credit ${paymentMode === "cash" ? "Cash" : "Bank"} -${fmtShort(total)}`
                        : `Debit ${paymentMode === "cash" ? "Cash" : "Bank"} +${fmtShort(total)} / Credit Sales Revenue +${fmtShort(total)}`}
                </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid #e2e8f0", borderRadius: 9, background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13, color: "#475569", fontFamily: "inherit" }}>Cancel</button>
                <button onClick={handleSubmit} style={{ padding: "10px 24px", border: "none", borderRadius: 9, background: "#1e40af", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name="check" size={15} /> Post {type === "purchase" ? "Purchase" : "Sale"} Voucher
                </button>
            </div>
        </div>
    );
};
