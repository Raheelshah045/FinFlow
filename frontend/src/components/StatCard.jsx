import React from "react";
import { Icon } from "./Icon";
import { fmtShort, fmtNumShort } from "../utils/formatters";

export const StatCard = ({ label, value, sub, trend, accent, isCurrency = true, onUpdate }) => {
    const [editing, setEditing] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(value);

    const accents = {
        navy: { bg: "rgba(26, 77, 46, 0.05)", border: "rgba(26, 77, 46, 0.1)", icon: "#1a4d2e" },
        gold: { bg: "rgba(132, 204, 22, 0.08)", border: "rgba(132, 204, 22, 0.15)", icon: "#84cc16" },
        blue: { bg: "rgba(34, 197, 94, 0.05)", border: "rgba(34, 197, 94, 0.1)", icon: "#22c55e" },
        green: { bg: "rgba(20, 184, 166, 0.05)", border: "rgba(20, 184, 166, 0.1)", icon: "#14b8a6" },
        amber: { bg: "rgba(132, 204, 22, 0.05)", border: "rgba(132, 204, 22, 0.1)", icon: "#84cc16" },
        red: { bg: "rgba(239, 68, 68, 0.05)", border: "rgba(239, 68, 68, 0.1)", icon: "#ef4444" },
    };
    const c = accents[accent] || accents.blue;

    const handleSave = () => {
        onUpdate(Number(inputValue));
        setEditing(false);
    };

    return (
        <div style={{ background: "var(--bg-card)", border: `1px solid var(--border)`, borderRadius: "var(--radius-lg)", padding: "24px", position: "relative", overflow: "hidden", boxShadow: "var(--shadow)", transition: "all 0.3s ease" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: c.bg, borderRadius: "0 0 0 100%" }} />

            {onUpdate && (
                <button
                    onClick={() => setEditing(!editing)}
                    style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", zIndex: 5, padding: 4, transition: "color 0.2s" }}
                    title="Edit Balance"
                    onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                >
                    <Icon name={editing ? "close" : "edit"} size={14} />
                </button>
            )}

            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>{label}</div>

            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-main)", lineHeight: 1.1, marginBottom: 6, position: "relative", zIndex: 1, fontFamily: "'Sora', sans-serif" }}>
                {editing ? (
                    <div style={{ display: "flex", gap: 8 }}>
                        <input
                            type="number"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            style={{ width: "100%", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "6px 10px", fontSize: 16, outline: "none", background: "var(--bg-main)", color: "var(--text-main)" }}
                            autoFocus
                        />
                        <button onClick={handleSave} style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, padding: "0 12px", cursor: "pointer", transition: "filter 0.2s" }} onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"} onMouseLeave={e => e.currentTarget.style.filter = "none"}>
                            <Icon name="check" size={14} />
                        </button>
                    </div>
                ) : (
                    isCurrency ? fmtShort(value) : fmtNumShort(value)
                )}
            </div>
            {sub && <div style={{ fontSize: 12, color: "var(--text-muted)", position: "relative", zIndex: 1 }}>{sub}</div>}
            {trend !== undefined && !editing && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12, background: trend >= 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", color: trend >= 0 ? "#059669" : "#dc2626", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, position: "relative", zIndex: 1 }}>
                    <Icon name={trend >= 0 ? "trend_up" : "trend_down"} size={12} />
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
    );
};
