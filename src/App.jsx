import { useState, useRef, useEffect } from "react";

const LIGHT = { dark:"#1C1410",amber:"#C97B2A",warm:"#E8A44A",cream:"#FAF3E8",mist:"#F0E8D8",ink:"#2D2017",soft:"#7A6652",border:"#DDD0BC",bg:"#FAF3E8" };
const DARK  = { dark:"#FAF3E8",amber:"#C97B2A",warm:"#E8A44A",cream:"#1C1410",mist:"#231A13",ink:"#F0E8D8",soft:"#C4A882",border:"#3D2E22",bg:"#141008" };
let C = { ...DARK };

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-font-smoothing: antialiased; transition: background 0.3s ease; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse  { 0%,100%{opacity:.4;transform:scale(.95);}50%{opacity:1;transform:scale(1.05);} }
  @keyframes scoreIn{ from{opacity:0;transform:scale(.85);}to{opacity:1;transform:scale(1);} }
  .fade-up  { animation: fadeUp  0.45s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-in  { animation: fadeIn  0.3s ease both; }
  .score-in { animation: scoreIn 0.5s cubic-bezier(0.22,1,0.36,1) both; }
  textarea, input[type=text], input[type=email], input[type=tel] {
    font-family:'Plus Jakarta Sans',sans-serif; font-size:15px;
    background:var(--mist); border:1.5px solid var(--border);
    color:var(--ink); border-radius:12px; padding:13px 16px; width:100%; outline:none;
    transition:border-color .2s,box-shadow .2s;
  }
  textarea { resize:none; line-height:1.65; }
  textarea:focus,input:focus { border-color:var(--amber); box-shadow:0 0 0 3px rgba(201,123,42,.1); }
  textarea::placeholder,input::placeholder { color:var(--border); }
  button { cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; }
`;

function useIsMobile() {
  const [m,setM]=useState(()=>window.innerWidth<768);
  useEffect(()=>{const fn=()=>setM(window.innerWidth<768);window.addEventListener("resize",fn,{passive:true});return()=>window.removeEventListener("resize",fn);},[]);
  return m;
}

// ── Shared components ─────────────────────────────────────────────────────────
const Lbl = ({children,note}) => (
  <div style={{marginBottom:"8px"}}>
    <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"11px",color:C.soft,letterSpacing:"0.08em",textTransform:"uppercase"}}>{children}</label>
    {note&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.border,marginLeft:"8px"}}>{note}</span>}
  </div>
);
const Btn = ({children,onClick,disabled,full,secondary}) => (
  <button onClick={onClick} disabled={disabled}
    style={{background:disabled?C.border:secondary?"transparent":C.amber,color:disabled?C.soft:secondary?C.amber:C.cream,border:secondary?`1.5px solid ${C.amber}`:"none",borderRadius:"12px",padding:"13px 28px",fontSize:"15px",fontWeight:600,cursor:disabled?"not-allowed":"pointer",boxShadow:disabled||secondary?"none":"0 4px 14px rgba(201,123,42,.25)",transition:"all .2s",width:full?"100%":"auto",minHeight:"48px"}}
    onMouseEnter={e=>{if(!disabled&&!secondary)e.currentTarget.style.background=C.warm;}}
    onMouseLeave={e=>{if(!disabled&&!secondary)e.currentTarget.style.background=C.amber;}}>
    {children}
  </button>
);
const Ghost = ({children,onClick}) => (
  <button onClick={onClick} style={{background:"transparent",color:C.soft,border:`1.5px solid ${C.border}`,borderRadius:"12px",padding:"13px 22px",fontSize:"14px",cursor:"pointer",transition:"all .2s"}}
    onMouseEnter={e=>{e.currentTarget.style.borderColor=C.amber;e.currentTarget.style.color=C.amber;}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.soft;}}>
    {children}
  </button>
);
const Card = ({children,style,...props}) => <div style={{background:C.mist,border:`1.5px solid ${C.border}`,borderRadius:"16px",padding:"22px 24px",...style}} {...props}>{children}</div>;
const Pulse = ({msg}) => (
  <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 0"}}>
    <div style={{width:"7px",height:"7px",borderRadius:"50%",background:C.amber,animation:"pulse 1.4s ease infinite",flexShrink:0}}/>
    <span style={{fontSize:"13px",color:C.soft,fontStyle:"italic"}}>{msg}</span>
  </div>
);
const RadioGroup = ({label,options,value,onChange}) => (
  <div>
    <Lbl>{label}</Lbl>
    <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
      {options.map(opt=>(
        <button key={opt.value} onClick={()=>onChange(opt.value)}
          style={{background:value===opt.value?C.amber:C.mist,color:value===opt.value?C.cream:C.soft,border:`1.5px solid ${value===opt.value?C.amber:C.border}`,borderRadius:"10px",padding:"9px 18px",fontSize:"14px",fontWeight:value===opt.value?600:400,transition:"all .2s",cursor:"pointer"}}>
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);
const StarRating = ({value,onChange}) => (
  <div>
    <Lbl>Rate your resume before we evaluate</Lbl>
    <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
      {[1,2,3,4,5,6,7,8,9,10].map(n=>(
        <button key={n} onClick={()=>onChange(n)}
          style={{width:"38px",height:"38px",borderRadius:"10px",border:`1.5px solid ${n<=value?C.amber:C.border}`,background:n<=value?"rgba(201,123,42,0.15)":C.mist,color:n<=value?C.amber:C.soft,fontSize:"13px",fontWeight:600,transition:"all .2s",cursor:"pointer"}}>
          {n}
        </button>
      ))}
    </div>
    {value>0&&<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,marginTop:"6px",letterSpacing:"0.06em"}}>{value}/10 — we'll compare this to the actual score</p>}
  </div>
);

// ── Score gauge — shows score WITHOUT /100 when locked ────────────────────────
const ScoreGauge = ({score,locked}) => {
  const color = score>=75?"#4caf50":score>=55?C.amber:"#e57373";
  const size  = 116;
  const r     = 46;
  const circ  = 2*Math.PI*r;
  const dash  = locked ? circ*0.4 : (score/100)*circ;
  return (
    <div className="score-in" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"6px"}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth="8"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={locked?C.border:color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{transition:"stroke-dasharray 1.2s ease"}}/>
      </svg>
      <div style={{position:"relative",marginTop:`-${size+14}px`,height:size,width:size,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        {locked
          ? <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"11px",color:C.soft,letterSpacing:"0.08em",textTransform:"uppercase",userSelect:"none"}}>Locked</div>
          : <>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:"30px",fontWeight:400,color,lineHeight:1}}>{score}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:C.soft,letterSpacing:"0.06em",marginTop:"2px"}}>/100</div>
            </>
        }
      </div>
    </div>
  );
};

// ── Section bar ───────────────────────────────────────────────────────────────
const SectionBar = ({label,score,status,locked}) => {
  const color = status==="good"?"#4caf50":status==="average"?C.amber:"#e57373";
  return (
    <div style={{marginBottom:"12px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"5px"}}>
        <span style={{fontSize:"13px",color:C.ink,fontWeight:500,textTransform:"capitalize"}}>{label}</span>
        {locked
          ? <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.border,letterSpacing:"0.06em",filter:"blur(5px)",userSelect:"none",pointerEvents:"none"}}>Locked</span>
          : <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color,letterSpacing:"0.06em"}}>
                {status==="good"?"Good":status==="average"?"Average":"Needs work"}
              </span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"11px",color}}>{score}</span>
            </div>
        }
      </div>
      <div style={{height:"6px",background:C.border,borderRadius:"3px",overflow:"hidden"}}>
        <div style={{height:"100%",width:locked?"35%":`${score}%`,background:locked?C.border:color,borderRadius:"3px",filter:locked?"blur(5px)":"none",transition:"width .9s ease"}}/>
      </div>
    </div>
  );
};

// ── Blur overlay block ────────────────────────────────────────────────────────
const Blurred = ({children}) => (
  <div style={{position:"relative",borderRadius:"12px",overflow:"hidden",userSelect:"none"}}>
    <div style={{filter:"blur(5px)",opacity:.45,pointerEvents:"none"}}>{children}</div>
    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:C.dark,border:`1.5px solid ${C.amber}`,borderRadius:"8px",padding:"6px 16px",fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,letterSpacing:"0.1em",textTransform:"uppercase"}}>Unlock to reveal</div>
    </div>
  </div>
);

const SESSION_KEY = "tcb_audit_v2";

export default function App() {
  const isMobile = useIsMobile();
  const topRef   = useRef(null);
  const fileRef  = useRef(null);
  const unlockRef = useRef(null);

  // ── Theme ──
  const [isDark,setIsDark] = useState(()=>{ try{const t=localStorage.getItem("tcb_theme");return t===null?true:t==="dark";}catch{return true;} });
  const themeColors = isDark?DARK:LIGHT;
  Object.assign(C,themeColors);
  const toggleTheme = ()=>setIsDark(d=>{ const n=!d; try{localStorage.setItem("tcb_theme",n?"dark":"light");}catch{} return n; });
  useEffect(()=>{ document.body.style.background=themeColors.bg; },[isDark]);
  const cssVars = `:root{--mist:${C.mist};--border:${C.border};--ink:${C.ink};--amber:${C.amber};--soft:${C.soft};}`;

  // ── Form state ──
  const saved = (()=>{ try{const r=localStorage.getItem(SESSION_KEY);return r?JSON.parse(r):null;}catch{return null;} })();
  const [step,setStep]           = useState(saved?.step||0);
  const [resumeBase64,setRB64]   = useState(null);
  const [resumeName,setRName]    = useState(saved?.resumeName||null);
  const [mediaType,setMType]     = useState(saved?.mediaType||"application/pdf");
  const [whyAts,setWhyAts]       = useState(saved?.whyAts||"");
  const [satisfied,setSat]       = useState(saved?.satisfied??null);
  const [unsatisfied,setUnsat]   = useState(saved?.unsatisfied||"");
  const [selfRating,setSelf]     = useState(saved?.selfRating||0);
  const [hasJd,setHasJd]         = useState(saved?.hasJd??null);
  const [jobTitle,setJT]         = useState(saved?.jobTitle||"");
  const [company,setCo]          = useState(saved?.company||"");
  const [jobDesc,setJD]          = useState(saved?.jobDesc||"");
  const [email,setEmail]         = useState(saved?.email||"");
  const [phone,setPhone]         = useState(saved?.phone||"");
  const [leadId,setLeadId]       = useState(saved?.leadId||null);

  // ── Scoring (Stage 1 — Haiku) ──
  const [scoring,setScoring]     = useState(false);
  const [hoverCard,setHoverCard] = useState(false);
  const [scoreData,setSD]        = useState(saved?.scoreData||null); // {score,verdict,keyword_gaps}
  const [scoreErr,setScoreErr]   = useState("");

  // ── Full report (Stage 2 — Sonnet, fires after payment) ──
  const [audit,setAudit]         = useState(saved?.audit||null);
  const [generating,setGenerating]=useState(false);
  const [genErr,setGenErr]       = useState("");

  // ── Payment ──
  const [payState,setPayState]   = useState(saved?.paid?"paid":null);

  // ── Path C — session save ──
  const [sessionSaving,setSSav] = useState(false);
  const [sessionErr,setSessErr] = useState("");

  // ── Upload ──
  const [uploading,setUploading] = useState(false);
  const [uploadErr,setUplErr]   = useState("");

  // Persist
  useEffect(()=>{
    if(step>0){
      try{localStorage.setItem(SESSION_KEY,JSON.stringify({step,resumeName,mediaType,whyAts,satisfied,unsatisfied,selfRating,hasJd,jobTitle,company,jobDesc,email,phone,leadId,scoreData,audit,paid:payState==="paid"}));}catch{}
    } else { try{localStorage.removeItem(SESSION_KEY);}catch{} }
  },[step,resumeName,whyAts,satisfied,unsatisfied,selfRating,hasJd,jobTitle,company,jobDesc,email,phone,leadId,scoreData,audit,payState]);

  const goTo = s=>{ if(topRef.current)topRef.current.scrollIntoView({behavior:"smooth"}); setTimeout(()=>setStep(s),80); }
  const scrollToUnlock = ()=>{ if(unlockRef.current) unlockRef.current.scrollIntoView({behavior:"smooth",block:"start"}); };;

  const clearAll = ()=>{
    try{localStorage.removeItem(SESSION_KEY);}catch{}
    setStep(0);setRB64(null);setRName(null);setWhyAts("");setSat(null);setUnsat("");setSelf(0);
    setHasJd(null);setJT("");setCo("");setJD("");setEmail("");setPhone("");setLeadId(null);
    setSD(null);setAudit(null);setPayState(null);setScoreErr("");setGenErr("");setSessErr("");
  };

  // ── File upload ──────────────────────────────────────────────────────────────
  const handleFile = async(file)=>{
    if(!file)return;
    setUplErr("");setUploading(true);
    const ok=["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","text/plain"];
    if(!ok.includes(file.type)&&!file.name.match(/\.(pdf|doc|docx|txt)$/i)){setUplErr("Please upload a PDF, Word, or text file.");setUploading(false);return;}
    if(file.size>5*1024*1024){setUplErr("Max 5MB.");setUploading(false);return;}
    const reader=new FileReader();
    reader.onload=()=>{ setRB64(reader.result.split(",")[1]); setMType(file.type||"application/pdf"); setRName(file.name); setUploading(false); };
    reader.onerror=()=>{ setUplErr("Failed to read file."); setUploading(false); };
    reader.readAsDataURL(file);
  };

  // ── Stage 1 — Haiku score (free) ─────────────────────────────────────────────
  const runScore = async()=>{
    setScoring(true); setScoreErr("");
    // Save lead
    if(!leadId){
      const lr=await fetch("/api/save-lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,phone,hasJd,jobTitle,company})}).then(r=>r.json()).catch(()=>({}));
      if(lr.leadId)setLeadId(lr.leadId);
    }
    try{
      const r=await fetch("/api/score-resume",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({resumeBase64,mediaType,whyAts,hasJd,jobTitle,company,jobDescription:jobDesc})});
      const d=await r.json();
      if(!r.ok||!d.success){setScoreErr(d.error||"Could not generate score. Please try again.");setScoring(false);return;}
      setSD({score:d.score,verdict:d.verdict,keyword_gaps:d.keyword_gaps||[]});
      goTo(4);
    }catch{ setScoreErr("Something went wrong. Please try again."); }
    setScoring(false);
  };

  // ── Stage 2 — Sonnet full report (paid) ──────────────────────────────────────
  const runFullReport = async()=>{
    setGenerating(true); setGenErr("");
    try{
      const r=await fetch("/api/audit-resume",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({resumeBase64,mediaType,whyAts,satisfied,unsatisfiedSection:unsatisfied,selfRating,hasJd,jobTitle,company,jobDescription:jobDesc})});
      const d=await r.json();
      if(!r.ok||!d.success){setGenErr(d.error||"Report generation failed.");setGenerating(false);return;}
      setAudit(d.audit);
      setPayState("paid");
    }catch{ setGenErr("Report generation failed. Please try again."); }
    setGenerating(false);
  };

  // ── Payment ──────────────────────────────────────────────────────────────────
  const handlePayment = async(amountPaise,desc)=>{
    if(!window.Razorpay){
      await new Promise(res=>{ const s=document.createElement("script");s.src="https://checkout.razorpay.com/v1/checkout.js";s.onload=res;document.body.appendChild(s); });
    }
    setPayState("processing");
    try{
      const or=await fetch("/api/create-order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,amount:amountPaise,description:desc})});
      const order=await or.json();
      if(!or.ok||!order.orderId){setPayState(null);return;}
      new window.Razorpay({
        key:order.keyId,amount:order.amount,currency:order.currency,
        name:"The Career Breweries",description:desc,
        order_id:order.orderId,
        prefill:{email},
        theme:{color:C.amber},
        handler:async(response)=>{
          try{
            const vr=await fetch("/api/verify-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...response,email,phone,leadId})});
            const vd=await vr.json();
            if(vr.ok&&vd.success){ setPayState("generating"); await runFullReport(); }
            else{ setPayState("failed"); }
          }catch{ setPayState("failed"); }
        },
        modal:{ondismiss:()=>setPayState(null)},
      }).open();
    }catch{ setPayState(null); }
  };

  // ── Path C — save session + redirect to Rewriter ──────────────────────────────
  const handleRewritePath = async()=>{
    setSSav(true); setSessErr("");
    try{
      const r=await fetch("/api/create-audit-session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({resumeBase64,mediaType,whyAts,satisfied,unsatisfiedSection:unsatisfied,selfRating,hasJd,jobTitle,company,jobDescription:jobDesc,auditScore:scoreData?.score,auditVerdict:scoreData?.verdict,email,phone})});
      const d=await r.json();
      if(!r.ok||!d.success){setSessErr(d.error||"Failed. Please try again.");setSSav(false);return;}
      window.location.href=`https://tcb-resume-rewrite.vercel.app?auditToken=${d.sessionId}&auditCharge=99`;
    }catch{ setSessErr("Something went wrong. Please try again."); setSSav(false); }
  };

  // ── Path B — save session after paying for report + redirect to Rewriter ──
  const handleRewriteAfterReport = async()=>{
    setSSav(true); setSessErr("");
    try{
      const r=await fetch("/api/create-audit-session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({resumeBase64,mediaType,whyAts,satisfied,unsatisfiedSection:unsatisfied,selfRating,hasJd,jobTitle,company,jobDescription:jobDesc,auditScore:audit?.ats_score||scoreData?.score,auditVerdict:audit?.ats_verdict||scoreData?.verdict,email,phone})});
      const d=await r.json();
      if(!r.ok||!d.success){setSessErr(d.error||"Failed. Please try again.");setSSav(false);return;}
      window.open(`https://tcb-resume-rewrite.vercel.app?auditToken=${d.sessionId}`,"_blank");
    }catch{ setSessErr("Something went wrong. Please try again."); }
    setSSav(false);
  };

  // ── Download report ──────────────────────────────────────────────────────────
  const downloadReport = ()=>{
    if(!audit)return;
    const lines=[
      "TCB RESUME AUDIT REPORT",
      "The Career Breweries — thecareerbreweries.vercel.app",
      "=".repeat(50),"",
      `ATS SCORE: ${audit.ats_score}/100`,
      `VERDICT: ${audit.ats_verdict}`,
      ...(hasJd&&jobTitle?[`ROLE: ${jobTitle}`]:[]),
      ...(hasJd&&company?[`COMPANY: ${company}`]:[]),
      ...(hasJd&&jobDesc?["","JD START",jobDesc,"JD END"]:[]),
      "",
      "SUMMARY",audit.summary,"",
      "SECTION BREAKDOWN",
      ...Object.entries(audit.sections||{}).flatMap(([k,s])=>[
        `\n${k.toUpperCase()} — ${s.score}/100 (${s.status})`,
        "Findings:",
        ...(s.findings||[]).map(f=>`  · ${f}`),
        "Fixes:",
        ...(s.fixes||[]).map(f=>`  → ${f}`)
      ]),
      "\nTOP ISSUES",
      ...(audit.top_issues||[]).map((i,n)=>`${n+1}. ${i}`),
      "\nQUICK WINS",
      ...(audit.quick_wins||[]).map((w,n)=>`${n+1}. ${w}`),
      ...(audit.jd_match?["\nJD MATCH",audit.jd_match]:[]),
      "\nSELF-RATING VS ACTUAL",
      audit.self_rating_vs_actual||"",
      "\n"+"=".repeat(50),
      "Next step: thecareerbreweries.vercel.app",
    ];
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([lines.join("\n")],{type:"text/plain"}));
    a.download="TCB Resume Audit.pdf";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // ── Layout constants ──────────────────────────────────────────────────────────
  const wrap  = {maxWidth:"680px",margin:"0 auto",padding:isMobile?"0 16px":"0 24px"};
  const pb    = {paddingTop:"28px",paddingBottom:isMobile?"100px":"48px"};
  const mBar  = (onBack,onNext,label,disabled)=> isMobile?(
    <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"12px 16px",background:themeColors.bg,borderTop:`1px solid ${C.border}`,zIndex:100,display:"flex",gap:"10px"}}>
      {onBack&&<button onClick={onBack} style={{background:"transparent",color:C.soft,border:`1.5px solid ${C.border}`,borderRadius:"12px",padding:"13px 16px",fontSize:"15px",cursor:"pointer",flexShrink:0}}>←</button>}
      <button onClick={onNext} disabled={disabled} style={{flex:1,background:disabled?C.border:C.amber,color:disabled?C.soft:C.cream,border:"none",borderRadius:"12px",padding:"13px",fontSize:"15px",fontWeight:600,cursor:disabled?"not-allowed":"pointer"}}>{label}</button>
    </div>
  ):null;

  // ── Header ───────────────────────────────────────────────────────────────────
  const Header = ()=>(
    <header style={{position:"sticky",top:0,zIndex:100,backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",background:isDark?"rgba(20,16,8,0.92)":"rgba(250,243,232,0.92)",borderBottom:`1px solid ${C.border}`,marginBottom:0}}>
      <div style={{...wrap,display:"flex",alignItems:"center",justifyContent:"space-between",height:isMobile?"48px":"56px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <img src={isDark?"/favicon-dark.png":"/favicon-light.png"} alt="TCB" style={{width:"32px",height:"32px",objectFit:"contain"}}/>
          <div>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:"13px",color:C.dark}}>The Career Breweries</div>
            {!isMobile&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:C.soft,letterSpacing:"0.08em",marginTop:"2px"}}>Resume Audit</div>}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          {step>0&&<button onClick={clearAll} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.soft,background:"transparent",border:`1px solid ${C.border}`,borderRadius:"8px",padding:"5px 10px",cursor:"pointer"}} onMouseEnter={e=>{e.currentTarget.style.color=C.amber;e.currentTarget.style.borderColor=C.amber;}} onMouseLeave={e=>{e.currentTarget.style.color=C.soft;e.currentTarget.style.borderColor=C.border;}}>+ New Audit</button>}
          <button onClick={toggleTheme} style={{display:"flex",alignItems:"center",gap:"5px",background:"transparent",border:`1.5px solid ${C.border}`,borderRadius:"20px",padding:"4px 9px 4px 6px",cursor:"pointer"}}>
            <div style={{width:"22px",height:"13px",borderRadius:"7px",background:isDark?C.amber:C.border,position:"relative"}}>
              <div style={{position:"absolute",top:"2px",left:isDark?"11px":"2px",width:"9px",height:"9px",borderRadius:"50%",background:"#fff",transition:"left .25s"}}/>
            </div>
            {!isMobile&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:C.soft}}>{isDark?"Dark":"Light"}</span>}
          </button>
        </div>
      </div>
    </header>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // STEP 0 — Landing
  // ══════════════════════════════════════════════════════════════════════════════
  if(step===0) return (
    <><style>{globalStyles}</style><style>{cssVars}</style>
    <div ref={topRef} style={{minHeight:"100vh",background:themeColors.bg}}>
      <div style={wrap}><Header/></div>
      <div style={{...wrap,...pb}}>
        <div className="fade-up">
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"11px",color:C.amber,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:"20px"}}>Resume Audit · Free</div>
          <h1 style={{fontFamily:"'Fraunces',serif",fontSize:isMobile?"clamp(30px,8vw,38px)":"clamp(34px,5.5vw,48px)",fontWeight:400,color:C.dark,lineHeight:1.15,marginBottom:"16px"}}>
            Is your resume<br/><em style={{color:C.amber,fontStyle:"italic"}}>ATS compatible?</em>
          </h1>
          <p style={{fontSize:"15px",color:C.soft,lineHeight:1.75,maxWidth:"460px",marginBottom:"28px"}}>Upload your resume. Answer four honest questions. Get your ATS score instantly. Free.</p>
          <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"12px",color:C.amber,letterSpacing:"0.04em",marginBottom:"28px"}}>Full report unlocked after payment.</p>
          <div style={{display:"flex",gap:"12px",flexDirection:isMobile?"column":"row",marginBottom:"36px"}}>
            <Btn onClick={()=>goTo(1)} full={isMobile}>Start audit →</Btn>
          </div>
          <Card style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:"18px"}}>
            {[
              {n:"01",t:"Upload resume",d:"PDF or Word. We read every section."},
              {n:"02",t:"4 honest questions",d:"About your goals, confidence, and context."},
              {n:"03",t:"Get your score",d:"ATS score shown immediately. Full report unlocked after payment."},
            ].map(item=>(
              <div key={item.n}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,marginBottom:"6px"}}>{item.n}</div>
                <div style={{fontSize:"13px",fontWeight:600,color:C.dark,marginBottom:"4px"}}>{item.t}</div>
                <div style={{fontSize:"12px",color:C.soft,lineHeight:1.55}}>{item.d}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div></>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // STEP 1 — Resume + 4 questions
  // ══════════════════════════════════════════════════════════════════════════════
  const step1ok = !!resumeBase64&&whyAts.trim().length>0&&satisfied!==null&&selfRating>0;
  if(step===1) return (
    <><style>{globalStyles}</style><style>{cssVars}</style>
    <div ref={topRef} style={{minHeight:"100vh",background:themeColors.bg}}>
      <div style={wrap}><Header/></div>
      <div style={{...wrap,...pb,display:"flex",flexDirection:"column",gap:"20px"}} className="fade-up">
        <div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"6px"}}>— Your Resume</div>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:isMobile?"22px":"26px",fontWeight:400,color:C.dark,lineHeight:1.25,marginBottom:"6px"}}>Tell us about your resume.</h2>
          <p style={{fontSize:"13px",color:C.soft,lineHeight:1.65}}>Upload your resume and answer four questions. Be honest — it makes the audit sharper.</p>
        </div>

        {/* Upload */}
        <Card>
          <Lbl>Your Resume</Lbl>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
          {!resumeName?(
            <div onClick={()=>fileRef.current?.click()}
              style={{background:C.cream,border:`2px dashed ${C.border}`,borderRadius:"12px",padding:"28px",textAlign:"center",cursor:"pointer",transition:"all .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.amber;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;}}>
              {uploading?<Pulse msg="Reading your resume…"/>:<>
                <div style={{fontSize:"24px",marginBottom:"8px"}}>📄</div>
                <div style={{fontSize:"14px",fontWeight:600,color:C.dark,marginBottom:"4px"}}>Upload your resume</div>
                <div style={{fontSize:"12px",color:C.soft}}>PDF, Word, or text · Max 5MB</div>
              </>}
            </div>
          ):(
            <div style={{background:C.mist,border:`1.5px solid ${C.amber}`,borderRadius:"12px",padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}><span>✅</span><span style={{fontSize:"14px",color:C.ink}}>{resumeName}</span></div>
              <button onClick={()=>{setRName(null);setRB64(null);}} style={{background:"transparent",border:"none",fontSize:"12px",color:C.soft,cursor:"pointer",textDecoration:"underline"}}>Change</button>
            </div>
          )}
          {uploadErr&&<p style={{fontSize:"12px",color:"#e57373",marginTop:"8px"}}>{uploadErr}</p>}
        </Card>

        {/* Why ATS */}
        <Card>
          <Lbl>Why do you think your resume needs ATS optimisation?</Lbl>
          <textarea rows={4} value={whyAts} onChange={e=>setWhyAts(e.target.value)} placeholder="Tell us what prompted this — repeated rejections, a specific role, general concern…"/>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.soft,textAlign:"right",marginTop:"4px"}}>{whyAts.trim().length} chars</div>
        </Card>

        {/* Satisfied */}
        <Card style={{display:"flex",flexDirection:"column",gap:"16px"}}>
          <RadioGroup label="Are you satisfied with your resume?" options={[{label:"Yes",value:true},{label:"No",value:false}]} value={satisfied} onChange={setSat}/>
          {satisfied===false&&(
            <div className="fade-in">
              <Lbl note="optional">Which section are you least satisfied with?</Lbl>
              <textarea rows={2} value={unsatisfied} onChange={e=>setUnsat(e.target.value)} placeholder="e.g. Professional summary, bullet points, skills section…"/>
            </div>
          )}
        </Card>

        {/* Self rating */}
        <Card><StarRating value={selfRating} onChange={setSelf}/></Card>

        {!isMobile&&<div style={{display:"flex",gap:"12px"}}>
          <Ghost onClick={()=>goTo(0)}>← Back</Ghost>
          <Btn onClick={()=>goTo(2)} disabled={!step1ok}>Continue →</Btn>
        </div>}
      </div>
    </div>
    {mBar(()=>goTo(0),()=>goTo(2),"Continue →",!step1ok)}
    </>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // STEP 2 — JD layer
  // ══════════════════════════════════════════════════════════════════════════════
  const step2ok = hasJd!==null&&(hasJd===false||(hasJd===true&&jobDesc.trim().length>=50));
  if(step===2) return (
    <><style>{globalStyles}</style><style>{cssVars}</style>
    <div ref={topRef} style={{minHeight:"100vh",background:themeColors.bg}}>
      <div style={wrap}><Header/></div>
      <div style={{...wrap,...pb,display:"flex",flexDirection:"column",gap:"20px"}} className="fade-up">
        <div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"6px"}}>— Context</div>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:isMobile?"22px":"26px",fontWeight:400,color:C.dark,lineHeight:1.25,marginBottom:"6px"}}>Are you evaluating against a specific role?</h2>
          <p style={{fontSize:"13px",color:C.soft,lineHeight:1.65,maxWidth:"460px"}}>If yes, we'll calibrate every finding to that JD. If no, we'll evaluate against general ATS best practices.</p>
        </div>

        <Card style={{display:"flex",flexDirection:"column",gap:"16px"}}>
          <RadioGroup label="Evaluating against a specific role?" options={[{label:"Yes, I have a JD",value:true},{label:"No, general audit",value:false}]} value={hasJd} onChange={setHasJd}/>

          {hasJd===true&&(
            <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:"14px"}}>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:"14px"}}>
                <div><Lbl>Role</Lbl><input type="text" value={jobTitle} onChange={e=>setJT(e.target.value)} placeholder="Product Manager"/></div>
                <div><Lbl note="optional">Company</Lbl><input type="text" value={company} onChange={e=>setCo(e.target.value)} placeholder="Acme Inc."/></div>
              </div>
              <div>
                <Lbl>Job Description</Lbl>
                <textarea rows={7} value={jobDesc} onChange={e=>setJD(e.target.value)} placeholder="Paste the full job description here…"/>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.soft,textAlign:"right",marginTop:"4px"}}>
                  {jobDesc.trim().length} chars
                  {jobDesc.trim().length>0&&jobDesc.trim().length<100&&<span style={{color:C.amber}}> · paste the full JD for a better audit</span>}
                </div>
              </div>
            </div>
          )}

          {hasJd===false&&(
            <div className="fade-in" style={{background:"rgba(201,123,42,0.07)",border:"1px solid rgba(201,123,42,0.2)",borderRadius:"10px",padding:"14px 16px"}}>
              <p style={{fontSize:"13px",color:C.soft,lineHeight:1.65}}>We'll evaluate your resume against general ATS formatting, keyword density, structure, and content quality. Full report: <strong style={{color:C.amber}}>₹199</strong>.</p>
            </div>
          )}
        </Card>

        {!isMobile&&<div style={{display:"flex",gap:"12px"}}>
          <Ghost onClick={()=>goTo(1)}>← Back</Ghost>
          <Btn onClick={()=>goTo(3)} disabled={!step2ok}>Continue →</Btn>
        </div>}
      </div>
    </div>
    {mBar(()=>goTo(1),()=>goTo(3),"Continue →",!step2ok)}
    </>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // STEP 3 — Lead capture + run Haiku score
  // ══════════════════════════════════════════════════════════════════════════════
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if(step===3) return (
    <><style>{globalStyles}</style><style>{cssVars}</style>
    <div ref={topRef} style={{minHeight:"100vh",background:themeColors.bg}}>
      <div style={wrap}><Header/></div>
      <div style={{...wrap,...pb,display:"flex",flexDirection:"column",gap:"20px"}} className="fade-up">
        <div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"6px"}}>— Ready</div>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:isMobile?"22px":"26px",fontWeight:400,color:C.dark,lineHeight:1.25,marginBottom:"6px"}}>Your audit is ready to run.</h2>
          <p style={{fontSize:"13px",color:C.soft,lineHeight:1.65,maxWidth:"460px"}}>We'll analyse your resume{hasJd?" against the JD you provided":" against ATS best practices"} and return your score. Free.</p>
        </div>
        <Card style={{display:"flex",flexDirection:"column",gap:"14px"}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:C.amber,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"2px"}}>Your details</div>
          <div><Lbl>Email</Lbl><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div>
          <div><Lbl>Phone</Lbl><input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 98765 43210"/></div>
        </Card>
        {scoring&&<Pulse msg="Analysing your resume for ATS compatibility…"/>}
        {scoreErr&&<p style={{fontSize:"13px",color:"#e57373"}}>{scoreErr} <button onClick={runScore} style={{background:"none",border:"none",color:C.amber,cursor:"pointer",textDecoration:"underline",fontSize:"13px"}}>Try again</button></p>}
        {!scoring&&!isMobile&&<div style={{display:"flex",gap:"12px"}}>
          <Ghost onClick={()=>goTo(2)}>← Back</Ghost>
          <Btn onClick={runScore} disabled={!emailOk||scoring}>Run my audit →</Btn>
        </div>}
      </div>
    </div>
    {!scoring&&mBar(()=>goTo(2),runScore,"Run my audit →",!emailOk)}
    </>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // STEP 4 — Score preview (locked) → full report (paid)
  // ══════════════════════════════════════════════════════════════════════════════
  if(step===4&&scoreData) {
    const locked    = payState!=="paid";
    const amtPaise  = hasJd?29900:19900;
    const amtLabel  = hasJd?"₹299":"₹199";
    const scoreColor= scoreData.score>=75?"#4caf50":scoreData.score>=55?C.amber:"#e57373";

    return (
      <><style>{globalStyles}</style><style>{cssVars}</style>
      <div ref={topRef} style={{minHeight:"100vh",background:themeColors.bg}}>
        <div style={wrap}><Header/></div>
        <div style={{...wrap,...pb,display:"flex",flexDirection:"column",gap:"18px"}} className="fade-up">

          {/* Score card */}
          <Card style={{textAlign:"center",padding:"32px 20px",position:"relative",cursor:locked?"pointer":"default",transition:"box-shadow .2s"}} onMouseEnter={()=>locked&&setHoverCard(true)} onMouseLeave={()=>setHoverCard(false)} onClick={()=>locked&&scrollToUnlock()}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:"18px"}}>
              {locked?"Your ATS Score":"Full Report — Unlocked"}
            </div>
            <ScoreGauge score={scoreData.score} locked={locked}/>
            <div style={{marginTop:"14px"}}>
              {locked?(
                <>
                  <p style={{fontSize:"14px",color:scoreColor,fontWeight:600,marginBottom:"8px",lineHeight:1.5}}>{scoreData?.verdict||"Your resume has been evaluated."}</p>
                  {scoreData?.keyword_gaps?.length>0&&(
                    <div style={{marginTop:"4px"}}>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:C.amber,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"8px"}}>Keywords missing from your resume</div>
                      {scoreData.keyword_gaps.map((kw,i)=>(
                        <div key={i} onClick={scrollToUnlock} style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"7px",cursor:"pointer",padding:"4px 6px",borderRadius:"8px",transition:"background .15s"}}
                          onMouseEnter={e=>e.currentTarget.style.background="rgba(201,123,42,0.08)"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <span style={{color:"#e57373",flexShrink:0,fontSize:"12px"}}>✕</span>
                          <span style={{fontSize:"13px",color:C.ink,fontWeight:500}}>{kw}</span>
                          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,marginLeft:"auto",opacity:0.5}}>unlock to fix →</span>
                        </div>
                      ))}
                      <button onClick={scrollToUnlock}
                        style={{marginTop:"12px",background:"transparent",border:`1.5px solid ${C.amber}`,borderRadius:"10px",padding:"9px 18px",fontSize:"12px",fontWeight:600,color:C.amber,cursor:"pointer",width:"100%",transition:"background .2s"}}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(201,123,42,0.1)";}}
                        onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
                        Unlock to see all fixes →
                      </button>
                    </div>
                  )}
                  {(!scoreData?.keyword_gaps||scoreData.keyword_gaps.length===0)&&(
                    <p style={{fontSize:"12px",color:C.soft,lineHeight:1.65}}>Unlock the full report to see your score, section breakdown, keyword gaps, and exactly what to fix.</p>
                  )}
                </>
              ):(
                <>
                  <p style={{fontSize:"15px",fontWeight:600,color:scoreColor,marginBottom:"6px"}}>{(audit?.ats_verdict||"").split(".")[0]+"."}</p>
                  <p style={{fontSize:"12px",color:C.soft,lineHeight:1.65}}>{audit?.summary}</p>
                </>
              )}
            </div>
          
              {/* Hover overlay — locked state */}
              {locked&&hoverCard&&(
                <div onClick={scrollToUnlock} style={{
                  position:"absolute",inset:0,borderRadius:"inherit",
                  background:"rgba(20,16,8,0.82)",backdropFilter:"blur(3px)",
                  display:"flex",flexDirection:"column",alignItems:"center",
                  justifyContent:"center",gap:"10px",cursor:"pointer",
                  animation:"fadeIn 0.18s ease both",zIndex:10,
                }}>
                  <div style={{fontSize:"22px"}}>🔓</div>
                  <div style={{fontFamily:"'Fraunces',serif",fontSize:"16px",fontWeight:400,color:"#FAF3E8",letterSpacing:"0.01em"}}>Unlock full report</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,letterSpacing:"0.1em"}}>{hasJd?"₹299":"₹199"} · one-time</div>
                </div>
              )}
              </Card>

          {/* Section bars — always visible, locked bars blurred */}
          {scoreData&&(
            <Card style={{position:"relative",cursor:locked?"pointer":"default"}} onMouseEnter={()=>locked&&setHoverCard(true)} onMouseLeave={()=>setHoverCard(false)} onClick={()=>locked&&scrollToUnlock()}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"16px"}}>Section Overview</div>
              {locked?(
                // Fake bars showing relative distribution (locked)
                [["Formatting",62,"needs_work"],["Keywords",58,"needs_work"],["Structure",74,"average"],["Content",68,"average"],["Contact",85,"good"]].map(([l,s,st])=>(
                  <SectionBar key={l} label={l} score={s} status={st} locked={true}/>
                ))
              ):(
                Object.entries(audit?.sections||{}).map(([k,s])=>(
                  <SectionBar key={k} label={k} score={s.score} status={s.status} locked={false}/>
                ))
              )}
            </Card>
          )}

          {/* Blurred details when locked */}
          {locked&&(
            <>
              <Blurred>
                <Card>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:"#e57373",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"12px"}}>Top Issues</div>
                  {["Issue one would appear here","Issue two would appear here","Issue three would appear here"].map((i,n)=>(
                    <div key={n} style={{display:"flex",gap:"10px",marginBottom:"8px"}}><span style={{color:"#e57373",fontWeight:700}}>{n+1}.</span><span style={{fontSize:"13px",color:C.ink}}>{i}</span></div>
                  ))}
                </Card>
              </Blurred>
              <Blurred>
                <Card>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:"#4caf50",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"12px"}}>Quick Wins</div>
                  {["Quick win one","Quick win two","Quick win three"].map((w,n)=>(
                    <div key={n} style={{display:"flex",gap:"10px",marginBottom:"8px"}}><span style={{color:"#4caf50"}}>✓</span><span style={{fontSize:"13px",color:C.ink}}>{w}</span></div>
                  ))}
                </Card>
              </Blurred>
            </>
          )}

          {/* Full report details when paid */}
          {!locked&&audit&&(
            <>
              <Card>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:"#e57373",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"12px"}}>Top Issues</div>
                {(audit.top_issues||[]).map((i,n)=>(
                  <div key={n} style={{display:"flex",gap:"10px",marginBottom:"8px"}}><span style={{color:"#e57373",fontWeight:700}}>{n+1}.</span><span style={{fontSize:"13px",color:C.ink,lineHeight:1.6}}>{i}</span></div>
                ))}
              </Card>
              <Card>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:"#4caf50",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"12px"}}>Quick Wins</div>
                {(audit.quick_wins||[]).map((w,n)=>(
                  <div key={n} style={{display:"flex",gap:"10px",marginBottom:"8px"}}><span style={{color:"#4caf50"}}>✓</span><span style={{fontSize:"13px",color:C.ink,lineHeight:1.6}}>{w}</span></div>
                ))}
              </Card>
              {Object.entries(audit.sections||{}).map(([k,s])=>(
                <Card key={k}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"12px"}}>{k.charAt(0).toUpperCase()+k.slice(1)}</div>
                  <div style={{marginBottom:"10px"}}>
                    <div style={{fontSize:"11px",color:C.soft,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:"6px"}}>Findings</div>
                    {(s.findings||[]).map((f,i)=><p key={i} style={{fontSize:"12px",color:C.soft,lineHeight:1.6,marginBottom:"5px"}}>· {f}</p>)}
                  </div>
                  <div>
                    <div style={{fontSize:"11px",color:"#4caf50",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:"6px"}}>Fixes</div>
                    {(s.fixes||[]).map((f,i)=><p key={i} style={{fontSize:"12px",color:C.ink,lineHeight:1.6,marginBottom:"5px"}}>→ {f}</p>)}
                  </div>
                </Card>
              ))}
              {audit.jd_match&&(
                <Card>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px"}}>JD Match</div>
                  <p style={{fontSize:"13px",color:C.soft,lineHeight:1.65}}>{audit.jd_match}</p>
                </Card>
              )}
              {audit.self_rating_vs_actual&&(
                <Card>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px"}}>Self-rating vs Actual</div>
                  <p style={{fontSize:"13px",color:C.soft,lineHeight:1.65}}>{audit.self_rating_vs_actual}</p>
                </Card>
              )}
            </>
          )}

          {/* ── Payment / unlock section ── */}
          {locked&&(
            <div style={{background:isDark?"#1C1410":"#2D1F13",borderRadius:"16px",padding:"24px 22px",display:"flex",flexDirection:"column",gap:"14px"}}>
              <div ref={unlockRef} id="unlock-section" style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,letterSpacing:"0.1em",textTransform:"uppercase"}}>Unlock your full report</div>

              {hasJd&&(
                <>
                  {/* Path C — Rewrite */}
                  <div style={{background:"rgba(201,123,42,0.1)",border:"1px solid rgba(201,123,42,0.25)",borderRadius:"12px",padding:"16px 18px"}}>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:C.amber,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px"}}>Recommended</div>
                    <p style={{fontSize:"13px",color:"rgba(255,255,255,0.7)",lineHeight:1.65,marginBottom:"12px"}}>Fix everything the audit found — rewrite your resume for this specific role. Full ATS report included.</p>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"10px"}}>
                      <div>
                        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"14px",color:C.amber,fontWeight:700}}>₹1,598</span>
                        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:"rgba(255,255,255,0.35)",marginLeft:"8px"}}>₹1,499 rewrite + ₹99 audit</span>
                      </div>
                      <button onClick={handleRewritePath} disabled={sessionSaving}
                        style={{background:sessionSaving?C.border:C.amber,color:sessionSaving?C.soft:"#1C1410",border:"none",borderRadius:"10px",padding:"10px 20px",fontSize:"13px",fontWeight:700,cursor:sessionSaving?"not-allowed":"pointer"}}>
                        {sessionSaving?"Preparing…":"Rewrite my resume →"}
                      </button>
                    </div>
                    {sessErr&&<p style={{fontSize:"12px",color:"#e57373",marginTop:"8px"}}>{sessErr}</p>}
                  </div>

                  <div style={{textAlign:"center"}}><span style={{fontSize:"12px",color:"rgba(255,255,255,0.25)"}}>or</span></div>

                  {/* Path B — report only */}
                  {payState==="failed"&&<p style={{fontSize:"12px",color:"#e57373"}}>Payment didn't go through. <button onClick={()=>setPayState(null)} style={{background:"none",border:"none",color:C.amber,cursor:"pointer",fontSize:"12px",textDecoration:"underline"}}>Try again</button></p>}
                  {(payState==="generating")&&<Pulse msg="Generating your full report…"/>}
                  {genErr&&<p style={{fontSize:"12px",color:"#e57373"}}>{genErr} <button onClick={runFullReport} style={{background:"none",border:"none",color:C.amber,cursor:"pointer",fontSize:"12px",textDecoration:"underline"}}>Retry</button></p>}
                  {(!payState||payState==="failed")&&(
                    <button onClick={()=>handlePayment(amtPaise,"TCB Resume Audit Report")}
                      style={{background:"transparent",color:"rgba(255,255,255,0.55)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"10px",padding:"10px 20px",fontSize:"13px",cursor:"pointer"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.4)";e.currentTarget.style.color="#fff";}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";e.currentTarget.style.color="rgba(255,255,255,0.55)";}}>
                      Just the report — {amtLabel}
                    </button>
                  )}
                  {payState==="processing"&&<Pulse msg="Opening payment…"/>}
                </>
              )}

              {!hasJd&&(
                <>
                  <p style={{fontSize:"13px",color:"rgba(255,255,255,0.65)",lineHeight:1.65}}>Get the complete breakdown — section scores, formatting issues, keyword gaps, and what to fix.</p>
                  {payState==="failed"&&<p style={{fontSize:"12px",color:"#e57373"}}>Payment didn't go through. <button onClick={()=>setPayState(null)} style={{background:"none",border:"none",color:C.amber,cursor:"pointer",fontSize:"12px",textDecoration:"underline"}}>Try again</button></p>}
                  {(payState==="generating")&&<Pulse msg="Generating your full report…"/>}
                  {genErr&&<p style={{fontSize:"12px",color:"#e57373"}}>{genErr} <button onClick={runFullReport} style={{background:"none",border:"none",color:C.amber,cursor:"pointer",fontSize:"12px",textDecoration:"underline"}}>Retry</button></p>}
                  {(!payState||payState==="failed")&&(
                    <button onClick={()=>handlePayment(amtPaise,"TCB Resume Audit Report")}
                      style={{background:C.amber,color:"#1C1410",border:"none",borderRadius:"10px",padding:"12px 24px",fontSize:"14px",fontWeight:700,cursor:"pointer"}}
                      onMouseEnter={e=>e.currentTarget.style.background=C.warm}
                      onMouseLeave={e=>e.currentTarget.style.background=C.amber}>
                      Unlock full report — {amtLabel}
                    </button>
                  )}
                  {payState==="processing"&&<Pulse msg="Opening payment…"/>}
                  <p style={{fontSize:"12px",color:"rgba(255,255,255,0.3)",marginTop:"4px"}}>
                    Have a specific role in mind?{" "}
                    <a href="https://tcb-resume-rewrite.vercel.app" target="_blank" rel="noreferrer" style={{color:C.amber,textDecoration:"none"}}>Rewrite for that role — ₹1,499 →</a>
                  </p>
                </>
              )}
            </div>
          )}

          {/* Paid — download + upsells */}
          {!locked&&(
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              <Btn onClick={downloadReport} full={isMobile}>↓ Download TCB Resume Audit.pdf</Btn>
              {hasJd&&(
                <Card>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:C.amber,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px"}}>Fix what we found</div>
                  <p style={{fontSize:"13px",color:C.soft,lineHeight:1.65,marginBottom:"12px"}}>Rewrite your resume for {jobTitle||"this role"} — every issue addressed, every section aligned to the JD.</p>
                  <button onClick={handleRewriteAfterReport} disabled={sessionSaving}
                    style={{display:"inline-flex",alignItems:"center",background:sessionSaving?C.border:C.amber,color:C.cream,borderRadius:"10px",padding:"10px 20px",fontSize:"13px",fontWeight:600,border:"none",cursor:sessionSaving?"not-allowed":"pointer"}}>
                    {sessionSaving?"Creating session…":"Rewrite my resume — ₹1,499 →"}
                  </button>
                </Card>
              )}
              <Card>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:C.soft,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"6px"}}>Before your next application</div>
                <p style={{fontSize:"12px",color:C.soft,lineHeight:1.6,marginBottom:"8px"}}>The Application Brief finds your angle before you apply. Free. 15 minutes.</p>
                <a href="https://tcb-application-brief.vercel.app" target="_blank" rel="noreferrer" style={{fontSize:"13px",color:C.amber,fontWeight:600,textDecoration:"none"}}>Start your brief — free →</a>
              </Card>
            </div>
          )}

        </div>
      </div></>
    );
  }

  return null;
}
