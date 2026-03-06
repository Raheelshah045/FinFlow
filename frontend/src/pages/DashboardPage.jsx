import React from "react";
import { StatCard } from "../components/StatCard";
import { MiniBarChart } from "../components/MiniBarChart";
import { DataTable } from "../components/DataTable";
import { Badge } from "../components/Badge";
import { fmt, fmtShort } from "../utils/formatters";

export const DashboardPage = ({ vouchers, products, accounts }) => {
    const totalSales = vouchers.filter(v => v.type === "sale").reduce((s, v) => s + v.total, 0);
    const totalPurchases = vouchers.filter(v => v.type === "purchase").reduce((s, v) => s + v.total, 0);
    const totalMargin = vouchers.filter(v => v.type === "sale").reduce((s, v) => s + (v.margin || 0), 0);
    const cash = accounts.find(a => a.id === "cash")?.balance || 0;
    const bank = accounts.find(a => a.id === "bank")?.balance || 0;
    const lowStock = products.filter(p => p.stock <= p.threshold);

    const chartData = [
        { month: "Jan", sales: 294000, purchases: 340000 },
        { month: "Feb", sales: 180000, purchases: 187500 },
        { month: "Mar", sales: 90000, purchases: 0 },
        { month: "Apr", sales: 0, purchases: 0 },
        { month: "May", sales: 0, purchases: 0 },
    ];

    const recentVouchers = [...vouchers].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    return (
        <div style={{ animation: "fadeUp 0.3s ease-out" }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Dashboard Overview</h1>
                <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>Financial snapshot for FY 2025</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
                <StatCard label="Total Cash" value={cash} sub="Available in hand" accent="green" trend={12} />
                <StatCard label="Bank Balance" value={bank} sub="HBL Main Account" accent="blue" trend={-3} />
                <StatCard label="Net Profit" value={totalMargin} sub="Margin on sales" accent="amber" trend={18} />
                <StatCard label="Stock Value" value={products.reduce((s, p) => s + p.stock * p.purchasePrice, 0)} sub={`${products.length} product lines`} accent="red" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, marginBottom: 20 }}>
                <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Sales vs Purchases</h3>
                        <div style={{ display: "flex", gap: 14, fontSize: 12, fontWeight: 600 }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, background: "#1e40af", borderRadius: 2, display: "inline-block" }} /> Sales</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, background: "#dc2626", borderRadius: 2, display: "inline-block" }} /> Purchases</span>
                        </div>
                    </div>
                    <MiniBarChart data={chartData} height={180} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20 }}>
                        <div style={{ background: "#eff6ff", borderRadius: 10, padding: "12px 16px" }}>
                            <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 700, marginBottom: 4 }}>TOTAL SALES</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: "#1e40af", fontFamily: "'DM Mono', monospace" }}>{fmtShort(totalSales)}</div>
                        </div>
                        <div style={{ background: "#fff1f2", borderRadius: 10, padding: "12px 16px" }}>
                            <div style={{ fontSize: 11, color: "#f87171", fontWeight: 700, marginBottom: 4 }}>TOTAL PURCHASES</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: "#dc2626", fontFamily: "'DM Mono', monospace" }}>{fmtShort(totalPurchases)}</div>
                        </div>
                    </div>
                </div>

                <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 24 }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>⚠️ Low Stock Alerts</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {lowStock.length === 0 ? <div style={{ color: "#94a3b8", fontSize: 13 }}>All stock levels healthy</div> : lowStock.map(p => (
                            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{p.name}</div>
                                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{p.sku}</div>
                                </div>
                                <Badge color={p.stock === 0 ? "red" : "amber"}>{p.stock === 0 ? "Out of Stock" : `${p.stock} left`}</Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 24 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Recent Transactions</h3>
                <DataTable searchable={false} columns={[
                    { key: "id", label: "Voucher #" },
                    { key: "date", label: "Date" },
                    { key: "type", label: "Type", render: v => <Badge color={v === "sale" ? "green" : "blue"}>{v === "sale" ? "Sale" : "Purchase"}</Badge> },
                    { key: "party", label: "Party" },
                    { key: "total", label: "Amount", align: "right", render: v => <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>{fmt(v)}</span> },
                ]} data={recentVouchers} />
            </div>
        </div>
    );
};
