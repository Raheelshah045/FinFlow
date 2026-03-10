import React, { useState, useMemo } from "react";
import { Icon } from "./Icon";

export const DataTable = ({ columns, data, searchable = true }) => {
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
                <div style={{ position: "relative", marginBottom: 20 }}>
                    <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}><Icon name="search" size={16} /></span>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search records..."
                        style={{ width: "100%", padding: "12px 14px 12px 42px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontSize: 13, outline: "none", background: "var(--bg-main)", color: "var(--text-main)", boxSizing: "border-box", transition: "all 0.2s" }}
                        onFocus={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 4px var(--primary-soft)"; }}
                        onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                </div>
            )}
            <div style={{ overflowX: "auto", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                        <tr style={{ background: "var(--bg-main)", borderBottom: "1px solid var(--border)" }}>
                            {columns.map(col => (
                                <th key={col.key} onClick={() => col.sortable !== false && toggleSort(col.key)} style={{ padding: "14px 16px", textAlign: col.align || "left", color: "var(--text-muted)", fontWeight: 700, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", cursor: col.sortable !== false ? "pointer" : "default", whiteSpace: "nowrap", userSelect: "none" }}>
                                    {col.label}{sortCol === col.key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={columns.length} style={{ padding: 60, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No match found for this criteria</td></tr>
                        ) : filtered.map((row, i) => (
                            <tr key={i} style={{ borderBottom: i === filtered.length - 1 ? "none" : "1px solid var(--border)", transition: "background 0.2s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "var(--primary-soft)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                {columns.map(col => (
                                    <td key={col.key} style={{ padding: "14px 16px", textAlign: col.align || "left", color: "var(--text-main)", whiteSpace: "nowrap" }}>
                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginTop: 12, textAlign: "right", letterSpacing: "0.02em" }}>SHOWING {filtered.length} ARCHIVED DATA POINTS</div>
        </div>
    );
};
