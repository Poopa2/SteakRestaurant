import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../auth";

export default function RegisterPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setIsSubmitting(true);
    try {
      await register(username.trim(), password);
      nav("/login"); // สมัครเสร็จไปหน้า Login
    } catch (e: any) {
      setErr(e?.message || "สมัครไม่สำเร็จ");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes slideIn {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 20px rgba(245, 215, 66, 0.1); }
          50% { box-shadow: 0 12px 32px rgba(0,0,0,0.6), 0 0 30px rgba(245, 215, 66, 0.2); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.1) rotate(180deg); opacity: 0.8; }
        }
        .register-form-container {
          animation: slideIn 0.6s ease-out, glow 4s ease-in-out infinite;
        }
        .register-input-field {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(34, 34, 34, 0.8);
          backdrop-filter: blur(10px);
          color: #fff;
        }
        .register-input-field:focus {
          outline: none;
          border: 1px solid #f5d742 !important;
          box-shadow: 0 0 0 3px rgba(245, 215, 66, 0.2), 0 0 15px rgba(245, 215, 66, 0.3);
          background: rgba(34, 34, 34, 0.95);
          transform: translateY(-1px);
        }
        .register-input-field:hover:not(:focus) {
          border-color: rgba(245, 215, 66, 0.5);
        }
        .register-input-field::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        .register-submit-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .register-submit-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        .register-submit-btn:hover:not(:disabled)::before {
          left: 100%;
        }
        .register-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(245, 215, 66, 0.4);
        }
        .register-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .register-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .register-loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(17, 17, 17, 0.3);
          border-radius: 50%;
          border-top-color: #111;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .register-link-style {
          color: #f5d742;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          padding: 2px 0;
        }
        .register-link-style::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: 0;
          left: 50%;
          background: linear-gradient(45deg, #f5d742, #fff);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .register-link-style:hover {
          color: #fff;
          text-shadow: 0 0 15px rgba(245, 215, 66, 0.6);
        }
        .register-link-style:hover::after {
          width: 100%;
          left: 0;
        }
        .register-error-message {
          animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .register-title {
          background: linear-gradient(135deg, #f5d742 0%, #fff 50%, #f5d742 100%);
          background-size: 200% 200%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s ease-in-out infinite;
          text-shadow: 0 0 30px rgba(245, 215, 66, 0.3);
        }
        .register-floating-particles {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(245, 215, 66, 0.3);
          border-radius: 50%;
          animation: float-particles 8s linear infinite;
        }
        @keyframes float-particles {
          0% {
            transform: translateY(100vh) translateX(0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-10vh) translateX(-100px) scale(1);
            opacity: 0;
          }
        }
        .register-sparkle {
          position: absolute;
          color: rgba(245, 215, 66, 0.6);
          animation: sparkle 2s ease-in-out infinite;
          pointer-events: none;
        }
        .register-welcome-badge {
          background: linear-gradient(45deg, rgba(245, 215, 66, 0.1), rgba(245, 215, 66, 0.2));
          border: 1px solid rgba(245, 215, 66, 0.3);
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 0.85rem;
          color: rgba(245, 215, 66, 0.8);
          text-align: center;
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
        }
      `}</style>

      <div style={{ 
        minHeight: "100vh", 
        background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 30%, #2d1810 70%, #0c0c0c 100%)",
        color: "#f5d742", 
        display: "grid", 
        placeItems: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Background Animation Elements */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 80% 50%, rgba(245, 215, 66, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 20% 20%, rgba(245, 215, 66, 0.08) 0%, transparent 60%),
            radial-gradient(circle at 60% 80%, rgba(245, 215, 66, 0.12) 0%, transparent 60%)
          `,
          animation: "float 8s ease-in-out infinite reverse"
        }} />
        
        {/* Floating Particles */}
        {Array.from({length: 8}).map((_, i) => (
          <div
            key={i}
            className="register-floating-particles"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${7 + Math.random() * 4}s`
            }}
          />
        ))}

        {/* Sparkle Elements */}
        {Array.from({length: 4}).map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="register-sparkle"
            style={{
              position: 'absolute',
              top: `${20 + Math.random() * 60}%`,
              right: `${10 + Math.random() * 20}%`,
              animationDelay: `${i * 0.7}s`,
              fontSize: `${12 + Math.random() * 8}px`
            }}
          >
            ✨
          </div>
        ))}

        <form onSubmit={onSubmit} className="register-form-container" style={{ 
          background: "rgba(34, 34, 34, 0.95)", 
          padding: 32, 
          borderRadius: 16, 
          width: 380, 
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(245, 215, 66, 0.2)"
        }}>
          <div className="register-welcome-badge">
            🎉 ยินดีต้อนรับสู่ครอบครัวใหม่! 
          </div>

          <h2 className="register-title" style={{ 
            marginTop: 0, 
            fontSize: "2.2rem", 
            textAlign: "center",
            marginBottom: 28,
            fontWeight: 700
          }}>
            สมัคร
          </h2>
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: "block", 
              marginBottom: 8, 
              fontWeight: 600,
              fontSize: "0.95rem",
              color: "rgba(245, 215, 66, 0.9)"
            }}>
              <span style={{ marginRight: 8 }}>👤</span>
              ชื่อผู้ใช้
            </label>
            <input 
              className="register-input-field"
              value={username} 
              onChange={e=>setUsername(e.target.value)} 
              required
              style={{ 
                width: "100%", 
                padding: 12, 
                borderRadius: 10, 
                border: "1px solid rgba(68, 68, 68, 0.5)", 
                fontSize: "1rem",
                boxSizing: "border-box"
              }}
              placeholder="เลือกชื่อผู้ใช้ที่เจ๋ง ๆ"
            />
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: "block", 
              marginBottom: 8, 
              fontWeight: 600,
              fontSize: "0.95rem",
              color: "rgba(245, 215, 66, 0.9)"
            }}>
              <span style={{ marginRight: 8 }}>🔒</span>
              รหัสผ่าน
            </label>
            <input 
              className="register-input-field"
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              required
              style={{ 
                width: "100%", 
                padding: 12, 
                borderRadius: 10, 
                border: "1px solid rgba(68, 68, 68, 0.5)", 
                fontSize: "1rem",
                boxSizing: "border-box"
              }}
              placeholder="สร้างรหัสผ่านที่แข็งแกร่ง"
            />
          </div>
          
          {err && (
            <div className="register-error-message" style={{ 
              color: "#ff6b6b", 
              marginBottom: 20,
              padding: 12,
              borderRadius: 8,
              background: "rgba(255, 107, 107, 0.15)",
              border: "1px solid rgba(255, 107, 107, 0.3)",
              display: "flex",
              alignItems: "center"
            }}>
              <span style={{ marginRight: 8 }}>⚠️</span>
              {err}
            </div>
          )}
          
          <button 
            className="register-submit-btn"
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              width: "100%", 
              padding: 14, 
              borderRadius: 12, 
              border: "none", 
              background: "linear-gradient(45deg, #f5d742, #d4b942)", 
              color: "#111", 
              fontWeight: 700,
              fontSize: "1.1rem",
              cursor: isSubmitting ? "not-allowed" : "pointer"
            }}
          >
            {isSubmitting ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="register-loading-spinner"></span>
                <span style={{ marginLeft: 10 }}>กำลังสมัครสมาชิก...</span>
              </div>
            ) : (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ marginRight: 8 }}>🚀</span>
                เข้าสู่ระบบ
              </span>
            )}
          </button>
          
          <div style={{ 
            marginTop: 20, 
            textAlign: "center",
            fontSize: "0.95rem",
            color: "rgba(245, 215, 66, 0.8)"
          }}>
            มีบัญชีแล้ว? {" "}
            <Link className="register-link-style" to="/login">
              เข้าสู่ระบบ
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}