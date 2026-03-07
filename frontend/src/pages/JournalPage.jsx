import React, { useState } from "react";
import { Icon } from "../components/Icon";
import { DataTable } from "../components/DataTable";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";
import { JournalForm } from "../components/JournalForm";
import { fmt } from "../utils/formatters";

export const JournalPage = ({ vouchers, accounts, onAdd }) => {
    const [showForm, setShowForm] = useState(false);
    const [toast, setToast] = useState(null);

    const filtered = vouchers.filter(v => v.type === "journal");
    const total = filtered.reduce((s, v) => s + v.total, 0);

    const handleSubmit = async (data) => {
        await onAdd(data);
        setShowForm(false);
        setToast(`Journal voucher posted successfully!`);
        setTimeout(() => setToast(null), 3500);
    };

    return (
        <div style={{ animation: "fadeUp 0.3s ease-out" }}>
            {toast && (
                <div style={{ position: "fixed", top: 24, right: 24, background: "#059669", color: "#fff", borderRadius: 10, padding: "14px 20px", fontWeight: 600, fontSize: 14, boxShadow: "0 8px 24px rgba(5,150,105,0.3)", zIndex: 2000, display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon name="check" size={16} /> {toast}
                </div>
            )}

            <div className="voucher-top-bar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Journal Vouchers (JV)</h1>
                    <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>Non-inventory adjustments & transfers</p>
                </div>
                <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, padding: "11px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(15,23,42,0.3)" }}>
                    <Icon name="plus" size={16} /> New Journal Entry
                </button>
            </div>

            <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 24 }}>
                <DataTable columns={[
                    { key: "id", label: "JV #" },
                    { key: "date", label: "Date" },
                    { key: "description", label: "Description", render: v => <span style={{ color: "#475569", fontWeight: 500 }}>{v || "No description"}</span> },
                    {
                        key: "entries",
                        label: "Entries (Dr/Cr)",
                        render: entries => (
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                {entries.map((en, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", width: 220, fontSize: 11 }}>
                                        <span style={{ color: en.type === 'debit' ? '#1e40af' : '#64748b', fontWeight: en.type === 'debit' ? 700 : 500 }}>
                                            {en.type === 'debit' ? '' : '   '} {en.account}
                                        </span>
                                        <span style={{ fontWeight: 700, fontFamily: "monospace" }}>{fmt(en.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        ),
                        sortable: false
                    },
                    { key: "total", label: "Total", align: "right", render: v => <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>{fmt(v)}</span> },
                    {
                        key: "status",
                        label: "Status",
                        align: "center",
                        render: v => v === "posted" ? <div style={{ color: "#059669" }}><Icon name="check" size={18} /></div> : <div style={{ color: "#dc2626" }}><Icon name="close" size={18} /></div>
                    },
                ]} data={filtered} />
            </div>

            <Modal open={showForm} onClose={() => setShowForm(false)} title={`New Journal Voucher`} width={720}>
                <JournalForm accounts={accounts} onSubmit={handleSubmit} onClose={() => setShowForm(false)} />
            </Modal>
        </div>
    );
};
