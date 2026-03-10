import React, { useState, useMemo } from "react";
import { Icon } from "./Icon";
import { fmt, fmtShort, today, newId } from "../utils/formatters";

export const TransactionForm = ({ type, products, parties, accounts, onSubmit, onClose, onAddVendor, onAddProduct }) => {
    const [date, setDate] = useState(today());
    const [partyId, setPartyId] = useState("");
    const [paymentMode, setPaymentMode] = useState("cash");
    const [partySearch, setPartySearch] = useState("");
    const [items, setItems] = useState([{ productId: "", qty: 1, unitPrice: 0 }]);
    const [errors, setErrors] = useState({});

    // Quick Add States
    const [showNewVendorModal, setShowNewVendorModal] = useState(false);
    const [showNewProductModal, setShowNewProductModal] = useState(false);
    const [newVendorName, setNewVendorName] = useState("");
    const [newProductForm, setNewProductForm] = useState({ name: "", sku: "", purchasePrice: 0, salePrice: 0, stock: 0 });

    const filteredParties = parties.filter(p =>
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
        if (type === "purchase" && !partyId) errs.party = "Vendor required";
        if (type === "sale" && !partySearch.trim()) errs.party = "Customer name required";
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

    const handleQuickAddVendor = () => {
        if (!newVendorName.trim()) return;
        const vendor = { id: newId("V"), name: newVendorName, type: "vendor" };
        onAddVendor(vendor);
        setPartyId(vendor.id);
        setPartySearch(vendor.name);
        setShowNewVendorModal(false);
        setNewVendorName("");
    };

    const handleQuickAddProduct = () => {
        if (!newProductForm.name || !newProductForm.sku) return;
        const product = {
            ...newProductForm,
            id: newId("P"),
            purchasePrice: Number(newProductForm.purchasePrice),
            salePrice: Number(newProductForm.salePrice),
            stock: Number(newProductForm.stock),
            threshold: 5
        };
        onAddProduct(product);
        updateItem(items.length - 1, "productId", product.id);
        setShowNewProductModal(false);
        setNewProductForm({ name: "", sku: "", purchasePrice: 0, salePrice: 0, stock: 0 });
    };

    const handleSubmit = () => {
        if (!validate()) return;
        const party = parties.find(p => p.id === partyId);
        const finalPartyName = party ? party.name : partySearch;
        const finalPartyId = partyId || (type === "sale" ? `IND-${Date.now()}` : "new-vendor");

        const voucherItems = items.map(it => {
            const prod = products.find(p => p.id === it.productId);
            return { productId: it.productId, name: prod?.name || "", qty: Number(it.qty), unitPrice: Number(it.unitPrice), subtotal: it.qty * it.unitPrice };
        });
        onSubmit({ type, date, party: finalPartyName, partyId: finalPartyId, paymentMode, total, items: voucherItems });
    };

    const inputStyle = (err) => ({ width: "100%", padding: "9px 12px", border: `1.5px solid ${err ? "#dc2626" : "#e2e8f0"}`, borderRadius: 8, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: "#f8fafc" });
    const labelStyle = { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5, display: "block" };

    return (
        <div>
            {/* Header Fields */}
            <div className="grid-1-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                    <label style={labelStyle}>Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle(errors.date)} />
                </div>
                <div>
                    <label style={labelStyle}>Payment Mode</label>
                    <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} style={inputStyle()}>
                        <option value="cash">Cash</option>
                        <option value="bank">Bank</option>
                    </select>
                </div>
            </div>

            {/* Party Selection */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <label style={{ ...labelStyle, margin: 0 }}>{type === "purchase" ? "Vendor" : "Customer Name"}</label>
                    {type === "purchase" && onAddVendor && (
                        <button onClick={() => setShowNewVendorModal(true)} style={{ background: "none", border: "none", color: "#3b82f6", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                            <Icon name="plus" size={10} /> Add New Vendor
                        </button>
                    )}
                    {type === "sale" && <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>(Enter name)</span>}
                </div>
                <input value={partySearch} onChange={e => { setPartySearch(e.target.value); if (partyId) setPartyId(""); }} placeholder={`Enter ${type === "purchase" ? "vendor" : "customer"} name...`} style={inputStyle(errors.party)} />
                {partySearch && filteredParties.length > 0 && !partyId && (
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

            {/* Line Items */}
            <div style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ ...labelStyle, margin: 0 }}>Line Items</label>
                <button onClick={addItem} style={{ display: "flex", alignItems: "center", gap: 5, background: "#eff6ff", color: "#1e40af", border: "none", borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    <Icon name="plus" size={13} /> Add Item
                </button>
            </div>
            <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
                <div className="item-header-row" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr auto", gap: 0, background: "#f8fafc", padding: "8px 14px", fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                    <span>Product</span><span>Qty</span><span>Unit Price</span><span></span>
                </div>
                {items.map((item, i) => {
                    const prod = products.find(p => p.id === item.productId);
                    return (
                        <div key={i} className="item-row" style={{ padding: "10px 14px", borderTop: "1px solid #f1f5f9", display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr auto", gap: 8, alignItems: "start" }}>
                            <div>
                                <select value={item.productId} onChange={e => updateItem(i, "productId", e.target.value)} style={{ ...inputStyle(errors[`item_${i}`]), padding: "8px 10px" }}>
                                    <option value="">-- Select --</option>
                                    {products.map(p => <option key={p.id} value={p.id} disabled={type === "sale" && p.stock === 0}>{p.name} {type === "sale" && p.stock === 0 ? "(OOS)" : ""}</option>)}
                                </select>
                                {i === items.length - 1 && onAddProduct && (
                                    <button onClick={() => setShowNewProductModal(true)} style={{ background: "none", border: "none", color: "#64748b", fontSize: 10, fontWeight: 600, cursor: "pointer", textAlign: "left", width: "fit-content", marginTop: 4 }}>
                                        + Add New Product
                                    </button>
                                )}
                                {errors[`item_${i}`] && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 2 }}>{errors[`item_${i}`]}</div>}
                            </div>
                            <div>
                                <input type="number" min="1" value={item.qty} onChange={e => updateItem(i, "qty", Number(e.target.value))} style={{ ...inputStyle(errors[`item_${i}_qty`]), padding: "8px 10px" }} />
                                {errors[`item_${i}_qty`] && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 2 }}>{errors[`item_${i}_qty`]}</div>}
                                {prod && type === "sale" && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Stock: {prod.stock}</div>}
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

            {/* Summary */}
            <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b", marginBottom: 4 }}><span>Subtotal</span><span>{fmt(total)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: "#0f172a" }}><span>Total</span><span style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(total)}</span></div>
                <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
                    Double-entry: {type === "purchase"
                        ? `Debit Inventory +${fmtShort(total)} / Credit ${paymentMode === "cash" ? "Cash" : "Bank"} -${fmtShort(total)}`
                        : `Debit ${paymentMode === "cash" ? "Cash" : "Bank"} +${fmtShort(total)} / Credit Sales Revenue +${fmtShort(total)}`}
                </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid #e2e8f0", borderRadius: 9, background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13, color: "#475569", fontFamily: "inherit" }}>Cancel</button>
                <button onClick={handleSubmit} style={{ padding: "10px 24px", border: "none", borderRadius: 9, background: "#1e40af", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name="check" size={15} /> Post {type === "purchase" ? "Purchase" : "Sale"} Voucher
                </button>
            </div>

            {/* Modals */}
            {showNewVendorModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
                    <div style={{ background: "#fff", padding: 24, borderRadius: 16, width: 340, boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
                        <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800 }}>Quick Add Vendor</h3>
                        <label style={labelStyle}>Vendor Name</label>
                        <input value={newVendorName} onChange={e => setNewVendorName(e.target.value)} placeholder="e.g. Acme Corp" style={{ ...inputStyle(), marginBottom: 20 }} autoFocus />
                        <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => setShowNewVendorModal(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                            <button onClick={handleQuickAddVendor} style={{ flex: 1.5, padding: 10, borderRadius: 8, border: "none", background: "#3b82f6", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Save Vendor</button>
                        </div>
                    </div>
                </div>
            )}

            {showNewProductModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
                    <div style={{ background: "#fff", padding: 24, borderRadius: 16, width: 400, boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
                        <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800 }}>Quick Add Product</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={labelStyle}>Product Name</label>
                                <input value={newProductForm.name} onChange={e => setNewProductForm({ ...newProductForm, name: e.target.value })} style={inputStyle()} placeholder="e.g. iPhone 15" />
                            </div>
                            <div>
                                <label style={labelStyle}>SKU</label>
                                <input value={newProductForm.sku} onChange={e => setNewProductForm({ ...newProductForm, sku: e.target.value })} style={inputStyle()} placeholder="PHN-001" />
                            </div>
                            <div>
                                <label style={labelStyle}>Init Stock</label>
                                <input type="number" value={newProductForm.stock} onChange={e => setNewProductForm({ ...newProductForm, stock: e.target.value })} style={inputStyle()} />
                            </div>
                            <div>
                                <label style={labelStyle}>Cost Price</label>
                                <input type="number" value={newProductForm.purchasePrice} onChange={e => setNewProductForm({ ...newProductForm, purchasePrice: e.target.value })} style={inputStyle()} />
                            </div>
                            <div>
                                <label style={labelStyle}>Sale Price</label>
                                <input type="number" value={newProductForm.salePrice} onChange={e => setNewProductForm({ ...newProductForm, salePrice: e.target.value })} style={inputStyle()} />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                            <button onClick={() => setShowNewProductModal(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                            <button onClick={handleQuickAddProduct} style={{ flex: 1.5, padding: 10, borderRadius: 8, border: "none", background: "#3b82f6", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Save Product</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
