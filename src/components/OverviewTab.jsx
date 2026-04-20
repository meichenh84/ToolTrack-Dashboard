import { useState, useMemo } from "react";
import { useTranslation, Trans } from "react-i18next";
import CountUp from "./CountUp.jsx";

export default function OverviewTab({activeTools,allLogs}){
  const{t}=useTranslation();
  // Current month as default period
  const[selectedPeriod,setSelectedPeriod]=useState(()=>{
    const now=new Date();
    return `${now.getFullYear()}-${now.getMonth()+1}`;
  });
  const[matrixFilter,setMatrixFilter]=useState("ALL");
  const[matrixSort,setMatrixSort]=useState({key:"sort_order",dir:"asc"});
  const handleMatrixSort=(key)=>setMatrixSort(p=>({key,dir:p.key===key&&p.dir==="asc"?"desc":"asc"}));
  const matrixSortIcon=(key)=>matrixSort.key===key?<span style={{marginLeft:2,width:0,display:"inline-block",overflow:"visible",color:"var(--accent-cyan)",fontSize:8}}>{matrixSort.dir==="asc"?"▲":"▼"}</span>:<span style={{marginLeft:2,width:0,display:"inline-block",overflow:"visible",opacity:.3,fontSize:8}}>↕</span>;

  // Build 12-month window ending at selectedPeriod
  const[selY,selM]=selectedPeriod.split("-").map(Number);
  const months12=[];
  for(let i=0;i<12;i++){
    let mm=selM-i, yy=selY;
    while(mm<1){mm+=12;yy--}
    months12.push({year:yy,month:mm});
  }

  // Dropdown: upper bound = system time (auto-extends), lower bound = earliest log date
  const periodOptions=useMemo(()=>{
    const now=new Date();
    const curY=now.getFullYear(), curM=now.getMonth()+1;
    // Lower bound: earliest log's test date
    let startY=curY, startM=curM;
    if(allLogs.length>0){
      const earliest=allLogs.reduce((min,l)=>l.time<min?l.time:min,Infinity);
      const d=new Date(earliest);
      startY=d.getFullYear();
      startM=d.getMonth()+1;
    }
    const opts=[];
    let y=curY, m=curM;
    while(y>startY||(y===startY&&m>=startM)){
      opts.push({value:`${y}-${m}`,label:`${y}/${String(m).padStart(2,"0")}`});
      m--;
      if(m<1){m=12;y--;}
    }
    return opts;
  },[allLogs]);

  // Filter LOG data
  const filteredMatrixLogs = matrixFilter==="ALL" ? allLogs
    : ["TPE","XM","FQ","GZ"].includes(matrixFilter) ? allLogs.filter(l=>l.test_site===matrixFilter)
    : allLogs.filter(l=>l.test_unit&&l.test_unit.toUpperCase()===matrixFilter);

  const getCount=(toolId,year,month)=>{
    return filteredMatrixLogs.filter(l=>{
      const d=new Date(l.time);
      return l.toolId===toolId&&d.getFullYear()===year&&d.getMonth()===month-1;
    }).length;
  };
  const getDur=(toolId,year,month)=>{
    return filteredMatrixLogs.filter(l=>{
      const d=new Date(l.time);
      return l.toolId===toolId&&d.getFullYear()===year&&d.getMonth()===month-1;
    }).reduce((s,l)=>{const n=parseFloat(l.dur);return s+(isNaN(n)?0:n)},0);
  };

  return(
    <>
      <div className="stats-row">
        {[
          {label:t("overview.totalTools"),val:<><CountUp target={activeTools.length}/></>,sub:"",accent:"var(--accent-cyan)"},
          {label:t("overview.totalDuration"),val:<><CountUp target={Math.round(allLogs.reduce((sum,l)=>{const n=parseFloat(l.dur);return sum+(isNaN(n)?0:n)},0))}/><span style={{fontSize:14,fontWeight:400}}>h</span></>,sub:t("overview.allSavedHours"),accent:"var(--accent-teal)"},
        ].map((s,i)=>(
          <div key={i} className="stat-card" style={{"--accent-color":s.accent}}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.val}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="rank-stack">
        <div className="panel hero-panel">
        <div className="panel-header" style={{justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div className="panel-title">
            <div className="panel-title-dot" style={{background:"var(--accent-cyan)",boxShadow:"0 0 6px var(--accent-cyan)"}}></div>
            {t("overview.matrixTitle",{start:`${months12[months12.length-1].year}/${String(months12[months12.length-1].month).padStart(2,"0")}`,end:`${months12[0].year}/${String(months12[0].month).padStart(2,"0")}`})}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:11,color:"var(--text-muted)",letterSpacing:1,whiteSpace:"nowrap"}}>{t("overview.columnStart")}</span>
              <select className="year-select" value={selectedPeriod} onChange={e=>setSelectedPeriod(e.target.value)}>
                {periodOptions.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:11,color:"var(--text-muted)",letterSpacing:1,whiteSpace:"nowrap"}}>{t("overview.dataFilter")}</span>
              <select className="year-select" value={matrixFilter} onChange={e=>setMatrixFilter(e.target.value)}>
                {["ALL","TPE","XM","FQ","GZ","TV","MONITOR","PD","OTHERS"].map(f=><option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="panel-note">
          <Trans i18nKey="overview.matrixNote" components={{s:<strong/>,g:<span style={{color:"var(--accent-teal)"}}/>,r:<span style={{color:"var(--accent-red)"}}/>}}/>
        </div>
        <div className="matrix-wrap">
          <table className="usage-matrix">
            <thead><tr>
              <th className="matrix-month-header sortable" onClick={()=>handleMatrixSort("sort_order")} style={{cursor:"pointer",width:40,textAlign:"center"}}>#{ matrixSortIcon("sort_order")}</th>
              <th className="matrix-tool-header sortable" onClick={()=>handleMatrixSort("name")} style={{cursor:"pointer"}}>{t("overview.toolName")}{matrixSortIcon("name")}</th>
              <th className="matrix-month-header sortable" onClick={()=>handleMatrixSort("totalCount")} style={{cursor:"pointer",textAlign:"center",whiteSpace:"normal"}}><div style={{lineHeight:1.6}}>{t("overview.totalCount")}{matrixSortIcon("totalCount")}<br/><span style={{color:"var(--accent-teal)"}} onClick={e=>{e.stopPropagation();handleMatrixSort("totalDur")}}>{t("overview.totalHours")}{matrixSortIcon("totalDur")}</span></div></th>
              {months12.map((m,i)=><th key={i} className="matrix-month-header">{m.year}/{String(m.month).padStart(2,"0")}</th>)}
            </tr></thead>
            <tbody>
              {[...activeTools].sort((a,b)=>{
                const key=matrixSort.key;
                let av,bv;
                if(key==="sort_order"){av=a.sort_order;bv=b.sort_order}
                else if(key==="name"){av=`${a.dev_site}_${a.cat}_${a.name}`.toLowerCase();bv=`${b.dev_site}_${b.cat}_${b.name}`.toLowerCase()}
                else{
                  const aLogs=filteredMatrixLogs.filter(l=>l.toolId===a.id);
                  const bLogs=filteredMatrixLogs.filter(l=>l.toolId===b.id);
                  if(key==="totalCount"){av=aLogs.length;bv=bLogs.length}
                  else{av=aLogs.reduce((s,l)=>{const n=parseFloat(l.dur);return s+(isNaN(n)?0:n)},0);bv=bLogs.reduce((s,l)=>{const n=parseFloat(l.dur);return s+(isNaN(n)?0:n)},0)}
                }
                if(av<bv)return matrixSort.dir==="asc"?-1:1;
                if(av>bv)return matrixSort.dir==="asc"?1:-1;return 0;
              }).map((tool,idx)=>{
                const cells=months12.map(m=>{const count=getCount(tool.id,m.year,m.month);const dur=getDur(tool.id,m.year,m.month);return{count,dur}});
                const usedCount=cells.filter(c=>c.count>0).length;
                return(
                  <tr key={tool.id} className={usedCount===0?"matrix-row-unused":""}>
                    <td style={{color:"var(--text-muted)",fontSize:11,textAlign:"center",fontFamily:"monospace"}}>{idx+1}</td>
                    <td className="matrix-tool-name">{`${tool.dev_site}_${tool.cat}_${tool.name}`}</td>
                    {(()=>{const tLogs=filteredMatrixLogs.filter(l=>l.toolId===tool.id);const tCount=tLogs.length;const tDur=tLogs.reduce((s,l)=>{const n=parseFloat(l.dur);return s+(isNaN(n)?0:n)},0);return(
                    <td className="matrix-cell" style={{borderRight:"1px solid var(--border)"}}><div style={{fontWeight:700,color:"var(--text-primary)",fontSize:12}}>{tCount}{t("overview.times")}</div><div style={{fontSize:11,fontWeight:700,color:"var(--accent-teal)",marginTop:2}}>{tDur.toFixed(1)}h</div></td>
                    )})()}
                    {cells.map((c,i)=>(
                      <td key={i} className={c.count>0?"matrix-cell":"matrix-cell cell-unused"}>
                        {c.count>0?<><div style={{fontWeight:700,color:"var(--text-primary)",fontSize:12}}>{c.count}{t("overview.times")}</div><div style={{fontSize:11,fontWeight:700,color:"var(--accent-teal)",marginTop:2}}>{c.dur.toFixed(1)}h</div></>:<>N/A</>}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {(()=>{
                const toolIdSet=new Set(activeTools.map(t=>t.id));
                const relevantLogs=filteredMatrixLogs.filter(l=>toolIdSet.has(l.toolId));
                const grandCount=relevantLogs.length;
                const grandDur=relevantLogs.reduce((s,l)=>{const n=parseFloat(l.dur);return s+(isNaN(n)?0:n)},0);
                return(
                <tr style={{background:"rgba(0,212,255,0.06)",borderTop:"2px solid var(--border-bright)"}}>
                  <td></td>
                  <td className="matrix-tool-name" style={{fontWeight:700,color:"var(--accent-cyan)"}}>{t("overview.total")}</td>
                  <td className="matrix-cell" style={{borderRight:"1px solid var(--border)"}}><div style={{fontWeight:700,color:"var(--accent-cyan)",fontSize:12}}>{grandCount}{t("overview.times")}</div><div style={{fontSize:11,fontWeight:700,color:"var(--accent-teal)",marginTop:2}}>{grandDur.toFixed(1)}h</div></td>
                  {months12.map((m,i)=>{
                    const mCount=activeTools.reduce((s,t)=>s+getCount(t.id,m.year,m.month),0);
                    const mDur=activeTools.reduce((s,t)=>s+getDur(t.id,m.year,m.month),0);
                    return(
                      <td key={i} className="matrix-cell" style={{fontWeight:700}}>
                        {mCount>0?<><div style={{color:"var(--accent-cyan)",fontSize:12}}>{mCount}{t("overview.times")}</div><div style={{fontSize:11,fontWeight:700,color:"var(--accent-teal)",marginTop:2}}>{mDur.toFixed(1)}h</div></>:<>N/A</>}
                      </td>
                    );
                  })}
                </tr>);
              })()}
            </tbody>
          </table>
        </div>
        {(()=>{
          const counts=activeTools.map(t=>months12.some(m=>(getCount(t.id,m.year,m.month)||0)>0));
          const allUsed=counts.filter(Boolean).length;
          const allUnused=activeTools.length-allUsed;
          return(
            <div className="matrix-summary">
              <div>{t("overview.usedTools")}<span className="used-count">{allUsed}</span></div>
              <div>{t("overview.unusedTools")}<span className="unused-count">{allUnused}</span></div>
            </div>
          );
        })()}
        </div>
      </div>
    </>
  );
}
