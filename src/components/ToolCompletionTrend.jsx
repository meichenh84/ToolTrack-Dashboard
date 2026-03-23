import { useMemo, useState } from "react";

export default function ToolCompletionTrend({ tools }) {
  const [hi, setHi] = useState(null);

  const { pts, actPts, retPts, hasRetired } = useMemo(() => {
    const valid = tools.filter(t => t.finish_date?.trim());
    if (!valid.length) return { pts: null, actPts: null, retPts: null, hasRetired: false };
    const parsed = valid.map(t => {
      const d = new Date(t.finish_date.replace(/\//g, "-"));
      return { name: t.name, d, ym: `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}` };
    }).filter(t => !isNaN(t.d)).sort((a, b) => a.d - b.d);
    if (!parsed.length) return { pts: null, actPts: null, retPts: null, hasRetired: false };

    const retired = tools.filter(t => t.service_end_date?.trim()).map(t => {
      const d = new Date(t.service_end_date.replace(/\//g, "-"));
      return { name: t.name, d, ym: `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}` };
    }).filter(t => !isNaN(t.d)).sort((a, b) => a.d - b.d);

    const months = [];
    const cur = new Date(parsed[0].d.getFullYear(), parsed[0].d.getMonth() - 1);
    const lastData = new Date(parsed.at(-1).d.getFullYear(), parsed.at(-1).d.getMonth());
    const now = new Date(); const nowMonth = new Date(now.getFullYear(), now.getMonth());
    let end = nowMonth > lastData ? nowMonth : lastData;
    if (retired.length) {
      const lastRet = new Date(retired.at(-1).d.getFullYear(), retired.at(-1).d.getMonth());
      if (lastRet > end) end = lastRet;
    }
    while (cur <= end) {
      months.push(`${cur.getFullYear()}/${String(cur.getMonth()+1).padStart(2,"0")}`);
      cur.setMonth(cur.getMonth() + 1);
    }

    const addPerM = {};
    parsed.forEach(t => { (addPerM[t.ym] ??= []).push(t.name); });
    const retPerM = {};
    retired.forEach(t => { (retPerM[t.ym] ??= []).push(t.name); });

    // Line 1: total completed
    let cumAll = 0;
    const allPts = months.map(m => {
      const added = addPerM[m]?.length || 0;
      cumAll += added;
      return { m, cum: cumAll, added };
    });

    // Line 2: active = completed - retired
    let cumAdd = 0, cumRet = 0;
    const activePts = months.map(m => {
      cumAdd += addPerM[m]?.length || 0;
      cumRet += retPerM[m]?.length || 0;
      return { m, cum: cumAdd - cumRet, added: addPerM[m]?.length || 0, removed: retPerM[m]?.length || 0 };
    });

    // Line 3: retired cumulative
    let cumR = 0;
    const retiredPts = months.map(m => {
      const removed = retPerM[m]?.length || 0;
      cumR += removed;
      return { m, cum: cumR, removed };
    });

    return { pts: allPts, actPts: cumRet > 0 ? activePts : null, retPts: cumRet > 0 ? retiredPts : null, hasRetired: cumRet > 0 };
  }, [tools]);

  if (!pts) return null;

  const W = 900, H = 320, P = { t: 20, r: 30, b: 70, l: 50 };
  const cw = W - P.l - P.r, ch = H - P.t - P.b;
  const maxY = pts.at(-1).cum;
  const nM = Math.ceil(maxY / 10) * 10 || 10;
  const n = pts.length;

  const sx = i => P.l + (n > 1 ? i / (n - 1) * cw : cw / 2);
  const sy = v => P.t + ch - v / nM * ch;

  const mkLine = (data) => data.map((p, i) => `${i ? "L" : "M"}${sx(i).toFixed(1)},${sy(p.cum).toFixed(1)}`).join(" ");
  const mkArea = (lineD) => `${lineD} L${sx(n-1).toFixed(1)},${sy(0).toFixed(1)} L${sx(0).toFixed(1)},${sy(0).toFixed(1)} Z`;

  const lineAll = mkLine(pts);
  const areaAll = mkArea(lineAll);
  const lineAct = actPts ? mkLine(actPts) : "";
  const lineRet = retPts ? mkLine(retPts) : "";

  const yTicks = Array.from({ length: 6 }, (_, i) => Math.round(i * nM / 5));
  const lbl = n <= 14 ? 1 : n <= 24 ? 2 : 3;

  const hp = hi !== null ? pts[hi] : null;
  const ap = hi !== null && actPts ? actPts[hi] : null;
  const rp = hi !== null && retPts ? retPts[hi] : null;
  const hx = hi !== null ? sx(hi) : 0;
  const tipW = 200;
  const tx = hi !== null ? Math.max(P.l + tipW / 2, Math.min(W - P.r - tipW / 2, hx)) : 0;
  const tipH = hasRetired ? 64 : 38;
  const tipY = hp ? Math.max(P.t + 5, sy(hp.cum) - tipH - 12) : 0;

  const activeNow = actPts ? actPts.at(-1).cum : maxY;
  const retiredNow = retPts ? retPts.at(-1).cum : 0;

  // Legend position: below X-axis labels
  const legendY = H - 18;

  return (
    <div className="panel" style={{ animation: "fadeIn .6s ease .1s both" }}>
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-title-dot" style={{ background: "#00d4ff", boxShadow: "0 0 6px #00d4ff" }} />
          工具完成上線趨勢
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span className="panel-badge">{maxY} completed</span>
          {hasRetired && <span className="panel-badge" style={{ borderColor: "#00d4ff", color: "#00d4ff" }}>{activeNow} active</span>}
          {hasRetired && <span className="panel-badge" style={{ borderColor: "#e17055", color: "#e17055" }}>{retiredNow} retired</span>}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }} onMouseLeave={() => setHi(null)}>
        <defs>
          <linearGradient id="trendFillAll" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00b894" stopOpacity=".15" />
            <stop offset="100%" stopColor="#00b894" stopOpacity=".02" />
          </linearGradient>
        </defs>

        {/* Y grid & labels */}
        {yTicks.map(v => (
          <g key={v}>
            <line x1={P.l} y1={sy(v)} x2={W - P.r} y2={sy(v)} stroke="#1e2d3d" strokeWidth={v ? 0.5 : 1} strokeDasharray={v ? "4,3" : "0"} />
            <text x={P.l - 10} y={sy(v) + 4} textAnchor="end" fill="#7f8c9b" fontSize="11" fontFamily="monospace">{v}</text>
          </g>
        ))}

        {/* Area + Line: total completed */}
        <path d={areaAll} fill="url(#trendFillAll)" />
        <path d={lineAll} fill="none" stroke="#00b894" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* Line: active (net) */}
        {actPts && <path d={lineAct} fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}

        {/* Line: retired cumulative */}
        {retPts && <path d={lineRet} fill="none" stroke="#e17055" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}

        {/* Points, X labels, hover zones */}
        {pts.map((p, i) => (
          <g key={i}>
            {i % lbl === 0 && (
              <text x={sx(i)} y={H - P.b + 18} textAnchor="middle" fill="#7f8c9b" fontSize="10" fontFamily="monospace">{p.m}</text>
            )}
            <rect x={sx(i) - cw / n / 2} y={P.t} width={cw / n} height={ch} fill="transparent"
              onMouseEnter={() => setHi(i)} style={{ cursor: "crosshair" }} />
            {p.added > 0 && (
              <circle cx={sx(i)} cy={sy(p.cum)} r={hi === i ? 5 : 3.5} fill={hi === i ? "#55efc4" : "#00b894"}
                stroke="#0a1929" strokeWidth="2" style={{ transition: "r .15s" }} />
            )}
            {actPts && (actPts[i].added > 0 || actPts[i].removed > 0) && (
              <circle cx={sx(i)} cy={sy(actPts[i].cum)} r={hi === i ? 5 : 3.5} fill={hi === i ? "#74b9ff" : "#00d4ff"}
                stroke="#0a1929" strokeWidth="2" style={{ transition: "r .15s" }} />
            )}
            {retPts && retPts[i].removed > 0 && (
              <circle cx={sx(i)} cy={sy(retPts[i].cum)} r={hi === i ? 5 : 3.5} fill={hi === i ? "#fab1a0" : "#e17055"}
                stroke="#0a1929" strokeWidth="2" style={{ transition: "r .15s" }} />
            )}
          </g>
        ))}

        {/* Tooltip */}
        {hp && (
          <g>
            <line x1={hx} y1={P.t} x2={hx} y2={sy(0)} stroke="#00d4ff" strokeWidth="1" strokeDasharray="3,3" opacity=".4" />
            <circle cx={hx} cy={sy(hp.cum)} r="5" fill="#55efc4" stroke="#0a1929" strokeWidth="2" />
            {ap && <circle cx={hx} cy={sy(ap.cum)} r="4" fill="#74b9ff" stroke="#0a1929" strokeWidth="2" />}
            {rp && rp.cum > 0 && <circle cx={hx} cy={sy(rp.cum)} r="4" fill="#e17055" stroke="#0a1929" strokeWidth="2" />}
            <rect x={tx - tipW / 2} y={tipY} width={tipW} height={tipH} rx="6" fill="#0f2030" stroke="#1e3a5f" strokeWidth="1" />
            <text x={tx} y={tipY + 15} textAnchor="middle" fill="#00d4ff" fontSize="12" fontWeight="bold">{hp.m}</text>
            <text x={tx} y={tipY + 30} textAnchor="middle" fill="#00b894" fontSize="11">
              {`全部上線 ${hp.cum}${hp.added > 0 ? ` (+${hp.added})` : ""}`}
            </text>
            {ap && (
              <text x={tx} y={tipY + 44} textAnchor="middle" fill="#74b9ff" fontSize="11">
                {`服役中 ${ap.cum}${ap.removed > 0 ? ` (-${ap.removed})` : ""}`}
              </text>
            )}
            {rp && rp.cum > 0 && (
              <text x={tx} y={tipY + 58} textAnchor="middle" fill="#e17055" fontSize="11">
                {`已退役 ${rp.cum}${rp.removed > 0 ? ` (+${rp.removed})` : ""}`}
              </text>
            )}
          </g>
        )}

        {/* Legend - below X-axis */}
        <g transform={`translate(${W / 2}, ${legendY})`}>
          <line x1="-150" y1="0" x2="-132" y2="0" stroke="#00b894" strokeWidth="2.5" />
          <text x="-128" y="4" fill="#7f8c9b" fontSize="10">全部上線累計</text>
          <line x1="-40" y1="0" x2="-22" y2="0" stroke="#00d4ff" strokeWidth="2" />
          <text x="-18" y="4" fill="#7f8c9b" fontSize="10">扣除退役</text>
          <line x1="50" y1="0" x2="68" y2="0" stroke="#e17055" strokeWidth="2" />
          <text x="72" y="4" fill="#7f8c9b" fontSize="10">退役累計</text>
        </g>
      </svg>
    </div>
  );
}
