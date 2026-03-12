import { useState, useEffect, useRef, useMemo } from "react";

// ══════════════════════════════════════════════════════════════════════════════
// TOOLS DATA — 16 tools across 3 sites
// ══════════════════════════════════════════════════════════════════════════════

const TOOLS = [
  // ── TPE — Monitor Team ──
  { id:"thermal-analyzer", name:"熱像分析工具", v:"2.3.0", cat:"HW", site:"TPE", team:"Monitor Team", unit:"HW Q",
    dev:{name:"王建民",email:"jm.wang@company.com",ext:"2501"}, hasReport:true, uses:6,
    report:[
      {item:"溫度讀取精度",result:"pass",issues:0,notes:"±0.5°C 精度符合規格"},
      {item:"熱區辨識",result:"pass",issues:0,notes:"自動辨識熱區範圍正確"},
      {item:"高溫報警觸發",result:"warning",issues:1,notes:"85°C 報警延遲 2 秒"},
      {item:"報告匯出",result:"pass",issues:0,notes:"PDF/Excel 匯出正常"},
    ]},
  { id:"component-marker", name:"元器件標示工具", v:"1.2.0", cat:"HW", site:"TPE", team:"Monitor Team", unit:"HW Q",
    dev:{name:"王建民",email:"jm.wang@company.com",ext:"2501"}, hasReport:false, uses:3, report:null },
  { id:"esd-tester", name:"靜電放電測試工具", v:"1.0.0", cat:"HW", site:"TPE", team:"Monitor Team", unit:"HW Q",
    dev:{name:"王建民",email:"jm.wang@company.com",ext:"2501"}, hasReport:true, uses:0, report:null },
  { id:"monitor-autotest", name:"Monitor 自動化測試", v:"3.1.0", cat:"SW", site:"TPE", team:"Monitor Team", unit:"SW Q",
    dev:{name:"林雅婷",email:"yt.lin@company.com",ext:"2502"}, hasReport:true, uses:5,
    report:[
      {item:"腳本載入",result:"pass",issues:0,notes:"所有腳本格式正確載入"},
      {item:"測試流程執行",result:"pass",issues:0,notes:"完整流程 15 步驟通過"},
      {item:"異常捕捉",result:"fail",issues:2,notes:"Timeout 例外未正確捕捉 2 例"},
      {item:"結果回報",result:"pass",issues:0,notes:"報告自動產生並上傳"},
      {item:"批次執行",result:"warning",issues:1,notes:"超過 50 筆時記憶體偏高"},
    ]},
  { id:"report-organizer", name:"報告整理工具", v:"1.0.5", cat:"SW", site:"TPE", team:"Monitor Team", unit:"SW Q",
    dev:{name:"林雅婷",email:"yt.lin@company.com",ext:"2502"}, hasReport:false, uses:3, report:null },
  // ── TPE — TV Team ──
  { id:"hightemp-tester", name:"高溫測試工具", v:"2.0.1", cat:"HW", site:"TPE", team:"TV Team", unit:"HW Q",
    dev:{name:"張志偉",email:"cw.chang@company.com",ext:"2601"}, hasReport:true, uses:4,
    report:[
      {item:"溫度爬升控制",result:"pass",issues:0,notes:"升溫速率 2°C/min 穩定"},
      {item:"長時間穩定性",result:"warning",issues:1,notes:"72h 測試後溫度偏移 +1.2°C"},
      {item:"數據記錄",result:"pass",issues:0,notes:"每秒取樣完整記錄"},
      {item:"安全停機",result:"pass",issues:0,notes:"超溫保護正常觸發"},
    ]},
  { id:"signal-meter", name:"TV 訊號量測工具", v:"1.5.0", cat:"HW", site:"TPE", team:"TV Team", unit:"HW Q",
    dev:{name:"張志偉",email:"cw.chang@company.com",ext:"2601"}, hasReport:true, uses:3,
    report:[
      {item:"HDMI 訊號檢測",result:"pass",issues:0,notes:"4K@60Hz 訊號穩定"},
      {item:"色彩準確度",result:"pass",issues:0,notes:"Delta E < 2.0"},
      {item:"解析度驗證",result:"fail",issues:1,notes:"8K 訊號源偶發畫面撕裂"},
      {item:"音訊同步",result:"pass",issues:0,notes:"A/V 同步延遲 < 20ms"},
    ]},
  { id:"osd-tester", name:"OSD 測試工具", v:"2.2.0", cat:"SW", site:"TPE", team:"TV Team", unit:"SW Q",
    dev:{name:"陳怡君",email:"yc.chen@company.com",ext:"2602"}, hasReport:true, uses:5,
    report:[
      {item:"選單導航",result:"pass",issues:0,notes:"所有路徑可正常到達"},
      {item:"語言切換",result:"pass",issues:0,notes:"28 語系切換正常"},
      {item:"設定值儲存",result:"fail",issues:2,notes:"色溫設定重開機後還原 2 例"},
      {item:"重設出廠",result:"pass",issues:0,notes:"所有設定正確還原預設值"},
    ]},
  { id:"image-analyzer", name:"畫質分析工具", v:"1.3.0", cat:"SW", site:"TPE", team:"TV Team", unit:"SW Q",
    dev:{name:"陳怡君",email:"yc.chen@company.com",ext:"2602"}, hasReport:true, uses:3,
    report:[
      {item:"對比度測試",result:"pass",issues:0,notes:"動態對比度 5000:1 達標"},
      {item:"亮度均勻性",result:"warning",issues:1,notes:"邊角亮度偏低 8%"},
      {item:"色域覆蓋",result:"pass",issues:0,notes:"sRGB 99.2% 覆蓋率"},
    ]},
  // ── XM — TV Team ──
  { id:"xm-hightemp", name:"XM 高溫測試工具", v:"1.8.0", cat:"HW", site:"XM", team:"TV Team", unit:"HW Q",
    dev:{name:"李明華",email:"mh.li@company.com",ext:"3501"}, hasReport:true, uses:4,
    report:[
      {item:"溫度爬升控制",result:"pass",issues:0,notes:"升溫曲線符合規格"},
      {item:"功耗監測",result:"pass",issues:0,notes:"待機/運行功耗記錄正確"},
      {item:"散熱效率",result:"fail",issues:1,notes:"特定機型散熱不足導致降頻"},
      {item:"數據記錄",result:"pass",issues:0,notes:"數據完整匯出 CSV"},
    ]},
  { id:"xm-osd", name:"XM OSD 測試工具", v:"2.0.0", cat:"SW", site:"XM", team:"TV Team", unit:"SW Q",
    dev:{name:"黃雅琪",email:"yc.huang@company.com",ext:"3502"}, hasReport:true, uses:3,
    report:[
      {item:"選單回應速度",result:"pass",issues:0,notes:"平均回應 < 100ms"},
      {item:"多語系顯示",result:"warning",issues:1,notes:"阿拉伯語右到左排版異常"},
      {item:"亮度調整",result:"pass",issues:0,notes:"0-100 線性調整正確"},
    ]},
  { id:"xm-regression", name:"自動化回歸測試工具", v:"0.9.0", cat:"SW", site:"XM", team:"TV Team", unit:"SW Q",
    dev:{name:"黃雅琪",email:"yc.huang@company.com",ext:"3502"}, hasReport:true, uses:0, report:null },
  { id:"firmware-verifier", name:"韌體燒錄驗證工具", v:"1.1.0", cat:"SW", site:"XM", team:"TV Team", unit:"SW Q",
    dev:{name:"黃雅琪",email:"yc.huang@company.com",ext:"3502"}, hasReport:true, uses:3,
    report:[
      {item:"燒錄完整性",result:"pass",issues:0,notes:"MD5 校驗全數通過"},
      {item:"版本校驗",result:"pass",issues:0,notes:"版本號碼正確顯示"},
      {item:"回滾測試",result:"fail",issues:1,notes:"降版後設定未清除"},
      {item:"批次燒錄",result:"pass",issues:0,notes:"10 台同時燒錄成功"},
    ]},
  // ── FQ — Monitor Team ──
  { id:"fq-safety", name:"FQ 電氣安規測試工具", v:"2.5.0", cat:"HW", site:"FQ", team:"Monitor Team", unit:"HW Q",
    dev:{name:"吳俊傑",email:"cj.wu@company.com",ext:"4501"}, hasReport:true, uses:3,
    report:[
      {item:"絕緣電阻",result:"pass",issues:0,notes:"> 10MΩ 符合規格"},
      {item:"耐壓測試",result:"pass",issues:0,notes:"3000V / 1min 通過"},
      {item:"接地阻抗",result:"pass",issues:0,notes:"< 0.1Ω 符合標準"},
      {item:"漏電流",result:"warning",issues:1,notes:"高濕環境漏電流偏高 0.2mA"},
    ]},
  { id:"fq-pcb", name:"FQ PCB 檢測工具", v:"1.0.0", cat:"HW", site:"FQ", team:"Monitor Team", unit:"HW Q",
    dev:{name:"吳俊傑",email:"cj.wu@company.com",ext:"4501"}, hasReport:true, uses:2,
    report:[
      {item:"焊點檢查",result:"pass",issues:0,notes:"AOI 檢查 100% 合格"},
      {item:"短路偵測",result:"pass",issues:0,notes:"無短路"},
      {item:"元件定位",result:"fail",issues:1,notes:"QFP 元件偏移超過 50μm"},
    ]},
  { id:"fq-log-parser", name:"FQ Log 解析工具", v:"1.0.2", cat:"SW", site:"FQ", team:"Monitor Team", unit:"SW Q",
    dev:{name:"趙美玲",email:"ml.zhao@company.com",ext:"4502"}, hasReport:false, uses:1, report:null },
];

