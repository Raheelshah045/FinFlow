import React from "react";
import { Icon } from "./Icon";

export const Modal = ({ open, onClose, title, children, width = 680 }) => {
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
