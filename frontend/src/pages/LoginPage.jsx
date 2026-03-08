import React, { useState } from "react";
import { Icon } from "../components/Icon";

export const LoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate login verification
        setTimeout(() => {
            setLoading(false);
            onLogin(email, password);
        }, 1200);
    };

    return (
        <div style={{
            height: "100vh",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "radial-gradient(circle at top right, #064e3b, transparent), radial-gradient(circle at bottom left, #1e3a8a, transparent), #0f172a",
            position: "relative",
            overflow: "hidden",
            fontFamily: "'Sora', sans-serif"
        }}>
            <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                background: "url('https://www.transparenttextures.com/patterns/cubes.png')",
                opacity: 0.05,
                pointerEvents: "none"
            }} />

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .auth-card {
                    animation: slideIn 0.6s ease-out;
                    backdrop-filter: blur(20px) saturate(160%);
                    background-color: rgba(15, 23, 42, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 28px;
                    padding: 48px;
                    width: 100%;
                    max-width: 440px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
                    z-index: 1;
                }
                .input-group {
                    margin-bottom: 24px;
                    position: relative;
                }
                .input-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    color: #94a3b8;
                    margin-bottom: 8px;
                    letter-spacing: 0.02em;
                }
                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .input-icon {
                    position: absolute;
                    left: 16px;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    top: 50%;
                    transform: translateY(-50%);
                    pointer-events: none;
                }
                .auth-input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 14px;
                    padding: 14px 16px 14px 48px;
                    color: #fff;
                    font-size: 15px;
                    transition: all 0.2s;
                    outline: none;
                }
                .auth-input:focus {
                    border-color: #3b82f6;
                    background: rgba(255, 255, 255, 0.06);
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }
                .password-toggle {
                    position: absolute;
                    right: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #64748b;
                    cursor: pointer;
                    background: none;
                    border: none;
                    display: flex;
                    align-items: center;
                    padding: 0;
                    z-index: 10;
                }
                .password-toggle:hover {
                    color: #94a3b8;
                }
                .auth-button {
                    width: 100%;
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white;
                    border: none;
                    border-radius: 14px;
                    padding: 14px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 32px;
                    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
                }
                .auth-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.4);
                    filter: brightness(1.1);
                }
                .auth-button:active {
                    transform: translateY(0);
                }
                .auth-footer {
                    text-align: center;
                    margin-top: 32px;
                    font-size: 14px;
                    color: #94a3b8;
                }
                .auth-link {
                    color: #60a5fa;
                    text-decoration: none;
                    font-weight: 600;
                    cursor: pointer;
                    transition: color 0.2s;
                    margin-left: 6px;
                }
                .auth-link:hover {
                    color: #93c5fd;
                }
                .logo-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 40px;
                }
                .logo-circle {
                    width: 72px;
                    height: 72px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
            `}</style>

            <div className="auth-card">
                <div className="logo-container">
                    <div className="logo-circle">
                        <img src="/logo.png" alt="Logo" style={{ width: "40px", height: "40px", objectFit: "contain" }} />
                    </div>
                    <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>Welcome Back</h1>
                    <p style={{ color: "#64748b", fontSize: "14px", marginTop: "8px" }}>Sign in to continue to Balancify</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <span className="input-icon"><Icon name="mail" size={20} /></span>
                            <input
                                type="email"
                                className="auth-input"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
