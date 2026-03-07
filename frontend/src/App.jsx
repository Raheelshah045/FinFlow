import React, { useState, useCallback, useEffect } from "react";
import { Icon } from "./components/Icon";
import { DashboardPage } from "./pages/DashboardPage";
import { VoucherPage } from "./pages/VoucherPage";
import { InventoryPage } from "./pages/InventoryPage";
import { LedgerPage } from "./pages/LedgerPage";
import { ReportsPage } from "./pages/ReportsPage";
import { JournalPage } from "./pages/JournalPage";
import { PartiesPage } from "./pages/PartiesPage";
import { fmtShort, newId } from "./utils/formatters";
import * as api from "./services/api";

// Mock data (Normally this would come from the backend)
import {
    INITIAL_ACCOUNTS,
    INITIAL_PRODUCTS,
    INITIAL_PARTIES,
    INITIAL_VOUCHERS
} from "./data/initialData";

export default function App() {
    const [page, setPage] = useState("dashboard");
    const [vouchers, setVouchers] = useState(INITIAL_VOUCHERS);
    const [products, setProducts] = useState(INITIAL_PRODUCTS);
    const [parties, setParties] = useState(INITIAL_PARTIES);
    const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [accs, prods, vchs, pts] = await Promise.all([
                    api.fetchAccounts(),
                    api.fetchProducts(),
                    api.fetchVouchers(),
                    api.fetchParties()
                ]);
                setAccounts(accs);
                setProducts(prods);
                setVouchers(vchs);
                setParties(pts);
            } catch (error) {
                console.error("Error loading data from API:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const createDoubleEntry = useCallback(async (voucherData) => {
        const { type, items: vItems, paymentMode, total, party, partyId, date } = voucherData;
        const id = newId(type === "purchase" ? "PV" : "SV");

        let margin = 0;
        const updatedProducts = [...products];

        vItems.forEach(item => {
            const idx = updatedProducts.findIndex(p => p.id === item.productId);
            if (idx === -1) return;
            const prod = updatedProducts[idx];
            if (type === "purchase") {
                updatedProducts[idx] = { ...prod, stock: prod.stock + item.qty };
                margin = 0;
            } else {
                updatedProducts[idx] = { ...prod, stock: prod.stock - item.qty };
                margin += (prod.salePrice - prod.purchasePrice) * item.qty;
            }
        });

        const updatedAccounts = accounts.map(acc => {
            if (type === "purchase") {
                if (acc.id === "inventory") return { ...acc, balance: acc.balance + total };
                if (paymentMode === "cash" && acc.id === "cash") return { ...acc, balance: acc.balance - total };
                if (paymentMode === "bank" && acc.id === "bank") return { ...acc, balance: acc.balance - total };
            } else {
                if (paymentMode === "cash" && acc.id === "cash") return { ...acc, balance: acc.balance + total };
                if (paymentMode === "bank" && acc.id === "bank") return { ...acc, balance: acc.balance + total };
                if (acc.id === "sales_revenue") return { ...acc, balance: acc.balance + total };
            }
            return acc;
        });

        const entries = type === "purchase"
            ? [{ account: "Inventory Asset", type: "debit", amount: total }, { account: paymentMode === "cash" ? "Cash" : "Bank (HBL)", type: "credit", amount: total }]
            : [{ account: paymentMode === "cash" ? "Cash" : "Bank (HBL)", type: "debit", amount: total }, { account: "Sales Revenue", type: "credit", amount: total }];

        const newVoucher = { id, type, date, party, paymentMode, total, status: "posted", items: vItems, entries, ...(type === "sale" ? { margin } : {}) };

        try {
            await api.postVoucher(newVoucher);
            setVouchers(prev => [...prev, newVoucher]);
            setProducts(updatedProducts);
            setAccounts(updatedAccounts);
        } catch (error) {
            console.error("Error posting voucher:", error);
            alert("Failed to save transaction to backend.");
        }
    }, [products, accounts]);

    const addProduct = async (newProduct) => {
        try {
            const savedProduct = await api.postProduct(newProduct);
            setProducts(prev => [...prev, savedProduct]);
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Failed to add product.");
        }
    };

    const addParty = async (newParty) => {
        try {
            const savedParty = await api.postParty(newParty);
            setParties(prev => [...prev, savedParty]);
        } catch (error) {
            console.error("Error adding party:", error);
            alert("Failed to add party.");
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
        { id: "reports", label: "P&L Reports", icon: "trend_up" },
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
            .sidebar {
                position: fixed !important;
                z-index: 50;
                height: 100% !important;
                left: 0;
                top: 0;
                transform: translateX(-100%);
            }
            .sidebar.mobile-open {
                transform: translateX(0);
                width: 280px !important;
            }
            .main-content {
                padding: 16px !important;
            }
            .mobile-header {
                display: flex !important;
            }
            .sidebar-overlay {
                display: block !important;
            }
            .grid-1-1 {
                grid-template-columns: 1fr !important;
            }
            .item-row {
                grid-template-columns: 1fr 1fr !important;
                gap: 12px !important;
            }
            .item-row > div:nth-child(1) { grid-column: span 2; }
            .item-row > div:nth-child(2) { grid-column: span 1; }
            .item-row > div:nth-child(3) { grid-column: span 1; }
            .item-header-row {
                display: none !important;
            }
            .voucher-top-bar {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 12px !important;
            }
            .voucher-filters {
                flex-direction: column !important;
                align-items: stretch !important;
            }
            .voucher-filters > div {
                width: 100% !important;
            }
        }
      `}</style>

            {/* SIDEBAR OVERLAY FOR MOBILE */}
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

            {/* SIDEBAR */}
            <div className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`} style={{ width: sidebarOpen ? 280 : 72, background: "#0f172a", display: "flex", flexDirection: "column", flexShrink: 0, transition: "all 0.25s ease", overflow: "hidden" }}>
                <div style={{ padding: sidebarOpen ? "24px 20px" : "24px 0", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "flex-start" : "center", gap: 14, minHeight: 90 }}>
                    <div style={{ width: sidebarOpen ? 52 : 44, height: sidebarOpen ? 52 : 44, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img src="/logo.png" alt="Balancify Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
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

                <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <button onClick={() => setSidebarOpen(p => !p)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "flex-end" : "center", gap: 8, padding: "9px 12px", borderRadius: 9, border: "none", background: "rgba(255,255,255,0.04)", color: "#64748b", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
                        <Icon name="menu" size={16} />
                        {sidebarOpen && <span style={{ fontSize: 11 }}>Collapse</span>}
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="main-content" style={{ flex: 1, overflow: "auto", padding: 28, display: "flex", flexDirection: "column" }}>
                {/* MOBILE HEADER */}
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
                {loading ? <div style={{ display: "flex", justifyContent: "center", paddingTop: 100 }}>Loading Balancify...</div> : (
                    <>
                        {page === "dashboard" && <DashboardPage vouchers={vouchers} products={products} accounts={accounts} />}
                        {page === "purchase" && <VoucherPage type="purchase" vouchers={vouchers} products={products} parties={parties} accounts={accounts} onAdd={createDoubleEntry} onAddVendor={addParty} onAddProduct={addProduct} />}
                        {page === "sale" && <VoucherPage type="sale" vouchers={vouchers} products={products} parties={parties} accounts={accounts} onAdd={createDoubleEntry} onAddVendor={addParty} onAddProduct={addProduct} />}
                        {page === "journal" && <JournalPage vouchers={vouchers} accounts={accounts} onAdd={createDoubleEntry} />}
                        {page === "inventory" && <InventoryPage products={products} onAdd={addProduct} />}
                        {page === "parties" && <PartiesPage parties={parties} onAdd={addParty} />}
                        {page === "ledger" && <LedgerPage vouchers={vouchers} accounts={accounts} />}
                        {page === "reports" && <ReportsPage vouchers={vouchers} products={products} accounts={accounts} />}
                    </>
                )}
            </div>
        </div>
    );
}
