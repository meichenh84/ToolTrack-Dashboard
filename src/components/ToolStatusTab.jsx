import { useState, useMemo } from "react";

export default function ToolStatusTab({tools,activeTools,toggleTool,onAddTool,onEditTool,onDeleteTool}){
  const[dirSearch,setDirSearch]=useState("");

  const filteredTools=useMemo(()=>{
    if(!dirSearch)return tools;
    const q=dirSearch.toLowerCase();
    return tools.filter(t=>t.name.toLowerCase().includes(q)||t.dev_site.toLowerCase().includes(q)||t.dev_unit.toLowerCase().includes(q)||t.dev.name.toLowerCase().includes(q));
  },[dirSearch,tools]);

  return(
    <div className="panel" style={{animation:"fadeIn .6s ease .2s both"}}>
      <div className="panel-header">
        <div className="panel-title"><div className="panel-title-dot" style={{background:"var(--accent-amber)",boxShadow:"0 0 6px var(--accent-amber)"}}></div> Tool Status</div>
        <span className="panel-badge">{activeTools.length}/{tools.length} active</span>
      </div>
      <div className="table-controls">
        <input className="search-input" placeholder="Search tool, site, team, developer..." value={dirSearch} onChange={e=>setDirSearch(e.target.value)}/>
        <button className="crud-btn add-btn" onClick={onAddTool}>＋ Add Tool</button>
      </div>
      <table>
        <thead><tr>
          <th style={{width:"6%"}}>Active</th><th style={{width:"16%"}}>Tool Name</th><th style={{width:"5%"}}>Type</th><th style={{width:"8%"}}>Dev Site</th><th style={{width:"11%"}}>Dev Unit</th><th style={{width:"7%"}}>Version</th><th style={{width:"10%"}}>Developer</th><th style={{width:"18%"}}>Email</th><th style={{width:"5%"}}>Ext</th><th style={{width:"14%"}}>Action</th>
        </tr></thead>
        <tbody>
          {filteredTools.map(t=>{
            const off=!t.enabled;
            return(
            <tr key={t.id} style={{opacity:off?0.4:1,transition:"opacity .2s"}}>
              <td><label className="toggle-switch" onClick={e=>e.stopPropagation()}><input type="checkbox" checked={!off} onChange={()=>toggleTool(t.id)}/><span className="toggle-slider"></span></label></td>
              <td style={{color:off?"var(--text-muted)":"var(--text-primary)",fontWeight:500}}>{t.name}{off&&<span className="retired-tag">已退役</span>}</td>
              <td><span className={t.cat==="HW"?"cat-hw":"cat-sw"}>{t.cat}</span></td>
              <td style={{fontWeight:500}}>{t.dev_site}</td>
              <td>{t.dev_unit}</td>
              <td className="mono" style={{color:"var(--text-muted)"}}>{t.v}</td>
              <td style={{color:"var(--text-primary)"}}>{t.dev.name}</td>
              <td><a href={`mailto:${t.dev.email}`} style={{color:"var(--accent-cyan)",textDecoration:"none",fontSize:11}}>{t.dev.email}</a></td>
              <td className="mono">{t.dev.ext}</td>
              <td style={{whiteSpace:"nowrap"}}>
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
