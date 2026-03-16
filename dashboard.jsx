import { useState, useEffect, useRef, useMemo } from "react";

// ══════════════════════════════════════════════════════════════════════════════
// TOOLS DATA — 16 tools across 3 sites
// ══════════════════════════════════════════════════════════════════════════════

const TOOLS = [
  // ── TPE (10 tools) ──
  { id:"tpe-1",  name:"TPE Tool 1",  v:"2.3.0", cat:"HW", site:"TPE", team:"Monitor Team", unit:"HW Q",
    dev:{name:"王建民",email:"jm.wang@company.com",ext:"2501"}, hasReport:true, uses:6 },
  { id:"tpe-2",  name:"TPE Tool 2",  v:"1.2.0", cat:"HW", site:"TPE", team:"Monitor Team", unit:"HW Q",
    dev:{name:"王建民",email:"jm.wang@company.com",ext:"2501"}, hasReport:false, uses:3 },
  { id:"tpe-3",  name:"TPE Tool 3",  v:"1.0.0", cat:"HW", site:"TPE", team:"Monitor Team", unit:"HW Q",
    dev:{name:"王建民",email:"jm.wang@company.com",ext:"2501"}, hasReport:true, uses:0 },
  { id:"tpe-4",  name:"TPE Tool 4",  v:"3.1.0", cat:"SW", site:"TPE", team:"Monitor Team", unit:"SW Q",
    dev:{name:"林雅婷",email:"yt.lin@company.com",ext:"2502"}, hasReport:true, uses:5 },
  { id:"tpe-5",  name:"TPE Tool 5",  v:"1.0.5", cat:"SW", site:"TPE", team:"Monitor Team", unit:"SW Q",
    dev:{name:"林雅婷",email:"yt.lin@company.com",ext:"2502"}, hasReport:false, uses:3 },
  { id:"tpe-6",  name:"TPE Tool 6",  v:"2.0.1", cat:"HW", site:"TPE", team:"TV Team", unit:"HW Q",
    dev:{name:"張志偉",email:"cw.chang@company.com",ext:"2601"}, hasReport:true, uses:4 },
  { id:"tpe-7",  name:"TPE Tool 7",  v:"1.5.0", cat:"HW", site:"TPE", team:"TV Team", unit:"HW Q",
    dev:{name:"張志偉",email:"cw.chang@company.com",ext:"2601"}, hasReport:true, uses:3 },
  { id:"tpe-8",  name:"TPE Tool 8",  v:"2.2.0", cat:"SW", site:"TPE", team:"TV Team", unit:"SW Q",
    dev:{name:"陳怡君",email:"yc.chen@company.com",ext:"2602"}, hasReport:true, uses:5 },
  { id:"tpe-9",  name:"TPE Tool 9",  v:"1.3.0", cat:"SW", site:"TPE", team:"TV Team", unit:"SW Q",
    dev:{name:"陳怡君",email:"yc.chen@company.com",ext:"2602"}, hasReport:true, uses:3 },
  { id:"tpe-10", name:"TPE Tool 10", v:"1.0.0", cat:"SW", site:"TPE", team:"TV Team", unit:"SW Q",
    dev:{name:"陳怡君",email:"yc.chen@company.com",ext:"2602"}, hasReport:false, uses:2 },
  // ── XM (10 tools) ──
  { id:"xm-1",  name:"XM Tool 1",  v:"1.8.0", cat:"HW", site:"XM", team:"TV Team", unit:"HW Q",
    dev:{name:"李明華",email:"mh.li@company.com",ext:"3501"}, hasReport:true, uses:4 },
  { id:"xm-2",  name:"XM Tool 2",  v:"2.0.0", cat:"SW", site:"XM", team:"TV Team", unit:"SW Q",
    dev:{name:"黃雅琪",email:"yc.huang@company.com",ext:"3502"}, hasReport:true, uses:3 },
  { id:"xm-3",  name:"XM Tool 3",  v:"0.9.0", cat:"SW", site:"XM", team:"TV Team", unit:"SW Q",
    dev:{name:"黃雅琪",email:"yc.huang@company.com",ext:"3502"}, hasReport:true, uses:0 },
  { id:"xm-4",  name:"XM Tool 4",  v:"1.1.0", cat:"SW", site:"XM", team:"TV Team", unit:"SW Q",
    dev:{name:"黃雅琪",email:"yc.huang@company.com",ext:"3502"}, hasReport:true, uses:3 },
  { id:"xm-5",  name:"XM Tool 5",  v:"1.4.0", cat:"HW", site:"XM", team:"TV Team", unit:"HW Q",
    dev:{name:"李明華",email:"mh.li@company.com",ext:"3501"}, hasReport:true, uses:2 },
  { id:"xm-6",  name:"XM Tool 6",  v:"2.1.0", cat:"HW", site:"XM", team:"TV Team", unit:"HW Q",
    dev:{name:"李明華",email:"mh.li@company.com",ext:"3501"}, hasReport:false, uses:4 },
  { id:"xm-7",  name:"XM Tool 7",  v:"1.6.0", cat:"SW", site:"XM", team:"TV Team", unit:"SW Q",
    dev:{name:"黃雅琪",email:"yc.huang@company.com",ext:"3502"}, hasReport:true, uses:3 },
  { id:"xm-8",  name:"XM Tool 8",  v:"1.0.1", cat:"SW", site:"XM", team:"TV Team", unit:"SW Q",
    dev:{name:"黃雅琪",email:"yc.huang@company.com",ext:"3502"}, hasReport:false, uses:1 },
  { id:"xm-9",  name:"XM Tool 9",  v:"2.3.0", cat:"HW", site:"XM", team:"TV Team", unit:"HW Q",
    dev:{name:"李明華",email:"mh.li@company.com",ext:"3501"}, hasReport:true, uses:5 },
  { id:"xm-10", name:"XM Tool 10", v:"1.2.0", cat:"SW", site:"XM", team:"TV Team", unit:"SW Q",
    dev:{name:"黃雅琪",email:"yc.huang@company.com",ext:"3502"}, hasReport:true, uses:0 },
  // ── FQ (10 tools) ──
  { id:"fq-1",  name:"FQ Tool 1",  v:"2.5.0", cat:"HW", site:"FQ", team:"Monitor Team", unit:"HW Q",
    dev:{name:"吳俊傑",email:"cj.wu@company.com",ext:"4501"}, hasReport:true, uses:3 },
  { id:"fq-2",  name:"FQ Tool 2",  v:"1.0.0", cat:"HW", site:"FQ", team:"Monitor Team", unit:"HW Q",
    dev:{name:"吳俊傑",email:"cj.wu@company.com",ext:"4501"}, hasReport:true, uses:2 },
  { id:"fq-3",  name:"FQ Tool 3",  v:"1.0.2", cat:"SW", site:"FQ", team:"Monitor Team", unit:"SW Q",
    dev:{name:"趙美玲",email:"ml.zhao@company.com",ext:"4502"}, hasReport:false, uses:1 },
  { id:"fq-4",  name:"FQ Tool 4",  v:"1.3.0", cat:"HW", site:"FQ", team:"Monitor Team", unit:"HW Q",
    dev:{name:"吳俊傑",email:"cj.wu@company.com",ext:"4501"}, hasReport:true, uses:4 },
  { id:"fq-5",  name:"FQ Tool 5",  v:"2.0.0", cat:"SW", site:"FQ", team:"Monitor Team", unit:"SW Q",
    dev:{name:"趙美玲",email:"ml.zhao@company.com",ext:"4502"}, hasReport:true, uses:2 },
  { id:"fq-6",  name:"FQ Tool 6",  v:"1.5.0", cat:"HW", site:"FQ", team:"Monitor Team", unit:"HW Q",
    dev:{name:"吳俊傑",email:"cj.wu@company.com",ext:"4501"}, hasReport:false, uses:3 },
  { id:"fq-7",  name:"FQ Tool 7",  v:"1.1.0", cat:"SW", site:"FQ", team:"Monitor Team", unit:"SW Q",
    dev:{name:"趙美玲",email:"ml.zhao@company.com",ext:"4502"}, hasReport:true, uses:1 },
  { id:"fq-8",  name:"FQ Tool 8",  v:"2.2.0", cat:"HW", site:"FQ", team:"Monitor Team", unit:"HW Q",
    dev:{name:"吳俊傑",email:"cj.wu@company.com",ext:"4501"}, hasReport:true, uses:5 },
  { id:"fq-9",  name:"FQ Tool 9",  v:"0.8.0", cat:"SW", site:"FQ", team:"Monitor Team", unit:"SW Q",
    dev:{name:"趙美玲",email:"ml.zhao@company.com",ext:"4502"}, hasReport:true, uses:0 },
  { id:"fq-10", name:"FQ Tool 10", v:"1.4.0", cat:"SW", site:"FQ", team:"Monitor Team", unit:"SW Q",
    dev:{name:"趙美玲",email:"ml.zhao@company.com",ext:"4502"}, hasReport:false, uses:2 },
];

