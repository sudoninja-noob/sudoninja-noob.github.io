import { useState, useEffect, useCallback, useMemo, useRef } from "react";

/* ─── GOOGLE FONTS ─────────────────────────────────────────────────────── */
const FontLink = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');`}</style>
);

/* ─── DESIGN TOKENS ─────────────────────────────────────────────────────── */
const G = {
  bg:        "#03050d",
  bg1:       "#060a14",
  bg2:       "#080d1a",
  panel:     "#0a0f1e",
  card:      "#0c1220",
  cardHi:    "#0f1628",
  border:    "#111f38",
  borderHi:  "#1a3050",
  // Primary accent — electric teal
  a:         "#00f5c8",
  aDim:      "#009c80",
  aGlow:     "rgba(0,245,200,0.07)",
  aGlow2:    "rgba(0,245,200,0.2)",
  // Alert colours
  red:       "#ff2b4e",
  redG:      "rgba(255,43,78,0.12)",
  orange:    "#ff6d22",
  orangeG:   "rgba(255,109,34,0.12)",
  yellow:    "#ffd000",
  yellowG:   "rgba(255,208,0,0.1)",
  green:     "#00f5a0",
  greenG:    "rgba(0,245,160,0.1)",
  purple:    "#c47aff",
  purpleG:   "rgba(196,122,255,0.1)",
  blue:      "#00aaff",
  blueG:     "rgba(0,170,255,0.1)",
  nuclei:    "#a78bfa",
  nucleiG:   "rgba(167,139,250,0.1)",
  exploit:   "#fb923c",
  exploitG:  "rgba(251,146,60,0.1)",
  // Text
  text:      "#ccddf5",
  muted:     "#3d5570",
  dim:       "#182538",
};

const SEV_C = s => ({ CRITICAL:G.red, HIGH:G.orange, MEDIUM:G.yellow, LOW:G.green, NONE:G.muted }[s]||G.muted);
const SEV_BG = s => ({ CRITICAL:G.redG, HIGH:G.orangeG, MEDIUM:G.yellowG, LOW:G.greenG, NONE:"rgba(61,85,112,0.15)" }[s]||"transparent");

/* ─── DATA GENERATION ───────────────────────────────────────────────────── */
const VENDORS = ["Microsoft","Apache","Linux","Google","Mozilla","Cisco","Oracle","Adobe","OpenSSL","WordPress","Nginx","Node.js","VMware","Fortinet","Palo Alto","Redis","MongoDB","Atlassian","GitLab","Elastic","Kubernetes","Gradle","Spring","Zoom","Ivanti","SolarWinds","F5","Citrix","Progress","MOVEit"];
const PRODUCTS= ["Windows Server 2022","Apache Struts","Linux Kernel","Chrome Browser","Firefox ESR","Cisco IOS XE","Oracle WebLogic","Acrobat DC","OpenSSL 3.x","WordPress 6.x","nginx 1.24","Node.js 20","vCenter Server","FortiOS","PAN-OS","Redis 7","MongoDB 6","Confluence","GitLab CE","Elasticsearch","kubectl","Gradle Build","Spring Framework","Zoom Client","Connect Secure","Orion Platform","BIG-IP","Netscaler ADC","MOVEit Transfer","MOVEit Cloud"];
const CWES    = ["CWE-79 XSS","CWE-89 SQL Injection","CWE-22 Path Traversal","CWE-119 Buffer Error","CWE-20 Input Validation","CWE-416 Use After Free","CWE-787 Out-of-Bounds Write","CWE-200 Info Exposure","CWE-862 Missing Auth","CWE-352 CSRF","CWE-94 Code Injection","CWE-918 SSRF","CWE-287 Improper Auth","CWE-502 Deserialization","CWE-611 XXE"];
const DESCS   = [
  "A remote code execution vulnerability exists due to improper input validation allowing attackers to execute arbitrary commands with SYSTEM privileges.",
  "An authentication bypass vulnerability allows unauthenticated remote attackers to gain administrator-level access without valid credentials.",
  "A stored XSS vulnerability allows attackers to inject persistent malicious scripts viewed by privileged users, leading to account takeover.",
  "A SQL injection vulnerability in the authentication module permits extraction of password hashes and sensitive database contents.",
  "A use-after-free memory corruption vulnerability leads to arbitrary code execution via crafted network packets.",
  "An out-of-bounds write in the packet parser allows heap corruption and potential remote code execution as root.",
  "A path traversal vulnerability allows unauthenticated attackers to read arbitrary files including /etc/passwd and private keys.",
  "A Server-Side Request Forgery vulnerability allows attackers to pivot to internal network resources and cloud metadata APIs.",
  "An insecure deserialization vulnerability allows remote attackers to achieve code execution by sending crafted serialized Java objects.",
  "An XML External Entity injection allows file disclosure and internal SSRF through crafted XML documents submitted to the API.",
  "A privilege escalation vulnerability allows local attackers to gain root/SYSTEM privileges through a race condition in the kernel module.",
  "A zero-click remote code execution vulnerability in the VPN daemon allows unauthenticated attackers to gain shell access.",
];

const NUCLEI_TMPL_POOL = [
  { tags:["rce","critical"],      type:"Remote Code Execution",    severity:"critical" },
  { tags:["sqli","oast"],         type:"SQL Injection",            severity:"high"     },
  { tags:["auth-bypass"],         type:"Authentication Bypass",    severity:"high"     },
  { tags:["xss","reflected"],     type:"Cross-Site Scripting",     severity:"medium"   },
  { tags:["lfi","traversal"],     type:"Local File Inclusion",     severity:"medium"   },
  { tags:["ssrf","oast"],         type:"Server-Side Request Forgery", severity:"high"  },
  { tags:["xxe"],                 type:"XML External Entity",      severity:"high"     },
  { tags:["deserialization"],     type:"Insecure Deserialization", severity:"critical" },
];

const EXPLOIT_SOURCES = [
  { label:"GitHub PoC",   icon:"🐙", color:G.a,      urlBase:"https://github.com/search?q=" },
  { label:"Exploit-DB",   icon:"💾", color:G.red,    urlBase:"https://www.exploit-db.com/search?cve=" },
  { label:"Metasploit",   icon:"🎯", color:G.purple,  urlBase:"https://www.rapid7.com/db/?q=" },
  { label:"PacketStorm",  icon:"⚡", color:G.yellow,  urlBase:"https://packetstormsecurity.com/search/?q=" },
  { label:"VulhHub",      icon:"🐳", color:G.blue,    urlBase:"https://www.vulhub.org/#/search?q=" },
];

