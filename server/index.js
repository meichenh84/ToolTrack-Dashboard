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
    unit TEXT,
    dev_name TEXT,
    dev_email TEXT,
    dev_ext TEXT,
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
    uploaded_at INTEGER,
    deleted INTEGER DEFAULT 0
  );
`);

// ══════════════════════════════════════════════════════════════════════════════
// Log Parser
// ══════════════════════════════════════════════════════════════════════════════

function parseLogContent(text, filename) {
  const get = (key) => {
    const m = text.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
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

  if (!toolName || !site || !tester || !logStart || !logEnd) return null;

  const startDate = new Date(logStart.replace(/\//g, "-"));
  const endDate = new Date(logEnd.replace(/\//g, "-"));
  const durMs = endDate.getTime() - startDate.getTime();
  const durH = (durMs / (1000 * 60 * 60)).toFixed(1);

  const resultMap = { PASS: "pass", FAIL: "fail", WARNING: "warning", WARN: "warning" };
  const result = resultRaw ? resultMap[resultRaw.toUpperCase()] || null : null;

  // Match tool from DB
  const toolRow = db.prepare("SELECT id, cat, has_report FROM tools WHERE name = ?").get(toolName);

  return {
    tool_id: toolRow ? toolRow.id : `unknown-${Date.now()}`,
    tool_name: toolName,
    cat: toolRow ? toolRow.cat : "—",
    filename,
    test_site: site,
    test_unit: testUnit || "—",
    tester,
    tester_email: testerEmail,
    result,
    time: startDate.getTime(),
    time_str: `${startDate.getFullYear()}/${String(startDate.getMonth() + 1).padStart(2, "0")}/${String(startDate.getDate()).padStart(2, "0")} ${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}`,
    dur: toolRow && !toolRow.has_report ? "—" : `${durH}h`,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// Seed & Import
// ══════════════════════════════════════════════════════════════════════════════

async function seedTools() {
  const { TOOLS } = await import("../src/data/tools.js");
  const insert = db.prepare(
    `INSERT OR REPLACE INTO tools (id, name, version, cat, dev_site, dev_unit, unit, dev_name, dev_email, dev_ext, has_report, uses)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  db.transaction(() => {
    TOOLS.forEach((t) => {
      insert.run(t.id, t.name, t.v, t.cat, t.dev_site, t.dev_unit, t.unit, t.dev.name, t.dev.email, t.dev.ext, t.hasReport ? 1 : 0, t.uses || 0);
    });
  })();
}

function importLogs() {
  if (!fs.existsSync(LOGS_DIR)) {
    console.log('No logs/ directory found. Run "npm run generate-logs" first.');
    return 0;
  }
  const files = fs.readdirSync(LOGS_DIR).filter((f) => f.endsWith(".log") || f.endsWith(".txt"));
  const insert = db.prepare(
    `INSERT OR IGNORE INTO logs (tool_id, tool_name, cat, filename, test_site, test_unit, tester, tester_email, result, time, time_str, dur, uploaded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  let imported = 0;
  db.transaction(() => {
    files.forEach((filename) => {
      const content = fs.readFileSync(path.join(LOGS_DIR, filename), "utf-8");
      const p = parseLogContent(content, filename);
      if (p) {
        const info = insert.run(p.tool_id, p.tool_name, p.cat, p.filename, p.test_site, p.test_unit, p.tester, p.tester_email, p.result, p.time, p.time_str, p.dur, p.time);
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
  const rows = db.prepare("SELECT * FROM tools ORDER BY id").all();
  res.json(rows.map((t) => ({
    id: t.id, name: t.name, v: t.version, cat: t.cat,
    dev_site: t.dev_site, dev_unit: t.dev_unit, unit: t.unit,
    dev: { name: t.dev_name, email: t.dev_email, ext: t.dev_ext },
    hasReport: !!t.has_report, uses: t.uses, enabled: !!t.enabled,
  })));
});

app.post("/api/tools", (req, res) => {
  const t = req.body;
  const id = `custom-${Date.now()}`;
  db.prepare(
    `INSERT INTO tools (id, name, version, cat, dev_site, dev_unit, unit, dev_name, dev_email, dev_ext, has_report, uses)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
  ).run(id, t.name, t.v, t.cat, t.dev_site, t.dev_unit, t.unit, t.dev.name, t.dev.email, t.dev.ext, t.hasReport ? 1 : 0);
  res.json({ success: true, id });
});

