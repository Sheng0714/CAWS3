




const { htmlToText } = require('html-to-text');

// 在 /api/submit-to-notion 中
app.post('/api/submit-to-notion', async (req, res) => {
    console.log('收到請求:', req.body);
    const { studentName, theme, essayContent, className, noteContent } = req.body;

    if (!studentName || !theme || !essayContent || !className) {
        return res.status(400).json({
            success: false,
            error: '缺少必要字段：studentName, theme, essayContent 和 className 為必填項',
        });
    }

    try {
        // 清理 HTML 標籤
        const cleanEssayContent = htmlToText(essayContent, {
            wordwrap: false,
            ignoreHref: true,
            ignoreImage: true
        });

        // 分段處理
        const essayChunks = splitTextIntoChunks(cleanEssayContent, 2000);
        const essayRichText = essayChunks.map(chunk => ({
            text: { content: chunk }
        }));

        const noteChunks = splitTextIntoChunks(noteContent || '', 2000);
        const noteRichText = noteChunks.map(chunk => ({
            text: { content: chunk }
        }));

        const response = await notion.pages.create({
            parent: { database_id: NOTION_DATABASE_ID },
            properties: {
                '學生姓名': {
                    title: [{ text: { content: studentName } }],
                },
                '主題': {
                    rich_text: [{ text: { content: theme } }],
                },
                '議論文內容': {
                    rich_text: essayRichText,
                },
                '班級': {
                    rich_text: [{ text: { content: className } }],
                },
                '筆記內容': {
                    rich_text: noteRichText,
                },
            },
        });

        console.log('Notion API 回應:', response);
        res.json({ success: true, data: response });
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

// 在 /api/update-note 中
app.patch('/api/update-note', async (req, res) => {
    console.log('收到更新請求:', req.body);
    const { studentName, className, theme, noteContent, essayContent } = req.body;

    if (!studentName || !className || !theme) {
        return res.status(400).json({
            success: false,
            error: '缺少必要字段：studentName, className 和 theme 為必填項',
        });
    }

    try {
        const queryResponse = await notion.databases.query({
            database_id: NOTION_DATABASE_ID,
            filter: {
                and: [
                    {
                        property: '學生姓名',
                        title: { equals: studentName },
                    },
                    {
                        property: '班級',
                        rich_text: { equals: className },
                    },
                    {
                        property: '主題',
                        rich_text: { equals: theme },
                    },
                ],
            },
        });

        if (queryResponse.results.length === 0) {
            return res.status(404).json({
                success: false,
                error: '未找到符合學生姓名、班級和主題的頁面',
            });
        }

        const pageId = queryResponse.results[0].id;

        // 清理 HTML 標籤
        const cleanEssayContent = htmlToText(essayContent || '', {
            wordwrap: false,
            ignoreHref: true,
            ignoreImage: true
        });

        // 分段處理
        const essayChunks = splitTextIntoChunks(cleanEssayContent, 2000);
        const essayRichText = essayChunks.map(chunk => ({
            text: { content: chunk }
        }));

        const noteChunks = splitTextIntoChunks(noteContent || '', 2000);
        const noteRichText = noteChunks.map(chunk => ({
            text: { content: chunk }
        }));

        const updateResponse = await notion.pages.update({
            page_id: pageId,
            properties: {
                '議論文內容': { rich_text: essayRichText },
                '筆記內容': { rich_text: noteRichText },
            },
        });

        console.log('Notion API 更新回應:', updateResponse);
        res.json({ success: true, data: updateResponse });
    } catch (error) {
        console.error('Notion API 錯誤詳情:', error.message, error.body);
        console.error('錯誤堆棧:', error.stack);
        res.status(error.status || 500).json({
            success: false,
            error: '無法更新 Notion 頁面',
            details: error.message || '請檢查伺服器日誌',
        });
    }
});