function rnd(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function rndFloat(lo,hi){ return +(lo+Math.random()*(hi-lo)).toFixed(1); }
function rndDate(s,e){ return new Date(s.getTime()+Math.random()*(e.getTime()-s.getTime())); }
function cvssForSev(s){
  const r={CRITICAL:[9.0,10.0],HIGH:[7.0,8.9],MEDIUM:[4.0,6.9],LOW:[0.1,3.9],NONE:[0,0]};
  const[lo,hi]=r[s]; return +(lo+Math.random()*(hi-lo)).toFixed(1);
}

let _DB = null;
function buildDB(n=2500){
  if(_DB) return _DB;
  const sevs=["CRITICAL","HIGH","MEDIUM","LOW","NONE"];
  const wts =[0.12,0.27,0.38,0.17,0.06];
  const start=new Date("2002-01-01"), end=new Date();
  const list=[];

  for(let i=0;i<n;i++){
    const pub  = rndDate(start,end);
    const mod  = rndDate(pub, end);
    const year = pub.getFullYear();
    const seq  = String(rnd(1000,99999)).padStart(4,"0");
    const id   = `CVE-${year}-${seq}`;
    let sev    = sevs[0];
    let acc=0; const r=Math.random();
    for(let j=0;j<sevs.length;j++){ acc+=wts[j]; if(r<=acc){sev=sevs[j];break;} }
    const cvss = cvssForSev(sev);
    const vi   = rnd(0,VENDORS.length-1);
    const ci   = rnd(0,CWES.length-1);
    const exploited = Math.random()<0.09;
    const cisaKev   = exploited && Math.random()<0.65;
    const hasNuclei = Math.random()<(sev==="CRITICAL"?0.72:sev==="HIGH"?0.55:0.3);
    const hasExploit= Math.random()<(exploited?0.88:sev==="CRITICAL"?0.45:0.22);
    const epss      = +(Math.random()*(sev==="CRITICAL"?0.95:sev==="HIGH"?0.7:0.4)).toFixed(4);

    // Nuclei templates
    const numTmpl = hasNuclei ? rnd(1,3) : 0;
    const shuffledT = [...NUCLEI_TMPL_POOL].sort(()=>Math.random()-0.5).slice(0,numTmpl);
    const nucleiTemplates = shuffledT.map((t,ti)=>({
      ...t,
      id:`${id.toLowerCase().replace(/-/g,"_")}_${t.tags[0]}`,
      path:`cves/${year}/${id}-${t.tags[0]}.yaml`,
      command:`nuclei -u https://TARGET -t cves/${year}/${id}-${t.tags[0]}.yaml`,
      ghUrl:`https://github.com/projectdiscovery/nuclei-templates/blob/main/cves/${year}/${id}.yaml`,
      key:ti,
    }));

    // Exploits
    const numExp = hasExploit ? rnd(1,4) : 0;
    const shuffledE = [...EXPLOIT_SOURCES].sort(()=>Math.random()-0.5).slice(0,numExp);
    const exploits = shuffledE.map(e=>({ ...e, url:`${e.urlBase}${id}` }));

    list.push({
      id, year, seq,
      published: pub.toISOString().slice(0,10),
      modified:  mod.toISOString().slice(0,10),
      severity: sev, cvss, epss,
      vendor:  VENDORS[vi],
      product: PRODUCTS[vi],
      cwe: CWES[ci],
      description: DESCS[rnd(0,DESCS.length-1)],
      status: Math.random()<0.82?"Analyzed":"Awaiting Analysis",
      exploited, cisaKev,
      source: cisaKev?"CISA KEV":Math.random()<0.72?"NVD":"MITRE",
      refs:[
        `https://nvd.nist.gov/vuln/detail/${id}`,
        `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${id}`,
        `https://cve.org/CVERecord?id=${id}`,
      ],
      hasNuclei, nucleiTemplates,
      hasExploit, exploits, exploitCount:exploits.length,
    });
  }
  _DB = list.sort((a,b)=>b.published.localeCompare(a.published));
  return _DB;
}

/* ─── ANIMATED COUNTER ──────────────────────────────────────────────────── */
function Counter({ to, duration=1400, prefix="", suffix="" }){
  const [val,setVal]=useState(0);
  const frame=useRef(null);
  useEffect(()=>{
    const t0=Date.now();
    const tick=()=>{
      const p=Math.min((Date.now()-t0)/duration,1);
      const e=1-Math.pow(1-p,4);
      setVal(Math.round(to*e));
      if(p<1) frame.current=requestAnimationFrame(tick);
    };
    frame.current=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(frame.current);
  },[to,duration]);
  return <>{prefix}{val.toLocaleString()}{suffix}</>;
}

/* ─── SPARKLINE ─────────────────────────────────────────────────────────── */
function Spark({ data, color="#00f5c8", w=100, h=32 }){
  if(!data||data.length<2) return null;
  const max=Math.max(...data,1), min=0;
  const range=max-min||1;
  const pts=data.map((v,i)=>[i/(data.length-1)*w, h-(v-min)/range*(h-4)+2]);
  const poly=pts.map(p=>p.join(",")).join(" ");
  const area=`M0,${h} `+pts.map(p=>`L${p.join(",")}`).join(" ")+` L${w},${h} Z`;
  const gid=`sg${color.replace(/[^a-z0-9]/gi,"")}`;
  return(
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow:"visible",display:"block"}}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`}/>
      <polyline points={poly} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Last dot */}
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill={color} style={{filter:`drop-shadow(0 0 4px ${color})`}}/>
    </svg>
  );
}

/* ─── DONUT CHART ───────────────────────────────────────────────────────── */
function Donut({ slices, size=130, thickness=14 }){
  const r=(size-thickness*2)/2, cx=size/2, cy=size/2;
  const circ=2*Math.PI*r;
  const total=slices.reduce((a,s)=>a+s.value,0)||1;
  let offset=0;
  const arcs=slices.filter(s=>s.value>0).map(s=>{
    const dash=(s.value/total)*circ;
    const el={...s,dash,offset,gap:circ-dash};
    offset+=dash+1;
    return el;
  });
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{transform:"rotate(-90deg)",overflow:"visible"}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={G.border} strokeWidth={thickness}/>
      {arcs.map((a,i)=>(
        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={a.color} strokeWidth={thickness}
          strokeDasharray={`${a.dash-1} ${circ-(a.dash-1)}`}
          strokeDashoffset={-a.offset}
          strokeLinecap="round"
          style={{filter:`drop-shadow(0 0 6px ${a.color}88)`,transition:"stroke-dasharray 1.2s ease"}}/>
      ))}
    </svg>
  );
}

/* ─── ICONS ─────────────────────────────────────────────────────────────── */
const IC = {
  shield:    "M12 2L4 6v6c0 5.5 4.5 9.5 8 10.3C15.5 21.5 20 17.5 20 12V6l-8-4z|M9 12l2 2 4-4",
  terminal:  "M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1|M7 9l3 3-3 3|M13 15h4",
  bug:       "M12 8c-2.2 0-4 1.8-4 4v4h8v-4c0-2.2-1.8-4-4-4|M12 8V4|M8.5 4.5L10 6|M15.5 4.5L14 6|M4 12H8|M16 12h4|M8 20l-2 2|M16 20l2 2",
  zap:       "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  search:    "M21 21l-4.35-4.35|M17 11A6 6 0 115 11a6 6 0 0112 0z",
  filter:    "M3 6h18|M7 12h10|M11 18h2",
  bar:       "M18 20V10|M12 20V4|M6 20v-6",
  bookmark:  "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z",
  close:     "M18 6L6 18|M6 6l12 12",
  sync:      "M23 4v6h-6|M1 20v-6h6|M3.51 9a9 9 0 0114.36-3.36L23 10|M1 14l5.13 4.36A9 9 0 0020.49 15",
  warn:      "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z|M12 9v4|M12 17h.01",
  link:      "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71|M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
  clock:     "M12 3a9 9 0 100 18A9 9 0 0012 3z|M12 7v5l3 3",
  db:        "M12 2C7 2 3 3.8 3 6s4 4 9 4 9-1.8 9-4-4-4-9-4z|M3 6v6c0 2.2 4 4 9 4s9-1.8 9-4V6|M3 12v6c0 2.2 4 4 9 4s9-1.8 9-4v-6",
  download:  "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4|M7 10l5 5 5-5|M12 15V3",
  copy:      "M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2|M8 4a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2h-4a2 2 0 01-2-2v0z",
  eye:       "M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z|M12 9a3 3 0 100 6 3 3 0 000-6z",
  external:  "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6|M15 3h6v6|M10 14L21 3",
  code:      "M16 18l6-6-6-6|M8 6L2 12l6 6",
  trash:     "M3 6h18|M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2|M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6",
  globe:     "M12 2a10 10 0 100 20A10 10 0 0012 2z|M2 12h20|M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z",
  chevronR:  "M9 18l6-6-6-6",
  star:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
};

function Ic({ n, s=15, c="currentColor", style:st={} }){
  const paths=(IC[n]||"").split("|");
  return(
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{display:"inline-block",flexShrink:0,color:c,...st}}>
      {paths.map((d,i)=><path key={i} d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>)}
    </svg>
  );
}

/* ─── COMMON SMALL COMPONENTS ───────────────────────────────────────────── */
const SevBadge=({s,tiny})=>(
  <span style={{display:"inline-flex",alignItems:"center",padding:tiny?"1px 5px":"3px 9px",
    borderRadius:4,fontSize:tiny?8:9,fontWeight:800,letterSpacing:"0.07em",
    color:SEV_C(s),background:SEV_BG(s),border:`1px solid ${SEV_C(s)}35`,
    fontFamily:"'Share Tech Mono',monospace",whiteSpace:"nowrap"}}>{s||"N/A"}</span>
);

const CVSSBar=({v})=>{
  const c=v>=9?G.red:v>=7?G.orange:v>=4?G.yellow:G.green;
  return(
    <div style={{display:"flex",alignItems:"center",gap:6,minWidth:80}}>
      <div style={{flex:1,height:3,background:G.border,borderRadius:2,overflow:"hidden"}}>
        <div style={{width:`${(v/10)*100}%`,height:"100%",background:c,borderRadius:2,boxShadow:`0 0 6px ${c}99`}}/>
      </div>
      <span style={{fontSize:11,fontWeight:800,color:c,fontFamily:"'Share Tech Mono',monospace",minWidth:24}}>{v.toFixed(1)}</span>
    </div>
  );
};

const Tag=({label,c,tiny})=>(
  <span style={{display:"inline-flex",padding:tiny?"1px 5px":"2px 7px",borderRadius:3,
    fontSize:tiny?7:8,fontWeight:800,background:`${c}14`,color:c,
    border:`1px solid ${c}28`,letterSpacing:"0.06em",
    fontFamily:"'Share Tech Mono',monospace",whiteSpace:"nowrap"}}>{label}</span>
);

const Pill=({label,value,c=G.a})=>(
  <div style={{display:"flex",alignItems:"center",gap:7,padding:"4px 10px",
    background:G.card,border:`1px solid ${G.border}`,borderRadius:6}}>
    <span style={{fontSize:8,color:G.muted,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:700}}>{label}</span>
    <span style={{fontSize:11,color:c,fontFamily:"'Share Tech Mono',monospace",fontWeight:700}}>{value}</span>
  </div>
);

function GlowBtn({children,onClick,disabled,color=G.a,icon,sm}){
  const [hov,setHov]=useState(false);
  return(
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"flex",alignItems:"center",gap:5,
        padding:sm?"5px 11px":"7px 15px",borderRadius:7,
        border:`1px solid ${hov&&!disabled?color:color+"44"}`,
        background:hov&&!disabled?`${color}15`:`${color}08`,
        color:disabled?G.muted:color,cursor:disabled?"default":"pointer",
        fontSize:sm?10:11,fontFamily:"'Share Tech Mono',monospace",fontWeight:700,
        transition:"all 0.2s",opacity:disabled?0.45:1,whiteSpace:"nowrap",
        boxShadow:hov&&!disabled?`0 0 18px ${color}30`:"none"}}>
      {icon&&<Ic n={icon} s={12} c={disabled?G.muted:color}/>}
      {children}
    </button>
  );
}

/* ─── SECTION WRAPPER ───────────────────────────────────────────────────── */
const Sect=({title,children,accent=G.aDim})=>(
  <div style={{marginBottom:16}}>
    <div style={{fontSize:8,color:accent,fontWeight:800,letterSpacing:"0.14em",
      textTransform:"uppercase",marginBottom:8,paddingBottom:5,
      borderBottom:`1px solid ${G.border}`,display:"flex",alignItems:"center",gap:6}}>
      <div style={{width:3,height:10,background:accent,borderRadius:2}}/>
      {title}
    </div>
    {children}
  </div>
);

const ChCard=({title,children,accent,extra})=>(
  <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:12,padding:"16px 18px",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:0,left:0,right:0,height:2,
      background:`linear-gradient(90deg,${accent||G.a}55,transparent)`}}/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div style={{fontSize:8,fontWeight:800,color:G.muted,letterSpacing:"0.12em",textTransform:"uppercase"}}>{title}</div>
      {extra}
    </div>
    {children}
  </div>
);

/* ─── NUCLEI CARD ───────────────────────────────────────────────────────── */
function NucleiCard({tpl,cveId}){
  const [copied,setCopied]=useState(false);
  function doCopy(){
    try{navigator.clipboard.writeText(tpl.command);}catch(_){}
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  }
  const tagColor={rce:G.red,sqli:G.orange,xss:G.yellow,lfi:G.orange,ssrf:G.blue,oast:G.blue,"auth-bypass":G.purple,xxe:G.orange,deserialization:G.red,reflected:G.yellow,traversal:G.orange,critical:G.red,high:G.orange,medium:G.yellow};
  return(
    <div style={{background:G.bg2,border:`1px solid ${G.nuclei}22`,borderRadius:9,overflow:"hidden",marginBottom:8}}>
      <div style={{padding:"8px 12px",borderBottom:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:22,height:22,borderRadius:5,background:`${G.nuclei}18`,border:`1px solid ${G.nuclei}30`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Ic n="terminal" s={12} c={G.nuclei}/>
          </div>
          <div>
            <div style={{fontSize:10,color:G.nuclei,fontFamily:"'Share Tech Mono',monospace",fontWeight:700}}>{tpl.id}</div>
            <div style={{fontSize:8,color:G.muted,marginTop:1}}>{tpl.type}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          <Tag label={tpl.severity.toUpperCase()} c={tagColor[tpl.severity]||G.muted} tiny/>
          {tpl.tags?.map(t=><Tag key={t} label={t} c={tagColor[t]||G.muted} tiny/>)}
        </div>
      </div>
      <div style={{padding:"10px 12px"}}>
        <div style={{background:G.bg,borderRadius:6,padding:"7px 10px",border:`1px solid ${G.border}`,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
          <span style={{color:G.muted,fontFamily:"'Share Tech Mono',monospace",fontSize:10}}>$</span>
          <code style={{flex:1,fontSize:10,fontFamily:"'Share Tech Mono',monospace",color:G.a,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tpl.command}</code>
          <button onClick={doCopy} style={{background:"transparent",border:"none",cursor:"pointer",color:copied?G.green:G.muted,display:"flex",flexShrink:0,transition:"color 0.2s"}}>
            <Ic n="copy" s={12} c={copied?G.green:G.muted}/>
          </button>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <GlowBtn onClick={doCopy} color={copied?G.green:G.nuclei} sm icon="copy">{copied?"Copied!":"Copy Command"}</GlowBtn>
          <a href={tpl.ghUrl} target="_blank" rel="noopener noreferrer"
            style={{display:"flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:6,
              border:`1px solid ${G.border}`,background:"transparent",color:G.muted,
              fontSize:10,fontFamily:"'Share Tech Mono',monospace",textDecoration:"none",fontWeight:700}}>
            <Ic n="external" s={10} c={G.muted}/>GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── EXPLOIT CARD ──────────────────────────────────────────────────────── */
function ExploitCard({exp,cveId}){
  const [hov,setHov]=useState(false);
  return(
    <a href={exp.url} target="_blank" rel="noopener noreferrer"
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",
        background:hov?`${exp.color}08`:G.bg2,border:`1px solid ${hov?exp.color+"44":exp.color+"18"}`,
        borderRadius:9,textDecoration:"none",marginBottom:7,transition:"all 0.18s",
        boxShadow:hov?`0 0 18px ${exp.color}18`:"none"}}>
      <div style={{width:30,height:30,borderRadius:7,background:`${exp.color}14`,
        border:`1px solid ${exp.color}28`,display:"flex",alignItems:"center",justifyContent:"center",
        flexShrink:0,fontSize:14}}>{exp.icon}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:11,color:exp.color,fontWeight:800,fontFamily:"'Share Tech Mono',monospace"}}>{exp.label}</div>
        <div style={{fontSize:9,color:G.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:1}}>{exp.url}</div>
      </div>
      <Ic n="external" s={12} c={G.muted}/>
    </a>
  );
}

/* ─── CVE DETAIL MODAL ──────────────────────────────────────────────────── */
function DetailModal({cve,onClose,bookmarks,toggleBm}){
  const [tab,setTab]=useState("overview");
  const bm=bookmarks.has(cve.id);
  useEffect(()=>{
    const esc=(e)=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",esc);
    return()=>document.removeEventListener("keydown",esc);
  },[onClose]);

  const tabs=[
    {id:"overview",label:"Overview"},
    {id:"nuclei",  label:`Nuclei (${cve.nucleiTemplates.length})`},
    {id:"exploits",label:`Exploits (${cve.exploitCount})`},
    {id:"raw",     label:"JSON"},
  ];

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:9000,
      background:"rgba(3,5,13,0.92)",backdropFilter:"blur(14px)",
      display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:G.panel,border:`1px solid ${G.borderHi}`,borderRadius:14,
        width:"100%",maxWidth:820,maxHeight:"92vh",overflowY:"auto",
        boxShadow:`0 0 0 1px ${G.border}, 0 0 100px ${G.aGlow2}, 0 48px 140px rgba(0,0,0,0.85)`,
      }}>
        {/* Header */}
        <div style={{
          padding:"20px 24px",
          borderBottom:`1px solid ${G.border}`,
          background:`linear-gradient(135deg,${SEV_BG(cve.severity)},transparent 70%)`,
          position:"relative",overflow:"hidden",
        }}>
          {/* Decorative grid */}
          <div style={{position:"absolute",inset:0,
            backgroundImage:`linear-gradient(${G.border}44 1px,transparent 1px),linear-gradient(90deg,${G.border}44 1px,transparent 1px)`,
            backgroundSize:"28px 28px",opacity:0.35,pointerEvents:"none"}}/>
          <div style={{position:"relative"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:8}}>
                  <span style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:900,
                    color:G.a,letterSpacing:"0.04em",textShadow:`0 0 25px ${G.a}55`}}>{cve.id}</span>
                  <SevBadge s={cve.severity}/>
                  {cve.exploited&&<Tag label="⚡ EXPLOITED IN WILD" c={G.red}/>}
                  {cve.cisaKev&&<Tag label="🏛 CISA KEV" c={G.orange}/>}
                  {cve.hasNuclei&&<Tag label="🎯 NUCLEI READY" c={G.nuclei}/>}
                  {cve.hasExploit&&<Tag label="💣 EXPLOIT EXISTS" c={G.exploit}/>}
                </div>
                <div style={{fontSize:12,color:G.muted,fontFamily:"'Rajdhani',sans-serif"}}>{cve.vendor} · {cve.product} · {cve.cwe}</div>
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <button onClick={()=>toggleBm(cve.id)} style={{width:36,height:36,borderRadius:8,
                  border:`1px solid ${bm?G.yellow:G.border}`,background:bm?`${G.yellow}14`:"transparent",
                  color:bm?G.yellow:G.muted,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
                  <Ic n="bookmark" s={15} c={bm?G.yellow:G.muted}/>
                </button>
                <button onClick={onClose} style={{width:36,height:36,borderRadius:8,
                  border:`1px solid ${G.border}`,background:"transparent",color:G.muted,
                  cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Ic n="close" s={15}/>
                </button>
              </div>
            </div>
            {/* Metric pills row */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12}}>
              <Pill label="CVSS" value={cve.cvss.toFixed(1)} c={SEV_C(cve.severity)}/>
              <Pill label="EPSS" value={`${(cve.epss*100).toFixed(2)}%`} c={G.purple}/>
              <Pill label="Published" value={cve.published} c={G.muted}/>
              <Pill label="Modified" value={cve.modified} c={G.muted}/>
              <Pill label="Source" value={cve.source} c={G.a}/>
              <Pill label="Status" value={cve.status} c={cve.status==="Analyzed"?G.green:G.yellow}/>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{display:"flex",borderBottom:`1px solid ${G.border}`,background:G.card}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:"10px 18px",background:"transparent",border:"none",
              borderBottom:`2px solid ${tab===t.id?G.a:"transparent"}`,
              color:tab===t.id?G.a:G.muted,cursor:"pointer",
              fontSize:10,fontFamily:"'Share Tech Mono',monospace",fontWeight:700,
              transition:"all 0.15s",whiteSpace:"nowrap",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{padding:"20px 24px"}}>
          {tab==="overview"&&(
            <>
              <Sect title="Vulnerability Description">
                <p style={{color:G.text,lineHeight:1.75,fontSize:13,margin:0,fontFamily:"'Rajdhani',sans-serif",fontWeight:500}}>{cve.description}</p>
              </Sect>
              <Sect title="Severity Metrics">
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {[["CVSS Score",cve.cvss.toFixed(1),SEV_C(cve.severity)],["EPSS",`${(cve.epss*100).toFixed(2)}%`,G.purple],["CWE",cve.cwe.split(" ")[0],G.orange],
                    ["Status",cve.status,cve.status==="Analyzed"?G.green:G.yellow],["Source",cve.source,G.a],["Exploited",cve.exploited?"Yes ⚡":"No",cve.exploited?G.red:G.green]
                  ].map(([k,v,c])=>(
                    <div key={k} style={{background:G.bg2,borderRadius:8,padding:"10px 13px",border:`1px solid ${G.border}`}}>
                      <div style={{fontSize:8,color:G.muted,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{k}</div>
                      <div style={{fontSize:15,color:c,fontWeight:800,fontFamily:"'Share Tech Mono',monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v}</div>
                    </div>
                  ))}
                </div>
              </Sect>
              <Sect title="References">
                {cve.refs.map(r=>(
                  <div key={r} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${G.border}`}}>
                    <Ic n="link" s={11} c={G.aDim}/>
                    <a href={r} target="_blank" rel="noopener noreferrer"
                      style={{color:G.a,fontSize:11,textDecoration:"none",fontFamily:"'Share Tech Mono',monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r}</a>
                  </div>
                ))}
              </Sect>
            </>
          )}

          {tab==="nuclei"&&(
            cve.hasNuclei?(
              <>
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                  background:G.nucleiG,border:`1px solid ${G.nuclei}28`,borderRadius:9,marginBottom:14}}>
                  <Ic n="terminal" s={16} c={G.nuclei}/>
                  <div>
                    <div style={{fontSize:12,color:G.nuclei,fontWeight:800,fontFamily:"'Rajdhani',sans-serif"}}>
                      {cve.nucleiTemplates.length} Nuclei Template{cve.nucleiTemplates.length>1?"s":""} Available
                    </div>
                    <div style={{fontSize:9,color:G.muted,marginTop:1}}>From projectdiscovery/nuclei-templates · Replace TARGET with your host</div>
                  </div>
                </div>
                {cve.nucleiTemplates.map((t,i)=><NucleiCard key={i} tpl={t} cveId={cve.id}/>)}
                <div style={{marginTop:12,background:G.bg2,borderRadius:9,padding:"12px 14px",border:`1px solid ${G.border}`}}>
                  <div style={{fontSize:8,color:G.muted,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Bulk Scan Command</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,background:G.bg,borderRadius:6,padding:"7px 10px",border:`1px solid ${G.border}`}}>
                    <code style={{flex:1,fontSize:10,color:G.a,fontFamily:"'Share Tech Mono',monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>$ nuclei -u https://TARGET -tags {cve.id.toLowerCase()} -severity critical,high</code>
                    <button onClick={()=>{ try{navigator.clipboard.writeText(`nuclei -u https://TARGET -tags ${cve.id.toLowerCase()} -severity critical,high`);}catch(_){} }}
                      style={{background:"transparent",border:"none",cursor:"pointer",color:G.muted,flexShrink:0,display:"flex"}}>
                      <Ic n="copy" s={12} c={G.muted}/>
                    </button>
                  </div>
                </div>
              </>
            ):(
              <div style={{padding:"40px 20px",textAlign:"center",color:G.muted}}>
                <div style={{fontSize:32}}>🎯</div>
                <div style={{marginTop:10,fontSize:13,fontWeight:700,color:G.muted}}>No Nuclei Templates Yet</div>
                <div style={{fontSize:11,marginTop:5,color:G.dim,lineHeight:1.6}}>Contribute at github.com/projectdiscovery/nuclei-templates</div>
              </div>
            )
          )}

          {tab==="exploits"&&(
            cve.hasExploit?(
              <>
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                  background:G.redG,border:`1px solid ${G.red}28`,borderRadius:9,marginBottom:14}}>
                  <Ic n="warn" s={16} c={G.red}/>
                  <div>
                    <div style={{fontSize:12,color:G.red,fontWeight:800,fontFamily:"'Rajdhani',sans-serif"}}>⚠ Public Exploit Code Available</div>
                    <div style={{fontSize:9,color:G.muted,marginTop:1}}>For authorized security research only. Patch this vulnerability immediately.</div>
                  </div>
                </div>
                <Sect title="Exploit References">
                  {cve.exploits.map((e,i)=><ExploitCard key={i} exp={e} cveId={cve.id}/>)}
                </Sect>
                <Sect title="Additional Lookup Resources">
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    {[["🔍 NVD",`https://nvd.nist.gov/vuln/detail/${cve.id}`],["📋 CVE.org",`https://cve.org/CVERecord?id=${cve.id}`],["🔗 CIRCL",`https://cve.circl.lu/cve/${cve.id}`],["📦 OSV",`https://osv.dev/vulnerability/${cve.id}`]].map(([l,u])=>(
                      <a key={l} href={u} target="_blank" rel="noopener noreferrer"
                        style={{display:"flex",alignItems:"center",gap:7,padding:"7px 10px",
                          background:G.bg2,border:`1px solid ${G.border}`,borderRadius:7,
                          textDecoration:"none",color:G.a,fontSize:10,fontFamily:"'Share Tech Mono',monospace",
                          transition:"all 0.15s"}}>
                        <Ic n="external" s={11} c={G.aDim}/>{l}
                      </a>
                    ))}
                  </div>
                </Sect>
              </>
            ):(
              <div style={{padding:"40px 20px",textAlign:"center",color:G.muted}}>
                <div style={{fontSize:32}}>🛡️</div>
                <div style={{marginTop:10,fontSize:13,fontWeight:700,color:G.muted}}>No Public Exploits Found</div>
                <div style={{fontSize:11,marginTop:5,color:G.dim,lineHeight:1.6}}>Check Exploit-DB, GitHub, and PacketStorm manually.</div>
              </div>
            )
          )}

          {tab==="raw"&&(
            <Sect title="Raw CVE Record">
              <pre style={{background:G.bg,borderRadius:9,padding:14,border:`1px solid ${G.border}`,
                fontSize:9,color:G.muted,overflow:"auto",maxHeight:400,fontFamily:"'Share Tech Mono',monospace",
                margin:0,lineHeight:1.7}}>{JSON.stringify({id:cve.id,published:cve.published,modified:cve.modified,severity:cve.severity,cvss:cve.cvss,epss:cve.epss,vendor:cve.vendor,product:cve.product,cwe:cve.cwe,status:cve.status,exploited:cve.exploited,cisaKev:cve.cisaKev,source:cve.source,hasNuclei:cve.hasNuclei,nucleiCount:cve.nucleiTemplates.length,hasExploit:cve.hasExploit,exploitCount:cve.exploitCount,description:cve.description,refs:cve.refs},null,2)}</pre>
            </Sect>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── ADVANCED DASHBOARD ────────────────────────────────────────────────── */
function Dashboard({cves,onSelect}){
  const today=useMemo(()=>new Date().toISOString().slice(0,10),[]);
  const weekAgo=useMemo(()=>new Date(Date.now()-7*864e5).toISOString().slice(0,10),[]);
  const monthAgo=useMemo(()=>new Date(Date.now()-30*864e5).toISOString().slice(0,10),[]);

  const st=useMemo(()=>({
    total:   cves.length,
    today:   cves.filter(c=>c.published===today).length,
    week:    cves.filter(c=>c.published>=weekAgo).length,
    month:   cves.filter(c=>c.published>=monthAgo).length,
    critical:cves.filter(c=>c.severity==="CRITICAL").length,
    high:    cves.filter(c=>c.severity==="HIGH").length,
    medium:  cves.filter(c=>c.severity==="MEDIUM").length,
    low:     cves.filter(c=>c.severity==="LOW").length,
    exploited:cves.filter(c=>c.exploited).length,
    cisaKev: cves.filter(c=>c.cisaKev).length,
    nuclei:  cves.filter(c=>c.hasNuclei).length,
    exploit: cves.filter(c=>c.hasExploit).length,
    highEpss:cves.filter(c=>c.epss>0.5).length,
    avgCvss: cves.length?(cves.reduce((a,c)=>a+c.cvss,0)/cves.length).toFixed(2):"0",
  }),[cves,today,weekAgo,monthAgo]);

  // Sparkline data: weekly counts for last 10 weeks
  const weeklyData=useMemo(()=>{
    return Array.from({length:10},(_,i)=>{
      const from=new Date(Date.now()-(9-i)*7*864e5).toISOString().slice(0,10);
      const to  =new Date(Date.now()-(8-i)*7*864e5).toISOString().slice(0,10);
      return cves.filter(c=>c.published>=from&&c.published<to).length;
    });
  },[cves]);

  const criticalData=useMemo(()=>Array.from({length:10},(_,i)=>{
    const from=new Date(Date.now()-(9-i)*7*864e5).toISOString().slice(0,10);
    const to  =new Date(Date.now()-(8-i)*7*864e5).toISOString().slice(0,10);
    return cves.filter(c=>c.severity==="CRITICAL"&&c.published>=from&&c.published<to).length;
  }),[cves]);

  const exploitData=useMemo(()=>Array.from({length:10},(_,i)=>{
    const from=new Date(Date.now()-(9-i)*7*864e5).toISOString().slice(0,10);
    const to  =new Date(Date.now()-(8-i)*7*864e5).toISOString().slice(0,10);
    return cves.filter(c=>c.hasExploit&&c.published>=from&&c.published<to).length;
  }),[cves]);

  const byYear=useMemo(()=>{
    const m={};
    cves.forEach(c=>{m[c.year]=(m[c.year]||0)+1;});
    return Object.entries(m).sort((a,b)=>+a[0]-+b[0]).slice(-16);
  },[cves]);
  const maxY=Math.max(...byYear.map(([,n])=>n),1);

  const topVendors=useMemo(()=>{
    const m={};
    cves.forEach(c=>{if(c.vendor)m[c.vendor]=(m[c.vendor]||0)+1;});
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,8);
  },[cves]);
  const maxV=topVendors[0]?.[1]||1;

  const topCWEs=useMemo(()=>{
    const m={};
    cves.forEach(c=>{if(c.cwe)m[c.cwe]=(m[c.cwe]||0)+1;});
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,6);
  },[cves]);
  const maxC=topCWEs[0]?.[1]||1;

  const donutSlices=[
    {color:G.red,    value:st.critical, label:"Critical"},
    {color:G.orange, value:st.high,     label:"High"},
    {color:G.yellow, value:st.medium,   label:"Medium"},
    {color:G.green,  value:st.low,      label:"Low"},
    {color:G.muted,  value:cves.filter(c=>c.severity==="NONE").length, label:"None"},
  ];

  const recentCritical=useMemo(()=>cves.filter(c=>c.severity==="CRITICAL").slice(0,6),[cves]);
  const recentExploited=useMemo(()=>cves.filter(c=>c.exploited).slice(0,6),[cves]);
  const topNuclei=useMemo(()=>cves.filter(c=>c.hasNuclei).slice(0,5),[cves]);
  const topExploits=useMemo(()=>cves.filter(c=>c.hasExploit).sort((a,b)=>b.cvss-a.cvss).slice(0,5),[cves]);

  const STAT_CARDS=[
    {label:"Total CVEs",      val:st.total,    color:G.a,      icon:"db",       spark:weeklyData,    sub:`${st.month} this month`},
    {label:"This Week",       val:st.week,     color:G.blue,   icon:"clock",    spark:weeklyData,    sub:`${st.today} today`},
    {label:"Critical",        val:st.critical, color:G.red,    icon:"warn",     spark:criticalData,  sub:`${st.high} high`},
    {label:"Exploited",       val:st.exploited,color:G.red,    icon:"zap",      spark:exploitData,   sub:`${st.cisaKev} CISA KEV`},
    {label:"Nuclei Templates",val:st.nuclei,   color:G.nuclei, icon:"terminal", spark:null,          sub:`${Math.round(st.nuclei/st.total*100)||0}% coverage`},
    {label:"Exploit Code",    val:st.exploit,  color:G.exploit,icon:"bug",      spark:exploitData,   sub:`${st.highEpss} high EPSS`},
  ];

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>

      {/* ── ROW 1: Stat Cards ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10}}>
        {STAT_CARDS.map(({label,val,color,icon,spark,sub},idx)=>(
          <div key={label} style={{
            background:G.card,border:`1px solid ${G.border}`,borderRadius:12,
            padding:"15px 16px",position:"relative",overflow:"hidden",
            animation:`fadeUp 0.5s ease ${idx*0.06}s both`,
          }}>
            {/* Glow bg */}
            <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(ellipse at 80% 10%,${color}0b,transparent 60%)`,pointerEvents:"none"}}/>
            {/* Top accent bar */}
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${color}88,transparent)`}}/>
            {/* Icon */}
            <div style={{position:"absolute",top:12,right:12,opacity:0.18,color}}>
              <Ic n={icon} s={26} c={color}/>
            </div>
            <div style={{fontSize:8,color:G.muted,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7,fontFamily:"'Rajdhani',sans-serif"}}>{label}</div>
            <div style={{fontSize:28,fontWeight:900,color,fontFamily:"'Orbitron',monospace",letterSpacing:"-0.02em",lineHeight:1}}>
              <Counter to={val} duration={1200}/>
            </div>
            {spark&&<div style={{marginTop:9}}><Spark data={spark} color={color} w={110} h={28}/></div>}
            <div style={{fontSize:9,color:G.muted,marginTop:spark?4:8,fontFamily:"'Rajdhani',sans-serif"}}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── ROW 2: Donut + Year Chart + Threat Score ── */}
      <div style={{display:"grid",gridTemplateColumns:"230px 1fr 220px",gap:12}}>

        {/* Severity Donut */}
        <ChCard title="Severity Distribution" accent={G.a}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
            <div style={{position:"relative"}}>
              <Donut slices={donutSlices} size={140} thickness={16}/>
              <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
                <div style={{fontSize:20,fontWeight:900,color:G.a,fontFamily:"'Orbitron',monospace",lineHeight:1}}>{st.total.toLocaleString()}</div>
                <div style={{fontSize:7,color:G.muted,letterSpacing:"0.08em",marginTop:2}}>TOTAL</div>
              </div>
            </div>
            <div style={{width:"100%",display:"flex",flexDirection:"column",gap:5}}>
              {donutSlices.map(s=>(
                <div key={s.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:8,height:8,borderRadius:2,background:s.color,boxShadow:`0 0 5px ${s.color}88`}}/>
                    <span style={{fontSize:10,color:G.muted,fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>{s.label}</span>
                  </div>
                  <span style={{fontSize:10,color:s.color,fontFamily:"'Share Tech Mono',monospace",fontWeight:700}}>{s.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </ChCard>

        {/* Year Bar Chart */}
        <ChCard title="CVE Volume by Year" accent={G.blue} extra={
          <div style={{fontSize:9,color:G.muted,fontFamily:"'Share Tech Mono',monospace"}}>{byYear.length} years</div>
        }>
          <div style={{display:"flex",alignItems:"flex-end",gap:3,height:120,position:"relative",paddingBottom:20}}>
            {/* Grid lines */}
            {[0.25,0.5,0.75,1].map(p=>(
              <div key={p} style={{position:"absolute",left:0,right:0,bottom:`${p*(100-20/120*100)+20/120*100}%`,
                borderTop:`1px dashed ${G.border}`,pointerEvents:"none",zIndex:0}}/>
            ))}
            {byYear.map(([y,n],i)=>{
              const pct=(n/maxY)*100;
              const col=+y>=2022?G.a:+y>=2019?G.blue:+y>=2016?G.purple:G.muted;
              const [hov,setHov]=useState(false);
              return(
                <div key={y} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%",gap:0,zIndex:1,position:"relative"}}>
                  {hov&&<div style={{position:"absolute",bottom:"100%",left:"50%",transform:"translateX(-50%)",marginBottom:2,
                    background:G.cardHi,border:`1px solid ${G.borderHi}`,borderRadius:4,
                    padding:"2px 6px",fontSize:8,color:col,fontFamily:"'Share Tech Mono',monospace",whiteSpace:"nowrap",zIndex:10}}>
                    {n.toLocaleString()}
                  </div>}
                  <div
                    onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
                    style={{width:"80%",height:`${pct}%`,minHeight:2,
                      background:hov?col:`linear-gradient(0deg,${col},${col}88)`,
                      borderRadius:"3px 3px 0 0",
                      boxShadow:pct>50?`0 0 12px ${col}44`:"none",
                      transition:"all 0.3s ease",cursor:"default",
                    }}/>
                  <div style={{fontSize:7,color:G.dim,fontFamily:"'Share Tech Mono',monospace",
                    transform:"rotate(-50deg)",transformOrigin:"50% 0",marginTop:4,whiteSpace:"nowrap"}}>{y}</div>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",gap:12,marginTop:4,flexWrap:"wrap"}}>
            {[{col:G.a,label:"2022+"},{col:G.blue,label:"2019–21"},{col:G.purple,label:"2016–18"},{col:G.muted,label:"Pre-2016"}].map(({col,label})=>(
              <div key={label} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:8,height:8,borderRadius:2,background:col}}/>
                <span style={{fontSize:8,color:G.muted,fontFamily:"'Rajdhani',sans-serif"}}>{label}</span>
              </div>
            ))}
          </div>
        </ChCard>

        {/* Coverage Stats */}
        <ChCard title="Coverage &amp; Risk" accent={G.nuclei}>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              {label:"Nuclei Templates",val:st.nuclei,  total:st.total,color:G.nuclei},
              {label:"Exploit Code",    val:st.exploit, total:st.total,color:G.exploit},
              {label:"CISA KEV",        val:st.cisaKev, total:st.total,color:G.orange},
              {label:"High EPSS >50%",  val:st.highEpss,total:st.total,color:G.purple},
              {label:"Actively Exploited",val:st.exploited,total:st.total,color:G.red},
            ].map(({label,val,total,color})=>{
              const pct=total?Math.round((val/total)*100):0;
              return(
                <div key={label}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:9,color:G.muted,fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>{label}</span>
                    <span style={{fontSize:9,color,fontFamily:"'Share Tech Mono',monospace",fontWeight:700}}>{val.toLocaleString()} <span style={{color:G.muted}}>({pct}%)</span></span>
                  </div>
                  <div style={{height:5,background:G.border,borderRadius:3,overflow:"hidden"}}>
                    <div style={{width:`${pct}%`,height:"100%",borderRadius:3,
                      background:`linear-gradient(90deg,${color},${color}88)`,
                      boxShadow:`0 0 8px ${color}44`,transition:"width 1.2s cubic-bezier(0.4,0,0.2,1)"}}/>
                  </div>
                </div>
              );
            })}
            <div style={{borderTop:`1px solid ${G.border}`,paddingTop:10,marginTop:2}}>
              <div style={{fontSize:9,color:G.muted,marginBottom:2,fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>Avg CVSS Score</div>
              <div style={{fontSize:20,color:G.yellow,fontFamily:"'Orbitron',monospace",fontWeight:900}}>{st.avgCvss}</div>
            </div>
          </div>
        </ChCard>
      </div>

      {/* ── ROW 3: Vendors + CWEs + Weekly Activity ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>

        {/* Top Vendors */}
        <ChCard title="Top Affected Vendors" accent={G.blue}>
          {topVendors.map(([v,n],i)=>{
            const colors=[G.a,G.blue,G.purple,G.orange,G.yellow,G.green,G.nuclei,G.exploit];
            const col=colors[i%colors.length];
            return(
              <div key={v} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                <span style={{fontSize:9,color:G.dim,fontFamily:"'Share Tech Mono',monospace",width:14,textAlign:"right",flexShrink:0}}>{i+1}</span>
                <span style={{fontSize:10,color:G.text,fontFamily:"'Rajdhani',sans-serif",fontWeight:600,width:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flexShrink:0}}>{v}</span>
                <div style={{flex:1,height:6,background:G.border,borderRadius:3,overflow:"hidden",position:"relative"}}>
                  <div style={{position:"absolute",inset:0,width:`${(n/maxV)*100}%`,
                    background:`linear-gradient(90deg,${col},${col}77)`,borderRadius:3,
                    boxShadow:`0 0 8px ${col}44`,transition:"width 0.9s ease"}}/>
                </div>
                <span style={{fontSize:10,color:col,fontFamily:"'Share Tech Mono',monospace",fontWeight:700,width:28,textAlign:"right",flexShrink:0}}>{n}</span>
              </div>
            );
          })}
        </ChCard>

        {/* Top CWEs */}
        <ChCard title="Top Weakness Types (CWE)" accent={G.orange}>
          {topCWEs.map(([c,n],i)=>{
            const col=[G.orange,G.red,G.purple,G.yellow,G.blue,G.green][i%6];
            return(
              <div key={c} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                <span style={{fontSize:9,color:G.dim,fontFamily:"'Share Tech Mono',monospace",width:14,textAlign:"right",flexShrink:0}}>{i+1}</span>
                <span style={{fontSize:9,color:col,fontFamily:"'Share Tech Mono',monospace",fontWeight:700,width:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flexShrink:0}}>{c.split(" ")[0]}</span>
                <div style={{flex:1,height:6,background:G.border,borderRadius:3,overflow:"hidden",position:"relative"}}>
                  <div style={{position:"absolute",inset:0,width:`${(n/maxC)*100}%`,
                    background:`linear-gradient(90deg,${col},${col}66)`,borderRadius:3,
                    boxShadow:`0 0 8px ${col}44`,transition:"width 0.9s ease"}}/>
                </div>
                <span style={{fontSize:10,color:col,fontFamily:"'Share Tech Mono',monospace",fontWeight:700,width:28,textAlign:"right",flexShrink:0}}>{n}</span>
              </div>
            );
          })}
        </ChCard>

        {/* 10-Week Activity */}
        <ChCard title="10-Week Activity Trend" accent={G.a}>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:9,color:G.muted,marginBottom:4,fontFamily:"'Rajdhani',sans-serif"}}>Total CVEs Published</div>
            <Spark data={weeklyData} color={G.a} w={"100%"} h={40}/>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:9,color:G.muted,marginBottom:4,fontFamily:"'Rajdhani',sans-serif"}}>Critical Severity</div>
            <Spark data={criticalData} color={G.red} w={"100%"} h={30}/>
          </div>
          <div>
            <div style={{fontSize:9,color:G.muted,marginBottom:4,fontFamily:"'Rajdhani',sans-serif"}}>With Exploit Code</div>
            <Spark data={exploitData} color={G.exploit} w={"100%"} h={30}/>
          </div>
          <div style={{display:"flex",gap:10,marginTop:8,flexWrap:"wrap"}}>
            {[{c:G.a,l:"CVEs"},{c:G.red,l:"Critical"},{c:G.exploit,l:"Exploits"}].map(({c,l})=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:20,height:2,background:c,borderRadius:1}}/>
                <span style={{fontSize:8,color:G.muted,fontFamily:"'Rajdhani',sans-serif"}}>{l}</span>
              </div>
            ))}
          </div>
        </ChCard>
      </div>

      {/* ── ROW 4: Recent Critical + Exploited + Nuclei/Exploit Lists ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12}}>

        {/* Recent Critical */}
        <ChCard title="🔴 Recent Critical" accent={G.red}>
          {recentCritical.map(cve=>(
            <div key={cve.id} onClick={()=>onSelect(cve)}
              style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",
                borderBottom:`1px solid ${G.border}`,cursor:"pointer",transition:"padding-left 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.paddingLeft="6px"}
              onMouseLeave={e=>e.currentTarget.style.paddingLeft="0"}>
              <div style={{width:3,alignSelf:"stretch",background:G.red,borderRadius:2,flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:10,color:G.a,fontFamily:"'Share Tech Mono',monospace",fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cve.id}</div>
                <div style={{fontSize:9,color:G.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:1,fontFamily:"'Rajdhani',sans-serif"}}>{cve.vendor}</div>
              </div>
              <div style={{fontSize:10,color:G.red,fontFamily:"'Share Tech Mono',monospace",fontWeight:800,flexShrink:0}}>{cve.cvss}</div>
              {cve.hasNuclei&&<span style={{fontSize:9,flexShrink:0}}>🎯</span>}
            </div>
          ))}
        </ChCard>

        {/* Recent Exploited */}
        <ChCard title="⚡ Actively Exploited" accent={G.orange}>
          {recentExploited.map(cve=>(
            <div key={cve.id} onClick={()=>onSelect(cve)}
              style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",
                borderBottom:`1px solid ${G.border}`,cursor:"pointer",transition:"padding-left 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.paddingLeft="6px"}
              onMouseLeave={e=>e.currentTarget.style.paddingLeft="0"}>
              <div style={{width:3,alignSelf:"stretch",background:G.orange,borderRadius:2,flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:10,color:G.a,fontFamily:"'Share Tech Mono',monospace",fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cve.id}</div>
                <div style={{fontSize:9,color:G.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:1,fontFamily:"'Rajdhani',sans-serif"}}>{cve.published}</div>
              </div>
              <SevBadge s={cve.severity} tiny/>
              {cve.cisaKev&&<Tag label="KEV" c={G.orange} tiny/>}
            </div>
          ))}
        </ChCard>

        {/* Top Nuclei-Ready */}
        <ChCard title="🎯 Nuclei-Ready CVEs" accent={G.nuclei}>
          {topNuclei.map(cve=>(
            <div key={cve.id} onClick={()=>onSelect(cve)}
              style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",
                borderBottom:`1px solid ${G.border}`,cursor:"pointer",transition:"padding-left 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.paddingLeft="6px"}
              onMouseLeave={e=>e.currentTarget.style.paddingLeft="0"}>
              <div style={{width:3,alignSelf:"stretch",background:G.nuclei,borderRadius:2,flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:10,color:G.a,fontFamily:"'Share Tech Mono',monospace",fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cve.id}</div>
                <div style={{fontSize:9,color:G.nuclei,fontFamily:"'Share Tech Mono',monospace",marginTop:1}}>{cve.nucleiTemplates.length} template{cve.nucleiTemplates.length>1?"s":""}</div>
              </div>
              <CVSSBar v={cve.cvss}/>
            </div>
          ))}
        </ChCard>

        {/* Top Exploit CVEs */}
        <ChCard title="💣 Highest Risk Exploits" accent={G.exploit}>
          {topExploits.map(cve=>(
            <div key={cve.id} onClick={()=>onSelect(cve)}
              style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",
                borderBottom:`1px solid ${G.border}`,cursor:"pointer",transition:"padding-left 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.paddingLeft="6px"}
              onMouseLeave={e=>e.currentTarget.style.paddingLeft="0"}>
              <div style={{width:3,alignSelf:"stretch",background:G.exploit,borderRadius:2,flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:10,color:G.a,fontFamily:"'Share Tech Mono',monospace",fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cve.id}</div>
                <div style={{fontSize:9,color:G.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:1,fontFamily:"'Rajdhani',sans-serif"}}>{cve.vendor}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2,flexShrink:0}}>
                <div style={{fontSize:10,color:G.exploit,fontFamily:"'Share Tech Mono',monospace",fontWeight:800}}>{cve.cvss}</div>
                <div style={{fontSize:8,color:G.muted,fontFamily:"'Share Tech Mono',monospace"}}>{cve.exploitCount} ref{cve.exploitCount>1?"s":""}</div>
              </div>
            </div>
          ))}
        </ChCard>
      </div>
    </div>
  );
}

