// ══════════════════════════════════════════════════════════════════════════════
// TOOLS DATA — 16 tools across 3 sites
// ══════════════════════════════════════════════════════════════════════════════

export const TOOLS = [
  // ── TPE (10 tools) ──
  { id:"tpe-1",  name:"TPE Tool 1",  v:"02.30", cat:"HW", dev_site:"TPE", dev_unit:"Monitor",
    dev:{name:"王建民",email:"jm.wang@company.com",ext:"82-2501"}, finish_date:"2025/06/15", hasReport:true, uses:6 },
  { id:"tpe-2",  name:"TPE Tool 2",  v:"01.20", cat:"HW", dev_site:"TPE", dev_unit:"Monitor",
    dev:{name:"王建民",email:"jm.wang@company.com",ext:"82-2501"}, finish_date:"2025/08/22", hasReport:false, uses:3 },
  { id:"tpe-3",  name:"TPE Tool 3",  v:"01.00", cat:"HW", dev_site:"TPE", dev_unit:"Monitor",
    dev:{name:"王建民",email:"jm.wang@company.com",ext:"82-2501"}, finish_date:"2025/10/10", hasReport:true, uses:0 },
  { id:"tpe-4",  name:"TPE Tool 4",  v:"03.10", cat:"SW", dev_site:"TPE", dev_unit:"Monitor",
    dev:{name:"林雅婷",email:"yt.lin@company.com",ext:"82-2502"}, finish_date:"2025/05/30", hasReport:true, uses:5 },
  { id:"tpe-5",  name:"TPE Tool 5",  v:"01.05", cat:"SW", dev_site:"TPE", dev_unit:"Monitor",
    dev:{name:"林雅婷",email:"yt.lin@company.com",ext:"82-2502"}, finish_date:"2025/09/18", hasReport:false, uses:3 },
  { id:"tpe-6",  name:"TPE Tool 6",  v:"02.01", cat:"HW", dev_site:"TPE", dev_unit:"TV",
    dev:{name:"張志偉",email:"cw.chang@company.com",ext:"82-2601"}, finish_date:"2025/07/25", hasReport:true, uses:4 },
  { id:"tpe-7",  name:"TPE Tool 7",  v:"01.50", cat:"HW", dev_site:"TPE", dev_unit:"TV",
    dev:{name:"張志偉",email:"cw.chang@company.com",ext:"82-2601"}, finish_date:"2025/11/05", hasReport:true, uses:3 },
  { id:"tpe-8",  name:"TPE Tool 8",  v:"02.20", cat:"SW", dev_site:"TPE", dev_unit:"TV",
    dev:{name:"陳怡君",email:"yc.chen@company.com",ext:"82-2602"}, finish_date:"2025/04/12", hasReport:true, uses:5 },
  { id:"tpe-9",  name:"TPE Tool 9",  v:"01.30", cat:"SW", dev_site:"TPE", dev_unit:"TV",
    dev:{name:"陳怡君",email:"yc.chen@company.com",ext:"82-2602"}, finish_date:"2025/12/20", hasReport:true, uses:3 },
  { id:"tpe-10", name:"TPE Tool 10", v:"01.00", cat:"SW", dev_site:"TPE", dev_unit:"TV",
    dev:{name:"陳怡君",email:"yc.chen@company.com",ext:"82-2602"}, finish_date:"2026/01/15", hasReport:false, uses:2 },
  // ── XM (10 tools) ──
  { id:"xm-1",  name:"XM Tool 1",  v:"01.80", cat:"HW", dev_site:"XM", dev_unit:"TV",
    dev:{name:"李明華",email:"mh.li@company.com",ext:"82-3501"}, finish_date:"2025/06/20", hasReport:true, uses:4 },
  { id:"xm-2",  name:"XM Tool 2",  v:"02.00", cat:"SW", dev_site:"XM", dev_unit:"TV",
    dev:{name:"黃雅琪",email:"yc.huang@company.com",ext:"82-3502"}, finish_date:"2025/08/10", hasReport:true, uses:3 },
  { id:"xm-3",  name:"XM Tool 3",  v:"01.90", cat:"SW", dev_site:"XM", dev_unit:"TV",
    dev:{name:"黃雅琪",email:"yc.huang@company.com",ext:"82-3502"}, finish_date:"2025/10/28", hasReport:true, uses:0 },
  { id:"xm-4",  name:"XM Tool 4",  v:"01.10", cat:"SW", dev_site:"XM", dev_unit:"TV",
    dev:{name:"黃雅琪",email:"yc.huang@company.com",ext:"82-3502"}, finish_date:"2025/07/14", hasReport:true, uses:3 },
  { id:"xm-5",  name:"XM Tool 5",  v:"01.40", cat:"HW", dev_site:"XM", dev_unit:"TV",
    dev:{name:"李明華",email:"mh.li@company.com",ext:"82-3501"}, finish_date:"2025/09/30", hasReport:true, uses:2 },
  { id:"xm-6",  name:"XM Tool 6",  v:"02.10", cat:"HW", dev_site:"XM", dev_unit:"TV",
    dev:{name:"李明華",email:"mh.li@company.com",ext:"82-3501"}, finish_date:"2025/11/18", hasReport:false, uses:4 },
  { id:"xm-7",  name:"XM Tool 7",  v:"01.60", cat:"SW", dev_site:"XM", dev_unit:"TV",
    dev:{name:"黃雅琪",email:"yc.huang@company.com",ext:"82-3502"}, finish_date:"2025/05/08", hasReport:true, uses:3 },
  { id:"xm-8",  name:"XM Tool 8",  v:"01.01", cat:"SW", dev_site:"XM", dev_unit:"TV",
    dev:{name:"黃雅琪",email:"yc.huang@company.com",ext:"82-3502"}, finish_date:"2025/12/15", hasReport:false, uses:1 },
  { id:"xm-9",  name:"XM Tool 9",  v:"02.30", cat:"HW", dev_site:"XM", dev_unit:"TV",
    dev:{name:"李明華",email:"mh.li@company.com",ext:"82-3501"}, finish_date:"2025/04/25", hasReport:true, uses:5 },
  { id:"xm-10", name:"XM Tool 10", v:"01.20", cat:"SW", dev_site:"XM", dev_unit:"TV",
    dev:{name:"黃雅琪",email:"yc.huang@company.com",ext:"82-3502"}, finish_date:"2026/02/10", hasReport:true, uses:0 },
  { id:"xm-11", name:"电视交互自动化测试工具", v:"01.00", cat:"SW", dev_site:"XM", dev_unit:"TV",
    dev:{name:"小紅",email:"Red@company.com",ext:"82-0000"}, finish_date:"2025/05/30", hasReport:false, uses:0 },
  // ── FQ (10 tools) ──
  { id:"fq-1",  name:"FQ Tool 1",  v:"02.50", cat:"HW", dev_site:"FQ", dev_unit:"Monitor",
    dev:{name:"吳俊傑",email:"cj.wu@company.com",ext:"82-4501"}, finish_date:"2025/07/10", hasReport:true, uses:3 },
  { id:"fq-2",  name:"FQ Tool 2",  v:"01.00", cat:"HW", dev_site:"FQ", dev_unit:"Monitor",
    dev:{name:"吳俊傑",email:"cj.wu@company.com",ext:"82-4501"}, finish_date:"2025/09/05", hasReport:true, uses:2 },
  { id:"fq-3",  name:"FQ Tool 3",  v:"01.02", cat:"SW", dev_site:"FQ", dev_unit:"Monitor",
    dev:{name:"趙美玲",email:"ml.zhao@company.com",ext:"82-4502"}, finish_date:"2025/10/30", hasReport:false, uses:1 },
  { id:"fq-4",  name:"FQ Tool 4",  v:"01.30", cat:"HW", dev_site:"FQ", dev_unit:"Monitor",
    dev:{name:"吳俊傑",email:"cj.wu@company.com",ext:"82-4501"}, finish_date:"2025/06/28", hasReport:true, uses:4 },
  { id:"fq-5",  name:"FQ Tool 5",  v:"02.00", cat:"SW", dev_site:"FQ", dev_unit:"Monitor",
    dev:{name:"趙美玲",email:"ml.zhao@company.com",ext:"82-4502"}, finish_date:"2025/11/22", hasReport:true, uses:2 },
  { id:"fq-6",  name:"FQ Tool 6",  v:"01.50", cat:"HW", dev_site:"FQ", dev_unit:"Monitor",
    dev:{name:"吳俊傑",email:"cj.wu@company.com",ext:"82-4501"}, finish_date:"2025/08/15", hasReport:false, uses:3 },
  { id:"fq-7",  name:"FQ Tool 7",  v:"01.10", cat:"SW", dev_site:"FQ", dev_unit:"Monitor",
    dev:{name:"趙美玲",email:"ml.zhao@company.com",ext:"82-4502"}, finish_date:"2026/01/08", hasReport:true, uses:1 },
  { id:"fq-8",  name:"FQ Tool 8",  v:"02.20", cat:"HW", dev_site:"FQ", dev_unit:"Monitor",
    dev:{name:"吳俊傑",email:"cj.wu@company.com",ext:"82-4501"}, finish_date:"2025/05/18", hasReport:true, uses:5 },
  { id:"fq-9",  name:"FQ Tool 9",  v:"01.80", cat:"SW", dev_site:"FQ", dev_unit:"Monitor",
    dev:{name:"趙美玲",email:"ml.zhao@company.com",ext:"82-4502"}, finish_date:"2025/12/30", hasReport:true, uses:0 },
  { id:"fq-10", name:"FQ Tool 10", v:"01.40", cat:"SW", dev_site:"FQ", dev_unit:"Monitor",
    dev:{name:"趙美玲",email:"ml.zhao@company.com",ext:"82-4502"}, finish_date:"2026/02/28", hasReport:false, uses:2 },
];

