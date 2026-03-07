import React from "react";
import { Icon } from "./Icon";
import { fmtShort, fmtNumShort } from "../utils/formatters";

export const StatCard = ({ label, value, sub, trend, accent, isCurrency = true }) => {
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
            <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>
                {isCurrency ? fmtShort(value) : fmtNumShort(value)}
            </div>
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
