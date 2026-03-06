import React from "react";
export const Badge = ({ children, color = "blue" }) => {
    const colors = { blue: ["#dbeafe", "#1e40af"], green: ["#d1fae5", "#065f46"], red: ["#fee2e2", "#991b1b"], amber: ["#fef3c7", "#92400e"], gray: ["#f1f5f9", "#475569"] };
    const [bg, text] = colors[color] || colors.blue;
    return <span style={{ display: "inline-block", background: bg, color: text, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>{children}</span>;
};
