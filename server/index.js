import express from "express";
import Database from "better-sqlite3";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.join(__dirname, "..", "logs");
const DB_PATH = path.join(__dirname, "data.db");
const UPLOADS_TMP = path.join(__dirname, "uploads");

// Ensure directories exist
[LOGS_DIR, UPLOADS_TMP].forEach((d) => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: UPLOADS_TMP });

// ══════════════════════════════════════════════════════════════════════════════
// SQLite Setup
// ══════════════════════════════════════════════════════════════════════════════

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS tools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    version TEXT,
    cat TEXT,
    dev_site TEXT,
    dev_unit TEXT,
    dev_name TEXT,
    dev_email TEXT,
    dev_ext TEXT,
    finish_date TEXT,
    has_report INTEGER DEFAULT 0,
    uses INTEGER DEFAULT 0,
    enabled INTEGER DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_id TEXT,
    tool_name TEXT,
    cat TEXT,
    filename TEXT UNIQUE,
    test_site TEXT,
    test_unit TEXT,
    tester TEXT,
    tester_email TEXT,
    result TEXT,
    time INTEGER,
    time_str TEXT,
    dur TEXT,
    size INTEGER DEFAULT 0,
    uploaded_at INTEGER,
    deleted INTEGER DEFAULT 0
  );
`);

// Migration: add columns for existing databases
try { db.exec("ALTER TABLE logs ADD COLUMN size INTEGER DEFAULT 0"); } catch(e) { /* column already exists */ }
try { db.exec("ALTER TABLE tools ADD COLUMN finish_date TEXT"); } catch(e) { /* column already exists */ }
try { db.exec("ALTER TABLE tools DROP COLUMN unit"); } catch(e) { /* column already dropped */ }
try { db.exec("ALTER TABLE tools ADD COLUMN sort_order INTEGER DEFAULT 0"); } catch(e) { /* column already exists */ }
try { db.exec("ALTER TABLE tools ADD COLUMN service_end_date TEXT"); } catch(e) { /* column already exists */ }

// Backfill sort_order from rowid for existing tools
(() => {
  const need = db.prepare("SELECT COUNT(*) as c FROM tools WHERE sort_order = 0 OR sort_order IS NULL").get().c;
  if (need > 0) {
    db.exec("UPDATE tools SET sort_order = rowid WHERE sort_order = 0 OR sort_order IS NULL");
  }
})();

// Backfill size for existing logs that have size=0
(()=>{
  const rows = db.prepare("SELECT id, filename FROM logs WHERE size = 0 OR size IS NULL").all();
  if (rows.length > 0) {
    const update = db.prepare("UPDATE logs SET size = ? WHERE id = ?");
    db.transaction(() => {
      rows.forEach(r => {
        const fp = path.join(LOGS_DIR, r.filename);
        if (fs.existsSync(fp)) {
          update.run(fs.statSync(fp).size, r.id);
        }
      });
    })();
  }
})();


// ══════════════════════════════════════════════════════════════════════════════
// Log Parser + Validation
// ══════════════════════════════════════════════════════════════════════════════

const VALID_SITES = ["TPE", "XM", "FQ"];
const VALID_RESULTS = { PASS: "pass", FAIL: "fail", WARNING: "warning", WARN: "warning", STOPPED: "stopped", "N/A": "n/a" };

const fmtDate = (d) =>
  `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;

