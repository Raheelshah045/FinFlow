import React from "react";
export const Badge = ({ children, color = "blue" }) => {
    const colors = {
        navy: ["rgba(26, 77, 46, 0.1)", "#1a4d2e"],
        gold: ["rgba(132, 204, 22, 0.12)", "#65a30d"],
        blue: ["rgba(34, 197, 94, 0.1)", "#15803d"],
        green: ["rgba(20, 184, 166, 0.1)", "#0d9488"],
        red: ["rgba(239, 68, 68, 0.1)", "#b91c1c"],
        amber: ["rgba(132, 204, 22, 0.1)", "#4d7c0f"],
        gray: ["#f1f5f9", "#475569"]
    };
    const [bg, text] = colors[color] || colors.blue;
    return <span style={{ display: "inline-flex", alignItems: "center", background: bg, color: text, borderRadius: 100, padding: "2px 12px", fontSize: 10, fontWeight: 800, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{children}</span>;
};
