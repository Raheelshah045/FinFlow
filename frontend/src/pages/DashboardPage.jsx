import React, { useState, useMemo } from "react";
import { StatCard } from "../components/StatCard";
import { MiniBarChart } from "../components/MiniBarChart";
import { DataTable } from "../components/DataTable";
import { Badge } from "../components/Badge";
import { fmt, fmtShort } from "../utils/formatters";

export const DashboardPage = ({ vouchers, products, accounts, onUpdateAccount }) => {
    // Default to current month/year
    const today = new Date();
    const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

    // Get unique months from vouchers for the dropdown
    const availableMonths = useMemo(() => {
        const months = new Set();
        months.add(defaultMonth); // Always include current month
        vouchers.forEach(v => {
            const date = new Date(v.date);
            if (!isNaN(date.getTime())) {
                months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
            }
        });
        return Array.from(months).sort().reverse();
    }, [vouchers, defaultMonth]);

    // Filtered data
    const filteredVouchers = useMemo(() => {
        return vouchers.filter(v => v.date.startsWith(selectedMonth));
    }, [vouchers, selectedMonth]);

    const totalSales = filteredVouchers.filter(v => v.type === "sale").reduce((s, v) => s + v.total, 0);
    const totalPurchases = filteredVouchers.filter(v => v.type === "purchase").reduce((s, v) => s + v.total, 0);
    const totalMargin = filteredVouchers.filter(v => v.type === "sale").reduce((s, v) => s + (v.margin || 0), 0);

    const cashAcc = accounts.find(a => a.id === "cash");
    const bankAcc = accounts.find(a => a.id === "bank");
    const cash = cashAcc?.balance || 0;
    const bank = bankAcc?.balance || 0;

    const lowStock = products.filter(p => (p.stock || 0) <= (p.threshold || 0));

    // Generate Chart Data from real vouchers (last 5 months including selected)
    const chartData = useMemo(() => {
        const data = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Take the selected month and 4 months before it
        const [year, month] = selectedMonth.split('-').map(Number);
        for (let i = 4; i >= 0; i--) {
            const d = new Date(year, month - 1 - i, 1);
            const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = monthNames[d.getMonth()];

            const mSales = vouchers.filter(v => v.type === "sale" && v.date.startsWith(mKey)).reduce((s, v) => s + v.total, 0);
            const mPurchases = vouchers.filter(v => v.type === "purchase" && v.date.startsWith(mKey)).reduce((s, v) => s + v.total, 0);

            data.push({ month: label, sales: mSales, purchases: mPurchases });
        }
        return data;
    }, [vouchers, selectedMonth]);

    const recentVouchers = [...filteredVouchers].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    const monthLabel = new Date(selectedMonth + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div style={{ animation: "fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-main)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Executive Summary</h1>
                    <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14, fontWeight: 500 }}>Global financial insights for {monthLabel}</p>
                </div>
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "4px 14px", display: "flex", alignItems: "center", gap: 10, boxShadow: "var(--shadow)" }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.08em" }}>REPORTING PERIOD</span>
                    <select
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                        style={{ border: "none", background: "none", padding: "10px 0", fontSize: 13, fontWeight: 700, color: "var(--primary)", outline: "none", cursor: "pointer" }}
                    >
                        {availableMonths.map(m => (
                            <option key={m} value={m}>
                                {new Date(m + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                {m === defaultMonth ? " (Current)" : ""}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 32 }}>
                <StatCard
                    label="Available Cash"
                    value={cash}
                    sub="Liquid hand balance"
                    accent="green"
                    onUpdate={(val) => onUpdateAccount(cashAcc.id, val)}
                />
                <StatCard
                    label="Institutional Funds"
                    value={bank}
                    sub="Verified bank balance"
                    accent="blue"
                    onUpdate={(val) => onUpdateAccount(bankAcc.id, val)}
                />
                <StatCard label="Operating Profit" value={totalMargin} sub={`Performance: ${monthLabel.split(' ')[0]}`} accent="amber" />
                <StatCard label="Inventory Value" value={products.reduce((s, p) => s + (p.stock || 0) * (p.purchasePrice || 0), 0)} sub={`${products.length} active SKUs`} accent="red" />
            </div>

            <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 24 }}>
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "28px", boxShadow: "var(--shadow)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-main)" }}>Performance Analytics</h3>
                            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>Sales vs Procurement trends</p>
                        </div>
                        <div style={{ display: "flex", gap: 16, fontSize: 11, fontWeight: 700 }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-main)" }}><span style={{ width: 8, height: 8, background: "#3b82f6", borderRadius: "50%" }} /> SALES</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-main)" }}><span style={{ width: 8, height: 8, background: "#f87171", borderRadius: "50%" }} /> PURCHASES</span>
                        </div>
                    </div>
                    <MiniBarChart data={chartData} height={200} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 28 }}>
                        <div style={{ background: "var(--bg-main)", borderRadius: "var(--radius-md)", padding: "16px", border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: 10, color: "var(--primary)", fontWeight: 800, marginBottom: 6, letterSpacing: "0.05em" }}>PERIOD REVENUE</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-main)" }}>{fmtShort(totalSales)}</div>
                        </div>
                        <div style={{ background: "var(--bg-main)", borderRadius: "var(--radius-md)", padding: "16px", border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: 10, color: "var(--danger)", fontWeight: 800, marginBottom: 6, letterSpacing: "0.05em" }}>PERIOD EXPENSE</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-main)" }}>{fmtShort(totalPurchases)}</div>
                        </div>
                    </div>
                </div>

                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "28px", boxShadow: "var(--shadow)" }}>
                    <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "var(--text-main)" }}>Operational Constraints</h3>
                    <p style={{ margin: "0 0 24px", fontSize: 13, color: "var(--text-muted)" }}>Low inventory levels requiring action</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {lowStock.length === 0 ? <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "40px 0" }}>No critical stock alerts</div> : lowStock.slice(0, 5).map(p => (
                            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, borderBottom: "1px solid var(--bg-main)" }}>
                                <div style={{ overflow: "hidden" }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>ID: {p.sku}</div>
                                </div>
                                <Badge color={p.stock === 0 ? "red" : "amber"}>{p.stock === 0 ? "OUT OF STOCK" : `${p.stock} UNITS`}</Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "28px", boxShadow: "var(--shadow)" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "var(--text-main)" }}>Recent Ledger Entries ({monthLabel.split(' ')[0]})</h3>
                <DataTable searchable={false} columns={[
                    { key: "id", label: "REF NO", render: v => <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: 12 }}>{v}</span> },
                    { key: "date", label: "DATE" },
                    { key: "type", label: "TYPE", render: v => <Badge color={v === "sale" ? "green" : "blue"}>{v.toUpperCase()}</Badge> },
                    { key: "party", label: "COUNTERPARTY" },
                    { key: "total", label: "SETTLEMENT", align: "right", render: v => <span style={{ fontWeight: 800, color: "var(--text-main)" }}>{fmt(v)}</span> },
                ]} data={recentVouchers} />
            </div>
        </div>
    );
};
