import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { TOOLS, SITE_TESTERS, RES_PAT, LOG_BLUEPRINT, DUT_MODELS_MONITOR, DUT_MODELS_TV } from "../src/data/tools.js";

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
          const models = testerObj.test_unit === "Monitor" ? DUT_MODELS_MONITOR : DUT_MODELS_TV;
          const modelName = models[idx % models.length];
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

          const totalCount = 15 + (idx % 16);
          const failCount = result && result === "fail" ? 1 + (idx % 5) : 0;
          const passCount = totalCount - failCount;

          let content = "[LOG_START]\n";
          content += `Tool Full Name: ${tool.dev_site}_${tool.cat}_${tool.name}\n`;
          content += `Model Name: ${modelName}\n`;
          content += `Test Site: ${site}\n`;
          content += `Test Unit: ${testerObj.test_unit}\n`;
          content += `Tester: ${testerObj.name}\n`;
          content += `Tester Email: ${TESTER_EMAILS[testerObj.name] || "—"}\n`;
          if (result) {
            content += `Result: ${result.toUpperCase()}\n`;
          }
          content += `Fail Count: ${failCount}\n`;
          content += `Pass Count: ${passCount}\n`;
          content += `Total Count: ${totalCount}\n`;
          content += `Test_Log Start: ${fmt(startDate)}\n`;
          content += `Test_Log End: ${fmt(endDate)}\n`;
          content += "[LOG_END]\n";

          fs.writeFileSync(path.join(LOGS_DIR, filename), content, "utf-8");
          fileCount++;
          idx++;
        }
      });
    });
  });
});

console.log(`Generated ${fileCount} log files in ${LOGS_DIR}`);
