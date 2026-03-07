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
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Inventory Manager</h1>
                    <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>Track stock levels, prices, and valuation</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                >
                    + Add New Product
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
                <StatCard label="Total Products" value={products.length} sub="Active SKUs" accent="blue" />
                <StatCard label="Stock Value" value={products.reduce((s, p) => s + p.stock * p.purchasePrice, 0)} sub="At purchase cost" accent="green" />
                <StatCard label="Potential Revenue" value={products.reduce((s, p) => s + p.stock * p.salePrice, 0)} sub="At sale price" accent="amber" />
            </div>

            <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 24 }}>
                <DataTable columns={[
                    { key: "sku", label: "SKU" },
                    { key: "name", label: "Product Name" },
                    { key: "purchasePrice", label: "Cost Price", align: "right", render: v => <span style={{ fontFamily: "monospace" }}>{fmt(v)}</span> },
                    { key: "salePrice", label: "Sale Price", align: "right", render: v => <span style={{ fontFamily: "monospace" }}>{fmt(v)}</span> },
                    {
                        key: "margin", label: "Margin", align: "right", sortable: false,
                        render: (_, row) => {
                            const m = row.salePrice - row.purchasePrice;
                            const pct = row.purchasePrice ? ((m / row.purchasePrice) * 100).toFixed(1) : 0;
                            return <span style={{ fontFamily: "monospace", color: "#059669", fontWeight: 700 }}>{fmt(m)} ({pct}%)</span>;
                        }
                    },
                    {
                        key: "stock", label: "Stock", align: "center",
                        render: (v, row) => (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                <span style={{ fontFamily: "monospace", fontWeight: 700, color: v === 0 ? "#dc2626" : v <= row.threshold ? "#d97706" : "#059669" }}>{v}</span>
                                {v === 0 ? <Badge color="red">OOS</Badge> : v <= row.threshold ? <Badge color="amber">Low</Badge> : null}
                            </div>
                        )
                    },
                    {
                        key: "value", label: "Stock Value", align: "right", sortable: false,
                        render: (_, row) => <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#334155" }}>{fmt(row.stock * row.purchasePrice)}</span>
                    },
                ]} data={products.map(p => ({ ...p, margin: p.salePrice - p.purchasePrice }))} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Product">
                <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ gridColumn: "span 2" }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Product Name</label>
                        <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. MacBook Pro M3" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none" }} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>SKU Code</label>
                        <input required type="text" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. LPT-001" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none" }} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Initial Stock</label>
                        <input required type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none" }} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Purchase Price</label>
                        <input required type="number" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} placeholder="0.00" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none" }} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Sale Price</label>
                        <input required type="number" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} placeholder="0.00" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none" }} />
                    </div>
                    <button type="submit" style={{ gridColumn: "span 2", background: "#3b82f6", color: "#fff", border: "none", padding: "12px", borderRadius: 8, fontWeight: 600, cursor: "pointer", marginTop: 8 }}>Save Product</button>
                </form>
            </Modal>
        </div>
    );
};
