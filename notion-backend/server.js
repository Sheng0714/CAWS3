
// const express = require('express');
// const { Client } = require('@notionhq/client');
// const cors = require('cors');

// const app = express();
// app.use(express.json());

// // 配置 CORS
// app.use(cors({
//   origin: 'http://localhost', // 明確指定前端來源
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
// }));

// app.options('*', cors());

// // 初始化 Notion 客戶端
// const notion = new Client({ auth: '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' });
// const NOTION_DATABASE_ID = '1e0f62c3743f802aa3add604507ef1e7';

// // 處理提交到 Notion 的端點
// app.post('/api/submit-to-notion', async (req, res) => {
//   console.log('收到請求:', req.body); // 記錄前端發送的數據

//   const { studentName, theme, essayContent, className } = req.body;

//   // 驗證請求數據
//   if (!studentName || !theme || !essayContent || !className) {
//     return res.status(400).json({
//       success: false,
//       error: '缺少必要字段：studentName, theme, essayContent 和 className 為必填項',
//     });
//   }

//   try {
//     const response = await notion.pages.create({
//       parent: { database_id: NOTION_DATABASE_ID },
//       properties: {
//         '學生姓名': {
//           title: [
//             {
//               text: {
//                 content: studentName,
//               },
//             },
//           ],
//         },
//         '班級': {
//           rich_text: [
//             {
//               text: {
//                 content: className,
//               },
//             },
//           ],
//         },
//         '主題': {
//           rich_text: [
//             {
//               text: {
//                 content: theme,
//               },
//             },
//           ],
//         },
//         '議論文內容': {
//           rich_text: [
//             {
//               text: {
//                 content: essayContent,
//               },
//             },
//           ],
//         },
//       },
//     });
//     console.log('Notion API 回應:', response); // 記錄 Notion API 回應
//     res.json({ success: true, data: response });
//   } catch (error) {
//     console.error('Notion API 錯誤詳情:', error); // 記錄詳細錯誤
//     console.error('錯誤堆棧:', error.stack); // 記錄錯誤堆棧
//     res.status(500).json({
//       success: false,
//       error: error.message || '無法提交到 Notion，請檢查伺服器日誌',
//     });
//   }
// });

// const PORT = 4000;
// app.listen(PORT, () => {
//   console.log(`伺服器運行在 http://localhost:${PORT}`);
// });











// const express = require('express');
// const { Client } = require('@notionhq/client');
// const cors = require('cors');

// const app = express();
// app.use(express.json());

// // 配置 CORS
// app.use(cors({
//   origin: 'http://localhost', // 明確指定前端來源
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
// }));

// app.options('*', cors());

// // 初始化 Notion 客戶端
// const notion = new Client({ auth: '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' });
// const NOTION_DATABASE_ID = '1e0f62c3743f802aa3add604507ef1e7';

// // 處理提交到 Notion 的端點
// app.post('/api/submit-to-notion', async (req, res) => {
//   console.log('收到請求:', req.body); // 記錄前端發送的數據

//   const { studentName, theme, essayContent, className } = req.body;

//   // 驗證請求數據
//   if (!studentName || !theme || !essayContent || !className) {
//     return res.status(400).json({
//       success: false,
//       error: '缺少必要字段：studentName, theme, essayContent 和 className 為必填項',
//     });
//   }

//   try {
//     const response = await notion.pages.create({
//       parent: { database_id: NOTION_DATABASE_ID },
//       properties: {
//         '學生姓名': {
//           title: [
//             {
//               text: {
//                 content: studentName,
//               },
//             },
//           ],
//         },
//         '主題': {
//           rich_text: [
//             {
//               text: {
//                 content: theme,
//               },
//             },
//           ],
//         },
//         '議論文內容': {
//           rich_text: [
//             {
//               text: {
//                 content: essayContent,
//               },
//             },
//           ],
//         },
//         '班級': {
//           rich_text: [
//             {
//               text: {
//                 content: className,
//               },
//             },
//           ],
//         },
//       },
//     });
//     console.log('Notion API 回應:', response); // 記錄 Notion API 回應
//     res.json({ success: true, data: response });
//   } catch (error) {
//     console.error('Notion API 錯誤詳情:', error); // 記錄詳細錯誤
//     console.error('錯誤堆棧:', error.stack); // 記錄錯誤堆棧
//     res.status(500).json({
//       success: false,
//       error: error.message || '無法提交到 Notion，請檢查伺服器日誌',
//     });
//   }
// });

// // 新增端點：根據學生姓名、班級名稱和主題名稱從 Notion 資料庫中獲取議論文內容
// app.get('/api/get-essay/:studentName', async (req, res) => {
//   const { studentName } = req.params;
//   const { className, theme } = req.query;

//   if (!studentName || !className || !theme) {
//     return res.status(400).json({
//       success: false,
//       error: '缺少必要參數：studentName, className 和 theme 為必填項',
//     });
//   }

//   try {
//     const response = await notion.databases.query({
//       database_id: NOTION_DATABASE_ID,
//       filter: {
//         and: [
//           {
//             property: '學生姓名',
//             title: {
//               equals: studentName,
//             },
//           },
//           {
//             property: '班級',
//             rich_text: {
//               equals: className,
//             },
//           },
//           {
//             property: '主題',
//             rich_text: {
//               equals: theme,
//             },
//           },
//         ],
//       },
//     });

//     if (response.results.length === 0) {
//       return res.status(404).json({
//         success: false,
//         error: '未找到符合學生姓名、班級和主題的議論文內容',
//       });
//     }

//     // 假設每個學生在特定班級和主題最多只有一篇議論文，取第一筆資料
//     const essayContent = response.results[0].properties['議論文內容'].rich_text[0]?.text.content || '';
//     res.json({
//       success: true,
//       data: { essayContent },
//     });
//   } catch (error) {
//     console.error('Notion API 錯誤詳情:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || '無法從 Notion 獲取資料，請檢查伺服器日誌',
//     });
//   }
// });

// const PORT = 4000;
// app.listen(PORT, () => {
//   console.log(`伺服器運行在 http://localhost:${PORT}`);
// });





// const express = require('express');
// const { Client } = require('@notionhq/client');
// const cors = require('cors');

// const app = express();
// app.use(express.json());

// // 配置 CORS
// app.use(cors({
//   origin: 'http://localhost',
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
// }));

// app.options('*', cors());

// // 初始化 Notion 客戶端
// const notion = new Client({ auth: process.env.NOTION_API_KEY });
// const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// // 處理提交到 Notion 的端點
// app.post('/api/submit-to-notion', async (req, res) => {
//   console.log('收到請求:', req.body); // 記錄前端發送的數據

//   const { studentName, theme, essayContent, className } = req.body;

//   // 驗證請求數據
//   if (!studentName || !theme || !essayContent || !className) {
//     return res.status(400).json({
//       success: false,
//       error: '缺少必要字段：studentName, theme, essayContent 和 className 為必填項',
//     });
//   }

//   try {
//     const response = await notion.pages.create({
//       parent: { database_id: NOTION_DATABASE_ID },
//       properties: {
//         '學生姓名': {
//           title: [
//             {
//               text: {
//                 content: studentName,
//               },
//             },
//           ],
//         },
//         '主題': {
//           rich_text: [
//             {
//               text: {
//                 content: theme,
//               },
//             },
//           ],
//         },
//         '議論文內容': {
//           rich_text: [
//             {
//               text: {
//                 content: essayContent,
//               },
//             },
//           ],
//         },
//         '班級': {
//           rich_text: [
//             {
//               text: {
//                 content: className,
//               },
//             },
//           ],
//         },
//       },
//     });
//     console.log('Notion API 回應:', response); // 記錄 Notion API 回應
//     res.json({ success: true, data: response });
//   } catch (error) {
//     console.error('Notion API 錯誤詳情:', error); // 記錄詳細錯誤
//     console.error('錯誤堆棧:', error.stack); // 記錄錯誤堆棧
//     res.status(500).json({
//       success: false,
//       error: error.message || '無法提交到 Notion，請檢查伺服器日誌',
//     });
//   }
// });

// // 根據學生姓名、班級名稱和主題名稱從 Notion 資料庫中獲取議論文內容
// app.get('/api/get-essay/:studentName', async (req, res) => {
//   const { studentName } = req.params;
//   const { className, theme } = req.query;

//   if (!studentName || !className || !theme) {
//     return res.status(400).json({
//       success: false,
//       error: '缺少必要參數：studentName, className 和 theme 為必填項',
//     });
//   }

//   try {
//     const response = await notion.databases.query({
//       database_id: NOTION_DATABASE_ID,
//       filter: {
//         and: [
//           {
//             property: '學生姓名',
//             title: {
//               equals: studentName,
//             },
//           },
//           {
//             property: '班級',
//             rich_text: {
//               equals: className,
//             },
//           },
//           {
//             property: '主題',
//             rich_text: {
//               equals: theme,
//             },
//           },
//         ],
//       },
//     });

//     if (response.results.length === 0) {
//       return res.status(404).json({
//         success: false,
//         error: '未找到符合學生姓名、班級和主題的議論文內容',
//       });
//     }

//     // 假設每個學生在特定班級和主題最多只有一篇議論文，取第一筆資料
//     const essayContent = response.results[0].properties['議論文內容'].rich_text[0]?.text.content || '';
//     res.json({
//       success: true,
//       data: { essayContent },
//     });
//   } catch (error) {
//     console.error('Notion API 錯誤詳情:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || '無法從 Notion 獲取資料，請檢查伺服器日誌',
//     });
//   }
// });

// // 新增端點：根據班級名稱查詢 Notion 資料庫中的記錄
// app.get('/api/get-students-by-class/:className', async (req, res) => {
//   const { className } = req.params;

//   if (!className) {
//     return res.status(400).json({
//       success: false,
//       error: '缺少必要參數：className 為必填項',
//     });
//   }

//   try {
//     const response = await notion.databases.query({
//       database_id: NOTION_DATABASE_ID,
//       filter: {
//         property: '班級',
//         rich_text: {
//           equals: className,
//         },
//       },
//     });

//     // 映射查詢結果，提取主題、學生姓名和繳交日期
//     const students = response.results.map((page) => ({
//       theme: page.properties['主題']?.rich_text?.[0]?.text?.content || '未知主題',
//       studentName: page.properties['學生姓名']?.title?.[0]?.plain_text || '未知學生',
//       submissionDate: page.created_time || '尚未繳交', // 使用 Notion 頁面的創建時間作為繳交日期
//     }));

//     res.json({
//       success: true,
//       data: students,
//     });
//   } catch (error) {
//     console.error('Notion API 錯誤詳情:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || '無法從 Notion 獲取資料，請檢查伺服器日誌',
//     });
//   }
// });

// const PORT = 4000;
// app.listen(PORT, () => {
//   console.log(`伺服器運行在 http://localhost:${PORT}`);
// });




// const express = require('express');
// const { Client } = require('@notionhq/client');
// const cors = require('cors');

// const app = express();
// app.use(express.json());

// // 配置 CORS
// app.use(cors({
//   origin: 'http://localhost',
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
// }));

// app.options('*', cors());

// // 初始化 Notion 客戶端
// const notion = new Client({ auth: process.env.NOTION_API_KEY });
// const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// // 處理提交到 Notion 的端點（包括筆記區內容）
// app.post('/api/submit-to-notion', async (req, res) => {
//   console.log('收到請求:', req.body);

//   const { studentName, theme, essayContent, className, noteContent } = req.body;

//   // 驗證請求數據
//   if (!studentName || !theme || !essayContent || !className) {
//     return res.status(400).json({
//       success: false,
//       error: '缺少必要字段：studentName, theme, essayContent 和 className 為必填項',
//     });
//   }

