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

    const inputStyle = (err) => ({ width: "100%", padding: "12px 14px", border: `1px solid ${err ? "var(--danger)" : "var(--border)"}`, borderRadius: "var(--radius-md)", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: "var(--bg-main)", color: "var(--text-main)", transition: "all 0.2s" });
    const labelStyle = { fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, display: "block", letterSpacing: "0.05em", textTransform: "uppercase" };

    return (
        <div style={{ animation: "fadeUp 0.3s ease-out" }}>
            {/* Header Fields */}
            <div className="grid-1-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                <div>
                    <label style={labelStyle}>Statement Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputStyle(errors.date), cursor: "pointer" }} />
                </div>
                <div>
                    <label style={labelStyle}>Settlement Account</label>
                    <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} style={{ ...inputStyle(), cursor: "pointer" }}>
                        <option value="cash">Liquid Cash</option>
                        <option value="bank">Institutional Bank</option>
                    </select>
                </div>
            </div>

            {/* Party Selection */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <label style={{ ...labelStyle, margin: 0 }}>{type === "purchase" ? "SOURCE ENTITY (VENDOR)" : "TARGET ENTITY (CLIENT)"}</label>
                    {type === "purchase" && onAddVendor && (
                        <button onClick={() => setShowNewVendorModal(true)} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 11, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                            <Icon name="plus" size={12} /> REGISTER NEW SOURCE
                        </button>
                    )}
                </div>
                <div style={{ position: "relative" }}>
                    <input
                        value={partySearch}
                        onChange={e => { setPartySearch(e.target.value); if (partyId) setPartyId(""); }}
                        placeholder={`Search or enter ${type === "purchase" ? "vendor" : "customer"} identity...`}
                        style={inputStyle(errors.party)}
                    />
                    {partySearch && filteredParties.length > 0 && !partyId && (
                        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", marginTop: 8, maxHeight: 180, overflowY: "auto", background: "var(--bg-card)", boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}>
                            {filteredParties.map(p => (
                                <div key={p.id} onClick={() => { setPartyId(p.id); setPartySearch(p.name); }} style={{ padding: "12px 16px", cursor: "pointer", fontSize: 13, color: "var(--text-main)", borderBottom: "1px solid var(--bg-main)" }}
                                    onMouseEnter={e => e.target.style.background = "var(--primary-soft)"}
                                    onMouseLeave={e => e.target.style.background = ""}>
                                    {p.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {errors.party && <div style={{ color: "var(--danger)", fontSize: 11, marginTop: 6, fontWeight: 600 }}>{errors.party}</div>}
            </div>

            {/* Line Items */}
            <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ ...labelStyle, margin: 0 }}>Asset Line Entries</label>
                <button onClick={addItem} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--primary-soft)", color: "var(--primary)", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.95)"} onMouseLeave={e => e.currentTarget.style.filter = "none"}>
                    <Icon name="plus" size={14} /> APPEND LINE
                </button>
            </div>
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: 24, background: "var(--bg-card)" }}>
                <div className="item-header-row" style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr 1.2fr auto", gap: 0, background: "var(--bg-main)", padding: "12px 16px", fontSize: 10, fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    <span>Product Catalog</span><span>Quantity</span><span>Unit Valuation</span><span></span>
                </div>
                <div style={{ maxHeight: 240, overflowY: "auto" }}>
                    {items.map((item, i) => {
                        const prod = products.find(p => p.id === item.productId);
                        return (
                            <div key={i} className="item-row" style={{ padding: "16px", borderTop: "1px solid var(--border)", display: "grid", gridTemplateColumns: "2.2fr 1fr 1.2fr auto", gap: 12, alignItems: "start" }}>
                                <div>
                                    <select value={item.productId} onChange={e => updateItem(i, "productId", e.target.value)} style={{ ...inputStyle(errors[`item_${i}`]), padding: "10px" }}>
                                        <option value="">-- SELECT PRODUCT --</option>
                                        {products.map(p => <option key={p.id} value={p.id} disabled={type === "sale" && p.stock === 0}>{p.name} {type === "sale" && p.stock === 0 ? "(STOCK DEPLETED)" : ""}</option>)}
                                    </select>
                                    {i === items.length - 1 && onAddProduct && (
                                        <button onClick={() => setShowNewProductModal(true)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 10, fontWeight: 700, cursor: "pointer", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                                            <Icon name="plus" size={10} /> CATALOG NEW SKU
                                        </button>
                                    )}
                                    {errors[`item_${i}`] && <div style={{ color: "var(--danger)", fontSize: 11, marginTop: 4, fontWeight: 600 }}>{errors[`item_${i}`]}</div>}
                                </div>
                                <div>
                                    <input type="number" min="1" value={item.qty} onChange={e => updateItem(i, "qty", Number(e.target.value))} style={{ ...inputStyle(errors[`item_${i}_qty`]), padding: "10px" }} />
                                    {errors[`item_${i}_qty`] && <div style={{ color: "var(--danger)", fontSize: 11, marginTop: 4, fontWeight: 600 }}>{errors[`item_${i}_qty`]}</div>}
                                    {prod && type === "sale" && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, fontWeight: 500 }}>INV: {prod.stock} UNITS</div>}
                                </div>
                                <div>
                                    <input type="number" value={item.unitPrice} onChange={e => updateItem(i, "unitPrice", Number(e.target.value))} style={{ ...inputStyle(), padding: "10px" }} />
                                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, fontWeight: 700 }}>&#8776; {fmt(item.qty * item.unitPrice)}</div>
                                </div>
                                <button onClick={() => items.length > 1 && removeItem(i)} style={{ background: "rgba(239, 68, 68, 0.05)", color: "var(--danger)", border: "none", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)"}>
                                    <Icon name="trash" size={16} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Summary */}
            <div style={{ background: "var(--bg-main)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "20px", marginBottom: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-muted)", marginBottom: 8, fontWeight: 500 }}><span>Gross Valuation</span><span>{fmt(total)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 800, color: "var(--text-main)", borderTop: "1px solid var(--border)", paddingTop: 12 }}><span>Settlement Total</span><span style={{ color: "var(--primary)" }}>{fmt(total)}</span></div>
                <div style={{ marginTop: 12, fontSize: 11, color: "var(--text-muted)", fontWeight: 500, fontStyle: "italic", opacity: 0.8 }}>
                    POSTING LOGIC: {type === "purchase"
                        ? `Debit Inventory Registry (+${fmtShort(total)}) / Credit ${paymentMode === "cash" ? "Liquid Funds" : "Institutional Balance"} (-${fmtShort(total)})`
                        : `Debit ${paymentMode === "cash" ? "Liquid Funds" : "Institutional Balance"} (+${fmtShort(total)}) / Credit Revenue Streams (+${fmtShort(total)})`}
                </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button onClick={onClose} style={{ padding: "12px 24px", border: "1px solid var(--border)", borderRadius: 10, background: "var(--bg-card)", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "var(--text-muted)", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--bg-main)"} onMouseLeave={e => e.currentTarget.style.background = "var(--bg-card)"}>ABORT</button>
                <button onClick={handleSubmit} style={{ padding: "12px 28px", border: "none", borderRadius: 10, background: "var(--primary)", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 10, transition: "all 0.3s", boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.2)" }} onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"} onMouseLeave={e => e.currentTarget.style.filter = "none"}>
                    <Icon name="check" size={18} /> CONFIRM & POST ENTRY
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
