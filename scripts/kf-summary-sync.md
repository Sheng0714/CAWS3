KF Chatbot 完成的討論摘要會自動匯入左側 KF Summary，並寫入同一學生、班級與主題的 Notion「KF摘要」欄位。Writing Assistant 產生的大綱則對應「寫作大綱」欄位。

本次修正：

- KF 摘要除了既有完成提示，也辨識具備內容的贊成論點、反對論點與證據段落，支援中英文回覆。一般問答及空白摘要範本不會取代已完成的摘要。
- Writing Assistant 完成的大綱會自動匯入左側 Writing Outline，並同步至「寫作大綱」。除了「自動匯入」，也辨識中英文的完成提示，以及包含立場、兩組論點與證據、反對論點與反駁證據的完整大綱；尚在提問或內容不完整時會保留原本的大綱。
- HTTP 與 HTTPS 都支援 `/notion-api/`；前端也可使用 HTTPS 設定中的 `/api/notion/`。收到 HTML 或未回報 `success: true` 時，不會當作儲存成功。
- 聊天匯入只更新該次變動的摘要或大綱；後端省略未提供的欄位，保留文章、筆記與完整聊天歷史。
- 失敗的匯入依學生、班級與主題保留於瀏覽器；新對話及歷史對話頁提供 `Retry importing`，重新開啟聊天或網路恢復時也會重試。側欄及寫作區讀取資料庫時會保留尚未同步的內容。

更新正式主機的程式後，使用該站原本的 Compose 設定重建 `frontend` 與 `notion-backend`。預設設定的指令為：

```sh
docker compose up -d --build --no-deps frontend notion-backend
```

使用 HTTPS 設定的站台還需要套用 nginx 設定；先用原本的 Compose 參數執行 `docker compose exec nginx nginx -t`，確認通過後執行 `docker compose exec nginx nginx -s reload`。

驗證涵蓋摘要辨識、兩個聊天入口、側欄即時顯示、代理路徑切換、失敗與重新載入後的重試、學生及主題隔離、Notion 欄位映射及長文字分段。測試使用模擬服務，不會寫入正式 Notion。
