import { useState, useRef, useMemo } from "react";
import ResultBadge from "./ResultBadge.jsx";

export default function UploadLogTab({logs,onUpload,onDelete}){
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
      let av=a[sortCfg.key],bv=b[sortCfg.key];
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
        <div className="panel-title"><div className="panel-title-dot"></div> Upload Log</div>
        <span className="panel-badge">{sortedLogs.length} records</span>
      </div>

      <div
        className={`upload-zone ${dragging?"dragging":""}`}
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        onClick={()=>fileRef.current?.click()}
      >
        <div className="upload-icon">📂</div>
        <div className="upload-text">Drop test log files here</div>
        <div className="upload-sub">Supports .txt</div>
        <button className="upload-btn" onClick={(e)=>{e.stopPropagation();fileRef.current?.click()}}>SELECT FILES</button>
      </div>
      <input type="file" ref={fileRef} multiple accept=".txt" onChange={handleFileSelect}/>

      <div className="table-controls">
        <input className="search-input" placeholder="Search tool, filename, tester, site..." value={search} onChange={e=>setSearch(e.target.value)} maxLength={200}/>
        {["ALL","PASS","FAIL","WARN","STOPPED","N/A"].map(f=>(
          <button key={f} className={`filter-btn ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>{f}</button>
        ))}
      </div>

      <table>
        <thead><tr>
          <th style={{width:"3%"}}>#</th>
          <th style={{width:"10%"}} className="sortable" onClick={()=>handleSort("uploadedAt")}>Upload Time{sortIcon("uploadedAt")}</th>
          <th style={{width:"10%"}} className="sortable" onClick={()=>handleSort("toolName")}>Tool Name{sortIcon("toolName")}</th>
          <th style={{width:"10%"}} className="sortable" onClick={()=>handleSort("modelName")}>Model Name{sortIcon("modelName")}</th>
          <th style={{width:"13%"}} className="sortable" onClick={()=>handleSort("filename")}>Log Filename{sortIcon("filename")}</th>
          <th style={{width:"7%"}} className="sortable" onClick={()=>handleSort("test_site")}>Test Site{sortIcon("test_site")}</th>
          <th style={{width:"7%"}} className="sortable" onClick={()=>handleSort("test_unit")}>Test Unit{sortIcon("test_unit")}</th>
          <th style={{width:"7%"}} className="sortable" onClick={()=>handleSort("tester")}>Tester{sortIcon("tester")}</th>
          <th style={{width:"11%"}} className="sortable" onClick={()=>handleSort("testerEmail")}>Tester Email{sortIcon("testerEmail")}</th>
          <th style={{width:"6%"}} className="sortable" onClick={()=>handleSort("dur")}>Duration{sortIcon("dur")}</th>
          <th style={{width:"6%"}} className="sortable" onClick={()=>handleSort("result")}>Result{sortIcon("result")}</th>
          <th style={{width:"5%"}}>Action</th>
        </tr></thead>
        <tbody>
          {sortedLogs.map((l,i)=>(
            <tr key={l.id}>
              <td className="mono" style={{color:"var(--text-muted)",textAlign:"center"}}>{String(i+1).padStart(3,"0")}</td>
              <td className="mono" style={{textAlign:"center"}}>{l.uploadedAtStr}</td>
              <td>{l.toolName}</td>
              <td>{l.modelName||"—"}</td>
              <td style={{maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}><a href={`/api/logs/download/${encodeURIComponent(l.filename)}`} download={l.filename} onClick={e=>e.stopPropagation()} style={{color:"var(--accent-cyan)",textDecoration:"none",cursor:"pointer"}}>{l.filename}</a></td>
              <td style={{textAlign:"center"}}>{l.test_site}</td>
              <td style={{textAlign:"center"}}>{l.test_unit||"—"}</td>
              <td style={{textAlign:"center"}}>{l.tester}</td>
              <td style={{color:"var(--text-muted)",fontSize:11}}>{l.testerEmail||"—"}</td>
              <td className="mono" style={{textAlign:"center"}}>{l.dur}</td>
              <td style={{textAlign:"center"}}><ResultBadge result={l.result}/></td>
              <td style={{textAlign:"center"}}><button className="delete-btn" onClick={()=>onDelete(l.id,l.filename)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
