import { useState, useMemo, useCallback, useEffect } from "react";

// ─── MOCK DATA & INITIAL STATE ───────────────────────────────────────────────
const INITIAL_ACCOUNTS = [
  { id: "cash", name: "Cash", type: "asset", balance: 500000 },
  { id: "bank", name: "Bank", type: "asset", balance: 1200000 },
  { id: "sales_revenue", name: "Sales Revenue", type: "revenue", balance: 0 },
  { id: "inventory", name: "Inventory Asset", type: "asset", balance: 0 },
  { id: "expenses", name: "Operating Expenses", type: "expense", balance: 0 },
];

const INITIAL_PRODUCTS = [
  { id: "p1", sku: "LPT-001", name: "Laptop Pro 15\"", purchasePrice: 85000, salePrice: 110000, stock: 12, threshold: 3 },
  { id: "p2", sku: "MON-002", name: "4K Monitor 27\"", purchasePrice: 42000, salePrice: 58000, stock: 8, threshold: 2 },
  { id: "p3", sku: "KBD-003", name: "Mechanical Keyboard", purchasePrice: 7500, salePrice: 12000, stock: 25, threshold: 5 },
  { id: "p4", sku: "MSE-004", name: "Wireless Mouse", purchasePrice: 3200, salePrice: 5500, stock: 2, threshold: 5 },
  { id: "p5", sku: "HDR-005", name: "Headset Pro", purchasePrice: 18000, salePrice: 28000, stock: 0, threshold: 3 },
  { id: "p6", sku: "WEB-006", name: "HD Webcam", purchasePrice: 9500, salePrice: 15000, stock: 6, threshold: 2 },
];

const INITIAL_PARTIES = [
  { id: "v1", name: "Tech Distributors Ltd.", type: "vendor" },
  { id: "v2", name: "Global Electronics Co.", type: "vendor" },
  { id: "c1", name: "Karachi Systems Inc.", type: "client" },
  { id: "c2", name: "Lahore Tech Solutions", type: "client" },
  { id: "c3", name: "Islamabad IT Hub", type: "client" },
];

const INITIAL_VOUCHERS = [
  {
    id: "PV-001", type: "purchase", date: "2025-01-10", party: "Tech Distributors Ltd.",
    paymentMode: "bank", total: 340000, status: "posted",
    items: [{ productId: "p1", name: "Laptop Pro 15\"", qty: 2, unitPrice: 85000, subtotal: 170000 }, { productId: "p2", name: "4K Monitor 27\"", qty: 4, unitPrice: 42000, subtotal: 168000 }],
    entries: [{ account: "Inventory Asset", type: "debit", amount: 340000 }, { account: "Bank", type: "credit", amount: 340000 }]
  },
  {
    id: "SV-001", type: "sale", date: "2025-01-15", party: "Karachi Systems Inc.",
    paymentMode: "bank", total: 294000, status: "posted",
    items: [{ productId: "p1", name: "Laptop Pro 15\"", qty: 2, unitPrice: 110000, subtotal: 220000 }, { productId: "p2", name: "4K Monitor 27\"", qty: 2, unitPrice: 58000, subtotal: 116000 }],
    entries: [{ account: "Bank", type: "debit", amount: 294000 }, { account: "Sales Revenue", type: "credit", amount: 294000 }],
    margin: 51000
  },
  {
    id: "PV-002", type: "purchase", date: "2025-02-03", party: "Global Electronics Co.",
    paymentMode: "cash", total: 187500, status: "posted",
    items: [{ productId: "p3", name: "Mechanical Keyboard", qty: 25, unitPrice: 7500, subtotal: 187500 }],
    entries: [{ account: "Inventory Asset", type: "debit", amount: 187500 }, { account: "Cash", type: "credit", amount: 187500 }]
  },
  {
    id: "SV-002", type: "sale", date: "2025-02-20", party: "Lahore Tech Solutions",
    paymentMode: "cash", total: 180000, status: "posted",
    items: [{ productId: "p3", name: "Mechanical Keyboard", qty: 15, unitPrice: 12000, subtotal: 180000 }],
    entries: [{ account: "Cash", type: "debit", amount: 180000 }, { account: "Sales Revenue", type: "credit", amount: 180000 }],
    margin: 67500
  },
  {
    id: "SV-003", type: "sale", date: "2025-03-01", party: "Islamabad IT Hub",
    paymentMode: "bank", total: 90000, status: "posted",
    items: [{ productId: "p4", name: "Wireless Mouse", qty: 5, unitPrice: 5500, subtotal: 27500 }, { productId: "p6", name: "HD Webcam", qty: 4, unitPrice: 15000, subtotal: 60000 }],
    entries: [{ account: "Bank", type: "debit", amount: 90000 }, { account: "Sales Revenue", type: "credit", amount: 90000 }],
    margin: 25100
  },
];

