import React from "react";
export const Badge = ({ children, color = "blue" }) => {
    const colors = {
        navy: ["rgba(10, 30, 60, 0.1)", "#0A1E3C"],
        gold: ["rgba(197, 160, 89, 0.12)", "#A68045"],
        blue: ["rgba(37, 99, 235, 0.1)", "#1d4ed8"],
        green: ["rgba(16, 185, 129, 0.1)", "#047857"],
        red: ["rgba(239, 68, 68, 0.1)", "#b91c1c"],
        amber: ["rgba(197, 160, 89, 0.1)", "#A68045"],
        gray: ["#f1f5f9", "#475569"]
    };
    const [bg, text] = colors[color] || colors.blue;
    return <span style={{ display: "inline-flex", alignItems: "center", background: bg, color: text, borderRadius: 100, padding: "2px 12px", fontSize: 10, fontWeight: 800, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{children}</span>;
};