//   try {
//     const response = await notion.pages.create({
//       parent: { database_id: NOTION_DATABASE_ID },
//       properties: {
//         '學生姓名': {
//           title: [
//             {
//               text: {
//                 content: studentName,
//               },
//             },
//           ],
//         },
//         '主題': {
//           rich_text: [
//             {
//               text: {
//                 content: theme,
//               },
//             },
//           ],
//         },
//         '議論文內容': {
//           rich_text: [
//             {
//               text: {
//                 content: essayContent,
//               },
//             },
//           ],
//         },
//         '班級': {
//           rich_text: [
//             {
//               text: {
//                 content: className,
//               },
//             },
//           ],
//         },
//         '筆記區': {
//           rich_text: [
//             {
//               text: {
//                 content: noteContent || '', // 如果沒有筆記內容，設置為空字串
//               },
//             },
//           ],
//         },
//       },
//     });
//     console.log('Notion API 回應:', response);
//     res.json({ success: true, data: response });
//   } catch (error) {
//     console.error('Notion API 錯誤詳情:', error);
//     console.error('錯誤堆棧:', error.stack);
//     res.status(500).json({
//       success: false,
//       error: error.message || '無法提交到 Notion，請檢查伺服器日誌',
//     });
//   }
// });

// // 根據學生姓名、班級名稱和主題名稱從 Notion 資料庫中獲取議論文內容
// app.get('/api/get-essay/:studentName', async (req, res) => {
//   const { studentName } = req.params;
//   const { className, theme } = req.query;

//   if (!studentName || !className || !theme) {
//     return res.status(400).json({
//       success: false,
//       error: '缺少必要參數：studentName, className 和 theme 為必填項',
//     });
//   }

//   try {
//     const response = await notion.databases.query({
//       database_id: NOTION_DATABASE_ID,
//       filter: {
//         and: [
//           {
//             property: '學生姓名',
//             title: {
//               equals: studentName,
//             },
//           },
//           {
//             property: '班級',
//             rich_text: {
//               equals: className,
//             },
//           },
//           {
//             property: '主題',
//             rich_text: {
//               equals: theme,
//             },
//           },
//         ],
//       },
//     });

//     if (response.results.length === 0) {
//       return res.status(404).json({
//         success: false,
//         error: '未找到符合學生姓名、班級和主題的議論文內容',
//       });
//     }

//     const essayContent = response.results[0].properties['議論文內容'].rich_text[0]?.text.content || '';
//     const noteContent = response.results[0].properties['筆記區'].rich_text[0]?.text.content || '';
//     res.json({
//       success: true,
//       data: { essayContent, noteContent },
//     });
//   } catch (error) {
//     console.error('Notion API 錯誤詳情:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || '無法從 Notion 獲取資料，請檢查伺服器日誌',
//     });
//   }
// });

// // 新增端點：根據學生姓名、班級和主題更新筆記區內容
// app.patch('/api/update-note', async (req, res) => {
//   const { studentName, className, theme, noteContent } = req.body;

//   if (!studentName || !className || !theme || noteContent === undefined) {
//     return res.status(400).json({
//       success: false,
//       error: '缺少必要字段：studentName, className, theme 和 noteContent 為必填項',
//     });
//   }

//   try {
//     // 查詢符合條件的記錄
//     const queryResponse = await notion.databases.query({
//       database_id: NOTION_DATABASE_ID,
//       filter: {
//         and: [
//           {
//             property: '學生姓名',
//             title: {
//               equals: studentName,
//             },
//           },
//           {
//             property: '班級',
//             rich_text: {
//               equals: className,
//             },
//           },
//           {
//             property: '主題',
//             rich_text: {
//               equals: theme,
//             },
//           },
//         ],
//       },
//     });

//     if (queryResponse.results.length === 0) {
//       return res.status(404).json({
//         success: false,
//         error: '未找到符合學生姓名、班級和主題的記錄',
//       });
//     }

//     // 取得第一筆匹配記錄的 page_id
//     const pageId = queryResponse.results[0].id;

//     // 更新筆記區內容
//     const updateResponse = await notion.pages.update({
//       page_id: pageId,
//       properties: {
//         '筆記區': {
//           rich_text: [
//             {
//               text: {
//                 content: noteContent,
//               },
//             },
//           ],
//         },
//       },
//     });

//     console.log('Notion API 更新回應:', updateResponse);
//     res.json({ success: true, data: updateResponse });
//   } catch (error) {
//     console.error('Notion API 錯誤詳情:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || '無法更新 Notion 筆記區內容，請檢查伺服器日誌',
//     });
//   }
// });

// // 根據班級名稱查詢 Notion 資料庫中的記錄
// app.get('/api/get-students-by-class/:className', async (req, res) => {
//   const { className } = req.params;

//   if (!className) {
//     return res.status(400).json({
//       success: false,
//       error: '缺少必要參數：className 為必填項',
//     });
//   }

//   try {
//     const response = await notion.databases.query({
//       database_id: NOTION_DATABASE_ID,
//       filter: {
//         property: '班級',
//         rich_text: {
//           equals: className,
//         },
//       },
//     });

//     const students = response.results.map((page) => ({
//       theme: page.properties['主題']?.rich_text?.[0]?.text?.content || '未知主題',
//       studentName: page.properties['學生姓名']?.title?.[0]?.plain_text || '未知學生',
//       submissionDate: page.created_time || '尚未繳交',
//     }));

//     res.json({
//       success: true,
//       data: students,
//     });
//   } catch (error) {
//     console.error('Notion API 錯誤詳情:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || '無法從 Notion 獲取資料，請檢查伺服器日誌',
//     });
//   }
// });

// const PORT = 4000;
// app.listen(PORT, () => {
//   console.log(`伺服器運行在 http://localhost:${PORT}`);
// });






// const express = require('express');
// const { Client } = require('@notionhq/client');
// const cors = require('cors');

// const app = express();
// app.use(express.json());

// // 配置 CORS
// app.use(cors({
//   origin: ['http://localhost:3000', 'http://140.115.126.27'],
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
// }));

// // app.options('*', cors());
// app.options('*', cors({
//   origin: ['http://localhost:3000', 'http://140.115.126.27'],
//   credentials: true,
// }));


// // 初始化 Notion 客戶端
// const notion = new Client({ auth: process.env.NOTION_API_KEY });
// const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// // 處理提交到 Notion 的端點（包括筆記區內容）
// app.post('/api/submit-to-notion', async (req, res) => {
//   console.log('收到請求:', req.body);

//   const { studentName, theme, essayContent, className, noteContent } = req.body;

//   // 驗證請求數據
//   if (!studentName || !theme || !essayContent || !className) {
//     return res.status(400).json({
//       success: false,
//       error: '缺少必要字段：studentName, theme, essayContent 和 className 為必填項',
//     });
//   }

//   try {
//     const response = await notion.pages.create({
//       parent: { database_id: NOTION_DATABASE_ID },
//       properties: {
//         '學生姓名': {
//           title: [
//             {
//               text: {
//                 content: studentName,
//               },
//             },
//           ],
//         },
//         '主題': {
//           rich_text: [
//             {
//               text: {
//                 content: theme,
//               },
//             },
//           ],
//         },
//         '議論文內容': {
//           rich_text: [
//             {
//               text: {
//                 content: essayContent,
//               },
//             },
//           ],
//         },
//         '班級': {
//           rich_text: [
//             {
//               text: {
//                 content: className,
//               },
//             },
//           ],
//         },
//         '筆記區': {
//           rich_text: [
//             {
//               text: {
//                 content: noteContent || '', // 如果沒有筆記內容，設置為空字串
//               },
//             },
//           ],
//         },
//       },
//     });
//     console.log('Notion API 回應:', response);
//     res.json({ success: true, data: response });
//   } catch (error) {
//     console.error('Notion API 錯誤詳情:', error);
//     console.error('錯誤堆棧:', error.stack);
//     res.status(500).json({
//       success: false,
//       error: error.message || '無法提交到 Notion，請檢查伺服器日誌',
//     });
//   }
// });

// // 根據學生姓名、班級名稱和主題名稱從 Notion 資料庫中獲取議論文內容
// app.get('/api/get-essay/:studentName', async (req, res) => {
//   const { studentName } = req.params;
//   const { className, theme } = req.query;

//   if (!studentName || !className || !theme) {
//     return res.status(400).json({
//       success: false,
//       error: '缺少必要參數：studentName, className 和 theme 為必填項',
//     });
//   }

//   try {
//     const response = await notion.databases.query({
//       database_id: NOTION_DATABASE_ID,
//       filter: {
//         and: [
//           {
//             property: '學生姓名',
//             title: {
//               equals: studentName,
//             },
//           },
//           {
//             property: '班級',
//             rich_text: {
//               equals: className,
//             },
//           },
//           {
//             property: '主題',
//             rich_text: {
//               equals: theme,
//             },
//           },
//         ],
//       },
//     });

//     if (response.results.length === 0) {
//       return res.status(404).json({
//         success: false,
//         error: '未找到符合學生姓名、班級和主題的議論文內容',
//       });
//     }

//     const essayContent = response.results[0].properties['議論文內容'].rich_text[0]?.text.content || '';
//     const noteContent = response.results[0].properties['筆記區'].rich_text[0]?.text.content || '';
//     res.json({
//       success: true,
//       data: { essayContent, noteContent },
//     });
//   } catch (error) {
//     console.error('Notion API 錯誤詳情:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || '無法從 Notion 獲取資料，請檢查伺服器日誌',
//     });
//   }
// });

// // 更新或創建記錄：根據學生姓名、班級和主題更新筆記區和議論文內容
// app.patch('/api/update-note', async (req, res) => {
//   const { studentName, className, theme, noteContent, essayContent } = req.body;

//   if (!studentName || !className || !theme || noteContent === undefined || essayContent === undefined) {
//     return res.status(400).json({
//       success: false,
//       error: '缺少必要字段：studentName, className, theme, noteContent 和 essayContent 為必填項',
//     });
//   }

//   try {
//     // 查詢符合條件的記錄
//     const queryResponse = await notion.databases.query({
//       database_id: NOTION_DATABASE_ID,
//       filter: {
//         and: [
//           {
//             property: '學生姓名',
//             title: {
//               equals: studentName,
//             },
//           },
//           {
//             property: '班級',
//             rich_text: {
//               equals: className,
//             },
//           },
//           {
//             property: '主題',
//             rich_text: {
//               equals: theme,
//             },
//           },
//         ],
//       },
//     });

//     if (queryResponse.results.length > 0) {
//       // 如果記錄存在，更新該記錄
//       const pageId = queryResponse.results[0].id;

//       const updateResponse = await notion.pages.update({
//         page_id: pageId,
//         properties: {
//           '筆記區': {
//             rich_text: [
//               {
//                 text: {
//                   content: noteContent,
//                 },
//               },
//             ],
//           },
//           '議論文內容': {
//             rich_text: [
//               {
//                 text: {
//                   content: essayContent,
//                 },
//               },
//             ],
//           },
//         },
//       });

//       console.log('Notion API 更新回應:', updateResponse);
//       res.json({ success: true, data: updateResponse });
//     } else {
//       // 如果記錄不存在，創建新記錄
//       const createResponse = await notion.pages.create({
//         parent: { database_id: NOTION_DATABASE_ID },
//         properties: {
//           '學生姓名': {
//             title: [
//               {
//                 text: {
//                   content: studentName,
//                 },
//               },
//             ],
//           },
//           '主題': {
//             rich_text: [
//               {
//                 text: {
//                   content: theme,
//                 },
//               },
//             ],
//           },
//           '議論文內容': {
//             rich_text: [
//               {
//                 text: {
//                   content: essayContent,
//                 },
//               },
//             ],
//           },
//           '班級': {
//             rich_text: [
//               {
//                 text: {
//                   content: className,
//                 },
//               },
//             ],
//           },
//           '筆記區': {
//             rich_text: [
//               {
//                 text: {
//                   content: noteContent,
//                 },
//               },
//             ],
//           },
//         },
//       });

