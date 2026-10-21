Chatbot 聊天紀錄會依登入學生與實際加入的班級／主題，寫入 Notion 對應資料列的「聊天歷史紀錄」欄位。

- Newchat：每次收到回覆後，自動儲存該輪的學生提問及機器人回覆。
- Chat History：先從 Notion 讀取目前學生、班級、主題的「聊天歷史紀錄」並顯示，再從 RAGFLOW 補入尚未儲存的對話。RAGFLOW 連線失敗仍能查看 Notion 紀錄；接續聊天後也會儲存。
- Notion 讀取失敗時會顯示 Retry loading，不會顯示為沒有歷史紀錄。沒有模式資訊的舊對話仍可閱讀；辨識出原聊天服務後才開放接續對話。
- 各模式的 session 依 sessionId 合併，重試不重複新增；較短的舊快照不會刪除較長的新對話。
- 同步失敗時保留瀏覽器紀錄，顯示 Retry saving；網路恢復時也會重試。
- 文章、筆記及工具區的儲存不再附帶聊天快照，避免覆蓋專用 API 儲存的完整對話。

在正式主機的專案目錄更新本次程式後，重建這三個服務：

```sh
docker compose up -d --build --no-deps backend frontend notion-backend
```

若正式站採用其他 Compose 設定，請使用原本的 `-f` 參數。主後端須有既有的 `NOTION_API_KEY` 及 `NOTION_DATABASE_ID`，Notion 欄位「聊天歷史紀錄」須為 rich_text。已唯讀確認目前設定的資料庫存在這個欄位。

讀取路徑為 `GET /api/activities/myJoined/:userId/chat-history`，以 activityId、groupId 或 className、theme 指定目前範圍；只回傳聊天資料，讀取時不新增 Notion 紀錄，並禁止快取。若同一學生、班級、主題有多筆 Notion 資料列，會分頁讀取並依 sessionId 合併聊天。

儲存路徑為 `POST /api/activities/myJoined/:userId/chat-history`。讀寫都使用網站 JWT 驗證，後端只接受已加入的班級主題，姓名取登入身分、班級及主題取 PostgreSQL，不採用瀏覽器傳入的學生姓名；成功寫入後重新讀取 Notion，確認文字一致才回傳 success。

資料格式維持 JSON session 陣列，保留 messages 的 role、content、created_at，供原本教師端閱讀。此次專用寫入只更新聊天欄位。長文字會分段寫入；若合併後超過 Notion 欄位可接受的大小，會明確回報 413 並保留原資料，沒有截斷後冒充成功。

舊瀏覽器快取若未記錄學生身分，不會直接歸給目前登入者。開啟該學生、班級、主題的 Chat History，從具有學生範圍的 RAGFLOW 查詢載入後，才會補寫到 Notion。

驗證涵蓋一般回覆自動儲存、歷史補寫及重試、超過 10 個 session／30 則訊息的完整傳送、學生與主題隔離、重複與並行請求、長文字分段、舊快照及文章筆記儲存保護。使用模擬服務測試，不會把測試對話寫入正式 Notion。