app.put("/api/tools/:id", (req, res) => {
  const t = req.body;
  db.prepare(
    `UPDATE tools SET name=?, version=?, cat=?, dev_site=?, dev_unit=?, unit=?, dev_name=?, dev_email=?, dev_ext=?, has_report=? WHERE id=?`
  ).run(t.name, t.v, t.cat, t.dev_site, t.dev_unit, t.unit, t.dev.name, t.dev.email, t.dev.ext, t.hasReport ? 1 : 0, req.params.id);
  res.json({ success: true });
});

app.delete("/api/tools/:id", (req, res) => {
  db.prepare("DELETE FROM tools WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.put("/api/tools/:id/toggle", (req, res) => {
  db.prepare("UPDATE tools SET enabled = NOT enabled WHERE id = ?").run(req.params.id);
  const row = db.prepare("SELECT enabled FROM tools WHERE id = ?").get(req.params.id);
  res.json({ success: true, enabled: !!row.enabled });
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
    uploadedAt: l.uploaded_at, uploadedAtStr: fmtTime(l.uploaded_at),
  })));
});

app.post("/api/logs/upload", upload.array("files"), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }
  const results = [];
  const insert = db.prepare(
    `INSERT INTO logs (tool_id, tool_name, cat, filename, test_site, test_unit, tester, tester_email, result, time, time_str, dur, uploaded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  req.files.forEach((file) => {
    try {
      const content = fs.readFileSync(file.path, "utf-8");
      const p = parseLogContent(content, file.originalname);
      if (p) {
        // Check for duplicate filename
        const existing = db.prepare("SELECT id FROM logs WHERE filename = ? AND deleted = 0").get(p.filename);
        if (existing) {
          results.push({ filename: file.originalname, success: false, error: "檔案已存在（重複上傳）" });
        } else {
          // If previously soft-deleted, hard-delete first
          db.prepare("DELETE FROM logs WHERE filename = ?").run(p.filename);
          fs.copyFileSync(file.path, path.join(LOGS_DIR, file.originalname));
          const info = insert.run(p.tool_id, p.tool_name, p.cat, p.filename, p.test_site, p.test_unit, p.tester, p.tester_email, p.result, p.time, p.time_str, p.dur, Date.now());
          results.push({ filename: file.originalname, success: true, id: info.lastInsertRowid });
        }
      } else {
        results.push({ filename: file.originalname, success: false, error: "格式不符" });
      }
    } catch (err) {
      results.push({ filename: file.originalname, success: false, error: err.message });
    } finally {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }
  });
  res.json({ results });
});

app.delete("/api/logs/:id", (req, res) => {
  db.prepare("UPDATE logs SET deleted = 1 WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════════════════════
// Start
// ══════════════════════════════════════════════════════════════════════════════

async function start() {
  await seedTools();
  const imported = importLogs();
  const total = db.prepare("SELECT COUNT(*) as count FROM logs WHERE deleted = 0").get().count;

  app.listen(3001, () => {
    console.log("──────────────────────────────────────");
    console.log("  ToolTrack API Server");
    console.log("  http://localhost:3001");
    console.log(`  Tools: ${db.prepare("SELECT COUNT(*) as c FROM tools").get().c}`);
    console.log(`  Logs:  ${total} (${imported} newly imported)`);
    console.log("──────────────────────────────────────");
  });
}

start();