const fmt = (n) => "PKR " + Number(n || 0).toLocaleString("en-PK", { maximumFractionDigits: 0 });
const fmtShort = (n) => {
  if (n >= 1000000) return "PKR " + (n / 1000000).toFixed(2) + "M";
  if (n >= 1000) return "PKR " + (n / 1000).toFixed(1) + "K";
  return "PKR " + n;
};
const today = () => new Date().toISOString().slice(0, 10);
const newId = (prefix) => prefix + "-" + String(Date.now()).slice(-5);

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    purchase: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
    sale: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6"/></svg>,
    inventory: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
    ledger: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
    reports: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    close: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    trend_up: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    trend_down: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
    bank: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    alert: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    menu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  };
  return icons[name] || null;
};

// ─── STAT CARD ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, trend, accent }) => {
  const accents = {
    blue: { bg: "rgba(30,64,175,0.08)", border: "#1e40af22", icon: "#1e40af", badge: "#dbeafe", badgeText: "#1e40af" },
    green: { bg: "rgba(5,150,105,0.07)", border: "#05966922", icon: "#059669", badge: "#d1fae5", badgeText: "#065f46" },
    amber: { bg: "rgba(217,119,6,0.08)", border: "#d9770622", icon: "#d97706", badge: "#fef3c7", badgeText: "#92400e" },
    red: { bg: "rgba(220,38,38,0.07)", border: "#dc262622", icon: "#dc2626", badge: "#fee2e2", badgeText: "#991b1b" },
  };
  const c = accents[accent] || accents.blue;
  return (
    <div style={{ background: "#fff", border: `1.5px solid ${c.border}`, borderRadius: 14, padding: "22px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 100, height: 100, background: c.bg, borderRadius: "0 14px 0 100%" }} />
      <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>{fmtShort(value)}</div>
      {sub && <div style={{ fontSize: 12, color: "#94a3b8" }}>{sub}</div>}
      {trend !== undefined && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, background: trend >= 0 ? "#d1fae5" : "#fee2e2", color: trend >= 0 ? "#065f46" : "#991b1b", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
          <Icon name={trend >= 0 ? "trend_up" : "trend_down"} size={13} />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
};

// ─── MINI BAR CHART ──────────────────────────────────────────────────────────
const MiniBarChart = ({ data, height = 160 }) => {
  const max = Math.max(...data.map(d => Math.max(d.sales, d.purchases)));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height, padding: "0 4px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, height: "100%" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 3, width: "100%" }}>
            <div style={{ flex: 1, background: "linear-gradient(180deg, #1e40af, #3b82f6)", borderRadius: "4px 4px 0 0", height: `${(d.sales / max) * 100}%`, minHeight: 4, transition: "height 0.6s ease" }} title={`Sales: ${fmt(d.sales)}`} />
            <div style={{ flex: 1, background: "linear-gradient(180deg, #dc2626, #f87171)", borderRadius: "4px 4px 0 0", height: `${(d.purchases / max) * 100}%`, minHeight: 4, transition: "height 0.6s ease" }} title={`Purchases: ${fmt(d.purchases)}`} />
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{d.month}</div>
        </div>
      ))}
    </div>
  );
};

