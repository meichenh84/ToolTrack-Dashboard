import { useState, useRef, useMemo } from "react";
import ResultBadge from "./ResultBadge.jsx";

export default function UploadLogTab({logs,onUpload,onDelete}){
  const[search,setSearch]=useState("");
  const[filter,setFilter]=useState("ALL");
  const[sortCfg,setSortCfg]=useState({key:"id",dir:"asc"});
  const[dragging,setDragging]=useState(false);
  const fileRef=useRef(null);

  const filteredLogs=useMemo(()=>logs.filter(l=>{
    const rm={pass:"PASS",fail:"FAIL",warning:"WARN"};
    if(filter!=="ALL"&&(l.result?rm[l.result]:null)!==filter)return false;
    if(!search)return true;
    const q=search.toLowerCase();
    return l.filename.toLowerCase().includes(q)||l.toolName.toLowerCase().includes(q)||l.tester.toLowerCase().includes(q)||l.test_site.toLowerCase().includes(q)||(l.testerEmail||"").toLowerCase().includes(q);
  }),[logs,filter,search]);

  const sortedLogs=useMemo(()=>{
    return[...filteredLogs].sort((a,b)=>{
      let av=a[sortCfg.key],bv=b[sortCfg.key];
      if(av==null&&bv==null)return 0;if(av==null)return 1;if(bv==null)return-1;
      if(typeof av==="string"){av=av.toLowerCase();bv=(bv||"").toLowerCase()}
      if(av<bv)return sortCfg.dir==="asc"?-1:1;
      if(av>bv)return sortCfg.dir==="asc"?1:-1;return 0;
    });
  },[filteredLogs,sortCfg]);

  const handleSort=(key)=>setSortCfg(p=>({key,dir:p.key===key&&p.dir==="asc"?"desc":"asc"}));
  const sortIcon=(key)=>sortCfg.key===key?<span style={{marginLeft:4,color:"var(--accent-cyan)",fontSize:8}}>{sortCfg.dir==="asc"?"▲":"▼"}</span>:<span style={{marginLeft:4,opacity:.3,fontSize:8}}>↕</span>;

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
      <input type="file" ref={fileRef} multiple onChange={handleFileSelect}/>

      <div className="table-controls">
        <input className="search-input" placeholder="Search tool, filename, tester, site..." value={search} onChange={e=>setSearch(e.target.value)}/>
        {["ALL","PASS","FAIL","WARN"].map(f=>(
          <button key={f} className={`filter-btn ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>{f}</button>
        ))}
      </div>

      <table>
        <thead><tr>
          <th style={{width:"4%"}} className="sortable" onClick={()=>handleSort("id")}>#  {sortIcon("id")}</th>
          <th style={{width:"11%"}} className="sortable" onClick={()=>handleSort("timeStr")}>Upload Time{sortIcon("timeStr")}</th>
          <th style={{width:"12%"}} className="sortable" onClick={()=>handleSort("toolName")}>Tool Name{sortIcon("toolName")}</th>
          <th style={{width:"15%"}} className="sortable" onClick={()=>handleSort("filename")}>Log Filename{sortIcon("filename")}</th>
          <th style={{width:"7%"}} className="sortable" onClick={()=>handleSort("test_site")}>Test Site{sortIcon("test_site")}</th>
          <th style={{width:"8%"}} className="sortable" onClick={()=>handleSort("test_unit")}>Test Unit{sortIcon("test_unit")}</th>
          <th style={{width:"9%"}} className="sortable" onClick={()=>handleSort("tester")}>Tester{sortIcon("tester")}</th>
          <th style={{width:"14%"}} className="sortable" onClick={()=>handleSort("testerEmail")}>Tester Email{sortIcon("testerEmail")}</th>
          <th style={{width:"7%"}} className="sortable" onClick={()=>handleSort("dur")}>Duration{sortIcon("dur")}</th>
          <th style={{width:"7%"}} className="sortable" onClick={()=>handleSort("result")}>Result{sortIcon("result")}</th>
          <th style={{width:"6%"}}>Action</th>
        </tr></thead>
        <tbody>
          {sortedLogs.map(l=>(
            <tr key={l.id}>
              <td className="mono" style={{color:"var(--text-muted)"}}>{String(l.id).padStart(3,"0")}</td>
              <td className="mono">{l.timeStr}</td>
              <td>{l.toolName}</td>
              <td style={{color:"var(--accent-cyan)",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.filename}</td>
              <td>{l.test_site}</td>
              <td>{l.test_unit||"—"}</td>
              <td>{l.tester}</td>
              <td style={{color:"var(--text-muted)",fontSize:11}}>{l.testerEmail||"—"}</td>
              <td className="mono">{l.dur}</td>
              <td><ResultBadge result={l.result}/></td>
              <td><button className="delete-btn" onClick={()=>onDelete(l.id,l.filename)}>刪除</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
