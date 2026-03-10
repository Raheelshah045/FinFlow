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
        <div style={{ display: "flex", height: "100vh", fontFamily: "'Sora', 'Segoe UI', sans-serif", background: "#f1f5f9", overflow: "hidden" }}>
            <style>{`
                body, html { width: 100%; height: 100%; background: #f1f5f9; }
                * { box-sizing: border-box; margin: 0; padding: 0; }
                #root { width: 100%; height: 100%; }
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500;600&display=swap');
                ::-webkit-scrollbar { width: 5px; height: 5px; }
                ::-webkit-scrollbar-track { background: #f1f5f9; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
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
                <div className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`} style={{ width: sidebarOpen ? 280 : 72, background: "#0f172a", display: "flex", flexDirection: "column", flexShrink: 0, transition: "all 0.25s ease", overflow: "hidden" }}>
                    <div style={{ padding: sidebarOpen ? "24px 20px" : "24px 0", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "flex-start" : "center", gap: 14, minHeight: 90 }}>
                        <div style={{ width: sidebarOpen ? 52 : 44, height: sidebarOpen ? 52 : 44, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <img src="/logo.png" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </div>
                        {sidebarOpen && (
                            <div style={{ overflow: "hidden", flex: 1 }}>
                                <div style={{ color: "#fff", fontWeight: 900, fontSize: 22, lineHeight: 1, letterSpacing: "-0.03em" }}>Balancify</div>
                                <div style={{ color: "#64748b", fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 6, opacity: 0.8, lineHeight: 1.4 }}>Enterprise Resource Planning</div>
                            </div>
                        )}
                    </div>

                    {sidebarOpen && (
                        <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", margin: "0 10px 0" }}>
                            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px" }}>
                                <div style={{ fontSize: 10, color: "#475569", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>QUICK BALANCE</div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Cash</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#34d399", fontFamily: "monospace" }}>{fmtShort(cash)}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Bank</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", fontFamily: "monospace" }}>{fmtShort(bank)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <nav style={{ flex: 1, padding: "10px 10px", overflowY: "auto" }}>
                        {nav.map(item => (
                            <button key={item.id} onClick={() => setPage(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10, border: "none", background: page === item.id ? "rgba(59,130,246,0.2)" : "transparent", color: page === item.id ? "#60a5fa" : "#94a3b8", cursor: "pointer", fontSize: 13, fontWeight: page === item.id ? 700 : 500, textAlign: "left", marginBottom: 2, transition: "all 0.15s", fontFamily: "inherit", whiteSpace: "nowrap" }}
                                onMouseEnter={e => { if (page !== item.id) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                                onMouseLeave={e => { if (page !== item.id) e.currentTarget.style.background = "transparent"; }}>
                                <span style={{ flexShrink: 0 }}><Icon name={item.icon} size={17} /></span>
                                {sidebarOpen && item.label}
                            </button>
                        ))}
                    </nav>

                    <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 4 }}>
                        <button onClick={() => setSidebarOpen(p => !p)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "flex-end" : "center", gap: 8, padding: "9px 12px", borderRadius: 9, border: "none", background: "rgba(255,255,255,0.04)", color: "#64748b", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
                            <Icon name="menu" size={16} />
                            {sidebarOpen && <span style={{ fontSize: 11 }}>Collapse</span>}
                        </button>
                        <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10, border: "none", background: "transparent", color: "#f87171", cursor: "pointer", fontSize: 13, fontWeight: 600, textAlign: "left", transition: "all 0.15s", fontFamily: "inherit" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <span style={{ transform: "rotate(180deg)", display: "flex" }}><Icon name="arrow_right" size={17} /></span>
                            {sidebarOpen && <span>Sign Out</span>}
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
