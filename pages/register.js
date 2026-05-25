import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const B = {
  bg:           "#0A0A0A",
  surface:      "#111111",
  raised:       "#1A1A1A",
  orange:       "#F97316",
  orangeDk:     "#EA6C0A",
  text:         "#FFFFFF",
  textMid:      "#A3A3A3",
  textDim:      "#525252",
  border:       "#2A2A2A",
  success:      "#22C55E",
  successBg:    "#001A0A",
  successBorder:"#22C55E",
  errorBg:      "#2A0000",
  errorBorder:  "#EF4444",
  errorText:    "#EF4444",
};
const sans = "'DM Sans','Segoe UI',system-ui,sans-serif";
const API  = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function Field({ label, type="text", value, onChange, placeholder, autoComplete, hint }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display:"block", fontSize:13, fontWeight:600, color:B.textMid, marginBottom:7 }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder} autoComplete={autoComplete}
        style={{
          width:"100%", background:B.raised,
          border:`1.5px solid ${focused ? B.orange : B.border}`,
          boxShadow: focused ? "0 0 0 3px rgba(249,115,22,0.15)" : "none",
          borderRadius:10, padding:"11px 14px", color:B.text, fontSize:14,
          outline:"none", boxSizing:"border-box", fontFamily:sans,
          transition:"border-color 0.15s, box-shadow 0.15s",
        }}
        onFocus={()=>setFocused(true)}
        onBlur={()=>setFocused(false)}
      />
      {hint && <p style={{ margin:"5px 0 0", fontSize:11, color:B.textMid }}>{hint}</p>}
    </div>
  );
}