//       console.log('Notion API 創建回應:', createResponse);
//       res.json({ success: true, data: createResponse });
//     }
//   } catch (error) {
//     console.error('Notion API 錯誤詳情:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || '無法更新或創建 Notion 記錄，請檢查伺服器日誌',
//     });
//   }
// });

// // 根據班級名稱查詢 Notion 資料庫中的記錄
// app.get('/api/get-students-by-class/:className', async (req, res) => {
//   const { className } = req.params;

//   if (!className) {
//     return res.status(400).json({
//       success: false,
//       error: '缺少必要參數：className 為必填項',
//     });
//   }

//   try {
//     const response = await notion.databases.query({
//       database_id: NOTION_DATABASE_ID,
//       filter: {
//         property: '班級',
//         rich_text: {
//           equals: className,
//         },
//       },
//     });

//     const students = response.results.map((page) => ({
//       theme: page.properties['主題']?.rich_text?.[0]?.text?.content || '未知主題',
//       studentName: page.properties['學生姓名']?.title?.[0]?.plain_text || '未知學生',
//       submissionDate: page.created_time || '尚未繳交',
//     }));

//     res.json({
//       success: true,
//       data: students,
//     });
//   } catch (error) {
//     console.error('Notion API 錯誤詳情:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || '無法從 Notion 獲取資料，請檢查伺服器日誌',
//     });
//   }
// });

// const PORT = 4000;
// // app.listen(PORT, () => {
// //   console.log(`伺服器運行在 http://localhost:${PORT}`);
// // });
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`伺服器運行在 http://0.0.0.0:${PORT}`);
// });









// const express = require('express');
// const { Client } = require('@notionhq/client');
// const cors = require('cors');

// const app = express();
// app.use(express.json());

// // 配置 CORS
// app.use(cors({
//     origin: ['http://localhost:3000', 'http://140.115.126.27'],
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
// }));

// app.options('*', cors({
//     origin: ['http://localhost:3000', 'http://140.115.126.27'],
//     credentials: true,
// }));

// // 初始化 Notion 客戶端
// const notion = new Client({ auth: process.env.NOTION_API_KEY });
// const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// // 將文字分割成小於 2000 字元的區塊
// function splitTextIntoChunks(text, maxLength = 2000) {
//     const chunks = [];
//     for (let i = 0; i < text.length; i += maxLength) {
//         chunks.push(text.slice(i, i + maxLength));
//     }
//     return chunks;
// }

// // 處理提交到 Notion 的端點（包括筆記區內容）
// app.post('/api/submit-to-notion', async (req, res) => {
//     console.log('收到請求:', req.body);

//     const { studentName, theme, essayContent, className, noteContent } = req.body;

//     // 驗證請求數據
//     if (!studentName || !theme || !essayContent || !className) {
//         return res.status(400).json({
//             success: false,
//             error: '缺少必要字段：studentName, theme, essayContent 和 className 為必填項',
//         });
//     }

//     try {
//         // 分段處理 essayContent 和 noteContent
//         const essayChunks = splitTextIntoChunks(essayContent, 2000);
//         const essayRichText = essayChunks.map(chunk => ({
//             text: { content: chunk }
//         }));

//         const noteChunks = splitTextIntoChunks(noteContent || '', 2000);
//         const noteRichText = noteChunks.map(chunk => ({
//             text: { content: chunk }
//         }));

//         const response = await notion.pages.create({
//             parent: { database_id: NOTION_DATABASE_ID },
//             properties: {
//                 '學生姓名': {
//                     title: [
//                         {
//                             text: {
//                                 content: studentName,
//                             },
//                         },
//                     ],
//                 },
//                 '主題': {
//                     rich_text: [
//                         {
//                             text: {
//                                 content: theme,
//                             },
//                         },
//                     ],
//                 },
//                 '議論文內容': {
//                     rich_text: essayRichText,
//                 },
//                 '班級': {
//                     rich_text: [
//                         {
//                             text: {
//                                 content: className,
//                             },
//                         },
//                     ],
//                 },
//                 '筆記區': {
//                     rich_text: noteRichText,
//                 },
//             },
//         });

//         console.log('Notion API 回應:', response);
//         res.json({ success: true, data: response });
//     } catch (error) {
//         console.error('Notion API 錯誤詳情:', error.message, error.body);
//         console.error('錯誤堆棧:', error.stack);
//         res.status(error.status || 500).json({
//             success: false,
//             error: '無法提交到 Notion',
//             details: error.message || '請檢查伺服器日誌',
//         });
//     }
// });

// // 根據學生姓名、班級名稱和主題名稱從 Notion 資料庫中獲取議論文內容
// app.get('/api/get-essay/:studentName', async (req, res) => {
//     const { studentName } = req.params;
//     const { className, theme } = req.query;

//     if (!studentName || !className || !theme) {
//         return res.status(400).json({
//             success: false,
//             error: '缺少必要參數：studentName, className 和 theme 為必填項',
//         });
//     }

//     try {
//         const response = await notion.databases.query({
//             database_id: NOTION_DATABASE_ID,
//             filter: {
//                 and: [
//                     {
//                         property: '學生姓名',
//                         title: {
//                             equals: studentName,
//                         },
//                     },
//                     {
//                         property: '班級',
//                         rich_text: {
//                             equals: className,
//                         },
//                     },
//                     {
//                         property: '主題',
//                         rich_text: {
//                             equals: theme,
//                         },
//                     },
//                 ],
//             },
//         });

//         if (response.results.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 error: '未找到符合學生姓名、班級和主題的議論文內容',
//             });
//         }

//         // 拼接多個 rich_text 區塊的內容
//         const page = response.results[0];
//         const essayContent = page.properties['議論文內容'].rich_text.map(item => item.text.content).join('');
//         const noteContent = page.properties['筆記區'].rich_text.map(item => item.text.content).join('');

//         res.json({
//             success: true,
//             data: { essayContent, noteContent },
//         });
//     } catch (error) {
//         console.error('Notion API 錯誤詳情:', error);
//         res.status(500).json({
//             success: false,
//             error: error.message || '無法從 Notion 獲取資料，請檢查伺服器日誌',
//         });
//     }
// });

// // 更新或創建記錄：根據學生姓名、班級和主題更新筆記區和議論文內容
// app.patch('/api/update-note', async (req, res) => {
//     console.log('收到更新請求:', req.body);

//     const { studentName, className, theme, noteContent, essayContent } = req.body;

//     // 驗證請求數據
//     if (!studentName || !className || !theme) {
//         return res.status(400).json({
//             success: false,
//             error: '缺少必要字段：studentName, className 和 theme 為必填項',
//         });
//     }

//     try {
//         // 查詢符合條件的記錄
//         const queryResponse = await notion.databases.query({
//             database_id: NOTION_DATABASE_ID,
//             filter: {
//                 and: [
//                     {
//                         property: '學生姓名',
//                         title: {
//                             equals: studentName,
//                         },
//                     },
//                     {
//                         property: '班級',
//                         rich_text: {
//                             equals: className,
//                         },
//                     },
//                     {
//                         property: '主題',
//                         rich_text: {
//                             equals: theme,
//                         },
//                     },
//                 ],
//             },
//         });

//         // 分段處理 essayContent 和 noteContent
//         const essayChunks = splitTextIntoChunks(essayContent || '', 2000);
//         const essayRichText = essayChunks.map(chunk => ({
//             text: { content: chunk }
//         }));

//         const noteChunks = splitTextIntoChunks(noteContent || '', 2000);
//         const noteRichText = noteChunks.map(chunk => ({
//             text: { content: chunk }
//         }));

//         if (queryResponse.results.length > 0) {
//             // 如果記錄存在，更新該記錄
//             const pageId = queryResponse.results[0].id;

//             const updateResponse = await notion.pages.update({
//                 page_id: pageId,
//                 properties: {
//                     '筆記區': {
//                         rich_text: noteRichText,
//                     },
//                     '議論文內容': {
//                         rich_text: essayRichText,
//                     },
//                 },
//             });

//             console.log('Notion API 更新回應:', updateResponse);
//             res.json({ success: true, data: updateResponse });
//         } else {
//             // 如果記錄不存在，創建新記錄
//             const createResponse = await notion.pages.create({
//                 parent: { database_id: NOTION_DATABASE_ID },
//                 properties: {
//                     '學生姓名': {
//                         title: [
//                             {
//                                 text: {
//                                     content: studentName,
//                                 },
//                             },
//                         ],
//                     },
//                     '主題': {
//                         rich_text: [
//                             {
//                                 text: {
//                                     content: theme,
//                                 },
//                             },
//                         ],
//                     },
//                     '議論文內容': {
//                         rich_text: essayRichText,
//                     },
//                     '班級': {
//                         rich_text: [
//                             {
//                                 text: {
//                                     content: className,
//                                 },
//                             },
//                         ],
//                     },
//                     '筆記區': {
//                         rich_text: noteRichText,
//                     },
//                 },
//             });

//             console.log('Notion API 創建回應:', createResponse);
//             res.json({ success: true, data: createResponse });
//         }
//     } catch (error) {
//         console.error('Notion API 錯誤詳情:', error.message, error.body);
//         console.error('錯誤堆棧:', error.stack);
//         res.status(error.status || 500).json({
//             success: false,
//             error: '無法更新或創建 Notion 記錄',
//             details: error.message || '請檢查伺服器日誌',
//         });
//     }
// });

// // 根據班級名稱查詢 Notion 資料庫中的記錄
// app.get('/api/get-students-by-class/:className', async (req, res) => {
//     const { className } = req.params;

//     if (!className) {
//         return res.status(400).json({
//             success: false,
//             error: '缺少必要參數：className 為必填項',
//         });
//     }

//     try {
//         const response = await notion.databases.query({
//             database_id: NOTION_DATABASE_ID,
//             filter: {
//                 property: '班級',
//                 rich_text: {
//                     equals: className,
//                 },
//             },
//         });

//         const students = response.results.map((page) => ({
//             theme: page.properties['主題']?.rich_text?.[0]?.text?.content || '未知主題',
//             studentName: page.properties['學生姓名']?.title?.[0]?.plain_text || '未知學生',
//             submissionDate: page.created_time || '尚未繳交',
//         }));

//         res.json({
//             success: true,
//             data: students,
//         });
//     } catch (error) {
//         console.error('Notion API 錯誤詳情:', error);
//         res.status(500).json({
//             success: false,
//             error: error.message || '無法從 Notion 獲取資料，請檢查伺服器日誌',
//         });
//     }
// });

// const PORT = 4000;
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`伺服器運行在 http://0.0.0.0:${PORT}`);
// });





