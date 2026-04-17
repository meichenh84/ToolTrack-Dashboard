import { useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import ResultBadge from "./ResultBadge.jsx";

export default function UploadLogTab({logs,onUpload,onDelete}){
  const{t}=useTranslation();
  const[search,setSearch]=useState("");
  const[filter,setFilter]=useState("ALL");
  const[sortCfg,setSortCfg]=useState({key:"uploadedAt",dir:"desc"});
  const[dragging,setDragging]=useState(false);
  const fileRef=useRef(null);

  const filteredLogs=useMemo(()=>logs.filter(l=>{
    const rm={pass:"PASS",fail:"FAIL",warning:"WARN",stopped:"STOPPED","n/a":"N/A"};
    if(filter!=="ALL"&&(l.result?rm[l.result]:null)!==filter)return false;
    if(!search)return true;
    const q=search.toLowerCase();
    return l.filename.toLowerCase().includes(q)||l.toolName.toLowerCase().includes(q)||(l.modelName||"").toLowerCase().includes(q)||l.tester.toLowerCase().includes(q)||l.test_site.toLowerCase().includes(q)||(l.testerEmail||"").toLowerCase().includes(q);
  }),[logs,filter,search]);

  const sortedLogs=useMemo(()=>{
    return[...filteredLogs].sort((a,b)=>{
      let av,bv;
      if(sortCfg.key==="failRate"){av=a.totalCount>0?a.failCount/a.totalCount:0;bv=b.totalCount>0?b.failCount/b.totalCount:0}
      else{av=a[sortCfg.key];bv=b[sortCfg.key]}
      if(av==null&&bv==null)return 0;if(av==null)return 1;if(bv==null)return-1;
      if(sortCfg.key==="dur"){av=parseFloat(av)||0;bv=parseFloat(bv)||0}
      else if(typeof av==="string"){av=av.toLowerCase();bv=(bv||"").toLowerCase()}
      if(av<bv)return sortCfg.dir==="asc"?-1:1;
      if(av>bv)return sortCfg.dir==="asc"?1:-1;return 0;
    });
  },[filteredLogs,sortCfg]);

  const handleSort=(key)=>setSortCfg(p=>({key,dir:p.key===key&&p.dir==="asc"?"desc":"asc"}));
  const sortIcon=(key)=>sortCfg.key===key?<span style={{marginLeft:2,width:0,display:"inline-block",overflow:"visible",color:"var(--accent-cyan)",fontSize:8}}>{sortCfg.dir==="asc"?"▲":"▼"}</span>:<span style={{marginLeft:2,width:0,display:"inline-block",overflow:"visible",opacity:.3,fontSize:8}}>↕</span>;

  const handleDragOver=(e)=>{e.preventDefault();setDragging(true)};
  const handleDragLeave=()=>setDragging(false);
  const handleDrop=(e)=>{e.preventDefault();setDragging(false);const f=Array.from(e.dataTransfer.files);if(f.length)onUpload(f)};
  const handleFileSelect=(e)=>{const f=Array.from(e.target.files);if(f.length)onUpload(f);e.target.value=""};

  return(
    <div className="panel log-panel" style={{animation:"fadeIn .6s ease .2s both"}}>
      <div className="panel-header">
        <div className="panel-title"><div className="panel-title-dot"></div> {t("upload.title")}</div>
        <span className="panel-badge">{sortedLogs.length} {t("upload.records")}</span>
      </div>

      <div
        className={`upload-zone ${dragging?"dragging":""}`}
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        onClick={()=>fileRef.current?.click()}
      >
        <div className="upload-icon">📂</div>
        <div className="upload-text">{t("upload.dropHere")}</div>
        <div className="upload-sub">{t("upload.supportsTxt")}</div>
        <button className="upload-btn" onClick={(e)=>{e.stopPropagation();fileRef.current?.click()}}>{t("upload.selectFiles")}</button>
      </div>
      <input type="file" ref={fileRef} multiple accept=".txt" onChange={handleFileSelect}/>

      <div className="table-controls">
        <input className="search-input" placeholder={t("upload.searchPlaceholder")} value={search} onChange={e=>setSearch(e.target.value)} maxLength={200}/>
        {["ALL","PASS","FAIL","WARN","STOPPED","N/A"].map(f=>(
          <button key={f} className={`filter-btn ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>{f}</button>
        ))}
      </div>

      <table>
        <thead><tr>
          <th>#</th>
          <th className="sortable" onClick={()=>handleSort("toolName")}>{t("upload.colToolName")}{sortIcon("toolName")}</th>
          <th className="sortable" onClick={()=>handleSort("modelName")}>{t("upload.colModelName")}{sortIcon("modelName")}</th>
          <th className="sortable" onClick={()=>handleSort("test_site")}>{t("upload.colTestSite")}{sortIcon("test_site")}</th>
          <th className="sortable" onClick={()=>handleSort("test_unit")}>{t("upload.colTestUnit")}{sortIcon("test_unit")}</th>
          <th className="sortable" onClick={()=>handleSort("tester")}>{t("upload.colTester")}{sortIcon("tester")}</th>
          <th className="sortable" onClick={()=>handleSort("dur")}>{t("upload.colDuration")}{sortIcon("dur")}</th>
          <th className="sortable" onClick={()=>handleSort("result")}>{t("upload.colResult")}{sortIcon("result")}</th>
          <th className="sortable" onClick={()=>handleSort("failCount")}>{t("upload.colFailCases")}{sortIcon("failCount")}</th>
          <th className="sortable" onClick={()=>handleSort("passCount")}>{t("upload.colPassCases")}{sortIcon("passCount")}</th>
          <th className="sortable" onClick={()=>handleSort("totalCount")}>{t("upload.colTotalCases")}{sortIcon("totalCount")}</th>
          <th className="sortable" onClick={()=>handleSort("failRate")}>{t("upload.colFailRate")}{sortIcon("failRate")}</th>
          <th>{t("upload.colDownload")}</th>
          <th>{t("upload.colAction")}</th>
        </tr></thead>
        <tbody>
          {sortedLogs.map((l,i)=>(
            <tr key={l.id}>
              <td className="mono" style={{color:"var(--text-muted)",textAlign:"center"}}>{String(i+1).padStart(3,"0")}</td>
              <td style={{width:"100%"}}>{l.toolName}</td>
              <td style={{minWidth:140}}>{l.modelName||"—"}</td>
              <td style={{textAlign:"center"}}>{l.test_site}</td>
              <td style={{textAlign:"center"}}>{l.test_unit||"—"}</td>
              <td style={{textAlign:"center"}}><span className="dl-tip" data-tip={l.testerEmail||"—"} style={{cursor:"default",borderBottom:"1px dashed var(--text-muted)"}}>{l.tester}</span></td>
              <td className="mono" style={{textAlign:"center"}}>{l.dur}</td>
              <td style={{textAlign:"center"}}><ResultBadge result={l.result}/></td>
              <td className="mono" style={{textAlign:"center"}}>{l.failCount}</td>
              <td className="mono" style={{textAlign:"center"}}>{l.passCount}</td>
              <td className="mono" style={{textAlign:"center"}}>{l.totalCount}</td>
              <td className="mono" style={{textAlign:"center",color:l.totalCount>0&&l.failCount/l.totalCount>0?"var(--accent-red)":"var(--text-muted)"}}>{l.totalCount>0?(l.failCount/l.totalCount*100).toFixed(1)+"%":"0.0%"}</td>
              <td style={{textAlign:"center"}}><a href={`/api/logs/download/${encodeURIComponent(l.filename)}`} download={l.filename} onClick={e=>e.stopPropagation()} className="dl-tip" data-tip={`${l.filename}\n${t("upload.colUploadTime")}: ${l.uploadedAtStr}`} style={{color:"var(--accent-cyan)",textDecoration:"none",cursor:"pointer",fontSize:16}}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></a></td>
              <td style={{textAlign:"center"}}><button className="delete-btn" onClick={()=>onDelete(l.id,l.filename)}>{t("upload.delete")}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
