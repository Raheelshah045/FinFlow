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
        <div style={{ animation: "fadeUp 0.3s ease-out" }}>
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Final Snapshot</h1>
                    <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>Real-time metrics for {monthLabel}</p>
                </div>
                <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "4px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>SELECT PERIOD</span>
                    <select
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                        style={{ border: "none", background: "none", padding: "8px 0", fontSize: 13, fontWeight: 700, color: "#0f172a", outline: "none", cursor: "pointer" }}
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
                <StatCard
                    label="Total Cash"
                    value={cash}
                    sub="Cash in Hand"
                    accent="green"
                    onUpdate={(val) => onUpdateAccount(cashAcc.id, val)}
                />
                <StatCard
                    label="Bank Balance"
                    value={bank}
                    sub="Company Assets"
                    accent="blue"
                    onUpdate={(val) => onUpdateAccount(bankAcc.id, val)}
                />
                <StatCard label="Net Profit" value={totalMargin} sub={`Profit in ${monthLabel.split(' ')[0]}`} accent="amber" />
                <StatCard label="Stock Value" value={products.reduce((s, p) => s + (p.stock || 0) * (p.purchasePrice || 0), 0)} sub={`${products.length} product lines`} accent="red" />
            </div>

            <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 20 }}>
                <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Sales Trends</h3>
                        <div style={{ display: "flex", gap: 14, fontSize: 12, fontWeight: 600 }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, background: "#3b82f6", borderRadius: 2, display: "inline-block" }} /> Sales</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, background: "#f87171", borderRadius: 2, display: "inline-block" }} /> Purchases</span>
                        </div>
                    </div>
                    <MiniBarChart data={chartData} height={180} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20 }}>
                        <div style={{ background: "#eff6ff", borderRadius: 10, padding: "12px 16px" }}>
                            <div style={{ fontSize: 10, color: "#3b82f6", fontWeight: 700, marginBottom: 4 }}>MONTHLY SALES</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: "#1e40af", fontFamily: "'DM Mono', monospace" }}>{fmtShort(totalSales)}</div>
                        </div>
                        <div style={{ background: "#fff1f2", borderRadius: 10, padding: "12px 16px" }}>
                            <div style={{ fontSize: 10, color: "#f87171", fontWeight: 700, marginBottom: 4 }}>MONTHLY PURCHASES</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: "#dc2626", fontFamily: "'DM Mono', monospace" }}>{fmtShort(totalPurchases)}</div>
                        </div>
                    </div>
                </div>

                <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 24 }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>⚠️ Stock Alerts</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {lowStock.length === 0 ? <div style={{ color: "#94a3b8", fontSize: 13 }}>All stock levels healthy</div> : lowStock.slice(0, 5).map(p => (
                            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
                                <div style={{ overflow: "hidden" }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                                    <div style={{ fontSize: 11, color: "#94a3b8" }}>SKU: {p.sku}</div>
                                </div>
                                <Badge color={p.stock === 0 ? "red" : "amber"}>{p.stock === 0 ? "Out of Stock" : `${p.stock} units left`}</Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 24 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Transactions for {monthLabel.split(' ')[0]}</h3>
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
