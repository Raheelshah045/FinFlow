import React from "react";
import { Icon } from "./Icon";
import { fmtShort, fmtNumShort } from "../utils/formatters";

export const StatCard = ({ label, value, sub, trend, accent, isCurrency = true, onUpdate }) => {
    const [editing, setEditing] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(value);

    const accents = {
        navy: { bg: "rgba(10, 30, 60, 0.05)", border: "rgba(10, 30, 60, 0.1)", icon: "#0A1E3C" },
        gold: { bg: "rgba(197, 160, 89, 0.08)", border: "rgba(197, 160, 89, 0.15)", icon: "#C5A059" },
        blue: { bg: "rgba(37, 99, 235, 0.05)", border: "rgba(37, 99, 235, 0.1)", icon: "#2563eb" },
        green: { bg: "rgba(16, 185, 129, 0.05)", border: "rgba(16, 185, 129, 0.1)", icon: "#10b981" },
        amber: { bg: "rgba(197, 160, 89, 0.05)", border: "rgba(197, 160, 89, 0.1)", icon: "#C5A059" },
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
