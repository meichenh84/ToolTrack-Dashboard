import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { TOOLS, SITE_TESTERS, RES_PAT, LOG_BLUEPRINT } from "../src/data/tools.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.join(__dirname, "..", "logs");

const TESTER_EMAILS = {
  "陳小明": "xm.chen@company.com",
  "李佳芸": "jy.li@company.com",
  "黃志強": "zq.huang@company.com",
  "周雅萍": "yp.zhou@company.com",
  "劉偉明": "wm.liu@company.com",
  "何美芳": "mf.he@company.com",
  "鄭建國": "jg.zheng@company.com",
  "許淑惠": "sh.xu@company.com",
};

// Clean and create logs directory
if (fs.existsSync(LOGS_DIR)) {
  fs.rmSync(LOGS_DIR, { recursive: true });
}
fs.mkdirSync(LOGS_DIR, { recursive: true });

const fmt = (d) =>
  `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;

// ══════════════════════════════════════════════════════════════════════════════
// Detailed Log Content Generator
// ══════════════════════════════════════════════════════════════════════════════

const ts = (base, offsetMin) => {
  const d = new Date(base.getTime() + offsetMin * 60000);
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
};

// Each step: items() returns descriptions only; failDesc/warnDesc are injected by the generator
const HW_STEPS = [
  {
    name: "Power Supply Verification",
    failDesc: "FAIL — standby power 0.62W exceeds 0.5W spec limit",
    warnDesc: "WARNING — standby power 0.49W approaching 0.5W limit",
    items: (idx) => [
      `Measuring standby power: ${(0.28 + (idx % 8) * 0.03).toFixed(2)}W (Spec: <0.5W)`,
      `Measuring active power: ${(22 + (idx % 18)).toFixed(1)}W (Spec: <45W)`,
      `Power cycle stability (${3 + (idx % 4)} iterations)`,
      `Inrush current: ${(28 + (idx % 15)).toFixed(1)}A peak (Spec: <50A)`,
    ],
  },
  {
    name: "Display Panel Inspection",
    failDesc: "FAIL — dead pixel count 5 exceeds spec ≤3",
    warnDesc: "WARNING — uniformity 81.2% near 80% lower bound",
    items: (idx) => [
      `Backlight uniformity (${9 + (idx % 2) * 4}-point): ${(83 + (idx % 14)).toFixed(1)}% (Spec: ≥80%)`,
      `Luminance center: ${(280 + (idx % 120))} cd/m² (Spec: 250-400)`,
      `Pixel defect scan — Dead: ${idx % 2}, Stuck: ${idx % 3} (Spec: ≤3/≤5)`,
      `Panel response time (GtG): ${(4 + (idx % 8)).toFixed(1)}ms`,
    ],
  },
  {
    name: "Signal Input Test",
    failDesc: "FAIL — HDMI 1 signal unstable, CRC errors detected",
    warnDesc: "WARNING — HDMI 2 signal lock 480ms exceeds 300ms guideline",
    items: (idx) => [
      `HDMI 1 — 1920x1080@60Hz: Signal lock ${(120 + idx % 80)}ms`,
      `HDMI 2 — 3840x2160@60Hz: Signal lock ${(150 + idx % 100)}ms`,
      `${idx % 2 === 0 ? "DisplayPort 1.4 — 3840x2160@144Hz" : "VGA — 1920x1080@60Hz"}: Signal lock ${(100 + idx % 120)}ms`,
      `EDID read/write verification`,
    ],
  },
  {
    name: "Color Accuracy Measurement",
    failDesc: "FAIL — Delta E avg 4.8 exceeds spec <3.0",
    warnDesc: "WARNING — white point 6720K slightly outside ±200K range",
    items: (idx) => [
      `White point: ${6350 + (idx % 300)}K (Target: 6500K ±200K)`,
      `sRGB coverage: ${(96.2 + (idx % 35) / 10).toFixed(1)}% (Spec: ≥95%)`,
      `Delta E average (24-patch): ${(1.2 + (idx % 20) / 10).toFixed(1)} (Spec: <3.0)`,
      `Gamma curve ${(2.15 + (idx % 10) / 100).toFixed(2)} (Target: 2.2 ±0.1)`,
    ],
  },
  {
    name: "Thermal & Safety Check",
    failDesc: "FAIL — internal hotspot 72.3°C exceeds 70°C limit",
    warnDesc: "WARNING — internal hotspot 67.5°C approaching 70°C limit",
    items: (idx) => [
      `Surface temperature (rear center): ${(38 + (idx % 12)).toFixed(1)}°C after 2h (Spec: <55°C)`,
      `Internal hotspot: ${(52 + (idx % 15)).toFixed(1)}°C (Spec: <70°C)`,
      `Fan noise (1m): ${(22 + (idx % 8)).toFixed(1)} dBA (Spec: <30 dBA)`,
    ],
  },
];

const SW_STEPS = [
  {
    name: "Firmware Verification",
    failDesc: "FAIL — checksum mismatch with manifest",
    warnDesc: "WARNING — firmware build date older than 90 days",
    items: (idx) => [
      `Reading firmware header... build ${20250100 + (idx % 300)}`,
      `Checksum: 0x${((idx * 0x1A3F + 0xB7C2) & 0xFFFFFFFF).toString(16).toUpperCase().padStart(8,"0")}`,
      `Version chain validation: ${((idx % 5) + 1)}.${idx % 10}.${idx % 5} → ${((idx % 5) + 1)}.${idx % 10}.${(idx % 5) + 1}`,
      `Bootloader compatibility check`,
    ],
  },
  {
    name: "OSD Menu Navigation",
    failDesc: "FAIL — 'Advanced Settings > Color' submenu unresponsive",
    warnDesc: "WARNING — menu rendering latency 280ms approaching 300ms limit",
    items: (idx) => [
      `Menu tree traversal (${110 + (idx % 40)} items)`,
      `All menu items accessible and responsive`,
      `Menu rendering latency: ${(80 + (idx % 120))}ms avg (Spec: <300ms)`,
      `Language switching (${8 + (idx % 5)} languages)`,
    ],
  },
  {
    name: "Settings Persistence",
    failDesc: "FAIL — brightness and contrast reset after power cycle",
    warnDesc: "WARNING — color profile partially reset (2 of 18 values differ)",
    items: (idx) => [
      `Writing ${18 + (idx % 12)} user preferences...`,
      `Power cycle → re-reading stored values`,
      `Comparison: all values match`,
      `Factory reset validation`,
    ],
  },
  {
    name: "DDC/CI Communication",
    failDesc: "FAIL — I²C bus timeout, no device response",
    warnDesc: "WARNING — VCP 0x10 returned stale value on first read",
    items: (idx) => [
      `I²C bus scan: device found at 0x${(0x37 + (idx % 3)).toString(16)}`,
      `VCP feature read (${15 + (idx % 10)} codes)`,
      `VCP feature write + readback`,
      `Capabilities string parse (${(180 + (idx % 80))} bytes)`,
    ],
  },
  {
    name: "Automation API Test",
    failDesc: "FAIL — command queue stalled after 12 commands",
    warnDesc: `WARNING — session timeout after 30s under concurrent load`,
    items: (idx) => [
      `REST endpoint health check (${3 + (idx % 3)} endpoints)`,
      `Command queue throughput: ${(45 + (idx % 30))} cmd/s`,
      `Concurrent session handling (${2 + (idx % 4)} sessions)`,
      `Event callback reliability (100 events)`,
    ],
  },
];

const DUT_MODELS_MONITOR = ["M27-QHD Pro","M32-4K Ultra","M24-FHD Eco","M34-UWQHD","M27-FHD Basic","M32-QHD Gaming"];
const DUT_MODELS_TV = ["TV55-OLED-A1","TV65-QLED-S2","TV43-LED-E1","TV75-MiniLED-X1","TV50-LCD-V2","TV55-QLED-S1"];

function generateDetailedLog(tool, result, startDate, endDate, idx) {
  const isHW = tool.cat === "HW";
  const isMonitor = tool.dev_unit === "Monitor Team";
  const models = isMonitor ? DUT_MODELS_MONITOR : DUT_MODELS_TV;
  const steps = isHW ? HW_STEPS : SW_STEPS;
  const durMin = (endDate - startDate) / 60000;

  // Determine which step fails/warns (deterministic)
  const resUp = result ? result.toUpperCase() : null;
  let failStep = -1;
  if (resUp === "FAIL" || resUp === "WARNING") {
    failStep = idx % steps.length;
  }

  const lines = [];
  lines.push("");
  lines.push("════════════════════════════════════════════════════════════");
  lines.push(`  ${tool.name} — ${isHW ? "Hardware" : "Software"} Test Execution Log`);
  lines.push(`  Version: ${tool.v}    |    Category: ${tool.cat}`);
  lines.push("════════════════════════════════════════════════════════════");
  lines.push("");

  let t = 0; // offset in minutes from start

  lines.push(`[${ts(startDate, t)}] Initializing ${tool.name} v${tool.v}...`);
  t += 0.1;
  lines.push(`[${ts(startDate, t)}] Loading test profile: ${isHW ? "HW" : "SW"}_STANDARD_v${tool.v}`);
  t += 0.3;

  if (isHW) {
    lines.push(`[${ts(startDate, t)}] Connecting to DUT (Device Under Test)...`);
    t += 0.5;
    lines.push(`[${ts(startDate, t)}] DUT identified: ${models[idx % models.length]}, S/N: ${tool.dev_site}-${String(startDate.getFullYear()).slice(2)}${String(startDate.getMonth()+1).padStart(2,"0")}-${String(idx+1).padStart(4,"0")}`);
  } else {
    lines.push(`[${ts(startDate, t)}] Launching test environment...`);
    t += 0.5;
    lines.push(`[${ts(startDate, t)}] Target device: ${models[idx % models.length]}, FW v${((idx*3+1)%9)+1}.${(idx*7)%10}.${idx%5} (Build ${20250100 + (idx % 300)})`);
  }
  t += 0.5;
  lines.push(`[${ts(startDate, t)}] Test session ID: ${tool.dev_site}-${tool.id.toUpperCase()}-${String(idx+1).padStart(5,"0")}`);
  lines.push("");

  const stepDur = (durMin - 3) / steps.length; // distribute remaining time across steps

  steps.forEach((step, si) => {
    t += 1;
    lines.push(`── Step ${si + 1}/${steps.length}: ${step.name} ──`);
    const descs = step.items(idx);
    const issueIdx = idx % descs.length; // which item shows the issue
    descs.forEach((desc, ii) => {
      t += stepDur / descs.length;
      let status = "PASS";
      if (si === failStep && ii === issueIdx) {
        status = resUp === "FAIL" ? step.failDesc : step.warnDesc;
      }
      const statusStr = status === "PASS" ? "✓ PASS"
        : status.startsWith("FAIL") ? `✗ ${status}`
        : status.startsWith("WARNING") ? `⚠ ${status}`
        : status;
      lines.push(`[${ts(startDate, t)}] ${desc} ... ${statusStr}`);
    });
    lines.push("");
  });

  // Summary
  const totalItems = steps.reduce((s, st) => s + st.items(idx).length, 0);
  const passCount = resUp === "PASS" || !resUp ? totalItems : totalItems - 1;
  const failCount = resUp === "FAIL" ? 1 : 0;
  const warnCount = resUp === "WARNING" ? 1 : 0;

  lines.push("═══════════════════════════════════════════");
  lines.push("  SUMMARY");
  lines.push("═══════════════════════════════════════════");
  lines.push(`  Total checks : ${totalItems}`);
  lines.push(`  Passed       : ${passCount}`);
  lines.push(`  Failed       : ${failCount}`);
  lines.push(`  Warnings     : ${warnCount}`);
  lines.push(`  Duration     : ${((endDate - startDate) / 3600000).toFixed(1)}h`);
  lines.push(`  Overall      : ${resUp || "COMPLETED"}`);
  lines.push("═══════════════════════════════════════════");
  lines.push("");

  return lines.join("\n");
}

let idx = 0;
let fileCount = 0;

TOOLS.forEach((tool) => {
  const bp = LOG_BLUEPRINT[tool.id] || {};
  const pat = RES_PAT[tool.id];

  Object.entries(bp).forEach(([site, years]) => {
    Object.entries(years).forEach(([year, months]) => {
      Object.entries(months).forEach(([month, count]) => {
        for (let j = 0; j < count; j++) {
          const testerObj = SITE_TESTERS[site][idx % SITE_TESTERS[site].length];
          let day = 3 + ((idx * 7 + j * 11) % 25);
          const hour = 8 + ((idx * 3) % 10);
          const min = (idx * 17) % 60;
          // Cap at 2026/03/17 (today) — future dates don't exist yet
          if (+year === 2026 && +month === 3 && day > 17) day = 3 + (idx % 15);
          const startDate = new Date(+year, +month - 1, day, hour, min);

          const result = tool.hasReport && pat ? pat[idx % pat.length] : null;
          const durH = tool.hasReport ? (idx * 7 + 3) % 50 / 10 + 1 : 1;
          const endDate = new Date(startDate.getTime() + durH * 3600000);

          const filename = `${tool.id}_${site.toLowerCase()}_${String(idx + 1).padStart(3, "0")}.txt`;

          let content = "[LOG_START]\n";
          content += `Tool: ${tool.name}\n`;
          content += `Test Site: ${site}\n`;
          content += `Test Unit: ${testerObj.test_unit}\n`;
          content += `Tester: ${testerObj.name}\n`;
          content += `Tester Email: ${TESTER_EMAILS[testerObj.name] || "—"}\n`;
          if (result) {
            content += `Result: ${result.toUpperCase()}\n`;
          }
          content += `Test_Log Start: ${fmt(startDate)}\n`;
          content += `Test_Log End: ${fmt(endDate)}\n`;
          content += "[LOG_END]\n";
          content += generateDetailedLog(tool, result, startDate, endDate, idx);

          fs.writeFileSync(path.join(LOGS_DIR, filename), content, "utf-8");
          fileCount++;
          idx++;
        }
      });
    });
  });
});

console.log(`Generated ${fileCount} log files in ${LOGS_DIR}`);
