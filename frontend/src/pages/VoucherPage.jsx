import React, { useState, useCallback } from "react";
import { Icon } from "../components/Icon";
import { DataTable } from "../components/DataTable";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";
import { TransactionForm } from "../components/TransactionForm";
import { fmt } from "../utils/formatters";

export const VoucherPage = ({ type, vouchers, products, parties, accounts, onAdd }) => {
    const [showForm, setShowForm] = useState(false);
    const [toast, setToast] = useState(null);

    const filtered = vouchers.filter(v => v.type === type);
    const total = filtered.reduce((s, v) => s + v.total, 0);

    const handleSubmit = (data) => {
        onAdd(data);
        setShowForm(false);
        setToast(`${type === "purchase" ? "Purchase" : "Sale"} voucher posted successfully!`);
        setTimeout(() => setToast(null), 3500);
    };

    return (
        <div style={{ animation: "fadeUp 0.3s ease-out" }}>
            {toast && (
                <div style={{ position: "fixed", top: 24, right: 24, background: "#059669", color: "#fff", borderRadius: 10, padding: "14px 20px", fontWeight: 600, fontSize: 14, boxShadow: "0 8px 24px rgba(5,150,105,0.3)", zIndex: 2000, display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon name="check" size={16} /> {toast}
                </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{type === "purchase" ? "Purchase Vouchers" : "Sales Vouchers"}</h1>
                    <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>Total: {fmt(total)} across {filtered.length} vouchers</p>
                </div>
                <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#1e40af", color: "#fff", border: "none", borderRadius: 10, padding: "11px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(30,64,175,0.3)" }}>
                    <Icon name="plus" size={16} /> New {type === "purchase" ? "Purchase" : "Sale"}
                </button>
            </div>

            <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 24 }}>
                <DataTable columns={[
                    { key: "id", label: "Voucher #" },
                    { key: "date", label: "Date" },
                    { key: "party", label: type === "purchase" ? "Vendor" : "Client" },
                    { key: "paymentMode", label: "Mode", render: v => <Badge color="gray">{v.toUpperCase()}</Badge> },
                    {
                        key: "items",
                        label: "Items",
                        render: items => (
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {items.map((it, i) => (
                                    <div key={i} style={{ fontSize: 12, color: "#475569" }}>
                                        <span style={{ fontWeight: 600 }}>{it.name}</span> × {it.qty}
                                    </div>
                                ))}
                            </div>
                        ),
                        sortable: false
                    },
                    { key: "total", label: "Total", align: "right", render: v => <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>{fmt(v)}</span> },
                    ...(type === "sale" ? [{ key: "margin", label: "Margin", align: "right", render: v => <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#059669" }}>{fmt(v)}</span> }] : []),
                    {
                        key: "status",
                        label: "Status",
                        align: "center",
                        render: v => v === "posted" ? <div style={{ color: "#059669" }}><Icon name="check" size={18} /></div> : <div style={{ color: "#dc2626" }}><Icon name="close" size={18} /></div>
                    },
                ]} data={filtered} />
            </div>

            <Modal open={showForm} onClose={() => setShowForm(false)} title={`New ${type === "purchase" ? "Purchase" : "Sale"} Voucher`} width={720}>
                <TransactionForm type={type} products={products} parties={parties} accounts={accounts} onSubmit={handleSubmit} onClose={() => setShowForm(false)} />
            </Modal>
        </div>
    );
};