// ── Site testers ──
const SITE_TESTERS = {
  TPE: ["陳小明","李佳芸","黃志強","周雅萍"],
  XM: ["劉偉明","何美芳"],
  FQ: ["鄭建國","許淑惠"],
};

// ── Result patterns per tool (deterministic) ──
const RES_PAT = {
  "tpe-1":["pass","pass","pass","pass","warning","pass"],
  "tpe-4":["pass","pass","fail","pass","pass"],
  "tpe-6":["pass","pass","warning","pass"],
  "tpe-7":["pass","fail","pass"],
  "tpe-8":["pass","fail","pass","pass","warning"],
  "tpe-9":["pass","warning","pass"],
  "xm-1":["pass","pass","fail","pass"],
  "xm-2":["pass","warning","pass"],
  "xm-4":["pass","fail","pass"],
  "xm-5":["pass","pass","warning"],
  "xm-7":["pass","pass","fail"],
  "xm-9":["pass","fail","pass","pass","warning"],
  "fq-1":["pass","pass","warning"],
  "fq-2":["pass","fail"],
  "fq-4":["pass","pass","fail","pass"],
  "fq-5":["pass","warning"],
  "fq-7":["pass"],
  "fq-8":["pass","fail","pass","pass","warning"],
};
const ITEM_DURS = ["0.3s","1.2s","2.8s","0.8s","1.5s","0.9s","1.1s","3.4s","0.6s","60s"];

// ══════════════════════════════════════════════════════════════════════════════
// LOG BLUEPRINT — single source of truth for all data
// { toolId: { site: { year: { month: count } } } }
// ══════════════════════════════════════════════════════════════════════════════

