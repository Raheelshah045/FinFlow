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
            background: "radial-gradient(circle at center, #142850, #0A1E3C)",
            position: "relative", overflow: "hidden", fontFamily: "'Sora', sans-serif"
        }}>
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                background: "url('https://www.transparenttextures.com/patterns/cubes.png')",
                opacity: 0.04, pointerEvents: "none"
            }} />

            <style>{`
                @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .auth-card {
                    animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                    backdrop-filter: blur(30px);
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 32px;
                    padding: 64px 48px;
                    width: 100%;
                    max-width: 460px;
                    box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.6);
                    z-index: 1;
                }
                .logo-container { display: flex; flex-direction: column; align-items: center; margin-bottom: 40px; }
                .logo-box {
                    width: 90px; height: 90px; background: #ffffff;
                    border-radius: 20px; display: flex; align-items: center; justifyContent: center;
                    margin-bottom: 24px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    padding: 12px;
                }
                .auth-title { color: #fff; fontSize: 34px; fontWeight: 800; letterSpacing: "-0.04em"; margin: 0; }
                .auth-subtitle { color: #94a3b8; fontSize: 14px; marginTop: 8px; fontWeight: 600; letterSpacing: "0.02em"; textTransform: uppercase; }
                .input-group { margin-bottom: 24px; position: relative; }
                .input-group label { display: block; font-size: 11px; font-weight: 800; color: #94a3b8; margin-bottom: 10px; letter-spacing: 0.08em; text-transform: uppercase; }
                .input-wrapper { position: relative; display: flex; align-items: center; }
                .input-icon { position: absolute; left: 18px; color: #475569; display: flex; align-items: center; top: 50%; transform: translateY(-50%); transition: color 0.3s; }
                .auth-input {
                    width: 100%; background: rgba(255, 255, 255, 0.04); border: 1.5px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px; padding: 16px 16px 16px 52px; color: #fff; font-size: 15px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); outline: none;
                }
                .auth-input:focus { border-color: #C5A059; background: rgba(255, 255, 255, 0.08); box-shadow: 0 0 0 4px rgba(197, 160, 89, 0.15); }
                .auth-input:focus + .input-icon { color: #C5A059; }
                .password-toggle {
                    position: absolute; right: 18px; top: 50%; transform: translateY(-50%);
                    color: #475569; cursor: pointer; background: none; border: none; padding: 0; z-index: 10; transition: color 0.2s;
                }
                .password-toggle:hover { color: #C5A059; }
                .auth-button {
                    width: 100%; background: linear-gradient(135deg, #C5A059 0%, #A68045 100%);
                    color: #0A1E3C; border: none; border-radius: 16px; padding: 18px; fontSize: 16px; fontWeight: 800;
                    cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; alignItems: center;
                    justifyContent: center; gap: 12px; margin-top: 32px; box-shadow: 0 10px 20px rgba(166, 128, 69, 0.2);
                    text-transform: uppercase; letter-spacing: 0.05em;
                }
                .auth-button:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(166, 128, 69, 0.4); filter: brightness(1.1); }
                .auth-button:active { transform: translateY(0); }
                .auth-button:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
                .auth-footer { text-align: center; margin-top: 40px; font-size: 14px; color: #64748b; fontWeight: 600; }
                .auth-link { color: #C5A059; text-decoration: none; font-weight: 800; cursor: pointer; transition: color 0.2s; }
                .auth-link:hover { color: #dfbc7a; text-decoration: underline; }
            `}</style>

            <div className="auth-card">
                <div className="logo-container">
                    <div className="logo-box">
                        <img src="/logo.png" alt="Logo" style={{ width: "64px", height: "64px", objectFit: "contain" }} />
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
