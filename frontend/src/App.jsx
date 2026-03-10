import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "./components/Icon";
import { DashboardPage } from "./pages/DashboardPage";
import { VoucherPage } from "./pages/VoucherPage";
import { InventoryPage } from "./pages/InventoryPage";
import { LedgerPage } from "./pages/LedgerPage";
import { ReportsPage } from "./pages/ReportsPage";
import { JournalPage } from "./pages/JournalPage";
import { PartiesPage } from "./pages/PartiesPage";
import { LoginPage } from "./pages/LoginPage";
import { AdminPage } from "./pages/AdminPage";
import { fmtShort } from "./utils/formatters";
import * as api from "./services/api";

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [page, setPage] = useState("login");
    const [vouchers, setVouchers] = useState([]);
    const [products, setProducts] = useState([]);
    const [parties, setParties] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [loading, setLoading] = useState(false);

    const refreshData = async () => {
        setLoading(true);
        try {
            const [accs, prods, pts, vchs] = await Promise.all([
                api.fetchAccounts(),
                api.fetchProducts(),
                api.fetchParties(),
                api.fetchVouchers()
            ]);
            setAccounts(accs);
            setProducts(prods);
            setParties(pts);
            setVouchers(vchs);
        } catch (error) {
            console.error("Data fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (loginIdentifier, password) => {
        try {
            const user = await api.login(loginIdentifier, password);
            api.setAuthUser(user);
            setIsAuthenticated(true);
            setIsAdmin(user.role === 'admin');

            if (user.role === 'admin') {
                setPage("admin");
            } else {
                setPage("dashboard");
                await refreshData();
            }
        } catch (error) {
            alert("Invalid Credentials!");
        }
    };

    const handleLogout = () => {
        api.setAuthUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setPage("login");
        setAccounts([]);
        setProducts([]);
        setParties([]);
        setVouchers([]);
    };

    const createDoubleEntry = async (voucherData) => {
        try {
            const result = await api.postVoucher(voucherData);
            setVouchers(prev => [...prev, result.voucher]);
            setProducts(result.products);
            setAccounts(result.accounts);
        } catch (error) {
            console.error("Voucher error:", error);
            alert("Voucher failed. Check stock or logs.");
        }
    };

    const addProduct = async (newProd) => {
        try {
            const saved = await api.postProduct(newProd);
            setProducts(prev => [...prev, saved]);
        } catch (error) {
            console.error("Error adding product:", error);
        }
    };

    const addParty = async (newParty) => {
        try {
            const saved = await api.postParty(newParty);
            setParties(prev => [...prev, saved]);
        } catch (error) {
            console.error("Error adding party:", error);
        }
    };

    const updateAccountBalance = async (id, balance) => {
        try {
            const updated = await api.updateAccount(id, balance);
            setAccounts(prev => prev.map(a => a.id === id ? updated : a));
        } catch (error) {
            console.error("Error updating account:", error);
        }
    };

    const nav = [
        { id: "dashboard", label: "Dashboard", icon: "dashboard" },
        { id: "purchase", label: "Purchase Vouchers", icon: "purchase" },
        { id: "sale", label: "Sales Vouchers", icon: "sale" },
        { id: "journal", label: "Journal Vouchers", icon: "reports" },
        { id: "inventory", label: "Inventory", icon: "inventory" },
        { id: "parties", label: "Vendors", icon: "users" },
        { id: "ledger", label: "Bank Ledger", icon: "bank" },
        { id: "reports", label: "P&L Reports", icon: "trend_up" }
    ];

    const cash = accounts.find(a => a.id === "cash")?.balance || 0;
    const bank = accounts.find(a => a.id === "bank")?.balance || 0;

    return (
        <div style={{ display: "flex", height: "100vh", fontFamily: "'Sora', 'Segoe UI', sans-serif", background: "var(--bg-main)", overflow: "hidden" }}>
            <style>{`
                :root {
                    --primary: #0A1E3C;
                    --primary-soft: rgba(10, 30, 60, 0.08);
                    --accent: #C5A059;
                    --accent-soft: rgba(197, 160, 89, 0.15);
                    --success: #10b981;
                    --warning: #C5A059;
                    --danger: #ef4444;
                    --bg-main: #f4f7f9;
                    --bg-card: #ffffff;
                    --bg-sidebar: #0A1E3C;
                    --text-main: #0A1E3C;
                    --text-muted: #64748b;
                    --border: #e2e8f0;
                    --radius-lg: 24px;
                    --radius-md: 16px;
                    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                }

                body, html { width: 100%; height: 100%; background: var(--bg-main); color: var(--text-main); }
                * { box-sizing: border-box; margin: 0; padding: 0; }
                #root { width: 100%; height: 100%; }
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');
                
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

                @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                select, input { font-family: inherit; }
                
                @media (max-width: 768px) {
                    .sidebar { position: fixed !important; z-index: 50; height: 100% !important; left: 0; top: 0; transform: translateX(-100%); }
                    .sidebar.mobile-open { transform: translateX(0); width: 280px !important; }
                    .main-content { padding: 16px !important; }
                    .mobile-header { display: flex !important; }
                    .sidebar-overlay { display: block !important; }
                    .grid-1-1 { grid-template-columns: 1fr !important; }
                }
            `}</style>

            {/* SIDEBAR OVERLAY FOR MOBILE */}
            {isAuthenticated && !isAdmin && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        display: "none",
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.5)",
                        zIndex: 40,
                        opacity: sidebarOpen ? 1 : 0,
                        pointerEvents: sidebarOpen ? "auto" : "none",
                        transition: "opacity 0.25s ease"
                    }}
                />
            )}

            {/* SIDEBAR */}
            {isAuthenticated && !isAdmin && (
                <div className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`} style={{ width: sidebarOpen ? 280 : 72, background: "var(--bg-sidebar)", display: "flex", flexDirection: "column", flexShrink: 0, transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", overflow: "hidden", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ padding: sidebarOpen ? "28px 24px" : "28px 0", display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "flex-start" : "center", gap: 14 }}>
                        <div style={{ width: 48, height: 48, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <img src="/logo.png" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </div>
                        {sidebarOpen && (
                            <div style={{ overflow: "hidden" }}>
                                <div style={{ color: "#fff", fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em" }}>Balancify</div>
                                <div style={{ color: "#94a3b8", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>Enterprise ERP</div>
                            </div>
                        )}
                    </div>

                    {sidebarOpen && (
                        <div style={{ padding: "0 16px 20px" }}>
                            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <div style={{ fontSize: 10, color: "#475569", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 10 }}>FIRM LIQUIDITY</div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Ready Cash</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981" }}>{fmtShort(cash)}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Institutional</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)" }}>{fmtShort(bank)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <nav style={{ flex: 1, padding: "0 12px", overflowY: "auto" }}>
                        {nav.map(item => (
                            <button key={item.id} onClick={() => setPage(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: "none", background: page === item.id ? "rgba(197, 160, 89, 0.1)" : "transparent", color: page === item.id ? "var(--accent)" : "#94a3b8", cursor: "pointer", fontSize: 13, fontWeight: page === item.id ? 700 : 500, textAlign: "left", marginBottom: 4, transition: "all 0.2s", fontFamily: "inherit" }}
                                onMouseEnter={e => { if (page !== item.id) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "#cbd5e1"; } }}
                                onMouseLeave={e => { if (page !== item.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; } }}>
                                <span style={{ flexShrink: 0, opacity: page === item.id ? 1 : 0.7 }}><Icon name={item.icon} size={18} /></span>
                                {sidebarOpen && item.label}
                            </button>
                        ))}
                    </nav>

                    <div style={{ padding: "20px 12px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: 8 }}>
                        <button onClick={() => setSidebarOpen(p => !p)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "flex-start" : "center", gap: 12, padding: "10px 14px", borderRadius: 10, border: "none", background: "transparent", color: "#64748b", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
                            <Icon name="menu" size={16} />
                            {sidebarOpen && <span>Minimize Menu</span>}
                        </button>
                        <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: "none", background: "transparent", color: "#f87171", cursor: "pointer", fontSize: 13, fontWeight: 600, textAlign: "left", transition: "all 0.2s", fontFamily: "inherit" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <span style={{ transform: "rotate(180deg)", display: "flex" }}><Icon name="arrow_right" size={18} /></span>
                            {sidebarOpen && <span>Secure Logout</span>}
                        </button>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT AREA */}
            {isAuthenticated && isAdmin ? (
                <AdminPage onLogout={handleLogout} />
            ) : (
                <div className="main-content" style={{ flex: 1, overflow: "auto", padding: isAuthenticated ? 28 : 0, display: "flex", flexDirection: "column" }}>
                    <div className="mobile-header" style={{ display: "none", alignItems: "center", justifyContent: "space-between", marginBottom: 20, padding: "4px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <img src="/logo.png" alt="Logo" style={{ width: 32, height: 32 }} />
                            <span style={{ fontWeight: 800, color: "#0f172a", fontSize: 18 }}>Balancify</span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(true)}
                            style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                            <Icon name="menu" size={20} color="#0f172a" />
                        </button>
                    </div>

                    {!isAuthenticated ? (
                        <LoginPage onLogin={handleLogin} />
                    ) : (
                        loading ? <div style={{ display: "flex", justifyContent: "center", paddingTop: 100 }}>Loading Data...</div> : (
                            <>
                                {page === "dashboard" && <DashboardPage vouchers={vouchers} products={products} accounts={accounts} onUpdateAccount={updateAccountBalance} />}
                                {page === "purchase" && <VoucherPage type="purchase" vouchers={vouchers} products={products} parties={parties} accounts={accounts} onAdd={createDoubleEntry} onAddVendor={addParty} onAddProduct={addProduct} />}
                                {page === "sale" && <VoucherPage type="sale" vouchers={vouchers} products={products} parties={parties} accounts={accounts} onAdd={createDoubleEntry} onAddVendor={addParty} onAddProduct={addProduct} />}
                                {page === "journal" && <JournalPage vouchers={vouchers} accounts={accounts} onAdd={createDoubleEntry} />}
                                {page === "inventory" && <InventoryPage products={products} onAdd={addProduct} />}
                                {page === "parties" && <PartiesPage parties={parties} onAdd={addParty} />}
                                {page === "ledger" && <LedgerPage vouchers={vouchers} accounts={accounts} />}
                                {page === "reports" && <ReportsPage vouchers={vouchers} products={products} accounts={accounts} />}
                            </>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
