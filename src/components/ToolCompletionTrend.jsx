import { useMemo, useState } from "react";

export default function ToolCompletionTrend({ tools }) {
  const [hi, setHi] = useState(null);

  const pts = useMemo(() => {
    const valid = tools.filter(t => t.finish_date?.trim());
    if (!valid.length) return null;
    const parsed = valid.map(t => {
      const d = new Date(t.finish_date.replace(/\//g, "-"));
      return { name: t.name, d, ym: `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}` };
    }).filter(t => !isNaN(t.d)).sort((a, b) => a.d - b.d);
    if (!parsed.length) return null;

    // Continuous month range (one month before first for 0-baseline)
    const months = [];
    const cur = new Date(parsed[0].d.getFullYear(), parsed[0].d.getMonth() - 1);
    const lastData = new Date(parsed.at(-1).d.getFullYear(), parsed.at(-1).d.getMonth());
    const now = new Date(); const nowMonth = new Date(now.getFullYear(), now.getMonth());
    const end = nowMonth > lastData ? nowMonth : lastData;
    while (cur <= end) {
      months.push(`${cur.getFullYear()}/${String(cur.getMonth()+1).padStart(2,"0")}`);
      cur.setMonth(cur.getMonth() + 1);
    }

    const perM = {};
    parsed.forEach(t => { (perM[t.ym] ??= []).push(t.name); });

    let cum = 0;
    return months.map(m => {
      const added = perM[m]?.length || 0;
      cum += added;
      return { m, cum, added, names: perM[m] || [] };
    });
  }, [tools]);

  if (!pts) return null;

  const W = 900, H = 300, P = { t: 20, r: 30, b: 50, l: 50 };
  const cw = W - P.l - P.r, ch = H - P.t - P.b;
  const maxY = pts.at(-1).cum;
  const nM = Math.ceil(maxY / 10) * 10 || 10;
  const n = pts.length;

  const sx = i => P.l + (n > 1 ? i / (n - 1) * cw : cw / 2);
  const sy = v => P.t + ch - v / nM * ch;

  const lineD = pts.map((p, i) => `${i ? "L" : "M"}${sx(i).toFixed(1)},${sy(p.cum).toFixed(1)}`).join(" ");
  const areaD = `${lineD} L${sx(n-1).toFixed(1)},${sy(0).toFixed(1)} L${sx(0).toFixed(1)},${sy(0).toFixed(1)} Z`;

  const yTicks = Array.from({ length: 6 }, (_, i) => Math.round(i * nM / 5));
  const lbl = n <= 14 ? 1 : n <= 24 ? 2 : 3;

  const hp = hi !== null ? pts[hi] : null;
  const hx = hi !== null ? sx(hi) : 0;
  const tipW = 150;
  const tx = hi !== null ? Math.max(P.l + tipW / 2, Math.min(W - P.r - tipW / 2, hx)) : 0;
  const tipY = hp ? Math.max(P.t + 5, sy(hp.cum) - 50) : 0;

  return (
    <div className="panel" style={{ animation: "fadeIn .6s ease .1s both" }}>
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-title-dot" style={{ background: "#00d4ff", boxShadow: "0 0 6px #00d4ff" }} />
          工具完成上線趨勢
        </div>
        <span className="panel-badge">{maxY} tools completed</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }} onMouseLeave={() => setHi(null)}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00b894" stopOpacity=".25" />
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

        {/* Area + Line */}
        <path d={areaD} fill="url(#trendFill)" />
        <path d={lineD} fill="none" stroke="#00b894" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* Points, X labels, hover zones */}
        {pts.map((p, i) => (
          <g key={i}>
            {i % lbl === 0 && (
              <text x={sx(i)} y={H - P.b + 18} textAnchor="middle" fill="#7f8c9b" fontSize="10" fontFamily="monospace">{p.m}</text>
            )}
            <rect x={sx(i) - cw / n / 2} y={P.t} width={cw / n} height={ch} fill="transparent"
              onMouseEnter={() => setHi(i)} style={{ cursor: "crosshair" }} />
            {p.added > 0 && (
              <circle cx={sx(i)} cy={sy(p.cum)} r={hi === i ? 5 : 3.5} fill={hi === i ? "#00d4ff" : "#00b894"}
                stroke="#0a1929" strokeWidth="2" style={{ transition: "r .15s" }} />
            )}
          </g>
        ))}

        {/* Tooltip */}
        {hp && (
          <g>
            <line x1={hx} y1={P.t} x2={hx} y2={sy(0)} stroke="#00d4ff" strokeWidth="1" strokeDasharray="3,3" opacity=".4" />
            <circle cx={hx} cy={sy(hp.cum)} r="5" fill="#00d4ff" stroke="#0a1929" strokeWidth="2" />
            <rect x={tx - tipW / 2} y={tipY} width={tipW} height="38" rx="6" fill="#0f2030" stroke="#1e3a5f" strokeWidth="1" />
            <text x={tx} y={tipY + 15} textAnchor="middle" fill="#00d4ff" fontSize="12" fontWeight="bold">{hp.m}</text>
            <text x={tx} y={tipY + 30} textAnchor="middle" fill="#b0bec5" fontSize="11">
              {`累計 ${hp.cum}${hp.added > 0 ? ` | +${hp.added}` : ""}`}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
