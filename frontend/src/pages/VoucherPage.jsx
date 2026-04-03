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
        <div style={{ animation: "fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            {toast && (
                <div style={{ position: "fixed", top: 24, right: 24, background: "var(--success)", color: "#fff", borderRadius: 12, padding: "16px 24px", fontWeight: 700, fontSize: 14, boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.3)", zIndex: 2000, display: "flex", alignItems: "center", gap: 12 }}>
                    <Icon name="check" size={18} /> {toast}
                </div>
            )}

            <div className="voucher-top-bar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-main)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>{type === "purchase" ? "Procurement Registry" : "Sales Registry"}</h1>
                    <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14, fontWeight: 500 }}>Aggregated Volume: <span style={{ color: "var(--text-main)", fontWeight: 700 }}>{fmt(total)}</span> across {filtered.length} entries</p>
                </div>
                <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--primary)", color: "#fff", border: "none", borderRadius: "12px", padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.3s", boxShadow: "0 10px 15px -3px rgba(132, 204, 22, 0.2)" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(132, 204, 22, 0.3)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(132, 204, 22, 0.2)"; }}>
                    <Icon name="plus" size={18} /> CREATE {type === "purchase" ? "PROCUREMENT" : "SALE"}
                </button>
            </div>

            <div className="voucher-filters" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px 24px", marginBottom: 24, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", boxShadow: "var(--shadow)" }}>
                <div style={{ position: "relative", flex: 2, minWidth: 260 }}>
                    <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}><Icon name="search" size={16} /></span>
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={`Locate by ID, ${type === "purchase" ? "Vendor" : "Client"}, or Product Line...`}
                        style={{ width: "100%", padding: "12px 14px 12px 48px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontSize: 13, outline: "none", background: "var(--bg-main)", color: "var(--text-main)", transition: "all 0.2s" }}
                        onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                        onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
                    />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--bg-main)", padding: "10px 20px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.05em" }}>TIME RANGE:</span>
                    <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ border: "none", fontSize: 13, fontWeight: 700, color: "var(--text-main)", outline: "none", background: "transparent", cursor: "pointer" }} />
                    <span style={{ color: "var(--border)", fontWeight: 800 }}>&#8212;</span>
                    <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ border: "none", fontSize: 13, fontWeight: 700, color: "var(--text-main)", outline: "none", background: "transparent", cursor: "pointer" }} />
                    {(fromDate || toDate || searchQuery) && (
                        <button onClick={() => { setFromDate(""); setToDate(""); setSearchQuery(""); }} style={{ border: "none", background: "rgba(0,0,0,0.05)", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", cursor: "pointer", marginLeft: 8 }}>
                            <Icon name="close" size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "12px", boxShadow: "var(--shadow)" }}>
                <DataTable searchable={false} columns={[
                    { key: "id", label: "SERIAL NO", render: v => <span style={{ fontWeight: 800, color: "var(--primary)" }}>{v}</span> },
                    { key: "date", label: "DATE" },
                    { key: "party", label: type === "purchase" ? "VENDOR ENTITY" : "CLIENT ENTITY" },
                    { key: "paymentMode", label: "MODE", render: v => <Badge color="gray">{v.toUpperCase()}</Badge> },
                    {
                        key: "items",
                        label: "ASSET LINES",
                        render: items => (
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {items.map((it, i) => (
                                    <div key={i} style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
                                        <span style={{ fontWeight: 700, color: "var(--text-main)" }}>{it.name}</span> &#215; {it.qty}
                                    </div>
                                ))}
                            </div>
                        ),
                        sortable: false
                    },
                    { key: "total", label: "NET VALUE", align: "right", render: v => <span style={{ fontWeight: 800, color: "var(--text-main)" }}>{fmt(v)}</span> },
                    ...(type === "sale" ? [{ key: "margin", label: "NET MARGIN", align: "right", render: v => <span style={{ fontWeight: 800, color: "var(--success)" }}>{fmt(v)}</span> }] : []),
                    {
                        key: "status",
                        label: "STATUS",
                        align: "center",
                        render: v => v === "posted" ? <div style={{ color: "var(--success)" }}><Icon name="check" size={20} /></div> : <div style={{ color: "var(--danger)" }}><Icon name="close" size={20} /></div>
                    },
                ]} data={filtered} />
            </div>

            <Modal open={showForm} onClose={() => setShowForm(false)} title={`New ${type === "purchase" ? "Procurement" : "Sale"} Entry`} width={720}>
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

