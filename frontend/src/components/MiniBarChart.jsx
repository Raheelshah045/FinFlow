import React from "react";
import { fmt } from "../utils/formatters";

export const MiniBarChart = ({ data, height = 160 }) => {
    const max = Math.max(...data.map(d => Math.max(d.sales, d.purchases)));
    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height, padding: "0 4px" }}>
            {data.map((d, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, height: "100%" }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 3, width: "100%" }}>
                        <div style={{ flex: 1, background: "linear-gradient(180deg, #84cc16, #4d7c0f)", borderRadius: "4px 4px 0 0", height: `${(d.sales / max) * 100}%`, minHeight: 4, transition: "height 0.6s ease" }} title={`Revenue: ${fmt(d.sales)}`} />
                        <div style={{ flex: 1, background: "linear-gradient(180deg, #dc2626, #991b1b)", borderRadius: "4px 4px 0 0", height: `${(d.purchases / max) * 100}%`, minHeight: 4, transition: "height 0.6s ease" }} title={`Outflow: ${fmt(d.purchases)}`} />
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.02em" }}>{d.month.toUpperCase()}</div>
                </div>
            ))}
        </div>
    );
};