function validateAndParseLog(text, filename) {
  // ── Layer 1: File ──
  if (!filename.endsWith(".txt")) {
    return { ok: false, error: "副檔名必須是 .txt" };
  }

  // ── Layer 2: Structure ──
  if (!text.includes("[LOG_START]") || !text.includes("[LOG_END]")) {
    return { ok: false, error: "缺少 [LOG_START] 或 [LOG_END] 標記" };
  }

  // Only parse fields between [LOG_START] and [LOG_END] — content below is ignored
  const header = text.substring(text.indexOf("[LOG_START]"), text.indexOf("[LOG_END]"));

  const get = (key) => {
    const m = header.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
    return m ? m[1].trim() : null;
  };

  const toolName = get("Tool");
  const site = get("Test Site");
  const tester = get("Tester");
  const testerEmail = get("Tester Email") || "—";
  const testUnit = get("Test Unit");
  const resultRaw = get("Result");
  const logStart = get("Test_Log Start");
  const logEnd = get("Test_Log End");

  // Required fields
  const missing = [];
  if (!toolName) missing.push("Tool");
  if (!site) missing.push("Test Site");
  if (!tester) missing.push("Tester");
  if (!logStart) missing.push("Test_Log Start");
  if (!logEnd) missing.push("Test_Log End");
  if (missing.length > 0) {
    return { ok: false, error: `缺少必填欄位: ${missing.join("、")}` };
  }

  // ── Layer 3: Data ──

  // Tool must exist in DB
  const toolRow = db.prepare("SELECT id, cat, has_report FROM tools WHERE name = ?").get(toolName);
  if (!toolRow) {
    return { ok: false, error: `工具「${toolName}」不存在，請先至 Tool Status 新增該工具` };
  }

  // Test Site must be valid
  if (!VALID_SITES.includes(site)) {
    return { ok: false, error: `Test Site「${site}」不合法，須為 ${VALID_SITES.join(" / ")}` };
  }

  // Result: if present, must be valid; if absent, OK (non-testing tools)
  let result = null;
  if (resultRaw) {
    result = VALID_RESULTS[resultRaw.toUpperCase()];
    if (!result) {
      return { ok: false, error: `Result「${resultRaw}」不合法，須為 PASS / FAIL / WARNING / N/A` };
    }
  }

  // Date format
  const startDate = new Date(logStart.replace(/\//g, "-"));
  const endDate = new Date(logEnd.replace(/\//g, "-"));
  if (isNaN(startDate.getTime())) {
    return { ok: false, error: `Test_Log Start 日期格式錯誤:「${logStart}」` };
  }
  if (isNaN(endDate.getTime())) {
    return { ok: false, error: `Test_Log End 日期格式錯誤:「${logEnd}」` };
  }

  // End must be after Start
  if (endDate <= startDate) {
    return { ok: false, error: `結束時間（${logEnd}）早於或等於開始時間（${logStart}）` };
  }

  const durH = ((endDate - startDate) / 3600000).toFixed(1);

  return {
    ok: true,
    data: {
      tool_id: toolRow.id,
      tool_name: toolName,
      cat: toolRow.cat,
      filename,
      test_site: site,
      test_unit: testUnit || "—",
      tester,
      tester_email: testerEmail,
      result,
      time: startDate.getTime(),
      time_str: fmtDate(startDate),
      dur: `${durH}h`,
    },
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// Seed & Import
// ══════════════════════════════════════════════════════════════════════════════

async function seedTools() {
  // Only seed when tools table is empty (first start or after DB delete)
  // This preserves any Add/Edit/Delete changes made via the UI
  const count = db.prepare("SELECT COUNT(*) as c FROM tools").get().c;
  if (count > 0) return;

  try {
    const { TOOLS } = await import("../src/data/tools.js");
    if (!TOOLS || !TOOLS.length) return;
    const insert = db.prepare(
      `INSERT INTO tools (id, name, version, cat, dev_site, dev_unit, dev_name, dev_email, dev_ext, finish_date, has_report, uses, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    db.transaction(() => {
      TOOLS.forEach((t, i) => {
        insert.run(t.id, t.name, t.v, t.cat, t.dev_site, t.dev_unit, t.dev.name, t.dev.email, t.dev.ext, t.finish_date || null, t.hasReport ? 1 : 0, t.uses || 0, i + 1);
      });
    })();
  } catch(e) { /* seed file not found — clean start, tools added via UI */ }
}

function importLogs() {
  if (!fs.existsSync(LOGS_DIR)) {
    console.log('No logs/ directory found. Run "npm run generate-logs" first.');
    return 0;
  }
  const files = fs.readdirSync(LOGS_DIR).filter((f) => f.endsWith(".log") || f.endsWith(".txt"));
  const insert = db.prepare(
    `INSERT OR IGNORE INTO logs (tool_id, tool_name, cat, filename, test_site, test_unit, tester, tester_email, result, time, time_str, dur, size, uploaded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  let imported = 0;
  db.transaction(() => {
    files.forEach((filename) => {
      const filePath = path.join(LOGS_DIR, filename);
      const content = fs.readFileSync(filePath, "utf-8");
      const v = validateAndParseLog(content, filename);
      if (v.ok) {
        const p = v.data;
        const fileSize = fs.statSync(filePath).size;
        const info = insert.run(p.tool_id, p.tool_name, p.cat, p.filename, p.test_site, p.test_unit, p.tester, p.tester_email, p.result, p.time, p.time_str, p.dur, fileSize, p.time);
        if (info.changes > 0) imported++;
      }
    });
  })();
  return imported;
}

// ══════════════════════════════════════════════════════════════════════════════
// API Routes
// ══════════════════════════════════════════════════════════════════════════════

// ── Tools ──
app.get("/api/tools", (req, res) => {
  const rows = db.prepare("SELECT * FROM tools ORDER BY sort_order").all();
  res.json(rows.map((t) => ({
    id: t.id, name: t.name, v: t.version, cat: t.cat,
    dev_site: t.dev_site, dev_unit: t.dev_unit,
    dev: { name: t.dev_name, email: t.dev_email, ext: t.dev_ext },
    finish_date: t.finish_date || "", service_end_date: t.service_end_date || "", hasReport: !!t.has_report, uses: t.uses, enabled: !!t.enabled,
    sort_order: t.sort_order,
  })));
});

app.post("/api/tools", (req, res) => {
  const t = req.body;
  const id = `custom-${Date.now()}`;
  const maxOrder = db.prepare("SELECT COALESCE(MAX(sort_order),0) as m FROM tools").get().m;
  db.prepare(
    `INSERT INTO tools (id, name, version, cat, dev_site, dev_unit, dev_name, dev_email, dev_ext, finish_date, has_report, uses, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`
  ).run(id, t.name, t.v, t.cat, t.dev_site, t.dev_unit, t.dev.name, t.dev.email, t.dev.ext, t.finish_date || null, t.hasReport ? 1 : 0, maxOrder + 1);
  res.json({ success: true, id });
});

app.put("/api/tools/:id", (req, res) => {
  const t = req.body;
  db.prepare(
    `UPDATE tools SET name=?, version=?, cat=?, dev_site=?, dev_unit=?, dev_name=?, dev_email=?, dev_ext=?, finish_date=?, service_end_date=?, has_report=? WHERE id=?`
  ).run(t.name, t.v, t.cat, t.dev_site, t.dev_unit, t.dev.name, t.dev.email, t.dev.ext, t.finish_date || null, t.service_end_date || null, t.hasReport ? 1 : 0, req.params.id);
  res.json({ success: true });
});

app.delete("/api/tools/:id", (req, res) => {
  const info = db.prepare("DELETE FROM tools WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Tool not found" });
  res.json({ success: true });
});

app.put("/api/tools/:id/toggle", (req, res) => {
  const before = db.prepare("SELECT enabled FROM tools WHERE id = ?").get(req.params.id);
  if (!before) return res.status(404).json({ error: "Tool not found" });
  const nowEnabled = !before.enabled;
  const fmtNow = () => { const d = new Date(); return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}`; };
  if (nowEnabled) {
    db.prepare("UPDATE tools SET enabled = 1, service_end_date = NULL WHERE id = ?").run(req.params.id);
  } else {
    db.prepare("UPDATE tools SET enabled = 0, service_end_date = ? WHERE id = ?").run(fmtNow(), req.params.id);
  }
  res.json({ success: true, enabled: !!nowEnabled });
});

// ── Logs ──
app.get("/api/logs", (req, res) => {
  const rows = db.prepare("SELECT * FROM logs WHERE deleted = 0 ORDER BY uploaded_at DESC").all();
  const fmtTime = (ts) => {
    const d = new Date(ts);
    return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  };
  res.json(rows.map((l) => ({
    id: l.id, toolId: l.tool_id, toolName: l.tool_name, cat: l.cat,
    filename: l.filename, test_site: l.test_site, test_unit: l.test_unit,
    tester: l.tester, testerEmail: l.tester_email,
    result: l.result, time: l.time, timeStr: l.time_str, dur: l.dur,
    size: l.size || 0,
    uploadedAt: l.uploaded_at, uploadedAtStr: fmtTime(l.uploaded_at),
  })));
});

app.post("/api/logs/upload", upload.array("files"), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }
  const results = [];
  const insert = db.prepare(
    `INSERT INTO logs (tool_id, tool_name, cat, filename, test_site, test_unit, tester, tester_email, result, time, time_str, dur, size, uploaded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  req.files.forEach((file) => {
    // Decode UTF-8 filename (multer/busboy defaults to Latin-1)
    const originalName = Buffer.from(file.originalname, "latin1").toString("utf8");
    try {
      const content = fs.readFileSync(file.path, "utf-8");
      const v = validateAndParseLog(content, originalName);
      if (!v.ok) {
        results.push({ filename: originalName, success: false, error: v.error });
      } else {
        const p = v.data;
        // Check for duplicate filename
        const existing = db.prepare("SELECT id FROM logs WHERE filename = ? AND deleted = 0").get(p.filename);
        if (existing) {
          results.push({ filename: originalName, success: false, error: "檔案已存在（重複上傳）" });
        } else {
          // If previously soft-deleted, hard-delete first
          db.prepare("DELETE FROM logs WHERE filename = ?").run(p.filename);
          fs.copyFileSync(file.path, path.join(LOGS_DIR, originalName));
          const info = insert.run(p.tool_id, p.tool_name, p.cat, p.filename, p.test_site, p.test_unit, p.tester, p.tester_email, p.result, p.time, p.time_str, p.dur, file.size, Date.now());
          results.push({ filename: originalName, success: true, id: info.lastInsertRowid });
        }
      }
    } catch (err) {
      results.push({ filename: originalName, success: false, error: err.message });
    } finally {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }
  });
  res.json({ results });
});

app.get("/api/logs/download/:filename", (req, res) => {
  const filePath = path.join(LOGS_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });
  res.download(filePath, req.params.filename);
});

app.delete("/api/logs/:id", (req, res) => {
  const row = db.prepare("SELECT filename FROM logs WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Log not found" });
  db.prepare("DELETE FROM logs WHERE id = ?").run(req.params.id);
  // Also delete physical file so importLogs() won't re-import on restart
  const filePath = path.join(LOGS_DIR, row.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════════════════════
// Start
// ══════════════════════════════════════════════════════════════════════════════

async function backfillCloseDate() {
  const nullRows = db.prepare("SELECT COUNT(*) as c FROM tools WHERE finish_date IS NULL").get().c;
  if (nullRows > 0) {
    try {
      const { TOOLS } = await import("../src/data/tools.js");
      const upd = db.prepare("UPDATE tools SET finish_date = ? WHERE id = ?");
      db.transaction(() => {
        TOOLS.forEach(t => { if (t.finish_date) upd.run(t.finish_date, t.id); });
      })();
    } catch(e) { /* seed file may not exist */ }
  }
}

async function start() {
  await seedTools();
  await backfillCloseDate();
  const imported = importLogs();
  const total = db.prepare("SELECT COUNT(*) as count FROM logs WHERE deleted = 0").get().count;

  app.listen(3001, "0.0.0.0", () => {
    console.log("──────────────────────────────────────");
    console.log("  ToolTrack API Server");
    console.log("  http://0.0.0.0:3001");
    console.log(`  Tools: ${db.prepare("SELECT COUNT(*) as c FROM tools").get().c}`);
    console.log(`  Logs:  ${total} (${imported} newly imported)`);
    console.log("──────────────────────────────────────");
  });
}

start();
