import React, { useState } from "react";
import { Icon } from "../components/Icon";

export const LoginPage = ({ onLogin }) => {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate login verification
        setTimeout(() => {
            setLoading(false);
            onLogin(identifier, password);
        }, 1200);
    };

    return (
        <div style={{
            height: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            background: "radial-gradient(circle at top right, #1e293b, #0f172a)",
            position: "relative", overflow: "hidden", fontFamily: "'Sora', sans-serif"
        }}>
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                background: "url('https://www.transparenttextures.com/patterns/cubes.png')",
                opacity: 0.03, pointerEvents: "none"
            }} />

            <style>{`
                @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .auth-card {
                    animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                    backdrop-filter: blur(20px);
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 28px;
                    padding: 56px 48px;
                    width: 100%;
                    max-width: 440px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    z-index: 1;
                }
                .logo-container { display: flex; flex-direction: column; align-items: center; margin-bottom: 48px; }
                .logo-circle {
                    width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6, #2563eb);
                    border-radius: 22px; display: flex; align-items: center; justifyContent: center;
                    margin-bottom: 24px; box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
                }
                .auth-title { color: #fff; fontSize: 32px; fontWeight: 800; letterSpacing: "-0.03em"; margin: 0; }
                .auth-subtitle { color: #64748b; fontSize: 15px; marginTop: 8px; fontWeight: 500; }
                .input-group { margin-bottom: 24px; position: relative; }
                .input-group label { display: block; font-size: 13px; font-weight: 600; color: #94a3b8; margin-bottom: 10px; letter-spacing: 0.02em; }
                .input-wrapper { position: relative; display: flex; align-items: center; }
                .input-icon { position: absolute; left: 16px; color: #475569; display: flex; align-items: center; top: 50%; transform: translateY(-50%); transition: color 0.3s; }
                .auth-input {
                    width: 100%; background: rgba(255, 255, 255, 0.03); border: 1.5px solid rgba(255, 255, 255, 0.08);
                    border-radius: 14px; padding: 14px 16px 14px 48px; color: #fff; font-size: 15px;
                    transition: all 0.3s; outline: none;
                }
                .auth-input:focus { border-color: #3b82f6; background: rgba(255, 255, 255, 0.06); box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
                .auth-input:focus + .input-icon { color: #3b82f6; }
                .password-toggle {
                    position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
                    color: #475569; cursor: pointer; background: none; border: none; padding: 0; z-index: 10; transition: color 0.2s;
                }
                .password-toggle:hover { color: #94a3b8; }
                .auth-button {
                    width: 100%; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white; border: none; border-radius: 14px; padding: 16px; fontSize: 16px; fontWeight: 700;
                    cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; alignItems: center;
                    justifyContent: center; gap: 12px; margin-top: 32px; box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
                }
                .auth-button:hover { transform: translateY(-2px); box-shadow: 0 20px 30px rgba(37, 99, 235, 0.3); filter: brightness(1.1); }
                .auth-button:active { transform: translateY(0); }
                .auth-button:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
                .auth-footer { text-align: center; margin-top: 40px; font-size: 14px; color: #475569; fontWeight: 500; }
                .auth-link { color: #3b82f6; text-decoration: none; font-weight: 700; cursor: pointer; transition: color 0.2s; margin-left: 6px; }
                .auth-link:hover { color: #60a5fa; text-decoration: underline; }
            `}</style>

            <div className="auth-card">
                <div className="logo-container">
                    <div className="logo-circle">
                        <img src="/logo.png" alt="Logo" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
                    </div>
                    <h1 className="auth-title">Balancify ERP</h1>
                    <p className="auth-subtitle">Professional Enterprise Management</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email or Username</label>
                        <div className="input-wrapper">
                            <span className="input-icon"><Icon name="mail" size={20} /></span>
                            <input
                                type="text"
                                className="auth-input"
                                placeholder="Email or Username"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon"><Icon name="lock" size={20} /></span>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="auth-input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <Icon name={showPassword ? "eye" : "eye_off"} size={20} />
                            </button>
                        </div>
                        <div style={{ textAlign: "right", marginTop: "8px" }}>
                            <span className="auth-link" style={{ fontSize: "13px" }}>Contact Administrator</span>
                        </div>
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? "Verifying..." : (
                            <>
                                Sign In
                                <Icon name="arrow_right" size={20} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
