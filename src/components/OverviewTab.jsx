import { useState, useMemo } from "react";
import CountUp from "./CountUp.jsx";

export default function OverviewTab({activeTools,allLogs}){
  // Current month as default period
  const[selectedPeriod,setSelectedPeriod]=useState(()=>{
    const now=new Date();
    return `${now.getFullYear()}-${now.getMonth()+1}`;
  });
  const[matrixFilter,setMatrixFilter]=useState("ALL");

  // Build 12-month window ending at selectedPeriod
  const[selY,selM]=selectedPeriod.split("-").map(Number);
  const months12=[];
  for(let i=0;i<12;i++){
    let mm=selM-i, yy=selY;
    while(mm<1){mm+=12;yy--}
    months12.push({year:yy,month:mm});
  }

  // Dropdown options: from current month down to earliest log month
  const periodOptions=useMemo(()=>{
    const now=new Date();
    const curY=now.getFullYear(), curM=now.getMonth()+1;
    // Find earliest log month
    let startY=curY, startM=curM;
    if(allLogs.length>0){
      const earliest=allLogs.reduce((min,l)=>l.time<min?l.time:min,allLogs[0].time);
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
    : ["TPE","XM","FQ"].includes(matrixFilter) ? allLogs.filter(l=>l.test_site===matrixFilter)
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
          {label:"Total Tools",val:<><CountUp target={activeTools.length}/></>,sub:"",accent:"var(--accent-cyan)"},
          {label:"Total Duration",val:<><CountUp target={Math.round(allLogs.reduce((sum,l)=>{const n=parseFloat(l.dur);return sum+(isNaN(n)?0:n)},0))}/><span style={{fontSize:14,fontWeight:400}}>h</span></>,sub:"All saved hours",accent:"var(--accent-teal)"},
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
            所有工具近 12 個月使用與累計總使用狀態({months12[months12.length-1].year}/{String(months12[months12.length-1].month).padStart(2,"0")} 起 ~ {months12[0].year}/{String(months12[0].month).padStart(2,"0")} 止)
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:11,color:"var(--text-muted)",letterSpacing:1,whiteSpace:"nowrap"}}>期間選擇：</span>
              <select className="year-select" value={selectedPeriod} onChange={e=>setSelectedPeriod(e.target.value)}>
                {periodOptions.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:11,color:"var(--text-muted)",letterSpacing:1,whiteSpace:"nowrap"}}>資料篩選：</span>
              <select className="year-select" value={matrixFilter} onChange={e=>setMatrixFilter(e.target.value)}>
                {["ALL","TPE","XM","FQ","TV","MONITOR"].map(f=><option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="panel-note">
          追蹤各工具每月是否實際投入使用 — <strong>整期未使用的工具需特別關注是否落實於日常測試流程</strong>　｜　<span style={{color:"var(--accent-teal)"}}>綠色數字</span> = 該月測試次數與測試時數(即節省時數)　｜　<span style={{color:"var(--accent-red)"}}>N/A</span> = 該月無使用紀錄
        </div>
        <div className="matrix-wrap">
          <table className="usage-matrix">
            <thead><tr>
              <th className="matrix-tool-header">工具名稱</th>
              <th className="matrix-month-header"><div style={{lineHeight:1.6}}>總次數<br/><span style={{color:"var(--accent-teal)"}}>總時數</span></div></th>
              {months12.map((m,i)=><th key={i} className="matrix-month-header">{m.year}/{String(m.month).padStart(2,"0")}</th>)}
            </tr></thead>
            <tbody>
              {activeTools.map(tool=>{
                const cells=months12.map(m=>{const count=getCount(tool.id,m.year,m.month);const dur=getDur(tool.id,m.year,m.month);return{count,dur}});
                const usedCount=cells.filter(c=>c.count>0).length;
                return(
                  <tr key={tool.id} className={usedCount===0?"matrix-row-unused":""}>
                    <td className="matrix-tool-name">{tool.name}</td>
                    {(()=>{const tLogs=filteredMatrixLogs.filter(l=>l.toolId===tool.id);const tCount=tLogs.length;const tDur=tLogs.reduce((s,l)=>{const n=parseFloat(l.dur);return s+(isNaN(n)?0:n)},0);return(
                    <td className="matrix-cell" style={{borderRight:"1px solid var(--border)"}}><div style={{fontWeight:700,color:"var(--text-primary)",fontSize:15}}>{tCount} 次</div><div style={{fontSize:13,fontWeight:700,color:"var(--accent-teal)",marginTop:4}}>{tDur.toFixed(1)}h</div></td>
                    )})()}
                    {cells.map((c,i)=>(
                      <td key={i} className={`matrix-cell ${c.count>0?"cell-used":"cell-unused"}`}>
                        {c.count>0?<><div className="cell-count">{c.count} 次</div><div style={{fontSize:13,fontWeight:700,color:"var(--accent-teal)",marginTop:4}}>{c.dur.toFixed(1)}h</div></>:<>N/A</>}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {(()=>{
                const grandCount=filteredMatrixLogs.filter(l=>activeTools.some(t=>t.id===l.toolId)).length;
                const grandDur=filteredMatrixLogs.filter(l=>activeTools.some(t=>t.id===l.toolId)).reduce((s,l)=>{const n=parseFloat(l.dur);return s+(isNaN(n)?0:n)},0);
                return(
                <tr style={{background:"rgba(0,212,255,0.06)",borderTop:"2px solid var(--border-bright)"}}>
                  <td className="matrix-tool-name" style={{fontWeight:700,color:"var(--accent-cyan)"}}>合計</td>
                  <td className="matrix-cell" style={{borderRight:"1px solid var(--border)"}}><div style={{fontWeight:700,color:"var(--accent-cyan)",fontSize:15}}>{grandCount} 次</div><div style={{fontSize:13,fontWeight:700,color:"var(--accent-teal)",marginTop:4}}>{grandDur.toFixed(1)}h</div></td>
                  {months12.map((m,i)=>{
                    const mCount=activeTools.reduce((s,t)=>s+getCount(t.id,m.year,m.month),0);
                    const mDur=activeTools.reduce((s,t)=>s+getDur(t.id,m.year,m.month),0);
                    return(
                      <td key={i} className="matrix-cell" style={{fontWeight:700}}>
                        {mCount>0?<><div style={{color:"var(--accent-cyan)",fontSize:15}}>{mCount} 次</div><div style={{fontSize:13,fontWeight:700,color:"var(--accent-teal)",marginTop:4}}>{mDur.toFixed(1)}h</div></>:<>N/A</>}
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
              <div>已使用工具：<span className="used-count">{allUsed}</span></div>
              <div>未使用工具：<span className="unused-count">{allUnused}</span></div>
            </div>
          );
        })()}
        </div>
      </div>
    </>
  );
}
