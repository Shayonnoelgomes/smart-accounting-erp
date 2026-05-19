import { useState } from "react";
import { useRouter } from "next/router";

const C = {
  bg:       "#07111F",
  surface:  "#0C1A2E",
  surfaceB: "#101F35",
  raised:   "#152234",
  border:   "rgba(255,255,255,0.065)",
  borderHi: "rgba(0,210,180,0.35)",
  teal:     "#00D2B4",
  tealDim:  "#007A6A",
  sky:      "#38BDF8",
  emerald:  "#10B981",
  rose:     "#F43F5E",
  text:     "#D9E8F5",
  textMid:  "#7A96B4",
  textDim:  "#3D5570",
};
const font     = "'IBM Plex Mono','Fira Code','Courier New',monospace";
const sansFont = "'DM Sans','Segoe UI',system-ui,sans-serif";
const API      = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function Field({ label, type="text", value, onChange, placeholder, autoComplete }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.textMid,
        letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:7, fontFamily:font }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder} autoComplete={autoComplete}
        style={{
          width:"100%", background:C.raised,
          border:`1px solid ${focused ? C.teal : C.border}`,
          borderRadius:10, padding:"11px 14px", color:C.text, fontSize:13,
          outline:"none", boxSizing:"border-box", fontFamily:sansFont,
          transition:"border-color 0.15s",
        }}
        onFocus={()=>setFocused(true)}
        onBlur={()=>setFocused(false)}
      />
    </div>
  );
}

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    company_name: "", name: "", email: "", password: "", confirm: "",
  });
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const f = key => val => setForm(p => ({ ...p, [key]: val }));

  const handleRegister = async (e) => {
    e?.preventDefault();
    const { company_name, name, email, password, confirm } = form;
    if (!company_name || !name || !email || !password) {
      setError("All fields are required."); return;
    }
    if (password !== confirm) {
      setError("Passwords do not match."); return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters."); return;
    }

    setError(""); setLoading(true);
    try {
      const res  = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name, name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); setLoading(false); return; }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Cannot reach server. Check your connection.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:"100vh", background:C.bg, fontFamily:sansFont,
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"32px 24px", position:"relative", overflow:"hidden",
    }}>
      {/* Background glow */}
      <div style={{ position:"absolute", top:"-20%", right:"-10%", width:600, height:600,
        borderRadius:"50%", background:`radial-gradient(circle, ${C.teal}14 0%, transparent 70%)`,
        pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"-15%", left:"-8%", width:500, height:500,
        borderRadius:"50%", background:`radial-gradient(circle, ${C.sky}0C 0%, transparent 70%)`,
        pointerEvents:"none" }}/>

      <div style={{ width:"100%", maxWidth:440, position:"relative", zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{
            width:52, height:52, borderRadius:14, margin:"0 auto 14px",
            background:`linear-gradient(135deg, ${C.teal}, ${C.sky})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:22, fontWeight:900, color:C.bg, fontFamily:font,
            boxShadow:`0 0 40px ${C.teal}40`,
          }}>S</div>
          <div style={{ fontSize:20, fontWeight:800, color:C.text, fontFamily:font, letterSpacing:"-0.02em" }}>
            SmartAccounting
          </div>
          <div style={{ fontSize:11, color:C.teal, fontWeight:700, letterSpacing:"0.1em", marginTop:2 }}>
            ERP · v2.0
          </div>
        </div>

        {/* Card */}
        <div style={{
          background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:18, padding:"30px 32px 26px",
          boxShadow:"0 40px 100px rgba(0,0,0,0.5)",
        }}>
          <div style={{ marginBottom:22 }}>
            <h1 style={{ margin:0, fontSize:18, fontWeight:800, color:C.text, fontFamily:font }}>
              Create account
            </h1>
            <p style={{ margin:"6px 0 0", fontSize:12, color:C.textMid }}>
              Set up your company on SmartAccounting ERP
            </p>
          </div>

          {success ? (
            <div style={{
              background:`${C.emerald}12`, border:`1px solid ${C.emerald}30`,
              borderRadius:12, padding:"20px", textAlign:"center",
            }}>
              <div style={{ fontSize:24, marginBottom:8 }}>✓</div>
              <div style={{ fontSize:14, fontWeight:700, color:C.emerald, fontFamily:font }}>
                Account created!
              </div>
              <div style={{ fontSize:12, color:C.textMid, marginTop:6 }}>
                Redirecting to login…
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <Field label="Company Name" value={form.company_name} onChange={f("company_name")}
                placeholder="Horizon Tech FZE" autoComplete="organization"/>

              <Field label="Your Full Name" value={form.name} onChange={f("name")}
                placeholder="John Smith" autoComplete="name"/>

              <Field label="Email Address" type="email" value={form.email} onChange={f("email")}
                placeholder="john@company.com" autoComplete="email"/>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Field label="Password" type="password" value={form.password} onChange={f("password")}
                  placeholder="Min 8 chars" autoComplete="new-password"/>
                <Field label="Confirm Password" type="password" value={form.confirm} onChange={f("confirm")}
                  placeholder="Repeat password" autoComplete="new-password"/>
              </div>

              {/* Password strength hint */}
              {form.password && (
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  {[4,6,8,10].map(n=>(
                    <div key={n} style={{
                      height:3, flex:1, borderRadius:2,
                      background: form.password.length>=n
                        ? n<=5?C.rose : n<=7?C.sky : C.emerald
                        : C.raised,
                      transition:"background 0.2s",
                    }}/>
                  ))}
                  <span style={{ fontSize:9, color:C.textDim, whiteSpace:"nowrap" }}>
                    {form.password.length<6?"Weak":form.password.length<8?"Fair":"Strong"}
                  </span>
                </div>
              )}

              {error && (
                <div style={{
                  background:`${C.rose}12`, border:`1px solid ${C.rose}30`,
                  borderRadius:9, padding:"10px 14px",
                  fontSize:12, color:C.rose, display:"flex", alignItems:"center", gap:8,
                }}>
                  <span>⚠</span> {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width:"100%", padding:"13px", borderRadius:10, border:"none",
                background: loading ? C.tealDim : C.teal,
                color:C.bg, fontWeight:800, fontSize:13,
                cursor:loading?"not-allowed":"pointer",
                fontFamily:sansFont, marginTop:4, letterSpacing:"0.02em",
                boxShadow: loading?"none":`0 0 24px ${C.teal}40`,
                transition:"all 0.15s",
              }}>
                {loading ? "Creating account…" : "Create Account →"}
              </button>
            </form>
          )}
        </div>

        {/* Login link */}
        <p style={{ textAlign:"center", marginTop:20, fontSize:12, color:C.textMid }}>
          Already have an account?{" "}
          <span onClick={()=>router.push("/login")} style={{
            color:C.teal, cursor:"pointer", fontWeight:700,
          }}>
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}
