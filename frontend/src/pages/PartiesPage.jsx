import React, { useState } from "react";
import { StatCard } from "../components/StatCard";
import { DataTable } from "../components/DataTable";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";
import { newId } from "../utils/formatters";

export const PartiesPage = ({ parties, onAdd }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ name: "", type: "vendor" });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({ ...form, id: newId(form.type === "vendor" ? "V" : "C") });
        setIsModalOpen(false);
        setForm({ name: "", type: "vendor" });
    };

    return (
        <div style={{ animation: "fadeUp 0.3s ease-out" }}>
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Parties Management</h1>
                    <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>Manage your vendors and clients</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                >
                    + Add New Party
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
                <StatCard label="Total Parties" value={parties.length} sub="Vendors & Clients" accent="blue" />
                <StatCard label="Vendors" value={parties.filter(p => p.type === "vendor").length} sub="Suppliers" accent="indigo" />
                <StatCard label="Clients" value={parties.filter(p => p.type === "client").length} sub="Customers" accent="green" />
            </div>

            <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 24 }}>
                <DataTable columns={[
                    { key: "id", label: "ID" },
                    { key: "name", label: "Party Name" },
                    {
                        key: "type",
                        label: "Type",
                        render: v => <Badge color={v === "vendor" ? "indigo" : "green"}>{v.toUpperCase()}</Badge>
                    },
                ]} data={parties} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Party">
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Party Name</label>
                        <input
                            required
                            type="text"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="Enter name (e.g. ABC Tech)"
                            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none" }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Party Type</label>
                        <select
                            value={form.type}
                            onChange={e => setForm({ ...form, type: e.target.value })}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", outline: "none" }}
                        >
                            <option value="vendor">Vendor</option>
                            <option value="client">Client</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "12px", borderRadius: 8, fontWeight: 600, cursor: "pointer", marginTop: 8 }}
                    >
                        Save Party
                    </button>
                </form>
            </Modal>
        </div>
    );
};
