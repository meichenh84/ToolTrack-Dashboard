import { useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";

export default function ToolCompletionTrend({ tools }) {
  const { t } = useTranslation();
  const [hi, setHi] = useState(null);
  const [mode, setMode] = useState("month");
  const [viewOffset, setViewOffset] = useState(null);
  const [drag, setDrag] = useState(null);
  const svgRef = useRef(null);

  // ── 1. Monthly base data ──
  const monthly = useMemo(() => {
    const valid = tools.filter(t => t.finish_date?.trim());
    if (!valid.length) return null;
    const parsed = valid.map(t => {
      const d = new Date(t.finish_date.replace(/\//g, "-"));
      return { d, ym: `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}` };
    }).filter(t => !isNaN(t.d.getTime())).sort((a, b) => a.d - b.d);
    if (!parsed.length) return null;

    const retired = tools.filter(t => t.service_end_date?.trim()).map(t => {
      const d = new Date(t.service_end_date.replace(/\//g, "-"));
      return { d, ym: `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}` };
    }).filter(t => !isNaN(t.d.getTime()));

    const months = [];
    const cur = new Date(parsed[0].d.getFullYear(), parsed[0].d.getMonth() - 1);
    const lastData = new Date(parsed.at(-1).d.getFullYear(), parsed.at(-1).d.getMonth());
    const now = new Date(); const nowMonth = new Date(now.getFullYear(), now.getMonth());
    let end = nowMonth > lastData ? nowMonth : lastData;
    retired.forEach(r => { const rm = new Date(r.d.getFullYear(), r.d.getMonth()); if (rm > end) end = rm; });
    while (cur <= end) {
      months.push(`${cur.getFullYear()}/${String(cur.getMonth()+1).padStart(2,"0")}`);
      cur.setMonth(cur.getMonth() + 1);
    }

    const addPerM = {}, retPerM = {};
    parsed.forEach(t => { addPerM[t.ym] = (addPerM[t.ym] || 0) + 1; });
    retired.forEach(t => { retPerM[t.ym] = (retPerM[t.ym] || 0) + 1; });

    let cumAll = 0, cumAct = 0, cumRet = 0;
    return months.map(m => {
      const added = addPerM[m] || 0, removed = retPerM[m] || 0;
      cumAll += added; cumAct += added - removed; cumRet += removed;
      return { m, allCum: cumAll, allAdded: added, actCum: cumAct, actRemoved: removed, retCum: cumRet, retAdded: removed };
    });
  }, [tools]);

  // ── 2. Daily data ──
  const daily = useMemo(() => {
    if (!monthly) return null;
    const fmtKey = d => `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}`;

    const finishDates = tools.filter(t => t.finish_date?.trim()).map(t => t.finish_date);
    const endDates = tools.filter(t => t.service_end_date?.trim()).map(t => t.service_end_date);
    const allDates = [...finishDates, ...endDates].map(s => new Date(s.replace(/\//g, "-"))).filter(d => !isNaN(d.getTime()));
    if (!allDates.length) return null;

    const minDate = new Date(Math.min(...allDates));
    const now = new Date();
    const maxDate = now > new Date(Math.max(...allDates)) ? now : new Date(Math.max(...allDates));
    const start = new Date(minDate); start.setDate(start.getDate() - 1);

    const addPerD = {}, retPerD = {};
    finishDates.forEach(d => { addPerD[d] = (addPerD[d] || 0) + 1; });
    endDates.forEach(d => { retPerD[d] = (retPerD[d] || 0) + 1; });

    const days = [];
    const cur = new Date(start);
    let cumAll = 0, cumAct = 0, cumRet = 0;
    while (cur <= maxDate) {
      const key = fmtKey(cur);
      const added = addPerD[key] || 0, removed = retPerD[key] || 0;
      cumAll += added; cumAct += added - removed; cumRet += removed;
      const lbl = (cur.getDate() === 1)
        ? `${cur.getFullYear()}/${String(cur.getMonth()+1).padStart(2,"0")}/${String(cur.getDate()).padStart(2,"0")}`
        : `${String(cur.getMonth()+1).padStart(2,"0")}/${String(cur.getDate()).padStart(2,"0")}`;
      const full = `${cur.getFullYear()}/${String(cur.getMonth()+1).padStart(2,"0")}/${String(cur.getDate()).padStart(2,"0")}`;
      days.push({ m: lbl, mFull: full, allCum: cumAll, allAdded: added, actCum: cumAct, actRemoved: removed, retCum: cumRet, retAdded: removed });
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }, [tools, monthly]);

  // ── 3. Quarterly ──
  const quarterly = useMemo(() => {
    if (!monthly) return null;
    const map = new Map();
    monthly.forEach(p => {
      const [y, m] = p.m.split("/").map(Number);
      const q = `${y}/Q${Math.ceil(m / 3)}`;
      if (!map.has(q)) map.set(q, { m: q, allCum: 0, allAdded: 0, actCum: 0, actRemoved: 0, retCum: 0, retAdded: 0 });
      const e = map.get(q);
      e.allCum = p.allCum; e.actCum = p.actCum; e.retCum = p.retCum;
      e.allAdded += p.allAdded; e.actRemoved += p.actRemoved; e.retAdded += p.retAdded;
    });
    return [...map.values()];
  }, [monthly]);

  // ── 4. Yearly ──
  const yearly = useMemo(() => {
    if (!monthly) return null;
    const map = new Map();
    monthly.forEach(p => {
      const y = p.m.split("/")[0];
      if (!map.has(y)) map.set(y, { m: y, allCum: 0, allAdded: 0, actCum: 0, actRemoved: 0, retCum: 0, retAdded: 0 });
      const e = map.get(y);
      e.allCum = p.allCum; e.actCum = p.actCum; e.retCum = p.retCum;
      e.allAdded += p.allAdded; e.actRemoved += p.actRemoved; e.retAdded += p.retAdded;
    });
    return [...map.values()];
  }, [monthly]);

  if (!monthly) return null;

  // ── 4. Select data & window ──
  const allData = mode === "day" ? daily : mode === "year" ? yearly : mode === "quarter" ? quarterly : monthly;
  if (!allData) return null;
  const hasRetired = monthly.at(-1).retCum > 0;
  const WIN = mode === "day" ? 45 : mode === "month" ? 14 : mode === "quarter" ? 12 : allData.length;
  const winSize = Math.min(WIN, allData.length);
  const needsNav = allData.length > winSize;
  const maxOff = Math.max(0, allData.length - winSize);
  const off = viewOffset !== null ? Math.min(viewOffset, maxOff) : maxOff;
  const data = needsNav ? allData.slice(off, off + winSize) : allData;
  const n = data.length;

  // ── 5. Layout ──
  const W = 900, chartTop = 20, chartH = 200;
  const chartBot = chartTop + chartH;
  const navTop = chartBot + 30, navBarH = needsNav ? 26 : 0;
  const legendY = navTop + navBarH + (needsNav ? 14 : 0);
  const H = legendY + 14;
  const L = 50, R = 30, cw = W - L - R;

  // ── 6. Scales ──
  const maxY = allData.at(-1).allCum;
  const nM = Math.ceil(maxY / 10) * 10 || 10;
  const sx = i => L + (n > 1 ? i / (n - 1) * cw : cw / 2);
  const sy = v => chartTop + chartH - v / nM * chartH;

  // ── 7. Paths ──
  const mkLine = (key) => data.map((p, i) => `${i ? "L" : "M"}${sx(i).toFixed(1)},${sy(p[key]).toFixed(1)}`).join(" ");
  const lineAll = mkLine("allCum");
  const areaAll = `${lineAll} L${sx(n-1).toFixed(1)},${sy(0).toFixed(1)} L${sx(0).toFixed(1)},${sy(0).toFixed(1)} Z`;
  const lineAct = hasRetired ? mkLine("actCum") : "";
  const lineRet = hasRetired ? mkLine("retCum") : "";

  const yTicks = Array.from({ length: 6 }, (_, i) => Math.round(i * nM / 5));
  const lbl = mode === "day" ? 5 : (n <= 14 ? 1 : n <= 24 ? 2 : 3);

  // ── 8. Hover ──
  const hp = hi !== null && hi < n ? data[hi] : null;
  const hx = hi !== null ? sx(hi) : 0;
  const tipW = 200, tipH = hasRetired ? 64 : 38;
  const tx = hi !== null ? Math.max(L + tipW / 2, Math.min(W - R - tipW / 2, hx)) : 0;
  const tipY = hp ? Math.max(chartTop + 5, sy(hp.allCum) - tipH - 12) : 0;

  // ── 9. Navigator ──
  const navSx = i => L + i / Math.max(1, allData.length - 1) * cw;
  const navSy = v => navTop + navBarH - 2 - v / nM * (navBarH - 6);
  const navLine = allData.map((p, i) => `${i ? "L" : "M"}${navSx(i).toFixed(1)},${navSy(p.allCum).toFixed(1)}`).join(" ");
  const handleX = L + (off / Math.max(1, allData.length - 1)) * cw;
  const handleW = Math.max(12, (winSize / allData.length) * cw);

  // ── 10. Drag ──
  const calcDelta = (e, startX, direction) => {
    const svg = svgRef.current; if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const pxPerPt = (rect.width * cw / W) / allData.length;
    return Math.round((e.clientX - startX) / pxPerPt) * direction;
  };
  const onChartDown = (e) => {
    if (!needsNav) return;
    e.preventDefault();
    svgRef.current?.setPointerCapture(e.pointerId);
    setDrag({ startX: e.clientX, startOff: off, src: "chart" });
    setHi(null);
  };
  const onNavDown = (e) => {
    e.preventDefault();
    e.target.setPointerCapture(e.pointerId);
    setDrag({ startX: e.clientX, startOff: off, src: "nav" });
  };
  const onDragMove = (e) => {
    if (!drag) return;
    const dir = drag.src === "chart" ? -1 : 1;
    const dOff = calcDelta(e, drag.startX, dir);
    setViewOffset(Math.max(0, Math.min(maxOff, drag.startOff + dOff)));
  };
  const onDragEnd = () => setDrag(null);
  const onNavClick = (e) => {
    if (drag) return;
    const svg = svgRef.current; if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgX = (e.clientX - rect.left) / rect.width * W;
    const idx = Math.round((svgX - L) / cw * (allData.length - 1));
    setViewOffset(Math.max(0, Math.min(maxOff, idx - Math.floor(winSize / 2))));
  };

  const activeNow = allData.at(-1).actCum;
  const retiredNow = allData.at(-1).retCum;

  const mBtn = (m) => ({
    padding: "3px 12px", fontSize: 11, fontFamily: "monospace", borderRadius: 4, cursor: "pointer",
    border: `1px solid ${mode === m ? "#00d4ff" : "#2a3a4a"}`,
    background: mode === m ? "rgba(0,212,255,0.15)" : "transparent",
    color: mode === m ? "#00d4ff" : "#7f8c9b",
  });

  return (
    <div className="panel" style={{ animation: "fadeIn .6s ease .1s both" }}>
      <div className="panel-header" style={{ flexWrap: "wrap", gap: 10 }}>
        <div className="panel-title">
          <div className="panel-title-dot" style={{ background: "#00d4ff", boxShadow: "0 0 6px #00d4ff" }} />
          {t("trend.title")}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <button style={mBtn("day")} onClick={() => { setMode("day"); setViewOffset(null); setHi(null); }}>{t("trend.day")}</button>
          <button style={mBtn("month")} onClick={() => { setMode("month"); setViewOffset(null); setHi(null); }}>{t("trend.month")}</button>
          <button style={mBtn("quarter")} onClick={() => { setMode("quarter"); setViewOffset(null); setHi(null); }}>{t("trend.quarter")}</button>
          <button style={mBtn("year")} onClick={() => { setMode("year"); setViewOffset(null); setHi(null); }}>{t("trend.year")}</button>
          <span style={{ width: 1, height: 16, background: "#2a3a4a", margin: "0 4px" }} />
          <span className="panel-badge">{maxY} {t("trend.completed")}</span>
          {hasRetired && <span className="panel-badge" style={{ borderColor: "#00d4ff", color: "#00d4ff" }}>{activeNow} {t("trend.active")}</span>}
          {hasRetired && <span className="panel-badge" style={{ borderColor: "#e17055", color: "#e17055" }}>{retiredNow} {t("trend.retired")}</span>}
        </div>
      </div>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", userSelect: "none" }}
        onMouseLeave={() => { setHi(null); }} onPointerMove={drag ? onDragMove : undefined} onPointerUp={drag ? onDragEnd : undefined} onPointerCancel={drag ? onDragEnd : undefined}>
        <defs>
          <linearGradient id="trendFillAll" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00b894" stopOpacity=".15" />
            <stop offset="100%" stopColor="#00b894" stopOpacity=".02" />
          </linearGradient>
        </defs>

        {/* Y grid */}
        {yTicks.map(v => (
          <g key={v}>
            <line x1={L} y1={sy(v)} x2={W - R} y2={sy(v)} stroke="#1e2d3d" strokeWidth={v ? 0.5 : 1} strokeDasharray={v ? "4,3" : "0"} />
            <text x={L - 10} y={sy(v) + 4} textAnchor="end" fill="#7f8c9b" fontSize="11" fontFamily="monospace">{v}</text>
          </g>
        ))}

        {/* Chart drag area */}
        {needsNav && <rect x={L} y={chartTop} width={cw} height={chartH} fill="transparent"
          onPointerDown={onChartDown} style={{ cursor: drag?.src === "chart" ? "grabbing" : "grab", touchAction: "none" }} />}

        {/* Lines */}
        <path d={areaAll} fill="url(#trendFillAll)" style={{ pointerEvents: "none" }} />
        <path d={lineAll} fill="none" stroke="#00b894" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" style={{ pointerEvents: "none" }} />
        {hasRetired && <path d={lineAct} fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" style={{ pointerEvents: "none" }} />}
        {hasRetired && <path d={lineRet} fill="none" stroke="#e17055" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" style={{ pointerEvents: "none" }} />}

        {/* Points + X labels + hover */}
        {data.map((p, i) => (
          <g key={i}>
            {i % lbl === 0 && <text x={sx(i)} y={chartBot + 16} textAnchor="middle" fill={mode === "day" && p.m.length > 5 ? "#00d4ff" : "#7f8c9b"} fontSize={mode === "day" ? 9 : 10} fontFamily="monospace" fontWeight={mode === "day" && p.m.length > 5 ? "bold" : "normal"}>{p.m}</text>}
            {mode === "day" && i % lbl !== 0 && p.m.length > 5 && <text x={sx(i)} y={chartBot + 16} textAnchor="middle" fill="#00d4ff" fontSize="9" fontFamily="monospace" fontWeight="bold">{p.m}</text>}
            <rect x={sx(i) - cw / n / 2} y={chartTop} width={cw / n} height={chartH} fill="transparent" onMouseEnter={() => { if (!drag) setHi(i); }} style={{ pointerEvents: drag ? "none" : "auto", cursor: needsNav ? "grab" : "crosshair" }} />
            {p.allAdded > 0 && <circle cx={sx(i)} cy={sy(p.allCum)} r={hi === i ? 5 : 3.5} fill={hi === i ? "#55efc4" : "#00b894"} stroke="#0a1929" strokeWidth="2" />}
            {hasRetired && (p.allAdded > 0 || p.actRemoved > 0) && <circle cx={sx(i)} cy={sy(p.actCum)} r={hi === i ? 5 : 3.5} fill={hi === i ? "#74b9ff" : "#00d4ff"} stroke="#0a1929" strokeWidth="2" />}
            {hasRetired && p.retAdded > 0 && <circle cx={sx(i)} cy={sy(p.retCum)} r={hi === i ? 5 : 3.5} fill={hi === i ? "#fab1a0" : "#e17055"} stroke="#0a1929" strokeWidth="2" />}
          </g>
        ))}

        {/* Tooltip (hidden during drag) */}
        {hp && !drag && (
          <g>
            <line x1={hx} y1={chartTop} x2={hx} y2={sy(0)} stroke="#00d4ff" strokeWidth="1" strokeDasharray="3,3" opacity=".4" />
            <circle cx={hx} cy={sy(hp.allCum)} r="5" fill="#55efc4" stroke="#0a1929" strokeWidth="2" />
            {hasRetired && <circle cx={hx} cy={sy(hp.actCum)} r="4" fill="#74b9ff" stroke="#0a1929" strokeWidth="2" />}
            {hasRetired && hp.retCum > 0 && <circle cx={hx} cy={sy(hp.retCum)} r="4" fill="#e17055" stroke="#0a1929" strokeWidth="2" />}
            <rect x={tx - tipW / 2} y={tipY} width={tipW} height={tipH} rx="6" fill="#0f2030" stroke="#1e3a5f" strokeWidth="1" />
            <text x={tx} y={tipY + 15} textAnchor="middle" fill="#00d4ff" fontSize="12" fontWeight="bold">{hp.mFull || hp.m}</text>
            <text x={tx} y={tipY + 30} textAnchor="middle" fill="#00b894" fontSize="11">{`${t("trend.tipAll",{count:hp.allCum})}${hp.allAdded > 0 ? ` (+${hp.allAdded})` : ""}`}</text>
            {hasRetired && <text x={tx} y={tipY + 44} textAnchor="middle" fill="#74b9ff" fontSize="11">{`${t("trend.tipActive",{count:hp.actCum})}${hp.actRemoved > 0 ? ` (-${hp.actRemoved})` : ""}`}</text>}
            {hasRetired && hp.retCum > 0 && <text x={tx} y={tipY + 58} textAnchor="middle" fill="#e17055" fontSize="11">{`${t("trend.tipRetired",{count:hp.retCum})}${hp.retAdded > 0 ? ` (+${hp.retAdded})` : ""}`}</text>}
          </g>
        )}

        {/* Navigator */}
        {needsNav && (
          <g>
            <rect x={L} y={navTop} width={cw} height={navBarH} rx="4" fill="#0a1929" stroke="#1e2d3d" strokeWidth="1" onClick={onNavClick} style={{ cursor: "pointer" }} />
            <path d={navLine} fill="none" stroke="#00b894" strokeWidth="1" opacity=".4" />
            <rect x={handleX} y={navTop + 1} width={Math.max(12, handleW)} height={navBarH - 2} rx="3"
              fill="rgba(0,212,255,0.2)" stroke="#00d4ff" strokeWidth="1"
              onPointerDown={onNavDown}
              style={{ cursor: drag?.src === "nav" ? "grabbing" : "grab", touchAction: "none" }} />
          </g>
        )}

        {/* Legend */}
        <g transform={`translate(${W / 2}, ${legendY})`}>
          <line x1="-150" y1="0" x2="-132" y2="0" stroke="#00b894" strokeWidth="2.5" />
          <text x="-128" y="4" fill="#7f8c9b" fontSize="10">{t("trend.legendAll")}</text>
          {hasRetired && <>
            <line x1="-40" y1="0" x2="-22" y2="0" stroke="#00d4ff" strokeWidth="2" />
            <text x="-18" y="4" fill="#7f8c9b" fontSize="10">{t("trend.legendActive")}</text>
            <line x1="50" y1="0" x2="68" y2="0" stroke="#e17055" strokeWidth="2" />
            <text x="72" y="4" fill="#7f8c9b" fontSize="10">{t("trend.legendRetired")}</text>
          </>}
        </g>
      </svg>
    </div>
  );
}