function StrengthBar({ password }) {
  const len = password.length;
  const score = len === 0 ? 0 : len < 6 ? 1 : len < 8 ? 2 : len < 12 ? 3 : 4;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#EF4444", "#F97316", "#F97316", "#22C55E"];
  if (!password) return null;
  return (
    <div style={{ marginTop:8 }}>
      <div style={{ display:"flex", gap:4, marginBottom:5 }}>
        {[1,2,3,4].map(i=>(
          <div key={i} style={{
            height:3, flex:1, borderRadius:2,
            background: i<=score ? colors[score] : B.border,
            transition:"background 0.25s",
          }}/>
        ))}
      </div>
      <span style={{ fontSize:11, color:colors[score], fontWeight:600 }}>{labels[score]}</span>
    </div>
  );
}

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    company_name:"", name:"", email:"", password:"", confirm:"",
  });
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const f = key => val => setForm(p=>({...p,[key]:val}));

  const handleRegister = async (e) => {
    e?.preventDefault();
    const { company_name, name, email, password, confirm } = form;
    if (!company_name || !name || !email || !password) {
      setError("All fields are required."); return;
    }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }
    setError(""); setLoading(true);
    try {
      const res  = await fetch(`${API}/api/auth/register`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ company_name, name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error||"Registration failed."); setLoading(false); return; }
      setSuccess(true);
      setTimeout(()=>router.push("/login"), 2200);
    } catch {
      setError("Cannot reach server. Check your connection.");
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Create Account | SNG Books</title></Head>
      <div style={{ display:"flex", minHeight:"100vh", fontFamily:sans, background:B.bg }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          display:"flex", flexDirection:"column", justifyContent:"space-between",
          width:"40%", minHeight:"100vh", padding:"48px 44px",
          background:"#111111",
          borderRight:`1px solid ${B.border}`,
          position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:-60, right:-60, width:280, height:280,
            borderRadius:"50%", background:"rgba(249,115,22,0.06)", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", bottom:-80, left:-40, width:320, height:320,
            borderRadius:"50%", background:"rgba(249,115,22,0.04)", pointerEvents:"none" }}/>

          {/* Logo */}
          <div style={{ position:"relative", zIndex:1 }}>
            <img src="/logo.png" style={{
              width:180, height:"auto", display:"block",
              background:"#FFFFFF", padding:"12px 16px", borderRadius:"12px",
            }} alt="SNG Books"/>
          </div>

          {/* Middle */}
          <div style={{ position:"relative", zIndex:1 }}>
            <h2 style={{ margin:"0 0 12px", fontSize:28, fontWeight:800, color:"#FFFFFF",
              lineHeight:1.25, letterSpacing:"-0.02em" }}>
              Start your free<br/>account today.
            </h2>
            <p style={{ margin:"0 0 36px", fontSize:14, color:B.textMid, lineHeight:1.65 }}>
              Join thousands of businesses managing their finances smarter with SNG Books.
            </p>
            {[
              "Free 30-day trial, no credit card required",
              "Set up in under 5 minutes",
              "Invite your team and accountant",
              "Export reports anytime",
            ].map(item=>(
              <div key={item} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:13 }}>
                <div style={{ width:20, height:20, borderRadius:"50%", background:"rgba(249,115,22,0.2)",
                  border:"1px solid rgba(249,115,22,0.4)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:10, color:"#F97316", flexShrink:0 }}>✓</div>
                <span style={{ fontSize:13, color:B.textMid }}>{item}</span>
              </div>
            ))}
          </div>

          <div style={{ position:"relative", zIndex:1 }}>
            <p style={{ margin:0, fontSize:12, color:B.textDim }}>
              © 2025 SNG Books · Secure · SOC 2 Compliant
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{
          flex:1, display:"flex", alignItems:"center", justifyContent:"center",
          background:B.bg, padding:"40px 32px", overflowY:"auto",
        }}>
          <div style={{ width:"100%", maxWidth:420 }}>

            <div style={{ marginBottom:28 }}>
              <h1 style={{ margin:"0 0 8px", fontSize:24, fontWeight:800, color:B.text, letterSpacing:"-0.02em" }}>
                Create your account
              </h1>
              <p style={{ margin:0, fontSize:14, color:B.textMid }}>
                Set up your company workspace in minutes
              </p>
            </div>

            <div style={{
              background:B.surface, borderRadius:16, padding:"30px",
              border:`1px solid ${B.border}`,
              boxShadow:"0 4px 24px rgba(0,0,0,0.4)",
            }}>
              {success ? (
                <div style={{ textAlign:"center", padding:"20px 0" }}>
                  <div style={{
                    width:60, height:60, borderRadius:"50%",
                    background:B.successBg, border:`2px solid ${B.successBorder}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    margin:"0 auto 16px", fontSize:24, color:B.success,
                  }}>✓</div>
                  <div style={{ fontSize:17, fontWeight:700, color:B.text, marginBottom:8 }}>
                    Account created!
                  </div>
                  <div style={{ fontSize:13, color:B.textMid }}>
                    Redirecting you to sign in…
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegister} style={{ display:"flex", flexDirection:"column", gap:18 }}>
                  <Field label="Company Name" value={form.company_name} onChange={f("company_name")}
                    placeholder="Acme Corp Ltd" autoComplete="organization"/>

                  <Field label="Your Full Name" value={form.name} onChange={f("name")}
                    placeholder="John Smith" autoComplete="name"/>

                  <Field label="Work Email" type="email" value={form.email} onChange={f("email")}
                    placeholder="john@acmecorp.com" autoComplete="email"/>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    <div>
                      <Field label="Password" type="password" value={form.password} onChange={f("password")}
                        placeholder="Min. 8 characters" autoComplete="new-password"/>
                      <StrengthBar password={form.password}/>
                    </div>
                    <Field label="Confirm Password" type="password" value={form.confirm} onChange={f("confirm")}
                      placeholder="Repeat password" autoComplete="new-password"/>
                  </div>

                  {error && (
                    <div style={{
                      background:B.errorBg, border:`1px solid ${B.errorBorder}`,
                      borderRadius:9, padding:"11px 14px",
                      fontSize:13, color:B.errorText,
                      display:"flex", alignItems:"center", gap:8,
                    }}>
                      <span>⚠</span> {error}
                    </div>
                  )}

                  <button
                    type="submit" disabled={loading}
                    style={{
                      width:"100%", padding:"13px", borderRadius:10, border:"none",
                      background: loading ? "rgba(249,115,22,0.5)" : B.orange,
                      color:"#fff", fontWeight:700, fontSize:14,
                      cursor:loading?"not-allowed":"pointer", fontFamily:sans,
                      boxShadow: loading ? "none" : "0 4px 14px rgba(249,115,22,0.4)",
                      transition:"all 0.15s",
                    }}
                    onMouseEnter={e=>{ if(!loading) e.target.style.background=B.orangeDk; }}
                    onMouseLeave={e=>{ if(!loading) e.target.style.background=B.orange; }}
                  >
                    {loading ? "Creating account…" : "Create account →"}
                  </button>

                  <p style={{ margin:0, fontSize:12, color:B.textMid, textAlign:"center" }}>
                    By creating an account you agree to our{" "}
                    <span style={{ color:B.orange, cursor:"pointer" }}>Terms of Service</span>
                    {" "}and{" "}
                    <span style={{ color:B.orange, cursor:"pointer" }}>Privacy Policy</span>.
                  </p>
                </form>
              )}
            </div>

            <p style={{ textAlign:"center", marginTop:22, fontSize:13, color:B.textMid }}>
              Already have an account?{" "}
              <span onClick={()=>router.push("/login")}
                style={{ color:B.orange, cursor:"pointer", fontWeight:600,
                  textDecoration:"underline", textUnderlineOffset:3 }}>
                Sign in
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
