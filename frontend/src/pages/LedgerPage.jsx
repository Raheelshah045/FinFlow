import React, { useState, useMemo } from "react";
import { Icon } from "../components/Icon";
import { StatCard } from "../components/StatCard";
import { DataTable } from "../components/DataTable";
import { fmt } from "../utils/formatters";

export const LedgerPage = ({ vouchers, accounts }) => {
    const [activeAccount, setActiveAccount] = useState("bank");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const acc = accounts.find(a => a.id === activeAccount);
    const accountName = acc?.name || "";

    const transactions = useMemo(() => {
        const entries = [];
        let running = activeAccount === "cash" ? 500000 : activeAccount === "bank" ? 1200000 : 0;

        vouchers.forEach(v => {
            const matchCash = activeAccount === "cash" && v.paymentMode === "cash";
            const matchBank = activeAccount === "bank" && v.paymentMode === "bank";

            // Handle JVs that affect this account
            const matchJV = v.type === "journal" && v.entries.some(e => e.account === accountName);

            if (matchCash || matchBank || matchJV) {
                let amt = 0;
                let isDebit = false;
                let narration = "";

                if (matchJV) {
                    const entry = v.entries.find(e => e.account === accountName);
                    amt = entry.amount;
                    isDebit = entry.type === "debit";
                    narration = v.description || "Journal Adjustment";
                } else {
                    isDebit = v.type === "sale";
                    amt = v.total;
                    narration = v.type === "sale" ? "Sale receipt" : "Purchase payment";
                }

                if (isDebit) running += amt;
                else running -= amt;

                entries.push({
                    date: v.date,
                    ref: v.id,
                    party: v.party || "—",
                    type: isDebit ? "debit" : "credit",
                    debit: isDebit ? amt : 0,
                    credit: isDebit ? 0 : amt,
                    balance: running,
                    narration
                });
            }
        });

        let sorted = entries.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Apply Date Filters
        if (fromDate) sorted = sorted.filter(t => t.date >= fromDate);
        if (toDate) sorted = sorted.filter(t => t.date <= toDate);

        return sorted;
    }, [vouchers, activeAccount, accountName, fromDate, toDate]);

    const currentBalance = transactions.length ? transactions[transactions.length - 1].balance : (activeAccount === "cash" ? 500000 : 1200000);
    const totalDebits = transactions.reduce((s, t) => s + t.debit, 0);
    const totalCredits = transactions.reduce((s, t) => s + t.credit, 0);


    return (
        <div style={{ animation: "fadeUp 0.3s ease-out" }}>
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Account Ledger</h1>
                    <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>Running balance and transaction history</p>
                </div>

            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 10 }}>
                    {accounts.filter(a => ["cash", "bank"].includes(a.id)).map(a => (
                        <button key={a.id} onClick={() => setActiveAccount(a.id)} style={{ padding: "9px 18px", border: `2px solid ${activeAccount === a.id ? "#1e40af" : "#e2e8f0"}`, borderRadius: 9, background: activeAccount === a.id ? "#1e40af" : "#fff", color: activeAccount === a.id ? "#fff" : "#475569", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7, transition: "all 0.15s" }}>
                            <Icon name={a.id === "bank" ? "bank" : "cash"} size={15} /> {a.name}
                        </button>
                    ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", padding: "6px 14px", borderRadius: 12, border: "1.5px solid #e2e8f0" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Filter:</span>
                    <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ border: "none", fontSize: 12, fontWeight: 600, color: "#0f172a", outline: "none", background: "transparent" }} />
                    <span style={{ color: "#cbd5e1" }}>→</span>
                    <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ border: "none", fontSize: 12, fontWeight: 600, color: "#0f172a", outline: "none", background: "transparent" }} />
                    {(fromDate || toDate) && (
                        <button onClick={() => { setFromDate(""); setToDate(""); }} style={{ border: "none", background: "none", padding: 0, color: "#94a3b8", cursor: "pointer" }}>
                            <Icon name="close" size={12} />
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 20 }}>
                <StatCard label="Total Debits (In)" value={totalDebits} accent="green" />
                <StatCard label="Total Credits (Out)" value={totalCredits} accent="red" />
                <StatCard label="Current Balance" value={currentBalance} accent="blue" />
            </div>

            <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>📒 {accountName} Ledger</h3>
                    <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#475569", fontFamily: "inherit" }}>
                        <Icon name="download" size={14} /> Export Excel
                    </button>
                </div>
                <DataTable columns={[
                    { key: "date", label: "Date" },
                    { key: "ref", label: "Ref #" },
                    { key: "narration", label: "Narration" },
                    { key: "party", label: "Party" },
                    { key: "debit", label: "Debit (Dr)", align: "right", render: v => v ? <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#059669" }}>{fmt(v)}</span> : <span style={{ color: "#cbd5e1" }}>—</span> },
                    { key: "credit", label: "Credit (Cr)", align: "right", render: v => v ? <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#dc2626" }}>{fmt(v)}</span> : <span style={{ color: "#cbd5e1" }}>—</span> },
                    { key: "balance", label: "Balance", align: "right", render: v => <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#0f172a" }}>{fmt(v)}</span> },
                    { key: "status", label: "Status", align: "center", render: () => <div style={{ color: "#059669" }}><Icon name="check" size={16} /></div> }
                ]} data={transactions} />
            </div>
        </div>
    );
};
