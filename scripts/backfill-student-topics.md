登入後自動同步已接到原本的 `GET /api/activities/myJoined/:userId`。這支 API 從正式 PostgreSQL 讀取學生已加入的班級主題後，用登入身分中的姓名，把 `Activity.title` 寫入 Notion 的「班級」、`Group.groupName` 寫入「主題」。既有主題及已結束主題都會補寫；同一學生／班級／主題不重複新增。寫入後重新讀取 Notion，確認欄位才回報成功。

在 **210.240.193.193 正式主機** 的專案目錄更新程式後執行：

```sh
docker compose up -d --build --no-deps backend frontend
```

使用 HTTPS Compose 設定時，改為：

```sh
docker compose -f docker-compose.https.yml up -d --build --no-deps backend frontend
```

後端必須載入既有的 `NOTION_API_KEY` 與 `NOTION_DATABASE_ID`；兩份 Compose 設定皆從 `frontend/.env` 提供。部署後重新整理學生首頁即可觸發同步。API 保留原班級清單陣列格式，使用 `X-Notion-Sync-Status` 回報 `success` 或 `failed`；前端遇到未確認成功時顯示 Retry saving，再呼叫相同班級載入 API。Notion 暫時失敗不會刪除班級清單，下次登入／重新整理也會再次嘗試。

只會補寫已載入的這位學生的紀錄。尚未登入的其他學生，可用下方批次程式從正式 PostgreSQL 補寫。請勿在只有本機測試班級的資料庫執行正式補寫。

批次程式直接讀取原 PostgreSQL 加入紀錄，再直接呼叫 Notion API；不需要先部署前端或 Notion 服務。

如果正式網站只能從已登入的瀏覽器存取，可在 `http://210.240.193.193` 的學生頁面開啟開發人員工具 Console，執行 `scripts/export-formal-student-topics.js`，下載 `formal-student-topics.json`。檔案僅包含目前學生的姓名、已加入的班級／主題及其 ID，不包含登入 token。

使用這份正式網站匯出資料時，不需要連到原 PostgreSQL：

```sh
node backend/backfill-student-topics.js --input /path/to/formal-student-topics.json --dry-run
node backend/backfill-student-topics.js --input /path/to/formal-student-topics.json --apply
```

學生帳號只能匯出自己已加入的班級主題，無法代表全班其他學生的加入紀錄。

在原資料庫所在主機的專案目錄執行，使用目前網站的 Docker Compose 設定檔。資料庫帳密預設使用網站實際的 `backend/config/db.config.js`。

檢查資料庫內已加入的學生班級主題數量，不寫入 Notion：

```sh
docker compose run --rm --no-deps -v ./backend/backfill-student-topics.js:/app/backfill-student-topics.js:ro -v ./backend/notion-student-topics.js:/app/notion-student-topics.js:ro backend node /app/backfill-student-topics.js --dry-run
```

補寫所有既有學生班級主題，包含已結束的活動：

```sh
docker compose run --rm --no-deps -v ./backend/backfill-student-topics.js:/app/backfill-student-topics.js:ro -v ./backend/notion-student-topics.js:/app/notion-student-topics.js:ro backend node /app/backfill-student-topics.js --apply
```

程式只讀取網站的加入紀錄，排除班級建立者自動加入自己的班級。Notion 依學生姓名、班級、主題比對：已有完整紀錄時保留；若學生唯一的紀錄兩個欄位皆為空白，只填入班級、主題，保留帳號、密碼和文章；否則新增對應紀錄。每筆完成後都從 Notion 重新讀取確認欄位，再計入成功數。

結果會列出 `created`（新增）、`updated`（補入空白欄位）、`unchanged`（已存在）、`failed`（失敗）筆數，可重跑。Docker Compose 必須提供目前的 DB 與 Notion 環境設定；使用 `docker-compose.https.yml` 等其他檔案部署時，替各指令加入相同的 `-f` 設定。

從 Windows 本機連到既有 Docker 資料庫（本專案對外連接埠為 5433）時，可在 PowerShell 執行：

```powershell
$env:SOURCE_DB_HOST = '127.0.0.1'
$env:SOURCE_DB_PORT = '5433'
node backend/backfill-student-topics.js --dry-run
node backend/backfill-student-topics.js --apply
```