// ── Site testers ──
const SITE_TESTERS = {
  TPE: ["陳小明","李佳芸","黃志強","周雅萍"],
  XM: ["劉偉明","何美芳"],
  FQ: ["鄭建國","許淑惠"],
};

// ── Result patterns per tool (deterministic) ──
const RES_PAT = {
  "thermal-analyzer":["pass","pass","pass","pass","warning","pass"],
  "monitor-autotest":["pass","pass","fail","pass","pass"],
  "hightemp-tester":["pass","pass","warning","pass"],
  "signal-meter":["pass","fail","pass"],
  "osd-tester":["pass","fail","pass","pass","warning"],
  "image-analyzer":["pass","warning","pass"],
  "xm-hightemp":["pass","pass","fail","pass"],
  "xm-osd":["pass","warning","pass"],
  "firmware-verifier":["pass","fail","pass"],
  "fq-safety":["pass","pass","warning"],
  "fq-pcb":["pass","fail"],
};
const ITEM_DURS = ["0.3s","1.2s","2.8s","0.8s","1.5s","0.9s","1.1s","3.4s","0.6s","60s"];

// ══════════════════════════════════════════════════════════════════════════════
// GENERATE LOGS
// ══════════════════════════════════════════════════════════════════════════════

const ALL_LOGS = (() => {
  const logs = [];
  let idx = 0;
  TOOLS.forEach(tool => {
    const testers = SITE_TESTERS[tool.site];
    const pat = RES_PAT[tool.id];
    for (let i = 0; i < tool.uses; i++) {
      const d = new Date(Date.now() - idx * 7200000);
      logs.push({
        toolId: tool.id, toolName: tool.name, cat: tool.cat,
        filename: `${tool.id}_${String(idx+1).padStart(3,"0")}.log`,
        site: tool.site, team: tool.team, unit: tool.unit,
        testItem: tool.report ? tool.report.map(r=>r.item).join("、") : "—",
        tester: testers[i % testers.length],
        time: d.getTime(),
        timeStr: `${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`,
        result: tool.hasReport && pat ? pat[i % pat.length] : null,
        dur: tool.hasReport ? `${((idx*7+3)%50/10+1).toFixed(1)}h` : "—",
      });
      idx++;
    }
  });
  return logs.sort((a,b) => b.time - a.time).map((l,i) => ({...l, id:i+1}));
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

function rankToolUsage(logs) {
  const m = {};
  TOOLS.forEach(t => { m[t.name] = 0; });
  logs.forEach(l => { m[l.toolName] = (m[l.toolName]||0) + 1; });
  return Object.entries(m).map(([n,c])=>({name:n,count:c})).sort((a,b)=>b.count-a.count);
}

const SITES = ["TPE","XM","FQ"];
function rankToolBySite(site) {
  const m = {};
  TOOLS.filter(t=>t.site===site).forEach(t => { m[t.name] = 0; });
  ALL_LOGS.filter(l=>l.site===site).forEach(l => { m[l.toolName] = (m[l.toolName]||0) + 1; });
  return Object.entries(m).map(([n,c])=>({name:n,count:c})).sort((a,b)=>b.count-a.count);
}

const R = {
  recentToolUsage:  rankToolUsage(RECENT_LOGS),
  recentSiteUsage:  rank(RECENT_LOGS, "site"),
  totalToolBySite:  Object.fromEntries(SITES.map(s=>[s, rankToolBySite(s)])),
  toolFails:        TOOLS.filter(t=>t.hasReport).map(t=>({
                      name:t.name,
                      count:ALL_LOGS.filter(l=>l.toolId===t.id&&l.result==="fail").length,
                    })).sort((a,b)=>b.count-a.count),
  testerUploads:    rank(ALL_LOGS, "tester"),
};

// ══════════════════════════════════════════════════════════════════════════════
// CSS
// ══════════════════════════════════════════════════════════════════════════════

function GlobalCSS(){return<style>{`
:root{--bg-deep:#050b12;--bg-panel:#090f18;--bg-card:#0d1620;--bg-elevated:#111c2a;
--border:#1a2d42;--border-bright:#1e3a55;
--accent-cyan:#00d4ff;--accent-teal:#00b894;--accent-amber:#f39c12;--accent-red:#e74c3c;--accent-blue:#3498db;
--text-primary:#e8f4fd;--text-secondary:#7a9bbf;--text-muted:#3d5a73;
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
.stats-row{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;animation:fadeIn .6s ease .2s both}
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
.report-btn{padding:5px 12px;background:transparent;border:1px solid var(--border-bright);border-radius:5px;color:var(--text-muted);font-family:'DM Mono',monospace;font-size:10px;cursor:pointer;transition:all .2s;letter-spacing:1px}
.report-btn:hover{border-color:var(--accent-cyan);color:var(--accent-cyan);box-shadow:0 0 10px rgba(0,212,255,0.15)}
.rank-stack{display:flex;flex-direction:column;gap:20px;animation:fadeIn .6s ease .3s both}
.hero-panel{border-color:rgba(0,212,255,0.3)!important;box-shadow:0 0 30px rgba(0,212,255,0.06),inset 0 1px 0 rgba(0,212,255,0.1)}
.hero-panel .panel-header{background:rgba(0,212,255,0.04)}
.panel-note{font-size:11px;color:var(--text-secondary);padding:4px 20px 14px;line-height:1.7;border-bottom:1px solid var(--border)}
.panel-note strong{color:var(--accent-amber);font-weight:500}
.podium{display:flex;align-items:flex-end;justify-content:center;gap:24px;padding:24px 18px 0;border-bottom:1px solid var(--border);position:relative}
.podium-col{display:flex;flex-direction:column;align-items:center;gap:0;width:160px;flex-shrink:0}
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
  const[modalLogId,setModalLogId]=useState(null);
  const[expandedTest,setExpandedTest]=useState(null);
  const[dragging,setDragging]=useState(false);
  const[notif,setNotif]=useState(null);
  const[dirSearch,setDirSearch]=useState("");
  const fileRef=useRef(null);

  useEffect(()=>{const tick=()=>{const n=new Date();setClock([n.getHours(),n.getMinutes(),n.getSeconds()].map(v=>String(v).padStart(2,"0")).join(":"))};tick();const id=setInterval(tick,1000);return()=>clearInterval(id)},[]);
  useEffect(()=>{if(notif){const id=setTimeout(()=>setNotif(null),3000);return()=>clearTimeout(id)}},[notif]);

  const filteredLogs=useMemo(()=>ALL_LOGS.filter(l=>{
    const rm={pass:"PASS",fail:"FAIL",warning:"WARN"};
    if(filter!=="ALL"&&(l.result?rm[l.result]:null)!==filter)return false;
    if(!search)return true;
    const q=search.toLowerCase();
    return l.filename.toLowerCase().includes(q)||l.uploader?.toLowerCase().includes(q)||l.toolName.toLowerCase().includes(q)||l.tester.toLowerCase().includes(q)||l.site.toLowerCase().includes(q);
  }),[filter,search]);

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

  const totalHW=TOOLS.filter(t=>t.cat==="HW").length;
  const totalSW=TOOLS.filter(t=>t.cat==="SW").length;
  const totalFails=ALL_LOGS.filter(l=>l.result==="fail").length;
  const passRate=Math.round(ALL_LOGS.filter(l=>l.result==="pass").length/ALL_LOGS.filter(l=>l.result!=null).length*100);

  const handleDragOver=(e)=>{e.preventDefault();setDragging(true)};
  const handleDragLeave=()=>setDragging(false);
  const handleDrop=(e)=>{e.preventDefault();setDragging(false);const f=Array.from(e.dataTransfer.files);if(f.length)setNotif(`✓ Uploaded: ${f[0].name}`)};
  const handleFileSelect=(e)=>{const f=Array.from(e.target.files);if(f.length)setNotif(`✓ Uploaded: ${f[0].name}`)};
  const openModal=(id)=>{setModalLogId(id);setExpandedTest(null)};
  const closeModal=()=>{setModalLogId(null);setExpandedTest(null)};

  const modalLog=modalLogId?ALL_LOGS.find(l=>l.id===modalLogId):null;
  const modalTool=modalLog?TOOLS.find(t=>t.id===modalLog.toolId):null;

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
        {[["overview","⬡ Overview"],["upload","≡ Upload Log"],["directory","◈ Tool Directory"]].map(([k,l])=>(
          <div key={k} className={`tab ${tab===k?"active":""}`} onClick={()=>setTab(k)}>{l}</div>
        ))}
      </div>

      <main className="main">

        {/* ═══════════ OVERVIEW ═══════════ */}
        {tab==="overview"&&<>
          <div className="stats-row">
            {[
              {label:"Total Tools",val:<><CountUp target={TOOLS.length}/></>,sub:`HW ${totalHW} / SW ${totalSW}`,accent:"var(--accent-cyan)"},
              {label:"Total Logs",val:<CountUp target={ALL_LOGS.length}/>,sub:"All uploads",accent:"var(--accent-teal)"},
              {label:"Pass Rate",val:<CountUp target={passRate} suffix="%"/>,sub:"With test report",accent:"var(--accent-amber)"},
              {label:"Total Fails",val:<CountUp target={totalFails}/>,sub:"Cumulative",accent:"var(--accent-red)"},
              {label:"Sites / Testers",val:<>{Object.keys(SITE_TESTERS).length} / <CountUp target={Object.values(SITE_TESTERS).flat().length}/></>,sub:"Active",accent:"var(--accent-blue)"},
            ].map((s,i)=>(
              <div key={i} className="stat-card" style={{"--accent-color":s.accent}}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.val}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="rank-stack">
            <RankingPanel className="hero-panel" title="近一個月所有工具的使用次數" data={R.recentToolUsage} dotColor="var(--accent-cyan)"
              lowThreshold={0}
              note={<>追蹤各工具實際投入產品開發週期的使用頻率 — <strong>使用次數為 0 的工具需特別關注是否落實於日常測試流程</strong></>}
            />
            <RankingPanel title="近一個月各 Site 使用工具次數" data={R.recentSiteUsage} dotColor="var(--accent-blue)" barBg="var(--accent-blue)"/>
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
                <th>Report</th>
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
                      <td>{tool?.hasReport?<button className="report-btn" onClick={e=>{e.stopPropagation();openModal(l.id)}}>VIEW →</button>:<span style={{color:"var(--text-muted)",fontSize:10}}>—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ═══════════ TOOL DIRECTORY ═══════════ */}
        {tab==="directory"&&(
          <div className="panel" style={{animation:"fadeIn .6s ease .2s both"}}>
            <div className="panel-header">
              <div className="panel-title"><div className="panel-title-dot" style={{background:"var(--accent-amber)",boxShadow:"0 0 6px var(--accent-amber)"}}></div> Tool Directory</div>
              <span className="panel-badge">{filteredTools.length} tools</span>
            </div>
            <div className="table-controls">
              <input className="search-input" placeholder="Search tool, site, team, developer..." value={dirSearch} onChange={e=>setDirSearch(e.target.value)}/>
            </div>
            <table>
              <thead><tr>
                <th>Tool Name</th><th>Type</th><th>Site</th><th>Team</th><th>Unit</th><th>Version</th><th>Developer</th><th>Email</th><th>Ext</th><th>Test Report</th>
              </tr></thead>
              <tbody>
                {filteredTools.map(t=>(
                  <tr key={t.id}>
                    <td style={{color:"var(--text-primary)",fontWeight:500}}>{t.name}</td>
                    <td><span className={t.cat==="HW"?"cat-hw":"cat-sw"}>{t.cat}</span></td>
                    <td style={{fontWeight:500}}>{t.site}</td>
                    <td>{t.team}</td>
                    <td>{t.unit}</td>
                    <td className="mono" style={{color:"var(--text-muted)"}}>{t.v}</td>
                    <td style={{color:"var(--text-primary)"}}>{t.dev.name}</td>
                    <td><a href={`mailto:${t.dev.email}`} style={{color:"var(--accent-cyan)",textDecoration:"none",fontSize:11}}>{t.dev.email}</a></td>
                    <td className="mono">{t.dev.ext}</td>
                    <td>{t.hasReport?<span className="badge badge-pass">YES</span>:<span style={{color:"var(--text-muted)",fontSize:10}}>—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ═══ MODAL ═══ */}
      {modalLog&&modalTool&&modalTool.report&&(
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">📋 {modalTool.name} — 測試報告</div>
                <div className="modal-sub">{modalLog.filename} · {modalLog.tester} · {modalTool.site} · {modalLog.timeStr}</div>
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-summary">
                <div className="sum-card"><div className="sum-label">Total Items</div><div className="sum-val val-total">{modalTool.report.length}</div></div>
                <div className="sum-card"><div className="sum-label">Passed</div><div className="sum-val val-pass">{modalTool.report.filter(r=>r.result==="pass").length}</div></div>
                <div className="sum-card"><div className="sum-label">Failed</div><div className="sum-val val-fail">{modalTool.report.filter(r=>r.result==="fail").length}</div></div>
                <div className="sum-card"><div className="sum-label">Total Issues</div><div className="sum-val val-warn">{modalTool.report.reduce((a,r)=>a+r.issues,0)}</div></div>
              </div>
              <div className="section-title">逐項測試結果</div>
              {modalTool.report.map((item,i)=>(
                <div key={i}>
                  <div className={`test-item ${expandedTest===i?"expanded":""}`} onClick={()=>setExpandedTest(expandedTest===i?null:i)}>
                    <div className="test-index">{String(i+1).padStart(2,"0")}</div>
                    <div className="test-name">{item.item}</div>
                    <div className="test-duration">{ITEM_DURS[i%ITEM_DURS.length]}</div>
                    <ResultBadge result={item.result}/>
                    <span className={`test-issues ${item.issues>0?"issues-some":"issues-none"}`}>{item.issues>0?`⚠ ${item.issues} issues`:"—"}</span>
                  </div>
                  {expandedTest===i&&(
                    <div className="test-detail">
                      <div className="detail-row"><span className="detail-key">Log Output</span><span className="detail-val">{item.notes}</span></div>
                      <div className="detail-row"><span className="detail-key">Duration</span><span className="detail-val">{ITEM_DURS[i%ITEM_DURS.length]}</span></div>
                      <div className="detail-row"><span className="detail-key">Issues Found</span><span className="detail-val" style={{color:item.issues>0?"var(--accent-red)":"var(--accent-teal)"}}>{item.issues}</span></div>
                      <div className="detail-row"><span className="detail-key">Status</span><span className="detail-val">{item.result.toUpperCase()}</span></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {notif&&<div style={{position:"fixed",bottom:24,right:24,background:"#0d1620",border:"1px solid var(--accent-teal)",borderRadius:8,padding:"12px 18px",color:"var(--accent-teal)",fontFamily:"'DM Mono',monospace",fontSize:12,zIndex:9999,animation:"fadeIn .3s ease",boxShadow:"0 0 20px rgba(0,184,148,0.2)"}}>{notif}</div>}
    </>
  );
}
