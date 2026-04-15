# ToolTrack Dashboard — 完整功能規格書

> **專案名稱：** Tool Tracking Dashboard (ToolTrack)
> **版本：** 2026-04-15
> **技術棧：** React 19 + Vite 7 / Express 5 / SQLite3 (WAL mode)

---

## 目錄

1. [專案概述](#1-專案概述)
2. [系統架構](#2-系統架構)
3. [Sheet 1 — Overview（總覽）](#3-sheet-1--overview總覽)
4. [Sheet 2 — Statistic（統計分析）](#4-sheet-2--statistic統計分析)
5. [Sheet 3 — Upload Log（上傳日誌）](#5-sheet-3--upload-log上傳日誌)
6. [Sheet 4 — Tool Status（工具管理）](#6-sheet-4--tool-status工具管理)
7. [共用元件](#7-共用元件)
8. [後端 API](#8-後端-api)
9. [資料庫 Schema](#9-資料庫-schema)
10. [輸入邊界限制](#10-輸入邊界限制)
11. [主題系統與樣式](#11-主題系統與樣式)
12. [檔案清單](#12-檔案清單)

---

## 1. 專案概述

ToolTrack Dashboard 是一個全端 Web 應用程式，用於追蹤工具測試、使用狀況與完成度指標。支援多站點（TPE、XM、FQ）的工具生命週期管理、測試日誌上傳/驗證、用量統計與排名分析。

### 核心功能

| 功能面向 | 說明 |
|---------|------|
| 工具管理 | CRUD 操作、啟用/退役切換、排序 |
| 日誌管理 | 拖曳上傳 .txt 檔、多層驗證、軟刪除 |
| 用量分析 | 12 個月矩陣表、站點排名、測試者排名 |
| 趨勢分析 | 工具完成度折線圖（日/月/季/年） |
| 主題切換 | 深色/淺色模式，localStorage 持久化 |
| 即時時鐘 | 頁首右側 HH:MM:SS 即時更新 |

---

## 2. 系統架構

```
┌─────────────────────────────────┐
│  Frontend (React 19 + Vite 7)   │
│  http://localhost:5173           │
│  ┌───────────────────────────┐  │
│  │ App.jsx (主狀態容器)       │  │
│  │  ├─ OverviewTab           │  │
│  │  ├─ StatisticTab          │  │
│  │  ├─ UploadLogTab          │  │
│  │  ├─ ToolStatusTab         │  │
│  │  └─ ToolFormModal         │  │
│  └───────────────────────────┘  │
│         │ /api/* proxy          │
└─────────┼───────────────────────┘
          ▼
┌─────────────────────────────────┐
│  Backend (Express 5)            │
│  http://0.0.0.0:3001            │
│  ├─ /api/tools    (CRUD)        │
│  ├─ /api/logs     (CRUD+Upload) │
│  └─ SQLite3 (data.db, WAL)      │
└─────────────────────────────────┘
```

### 狀態管理（App.jsx）

| State | 類型 | 說明 |
|-------|------|------|
| `tab` | string | 當前 Sheet：overview / statistic / upload / directory |
| `tools` | array | 所有工具列表 |
| `logs` | array | 所有日誌列表 |
| `clock` | string | 即時時鐘 HH:MM:SS |
| `theme` | string | "dark" 或 "light"（localStorage 持久化） |
| `notif` | object | 當前通知訊息（3 秒自動消失） |
| `loading` | boolean | 初始資料載入中 |
| `showToolForm` | boolean | 是否顯示新增/編輯 Modal |
| `editingTool` | object\|null | 正在編輯的工具 |
| `toolForm` | object | 表單欄位值 |

**衍生資料（useMemo）：**
- `activeTools`：篩選 `enabled !== false` 的工具
- `R`：由 `computeRankings()` 計算的排名物件

---

## 3. Sheet 1 — Overview（總覽）

**檔案：** `src/components/OverviewTab.jsx`
**Tab ID：** `overview`
**用途：** 追蹤所有啟用工具在 12 個月滾動窗口內的使用狀況

### 3.1 統計卡片

頂部顯示兩張統計卡片：

| 卡片 | 內容 | 元件 |
|------|------|------|
| Total Tools | 啟用工具總數（CountUp 動畫） | `<CountUp>` |
| Total Duration | 所有日誌累計時數（CountUp 動畫） | `<CountUp>` |

### 3.2 12 個月使用矩陣

核心面板，以表格呈現每個工具在每月的使用次數與時數。

#### 控制列

| 控制項 | 類型 | 說明 |
|--------|------|------|
| Period 選擇器 | Dropdown | 選擇結束月份，自動產生往前 12 個月的時間窗口 |
| Filter 選擇器 | Dropdown | 篩選站點：ALL / TPE / XM / FQ / TV / MONITOR |

#### 表格欄位

| 欄位 | 可排序 | 說明 |
|------|--------|------|
| `#` | ✅ | 工具排序序號（sort_order） |
| `Tool Name` | ✅ | 工具名稱 |
| `Total Count / Duration` | ✅ | 篩選期間內的總次數與總時數 |
| `YYYY/MM` × 12 欄 | — | 每月顯示「X 次」計數 + 「X.Xh」時數 |

#### 顯示規則

- 有用量的月份：綠色數字
- 無用量的月份：顯示 "N/A"
- 12 個月內零用量的工具：整列紅色高亮
- 底部 Totals 列：各月與總計的加總

#### 摘要統計

- **已使用工具**：12 個月內有任何用量的工具數
- **未使用工具**：12 個月內完全無用量的工具數

#### 互動行為

| 操作 | 行為 |
|------|------|
| 點擊欄位標頭 | 排序切換（↕ 無排序 → ▲ 升序 → ▼ 降序） |
| 切換 Period | 重新計算 12 個月窗口 |
| 切換 Filter | 依站點/單位篩選日誌 |

**API 呼叫：** 無（使用父元件傳入的 `tools` 和 `logs` 資料）

---

## 4. Sheet 2 — Statistic（統計分析）

**檔案：** `src/components/StatisticTab.jsx`
**Tab ID：** `statistic`
**用途：** 顯示工具用量排名、失敗統計與測試者貢獻

### 4.1 工具完成度趨勢圖

**元件：** `src/components/ToolCompletionTrend.jsx`

SVG 折線圖，呈現工具部署與退役的時間軸。

| 功能 | 說明 |
|------|------|
| 模式切換 | Day / Month / Quarter / Year 按鈕 |
| 綠色線 | 累計已部署工具數 |
| 青色線 | 累計啟用工具數（有退役時才出現） |
| 紅色線 | 累計退役工具數（有退役時才出現） |
| 拖曳平移 | 當資料超出可視範圍時，可拖曳圖表左右移動 |
| 導覽列 | 底部小地圖，可點擊跳轉至特定時間範圍 |
| 懸停提示 | 顯示日期、值的 Tooltip |
| 徽章 | 最大完成數、啟用數、退役數 |

### 4.2 站點用量排名

三欄並列（TPE、XM、FQ），每站包含：

#### 頒獎台（Podium）

| 名次 | 樣式 |
|------|------|
| 🏆 第 1 名 | 金色背景 + 直條圖 |
| 🥈 第 2 名 | 銀色背景 + 直條圖 |
| 🥉 第 3 名 | 銅色背景 + 直條圖 |

#### 完整排名列表

| 欄位 | 說明 |
|------|------|
| 排名 | 數字序號 |
| 工具名稱 | 名稱 |
| 進度條 | 水平進度條（占比可視化） |
| 用量次數 | 數字 |
| 累計時數 | 小時 |
| ⚠ UNUSED | 零用量工具的紅色警告標籤 |

底部顯示該站總計列。

### 4.3 工具失敗排名

**元件：** `<RankingPanel>`

| 項目 | 說明 |
|------|------|
| 標題 | 「工具協助 Debug 累計 Fail 數」 |
| 資料源 | 僅限 `hasReport: true` 的工具 |
| 指標 | 各工具的 Fail 結果計數 |
| 樣式 | 紅色圓點指示器 + 頒獎台 + 排名列表 |
| Total 列 | 所有工具 Fail 數加總 |

### 4.4 測試者上傳排名

| 項目 | 說明 |
|------|------|
| 標題 | 「測試者上傳次數與時數」 |
| 頒獎台 | 前 3 名測試者 |
| 列表欄位 | 排名、姓名、站點徽章、單位徽章、進度條、上傳次數、累計時數 |
| 樣式 | 琥珀色漸層指示器 |

**API 呼叫：** 無（使用 `computeRankings()` 計算的衍生資料）

---

## 5. Sheet 3 — Upload Log（上傳日誌）

**檔案：** `src/components/UploadLogTab.jsx`
**Tab ID：** `upload`
**用途：** 上傳測試日誌檔案、管理已上傳日誌

### 5.1 檔案上傳區

| 項目 | 說明 |
|------|------|
| 拖曳區 | 動態 conic gradient 背景的拖曳放置區域 |
| 圖示 | 📂 |
| 主文字 | "Drop test log files here" |
| 副文字 | "Supports .txt" |
| 按鈕 | "SELECT FILES" 開啟檔案選擇器 |
| 接受格式 | `.txt`（支援多檔同時上傳） |
| 拖曳回饋 | 邊框高亮 + 光暈效果 |

### 5.2 表格控制列

| 控制項 | 類型 | 說明 |
|--------|------|------|
| 搜尋框 | Input | 搜尋 filename / toolName / tester / test_site / testerEmail（不分大小寫） |
| 結果篩選按鈕 | Button Group | ALL / PASS / FAIL / WARN / STOPPED / N/A |

### 5.3 日誌表格

| 欄位 | 可排序 | 說明 |
|------|--------|------|
| `#` | — | 列序號（3 位數） |
| `Upload Time` | ✅ | 上傳時間（預設降序，最新在前） |
| `Tool Name` | ✅ | 工具名稱 |
| `Log Filename` | — | 檔名（截斷省略 + 可點擊下載連結，青色） |
| `Size` | ✅ | 檔案大小（B / KB / MB 格式） |
| `Test Site` | ✅ | TPE / XM / FQ |
| `Test Unit` | ✅ | Monitor / TV / … |
| `Tester` | ✅ | 測試者姓名 |
| `Tester Email` | ✅ | 電子郵件（mailto 連結） |
| `Duration` | ✅ | 測試時長（小時） |
| `Result` | — | 狀態徽章（`<ResultBadge>`） |
| `Action` | — | 刪除按鈕 |

### 5.4 結果徽章樣式

| 結果 | 背景色 | 文字色 |
|------|--------|--------|
| PASS | Teal 背景 | Teal 文字 |
| FAIL | Red 背景 | Red 文字 |
| WARN / STOPPED | Amber 背景 | Amber 文字 |
| N/A / PENDING | Blue 背景 | Blue 文字 |

### 5.5 互動工作流

#### 上傳日誌

1. 拖曳 .txt 檔至上傳區 或 點擊 "SELECT FILES"
2. 檔案以 FormData 發送至 `POST /api/logs/upload`
3. 後端逐檔驗證並回傳結果
4. Toast 通知顯示成功/失敗
5. 表格自動重新載入（`GET /api/logs`）

#### 刪除日誌

1. 點擊刪除按鈕
2. 確認對話框：「確定要刪除 {filename} 嗎？」
3. 確認後呼叫 `DELETE /api/logs/{id}`
4. 表格重新載入 + Toast 通知

### 5.6 API 呼叫

| 方法 | 端點 | 時機 |
|------|------|------|
| `POST` | `/api/logs/upload` | 上傳檔案 |
| `DELETE` | `/api/logs/{id}` | 刪除日誌 |
| `GET` | `/api/logs/download/{filename}` | 點擊檔名連結 |
| `GET` | `/api/logs` | 初始載入與操作後重新整理 |

---

## 6. Sheet 4 — Tool Status（工具管理）

**檔案：** `src/components/ToolStatusTab.jsx`
**Tab ID：** `directory`
**用途：** 瀏覽所有工具（啟用 + 退役）、執行 CRUD 操作

### 6.1 面板標頭

| 項目 | 說明 |
|------|------|
| 標題 | "Tool Status" |
| 徽章 | "{activeTools.length}/{tools.length} active" |

### 6.2 表格控制列

| 控制項 | 類型 | 說明 |
|--------|------|------|
| 搜尋框 | Input | 搜尋 name / dev_site / dev_unit / dev.name（不分大小寫） |
| "+ ADD TOOL" 按鈕 | Button | 開啟新增工具 Modal |

### 6.3 工具表格

| 欄位 | 可排序 | 說明 |
|------|--------|------|
| `#` | ✅ | sort_order（青色指示器） |
| `Retire` | ✅ | Toggle 開關（見 6.4） |
| `Tool Name` | ✅ | 工具名稱（退役工具半透明 + "已退役" 標籤） |
| `Type` | ✅ | HW（青色背景）/ SW（紫色背景） |
| `Dev Site` | ✅ | TPE / XM / FQ |
| `Dev Unit` | ✅ | Monitor / TV / … |
| `Version` | — | 版本號（等寬字體） |
| `Service Start` | ✅ | finish_date（YYYY/MM/DD） |
| `Service End` | ✅ | service_end_date（紅色顯示，若有設定） |
| `Developer` | ✅ | dev.name（支援巢狀 key 排序） |
| `Email` | — | dev.email（mailto 連結） |
| `Ext` | — | dev.ext（分機號碼） |
| `Action` | — | 編輯 + 刪除按鈕 |

### 6.4 退役切換開關（Retire Toggle）

| 狀態 | 顏色 | 說明 |
|------|------|------|
| 未勾選（Active） | 🟢 綠色 | 工具啟用中 |
| 已勾選（Retired） | 🔴 紅色 | 工具已退役 |

**行為邏輯：**
- **退役（Active → Retired）：** 隨時可操作，自動設定 `service_end_date` 為當日
- **重新啟用（Retired → Active）：** 僅在 `service_end_date` 等於當日時允許，啟用後清除 `service_end_date`

**列樣式：**
- 退役工具：40% 不透明度、淡化文字
- 啟用工具：完整不透明度

### 6.5 工具表單 Modal

**元件：** `src/components/ToolFormModal.jsx`

| 觸發 | Modal 標題 |
|------|-----------|
| 點擊 "+ ADD TOOL" | "Add New Tool" |
| 點擊列上的 "Edit" | "Edit Tool"（副標題："Editing {toolName}"） |

#### 表單欄位（雙欄網格排列）

| 欄位 | 類型 | 必填 | Placeholder |
|------|------|------|-------------|
| Tool Name | Input | ✅ | "e.g. TPE Tool 11" |
| Version | Input | — | "1.0.0" |
| Type | Select | — | HW / SW |
| Dev Site | Select | — | TPE / XM / FQ |
| Dev Unit | Input | — | "e.g. Monitor" |
| Service Start | Date | — | （HTML5 date picker） |
| Service End Date | Date | — | （HTML5 date picker） |
| Developer | Input | — | "Name" |
| Email | Input | — | "developer@tpv-tech.com" |
| Ext | Input | — | "82-8888" |

#### 按鈕

| 按鈕 | 功能 |
|------|------|
| Cancel | 關閉 Modal |
| Add Tool / Save Changes | 驗證 → 呼叫 API → 關閉 Modal → 重新載入 |

**日期格式轉換：** 顯示 `YYYY-MM-DD` ↔ 儲存 `YYYY/MM/DD`

### 6.6 互動工作流

#### 新增工具

1. 點擊 "+ ADD TOOL"
2. Modal 開啟（空白表單）
3. 填寫欄位（至少 Tool Name）
4. 點擊 "Add Tool"
5. `POST /api/tools` → 關閉 Modal → 重新載入 → Toast 通知

#### 編輯工具

1. 點擊列上的 "Edit"
2. Modal 開啟（預填資料）
3. 修改欄位
4. 點擊 "Save Changes"
5. `PUT /api/tools/{id}` → 關閉 Modal → 重新載入 → Toast 通知

#### 刪除工具

1. 點擊列上的 "Delete"
2. 確認對話框：「確定要刪除 {name} 嗎？」
3. `DELETE /api/tools/{id}` → 重新載入 → Toast 通知

### 6.7 API 呼叫

| 方法 | 端點 | 時機 |
|------|------|------|
| `GET` | `/api/tools` | 初始載入與操作後重新整理 |
| `POST` | `/api/tools` | 新增工具 |
| `PUT` | `/api/tools/{id}` | 編輯工具 |
| `DELETE` | `/api/tools/{id}` | 刪除工具 |
| `PUT` | `/api/tools/{id}/toggle` | 切換退役/啟用 |

---

## 7. 共用元件

### 7.1 NotificationToast

**檔案：** `src/components/NotificationToast.jsx`

| 項目 | 說明 |
|------|------|
| 位置 | 固定於右下角（24px 內距） |
| 背景 | 深色 #0d1620 + Teal 邊框 |
| 自動消失 | 3 秒後 |
| 類型 | ✓ 成功 / ✗ 錯誤 / ⚠ 警告 |

### 7.2 CountUp

**檔案：** `src/components/CountUp.jsx`

| 項目 | 說明 |
|------|------|
| Props | `target`（目標值）、`suffix`（選填單位） |
| 動畫 | 每 30ms 遞增，直到達到目標值 |
| 用途 | 統計卡片的數字動畫 |

### 7.3 ResultBadge

**檔案：** `src/components/ResultBadge.jsx`

將結果字串映射為帶顏色的狀態徽章（pass → Teal / fail → Red / warn → Amber / n/a → Blue）。

### 7.4 RankingPanel

**檔案：** `src/components/RankingPanel.jsx`

| Props | 說明 |
|-------|------|
| `title` | 面板標題 |
| `data` | `[{name, count}]` 陣列 |
| `dotColor` | 指示器圓點顏色 |
| `barBg` | 進度條背景漸層 |
| `note` | 選填附註 |
| `lowThreshold` | 低於此值顯示警告 |
| `showTotal` | 是否顯示總計列 |

頒獎台（前 3 名） + 完整排名列表 + 可選總計列。

---

## 8. 後端 API

**基本路徑：** `http://localhost:3001/api`
**認證：** 無
**CORS：** 全開

### 8.1 工具端點

#### `GET /api/tools`

回傳所有工具，按 `sort_order` 排序。

**Response：**
```json
[{
  "id": "tpe-1",
  "name": "TPE Tool 1",
  "v": "2.3.0",
  "cat": "HW",
  "dev_site": "TPE",
  "dev_unit": "Monitor",
  "dev": { "name": "王建民", "email": "jm.wang@company.com", "ext": "2501" },
  "finish_date": "2025/06/15",
  "service_end_date": null,
  "hasReport": true,
  "uses": 6,
  "enabled": true,
  "sort_order": 1
}]
```

#### `POST /api/tools`

新增工具。

**Request Body：**
```json
{
  "name": "New Tool",        // 必填
  "v": "1.0.0",
  "cat": "HW",               // HW | SW
  "dev_site": "TPE",         // TPE | XM | FQ
  "dev_unit": "Monitor",
  "dev": { "name": "...", "email": "...", "ext": "..." },
  "finish_date": "2024/01/15",
  "hasReport": false
}
```

**Response：** `{ "success": true, "id": "custom-{timestamp}" }`
**Error：** `400` — Tool name is required

**邏輯：** ID 自動產生為 `custom-{timestamp}`，`sort_order` 設為 MAX+1。

#### `PUT /api/tools/:id`

更新工具。Request Body 同 POST，額外支援 `service_end_date`。

**Response：** `{ "success": true }`
**Error：** `400` — Tool name is required

#### `DELETE /api/tools/:id`

硬刪除工具（不會串聯刪除關聯日誌）。

**Response：** `{ "success": true }`
**Error：** `404` — Tool not found

#### `PUT /api/tools/:id/toggle`

切換工具啟用/退役狀態。

**Response：** `{ "success": true, "enabled": true|false }`
**Error：** `404` — Tool not found

**邏輯：**
- 退役（1→0）：設定 `service_end_date` 為當日
- 啟用（0→1）：清除 `service_end_date`

### 8.2 日誌端點

#### `GET /api/logs`

回傳所有未刪除日誌，按 `uploaded_at DESC` 排序。

**Response：**
```json
[{
  "id": 42,
  "toolId": "tpe-1",
  "toolName": "TPE Tool 1",
  "cat": "HW",
  "filename": "test_2024_01_15.txt",
  "test_site": "TPE",
  "test_unit": "Monitor",
  "tester": "陳小明",
  "testerEmail": "xm.chen@company.com",
  "result": "pass",
  "time": 1705276800000,
  "timeStr": "2024/01/15 14:30",
  "dur": "2.5h",
  "size": 4096,
  "uploadedAt": 1705276900000,
  "uploadedAtStr": "2024/01/15 14:35"
}]
```

#### `POST /api/logs/upload`

批次上傳日誌檔案（multipart/form-data，欄位名 `files`）。

**日誌檔案格式（.txt）：**
```
[LOG_START]
Tool: TPE Tool 1
Test Site: TPE
Test Unit: Monitor
Tester: 陳小明
Tester Email: xm.chen@company.com
Test_Log Start: 2024/01/15 10:30
Test_Log End: 2024/01/15 13:00
Result: PASS
[LOG_END]
```

**多層驗證：**

| 層級 | 檢查項目 | 錯誤訊息 |
|------|---------|---------|
| 1. 檔案層 | 副檔名必須 .txt | 副檔名必須是 .txt |
| 2. 結構層 | 必須包含 `[LOG_START]` 和 `[LOG_END]` | 缺少 [LOG_START] 或 [LOG_END] 標記 |
| 3. 必填欄位 | Tool / Test Site / Tester / Start / End | 缺少必填欄位: [欄位列表] |
| 4. 工具驗證 | Tool 名稱必須存在於資料庫 | 工具「{name}」不存在，請先至 Tool Status 新增該工具 |
| 5. 站點驗證 | Test Site ∈ {TPE, XM, FQ} | Test Site「{site}」不合法，須為 TPE / XM / FQ |
| 6. 結果驗證 | Result ∈ {PASS, FAIL, WARNING, WARN, STOPPED, N/A}（選填） | Result「{result}」不合法 |
| 7. 日期驗證 | 格式 YYYY/MM/DD HH:MM，不允許靜默校正 | Test_Log Start/End 日期不合法 |
| 8. 時序驗證 | End > Start（不可等於） | 結束時間早於或等於開始時間 |
| 9. 重複檢查 | 檔名唯一（非刪除日誌中） | 檔案已存在（重複上傳） |

**Response：**
```json
{
  "results": [
    { "filename": "test.txt", "success": true, "id": 42 },
    { "filename": "bad.txt", "success": false, "error": "缺少必填欄位: Tool" }
  ]
}
```

#### `DELETE /api/logs/:id`

硬刪除日誌紀錄 + 物理刪除 logs/ 目錄中的檔案。

**Response：** `{ "success": true }`
**Error：** `404` — Log not found

#### `GET /api/logs/download/:filename`

下載日誌檔案。

**安全防護：**
- `path.basename()` + `path.resolve()` 防止路徑穿越攻擊
- 驗證解析後路徑仍在 `logs/` 目錄內

**Error：** `403` — Access denied（路徑穿越）/ `404` — File not found

---

## 9. 資料庫 Schema

### tools 表

```sql
CREATE TABLE tools (
  id              TEXT    PRIMARY KEY,          -- 格式: "tpe-1" 或 "custom-{timestamp}"
  name            TEXT    NOT NULL,             -- 工具名稱
  version         TEXT,                         -- 版本號
  cat             TEXT,                         -- 類別: "HW" | "SW"
  dev_site        TEXT,                         -- 開發站點: TPE | XM | FQ
  dev_unit        TEXT,                         -- 開發單位
  dev_name        TEXT,                         -- 開發者姓名
  dev_email       TEXT,                         -- 開發者信箱
  dev_ext         TEXT,                         -- 開發者分機
  finish_date     TEXT,                         -- 服務開始日 (YYYY/MM/DD)
  service_end_date TEXT,                        -- 退役日 (YYYY/MM/DD, NULL=啟用中)
  has_report      INTEGER DEFAULT 0,            -- 是否有 Debug 報告
  uses            INTEGER DEFAULT 0,            -- 使用次數
  enabled         INTEGER DEFAULT 1,            -- 啟用狀態 (1=啟用, 0=退役)
  sort_order      INTEGER                       -- 顯示排序
);
```

### logs 表

```sql
CREATE TABLE logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  tool_id     TEXT,                              -- 關聯 tools.id
  tool_name   TEXT,                              -- 工具名稱（反正規化）
  cat         TEXT,                              -- 類別（反正規化）
  filename    TEXT    UNIQUE,                    -- 原始檔名（唯一）
  test_site   TEXT,                              -- 測試站點: TPE | XM | FQ
  test_unit   TEXT,                              -- 測試單位
  tester      TEXT,                              -- 測試者
  tester_email TEXT,                             -- 測試者信箱
  result      TEXT,                              -- 結果: pass|fail|warning|stopped|n/a
  time        INTEGER,                           -- 測試開始時間 (ms since epoch)
  time_str    TEXT,                              -- 格式化時間 (YYYY/MM/DD HH:MM)
  dur         TEXT,                              -- 測試時長 (e.g. "2.5h")
  size        INTEGER DEFAULT 0,                 -- 檔案大小 (bytes)
  uploaded_at INTEGER,                           -- 上傳時間 (ms since epoch)
  deleted     INTEGER DEFAULT 0                  -- 軟刪除旗標
);
```

### 資料庫初始化流程

1. 建表（IF NOT EXISTS）
2. 執行 Migration（新增缺漏欄位）
3. 回填 `sort_order`（從 rowid）
4. 回填 `size`（讀取檔案統計）
5. 種子資料（從 `src/data/tools.js`，僅在 tools 表為空時）
6. 匯入 `logs/` 目錄中的日誌
7. 回填 `finish_date`（從種子資料）

---

## 10. 輸入邊界限制

所有使用者可輸入的欄位皆設有前後端雙重邊界驗證。

### 10.1 Tool 表單欄位限制

| 欄位 | HTML type | maxLength | 必填 | 格式驗證 | 前端 | 後端 |
|------|-----------|-----------|------|---------|------|------|
| Tool Name | text | **100** | ✅ | 非空（trim） | ✅ | ✅ |
| Version | text | **30** | — | — | ✅ | ✅ |
| Type (cat) | select | — | — | 白名單：`HW`, `SW` | ✅ (select) | ✅ |
| Dev Site | select | — | — | 白名單：`TPE`, `XM`, `FQ` | ✅ (select) | ✅ |
| Dev Unit | text | **50** | — | — | ✅ | ✅ |
| Service Start | date | — | — | 格式 `YYYY/MM/DD` | ✅ (date picker) | ✅ (regex) |
| Service End | date | — | — | 格式 `YYYY/MM/DD` | ✅ (date picker) | ✅ (regex) |
| Developer | text | **50** | — | — | ✅ | ✅ |
| Email | email | **100** | — | Email 格式 (`x@x.x`) | ✅ (type=email) | ✅ (regex) |
| Ext | text | **20** | — | — | ✅ | ✅ |

### 10.2 搜尋框限制

| 位置 | maxLength | 說明 |
|------|-----------|------|
| Tool Status 搜尋 | **200** | 純前端篩選，不發送 API |
| Upload Log 搜尋 | **200** | 純前端篩選，不發送 API |

### 10.3 檔案上傳限制

| 限制項目 | 值 | 前端 | 後端 (Multer) |
|---------|-----|------|---------------|
| 單檔大小 | **5 MB** | ✅ | ✅ (`limits.fileSize`) |
| 單次檔案數 | **20** | ✅ | ✅ (`limits.files`) |
| 檔案類型 | `.txt` | ✅ (`accept`) | ✅ (副檔名檢查) |
| 檔名長度 | **255** 字元 | — | ✅ |
| 欄位大小 | **1 MB** | — | ✅ (`limits.fieldSize`) |

### 10.4 日誌內容欄位限制（解析 .txt 時）

| 欄位 | 最大長度 | 驗證 |
|------|---------|------|
| Tool（工具名稱） | **100** 字元 | 必須存在於 DB |
| Test Site | — | 白名單：`TPE`, `XM`, `FQ` |
| Test Unit | **50** 字元 | 選填 |
| Tester | **50** 字元 | 必填 |
| Tester Email | **100** 字元 | 選填 |
| Result | — | 白名單：`PASS`, `FAIL`, `WARNING`, `WARN`, `STOPPED`, `N/A` |
| Test_Log Start | — | 格式 `YYYY/MM/DD HH:MM`，防止靜默校正 |
| Test_Log End | — | 格式同上，必須晚於 Start |
| Filename | **255** 字元 | 唯一性檢查 |

### 10.5 API 請求限制

| 限制項目 | 值 | 說明 |
|---------|-----|------|
| JSON Body 大小 | **1 MB** | `express.json({ limit: "1mb" })` |
| 一般 API 頻率 | **120 次 / 分鐘** | `express-rate-limit`，適用 `/api/*` |
| 上傳 API 頻率 | **30 次 / 分鐘** | `express-rate-limit`，僅適用 `POST /api/logs/upload` |

### 10.6 安全防護總覽

| 防護項目 | 狀態 | 說明 |
|---------|------|------|
| SQL Injection | ✅ | 全部使用 parameterized queries |
| Path Traversal | ✅ | `path.basename()` + `path.resolve()` 雙重檢查 |
| XSS | ✅ | React 自動 escape + 無 `dangerouslySetInnerHTML` |
| Rate Limiting | ✅ | `express-rate-limit`（一般 120/min、上傳 30/min） |
| 檔案大小限制 | ✅ | Multer `fileSize: 5MB` + 前端檢查 |
| 欄位長度限制 | ✅ | 前端 `maxLength` + 後端 `validateToolBody()` |
| 白名單驗證 | ✅ | cat / dev_site / test_site / result 皆為白名單 |
| 日期格式驗證 | ✅ | 後端 regex `YYYY/MM/DD` + 防止靜默校正 |
| Email 格式驗證 | ✅ | 前端 `type="email"` + 後端 regex |

---

## 11. 主題系統與樣式

**檔案：** `src/App.css`

### CSS 變數

| 變數類別 | Dark Mode | Light Mode |
|---------|-----------|------------|
| 背景 | 深藍 #050b12 | 淺灰 #f0f4f8 |
| 強調色 | Cyan #00d4ff | 深青 |
| 成功色 | Teal #00b894 | 深綠 |
| 警告色 | Amber #f39c12 | 深琥珀 |
| 錯誤色 | Red #e74c3c | 深紅 |
| 文字 | 淺灰 | 深灰/黑 |
| 邊框 | 暗色 + 亮線 | 淺灰 |
| 光暈 | Cyan / Teal shadow | 極少光暈 |

### 動畫

| 動畫名稱 | 用途 |
|---------|------|
| `slideDown` | 面板展開 |
| `fadeIn` | 元素淡入 |
| `spin` | 載入旋轉 |
| `pulse` | 脈衝效果 |
| `rotate` | 旋轉效果 |
| `modalSlide` | Modal 滑入 |
| `warnPulse` | 警告脈衝 |

### 響應式斷點

| 斷點 | 調整 |
|------|------|
| ≤ 1200px | 站點欄位、頒獎台尺寸調整 |
| ≤ 900px | 堆疊佈局、字體縮小 |
| ≤ 600px | 行動裝置最佳化（Tab 可捲動、Modal 全寬） |

---

## 12. 檔案清單

### 前端

| 檔案 | 說明 |
|------|------|
| `index.html` | HTML 進入點 |
| `src/main.jsx` | React 根元件掛載 |
| `src/App.jsx` | 主元件：狀態管理、Tab 路由、API 呼叫 |
| `src/App.css` | 全域樣式（302 行，含深色/淺色主題） |
| `src/components/OverviewTab.jsx` | Sheet 1：12 個月使用矩陣 |
| `src/components/StatisticTab.jsx` | Sheet 2：排名與統計 |
| `src/components/UploadLogTab.jsx` | Sheet 3：日誌上傳與管理 |
| `src/components/ToolStatusTab.jsx` | Sheet 4：工具目錄與 CRUD |
| `src/components/ToolFormModal.jsx` | 新增/編輯工具表單 Modal |
| `src/components/ToolCompletionTrend.jsx` | SVG 趨勢折線圖 |
| `src/components/RankingPanel.jsx` | 通用排名面板 |
| `src/components/CountUp.jsx` | 數字遞增動畫 |
| `src/components/ResultBadge.jsx` | 結果狀態徽章 |
| `src/components/NotificationToast.jsx` | Toast 通知 |
| `src/data/tools.js` | 工具種子資料 + 日誌藍圖 |
| `src/data/rankings.js` | 排名計算函式 |

### 後端

| 檔案 | 說明 |
|------|------|
| `server/index.js` | Express API 伺服器（433 行）：路由、SQLite、驗證 |
| `server/data.db` | SQLite 資料庫 |

### 腳本

| 檔案 | 說明 |
|------|------|
| `scripts/generate-logs.js` | 從 LOG_BLUEPRINT 產生合成測試日誌 |

### 設定

| 檔案 | 說明 |
|------|------|
| `package.json` | 依賴與腳本 |
| `vite.config.js` | Vite 建置設定（proxy /api → localhost:3001） |
| `.github/workflows/deploy.yml` | GitHub Pages CI/CD（Node 20） |

### NPM 腳本

| 指令 | 功能 |
|------|------|
| `npm run dev` | 啟動 Vite 開發伺服器 |
| `npm run build` | 建置產品版本 → `/dist` |
| `npm run preview` | 預覽建置結果 |
| `npm run generate-logs` | 產生合成日誌檔案 |
| `npm run server` | 啟動 Express API 伺服器 |
