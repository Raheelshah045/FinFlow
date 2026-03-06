import React, { useState } from "react";
import { Icon } from "../components/Icon";
import { fmt, newId, today } from "../utils/formatters";

export const JournalForm = ({ accounts, onSubmit, onClose }) => {
    const [date, setDate] = useState(today());
    const [description, setDescription] = useState("");
    const [rows, setRows] = useState([
        { account: "", type: "debit", amount: 0 },
        { account: "", type: "credit", amount: 0 },
    ]);

    const addRow = () => setRows([...rows, { account: "", type: "debit", amount: 0 }]);
    const removeRow = (idx) => setRows(rows.filter((_, i) => i !== idx));

    const updateRow = (idx, field, value) => {
        const newRows = [...rows];
        newRows[idx][field] = value;
        setRows(newRows);
    };

    const totalDebit = rows.filter(r => r.type === "debit").reduce((s, r) => s + Number(r.amount || 0), 0);
    const totalCredit = rows.filter(r => r.type === "credit").reduce((s, r) => s + Number(r.amount || 0), 0);
    const isBalanced = totalDebit === totalCredit && totalDebit > 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isBalanced) return;

        const voucher = {
            id: newId("JV"),
            type: "journal",
            date,
            description,
            total: totalDebit,
            status: "posted",
            entries: rows.map(r => ({
                account: r.account,
                type: r.type,
                amount: Number(r.amount)
            })),
            items: [] // JVs don't have stock items
        };

        onSubmit(voucher);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14 }} required />
                </div>
                <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Narration / Description</label>
                    <input type="text" placeholder="e.g. Bank charges for January" value={description} onChange={e => setDescription(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14 }} required />
                </div>
            </div>

            <div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 40px", gap: 12, marginBottom: 8, padding: "0 4px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>ACCOUNT</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>DR / CR</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>AMOUNT</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {rows.map((row, idx) => (
                        <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 40px", gap: 12, alignItems: "center" }}>
                            <select value={row.account} onChange={e => updateRow(idx, "account", e.target.value)} style={{ padding: "8px 10px", borderRadius: 6, border: "1.2px solid #e2e8f0", background: "#f8fafc", fontSize: 13 }} required>
                                <option value="">Select Account</option>
                                {accounts.map(acc => <option key={acc.id} value={acc.name}>{acc.name}</option>)}
                            </select>

                            <select value={row.type} onChange={e => updateRow(idx, "type", e.target.value)} style={{ padding: "8px 10px", borderRadius: 6, border: "1.2px solid #e2e8f0", background: "#f8fafc", fontSize: 13 }}>
                                <option value="debit">DEBIT (Dr)</option>
                                <option value="credit">CREDIT (Cr)</option>
                            </select>

                            <input type="number" placeholder="0.00" value={row.amount} onChange={e => updateRow(idx, "amount", e.target.value)} style={{ padding: "8px 10px", borderRadius: 6, border: "1.2px solid #e2e8f0", fontSize: 13, textAlign: "right" }} required />

                            <button type="button" onClick={() => removeRow(idx)} disabled={rows.length <= 2} style={{ background: "none", border: "none", color: "#f87171", cursor: rows.length <= 2 ? "default" : "pointer", opacity: rows.length <= 2 ? 0.3 : 1 }}>
                                <Icon name="trash" size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <button type="button" onClick={addRow} style={{ marginTop: 12, padding: "6px 12px", borderRadius: 6, border: "1px dashed #cbd5e1", background: "#f8fafc", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name="plus" size={12} /> Add Entry Line
                </button>
            </div>

            <div style={{ padding: 16, background: isBalanced ? "#f0fdf4" : "#fef2f2", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${isBalanced ? "#bbf7d0" : "#fecaca"}` }}>
                <div style={{ display: "flex", gap: 24 }}>
                    <div>
                        <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700 }}>TOTAL DEBIT</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{fmt(totalDebit)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700 }}>TOTAL CREDIT</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{fmt(totalCredit)}</div>
                    </div>
                </div>

                {!isBalanced && (
                    <div style={{ color: "#dc2626", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                        <Icon name="alert" size={14} /> Entry is not balanced
                    </div>
                )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10 }}>
                <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "none", color: "#64748b", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={!isBalanced} style={{ padding: "10px 30px", borderRadius: 8, border: "none", background: isBalanced ? "#1e40af" : "#94a3b8", color: "#fff", fontWeight: 700, cursor: isBalanced ? "pointer" : "default", boxShadow: isBalanced ? "0 4px 12px rgba(30,64,175,0.3)" : "none" }}>Post Journal Entry</button>
            </div>
        </form>
    );
};
