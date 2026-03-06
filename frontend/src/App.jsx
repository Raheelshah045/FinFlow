import React, { useState, useCallback, useEffect } from "react";
import { Icon } from "./components/Icon";
import { DashboardPage } from "./pages/DashboardPage";
import { VoucherPage } from "./pages/VoucherPage";
import { InventoryPage } from "./pages/InventoryPage";
import { LedgerPage } from "./pages/LedgerPage";
import { ReportsPage } from "./pages/ReportsPage";
import { JournalPage } from "./pages/JournalPage";
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
    const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [accs, prods, vchs] = await Promise.all([
                    api.fetchAccounts(),
                    api.fetchProducts(),
                    api.fetchVouchers()
                ]);
                setAccounts(accs);
                setProducts(prods);
                setVouchers(vchs);
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

    const nav = [
        { id: "dashboard", label: "Dashboard", icon: "dashboard" },
        { id: "purchase", label: "Purchase Vouchers", icon: "purchase" },
        { id: "sale", label: "Sales Vouchers", icon: "sale" },
        { id: "journal", label: "Journal Vouchers", icon: "reports" },
        { id: "inventory", label: "Inventory", icon: "inventory" },
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
      `}</style>

            {/* SIDEBAR */}
            <div style={{ width: sidebarOpen ? 260 : 64, background: "#0f172a", display: "flex", flexDirection: "column", flexShrink: 0, transition: "width 0.25s ease", overflow: "hidden" }}>
                <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 14, minHeight: 90 }}>
                    <div style={{ width: 52, height: 52, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img src="/logo.png" alt="FinFlow Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    {sidebarOpen && (
                        <div style={{ overflow: "hidden" }}>
                            <div style={{ color: "#fff", fontWeight: 900, fontSize: 22, lineHeight: 1, letterSpacing: "-0.03em" }}>Balancify</div>
                            <div style={{ color: "#64748b", fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 6, whiteSpace: "nowrap" }}>Enterprise Resource Planning</div>
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
            <div style={{ flex: 1, overflow: "auto", padding: 28 }}>
                {loading ? <div style={{ display: "flex", justifyContent: "center", paddingTop: 100 }}>Loading Balancify...</div> : (
                    <>
                        {page === "dashboard" && <DashboardPage vouchers={vouchers} products={products} accounts={accounts} />}
                        {page === "purchase" && <VoucherPage type="purchase" vouchers={vouchers} products={products} parties={INITIAL_PARTIES} accounts={accounts} onAdd={createDoubleEntry} />}
                        {page === "sale" && <VoucherPage type="sale" vouchers={vouchers} products={products} parties={INITIAL_PARTIES} accounts={accounts} onAdd={createDoubleEntry} />}
                        {page === "journal" && <JournalPage vouchers={vouchers} accounts={accounts} onAdd={createDoubleEntry} />}
                        {page === "inventory" && <InventoryPage products={products} />}
                        {page === "ledger" && <LedgerPage vouchers={vouchers} accounts={accounts} />}
                        {page === "reports" && <ReportsPage vouchers={vouchers} products={products} accounts={accounts} />}
                    </>
                )}
            </div>
        </div>
    );
}
