import { useState, useEffect, useMemo } from "react";
import "./App.css";
import { computeRankings } from "./data/rankings.js";
import OverviewTab from "./components/OverviewTab.jsx";
import StatisticTab from "./components/StatisticTab.jsx";
import UploadLogTab from "./components/UploadLogTab.jsx";
import ToolStatusTab from "./components/ToolStatusTab.jsx";
import ToolFormModal from "./components/ToolFormModal.jsx";
import NotificationToast from "./components/NotificationToast.jsx";

export default function Dashboard(){
  const[tab,setTab]=useState("overview");
  const[clock,setClock]=useState("00:00:00");
  const[notif,setNotif]=useState(null);
  const[tools,setTools]=useState([]);
  const[logs,setLogs]=useState([]);
  const[loading,setLoading]=useState(true);
  const[showToolForm,setShowToolForm]=useState(false);
  const[editingTool,setEditingTool]=useState(null);
  const emptyForm={name:"",v:"1.0.0",cat:"HW",dev_site:"TPE",dev_unit:"",finish_date:"",service_end_date:"",devName:"",devEmail:"",devExt:"",hasReport:false};
  const[toolForm,setToolForm]=useState(emptyForm);

  // ── Clock ──
  useEffect(()=>{const tick=()=>{const n=new Date();setClock([n.getHours(),n.getMinutes(),n.getSeconds()].map(v=>String(v).padStart(2,"0")).join(":"))};tick();const id=setInterval(tick,1000);return()=>clearInterval(id)},[]);
  useEffect(()=>{if(notif){const id=setTimeout(()=>setNotif(null),3000);return()=>clearTimeout(id)}},[notif]);

  // ── Fetch from API ──
  const refreshTools=()=>fetch("/api/tools").then(r=>r.json()).then(setTools);
  const refreshLogs=()=>fetch("/api/logs").then(r=>r.json()).then(setLogs);

  useEffect(()=>{
    Promise.all([
      fetch("/api/tools").then(r=>r.json()),
      fetch("/api/logs").then(r=>r.json()),
    ]).then(([t,l])=>{setTools(t);setLogs(l);setLoading(false)});
  },[]);

  // ── Derived data ──
  const activeTools=useMemo(()=>tools.filter(t=>t.enabled!==false),[tools]);
  const R=useMemo(()=>computeRankings(activeTools,logs),[activeTools,logs]);

  // ── Tool CRUD ──
  const toggleTool=async(id)=>{await fetch(`/api/tools/${id}/toggle`,{method:"PUT"});refreshTools()};

  const openAddTool=()=>{setEditingTool(null);setToolForm(emptyForm);setShowToolForm(true)};
  const openEditTool=(t)=>{setEditingTool(t);setToolForm({name:t.name,v:t.v,cat:t.cat,dev_site:t.dev_site,dev_unit:t.dev_unit,finish_date:t.finish_date?(t.finish_date.includes("/")?t.finish_date.replace(/\//g,"-"):t.finish_date):"",service_end_date:t.service_end_date?(t.service_end_date.includes("/")?t.service_end_date.replace(/\//g,"-"):t.service_end_date):"",devName:t.dev.name,devEmail:t.dev.email,devExt:t.dev.ext,hasReport:t.hasReport});setShowToolForm(true)};

  const handleSaveTool=async()=>{
    if(!toolForm.name.trim()){setNotif("⚠ Tool Name is required");return}
    const cd=toolForm.finish_date?toolForm.finish_date.replace(/-/g,"/"):"";
    const sed=toolForm.service_end_date?toolForm.service_end_date.replace(/-/g,"/"):"";
    const body={name:toolForm.name.trim(),v:toolForm.v,cat:toolForm.cat,dev_site:toolForm.dev_site,dev_unit:toolForm.dev_unit,finish_date:cd,service_end_date:sed,dev:{name:toolForm.devName,email:toolForm.devEmail,ext:toolForm.devExt},hasReport:toolForm.hasReport};
    if(editingTool){
      await fetch(`/api/tools/${editingTool.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      setNotif(`✓ Updated: ${toolForm.name}`);
    }else{
      await fetch("/api/tools",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      setNotif(`✓ Added: ${toolForm.name}`);
    }
    setShowToolForm(false);
    refreshTools();
  };

  const handleDeleteTool=async(t)=>{
    if(!confirm(`確定要刪除 ${t.name} 嗎？`))return;
    await fetch(`/api/tools/${t.id}`,{method:"DELETE"});
    setNotif(`✓ Deleted: ${t.name}`);
    refreshTools();
  };

  // ── Log operations ──
  const handleUpload=async(files)=>{
    const fd=new FormData();
    files.forEach(f=>fd.append("files",f));
    const res=await fetch("/api/logs/upload",{method:"POST",body:fd});
    const data=await res.json();
    data.results.forEach(r=>{setNotif(r.success?`✓ 已解析並新增: ${r.filename}`:`✗ 解析失敗: ${r.filename}（${r.error}）`)});
    refreshLogs();
  };

  const handleDeleteLog=async(id,filename)=>{
    if(!confirm(`確定要刪除 ${filename} 嗎？`))return;
    await fetch(`/api/logs/${id}`,{method:"DELETE"});
    setNotif(`✓ 已刪除: ${filename}`);
    refreshLogs();
  };

  if(loading)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:"var(--accent-cyan)",fontFamily:"'Orbitron',monospace",fontSize:14,letterSpacing:2}}>LOADING...</div>;

  return(
    <>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800;900&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet"/>

      <header className="header">
        <div className="logo">
          <div className="logo-icon"></div>
          <div>
            <h1 style={{fontFamily:"'Orbitron',monospace",fontSize:15,fontWeight:800,letterSpacing:3,color:"var(--accent-cyan)",margin:0}}>TOOL TRACKER</h1>
            <span style={{fontSize:10,color:"var(--text-muted)",letterSpacing:2,display:"block"}}>TESTING LOG DASHBOARD</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:24}}>
          <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:"var(--text-secondary)",letterSpacing:1}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"var(--accent-teal)",boxShadow:"0 0 8px var(--accent-teal)",animation:"pulse 2s ease-in-out infinite"}}></div>LIVE
          </div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,color:"var(--text-secondary)"}}>{clock}</div>
        </div>
      </header>

      <div className="nav-tabs">
        {[["overview","⬡ Overview"],["statistic","▣ Statistic"],["upload","≡ Upload Log"],["directory","◈ Tool Status"]].map(([k,l])=>(
          <div key={k} className={`tab ${tab===k?"active":""}`} onClick={()=>setTab(k)}>{l}</div>
        ))}
      </div>

      <main className="main">
        {tab==="overview"&&<OverviewTab activeTools={activeTools} allLogs={logs}/>}
        {tab==="statistic"&&<StatisticTab activeTools={activeTools} allTools={tools} allLogs={logs} R={R}/>}
        {tab==="upload"&&<UploadLogTab logs={logs} onUpload={handleUpload} onDelete={handleDeleteLog}/>}
        {tab==="directory"&&<ToolStatusTab tools={tools} activeTools={activeTools} toggleTool={toggleTool} onAddTool={openAddTool} onEditTool={openEditTool} onDeleteTool={handleDeleteTool}/>}
      </main>

      <NotificationToast message={notif}/>

      {showToolForm&&<ToolFormModal editingTool={editingTool} toolForm={toolForm} setToolForm={setToolForm} onSave={handleSaveTool} onClose={()=>setShowToolForm(false)}/>}
    </>
  );
}