const express = require('express');
const { Client } = require('@notionhq/client');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 配置 CORS
const explicitAllowedOrigins = [
    'http://localhost:3000',
    'http://localhost',
    'http://127.0.0.1:3000',
    'http://127.0.0.1',
    'http://140.115.126.27',
    'https://140.115.126.27',
    ...String(process.env.CORS_ALLOWED_ORIGINS || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
];

const allowedOriginPatterns = [
    /^https?:\/\/localhost(?::\d+)?$/i,
    /^https?:\/\/127\.0\.0\.1(?::\d+)?$/i,
    /^https?:\/\/140\.115\.126\.27(?::\d+)?$/i,
];

const isOriginAllowed = (origin) => {
    if (!origin) {
        return true;
    }
    if (explicitAllowedOrigins.includes(origin)) {
        return true;
    }
    return allowedOriginPatterns.some((pattern) => pattern.test(origin));
};

const corsOptions = {
    origin(origin, callback) {
        if (isOriginAllowed(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`CORS origin blocked: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 初始化 Notion 客戶端
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// 將文字分割成小於 2000 字元的區塊
function splitTextIntoChunks(text, maxLength = 2000) {
    const chunks = [];
    for (let i = 0; i < text.length; i += maxLength) {
        chunks.push(text.slice(i, i + maxLength));
    }
    return chunks;
}

const normalizeLookupValue = (value) => String(value ?? '').replace(/\u3000/g, ' ').trim();

const sortByLastEditedDesc = (pages = []) =>
    [...pages].sort(
        (a, b) => new Date(b?.last_edited_time || 0).getTime() - new Date(a?.last_edited_time || 0).getTime()
    );

const createScopeFilter = (operator, studentName, className, theme) => ({
    and: [
        {
            property: '學生姓名',
            title: {
                [operator]: studentName,
            },
        },
        {
            property: '班級',
            rich_text: {
                [operator]: className,
            },
        },
        {
            property: '主題',
            rich_text: {
                [operator]: theme,
            },
        },
    ],
});

async function findPageByScope({ studentName, className, theme }) {
    const strictResponse = await notion.databases.query({
        database_id: NOTION_DATABASE_ID,
        filter: createScopeFilter('equals', studentName, className, theme),
    });

    if (strictResponse.results.length > 0) {
        return {
            page: sortByLastEditedDesc(strictResponse.results)[0],
            matchedBy: 'equals',
        };
    }

    const fuzzyResponse = await notion.databases.query({
        database_id: NOTION_DATABASE_ID,
        filter: createScopeFilter('contains', studentName, className, theme),
    });

    if (fuzzyResponse.results.length > 0) {
        return {
            page: sortByLastEditedDesc(fuzzyResponse.results)[0],
            matchedBy: 'contains',
        };
    }

    return { page: null, matchedBy: null };
}

const joinRichText = (richTextValue) =>
    Array.isArray(richTextValue)
        ? richTextValue.map((item) => item?.plain_text ?? item?.text?.content ?? '').join('')
        : '';

const safeJsonParse = (value, fallbackValue) => {
    if (!value) {
        return fallbackValue;
    }
    try {
        return JSON.parse(value);
    } catch (error) {
        console.warn('Failed to parse stored JSON content:', error?.message || error);
        return fallbackValue;
    }
};

const decodeHtmlEntities = (value) => {
    const namedEntityMap = {
        nbsp: ' ',
        amp: '&',
        lt: '<',
        gt: '>',
        quot: '"',
        apos: "'",
    };

    return String(value ?? '')
        .replace(/&#x([0-9a-f]+);/gi, (match, hexValue) => {
            const codePoint = Number.parseInt(hexValue, 16);
            if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
                return match;
            }
            return String.fromCodePoint(codePoint);
        })
        .replace(/&#(\d+);/g, (match, decValue) => {
            const codePoint = Number.parseInt(decValue, 10);
            if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
                return match;
            }
            return String.fromCodePoint(codePoint);
        })
        .replace(/&([a-z]+);/gi, (match, entityName) => namedEntityMap[entityName.toLowerCase()] ?? match);
};

const htmlToPlainText = (value) => {
    const html = String(value ?? '');

    const textWithLineBreaks = html
        .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
        .replace(/<\s*br\s*\/?>/gi, '\n')
        .replace(/<\s*\/(p|div|h[1-6]|li|tr)\s*>/gi, '\n')
        .replace(/<\s*li\b[^>]*>/gi, '- ')
        .replace(/<[^>]*>/g, '');

    return decodeHtmlEntities(textWithLineBreaks)
        .replace(/\r\n?/g, '\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

const DATABASE_PROPERTIES_CACHE_TTL_MS = 5 * 60 * 1000;
let cachedDatabaseProperties = null;
let cachedDatabasePropertiesFetchedAt = 0;

const GRADING_FIELD_CONFIGS = [
    {
        inputKey: 'totalScore',
        aliases: ['總分', '總分數', 'Score', 'Total Score', 'TotalScore'],
        allowedTypes: ['number', 'rich_text', 'select', 'status'],
    },
    {
        inputKey: 'humanComment',
        aliases: ['教師評語', '教師評語欄位', 'Human Grading', 'HumanGrading', 'Teacher Comment', 'Teacher Feedback'],
        allowedTypes: ['rich_text', 'title'],
    },
    {
        inputKey: 'aiComment',
        aliases: ['AI評語', 'AI 評語', 'AI Feedback', 'AIFeedback', 'AI Comment', 'AIComment'],
        allowedTypes: ['rich_text', 'title'],
    },
    {
        inputKey: 'aiTotalScore',
        aliases: ['AI總分', 'AI 總分', 'AI Total Score', 'AITotalScore'],
        allowedTypes: ['number', 'rich_text', 'select', 'status'],
    },
    {
        inputKey: 'claimsScore',
        aliases: ['Claims分數', 'Claims 分數', 'Claims Score', 'Claims score', 'ClaimsScore'],
        allowedTypes: ['number', 'rich_text', 'select', 'status'],
    },
    {
        inputKey: 'aiClaimsScore',
        aliases: ['AI Claims分數', 'AI Claims 分數', 'AI Claims Score', 'AIClaimsScore'],
        allowedTypes: ['number', 'rich_text', 'select', 'status'],
    },
    {
        inputKey: 'claimsComment',
        aliases: ['Claims評語', 'Claims 評語', 'Claims Comment', 'Claims comment', 'ClaimsFeedback', 'Claims回饋'],
        allowedTypes: ['rich_text', 'title'],
    },
    {
        inputKey: 'aiClaimsComment',
        aliases: ['AI Claims評語', 'AI Claims 評語', 'AI Claims Comment', 'AIClaimsComment'],
        allowedTypes: ['rich_text', 'title'],
    },
    {
        inputKey: 'groundsScore',
        aliases: ['Grounds分數', 'Grounds 分數', 'Grounds Score', 'Grounds score', 'GroundsScore'],
        allowedTypes: ['number', 'rich_text', 'select', 'status'],
    },
    {
        inputKey: 'aiGroundsScore',
        aliases: ['AI Ground分數', 'AI Ground 分數', 'AI Grounds分數', 'AI Grounds 分數', 'AI Ground Score', 'AIGroundScore', 'AI Grounds Score', 'AIGroundsScore'],
        allowedTypes: ['number', 'rich_text', 'select', 'status'],
    },
    {
        inputKey: 'groundsComment',
        aliases: ['Grounds評語', 'Grounds 評語', 'Grounds Comment', 'Grounds comment', 'GroundsFeedback', 'Grounds回饋'],
        allowedTypes: ['rich_text', 'title'],
    },
    {
        inputKey: 'aiGroundsComment',
        aliases: ['AI Ground評語', 'AI Ground 評語', 'AI Grounds評語', 'AI Grounds 評語', 'AI Ground Comment', 'AIGroundComment', 'AI Grounds Comment', 'AIGroundsComment'],
        allowedTypes: ['rich_text', 'title'],
    },
    {
        inputKey: 'rebuttalsScore',
        aliases: ['Rebuttals分數', 'Rebuttals 分數', 'Rebuttals Score', 'Rebuttals score', 'RebuttalsScore'],
        allowedTypes: ['number', 'rich_text', 'select', 'status'],
    },
    {
        inputKey: 'aiRebuttalsScore',
        aliases: ['AI Rebuttal分數', 'AI Rebuttal 分數', 'AI Rebuttals分數', 'AI Rebuttals 分數', 'AI Rebuttal Score', 'AIRebuttalScore', 'AI Rebuttals Score', 'AIRebuttalsScore'],
        allowedTypes: ['number', 'rich_text', 'select', 'status'],
    },
    {
        inputKey: 'rebuttalsComment',
        aliases: ['Rebuttals評語', 'Rebuttals 評語', 'Rebuttals Comment', 'Rebuttals comment', 'RebuttalsFeedback', 'Rebuttals回饋'],
        allowedTypes: ['rich_text', 'title'],
    },
    {
        inputKey: 'aiRebuttalsComment',
        aliases: ['AI Rebuttal評語', 'AI Rebuttal 評語', 'AI Rebuttals評語', 'AI Rebuttals 評語', 'AI Rebuttal Comment', 'AIRebuttalComment', 'AI Rebuttals Comment', 'AIRebuttalsComment'],
        allowedTypes: ['rich_text', 'title'],
    },
    {
        inputKey: 'teacherMessage',
        aliases: ['\u7559\u8a00\u6b04\u4f4d', '\u7559\u8a00', 'Teacher Message', 'Message Board', 'TeacherNotification'],
        allowedTypes: ['rich_text', 'title'],
    },
    {
        inputKey: 'submissionStatus',
        aliases: ['是否繳交', '繳交狀態', '提交狀態', 'Submission Status', 'SubmissionStatus', 'Submitted'],
        allowedTypes: ['rich_text', 'title', 'select', 'status', 'checkbox'],
    },
];

const LOGIN_COUNT_FIELD_ALIASES = [
    '登入次數',
    '登录次数',
    'Login Count',
    'LoginCount',
    'loginCount',
];

const SUBMITTED_STATUS_ALIASES = ['是', 'yes', 'true', '1', 'submitted', '已繳交'];
const UNSUBMITTED_STATUS_ALIASES = ['否', 'no', 'false', '0', 'unsubmitted', '未繳交'];

const normalizeSubmissionStatus = (value) => {
    const raw = String(value ?? '').trim();
    const normalized = raw.toLowerCase();

    if (!raw) {
        return '';
    }
    if (SUBMITTED_STATUS_ALIASES.includes(normalized) || raw === '是') {
        return '是';
    }
    if (UNSUBMITTED_STATUS_ALIASES.includes(normalized) || raw === '否') {
        return '否';
    }
    return raw;
};

const isSubmittedStatusYes = (value) => normalizeSubmissionStatus(value) === '是';

const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key);

const normalizePropertyLookupKey = (value) =>
    String(value ?? '')
        .replace(/[\s_\-　]/g, '')
        .toLowerCase();

const getRichTextPropertyPayload = (value) =>
    splitTextIntoChunks(String(value ?? ''), 2000).map((chunk) => ({
        text: { content: chunk },
    }));

async function getDatabasePropertiesWithCache() {
    const now = Date.now();
    if (
        cachedDatabaseProperties &&
        now - cachedDatabasePropertiesFetchedAt < DATABASE_PROPERTIES_CACHE_TTL_MS
    ) {
        return cachedDatabaseProperties;
    }

    const database = await notion.databases.retrieve({ database_id: NOTION_DATABASE_ID });
    cachedDatabaseProperties = database?.properties || {};
    cachedDatabasePropertiesFetchedAt = now;
    return cachedDatabaseProperties;
}

const buildPropertyLookup = (databaseProperties = {}) => {
    const lookup = new Map();
    for (const [propertyName, propertyDefinition] of Object.entries(databaseProperties)) {
        lookup.set(normalizePropertyLookupKey(propertyName), {
            name: propertyName,
            definition: propertyDefinition,
        });
    }
    return lookup;
};

const resolvePropertyConfig = (lookup, aliases, allowedTypes) => {
    for (const alias of aliases) {
        const resolved = lookup.get(normalizePropertyLookupKey(alias));
        if (!resolved) {
            continue;
        }
        if (Array.isArray(allowedTypes) && allowedTypes.length > 0 && !allowedTypes.includes(resolved.definition?.type)) {
            continue;
        }
        return resolved;
    }
    return null;
};

const toNotionPropertyValueByType = (propertyType, rawValue) => {
    switch (propertyType) {
        case 'rich_text':
            return { rich_text: getRichTextPropertyPayload(rawValue) };
        case 'title':
            return { title: getRichTextPropertyPayload(rawValue) };
        case 'number': {
            const normalizedValue = String(rawValue ?? '').trim();
            if (!normalizedValue) {
                return { number: null };
            }
            const parsedNumber = Number(normalizedValue);
            return { number: Number.isFinite(parsedNumber) ? parsedNumber : null };
        }
        case 'select': {
            const normalizedValue = String(rawValue ?? '').trim();
            return { select: normalizedValue ? { name: normalizedValue } : null };
        }
        case 'status': {
            const normalizedValue = String(rawValue ?? '').trim();
            return { status: normalizedValue ? { name: normalizedValue } : null };
        }
        case 'checkbox': {
            if (typeof rawValue === 'boolean') {
                return { checkbox: rawValue };
            }
            const normalizedValue = String(rawValue ?? '').trim().toLowerCase();
            return {
                checkbox:
                    normalizedValue === 'true' ||
                    normalizedValue === '1' ||
                    normalizedValue === 'yes' ||
                    normalizedValue === '是' ||
                    normalizedValue === 'submitted' ||
                    normalizedValue === '已繳交',
            };
        }
        default:
            return null;
    }
};

const getPropertyMetaByAliases = (properties = {}, aliases = []) => {
    if (!properties || !Array.isArray(aliases) || aliases.length === 0) {
        return null;
    }

    const normalizedPropertyEntries = Object.entries(properties).map(([name, value]) => ({
        normalizedName: normalizePropertyLookupKey(name),
        name,
        value,
    }));

    for (const alias of aliases) {
        const normalizedAlias = normalizePropertyLookupKey(alias);
        const found = normalizedPropertyEntries.find((item) => item.normalizedName === normalizedAlias);
        if (found) {
            return found;
        }
    }

    return null;
};

const readPropertyDisplayValue = (propertyValue) => {
    if (!propertyValue || typeof propertyValue !== 'object') {
        return '';
    }

    switch (propertyValue.type) {
        case 'title':
            return joinRichText(propertyValue.title);
        case 'rich_text':
            return joinRichText(propertyValue.rich_text);
        case 'number':
            return propertyValue.number === null || propertyValue.number === undefined ? '' : String(propertyValue.number);
        case 'select':
            return propertyValue.select?.name || '';
        case 'status':
            return propertyValue.status?.name || '';
        case 'checkbox':
            return propertyValue.checkbox ? '是' : '否';
        case 'formula': {
            const formula = propertyValue.formula;
            if (!formula) {
                return '';
            }
            if (formula.type === 'number') {
                return formula.number === null || formula.number === undefined ? '' : String(formula.number);
            }
            if (formula.type === 'string') {
                return formula.string || '';
            }
            if (formula.type === 'boolean') {
                return String(Boolean(formula.boolean));
            }
            return '';
        }
        default:
            return '';
    }
};

const getDisplayValueByAliases = (properties, aliases) => {
    const propertyMeta = getPropertyMetaByAliases(properties, aliases);
    return propertyMeta ? readPropertyDisplayValue(propertyMeta.value) : '';
};

const pickFirstNonEmptyValue = (...values) => {
    for (const value of values) {
        if (value === null || value === undefined) {
            continue;
        }
        const strValue = String(value);
        if (strValue.trim() !== '') {
            return strValue;
        }
    }
    return '';
};

const LOGIN_DATE_COUNTS_FIELD_ALIASES = [
    '登入日期統計',
    '登入日期次數',
    '登入紀錄',
    'Login Date Counts',
    'LoginDateCounts',
    'loginDateCounts',
    'Login History',
    'LoginHistory',
];

const toNonNegativeInteger = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return 0;
    }
    return Math.max(0, Math.floor(parsed));
};

const formatDateKeyByTimeZone = (dateLike = new Date(), timeZone = 'Asia/Taipei') => {
    const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);
    const year = parts.find((part) => part.type === 'year')?.value || '';
    const month = parts.find((part) => part.type === 'month')?.value || '';
    const day = parts.find((part) => part.type === 'day')?.value || '';
    return year && month && day ? `${year}-${month}-${day}` : '';
};

const normalizeDateKey = (value) => {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        return raw;
    }
    return formatDateKeyByTimeZone(raw, 'Asia/Taipei');
};

const parseLoginDateCounts = (rawValue) => {
    const normalizedRaw = String(rawValue ?? '').trim();
    if (!normalizedRaw) {
        return {};
    }

    let parsed = null;
    try {
        parsed = JSON.parse(normalizedRaw);
    } catch (error) {
        parsed = null;
    }

    const aggregated = {};
    const append = (dateKey, count) => {
        const normalizedDateKey = normalizeDateKey(dateKey);
        if (!normalizedDateKey) return;
        aggregated[normalizedDateKey] = (aggregated[normalizedDateKey] || 0) + toNonNegativeInteger(count);
    };

    if (Array.isArray(parsed)) {
        parsed.forEach((item) => append(item, 1));
        return aggregated;
    }

    if (parsed && typeof parsed === 'object') {
        Object.entries(parsed).forEach(([dateKey, count]) => append(dateKey, count));
        return aggregated;
    }

    normalizedRaw
        .split(/[\r\n,;]+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => append(item, 1));
    return aggregated;
};

const getLoginCountFromProperties = (properties = {}) => {
    const rawValue = getDisplayValueByAliases(properties, LOGIN_COUNT_FIELD_ALIASES);
    return toNonNegativeInteger(rawValue);
};

const getLoginDateCountsFromProperties = (properties = {}) => {
    const rawValue = getDisplayValueByAliases(properties, LOGIN_DATE_COUNTS_FIELD_ALIASES);
    return parseLoginDateCounts(rawValue);
};

const STUDENT_NAME_FIELD_ALIASES = ['\u5b78\u751f\u59d3\u540d', 'Student Name', 'studentName'];
const CLASS_NAME_FIELD_ALIASES = ['\u73ed\u7d1a', 'Class', 'Class Name', 'className'];
const THEME_FIELD_ALIASES = ['\u4e3b\u984c', 'Theme', 'theme'];
const NOTE_CONTENT_FIELD_ALIASES = ['\u7b46\u8a18\u5340'];
const ESSAY_CONTENT_FIELD_ALIASES = ['\u8b70\u8ad6\u6587\u5167\u5bb9'];
const KF_ANALYSIS_FIELD_ALIASES = ['KF\u6458\u8981'];
const OUTLINE_FIELD_ALIASES = ['\u5beb\u4f5c\u5927\u7db1'];
const SUBMISSION_STATUS_FIELD_ALIASES = ['\u662f\u5426\u7e73\u4ea4', '\u7e73\u4ea4\u72c0\u614b', '\u63d0\u4ea4\u72c0\u614b', 'Submission Status', 'SubmissionStatus', 'Submitted'];
const TEACHER_FEEDBACK_FIELD_ALIASES = ['\u6559\u5e2b\u8a55\u8a9e'];
const AI_FEEDBACK_FIELD_ALIASES = ['AI\u8a55\u8a9e', 'AI \u8a55\u8a9e', 'AI Feedback', 'AIFeedback', 'AI Comment', 'AIComment'];
const TEACHER_TOTAL_SCORE_FIELD_ALIASES = ['\u7e3d\u5206', 'Total Score', 'TotalScore', 'Score'];
const AI_TOTAL_SCORE_FIELD_ALIASES = ['AI\u7e3d\u5206', 'AI \u7e3d\u5206', 'AI Total Score', 'AITotalScore', 'AIScore', 'AI Score'];
const STUDENT_PROGRESS_ALLOWED_FILTER_TYPES = ['title', 'rich_text', 'select', 'status'];

const normalizeTextForCompare = (value) => String(value ?? '').trim().toLowerCase();

const hasMeaningfulText = (value) => {
    if (typeof value !== 'string') return false;
    const normalized = value
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    return normalized.length > 0;
};

const normalizeScoreValue = (value) => {
    if (value === null || value === undefined) return '';
    const raw = String(value).trim();
    if (!raw || raw === '-') return '';
    if (raw.toLowerCase() === 'not graded') return '';
    return raw;
};

const isZeroScore = (value) => {
    const normalized = normalizeScoreValue(value);
    if (normalized === '') return false;
    const numeric = Number(normalized);
    return !Number.isNaN(numeric) && numeric === 0;
};

const resolveDisplayedGradeRaw = ({ teacherScore = '', aiScore = '', teacherFeedback = '', aiFeedback = '', gradingView = '' } = {}) => {
    const normalizedTeacherScore = normalizeScoreValue(teacherScore);
    const normalizedAiScore = normalizeScoreValue(aiScore);
    const normalizedTeacherFeedback = normalizeTextForCompare(teacherFeedback);
    const normalizedAiFeedback = normalizeTextForCompare(aiFeedback);
    const normalizedGradingView = normalizeTextForCompare(gradingView);

    if (normalizedGradingView === 'ai') return normalizedAiScore || normalizedTeacherScore;
    if (normalizedGradingView === 'teacher') return normalizedTeacherScore || normalizedAiScore;

    const teacherSeemsUnfilled = !normalizedTeacherFeedback && (normalizedTeacherScore === '' || isZeroScore(normalizedTeacherScore));
    if (normalizedAiScore !== '' && (teacherSeemsUnfilled || normalizedAiFeedback)) {
        return normalizedAiScore;
    }

    return normalizedTeacherScore || normalizedAiScore;
};

const createEqualsFilterByType = (propertyName, propertyType, value) => {
    switch (propertyType) {
        case 'title':
            return { property: propertyName, title: { equals: value } };
        case 'select':
            return { property: propertyName, select: { equals: value } };
        case 'status':
            return { property: propertyName, status: { equals: value } };
        case 'rich_text':
        default:
            return { property: propertyName, rich_text: { equals: value } };
    }
};

const toTimestamp = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const dedupeStudentProgressRows = (rows = []) => {
    const latestMap = new Map();
    rows.forEach((row) => {
        const key = `${normalizeTextForCompare(row?.studentName)}::${normalizeTextForCompare(row?.theme)}`;
        if (!key || key === '::') return;
        const current = latestMap.get(key);
        if (!current) {
            latestMap.set(key, row);
            return;
        }

        const currentTs = toTimestamp(current?.lastEditedTime || current?.submissionDate);
        const incomingTs = toTimestamp(row?.lastEditedTime || row?.submissionDate);
        if (incomingTs >= currentTs) {
            latestMap.set(key, row);
        }
    });

    return [...latestMap.values()].sort((a, b) => {
        const left = toTimestamp(a?.lastEditedTime || a?.submissionDate);
        const right = toTimestamp(b?.lastEditedTime || b?.submissionDate);
        return right - left;
    });
};

const queryAllNotionRowsByFilter = async (filter) => {
    const allResults = [];
    let startCursor = undefined;

    while (true) {
        const response = await notion.databases.query({
            database_id: NOTION_DATABASE_ID,
            filter,
            page_size: 100,
            start_cursor: startCursor,
        });

        const results = Array.isArray(response?.results) ? response.results : [];
        allResults.push(...results);
        if (!response?.has_more || !response?.next_cursor) {
            break;
        }
        startCursor = response.next_cursor;
    }

    return allResults;
};

const buildStudentProgressRecord = ({ page, fallbackClassName = '' }) => {
    const properties = page?.properties || {};
    const noteContent = getDisplayValueByAliases(properties, NOTE_CONTENT_FIELD_ALIASES);
    const parsedNote = safeJsonParse(noteContent, {});

    const studentName = getDisplayValueByAliases(properties, STUDENT_NAME_FIELD_ALIASES) || '\u672a\u77e5\u5b78\u751f';
    const className = getDisplayValueByAliases(properties, CLASS_NAME_FIELD_ALIASES) || fallbackClassName || '';
    const theme = getDisplayValueByAliases(properties, THEME_FIELD_ALIASES) || '\u672a\u77e5\u4e3b\u984c';
    const submissionStatus = normalizeSubmissionStatus(
        pickFirstNonEmptyValue(
            getDisplayValueByAliases(properties, SUBMISSION_STATUS_FIELD_ALIASES),
            parsedNote?.submissionStatus
        )
    );

    const essayContent = getDisplayValueByAliases(properties, ESSAY_CONTENT_FIELD_ALIASES);
    const kfAnalysisContent = getDisplayValueByAliases(properties, KF_ANALYSIS_FIELD_ALIASES);
    const outlineContent = getDisplayValueByAliases(properties, OUTLINE_FIELD_ALIASES);

    const teacherFeedback = pickFirstNonEmptyValue(
        getDisplayValueByAliases(properties, TEACHER_FEEDBACK_FIELD_ALIASES),
        parsedNote?.humanComment
    );
    const aiFeedback = pickFirstNonEmptyValue(
        getDisplayValueByAliases(properties, AI_FEEDBACK_FIELD_ALIASES),
        parsedNote?.aiComment
    );
    const teacherTotalScore = pickFirstNonEmptyValue(
        getDisplayValueByAliases(properties, TEACHER_TOTAL_SCORE_FIELD_ALIASES),
        parsedNote?.totalScore
    );
    const aiTotalScore = pickFirstNonEmptyValue(
        getDisplayValueByAliases(properties, AI_TOTAL_SCORE_FIELD_ALIASES),
        parsedNote?.aiTotalScore
    );
    const gradingView = normalizeTextForCompare(parsedNote?.gradingView);

    const progressCompletedByStep = [
        true,
        hasMeaningfulText(kfAnalysisContent),
        hasMeaningfulText(outlineContent),
        hasMeaningfulText(essayContent) || isSubmittedStatusYes(submissionStatus),
    ];
    const progressPercent = progressCompletedByStep.filter(Boolean).length * 25;

    return {
        rowId: `${studentName}-${page?.id || page?.created_time || 'unknown'}`,
        studentName,
        className,
        theme,
        submissionDate: page?.created_time || '',
        lastEditedTime: page?.last_edited_time || '',
        submissionStatus,
        progressCompletedByStep,
        progressPercent,
        teacherTotalScore: normalizeScoreValue(teacherTotalScore),
        aiTotalScore: normalizeScoreValue(aiTotalScore),
        gradeRaw: resolveDisplayedGradeRaw({
            teacherScore: teacherTotalScore,
            aiScore: aiTotalScore,
            teacherFeedback,
            aiFeedback,
            gradingView,
        }),
    };
};

async function resolveLoginCountPropertyOrThrow() {
    const databaseProperties = await getDatabasePropertiesWithCache();
    const lookup = buildPropertyLookup(databaseProperties);
    const resolved = resolvePropertyConfig(lookup, LOGIN_COUNT_FIELD_ALIASES, [
        'number',
        'rich_text',
        'title',
    ]);

    if (!resolved) {
        throw new Error(
            `Notion 資料庫找不到登入次數欄位，請新增欄位名稱如：${LOGIN_COUNT_FIELD_ALIASES.join(', ')}`
        );
    }
    return resolved;
}

async function resolveLoginDateCountsPropertyOptional() {
    const databaseProperties = await getDatabasePropertiesWithCache();
    const lookup = buildPropertyLookup(databaseProperties);
    return resolvePropertyConfig(lookup, LOGIN_DATE_COUNTS_FIELD_ALIASES, ['rich_text', 'title']);
}

async function buildGradingPropertiesPayloadFromRequest(requestBody = {}) {
    const providedConfigs = GRADING_FIELD_CONFIGS.filter(({ inputKey }) => hasOwn(requestBody, inputKey));
    if (providedConfigs.length === 0) {
        return { properties: {}, mapped: [], unresolved: [] };
    }

    let databaseProperties;
    try {
        databaseProperties = await getDatabasePropertiesWithCache();
    } catch (error) {
        console.warn('Failed to retrieve Notion database schema for grading mapping:', error?.message || error);
        return {
            properties: {},
            mapped: [],
            unresolved: providedConfigs.map(({ inputKey }) => ({
                inputKey,
                reason: 'schema_unavailable',
            })),
        };
    }

    const lookup = buildPropertyLookup(databaseProperties);
    const properties = {};
    const mapped = [];
    const unresolved = [];

    for (const fieldConfig of providedConfigs) {
        const { inputKey, aliases, allowedTypes } = fieldConfig;
        const resolved = resolvePropertyConfig(lookup, aliases, allowedTypes);
        if (!resolved) {
            unresolved.push({
                inputKey,
                reason: 'property_not_found',
                aliases,
            });
            continue;
        }

        const notionPropertyValue = toNotionPropertyValueByType(
            resolved.definition?.type,
            requestBody[inputKey]
        );
        if (!notionPropertyValue) {
            unresolved.push({
                inputKey,
                reason: 'unsupported_property_type',
                propertyName: resolved.name,
                propertyType: resolved.definition?.type || 'unknown',
            });
            continue;
        }

        properties[resolved.name] = notionPropertyValue;
        mapped.push({
            inputKey,
            propertyName: resolved.name,
            propertyType: resolved.definition?.type || 'unknown',
        });
    }

    return { properties, mapped, unresolved };
}

// 處理提交到 Notion 的端點（包括所有欄位）
app.post('/api/submit-to-notion', async (req, res) => {
    console.log('收到請求:', req.body);

    const { studentName, theme, essayContent, className, noteContent, kfAnalysisContent, chatHistory, outlineContent } = req.body;
    const sanitizedEssayContent = htmlToPlainText(essayContent || '');

    // 驗證請求數據
    if (!studentName || !theme || !sanitizedEssayContent || !className) {
        return res.status(400).json({
            success: false,
            error: '缺少必要字段：studentName, theme, essayContent 和 className 為必填項',
        });
    }

    try {
        // 分段處理所有文字欄位
        const essayChunks = splitTextIntoChunks(sanitizedEssayContent, 2000);
        const essayRichText = essayChunks.map(chunk => ({
            text: { content: chunk }
        }));

        const noteChunks = splitTextIntoChunks(noteContent || '', 2000);
        const noteRichText = noteChunks.map(chunk => ({
            text: { content: chunk }
        }));

        let kfAnalysisChunks = splitTextIntoChunks(kfAnalysisContent || '', 2000);
        let kfAnalysisRichText = kfAnalysisChunks.map(chunk => ({
            text: { content: chunk }
        }));

        let chatHistoryText = typeof chatHistory === 'object' ? JSON.stringify(chatHistory) : chatHistory || '';
        let chatHistoryChunks = splitTextIntoChunks(chatHistoryText, 2000);
        let chatHistoryRichText = chatHistoryChunks.map(chunk => ({
            text: { content: chunk }
        }));

        let outlineChunks = splitTextIntoChunks(outlineContent || '', 2000);
        let outlineRichText = outlineChunks.map(chunk => ({
            text: { content: chunk }
        }));

        const submitRequestBody = hasOwn(req.body, 'submissionStatus')
            ? req.body
            : {
                ...req.body,
                submissionStatus: '是',
            };
        const gradingPayload = await buildGradingPropertiesPayloadFromRequest(submitRequestBody);
        if (gradingPayload.unresolved.length > 0) {
            console.warn('Notion grading fields unresolved in submit-to-notion:', gradingPayload.unresolved);
        }

        const response = await notion.pages.create({
            parent: { database_id: NOTION_DATABASE_ID },
            properties: {
                '學生姓名': {
                    title: [
                        {
                            text: {
                                content: studentName,
                            },
                        },
                    ],
                },
                '主題': {
                    rich_text: [
                        {
                            text: {
                                content: theme,
                            },
                        },
                    ],
                },
                '議論文內容': {
                    rich_text: essayRichText,
                },
                '班級': {
                    rich_text: [
                        {
                            text: {
                                content: className,
                            },
                        },
                    ],
                },
                '筆記區': {
                    rich_text: noteRichText,
                },
                'KF摘要': {
                    rich_text: kfAnalysisRichText,
                },
                '聊天歷史紀錄': {
                    rich_text: chatHistoryRichText,
                },
                '寫作大綱': {
                    rich_text: outlineRichText,
                },
                ...gradingPayload.properties,
            },
        });

        console.log('Notion API 回應:', response);
        res.json({
            success: true,
            data: response,
            gradingMapping: {
                mapped: gradingPayload.mapped,
                unresolved: gradingPayload.unresolved,
            },
        });
    } catch (error) {
        console.error('Notion API 錯誤詳情:', error.message, error.body);
        console.error('錯誤堆棧:', error.stack);
        res.status(error.status || 500).json({
            success: false,
            error: '無法提交到 Notion',
            details: error.message || '請檢查伺服器日誌',
        });
    }
});

// 根據學生姓名、班級名稱和主題名稱從 Notion 資料庫中獲取議論文內容
app.get('/api/get-essay/:studentName', async (req, res) => {
    const studentName = normalizeLookupValue(req.params.studentName);
    const className = normalizeLookupValue(req.query.className);
    const theme = normalizeLookupValue(req.query.theme);
    const normalizedStudentName = studentName;
    const normalizedClassName = className;
    const normalizedTheme = theme;

    if (!studentName || !className || !theme) {
        return res.status(400).json({
            success: false,
            error: '缺少必要參數：studentName, className 和 theme 為必填項',
        });
    }

    try {
        const response = await notion.databases.query({
            database_id: NOTION_DATABASE_ID,
            filter: {
                and: [
                    {
                        property: '學生姓名',
                        title: {
                            equals: normalizedStudentName,
                        },
                    },
                    {
                        property: '班級',
                        rich_text: {
                            equals: normalizedClassName,
                        },
                    },
                    {
                        property: '主題',
                        rich_text: {
                            equals: normalizedTheme,
                        },
                    },
                ],
            },
        });

        let candidateResults = Array.isArray(response?.results) ? response.results : [];
        let matchedBy = 'equals';
        if (candidateResults.length === 0) {
            const fuzzyResponse = await notion.databases.query({
                database_id: NOTION_DATABASE_ID,
                filter: createScopeFilter('contains', studentName, className, theme),
            });
            candidateResults = Array.isArray(fuzzyResponse?.results) ? fuzzyResponse.results : [];
            matchedBy = 'contains';
        }

        if (candidateResults.length === 0) {
            return res.status(404).json({
                success: false,
                error: '未找到符合學生姓名、班級和主題的議論文內容',
            });
        }

        const latestPage = sortByLastEditedDesc(candidateResults)[0];
        const properties = latestPage?.properties || {};
        const essayContent = getDisplayValueByAliases(properties, ['議論文內容']);
        const noteContent = getDisplayValueByAliases(properties, ['筆記區']);
        const kfAnalysisContent = getDisplayValueByAliases(properties, ['KF摘要']);
        const chatHistoryContent = getDisplayValueByAliases(properties, ['聊天歷史紀錄']);
        const outlineContent = getDisplayValueByAliases(properties, ['寫作大綱']);

        const parsedNote = safeJsonParse(noteContent, {});
        const teacherFeedback = pickFirstNonEmptyValue(
            getDisplayValueByAliases(properties, ['教師評語']),
            parsedNote?.humanComment
        );
        const aiFeedback = pickFirstNonEmptyValue(
            getDisplayValueByAliases(properties, ['AI評語', 'AI 評語', 'AI Feedback', 'AIFeedback', 'AI Comment', 'AIComment']),
            parsedNote?.aiComment
        );
        const teacherMessage = pickFirstNonEmptyValue(
            getDisplayValueByAliases(properties, [
                '\u7559\u8a00\u6b04\u4f4d',
                '\u7559\u8a00',
                'Teacher Message',
                'Message Board',
                'TeacherNotification',
            ]),
            parsedNote?.teacherNotificationMessage,
            parsedNote?.teacherMessage
        );
        const claimsScore = pickFirstNonEmptyValue(
            getDisplayValueByAliases(properties, ['Claims分數']),
            parsedNote?.claimsScore
        );
        const aiClaimsScore = pickFirstNonEmptyValue(
            getDisplayValueByAliases(properties, ['AI Claims分數', 'AI Claims 分數', 'AI Claims Score', 'AIClaimsScore']),
            parsedNote?.aiClaimsScore,
            parsedNote?.aiScores?.claimsScore
        );
        const claimsComment = pickFirstNonEmptyValue(
            getDisplayValueByAliases(properties, ['Claims評語']),
            parsedNote?.claimsComment
        );
        const aiClaimsComment = pickFirstNonEmptyValue(
            getDisplayValueByAliases(properties, ['AI Claims評語', 'AI Claims 評語', 'AI Claims Comment', 'AIClaimsComment']),
            parsedNote?.aiClaimsComment,
            parsedNote?.aiDetailComments?.claimsComment
        );
        const groundsScore = pickFirstNonEmptyValue(
            getDisplayValueByAliases(properties, ['Grounds分數']),
            parsedNote?.groundsScore
        );
        const aiGroundsScore = pickFirstNonEmptyValue(
            getDisplayValueByAliases(properties, ['AI Ground分數', 'AI Ground 分數', 'AI Grounds分數', 'AI Grounds 分數', 'AI Ground Score', 'AIGroundScore', 'AI Grounds Score', 'AIGroundsScore']),
            parsedNote?.aiGroundsScore,
            parsedNote?.aiScores?.groundsScore
        );
        const groundsComment = pickFirstNonEmptyValue(
            getDisplayValueByAliases(properties, ['Grounds評語']),
            parsedNote?.groundsComment
        );
        const aiGroundsComment = pickFirstNonEmptyValue(
            getDisplayValueByAliases(properties, ['AI Ground評語', 'AI Ground 評語', 'AI Grounds評語', 'AI Grounds 評語', 'AI Ground Comment', 'AIGroundComment', 'AI Grounds Comment', 'AIGroundsComment']),
            parsedNote?.aiGroundsComment,
            parsedNote?.aiDetailComments?.groundsComment
        );
        const rebuttalsScore = pickFirstNonEmptyValue(
            getDisplayValueByAliases(properties, ['Rebuttals分數']),
            parsedNote?.rebuttalsScore
        );
        const aiRebuttalsScore = pickFirstNonEmptyValue(
            getDisplayValueByAliases(properties, ['AI Rebuttal分數', 'AI Rebuttal 分數', 'AI Rebuttals分數', 'AI Rebuttals 分數', 'AI Rebuttal Score', 'AIRebuttalScore', 'AI Rebuttals Score', 'AIRebuttalsScore']),
            parsedNote?.aiRebuttalsScore,
            parsedNote?.aiScores?.rebuttalsScore
        );
        const rebuttalsComment = pickFirstNonEmptyValue(
            getDisplayValueByAliases(properties, ['Rebuttals評語']),
            parsedNote?.rebuttalsComment
        );
        const aiRebuttalsComment = pickFirstNonEmptyValue(
            getDisplayValueByAliases(properties, ['AI Rebuttal評語', 'AI Rebuttal 評語', 'AI Rebuttals評語', 'AI Rebuttals 評語', 'AI Rebuttal Comment', 'AIRebuttalComment', 'AI Rebuttals Comment', 'AIRebuttalsComment']),
            parsedNote?.aiRebuttalsComment,
            parsedNote?.aiDetailComments?.rebuttalsComment
        );
        const totalScore = pickFirstNonEmptyValue(
            getDisplayValueByAliases(properties, ['總分']),
            parsedNote?.totalScore
        );
        const aiTotalScore = pickFirstNonEmptyValue(
            getDisplayValueByAliases(properties, ['AI總分', 'AI 總分', 'AI Total Score', 'AITotalScore']),
            parsedNote?.aiTotalScore,
            pickFirstNonEmptyValue(parsedNote?.aiScores?.claimsScore, '') !== '' || pickFirstNonEmptyValue(parsedNote?.aiScores?.groundsScore, '') !== '' || pickFirstNonEmptyValue(parsedNote?.aiScores?.rebuttalsScore, '') !== ''
                ? String((Number(parsedNote?.aiScores?.claimsScore || 0) + Number(parsedNote?.aiScores?.groundsScore || 0) + Number(parsedNote?.aiScores?.rebuttalsScore || 0)))
                : ''
        );

        const submissionStatus = normalizeSubmissionStatus(
            pickFirstNonEmptyValue(
                getDisplayValueByAliases(properties, [
                    '\u662f\u5426\u7e73\u4ea4',
                    '\u7e73\u4ea4\u72c0\u614b',
                    '\u63d0\u4ea4\u72c0\u614b',
                    'Submission Status',
                    'SubmissionStatus',
                    'Submitted',
                ]),
                parsedNote?.submissionStatus
            )
        );

        res.json({
            success: true,
            data: {
                lastEditedTime: latestPage?.last_edited_time || '',
                essayContent,
                noteContent,
                kfAnalysisContent,
                chatHistory: safeJsonParse(chatHistoryContent, []),
                outlineContent,
                teacherFeedback,
                aiFeedback,
                aiComment: aiFeedback,
                teacherMessage,
                claimsScore,
                aiClaimsScore,
                claimsComment,
                aiClaimsComment,
                groundsScore,
                aiGroundsScore,
                groundsComment,
                aiGroundsComment,
                rebuttalsScore,
                aiRebuttalsScore,
                rebuttalsComment,
                aiRebuttalsComment,
                totalScore,
                aiTotalScore,
                submissionStatus,
            },
            matchedBy,
        });
    } catch (error) {
        console.error('Notion API 錯誤詳情:', error);
        res.status(500).json({
            success: false,
            error: error.message || '無法從 Notion 獲取資料，請檢查伺服器日誌',
        });
    }
});

// 更新或創建記錄：根據學生姓名、班級和主題更新所有欄位
app.patch('/api/update-note', async (req, res) => {
    console.log('收到更新請求:', req.body);

    const { studentName, className, theme, noteContent, essayContent, kfAnalysisContent, chatHistory, outlineContent } = req.body;
    const sanitizedEssayContent = htmlToPlainText(essayContent || '');
    const normalizedStudentName = normalizeLookupValue(studentName);
    const normalizedClassName = normalizeLookupValue(className);
    const normalizedTheme = normalizeLookupValue(theme);

    // 驗證請求數據
    if (!normalizedStudentName || !normalizedClassName || !normalizedTheme) {
        return res.status(400).json({
            success: false,
            error: '缺少必要字段：studentName, className 和 theme 為必填項',
        });
    }

    try {
        // 查詢符合條件的記錄
        const queryResponse = await notion.databases.query({
            database_id: NOTION_DATABASE_ID,
            filter: {
                and: [
                    {
                        property: '學生姓名',
                        title: {
                            equals: normalizedStudentName,
                        },
                    },
                    {
                        property: '班級',
                        rich_text: {
                            equals: normalizedClassName,
                        },
                    },
                    {
                        property: '主題',
                        rich_text: {
                            equals: normalizedTheme,
                        },
                    },
                ],
            },
        });

        // 分段處理所有文字欄位
        const essayChunks = splitTextIntoChunks(sanitizedEssayContent, 2000);
        const essayRichText = essayChunks.map(chunk => ({
            text: { content: chunk }
        }));

        const noteChunks = splitTextIntoChunks(noteContent || '', 2000);
        const noteRichText = noteChunks.map(chunk => ({
            text: { content: chunk }
        }));

        let kfAnalysisChunks = splitTextIntoChunks(kfAnalysisContent || '', 2000);
        let kfAnalysisRichText = kfAnalysisChunks.map(chunk => ({
            text: { content: chunk }
        }));

        let chatHistoryText = typeof chatHistory === 'object' ? JSON.stringify(chatHistory) : chatHistory || '';
        let chatHistoryChunks = splitTextIntoChunks(chatHistoryText, 2000);
        let chatHistoryRichText = chatHistoryChunks.map(chunk => ({
            text: { content: chunk }
        }));

        let outlineChunks = splitTextIntoChunks(outlineContent || '', 2000);
        let outlineRichText = outlineChunks.map(chunk => ({
            text: { content: chunk }
        }));
        const gradingPayload = await buildGradingPropertiesPayloadFromRequest(req.body);
        if (gradingPayload.unresolved.length > 0) {
            console.warn('Notion grading fields unresolved in update-note:', gradingPayload.unresolved);
        }

        let matchedPage = sortByLastEditedDesc(queryResponse.results)[0] || null;
        if (!matchedPage) {
            const fuzzyResponse = await notion.databases.query({
                database_id: NOTION_DATABASE_ID,
                filter: createScopeFilter('contains', normalizedStudentName, normalizedClassName, normalizedTheme),
            });
            matchedPage = sortByLastEditedDesc(fuzzyResponse.results)[0] || null;
        }

        // Preserve existing large text fields when caller omits them.
        if (matchedPage) {
            const existingProperties = matchedPage?.properties || {};

            if (kfAnalysisContent === undefined) {
                const existingKfAnalysisContent = getDisplayValueByAliases(existingProperties, ['KF摘要']);
                kfAnalysisChunks = splitTextIntoChunks(existingKfAnalysisContent || '', 2000);
                kfAnalysisRichText = kfAnalysisChunks.map(chunk => ({
                    text: { content: chunk }
                }));
            }

            if (chatHistory === undefined) {
                const existingChatHistoryContent = getDisplayValueByAliases(existingProperties, ['聊天歷史紀錄']);
                chatHistoryText = existingChatHistoryContent || '';
                chatHistoryChunks = splitTextIntoChunks(chatHistoryText, 2000);
                chatHistoryRichText = chatHistoryChunks.map(chunk => ({
                    text: { content: chunk }
                }));
            }

            if (outlineContent === undefined) {
                const existingOutlineContent = getDisplayValueByAliases(existingProperties, ['寫作大綱']);
                outlineChunks = splitTextIntoChunks(existingOutlineContent || '', 2000);
                outlineRichText = outlineChunks.map(chunk => ({
                    text: { content: chunk }
                }));
            }
        }

        if (matchedPage) {
            // 如果記錄存在，更新該記錄
            const pageId = matchedPage.id;

            const updateResponse = await notion.pages.update({
                page_id: pageId,
                properties: {
                    '議論文內容': {
                        rich_text: essayRichText,
                    },
                    '筆記區': {
                        rich_text: noteRichText,
                    },
                    'KF摘要': {
                        rich_text: kfAnalysisRichText,
                    },
                    '聊天歷史紀錄': {
                        rich_text: chatHistoryRichText,
                    },
                    '寫作大綱': {
                        rich_text: outlineRichText,
                    },
                    ...gradingPayload.properties,
                },
            });

            console.log('Notion API 更新回應:', updateResponse);
            res.json({
                success: true,
                data: updateResponse,
                gradingMapping: {
                    mapped: gradingPayload.mapped,
                    unresolved: gradingPayload.unresolved,
                },
            });
        } else {
            // 如果記錄不存在，創建新記錄
            const createResponse = await notion.pages.create({
                parent: { database_id: NOTION_DATABASE_ID },
                properties: {
                    '學生姓名': {
                        title: [
                            {
                                text: {
                                    content: studentName,
                                },
                            },
                        ],
                    },
                    '主題': {
                        rich_text: [
                            {
                                text: {
                                    content: theme,
                                },
                            },
                        ],
                    },
                    '議論文內容': {
                        rich_text: essayRichText,
                    },
                    '班級': {
                        rich_text: [
                            {
                                text: {
                                    content: className,
                                },
                            },
                        ],
                    },
                    '筆記區': {
                        rich_text: noteRichText,
                    },
                    'KF摘要': {
                        rich_text: kfAnalysisRichText,
                    },
                    '聊天歷史紀錄': {
                        rich_text: chatHistoryRichText,
                    },
                    '寫作大綱': {
                        rich_text: outlineRichText,
                    },
                    ...gradingPayload.properties,
                },
            });

            console.log('Notion API 創建回應:', createResponse);
            res.json({
                success: true,
                data: createResponse,
                gradingMapping: {
                    mapped: gradingPayload.mapped,
                    unresolved: gradingPayload.unresolved,
                },
            });
        }
    } catch (error) {
        console.error('Notion API 錯誤詳情:', error.message, error.body);
        console.error('錯誤堆棧:', error.stack);
        res.status(error.status || 500).json({
            success: false,
            error: '無法更新或創建 Notion 記錄',
            details: error.message || '請檢查伺服器日誌',
        });
    }
});

// 根據班級名稱查詢 Notion 資料庫中的記錄
app.post('/api/increment-login-count', async (req, res) => {
    const normalizedStudentName = normalizeLookupValue(req.body?.studentName);
    const normalizedClassName = normalizeLookupValue(req.body?.className);
    const normalizedTheme = normalizeLookupValue(req.body?.theme);

    if (!normalizedStudentName || !normalizedClassName || !normalizedTheme) {
        return res.status(400).json({
            success: false,
            error: '缺少必要欄位：studentName、className、theme',
        });
    }

    try {
        const loginCountProperty = await resolveLoginCountPropertyOrThrow();
        const loginDateCountsProperty = await resolveLoginDateCountsPropertyOptional();
        const scopeResult = await findPageByScope({
            studentName: normalizedStudentName,
            className: normalizedClassName,
            theme: normalizedTheme,
        });
        const currentCount = scopeResult.page
            ? getLoginCountFromProperties(scopeResult.page.properties || {})
            : 0;
        const nextCount = currentCount + 1;
        const nextCountPayload = toNotionPropertyValueByType(loginCountProperty.definition?.type, nextCount);

        if (!nextCountPayload) {
            throw new Error(`登入次數欄位型別不支援：${loginCountProperty.definition?.type || 'unknown'}`);
        }

        const todayDate = formatDateKeyByTimeZone(new Date(), 'Asia/Taipei');
        const currentDateCounts = scopeResult.page
            ? getLoginDateCountsFromProperties(scopeResult.page.properties || {})
            : {};
        const nextDateCounts = { ...currentDateCounts };
        if (todayDate) {
            nextDateCounts[todayDate] = toNonNegativeInteger(nextDateCounts[todayDate]) + 1;
        }

        const updateProperties = {
            [loginCountProperty.name]: nextCountPayload,
        };
        if (loginDateCountsProperty) {
            const loginDateCountsPayload = toNotionPropertyValueByType(
                loginDateCountsProperty.definition?.type,
                JSON.stringify(nextDateCounts)
            );
            if (!loginDateCountsPayload) {
                throw new Error(`LoginDateCounts property type unsupported: ${loginDateCountsProperty.definition?.type || 'unknown'}`);
            }
            updateProperties[loginDateCountsProperty.name] = loginDateCountsPayload;
        }

        let responsePayload = null;
        if (scopeResult.page) {
            responsePayload = await notion.pages.update({
                page_id: scopeResult.page.id,
                properties: updateProperties,
            });
        } else {
            responsePayload = await notion.pages.create({
                parent: { database_id: NOTION_DATABASE_ID },
                properties: {
                    '摮貊?憪?': {
                        title: [{ text: { content: normalizedStudentName } }],
                    },
                    '銝駁?': {
                        rich_text: [{ text: { content: normalizedTheme } }],
                    },
                    '?剔?': {
                        rich_text: [{ text: { content: normalizedClassName } }],
                    },
                    ...updateProperties,
                },
            });
        }

        return res.json({
            success: true,
            data: {
                studentName: normalizedStudentName,
                className: normalizedClassName,
                theme: normalizedTheme,
                loginCount: nextCount,
                loginDateCounts: nextDateCounts,
                loginDateCountsProperty: loginDateCountsProperty?.name || '',
                matchedBy: scopeResult.matchedBy || 'created',
                notionProperty: loginCountProperty.name,
                pageId: responsePayload?.id || scopeResult.page?.id || '',
            },
        });
    } catch (error) {
        console.error('Notion increment-login-count 錯誤:', error);
        return res.status(error?.status || 500).json({
            success: false,
            error: error?.message || '無法更新登入次數',
        });
    }
});

app.get('/api/get-students-by-class/:className', async (req, res) => {
    const { className } = req.params;
    const requestedTheme = normalizeLookupValue(req.query?.theme);
    const aggregateMode = String(req.query?.aggregate || '').trim().toLowerCase();

    if (!className) {
        return res.status(400).json({
            success: false,
            error: '缺少必要參數：className 為必填項',
        });
    }

    try {
        const response = await notion.databases.query({
            database_id: NOTION_DATABASE_ID,
            filter: {
                property: '班級',
                rich_text: {
                    equals: className,
                },
            },
        });

        const students = response.results.map((page) => {
            const properties = page?.properties || {};
            const noteContent = getDisplayValueByAliases(properties, ['筆記區']);
            const parsedNote = safeJsonParse(noteContent, {});
            const totalScore = pickFirstNonEmptyValue(
                getDisplayValueByAliases(properties, ['總分']),
                parsedNote?.totalScore
            );
            const submissionStatus = normalizeSubmissionStatus(
                pickFirstNonEmptyValue(
                    getDisplayValueByAliases(properties, ['是否繳交', '繳交狀態', '提交狀態', 'Submission Status', 'SubmissionStatus', 'Submitted']),
                    parsedNote?.submissionStatus
                )
            );

            return {
                theme: getDisplayValueByAliases(properties, ['主題']) || '未知主題',
                studentName: getDisplayValueByAliases(properties, ['學生姓名']) || '未知學生',
                submissionDate: page.created_time || '尚未繳交',
                submissionStatus,
                totalScore: totalScore || '',
                claimsScore: pickFirstNonEmptyValue(
                    getDisplayValueByAliases(properties, ['Claims分數', 'Claims Score', 'Claims score', 'ClaimsScore']),
                    parsedNote?.claimsScore
                ) || '',
                groundsScore: pickFirstNonEmptyValue(
                    getDisplayValueByAliases(properties, ['Grounds分數', 'Grounds Score', 'Grounds score', 'GroundsScore']),
                    parsedNote?.groundsScore
                ) || '',
                rebuttalsScore: pickFirstNonEmptyValue(
                    getDisplayValueByAliases(properties, ['Rebuttals分數', 'Rebuttals Score', 'Rebuttals score', 'RebuttalsScore']),
                    parsedNote?.rebuttalsScore
                ) || '',
                grade: totalScore || '-',
                loginCount: getLoginCountFromProperties(properties),
                loginDateCounts: getLoginDateCountsFromProperties(properties),
            };
        });
        const filteredStudents = requestedTheme
            ? students.filter((item) => normalizeLookupValue(item?.theme) === requestedTheme)
            : students;

        if (aggregateMode === 'student') {
            const studentMap = new Map();
            filteredStudents.forEach((item) => {
                const key = normalizeLookupValue(item?.studentName).toLowerCase();
                if (!key) return;
                if (!studentMap.has(key)) {
                    studentMap.set(key, {
                        studentName: item.studentName,
                        className,
                        theme: requestedTheme || item.theme || '',
                        loginCount: 0,
                        loginDateCounts: {},
                    });
                }
                const current = studentMap.get(key);
                current.loginCount += toNonNegativeInteger(item.loginCount);
                const itemDateCounts =
                    item?.loginDateCounts && typeof item.loginDateCounts === 'object'
                        ? item.loginDateCounts
                        : {};
                Object.entries(itemDateCounts).forEach(([dateKey, count]) => {
                    const normalizedDateKey = normalizeDateKey(dateKey);
                    if (!normalizedDateKey) return;
                    current.loginDateCounts[normalizedDateKey] =
                        toNonNegativeInteger(current.loginDateCounts[normalizedDateKey]) +
                        toNonNegativeInteger(count);
                });
            });

            return res.json({
                success: true,
                data: [...studentMap.values()],
            });
        }

        res.json({
            success: true,
            data: filteredStudents,
        });
    } catch (error) {
        console.error('Notion API 錯誤詳情:', error);
        res.status(500).json({
            success: false,
            error: error.message || '無法從 Notion 獲取資料，請檢查伺服器日誌',
        });
    }
});

app.get('/api/get-student-progress-by-class/:className', async (req, res) => {
    const normalizedClassName = normalizeLookupValue(req.params?.className);
    const requestedTheme = normalizeLookupValue(req.query?.theme);
    const page = Math.max(1, Number.parseInt(String(req.query?.page || '1'), 10) || 1);
    const pageSize = Math.min(200, Math.max(1, Number.parseInt(String(req.query?.pageSize || '50'), 10) || 50));

    if (!normalizedClassName) {
        return res.status(400).json({
            success: false,
            error: 'Missing required parameter: className',
        });
    }

    try {
        const databaseProperties = await getDatabasePropertiesWithCache();
        const lookup = buildPropertyLookup(databaseProperties);

        const resolvedClassField =
            resolvePropertyConfig(lookup, CLASS_NAME_FIELD_ALIASES, STUDENT_PROGRESS_ALLOWED_FILTER_TYPES) || {
                name: '\u73ed\u7d1a',
                definition: { type: 'rich_text' },
            };
        const resolvedThemeField =
            resolvePropertyConfig(lookup, THEME_FIELD_ALIASES, STUDENT_PROGRESS_ALLOWED_FILTER_TYPES) || {
                name: '\u4e3b\u984c',
                definition: { type: 'rich_text' },
            };

        const filters = [
            createEqualsFilterByType(
                resolvedClassField.name,
                resolvedClassField.definition?.type || 'rich_text',
                normalizedClassName
            ),
        ];

        if (requestedTheme) {
            filters.push(
                createEqualsFilterByType(
                    resolvedThemeField.name,
                    resolvedThemeField.definition?.type || 'rich_text',
                    requestedTheme
                )
            );
        }

        const notionPages = await queryAllNotionRowsByFilter(filters.length === 1 ? filters[0] : { and: filters });
        const rawRows = notionPages.map((pageRecord) =>
            buildStudentProgressRecord({
                page: pageRecord,
                fallbackClassName: normalizedClassName,
            })
        );
        const themeFilteredRows = requestedTheme
            ? rawRows.filter((item) => normalizeLookupValue(item?.theme) === requestedTheme)
            : rawRows;
        const dedupedRows = dedupeStudentProgressRows(themeFilteredRows);

        const totalItems = dedupedRows.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const safePage = Math.min(page, totalPages);
        const startIndex = (safePage - 1) * pageSize;
        const pagedRows = dedupedRows.slice(startIndex, startIndex + pageSize);

        return res.json({
            success: true,
            data: pagedRows,
            pagination: {
                page: safePage,
                pageSize,
                totalItems,
                totalPages,
            },
        });
    } catch (error) {
        console.error('Failed to fetch student progress batch:', error);
        return res.status(500).json({
            success: false,
            error: error?.message || 'Failed to fetch student progress',
        });
    }
});




const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`伺服器運行在 http://0.0.0.0:${PORT}`);
});
