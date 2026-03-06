import React from "react";
import { StatCard } from "../components/StatCard";
import { DataTable } from "../components/DataTable";
import { Badge } from "../components/Badge";
import { fmt } from "../utils/formatters";

export const InventoryPage = ({ products }) => {
    return (
        <div style={{ animation: "fadeUp 0.3s ease-out" }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Inventory Manager</h1>
                <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>Track stock levels, prices, and valuation</p>
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
                            const pct = ((m / row.purchasePrice) * 100).toFixed(1);
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
        </div>
    );
};
