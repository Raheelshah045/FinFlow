import React, { useState, useCallback } from "react";
import { Icon } from "../components/Icon";
import { DataTable } from "../components/DataTable";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";
import { TransactionForm } from "../components/TransactionForm";
import { fmt } from "../utils/formatters";

export const VoucherPage = ({ type, vouchers, products, parties, accounts, onAdd, onAddVendor, onAddProduct }) => {
    const [showForm, setShowForm] = useState(false);
    const [toast, setToast] = useState(null);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = vouchers.filter(v => {
        // Type filter
        if (v.type !== type) return false;

        // Date range filter
        if (fromDate && v.date < fromDate) return false;
        if (toDate && v.date > toDate) return false;

        // Search query filter (Client, ID, or Product name)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchId = v.id.toLowerCase().includes(query);
            const matchParty = v.party.toLowerCase().includes(query);
            const matchProduct = v.items.some(it => it.name.toLowerCase().includes(query));
            if (!matchId && !matchParty && !matchProduct) return false;
        }

        return true;
    });

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

            <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "16px 24px", marginBottom: 20, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><Icon name="search" size={15} /></span>
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by Voucher #, Client, or Product name..."
                        style={{ width: "100%", padding: "10px 14px 10px 38px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, outline: "none", background: "#f8fafc", boxSizing: "border-box", fontFamily: "inherit" }}
                    />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", padding: "8px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Date Range:</span>
                    <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ border: "none", fontSize: 13, fontWeight: 600, color: "#0f172a", outline: "none", background: "transparent", cursor: "pointer" }} />
                    <span style={{ color: "#cbd5e1" }}>→</span>
                    <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ border: "none", fontSize: 13, fontWeight: 600, color: "#0f172a", outline: "none", background: "transparent", cursor: "pointer" }} />
                    {(fromDate || toDate || searchQuery) && (
                        <button onClick={() => { setFromDate(""); setToDate(""); setSearchQuery(""); }} style={{ border: "none", background: "none", padding: "0 4px", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center" }}>
                            <Icon name="close" size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 24 }}>
                <DataTable searchable={false} columns={[
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
                <TransactionForm
                    type={type}
                    products={products}
                    parties={parties}
                    accounts={accounts}
                    onSubmit={handleSubmit}
                    onClose={() => setShowForm(false)}
                    onAddVendor={onAddVendor}
                    onAddProduct={onAddProduct}
                />
            </Modal>
        </div>
    );
};
