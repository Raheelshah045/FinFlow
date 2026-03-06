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