// ── Site testers ──
export const SITE_TESTERS = {
  TPE: [{name:"陳小明",test_unit:"Monitor"},{name:"李佳芸",test_unit:"TV"},{name:"黃志強",test_unit:"Monitor"},{name:"周雅萍",test_unit:"TV"}],
  XM: [{name:"劉偉明",test_unit:"TV"},{name:"何美芳",test_unit:"TV"}],
  FQ: [{name:"鄭建國",test_unit:"Monitor"},{name:"許淑惠",test_unit:"Monitor"}],
};

// ── Result patterns per tool (deterministic) ──
export const RES_PAT = {
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
export const ITEM_DURS = ["0.3s","1.2s","2.8s","0.8s","1.5s","0.9s","1.1s","3.4s","0.6s","60s"];

// ── DUT Model Names ──
export const DUT_MODELS_MONITOR = ["M27-QHD Pro","M32-4K Ultra","M24-FHD Eco","M34-UWQHD","M27-FHD Basic","M32-QHD Gaming"];
export const DUT_MODELS_TV = ["TV55-OLED-A1","TV65-QLED-S2","TV43-LED-E1","TV75-MiniLED-X1","TV50-LCD-V2","TV55-QLED-S1"];

// ══════════════════════════════════════════════════════════════════════════════
// LOG BLUEPRINT — single source of truth for all data
// { toolId: { site: { year: { month: count } } } }
// ══════════════════════════════════════════════════════════════════════════════

export const LOG_BLUEPRINT = {
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