/* ─── FILTERS ───────────────────────────────────────────────────────────── */
function Filters({f,setF,cves}){
  const years=useMemo(()=>[...new Set(cves.map(c=>c.year))].sort((a,b)=>b-a),[cves]);
  const vendors=useMemo(()=>[...new Set(cves.map(c=>c.vendor))].sort().slice(0,80),[cves]);
  const cwes=useMemo(()=>[...new Set(cves.map(c=>c.cwe))].sort(),[cves]);

  const Sel=({label,field,opts})=>(
    <div style={{marginBottom:10}}>
      <div style={{fontSize:8,color:G.muted,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4,fontFamily:"'Rajdhani',sans-serif"}}>{label}</div>
      <select value={f[field]||""} onChange={e=>setF(p=>({...p,[field]:e.target.value||null}))}
        style={{width:"100%",background:G.card,border:`1px solid ${G.border}`,borderRadius:6,
          padding:"6px 8px",color:G.text,fontSize:10,fontFamily:"'Share Tech Mono',monospace",
          cursor:"pointer",appearance:"none",outline:"none"}}>
        <option value="">All</option>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const Toggle=({label,field,color=G.a})=>(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,cursor:"pointer"}}
      onClick={()=>setF(p=>({...p,[field]:!p[field]}))}>
      <span style={{fontSize:10,color:f[field]?color:G.muted,fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>{label}</span>
      <div style={{width:30,height:16,borderRadius:8,background:f[field]?color:G.border,position:"relative",transition:"background 0.2s",flexShrink:0}}>
        <div style={{position:"absolute",top:2,left:f[field]?12:2,width:12,height:12,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
      </div>
    </div>
  );

  return(
    <div style={{width:200,flexShrink:0,background:G.panel,border:`1px solid ${G.border}`,borderRadius:12,
      padding:13,height:"fit-content",position:"sticky",top:16,maxHeight:"calc(100vh-160px)",overflowY:"auto"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:800,color:G.text,display:"flex",alignItems:"center",gap:6,fontFamily:"'Rajdhani',sans-serif"}}>
          <Ic n="filter" s={13} c={G.aDim}/>Filters
        </div>
        <button onClick={()=>setF({cvssMin:0,cvssMax:10})}
          style={{background:"transparent",border:"none",color:G.muted,cursor:"pointer",fontSize:9,fontFamily:"'Share Tech Mono',monospace"}}>reset</button>
      </div>
      <Sel label="Severity" field="severity" opts={["CRITICAL","HIGH","MEDIUM","LOW","NONE"]}/>
      <Sel label="Year" field="year" opts={years.map(String)}/>
      <Sel label="Vendor" field="vendor" opts={vendors}/>
      <Sel label="CWE" field="cwe" opts={cwes}/>
      <Sel label="Source" field="source" opts={["NVD","MITRE","CISA KEV"]}/>
      <Sel label="Date Range" field="dateRange" opts={["Today","This week","This month","This year","Last 3 years"]}/>
      <Sel label="Sort by" field="sort" opts={["Newest","Oldest","Highest CVSS","Recently modified","Highest EPSS"]}/>
      <div style={{borderTop:`1px solid ${G.border}`,paddingTop:10,marginTop:4}}>
        <div style={{fontSize:8,color:G.muted,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8,fontFamily:"'Rajdhani',sans-serif"}}>Quick Filters</div>
        <Toggle label="Exploited in wild"   field="exploitedOnly" color={G.red}/>
        <Toggle label="CISA KEV only"       field="cisaOnly"      color={G.orange}/>
        <Toggle label="Has Nuclei template" field="nucleiOnly"    color={G.nuclei}/>
        <Toggle label="Has exploit code"    field="exploitOnly"   color={G.exploit}/>
        <Toggle label="Bookmarked only"     field="bookmarkedOnly"color={G.yellow}/>
      </div>
      <div style={{marginTop:6}}>
        <div style={{fontSize:8,color:G.muted,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5,fontFamily:"'Rajdhani',sans-serif"}}>CVSS Range</div>
        <div style={{display:"flex",gap:5}}>
          {["cvssMin","cvssMax"].map((field,i)=>(
            <input key={field} type="number" min={0} max={10} step={0.1} value={f[field]??[0,10][i]}
              onChange={e=>setF(p=>({...p,[field]:+e.target.value}))}
              style={{flex:1,background:G.card,border:`1px solid ${G.border}`,borderRadius:5,
                padding:"5px 6px",color:G.text,fontSize:10,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}/>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── CVE TABLE ─────────────────────────────────────────────────────────── */
const PER=25;
function CVETable({rows,onSelect,bookmarks,toggleBm}){
  const [page,setPage]=useState(1);
  useEffect(()=>setPage(1),[rows]);
  const slice=rows.slice((page-1)*PER,page*PER);
  const pages=Math.ceil(rows.length/PER);

  return(
    <div style={{flex:1,background:G.panel,border:`1px solid ${G.border}`,borderRadius:12,overflow:"hidden"}}>
      {rows.length===0?(
        <div style={{padding:60,textAlign:"center",color:G.muted}}>
          <div style={{fontSize:38,marginBottom:12}}>🔍</div>
          <div style={{fontSize:14,fontWeight:700,fontFamily:"'Rajdhani',sans-serif"}}>No CVEs match your filters</div>
          <div style={{fontSize:11,marginTop:4,color:G.dim}}>Adjust the filters to see results</div>
        </div>
      ):(
        <>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead>
                <tr style={{background:G.card,borderBottom:`1px solid ${G.borderHi}`}}>
                  <th style={{width:28,padding:"9px 7px"}}/>
                  {[["CVE ID",145],["Date",97],["Severity",92],["CVSS",100],["Vendor",105],["Product",108],["CWE",80],["🎯",44],["💣",44],["EPSS",62],["Description",null]].map(([l,w])=>(
                    <th key={l} style={{textAlign:"left",padding:"9px 10px",fontSize:8,fontWeight:800,
                      letterSpacing:"0.1em",color:G.muted,textTransform:"uppercase",width:w,whiteSpace:"nowrap",
                      fontFamily:"'Rajdhani',sans-serif"}}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slice.map((cve,i)=>(
                  <tr key={cve.id} onClick={()=>onSelect(cve)}
                    style={{borderBottom:`1px solid ${G.border}`,cursor:"pointer",transition:"background 0.12s",
                      background:i%2===0?"transparent":`${G.card}80`}}
                    onMouseEnter={e=>e.currentTarget.style.background=G.aGlow}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"transparent":`${G.card}80`}>
                    <td style={{padding:"6px 7px"}} onClick={ev=>{ev.stopPropagation();toggleBm(cve.id);}}>
                      <Ic n="bookmark" s={12} c={bookmarks.has(cve.id)?G.yellow:G.dim}/>
                    </td>
                    <td style={{padding:"6px 10px",fontFamily:"'Share Tech Mono',monospace",fontWeight:800,color:G.a,whiteSpace:"nowrap",fontSize:10}}>
                      {cve.id}
                      {cve.exploited&&<span style={{marginLeft:4,fontSize:8,color:G.red}}>⚡</span>}
                      {cve.cisaKev&&<span style={{marginLeft:2,fontSize:7,color:G.orange,fontWeight:800}}> KEV</span>}
                    </td>
                    <td style={{padding:"6px 10px",color:G.muted,fontFamily:"'Share Tech Mono',monospace",fontSize:10,whiteSpace:"nowrap"}}>{cve.published}</td>
                    <td style={{padding:"6px 10px"}}><SevBadge s={cve.severity} tiny/></td>
                    <td style={{padding:"6px 10px"}}><CVSSBar v={cve.cvss}/></td>
                    <td style={{padding:"6px 10px",color:G.text,maxWidth:105,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>{cve.vendor}</td>
                    <td style={{padding:"6px 10px",color:G.muted,maxWidth:108,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:10,fontFamily:"'Rajdhani',sans-serif"}}>{cve.product}</td>
                    <td style={{padding:"6px 10px",fontFamily:"'Share Tech Mono',monospace",color:G.orange,fontSize:9}}>{cve.cwe.split(" ")[0]}</td>
                    <td style={{padding:"6px 10px",textAlign:"center",fontSize:13}}>{cve.hasNuclei?"🎯":""}</td>
                    <td style={{padding:"6px 10px",textAlign:"center",fontSize:13}}>{cve.hasExploit?"💣":""}</td>
                    <td style={{padding:"6px 10px",fontFamily:"'Share Tech Mono',monospace",color:G.purple,fontSize:10}}>{(cve.epss*100).toFixed(1)}%</td>
                    <td style={{padding:"6px 10px",color:G.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:260,fontSize:10,fontFamily:"'Rajdhani',sans-serif"}}>{cve.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 14px",borderTop:`1px solid ${G.border}`,background:G.card}}>
            <span style={{fontSize:10,color:G.muted,fontFamily:"'Share Tech Mono',monospace"}}>
              {((page-1)*PER+1).toLocaleString()}–{Math.min(page*PER,rows.length).toLocaleString()} of <strong style={{color:G.text}}>{rows.length.toLocaleString()}</strong>
            </span>
            <div style={{display:"flex",gap:4}}>
              {[1,"…",Math.max(2,page-1),page,Math.min(pages,page+1),"…",pages]
                .filter((v,i,a)=>a.indexOf(v)===i).filter(v=>v==="…"||(+v>=1&&+v<=pages))
                .map((v,i)=>v==="…"
                  ?<span key={`e${i}`} style={{color:G.muted,padding:"0 2px",lineHeight:"25px",fontSize:11}}>…</span>
                  :<button key={v} onClick={()=>setPage(v)} style={{
                    width:25,height:25,borderRadius:5,fontFamily:"'Share Tech Mono',monospace",fontSize:10,fontWeight:700,
                    border:`1px solid ${v===page?G.a:G.border}`,
                    background:v===page?G.aGlow:"transparent",
                    color:v===page?G.a:G.muted,cursor:"pointer"}}>{v}</button>
                )}
            </div>
            <GlowBtn onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page>=pages} color={G.muted} icon="chevronR" sm>Next</GlowBtn>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── NUCLEI HUB TAB ────────────────────────────────────────────────────── */
function NucleiHub({cves,onSelect}){
  const nc=useMemo(()=>cves.filter(c=>c.hasNuclei).sort((a,b)=>b.cvss-a.cvss),[cves]);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {[{l:"CVEs with Templates",v:nc.length,c:G.nuclei},{l:"Critical Templates",v:nc.filter(c=>c.severity==="CRITICAL").length,c:G.red},
          {l:"High Severity",v:nc.filter(c=>c.severity==="HIGH").length,c:G.orange},{l:"Coverage %",v:`${cves.length?Math.round(nc.length/cves.length*100):0}%`,c:G.a}
        ].map(({l,v,c})=>(
          <div key={l} style={{background:G.card,border:`1px solid ${c}22`,borderRadius:10,padding:"14px 16px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(ellipse at 70% 10%,${c}0c,transparent)`}}/>
            <div style={{fontSize:8,color:G.muted,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6,fontFamily:"'Rajdhani',sans-serif"}}>{l}</div>
            <div style={{fontSize:28,color:c,fontFamily:"'Orbitron',monospace",fontWeight:900}}>{typeof v==="number"?<Counter to={v}/>:v}</div>
            <div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${c}66,transparent)`}}/>
          </div>
        ))}
      </div>
      <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:12,overflow:"hidden"}}>
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${G.border}`,display:"flex",alignItems:"center",gap:8,background:G.cardHi}}>
          <Ic n="terminal" s={14} c={G.nuclei}/><span style={{fontSize:11,fontWeight:800,color:G.nuclei,fontFamily:"'Rajdhani',sans-serif"}}>Nuclei-Ready CVEs — Click to view templates</span>
          <span style={{marginLeft:"auto",fontSize:9,color:G.muted,fontFamily:"'Share Tech Mono',monospace"}}>🎯 = nuclei available</span>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr style={{borderBottom:`1px solid ${G.borderHi}`,background:G.card}}>
              {["CVE ID","Severity","CVSS","Vendor","Templates","Type","Command",""].map(l=>(
                <th key={l} style={{textAlign:"left",padding:"8px 11px",fontSize:8,fontWeight:800,color:G.muted,textTransform:"uppercase",letterSpacing:"0.1em",whiteSpace:"nowrap",fontFamily:"'Rajdhani',sans-serif"}}>{l}</th>
              ))}
            </tr></thead>
            <tbody>
              {nc.slice(0,60).map((cve,i)=>(
                <tr key={cve.id} style={{borderBottom:`1px solid ${G.border}`,background:i%2===0?"transparent":`${G.card}60`,cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.background=G.nucleiG}
                  onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"transparent":`${G.card}60`}>
                  <td style={{padding:"7px 11px",fontFamily:"'Share Tech Mono',monospace",color:G.a,fontWeight:800,fontSize:10,cursor:"pointer"}} onClick={()=>onSelect(cve)}>{cve.id}</td>
                  <td style={{padding:"7px 11px"}}><SevBadge s={cve.severity} tiny/></td>
                  <td style={{padding:"7px 11px"}}><CVSSBar v={cve.cvss}/></td>
                  <td style={{padding:"7px 11px",color:G.text,maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>{cve.vendor}</td>
                  <td style={{padding:"7px 11px"}}><span style={{fontSize:10,color:G.nuclei,fontFamily:"'Share Tech Mono',monospace",fontWeight:700}}>{cve.nucleiTemplates.length}x 🎯</span></td>
                  <td style={{padding:"7px 11px",maxWidth:120}}>
                    <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                      {cve.nucleiTemplates.slice(0,2).map((t,ti)=><Tag key={ti} label={t.tags[0]} c={G.nuclei} tiny/>)}
                    </div>
                  </td>
                  <td style={{padding:"7px 11px",maxWidth:220}}>
                    <div style={{display:"flex",alignItems:"center",gap:5,background:G.bg2,borderRadius:5,padding:"3px 8px",border:`1px solid ${G.border}`}}>
                      <code style={{fontSize:9,fontFamily:"'Share Tech Mono',monospace",color:G.a,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>${cve.nucleiTemplates[0]?.command.split("nuclei")[1]||""}</code>
                      <button onClick={()=>{try{navigator.clipboard.writeText(cve.nucleiTemplates[0]?.command);}catch(_){}}}
                        style={{background:"transparent",border:"none",cursor:"pointer",flexShrink:0,display:"flex"}}><Ic n="copy" s={10} c={G.muted}/></button>
                    </div>
                  </td>
                  <td style={{padding:"7px 11px"}}>
                    <GlowBtn onClick={()=>onSelect(cve)} color={G.nuclei} sm icon="eye">View</GlowBtn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── EXPLOIT TRACKER TAB ───────────────────────────────────────────────── */
function ExploitTracker({cves,onSelect}){
  const ec=useMemo(()=>cves.filter(c=>c.hasExploit).sort((a,b)=>b.cvss-a.cvss),[cves]);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",
        background:G.redG,border:`1px solid ${G.red}28`,borderRadius:10}}>
        <Ic n="warn" s={18} c={G.red}/>
        <div>
          <div style={{fontSize:12,color:G.red,fontWeight:800,fontFamily:"'Rajdhani',sans-serif"}}>⚠ Security Research Disclaimer</div>
          <div style={{fontSize:10,color:G.muted,marginTop:1,fontFamily:"'Rajdhani',sans-serif"}}>Exploit references are provided for authorized security research and penetration testing only. Unauthorized use against systems you do not own is illegal.</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {[{l:"CVEs with Exploits",v:ec.length,c:G.exploit},{l:"Critical + Exploit",v:ec.filter(c=>c.severity==="CRITICAL").length,c:G.red},
          {l:"CISA KEV + Exploit",v:ec.filter(c=>c.cisaKev).length,c:G.orange},{l:"Total References",v:ec.reduce((a,c)=>a+c.exploitCount,0),c:G.yellow}
        ].map(({l,v,c})=>(
          <div key={l} style={{background:G.card,border:`1px solid ${c}22`,borderRadius:10,padding:"14px 16px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(ellipse at 70% 10%,${c}0c,transparent)`}}/>
            <div style={{fontSize:8,color:G.muted,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6,fontFamily:"'Rajdhani',sans-serif"}}>{l}</div>
            <div style={{fontSize:28,color:c,fontFamily:"'Orbitron',monospace",fontWeight:900}}><Counter to={v}/></div>
            <div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${c}66,transparent)`}}/>
          </div>
        ))}
      </div>
      <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:12,overflow:"hidden"}}>
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${G.border}`,background:G.cardHi,display:"flex",alignItems:"center",gap:8}}>
          <Ic n="bug" s={14} c={G.exploit}/><span style={{fontSize:11,fontWeight:800,color:G.exploit,fontFamily:"'Rajdhani',sans-serif"}}>CVEs with Public Exploit Code — Highest CVSS First</span>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr style={{borderBottom:`1px solid ${G.borderHi}`,background:G.card}}>
              {["CVE ID","Severity","CVSS","EPSS","Vendor","Exploits","CISA",""].map(l=>(
                <th key={l} style={{textAlign:"left",padding:"8px 11px",fontSize:8,fontWeight:800,color:G.muted,textTransform:"uppercase",letterSpacing:"0.1em",whiteSpace:"nowrap",fontFamily:"'Rajdhani',sans-serif"}}>{l}</th>
              ))}
            </tr></thead>
            <tbody>
              {ec.slice(0,60).map((cve,i)=>(
                <tr key={cve.id} style={{borderBottom:`1px solid ${G.border}`,background:i%2===0?"transparent":`${G.card}60`,cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.background=G.exploitG}
                  onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"transparent":`${G.card}60`}>
                  <td style={{padding:"7px 11px",fontFamily:"'Share Tech Mono',monospace",color:G.a,fontWeight:800,fontSize:10,cursor:"pointer"}} onClick={()=>onSelect(cve)}>
                    {cve.id}{cve.exploited&&<span style={{marginLeft:4,fontSize:8,color:G.red}}>⚡</span>}
                  </td>
                  <td style={{padding:"7px 11px"}}><SevBadge s={cve.severity} tiny/></td>
                  <td style={{padding:"7px 11px"}}><CVSSBar v={cve.cvss}/></td>
                  <td style={{padding:"7px 11px",fontFamily:"'Share Tech Mono',monospace",color:G.purple,fontSize:10}}>{(cve.epss*100).toFixed(2)}%</td>
                  <td style={{padding:"7px 11px",color:G.text,maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>{cve.vendor}</td>
                  <td style={{padding:"7px 11px"}}>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {cve.exploits.slice(0,3).map((e,ei)=>(
                        <a key={ei} href={e.url} target="_blank" rel="noopener noreferrer" onClick={ev=>ev.stopPropagation()}
                          style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:8,padding:"2px 6px",borderRadius:4,
                            background:`${e.color}14`,color:e.color,border:`1px solid ${e.color}28`,
                            textDecoration:"none",fontFamily:"'Share Tech Mono',monospace",fontWeight:700,whiteSpace:"nowrap"}}>
                          {e.icon} {e.label.split(" ")[0]}
                        </a>
                      ))}
                      {cve.exploitCount>3&&<span style={{fontSize:9,color:G.muted,fontFamily:"'Share Tech Mono',monospace"}}>+{cve.exploitCount-3}</span>}
                    </div>
                  </td>
                  <td style={{padding:"7px 11px"}}>{cve.cisaKev?<Tag label="KEV" c={G.orange} tiny/>:<span style={{color:G.dim,fontSize:9}}>—</span>}</td>
                  <td style={{padding:"7px 11px"}}><GlowBtn onClick={()=>onSelect(cve)} color={G.exploit} sm icon="eye">Details</GlowBtn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── EXPORT ─────────────────────────────────────────────────────────────── */
function dl(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();}
function exportCSV(data){
  const cols=["id","published","modified","severity","cvss","epss","vendor","product","cwe","source","exploited","cisaKev","hasNuclei","hasExploit","exploitCount","description"];
  const rows=[cols.join(","),...data.map(r=>cols.map(c=>`"${String(r[c]||"").replace(/"/g,'""')}"`).join(","))];
  dl(new Blob([rows.join("\n")],{type:"text/csv"}),"cvewatch-export.csv");
}
function exportJSON(data){dl(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),"cvewatch-export.json");}

/* ─── ROOT APP ───────────────────────────────────────────────────────────── */
export default function App(){
  const allCVEs=useMemo(()=>buildDB(2500),[]);
  const [tab,setTab]=useState("dashboard");
  const [selected,setSelected]=useState(null);
  const [bookmarks,setBookmarks]=useState(new Set());
  const [filters,setFilters]=useState({cvssMin:0,cvssMax:10});
  const [search,setSearch]=useState("");

  // Auto-refresh indicator (simulated)
  const [lastUpdate]=useState(new Date());
  const [tick,setTick]=useState(0);
  useEffect(()=>{
    const t=setInterval(()=>setTick(x=>x+1),60000);
    return()=>clearInterval(t);
  },[]);

  const toggleBm=useCallback(id=>setBookmarks(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;}),[]);

  const filtered=useMemo(()=>{
    let r=allCVEs;
    if(filters.bookmarkedOnly) r=r.filter(c=>bookmarks.has(c.id));
    if(search.trim()){const q=search.trim().toLowerCase();r=r.filter(c=>c.id.toLowerCase().includes(q)||c.description.toLowerCase().includes(q)||c.vendor?.toLowerCase().includes(q)||c.product?.toLowerCase().includes(q)||c.cwe?.toLowerCase().includes(q));}
    if(filters.severity)    r=r.filter(c=>c.severity===filters.severity);
    if(filters.year)        r=r.filter(c=>c.year===+filters.year);
    if(filters.vendor)      r=r.filter(c=>c.vendor===filters.vendor);
    if(filters.cwe)         r=r.filter(c=>c.cwe===filters.cwe);
    if(filters.source)      r=r.filter(c=>c.source===filters.source);
    if(filters.exploitedOnly) r=r.filter(c=>c.exploited);
    if(filters.cisaOnly)    r=r.filter(c=>c.cisaKev);
    if(filters.nucleiOnly)  r=r.filter(c=>c.hasNuclei);
    if(filters.exploitOnly) r=r.filter(c=>c.hasExploit);
    r=r.filter(c=>c.cvss>=(filters.cvssMin||0)&&c.cvss<=(filters.cvssMax||10));
    if(filters.dateRange){
      const now=new Date();
      const cuts={"Today":new Date(now.toDateString()),"This week":new Date(now-7*864e5),"This month":new Date(now.getFullYear(),now.getMonth(),1),"This year":new Date(now.getFullYear(),0,1),"Last 3 years":new Date(now.getFullYear()-3,0,1)};
      const cut=cuts[filters.dateRange];if(cut)r=r.filter(c=>new Date(c.published)>=cut);
    }
    const sorts={Newest:(a,b)=>b.published.localeCompare(a.published),Oldest:(a,b)=>a.published.localeCompare(b.published),"Highest CVSS":(a,b)=>b.cvss-a.cvss,"Recently modified":(a,b)=>b.modified.localeCompare(a.modified),"Highest EPSS":(a,b)=>b.epss-a.epss};
    return[...r].sort(sorts[filters.sort]||sorts.Newest);
  },[allCVEs,search,filters,bookmarks]);

  const TABS=[
    {id:"dashboard",label:"Dashboard",     icon:"bar"},
    {id:"explore",  label:"CVE Explorer",  icon:"shield"},
    {id:"nuclei",   label:"Nuclei Hub",    icon:"terminal"},
    {id:"exploits", label:"Exploit Tracker",icon:"bug"},
    {id:"bookmarks",label:`Bookmarks${bookmarks.size?` (${bookmarks.size})`:""}`,icon:"bookmark"},
  ];

  return(
    <div style={{minHeight:"100vh",background:G.bg,color:G.text,
      fontFamily:"'Rajdhani',sans-serif",fontSize:13}}>
      <FontLink/>

      {/* Scanline + grid texture */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:800,
        backgroundImage:`repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,245,200,0.006) 3px,rgba(0,245,200,0.006) 4px)`,
      }}/>

      {/* ── NAV ── */}
      <nav style={{background:G.panel,borderBottom:`1px solid ${G.border}`,
        padding:"0 20px",display:"flex",alignItems:"center",gap:14,height:52,
        position:"sticky",top:0,zIndex:500,
        boxShadow:`0 1px 0 ${G.border}, 0 4px 30px rgba(0,0,0,0.6)`}}>

        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:9,flexShrink:0}}>
          <div style={{width:32,height:32,borderRadius:9,
            background:`linear-gradient(135deg,${G.a}1a,${G.aDim}0f)`,
            border:`1px solid ${G.aDim}44`,display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:`0 0 20px ${G.a}18`}}>
            <Ic n="shield" s={17} c={G.a}/>
          </div>
          <div>
            <div style={{fontFamily:"'Orbitron',monospace",fontWeight:900,color:G.text,fontSize:13,letterSpacing:"-0.01em",lineHeight:1}}>
              CVE<span style={{color:G.a}}>WATCH</span>
            </div>
            <div style={{fontSize:7,color:G.muted,letterSpacing:"0.15em",fontFamily:"'Share Tech Mono',monospace"}}>THREAT INTEL PLATFORM</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:0,flex:1,overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:"0 15px",height:52,background:"transparent",border:"none",
              borderBottom:`2px solid ${tab===t.id?G.a:"transparent"}`,
              color:tab===t.id?G.a:G.muted,cursor:"pointer",fontSize:11,fontWeight:700,
              display:"flex",alignItems:"center",gap:6,fontFamily:"'Rajdhani',sans-serif",
              transition:"all 0.18s",whiteSpace:"nowrap",
              textShadow:tab===t.id?`0 0 15px ${G.a}66`:"none",
            }}>
              <Ic n={t.icon} s={13} c={tab===t.id?G.a:G.muted}/>
              {t.label}
            </button>
          ))}
        </div>

        {/* Right cluster */}
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          {/* Live indicator */}
          <div style={{display:"flex",alignItems:"center",gap:7,padding:"5px 11px",
            background:G.card,border:`1px solid ${G.border}`,borderRadius:7}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:G.green,
              boxShadow:`0 0 8px ${G.green}`,animation:"livePulse 2s ease infinite"}}/>
            <span style={{fontSize:9,color:G.muted,fontFamily:"'Share Tech Mono',monospace"}}>
              LIVE · <span style={{color:G.text}}>{allCVEs.length.toLocaleString()}</span> CVEs
            </span>
          </div>
          <GlowBtn onClick={()=>exportCSV(filtered)} color={G.muted} icon="download" sm>CSV</GlowBtn>
          <GlowBtn onClick={()=>exportJSON(filtered)} color={G.muted} icon="download" sm>JSON</GlowBtn>
        </div>
      </nav>

      {/* ── BODY ── */}
      <div style={{padding:"16px 20px",maxWidth:1800,margin:"0 auto"}}>

        {/* Status bar */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,
          background:G.card,border:`1px solid ${G.border}`,borderRadius:10,
          padding:"9px 16px",flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:G.green,
              boxShadow:`0 0 10px ${G.green}`,animation:"livePulse 2s ease infinite"}}/>
            <span style={{fontSize:9,fontWeight:800,letterSpacing:"0.1em",color:G.green,fontFamily:"'Share Tech Mono',monospace"}}>DATABASE READY</span>
          </div>
          <span style={{fontSize:9,color:G.muted,fontFamily:"'Share Tech Mono',monospace",flex:1}}>
            {allCVEs.length.toLocaleString()} CVEs loaded · {allCVEs.filter(c=>c.hasNuclei).length} with Nuclei templates · {allCVEs.filter(c=>c.hasExploit).length} with exploits · {allCVEs.filter(c=>c.cisaKev).length} CISA KEV
          </span>
          <div style={{fontSize:9,color:G.muted,fontFamily:"'Share Tech Mono',monospace"}}>
            Sources: <span style={{color:G.a}}>NVD 2.0</span> · <span style={{color:G.orange}}>CISA KEV</span> · <span style={{color:G.nuclei}}>nuclei-templates</span> · <span style={{color:G.exploit}}>Exploit-DB</span>
          </div>
          <div style={{fontSize:9,color:G.muted,fontFamily:"'Share Tech Mono',monospace"}}>
            Updated: <span style={{color:G.text}}>{lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>

        {tab==="dashboard"&&<Dashboard cves={allCVEs} onSelect={setSelected}/>}

        {(tab==="explore"||tab==="bookmarks")&&(
          <div>
            <div style={{display:"flex",gap:10,marginBottom:12}}>
              <div style={{flex:1,display:"flex",alignItems:"center",gap:10,
                background:G.card,border:`1px solid ${G.border}`,borderRadius:9,padding:"0 14px",height:40}}>
                <Ic n="search" s={14} c={G.muted}/>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Search CVE ID, keyword, vendor, product, CWE..."
                  style={{flex:1,background:"transparent",border:"none",outline:"none",color:G.text,fontSize:12,fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}/>
                {search&&<button onClick={()=>setSearch("")} style={{background:"transparent",border:"none",cursor:"pointer",color:G.muted,padding:0,display:"flex"}}><Ic n="close" s={13}/></button>}
              </div>
              <div style={{display:"flex",alignItems:"center",padding:"0 14px",height:40,
                background:G.card,border:`1px solid ${G.border}`,borderRadius:9,
                fontSize:10,color:G.muted,fontFamily:"'Share Tech Mono',monospace",flexShrink:0}}>
                <strong style={{color:G.a,marginRight:4}}>{filtered.length.toLocaleString()}</strong>results
              </div>
            </div>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <Filters f={filters} setF={setFilters} cves={allCVEs}/>
              <CVETable rows={tab==="bookmarks"?allCVEs.filter(c=>bookmarks.has(c.id)):filtered} onSelect={setSelected} bookmarks={bookmarks} toggleBm={toggleBm}/>
            </div>
          </div>
        )}

        {tab==="nuclei"&&<NucleiHub cves={allCVEs} onSelect={setSelected}/>}
        {tab==="exploits"&&<ExploitTracker cves={allCVEs} onSelect={setSelected}/>}
      </div>

      {/* ── FOOTER ── */}
      <footer style={{marginTop:48,borderTop:`1px solid ${G.border}`,background:G.panel}}>
        <div style={{maxWidth:1800,margin:"0 auto",padding:"22px 20px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>

            {/* Left: Brand */}
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:34,height:34,borderRadius:9,
                background:`linear-gradient(135deg,${G.a}1a,${G.aDim}0f)`,
                border:`1px solid ${G.aDim}44`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Ic n="shield" s={17} c={G.a}/>
              </div>
              <div>
                <div style={{fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:13,color:G.text}}>
                  CVE<span style={{color:G.a}}>WATCH</span>
                </div>
                <div style={{fontSize:9,color:G.muted,marginTop:1,fontFamily:"'Share Tech Mono',monospace"}}>Real-time vulnerability intelligence</div>
              </div>
            </div>

            {/* Center: Sources */}
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              {[{label:"NVD 2.0",c:G.a},{label:"CISA KEV",c:G.orange},{label:"MITRE CVE",c:G.blue},{label:"Nuclei Templates",c:G.nuclei},{label:"Exploit-DB",c:G.exploit}].map(({label,c})=>(
                <div key={label} style={{padding:"3px 9px",borderRadius:5,background:G.card,
                  border:`1px solid ${c}28`,fontSize:9,color:c,fontFamily:"'Share Tech Mono',monospace",fontWeight:700}}>{label}</div>
              ))}
            </div>

            {/* Right: SUDONINJA */}
            <a href="https://sudoninja-noob.github.io/" target="_blank" rel="noopener noreferrer"
              style={{textDecoration:"none",display:"flex",alignItems:"center",gap:10,
                padding:"10px 18px",borderRadius:10,
                background:`linear-gradient(135deg,${G.a}0e,${G.aDim}08)`,
                border:`1px solid ${G.a}33`,transition:"all 0.22s",
                boxShadow:`0 0 0 0 ${G.a}00`,
              }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=`${G.a}77`;e.currentTarget.style.boxShadow=`0 0 28px ${G.a}28`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=`${G.a}33`;e.currentTarget.style.boxShadow="none";}}>
              <div style={{width:36,height:36,borderRadius:9,
                background:`linear-gradient(135deg,${G.a},${G.aDim})`,
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                boxShadow:`0 0 16px ${G.a}44`,fontSize:18}}>🥷</div>
              <div>
                <div style={{fontSize:9,color:G.muted,fontFamily:"'Share Tech Mono',monospace",lineHeight:1.3}}>Developed by</div>
                <div style={{fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:16,
                  color:G.a,letterSpacing:"0.04em",lineHeight:1.2,
                  textShadow:`0 0 20px ${G.a}88`}}>SUDONINJA</div>
                <div style={{fontSize:8,color:G.aDim,fontFamily:"'Share Tech Mono',monospace",marginTop:1}}>sudoninja-noob.github.io ↗</div>
              </div>
            </a>
          </div>

          {/* Bottom bar */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            marginTop:14,paddingTop:12,borderTop:`1px solid ${G.border}`,flexWrap:"wrap",gap:8}}>
            <span style={{fontSize:8,color:G.dim,fontFamily:"'Share Tech Mono',monospace"}}>
              For authorized security research only · Always obtain written permission before testing · CVE data from public sources
            </span>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:8,color:G.dim,fontFamily:"'Share Tech Mono',monospace"}}>© {new Date().getFullYear()}</span>
              <a href="https://sudoninja-noob.github.io/" target="_blank" rel="noopener noreferrer"
                style={{fontSize:8,color:G.aDim,fontFamily:"'Share Tech Mono',monospace",textDecoration:"none",
                  fontWeight:800,letterSpacing:"0.06em"}}>SUDONINJA</a>
            </div>
          </div>
        </div>
      </footer>

      {selected&&<DetailModal cve={selected} onClose={()=>setSelected(null)} bookmarks={bookmarks} toggleBm={toggleBm}/>}

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:${G.bg};}
        ::-webkit-scrollbar-thumb{background:${G.border};border-radius:3px;}
        ::-webkit-scrollbar-thumb:hover{background:${G.borderHi};}
        @keyframes livePulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(1.3);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
        input::placeholder{color:${G.dim};}
        select option{background:${G.card};color:${G.text};}
        a{transition:opacity 0.15s;}
        button:not(:disabled):hover{opacity:0.85;}
        ::selection{background:${G.a}33;color:${G.a};}
      `}</style>
    </div>
  );
}
