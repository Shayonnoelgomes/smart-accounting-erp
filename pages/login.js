import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const B = {
  bg:          "#F8FAFC",
  white:       "#FFFFFF",
  blue:        "#2563EB",
  blueDk:      "#1E40AF",
  blueLt:      "#EFF6FF",
  blue100:     "#DBEAFE",
  text:        "#1E293B",
  textMid:     "#64748B",
  textLt:      "#94A3B8",
  border:      "#E2E8F0",
  success:     "#10B981",
  errorBg:     "#FEF2F2",
  errorBorder: "#FCA5A5",
  errorText:   "#DC2626",
};
const sans = "'DM Sans','Segoe UI',system-ui,sans-serif";
const mono = "'IBM Plex Mono','Fira Code',monospace";
const API  = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function Login() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      router.replace("/");
    }
  }, []);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setError(""); setLoading(true);
    try {
      const res  = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid email or password."); setLoading(false); return; }
      localStorage.setItem("token",        data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user",         JSON.stringify(data.user));
      localStorage.setItem("company",      JSON.stringify(data.company));
      router.push("/");
    } catch {
      setError("Cannot reach server. Check your connection.");
      setLoading(false);
    }
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:sans }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        display:"flex", flexDirection:"column", justifyContent:"space-between",
        width:"45%", minHeight:"100vh", padding:"48px 52px",
        background:`linear-gradient(145deg, ${B.blueDk} 0%, ${B.blue} 100%)`,
        position:"relative", overflow:"hidden",
      }}>
        {/* decorative circles */}
        <div style={{ position:"absolute", top:-80, right:-80, width:320, height:320,
          borderRadius:"50%", background:"rgba(255,255,255,0.06)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:-100, left:-60, width:380, height:380,
          borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", top:"40%", right:-40, width:160, height:160,
          borderRadius:"50%", background:"rgba(255,255,255,0.05)", pointerEvents:"none" }}/>

        {/* Logo */}
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{
              width:40, height:40, borderRadius:10, background:"rgba(255,255,255,0.15)",
              border:"1px solid rgba(255,255,255,0.25)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:18, fontWeight:900, color:"#fff", fontFamily:mono,
            }}>S</div>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:"#fff", letterSpacing:"-0.01em" }}>SmartAccounting</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.6)", letterSpacing:"0.08em" }}>ERP · v2.0</div>
            </div>
          </div>
        </div>

        {/* Middle content */}
        <div style={{ position:"relative", zIndex:1 }}>
          <h2 style={{ margin:"0 0 12px", fontSize:32, fontWeight:800, color:"#fff",
            lineHeight:1.2, letterSpacing:"-0.02em" }}>
            Your finances,<br/>fully in control.
          </h2>
          <p style={{ margin:"0 0 40px", fontSize:15, color:"rgba(255,255,255,0.72)", lineHeight:1.6 }}>
            The all-in-one accounting platform built for modern businesses — invoicing, banking, VAT, and reporting in one place.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {[
              ["◈", "Real-time financial dashboard"],
              ["↗", "Invoicing & accounts receivable"],
              ["⊛", "VAT compliance & reporting"],
              ["⊟", "Bank reconciliation"],
            ].map(([icon, label]) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:8,
                  background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.18)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:14, color:"#fff", flexShrink:0 }}>{icon}</div>
                <span style={{ fontSize:13, color:"rgba(255,255,255,0.85)", fontWeight:500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position:"relative", zIndex:1 }}>
          <p style={{ margin:0, fontSize:12, color:"rgba(255,255,255,0.4)" }}>
            © 2025 SmartAccounting ERP · Secure · SOC 2 Compliant
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        flex:1, display:"flex", alignItems:"center", justifyContent:"center",
        background:B.bg, padding:"48px 32px",
      }}>
        <div style={{ width:"100%", maxWidth:400 }}>

          <div style={{ marginBottom:36 }}>
            <h1 style={{ margin:"0 0 8px", fontSize:26, fontWeight:800, color:B.text, letterSpacing:"-0.02em" }}>
              Welcome back
            </h1>
            <p style={{ margin:0, fontSize:14, color:B.textMid }}>
              Sign in to your account to continue
            </p>
          </div>

          <div style={{
            background:B.white, borderRadius:16, padding:"32px",
            border:`1px solid ${B.border}`,
            boxShadow:"0 4px 24px rgba(0,0,0,0.06)",
          }}>
            <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:20 }}>

              {/* Email */}
              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600,
                  color:B.text, marginBottom:7 }}>
                  Email address
                </label>
                <input
                  type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="you@company.com" autoComplete="email"
                  style={{
                    width:"100%", background:B.white, border:`1.5px solid ${B.border}`,
                    borderRadius:10, padding:"11px 14px", color:B.text, fontSize:14,
                    outline:"none", boxSizing:"border-box", fontFamily:sans,
                    transition:"border-color 0.15s, box-shadow 0.15s",
                  }}
                  onFocus={e=>{ e.target.style.borderColor=B.blue; e.target.style.boxShadow=`0 0 0 3px ${B.blue}1A`; }}
                  onBlur={e=>{  e.target.style.borderColor=B.border; e.target.style.boxShadow="none"; }}
                />
              </div>

              {/* Password */}
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
                  <label style={{ fontSize:13, fontWeight:600, color:B.text }}>Password</label>
                  <span style={{ fontSize:12, color:B.blue, cursor:"pointer", fontWeight:500 }}>
                    Forgot password?
                  </span>
                </div>
                <div style={{ position:"relative" }}>
                  <input
                    type={showPw?"text":"password"} value={password}
                    onChange={e=>setPassword(e.target.value)}
                    placeholder="Enter your password" autoComplete="current-password"
                    style={{
                      width:"100%", background:B.white, border:`1.5px solid ${B.border}`,
                      borderRadius:10, padding:"11px 44px 11px 14px", color:B.text, fontSize:14,
                      outline:"none", boxSizing:"border-box", fontFamily:sans,
                      transition:"border-color 0.15s, box-shadow 0.15s",
                    }}
                    onFocus={e=>{ e.target.style.borderColor=B.blue; e.target.style.boxShadow=`0 0 0 3px ${B.blue}1A`; }}
                    onBlur={e=>{  e.target.style.borderColor=B.border; e.target.style.boxShadow="none"; }}
                  />
                  <button type="button" onClick={()=>setShowPw(!showPw)} style={{
                    position:"absolute", right:13, top:"50%", transform:"translateY(-50%)",
                    background:"none", border:"none", cursor:"pointer",
                    color:B.textMid, fontSize:14, padding:0, lineHeight:1,
                  }}>{showPw?"○":"●"}</button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background:B.errorBg, border:`1px solid ${B.errorBorder}`,
                  borderRadius:9, padding:"11px 14px",
                  fontSize:13, color:B.errorText,
                  display:"flex", alignItems:"center", gap:8,
                }}>
                  <span style={{ fontSize:15 }}>⚠</span> {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                style={{
                  width:"100%", padding:"13px", borderRadius:10, border:"none",
                  background: loading ? `${B.blue}99` : B.blue,
                  color:"#fff", fontWeight:700, fontSize:14,
                  cursor:loading?"not-allowed":"pointer", fontFamily:sans,
                  letterSpacing:"0.01em",
                  boxShadow: loading ? "none" : `0 4px 14px ${B.blue}40`,
                  transition:"all 0.15s",
                }}
                onMouseEnter={e=>{ if(!loading) e.target.style.background=B.blueDk; }}
                onMouseLeave={e=>{ if(!loading) e.target.style.background=B.blue; }}
              >
                {loading ? "Signing in…" : "Sign in →"}
              </button>
            </form>
          </div>

          <p style={{ textAlign:"center", marginTop:24, fontSize:13, color:B.textMid }}>
            Don&apos;t have an account?{" "}
            <span
              onClick={()=>router.push("/register")}
              style={{ color:B.blue, cursor:"pointer", fontWeight:600,
                textDecoration:"underline", textUnderlineOffset:3 }}>
              Create account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
