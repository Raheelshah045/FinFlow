import React, { useState, useEffect } from "react";
import { Icon } from "../components/Icon";
import * as api from "../services/api";

export const AdminPage = ({ onLogout }) => {
    const [users, setUsers] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newUser, setNewUser] = useState({ name: "", email: "", username: "", password: "", phone: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await api.adminFetchUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.adminCreateUser(newUser);
            setNewUser({ name: "", email: "", username: "", password: "", phone: "" });
            setShowCreateModal(false);
            loadUsers(); // Refresh list
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: "100vh",
            width: "100%",
            background: "radial-gradient(circle at top right, #064e3b, transparent), radial-gradient(circle at bottom left, #1e3a8a, transparent), #0f172a",
            fontFamily: "'Sora', sans-serif",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
        }}>
            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .glass-card {
                    backdrop-filter: blur(20px) saturate(160%);
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                }
                .admin-table th {
                    text-align: left;
                    padding: 16px 24px;
                    font-size: 12px;
                    font-weight: 700;
                    color: #94a3b8;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }
                .admin-table td {
                    padding: 18px 24px;
                    font-size: 14px;
                    color: #e2e8f0;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }
                .admin-table tr:hover {
                    background: rgba(255, 255, 255, 0.02);
                }
                .action-btn {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #fff;
                    padding: 8px 12px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                }
                .action-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: translateY(-1px);
                }
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.8);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }
                .admin-input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 12px 16px;
                    color: #fff;
                    outline: none;
                    transition: border 0.2s;
                }
                .admin-input:focus {
                    border-color: #3b82f6;
                }
            `}</style>

            {/* HEADER */}
            <div style={{ padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ background: "rgba(59, 130, 246, 0.2)", padding: 10, borderRadius: 14, border: "1px solid rgba(59, 130, 246, 0.3)" }}>
                        <Icon name="shield" size={24} color="#60a5fa" />
                    </div>
                    <div>
                        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>Admin Central</h1>
                        <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>System Management & User Provisioning</p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => setShowCreateModal(true)} style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.3)" }}>
                        <Icon name="user_plus" size={20} />
                        New Client
                    </button>
                    <button onClick={onLogout} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "12px 20px", borderRadius: 14, fontWeight: 700, cursor: "pointer" }}>
                        Sign Out
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div style={{ flex: 1, padding: "40px", overflowY: "auto", animation: "fadeUp 0.5s ease-out" }}>
                <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
                    <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Access</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                                    <td style={{ fontFamily: "monospace", color: "#60a5fa" }}>@{u.username}</td>
                                    <td>{u.email}</td>
                                    <td>{u.phone}</td>
                                    <td>
                                        <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, background: u.role === 'admin' ? "rgba(59, 130, 246, 0.2)" : "rgba(148, 163, 184, 0.1)", color: u.role === 'admin' ? "#60a5fa" : "#94a3b8" }}>
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="action-btn" onClick={() => setSelectedUser(u)}>
                                            <Icon name="info" size={16} />
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CREATE MODAL */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="glass-card" style={{ width: "100%", maxWidth: 460, padding: 40, background: "#0f172a" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
                            <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: 0 }}>Create Client Account</h2>
                            <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                                <Icon name="close" size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser}>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 8, fontWeight: 600 }}>Full Name</label>
                                <input required className="admin-input" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="e.g. Raheel Shah" />
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 8, fontWeight: 600 }}>Email Address</label>
                                <input required type="email" className="admin-input" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="client@finflow.com" />
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 8, fontWeight: 600 }}>Contact Number</label>
                                <input required className="admin-input" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} placeholder="+92 3XX XXXXXXX" />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
                                <div>
                                    <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 8, fontWeight: 600 }}>Username</label>
                                    <input required className="admin-input" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} placeholder="raheel123" />
                                </div>
                                <div>
                                    <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 8, fontWeight: 600 }}>Initial Password</label>
                                    <input required type="password" className="admin-input" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="********" />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", color: "#fff", border: "none", padding: 16, borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 16 }}>
                                {loading ? "Creating..." : "Create Account"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* DETAILS MODAL */}
            {selectedUser && (
                <div className="modal-overlay">
                    <div className="glass-card" style={{ width: "100%", maxWidth: 420, padding: 40, background: "#0f172a", textAlign: "center" }}>
                        <div style={{ width: 80, height: 80, background: "rgba(59, 130, 246, 0.1)", borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                            <Icon name="user" size={40} color="#3b82f6" />
                        </div>
                        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>{selectedUser.name}</h2>
                        <p style={{ color: "#60a5fa", fontFamily: "monospace", margin: "0 0 32px" }}>@{selectedUser.username}</p>

                        <div style={{ textAlign: "left", display: "grid", gap: 20 }}>
                            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: 16, borderRadius: 16, border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                                <label style={{ color: "#64748b", fontSize: 11, fontWeight: 800, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Email</label>
                                <span style={{ color: "#fff", fontSize: 15 }}>{selectedUser.email}</span>
                            </div>
                            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: 16, borderRadius: 16, border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                                <label style={{ color: "#64748b", fontSize: 11, fontWeight: 800, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Phone</label>
                                <span style={{ color: "#fff", fontSize: 15 }}>{selectedUser.phone || "N/A"}</span>
                            </div>
                            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: 16, borderRadius: 16, border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                                <label style={{ color: "#64748b", fontSize: 11, fontWeight: 800, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Initial Password</label>
                                <span style={{ color: "#94a3b8", fontSize: 13, fontStyle: "italic" }}>Hidden for security reasons</span>
                            </div>
                        </div>

                        <button onClick={() => setSelectedUser(null)} style={{ width: "100%", marginTop: 32, background: "rgba(255, 255, 255, 0.05)", color: "#fff", border: "1px solid rgba(255, 255, 255, 0.1)", padding: 14, borderRadius: 12, fontWeight: 700, cursor: "pointer" }}>
                            Close Details
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
