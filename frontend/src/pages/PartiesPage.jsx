import React, { useState } from "react";
import { StatCard } from "../components/StatCard";
import { DataTable } from "../components/DataTable";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";
import { newId } from "../utils/formatters";

export const PartiesPage = ({ parties, onAdd }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ name: "", type: "vendor" });

    // Filter to only show vendors, though the user said "just vendor's will be specified"
    // we keep the filter in case there are legacy client records.
    const vendors = parties.filter(p => p.type === "vendor");

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({ ...form, id: newId("V"), type: "vendor" });
        setIsModalOpen(false);
        setForm({ name: "", type: "vendor" });
    };

    return (
        <div style={{ animation: "fadeUp 0.3s ease-out" }}>
            <div className="voucher-top-bar" style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-main)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Vendor Registry</h1>
                    <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14, fontWeight: 500 }}>Manage your suppliers and service providers</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ background: "var(--primary)", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "var(--radius-md)", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s", boxShadow: "0 4px 12px rgba(132, 204, 22, 0.15)" }}
                    onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
                    onMouseLeave={e => e.currentTarget.style.filter = "none"}
                >
                    + Register New Vendor
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
                <StatCard label="Total Vendors" value={vendors.length} sub="Active Suppliers" accent="navy" isCurrency={false} />
            </div>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "28px", boxShadow: "var(--shadow)" }}>
                <DataTable columns={[
                    { key: "id", label: "ID" },
                    { key: "name", label: "Vendor Name" },
                ]} data={vendors} />
            </div>

            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Vendor">
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Vendor Name</label>
                        <input
                            required
                            type="text"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="Enter name (e.g. ABC Tech)"
                            style={{ width: "100%", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-main)", outline: "none", fontSize: 13 }}
                        />
                    </div>
                    <button
                        type="submit"
                        style={{ background: "var(--primary)", color: "#fff", border: "none", padding: "16px", borderRadius: "var(--radius-md)", fontWeight: 700, cursor: "pointer", marginTop: 8, fontSize: 14, boxShadow: "0 10px 15px -3px rgba(132, 204, 22, 0.2)" }}
                    >
                        Save Vendor Details
                    </button>
                </form>
            </Modal>
        </div>
    );
};
