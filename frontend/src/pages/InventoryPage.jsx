import React, { useState } from "react";
import { StatCard } from "../components/StatCard";
import { DataTable } from "../components/DataTable";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";
import { fmt, newId } from "../utils/formatters";

export const InventoryPage = ({ products, onAdd }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ sku: "", name: "", purchasePrice: "", salePrice: "", stock: 0, threshold: 5 });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            ...form,
            id: newId("P"),
            purchasePrice: parseFloat(form.purchasePrice),
            salePrice: parseFloat(form.salePrice),
            stock: parseInt(form.stock),
            threshold: parseInt(form.threshold)
        });
        setIsModalOpen(false);
        setForm({ sku: "", name: "", purchasePrice: "", salePrice: "", stock: 0, threshold: 5 });
    };

    return (
        <div style={{ animation: "fadeUp 0.3s ease-out" }}>
            <div className="voucher-top-bar" style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-main)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Inventory Manager</h1>
                    <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14, fontWeight: 500 }}>Track stock levels, prices, and valuation</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ background: "var(--primary)", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "var(--radius-md)", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s", boxShadow: "0 4px 12px rgba(132, 204, 22, 0.15)" }}
                    onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
                    onMouseLeave={e => e.currentTarget.style.filter = "none"}
                >
                    + Add New Product
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
                <StatCard label="Total Products" value={products.length} sub="Active SKU Registry" accent="navy" isCurrency={false} />
                <StatCard label="Stock Value" value={products.reduce((s, p) => s + p.stock * p.purchasePrice, 0)} sub="At purchase cost" accent="green" />
                <StatCard label="Potential Revenue" value={products.reduce((s, p) => s + p.stock * p.salePrice, 0)} sub="At market price" accent="gold" />
            </div>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "28px", boxShadow: "var(--shadow)" }}>
                <DataTable columns={[
                    { key: "sku", label: "SKU" },
                    { key: "name", label: "Product Name" },
                    { key: "purchasePrice", label: "Cost Price", align: "right", render: v => <span style={{ fontWeight: 600 }}>{fmt(v)}</span> },
                    { key: "salePrice", label: "Sale Price", align: "right", render: v => <span style={{ fontWeight: 600 }}>{fmt(v)}</span> },
                    {
                        key: "margin", label: "Margin", align: "right", sortable: false,
                        render: (_, row) => {
                            const m = row.salePrice - row.purchasePrice;
                            const pct = row.purchasePrice ? ((m / row.purchasePrice) * 100).toFixed(1) : 0;
                            return <span style={{ color: "var(--success)", fontWeight: 700 }}>{fmt(m)} ({pct}%)</span>;
                        }
                    },
                    {
                        key: "stock", label: "Stock", align: "center",
                        render: (v, row) => (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                <span style={{ fontWeight: 700, color: v === 0 ? "var(--danger)" : v <= row.threshold ? "var(--warning)" : "var(--success)" }}>{v}</span>
                                {v === 0 ? <Badge color="red">OOS</Badge> : v <= row.threshold ? <Badge color="amber">Low</Badge> : null}
                            </div>
                        )
                    },
                    {
                        key: "value", label: "Stock Value", align: "right", sortable: false,
                        render: (_, row) => <span style={{ fontWeight: 700, color: "var(--text-main)" }}>{fmt(row.stock * row.purchasePrice)}</span>
                    },
                ]} data={products.map(p => ({ ...p, margin: p.salePrice - p.purchasePrice }))} />
            </div>

            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Product">
                <form onSubmit={handleSubmit} className="grid-1-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ gridColumn: "span 2" }}>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Product Name</label>
                        <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. MacBook Pro M3" style={{ width: "100%", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-main)", outline: "none", fontSize: 13 }} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>SKU Code</label>
                        <input required type="text" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. LPT-001" style={{ width: "100%", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-main)", outline: "none", fontSize: 13 }} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Initial Stock</label>
                        <input required type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} style={{ width: "100%", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-main)", outline: "none", fontSize: 13 }} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Purchase Price</label>
                        <input required type="number" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} placeholder="0.00" style={{ width: "100%", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-main)", outline: "none", fontSize: 13 }} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Sale Price</label>
                        <input required type="number" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} placeholder="0.00" style={{ width: "100%", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-main)", outline: "none", fontSize: 13 }} />
                    </div>
                    <button type="submit" style={{ gridColumn: "span 2", background: "var(--primary)", color: "#fff", border: "none", padding: "16px", borderRadius: "var(--radius-md)", fontWeight: 700, cursor: "pointer", marginTop: 8, fontSize: 14, boxShadow: "0 10px 15px -3px rgba(132, 204, 22, 0.2)" }}>Save Product</button>
                </form>
            </Modal>
        </div>
    );
};
