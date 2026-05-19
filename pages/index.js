import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM
═══════════════════════════════════════════════════════════════ */
const C = {
  bg:       "#F8FAFC",
  surface:  "#FFFFFF",
  surfaceB: "#F8FAFC",
  raised:   "#F1F5F9",
  border:   "#E2E8F0",
  borderHi: "#93C5FD",
  teal:     "#00D2B4",
  tealDim:  "#007A6A",
  tealGlow: "rgba(0,210,180,0.08)",
  sky:      "#38BDF8",
  violet:   "#A78BFA",
  amber:    "#F59E0B",
  rose:     "#EF4444",
  emerald:  "#10B981",
  text:     "#1E293B",
  textMid:  "#64748B",
  textDim:  "#94A3B8",
  white:    "#FFFFFF",
};

const font = "'IBM Plex Mono', 'Fira Code', 'Courier New', monospace";
const sansFont = "'DM Sans', 'Segoe UI', system-ui, sans-serif";

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */
const revenueData = [
  { m:"Jan", rev:142000, exp:89000, profit:53000 },
  { m:"Feb", rev:168000, exp:102000, profit:66000 },
  { m:"Mar", rev:155000, exp:94000, profit:61000 },
  { m:"Apr", rev:201000, exp:118000, profit:83000 },
  { m:"May", rev:189000, exp:109000, profit:80000 },
  { m:"Jun", rev:224000, exp:131000, profit:93000 },
  { m:"Jul", rev:198000, exp:115000, profit:83000 },
  { m:"Aug", rev:243000, exp:142000, profit:101000 },
];

const cashFlowData = [
  { w:"W1", in:58000, out:41000 }, { w:"W2", in:72000, out:53000 },
  { w:"W3", in:65000, out:38000 }, { w:"W4", in:89000, out:61000 },
  { w:"W5", in:76000, out:55000 }, { w:"W6", in:94000, out:68000 },
];

const pieData = [
  { name:"Salaries", val:42, color:C.teal },
  { name:"Operations", val:23, color:C.sky },
  { name:"Marketing", val:15, color:C.violet },
  { name:"COGS", val:12, color:C.amber },
  { name:"Other", val:8, color:C.textDim },
];

const invoicesData = [
  { id:"INV-0841", customer:"Accenture MENA LLC", date:"2024-12-20", due:"2025-01-19", amount:48500, paid:48500, status:"Paid" },
  { id:"INV-0840", customer:"Emirates NBD Bank", date:"2024-12-15", due:"2025-01-14", amount:92000, paid:0, status:"Overdue" },
  { id:"INV-0839", customer:"Dubai Municipality", date:"2024-12-12", due:"2025-01-11", amount:31200, paid:31200, status:"Paid" },
  { id:"INV-0838", customer:"ADNOC Distribution", date:"2024-12-10", due:"2025-01-09", amount:67800, paid:20000, status:"Partial" },
  { id:"INV-0837", customer:"Mubadala Investment", date:"2024-12-08", due:"2025-01-07", amount:115000, paid:0, status:"Sent" },
  { id:"INV-0836", customer:"DP World FZE", date:"2024-12-05", due:"2024-01-04", amount:43200, paid:43200, status:"Paid" },
  { id:"INV-0835", customer:"Majid Al Futtaim", date:"2024-12-01", due:"2024-12-31", amount:28900, paid:0, status:"Draft" },
];

const billsData = [
  { id:"BILL-0392", vendor:"AWS Services", date:"2024-12-18", due:"2025-01-17", amount:12300, status:"Pending Approval" },
  { id:"BILL-0391", vendor:"Oracle Cloud UAE", date:"2024-12-16", due:"2025-01-15", amount:24800, status:"Paid" },
  { id:"BILL-0390", vendor:"Etisalat / eand", date:"2024-12-14", due:"2025-01-13", amount:4200, status:"Approved" },
  { id:"BILL-0389", vendor:"Al Masaood Office", date:"2024-12-10", due:"2025-01-09", amount:8700, status:"Paid" },
  { id:"BILL-0388", vendor:"DEWA Authority", date:"2024-12-08", due:"2025-01-07", amount:3150, status:"Approved" },
];

const coaData = [
  { code:"1000", name:"Current Assets", type:"Asset", parent:null, balance:2341500 },
  { code:"1100", name:"Cash & Bank", type:"Asset", parent:"1000", balance:1820000 },
  { code:"1101", name:"Emirates NBD - AED", type:"Asset", parent:"1100", balance:1240000 },
  { code:"1102", name:"FAB - USD Account", type:"Asset", parent:"1100", balance:580000 },
  { code:"1200", name:"Accounts Receivable", type:"Asset", parent:"1000", balance:486200 },
  { code:"1300", name:"Inventory", type:"Asset", parent:"1000", balance:692400 },
  { code:"2000", name:"Current Liabilities", type:"Liability", parent:null, balance:297800 },
  { code:"2100", name:"Accounts Payable", type:"Liability", parent:"2000", balance:213800 },
  { code:"2200", name:"VAT Payable", type:"Liability", parent:"2000", balance:84320 },
  { code:"3000", name:"Equity", type:"Equity", parent:null, balance:1850000 },
  { code:"3100", name:"Share Capital", type:"Equity", parent:"3000", balance:1000000 },
  { code:"3200", name:"Retained Earnings", type:"Equity", parent:"3000", balance:850000 },
  { code:"4000", name:"Revenue", type:"Income", parent:null, balance:1843200 },
  { code:"4100", name:"Sales Revenue", type:"Income", parent:"4000", balance:1620000 },
  { code:"4200", name:"Service Revenue", type:"Income", parent:"4000", balance:223200 },
  { code:"5000", name:"Cost of Goods Sold", type:"COGS", parent:null, balance:680000 },
  { code:"6000", name:"Operating Expenses", type:"Expense", parent:null, balance:412800 },
  { code:"6100", name:"Salaries & Wages", type:"Expense", parent:"6000", balance:248000 },
  { code:"6200", name:"Rent & Utilities", type:"Expense", parent:"6000", balance:84000 },
  { code:"6300", name:"Marketing & Ads", type:"Expense", parent:"6000", balance:52000 },
  { code:"6400", name:"Software & Subscriptions", type:"Expense", parent:"6000", balance:28800 },
];

const journalData = [
  { id:"JV-2024-0124", date:"2024-12-20", ref:"INV-0841", narration:"Sales Invoice - Accenture MENA", lines:[
    { account:"1200 Accounts Receivable", dr:48500, cr:0 },
    { account:"4100 Sales Revenue", dr:0, cr:41100 },
    { account:"2200 VAT Payable", dr:0, cr:7400 },
  ], status:"Posted" },
  { id:"JV-2024-0123", date:"2024-12-18", ref:"BILL-0392", narration:"AWS Cloud Services Invoice", lines:[
    { account:"6400 Software & Subscriptions", dr:12300, cr:0 },
    { account:"2100 Accounts Payable", dr:0, cr:12300 },
  ], status:"Draft" },
  { id:"JV-2024-0122", date:"2024-12-16", ref:"PAY-0291", narration:"Payment Received - Dubai Municipality", lines:[
    { account:"1101 Emirates NBD - AED", dr:31200, cr:0 },
    { account:"1200 Accounts Receivable", dr:0, cr:31200 },
  ], status:"Posted" },
];

const bankAccounts = [
  { name:"Emirates NBD - AED", number:"•••• 4821", balance:1240000, currency:"AED", color:C.teal },
  { name:"FAB - USD Account", number:"•••• 7392", balance:580000, currency:"AED", color:C.sky },
  { name:"Petty Cash", number:"Office Safe", balance:8500, currency:"AED", color:C.violet },
];

const bankTxns = [
  { date:"Dec 20", ref:"TXN-8821", description:"Emirates NBD Transfer In", amount:48500, type:"Credit", matched:"INV-0841" },
  { date:"Dec 18", ref:"TXN-8820", description:"AWS Services Auto-Debit", amount:-12300, type:"Debit", matched:null },
  { date:"Dec 16", ref:"TXN-8819", description:"Dubai Municipality Payment", amount:31200, type:"Credit", matched:"INV-0839" },
  { date:"Dec 15", ref:"TXN-8818", description:"Office Rent - Al Masaood", amount:-32000, type:"Debit", matched:"BILL-0389" },
  { date:"Dec 14", ref:"TXN-8817", description:"Etisalat Monthly Bill", amount:-4200, type:"Debit", matched:null },
  { date:"Dec 12", ref:"TXN-8816", description:"ADNOC Partial Payment", amount:20000, type:"Credit", matched:"INV-0838" },
];

const inventoryItems = [
  { sku:"SKU-001", name:"Enterprise License - Annual", category:"Software", qty:145, uom:"Lic", cost:1200, price:2200, value:174000, status:"Active" },
  { sku:"SKU-002", name:"Professional Services Day Rate", category:"Services", qty:80, uom:"Day", cost:800, price:1500, value:64000, status:"Active" },
  { sku:"SKU-003", name:"Dell PowerEdge R740 Server", category:"Hardware", qty:12, uom:"Unit", cost:18500, price:28000, value:222000, status:"Active" },
  { sku:"SKU-004", name:"HP EliteBook 840 G10", category:"Hardware", qty:8, uom:"Unit", cost:4200, price:6500, value:33600, status:"Low Stock" },
  { sku:"SKU-005", name:"Cisco Catalyst 9300 Switch", category:"Network", qty:3, uom:"Unit", cost:8800, price:14000, value:26400, status:"Low Stock" },
  { sku:"SKU-006", name:"Support Retainer - Monthly", category:"Services", qty:200, uom:"Hr", cost:150, price:280, value:30000, status:"Active" },
];

const vatData = {
  period: "Q4 2024 (Oct–Dec)",
  outputVAT: [
    { desc:"Standard Rated Sales", taxableAmt:1620000, vat:81000 },
    { desc:"Zero Rated Exports", taxableAmt:223200, vat:0 },
  ],
  inputVAT: [
    { desc:"Standard Rated Purchases", taxableAmt:412800, vat:20640 },
    { desc:"Import VAT", taxableAmt:68000, vat:3400 },
  ],
};

const reportPL = [
  { label:"Revenue", items:[
    { name:"Sales Revenue", amount:1620000 },
    { name:"Service Revenue", amount:223200 },
  ], total:1843200, type:"income" },
  { label:"Cost of Goods Sold", items:[
    { name:"Direct Material Cost", amount:480000 },
    { name:"Direct Labour", amount:200000 },
  ], total:680000, type:"cogs" },
  { label:"Gross Profit", total:1163200, type:"subtotal" },
  { label:"Operating Expenses", items:[
    { name:"Salaries & Wages", amount:248000 },
    { name:"Rent & Utilities", amount:84000 },
    { name:"Marketing & Advertising", amount:52000 },
    { name:"Software Subscriptions", amount:28800 },
  ], total:412800, type:"expense" },
  { label:"Net Operating Profit", total:750400, type:"subtotal" },
];

/* ═══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
═══════════════════════════════════════════════════════════════ */
const Pill = ({ status }) => {
  const map = {
    "Paid":            { bg:`${C.emerald}20`, color:C.emerald },
    "Overdue":         { bg:`${C.rose}20`,    color:C.rose },
    "Partial":         { bg:`${C.amber}20`,   color:C.amber },
    "Sent":            { bg:`${C.sky}20`,     color:C.sky },
    "Draft":           { bg:C.border,         color:C.textMid },
    "Pending Approval":{ bg:`${C.amber}20`,   color:C.amber },
    "Approved":        { bg:`${C.teal}20`,    color:C.teal },
    "Posted":          { bg:`${C.emerald}20`, color:C.emerald },
    "Active":          { bg:`${C.teal}20`,    color:C.teal },
    "Low Stock":       { bg:`${C.rose}20`,    color:C.rose },
    "Credit":          { bg:`${C.emerald}20`, color:C.emerald },
    "Debit":           { bg:`${C.rose}20`,    color:C.rose },
  };
  const s = map[status] || { bg:C.border, color:C.textMid };
  return <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase",
    padding:"3px 9px", borderRadius:20, background:s.bg, color:s.color, whiteSpace:"nowrap" }}>{status}</span>;
};

const Card = ({ children, style={} }) => (
  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:20,
    boxShadow:"0 1px 3px rgba(0,0,0,0.06)", ...style }}>
    {children}
  </div>
);

const SHead = ({ children, action, sub }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
    <div>
      <div style={{ fontSize:11, fontWeight:700, color:C.text, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:font }}>{children}</div>
      {sub && <div style={{ fontSize:11, color:C.textMid, marginTop:3 }}>{sub}</div>}
    </div>
    {action && <button onClick={action.fn} style={{ fontSize:11, color:C.teal, background:`${C.teal}15`,
      border:`1px solid ${C.teal}40`, borderRadius:8, padding:"5px 12px", cursor:"pointer", fontWeight:700 }}>{action.label}</button>}
  </div>
);

const Btn = ({ children, onClick, variant="primary", style={} }) => {
  const base = {
    padding:"9px 18px", borderRadius:9, border:"none", cursor:"pointer",
    fontSize:12, fontWeight:700, fontFamily:sansFont, transition:"opacity 0.15s", ...style
  };
  const variants = {
    primary: { background:"#2563EB", color:"#FFFFFF", boxShadow:"0 2px 8px rgba(37,99,235,0.25)" },
    ghost:   { background:"none", color:C.textMid, border:`1px solid ${C.border}` },
    danger:  { background:`${C.rose}10`, color:C.rose, border:`1px solid ${C.rose}30` },
  };
  return <button onClick={onClick} style={{ ...base, ...variants[variant] }}>{children}</button>;
};

const TH = ({ children }) => (
  <th style={{ fontSize:10, fontWeight:700, color:C.textMid, letterSpacing:"0.08em",
    textTransform:"uppercase", padding:"10px 14px", textAlign:"left",
    background:C.surfaceB, borderBottom:`1px solid ${C.border}`, fontFamily:font }}>{children}</th>
);
const TD = ({ children, style={} }) => (
  <td style={{ padding:"11px 14px", fontSize:12, color:C.text,
    borderBottom:`1px solid ${C.border}`, ...style }}>{children}</td>
);

const aed = n => `AED ${Number(n).toLocaleString()}`;

/* ═══════════════════════════════════════════════════════════════
   MODAL
═══════════════════════════════════════════════════════════════ */
function Modal({ open, onClose, title, children, width=560 }) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width, maxWidth:"90vw", maxHeight:"85vh", overflowY:"auto",
        background:C.white, border:`1px solid ${C.border}`,
        borderRadius:16, boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"18px 22px", borderBottom:`1px solid ${C.border}` }}>
          <span style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:font }}>{title}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.textMid,
            fontSize:20, cursor:"pointer", lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:22 }}>{children}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INPUT COMPONENTS
═══════════════════════════════════════════════════════════════ */
const Input = ({ label, value, onChange, type="text", placeholder="" }) => (
  <div style={{ marginBottom:14 }}>
    <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.textMid,
      letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>{label}</label>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8,
        padding:"9px 12px", color:C.text, fontSize:12, outline:"none", boxSizing:"border-box",
        fontFamily:sansFont }} />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom:14 }}>
    <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.textMid,
      letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>{label}</label>
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8,
        padding:"9px 12px", color:C.text, fontSize:12, outline:"none", boxSizing:"border-box" }}>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   PAGE: DASHBOARD
