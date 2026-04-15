import { useState, useMemo } from "react";

const getVal=(t,key)=>{
  if(key==="dev.name")return t.dev.name;
  if(key==="dev.email")return t.dev.email;
  if(key==="dev.ext")return t.dev.ext;
  return t[key];
};

export default function ToolStatusTab({tools,activeTools,toggleTool,onAddTool,onEditTool,onDeleteTool}){
  const[dirSearch,setDirSearch]=useState("");
  const[sortCfg,setSortCfg]=useState({key:"sort_order",dir:"asc"});

  const filteredTools=useMemo(()=>{
    if(!dirSearch)return tools;
    const q=dirSearch.toLowerCase();
    return tools.filter(t=>t.name.toLowerCase().includes(q)||t.dev_site.toLowerCase().includes(q)||t.dev_unit.toLowerCase().includes(q)||t.dev.name.toLowerCase().includes(q));
  },[dirSearch,tools]);

  const sortedTools=useMemo(()=>{
    return[...filteredTools].sort((a,b)=>{
      let av=getVal(a,sortCfg.key),bv=getVal(b,sortCfg.key);
      if(av==null&&bv==null)return 0;if(av==null)return 1;if(bv==null)return-1;
      if(typeof av==="string"){av=av.toLowerCase();bv=(bv||"").toLowerCase()}
      if(av<bv)return sortCfg.dir==="asc"?-1:1;
      if(av>bv)return sortCfg.dir==="asc"?1:-1;return 0;
    });
  },[filteredTools,sortCfg]);

  const handleSort=(key)=>setSortCfg(p=>({key,dir:p.key===key&&p.dir==="asc"?"desc":"asc"}));
  const sortIcon=(key)=>sortCfg.key===key?<span style={{marginLeft:2,width:0,display:"inline-block",overflow:"visible",color:"var(--accent-cyan)",fontSize:8}}>{sortCfg.dir==="asc"?"▲":"▼"}</span>:<span style={{marginLeft:2,width:0,display:"inline-block",overflow:"visible",opacity:.3,fontSize:8}}>↕</span>;

  return(
    <div className="panel" style={{animation:"fadeIn .6s ease .2s both"}}>
      <div className="panel-header">
        <div className="panel-title"><div className="panel-title-dot" style={{background:"var(--accent-amber)",boxShadow:"0 0 6px var(--accent-amber)"}}></div> Tool Status</div>
        <span className="panel-badge">{activeTools.length}/{tools.length} active</span>
      </div>
      <div className="table-controls">
        <input className="search-input" placeholder="Search tool, site, team, developer..." value={dirSearch} onChange={e=>setDirSearch(e.target.value)} maxLength={200}/>
        <button className="crud-btn add-btn" onClick={onAddTool}>+ ADD TOOL</button>
      </div>
      <table>
        <thead><tr>
          <th style={{width:"3%"}} className="sortable" onClick={()=>handleSort("sort_order")}>#{sortIcon("sort_order")}</th>
          <th style={{width:"5%"}}>Retire</th>
          <th style={{width:"14%"}} className="sortable" onClick={()=>handleSort("name")}>Tool Name{sortIcon("name")}</th>
          <th style={{width:"5%"}} className="sortable" onClick={()=>handleSort("cat")}>Type{sortIcon("cat")}</th>
          <th style={{width:"7%"}} className="sortable" onClick={()=>handleSort("dev_site")}>Dev Site{sortIcon("dev_site")}</th>
          <th style={{width:"7%"}} className="sortable" onClick={()=>handleSort("dev_unit")}>Dev Unit{sortIcon("dev_unit")}</th>
          <th style={{width:"6%"}}>Version</th>
          <th style={{width:"9%"}} className="sortable" onClick={()=>handleSort("finish_date")}>Service Start{sortIcon("finish_date")}</th>
          <th style={{width:"8%"}} className="sortable" onClick={()=>handleSort("service_end_date")}>Service End{sortIcon("service_end_date")}</th>
          <th style={{width:"9%"}} className="sortable" onClick={()=>handleSort("dev.name")}>Developer{sortIcon("dev.name")}</th>
          <th style={{width:"14%"}} className="sortable" onClick={()=>handleSort("dev.email")}>Email{sortIcon("dev.email")}</th>
          <th style={{width:"8%"}} className="sortable" onClick={()=>handleSort("dev.ext")}>Ext{sortIcon("dev.ext")}</th>
          <th style={{width:"10%"}}>Action</th>
        </tr></thead>
        <tbody>
          {sortedTools.map(t=>{
            const off=!t.enabled;
            return(
            <tr key={t.id} style={{opacity:off?0.4:1,transition:"opacity .2s"}}>
              <td className="mono" style={{color:"var(--text-muted)",fontSize:11,textAlign:"center"}}>{t.sort_order}</td>
              <td style={{textAlign:"center"}}><label className="toggle-switch retire-toggle" onClick={e=>e.stopPropagation()}><input type="checkbox" checked={off} onChange={()=>toggleTool(t.id)}/><span className="toggle-slider"></span></label></td>
              <td style={{color:off?"var(--text-muted)":"var(--text-primary)",fontWeight:500}}>{t.name}{off&&<span className="retired-tag">已退役</span>}</td>
              <td style={{textAlign:"center"}}><span className={t.cat==="HW"?"cat-hw":"cat-sw"}>{t.cat}</span></td>
              <td style={{fontWeight:500,textAlign:"center"}}>{t.dev_site}</td>
              <td style={{textAlign:"center"}}>{t.dev_unit}</td>
              <td className="mono" style={{color:"var(--text-muted)",textAlign:"center"}}>{t.v}</td>
              <td className="mono" style={{color:"var(--text-muted)",fontSize:11,textAlign:"center"}}>{t.finish_date||"—"}</td>
              <td className="mono" style={{color:t.service_end_date?"var(--accent-red)":"var(--text-muted)",fontSize:11,textAlign:"center"}}>{t.service_end_date||"—"}</td>
              <td style={{color:"var(--text-primary)",textAlign:"center"}}>{t.dev.name}</td>
              <td><a href={`mailto:${t.dev.email}`} style={{color:"var(--accent-cyan)",textDecoration:"none",fontSize:11}}>{t.dev.email}</a></td>
              <td className="mono" style={{textAlign:"center"}}>{t.dev.ext}</td>
              <td style={{whiteSpace:"nowrap",textAlign:"center"}}>
                <button className="crud-btn edit-btn" onClick={()=>onEditTool(t)}>Edit</button>
                <button className="crud-btn del-btn" onClick={()=>onDeleteTool(t)}>Delete</button>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
