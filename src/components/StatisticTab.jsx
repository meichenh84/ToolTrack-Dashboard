import { SITES } from "../data/rankings.js";
import RankingPanel from "./RankingPanel.jsx";

export default function StatisticTab({activeTools,allLogs,R}){
  return(
    <div className="rank-stack">
      <div className="panel">
        <div className="panel-header"><div className="panel-title"><div className="panel-title-dot" style={{background:"var(--accent-teal)",boxShadow:"0 0 6px var(--accent-teal)"}}></div>所有工具已被各 Site 使用總次數與總時數</div></div>
        <div className="site-columns">
          {SITES.map(s=>{
            const toolIds=new Set(activeTools.map(t=>t.id));
            const siteLogs=allLogs.filter(l=>l.test_site===s&&toolIds.has(l.toolId));
            const toolMap={};
            activeTools.forEach(t=>{toolMap[t.name]={count:0,dur:0}});
            siteLogs.forEach(l=>{if(toolMap[l.toolName]){toolMap[l.toolName].count++;const h=parseFloat(l.dur);if(!isNaN(h))toolMap[l.toolName].dur+=h}});
            const data=Object.entries(toolMap).map(([name,v])=>({name,count:v.count,dur:v.dur})).sort((a,b)=>b.count-a.count);
            const max=data.length>0?data[0].count:0;
            const top3=data.slice(0,3);
            const medals=["🏆","🥈","🥉"];
            const tiers=["gold","silver","bronze"];
            const totalCount=data.reduce((s,d)=>s+d.count,0);
            const totalDur=data.reduce((s,d)=>s+d.dur,0);
            return(
            <div key={s} className="site-col">
              <div className="site-col-header">{s}</div>
              {top3.length>0&&(
                <div className="podium">
                  {top3.map((item,i)=>{
                    const barH=max>0?Math.max(20,Math.round(item.count/max*110)):20;
                    return(<div key={i} className={`podium-col ${tiers[i]}`}><div className="podium-medal">{medals[i]}</div><div className="podium-count">{item.count}</div><div className="podium-bar-v" style={{height:barH}}></div><div className="podium-name">{item.name}</div></div>);
                  })}
                </div>
              )}
              <div className="tool-list">
                {data.map((item,i)=>{
                  const isLow=item.count<=0;
                  return(
                    <div key={i} className={`tool-item ${i===0&&!isLow?"active":""} ${isLow?"low-usage":""}`}>
                      <div className="tool-rank">{String(i+1).padStart(2,"0")}</div>
                      <div className="tool-name-text">{item.name}{isLow&&<span className="low-tag">⚠ UNUSED</span>}</div>
                      <div className="tool-bar-wrap"><div className="tool-bar" style={{width:`${max>0?(item.count/max*100).toFixed(0):0}%`,background:isLow?"var(--accent-red)":"var(--accent-teal)"}}></div></div>
                      <div className="tool-tests" style={{color:isLow?"var(--accent-red)":"var(--accent-teal)"}}>{item.count}</div>
                      <div style={{fontSize:10,color:"var(--accent-teal)",width:45,flexShrink:0,textAlign:"right"}}>{item.dur.toFixed(1)}h</div>
                    </div>
                  );
                })}
                <div className="tool-item" style={{borderTop:"2px solid var(--border-bright)",background:"rgba(0,212,255,0.04)",borderRadius:"0 0 8px 8px"}}>
                  <div className="tool-rank"></div>
                  <div className="tool-name-text" style={{fontWeight:700,color:"var(--accent-cyan)"}}>合計</div>
                  <div className="tool-bar-wrap"></div>
                  <div className="tool-tests" style={{fontWeight:700,color:"var(--accent-cyan)",fontSize:13}}>{totalCount}</div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--accent-teal)",width:45,flexShrink:0,textAlign:"right"}}>{totalDur.toFixed(1)}h</div>
                </div>
              </div>
            </div>);
          })}
        </div>
      </div>
      <RankingPanel title="工具協助 Debug 累計 Fail 數" data={R.toolFails} dotColor="var(--accent-red)" barBg="var(--accent-red)" showTotal/>
      {(()=>{
        const toolIds=new Set(activeTools.map(t=>t.id));
        const testerMap={};
        allLogs.filter(l=>toolIds.has(l.toolId)).forEach(l=>{
          if(!testerMap[l.tester])testerMap[l.tester]={count:0,dur:0,test_site:l.test_site,test_unit:l.test_unit};
          testerMap[l.tester].count++;
          const h=parseFloat(l.dur);if(!isNaN(h))testerMap[l.tester].dur+=h;
        });
        const testerData=Object.entries(testerMap).map(([name,v])=>({name,count:v.count,dur:v.dur,test_site:v.test_site,unit:v.test_unit||"—"})).sort((a,b)=>b.count-a.count);
        const max=testerData.length>0?testerData[0].count:0;
        const top3=testerData.slice(0,3);
        const medals=["🏆","🥈","🥉"];
        const tiers=["gold","silver","bronze"];
        const totalCount=testerData.reduce((s,d)=>s+d.count,0);
        const totalDur=testerData.reduce((s,d)=>s+d.dur,0);
        return(
        <div className="panel">
          <div className="panel-header"><div className="panel-title"><div className="panel-title-dot" style={{background:"var(--accent-amber)",boxShadow:"0 0 6px var(--accent-amber)"}}></div>測試者上傳次數與時數</div></div>
          {top3.length>0&&(
            <div className="podium">
              {top3.map((item,i)=>{
                const barH=max>0?Math.max(20,Math.round(item.count/max*110)):20;
                return(<div key={i} className={`podium-col ${tiers[i]}`}><div className="podium-medal">{medals[i]}</div><div className="podium-count">{item.count}</div><div className="podium-bar-v" style={{height:barH}}></div><div className="podium-name">{item.name}</div></div>);
              })}
            </div>
          )}
          <div className="tool-list">
            {testerData.map((item,i)=>(
              <div key={i} className={`tool-item ${i===0?"active":""}`}>
                <div className="tool-rank">{String(i+1).padStart(2,"0")}</div>
                <div className="tool-name-text" style={{flex:1}}>{item.name}<span style={{fontSize:10,color:"var(--accent-cyan)",padding:"2px 6px",background:"rgba(0,212,255,0.1)",borderRadius:4,marginLeft:8}}>{item.test_site}</span><span style={{fontSize:10,color:"var(--accent-teal)",padding:"2px 6px",background:"rgba(0,184,148,0.1)",borderRadius:4,marginLeft:4}}>{item.unit}</span></div>
                <div className="tool-bar-wrap"><div className="tool-bar" style={{width:`${max>0?(item.count/max*100).toFixed(0):0}%`,background:"linear-gradient(90deg,var(--accent-amber),#e67e22)"}}></div></div>
                <div className="tool-tests" style={{color:"var(--accent-amber)"}}>{item.count}</div>
                <div style={{fontSize:11,fontWeight:700,color:"var(--accent-teal)",width:50,flexShrink:0,textAlign:"right"}}>{item.dur.toFixed(1)}h</div>
              </div>
            ))}
            <div className="tool-item" style={{borderTop:"2px solid var(--border-bright)",background:"rgba(0,212,255,0.04)",borderRadius:"0 0 8px 8px"}}>
              <div className="tool-rank"></div>
              <div className="tool-name-text" style={{fontWeight:700,color:"var(--accent-cyan)"}}>合計</div>
              <div className="tool-bar-wrap"></div>
              <div className="tool-tests" style={{fontWeight:700,color:"var(--accent-amber)",fontSize:13}}>{totalCount}</div>
              <div style={{fontSize:11,fontWeight:700,color:"var(--accent-teal)",width:50,flexShrink:0,textAlign:"right"}}>{totalDur.toFixed(1)}h</div>
            </div>
          </div>
        </div>);
      })()}
    </div>
  );
}
