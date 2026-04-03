import React, { useState, useMemo } from "react";
import { Icon } from "../components/Icon";
import { DataTable } from "../components/DataTable";
import { Badge } from "../components/Badge";
import { fmt, fmtShort } from "../utils/formatters";

export const ReportsPage = ({ vouchers, products, accounts }) => {
    const [dateFrom, setDateFrom] = useState("2025-01-01");
    const [dateTo, setDateTo] = useState("2025-12-31");

    const filtered = useMemo(() => vouchers.filter(v => v.date >= dateFrom && v.date <= dateTo), [vouchers, dateFrom, dateTo]);
    const sales = filtered.filter(v => v.type === "sale");
    const purchases = filtered.filter(v => v.type === "purchase");
    const revenue = sales.reduce((s, v) => s + v.total, 0);
    const cogs = purchases.reduce((s, v) => s + v.total, 0);
    const grossProfit = sales.reduce((s, v) => s + (v.margin || 0), 0);
    const expenses = accounts.find(a => a.id === "expenses")?.balance || 15000;
    const netProfit = grossProfit - expenses;

    return (
        <div style={{ animation: "fadeUp 0.3s ease-out" }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--primary)", margin: "0 0 4px" }}>Profit & Loss Report</h1>
                <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>Financial performance summary</p>
            </div>

            <div className="voucher-filters" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 18px" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>Period:</span>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                <span style={{ color: "var(--text-muted)" }}>to</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <button style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        <Icon name="download" size={14} /> PDF
                    </button>
                    <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        <Icon name="download" size={14} /> Excel
                    </button>
                </div>
            </div>

            <div className="grid-1-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
                    <div style={{ background: "var(--primary)", padding: "14px 20px" }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}>Income Statement</h3>
                    </div>
                    <div style={{ padding: 20 }}>
                        {[
                            { label: "Sales Revenue", value: revenue, indent: 0, bold: false, color: "#059669" },
                            { label: "Cost of Goods Sold", value: -cogs, indent: 0, bold: false, color: "#dc2626" },
                            { label: "Gross Profit", value: grossProfit, indent: 0, bold: true, border: true },
                            { label: "Operating Expenses", value: -expenses, indent: 1, bold: false, color: "#d97706" },
                            { label: "Net Profit / (Loss)", value: netProfit, indent: 0, bold: true, highlight: true },
                        ].map((row, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: `${row.indent ? 8 : 12}px ${row.indent ? 28 : 0}px`, borderTop: row.border ? "2px solid var(--border)" : "none", borderBottom: row.highlight ? "3px double var(--primary)" : "none", marginTop: row.border ? 8 : 0, background: row.highlight ? "var(--primary-soft)" : "transparent", borderRadius: row.highlight ? 8 : 0 }}>
                                <span style={{ fontSize: row.bold ? 14 : 13, fontWeight: row.bold ? 800 : 500, color: row.highlight ? "var(--primary)" : "var(--text-main)" }}>{row.label}</span>
                                <span style={{ fontFamily: "monospace", fontWeight: row.bold ? 800 : 600, fontSize: row.bold ? 15 : 13, color: row.color || (row.value >= 0 ? "#16a34a" : "#dc2626") }}>
                                    {row.value < 0 ? `(${fmt(Math.abs(row.value))})` : fmt(row.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ background: netProfit >= 0 ? "#f0fdf4" : "#fef2f2", border: `2px solid ${netProfit >= 0 ? "#bbf7d0" : "#fecaca"}`, borderRadius: 14, padding: 24, textAlign: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: netProfit >= 0 ? "#16a34a" : "#dc2626", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>Net Profit / (Loss)</div>
                        <div style={{ fontSize: 40, fontWeight: 900, color: netProfit >= 0 ? "#16a34a" : "#dc2626", fontFamily: "'DM Mono', monospace" }}>{fmtShort(Math.abs(netProfit))}</div>
                        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>Profit margin: {revenue ? ((netProfit / revenue) * 100).toFixed(1) : 0}%</div>
                    </div>
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
                        <h4 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>Transaction Summary</h4>
                        {[
                            { label: "Sale Vouchers", value: sales.length, unit: "vouchers" },
                            { label: "Purchase Vouchers", value: purchases.length, unit: "vouchers" },
                            { label: "Avg Sale Value", value: fmt(sales.length ? revenue / sales.length : 0), unit: "" },
                            { label: "Total Transactions", value: filtered.length, unit: "" },
                        ].map((r, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
                                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{r.label}</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)", fontFamily: r.unit ? "inherit" : "monospace" }}>{r.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "var(--primary)" }}>Detailed Transaction Ledger</h3>
                <DataTable columns={[
                    { key: "id", label: "Ref #" },
                    { key: "date", label: "Date" },
                    { key: "type", label: "Type", render: v => <Badge color={v === "sale" ? "green" : "navy"}>{v}</Badge> },
                    { key: "party", label: "Party" },
                    { key: "total", label: "Amount", align: "right", render: v => <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(v)}</span> },
                    { key: "margin", label: "Margin", align: "right", render: (v, row) => row.type === "sale" ? <span style={{ fontFamily: "monospace", color: "#16a34a", fontWeight: 700 }}>{fmt(v)}</span> : <span style={{ color: "var(--text-muted)" }}>—</span> },
                ]} data={filtered} />
            </div>
        </div>
    );
};