const LOG_BLUEPRINT = {
  // ── TPE tools ──
  "tpe-1": {
    TPE: { 2025: {1:3,2:2,3:4,5:1,6:3,7:2,8:5,9:2,10:3,11:1,12:4}, 2026: {1:3,2:2,3:1} },
    XM:  { 2025: {3:1,7:1,11:1}, 2026: {1:1} },
    FQ:  { 2025: {6:1,12:1}, 2026: {2:1} },
  },
  "tpe-2": {
    TPE: { 2025: {3:1,4:2,6:1,9:1,11:2}, 2026: {1:1,3:2} },
  },
  "tpe-3": {},
  "tpe-4": {
    TPE: { 2025: {1:4,2:3,3:5,4:2,5:6,6:3,7:4,8:2,9:5,10:3,11:4,12:2}, 2026: {1:5,2:3,3:4} },
    XM:  { 2025: {2:1,5:2,9:1}, 2026: {1:1,3:2} },
    FQ:  { 2025: {4:1,10:1}, 2026: {2:1,3:1} },
  },
  "tpe-5": {
    TPE: { 2025: {2:1,5:2,8:1,11:1}, 2026: {2:1} },
  },
  "tpe-6": {
    TPE: { 2025: {1:2,3:3,4:1,6:2,7:1,9:3,10:2,12:1}, 2026: {1:2,2:1,3:3} },
    FQ:  { 2025: {3:1,9:1}, 2026: {1:1,3:1} },
  },
  "tpe-7": {
    TPE: { 2025: {2:1,4:2,6:1,8:3,10:1,12:2}, 2026: {1:1,3:2} },
  },
  "tpe-8": {
    TPE: { 2025: {1:3,2:2,3:4,4:1,5:3,6:2,7:5,8:1,9:3,10:2,11:4,12:3}, 2026: {1:3,2:2,3:5} },
    XM:  { 2025: {5:1,11:1}, 2026: {3:1} },
    FQ:  { 2025: {8:1}, 2026: {2:1} },
  },
  "tpe-9": {
    TPE: { 2025: {1:1,3:2,5:1,7:3,9:1,11:2}, 2026: {1:2,3:1} },
  },
  "tpe-10": {
    TPE: { 2025: {2:1,4:1,7:2,10:1}, 2026: {1:1,3:1} },
  },
  // ── XM tools ──
  "xm-1": {
    XM:  { 2025: {2:2,3:1,5:3,7:1,8:2,10:1,11:3}, 2026: {1:2,2:1,3:2} },
    TPE: { 2025: {4:1,10:1}, 2026: {1:1,3:1} },
    FQ:  { 2025: {7:1}, 2026: {2:1} },
  },
  "xm-2": {
    XM: { 2025: {1:1,4:2,5:1,8:3,9:1,12:2}, 2026: {2:1,3:2} },
  },
  "xm-3": {},
  "xm-4": {
    XM: { 2025: {3:2,5:1,7:3,9:1,11:2}, 2026: {1:1,3:2} },
  },
  "xm-5": {
    XM: { 2025: {1:1,3:2,6:1,9:2,12:1}, 2026: {2:1} },
  },
  "xm-6": {
    XM:  { 2025: {2:3,4:1,5:2,7:1,8:3,10:2,11:1,12:2}, 2026: {1:2,2:1,3:1} },
    TPE: { 2025: {6:1}, 2026: {2:1} },
    FQ:  { 2025: {4:1,10:1}, 2026: {1:1,3:1} },
  },
  "xm-7": {
    XM: { 2025: {1:2,3:1,6:3,8:1,10:2,12:1}, 2026: {1:1,3:2} },
  },
  "xm-8": {
    XM: { 2025: {4:1,9:1}, 2026: {2:1} },
  },
  "xm-9": {
    XM:  { 2025: {1:3,2:2,3:4,5:2,6:1,7:3,8:2,9:1,10:3,11:2,12:4}, 2026: {1:3,2:2,3:1} },
    TPE: { 2025: {3:1,6:1,11:1}, 2026: {1:1,3:2} },
    FQ:  { 2025: {5:1}, 2026: {2:1} },
  },
  "xm-10": {},
  // ── FQ tools ──
  "fq-1": {
    FQ: { 2025: {1:2,2:1,4:3,5:1,7:2,8:1,10:3,11:1}, 2026: {1:2,2:1} },
  },
  "fq-2": {
    FQ: { 2025: {3:1,6:2,9:1,12:1}, 2026: {2:1} },
  },
  "fq-3": {
    FQ: { 2025: {5:1,10:1}, 2026: {3:1} },
  },
  "fq-4": {
    FQ:  { 2025: {1:2,3:1,4:2,6:3,8:1,10:2,12:1}, 2026: {1:1,2:2,3:1} },
    TPE: { 2025: {5:1}, 2026: {1:1} },
    XM:  { 2025: {6:1,12:1}, 2026: {2:1,3:1} },
  },
  "fq-5": {
    FQ: { 2025: {2:1,5:2,8:1,11:1}, 2026: {1:1} },
  },
  "fq-6": {
    FQ: { 2025: {1:1,3:2,5:1,7:3,9:1,11:2}, 2026: {2:1,3:2} },
  },
  "fq-7": {
    FQ: { 2025: {4:1,10:1}, 2026: {3:1} },
  },
  "fq-8": {
    FQ:  { 2025: {1:3,2:2,3:1,5:4,6:2,7:1,8:3,9:2,10:1,11:3,12:2}, 2026: {1:2,2:3,3:1} },
    TPE: { 2025: {3:1,9:1}, 2026: {1:1,3:1} },
    XM:  { 2025: {7:1}, 2026: {2:1} },
  },
  "fq-9": {},
  "fq-10": {
    FQ: { 2025: {3:1,6:1,9:2,12:1}, 2026: {1:1} },
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// GENERATE LOGS from blueprint (single source of truth)
// ══════════════════════════════════════════════════════════════════════════════

const ALL_LOGS = (() => {
  const logs = [];
  let idx = 0;
  TOOLS.forEach(tool => {
    const bp = LOG_BLUEPRINT[tool.id] || {};
    const pat = RES_PAT[tool.id];
    Object.entries(bp).forEach(([site, years]) => {
      Object.entries(years).forEach(([year, months]) => {
        Object.entries(months).forEach(([month, count]) => {
          for (let j = 0; j < count; j++) {
            const testers = SITE_TESTERS[site];
            const day = 3 + ((idx * 7 + j * 11) % 25);
            const hour = 8 + (idx * 3) % 10;
            const min = (idx * 17) % 60;
            const d = new Date(+year, +month - 1, day, hour, min);
            logs.push({
              toolId: tool.id, toolName: tool.name, cat: tool.cat,
              filename: `${tool.id}_${site.toLowerCase()}_${String(idx+1).padStart(3,"0")}.log`,
              site, team: tool.team, unit: tool.unit,
              testItem: "—",
              tester: testers[idx % testers.length],
              time: d.getTime(),
              timeStr: `${year}/${String(+month).padStart(2,"0")}/${String(day).padStart(2,"0")} ${String(hour).padStart(2,"0")}:${String(min).padStart(2,"0")}`,
              result: tool.hasReport && pat ? pat[idx % pat.length] : null,
              dur: tool.hasReport ? `${((idx*7+3)%50/10+1).toFixed(1)}h` : "—",
            });
            idx++;
          }
        });
      });
    });
  });
  return logs.sort((a,b) => b.time - a.time).map((l,i) => ({...l, id:i+1}));
})();

// ══════════════════════════════════════════════════════════════════════════════
// YEARLY USAGE — computed from ALL_LOGS (not hardcoded)
// ══════════════════════════════════════════════════════════════════════════════

const TOOL_MONTHLY_USAGE = (() => {
  const map = {};
  ALL_LOGS.forEach(l => {
    const d = new Date(l.time);
    const y = d.getFullYear(), m = d.getMonth();
    const k = `${l.toolId}_${y}_${m}`;
    map[k] = (map[k] || 0) + 1;
  });
  const result = {};
  [2025, 2026, 2027].forEach(year => {
    result[year] = {};
    TOOLS.forEach(tool => {
      result[year][tool.id] = Array.from({length:12}, (_, i) => map[`${tool.id}_${year}_${i}`] || 0);
    });
  });
  return result;
})();

// ══════════════════════════════════════════════════════════════════════════════
// RANKINGS (computed once)
// ══════════════════════════════════════════════════════════════════════════════

function rank(arr, key, filterFn = () => true) {
  const m = {};
  arr.filter(filterFn).forEach(l => { m[typeof key==="function"?key(l):l[key]] = (m[typeof key==="function"?key(l):l[key]]||0)+1; });
  return Object.entries(m).map(([n,c])=>({name:n,count:c})).sort((a,b)=>b.count-a.count);
}

const ONE_MONTH_AGO = Date.now() - 30 * 24 * 3600000;
const RECENT_LOGS = ALL_LOGS.filter(l => l.time >= ONE_MONTH_AGO);

function rankToolUsage(logs, tools) {
  const m = {};
  tools.forEach(t => { m[t.name] = 0; });
  const toolNames = new Set(tools.map(t=>t.name));
  logs.filter(l=>toolNames.has(l.toolName)).forEach(l => { m[l.toolName] = (m[l.toolName]||0) + 1; });
  return Object.entries(m).map(([n,c])=>({name:n,count:c})).sort((a,b)=>b.count-a.count);
}

const SITES = ["TPE","XM","FQ"];
function rankToolBySite(site, tools, logs) {
  const m = {};
  tools.forEach(t => { m[t.name] = 0; });
  const toolNames = new Set(tools.map(t=>t.name));
  logs.filter(l=>l.site===site&&toolNames.has(l.toolName)).forEach(l => { m[l.toolName] = (m[l.toolName]||0) + 1; });
  return Object.entries(m).map(([n,c])=>({name:n,count:c})).sort((a,b)=>b.count-a.count);
}

function computeRankings(tools) {
  const toolIds = new Set(tools.map(t=>t.id));
  const activeLogs = ALL_LOGS.filter(l=>toolIds.has(l.toolId));
  const recentActive = activeLogs.filter(l=>l.time>=ONE_MONTH_AGO);
  return {
    recentToolUsage:  rankToolUsage(recentActive, tools),
    recentSiteUsage:  rank(recentActive, "site"),
    recentToolBySite: Object.fromEntries(SITES.map(s=>[s, rankToolBySite(s, tools, recentActive)])),
    totalToolBySite:  Object.fromEntries(SITES.map(s=>[s, rankToolBySite(s, tools, activeLogs)])),
    toolFails:        tools.filter(t=>t.hasReport).map(t=>({
                        name:t.name,
                        count:activeLogs.filter(l=>l.toolId===t.id&&l.result==="fail").length,
                      })).sort((a,b)=>b.count-a.count),
    testerUploads:    rank(activeLogs, "tester"),
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// CSS
// ══════════════════════════════════════════════════════════════════════════════

function GlobalCSS(){return<style>{`
:root{--bg-deep:#050b12;--bg-panel:#090f18;--bg-card:#0d1620;--bg-elevated:#111c2a;
--border:#1a2d42;--border-bright:#1e3a55;
--accent-cyan:#00d4ff;--accent-teal:#00b894;--accent-amber:#f39c12;--accent-red:#e74c3c;--accent-blue:#3498db;
--text-primary:#f0f6fc;--text-secondary:#a8c8e8;--text-muted:#6889a8;
--glow-cyan:0 0 20px rgba(0,212,255,0.3)}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg-deep);color:var(--text-primary);font-family:'DM Mono',monospace;min-height:100vh;overflow-x:hidden;
background-image:radial-gradient(ellipse at 10% 20%,rgba(0,212,255,0.04) 0%,transparent 50%),radial-gradient(ellipse at 90% 80%,rgba(0,184,148,0.04) 0%,transparent 50%),repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(26,45,66,0.3) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(26,45,66,0.15) 40px)}
.header{display:flex;align-items:center;justify-content:space-between;padding:20px 36px;border-bottom:1px solid var(--border);background:rgba(9,15,24,0.95);backdrop-filter:blur(12px);position:sticky;top:0;z-index:100;animation:slideDown .5s ease}
@keyframes slideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}
.logo{display:flex;align-items:center;gap:12px}
.logo-icon{width:36px;height:36px;border:2px solid var(--accent-cyan);border-radius:6px;display:flex;align-items:center;justify-content:center;box-shadow:var(--glow-cyan)}
.logo-icon::before{content:'';width:16px;height:16px;background:var(--accent-cyan);clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%);animation:spin 8s linear infinite}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes rotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes modalSlide{from{transform:scale(.95) translateY(20px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}
.nav-tabs{display:flex;gap:2px;padding:16px 36px 0;border-bottom:1px solid var(--border);animation:fadeIn .6s ease .1s both}
.tab{padding:10px 24px;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:2px;color:var(--text-muted);cursor:pointer;border:1px solid transparent;border-bottom:none;border-radius:6px 6px 0 0;transition:all .2s;text-transform:uppercase}
.tab:hover{color:var(--text-secondary);background:rgba(255,255,255,0.02)}
.tab.active{color:var(--accent-cyan);background:var(--bg-panel);border-color:var(--border);border-bottom:1px solid var(--bg-panel);margin-bottom:-1px}
.main{padding:28px 36px;display:flex;flex-direction:column;gap:24px}
.stats-row{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;animation:fadeIn .6s ease .2s both}
.stat-card{background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:18px 20px;position:relative;overflow:hidden;transition:all .3s}
.stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--accent-color,var(--accent-cyan)),transparent)}
.stat-card:hover{border-color:var(--border-bright);transform:translateY(-2px)}
.stat-label{font-size:9px;letter-spacing:2px;color:var(--text-muted);text-transform:uppercase;margin-bottom:10px}
.stat-value{font-family:'Orbitron',monospace;font-size:26px;font-weight:800;color:var(--text-primary)}
.stat-sub{font-size:10px;color:var(--text-muted);margin-top:4px}
.panel{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;overflow:hidden}
.panel-header{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.panel-title{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--text-secondary);display:flex;align-items:center;gap:8px}
.panel-title-dot{width:6px;height:6px;border-radius:50%;background:var(--accent-cyan);box-shadow:0 0 6px var(--accent-cyan)}
.panel-badge{font-size:10px;padding:3px 10px;background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.2);border-radius:20px;color:var(--accent-cyan);letter-spacing:1px}
.upload-zone{margin:20px;border:2px dashed var(--border-bright);border-radius:10px;padding:28px 20px;text-align:center;cursor:pointer;transition:all .3s;position:relative;overflow:hidden;background:rgba(0,212,255,0.02)}
.upload-zone::before{content:'';position:absolute;inset:-50%;background:conic-gradient(transparent 0deg,rgba(0,212,255,0.06) 60deg,transparent 120deg);animation:rotate 6s linear infinite}
.upload-zone:hover{border-color:var(--accent-cyan);background:rgba(0,212,255,0.05);box-shadow:var(--glow-cyan)}
.upload-zone.dragging{border-color:var(--accent-cyan);background:rgba(0,212,255,0.08);box-shadow:0 0 40px rgba(0,212,255,0.2)}
.upload-icon{font-size:28px;margin-bottom:8px;position:relative;z-index:1}
.upload-text{font-size:13px;color:var(--text-secondary);position:relative;z-index:1;margin-bottom:4px}
.upload-sub{font-size:11px;color:var(--text-muted);position:relative;z-index:1}
.upload-btn{display:inline-block;margin-top:14px;padding:9px 24px;background:var(--accent-cyan);color:#000;border-radius:6px;font-family:'DM Mono',monospace;font-size:11px;font-weight:500;letter-spacing:1px;cursor:pointer;border:none;position:relative;z-index:1;transition:all .2s;box-shadow:0 0 20px rgba(0,212,255,0.3)}
.upload-btn:hover{background:#fff;box-shadow:0 0 30px rgba(0,212,255,0.5)}
input[type="file"]{display:none}
.table-controls{padding:14px 20px;display:flex;gap:10px;align-items:center}
.search-input{flex:1;background:var(--bg-elevated);border:1px solid var(--border);border-radius:6px;padding:8px 14px;color:var(--text-primary);font-family:'DM Mono',monospace;font-size:12px;outline:none;transition:all .2s}
.search-input::placeholder{color:var(--text-muted)}
.search-input:focus{border-color:var(--accent-cyan);box-shadow:0 0 0 2px rgba(0,212,255,0.1)}
.filter-btn{padding:8px 16px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:6px;color:var(--text-secondary);font-family:'DM Mono',monospace;font-size:11px;cursor:pointer;transition:all .2s;white-space:nowrap}
.filter-btn:hover,.filter-btn.active{border-color:var(--accent-cyan);color:var(--accent-cyan);background:rgba(0,212,255,0.06)}
table{width:100%;border-collapse:collapse}
thead tr{border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
th{padding:10px 16px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text-muted);text-align:left;font-weight:500;background:rgba(0,0,0,0.2)}
th.sortable{cursor:pointer;user-select:none;transition:color .2s}
th.sortable:hover{color:var(--accent-cyan)}
tbody tr{border-bottom:1px solid rgba(26,45,66,0.4);transition:all .15s;cursor:pointer}
tbody tr:hover{background:rgba(0,212,255,0.04)}
tbody tr:hover td{color:var(--text-primary)}
td{padding:12px 16px;font-size:12px;color:var(--text-secondary)}
td.mono{font-family:'DM Mono',monospace}
.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:4px;font-size:10px;letter-spacing:.5px}
.badge-pass{background:rgba(0,184,148,0.12);color:var(--accent-teal);border:1px solid rgba(0,184,148,0.2)}
.badge-fail{background:rgba(231,76,60,0.12);color:var(--accent-red);border:1px solid rgba(231,76,60,0.2)}
.badge-warn{background:rgba(243,156,18,0.12);color:var(--accent-amber);border:1px solid rgba(243,156,18,0.2)}
.badge-run{background:rgba(52,152,219,0.12);color:var(--accent-blue);border:1px solid rgba(52,152,219,0.2)}
.site-columns{display:grid;grid-template-columns:repeat(3,1fr);gap:0;overflow:hidden}
.site-col{border-right:1px solid var(--border);min-width:0;overflow:hidden}
.site-col:last-child{border-right:none}
.site-col .podium{gap:12px;padding:16px 8px 0}
.site-col .podium-col{width:auto;flex:1;min-width:0}
.site-col .podium-name{font-size:10px}
.site-col .tool-list{padding:10px 8px}
.site-col .tool-item{padding:8px 8px;gap:6px}
.site-col .tool-name-text{font-size:11px}
.site-col .tool-bar-wrap{width:60px}
.site-col-header{font-family:'Orbitron',monospace;font-size:13px;font-weight:800;letter-spacing:3px;color:var(--accent-teal);text-align:center;padding:14px 12px 10px;border-bottom:1px solid var(--border);background:rgba(0,184,148,0.04)}
.cat-hw{display:inline-block;font-size:9px;padding:2px 6px;border-radius:3px;letter-spacing:.5px;margin-right:6px;background:rgba(0,212,255,0.15);color:var(--accent-cyan);border:1px solid rgba(0,212,255,0.25)}
.cat-sw{display:inline-block;font-size:9px;padding:2px 6px;border-radius:3px;letter-spacing:.5px;margin-right:6px;background:rgba(155,89,182,0.15);color:#b97edb;border:1px solid rgba(155,89,182,0.25)}
.delete-btn{padding:5px 12px;background:transparent;border:1px solid rgba(231,76,60,0.3);border-radius:5px;color:var(--accent-red);font-family:'DM Mono',monospace;font-size:10px;cursor:pointer;transition:all .2s;letter-spacing:1px}
.delete-btn:hover{border-color:var(--accent-red);background:rgba(231,76,60,0.12);box-shadow:0 0 10px rgba(231,76,60,0.15)}
.rank-stack{display:flex;flex-direction:column;gap:20px;animation:fadeIn .6s ease .3s both}
.hero-panel{border-color:rgba(0,212,255,0.3)!important;box-shadow:0 0 30px rgba(0,212,255,0.06),inset 0 1px 0 rgba(0,212,255,0.1)}
.hero-panel .panel-header{background:rgba(0,212,255,0.04)}
.panel-note{font-size:11px;color:var(--text-secondary);padding:4px 20px 14px;line-height:1.7;border-bottom:1px solid var(--border)}
.panel-note strong{color:var(--accent-amber);font-weight:500}
.podium{display:flex;align-items:flex-end;justify-content:center;gap:24px;padding:24px 18px 0;border-bottom:1px solid var(--border);position:relative}
.podium-col{display:flex;flex-direction:column;align-items:center;gap:0;flex:1;min-width:0;max-width:180px}
.podium-medal{font-size:24px;line-height:1;margin-bottom:6px}
.podium-count{font-family:'Orbitron',monospace;font-weight:800;margin-bottom:6px}
.gold .podium-count{font-size:18px;color:#ffd700;text-shadow:0 0 12px rgba(255,215,0,0.4)}
.silver .podium-count{font-size:15px;color:#c0c0c0}
.bronze .podium-count{font-size:14px;color:#cd7f32}
.podium-bar-v{width:100%;border-radius:8px 8px 0 0;min-height:16px;transition:height .8s ease}
.gold .podium-bar-v{background:linear-gradient(180deg,#ffd700 0%,rgba(255,165,0,0.5) 100%);box-shadow:0 0 20px rgba(255,215,0,0.15)}
.silver .podium-bar-v{background:linear-gradient(180deg,#c0c0c0 0%,rgba(160,160,160,0.4) 100%)}
.bronze .podium-bar-v{background:linear-gradient(180deg,#cd7f32 0%,rgba(176,104,32,0.4) 100%)}
.podium-name{font-size:11px;color:var(--text-secondary);text-align:center;width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:10px 4px;background:var(--bg-elevated);border-left:1px solid var(--border);border-right:1px solid var(--border)}
.gold .podium-name{color:#ffd700;font-weight:600;font-size:12px;background:rgba(255,215,0,0.06);border-color:rgba(255,215,0,0.2)}
.tool-list{display:flex;flex-direction:column;gap:6px;padding:14px 18px}
.tool-item{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg-elevated);border-radius:8px;border:1px solid transparent;transition:all .2s}
.tool-item:hover,.tool-item.active{border-color:var(--accent-cyan);background:rgba(0,212,255,0.06)}
.tool-item.low-usage{border-color:rgba(231,76,60,0.5);background:rgba(231,76,60,0.08);animation:warnPulse 2s ease-in-out infinite}
.tool-item.low-usage:hover{border-color:rgba(231,76,60,0.8);background:rgba(231,76,60,0.14)}
@keyframes warnPulse{0%,100%{box-shadow:0 0 0 0 rgba(231,76,60,0)}50%{box-shadow:0 0 16px 2px rgba(231,76,60,0.25)}}
.low-tag{font-size:9px;padding:3px 8px;border-radius:4px;letter-spacing:1px;font-weight:700;background:rgba(231,76,60,0.2);color:var(--accent-red);border:1px solid rgba(231,76,60,0.4);margin-left:10px}
.tool-rank{font-family:'Orbitron',monospace;font-size:11px;color:var(--text-muted);width:20px;text-align:center}
.tool-name-text{flex:1;font-size:12px;color:var(--text-primary);display:flex;align-items:center}
.tool-bar-wrap{width:100px;height:4px;background:var(--border);border-radius:2px}
.tool-bar{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--accent-cyan),var(--accent-teal));transition:width .8s ease}
.tool-tests{font-family:'Orbitron',monospace;font-size:11px;color:var(--accent-cyan);min-width:24px;text-align:right}
.modal-overlay{position:fixed;inset:0;z-index:1000;background:rgba(5,11,18,0.9);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease}
.modal{background:var(--bg-card);border:1px solid var(--border-bright);border-radius:16px;width:900px;max-width:95vw;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 0 60px rgba(0,212,255,0.15),0 40px 80px rgba(0,0,0,0.6);animation:modalSlide .3s ease}
.modal-header{padding:20px 24px;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;justify-content:space-between}
.modal-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:var(--text-primary)}
.modal-sub{font-size:11px;color:var(--text-muted);margin-top:4px}
.modal-close{width:32px;height:32px;border-radius:8px;background:var(--bg-elevated);border:1px solid var(--border);cursor:pointer;font-size:16px;color:var(--text-muted);display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
.modal-close:hover{border-color:var(--accent-red);color:var(--accent-red)}
.modal-body{padding:20px 24px;overflow-y:auto;flex:1}
.modal-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
.sum-card{background:var(--bg-elevated);border-radius:8px;border:1px solid var(--border);padding:14px}
.sum-label{font-size:9px;letter-spacing:2px;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px}
.sum-val{font-family:'Orbitron',monospace;font-size:22px;font-weight:800}
.val-pass{color:var(--accent-teal)}.val-fail{color:var(--accent-red)}.val-warn{color:var(--accent-amber)}.val-total{color:var(--accent-cyan)}
.section-title{font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px;margin-top:20px}
.test-item{display:flex;align-items:center;gap:12px;padding:12px 14px;margin-bottom:6px;background:var(--bg-elevated);border-radius:8px;border:1px solid transparent;transition:all .2s;cursor:pointer}
.test-item:hover{border-color:var(--border-bright)}
.test-item.expanded{border-color:var(--accent-cyan);background:rgba(0,212,255,0.04)}
.test-index{font-family:'Orbitron',monospace;font-size:10px;color:var(--text-muted);width:28px}
.test-name{flex:1;font-size:12px;color:var(--text-primary)}
.test-duration{font-size:11px;color:var(--text-muted)}
.test-issues{font-size:11px;padding:2px 8px;border-radius:4px}
.issues-none{color:var(--text-muted)}.issues-some{background:rgba(231,76,60,0.12);color:var(--accent-red);border:1px solid rgba(231,76,60,0.2)}
.test-detail{margin:-2px 0 6px;padding:12px 14px;background:rgba(0,0,0,0.3);border-radius:0 0 8px 8px;border:1px solid var(--border);border-top:none}
.detail-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(26,45,66,0.4);font-size:11px}
.detail-row:last-child{border-bottom:none}
.detail-key{color:var(--text-muted)}.detail-val{color:var(--text-secondary);font-family:'DM Mono',monospace}
.section-divider{height:1px;background:linear-gradient(90deg,transparent,var(--border),transparent);margin:4px 0}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:var(--bg-deep)}::-webkit-scrollbar-thumb{background:var(--border-bright);border-radius:3px}::-webkit-scrollbar-thumb:hover{background:var(--accent-cyan)}

/* ═══ Toggle Switch ═══ */
.toggle-switch{position:relative;display:inline-block;width:36px;height:20px;cursor:pointer}
.toggle-switch input{opacity:0;width:0;height:0}
.toggle-slider{position:absolute;inset:0;background:rgba(231,76,60,0.3);border:1px solid rgba(231,76,60,0.4);border-radius:20px;transition:all .3s}
.toggle-slider::before{content:'';position:absolute;width:14px;height:14px;left:2px;bottom:2px;background:#e74c3c;border-radius:50%;transition:all .3s}
.toggle-switch input:checked+.toggle-slider{background:rgba(0,184,148,0.3);border-color:rgba(0,184,148,0.5)}
.toggle-switch input:checked+.toggle-slider::before{transform:translateX(16px);background:#00b894}
.retired-tag{font-size:8px;padding:2px 6px;border-radius:3px;letter-spacing:1px;margin-left:8px;background:rgba(231,76,60,0.15);color:var(--accent-red);border:1px solid rgba(231,76,60,0.3)}

/* ═══ Usage Matrix ═══ */
.year-select{background:var(--bg-elevated);border:1px solid var(--border-bright);border-radius:6px;padding:6px 14px;color:var(--accent-cyan);font-family:'Orbitron',monospace;font-size:12px;font-weight:800;cursor:pointer;outline:none;letter-spacing:1px;transition:all .2s}
.year-select:hover{border-color:var(--accent-cyan);box-shadow:0 0 8px rgba(0,212,255,0.2)}
.year-select option{background:var(--bg-card);color:var(--text-primary)}
.matrix-wrap{overflow-x:auto;padding:0 0 4px}
.usage-matrix{width:100%;border-collapse:collapse}
.usage-matrix th,.usage-matrix td{text-align:center;padding:10px 6px;font-size:11px;border-bottom:1px solid var(--border)}
.matrix-tool-header{text-align:left!important;padding-left:16px!important;width:180px;min-width:180px;font-size:9px;letter-spacing:2px;color:var(--text-muted);text-transform:uppercase;font-weight:500;background:rgba(0,0,0,0.2);position:sticky;left:0;z-index:2}
.matrix-month-header{font-family:'Orbitron',monospace;font-size:10px;color:var(--text-secondary);font-weight:700;letter-spacing:1px;background:rgba(0,0,0,0.2)}
.matrix-tool-name{text-align:left!important;padding-left:16px!important;font-size:11px;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:180px;min-width:180px;position:sticky;left:0;z-index:1;background:var(--bg-card)}
.matrix-cell{font-weight:700;letter-spacing:.5px;transition:all .2s}
.cell-used{color:#2ecc71;font-size:12px;font-family:'Orbitron',monospace;font-weight:800}
.cell-count{font-size:13px;line-height:1}
.cell-check{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;border:2px solid #2ecc71;font-size:10px;line-height:1;margin-top:3px;color:#2ecc71;font-weight:700}
.cell-unused{color:var(--accent-red);font-size:8px;letter-spacing:1px;opacity:.6}
.matrix-row-unused{background:rgba(231,76,60,0.05)}
.matrix-row-unused .matrix-tool-name{color:var(--accent-red);background:rgba(231,76,60,0.05)}
.matrix-summary{display:flex;gap:20px;padding:12px 16px;border-top:1px solid var(--border);font-size:11px;color:var(--text-secondary)}
.matrix-summary span{font-family:'Orbitron',monospace;font-weight:800;margin-left:4px}
.matrix-summary .used-count{color:#2ecc71}
.matrix-summary .unused-count{color:var(--accent-red)}

/* ═══ Responsive ═══ */
@media(max-width:1200px){
.stats-row{grid-template-columns:repeat(2,1fr)}
.site-col{border-right-color:var(--border)}
.podium-col{max-width:150px}
.podium{gap:18px}
}
@media(max-width:900px){
.header{padding:16px 20px}
.nav-tabs{padding:12px 20px 0}
.main{padding:20px 16px;gap:16px}
.stats-row{grid-template-columns:repeat(2,1fr);gap:10px}
.stat-value{font-size:22px}
.panel-header{padding:12px 14px}
.panel-title{font-size:11px;letter-spacing:1px}
.table-controls{padding:10px 14px;flex-wrap:wrap}
.tool-list{padding:10px 12px}
.tool-item{padding:8px 10px;gap:8px}
.tool-bar-wrap{width:60px}
.podium{gap:16px;padding:18px 12px 0}
.podium-col{max-width:130px}
.podium-name{font-size:10px;padding:8px 2px}
.modal-summary{grid-template-columns:repeat(2,1fr)}
.modal{max-width:98vw}
.modal-header{padding:14px 16px}
.modal-body{padding:14px 16px}
table{display:block;overflow-x:auto}
thead{display:table;width:100%;table-layout:fixed}
tbody{display:table;width:100%;table-layout:fixed}
th,td{padding:8px 10px;font-size:11px;white-space:nowrap}
.upload-zone{margin:12px;padding:20px 14px}
}
@media(max-width:600px){
.header{padding:12px 14px}
h1{font-size:13px!important;letter-spacing:2px!important}
.nav-tabs{padding:8px 14px 0;gap:0;overflow-x:auto}
.tab{padding:8px 14px;font-size:10px;letter-spacing:1px;flex-shrink:0}
.main{padding:14px 10px;gap:12px}
.stats-row{grid-template-columns:repeat(2,1fr);gap:6px}
.stat-card{padding:10px 8px}
.stat-value{font-size:16px}
.stat-label{font-size:7px;letter-spacing:1px}
.podium{gap:8px;padding:14px 6px 0}
.podium-col{max-width:none}
.podium-medal{font-size:18px}
.podium-count{font-size:12px!important}
.podium-name{font-size:9px;padding:6px 2px}
.podium-bar-v{border-radius:5px 5px 0 0}
.tool-list{padding:8px 8px}
.tool-item{padding:6px 8px;gap:6px}
.tool-rank{font-size:9px;width:16px}
.tool-name-text{font-size:10px}
.tool-bar-wrap{width:40px}
.tool-tests{font-size:10px;min-width:20px}
.panel-note{font-size:10px;padding:4px 12px 10px}
.filter-btn{padding:6px 10px;font-size:10px}
.search-input{font-size:11px;padding:6px 10px}
.modal-summary{grid-template-columns:1fr 1fr}
.sum-val{font-size:18px}
.site-col-header{font-size:11px;letter-spacing:2px;padding:10px 8px 8px}
.site-col .podium{padding:10px 4px 0;gap:6px}
.site-col .podium-col{max-width:none}
.site-col .tool-list{padding:6px 4px}
.site-col .tool-item{padding:6px 4px;gap:4px}
.site-col .tool-name-text{font-size:9px}
.site-col .tool-bar-wrap{width:30px}
.low-tag{font-size:7px;padding:2px 5px;margin-left:4px}
.matrix-tool-header{width:120px;min-width:120px;padding-left:8px!important;font-size:8px}
.matrix-tool-name{width:120px;min-width:120px;padding-left:8px!important;font-size:9px}
.matrix-month-header{font-size:8px!important;padding:8px 2px!important}
.matrix-cell{padding:8px 2px!important}
.cell-used{font-size:11px!important}
.cell-check{width:14px!important;height:14px!important;font-size:8px!important;border-width:1.5px!important}
.cell-unused{font-size:7px!important}
.matrix-summary{flex-wrap:wrap;gap:10px;font-size:10px;padding:10px 12px}
}
`}</style>}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

function CountUp({target,suffix=""}){
  const[v,setV]=useState(0);
  useEffect(()=>{let c=0;const s=Math.max(1,Math.ceil(target/40));const t=setInterval(()=>{c=Math.min(c+s,target);setV(c);if(c>=target)clearInterval(t)},30);return()=>clearInterval(t)},[target]);
  return<>{v}{suffix}</>;
}

function ResultBadge({result}){
  if(!result)return<span style={{color:"var(--text-muted)",fontSize:10}}>—</span>;
  const m={pass:"badge-pass",fail:"badge-fail",warning:"badge-warn",pending:"badge-run",incomplete:"badge-warn"};
  const l={pass:"PASS",fail:"FAIL",warning:"WARN",pending:"PEND",incomplete:"INCMP"};
  return<span className={`badge ${m[result]||"badge-run"}`}>{l[result]||result}</span>;
}

function RankingPanelInner({data,barBg,lowThreshold}){
  if(!data.length)return<div style={{padding:20,color:"var(--text-muted)",fontSize:11}}>No data</div>;
  const max=data[0].count;
  const top3=data.slice(0,3);
  const medals=["🏆","🥈","🥉"];
  const tiers=["gold","silver","bronze"];
  return(<>
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
    </div>
  </>);
}

function RankingPanel({title,data,dotColor,barBg,className,note,lowThreshold}){
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
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

export default function Dashboard(){
  const[tab,setTab]=useState("overview");
  const[clock,setClock]=useState("00:00:00");
  const[search,setSearch]=useState("");
  const[filter,setFilter]=useState("ALL");
  const[sortCfg,setSortCfg]=useState({key:"id",dir:"asc"});
  const[dragging,setDragging]=useState(false);
  const[notif,setNotif]=useState(null);
  const[dirSearch,setDirSearch]=useState("");
  const[selectedYear,setSelectedYear]=useState(2026);
  const[deletedIds,setDeletedIds]=useState(new Set());
  const[disabledTools,setDisabledTools]=useState(new Set());
  const fileRef=useRef(null);

  useEffect(()=>{const tick=()=>{const n=new Date();setClock([n.getHours(),n.getMinutes(),n.getSeconds()].map(v=>String(v).padStart(2,"0")).join(":"))};tick();const id=setInterval(tick,1000);return()=>clearInterval(id)},[]);
  useEffect(()=>{if(notif){const id=setTimeout(()=>setNotif(null),3000);return()=>clearTimeout(id)}},[notif]);

  const filteredLogs=useMemo(()=>ALL_LOGS.filter(l=>{
    if(deletedIds.has(l.id))return false;
    const rm={pass:"PASS",fail:"FAIL",warning:"WARN"};
    if(filter!=="ALL"&&(l.result?rm[l.result]:null)!==filter)return false;
    if(!search)return true;
    const q=search.toLowerCase();
    return l.filename.toLowerCase().includes(q)||l.uploader?.toLowerCase().includes(q)||l.toolName.toLowerCase().includes(q)||l.tester.toLowerCase().includes(q)||l.site.toLowerCase().includes(q);
  }),[filter,search,deletedIds]);

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

  const toggleTool=(id)=>{setDisabledTools(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n})};
  const activeTools=useMemo(()=>TOOLS.filter(t=>!disabledTools.has(t.id)),[disabledTools]);
  const R=useMemo(()=>computeRankings(activeTools),[activeTools]);

  const totalHW=activeTools.filter(t=>t.cat==="HW").length;
  const totalSW=activeTools.filter(t=>t.cat==="SW").length;

  const handleDragOver=(e)=>{e.preventDefault();setDragging(true)};
  const handleDragLeave=()=>setDragging(false);
  const handleDrop=(e)=>{e.preventDefault();setDragging(false);const f=Array.from(e.dataTransfer.files);if(f.length)setNotif(`✓ Uploaded: ${f[0].name}`)};
  const handleFileSelect=(e)=>{const f=Array.from(e.target.files);if(f.length)setNotif(`✓ Uploaded: ${f[0].name}`)};
  const handleDeleteLog=(id,filename)=>{if(confirm(`確定要刪除 ${filename} 嗎？`)){setDeletedIds(prev=>{const n=new Set(prev);n.add(id);return n});setNotif(`✓ 已刪除: ${filename}`)}}

  const filteredTools=useMemo(()=>{
    if(!dirSearch)return TOOLS;
    const q=dirSearch.toLowerCase();
    return TOOLS.filter(t=>t.name.toLowerCase().includes(q)||t.site.toLowerCase().includes(q)||t.team.toLowerCase().includes(q)||t.dev.name.toLowerCase().includes(q));
  },[dirSearch]);

  return(
    <>
      <GlobalCSS/>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800;900&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet"/>

      {/* ═══ HEADER ═══ */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon"></div>
          <div>
            <h1 style={{fontFamily:"'Orbitron',monospace",fontSize:15,fontWeight:800,letterSpacing:3,color:"var(--accent-cyan)",margin:0}}>TOOL TRACKER</h1>
            <span style={{fontSize:10,color:"var(--text-muted)",letterSpacing:2,display:"block"}}>TESTING LOG DASHBOARD</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:24}}>
          <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:"var(--text-secondary)",letterSpacing:1}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"var(--accent-teal)",boxShadow:"0 0 8px var(--accent-teal)",animation:"pulse 2s ease-in-out infinite"}}></div>LIVE
          </div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,color:"var(--text-secondary)"}}>{clock}</div>
        </div>
      </header>

      {/* ═══ TABS ═══ */}
      <div className="nav-tabs">
        {[["overview","⬡ Overview"],["upload","≡ Upload Log"],["directory","◈ Tool Status"]].map(([k,l])=>(
          <div key={k} className={`tab ${tab===k?"active":""}`} onClick={()=>setTab(k)}>{l}</div>
        ))}
      </div>

      <main className="main">

        {/* ═══════════ OVERVIEW ═══════════ */}
        {tab==="overview"&&<>
          <div className="stats-row">
            {[
              {label:"Total Tools",val:<><CountUp target={activeTools.length}/></>,sub:`HW ${totalHW} / SW ${totalSW}`,accent:"var(--accent-cyan)"},
              {label:"Total Logs",val:<CountUp target={ALL_LOGS.length}/>,sub:"All uploads",accent:"var(--accent-teal)"},
            ].map((s,i)=>(
              <div key={i} className="stat-card" style={{"--accent-color":s.accent}}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.val}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="rank-stack">
            {/* ── Yearly Usage Matrix ── */}
            <div className="panel hero-panel">
              <div className="panel-header" style={{justifyContent:"space-between"}}>
                <div className="panel-title">
                  <div className="panel-title-dot" style={{background:"var(--accent-cyan)",boxShadow:"0 0 6px var(--accent-cyan)"}}></div>
                  所有工具年度使用狀態
                </div>
                <select className="year-select" value={selectedYear} onChange={e=>setSelectedYear(Number(e.target.value))}>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
              <div className="panel-note">
                追蹤各工具每月是否實際投入使用 — <strong>整年未使用的工具需特別關注是否落實於日常測試流程</strong>
              </div>
              <div className="matrix-wrap">
                <table className="usage-matrix">
                  <thead><tr>
                    <th className="matrix-tool-header">工具名稱</th>
                    {["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"].map((m,i)=><th key={i} className="matrix-month-header">{m}</th>)}
                  </tr></thead>
                  <tbody>
                    {activeTools.map(tool=>{
                      const usage=(TOOL_MONTHLY_USAGE[selectedYear]||{})[tool.id]||Array(12).fill(0);
                      const usedCount=usage.filter(v=>v>0).length;
                      return(
                        <tr key={tool.id} className={usedCount===0?"matrix-row-unused":""}>
                          <td className="matrix-tool-name">
                            <span className={`cat-${tool.cat.toLowerCase()}`}>{tool.cat}</span>
                            {tool.name}
                          </td>
                          {usage.map((count,i)=>(
                            <td key={i} className={`matrix-cell ${count>0?"cell-used":"cell-unused"}`}>
                              {count>0?<><div className="cell-count">{count}</div><div className="cell-check">✓</div></>:<>Unused</>}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {(()=>{
                const yearData=(TOOL_MONTHLY_USAGE[selectedYear]||{});
                const allUsed=activeTools.filter(t=>(yearData[t.id]||[]).some(v=>v>0)).length;
                const allUnused=activeTools.length-allUsed;
                return(
                  <div className="matrix-summary">
                    <div>已使用工具：<span className="used-count">{allUsed}</span></div>
                    <div>未使用工具：<span className="unused-count">{allUnused}</span></div>
                  </div>
                );
              })()}</div>
            <RankingPanel title="近一個月各 Site 使用工具次數" data={R.recentSiteUsage} dotColor="var(--accent-blue)" barBg="var(--accent-blue)"/>
            <div className="panel">
              <div className="panel-header"><div className="panel-title"><div className="panel-title-dot" style={{background:"var(--accent-blue)",boxShadow:"0 0 6px var(--accent-blue)"}}></div>近一個月所有工具已被各 Site 使用次數</div></div>
              <div className="site-columns">
                {SITES.map(s=>(
                  <div key={s} className="site-col">
                    <div className="site-col-header">{s}</div>
                    <RankingPanelInner data={R.recentToolBySite[s]||[]} barBg="var(--accent-blue)" lowThreshold={0}/>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel">
              <div className="panel-header"><div className="panel-title"><div className="panel-title-dot" style={{background:"var(--accent-teal)",boxShadow:"0 0 6px var(--accent-teal)"}}></div>所有工具已被各 Site 使用總次數</div></div>
              <div className="site-columns">
                {SITES.map(s=>(
                  <div key={s} className="site-col">
                    <div className="site-col-header">{s}</div>
                    <RankingPanelInner data={R.totalToolBySite[s]||[]} barBg="var(--accent-teal)"/>
                  </div>
                ))}
              </div>
            </div>
            <RankingPanel title="工具協助 Debug 累計 Fail 數" data={R.toolFails} dotColor="var(--accent-red)" barBg="var(--accent-red)"/>

            <RankingPanel title="測試者上傳次數" data={R.testerUploads} dotColor="var(--accent-amber)" barBg="linear-gradient(90deg,var(--accent-amber),#e67e22)"/>
          </div>
        </>}

        {/* ═══════════ UPLOAD LOG ═══════════ */}
        {tab==="upload"&&(
          <div className="panel log-panel" style={{animation:"fadeIn .6s ease .2s both"}}>
            <div className="panel-header">
              <div className="panel-title"><div className="panel-title-dot"></div> Upload Log</div>
              <span className="panel-badge">{sortedLogs.length} records</span>
            </div>

            {/* Upload Zone (compact) */}
            <div
              className={`upload-zone ${dragging?"dragging":""}`}
              onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              onClick={()=>fileRef.current?.click()}
            >
              <div className="upload-icon">📂</div>
              <div className="upload-text">Drop test log files here</div>
              <div className="upload-sub">Supports .log / .json / .csv / .txt / .xml</div>
              <button className="upload-btn" onClick={(e)=>{e.stopPropagation();fileRef.current?.click()}}>SELECT FILES</button>
            </div>
            <input type="file" ref={fileRef} multiple onChange={handleFileSelect}/>

            {/* Controls */}
            <div className="table-controls">
              <input className="search-input" placeholder="Search tool, filename, tester, site..." value={search} onChange={e=>setSearch(e.target.value)}/>
              {["ALL","PASS","FAIL","WARN"].map(f=>(
                <button key={f} className={`filter-btn ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>{f}</button>
              ))}
            </div>

            {/* Sortable Table */}
            <table>
              <thead><tr>
                <th className="sortable" onClick={()=>handleSort("id")}>#  {sortIcon("id")}</th>
                <th className="sortable" onClick={()=>handleSort("timeStr")}>Upload Time{sortIcon("timeStr")}</th>
                <th className="sortable" onClick={()=>handleSort("toolName")}>Tool Name{sortIcon("toolName")}</th>
                <th className="sortable" onClick={()=>handleSort("filename")}>Log Filename{sortIcon("filename")}</th>
                <th className="sortable" onClick={()=>handleSort("site")}>Site{sortIcon("site")}</th>
                <th className="sortable" onClick={()=>handleSort("tester")}>Tester{sortIcon("tester")}</th>
                <th className="sortable" onClick={()=>handleSort("dur")}>Duration{sortIcon("dur")}</th>
                <th className="sortable" onClick={()=>handleSort("result")}>Result{sortIcon("result")}</th>
                <th>Action</th>
              </tr></thead>
              <tbody>
                {sortedLogs.map(l=>{
                  const tool=TOOLS.find(t=>t.id===l.toolId);
                  return(
                    <tr key={l.id}>
                      <td className="mono" style={{color:"var(--text-muted)"}}>{String(l.id).padStart(3,"0")}</td>
                      <td className="mono">{l.timeStr}</td>
                      <td><span className={l.cat==="HW"?"cat-hw":"cat-sw"}>{l.cat}</span>{l.toolName}</td>
                      <td style={{color:"var(--accent-cyan)",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.filename}</td>
                      <td>{l.site}</td>
                      <td>{l.tester}</td>
                      <td className="mono">{l.dur}</td>
                      <td><ResultBadge result={l.result}/></td>
                      <td><button className="delete-btn" onClick={()=>handleDeleteLog(l.id,l.filename)}>刪除</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ═══════════ TOOL STATUS ═══════════ */}
        {tab==="directory"&&(
          <div className="panel" style={{animation:"fadeIn .6s ease .2s both"}}>
            <div className="panel-header">
              <div className="panel-title"><div className="panel-title-dot" style={{background:"var(--accent-amber)",boxShadow:"0 0 6px var(--accent-amber)"}}></div> Tool Status</div>
              <span className="panel-badge">{activeTools.length}/{TOOLS.length} active</span>
            </div>
            <div className="table-controls">
              <input className="search-input" placeholder="Search tool, site, team, developer..." value={dirSearch} onChange={e=>setDirSearch(e.target.value)}/>
            </div>
            <table>
              <thead><tr>
                <th>Active</th><th>Tool Name</th><th>Type</th><th>Site</th><th>Team</th><th>Unit</th><th>Version</th><th>Developer</th><th>Email</th><th>Ext</th>
              </tr></thead>
              <tbody>
                {filteredTools.map(t=>{
                  const off=disabledTools.has(t.id);
                  return(
                  <tr key={t.id} style={{opacity:off?0.4:1,transition:"opacity .2s"}}>
                    <td><label className="toggle-switch" onClick={e=>e.stopPropagation()}><input type="checkbox" checked={!off} onChange={()=>toggleTool(t.id)}/><span className="toggle-slider"></span></label></td>
                    <td style={{color:off?"var(--text-muted)":"var(--text-primary)",fontWeight:500}}>{t.name}{off&&<span className="retired-tag">已退役</span>}</td>
                    <td><span className={t.cat==="HW"?"cat-hw":"cat-sw"}>{t.cat}</span></td>
                    <td style={{fontWeight:500}}>{t.site}</td>
                    <td>{t.team}</td>
                    <td>{t.unit}</td>
                    <td className="mono" style={{color:"var(--text-muted)"}}>{t.v}</td>
                    <td style={{color:"var(--text-primary)"}}>{t.dev.name}</td>
                    <td><a href={`mailto:${t.dev.email}`} style={{color:"var(--accent-cyan)",textDecoration:"none",fontSize:11}}>{t.dev.email}</a></td>
                    <td className="mono">{t.dev.ext}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>


      {notif&&<div style={{position:"fixed",bottom:24,right:24,background:"#0d1620",border:"1px solid var(--accent-teal)",borderRadius:8,padding:"12px 18px",color:"var(--accent-teal)",fontFamily:"'DM Mono',monospace",fontSize:12,zIndex:9999,animation:"fadeIn .3s ease",boxShadow:"0 0 20px rgba(0,184,148,0.2)"}}>{notif}</div>}
    </>
  );
}
