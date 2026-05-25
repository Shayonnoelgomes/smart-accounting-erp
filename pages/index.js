import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

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
  bg:       "#0A0A0A",
  surface:  "#111111",
  surfaceB: "#1A1A1A",
  raised:   "#1A1A1A",
  border:   "#2A2A2A",
  borderHi: "#F97316",
  teal:     "#F97316",
  tealDim:  "#EA6C0A",
  tealGlow: "rgba(249,115,22,0.08)",
  sky:      "#6366F1",
  violet:   "#A855F7",
  amber:    "#F97316",
  rose:     "#EF4444",
  emerald:  "#22C55E",
  text:     "#FFFFFF",
  textMid:  "#A3A3A3",
  textDim:  "#525252",
  white:    "#111111",
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
  return <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase",
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
      <div style={{ fontSize:14, fontWeight:700, color:C.text, letterSpacing:"0.05em", textTransform:"uppercase", fontFamily:font }}>{children}</div>
      {sub && <div style={{ fontSize:12, color:C.textMid, marginTop:3 }}>{sub}</div>}
    </div>
    {action && <button onClick={action.fn} style={{ fontSize:11, color:C.teal, background:`${C.teal}15`,
      border:`1px solid ${C.teal}40`, borderRadius:8, padding:"5px 12px", cursor:"pointer", fontWeight:700 }}>{action.label}</button>}
  </div>
);

const Btn = ({ children, onClick, variant="primary", style={} }) => {
  const base = {
    padding:"9px 18px", borderRadius:9, border:"none", cursor:"pointer",
    fontSize:13, fontWeight:700, fontFamily:sansFont, transition:"opacity 0.15s", ...style
  };
  const variants = {
    primary: { background:"#F97316", color:"#FFFFFF", boxShadow:"0 2px 8px rgba(249,115,22,0.25)" },
    ghost:   { background:"none", color:C.textMid, border:`1px solid ${C.border}` },
    danger:  { background:`${C.rose}10`, color:C.rose, border:`1px solid ${C.rose}30` },
  };
  return <button onClick={onClick} style={{ ...base, ...variants[variant] }}>{children}</button>;
};