═══════════════════════════════════════════════════════════════ */
function Dashboard({ token }) {
  const [summary,  setSummary]  = useState(null);
  const [cashflow, setCashflow] = useState([]);
  const [alerts,   setAlerts]   = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!token) return;
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_URL}/api/dashboard/summary`,  { headers: h }).then(r => r.json()),
      fetch(`${API_URL}/api/dashboard/cashflow`, { headers: h }).then(r => r.json()),
      fetch(`${API_URL}/api/dashboard/alerts`,   { headers: h }).then(r => r.json()),
    ]).then(([sum, cf, al]) => {
      setSummary(sum);
      setCashflow(Array.isArray(cf) ? cf : []);
      setAlerts(al);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const s = summary || {};
  const kpis = [
    { label:"Total Revenue",   value: s.revenue     || 0, trend:0, color:C.teal,    icon:"▲" },
    { label:"Total Expenses",  value: s.expenses    || 0, trend:0, color:C.rose,    icon:"▼" },
    { label:"Net Profit",      value: s.profit      || 0, trend:0, color:C.emerald, icon:"▲" },
    { label:"Cash Balance",    value: s.cashBalance || 0, trend:0, color:C.sky,     icon:"▲" },
    { label:"Receivables",     value: s.arBalance   || 0, trend:0, color:C.violet,  icon:"▼" },
    { label:"Payables",        value: s.apBalance   || 0, trend:0, color:C.amber,   icon:"▲" },
    { label:"VAT Payable",     value:84320, trend:0, color:C.teal,  icon:"─" },
    { label:"Inventory Value", value:692400, trend:0, color:C.sky,   icon:"▲" },
  ];

  const cfChartData = cashflow.length > 0
    ? cashflow.map((row, i) => ({ w:`W${i+1}`, in: parseFloat(row.inflow)||0, out: parseFloat(row.outflow)||0 }))
    : cashFlowData;

  const alertItems = alerts ? [
    alerts.overdueInvoices?.length && {
      c:"#EF4444", bg:"#FEF2F2", bc:"#FECACA",
      i:"⚠", t:"Overdue Invoices",
      d:`${alerts.overdueInvoices.length} invoice${alerts.overdueInvoices.length>1?"s":""} past due`,
    },
    alerts.pendingBills?.length && {
      c:"#D97706", bg:"#FFFBEB", bc:"#FDE68A",
      i:"⏳", t:"Bills Due",
      d:`${alerts.pendingBills.length} bill${alerts.pendingBills.length>1?"s":""} awaiting payment`,
    },
    alerts.vatDue?.length && {
      c:"#7C3AED", bg:"#F5F3FF", bc:"#DDD6FE",
      i:"⊛", t:"VAT Return Due",
      d:`${alerts.vatDue.length} draft return${alerts.vatDue.length>1?"s":""}`,
    },
    alerts.lowInventory?.length && {
      c:"#059669", bg:"#F0FDF4", bc:"#A7F3D0",
      i:"⊠", t:"Low Stock Alert",
      d:`${alerts.lowInventory.length} item${alerts.lowInventory.length>1?"s":""} below reorder level`,
    },
  ].filter(Boolean) : [
    { c:"#EF4444", bg:"#FEF2F2", bc:"#FECACA", i:"⚠", t:"Overdue Invoices",   d:"No overdue invoices" },
    { c:"#D97706", bg:"#FFFBEB", bc:"#FDE68A", i:"⏳", t:"Pending Bills",       d:"No pending bills" },
    { c:"#2563EB", bg:"#EFF6FF", bc:"#BFDBFE", i:"⊟", t:"Bank Reconciliation", d:"Set up bank accounts" },
    { c:"#7C3AED", bg:"#F5F3FF", bc:"#DDD6FE", i:"⊛", t:"VAT Return",          d:"No returns due" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {kpis.map((k,i)=>(
          <Card key={i} style={{ position:"relative", overflow:"hidden", cursor:"default" }}>
            <div style={{ position:"absolute", top:-20, right:-20, width:90, height:90,
              borderRadius:"50%", background:k.color, opacity:0.12, filter:"blur(20px)" }}/>
            <div style={{ fontSize:10, color:C.textMid, letterSpacing:"0.08em", textTransform:"uppercase",
              fontWeight:700, marginBottom:10, fontFamily:font }}>{k.label}</div>
            <div style={{ fontSize:10, color:C.textDim, marginBottom:2 }}>AED</div>
            <div style={{ fontSize:24, fontWeight:800, color:C.text, letterSpacing:"-0.03em",
              fontFamily:font }}>{k.value.toLocaleString()}</div>
            <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:20,
                color: k.trend>0?C.emerald:k.trend<0?C.rose:C.textMid,
                background: k.trend>0?`${C.emerald}18`:k.trend<0?`${C.rose}18`:C.border }}>
                {k.icon} {Math.abs(k.trend)}%
              </span>
              <span style={{ fontSize:10, color:C.textDim }}>vs last month</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:"grid", gridTemplateColumns:"1.8fr 1fr", gap:14 }}>
        <Card>
          <SHead>Revenue & Expense Trend</SHead>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.teal} stopOpacity={0.35}/>
                  <stop offset="95%" stopColor={C.teal} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.rose} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={C.rose} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
              <XAxis dataKey="m" tick={{fill:C.textDim,fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v=>`${v/1000}K`} tick={{fill:C.textDim,fontSize:9}} axisLine={false} tickLine={false} width={38}/>
              <Tooltip contentStyle={{background:C.surfaceB,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}}
                labelStyle={{color:C.text}} formatter={v=>[`AED ${v.toLocaleString()}`,""]}/>
              <Area type="monotone" dataKey="rev" stroke={C.teal} strokeWidth={2} fill="url(#gRev)" name="Revenue"/>
              <Area type="monotone" dataKey="exp" stroke={C.rose} strokeWidth={2} fill="url(#gExp)" name="Expenses"/>
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", gap:18, marginTop:6 }}>
            {[["Revenue",C.teal],["Expenses",C.rose]].map(([l,c])=>(
              <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:8,height:8,borderRadius:2,background:c }}/>
                <span style={{ fontSize:10, color:C.textMid }}>{l}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SHead>Expense Breakdown</SHead>
          <PieChart width={170} height={170} style={{ margin:"0 auto" }}>
            <Pie data={pieData} dataKey="val" cx={85} cy={85} innerRadius={48} outerRadius={75} strokeWidth={0}>
              {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
            </Pie>
          </PieChart>
          <div style={{ display:"flex", flexDirection:"column", gap:7, marginTop:6 }}>
            {pieData.map(e=>(
              <div key={e.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <div style={{ width:7,height:7,borderRadius:2,background:e.color }}/>
                  <span style={{ fontSize:11,color:C.textMid }}>{e.name}</span>
                </div>
                <span style={{ fontSize:11,fontWeight:700,color:C.text,fontFamily:font }}>{e.val}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Cash flow + alerts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Card>
          <SHead>Cash Flow (Weekly)</SHead>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={cfChartData} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="w" tick={{fill:C.textDim,fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v=>`${v/1000}K`} tick={{fill:C.textDim,fontSize:9}} axisLine={false} tickLine={false} width={34}/>
              <Tooltip contentStyle={{background:C.surfaceB,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}}
                formatter={v=>[`AED ${v.toLocaleString()}`,""]}/>
              <Bar dataKey="in" fill={C.teal} radius={[4,4,0,0]} name="Inflow"/>
              <Bar dataKey="out" fill={`${C.rose}90`} radius={[4,4,0,0]} name="Outflow"/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SHead>Alerts & Pending Tasks</SHead>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {alertItems.map((a,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12,
                padding:"10px 14px", borderRadius:10,
                background:a.bg, border:`1px solid ${a.bc}`, cursor:"pointer" }}>
                <span style={{ fontSize:15, color:a.c }}>{a.i}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{a.t}</div>
                  <div style={{ fontSize:10, color:C.textMid }}>{a.d}</div>
                </div>
                <span style={{ color:C.textDim }}>›</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: INVOICES
═══════════════════════════════════════════════════════════════ */
function Invoices({ token }) {
  const h = { Authorization:`Bearer ${token}`, "Content-Type":"application/json" };
  const today = new Date().toISOString().slice(0,10);
  const emptyLine = { description:"", quantity:1, unit_price:0, tax_rate:5 };
  const emptyForm = { customer_id:"", number:"", date:today, due_date:"", currency:"AED", notes:"", items:[{...emptyLine}] };
  const emptyPay  = { amount:"", date:today, method:"bank_transfer", reference:"", notes:"" };

  const [invoices,   setInvoices]   = useState([]);
  const [customers,  setCustomers]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState("All");
  const [showNew,    setShowNew]    = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [showPay,    setShowPay]    = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [payForm, setPayForm]       = useState(emptyPay);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const [toast, setToast]           = useState("");

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  const fetchInvoices = () => {
    setLoading(true);
    fetch(`${API_URL}/api/invoices`,{headers:h}).then(r=>r.json())
      .then(d=>{ setInvoices(Array.isArray(d.data)?d.data:[]); setLoading(false); }).catch(()=>setLoading(false));
  };
  useEffect(()=>{
    fetchInvoices();
    fetch(`${API_URL}/api/customers`,{headers:h}).then(r=>r.json()).then(d=>setCustomers(Array.isArray(d.data)?d.data:[])).catch(()=>{});
  },[token]);

  const filtered = filter==="All" ? invoices : invoices.filter(i=>i.status===filter);
  const nextNum  = () => { const n=invoices.map(i=>parseInt((i.number||"").replace(/\D/g,""))||0); return `INV-${String(Math.max(0,...n)+1).padStart(4,"0")}`; };
  const openNew  = () => { setForm({...emptyForm,number:nextNum(),date:today}); setError(""); setShowNew(true); };
  const addLine    = () => setForm(p=>({...p,items:[...p.items,{...emptyLine}]}));
  const removeLine = i  => setForm(p=>({...p,items:p.items.filter((_,idx)=>idx!==i)}));
  const updateLine = (i,k,v) => setForm(p=>{ const items=[...p.items]; items[i]={...items[i],[k]:v}; return {...p,items}; });
  const fv = k => v => setForm(p=>({...p,[k]:v}));
  const subtotal = form.items.reduce((a,it)=>a+(parseFloat(it.quantity||0)*parseFloat(it.unit_price||0)),0);
  const vatAmt   = form.items.reduce((a,it)=>a+(parseFloat(it.quantity||0)*parseFloat(it.unit_price||0)*(parseFloat(it.tax_rate||0)/100)),0);

  const createInvoice = async () => {
    if (!form.customer_id||!form.number||!form.date||!form.due_date) { setError("Customer, number, date and due date are required."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/invoices`,{ method:"POST", headers:h, body:JSON.stringify({ customer_id:form.customer_id, number:form.number, date:form.date, due_date:form.due_date, currency:form.currency, notes:form.notes||null, lines:form.items }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error||"Failed to create invoice."); setSaving(false); return; }
      setShowNew(false); fetchInvoices(); showToast("Invoice created!");
    } catch { setError("Network error."); }
    setSaving(false);
  };

  const openPay = () => {
    const bal = parseFloat(showDetail.total||0)-parseFloat(showDetail.paid_amount||0);
    setPayForm({...emptyPay,amount:bal.toFixed(2)}); setError(""); setShowPay(true);
  };

  const recordPayment = async () => {
    if (!payForm.amount||parseFloat(payForm.amount)<=0) { setError("Enter a valid amount."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/invoices/${showDetail.id}/payment`,{ method:"POST", headers:h, body:JSON.stringify({ amount:parseFloat(payForm.amount), date:payForm.date, method:payForm.method, reference:payForm.reference||null }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error||"Failed."); setSaving(false); return; }
      setShowPay(false); setShowDetail(null); fetchInvoices(); showToast("Payment recorded!");
    } catch { setError("Network error."); }
    setSaving(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {toast && <div style={{ position:"fixed", top:20, right:20, zIndex:2000, background:C.emerald, color:"#fff", padding:"12px 20px", borderRadius:10, fontSize:13, fontWeight:600, boxShadow:"0 4px 20px rgba(0,0,0,0.15)" }}>✓ {toast}</div>}

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:C.text, fontFamily:font }}>Sales Invoices</h2>
          <p style={{ margin:"4px 0 0", fontSize:12, color:C.textMid }}>
            {invoices.length} invoices · AED {invoices.reduce((a,i)=>a+parseFloat(i.total||0),0).toLocaleString()} total
          </p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn onClick={openNew}>+ New Invoice</Btn>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[
          { label:"Total Invoiced", value:invoices.reduce((a,i)=>a+parseFloat(i.total||0),0),       color:C.teal },
          { label:"Collected",      value:invoices.reduce((a,i)=>a+parseFloat(i.paid_amount||0),0), color:C.emerald },
          { label:"Outstanding",    value:invoices.reduce((a,i)=>a+parseFloat(i.total||0)-parseFloat(i.paid_amount||0),0), color:C.amber },
          { label:"Overdue",        value:invoices.filter(i=>i.status==="overdue").reduce((a,i)=>a+parseFloat(i.total||0)-parseFloat(i.paid_amount||0),0), color:C.rose },
        ].map((s,i)=>(
          <Card key={i} style={{ padding:"14px 18px" }}>
            <div style={{ fontSize:10, color:C.textMid, letterSpacing:"0.07em", textTransform:"uppercase", fontFamily:font }}>{s.label}</div>
            <div style={{ fontSize:20, fontWeight:800, color:s.color, marginTop:6, fontFamily:font }}>
              AED {s.value.toLocaleString()}
            </div>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display:"flex", gap:6 }}>
        {["All","draft","sent","paid","partial","overdue"].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{ padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer", fontSize:11, fontWeight:700, background:filter===s?C.teal:C.surface, color:filter===s?C.bg:C.textMid }}>{s}</button>
        ))}
      </div>

      {/* Table */}
      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr><TH>Invoice #</TH><TH>Customer</TH><TH>Date</TH><TH>Due Date</TH><TH>Amount</TH><TH>Paid</TH><TH>Status</TH><TH>Actions</TH></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ padding:32, textAlign:"center", color:C.textDim, fontSize:12 }}>Loading invoices…</td></tr>
            : filtered.length===0 ? <tr><td colSpan={8} style={{ padding:32, textAlign:"center", color:C.textDim, fontSize:12 }}>No invoices found. Create your first invoice.</td></tr>
            : filtered.map((inv,i)=>(
              <tr key={inv.id||i} onMouseEnter={e=>e.currentTarget.style.background=C.raised} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <TD><span style={{ color:C.teal, fontFamily:font, fontWeight:700 }}>{inv.number}</span></TD>
                <TD>{inv.customer_name||"—"}</TD>
                <TD style={{ color:C.textMid }}>{inv.date}</TD>
                <TD style={{ color:inv.status==="overdue"?C.rose:C.textMid }}>{inv.due_date}</TD>
                <TD><span style={{ fontFamily:font, fontWeight:700 }}>AED {parseFloat(inv.total||0).toLocaleString()}</span></TD>
                <TD><span style={{ fontFamily:font, color:C.emerald }}>AED {parseFloat(inv.paid_amount||0).toLocaleString()}</span></TD>
                <TD><Pill status={inv.status}/></TD>
                <TD><button onClick={()=>setShowDetail(inv)} style={{ fontSize:11, color:C.teal, background:`${C.teal}15`, border:`1px solid ${C.teal}30`, borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>View</button></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* New Invoice Modal */}
      <Modal open={showNew} onClose={()=>{setShowNew(false);setError("");}} title="New Invoice" width={720}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:4 }}>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.textMid, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>Customer *</label>
            <select value={form.customer_id} onChange={e=>fv("customer_id")(e.target.value)}
              style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", color:C.text, fontSize:12, outline:"none" }}>
              <option value="">Select customer…</option>
              {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Input label="Invoice Number" value={form.number} onChange={fv("number")} placeholder="INV-0001"/>
          <Input label="Invoice Date" value={form.date} onChange={fv("date")} type="date"/>
          <Input label="Due Date" value={form.due_date} onChange={fv("due_date")} type="date"/>
          <Select label="Currency" value={form.currency} onChange={fv("currency")} options={["AED","USD","EUR","GBP"]}/>
          <Input label="Notes" value={form.notes} onChange={fv("notes")} placeholder="Optional notes"/>
        </div>
        <div style={{ fontSize:10, fontWeight:700, color:C.textMid, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>Line Items</div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr><TH>Description</TH><TH>Qty</TH><TH>Unit Price</TH><TH>VAT %</TH><TH>Amount</TH><TH></TH></tr></thead>
          <tbody>
            {form.items.map((item,i)=>(
              <tr key={i}>
                <TD><input value={item.description} onChange={e=>updateLine(i,"description",e.target.value)} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"6px 8px", color:C.text, fontSize:12, width:"95%" }}/></TD>
                <TD><input type="number" value={item.quantity} onChange={e=>updateLine(i,"quantity",+e.target.value)} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"6px 8px", color:C.text, fontSize:12, width:55 }}/></TD>
                <TD><input type="number" value={item.unit_price} onChange={e=>updateLine(i,"unit_price",+e.target.value)} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"6px 8px", color:C.text, fontSize:12, width:90 }}/></TD>
                <TD><input type="number" value={item.tax_rate} onChange={e=>updateLine(i,"tax_rate",+e.target.value)} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"6px 8px", color:C.text, fontSize:12, width:50 }}/></TD>
                <TD style={{ fontFamily:font, color:C.teal }}>AED {((item.quantity||0)*(item.unit_price||0)).toLocaleString()}</TD>
                <TD><button onClick={()=>removeLine(i)} style={{ background:"none", border:"none", cursor:"pointer", color:C.rose, fontSize:18 }}>×</button></TD>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addLine} style={{ marginTop:10, fontSize:11, color:C.teal, background:"none", border:`1px dashed ${C.teal}40`, borderRadius:8, padding:"7px 14px", cursor:"pointer", width:"100%" }}>+ Add Line Item</button>
        <div style={{ marginTop:14, padding:14, background:C.surface, borderRadius:10, display:"flex", flexDirection:"column", gap:8 }}>
          {[["Subtotal",subtotal],["VAT",vatAmt],["Total",subtotal+vatAmt]].map(([l,v])=>(
            <div key={l} style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:12, color:l==="Total"?C.text:C.textMid, fontWeight:l==="Total"?700:400 }}>{l}</span>
              <span style={{ fontSize:12, color:l==="Total"?C.teal:C.text, fontWeight:700, fontFamily:font }}>AED {v.toLocaleString()}</span>
            </div>
          ))}
        </div>
        {error && <div style={{ marginTop:12, padding:"10px 14px", background:`${C.rose}12`, border:`1px solid ${C.rose}30`, borderRadius:9, fontSize:12, color:C.rose }}>⚠ {error}</div>}
        <div style={{ display:"flex", gap:10, marginTop:18 }}>
          <Btn variant="ghost" onClick={()=>{setShowNew(false);setError("");}}>Cancel</Btn>
          <Btn onClick={createInvoice}>{saving?"Saving…":"Create Invoice"}</Btn>
        </div>
      </Modal>

      {/* Invoice Detail Modal */}
      <Modal open={!!showDetail} onClose={()=>setShowDetail(null)} title={showDetail?.number||""} width={580}>
        {showDetail && (<div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
            {[["Customer",showDetail.customer_name||"—"],["Date",showDetail.date],["Due Date",showDetail.due_date],["Status",""]].map(([l,v],i)=>(
              <div key={i}><div style={{ fontSize:10, color:C.textDim, textTransform:"uppercase", marginBottom:4, letterSpacing:"0.07em" }}>{l}</div>
              <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{l==="Status"?<Pill status={showDetail.status}/>:v}</div></div>
            ))}
          </div>
          <div style={{ padding:16, background:C.surface, borderRadius:10, marginBottom:14 }}>
            {[["Invoice Amount",parseFloat(showDetail.total||0)],["Amount Paid",parseFloat(showDetail.paid_amount||0)],["Balance Due",parseFloat(showDetail.total||0)-parseFloat(showDetail.paid_amount||0)]].map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:12, color:C.textMid }}>{l}</span>
                <span style={{ fontSize:13, fontWeight:700, color:l==="Balance Due"?C.amber:C.text, fontFamily:font }}>AED {v.toLocaleString()}</span>
              </div>
            ))}
          </div>
          {error && <div style={{ marginBottom:10, padding:"10px 14px", background:`${C.rose}12`, border:`1px solid ${C.rose}30`, borderRadius:9, fontSize:12, color:C.rose }}>⚠ {error}</div>}
          <div style={{ display:"flex", gap:10 }}>
            {parseFloat(showDetail.paid_amount||0)<parseFloat(showDetail.total||0) && <Btn onClick={openPay}>Record Payment</Btn>}
            <Btn variant="ghost" onClick={()=>setShowDetail(null)}>Close</Btn>
          </div>
        </div>)}
      </Modal>

      {/* Payment Modal */}
      <Modal open={showPay} onClose={()=>{setShowPay(false);setError("");}} title="Record Payment" width={440}>
        <Input label="Amount (AED) *" value={payForm.amount} onChange={v=>setPayForm(p=>({...p,amount:v}))} type="number" placeholder="0.00"/>
        <Input label="Payment Date *" value={payForm.date} onChange={v=>setPayForm(p=>({...p,date:v}))} type="date"/>
        <div style={{ marginBottom:14 }}>
          <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.textMid, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>Payment Method</label>
          <select value={payForm.method} onChange={e=>setPayForm(p=>({...p,method:e.target.value}))}
            style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", color:C.text, fontSize:12, outline:"none" }}>
            {["bank_transfer","cash","cheque","card"].map(m=><option key={m} value={m}>{m.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
          </select>
        </div>
        <Input label="Reference Number" value={payForm.reference} onChange={v=>setPayForm(p=>({...p,reference:v}))} placeholder="TXN-123456"/>
        {error && <div style={{ marginTop:10, padding:"10px 14px", background:`${C.rose}12`, border:`1px solid ${C.rose}30`, borderRadius:9, fontSize:12, color:C.rose }}>⚠ {error}</div>}
        <div style={{ display:"flex", gap:10, marginTop:18 }}>
          <Btn variant="ghost" onClick={()=>{setShowPay(false);setError("");}}>Cancel</Btn>
          <Btn onClick={recordPayment}>{saving?"Recording…":"Record Payment"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: CHART OF ACCOUNTS
═══════════════════════════════════════════════════════════════ */
function ChartOfAccounts({ token }) {
  const h = { Authorization:`Bearer ${token}`, "Content-Type":"application/json" };
  const typeColors = { Asset:C.teal, Liability:C.rose, Equity:C.violet, Income:C.emerald, COGS:C.amber, Expense:C.sky };
  const types = ["All","Asset","Liability","Equity","Income","COGS","Expense"];
  const blank = { code:"", name:"", type:"Asset", parent_id:"" };

  const [accounts, setAccounts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showNew, setShowNew]     = useState(false);
  const [editRow, setEditRow]     = useState(null);
  const [form, setForm]           = useState(blank);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [toast, setToast]         = useState("");

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""),3000); };
  const fetchAccounts = () => {
    setLoading(true);
    fetch(`${API_URL}/api/accounts`,{headers:h}).then(r=>r.json())
      .then(d=>{ setAccounts(Array.isArray(d)?d:[]); setLoading(false); }).catch(()=>setLoading(false));
  };
  useEffect(()=>{ fetchAccounts(); },[token]);

  const filtered = accounts.filter(a =>
    (typeFilter==="All"||a.type===typeFilter) &&
    (a.name.toLowerCase().includes(search.toLowerCase()) || (a.code||"").includes(search))
  );
  const isChild = a => !!a.parent_id;
  const fv = k => v => setForm(p=>({...p,[k]:v}));

  const openNew  = () => { setForm(blank); setError(""); setShowNew(true); };
  const openEdit = row => { setEditRow(row); setForm({ name:row.name }); setError(""); };
  const closeNew = () => { setShowNew(false); setError(""); };
  const closeEdit = () => { setEditRow(null); setError(""); };

  const createAccount = async () => {
    if (!form.code||!form.name||!form.type) { setError("Code, name and type are required."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/accounts`,{ method:"POST", headers:h, body:JSON.stringify({ code:form.code, name:form.name, type:form.type, parent_id:form.parent_id||null }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error||"Failed to create."); setSaving(false); return; }
      closeNew(); fetchAccounts(); showToast("Account created!");
    } catch { setError("Network error."); }
    setSaving(false);
  };

  const updateAccount = async () => {
    if (!form.name) { setError("Name is required."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/accounts/${editRow.id}`,{ method:"PUT", headers:h, body:JSON.stringify({ name:form.name }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error||"Failed to update."); setSaving(false); return; }
      closeEdit(); fetchAccounts(); showToast("Account updated!");
    } catch { setError("Network error."); }
    setSaving(false);
  };

  const usedData = accounts.length > 0 ? accounts : coaData;
  const usedFiltered = usedData.filter(a =>
    (typeFilter==="All"||a.type===typeFilter) &&
    (a.name.toLowerCase().includes(search.toLowerCase()) || (a.code||"").includes(search))
  );
  const isChildRow = a => !!(a.parent_id || a.parent);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {toast && <div style={{ position:"fixed", top:20, right:20, zIndex:2000, background:C.emerald, color:"#fff", padding:"12px 20px", borderRadius:10, fontSize:13, fontWeight:600, boxShadow:"0 4px 20px rgba(0,0,0,0.15)" }}>✓ {toast}</div>}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:C.text, fontFamily:font }}>Chart of Accounts</h2>
          <p style={{ margin:"4px 0 0", fontSize:12, color:C.textMid }}>{usedData.length} accounts</p>
        </div>
        <Btn onClick={openNew}>+ New Account</Btn>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:10 }}>
        {Object.entries(typeColors).map(([type,color])=>{
          const accs = usedData.filter(a=>a.type===type);
          return (
            <Card key={type} style={{ padding:"12px 14px", borderColor:typeFilter===type?color:C.border, cursor:"pointer" }}
              onClick={()=>setTypeFilter(t=>t===type?"All":type)}>
              <div style={{ fontSize:9, fontWeight:700, color, letterSpacing:"0.08em", textTransform:"uppercase" }}>{type}</div>
              <div style={{ fontSize:16, fontWeight:800, color:C.text, fontFamily:font, marginTop:4 }}>{accs.length}</div>
            </Card>
          );
        })}
      </div>

      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:"8px 14px" }}>
          <span style={{ color:C.textDim }}>⌕</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search accounts…"
            style={{ background:"none", border:"none", outline:"none", color:C.text, fontSize:12, flex:1 }}/>
        </div>
        {types.map(t=>(
          <button key={t} onClick={()=>setTypeFilter(t)} style={{ padding:"7px 13px", borderRadius:8, border:"none", cursor:"pointer", fontSize:11, fontWeight:700, background:typeFilter===t?C.teal:C.surface, color:typeFilter===t?C.bg:C.textMid }}>{t}</button>
        ))}
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr><TH>Code</TH><TH>Account Name</TH><TH>Type</TH><TH>Balance (AED)</TH><TH>Actions</TH></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ padding:32, textAlign:"center", color:C.textDim, fontSize:12 }}>Loading…</td></tr>
            : usedFiltered.map((a,i)=>(
              <tr key={a.id||i} onMouseEnter={e=>e.currentTarget.style.background=C.raised} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <TD><span style={{ fontFamily:font, color:C.textMid }}>{a.code}</span></TD>
                <TD><div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {isChildRow(a) && <span style={{ color:C.textDim, fontSize:12 }}>└</span>}
                  <span style={{ fontWeight:isChildRow(a)?400:700 }}>{a.name}</span>
                </div></TD>
                <TD><span style={{ fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:20, background:`${typeColors[a.type]||C.textDim}18`, color:typeColors[a.type]||C.textDim }}>{a.type}</span></TD>
                <TD><span style={{ fontFamily:font, fontWeight:700, color:parseFloat(a.balance||0)>=0?C.text:C.rose }}>{parseFloat(a.balance||0).toLocaleString()}</span></TD>
                <TD><button onClick={()=>openEdit(a)} style={{ fontSize:11, color:"#2563EB", background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Edit</button></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={showNew} onClose={closeNew} title="New Account" width={480}>
        <Input label="Account Code *" value={form.code} onChange={fv("code")} placeholder="e.g. 1150"/>
        <Input label="Account Name *" value={form.name} onChange={fv("name")} placeholder="e.g. Petty Cash"/>
        <div style={{ marginBottom:14 }}>
          <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.textMid, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>Account Type *</label>
          <select value={form.type} onChange={e=>fv("type")(e.target.value)}
            style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", color:C.text, fontSize:12, outline:"none" }}>
            {types.slice(1).map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.textMid, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>Parent Account</label>
          <select value={form.parent_id} onChange={e=>fv("parent_id")(e.target.value)}
            style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", color:C.text, fontSize:12, outline:"none" }}>
            <option value="">None (top-level)</option>
            {usedData.filter(a=>!a.parent_id&&!a.parent).map(a=><option key={a.id||a.code} value={a.id}>{a.code} - {a.name}</option>)}
          </select>
        </div>
        {error && <div style={{ padding:"10px 14px", background:`${C.rose}12`, border:`1px solid ${C.rose}30`, borderRadius:9, fontSize:12, color:C.rose }}>⚠ {error}</div>}
        <div style={{ display:"flex", gap:10, marginTop:16 }}>
          <Btn variant="ghost" onClick={closeNew}>Cancel</Btn>
          <Btn onClick={createAccount}>{saving?"Saving…":"Create Account"}</Btn>
        </div>
      </Modal>

      <Modal open={!!editRow} onClose={closeEdit} title={`Edit: ${editRow?.code} ${editRow?.name}`} width={420}>
        <Input label="Account Name *" value={form.name} onChange={fv("name")} placeholder="Account name"/>
        {error && <div style={{ padding:"10px 14px", background:`${C.rose}12`, border:`1px solid ${C.rose}30`, borderRadius:9, fontSize:12, color:C.rose }}>⚠ {error}</div>}
        <div style={{ display:"flex", gap:10, marginTop:16 }}>
          <Btn variant="ghost" onClick={closeEdit}>Cancel</Btn>
          <Btn onClick={updateAccount}>{saving?"Saving…":"Update"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: GENERAL LEDGER / JOURNALS
═══════════════════════════════════════════════════════════════ */
function GeneralLedger({ token }) {
  const h = { Authorization:`Bearer ${token}`, "Content-Type":"application/json" };
  const today = new Date().toISOString().slice(0,10);
  const emptyLine = { account_id:"", debit:0, credit:0, memo:"" };
  const emptyForm = { date:today, reference:"", narration:"", lines:[{...emptyLine},{...emptyLine}] };

  const [journals, setJournals]   = useState([]);
  const [accounts, setAccounts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showNew, setShowNew]     = useState(false);
  const [expanded, setExpanded]   = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [toast, setToast]         = useState("");

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""),3000); };
  const fetchJournals = () => {
    setLoading(true);
    fetch(`${API_URL}/api/journals`,{headers:h}).then(r=>r.json())
      .then(d=>{ setJournals(Array.isArray(d.data)?d.data:[]); setLoading(false); }).catch(()=>setLoading(false));
  };
  useEffect(()=>{
    fetchJournals();
    fetch(`${API_URL}/api/accounts`,{headers:h}).then(r=>r.json()).then(d=>setAccounts(Array.isArray(d)?d:[])).catch(()=>{});
  },[token]);

  const fv = k => v => setForm(p=>({...p,[k]:v}));
  const addLine    = () => setForm(p=>({...p,lines:[...p.lines,{...emptyLine}]}));
  const removeLine = i  => setForm(p=>({...p,lines:p.lines.filter((_,idx)=>idx!==i)}));
  const updateLine = (i,k,v) => setForm(p=>{ const lines=[...p.lines]; lines[i]={...lines[i],[k]:v}; return {...p,lines}; });

  const totalDr  = form.lines.reduce((a,l)=>a+parseFloat(l.debit||0),0);
  const totalCr  = form.lines.reduce((a,l)=>a+parseFloat(l.credit||0),0);
  const balanced = Math.abs(totalDr-totalCr)<0.01 && totalDr>0;

  const usedJournals = journals.length>0 ? journals : journalData;

  const createJournal = async (post=false) => {
    if (!form.date||form.lines.length<2) { setError("Date and at least 2 lines are required."); return; }
    if (!balanced) { setError(`Debits (${totalDr.toFixed(2)}) must equal Credits (${totalCr.toFixed(2)})`); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/journals`,{ method:"POST", headers:h, body:JSON.stringify({ date:form.date, reference:form.reference||null, narration:form.narration||null, lines:form.lines }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error||"Failed to save."); setSaving(false); return; }
      if (post && data.id) {
        await fetch(`${API_URL}/api/journals/${data.id}/post`,{method:"PUT",headers:h});
      }
      setShowNew(false); setForm(emptyForm); fetchJournals(); showToast(post?"Journal posted!":"Journal saved!");
    } catch { setError("Network error."); }
    setSaving(false);
  };

  const postJournal = async id => {
    try { await fetch(`${API_URL}/api/journals/${id}/post`,{method:"PUT",headers:h}); fetchJournals(); showToast("Journal posted!"); }
    catch {}
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {toast && <div style={{ position:"fixed", top:20, right:20, zIndex:2000, background:C.emerald, color:"#fff", padding:"12px 20px", borderRadius:10, fontSize:13, fontWeight:600, boxShadow:"0 4px 20px rgba(0,0,0,0.15)" }}>✓ {toast}</div>}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:C.text, fontFamily:font }}>General Ledger</h2>
          <p style={{ margin:"4px 0 0", fontSize:12, color:C.textMid }}>{usedJournals.length} journal entries</p>
        </div>
        <Btn onClick={()=>{ setForm(emptyForm); setError(""); setShowNew(true); }}>+ New Journal Entry</Btn>
      </div>

      {loading ? <Card><div style={{ padding:32, textAlign:"center", color:C.textDim, fontSize:12 }}>Loading…</div></Card>
      : usedJournals.map((jv,i)=>(
        <Card key={jv.id||i} style={{ cursor:"pointer" }} onClick={()=>setExpanded(expanded===i?null:i)}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", gap:16, alignItems:"center" }}>
              <span style={{ fontFamily:font, color:C.teal, fontWeight:700, fontSize:13 }}>{jv.id||jv.reference}</span>
              <span style={{ fontSize:12, color:C.textMid }}>{jv.date}</span>
              <span style={{ fontSize:12, color:C.text }}>{jv.narration||"—"}</span>
              {jv.reference && <span style={{ fontSize:10, color:C.textDim, background:C.surface, padding:"2px 8px", borderRadius:6 }}>{jv.reference}</span>}
            </div>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <Pill status={jv.status||"Draft"}/>
              <span style={{ color:C.textDim, fontSize:14 }}>{expanded===i?"▲":"▼"}</span>
            </div>
          </div>
          {expanded===i && (
            <div style={{ marginTop:16, borderTop:`1px solid ${C.border}`, paddingTop:16 }}>
              {jv.lines ? (
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead><tr><TH>Account</TH><TH>Memo</TH><TH>Debit (AED)</TH><TH>Credit (AED)</TH></tr></thead>
                  <tbody>
                    {jv.lines.map((l,j)=>(
                      <tr key={j}>
                        <TD>{l.account_name||l.account||"—"}</TD>
                        <TD style={{ color:C.textMid }}>{l.memo||"—"}</TD>
                        <TD><span style={{ fontFamily:font, color:C.emerald }}>{parseFloat(l.debit||l.dr||0)>0?parseFloat(l.debit||l.dr||0).toLocaleString():"—"}</span></TD>
                        <TD><span style={{ fontFamily:font, color:C.rose }}>{parseFloat(l.credit||l.cr||0)>0?parseFloat(l.credit||l.cr||0).toLocaleString():"—"}</span></TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <div style={{ fontSize:12, color:C.textDim, padding:"8px 0" }}>Click to expand lines…</div>}
              {(jv.status==="draft"||jv.status==="Draft") && jv.id && (
                <div style={{ display:"flex", gap:10, marginTop:12 }}>
                  <Btn onClick={e=>{e.stopPropagation();postJournal(jv.id);}}>Post Journal</Btn>
                </div>
              )}
            </div>
          )}
        </Card>
      ))}

      <Modal open={showNew} onClose={()=>{setShowNew(false);setError("");}} title="New Journal Entry" width={760}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:16 }}>
          <Input label="Journal Date *" value={form.date} onChange={fv("date")} type="date"/>
          <Input label="Reference" value={form.reference} onChange={fv("reference")} placeholder="e.g. INV-0001"/>
          <Input label="Narration" value={form.narration} onChange={fv("narration")} placeholder="Entry description…"/>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:10 }}>
          <thead><tr><TH>Account</TH><TH>Memo</TH><TH>Debit (AED)</TH><TH>Credit (AED)</TH><TH></TH></tr></thead>
          <tbody>
            {form.lines.map((l,i)=>(
              <tr key={i}>
                <TD>
                  <select value={l.account_id} onChange={e=>updateLine(i,"account_id",e.target.value)}
                    style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, padding:"6px 8px", color:C.text, fontSize:11, width:"100%" }}>
                    <option value="">Select account…</option>
                    {(accounts.length>0?accounts:coaData).map(a=><option key={a.id||a.code} value={a.id||a.code}>{a.code} — {a.name}</option>)}
                  </select>
                </TD>
                <TD><input value={l.memo} onChange={e=>updateLine(i,"memo",e.target.value)} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"6px 8px", color:C.text, fontSize:11, width:"90%" }}/></TD>
                <TD><input type="number" value={l.debit||""} onChange={e=>updateLine(i,"debit",+e.target.value)} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"6px 8px", color:C.emerald, fontSize:11, width:100, fontFamily:font }}/></TD>
                <TD><input type="number" value={l.credit||""} onChange={e=>updateLine(i,"credit",+e.target.value)} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"6px 8px", color:C.rose, fontSize:11, width:100, fontFamily:font }}/></TD>
                <TD><button onClick={()=>removeLine(i)} style={{ background:"none", border:"none", cursor:"pointer", color:C.rose, fontSize:18 }}>×</button></TD>
              </tr>
            ))}
            <tr style={{ background:C.raised }}>
              <TD colSpan={2}><strong style={{ fontFamily:font }}>TOTAL</strong></TD>
              <TD><strong style={{ fontFamily:font, color:C.emerald }}>{totalDr.toLocaleString()}</strong></TD>
              <TD><strong style={{ fontFamily:font, color:C.rose }}>{totalCr.toLocaleString()}</strong></TD>
              <TD></TD>
            </tr>
          </tbody>
        </table>
        <button onClick={addLine} style={{ fontSize:11, color:C.teal, background:"none", border:`1px dashed ${C.teal}40`, borderRadius:8, padding:"7px 14px", cursor:"pointer", width:"100%", marginBottom:12 }}>+ Add Line</button>
        {totalDr>0 && !balanced && <div style={{ padding:"10px 14px", background:`${C.rose}15`, border:`1px solid ${C.rose}30`, borderRadius:8, fontSize:12, color:C.rose, marginBottom:8 }}>⚠ Not balanced — difference: AED {Math.abs(totalDr-totalCr).toFixed(2)}</div>}
        {balanced && <div style={{ padding:"10px 14px", background:`${C.emerald}15`, border:`1px solid ${C.emerald}30`, borderRadius:8, fontSize:12, color:C.emerald, marginBottom:8 }}>✓ Balanced — AED {totalDr.toLocaleString()}</div>}
        {error && <div style={{ padding:"10px 14px", background:`${C.rose}12`, border:`1px solid ${C.rose}30`, borderRadius:9, fontSize:12, color:C.rose, marginBottom:8 }}>⚠ {error}</div>}
        <div style={{ display:"flex", gap:10, marginTop:6 }}>
          <Btn variant="ghost" onClick={()=>{setShowNew(false);setError("");}}>Cancel</Btn>
          <Btn variant="ghost" onClick={()=>createJournal(false)} style={{ opacity:balanced?1:0.45, pointerEvents:balanced?"auto":"none" }}>{saving?"Saving…":"Save Draft"}</Btn>
          <Btn onClick={()=>createJournal(true)} style={{ opacity:balanced?1:0.45, pointerEvents:balanced?"auto":"none" }}>{saving?"Posting…":"Post Entry"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: BANKING
═══════════════════════════════════════════════════════════════ */
function Banking() {
  const [activeAcc, setActiveAcc] = useState(0);
  const [showRecon, setShowRecon] = useState(false);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:C.text, fontFamily:font }}>Banking</h2>
          <p style={{ margin:"4px 0 0", fontSize:12, color:C.textMid }}>Bank accounts, reconciliation & statement imports</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn variant="ghost">↑ Import Statement</Btn>
          <Btn onClick={()=>setShowRecon(true)}>Reconcile</Btn>
        </div>
      </div>

      {/* Bank Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        {bankAccounts.map((acc,i)=>(
          <div key={i} onClick={()=>setActiveAcc(i)} style={{
            padding:20, borderRadius:14, cursor:"pointer", position:"relative", overflow:"hidden",
            background:`linear-gradient(135deg, ${acc.color}22, ${acc.color}08)`,
            border:`1px solid ${activeAcc===i?acc.color:`${acc.color}30`}`,
            transition:"all 0.2s",
          }}>
            <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80, borderRadius:"50%",
              background:acc.color, opacity:0.1, filter:"blur(20px)" }}/>
            <div style={{ fontSize:10, color:acc.color, fontWeight:700, letterSpacing:"0.07em",
              textTransform:"uppercase", fontFamily:font, marginBottom:10 }}>{acc.name}</div>
            <div style={{ fontSize:10, color:C.textMid, marginBottom:4 }}>{acc.number}</div>
            <div style={{ fontSize:26, fontWeight:800, color:C.text, fontFamily:font, letterSpacing:"-0.02em" }}>
              {acc.balance.toLocaleString()}
            </div>
            <div style={{ fontSize:10, color:C.textMid, marginTop:2 }}>{acc.currency}</div>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`,
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:font }}>
            {bankAccounts[activeAcc].name} — Transactions
          </span>
          <span style={{ fontSize:11, color:C.textMid }}>
            {bankTxns.filter(t=>t.matched).length}/{bankTxns.length} matched
          </span>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>
            <TH>Date</TH><TH>Reference</TH><TH>Description</TH>
            <TH>Amount</TH><TH>Type</TH><TH>Matched To</TH>
          </tr></thead>
          <tbody>
            {bankTxns.map((t,i)=>(
              <tr key={i}
                onMouseEnter={e=>e.currentTarget.style.background=C.raised}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <TD style={{ color:C.textMid }}>{t.date}</TD>
                <TD><span style={{ fontFamily:font, color:C.textMid, fontSize:11 }}>{t.ref}</span></TD>
                <TD>{t.description}</TD>
                <TD>
                  <span style={{ fontFamily:font, fontWeight:700, color:t.amount>0?C.emerald:C.rose }}>
                    {t.amount>0?"+":""}AED {Math.abs(t.amount).toLocaleString()}
                  </span>
                </TD>
                <TD><Pill status={t.type}/></TD>
                <TD>
                  {t.matched
                    ? <span style={{ fontSize:11, color:C.teal, fontFamily:font }}>{t.matched}</span>
                    : <button style={{ fontSize:10, color:C.amber, background:`${C.amber}15`,
                        border:`1px solid ${C.amber}30`, borderRadius:6, padding:"3px 10px", cursor:"pointer" }}>
                        Match
                      </button>
                  }
                </TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={showRecon} onClose={()=>setShowRecon(false)} title="Bank Reconciliation" width={560}>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Select label="Bank Account" value={bankAccounts[activeAcc].name} onChange={()=>{}} options={bankAccounts.map(a=>a.name)}/>
          <Input label="Statement Date" value="" onChange={()=>{}} type="date"/>
          <Input label="Closing Balance per Bank Statement (AED)" value="" onChange={()=>{}} type="number" placeholder="0.00"/>
          <div style={{ padding:16, background:C.surface, borderRadius:10 }}>
            {[
              ["Book Balance (GL)", "1,240,000"],
              ["+ Outstanding Deposits", "48,500"],
              ["− Outstanding Cheques", "24,800"],
              ["Adjusted Book Balance", "1,263,700"],
              ["Bank Statement Balance", "1,263,700"],
              ["Difference", "0"],
            ].map(([l,v],i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between",
                padding:"8px 0", borderBottom:i<5?`1px solid ${C.border}`:"none",
                fontWeight:i===5||i===4?700:400 }}>
                <span style={{ fontSize:12, color:i>=4?C.text:C.textMid }}>{l}</span>
                <span style={{ fontSize:12, fontFamily:font, color:i===5?C.emerald:C.text }}>AED {v}</span>
              </div>
            ))}
          </div>
          <div style={{ padding:12, background:`${C.emerald}10`, border:`1px solid ${C.emerald}30`,
            borderRadius:8, fontSize:12, color:C.emerald }}>
            ✓ Account is fully reconciled for this period.
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn variant="ghost" onClick={()=>setShowRecon(false)}>Cancel</Btn>
            <Btn>Complete Reconciliation</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: INVENTORY
═══════════════════════════════════════════════════════════════ */
function Inventory() {
  const [showNew, setShowNew] = useState(false);
  const totalVal = inventoryItems.reduce((a,i)=>a+i.value,0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:C.text, fontFamily:font }}>Inventory</h2>
          <p style={{ margin:"4px 0 0", fontSize:12, color:C.textMid }}>
            {inventoryItems.length} items · AED {totalVal.toLocaleString()} total value
          </p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn variant="ghost">Stock Adjustment</Btn>
          <Btn onClick={()=>setShowNew(true)}>+ New Item</Btn>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[
          { l:"Total SKUs", v:inventoryItems.length, color:C.teal, sfx:"" },
          { l:"Total Value", v:`AED ${(totalVal/1000).toFixed(0)}K`, color:C.sky, sfx:"" },
          { l:"Low Stock Items", v:inventoryItems.filter(i=>i.status==="Low Stock").length, color:C.rose, sfx:" items" },
          { l:"Avg Margin", v:"46.2", color:C.emerald, sfx:"%" },
        ].map((s,i)=>(
          <Card key={i} style={{ padding:"14px 18px" }}>
            <div style={{ fontSize:10, color:C.textMid, letterSpacing:"0.07em", textTransform:"uppercase", fontFamily:font }}>{s.l}</div>
            <div style={{ fontSize:22, fontWeight:800, color:s.color, marginTop:6, fontFamily:font }}>{s.v}{s.sfx}</div>
          </Card>
        ))}
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>
            <TH>SKU</TH><TH>Item Name</TH><TH>Category</TH><TH>Qty</TH>
            <TH>UOM</TH><TH>Cost</TH><TH>Price</TH><TH>Value</TH><TH>Status</TH>
          </tr></thead>
          <tbody>
            {inventoryItems.map((item,i)=>(
              <tr key={i}
                onMouseEnter={e=>e.currentTarget.style.background=C.raised}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <TD><span style={{ fontFamily:font, color:C.teal, fontSize:11 }}>{item.sku}</span></TD>
                <TD><span style={{ fontWeight:600 }}>{item.name}</span></TD>
                <TD><span style={{ fontSize:11, color:C.textMid }}>{item.category}</span></TD>
                <TD>
                  <span style={{ fontFamily:font, fontWeight:700,
                    color:item.status==="Low Stock"?C.rose:C.text }}>{item.qty}</span>
                </TD>
                <TD style={{ color:C.textMid }}>{item.uom}</TD>
                <TD><span style={{ fontFamily:font }}>AED {item.cost.toLocaleString()}</span></TD>
                <TD><span style={{ fontFamily:font, color:C.emerald }}>AED {item.price.toLocaleString()}</span></TD>
                <TD><span style={{ fontFamily:font, fontWeight:700 }}>AED {item.value.toLocaleString()}</span></TD>
                <TD><Pill status={item.status}/></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={showNew} onClose={()=>setShowNew(false)} title="New Inventory Item" width={520}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Input label="SKU Code" value="" onChange={()=>{}} placeholder="e.g. SKU-007"/>
          <Input label="Item Name" value="" onChange={()=>{}} placeholder="Product or service name"/>
          <Select label="Category" value="Software" onChange={()=>{}} options={["Software","Hardware","Services","Network","Other"]}/>
          <Select label="Unit of Measure" value="Unit" onChange={()=>{}} options={["Unit","Lic","Day","Hr","Kg","Box","Set"]}/>
          <Input label="Cost Price (AED)" value="" onChange={()=>{}} type="number" placeholder="0.00"/>
          <Input label="Selling Price (AED)" value="" onChange={()=>{}} type="number" placeholder="0.00"/>
          <Input label="Opening Stock" value="" onChange={()=>{}} type="number" placeholder="0"/>
          <Input label="Reorder Level" value="" onChange={()=>{}} type="number" placeholder="0"/>
          <Select label="Valuation Method" value="FIFO" onChange={()=>{}} options={["FIFO","Weighted Average"]}/>
          <Select label="Tax Rate" value="Standard 5%" onChange={()=>{}} options={["Standard 5%","Zero Rated","Exempt"]}/>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:8 }}>
          <Btn variant="ghost" onClick={()=>setShowNew(false)}>Cancel</Btn>
          <Btn>Save Item</Btn>
        </div>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: VAT
═══════════════════════════════════════════════════════════════ */
function VAT() {
  const outputTotal = vatData.outputVAT.reduce((a,r)=>a+r.vat,0);
  const inputTotal  = vatData.inputVAT.reduce((a,r)=>a+r.vat,0);
  const netVAT = outputTotal - inputTotal;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:C.text, fontFamily:font }}>VAT Return</h2>
          <p style={{ margin:"4px 0 0", fontSize:12, color:C.textMid }}>{vatData.period} · UAE FTA Submission</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn variant="ghost">Export XML</Btn>
          <Btn>Submit to FTA</Btn>
        </div>
      </div>

      {/* Net VAT Banner */}
      <div style={{ padding:24, borderRadius:14,
        background:`linear-gradient(135deg, ${C.teal}18, ${C.sky}08)`,
        border:`1px solid ${C.teal}40`,
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:11, color:C.teal, fontWeight:700, letterSpacing:"0.08em",
            textTransform:"uppercase", marginBottom:6 }}>Net VAT Payable — {vatData.period}</div>
          <div style={{ fontSize:36, fontWeight:900, color:C.text, fontFamily:font, letterSpacing:"-0.02em" }}>
            AED {netVAT.toLocaleString()}
          </div>
          <div style={{ fontSize:12, color:C.textMid, marginTop:6 }}>Due: 28 January 2025</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10, textAlign:"right" }}>
          <div>
            <div style={{ fontSize:10, color:C.textMid, marginBottom:2 }}>TRN</div>
            <div style={{ fontFamily:font, fontSize:14, color:C.text, fontWeight:700 }}>100234567800003</div>
          </div>
          <div style={{ padding:"8px 14px", background:`${C.amber}18`, border:`1px solid ${C.amber}40`,
            borderRadius:8, fontSize:12, color:C.amber, fontWeight:700 }}>
            ⏳ Pending Submission
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {/* Output VAT */}
        <Card>
          <SHead>Output VAT (Sales)</SHead>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr><TH>Description</TH><TH>Taxable Amt</TH><TH>VAT</TH></tr></thead>
            <tbody>
              {vatData.outputVAT.map((r,i)=>(
                <tr key={i}>
                  <TD>{r.desc}</TD>
                  <TD><span style={{ fontFamily:font }}>AED {r.taxableAmt.toLocaleString()}</span></TD>
                  <TD><span style={{ fontFamily:font, color:C.rose, fontWeight:700 }}>AED {r.vat.toLocaleString()}</span></TD>
                </tr>
              ))}
              <tr style={{ background:C.raised }}>
                <TD><strong>Total Output VAT</strong></TD>
                <TD><strong style={{ fontFamily:font }}>AED {vatData.outputVAT.reduce((a,r)=>a+r.taxableAmt,0).toLocaleString()}</strong></TD>
                <TD><strong style={{ fontFamily:font, color:C.rose }}>AED {outputTotal.toLocaleString()}</strong></TD>
              </tr>
            </tbody>
          </table>
        </Card>

        {/* Input VAT */}
        <Card>
          <SHead>Input VAT (Purchases)</SHead>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr><TH>Description</TH><TH>Taxable Amt</TH><TH>VAT</TH></tr></thead>
            <tbody>
              {vatData.inputVAT.map((r,i)=>(
                <tr key={i}>
                  <TD>{r.desc}</TD>
                  <TD><span style={{ fontFamily:font }}>AED {r.taxableAmt.toLocaleString()}</span></TD>
                  <TD><span style={{ fontFamily:font, color:C.emerald, fontWeight:700 }}>AED {r.vat.toLocaleString()}</span></TD>
                </tr>
              ))}
              <tr style={{ background:C.raised }}>
                <TD><strong>Total Input VAT</strong></TD>
                <TD><strong style={{ fontFamily:font }}>AED {vatData.inputVAT.reduce((a,r)=>a+r.taxableAmt,0).toLocaleString()}</strong></TD>
                <TD><strong style={{ fontFamily:font, color:C.emerald }}>AED {inputTotal.toLocaleString()}</strong></TD>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <SHead>VAT Return Summary</SHead>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
          {[
            { l:"Total Output VAT", v:outputTotal, color:C.rose },
            { l:"Total Input VAT (Recoverable)", v:inputTotal, color:C.emerald },
            { l:"Net VAT Payable", v:netVAT, color:C.amber },
          ].map((s,i)=>(
            <div key={i} style={{ padding:16, background:C.surface, borderRadius:10,
              border:`1px solid ${s.color}30`, textAlign:"center" }}>
              <div style={{ fontSize:10, color:C.textMid, marginBottom:8, textTransform:"uppercase",
                letterSpacing:"0.07em" }}>{s.l}</div>
              <div style={{ fontSize:24, fontWeight:900, color:s.color, fontFamily:font }}>
                AED {s.v.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: REPORTS
═══════════════════════════════════════════════════════════════ */
function Reports() {
  const [active, setActive] = useState("pl");

  const tabs = [
    { id:"pl",   label:"Profit & Loss" },
    { id:"bs",   label:"Balance Sheet" },
    { id:"aging",label:"AR Aging" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:C.text, fontFamily:font }}>Financial Reports</h2>
          <p style={{ margin:"4px 0 0", fontSize:12, color:C.textMid }}>Period: Jan – Dec 2024</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn variant="ghost">↓ PDF</Btn>
          <Btn variant="ghost">↓ Excel</Btn>
        </div>
      </div>

      <div style={{ display:"flex", gap:6 }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setActive(t.id)} style={{
            padding:"8px 18px", borderRadius:9, border:"none", cursor:"pointer", fontSize:12, fontWeight:700,
            background:active===t.id?C.teal:C.surface, color:active===t.id?C.bg:C.textMid }}>
            {t.label}
          </button>
        ))}
      </div>

      {active==="pl" && (
        <Card>
          <SHead>Profit & Loss Statement — FY 2024</SHead>
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {reportPL.map((section,i)=>(
              <div key={i}>
                {section.type==="subtotal"
                  ? <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                      padding:"12px 16px", borderRadius:10,
                      background: section.total>0?`${C.teal}12`:`${C.rose}12`,
                      border:`1px solid ${section.total>0?C.teal:C.rose}30`, margin:"4px 0" }}>
                      <span style={{ fontWeight:800, color:C.text, fontSize:14 }}>{section.label}</span>
                      <span style={{ fontFamily:font, fontWeight:900, fontSize:18,
                        color:section.total>0?C.teal:C.rose }}>
                        AED {section.total.toLocaleString()}
                      </span>
                    </div>
                  : <>
                      <div style={{ fontSize:11, fontWeight:700, color:C.textMid, letterSpacing:"0.07em",
                        textTransform:"uppercase", marginBottom:8, paddingLeft:4 }}>{section.label}</div>
                      {section.items?.map((item,j)=>(
                        <div key={j} style={{ display:"flex", justifyContent:"space-between",
                          padding:"8px 12px", borderRadius:8, cursor:"pointer" }}
                          onMouseEnter={e=>e.currentTarget.style.background=C.raised}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <span style={{ fontSize:13, color:C.text }}>{item.name}</span>
                          <span style={{ fontFamily:font, fontSize:13, color:section.type==="income"?C.emerald:C.rose }}>
                            AED {item.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div style={{ display:"flex", justifyContent:"space-between",
                        padding:"8px 12px", borderTop:`1px solid ${C.border}`, marginTop:4 }}>
                        <span style={{ fontWeight:700, color:C.text }}>Total {section.label}</span>
                        <span style={{ fontFamily:font, fontWeight:700,
                          color:section.type==="income"?C.emerald:C.rose }}>
                          AED {section.total.toLocaleString()}
                        </span>
                      </div>
                    </>
                }
              </div>
            ))}
          </div>
        </Card>
      )}

      {active==="bs" && (
        <Card>
          <SHead>Balance Sheet — As at Dec 31, 2024</SHead>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            <div>
              <div style={{ fontSize:11, color:C.teal, fontWeight:700, letterSpacing:"0.08em",
                textTransform:"uppercase", marginBottom:12 }}>ASSETS</div>
              {coaData.filter(a=>a.type==="Asset"&&!a.parent).map((a,i)=>(
                <div key={i} style={{ marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.textMid, marginBottom:8 }}>{a.name}</div>
                  {coaData.filter(c=>c.parent===a.code).map((c,j)=>(
                    <div key={j} style={{ display:"flex", justifyContent:"space-between",
                      padding:"6px 12px", borderRadius:6 }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.raised}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <span style={{ fontSize:12, color:C.text, paddingLeft:12 }}>└ {c.name}</span>
                      <span style={{ fontFamily:font, fontSize:12 }}>AED {c.balance.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ borderTop:`2px solid ${C.teal}`, paddingTop:10,
                display:"flex", justifyContent:"space-between" }}>
                <strong style={{ color:C.text }}>Total Assets</strong>
                <strong style={{ fontFamily:font, color:C.teal }}>AED {coaData.filter(a=>a.type==="Asset").reduce((s,a)=>s+a.balance,0).toLocaleString()}</strong>
              </div>
            </div>
            <div>
              <div style={{ fontSize:11, color:C.rose, fontWeight:700, letterSpacing:"0.08em",
                textTransform:"uppercase", marginBottom:12 }}>LIABILITIES & EQUITY</div>
              {coaData.filter(a=>["Liability","Equity"].includes(a.type)&&!a.parent).map((a,i)=>(
                <div key={i} style={{ marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.textMid, marginBottom:8 }}>{a.name}</div>
                  {coaData.filter(c=>c.parent===a.code).map((c,j)=>(
                    <div key={j} style={{ display:"flex", justifyContent:"space-between",
                      padding:"6px 12px", borderRadius:6 }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.raised}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <span style={{ fontSize:12, color:C.text, paddingLeft:12 }}>└ {c.name}</span>
                      <span style={{ fontFamily:font, fontSize:12 }}>AED {c.balance.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ borderTop:`2px solid ${C.rose}`, paddingTop:10,
                display:"flex", justifyContent:"space-between" }}>
                <strong style={{ color:C.text }}>Total L & E</strong>
                <strong style={{ fontFamily:font, color:C.rose }}>
                  AED {coaData.filter(a=>["Liability","Equity"].includes(a.type)).reduce((s,a)=>s+a.balance,0).toLocaleString()}
                </strong>
              </div>
            </div>
          </div>
        </Card>
      )}

      {active==="aging" && (
        <Card>
          <SHead>Accounts Receivable Aging</SHead>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr>
              <TH>Customer</TH><TH>Current</TH><TH>1-30 Days</TH><TH>31-60 Days</TH><TH>60+ Days</TH><TH>Total</TH>
            </tr></thead>
            <tbody>
              {[
                { c:"Accenture MENA",    cur:0,      d30:48500,  d60:0,      d90:0 },
                { c:"Emirates NBD",      cur:0,      d30:0,      d60:92000,  d90:0 },
                { c:"ADNOC Distribution",cur:47800,  d30:0,      d60:0,      d90:0 },
                { c:"Mubadala Investment",cur:115000, d30:0,      d60:0,      d90:0 },
                { c:"Majid Al Futtaim",  cur:28900,  d30:0,      d60:0,      d90:0 },
              ].map((row,i)=>{
                const total=row.cur+row.d30+row.d60+row.d90;
                return (
                  <tr key={i}
                    onMouseEnter={e=>e.currentTarget.style.background=C.raised}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <TD style={{ fontWeight:600 }}>{row.c}</TD>
                    <TD><span style={{ fontFamily:font, color:C.text }}>{row.cur?`AED ${row.cur.toLocaleString()}`:"—"}</span></TD>
                    <TD><span style={{ fontFamily:font, color:C.amber }}>{row.d30?`AED ${row.d30.toLocaleString()}`:"—"}</span></TD>
                    <TD><span style={{ fontFamily:font, color:C.rose }}>{row.d60?`AED ${row.d60.toLocaleString()}`:"—"}</span></TD>
                    <TD><span style={{ fontFamily:font, color:C.rose }}>{row.d90?`AED ${row.d90.toLocaleString()}`:"—"}</span></TD>
                    <TD><span style={{ fontFamily:font, fontWeight:700 }}>AED {total.toLocaleString()}</span></TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: CUSTOMERS
═══════════════════════════════════════════════════════════════ */
function Customers({ token }) {
  const h = { Authorization:`Bearer ${token}`, "Content-Type":"application/json" };
  const blank = { name:"", email:"", phone:"", address:"", credit_limit:"0" };
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(blank);
  const [viewInvs, setViewInvs] = useState([]);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [toast, setToast]       = useState("");

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  const fetchRows = () => {
    setLoading(true);
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    fetch(`${API_URL}/api/customers${q}`, { headers:h })
      .then(r=>r.json()).then(d=>{ setRows(Array.isArray(d.data)?d.data:[]); setLoading(false); })
      .catch(()=>setLoading(false));
  };
  useEffect(()=>{ fetchRows(); }, [token, search]);

  const openNew    = ()    => { setForm(blank); setError(""); setModal("new"); };
  const openEdit   = row   => { setSelected(row); setForm({ name:row.name, email:row.email||"", phone:row.phone||"", address:row.address||"", credit_limit:String(row.credit_limit||0) }); setError(""); setModal("edit"); };
  const openDelete = row   => { setSelected(row); setModal("delete"); };
  const openView   = async row => {
    setSelected(row); setModal("view"); setViewInvs([]);
    try { const r = await fetch(`${API_URL}/api/customers/${row.id}/invoices`,{headers:h}); const d = await r.json(); setViewInvs(Array.isArray(d)?d:[]); } catch {}
  };
  const closeModal = () => { setModal(null); setSelected(null); setError(""); };
  const fv = k => v => setForm(p=>({...p,[k]:v}));

  const save = async () => {
    if (!form.name.trim()) { setError("Customer name is required."); return; }
    setSaving(true); setError("");
    const body = { name:form.name, email:form.email||null, phone:form.phone||null, address:form.address||null, credit_limit:parseFloat(form.credit_limit)||0 };
    try {
      const url = modal==="edit" ? `${API_URL}/api/customers/${selected.id}` : `${API_URL}/api/customers`;
      const res = await fetch(url,{ method:modal==="edit"?"PUT":"POST", headers:h, body:JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.error||"Failed to save."); setSaving(false); return; }
      closeModal(); fetchRows(); showToast(modal==="edit"?"Customer updated!":"Customer created!");
    } catch { setError("Network error."); }
    setSaving(false);
  };

  const softDelete = async () => {
    setSaving(true);
    try { await fetch(`${API_URL}/api/customers/${selected.id}`,{method:"PUT",headers:h,body:JSON.stringify({is_active:false})}); closeModal(); fetchRows(); showToast("Customer removed."); }
    catch { setError("Network error."); }
    setSaving(false);
  };

  const outstanding = list => list.reduce((a,i)=>a+(parseFloat(i.total||0)-parseFloat(i.paid_amount||0)),0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {toast && <div style={{ position:"fixed", top:20, right:20, zIndex:2000, background:C.emerald, color:"#fff", padding:"12px 20px", borderRadius:10, fontSize:13, fontWeight:600, boxShadow:"0 4px 20px rgba(0,0,0,0.15)" }}>✓ {toast}</div>}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:C.text, fontFamily:font }}>Customers</h2>
          <p style={{ margin:"4px 0 0", fontSize:12, color:C.textMid }}>{rows.length} customers</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:"8px 14px", width:220 }}>
            <span style={{ color:C.textDim }}>⌕</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search customers…"
              style={{ background:"none", border:"none", outline:"none", color:C.text, fontSize:12, flex:1 }}/>
          </div>
          <Btn onClick={openNew}>+ New Customer</Btn>
        </div>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr><TH>Name</TH><TH>Email</TH><TH>Phone</TH><TH>Credit Limit</TH><TH>Status</TH><TH>Actions</TH></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ padding:32, textAlign:"center", color:C.textDim, fontSize:12 }}>Loading…</td></tr>
            : rows.length===0 ? <tr><td colSpan={6} style={{ padding:32, textAlign:"center", color:C.textDim, fontSize:12 }}>No customers yet. Add your first customer.</td></tr>
            : rows.map(row=>(
              <tr key={row.id} onMouseEnter={e=>e.currentTarget.style.background=C.raised} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <TD><span onClick={()=>openView(row)} style={{ color:"#2563EB", cursor:"pointer", fontWeight:600 }}>{row.name}</span></TD>
                <TD style={{ color:C.textMid }}>{row.email||"—"}</TD>
                <TD style={{ color:C.textMid }}>{row.phone||"—"}</TD>
                <TD><span style={{ fontFamily:font }}>AED {parseFloat(row.credit_limit||0).toLocaleString()}</span></TD>
                <TD><Pill status={row.is_active?"Active":"Inactive"}/></TD>
                <TD><div style={{ display:"flex", gap:6 }}>
                  <button onClick={()=>openView(row)} style={{ fontSize:11, color:C.teal, background:`${C.teal}15`, border:`1px solid ${C.teal}30`, borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>View</button>
                  <button onClick={()=>openEdit(row)} style={{ fontSize:11, color:"#2563EB", background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Edit</button>
                  <button onClick={()=>openDelete(row)} style={{ fontSize:11, color:C.rose, background:`${C.rose}10`, border:`1px solid ${C.rose}30`, borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Delete</button>
                </div></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modal==="new"||modal==="edit"} onClose={closeModal} title={modal==="edit"?"Edit Customer":"New Customer"} width={500}>
        <Input label="Customer Name *" value={form.name} onChange={fv("name")} placeholder="e.g. Acme Corp Ltd"/>
        <Input label="Email Address" value={form.email} onChange={fv("email")} type="email" placeholder="info@acmecorp.com"/>
        <Input label="Phone Number" value={form.phone} onChange={fv("phone")} placeholder="+971 50 123 4567"/>
        <div style={{ marginBottom:14 }}>
          <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.textMid, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>Address</label>
          <textarea value={form.address} onChange={e=>fv("address")(e.target.value)} rows={3} placeholder="Full address…"
            style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", color:C.text, fontSize:12, outline:"none", boxSizing:"border-box", fontFamily:sansFont, resize:"vertical" }}/>
        </div>
        <Input label="Credit Limit (AED)" value={form.credit_limit} onChange={fv("credit_limit")} type="number" placeholder="0"/>
        {error && <div style={{ marginTop:10, padding:"10px 14px", background:`${C.rose}12`, border:`1px solid ${C.rose}30`, borderRadius:9, fontSize:12, color:C.rose }}>⚠ {error}</div>}
        <div style={{ display:"flex", gap:10, marginTop:18 }}>
          <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
          <Btn onClick={save}>{saving?"Saving…":modal==="edit"?"Update Customer":"Create Customer"}</Btn>
        </div>
      </Modal>

      <Modal open={modal==="delete"} onClose={closeModal} title="Remove Customer" width={420}>
        <p style={{ margin:"0 0 20px", fontSize:13, color:C.text }}>Are you sure you want to remove <strong>{selected?.name}</strong>?</p>
        <div style={{ display:"flex", gap:10 }}>
          <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
          <Btn variant="danger" onClick={softDelete}>{saving?"Removing…":"Yes, Remove"}</Btn>
        </div>
      </Modal>

      <Modal open={modal==="view"} onClose={closeModal} title={selected?.name||""} width={640}>
        {selected && (<div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
            {[["Email",selected.email||"—"],["Phone",selected.phone||"—"],["Credit Limit",`AED ${parseFloat(selected.credit_limit||0).toLocaleString()}`],["Status",""]].map(([l,v],i)=>(
              <div key={i}>
                <div style={{ fontSize:10, color:C.textDim, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:4 }}>{l}</div>
                <div style={{ fontSize:13, color:C.text, fontWeight:600 }}>{l==="Status"?<Pill status={selected.is_active?"Active":"Inactive"}/>:v}</div>
              </div>
            ))}
          </div>
          {selected.address && <div style={{ marginBottom:14 }}><div style={{ fontSize:10, color:C.textDim, textTransform:"uppercase", marginBottom:4 }}>Address</div><div style={{ fontSize:12, color:C.text }}>{selected.address}</div></div>}
          <div style={{ fontSize:11, fontWeight:700, color:C.textMid, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>
            Invoices — Outstanding: <span style={{ color:C.amber }}>AED {outstanding(viewInvs).toLocaleString()}</span>
          </div>
          {viewInvs.length===0
            ? <div style={{ padding:16, textAlign:"center", color:C.textDim, fontSize:12, background:C.raised, borderRadius:10 }}>No invoices found</div>
            : <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr><TH>Invoice #</TH><TH>Date</TH><TH>Amount</TH><TH>Paid</TH><TH>Status</TH></tr></thead>
                <tbody>{viewInvs.map((inv,i)=>(
                  <tr key={i}><TD><span style={{ fontFamily:font, fontWeight:700 }}>{inv.number}</span></TD>
                  <TD style={{ color:C.textMid }}>{inv.date}</TD>
                  <TD><span style={{ fontFamily:font }}>AED {parseFloat(inv.total||0).toLocaleString()}</span></TD>
                  <TD><span style={{ fontFamily:font, color:C.emerald }}>AED {parseFloat(inv.paid_amount||0).toLocaleString()}</span></TD>
                  <TD><Pill status={inv.status}/></TD></tr>
                ))}</tbody>
              </table>
          }
          <div style={{ marginTop:18 }}><Btn variant="ghost" onClick={closeModal}>Close</Btn></div>
        </div>)}
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: SUPPLIERS
═══════════════════════════════════════════════════════════════ */
function Suppliers({ token }) {
  const h = { Authorization:`Bearer ${token}`, "Content-Type":"application/json" };
  const blank = { name:"", email:"", phone:"", address:"" };
  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [modal, setModal]         = useState(null);
  const [selected, setSelected]   = useState(null);
  const [form, setForm]           = useState(blank);
  const [viewBills, setViewBills] = useState([]);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [toast, setToast]         = useState("");

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""),3000); };
  const fetchRows = () => {
    setLoading(true);
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    fetch(`${API_URL}/api/vendors${q}`,{headers:h}).then(r=>r.json())
      .then(d=>{ setRows(Array.isArray(d.data)?d.data:[]); setLoading(false); }).catch(()=>setLoading(false));
  };
  useEffect(()=>{ fetchRows(); },[token,search]);

  const openNew    = ()    => { setForm(blank); setError(""); setModal("new"); };
  const openEdit   = row   => { setSelected(row); setForm({ name:row.name, email:row.email||"", phone:row.phone||"", address:row.address||"" }); setError(""); setModal("edit"); };
  const openDelete = row   => { setSelected(row); setModal("delete"); };
  const openView   = async row => {
    setSelected(row); setModal("view"); setViewBills([]);
    try { const r = await fetch(`${API_URL}/api/vendors/${row.id}/bills`,{headers:h}); const d = await r.json(); setViewBills(Array.isArray(d)?d:[]); } catch {}
  };
  const closeModal = () => { setModal(null); setSelected(null); setError(""); };
  const fv = k => v => setForm(p=>({...p,[k]:v}));

  const save = async () => {
    if (!form.name.trim()) { setError("Supplier name is required."); return; }
    setSaving(true); setError("");
    const body = { name:form.name, email:form.email||null, phone:form.phone||null, address:form.address||null };
    try {
      const url = modal==="edit" ? `${API_URL}/api/vendors/${selected.id}` : `${API_URL}/api/vendors`;
      const res = await fetch(url,{ method:modal==="edit"?"PUT":"POST", headers:h, body:JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.error||"Failed to save."); setSaving(false); return; }
      closeModal(); fetchRows(); showToast(modal==="edit"?"Supplier updated!":"Supplier created!");
    } catch { setError("Network error."); }
    setSaving(false);
  };

  const softDelete = async () => {
    setSaving(true);
    try { await fetch(`${API_URL}/api/vendors/${selected.id}`,{method:"PUT",headers:h,body:JSON.stringify({is_active:false})}); closeModal(); fetchRows(); showToast("Supplier removed."); }
    catch { setError("Network error."); }
    setSaving(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {toast && <div style={{ position:"fixed", top:20, right:20, zIndex:2000, background:C.emerald, color:"#fff", padding:"12px 20px", borderRadius:10, fontSize:13, fontWeight:600, boxShadow:"0 4px 20px rgba(0,0,0,0.15)" }}>✓ {toast}</div>}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:C.text, fontFamily:font }}>Suppliers</h2>
          <p style={{ margin:"4px 0 0", fontSize:12, color:C.textMid }}>{rows.length} suppliers</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:"8px 14px", width:220 }}>
            <span style={{ color:C.textDim }}>⌕</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search suppliers…"
              style={{ background:"none", border:"none", outline:"none", color:C.text, fontSize:12, flex:1 }}/>
          </div>
          <Btn onClick={openNew}>+ New Supplier</Btn>
        </div>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr><TH>Name</TH><TH>Email</TH><TH>Phone</TH><TH>Address</TH><TH>Status</TH><TH>Actions</TH></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ padding:32, textAlign:"center", color:C.textDim, fontSize:12 }}>Loading…</td></tr>
            : rows.length===0 ? <tr><td colSpan={6} style={{ padding:32, textAlign:"center", color:C.textDim, fontSize:12 }}>No suppliers yet.</td></tr>
            : rows.map(row=>(
              <tr key={row.id} onMouseEnter={e=>e.currentTarget.style.background=C.raised} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <TD><span onClick={()=>openView(row)} style={{ color:"#2563EB", cursor:"pointer", fontWeight:600 }}>{row.name}</span></TD>
                <TD style={{ color:C.textMid }}>{row.email||"—"}</TD>
                <TD style={{ color:C.textMid }}>{row.phone||"—"}</TD>
                <TD style={{ color:C.textMid, maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.address||"—"}</TD>
                <TD><Pill status={row.is_active?"Active":"Inactive"}/></TD>
                <TD><div style={{ display:"flex", gap:6 }}>
                  <button onClick={()=>openView(row)} style={{ fontSize:11, color:C.teal, background:`${C.teal}15`, border:`1px solid ${C.teal}30`, borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>View</button>
                  <button onClick={()=>openEdit(row)} style={{ fontSize:11, color:"#2563EB", background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Edit</button>
                  <button onClick={()=>openDelete(row)} style={{ fontSize:11, color:C.rose, background:`${C.rose}10`, border:`1px solid ${C.rose}30`, borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Delete</button>
                </div></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modal==="new"||modal==="edit"} onClose={closeModal} title={modal==="edit"?"Edit Supplier":"New Supplier"} width={500}>
        <Input label="Supplier Name *" value={form.name} onChange={fv("name")} placeholder="e.g. AWS Services"/>
        <Input label="Email Address" value={form.email} onChange={fv("email")} type="email" placeholder="billing@supplier.com"/>
        <Input label="Phone Number" value={form.phone} onChange={fv("phone")} placeholder="+971 4 123 4567"/>
        <div style={{ marginBottom:14 }}>
          <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.textMid, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>Address</label>
          <textarea value={form.address} onChange={e=>fv("address")(e.target.value)} rows={3}
            style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", color:C.text, fontSize:12, outline:"none", boxSizing:"border-box", fontFamily:sansFont, resize:"vertical" }}/>
        </div>
        {error && <div style={{ marginTop:10, padding:"10px 14px", background:`${C.rose}12`, border:`1px solid ${C.rose}30`, borderRadius:9, fontSize:12, color:C.rose }}>⚠ {error}</div>}
        <div style={{ display:"flex", gap:10, marginTop:18 }}>
          <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
          <Btn onClick={save}>{saving?"Saving…":modal==="edit"?"Update Supplier":"Create Supplier"}</Btn>
        </div>
      </Modal>

      <Modal open={modal==="delete"} onClose={closeModal} title="Remove Supplier" width={420}>
        <p style={{ margin:"0 0 20px", fontSize:13, color:C.text }}>Are you sure you want to remove <strong>{selected?.name}</strong>?</p>
        <div style={{ display:"flex", gap:10 }}>
          <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
          <Btn variant="danger" onClick={softDelete}>{saving?"Removing…":"Yes, Remove"}</Btn>
        </div>
      </Modal>

      <Modal open={modal==="view"} onClose={closeModal} title={selected?.name||""} width={600}>
        {selected && (<div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
            {[["Email",selected.email||"—"],["Phone",selected.phone||"—"],["Status",""]].map(([l,v],i)=>(
              <div key={i}><div style={{ fontSize:10, color:C.textDim, textTransform:"uppercase", marginBottom:4 }}>{l}</div>
              <div style={{ fontSize:13, color:C.text, fontWeight:600 }}>{l==="Status"?<Pill status={selected.is_active?"Active":"Inactive"}/>:v}</div></div>
            ))}
          </div>
          <div style={{ fontSize:11, fontWeight:700, color:C.textMid, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>Bills</div>
          {viewBills.length===0
            ? <div style={{ padding:16, textAlign:"center", color:C.textDim, fontSize:12, background:C.raised, borderRadius:10 }}>No bills found</div>
            : <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr><TH>Bill #</TH><TH>Date</TH><TH>Amount</TH><TH>Status</TH></tr></thead>
                <tbody>{viewBills.map((b,i)=>(
                  <tr key={i}><TD><span style={{ fontFamily:font, fontWeight:700 }}>{b.number}</span></TD>
                  <TD style={{ color:C.textMid }}>{b.date}</TD>
                  <TD><span style={{ fontFamily:font }}>AED {parseFloat(b.total||0).toLocaleString()}</span></TD>
                  <TD><Pill status={b.status}/></TD></tr>
                ))}</tbody>
              </table>
          }
          <div style={{ marginTop:18 }}><Btn variant="ghost" onClick={closeModal}>Close</Btn></div>
        </div>)}
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: BILLS
═══════════════════════════════════════════════════════════════ */
function Bills({ token }) {
  const h = { Authorization:`Bearer ${token}`, "Content-Type":"application/json" };
  const today = new Date().toISOString().slice(0,10);
  const emptyLine = { description:"", quantity:1, unit_price:0 };
  const emptyForm = { vendor_id:"", number:"", date:today, due_date:"", notes:"", items:[{...emptyLine}] };
  const emptyPay  = { amount:"", date:today, method:"bank_transfer", reference:"" };

  const [bills, setBills]           = useState([]);
  const [vendors, setVendors]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState("All");
  const [showNew, setShowNew]       = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [showPay, setShowPay]       = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [payForm, setPayForm]       = useState(emptyPay);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const [toast, setToast]           = useState("");

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  const fetchBills = () => {
    setLoading(true);
    fetch(`${API_URL}/api/bills`,{headers:h}).then(r=>r.json())
      .then(d=>{ setBills(Array.isArray(d.data)?d.data:[]); setLoading(false); }).catch(()=>setLoading(false));
  };
  useEffect(()=>{
    fetchBills();
    fetch(`${API_URL}/api/vendors`,{headers:h}).then(r=>r.json()).then(d=>setVendors(Array.isArray(d.data)?d.data:[])).catch(()=>{});
  },[token]);

  const nextNum = () => { const n=bills.map(b=>parseInt((b.number||"").replace(/\D/g,""))||0); return `BILL-${String(Math.max(0,...n)+1).padStart(4,"0")}`; };
  const openNew = () => { setForm({...emptyForm,number:nextNum(),date:today}); setError(""); setShowNew(true); };
  const filtered = filter==="All" ? bills : bills.filter(b=>b.status===filter);
  const lineTotal = form.items.reduce((a,it)=>a+(parseFloat(it.quantity||1)*parseFloat(it.unit_price||0)),0);
  const addLine = () => setForm(p=>({...p,items:[...p.items,{...emptyLine}]}));
  const removeLine = i => setForm(p=>({...p,items:p.items.filter((_,idx)=>idx!==i)}));
  const updateLine = (i,k,v) => setForm(p=>{ const items=[...p.items]; items[i]={...items[i],[k]:v}; return {...p,items}; });
  const fv = k => v => setForm(p=>({...p,[k]:v}));

  const createBill = async () => {
    if (!form.vendor_id||!form.number||!form.date||!form.due_date) { setError("Supplier, bill number, date and due date are required."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/bills`,{ method:"POST", headers:h, body:JSON.stringify({ vendor_id:form.vendor_id, number:form.number, date:form.date, due_date:form.due_date, notes:form.notes||null, lines:form.items }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error||"Failed to create bill."); setSaving(false); return; }
      setShowNew(false); fetchBills(); showToast("Bill created!");
    } catch { setError("Network error."); }
    setSaving(false);
  };

  const openPay = () => {
    const bal = parseFloat(showDetail.total||0)-parseFloat(showDetail.paid_amount||0);
    setPayForm({...emptyPay, amount:bal.toFixed(2)}); setError(""); setShowPay(true);
  };

  const recordPayment = async () => {
    if (!payForm.amount||parseFloat(payForm.amount)<=0) { setError("Enter a valid amount."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/bills/${showDetail.id}/payment`,{ method:"POST", headers:h, body:JSON.stringify({ amount:parseFloat(payForm.amount), date:payForm.date, method:payForm.method, reference:payForm.reference||null }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error||"Failed."); setSaving(false); return; }
      setShowPay(false); setShowDetail(null); fetchBills(); showToast("Payment recorded!");
    } catch { setError("Network error."); }
    setSaving(false);
  };

  const approveBill = async id => {
    try { await fetch(`${API_URL}/api/bills/${id}/approve`,{method:"PUT",headers:h}); fetchBills(); showToast("Bill approved!"); }
    catch {}
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {toast && <div style={{ position:"fixed", top:20, right:20, zIndex:2000, background:C.emerald, color:"#fff", padding:"12px 20px", borderRadius:10, fontSize:13, fontWeight:600, boxShadow:"0 4px 20px rgba(0,0,0,0.15)" }}>✓ {toast}</div>}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:C.text, fontFamily:font }}>Bills</h2>
          <p style={{ margin:"4px 0 0", fontSize:12, color:C.textMid }}>{bills.length} bills · AED {bills.reduce((a,b)=>a+parseFloat(b.total||0),0).toLocaleString()} total</p>
        </div>
        <Btn onClick={openNew}>+ New Bill</Btn>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[
          { label:"Total Bills",      value:bills.reduce((a,b)=>a+parseFloat(b.total||0),0),                           color:C.teal },
          { label:"Paid",             value:bills.reduce((a,b)=>a+parseFloat(b.paid_amount||0),0),                     color:C.emerald },
          { label:"Outstanding",      value:bills.reduce((a,b)=>a+parseFloat(b.total||0)-parseFloat(b.paid_amount||0),0), color:C.amber },
          { label:"Pending Approval", value:bills.filter(b=>b.status==="draft").length, color:C.rose, isCount:true },
        ].map((s,i)=>(
          <Card key={i} style={{ padding:"14px 18px" }}>
            <div style={{ fontSize:10, color:C.textMid, letterSpacing:"0.07em", textTransform:"uppercase", fontFamily:font }}>{s.label}</div>
            <div style={{ fontSize:20, fontWeight:800, color:s.color, marginTop:6, fontFamily:font }}>{s.isCount?s.value:`AED ${s.value.toLocaleString()}`}</div>
          </Card>
        ))}
      </div>

      <div style={{ display:"flex", gap:6 }}>
        {["All","draft","approved","paid","partial","overdue"].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{ padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer", fontSize:11, fontWeight:700, background:filter===s?C.teal:C.surface, color:filter===s?C.bg:C.textMid }}>{s}</button>
        ))}
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr><TH>Bill #</TH><TH>Supplier</TH><TH>Date</TH><TH>Due Date</TH><TH>Amount</TH><TH>Paid</TH><TH>Status</TH><TH>Actions</TH></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ padding:32, textAlign:"center", color:C.textDim, fontSize:12 }}>Loading…</td></tr>
            : filtered.length===0 ? <tr><td colSpan={8} style={{ padding:32, textAlign:"center", color:C.textDim, fontSize:12 }}>No bills found.</td></tr>
            : filtered.map((bill,i)=>(
              <tr key={bill.id||i} onMouseEnter={e=>e.currentTarget.style.background=C.raised} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <TD><span style={{ color:C.teal, fontFamily:font, fontWeight:700 }}>{bill.number}</span></TD>
                <TD>{bill.vendor_name||"—"}</TD>
                <TD style={{ color:C.textMid }}>{bill.date}</TD>
                <TD style={{ color:bill.status==="overdue"?C.rose:C.textMid }}>{bill.due_date}</TD>
                <TD><span style={{ fontFamily:font, fontWeight:700 }}>AED {parseFloat(bill.total||0).toLocaleString()}</span></TD>
                <TD><span style={{ fontFamily:font, color:C.emerald }}>AED {parseFloat(bill.paid_amount||0).toLocaleString()}</span></TD>
                <TD><Pill status={bill.status}/></TD>
                <TD><div style={{ display:"flex", gap:6 }}>
                  <button onClick={()=>setShowDetail(bill)} style={{ fontSize:11, color:C.teal, background:`${C.teal}15`, border:`1px solid ${C.teal}30`, borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>View</button>
                  {bill.status==="draft" && <button onClick={()=>approveBill(bill.id)} style={{ fontSize:11, color:"#2563EB", background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Approve</button>}
                </div></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* New Bill Modal */}
      <Modal open={showNew} onClose={()=>{setShowNew(false);setError("");}} title="New Bill" width={700}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:4 }}>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.textMid, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>Supplier *</label>
            <select value={form.vendor_id} onChange={e=>fv("vendor_id")(e.target.value)}
              style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", color:C.text, fontSize:12, outline:"none" }}>
              <option value="">Select supplier…</option>
              {vendors.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <Input label="Bill Number" value={form.number} onChange={fv("number")} placeholder="BILL-0001"/>
          <Input label="Bill Date" value={form.date} onChange={fv("date")} type="date"/>
          <Input label="Due Date" value={form.due_date} onChange={fv("due_date")} type="date"/>
          <Input label="Notes" value={form.notes} onChange={fv("notes")} placeholder="Optional…"/>
        </div>
        <div style={{ fontSize:10, fontWeight:700, color:C.textMid, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>Line Items</div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr><TH>Description</TH><TH>Qty</TH><TH>Unit Price</TH><TH>Amount</TH><TH></TH></tr></thead>
          <tbody>
            {form.items.map((item,i)=>(
              <tr key={i}>
                <TD><input value={item.description} onChange={e=>updateLine(i,"description",e.target.value)} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"6px 8px", color:C.text, fontSize:12, width:"95%" }}/></TD>
                <TD><input type="number" value={item.quantity} onChange={e=>updateLine(i,"quantity",+e.target.value)} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"6px 8px", color:C.text, fontSize:12, width:55 }}/></TD>
                <TD><input type="number" value={item.unit_price} onChange={e=>updateLine(i,"unit_price",+e.target.value)} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"6px 8px", color:C.text, fontSize:12, width:90 }}/></TD>
                <TD style={{ fontFamily:font, color:C.teal }}>AED {((item.quantity||1)*(item.unit_price||0)).toLocaleString()}</TD>
                <TD><button onClick={()=>removeLine(i)} style={{ background:"none", border:"none", cursor:"pointer", color:C.rose, fontSize:18, lineHeight:1 }}>×</button></TD>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addLine} style={{ marginTop:10, fontSize:11, color:C.teal, background:"none", border:`1px dashed ${C.teal}40`, borderRadius:8, padding:"7px 14px", cursor:"pointer", width:"100%" }}>+ Add Line</button>
        <div style={{ marginTop:12, padding:14, background:C.surface, borderRadius:10, display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontSize:13, fontWeight:700, color:C.text }}>Total</span>
          <span style={{ fontSize:14, fontWeight:800, color:C.teal, fontFamily:font }}>AED {lineTotal.toLocaleString()}</span>
        </div>
        {error && <div style={{ marginTop:10, padding:"10px 14px", background:`${C.rose}12`, border:`1px solid ${C.rose}30`, borderRadius:9, fontSize:12, color:C.rose }}>⚠ {error}</div>}
        <div style={{ display:"flex", gap:10, marginTop:18 }}>
          <Btn variant="ghost" onClick={()=>{setShowNew(false);setError("");}}>Cancel</Btn>
          <Btn onClick={createBill}>{saving?"Saving…":"Create Bill"}</Btn>
        </div>
      </Modal>

      {/* Bill Detail Modal */}
      <Modal open={!!showDetail} onClose={()=>setShowDetail(null)} title={showDetail?.number||""} width={560}>
        {showDetail && (<div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
            {[["Supplier",showDetail.vendor_name||"—"],["Date",showDetail.date],["Due Date",showDetail.due_date],["Status",""]].map(([l,v],i)=>(
              <div key={i}><div style={{ fontSize:10, color:C.textDim, textTransform:"uppercase", marginBottom:4, letterSpacing:"0.07em" }}>{l}</div>
              <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{l==="Status"?<Pill status={showDetail.status}/>:v}</div></div>
            ))}
          </div>
          <div style={{ padding:16, background:C.surface, borderRadius:10, marginBottom:14 }}>
            {[["Total",parseFloat(showDetail.total||0)],["Paid",parseFloat(showDetail.paid_amount||0)],["Balance",parseFloat(showDetail.total||0)-parseFloat(showDetail.paid_amount||0)]].map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:12, color:C.textMid }}>{l}</span>
                <span style={{ fontSize:13, fontWeight:700, color:l==="Balance"?C.amber:C.text, fontFamily:font }}>AED {v.toLocaleString()}</span>
              </div>
            ))}
          </div>
          {error && <div style={{ marginBottom:10, padding:"10px 14px", background:`${C.rose}12`, border:`1px solid ${C.rose}30`, borderRadius:9, fontSize:12, color:C.rose }}>⚠ {error}</div>}
          <div style={{ display:"flex", gap:10 }}>
            {parseFloat(showDetail.paid_amount||0)<parseFloat(showDetail.total||0) && <Btn onClick={openPay}>Record Payment</Btn>}
            {showDetail.status==="draft" && <Btn variant="ghost" onClick={()=>{approveBill(showDetail.id);setShowDetail(null);}}>Approve</Btn>}
            <Btn variant="ghost" onClick={()=>setShowDetail(null)}>Close</Btn>
          </div>
        </div>)}
      </Modal>

      {/* Payment Modal */}
      <Modal open={showPay} onClose={()=>{setShowPay(false);setError("");}} title="Record Payment" width={440}>
        <Input label="Amount (AED) *" value={payForm.amount} onChange={v=>setPayForm(p=>({...p,amount:v}))} type="number" placeholder="0.00"/>
        <Input label="Payment Date *" value={payForm.date} onChange={v=>setPayForm(p=>({...p,date:v}))} type="date"/>
        <div style={{ marginBottom:14 }}>
          <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.textMid, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>Payment Method</label>
          <select value={payForm.method} onChange={e=>setPayForm(p=>({...p,method:e.target.value}))}
            style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px", color:C.text, fontSize:12, outline:"none" }}>
            {["bank_transfer","cash","cheque","card"].map(m=><option key={m} value={m}>{m.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
          </select>
        </div>
        <Input label="Reference Number" value={payForm.reference} onChange={v=>setPayForm(p=>({...p,reference:v}))} placeholder="TXN-123456"/>
        {error && <div style={{ marginTop:10, padding:"10px 14px", background:`${C.rose}12`, border:`1px solid ${C.rose}30`, borderRadius:9, fontSize:12, color:C.rose }}>⚠ {error}</div>}
        <div style={{ display:"flex", gap:10, marginTop:18 }}>
          <Btn variant="ghost" onClick={()=>{setShowPay(false);setError("");}}>Cancel</Btn>
          <Btn onClick={recordPayment}>{saving?"Recording…":"Record Payment"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR NAV CONFIG
═══════════════════════════════════════════════════════════════ */
const NAV_TOP = [
  { id:"dashboard", label:"Dashboard",      icon:"◈" },
  { id:"gl",        label:"General Ledger", icon:"⊞" },
];

const NAV_SALES = [
  { id:"customers",          label:"Customers",         icon:"◉" },
  { id:"quotes",             label:"Quotes",            icon:"◎" },
  { id:"retainer-invoice",   label:"Retainer Invoice",  icon:"◑" },
  { id:"sales-orders",       label:"Sales Orders",      icon:"◐" },
  { id:"recurring-invoice",  label:"Recurring Invoice", icon:"↻" },
  { id:"delivery-note",      label:"Delivery Note",     icon:"◷" },
  { id:"invoices",           label:"Invoices",          icon:"↗", badge:2 },
  { id:"payment-received",   label:"Payment Received",  icon:"⊕" },
  { id:"credit-note",        label:"Credit Note",       icon:"⊖" },
];

const NAV_PURCHASES = [
  { id:"suppliers",          label:"Suppliers",          icon:"◈" },
  { id:"expenses",           label:"Expenses",           icon:"◉" },
  { id:"recurring-expenses", label:"Recurring Expenses", icon:"↻" },
  { id:"purchase-orders",    label:"Purchase Orders",    icon:"◐" },
  { id:"bills",              label:"Bills",              icon:"↙", badge:3 },
  { id:"recurring-bills",    label:"Recurring Bills",    icon:"↙" },
  { id:"payment-made",       label:"Payment Made",       icon:"⊟" },
  { id:"vendor-credit",      label:"Vendor Credit",      icon:"⊖" },
];

const NAV_BOTTOM = [
  { id:"banking",   label:"Banking",            icon:"⊟" },
  { id:"inventory", label:"Inventory",          icon:"⊠", badge:2 },
  { id:"coa",       label:"Chart of Accounts",  icon:"⊕" },
  { id:"vat",       label:"VAT / Tax",          icon:"⊛" },
  { id:"reports",   label:"Reports",            icon:"◧" },
  { id:"payroll",   label:"Payroll",            icon:"⊗" },
  { id:"settings",  label:"Settings",           icon:"⊙" },
];

const ALL_NAV = [...NAV_TOP, ...NAV_SALES, ...NAV_PURCHASES, ...NAV_BOTTOM];

const COMPANIES = ["Horizon Tech FZE", "Nexus Holdings LLC", "Alpha Ventures DMCC"];


/* ═══════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const router = useRouter();
  const [token,   setToken]   = useState(null);
  const [user,    setUser]    = useState(null);
  const [company, setCompany] = useState(null);
  const [ready,   setReady]   = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) { router.replace("/login"); return; }
    setToken(t);
    try { setUser(JSON.parse(localStorage.getItem("user") || "null")); } catch {}
    try { setCompany(JSON.parse(localStorage.getItem("company") || "null")); } catch {}
    setReady(true);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    router.push("/login");
  };

  const [page, setPage]                 = useState("dashboard");
  const [coIdx, setCoIdx]               = useState(0);
  const [showCo, setShowCo]             = useState(false);
  const [showNotif, setShowNotif]       = useState(false);
  const [collapsed, setCollapsed]       = useState(false);
  const [search, setSearch]             = useState("");
  const [expandSales, setExpandSales]   = useState(true);
  const [expandPurchases, setExpandPurchases] = useState(true);

  if (!ready) return (
    <div style={{ height:"100vh", background:"#F8FAFC", display:"flex", alignItems:"center",
      justifyContent:"center", fontFamily:sansFont, color:"#64748B", fontSize:13 }}>
      Loading…
    </div>
  );

  const SW = collapsed ? 58 : 224;
  const companyName = company?.name || "SmartAccounting";
  const userInitials = user?.name ? user.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() : "??";

  const pageLabels = Object.fromEntries(ALL_NAV.map(n=>[n.id,n.label]));

  const renderPage = () => {
    switch(page) {
      case "dashboard":         return <Dashboard token={token}/>;
      case "invoices":          return <Invoices  token={token}/>;
      case "customers":         return <Customers token={token}/>;
      case "suppliers":         return <Suppliers token={token}/>;
      case "bills":             return <Bills     token={token}/>;
      case "coa":               return <ChartOfAccounts token={token}/>;
      case "gl":                return <GeneralLedger   token={token}/>;
      case "banking":           return <Banking/>;
      case "inventory":         return <Inventory/>;
      case "vat":               return <VAT/>;
      case "reports":           return <Reports/>;
      default: {
        const item = ALL_NAV.find(n=>n.id===page);
        return (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            height:380, gap:14 }}>
            <div style={{ width:64, height:64, borderRadius:18, background:`${C.teal}18`,
              border:`1px solid ${C.teal}30`, display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:26, color:C.teal }}>
              {item?.icon || "⊙"}
            </div>
            <div style={{ fontSize:18, fontWeight:800, color:C.text, fontFamily:font }}>{pageLabels[page]}</div>
            <div style={{ fontSize:12, color:C.textMid, textAlign:"center" }}>
              Module in development — coming in Phase 2
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div style={{ display:"flex", height:"100vh", width:"100%",
      background:"#F1F5F9", fontFamily:sansFont, color:C.text, overflow:"hidden" }}>

      {/* ─── SIDEBAR ─── */}
      <div style={{ width:SW, flexShrink:0, height:"100%",
        background:"#1E3A8A",
        borderRight:"none", display:"flex", flexDirection:"column",
        transition:"width 0.2s", overflow:"hidden" }}>

        {/* Logo */}
        <div style={{ padding:collapsed?"18px 0":"16px 18px",
          borderBottom:"1px solid rgba(255,255,255,0.1)",
          display:"flex", alignItems:"center", gap:10,
          justifyContent:collapsed?"center":"flex-start" }}>
          <div style={{ width:32, height:32, borderRadius:8, flexShrink:0,
            background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.2)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:15, fontWeight:900, color:"#fff", fontFamily:font }}>S</div>
          {!collapsed && (
            <div>
              <div style={{ fontSize:12, fontWeight:800, color:"#fff", letterSpacing:"-0.01em" }}>SmartAccounting</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.55)", fontWeight:600, letterSpacing:"0.06em" }}>ERP · v2.0</div>
            </div>
          )}
        </div>

        {/* Company switcher */}
        {!collapsed && (
          <div style={{ padding:"12px", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
            <div style={{
              width:"100%", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)",
              borderRadius:9, padding:"8px 10px",
              display:"flex", alignItems:"center", gap:8, color:"#fff" }}>
              <div style={{ width:22, height:22, borderRadius:5, background:"rgba(255,255,255,0.2)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:9, fontWeight:900, color:"#fff", flexShrink:0 }}>
                {companyName[0]}
              </div>
              <span style={{ fontSize:10, fontWeight:600, flex:1, textAlign:"left",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"rgba(255,255,255,0.9)" }}>
                {companyName}
              </span>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav style={{ flex:1, overflowY:"auto", padding:"10px 8px" }}>

          {/* Top items */}
          {NAV_TOP.map(item=>{
            const active = page===item.id;
            return (
              <button key={item.id} onClick={()=>setPage(item.id)} style={{
                width:"100%", display:"flex", alignItems:"center",
                gap:collapsed?0:9, justifyContent:collapsed?"center":"flex-start",
                padding:collapsed?"10px 0":"9px 10px",
                borderRadius:9, border:"none", cursor:"pointer", marginBottom:2,
                background:active?"#2563EB":"none",
                color:active?"#fff":"rgba(255,255,255,0.65)", position:"relative",
                transition:"background 0.15s" }}
                onMouseEnter={e=>!active&&(e.currentTarget.style.background="rgba(255,255,255,0.08)")}
                onMouseLeave={e=>!active&&(e.currentTarget.style.background="none")}>
                {active && <div style={{ position:"absolute", left:0, top:"20%", height:"60%",
                  width:3, borderRadius:"0 2px 2px 0", background:"#60A5FA" }}/>}
                <span style={{ fontSize:13, flexShrink:0 }}>{item.icon}</span>
                {!collapsed && (
                  <span style={{ fontSize:12, fontWeight:active?700:400, flex:1, textAlign:"left" }}>{item.label}</span>
                )}
              </button>
            );
          })}

          {/* SALES section */}
          {!collapsed && (
            <button onClick={()=>setExpandSales(!expandSales)} style={{
              width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"10px 10px 6px", background:"none", border:"none", cursor:"pointer",
              marginTop:8 }}>
              <span style={{ fontSize:9, fontWeight:700, color:"#93C5FD",
                letterSpacing:"0.1em", textTransform:"uppercase" }}>Sales</span>
              <span style={{ fontSize:9, color:"#93C5FD" }}>{expandSales?"▼":"▶"}</span>
            </button>
          )}
          {collapsed && <div style={{ height:1, background:"rgba(255,255,255,0.1)", margin:"8px 4px" }}/>}
          {(collapsed || expandSales) && NAV_SALES.map(item=>{
            const active = page===item.id;
            return (
              <button key={item.id} onClick={()=>setPage(item.id)} style={{
                width:"100%", display:"flex", alignItems:"center",
                gap:collapsed?0:8, justifyContent:collapsed?"center":"flex-start",
                padding:collapsed?"9px 0":"7px 10px 7px"+(collapsed?"":" 18px"),
                paddingLeft:collapsed?0:18,
                borderRadius:8, border:"none", cursor:"pointer", marginBottom:1,
                background:active?"#2563EB":"none",
                color:active?"#fff":"rgba(255,255,255,0.6)", position:"relative",
                transition:"background 0.15s" }}
                onMouseEnter={e=>!active&&(e.currentTarget.style.background="rgba(255,255,255,0.07)")}
                onMouseLeave={e=>!active&&(e.currentTarget.style.background="none")}>
                {active && <div style={{ position:"absolute", left:0, top:"20%", height:"60%",
                  width:3, borderRadius:"0 2px 2px 0", background:"#60A5FA" }}/>}
                <span style={{ fontSize:11, flexShrink:0 }}>{item.icon}</span>
                {!collapsed && <>
                  <span style={{ fontSize:11, fontWeight:active?600:400, flex:1, textAlign:"left",
                    color:active?"#fff":"#CBD5E1" }}>{item.label}</span>
                  {item.badge && (
                    <span style={{ fontSize:9, fontWeight:700, minWidth:16, height:16,
                      background:"rgba(239,68,68,0.9)", color:"#fff", borderRadius:8,
                      display:"flex", alignItems:"center", justifyContent:"center", padding:"0 4px" }}>
                      {item.badge}
                    </span>
                  )}
                </>}
              </button>
            );
          })}

          {/* PURCHASES section */}
          {!collapsed && (
            <button onClick={()=>setExpandPurchases(!expandPurchases)} style={{
              width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"10px 10px 6px", background:"none", border:"none", cursor:"pointer",
              marginTop:8 }}>
              <span style={{ fontSize:9, fontWeight:700, color:"#93C5FD",
                letterSpacing:"0.1em", textTransform:"uppercase" }}>Purchases</span>
              <span style={{ fontSize:9, color:"#93C5FD" }}>{expandPurchases?"▼":"▶"}</span>
            </button>
          )}
          {collapsed && <div style={{ height:1, background:"rgba(255,255,255,0.1)", margin:"4px 4px 8px" }}/>}
          {(collapsed || expandPurchases) && NAV_PURCHASES.map(item=>{
            const active = page===item.id;
            return (
              <button key={item.id} onClick={()=>setPage(item.id)} style={{
                width:"100%", display:"flex", alignItems:"center",
                gap:collapsed?0:8, justifyContent:collapsed?"center":"flex-start",
                paddingLeft:collapsed?0:18,
                padding:collapsed?"9px 0":"7px 10px 7px 18px",
                borderRadius:8, border:"none", cursor:"pointer", marginBottom:1,
                background:active?"#2563EB":"none",
                color:active?"#fff":"rgba(255,255,255,0.6)", position:"relative",
                transition:"background 0.15s" }}
                onMouseEnter={e=>!active&&(e.currentTarget.style.background="rgba(255,255,255,0.07)")}
                onMouseLeave={e=>!active&&(e.currentTarget.style.background="none")}>
                {active && <div style={{ position:"absolute", left:0, top:"20%", height:"60%",
                  width:3, borderRadius:"0 2px 2px 0", background:"#60A5FA" }}/>}
                <span style={{ fontSize:11, flexShrink:0 }}>{item.icon}</span>
                {!collapsed && <>
                  <span style={{ fontSize:11, fontWeight:active?600:400, flex:1, textAlign:"left",
                    color:active?"#fff":"#CBD5E1" }}>{item.label}</span>
                  {item.badge && (
                    <span style={{ fontSize:9, fontWeight:700, minWidth:16, height:16,
                      background:"rgba(239,68,68,0.9)", color:"#fff", borderRadius:8,
                      display:"flex", alignItems:"center", justifyContent:"center", padding:"0 4px" }}>
                      {item.badge}
                    </span>
                  )}
                </>}
              </button>
            );
          })}

          {/* Bottom items */}
          {!collapsed && <div style={{ height:1, background:"rgba(255,255,255,0.1)", margin:"10px 4px 8px" }}/>}
          {collapsed && <div style={{ height:1, background:"rgba(255,255,255,0.1)", margin:"8px 4px" }}/>}
          {NAV_BOTTOM.map(item=>{
            const active = page===item.id;
            return (
              <button key={item.id} onClick={()=>setPage(item.id)} style={{
                width:"100%", display:"flex", alignItems:"center",
                gap:collapsed?0:9, justifyContent:collapsed?"center":"flex-start",
                padding:collapsed?"10px 0":"9px 10px",
                borderRadius:9, border:"none", cursor:"pointer", marginBottom:2,
                background:active?"#2563EB":"none",
                color:active?"#fff":"rgba(255,255,255,0.65)", position:"relative",
                transition:"background 0.15s" }}
                onMouseEnter={e=>!active&&(e.currentTarget.style.background="rgba(255,255,255,0.08)")}
                onMouseLeave={e=>!active&&(e.currentTarget.style.background="none")}>
                {active && <div style={{ position:"absolute", left:0, top:"20%", height:"60%",
                  width:3, borderRadius:"0 2px 2px 0", background:"#60A5FA" }}/>}
                <span style={{ fontSize:13, flexShrink:0 }}>{item.icon}</span>
                {!collapsed && <>
                  <span style={{ fontSize:12, fontWeight:active?700:400, flex:1, textAlign:"left" }}>{item.label}</span>
                  {item.badge && (
                    <span style={{ fontSize:9, fontWeight:700, minWidth:16, height:16,
                      background:"rgba(239,68,68,0.9)", color:"#fff", borderRadius:8,
                      display:"flex", alignItems:"center", justifyContent:"center", padding:"0 4px" }}>
                      {item.badge}
                    </span>
                  )}
                </>}
              </button>
            );
          })}
        </nav>

        {/* Collapse btn */}
        <div style={{ padding:"10px 8px", borderTop:"1px solid rgba(255,255,255,0.1)" }}>
          <button onClick={()=>setCollapsed(!collapsed)} style={{
            width:"100%", padding:"7px 0", borderRadius:9,
            border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.08)",
            color:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:13 }}>
            {collapsed?"›":"‹"}
          </button>
        </div>
      </div>

      {/* ─── MAIN ─── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Topbar */}
        <div style={{ height:56, background:"#FFFFFF", borderBottom:"1px solid #E2E8F0",
          display:"flex", alignItems:"center", padding:"0 22px", gap:14, flexShrink:0 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:9, color:"#94A3B8", letterSpacing:"0.06em", textTransform:"uppercase" }}>
              {companyName}
            </div>
            <div style={{ fontSize:14, fontWeight:800, color:"#1E293B", fontFamily:font }}>
              {pageLabels[page] || "Dashboard"}
            </div>
          </div>

          {/* Search */}
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#F8FAFC",
            border:"1px solid #E2E8F0", borderRadius:9, padding:"7px 13px", width:220 }}>
            <span style={{ color:"#94A3B8", fontSize:12 }}>⌕</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..."
              style={{ background:"none", border:"none", outline:"none",
                color:"#1E293B", fontSize:11, width:"100%" }}/>
            <span style={{ fontSize:9, color:"#94A3B8", background:"#E2E8F0",
              padding:"1px 5px", borderRadius:4 }}>⌘K</span>
          </div>

          {/* New Entry */}
          <button style={{ padding:"8px 16px", borderRadius:9, border:"none",
            background:"#2563EB", color:"#fff", fontWeight:700, fontSize:11, cursor:"pointer",
            display:"flex", alignItems:"center", gap:5,
            boxShadow:"0 2px 8px rgba(37,99,235,0.3)" }}>
            + New Entry
          </button>

          {/* Notification bell */}
          <div style={{ position:"relative" }}>
            <button onClick={()=>setShowNotif(!showNotif)} style={{
              width:36, height:36, borderRadius:9, border:"1px solid #E2E8F0",
              background:"#F8FAFC", cursor:"pointer", fontSize:15,
              display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
              🔔
              <div style={{ position:"absolute", top:7, right:8, width:6, height:6,
                borderRadius:"50%", background:"#EF4444", border:"1px solid #fff" }}/>
            </button>
            {showNotif && (
              <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, width:290,
                background:"#fff", border:"1px solid #E2E8F0", borderRadius:12,
                overflow:"hidden", zIndex:300, boxShadow:"0 8px 30px rgba(0,0,0,0.12)" }}>
                <div style={{ padding:"12px 16px", borderBottom:"1px solid #E2E8F0",
                  display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:12, fontWeight:700, color:"#1E293B" }}>Notifications</span>
                  <span style={{ fontSize:10, color:"#2563EB", cursor:"pointer" }}>Mark all read</span>
                </div>
                {[
                  { icon:"⚠", c:"#EF4444", msg:"INV-0840 Emirates NBD is overdue", t:"2h ago" },
                  { icon:"✓", c:"#10B981", msg:"BILL-0391 approved by Finance Manager", t:"4h ago" },
                  { icon:"⊛", c:"#F59E0B", msg:"VAT Q4 return due in 10 days", t:"1d ago" },
                  { icon:"⊠", c:"#2563EB", msg:"HP EliteBook 840 stock below reorder", t:"2d ago" },
                ].map((n,i)=>(
                  <div key={i} style={{ display:"flex", gap:10, padding:"11px 16px",
                    alignItems:"flex-start", borderBottom:"1px solid #F1F5F9", cursor:"pointer" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <span style={{ fontSize:13, color:n.c, marginTop:1 }}>{n.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, color:"#1E293B", lineHeight:1.4 }}>{n.msg}</div>
                      <div style={{ fontSize:9, color:"#94A3B8", marginTop:3 }}>{n.t}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User avatar + logout */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#1E293B" }}>{user?.name || "User"}</div>
              <div style={{ fontSize:9, color:"#94A3B8", textTransform:"capitalize" }}>{user?.role || "admin"}</div>
            </div>
            <div style={{ width:34, height:34, borderRadius:9,
              background:"linear-gradient(135deg, #2563EB, #1E40AF)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, fontWeight:800, color:"#fff", cursor:"pointer",
              boxShadow:"0 2px 8px rgba(37,99,235,0.3)" }}>
              {userInitials}
            </div>
            <button
              onClick={logout}
              style={{
                padding:"7px 14px", borderRadius:8, border:"1px solid #FECACA",
                background:"#FEF2F2", cursor:"pointer", fontSize:12, fontWeight:600,
                color:"#DC2626", display:"flex", alignItems:"center", gap:6,
                fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif",
                transition:"all 0.15s",
              }}
              onMouseEnter={e=>{ e.currentTarget.style.background="#FEE2E2"; e.currentTarget.style.borderColor="#FCA5A5"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="#FEF2F2"; e.currentTarget.style.borderColor="#FECACA"; }}
            >
              <span style={{ fontSize:14 }}>⏻</span> Logout
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex:1, overflowY:"auto", padding:22, background:"#F1F5F9" }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