// ─── DATA TABLE ──────────────────────────────────────────────────────────────
const DataTable = ({ columns, data, searchable = true }) => {
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const filtered = useMemo(() => {
    let rows = [...data];
    if (search) rows = rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(search.toLowerCase())));
    if (sortCol) rows.sort((a, b) => {
      const va = a[sortCol], vb = b[sortCol];
      const cmp = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [data, search, sortCol, sortDir]);

  const toggleSort = (key) => {
    if (sortCol === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(key); setSortDir("asc"); }
  };

  return (
    <div>
      {searchable && (
        <div style={{ position: "relative", marginBottom: 14 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><Icon name="search" size={15} /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records..." style={{ width: "100%", padding: "9px 14px 9px 38px", border: "1.5px solid #e2e8f0", borderRadius: 9, fontSize: 13, outline: "none", background: "#f8fafc", boxSizing: "border-box", fontFamily: "inherit" }} />
        </div>
      )}
      <div style={{ overflowX: "auto", borderRadius: 10, border: "1.5px solid #e2e8f0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#0f172a" }}>
              {columns.map(col => (
                <th key={col.key} onClick={() => col.sortable !== false && toggleSort(col.key)} style={{ padding: "12px 16px", textAlign: col.align || "left", color: "#cbd5e1", fontWeight: 600, fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase", cursor: col.sortable !== false ? "pointer" : "default", whiteSpace: "nowrap", userSelect: "none" }}>
                  {col.label}{sortCol === col.key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No records found</td></tr>
            ) : filtered.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#f8fafc"}>
                {columns.map(col => (
                  <td key={col.key} style={{ padding: "11px 16px", textAlign: col.align || "left", color: "#334155", whiteSpace: "nowrap" }}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8, textAlign: "right" }}>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</div>
    </div>
  );
};

// ─── BADGE ───────────────────────────────────────────────────────────────────
const Badge = ({ children, color = "blue" }) => {
  const colors = { blue: ["#dbeafe", "#1e40af"], green: ["#d1fae5", "#065f46"], red: ["#fee2e2", "#991b1b"], amber: ["#fef3c7", "#92400e"], gray: ["#f1f5f9", "#475569"] };
  const [bg, text] = colors[color] || colors.blue;
  return <span style={{ display: "inline-block", background: bg, color: text, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>{children}</span>;
};

// ─── MODAL ───────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, width = 680 }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: width, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 80px rgba(0,0,0,0.3)", animation: "fadeUp 0.2s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1.5px solid #e2e8f0" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}><Icon name="close" size={16} /></button>
        </div>
        <div style={{ overflowY: "auto", padding: "24px", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
};

// ─── TRANSACTION FORM ─────────────────────────────────────────────────────────
const TransactionForm = ({ type, products, parties, accounts, onSubmit, onClose }) => {
  const [date, setDate] = useState(today());
  const [partyId, setPartyId] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [partySearch, setPartySearch] = useState("");
  const [items, setItems] = useState([{ productId: "", qty: 1, unitPrice: 0 }]);
  const [errors, setErrors] = useState({});

  const filteredParties = parties.filter(p =>
    (type === "purchase" ? p.type === "vendor" : p.type === "client") &&
    p.name.toLowerCase().includes(partySearch.toLowerCase())
  );

  const total = useMemo(() => items.reduce((s, it) => s + (it.qty * it.unitPrice), 0), [items]);

  const addItem = () => setItems(prev => [...prev, { productId: "", qty: 1, unitPrice: 0 }]);
  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const updateItem = (i, field, value) => {
    setItems(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      if (field === "productId") {
        const prod = products.find(p => p.id === value);
        if (prod) next[i].unitPrice = type === "purchase" ? prod.purchasePrice : prod.salePrice;
      }
      return next;
    });
  };

  const validate = () => {
    const errs = {};
    if (!partyId) errs.party = "Party required";
    if (!date) errs.date = "Date required";
    items.forEach((it, i) => {
      if (!it.productId) errs[`item_${i}`] = "Select product";
      if (type === "sale") {
        const prod = products.find(p => p.id === it.productId);
        if (prod && prod.stock < it.qty) errs[`item_${i}_qty`] = `Only ${prod.stock} in stock`;
        if (prod && prod.stock === 0) errs[`item_${i}_qty`] = "Out of stock";
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const party = parties.find(p => p.id === partyId);
    const voucherItems = items.map(it => {
      const prod = products.find(p => p.id === it.productId);
      return { productId: it.productId, name: prod?.name || "", qty: Number(it.qty), unitPrice: Number(it.unitPrice), subtotal: it.qty * it.unitPrice };
    });
    onSubmit({ type, date, party: party.name, partyId, paymentMode, total, items: voucherItems });
  };

  const inputStyle = (err) => ({ width: "100%", padding: "9px 12px", border: `1.5px solid ${err ? "#dc2626" : "#e2e8f0"}`, borderRadius: 8, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: "#f8fafc" });
  const labelStyle = { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5, display: "block" };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle(errors.date)} />
        </div>
        <div>
          <label style={labelStyle}>Payment Mode</label>
          <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} style={inputStyle()}>
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>{type === "purchase" ? "Vendor" : "Client"}</label>
        <input value={partySearch} onChange={e => setPartySearch(e.target.value)} placeholder={`Search ${type === "purchase" ? "vendor" : "client"}...`} style={inputStyle(errors.party)} />
        {partySearch && filteredParties.length > 0 && (
          <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 8, marginTop: 4, maxHeight: 140, overflowY: "auto", background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
            {filteredParties.map(p => (
              <div key={p.id} onClick={() => { setPartyId(p.id); setPartySearch(p.name); }} style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13, color: "#334155", borderBottom: "1px solid #f1f5f9" }}
                onMouseEnter={e => e.target.style.background = "#eff6ff"}
                onMouseLeave={e => e.target.style.background = ""}>
                {p.name}
              </div>
            ))}
          </div>
        )}
        {errors.party && <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>{errors.party}</div>}
      </div>

      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ ...labelStyle, margin: 0 }}>Line Items</label>
        <button onClick={addItem} style={{ display: "flex", alignItems: "center", gap: 5, background: "#eff6ff", color: "#1e40af", border: "none", borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          <Icon name="plus" size={13} /> Add Item
        </button>
      </div>
      <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr auto", gap: 0, background: "#f8fafc", padding: "8px 14px", fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase" }}>
          <span>Product</span><span>Qty</span><span>Unit Price</span><span></span>
        </div>
        {items.map((item, i) => {
          const prod = products.find(p => p.id === item.productId);
          return (
            <div key={i} style={{ padding: "10px 14px", borderTop: "1px solid #f1f5f9", display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr auto", gap: 8, alignItems: "start" }}>
              <div>
                <select value={item.productId} onChange={e => updateItem(i, "productId", e.target.value)} style={{ ...inputStyle(errors[`item_${i}`]), padding: "8px 10px" }}>
                  <option value="">-- Select --</option>
                  {products.map(p => <option key={p.id} value={p.id} disabled={type === "sale" && p.stock === 0}>{p.name} {type === "sale" && p.stock === 0 ? "(OOS)" : ""}</option>)}
                </select>
                {errors[`item_${i}`] && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 2 }}>{errors[`item_${i}`]}</div>}
                {prod && type === "sale" && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Stock: {prod.stock}</div>}
              </div>
              <div>
                <input type="number" min="1" value={item.qty} onChange={e => updateItem(i, "qty", Number(e.target.value))} style={{ ...inputStyle(errors[`item_${i}_qty`]), padding: "8px 10px" }} />
                {errors[`item_${i}_qty`] && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 2 }}>{errors[`item_${i}_qty`]}</div>}
              </div>
              <div>
                <input type="number" value={item.unitPrice} onChange={e => updateItem(i, "unitPrice", Number(e.target.value))} style={{ ...inputStyle(), padding: "8px 10px" }} />
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>= {fmt(item.qty * item.unitPrice)}</div>
              </div>
              <button onClick={() => items.length > 1 && removeItem(i)} style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 7, padding: 7, cursor: "pointer", display: "flex", alignItems: "center", marginTop: 2 }}>
                <Icon name="trash" size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b", marginBottom: 4 }}><span>Subtotal</span><span>{fmt(total)}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: "#0f172a" }}><span>Total</span><span style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(total)}</span></div>
        <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
          Double-entry: {type === "purchase"
            ? `Debit Inventory +${fmtShort(total)} / Credit ${paymentMode === "cash" ? "Cash" : "Bank"} -${fmtShort(total)}`
            : `Debit ${paymentMode === "cash" ? "Cash" : "Bank"} +${fmtShort(total)} / Credit Sales Revenue +${fmtShort(total)}`}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid #e2e8f0", borderRadius: 9, background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13, color: "#475569", fontFamily: "inherit" }}>Cancel</button>
        <button onClick={handleSubmit} style={{ padding: "10px 24px", border: "none", borderRadius: 9, background: "#1e40af", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="check" size={15} /> Post {type === "purchase" ? "Purchase" : "Sale"} Voucher
        </button>
      </div>
    </div>
  );
};

// ─── PAGES ───────────────────────────────────────────────────────────────────
const DashboardPage = ({ vouchers, products, accounts }) => {
  const totalSales = vouchers.filter(v => v.type === "sale").reduce((s, v) => s + v.total, 0);
  const totalPurchases = vouchers.filter(v => v.type === "purchase").reduce((s, v) => s + v.total, 0);
  const totalMargin = vouchers.filter(v => v.type === "sale").reduce((s, v) => s + (v.margin || 0), 0);
  const cash = accounts.find(a => a.id === "cash")?.balance || 0;
  const bank = accounts.find(a => a.id === "bank")?.balance || 0;
  const lowStock = products.filter(p => p.stock <= p.threshold);

  const chartData = [
    { month: "Jan", sales: 294000, purchases: 340000 },
    { month: "Feb", sales: 180000, purchases: 187500 },
    { month: "Mar", sales: 90000, purchases: 0 },
    { month: "Apr", sales: 0, purchases: 0 },
    { month: "May", sales: 0, purchases: 0 },
  ];

  const recentVouchers = [...vouchers].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Dashboard Overview</h1>
        <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>Financial snapshot for FY 2025</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Cash" value={cash} sub="Available in hand" accent="green" trend={12} />
        <StatCard label="Bank Balance" value={bank} sub="Main Account" accent="blue" trend={-3} />
        <StatCard label="Net Profit" value={totalMargin} sub="Margin on sales" accent="amber" trend={18} />
        <StatCard label="Stock Value" value={products.reduce((s, p) => s + p.stock * p.purchasePrice, 0)} sub={`${products.length} product lines`} accent="red" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, marginBottom: 20 }}>
        <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Sales vs Purchases</h3>
            <div style={{ display: "flex", gap: 14, fontSize: 12, fontWeight: 600 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, background: "#1e40af", borderRadius: 2, display: "inline-block" }} /> Sales</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, background: "#dc2626", borderRadius: 2, display: "inline-block" }} /> Purchases</span>
            </div>
          </div>
          <MiniBarChart data={chartData} height={180} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20 }}>
            <div style={{ background: "#eff6ff", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 700, marginBottom: 4 }}>TOTAL SALES</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#1e40af", fontFamily: "'DM Mono', monospace" }}>{fmtShort(totalSales)}</div>
            </div>
            <div style={{ background: "#fff1f2", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 11, color: "#f87171", fontWeight: 700, marginBottom: 4 }}>TOTAL PURCHASES</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#dc2626", fontFamily: "'DM Mono', monospace" }}>{fmtShort(totalPurchases)}</div>
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>⚠️ Low Stock Alerts</h3>
          {lowStock.length === 0 ? <div style={{ color: "#94a3b8", fontSize: 13 }}>All stock levels healthy</div> : lowStock.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{p.sku}</div>
              </div>
              <Badge color={p.stock === 0 ? "red" : "amber"}>{p.stock === 0 ? "Out of Stock" : `${p.stock} left`}</Badge>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 24 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Recent Transactions</h3>
        <DataTable searchable={false} columns={[
          { key: "id", label: "Voucher #" },
          { key: "date", label: "Date" },
          { key: "type", label: "Type", render: v => <Badge color={v === "sale" ? "green" : "blue"}>{v === "sale" ? "Sale" : "Purchase"}</Badge> },
          { key: "party", label: "Party" },
          { key: "paymentMode", label: "Mode", render: v => <Badge color="gray">{v.toUpperCase()}</Badge> },
          { key: "total", label: "Amount", align: "right", render: v => <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>{fmt(v)}</span> },
        ]} data={recentVouchers} />
      </div>
    </div>
  );
};

const VoucherPage = ({ type, vouchers, products, parties, accounts, onAdd }) => {
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

  useEffect(() => { }, [vouchers]);

  return (
    <div>
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

      <DataTable columns={[
        { key: "id", label: "Voucher #" },
        { key: "date", label: "Date" },
        { key: "party", label: type === "purchase" ? "Vendor" : "Client" },
        { key: "paymentMode", label: "Mode", render: v => <Badge color="gray">{v.toUpperCase()}</Badge> },
        { key: "items", label: "Items", render: v => `${v.length} line(s)`, sortable: false },
        { key: "total", label: "Total", align: "right", render: v => <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>{fmt(v)}</span> },
        ...(type === "sale" ? [{ key: "margin", label: "Margin", align: "right", render: v => <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#059669" }}>{fmt(v)}</span> }] : []),
        { key: "status", label: "Status", render: v => <Badge color="green">{v}</Badge> },
      ]} data={filtered} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title={`New ${type === "purchase" ? "Purchase" : "Sale"} Voucher`} width={720}>
        <TransactionForm type={type} products={products} parties={parties} accounts={accounts} onSubmit={handleSubmit} onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  );
};

const InventoryPage = ({ products }) => {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Inventory Manager</h1>
        <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>Track stock levels, prices, and valuation</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Products" value={products.length} sub="Active SKUs" accent="blue" />
        <StatCard label="Stock Value" value={products.reduce((s, p) => s + p.stock * p.purchasePrice, 0)} sub="At purchase cost" accent="green" />
        <StatCard label="Potential Revenue" value={products.reduce((s, p) => s + p.stock * p.salePrice, 0)} sub="At sale price" accent="amber" />
      </div>

      <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 24 }}>
        <DataTable columns={[
          { key: "sku", label: "SKU" },
          { key: "name", label: "Product Name" },
          { key: "purchasePrice", label: "Cost Price", align: "right", render: v => <span style={{ fontFamily: "monospace" }}>{fmt(v)}</span> },
          { key: "salePrice", label: "Sale Price", align: "right", render: v => <span style={{ fontFamily: "monospace" }}>{fmt(v)}</span> },
          {
            key: "margin", label: "Margin", align: "right", sortable: false,
            render: (_, row) => {
              const m = row.salePrice - row.purchasePrice;
              const pct = ((m / row.purchasePrice) * 100).toFixed(1);
              return <span style={{ fontFamily: "monospace", color: "#059669", fontWeight: 700 }}>{fmt(m)} ({pct}%)</span>;
            }
          },
          {
            key: "stock", label: "Stock", align: "center",
            render: (v, row) => (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ fontFamily: "monospace", fontWeight: 700, color: v === 0 ? "#dc2626" : v <= row.threshold ? "#d97706" : "#059669" }}>{v}</span>
                {v === 0 ? <Badge color="red">OOS</Badge> : v <= row.threshold ? <Badge color="amber">Low</Badge> : null}
              </div>
            )
          },
          {
            key: "value", label: "Stock Value", align: "right", sortable: false,
            render: (_, row) => <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#334155" }}>{fmt(row.stock * row.purchasePrice)}</span>
          },
        ]} data={products.map(p => ({ ...p, margin: p.salePrice - p.purchasePrice }))} />
      </div>
    </div>
  );
};

const LedgerPage = ({ vouchers, accounts }) => {
  const [activeAccount, setActiveAccount] = useState("bank");

  const acc = accounts.find(a => a.id === activeAccount);
  const accountName = acc?.name || "";

  const transactions = useMemo(() => {
    const entries = [];
    let running = activeAccount === "cash" ? 500000 : activeAccount === "bank" ? 1200000 : 0;
    const base = running;

    vouchers.forEach(v => {
      const matchCash = activeAccount === "cash" && v.paymentMode === "cash";
      const matchBank = activeAccount === "bank" && v.paymentMode === "bank";
      if (matchCash || matchBank) {
        const isDebit = v.type === "sale";
        const amt = v.total;
        if (isDebit) running += amt;
        else running -= amt;
        entries.push({ date: v.date, ref: v.id, party: v.party, type: v.type === "sale" ? "debit" : "credit", debit: v.type === "sale" ? amt : 0, credit: v.type === "purchase" ? amt : 0, balance: running, narration: v.type === "sale" ? "Sale receipt" : "Purchase payment" });
      }
    });
    return entries.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [vouchers, activeAccount]);

  const currentBalance = transactions.length ? transactions[transactions.length - 1].balance : (activeAccount === "cash" ? 500000 : 1200000);
  const totalDebits = transactions.reduce((s, t) => s + t.debit, 0);
  const totalCredits = transactions.reduce((s, t) => s + t.credit, 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Account Ledger</h1>
        <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>Running balance and transaction history</p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {accounts.filter(a => ["cash", "bank"].includes(a.id)).map(a => (
          <button key={a.id} onClick={() => setActiveAccount(a.id)} style={{ padding: "9px 18px", border: `2px solid ${activeAccount === a.id ? "#1e40af" : "#e2e8f0"}`, borderRadius: 9, background: activeAccount === a.id ? "#1e40af" : "#fff", color: activeAccount === a.id ? "#fff" : "#475569", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7, transition: "all 0.15s" }}>
            <Icon name={a.id === "bank" ? "bank" : "cash"} size={15} /> {a.name}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        <StatCard label="Total Debits (In)" value={totalDebits} accent="green" />
        <StatCard label="Total Credits (Out)" value={totalCredits} accent="red" />
        <StatCard label="Current Balance" value={currentBalance} accent="blue" />
      </div>

      <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>📒 {accountName} Ledger</h3>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#475569", fontFamily: "inherit" }}>
            <Icon name="download" size={14} /> Export Excel
          </button>
        </div>
        <DataTable columns={[
          { key: "date", label: "Date" },
          { key: "ref", label: "Ref #" },
          { key: "narration", label: "Narration" },
          { key: "party", label: "Party" },
          { key: "debit", label: "Debit (Dr)", align: "right", render: v => v ? <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#059669" }}>{fmt(v)}</span> : <span style={{ color: "#cbd5e1" }}>—</span> },
          { key: "credit", label: "Credit (Cr)", align: "right", render: v => v ? <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#dc2626" }}>{fmt(v)}</span> : <span style={{ color: "#cbd5e1" }}>—</span> },
          { key: "balance", label: "Balance", align: "right", render: v => <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#0f172a" }}>{fmt(v)}</span> },
        ]} data={transactions} />
      </div>
    </div>
  );
};

const ReportsPage = ({ vouchers, products, accounts }) => {
  const [dateFrom, setDateFrom] = useState("2025-01-01");
  const [dateTo, setDateTo] = useState("2025-12-31");

  const filtered = useMemo(() => vouchers.filter(v => v.date >= dateFrom && v.date <= dateTo), [vouchers, dateFrom, dateTo]);
  const sales = filtered.filter(v => v.type === "sale");
  const purchases = filtered.filter(v => v.type === "purchase");
  const revenue = sales.reduce((s, v) => s + v.total, 0);
  const cogs = purchases.reduce((s, v) => s + v.total, 0);
  const grossProfit = sales.reduce((s, v) => s + (v.margin || 0), 0);
  const expenses = accounts.find(a => a.id === "expenses")?.balance || 15000;
  const netProfit = grossProfit - expenses;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Profit & Loss Report</h1>
        <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>Financial performance summary</p>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "14px 18px" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Period:</span>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
        <span style={{ color: "#94a3b8" }}>to</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#1e40af", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            <Icon name="download" size={14} /> PDF
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#059669", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            <Icon name="download" size={14} /> Excel
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ background: "#0f172a", padding: "14px 20px" }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}>Income Statement</h3>
          </div>
          <div style={{ padding: 20 }}>
            {[
              { label: "Sales Revenue", value: revenue, indent: 0, bold: false, color: "#059669" },
              { label: "Cost of Goods Sold", value: -cogs, indent: 0, bold: false, color: "#dc2626" },
              { label: "Gross Profit", value: grossProfit, indent: 0, bold: true, border: true },
              { label: "Operating Expenses", value: -expenses, indent: 1, bold: false, color: "#d97706" },
              { label: "Net Profit / (Loss)", value: netProfit, indent: 0, bold: true, highlight: true },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: `${row.indent ? 8 : 12}px ${row.indent ? 28 : 0}px`, borderTop: row.border ? "2px solid #e2e8f0" : "none", borderBottom: row.highlight ? "3px double #0f172a" : "none", marginTop: row.border ? 8 : 0, background: row.highlight ? "#f8fafc" : "transparent", borderRadius: row.highlight ? 8 : 0 }}>
                <span style={{ fontSize: row.bold ? 14 : 13, fontWeight: row.bold ? 800 : 500, color: row.highlight ? "#0f172a" : "#334155" }}>{row.label}</span>
                <span style={{ fontFamily: "monospace", fontWeight: row.bold ? 800 : 600, fontSize: row.bold ? 15 : 13, color: row.color || (row.value >= 0 ? "#059669" : "#dc2626") }}>
                  {row.value < 0 ? `(${fmt(Math.abs(row.value))})` : fmt(row.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: netProfit >= 0 ? "#f0fdf4" : "#fef2f2", border: `2px solid ${netProfit >= 0 ? "#bbf7d0" : "#fecaca"}`, borderRadius: 14, padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: netProfit >= 0 ? "#059669" : "#dc2626", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>Net Profit / (Loss)</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: netProfit >= 0 ? "#059669" : "#dc2626", fontFamily: "'DM Mono', monospace" }}>{fmtShort(Math.abs(netProfit))}</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>Profit margin: {revenue ? ((netProfit / revenue) * 100).toFixed(1) : 0}%</div>
          </div>
          <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 20 }}>
            <h4 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Transaction Summary</h4>
            {[
              { label: "Sale Vouchers", value: sales.length, unit: "vouchers" },
              { label: "Purchase Vouchers", value: purchases.length, unit: "vouchers" },
              { label: "Avg Sale Value", value: fmt(sales.length ? revenue / sales.length : 0), unit: "" },
              { label: "Total Transactions", value: filtered.length, unit: "" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 3 ? "1px solid #f1f5f9" : "none" }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>{r.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", fontFamily: r.unit ? "inherit" : "monospace" }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 24 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Detailed Transaction Ledger</h3>
        <DataTable columns={[
          { key: "id", label: "Ref #" },
          { key: "date", label: "Date" },
          { key: "type", label: "Type", render: v => <Badge color={v === "sale" ? "green" : "blue"}>{v}</Badge> },
          { key: "party", label: "Party" },
          { key: "total", label: "Amount", align: "right", render: v => <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(v)}</span> },
          { key: "margin", label: "Margin", align: "right", render: (v, row) => row.type === "sale" ? <span style={{ fontFamily: "monospace", color: "#059669", fontWeight: 700 }}>{fmt(v)}</span> : <span style={{ color: "#cbd5e1" }}>—</span> },
        ]} data={filtered} />
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [vouchers, setVouchers] = useState(INITIAL_VOUCHERS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const createDoubleEntry = useCallback((voucherData) => {
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
      ? [{ account: "Inventory Asset", type: "debit", amount: total }, { account: paymentMode === "cash" ? "Cash" : "Bank", type: "credit", amount: total }]
      : [{ account: paymentMode === "cash" ? "Cash" : "Bank", type: "debit", amount: total }, { account: "Sales Revenue", type: "credit", amount: total }];

    const newVoucher = { id, type, date, party, paymentMode, total, status: "posted", items: vItems, entries, ...(type === "sale" ? { margin } : {}) };

    setVouchers(prev => [...prev, newVoucher]);
    setProducts(updatedProducts);
    setAccounts(updatedAccounts);
    
  }, [products, accounts]);

  const nav = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "purchase", label: "Purchase Vouchers", icon: "purchase" },
    { id: "sale", label: "Sales Vouchers", icon: "sale" },
    { id: "inventory", label: "Inventory", icon: "inventory" },
    { id: "ledger", label: "Bank Ledger", icon: "bank" },
    { id: "reports", label: "P&L Reports", icon: "reports" },
  ];

  const cash = accounts.find(a => a.id === "cash")?.balance || 0;
  const bank = accounts.find(a => a.id === "bank")?.balance || 0;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Sora', 'Segoe UI', sans-serif", background: "#f1f5f9", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        select, input { font-family: inherit; }
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width: sidebarOpen ? 240 : 64, background: "#0f172a", display: "flex", flexDirection: "column", flexShrink: 0, transition: "width 0.25s ease", overflow: "hidden" }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 12, minHeight: 70 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #3b82f6, #1e40af)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="ledger" size={18} />
          </div>
          {sidebarOpen && <div><div style={{ color: "#fff", fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>AccuBooks</div><div style={{ color: "#64748b", fontSize: 11, fontWeight: 500 }}>ERP v2.0</div></div>}
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
        {page === "dashboard" && <DashboardPage vouchers={vouchers} products={products} accounts={accounts} />}
        {page === "purchase" && <VoucherPage type="purchase" vouchers={vouchers} products={products} parties={INITIAL_PARTIES} accounts={accounts} onAdd={createDoubleEntry} />}
        {page === "sale" && <VoucherPage type="sale" vouchers={vouchers} products={products} parties={INITIAL_PARTIES} accounts={accounts} onAdd={createDoubleEntry} />}
        {page === "inventory" && <InventoryPage products={products} />}
        {page === "ledger" && <LedgerPage vouchers={vouchers} accounts={accounts} />}
        {page === "reports" && <ReportsPage vouchers={vouchers} products={products} accounts={accounts} />}
      </div>
    </div>
  );
}
