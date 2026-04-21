import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import "./App.css";
import OverviewTab from "./components/OverviewTab.jsx";
import StatisticTab from "./components/StatisticTab.jsx";
import UploadLogTab from "./components/UploadLogTab.jsx";
import ToolStatusTab from "./components/ToolStatusTab.jsx";
import ToolFormModal, { getVisualWidth } from "./components/ToolFormModal.jsx";
import NotificationToast from "./components/NotificationToast.jsx";

const LANGS=["zh-TW","zh-CN","en"];

export default function Dashboard(){
  const{t,i18n}=useTranslation();
  const[tab,setTab]=useState("overview");
  const[clock,setClock]=useState("00:00:00");
  const[notif,setNotif]=useState(null);
  const[theme,setTheme]=useState(()=>localStorage.getItem("theme")||"light");
  const[tools,setTools]=useState([]);
  const[logs,setLogs]=useState([]);
  const[loading,setLoading]=useState(true);
  const[showToolForm,setShowToolForm]=useState(false);
  const[editingTool,setEditingTool]=useState(null);
  const today=()=>new Date().toISOString().slice(0,10);
  const emptyForm={name:"",v:"01.00",cat:"HW",dev_site:"TPE",dev_unit:"Monitor",finish_date:today(),service_end_date:"",devName:"",devEmail:"",devExt:"",hasReport:false};
  const[toolForm,setToolForm]=useState(emptyForm);

  // ── Theme ──
  useEffect(()=>{document.documentElement.setAttribute("data-theme",theme);localStorage.setItem("theme",theme)},[theme]);
  const toggleTheme=()=>setTheme(t=>t==="dark"?"light":"dark");

  // ── Sync html lang ──
  useEffect(()=>{document.documentElement.lang=i18n.language==="zh-TW"?"zh-TW":i18n.language==="zh-CN"?"zh-CN":"en"},[i18n.language]);

  // ── Clock ──
  useEffect(()=>{const tick=()=>{const n=new Date();setClock([n.getHours(),n.getMinutes(),n.getSeconds()].map(v=>String(v).padStart(2,"0")).join(":"))};tick();const id=setInterval(tick,1000);return()=>clearInterval(id)},[]);
  useEffect(()=>{if(notif){const id=setTimeout(()=>setNotif(null),3000);return()=>clearTimeout(id)}},[notif]);

  // ── Fetch from API ──
  const refreshTools=()=>fetch("/api/tools").then(r=>r.json()).then(setTools).catch(()=>setNotif(t("notify.toolLoadFail")));
  const refreshLogs=()=>fetch("/api/logs").then(r=>r.json()).then(setLogs).catch(()=>setNotif(t("notify.logLoadFail")));

  useEffect(()=>{
    Promise.all([
      fetch("/api/tools").then(r=>r.json()),
      fetch("/api/logs").then(r=>r.json()),
    ]).then(([td,ld])=>{setTools(td);setLogs(ld);setLoading(false)}).catch(()=>{setLoading(false);setNotif(t("notify.serverFail"))});
  },[]);

  // ── Derived data ──
  const activeTools=useMemo(()=>tools.filter(t=>t.enabled!==false),[tools]);

  // ── Tool CRUD ──
  const toggleTool=async(id)=>{
    const tool=tools.find(t=>t.id===id);
    if(tool&&!tool.enabled&&tool.service_end_date){
      const today=new Date();const todayStr=`${today.getFullYear()}/${String(today.getMonth()+1).padStart(2,"0")}/${String(today.getDate()).padStart(2,"0")}`;
      if(tool.service_end_date!==todayStr){setNotif(t("notify.toolRetired",{name:tool.name,date:tool.service_end_date}));return;}
    }
    await fetch(`/api/tools/${id}/toggle`,{method:"PUT"});refreshTools();
  };

  const openAddTool=()=>{setEditingTool(null);setToolForm(emptyForm);setShowToolForm(true)};
  const openEditTool=(tool)=>{setEditingTool(tool);setToolForm({name:tool.name,v:tool.v,cat:tool.cat,dev_site:tool.dev_site,dev_unit:tool.dev_unit,finish_date:tool.finish_date?(tool.finish_date.includes("/")?tool.finish_date.replace(/\//g,"-"):tool.finish_date):"",service_end_date:tool.service_end_date?(tool.service_end_date.includes("/")?tool.service_end_date.replace(/\//g,"-"):tool.service_end_date):"",devName:tool.dev.name,devEmail:tool.dev.email,devExt:tool.dev.ext,hasReport:tool.hasReport});setShowToolForm(true)};

  const handleSaveTool=async()=>{
    if(!toolForm.name.trim()){setNotif(t("validate.nameRequired"));return}
    if(/\s/.test(toolForm.name)){setNotif(t("validate.nameNoSpace"));return}
    if(/[<>&"'`]/.test(toolForm.name)){setNotif(t("validate.nameBadChar"));return}
    if(getVisualWidth(toolForm.name.trim())>25){setNotif(t("validate.nameTooLong"));return}
    if(!toolForm.v||!/^\d{2}\.\d{2}$/.test(toolForm.v)){setNotif(t("validate.versionRequired"));return}
    if(!toolForm.devName||!toolForm.devName.trim()){setNotif(t("validate.devRequired"));return}
    if(/[<>&"'`]/.test(toolForm.devName)){setNotif(t("validate.devBadChar"));return}
    if(getVisualWidth(toolForm.devName)>30){setNotif(t("validate.devTooLong"));return}
    if(!toolForm.devEmail||!toolForm.devEmail.trim()){setNotif(t("validate.emailRequired"));return}
    if(toolForm.devEmail.length>50){setNotif(t("validate.emailTooLong"));return}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toolForm.devEmail)){setNotif(t("validate.emailInvalid"));return}
    if(!toolForm.devExt||!toolForm.devExt.trim()){setNotif(t("validate.extRequired"));return}
    if(!/^\d{2}-\d{4}$/.test(toolForm.devExt)){setNotif(t("validate.extInvalid"));return}
    if(!toolForm.finish_date){setNotif(t("validate.startRequired"));return}
    const cd=toolForm.finish_date?toolForm.finish_date.replace(/-/g,"/"):"";
    const sed=toolForm.service_end_date?toolForm.service_end_date.replace(/-/g,"/"):"";
    const body={name:toolForm.name.trim(),v:toolForm.v,cat:toolForm.cat,dev_site:toolForm.dev_site,dev_unit:toolForm.dev_unit,finish_date:cd,service_end_date:sed,dev:{name:toolForm.devName,email:toolForm.devEmail,ext:toolForm.devExt},hasReport:toolForm.hasReport};
    let res;
    if(editingTool){
      res=await fetch(`/api/tools/${editingTool.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    }else{
      res=await fetch("/api/tools",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    }
    if(!res.ok){const err=await res.json().catch(()=>({}));setNotif(err.error||t("notify.toolSaveFail"));return}
    setNotif(editingTool?t("notify.toolUpdated",{name:toolForm.name}):t("notify.toolAdded",{name:toolForm.name}));
    setShowToolForm(false);
    refreshTools();
  };

  const handleDeleteTool=async(tool)=>{
    if(!confirm(t("confirm.deleteTool",{name:tool.name})))return;
    await fetch(`/api/tools/${tool.id}`,{method:"DELETE"});
    setNotif(t("notify.toolDeleted",{name:tool.name}));
    refreshTools();
  };

  // ── Log operations ──
  const MAX_UPLOAD_SIZE=5*1024*1024; // 5 MB
  const MAX_UPLOAD_COUNT=20;
  const handleUpload=async(files)=>{
    if(files.length>MAX_UPLOAD_COUNT){setNotif(t("notify.uploadMax",{count:MAX_UPLOAD_COUNT}));return}
    const oversized=files.filter(f=>f.size>MAX_UPLOAD_SIZE);
    if(oversized.length){setNotif(t("notify.uploadOversized",{files:oversized.map(f=>f.name).join(", ")}));return}
    const fd=new FormData();
    files.forEach(f=>fd.append("files",f));
    const res=await fetch("/api/logs/upload",{method:"POST",body:fd});
    const data=await res.json();
    data.results.forEach(r=>{setNotif(r.success?t("notify.uploadOk",{filename:r.filename}):t("notify.uploadFail",{filename:r.filename,error:r.error}))});
    refreshLogs();
  };

  const handleDeleteLog=async(id,filename)=>{
    if(!confirm(t("confirm.deleteLog",{filename})))return;
    await fetch(`/api/logs/${id}`,{method:"DELETE"});
    setNotif(t("notify.logDeleted",{filename}));
    refreshLogs();
  };

  const changeLang=(lng)=>{i18n.changeLanguage(lng)};

  if(loading)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:"var(--accent-cyan)",fontFamily:"'Orbitron',monospace",fontSize:14,letterSpacing:2}}>{t("app.loading")}</div>;

  return(
    <>
      <header className="header">
        <div className="logo">
          <div className="logo-icon"></div>
          <div>
            <h1 style={{fontFamily:"'Orbitron',monospace",fontSize:15,fontWeight:800,letterSpacing:3,color:"var(--accent-cyan)",margin:0}}>{t("app.title")}</h1>
            <span style={{fontSize:10,color:"var(--text-muted)",letterSpacing:2,display:"block"}}>{t("app.subtitle")}</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:20}}>
          <div className="lang-switcher">
            {LANGS.map(lng=>(
              <button key={lng} className={`lang-btn ${i18n.language===lng?"active":""}`} onClick={()=>changeLang(lng)}>{t(`lang.${lng}`)}</button>
            ))}
          </div>
          <div className="theme-toggle" data-mode={theme} onClick={toggleTheme} title={theme==="dark"?t("app.switchToLight"):t("app.switchToDark")}>
            <div className="theme-toggle-knob">{theme==="dark"?"🌙":"☀️"}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:"var(--text-secondary)",letterSpacing:1}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"var(--accent-teal)",boxShadow:"0 0 8px var(--accent-teal)",animation:"pulse 2s ease-in-out infinite"}}></div>{t("app.live")}
          </div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,color:"var(--text-secondary)",width:90,textAlign:"right"}}>{clock}</div>
        </div>
      </header>

      <div className="nav-tabs">
        {[["overview","tabs.overview"],["statistic","tabs.statistic"],["upload","tabs.upload"],["directory","tabs.directory"]].map(([k,lk])=>(
          <div key={k} className={`tab ${tab===k?"active":""}`} onClick={()=>setTab(k)}>{t(lk)}</div>
        ))}
      </div>

      <main className="main">
        {tab==="overview"&&<OverviewTab activeTools={activeTools} allLogs={logs}/>}
        {tab==="statistic"&&<StatisticTab activeTools={activeTools} allTools={tools} allLogs={logs}/>}
        {tab==="upload"&&<UploadLogTab logs={logs} onUpload={handleUpload} onDelete={handleDeleteLog}/>}
        {tab==="directory"&&<ToolStatusTab tools={tools} activeTools={activeTools} toggleTool={toggleTool} onAddTool={openAddTool} onEditTool={openEditTool} onDeleteTool={handleDeleteTool}/>}
      </main>

      <NotificationToast message={notif}/>

      {showToolForm&&<ToolFormModal editingTool={editingTool} toolForm={toolForm} setToolForm={setToolForm} onSave={handleSaveTool} onClose={()=>setShowToolForm(false)}/>}
    </>
  );
}
