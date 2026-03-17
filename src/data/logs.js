import { TOOLS, SITE_TESTERS, RES_PAT, LOG_BLUEPRINT } from "./tools.js";

// ══════════════════════════════════════════════════════════════════════════════
// GENERATE LOGS from blueprint (single source of truth)
// ══════════════════════════════════════════════════════════════════════════════

export const ALL_LOGS = (() => {
  const logs = [];
  let idx = 0;
  TOOLS.forEach(tool => {
    const bp = LOG_BLUEPRINT[tool.id] || {};
    const pat = RES_PAT[tool.id];
    Object.entries(bp).forEach(([site, years]) => {
      Object.entries(years).forEach(([year, months]) => {
        Object.entries(months).forEach(([month, count]) => {
          for (let j = 0; j < count; j++) {
            const testerObj = SITE_TESTERS[site][idx % SITE_TESTERS[site].length];
            const day = 3 + ((idx * 7 + j * 11) % 25);
            const hour = 8 + (idx * 3) % 10;
            const min = (idx * 17) % 60;
            const d = new Date(+year, +month - 1, day, hour, min);
            logs.push({
              toolId: tool.id, toolName: tool.name, cat: tool.cat,
              filename: `${tool.id}_${site.toLowerCase()}_${String(idx+1).padStart(3,"0")}.log`,
              test_site: site, test_unit: testerObj.test_unit,
              testItem: "—",
              tester: testerObj.name,
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

export const ONE_MONTH_AGO = Date.now() - 30 * 24 * 3600000;

export const SITES = ["TPE","XM","FQ"];