const TH = ({ children }) => (
  <th style={{ fontSize:12, fontWeight:700, color:C.textMid, letterSpacing:"0.06em",
    textTransform:"uppercase", padding:"10px 14px", textAlign:"left",
    background:C.surfaceB, borderBottom:`1px solid ${C.border}`, fontFamily:font }}>{children}</th>
);
const TD = ({ children, style={} }) => (
  <td style={{ padding:"11px 14px", fontSize:13, color:C.text,
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
          <span style={{ fontSize:16, fontWeight:700, color:C.text, fontFamily:font }}>{title}</span>
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
    <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.textMid,
      letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:6 }}>{label}</label>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8,
        padding:"9px 12px", color:C.text, fontSize:13, outline:"none", boxSizing:"border-box",
        fontFamily:sansFont }} />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom:14 }}>
    <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.textMid,
      letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:6 }}>{label}</label>
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8,
        padding:"9px 12px", color:C.text, fontSize:13, outline:"none", boxSizing:"border-box" }}>
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
    { label:"VAT Payable",     value: s.vatPayable     || 0, trend:0, color:C.teal,  icon:"─" },
    { label:"Inventory Value", value: s.inventoryValue || 0, trend:0, color:C.sky,   icon:"▲" },
  ];

  const cfChartData = cashflow.map((row, i) => ({ w:`W${i+1}`, in: parseFloat(row.inflow)||0, out: parseFloat(row.outflow)||0 }));

  const alertItems = alerts ? [
    alerts.overdueInvoices?.length && {
      c:"#EF4444", bg:"#2A0000", bc:"#EF4444",
      i:"⚠", t:"Overdue Invoices",
      d:`${alerts.overdueInvoices.length} invoice${alerts.overdueInvoices.length>1?"s":""} past due`,
    },
    alerts.pendingBills?.length && {
      c:"#F97316", bg:"#1A0F00", bc:"#F97316",
      i:"⏳", t:"Bills Due",
      d:`${alerts.pendingBills.length} bill${alerts.pendingBills.length>1?"s":""} awaiting payment`,
    },
    alerts.vatDue?.length && {
      c:"#A855F7", bg:"#1A0A1A", bc:"#A855F7",
      i:"⊛", t:"VAT Return Due",
      d:`${alerts.vatDue.length} draft return${alerts.vatDue.length>1?"s":""}`,
    },
    alerts.lowInventory?.length && {
      c:"#22C55E", bg:"#001A0A", bc:"#22C55E",
      i:"⊠", t:"Low Stock Alert",
      d:`${alerts.lowInventory.length} item${alerts.lowInventory.length>1?"s":""} below reorder level`,
    },
  ].filter(Boolean) : [
    { c:"#EF4444", bg:"#2A0000", bc:"#EF4444", i:"⚠", t:"Overdue Invoices",   d:"No overdue invoices" },
    { c:"#F97316", bg:"#1A0F00", bc:"#F97316", i:"⏳", t:"Pending Bills",       d:"No pending bills" },
    { c:"#6366F1", bg:"#0A0A1A", bc:"#6366F1", i:"⊟", t:"Bank Reconciliation", d:"Set up bank accounts" },
    { c:"#A855F7", bg:"#1A0A1A", bc:"#A855F7", i:"⊛", t:"VAT Return",          d:"No returns due" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {kpis.map((k,i)=>(
          <Card key={i} style={{ position:"relative", overflow:"hidden", cursor:"default", padding:"22px 24px" }}>
            <div style={{ position:"absolute", top:-20, right:-20, width:90, height:90,
              borderRadius:"50%", background:k.color, opacity:0.12, filter:"blur(20px)" }}/>
            <div style={{ fontSize:13, color:"#A3A3A3", letterSpacing:"0.08em", textTransform:"uppercase",
              fontWeight:700, marginBottom:10, fontFamily:font }}>{k.label}</div>
            <div style={{ fontSize:12, color:"#525252", marginBottom:2 }}>AED</div>
            <div style={{ fontSize:32, fontWeight:800, color:"#FFFFFF", letterSpacing:"-0.03em",
              fontFamily:font }}>{k.value.toLocaleString()}</div>
            <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:12, fontWeight:700, padding:"2px 7px", borderRadius:20,
                color: k.trend>0?C.emerald:k.trend<0?C.rose:C.textMid,
                background: k.trend>0?`${C.emerald}18`:k.trend<0?`${C.rose}18`:C.border }}>
                {k.icon} {Math.abs(k.trend)}%
              </span>
              <span style={{ fontSize:11, color:C.textDim }}>vs last month</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:"grid", gridTemplateColumns:"1.8fr 1fr", gap:20 }}>
        <Card>
          <SHead>Cash Flow Trend</SHead>
          {cfChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={cfChartData}>
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
                <XAxis dataKey="w" tick={{fill:C.textDim,fontSize:12}} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={v=>`${v/1000}K`} tick={{fill:C.textDim,fontSize:11}} axisLine={false} tickLine={false} width={42}/>
                <Tooltip contentStyle={{background:C.surfaceB,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12}}
                  labelStyle={{color:C.text}} formatter={v=>[`AED ${v.toLocaleString()}`,""]}/>
                <Area type="monotone" dataKey="in" stroke={C.teal} strokeWidth={2} fill="url(#gRev)" name="Inflow"/>
                <Area type="monotone" dataKey="out" stroke={C.rose} strokeWidth={2} fill="url(#gExp)" name="Outflow"/>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{height:240,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}>
              <span style={{fontSize:28,opacity:0.3}}>📈</span>
              <span style={{color:"#525252",fontSize:14}}>No cash flow data yet</span>
            </div>
          )}
          <div style={{ display:"flex", gap:18, marginTop:8 }}>
            {[["Inflow",C.teal],["Outflow",C.rose]].map(([l,c])=>(
              <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:8,height:8,borderRadius:2,background:c }}/>
                <span style={{ fontSize:12, color:C.textMid }}>{l}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SHead>Financial Summary</SHead>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:8 }}>
            {[
              { l:"Total Revenue",  v:s.revenue||0,   c:C.teal },
              { l:"Total Expenses", v:s.expenses||0,  c:C.rose },
              { l:"Net Profit",     v:s.profit||0,    c:C.emerald },
              { l:"Receivables",    v:s.arBalance||0, c:C.violet },
              { l:"Payables",       v:s.apBalance||0, c:C.amber },
            ].map(item=>(
              <div key={item.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"12px 16px",borderRadius:8,background:C.raised}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:8,height:8,borderRadius:2,background:item.c}}/>
                  <span style={{fontSize:13,color:C.textMid}}>{item.l}</span>
                </div>
                <span style={{fontSize:13,fontWeight:700,color:item.c,fontFamily:font}}>
                  AED {item.v.toLocaleString()}
                </span>
              </div>
            ))}
            {!s.revenue && (
              <div style={{textAlign:"center",paddingTop:8,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                <span style={{fontSize:24,opacity:0.3}}>💰</span>
                <span style={{fontSize:14,color:"#525252"}}>No transactions yet</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Cash flow + alerts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <Card>
          <SHead>Cash Flow (Weekly)</SHead>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={cfChartData} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="w" tick={{fill:C.textDim,fontSize:12}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v=>`${v/1000}K`} tick={{fill:C.textDim,fontSize:11}} axisLine={false} tickLine={false} width={38}/>
              <Tooltip contentStyle={{background:C.surfaceB,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12}}
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
                padding:"12px 16px", borderRadius:10,
                background:a.bg, border:`1px solid ${a.bc}`, cursor:"pointer" }}>
                <span style={{ fontSize:16, color:a.c }}>{a.i}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{a.t}</div>
                  <div style={{ fontSize:11, color:C.textMid }}>{a.d}</div>
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
                <TD><button onClick={()=>openEdit(a)} style={{ fontSize:11, color:"#F97316", background:"rgba(249,115,22,0.1)", border:"1px solid rgba(249,115,22,0.3)", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Edit</button></TD>
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

  const usedJournals = journals;

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
function Banking({ token }) {
  const h = { Authorization:`Bearer ${token}` };
  const [accounts, setAccounts] = useState([]);
  const [txns, setTxns] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name:"", bank_name:"", account_number:"", currency:"AED", balance:"0" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg,ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/banking`, { headers:h });
      const d = await r.json();
      setAccounts(Array.isArray(d) ? d : []);
    } catch { setAccounts([]); } finally { setLoading(false); }
  };
  const fetchTxns = async (accId) => {
    if (!accId) return;
    try {
      const r = await fetch(`${API_URL}/api/banking/${accId}/transactions`, { headers:h });
      const d = await r.json();
      setTxns(Array.isArray(d) ? d : []);
    } catch { setTxns([]); }
  };
  useEffect(() => { fetchAccounts(); }, [token]);
  useEffect(() => { if (accounts[activeIdx]) fetchTxns(accounts[activeIdx].id); }, [accounts, activeIdx]);

  const setL = (k,v) => setForm(f => ({...f,[k]:v}));
  const saveAccount = async () => {
    setSaving(true);
    try {
      const r = await fetch(`${API_URL}/api/banking`, { method:"POST", headers:{...h,"Content-Type":"application/json"}, body:JSON.stringify(form) });
      if (!r.ok) throw new Error();
      showToast("Bank account added"); setShowNew(false); setForm({ name:"",bank_name:"",account_number:"",currency:"AED",balance:"0" }); fetchAccounts();
    } catch { showToast("Failed to add account",false); } finally { setSaving(false); }
  };

  const accColors = [C.teal, C.sky, C.violet, C.amber, C.emerald];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {toast && <div style={{position:"fixed",top:22,right:22,zIndex:9999,padding:"10px 20px",borderRadius:8,background:toast.ok?C.emerald:C.rose,color:"#fff",fontWeight:700,fontSize:13}}>{toast.msg}</div>}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:C.text, fontFamily:font }}>Banking</h2>
          <p style={{ margin:"4px 0 0", fontSize:12, color:C.textMid }}>{accounts.length} account{accounts.length!==1?"s":""} connected</p>
        </div>
        <button onClick={()=>setShowNew(true)} style={{padding:"8px 18px",borderRadius:8,background:C.teal,color:"#fff",fontWeight:700,border:"none",cursor:"pointer",fontSize:13}}>+ Add Account</button>
      </div>

      {loading ? <div style={{textAlign:"center",padding:40,color:C.textMid}}>Loading...</div> : accounts.length === 0 ? (
        <div style={{textAlign:"center",padding:60,color:C.textMid}}>
          <div style={{fontSize:40,marginBottom:12}}>🏦</div>
          <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:8}}>No bank accounts yet</div>
          <div style={{fontSize:13,marginBottom:20}}>Add your first bank account to start tracking transactions.</div>
          <button onClick={()=>setShowNew(true)} style={{padding:"10px 24px",borderRadius:8,background:C.teal,color:"#fff",fontWeight:700,border:"none",cursor:"pointer"}}>+ Add Bank Account</button>
        </div>
      ) : (
        <>
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${Math.min(accounts.length,3)},1fr)`, gap:14 }}>
            {accounts.map((acc,i)=>(
              <div key={acc.id} onClick={()=>setActiveIdx(i)} style={{
                padding:20, borderRadius:14, cursor:"pointer", position:"relative", overflow:"hidden",
                background:`linear-gradient(135deg, ${accColors[i%accColors.length]}22, ${accColors[i%accColors.length]}08)`,
                border:`1px solid ${activeIdx===i?accColors[i%accColors.length]:`${accColors[i%accColors.length]}30`}`,
              }}>
                <div style={{fontSize:10,color:accColors[i%accColors.length],fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:font,marginBottom:10}}>{acc.name}</div>
                {acc.bank_name && <div style={{fontSize:10,color:C.textMid,marginBottom:4}}>{acc.bank_name}</div>}
                {acc.account_number && <div style={{fontSize:10,color:C.textMid,marginBottom:4}}>{acc.account_number}</div>}
                <div style={{fontSize:26,fontWeight:800,color:C.text,fontFamily:font,letterSpacing:"-0.02em"}}>{parseFloat(acc.balance).toLocaleString()}</div>
                <div style={{fontSize:10,color:C.textMid,marginTop:2}}>{acc.currency}</div>
              </div>
            ))}
          </div>

          <div style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,fontWeight:700,color:C.text}}>{accounts[activeIdx]?.name} — Transactions</span>
              <span style={{fontSize:11,color:C.textMid}}>{txns.length} transaction{txns.length!==1?"s":""}</span>
            </div>
            {txns.length === 0 ? (
              <div style={{textAlign:"center",padding:40,color:C.textMid,fontSize:13}}>No transactions recorded for this account</div>
            ) : (
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{background:C.raised}}>
                  {["Date","Description","Amount","Type","Reconciled"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontWeight:700,color:C.textMid,fontSize:11}}>{h}</th>)}
                </tr></thead>
                <tbody>{txns.map(t=>(
                  <tr key={t.id} style={{borderTop:`1px solid ${C.border}`}}>
                    <td style={{padding:"10px 14px",color:C.textMid}}>{t.date}</td>
                    <td style={{padding:"10px 14px"}}>{t.description||"—"}</td>
                    <td style={{padding:"10px 14px",fontWeight:700,color:t.type==="credit"?C.emerald:C.rose,fontFamily:font}}>
                      {t.type==="credit"?"+":"−"} {parseFloat(t.amount).toLocaleString()}
                    </td>
                    <td style={{padding:"10px 14px"}}><span style={{background:t.type==="credit"?`${C.emerald}18`:`${C.rose}18`,color:t.type==="credit"?C.emerald:C.rose,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{t.type}</span></td>
                    <td style={{padding:"10px 14px",color:t.reconciled?C.emerald:C.textDim,fontSize:12}}>{t.reconciled?"✓ Reconciled":"Unreconciled"}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </>
      )}

      {showNew && <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{background:"#fff",borderRadius:16,padding:28,width:"100%",maxWidth:440}}>
          <div style={{fontSize:17,fontWeight:800,marginBottom:20}}>Add Bank Account</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            {[["Account Name *","name","text"],["Bank Name","bank_name","text"],["Account Number","account_number","text"],["Currency","currency","text"],["Opening Balance","balance","number"]].map(([label,key,type])=>(
              <div key={key} style={{gridColumn:key==="name"?"span 2":"auto"}}>
                <label style={{fontSize:11,fontWeight:700,color:C.textMid}}>{label.toUpperCase()}</label>
                <input type={type} value={form[key]} onChange={e=>setL(key,e.target.value)}
                  style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} />
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
            <button onClick={()=>setShowNew(false)} style={{padding:"9px 22px",borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer"}}>Cancel</button>
            <button onClick={saveAccount} disabled={saving} style={{padding:"9px 22px",borderRadius:8,background:C.teal,color:"#fff",border:"none",cursor:"pointer",fontWeight:700}}>{saving?"Saving...":"Add Account"}</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: INVENTORY
═══════════════════════════════════════════════════════════════ */
function Inventory({ token }) {
  const h = { Authorization:`Bearer ${token}` };
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ sku:"", name:"", category:"", unit_cost:"0", selling_price:"0", quantity:"0", reorder_level:"0", valuation_method:"FIFO" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg,ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

  const fetchItems = async () => {
    setLoading(true);
    try { const r=await fetch(`${API_URL}/api/inventory`,{headers:h}); const d=await r.json(); setItems(d.data||[]); }
    catch { setItems([]); } finally { setLoading(false); }
  };
  useEffect(()=>{ fetchItems(); },[token]);
  const setL=(k,v)=>setForm(f=>({...f,[k]:v}));
  const saveItem = async () => {
    setSaving(true);
    try {
      const r=await fetch(`${API_URL}/api/inventory`,{method:"POST",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify(form)});
      if(!r.ok) throw new Error();
      showToast("Item added"); setShowNew(false); fetchItems();
    } catch { showToast("Failed to add item",false); } finally { setSaving(false); }
  };

  const totalVal = items.reduce((a,i)=>a+parseFloat(i.unit_cost||0)*parseFloat(i.quantity||0),0);
  const lowStock = items.filter(i=>parseFloat(i.quantity||0)<=parseFloat(i.reorder_level||0));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {toast && <div style={{position:"fixed",top:22,right:22,zIndex:9999,padding:"10px 20px",borderRadius:8,background:toast.ok?C.emerald:C.rose,color:"#fff",fontWeight:700,fontSize:13}}>{toast.msg}</div>}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:C.text, fontFamily:font }}>Inventory</h2>
          <p style={{ margin:"4px 0 0", fontSize:12, color:C.textMid }}>{items.length} items · AED {totalVal.toLocaleString()} total value</p>
        </div>
        <button onClick={()=>setShowNew(true)} style={{padding:"8px 18px",borderRadius:8,background:C.teal,color:"#fff",fontWeight:700,border:"none",cursor:"pointer",fontSize:13}}>+ New Item</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[
          { l:"Total SKUs",    v:items.length,   color:C.teal },
          { l:"Total Value",   v:`AED ${(totalVal/1000).toFixed(1)}K`, color:C.sky },
          { l:"Low Stock",     v:lowStock.length, color:C.rose },
          { l:"Categories",    v:new Set(items.map(i=>i.category).filter(Boolean)).size, color:C.emerald },
        ].map((s,i)=>(
          <div key={i} style={{background:C.surface,borderRadius:12,padding:"14px 18px",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,color:C.textMid,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:font}}>{s.l}</div>
            <div style={{fontSize:22,fontWeight:800,color:s.color,marginTop:6,fontFamily:font}}>{s.v}</div>
          </div>
        ))}
      </div>

      {loading ? <div style={{textAlign:"center",padding:40,color:C.textMid}}>Loading...</div> : items.length === 0 ? (
        <div style={{textAlign:"center",padding:60,color:C.textMid}}>
          <div style={{fontSize:40,marginBottom:12}}>📦</div>
          <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:8}}>No inventory items yet</div>
          <div style={{fontSize:13,marginBottom:20}}>Add your first item to start tracking stock.</div>
          <button onClick={()=>setShowNew(true)} style={{padding:"10px 24px",borderRadius:8,background:C.teal,color:"#fff",fontWeight:700,border:"none",cursor:"pointer"}}>+ Add Item</button>
        </div>
      ) : (
        <div style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:C.raised}}>
              {["SKU","Item Name","Category","Qty","Reorder","Cost","Price","Value","Status"].map(h=>(
                <th key={h} style={{padding:"10px 14px",textAlign:"left",fontWeight:700,color:C.textMid,fontSize:11}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{items.map(item=>{
              const val=parseFloat(item.unit_cost||0)*parseFloat(item.quantity||0);
              const isLow=parseFloat(item.quantity||0)<=parseFloat(item.reorder_level||0);
              return(
                <tr key={item.id} style={{borderTop:`1px solid ${C.border}`}}>
                  <td style={{padding:"10px 14px",fontFamily:font,color:C.teal,fontSize:11}}>{item.sku||"—"}</td>
                  <td style={{padding:"10px 14px",fontWeight:600}}>{item.name}</td>
                  <td style={{padding:"10px 14px",color:C.textMid,fontSize:12}}>{item.category||"—"}</td>
                  <td style={{padding:"10px 14px",fontWeight:700,color:isLow?C.rose:C.text}}>{parseFloat(item.quantity||0).toLocaleString()}</td>
                  <td style={{padding:"10px 14px",color:C.textMid}}>{parseFloat(item.reorder_level||0)}</td>
                  <td style={{padding:"10px 14px",fontFamily:font}}>AED {parseFloat(item.unit_cost||0).toLocaleString()}</td>
                  <td style={{padding:"10px 14px",fontFamily:font,color:C.emerald}}>AED {parseFloat(item.selling_price||0).toLocaleString()}</td>
                  <td style={{padding:"10px 14px",fontFamily:font,fontWeight:700}}>AED {val.toLocaleString()}</td>
                  <td style={{padding:"10px 14px"}}><span style={{background:isLow?`${C.rose}18`:`${C.emerald}18`,color:isLow?C.rose:C.emerald,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{isLow?"Low Stock":"In Stock"}</span></td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      )}

      {showNew && <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{background:"#fff",borderRadius:16,padding:28,width:"100%",maxWidth:520}}>
          <div style={{fontSize:17,fontWeight:800,marginBottom:20}}>New Inventory Item</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            {[["SKU Code","sku","text"],["Item Name *","name","text"],["Category","category","text"],["Valuation","valuation_method","text"],["Cost Price","unit_cost","number"],["Selling Price","selling_price","number"],["Opening Stock","quantity","number"],["Reorder Level","reorder_level","number"]].map(([label,key,type])=>(
              <div key={key}>
                <label style={{fontSize:11,fontWeight:700,color:C.textMid}}>{label.toUpperCase()}</label>
                <input type={type} value={form[key]} onChange={e=>setL(key,e.target.value)}
                  style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} />
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
            <button onClick={()=>setShowNew(false)} style={{padding:"9px 22px",borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer"}}>Cancel</button>
            <button onClick={saveItem} disabled={saving} style={{padding:"9px 22px",borderRadius:8,background:C.teal,color:"#fff",border:"none",cursor:"pointer",fontWeight:700}}>{saving?"Saving...":"Save Item"}</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: VAT
═══════════════════════════════════════════════════════════════ */
function VAT({ token }) {
  const h = { Authorization:`Bearer ${token}` };
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ period_start:"", period_end:"" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg,ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

  const fetchReturns = async () => {
    setLoading(true);
    try { const r=await fetch(`${API_URL}/api/vat`,{headers:h}); const d=await r.json(); setReturns(Array.isArray(d)?d:[]); }
    catch { setReturns([]); } finally { setLoading(false); }
  };
  useEffect(()=>{ fetchReturns(); },[token]);

  const generate = async () => {
    setSaving(true);
    try {
      const r=await fetch(`${API_URL}/api/vat`,{method:"POST",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify(form)});
      if(!r.ok) throw new Error((await r.json()).error||"Failed");
      showToast("VAT return generated"); setShowNew(false); fetchReturns();
    } catch(e) { showToast(e.message,false); } finally { setSaving(false); }
  };
  const submit = async (id) => {
    try {
      const r=await fetch(`${API_URL}/api/vat/${id}/submit`,{method:"PUT",headers:h});
      if(!r.ok) throw new Error();
      showToast("Submitted"); fetchReturns();
    } catch { showToast("Failed to submit",false); }
  };

  const latest = returns[0];
  const outputTotal = parseFloat(latest?.output_vat||0);
  const inputTotal  = parseFloat(latest?.input_vat||0);
  const netVAT = outputTotal - inputTotal;

  if (loading) return <div style={{ color:C.textMid, padding:40, textAlign:"center" }}>Loading VAT returns…</div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {toast && <div style={{ position:"fixed", top:20, right:20, zIndex:2000, background:toast.ok?C.emerald:C.rose, color:"#fff", padding:"12px 20px", borderRadius:10, fontSize:13, fontWeight:600, boxShadow:"0 4px 20px rgba(0,0,0,0.15)" }}>{toast.ok?"✓":"✗"} {toast.msg}</div>}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:C.text, fontFamily:font }}>VAT Return</h2>
          <p style={{ margin:"4px 0 0", fontSize:12, color:C.textMid }}>{returns.length} return{returns.length!==1?"s":""} · UAE FTA Submission</p>
        </div>
        <Btn onClick={()=>setShowNew(true)}>+ Generate Return</Btn>
      </div>

      {showNew && (
        <Card>
          <SHead>Generate New VAT Return</SHead>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
            <div>
              <label style={{ fontSize:11, color:C.textMid, display:"block", marginBottom:4 }}>Period Start</label>
              <input type="date" value={form.period_start} onChange={e=>setForm(p=>({...p,period_start:e.target.value}))}
                style={{ width:"100%", padding:"8px 12px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:13 }}/>
            </div>
            <div>
              <label style={{ fontSize:11, color:C.textMid, display:"block", marginBottom:4 }}>Period End</label>
              <input type="date" value={form.period_end} onChange={e=>setForm(p=>({...p,period_end:e.target.value}))}
                style={{ width:"100%", padding:"8px 12px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:13 }}/>
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={generate} disabled={saving}>{saving?"Generating…":"Generate"}</Btn>
            <Btn variant="ghost" onClick={()=>setShowNew(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {returns.length===0 ? (
        <Card>
          <div style={{ textAlign:"center", padding:"48px 0" }}>
            <div style={{ fontSize:36, marginBottom:12 }}>🧾</div>
            <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:6 }}>No VAT returns yet</div>
            <div style={{ fontSize:13, color:C.textMid, marginBottom:20 }}>Generate your first VAT return to get started.</div>
            <Btn onClick={()=>setShowNew(true)}>+ Generate Return</Btn>
          </div>
        </Card>
      ) : (
        <>
          {/* Latest return banner */}
          <div style={{ padding:24, borderRadius:14,
            background:`linear-gradient(135deg, ${C.teal}18, ${C.sky}08)`,
            border:`1px solid ${C.teal}40`,
            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:11, color:C.teal, fontWeight:700, letterSpacing:"0.08em",
                textTransform:"uppercase", marginBottom:6 }}>
                Net VAT Payable — {latest?.period_start ? `${latest.period_start} – ${latest.period_end}` : "Latest Period"}
              </div>
              <div style={{ fontSize:36, fontWeight:900, color:C.text, fontFamily:font, letterSpacing:"-0.02em" }}>
                AED {netVAT.toLocaleString()}
              </div>
              <div style={{ fontSize:12, color:C.textMid, marginTop:6 }}>
                Status: {latest?.status || "draft"}
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10, textAlign:"right" }}>
              <div style={{ padding:"8px 14px",
                background:latest?.status==="submitted"?`${C.emerald}18`:`${C.amber}18`,
                border:`1px solid ${latest?.status==="submitted"?C.emerald:C.amber}40`,
                borderRadius:8, fontSize:12,
                color:latest?.status==="submitted"?C.emerald:C.amber, fontWeight:700 }}>
                {latest?.status==="submitted" ? "✓ Submitted" : "⏳ Draft"}
              </div>
              {latest?.status!=="submitted" && (
                <Btn onClick={()=>submit(latest.id)}>Submit to FTA</Btn>
              )}
            </div>
          </div>

          {/* Summary cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
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

          {/* All returns list */}
          <Card>
            <SHead>All VAT Returns</SHead>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead><tr><TH>Period</TH><TH>Output VAT</TH><TH>Input VAT</TH><TH>Net Payable</TH><TH>Status</TH><TH>Action</TH></tr></thead>
              <tbody>
                {returns.map((r,i)=>{
                  const net = parseFloat(r.output_vat||0) - parseFloat(r.input_vat||0);
                  return (
                    <tr key={i} onMouseEnter={e=>e.currentTarget.style.background=C.raised} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <TD>{r.period_start} – {r.period_end}</TD>
                      <TD><span style={{ fontFamily:font, color:C.rose }}>AED {parseFloat(r.output_vat||0).toLocaleString()}</span></TD>
                      <TD><span style={{ fontFamily:font, color:C.emerald }}>AED {parseFloat(r.input_vat||0).toLocaleString()}</span></TD>
                      <TD><span style={{ fontFamily:font, fontWeight:700 }}>AED {net.toLocaleString()}</span></TD>
                      <TD><span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700,
                        background:r.status==="submitted"?`${C.emerald}18`:`${C.amber}18`,
                        color:r.status==="submitted"?C.emerald:C.amber }}>
                        {r.status==="submitted"?"Submitted":"Draft"}
                      </span></TD>
                      <TD>{r.status!=="submitted" && <Btn variant="ghost" onClick={()=>submit(r.id)}>Submit</Btn>}</TD>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: REPORTS
═══════════════════════════════════════════════════════════════ */
function Reports({ token }) {
  const h = { Authorization:`Bearer ${token}` };
  const [active, setActive] = useState("pl");

  const today = new Date().toISOString().slice(0,10);
  const firstOfYear = `${new Date().getFullYear()}-01-01`;

  const [plFrom, setPlFrom]   = useState(firstOfYear);
  const [plTo,   setPlTo]     = useState(today);
  const [bsDate, setBsDate]   = useState(today);

  const [plData,    setPlData]    = useState(null);
  const [bsData,    setBsData]    = useState(null);
  const [agingData, setAgingData] = useState([]);
  const [loading,   setLoading]   = useState(false);

  const fetchPL = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/reports/profit-loss?from=${plFrom}&to=${plTo}`, { headers:h });
      const d = await r.json();
      setPlData(r.ok ? d : null);
    } catch { setPlData(null); } finally { setLoading(false); }
  };

  const fetchBS = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/reports/balance-sheet?as_at=${bsDate}`, { headers:h });
      const d = await r.json();
      setBsData(r.ok ? d : null);
    } catch { setBsData(null); } finally { setLoading(false); }
  };

  const fetchAging = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/reports/ar-aging`, { headers:h });
      const d = await r.json();
      setAgingData(Array.isArray(d) ? d : []);
    } catch { setAgingData([]); } finally { setLoading(false); }
  };

  useEffect(() => { if (active==="pl")    fetchPL();    }, [active, token]);
  useEffect(() => { if (active==="bs")    fetchBS();    }, [active, token]);
  useEffect(() => { if (active==="aging") fetchAging(); }, [active, token]);

  const tabs = [
    { id:"pl",   label:"Profit & Loss" },
    { id:"bs",   label:"Balance Sheet" },
    { id:"aging",label:"AR Aging" },
  ];

  const EmptyMsg = () => (
    <div style={{ textAlign:"center", padding:"40px 0", color:C.textMid, fontSize:14 }}>
      No transactions found for this period.
    </div>
  );

  const fmtAED = v => `AED ${(parseFloat(v)||0).toLocaleString()}`;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:C.text, fontFamily:font }}>Financial Reports</h2>
          <p style={{ margin:"4px 0 0", fontSize:12, color:C.textMid }}>Real-time data from your accounts</p>
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
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <SHead>Profit & Loss Statement</SHead>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <input type="date" value={plFrom} onChange={e=>setPlFrom(e.target.value)}
                style={{ padding:"6px 10px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12 }}/>
              <span style={{ color:C.textMid, fontSize:12 }}>to</span>
              <input type="date" value={plTo} onChange={e=>setPlTo(e.target.value)}
                style={{ padding:"6px 10px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12 }}/>
              <Btn onClick={fetchPL}>Run</Btn>
            </div>
          </div>
          {loading ? <div style={{ color:C.textMid, padding:20 }}>Loading…</div>
          : !plData ? <EmptyMsg/>
          : (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {/* Revenue */}
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:C.textMid, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:8, paddingLeft:4 }}>Revenue</div>
                {(plData.revenue||[]).length===0
                  ? <div style={{ padding:"8px 12px", color:C.textDim, fontSize:13 }}>No revenue yet</div>
                  : (plData.revenue||[]).map((item,j)=>(
                    <div key={j} style={{ display:"flex", justifyContent:"space-between", padding:"8px 12px", borderRadius:8 }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.raised}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <span style={{ fontSize:13, color:C.text }}>{item.name}</span>
                      <span style={{ fontFamily:font, fontSize:13, color:C.emerald }}>{fmtAED(item.amount)}</span>
                    </div>
                  ))
                }
                <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 12px", borderTop:`1px solid ${C.border}`, marginTop:4 }}>
                  <span style={{ fontWeight:700, color:C.text }}>Total Revenue</span>
                  <span style={{ fontFamily:font, fontWeight:700, color:C.emerald }}>{fmtAED(plData.totalRevenue)}</span>
                </div>
              </div>
              {/* Expenses */}
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:C.textMid, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:8, paddingLeft:4 }}>Expenses</div>
                {(plData.expenses||[]).length===0
                  ? <div style={{ padding:"8px 12px", color:C.textDim, fontSize:13 }}>No expenses yet</div>
                  : (plData.expenses||[]).map((item,j)=>(
                    <div key={j} style={{ display:"flex", justifyContent:"space-between", padding:"8px 12px", borderRadius:8 }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.raised}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <span style={{ fontSize:13, color:C.text }}>{item.name}</span>
                      <span style={{ fontFamily:font, fontSize:13, color:C.rose }}>{fmtAED(item.amount)}</span>
                    </div>
                  ))
                }
                <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 12px", borderTop:`1px solid ${C.border}`, marginTop:4 }}>
                  <span style={{ fontWeight:700, color:C.text }}>Total Expenses</span>
                  <span style={{ fontFamily:font, fontWeight:700, color:C.rose }}>{fmtAED(plData.totalExpenses)}</span>
                </div>
              </div>
              {/* Net */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"12px 16px", borderRadius:10,
                background:(parseFloat(plData.netProfit||0)>=0)?`${C.teal}12`:`${C.rose}12`,
                border:`1px solid ${(parseFloat(plData.netProfit||0)>=0)?C.teal:C.rose}30` }}>
                <span style={{ fontWeight:800, color:C.text, fontSize:14 }}>Net Profit / (Loss)</span>
                <span style={{ fontFamily:font, fontWeight:900, fontSize:18,
                  color:(parseFloat(plData.netProfit||0)>=0)?C.teal:C.rose }}>
                  {fmtAED(plData.netProfit)}
                </span>
              </div>
            </div>
          )}
        </Card>
      )}

      {active==="bs" && (
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <SHead>Balance Sheet</SHead>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <span style={{ color:C.textMid, fontSize:12 }}>As at</span>
              <input type="date" value={bsDate} onChange={e=>setBsDate(e.target.value)}
                style={{ padding:"6px 10px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12 }}/>
              <Btn onClick={fetchBS}>Run</Btn>
            </div>
          </div>
          {loading ? <div style={{ color:C.textMid, padding:20 }}>Loading…</div>
          : !bsData ? <EmptyMsg/>
          : (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              <div>
                <div style={{ fontSize:11, color:C.teal, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:12 }}>ASSETS</div>
                {(bsData.assets||[]).length===0
                  ? <div style={{ color:C.textDim, fontSize:13 }}>No asset accounts</div>
                  : (bsData.assets||[]).map((a,i)=>(
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 12px", borderRadius:6 }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.raised}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <span style={{ fontSize:12, color:C.text }}>{a.name}</span>
                      <span style={{ fontFamily:font, fontSize:12 }}>{fmtAED(a.balance)}</span>
                    </div>
                  ))
                }
                <div style={{ borderTop:`2px solid ${C.teal}`, paddingTop:10, display:"flex", justifyContent:"space-between", marginTop:8 }}>
                  <strong style={{ color:C.text }}>Total Assets</strong>
                  <strong style={{ fontFamily:font, color:C.teal }}>{fmtAED(bsData.totalAssets)}</strong>
                </div>
              </div>
              <div>
                <div style={{ fontSize:11, color:C.rose, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:12 }}>LIABILITIES & EQUITY</div>
                {(bsData.liabilities||[]).length===0 && (bsData.equity||[]).length===0
                  ? <div style={{ color:C.textDim, fontSize:13 }}>No liability/equity accounts</div>
                  : <>
                    {(bsData.liabilities||[]).map((a,i)=>(
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 12px", borderRadius:6 }}
                        onMouseEnter={e=>e.currentTarget.style.background=C.raised}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <span style={{ fontSize:12, color:C.text }}>{a.name}</span>
                        <span style={{ fontFamily:font, fontSize:12 }}>{fmtAED(a.balance)}</span>
                      </div>
                    ))}
                    {(bsData.equity||[]).map((a,i)=>(
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 12px", borderRadius:6 }}
                        onMouseEnter={e=>e.currentTarget.style.background=C.raised}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <span style={{ fontSize:12, color:C.text }}>{a.name}</span>
                        <span style={{ fontFamily:font, fontSize:12 }}>{fmtAED(a.balance)}</span>
                      </div>
                    ))}
                  </>
                }
                <div style={{ borderTop:`2px solid ${C.rose}`, paddingTop:10, display:"flex", justifyContent:"space-between", marginTop:8 }}>
                  <strong style={{ color:C.text }}>Total L & E</strong>
                  <strong style={{ fontFamily:font, color:C.rose }}>{fmtAED((bsData.totalLiabilities||0)+(bsData.totalEquity||0))}</strong>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {active==="aging" && (
        <Card>
          <SHead>Accounts Receivable Aging</SHead>
          {loading ? <div style={{ color:C.textMid, padding:20 }}>Loading…</div>
          : agingData.length===0 ? <EmptyMsg/>
          : (
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead><tr>
                <TH>Customer</TH><TH>Current</TH><TH>1-30 Days</TH><TH>31-60 Days</TH><TH>60+ Days</TH><TH>Total</TH>
              </tr></thead>
              <tbody>
                {agingData.map((row,i)=>(
                  <tr key={i}
                    onMouseEnter={e=>e.currentTarget.style.background=C.raised}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <TD style={{ fontWeight:600 }}>{row.customer}</TD>
                    <TD><span style={{ fontFamily:font, color:C.text }}>{parseFloat(row.current||0)>0?fmtAED(row.current):"—"}</span></TD>
                    <TD><span style={{ fontFamily:font, color:C.amber }}>{parseFloat(row.days_1_30||0)>0?fmtAED(row.days_1_30):"—"}</span></TD>
                    <TD><span style={{ fontFamily:font, color:C.rose }}>{parseFloat(row.days_31_60||0)>0?fmtAED(row.days_31_60):"—"}</span></TD>
                    <TD><span style={{ fontFamily:font, color:C.rose }}>{parseFloat(row.days_60_plus||0)>0?fmtAED(row.days_60_plus):"—"}</span></TD>
                    <TD><span style={{ fontFamily:font, fontWeight:700 }}>{fmtAED(row.total)}</span></TD>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
                <TD><span onClick={()=>openView(row)} style={{ color:"#F97316", cursor:"pointer", fontWeight:600 }}>{row.name}</span></TD>
                <TD style={{ color:C.textMid }}>{row.email||"—"}</TD>
                <TD style={{ color:C.textMid }}>{row.phone||"—"}</TD>
                <TD><span style={{ fontFamily:font }}>AED {parseFloat(row.credit_limit||0).toLocaleString()}</span></TD>
                <TD><Pill status={row.is_active?"Active":"Inactive"}/></TD>
                <TD><div style={{ display:"flex", gap:6 }}>
                  <button onClick={()=>openView(row)} style={{ fontSize:11, color:C.teal, background:`${C.teal}15`, border:`1px solid ${C.teal}30`, borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>View</button>
                  <button onClick={()=>openEdit(row)} style={{ fontSize:11, color:"#F97316", background:"rgba(249,115,22,0.1)", border:"1px solid rgba(249,115,22,0.3)", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Edit</button>
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
                <TD><span onClick={()=>openView(row)} style={{ color:"#F97316", cursor:"pointer", fontWeight:600 }}>{row.name}</span></TD>
                <TD style={{ color:C.textMid }}>{row.email||"—"}</TD>
                <TD style={{ color:C.textMid }}>{row.phone||"—"}</TD>
                <TD style={{ color:C.textMid, maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.address||"—"}</TD>
                <TD><Pill status={row.is_active?"Active":"Inactive"}/></TD>
                <TD><div style={{ display:"flex", gap:6 }}>
                  <button onClick={()=>openView(row)} style={{ fontSize:11, color:C.teal, background:`${C.teal}15`, border:`1px solid ${C.teal}30`, borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>View</button>
                  <button onClick={()=>openEdit(row)} style={{ fontSize:11, color:"#F97316", background:"rgba(249,115,22,0.1)", border:"1px solid rgba(249,115,22,0.3)", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Edit</button>
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
                  {bill.status==="draft" && <button onClick={()=>approveBill(bill.id)} style={{ fontSize:11, color:"#F97316", background:"rgba(249,115,22,0.1)", border:"1px solid rgba(249,115,22,0.3)", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Approve</button>}
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
   QUOTES
═══════════════════════════════════════════════════════════════ */
function Quotes({ token }) {
  const h = { Authorization:`Bearer ${token}` };
  const emptyLine = { description:"", quantity:1, unit_price:0, tax_rate:5 };
  const emptyForm = { customer_id:"", number:"", date:new Date().toISOString().slice(0,10), expiry_date:"", notes:"", terms:"", lines:[{...emptyLine}] };
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };
  const fetch_ = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/quotes?search=${search}`, {headers:h});
      const d = await r.json();
      setRows(d.data || []);
    } catch { setRows([]); } finally { setLoading(false); }
  };
  const fetchCustomers = async () => {
    try { const r = await fetch(`${API_URL}/api/customers`, {headers:h}); const d = await r.json(); setCustomers(d.data || []); } catch {}
  };
  useEffect(() => { fetch_(); fetchCustomers(); }, [search]);
  const setL = (k,v) => setForm(f => ({...f,[k]:v}));
  const setLine = (i,k,v) => setForm(f => { const ls=[...f.lines]; ls[i]={...ls[i],[k]:v}; return {...f,lines:ls}; });
  const addLine = () => setForm(f=>({...f,lines:[...f.lines,{...emptyLine}]}));
  const removeLine = i => setForm(f=>({...f,lines:f.lines.filter((_,j)=>j!==i)}));
  const subtotal = form.lines.reduce((s,l)=>s+parseFloat(l.quantity||0)*parseFloat(l.unit_price||0),0);
  const tax = form.lines.reduce((s,l)=>s+parseFloat(l.quantity||0)*parseFloat(l.unit_price||0)*(parseFloat(l.tax_rate||0)/100),0);
  const openNew = () => { setForm({...emptyForm,number:`QTE-${Date.now().toString().slice(-4)}`}); setSelected(null); setModal("form"); };
  const openEdit = async (row) => {
    try { const r = await fetch(`${API_URL}/api/quotes/${row.id}`,{headers:h}); const d=await r.json();
      setForm({...d, lines:d.lines||[{...emptyLine}]}); setSelected(row); setModal("form"); } catch {}
  };
  const save = async () => {
    setSaving(true);
    try {
      const url = selected ? `${API_URL}/api/quotes/${selected.id}` : `${API_URL}/api/quotes`;
      const r = await fetch(url, { method:selected?"PUT":"POST", headers:{...h,"Content-Type":"application/json"}, body:JSON.stringify(form) });
      if (!r.ok) { const e=await r.json(); throw new Error(e.error||"Failed"); }
      showToast(selected?"Quote updated":"Quote created"); setModal(null); fetch_();
    } catch(e) { showToast(e.message, false); } finally { setSaving(false); }
  };
  const del = async () => {
    try { await fetch(`${API_URL}/api/quotes/${selected.id}`,{method:"DELETE",headers:h}); showToast("Deleted"); setModal(null); fetch_(); } catch { showToast("Delete failed",false); }
  };
  const convert = async (row) => {
    try { const r=await fetch(`${API_URL}/api/quotes/${row.id}/convert`,{method:"POST",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify({due_date:row.expiry_date})});
      if (!r.ok) throw new Error("Failed"); showToast("Converted to Invoice"); fetch_(); } catch { showToast("Conversion failed",false); }
  };
  const statusColor = s => ({draft:C.textDim,sent:C.sky,accepted:C.emerald,rejected:C.rose,expired:C.amber,converted:C.violet}[s]||C.textDim);
  return (
    <div>
      {toast && <div style={{position:"fixed",top:22,right:22,zIndex:9999,padding:"10px 20px",borderRadius:8,background:toast.ok?C.emerald:C.rose,color:"#fff",fontWeight:700,fontSize:13}}>{toast.msg}</div>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:800,color:C.text}}>Quotes</div>
        <div style={{display:"flex",gap:10}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search quotes..." style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,width:200}} />
          <button onClick={openNew} style={{padding:"8px 18px",borderRadius:8,background:C.teal,color:"#fff",fontWeight:700,border:"none",cursor:"pointer",fontSize:13}}>+ New Quote</button>
        </div>
      </div>
      {loading ? <div style={{textAlign:"center",padding:40,color:C.textMid}}>Loading...</div> : (
        <div style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:C.raised}}>
              {["Number","Customer","Date","Expiry","Amount","Status",""].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontWeight:700,color:C.textMid,fontSize:11}}>{h}</th>)}
            </tr></thead>
            <tbody>{rows.length===0?<tr><td colSpan={7} style={{textAlign:"center",padding:32,color:C.textMid}}>No quotes yet</td></tr>:rows.map(r=>(
              <tr key={r.id} style={{borderTop:`1px solid ${C.border}`}}>
                <td style={{padding:"10px 14px",fontWeight:700,color:C.teal}}>{r.number}</td>
                <td style={{padding:"10px 14px"}}>{r.customer_name}</td>
                <td style={{padding:"10px 14px",color:C.textMid}}>{r.date}</td>
                <td style={{padding:"10px 14px",color:C.textMid}}>{r.expiry_date||"—"}</td>
                <td style={{padding:"10px 14px",fontWeight:700}}>${parseFloat(r.total).toLocaleString()}</td>
                <td style={{padding:"10px 14px"}}><span style={{background:`${statusColor(r.status)}18`,color:statusColor(r.status),padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{r.status}</span></td>
                <td style={{padding:"10px 14px",display:"flex",gap:8}}>
                  <button onClick={()=>openEdit(r)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",fontSize:11}}>Edit</button>
                  {r.status!=="converted"&&<button onClick={()=>convert(r)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.teal}`,color:C.teal,background:"#fff",cursor:"pointer",fontSize:11}}>→ Invoice</button>}
                  <button onClick={()=>{setSelected(r);setModal("delete");}} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.rose}`,color:C.rose,background:"#fff",cursor:"pointer",fontSize:11}}>Del</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {modal==="delete"&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{background:"#fff",borderRadius:16,padding:32,width:340,textAlign:"center"}}>
          <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>Delete quote?</div>
          <div style={{color:C.textMid,fontSize:13,marginBottom:24}}>{selected?.number}</div>
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <button onClick={()=>setModal(null)} style={{padding:"8px 20px",borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer"}}>Cancel</button>
            <button onClick={del} style={{padding:"8px 20px",borderRadius:8,background:C.rose,color:"#fff",border:"none",cursor:"pointer",fontWeight:700}}>Delete</button>
          </div>
        </div>
      </div>}
      {modal==="form"&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{background:"#fff",borderRadius:16,padding:28,width:"100%",maxWidth:760,maxHeight:"90vh",overflowY:"auto"}}>
          <div style={{fontSize:17,fontWeight:800,marginBottom:20}}>{selected?"Edit Quote":"New Quote"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>CUSTOMER *</label>
              <select value={form.customer_id} onChange={e=>setL("customer_id",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13}}>
                <option value="">Select customer</option>
                {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>QUOTE NUMBER *</label>
              <input value={form.number} onChange={e=>setL("number",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>DATE *</label>
              <input type="date" value={form.date} onChange={e=>setL("date",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>EXPIRY DATE</label>
              <input type="date" value={form.expiry_date} onChange={e=>setL("expiry_date",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>TERMS</label>
              <input value={form.terms} onChange={e=>setL("terms",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>NOTES</label>
              <input value={form.notes} onChange={e=>setL("notes",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
          </div>
          <div style={{fontWeight:700,fontSize:12,color:C.textMid,marginBottom:8}}>LINE ITEMS</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:8}}>
            <thead><tr style={{background:C.raised}}>{["Description","Qty","Unit Price","VAT %","Amount",""].map(h=><th key={h} style={{padding:"6px 8px",textAlign:"left",fontWeight:700,color:C.textMid}}>{h}</th>)}</tr></thead>
            <tbody>{form.lines.map((l,i)=>{
              const amt=parseFloat(l.quantity||0)*parseFloat(l.unit_price||0);
              return(<tr key={i}>
                <td style={{padding:"4px 4px"}}><input value={l.description} onChange={e=>setLine(i,"description",e.target.value)} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,boxSizing:"border-box"}} /></td>
                <td style={{padding:"4px 4px"}}><input type="number" value={l.quantity} onChange={e=>setLine(i,"quantity",e.target.value)} style={{width:60,padding:"6px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12}} /></td>
                <td style={{padding:"4px 4px"}}><input type="number" value={l.unit_price} onChange={e=>setLine(i,"unit_price",e.target.value)} style={{width:90,padding:"6px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12}} /></td>
                <td style={{padding:"4px 4px"}}><input type="number" value={l.tax_rate} onChange={e=>setLine(i,"tax_rate",e.target.value)} style={{width:60,padding:"6px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12}} /></td>
                <td style={{padding:"4px 8px",fontWeight:700}}>${amt.toFixed(2)}</td>
                <td><button onClick={()=>removeLine(i)} style={{background:"none",border:"none",color:C.rose,cursor:"pointer",fontSize:16}}>✕</button></td>
              </tr>);
            })}</tbody>
          </table>
          <button onClick={addLine} style={{fontSize:12,color:C.teal,background:"none",border:`1px dashed ${C.teal}`,borderRadius:6,padding:"4px 12px",cursor:"pointer",marginBottom:14}}>+ Add Line</button>
          <div style={{textAlign:"right",fontSize:13,color:C.textMid,marginBottom:20}}>
            Subtotal: <b>${subtotal.toFixed(2)}</b> &nbsp;|&nbsp; VAT: <b>${tax.toFixed(2)}</b> &nbsp;|&nbsp; Total: <b style={{color:C.text,fontSize:15}}>${(subtotal+tax).toFixed(2)}</b>
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
            <button onClick={()=>setModal(null)} style={{padding:"9px 22px",borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer"}}>Cancel</button>
            <button onClick={save} disabled={saving} style={{padding:"9px 22px",borderRadius:8,background:C.teal,color:"#fff",border:"none",cursor:"pointer",fontWeight:700}}>{saving?"Saving...":"Save Quote"}</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SALES ORDERS
═══════════════════════════════════════════════════════════════ */
function SalesOrders({ token }) {
  const h = { Authorization:`Bearer ${token}` };
  const emptyLine = { description:"", quantity:1, unit_price:0, tax_rate:5 };
  const emptyForm = { customer_id:"", number:"", order_date:new Date().toISOString().slice(0,10), delivery_date:"", shipping_address:"", notes:"", lines:[{...emptyLine}] };
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };
  const fetch_ = async () => {
    setLoading(true);
    try { const r=await fetch(`${API_URL}/api/sales-orders?search=${search}`,{headers:h}); const d=await r.json(); setRows(d.data||[]); }
    catch { setRows([]); } finally { setLoading(false); }
  };
  const fetchCustomers = async () => {
    try { const r=await fetch(`${API_URL}/api/customers`,{headers:h}); const d=await r.json(); setCustomers(d.data||[]); } catch {}
  };
  useEffect(()=>{fetch_();fetchCustomers();},[search]);
  const setL=(k,v)=>setForm(f=>({...f,[k]:v}));
  const setLine=(i,k,v)=>setForm(f=>{const ls=[...f.lines];ls[i]={...ls[i],[k]:v};return{...f,lines:ls};});
  const addLine=()=>setForm(f=>({...f,lines:[...f.lines,{...emptyLine}]}));
  const removeLine=i=>setForm(f=>({...f,lines:f.lines.filter((_,j)=>j!==i)}));
  const subtotal=form.lines.reduce((s,l)=>s+parseFloat(l.quantity||0)*parseFloat(l.unit_price||0),0);
  const tax=form.lines.reduce((s,l)=>s+parseFloat(l.quantity||0)*parseFloat(l.unit_price||0)*(parseFloat(l.tax_rate||0)/100),0);
  const openNew=()=>{setForm({...emptyForm,number:`SO-${Date.now().toString().slice(-4)}`});setSelected(null);setModal("form");};
  const openEdit=async(row)=>{
    try{const r=await fetch(`${API_URL}/api/sales-orders/${row.id}`,{headers:h});const d=await r.json();
      setForm({...d,lines:d.lines||[{...emptyLine}]});setSelected(row);setModal("form");}catch{}
  };
  const save=async()=>{
    setSaving(true);
    try{
      const url=selected?`${API_URL}/api/sales-orders/${selected.id}`:`${API_URL}/api/sales-orders`;
      const r=await fetch(url,{method:selected?"PUT":"POST",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify(form)});
      if(!r.ok){const e=await r.json();throw new Error(e.error||"Failed");}
      showToast(selected?"Order updated":"Order created");setModal(null);fetch_();
    }catch(e){showToast(e.message,false);}finally{setSaving(false);}
  };
  const del=async()=>{
    try{await fetch(`${API_URL}/api/sales-orders/${selected.id}`,{method:"DELETE",headers:h});showToast("Deleted");setModal(null);fetch_();}
    catch{showToast("Delete failed",false);}
  };
  const convert=async(row)=>{
    try{const r=await fetch(`${API_URL}/api/sales-orders/${row.id}/convert`,{method:"POST",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify({due_date:row.delivery_date})});
      if(!r.ok)throw new Error("Failed");showToast("Converted to Invoice");fetch_();}
    catch{showToast("Conversion failed",false);}
  };
  const statusColor=s=>({draft:C.textDim,confirmed:C.sky,shipped:C.violet,delivered:C.emerald,cancelled:C.rose,converted:C.amber}[s]||C.textDim);
  return(
    <div>
      {toast&&<div style={{position:"fixed",top:22,right:22,zIndex:9999,padding:"10px 20px",borderRadius:8,background:toast.ok?C.emerald:C.rose,color:"#fff",fontWeight:700,fontSize:13}}>{toast.msg}</div>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:800,color:C.text}}>Sales Orders</div>
        <div style={{display:"flex",gap:10}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search orders..." style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,width:200}} />
          <button onClick={openNew} style={{padding:"8px 18px",borderRadius:8,background:C.teal,color:"#fff",fontWeight:700,border:"none",cursor:"pointer",fontSize:13}}>+ New Order</button>
        </div>
      </div>
      {loading?<div style={{textAlign:"center",padding:40,color:C.textMid}}>Loading...</div>:(
        <div style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:C.raised}}>{["Number","Customer","Order Date","Delivery","Amount","Status",""].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontWeight:700,color:C.textMid,fontSize:11}}>{h}</th>)}</tr></thead>
            <tbody>{rows.length===0?<tr><td colSpan={7} style={{textAlign:"center",padding:32,color:C.textMid}}>No sales orders yet</td></tr>:rows.map(r=>(
              <tr key={r.id} style={{borderTop:`1px solid ${C.border}`}}>
                <td style={{padding:"10px 14px",fontWeight:700,color:C.teal}}>{r.number}</td>
                <td style={{padding:"10px 14px"}}>{r.customer_name}</td>
                <td style={{padding:"10px 14px",color:C.textMid}}>{r.order_date}</td>
                <td style={{padding:"10px 14px",color:C.textMid}}>{r.delivery_date||"—"}</td>
                <td style={{padding:"10px 14px",fontWeight:700}}>${parseFloat(r.total).toLocaleString()}</td>
                <td style={{padding:"10px 14px"}}><span style={{background:`${statusColor(r.status)}18`,color:statusColor(r.status),padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{r.status}</span></td>
                <td style={{padding:"10px 14px",display:"flex",gap:8}}>
                  <button onClick={()=>openEdit(r)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",fontSize:11}}>Edit</button>
                  {r.status!=="converted"&&<button onClick={()=>convert(r)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.teal}`,color:C.teal,background:"#fff",cursor:"pointer",fontSize:11}}>→ Invoice</button>}
                  <button onClick={()=>{setSelected(r);setModal("delete");}} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.rose}`,color:C.rose,background:"#fff",cursor:"pointer",fontSize:11}}>Del</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {modal==="delete"&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{background:"#fff",borderRadius:16,padding:32,width:340,textAlign:"center"}}>
          <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>Delete this order?</div>
          <div style={{color:C.textMid,fontSize:13,marginBottom:24}}>{selected?.number}</div>
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <button onClick={()=>setModal(null)} style={{padding:"8px 20px",borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer"}}>Cancel</button>
            <button onClick={del} style={{padding:"8px 20px",borderRadius:8,background:C.rose,color:"#fff",border:"none",cursor:"pointer",fontWeight:700}}>Delete</button>
          </div>
        </div>
      </div>}
      {modal==="form"&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{background:"#fff",borderRadius:16,padding:28,width:"100%",maxWidth:760,maxHeight:"90vh",overflowY:"auto"}}>
          <div style={{fontSize:17,fontWeight:800,marginBottom:20}}>{selected?"Edit Sales Order":"New Sales Order"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>CUSTOMER *</label>
              <select value={form.customer_id} onChange={e=>setL("customer_id",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13}}>
                <option value="">Select customer</option>
                {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>ORDER NUMBER *</label>
              <input value={form.number} onChange={e=>setL("number",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>ORDER DATE *</label>
              <input type="date" value={form.order_date} onChange={e=>setL("order_date",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>DELIVERY DATE</label>
              <input type="date" value={form.delivery_date} onChange={e=>setL("delivery_date",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div style={{gridColumn:"span 2"}}><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>SHIPPING ADDRESS</label>
              <input value={form.shipping_address} onChange={e=>setL("shipping_address",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
          </div>
          <div style={{fontWeight:700,fontSize:12,color:C.textMid,marginBottom:8}}>LINE ITEMS</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:8}}>
            <thead><tr style={{background:C.raised}}>{["Description","Qty","Unit Price","VAT %","Amount",""].map(h=><th key={h} style={{padding:"6px 8px",textAlign:"left",fontWeight:700,color:C.textMid}}>{h}</th>)}</tr></thead>
            <tbody>{form.lines.map((l,i)=>{
              const amt=parseFloat(l.quantity||0)*parseFloat(l.unit_price||0);
              return(<tr key={i}>
                <td><input value={l.description} onChange={e=>setLine(i,"description",e.target.value)} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,boxSizing:"border-box"}} /></td>
                <td><input type="number" value={l.quantity} onChange={e=>setLine(i,"quantity",e.target.value)} style={{width:60,padding:"6px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12}} /></td>
                <td><input type="number" value={l.unit_price} onChange={e=>setLine(i,"unit_price",e.target.value)} style={{width:90,padding:"6px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12}} /></td>
                <td><input type="number" value={l.tax_rate} onChange={e=>setLine(i,"tax_rate",e.target.value)} style={{width:60,padding:"6px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12}} /></td>
                <td style={{padding:"4px 8px",fontWeight:700}}>${amt.toFixed(2)}</td>
                <td><button onClick={()=>removeLine(i)} style={{background:"none",border:"none",color:C.rose,cursor:"pointer",fontSize:16}}>✕</button></td>
              </tr>);
            })}</tbody>
          </table>
          <button onClick={addLine} style={{fontSize:12,color:C.teal,background:"none",border:`1px dashed ${C.teal}`,borderRadius:6,padding:"4px 12px",cursor:"pointer",marginBottom:14}}>+ Add Line</button>
          <div style={{textAlign:"right",fontSize:13,color:C.textMid,marginBottom:20}}>
            Subtotal: <b>${subtotal.toFixed(2)}</b> &nbsp;|&nbsp; VAT: <b>${tax.toFixed(2)}</b> &nbsp;|&nbsp; Total: <b style={{color:C.text,fontSize:15}}>${(subtotal+tax).toFixed(2)}</b>
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
            <button onClick={()=>setModal(null)} style={{padding:"9px 22px",borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer"}}>Cancel</button>
            <button onClick={save} disabled={saving} style={{padding:"9px 22px",borderRadius:8,background:C.teal,color:"#fff",border:"none",cursor:"pointer",fontWeight:700}}>{saving?"Saving...":"Save Order"}</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAYMENT RECEIVED
═══════════════════════════════════════════════════════════════ */
function PaymentReceived({ token }) {
  const h = { Authorization:`Bearer ${token}` };
  const emptyForm = { party_id:"", amount:"", date:new Date().toISOString().slice(0,10), method:"bank_transfer", reference:"", notes:"" };
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast=(msg,ok=true)=>{setToast({msg,ok});setTimeout(()=>setToast(null),3000);};
  const fetch_=async()=>{
    setLoading(true);
    try{const r=await fetch(`${API_URL}/api/payments?type=receipt`,{headers:h});const d=await r.json();setRows(d.data||[]);}
    catch{setRows([]);}finally{setLoading(false);}
  };
  const fetchCustomers=async()=>{
    try{const r=await fetch(`${API_URL}/api/customers`,{headers:h});const d=await r.json();setCustomers(d.data||[]);}catch{}
  };
  useEffect(()=>{fetch_();fetchCustomers();},[]);
  const setL=(k,v)=>setForm(f=>({...f,[k]:v}));
  const save=async()=>{
    setSaving(true);
    try{
      const r=await fetch(`${API_URL}/api/payments`,{method:"POST",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify({...form,type:"receipt"})});
      if(!r.ok){const e=await r.json();throw new Error(e.error||"Failed");}
      showToast("Payment recorded");setModal(null);setForm(emptyForm);fetch_();
    }catch(e){showToast(e.message,false);}finally{setSaving(false);}
  };
  const methods=["bank_transfer","cash","cheque","card","online"];
  const totalReceived=rows.reduce((s,r)=>s+parseFloat(r.amount||0),0);
  return(
    <div>
      {toast&&<div style={{position:"fixed",top:22,right:22,zIndex:9999,padding:"10px 20px",borderRadius:8,background:toast.ok?C.emerald:C.rose,color:"#fff",fontWeight:700,fontSize:13}}>{toast.msg}</div>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,color:C.text}}>Payments Received</div>
          <div style={{fontSize:13,color:C.textMid,marginTop:2}}>Total received: <b style={{color:C.emerald}}>${totalReceived.toLocaleString(undefined,{minimumFractionDigits:2})}</b></div>
        </div>
        <button onClick={()=>{setForm(emptyForm);setModal("form");}} style={{padding:"8px 18px",borderRadius:8,background:C.teal,color:"#fff",fontWeight:700,border:"none",cursor:"pointer",fontSize:13}}>+ Record Payment</button>
      </div>
      {loading?<div style={{textAlign:"center",padding:40,color:C.textMid}}>Loading...</div>:(
        <div style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:C.raised}}>{["Date","Customer","Amount","Method","Reference","Notes"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontWeight:700,color:C.textMid,fontSize:11}}>{h}</th>)}</tr></thead>
            <tbody>{rows.length===0?<tr><td colSpan={6} style={{textAlign:"center",padding:32,color:C.textMid}}>No payments recorded</td></tr>:rows.map(r=>{
              const cust=customers.find(c=>c.id===r.party_id);
              return(<tr key={r.id} style={{borderTop:`1px solid ${C.border}`}}>
                <td style={{padding:"10px 14px",color:C.textMid}}>{r.date}</td>
                <td style={{padding:"10px 14px"}}>{cust?.name||"—"}</td>
                <td style={{padding:"10px 14px",fontWeight:700,color:C.emerald}}>${parseFloat(r.amount).toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                <td style={{padding:"10px 14px",color:C.textMid,textTransform:"capitalize"}}>{r.method?.replace(/_/g," ")}</td>
                <td style={{padding:"10px 14px",color:C.textMid}}>{r.reference||"—"}</td>
                <td style={{padding:"10px 14px",color:C.textMid}}>{r.notes||"—"}</td>
              </tr>);
            })}</tbody>
          </table>
        </div>
      )}
      {modal==="form"&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{background:"#fff",borderRadius:16,padding:28,width:"100%",maxWidth:520}}>
          <div style={{fontSize:17,fontWeight:800,marginBottom:20}}>Record Payment Received</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            <div style={{gridColumn:"span 2"}}><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>CUSTOMER *</label>
              <select value={form.party_id} onChange={e=>setL("party_id",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13}}>
                <option value="">Select customer</option>
                {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>AMOUNT *</label>
              <input type="number" value={form.amount} onChange={e=>setL("amount",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>DATE *</label>
              <input type="date" value={form.date} onChange={e=>setL("date",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>METHOD</label>
              <select value={form.method} onChange={e=>setL("method",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13}}>
                {methods.map(m=><option key={m} value={m}>{m.replace(/_/g," ")}</option>)}
              </select></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>REFERENCE</label>
              <input value={form.reference} onChange={e=>setL("reference",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div style={{gridColumn:"span 2"}}><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>NOTES</label>
              <input value={form.notes} onChange={e=>setL("notes",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
            <button onClick={()=>setModal(null)} style={{padding:"9px 22px",borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer"}}>Cancel</button>
            <button onClick={save} disabled={saving} style={{padding:"9px 22px",borderRadius:8,background:C.emerald,color:"#fff",border:"none",cursor:"pointer",fontWeight:700}}>{saving?"Saving...":"Record Payment"}</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CREDIT NOTE
═══════════════════════════════════════════════════════════════ */
function CreditNote({ token }) {
  const h = { Authorization:`Bearer ${token}` };
  const emptyLine = { description:"", quantity:1, unit_price:0, tax_rate:5 };
  const emptyForm = { customer_id:"", invoice_id:"", number:"", date:new Date().toISOString().slice(0,10), reason:"", lines:[{...emptyLine}] };
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast=(msg,ok=true)=>{setToast({msg,ok});setTimeout(()=>setToast(null),3000);};
  const fetch_=async()=>{
    setLoading(true);
    try{const r=await fetch(`${API_URL}/api/credit-notes`,{headers:h});const d=await r.json();setRows(d.data||[]);}
    catch{setRows([]);}finally{setLoading(false);}
  };
  const fetchCustomers=async()=>{
    try{const r=await fetch(`${API_URL}/api/customers`,{headers:h});const d=await r.json();setCustomers(d.data||[]);}catch{}
  };
  const fetchInvoices=async()=>{
    try{const r=await fetch(`${API_URL}/api/invoices`,{headers:h});const d=await r.json();setInvoices(d.data||[]);}catch{}
  };
  useEffect(()=>{fetch_();fetchCustomers();fetchInvoices();},[]);
  const setL=(k,v)=>setForm(f=>({...f,[k]:v}));
  const setLine=(i,k,v)=>setForm(f=>{const ls=[...f.lines];ls[i]={...ls[i],[k]:v};return{...f,lines:ls};});
  const addLine=()=>setForm(f=>({...f,lines:[...f.lines,{...emptyLine}]}));
  const removeLine=i=>setForm(f=>({...f,lines:f.lines.filter((_,j)=>j!==i)}));
  const subtotal=form.lines.reduce((s,l)=>s+parseFloat(l.quantity||0)*parseFloat(l.unit_price||0),0);
  const tax=form.lines.reduce((s,l)=>s+parseFloat(l.quantity||0)*parseFloat(l.unit_price||0)*(parseFloat(l.tax_rate||0)/100),0);
  const openNew=()=>{setForm({...emptyForm,number:`CN-${Date.now().toString().slice(-4)}`});setSelected(null);setModal("form");};
  const openEdit=async(row)=>{
    try{const r=await fetch(`${API_URL}/api/credit-notes/${row.id}`,{headers:h});const d=await r.json();
      setForm({...d,lines:d.lines||[{...emptyLine}]});setSelected(row);setModal("form");}catch{}
  };
  const save=async()=>{
    setSaving(true);
    try{
      const url=selected?`${API_URL}/api/credit-notes/${selected.id}`:`${API_URL}/api/credit-notes`;
      const r=await fetch(url,{method:selected?"PUT":"POST",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify(form)});
      if(!r.ok){const e=await r.json();throw new Error(e.error||"Failed");}
      showToast(selected?"Updated":"Credit note created");setModal(null);fetch_();
    }catch(e){showToast(e.message,false);}finally{setSaving(false);}
  };
  const del=async()=>{
    try{await fetch(`${API_URL}/api/credit-notes/${selected.id}`,{method:"DELETE",headers:h});showToast("Deleted");setModal(null);fetch_();}
    catch{showToast("Delete failed",false);}
  };
  const apply=async(row)=>{
    const inv=invoices.find(i=>i.id===row.invoice_id);
    if(!inv){showToast("No invoice linked",false);return;}
    const available=parseFloat(row.total)-parseFloat(row.applied_amount);
    try{
      const r=await fetch(`${API_URL}/api/credit-notes/${row.id}/apply`,{method:"POST",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify({invoice_id:row.invoice_id,amount:available})});
      if(!r.ok)throw new Error("Failed");showToast("Applied to invoice");fetch_();
    }catch{showToast("Apply failed",false);}
  };
  const statusColor=s=>({draft:C.textDim,applied:C.emerald,void:C.rose}[s]||C.textDim);
  return(
    <div>
      {toast&&<div style={{position:"fixed",top:22,right:22,zIndex:9999,padding:"10px 20px",borderRadius:8,background:toast.ok?C.emerald:C.rose,color:"#fff",fontWeight:700,fontSize:13}}>{toast.msg}</div>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:800,color:C.text}}>Credit Notes</div>
        <button onClick={openNew} style={{padding:"8px 18px",borderRadius:8,background:C.teal,color:"#fff",fontWeight:700,border:"none",cursor:"pointer",fontSize:13}}>+ New Credit Note</button>
      </div>
      {loading?<div style={{textAlign:"center",padding:40,color:C.textMid}}>Loading...</div>:(
        <div style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:C.raised}}>{["Number","Customer","Invoice","Date","Total","Applied","Status",""].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontWeight:700,color:C.textMid,fontSize:11}}>{h}</th>)}</tr></thead>
            <tbody>{rows.length===0?<tr><td colSpan={8} style={{textAlign:"center",padding:32,color:C.textMid}}>No credit notes</td></tr>:rows.map(r=>(
              <tr key={r.id} style={{borderTop:`1px solid ${C.border}`}}>
                <td style={{padding:"10px 14px",fontWeight:700,color:C.teal}}>{r.number}</td>
                <td style={{padding:"10px 14px"}}>{r.customer_name}</td>
                <td style={{padding:"10px 14px",color:C.textMid}}>{r.invoice_number||"—"}</td>
                <td style={{padding:"10px 14px",color:C.textMid}}>{r.date}</td>
                <td style={{padding:"10px 14px",fontWeight:700}}>${parseFloat(r.total).toLocaleString()}</td>
                <td style={{padding:"10px 14px",color:C.emerald}}>${parseFloat(r.applied_amount).toLocaleString()}</td>
                <td style={{padding:"10px 14px"}}><span style={{background:`${statusColor(r.status)}18`,color:statusColor(r.status),padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{r.status}</span></td>
                <td style={{padding:"10px 14px",display:"flex",gap:8}}>
                  <button onClick={()=>openEdit(r)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",fontSize:11}}>Edit</button>
                  {r.status==="draft"&&r.invoice_id&&<button onClick={()=>apply(r)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.emerald}`,color:C.emerald,background:"#fff",cursor:"pointer",fontSize:11}}>Apply</button>}
                  <button onClick={()=>{setSelected(r);setModal("delete");}} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.rose}`,color:C.rose,background:"#fff",cursor:"pointer",fontSize:11}}>Del</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {modal==="delete"&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{background:"#fff",borderRadius:16,padding:32,width:340,textAlign:"center"}}>
          <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>Delete credit note?</div>
          <div style={{color:C.textMid,fontSize:13,marginBottom:24}}>{selected?.number}</div>
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <button onClick={()=>setModal(null)} style={{padding:"8px 20px",borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer"}}>Cancel</button>
            <button onClick={del} style={{padding:"8px 20px",borderRadius:8,background:C.rose,color:"#fff",border:"none",cursor:"pointer",fontWeight:700}}>Delete</button>
          </div>
        </div>
      </div>}
      {modal==="form"&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{background:"#fff",borderRadius:16,padding:28,width:"100%",maxWidth:760,maxHeight:"90vh",overflowY:"auto"}}>
          <div style={{fontSize:17,fontWeight:800,marginBottom:20}}>{selected?"Edit Credit Note":"New Credit Note"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>CUSTOMER *</label>
              <select value={form.customer_id} onChange={e=>setL("customer_id",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13}}>
                <option value="">Select customer</option>
                {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>NUMBER *</label>
              <input value={form.number} onChange={e=>setL("number",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>DATE *</label>
              <input type="date" value={form.date} onChange={e=>setL("date",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>ORIGINAL INVOICE</label>
              <select value={form.invoice_id} onChange={e=>setL("invoice_id",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13}}>
                <option value="">None</option>
                {invoices.filter(i=>i.customer_id===form.customer_id||!form.customer_id).map(i=><option key={i.id} value={i.id}>{i.number}</option>)}
              </select></div>
            <div style={{gridColumn:"span 2"}}><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>REASON</label>
              <input value={form.reason} onChange={e=>setL("reason",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
          </div>
          <div style={{fontWeight:700,fontSize:12,color:C.textMid,marginBottom:8}}>LINE ITEMS</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:8}}>
            <thead><tr style={{background:C.raised}}>{["Description","Qty","Unit Price","VAT %","Amount",""].map(h=><th key={h} style={{padding:"6px 8px",textAlign:"left",fontWeight:700,color:C.textMid}}>{h}</th>)}</tr></thead>
            <tbody>{form.lines.map((l,i)=>{
              const amt=parseFloat(l.quantity||0)*parseFloat(l.unit_price||0);
              return(<tr key={i}>
                <td><input value={l.description} onChange={e=>setLine(i,"description",e.target.value)} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,boxSizing:"border-box"}} /></td>
                <td><input type="number" value={l.quantity} onChange={e=>setLine(i,"quantity",e.target.value)} style={{width:60,padding:"6px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12}} /></td>
                <td><input type="number" value={l.unit_price} onChange={e=>setLine(i,"unit_price",e.target.value)} style={{width:90,padding:"6px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12}} /></td>
                <td><input type="number" value={l.tax_rate} onChange={e=>setLine(i,"tax_rate",e.target.value)} style={{width:60,padding:"6px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12}} /></td>
                <td style={{padding:"4px 8px",fontWeight:700}}>${amt.toFixed(2)}</td>
                <td><button onClick={()=>removeLine(i)} style={{background:"none",border:"none",color:C.rose,cursor:"pointer",fontSize:16}}>✕</button></td>
              </tr>);
            })}</tbody>
          </table>
          <button onClick={addLine} style={{fontSize:12,color:C.teal,background:"none",border:`1px dashed ${C.teal}`,borderRadius:6,padding:"4px 12px",cursor:"pointer",marginBottom:14}}>+ Add Line</button>
          <div style={{textAlign:"right",fontSize:13,color:C.textMid,marginBottom:20}}>
            Subtotal: <b>${subtotal.toFixed(2)}</b> &nbsp;|&nbsp; VAT: <b>${tax.toFixed(2)}</b> &nbsp;|&nbsp; Total: <b style={{color:C.text,fontSize:15}}>${(subtotal+tax).toFixed(2)}</b>
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
            <button onClick={()=>setModal(null)} style={{padding:"9px 22px",borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer"}}>Cancel</button>
            <button onClick={save} disabled={saving} style={{padding:"9px 22px",borderRadius:8,background:C.teal,color:"#fff",border:"none",cursor:"pointer",fontWeight:700}}>{saving?"Saving...":"Save"}</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EXPENSES
═══════════════════════════════════════════════════════════════ */
function Expenses({ token }) {
  const h = { Authorization:`Bearer ${token}` };
  const categories = ["Travel","Meals","Office Supplies","Software","Hardware","Marketing","Professional Fees","Utilities","Rent","Other"];
  const emptyForm = { category:"", amount:"", date:new Date().toISOString().slice(0,10), description:"", receipt_url:"" };
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast=(msg,ok=true)=>{setToast({msg,ok});setTimeout(()=>setToast(null),3000);};
  const fetch_=async()=>{
    setLoading(true);
    try{const r=await fetch(`${API_URL}/api/expenses?search=${search}`,{headers:h});const d=await r.json();setRows(d.data||[]);}
    catch{setRows([]);}finally{setLoading(false);}
  };
  useEffect(()=>{fetch_();},[search]);
  const setL=(k,v)=>setForm(f=>({...f,[k]:v}));
  const openNew=()=>{setForm(emptyForm);setSelected(null);setModal("form");};
  const openEdit=(row)=>{setForm({...row});setSelected(row);setModal("form");};
  const save=async()=>{
    setSaving(true);
    try{
      const url=selected?`${API_URL}/api/expenses/${selected.id}`:`${API_URL}/api/expenses`;
      const r=await fetch(url,{method:selected?"PUT":"POST",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify(form)});
      if(!r.ok){const e=await r.json();throw new Error(e.error||"Failed");}
      showToast(selected?"Updated":"Expense added");setModal(null);fetch_();
    }catch(e){showToast(e.message,false);}finally{setSaving(false);}
  };
  const del=async()=>{
    try{await fetch(`${API_URL}/api/expenses/${selected.id}`,{method:"DELETE",headers:h});showToast("Deleted");setModal(null);fetch_();}
    catch{showToast("Delete failed",false);}
  };
  const approve=async(row)=>{
    try{const r=await fetch(`${API_URL}/api/expenses/${row.id}/approve`,{method:"PUT",headers:h});if(!r.ok)throw new Error();showToast("Approved");fetch_();}
    catch{showToast("Failed",false);}
  };
  const statusColor=s=>({pending:C.amber,approved:C.emerald,rejected:C.rose,paid:C.teal}[s]||C.textDim);
  const total=rows.reduce((s,r)=>s+parseFloat(r.amount||0),0);
  const approved=rows.filter(r=>r.status==="approved"||r.status==="paid").reduce((s,r)=>s+parseFloat(r.amount||0),0);
  return(
    <div>
      {toast&&<div style={{position:"fixed",top:22,right:22,zIndex:9999,padding:"10px 20px",borderRadius:8,background:toast.ok?C.emerald:C.rose,color:"#fff",fontWeight:700,fontSize:13}}>{toast.msg}</div>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:800,color:C.text}}>Expenses</div>
        <div style={{display:"flex",gap:10}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search expenses..." style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,width:200}} />
          <button onClick={openNew} style={{padding:"8px 18px",borderRadius:8,background:C.teal,color:"#fff",fontWeight:700,border:"none",cursor:"pointer",fontSize:13}}>+ Add Expense</button>
        </div>
      </div>
      <div style={{display:"flex",gap:14,marginBottom:20}}>
        {[["Total",total,C.text],["Approved",approved,C.emerald],["Pending",rows.filter(r=>r.status==="pending").length+" items",C.amber]].map(([l,v,c])=>(
          <div key={l} style={{background:C.surface,borderRadius:12,padding:"14px 20px",border:`1px solid ${C.border}`,flex:1}}>
            <div style={{fontSize:11,fontWeight:700,color:C.textMid,marginBottom:4}}>{l.toUpperCase()}</div>
            <div style={{fontSize:20,fontWeight:800,color:c}}>{typeof v==="number"?"$"+v.toLocaleString(undefined,{minimumFractionDigits:2}):v}</div>
          </div>
        ))}
      </div>
      {loading?<div style={{textAlign:"center",padding:40,color:C.textMid}}>Loading...</div>:(
        <div style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:C.raised}}>{["Date","Category","Description","Amount","Status","Receipt",""].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontWeight:700,color:C.textMid,fontSize:11}}>{h}</th>)}</tr></thead>
            <tbody>{rows.length===0?<tr><td colSpan={7} style={{textAlign:"center",padding:32,color:C.textMid}}>No expenses yet</td></tr>:rows.map(r=>(
              <tr key={r.id} style={{borderTop:`1px solid ${C.border}`}}>
                <td style={{padding:"10px 14px",color:C.textMid}}>{r.date}</td>
                <td style={{padding:"10px 14px"}}>{r.category}</td>
                <td style={{padding:"10px 14px",color:C.textMid}}>{r.description||"—"}</td>
                <td style={{padding:"10px 14px",fontWeight:700}}>${parseFloat(r.amount).toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                <td style={{padding:"10px 14px"}}><span style={{background:`${statusColor(r.status)}18`,color:statusColor(r.status),padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{r.status}</span></td>
                <td style={{padding:"10px 14px",color:C.textMid}}>{r.receipt_url?<a href={r.receipt_url} target="_blank" rel="noreferrer" style={{color:C.teal}}>View</a>:"—"}</td>
                <td style={{padding:"10px 14px",display:"flex",gap:8}}>
                  <button onClick={()=>openEdit(r)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",fontSize:11}}>Edit</button>
                  {r.status==="pending"&&<button onClick={()=>approve(r)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.emerald}`,color:C.emerald,background:"#fff",cursor:"pointer",fontSize:11}}>Approve</button>}
                  <button onClick={()=>{setSelected(r);setModal("delete");}} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.rose}`,color:C.rose,background:"#fff",cursor:"pointer",fontSize:11}}>Del</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {modal==="delete"&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{background:"#fff",borderRadius:16,padding:32,width:340,textAlign:"center"}}>
          <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>Delete expense?</div>
          <div style={{color:C.textMid,fontSize:13,marginBottom:24}}>{selected?.category} — ${selected?.amount}</div>
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <button onClick={()=>setModal(null)} style={{padding:"8px 20px",borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer"}}>Cancel</button>
            <button onClick={del} style={{padding:"8px 20px",borderRadius:8,background:C.rose,color:"#fff",border:"none",cursor:"pointer",fontWeight:700}}>Delete</button>
          </div>
        </div>
      </div>}
      {modal==="form"&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{background:"#fff",borderRadius:16,padding:28,width:"100%",maxWidth:480}}>
          <div style={{fontSize:17,fontWeight:800,marginBottom:20}}>{selected?"Edit Expense":"Add Expense"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>CATEGORY *</label>
              <select value={form.category} onChange={e=>setL("category",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13}}>
                <option value="">Select category</option>
                {categories.map(c=><option key={c} value={c}>{c}</option>)}
              </select></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>AMOUNT *</label>
              <input type="number" value={form.amount} onChange={e=>setL("amount",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>DATE *</label>
              <input type="date" value={form.date} onChange={e=>setL("date",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>RECEIPT URL</label>
              <input value={form.receipt_url||""} onChange={e=>setL("receipt_url",e.target.value)} placeholder="https://..." style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div style={{gridColumn:"span 2"}}><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>DESCRIPTION</label>
              <input value={form.description||""} onChange={e=>setL("description",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
            <button onClick={()=>setModal(null)} style={{padding:"9px 22px",borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer"}}>Cancel</button>
            <button onClick={save} disabled={saving} style={{padding:"9px 22px",borderRadius:8,background:C.teal,color:"#fff",border:"none",cursor:"pointer",fontWeight:700}}>{saving?"Saving...":"Save"}</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PURCHASE ORDERS
═══════════════════════════════════════════════════════════════ */
function PurchaseOrders({ token }) {
  const h = { Authorization:`Bearer ${token}` };
  const emptyLine = { description:"", quantity:1, unit_price:0, tax_rate:5 };
  const emptyForm = { vendor_id:"", number:"", order_date:new Date().toISOString().slice(0,10), delivery_date:"", delivery_address:"", notes:"", lines:[{...emptyLine}] };
  const [rows, setRows] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast=(msg,ok=true)=>{setToast({msg,ok});setTimeout(()=>setToast(null),3000);};
  const fetch_=async()=>{
    setLoading(true);
    try{const r=await fetch(`${API_URL}/api/purchase-orders?search=${search}`,{headers:h});const d=await r.json();setRows(d.data||[]);}
    catch{setRows([]);}finally{setLoading(false);}
  };
  const fetchVendors=async()=>{
    try{const r=await fetch(`${API_URL}/api/vendors`,{headers:h});const d=await r.json();setVendors(d.data||[]);}catch{}
  };
  useEffect(()=>{fetch_();fetchVendors();},[search]);
  const setL=(k,v)=>setForm(f=>({...f,[k]:v}));
  const setLine=(i,k,v)=>setForm(f=>{const ls=[...f.lines];ls[i]={...ls[i],[k]:v};return{...f,lines:ls};});
  const addLine=()=>setForm(f=>({...f,lines:[...f.lines,{...emptyLine}]}));
  const removeLine=i=>setForm(f=>({...f,lines:f.lines.filter((_,j)=>j!==i)}));
  const subtotal=form.lines.reduce((s,l)=>s+parseFloat(l.quantity||0)*parseFloat(l.unit_price||0),0);
  const tax=form.lines.reduce((s,l)=>s+parseFloat(l.quantity||0)*parseFloat(l.unit_price||0)*(parseFloat(l.tax_rate||0)/100),0);
  const openNew=()=>{setForm({...emptyForm,number:`PO-${Date.now().toString().slice(-4)}`});setSelected(null);setModal("form");};
  const openEdit=async(row)=>{
    try{const r=await fetch(`${API_URL}/api/purchase-orders/${row.id}`,{headers:h});const d=await r.json();
      setForm({...d,lines:d.lines||[{...emptyLine}]});setSelected(row);setModal("form");}catch{}
  };
  const save=async()=>{
    setSaving(true);
    try{
      const url=selected?`${API_URL}/api/purchase-orders/${selected.id}`:`${API_URL}/api/purchase-orders`;
      const r=await fetch(url,{method:selected?"PUT":"POST",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify(form)});
      if(!r.ok){const e=await r.json();throw new Error(e.error||"Failed");}
      showToast(selected?"Updated":"PO created");setModal(null);fetch_();
    }catch(e){showToast(e.message,false);}finally{setSaving(false);}
  };
  const del=async()=>{
    try{await fetch(`${API_URL}/api/purchase-orders/${selected.id}`,{method:"DELETE",headers:h});showToast("Deleted");setModal(null);fetch_();}
    catch{showToast("Delete failed",false);}
  };
  const convert=async(row)=>{
    try{const r=await fetch(`${API_URL}/api/purchase-orders/${row.id}/convert`,{method:"POST",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify({due_date:row.delivery_date})});
      if(!r.ok)throw new Error("Failed");showToast("Converted to Bill");fetch_();}
    catch{showToast("Conversion failed",false);}
  };
  const statusColor=s=>({draft:C.textDim,sent:C.sky,received:C.emerald,cancelled:C.rose,converted:C.violet}[s]||C.textDim);
  return(
    <div>
      {toast&&<div style={{position:"fixed",top:22,right:22,zIndex:9999,padding:"10px 20px",borderRadius:8,background:toast.ok?C.emerald:C.rose,color:"#fff",fontWeight:700,fontSize:13}}>{toast.msg}</div>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:800,color:C.text}}>Purchase Orders</div>
        <div style={{display:"flex",gap:10}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search POs..." style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,width:200}} />
          <button onClick={openNew} style={{padding:"8px 18px",borderRadius:8,background:C.teal,color:"#fff",fontWeight:700,border:"none",cursor:"pointer",fontSize:13}}>+ New PO</button>
        </div>
      </div>
      {loading?<div style={{textAlign:"center",padding:40,color:C.textMid}}>Loading...</div>:(
        <div style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:C.raised}}>{["Number","Supplier","Order Date","Delivery","Amount","Status",""].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontWeight:700,color:C.textMid,fontSize:11}}>{h}</th>)}</tr></thead>
            <tbody>{rows.length===0?<tr><td colSpan={7} style={{textAlign:"center",padding:32,color:C.textMid}}>No purchase orders yet</td></tr>:rows.map(r=>(
              <tr key={r.id} style={{borderTop:`1px solid ${C.border}`}}>
                <td style={{padding:"10px 14px",fontWeight:700,color:C.teal}}>{r.number}</td>
                <td style={{padding:"10px 14px"}}>{r.vendor_name}</td>
                <td style={{padding:"10px 14px",color:C.textMid}}>{r.order_date}</td>
                <td style={{padding:"10px 14px",color:C.textMid}}>{r.delivery_date||"—"}</td>
                <td style={{padding:"10px 14px",fontWeight:700}}>${parseFloat(r.total).toLocaleString()}</td>
                <td style={{padding:"10px 14px"}}><span style={{background:`${statusColor(r.status)}18`,color:statusColor(r.status),padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{r.status}</span></td>
                <td style={{padding:"10px 14px",display:"flex",gap:8}}>
                  <button onClick={()=>openEdit(r)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",fontSize:11}}>Edit</button>
                  {r.status!=="converted"&&<button onClick={()=>convert(r)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.violet}`,color:C.violet,background:"#fff",cursor:"pointer",fontSize:11}}>→ Bill</button>}
                  <button onClick={()=>{setSelected(r);setModal("delete");}} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.rose}`,color:C.rose,background:"#fff",cursor:"pointer",fontSize:11}}>Del</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {modal==="delete"&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{background:"#fff",borderRadius:16,padding:32,width:340,textAlign:"center"}}>
          <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>Delete this PO?</div>
          <div style={{color:C.textMid,fontSize:13,marginBottom:24}}>{selected?.number}</div>
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <button onClick={()=>setModal(null)} style={{padding:"8px 20px",borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer"}}>Cancel</button>
            <button onClick={del} style={{padding:"8px 20px",borderRadius:8,background:C.rose,color:"#fff",border:"none",cursor:"pointer",fontWeight:700}}>Delete</button>
          </div>
        </div>
      </div>}
      {modal==="form"&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{background:"#fff",borderRadius:16,padding:28,width:"100%",maxWidth:760,maxHeight:"90vh",overflowY:"auto"}}>
          <div style={{fontSize:17,fontWeight:800,marginBottom:20}}>{selected?"Edit Purchase Order":"New Purchase Order"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>SUPPLIER *</label>
              <select value={form.vendor_id} onChange={e=>setL("vendor_id",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13}}>
                <option value="">Select supplier</option>
                {vendors.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
              </select></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>PO NUMBER *</label>
              <input value={form.number} onChange={e=>setL("number",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>ORDER DATE *</label>
              <input type="date" value={form.order_date} onChange={e=>setL("order_date",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>DELIVERY DATE</label>
              <input type="date" value={form.delivery_date} onChange={e=>setL("delivery_date",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div style={{gridColumn:"span 2"}}><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>DELIVERY ADDRESS</label>
              <input value={form.delivery_address} onChange={e=>setL("delivery_address",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
          </div>
          <div style={{fontWeight:700,fontSize:12,color:C.textMid,marginBottom:8}}>LINE ITEMS</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:8}}>
            <thead><tr style={{background:C.raised}}>{["Description","Qty","Unit Price","VAT %","Amount",""].map(h=><th key={h} style={{padding:"6px 8px",textAlign:"left",fontWeight:700,color:C.textMid}}>{h}</th>)}</tr></thead>
            <tbody>{form.lines.map((l,i)=>{
              const amt=parseFloat(l.quantity||0)*parseFloat(l.unit_price||0);
              return(<tr key={i}>
                <td><input value={l.description} onChange={e=>setLine(i,"description",e.target.value)} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,boxSizing:"border-box"}} /></td>
                <td><input type="number" value={l.quantity} onChange={e=>setLine(i,"quantity",e.target.value)} style={{width:60,padding:"6px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12}} /></td>
                <td><input type="number" value={l.unit_price} onChange={e=>setLine(i,"unit_price",e.target.value)} style={{width:90,padding:"6px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12}} /></td>
                <td><input type="number" value={l.tax_rate} onChange={e=>setLine(i,"tax_rate",e.target.value)} style={{width:60,padding:"6px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12}} /></td>
                <td style={{padding:"4px 8px",fontWeight:700}}>${amt.toFixed(2)}</td>
                <td><button onClick={()=>removeLine(i)} style={{background:"none",border:"none",color:C.rose,cursor:"pointer",fontSize:16}}>✕</button></td>
              </tr>);
            })}</tbody>
          </table>
          <button onClick={addLine} style={{fontSize:12,color:C.teal,background:"none",border:`1px dashed ${C.teal}`,borderRadius:6,padding:"4px 12px",cursor:"pointer",marginBottom:14}}>+ Add Line</button>
          <div style={{textAlign:"right",fontSize:13,color:C.textMid,marginBottom:20}}>
            Subtotal: <b>${subtotal.toFixed(2)}</b> &nbsp;|&nbsp; VAT: <b>${tax.toFixed(2)}</b> &nbsp;|&nbsp; Total: <b style={{color:C.text,fontSize:15}}>${(subtotal+tax).toFixed(2)}</b>
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
            <button onClick={()=>setModal(null)} style={{padding:"9px 22px",borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer"}}>Cancel</button>
            <button onClick={save} disabled={saving} style={{padding:"9px 22px",borderRadius:8,background:C.teal,color:"#fff",border:"none",cursor:"pointer",fontWeight:700}}>{saving?"Saving...":"Save PO"}</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAYMENT MADE
═══════════════════════════════════════════════════════════════ */
function PaymentMade({ token }) {
  const h = { Authorization:`Bearer ${token}` };
  const emptyForm = { party_id:"", amount:"", date:new Date().toISOString().slice(0,10), method:"bank_transfer", reference:"", notes:"" };
  const [rows, setRows] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast=(msg,ok=true)=>{setToast({msg,ok});setTimeout(()=>setToast(null),3000);};
  const fetch_=async()=>{
    setLoading(true);
    try{const r=await fetch(`${API_URL}/api/payments?type=payment`,{headers:h});const d=await r.json();setRows(d.data||[]);}
    catch{setRows([]);}finally{setLoading(false);}
  };
  const fetchVendors=async()=>{
    try{const r=await fetch(`${API_URL}/api/vendors`,{headers:h});const d=await r.json();setVendors(d.data||[]);}catch{}
  };
  useEffect(()=>{fetch_();fetchVendors();},[]);
  const setL=(k,v)=>setForm(f=>({...f,[k]:v}));
  const save=async()=>{
    setSaving(true);
    try{
      const r=await fetch(`${API_URL}/api/payments`,{method:"POST",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify({...form,type:"payment"})});
      if(!r.ok){const e=await r.json();throw new Error(e.error||"Failed");}
      showToast("Payment recorded");setModal(null);setForm(emptyForm);fetch_();
    }catch(e){showToast(e.message,false);}finally{setSaving(false);}
  };
  const methods=["bank_transfer","cash","cheque","card","online"];
  const totalPaid=rows.reduce((s,r)=>s+parseFloat(r.amount||0),0);
  return(
    <div>
      {toast&&<div style={{position:"fixed",top:22,right:22,zIndex:9999,padding:"10px 20px",borderRadius:8,background:toast.ok?C.emerald:C.rose,color:"#fff",fontWeight:700,fontSize:13}}>{toast.msg}</div>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,color:C.text}}>Payments Made</div>
          <div style={{fontSize:13,color:C.textMid,marginTop:2}}>Total paid: <b style={{color:C.rose}}>${totalPaid.toLocaleString(undefined,{minimumFractionDigits:2})}</b></div>
        </div>
        <button onClick={()=>{setForm(emptyForm);setModal("form");}} style={{padding:"8px 18px",borderRadius:8,background:C.teal,color:"#fff",fontWeight:700,border:"none",cursor:"pointer",fontSize:13}}>+ Record Payment</button>
      </div>
      {loading?<div style={{textAlign:"center",padding:40,color:C.textMid}}>Loading...</div>:(
        <div style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:C.raised}}>{["Date","Supplier","Amount","Method","Reference","Notes"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontWeight:700,color:C.textMid,fontSize:11}}>{h}</th>)}</tr></thead>
            <tbody>{rows.length===0?<tr><td colSpan={6} style={{textAlign:"center",padding:32,color:C.textMid}}>No payments recorded</td></tr>:rows.map(r=>{
              const vend=vendors.find(v=>v.id===r.party_id);
              return(<tr key={r.id} style={{borderTop:`1px solid ${C.border}`}}>
                <td style={{padding:"10px 14px",color:C.textMid}}>{r.date}</td>
                <td style={{padding:"10px 14px"}}>{vend?.name||"—"}</td>
                <td style={{padding:"10px 14px",fontWeight:700,color:C.rose}}>${parseFloat(r.amount).toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                <td style={{padding:"10px 14px",color:C.textMid,textTransform:"capitalize"}}>{r.method?.replace(/_/g," ")}</td>
                <td style={{padding:"10px 14px",color:C.textMid}}>{r.reference||"—"}</td>
                <td style={{padding:"10px 14px",color:C.textMid}}>{r.notes||"—"}</td>
              </tr>);
            })}</tbody>
          </table>
        </div>
      )}
      {modal==="form"&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{background:"#fff",borderRadius:16,padding:28,width:"100%",maxWidth:520}}>
          <div style={{fontSize:17,fontWeight:800,marginBottom:20}}>Record Payment Made</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            <div style={{gridColumn:"span 2"}}><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>SUPPLIER *</label>
              <select value={form.party_id} onChange={e=>setL("party_id",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13}}>
                <option value="">Select supplier</option>
                {vendors.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
              </select></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>AMOUNT *</label>
              <input type="number" value={form.amount} onChange={e=>setL("amount",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>DATE *</label>
              <input type="date" value={form.date} onChange={e=>setL("date",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>METHOD</label>
              <select value={form.method} onChange={e=>setL("method",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13}}>
                {methods.map(m=><option key={m} value={m}>{m.replace(/_/g," ")}</option>)}
              </select></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>REFERENCE</label>
              <input value={form.reference} onChange={e=>setL("reference",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div style={{gridColumn:"span 2"}}><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>NOTES</label>
              <input value={form.notes} onChange={e=>setL("notes",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
            <button onClick={()=>setModal(null)} style={{padding:"9px 22px",borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer"}}>Cancel</button>
            <button onClick={save} disabled={saving} style={{padding:"9px 22px",borderRadius:8,background:C.rose,color:"#fff",border:"none",cursor:"pointer",fontWeight:700}}>{saving?"Saving...":"Record Payment"}</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VENDOR CREDIT
═══════════════════════════════════════════════════════════════ */
function VendorCredit({ token }) {
  const h = { Authorization:`Bearer ${token}` };
  const emptyLine = { description:"", quantity:1, unit_price:0, tax_rate:5 };
  const emptyForm = { vendor_id:"", bill_id:"", number:"", date:new Date().toISOString().slice(0,10), reason:"", lines:[{...emptyLine}] };
  const [rows, setRows] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast=(msg,ok=true)=>{setToast({msg,ok});setTimeout(()=>setToast(null),3000);};
  const fetch_=async()=>{
    setLoading(true);
    try{const r=await fetch(`${API_URL}/api/vendor-credits`,{headers:h});const d=await r.json();setRows(d.data||[]);}
    catch{setRows([]);}finally{setLoading(false);}
  };
  const fetchVendors=async()=>{
    try{const r=await fetch(`${API_URL}/api/vendors`,{headers:h});const d=await r.json();setVendors(d.data||[]);}catch{}
  };
  const fetchBills=async()=>{
    try{const r=await fetch(`${API_URL}/api/bills`,{headers:h});const d=await r.json();setBills(d.data||[]);}catch{}
  };
  useEffect(()=>{fetch_();fetchVendors();fetchBills();},[]);
  const setL=(k,v)=>setForm(f=>({...f,[k]:v}));
  const setLine=(i,k,v)=>setForm(f=>{const ls=[...f.lines];ls[i]={...ls[i],[k]:v};return{...f,lines:ls};});
  const addLine=()=>setForm(f=>({...f,lines:[...f.lines,{...emptyLine}]}));
  const removeLine=i=>setForm(f=>({...f,lines:f.lines.filter((_,j)=>j!==i)}));
  const subtotal=form.lines.reduce((s,l)=>s+parseFloat(l.quantity||0)*parseFloat(l.unit_price||0),0);
  const tax=form.lines.reduce((s,l)=>s+parseFloat(l.quantity||0)*parseFloat(l.unit_price||0)*(parseFloat(l.tax_rate||0)/100),0);
  const openNew=()=>{setForm({...emptyForm,number:`VC-${Date.now().toString().slice(-4)}`});setSelected(null);setModal("form");};
  const openEdit=async(row)=>{
    try{const r=await fetch(`${API_URL}/api/vendor-credits/${row.id}`,{headers:h});const d=await r.json();
      setForm({...d,lines:d.lines||[{...emptyLine}]});setSelected(row);setModal("form");}catch{}
  };
  const save=async()=>{
    setSaving(true);
    try{
      const url=selected?`${API_URL}/api/vendor-credits/${selected.id}`:`${API_URL}/api/vendor-credits`;
      const r=await fetch(url,{method:selected?"PUT":"POST",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify(form)});
      if(!r.ok){const e=await r.json();throw new Error(e.error||"Failed");}
      showToast(selected?"Updated":"Vendor credit created");setModal(null);fetch_();
    }catch(e){showToast(e.message,false);}finally{setSaving(false);}
  };
  const del=async()=>{
    try{await fetch(`${API_URL}/api/vendor-credits/${selected.id}`,{method:"DELETE",headers:h});showToast("Deleted");setModal(null);fetch_();}
    catch{showToast("Delete failed",false);}
  };
  const apply=async(row)=>{
    if(!row.bill_id){showToast("No bill linked",false);return;}
    const available=parseFloat(row.total)-parseFloat(row.applied_amount);
    try{
      const r=await fetch(`${API_URL}/api/vendor-credits/${row.id}/apply`,{method:"POST",headers:{...h,"Content-Type":"application/json"},body:JSON.stringify({bill_id:row.bill_id,amount:available})});
      if(!r.ok)throw new Error("Failed");showToast("Applied to bill");fetch_();
    }catch{showToast("Apply failed",false);}
  };
  const statusColor=s=>({draft:C.textDim,applied:C.emerald,void:C.rose}[s]||C.textDim);
  return(
    <div>
      {toast&&<div style={{position:"fixed",top:22,right:22,zIndex:9999,padding:"10px 20px",borderRadius:8,background:toast.ok?C.emerald:C.rose,color:"#fff",fontWeight:700,fontSize:13}}>{toast.msg}</div>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:800,color:C.text}}>Vendor Credits</div>
        <button onClick={openNew} style={{padding:"8px 18px",borderRadius:8,background:C.teal,color:"#fff",fontWeight:700,border:"none",cursor:"pointer",fontSize:13}}>+ New Vendor Credit</button>
      </div>
      {loading?<div style={{textAlign:"center",padding:40,color:C.textMid}}>Loading...</div>:(
        <div style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:C.raised}}>{["Number","Supplier","Bill","Date","Total","Applied","Status",""].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontWeight:700,color:C.textMid,fontSize:11}}>{h}</th>)}</tr></thead>
            <tbody>{rows.length===0?<tr><td colSpan={8} style={{textAlign:"center",padding:32,color:C.textMid}}>No vendor credits</td></tr>:rows.map(r=>(
              <tr key={r.id} style={{borderTop:`1px solid ${C.border}`}}>
                <td style={{padding:"10px 14px",fontWeight:700,color:C.teal}}>{r.number}</td>
                <td style={{padding:"10px 14px"}}>{r.vendor_name}</td>
                <td style={{padding:"10px 14px",color:C.textMid}}>{r.bill_number||"—"}</td>
                <td style={{padding:"10px 14px",color:C.textMid}}>{r.date}</td>
                <td style={{padding:"10px 14px",fontWeight:700}}>${parseFloat(r.total).toLocaleString()}</td>
                <td style={{padding:"10px 14px",color:C.emerald}}>${parseFloat(r.applied_amount).toLocaleString()}</td>
                <td style={{padding:"10px 14px"}}><span style={{background:`${statusColor(r.status)}18`,color:statusColor(r.status),padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{r.status}</span></td>
                <td style={{padding:"10px 14px",display:"flex",gap:8}}>
                  <button onClick={()=>openEdit(r)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",fontSize:11}}>Edit</button>
                  {r.status==="draft"&&r.bill_id&&<button onClick={()=>apply(r)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.emerald}`,color:C.emerald,background:"#fff",cursor:"pointer",fontSize:11}}>Apply</button>}
                  <button onClick={()=>{setSelected(r);setModal("delete");}} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.rose}`,color:C.rose,background:"#fff",cursor:"pointer",fontSize:11}}>Del</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {modal==="delete"&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{background:"#fff",borderRadius:16,padding:32,width:340,textAlign:"center"}}>
          <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>Delete vendor credit?</div>
          <div style={{color:C.textMid,fontSize:13,marginBottom:24}}>{selected?.number}</div>
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <button onClick={()=>setModal(null)} style={{padding:"8px 20px",borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer"}}>Cancel</button>
            <button onClick={del} style={{padding:"8px 20px",borderRadius:8,background:C.rose,color:"#fff",border:"none",cursor:"pointer",fontWeight:700}}>Delete</button>
          </div>
        </div>
      </div>}
      {modal==="form"&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{background:"#fff",borderRadius:16,padding:28,width:"100%",maxWidth:760,maxHeight:"90vh",overflowY:"auto"}}>
          <div style={{fontSize:17,fontWeight:800,marginBottom:20}}>{selected?"Edit Vendor Credit":"New Vendor Credit"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>SUPPLIER *</label>
              <select value={form.vendor_id} onChange={e=>setL("vendor_id",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13}}>
                <option value="">Select supplier</option>
                {vendors.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
              </select></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>NUMBER *</label>
              <input value={form.number} onChange={e=>setL("number",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>DATE *</label>
              <input type="date" value={form.date} onChange={e=>setL("date",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
            <div><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>ORIGINAL BILL</label>
              <select value={form.bill_id} onChange={e=>setL("bill_id",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13}}>
                <option value="">None</option>
                {bills.filter(b=>b.vendor_id===form.vendor_id||!form.vendor_id).map(b=><option key={b.id} value={b.id}>{b.number}</option>)}
              </select></div>
            <div style={{gridColumn:"span 2"}}><label style={{fontSize:11,fontWeight:700,color:C.textMid}}>REASON</label>
              <input value={form.reason} onChange={e=>setL("reason",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,marginTop:4,fontSize:13,boxSizing:"border-box"}} /></div>
          </div>
          <div style={{fontWeight:700,fontSize:12,color:C.textMid,marginBottom:8}}>LINE ITEMS</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:8}}>
            <thead><tr style={{background:C.raised}}>{["Description","Qty","Unit Price","VAT %","Amount",""].map(h=><th key={h} style={{padding:"6px 8px",textAlign:"left",fontWeight:700,color:C.textMid}}>{h}</th>)}</tr></thead>
            <tbody>{form.lines.map((l,i)=>{
              const amt=parseFloat(l.quantity||0)*parseFloat(l.unit_price||0);
              return(<tr key={i}>
                <td><input value={l.description} onChange={e=>setLine(i,"description",e.target.value)} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,boxSizing:"border-box"}} /></td>
                <td><input type="number" value={l.quantity} onChange={e=>setLine(i,"quantity",e.target.value)} style={{width:60,padding:"6px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12}} /></td>
                <td><input type="number" value={l.unit_price} onChange={e=>setLine(i,"unit_price",e.target.value)} style={{width:90,padding:"6px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12}} /></td>
                <td><input type="number" value={l.tax_rate} onChange={e=>setLine(i,"tax_rate",e.target.value)} style={{width:60,padding:"6px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12}} /></td>
                <td style={{padding:"4px 8px",fontWeight:700}}>${amt.toFixed(2)}</td>
                <td><button onClick={()=>removeLine(i)} style={{background:"none",border:"none",color:C.rose,cursor:"pointer",fontSize:16}}>✕</button></td>
              </tr>);
            })}</tbody>
          </table>
          <button onClick={addLine} style={{fontSize:12,color:C.teal,background:"none",border:`1px dashed ${C.teal}`,borderRadius:6,padding:"4px 12px",cursor:"pointer",marginBottom:14}}>+ Add Line</button>
          <div style={{textAlign:"right",fontSize:13,color:C.textMid,marginBottom:20}}>
            Subtotal: <b>${subtotal.toFixed(2)}</b> &nbsp;|&nbsp; VAT: <b>${tax.toFixed(2)}</b> &nbsp;|&nbsp; Total: <b style={{color:C.text,fontSize:15}}>${(subtotal+tax).toFixed(2)}</b>
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
            <button onClick={()=>setModal(null)} style={{padding:"9px 22px",borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer"}}>Cancel</button>
            <button onClick={save} disabled={saving} style={{padding:"9px 22px",borderRadius:8,background:C.teal,color:"#fff",border:"none",cursor:"pointer",fontWeight:700}}>{saving?"Saving...":"Save"}</button>
          </div>
        </div>
      </div>}
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
    <div style={{ height:"100vh", background:"#0A0A0A", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", fontFamily:sansFont, gap:20 }}>
      <div style={{ background:"#FFFFFF", borderRadius:12, padding:"12px 20px" }}>
        <img src="/logo.png" alt="SNG Books" style={{ width:160, height:"auto", display:"block" }}/>
      </div>
      <span style={{ color:"#A3A3A3", fontSize:13 }}>Loading…</span>
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
      case "quotes":            return <Quotes          token={token}/>;
      case "sales-orders":      return <SalesOrders     token={token}/>;
      case "payment-received":  return <PaymentReceived token={token}/>;
      case "credit-note":       return <CreditNote      token={token}/>;
      case "expenses":          return <Expenses        token={token}/>;
      case "purchase-orders":   return <PurchaseOrders  token={token}/>;
      case "payment-made":      return <PaymentMade     token={token}/>;
      case "vendor-credit":     return <VendorCredit    token={token}/>;
      case "banking":           return <Banking   token={token}/>;
      case "inventory":         return <Inventory token={token}/>;
      case "vat":               return <VAT       token={token}/>;
      case "reports":           return <Reports   token={token}/>;
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

  const pageTitle = `${pageLabels[page] || "Dashboard"} | SNG Books`;

  return (
    <>
    <Head><title>{pageTitle}</title></Head>
    <div style={{ display:"flex", height:"100vh", width:"100%",
      background:"#0A0A0A", fontFamily:sansFont, color:C.text, overflow:"hidden" }}>

      {/* ─── SIDEBAR ─── */}
      <div style={{ width:SW, flexShrink:0, height:"100%",
        background:"#111111",
        borderRight:"none", display:"flex", flexDirection:"column",
        transition:"width 0.2s", overflow:"hidden" }}>

        {/* Logo */}
        <div style={{ padding:collapsed?"12px 0":"14px 16px",
          borderBottom:"1px solid rgba(255,255,255,0.1)",
          display:"flex", alignItems:"center",
          justifyContent:collapsed?"center":"flex-start" }}>
          {collapsed ? (
            <img src="/logo.png" alt="SNG" style={{
              width:36, height:36, objectFit:"cover", objectPosition:"left center",
              borderRadius:8, background:"#FFFFFF", padding:4,
            }}/>
          ) : (
            <div style={{ background:"#FFFFFF", borderRadius:10, padding:"8px 12px", display:"inline-block" }}>
              <img src="/logo.png" alt="SNG Books" style={{
                width:150, height:"auto", objectFit:"contain",
                filter:"brightness(1.1)", display:"block",
              }}/>
            </div>
          )}
        </div>

        {/* Company switcher */}
        {!collapsed && (
          <div style={{ padding:"12px", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
            <div style={{
              width:"100%", background:"#1A1A1A", border:"1px solid #2A2A2A",
              borderRadius:9, padding:"10px 12px",
              display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:13, fontWeight:700, flex:1, textAlign:"left",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"#FFFFFF" }}>
                SNG Books
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
                background:active?"#F97316":"none",
                color:active?"#fff":"rgba(255,255,255,0.65)", position:"relative",
                transition:"background 0.15s" }}
                onMouseEnter={e=>!active&&(e.currentTarget.style.background="rgba(249,115,22,0.1)")}
                onMouseLeave={e=>!active&&(e.currentTarget.style.background="none")}>
                {active && <div style={{ position:"absolute", left:0, top:"20%", height:"60%",
                  width:3, borderRadius:"0 2px 2px 0", background:"#F97316" }}/>}
                <span style={{ fontSize:14, flexShrink:0 }}>{item.icon}</span>
                {!collapsed && (
                  <span style={{ fontSize:13, fontWeight:active?700:500, flex:1, textAlign:"left" }}>{item.label}</span>
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
              <span style={{ fontSize:11, fontWeight:700, color:"#F97316",
                letterSpacing:"0.12em", textTransform:"uppercase" }}>Sales</span>
              <span style={{ fontSize:11, color:"#F97316" }}>{expandSales?"▼":"▶"}</span>
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
                background:active?"#F97316":"none",
                color:active?"#fff":"rgba(255,255,255,0.6)", position:"relative",
                transition:"background 0.15s" }}
                onMouseEnter={e=>!active&&(e.currentTarget.style.background="rgba(249,115,22,0.08)")}
                onMouseLeave={e=>!active&&(e.currentTarget.style.background="none")}>
                {active && <div style={{ position:"absolute", left:0, top:"20%", height:"60%",
                  width:3, borderRadius:"0 2px 2px 0", background:"#F97316" }}/>}
                <span style={{ fontSize:13, flexShrink:0 }}>{item.icon}</span>
                {!collapsed && <>
                  <span style={{ fontSize:13, fontWeight:active?700:500, flex:1, textAlign:"left",
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
              <span style={{ fontSize:11, fontWeight:700, color:"#F97316",
                letterSpacing:"0.12em", textTransform:"uppercase" }}>Purchases</span>
              <span style={{ fontSize:11, color:"#F97316" }}>{expandPurchases?"▼":"▶"}</span>
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
                background:active?"#F97316":"none",
                color:active?"#fff":"rgba(255,255,255,0.6)", position:"relative",
                transition:"background 0.15s" }}
                onMouseEnter={e=>!active&&(e.currentTarget.style.background="rgba(249,115,22,0.08)")}
                onMouseLeave={e=>!active&&(e.currentTarget.style.background="none")}>
                {active && <div style={{ position:"absolute", left:0, top:"20%", height:"60%",
                  width:3, borderRadius:"0 2px 2px 0", background:"#F97316" }}/>}
                <span style={{ fontSize:13, flexShrink:0 }}>{item.icon}</span>
                {!collapsed && <>
                  <span style={{ fontSize:13, fontWeight:active?700:500, flex:1, textAlign:"left",
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
                background:active?"#F97316":"none",
                color:active?"#fff":"rgba(255,255,255,0.65)", position:"relative",
                transition:"background 0.15s" }}
                onMouseEnter={e=>!active&&(e.currentTarget.style.background="rgba(255,255,255,0.08)")}
                onMouseLeave={e=>!active&&(e.currentTarget.style.background="none")}>
                {active && <div style={{ position:"absolute", left:0, top:"20%", height:"60%",
                  width:3, borderRadius:"0 2px 2px 0", background:"#F97316" }}/>}
                <span style={{ fontSize:14, flexShrink:0 }}>{item.icon}</span>
                {!collapsed && <>
                  <span style={{ fontSize:13, fontWeight:active?700:500, flex:1, textAlign:"left" }}>{item.label}</span>
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
        <div style={{ height:56, background:"#111111", borderBottom:"1px solid #2A2A2A",
          display:"flex", alignItems:"center", padding:"0 22px", gap:14, flexShrink:0 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:800, color:"#FFFFFF", fontFamily:font }}>
              {pageLabels[page] || "Dashboard"}
            </div>
          </div>

          {/* Search */}
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#1A1A1A",
            border:"1px solid #2A2A2A", borderRadius:9, padding:"7px 13px", width:220 }}>
            <span style={{ color:"#525252", fontSize:12 }}>⌕</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..."
              style={{ background:"none", border:"none", outline:"none",
                color:"#FFFFFF", fontSize:11, width:"100%" }}/>
            <span style={{ fontSize:9, color:"#525252", background:"#2A2A2A",
              padding:"1px 5px", borderRadius:4 }}>⌘K</span>
          </div>

          {/* New Entry */}
          <button style={{ padding:"8px 16px", borderRadius:9, border:"none",
            background:"#F97316", color:"#fff", fontWeight:700, fontSize:11, cursor:"pointer",
            display:"flex", alignItems:"center", gap:5,
            boxShadow:"0 2px 8px rgba(249,115,22,0.3)" }}>
            + New Entry
          </button>

          {/* Notification bell */}
          <div style={{ position:"relative" }}>
            <button onClick={()=>setShowNotif(!showNotif)} style={{
              width:36, height:36, borderRadius:9, border:"1px solid #2A2A2A",
              background:"#1A1A1A", cursor:"pointer", fontSize:15,
              display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
              🔔
              <div style={{ position:"absolute", top:7, right:8, width:6, height:6,
                borderRadius:"50%", background:"#EF4444", border:"1px solid #111111" }}/>
            </button>
            {showNotif && (
              <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, width:290,
                background:"#111111", border:"1px solid #2A2A2A", borderRadius:12,
                overflow:"hidden", zIndex:300, boxShadow:"0 8px 30px rgba(0,0,0,0.5)" }}>
                <div style={{ padding:"12px 16px", borderBottom:"1px solid #2A2A2A",
                  display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:12, fontWeight:700, color:"#FFFFFF" }}>Notifications</span>
                  <span style={{ fontSize:10, color:"#F97316", cursor:"pointer" }}>Mark all read</span>
                </div>
                {[
                  { icon:"⚠", c:"#EF4444", msg:"INV-0840 Emirates NBD is overdue", t:"2h ago" },
                  { icon:"✓", c:"#22C55E", msg:"BILL-0391 approved by Finance Manager", t:"4h ago" },
                  { icon:"⊛", c:"#A855F7", msg:"VAT Q4 return due in 10 days", t:"1d ago" },
                  { icon:"⊠", c:"#6366F1", msg:"HP EliteBook 840 stock below reorder", t:"2d ago" },
                ].map((n,i)=>(
                  <div key={i} style={{ display:"flex", gap:10, padding:"11px 16px",
                    alignItems:"flex-start", borderBottom:"1px solid #2A2A2A", cursor:"pointer" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#1A1A1A"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <span style={{ fontSize:13, color:n.c, marginTop:1 }}>{n.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, color:"#FFFFFF", lineHeight:1.4 }}>{n.msg}</div>
                      <div style={{ fontSize:9, color:"#525252", marginTop:3 }}>{n.t}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User avatar + logout */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#FFFFFF" }}>{user?.name || "User"}</div>
              <div style={{ fontSize:9, color:"#A3A3A3", textTransform:"capitalize" }}>{user?.role || "admin"}</div>
            </div>
            <div style={{ width:34, height:34, borderRadius:9,
              background:"linear-gradient(135deg, #F97316, #EA6C0A)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, fontWeight:800, color:"#fff", cursor:"pointer",
              boxShadow:"0 2px 8px rgba(249,115,22,0.3)" }}>
              {userInitials}
            </div>
            <button
              onClick={logout}
              style={{
                padding:"7px 14px", borderRadius:8, border:"1px solid #2A2A2A",
                background:"#1A1A1A", cursor:"pointer", fontSize:12, fontWeight:600,
                color:"#EF4444", display:"flex", alignItems:"center", gap:6,
                fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif",
                transition:"all 0.15s",
              }}
              onMouseEnter={e=>{ e.currentTarget.style.background="#2A0000"; e.currentTarget.style.borderColor="#EF4444"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="#1A1A1A"; e.currentTarget.style.borderColor="#2A2A2A"; }}
            >
              <span style={{ fontSize:14 }}>⏻</span> Logout
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex:1, overflowY:"auto", padding:22, background:"#0A0A0A" }}>
          {renderPage()}
        </div>
      </div>
    </div>
    </>
  );
}
