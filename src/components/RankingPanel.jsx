export default function RankingPanel({title,data,dotColor,barBg,className,note,lowThreshold,showTotal}){
  const dot=dotColor?{background:dotColor,boxShadow:`0 0 6px ${dotColor}`}:{};
  if(!data.length)return<div className={`panel ${className||""}`}><div className="panel-header"><div className="panel-title"><div className="panel-title-dot" style={dot}></div>{title}</div></div><div style={{padding:20,color:"var(--text-muted)",fontSize:11}}>No data</div></div>;
  const max=data[0].count;
  const top3=data.slice(0,3);
  const medals=["🏆","🥈","🥉"];
  const tiers=["gold","silver","bronze"];
  return(
    <div className={`panel ${className||""}`}>
      <div className="panel-header"><div className="panel-title"><div className="panel-title-dot" style={dot}></div>{title}</div></div>
      {note&&<div className="panel-note">{note}</div>}
      {top3.length>0&&(
        <div className="podium">
          {top3.map((item,i)=>{
            const barH=max>0?Math.max(20,Math.round(item.count/max*110)):20;
            return(
              <div key={i} className={`podium-col ${tiers[i]}`}>
                <div className="podium-medal">{medals[i]}</div>
                <div className="podium-count">{item.count}</div>
                <div className="podium-bar-v" style={{height:barH}}></div>
                <div className="podium-name">{item.name}</div>
              </div>
            );
          })}
        </div>
      )}
      <div className="tool-list">
        {data.map((item,i)=>{
          const isLow=lowThreshold!=null&&item.count<=lowThreshold;
          return(
            <div key={i} className={`tool-item ${i===0&&!isLow?"active":""} ${isLow?"low-usage":""}`}>
              <div className="tool-rank">{String(i+1).padStart(2,"0")}</div>
              <div className="tool-name-text">{item.name}{isLow&&<span className="low-tag">⚠ UNUSED</span>}</div>
              <div className="tool-bar-wrap"><div className="tool-bar" style={{width:`${max>0?(item.count/max*100).toFixed(0):0}%`,background:isLow?"var(--accent-red)":barBg||undefined}}></div></div>
              <div className="tool-tests" style={{color:isLow?"var(--accent-red)":barBg?barBg:undefined}}>{item.count}</div>
            </div>
          );
        })}
        {showTotal&&<div className="tool-item" style={{borderTop:"2px solid var(--border-bright)",background:"rgba(0,212,255,0.04)",borderRadius:"0 0 8px 8px"}}>
          <div className="tool-rank"></div>
          <div className="tool-name-text" style={{fontWeight:700,color:"var(--accent-cyan)"}}>合計</div>
          <div className="tool-bar-wrap"></div>
          <div className="tool-tests" style={{fontWeight:700,color:dotColor||"var(--accent-cyan)",fontSize:13}}>{data.reduce((s,d)=>s+d.count,0)}</div>
        </div>}
      </div>
    </div>
  );
}
