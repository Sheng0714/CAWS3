from __future__ import annotations

import sys
from pathlib import Path

from pptx import Presentation
from pptx.enum.shapes import MSO_AUTO_SHAPE_TYPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor


FONT = "Microsoft JhengHei"
BLACK = RGBColor(20, 20, 20)
GRAY = RGBColor(95, 95, 95)
LIGHT = RGBColor(245, 245, 245)
WHITE = RGBColor(255, 255, 255)


def text_shapes(slide):
    return [shape for shape in slide.shapes if hasattr(shape, "text_frame")]


def set_text(shape, text, font_size=24, bold=False, color=BLACK, align=None, line_spacing=None):
    tf = shape.text_frame
    tf.clear()
    tf.word_wrap = True
    tf.vertical_anchor = MSO_ANCHOR.TOP
    lines = text.split("\n")
    for idx, line in enumerate(lines):
        p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
        p.text = line
        p.level = 0
        if align is not None:
            p.alignment = align
        if line_spacing is not None:
            p.line_spacing = line_spacing
        for run in p.runs:
            run.font.name = FONT
            run.font.size = Pt(font_size)
            run.font.bold = bold
            run.font.color.rgb = color


def set_title(slide, idx, text):
    shapes = text_shapes(slide)
    if idx < len(shapes):
        set_text(shapes[idx], text, font_size=33, bold=True, align=PP_ALIGN.CENTER)


def add_box(slide, x, y, w, h, title, body, title_size=22, body_size=18):
    shape = slide.shapes.add_shape(
        MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = WHITE
    shape.line.color.rgb = BLACK
    shape.line.width = Pt(1.2)
    tf = shape.text_frame
    tf.clear()
    tf.margin_left = Inches(0.18)
    tf.margin_right = Inches(0.18)
    tf.margin_top = Inches(0.14)
    tf.margin_bottom = Inches(0.12)
    p = tf.paragraphs[0]
    p.text = title
    p.alignment = PP_ALIGN.LEFT
    for run in p.runs:
        run.font.name = FONT
        run.font.size = Pt(title_size)
        run.font.bold = True
        run.font.color.rgb = BLACK
    for line in body.split("\n"):
        p = tf.add_paragraph()
        p.text = line
        p.level = 0
        p.space_before = Pt(5)
        for run in p.runs:
            run.font.name = FONT
            run.font.size = Pt(body_size)
            run.font.color.rgb = GRAY
    return shape


def add_bullet_box(slide, x, y, w, h, title, bullets, title_size=24, bullet_size=19):
    shape = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = shape.text_frame
    tf.clear()
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = title
    p.alignment = PP_ALIGN.LEFT
    for run in p.runs:
        run.font.name = FONT
        run.font.size = Pt(title_size)
        run.font.bold = True
        run.font.color.rgb = BLACK
    for bullet in bullets:
        p = tf.add_paragraph()
        p.text = f"• {bullet}"
        p.space_before = Pt(8)
        p.level = 0
        for run in p.runs:
            run.font.name = FONT
            run.font.size = Pt(bullet_size)
            run.font.color.rgb = GRAY
    return shape


def add_metric(slide, x, y, w, h, label, value, note):
    shape = slide.shapes.add_shape(
        MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = LIGHT
    shape.line.color.rgb = BLACK
    shape.line.width = Pt(1)
    tf = shape.text_frame
    tf.clear()
    tf.margin_top = Inches(0.12)
    tf.margin_left = Inches(0.14)
    tf.margin_right = Inches(0.14)
    p = tf.paragraphs[0]
    p.text = value
    p.alignment = PP_ALIGN.CENTER
    for run in p.runs:
        run.font.name = FONT
        run.font.size = Pt(38)
        run.font.bold = True
        run.font.color.rgb = BLACK
    p = tf.add_paragraph()
    p.text = label
    p.alignment = PP_ALIGN.CENTER
    for run in p.runs:
        run.font.name = FONT
        run.font.size = Pt(18)
        run.font.bold = True
        run.font.color.rgb = BLACK
    p = tf.add_paragraph()
    p.text = note
    p.alignment = PP_ALIGN.CENTER
    for run in p.runs:
        run.font.name = FONT
        run.font.size = Pt(13)
        run.font.color.rgb = GRAY


def delete_slide(prs, index):
    slide = prs.slides[index]
    slide_id = slide.slide_id
    sld_id_lst = prs.slides._sldIdLst
    for sld_id in list(sld_id_lst):
        if int(sld_id.id) == slide_id:
            prs.part.drop_rel(sld_id.rId)
            sld_id_lst.remove(sld_id)
            return


def clear_slide_extra_text(slide, keep_first_n=1):
    shapes = text_shapes(slide)
    for shape in shapes[keep_first_n:]:
        if shape.text_frame.text.strip():
            set_text(shape, "")


slides = [
    {
        "time": "0:45",
        "note": "各位口試委員、兩位指導教授好，我是𣛮孟辰。今天要報告的題目是「基於生成式人工智慧與合作論證理論之社會性科學議題導向英文議論文線上寫作平台開發與初步評估」。本研究主要關注的是：大學生在英文議論文寫作前，如何把小組合作論證中的想法、證據與反方觀點，轉化成個人可以使用的寫作素材與文章大綱。",
    },
    {
        "time": "0:45",
        "note": "今天的報告依照論文架構分為六個部分。首先說明研究背景、動機與研究問題；接著回顧英文議論文、合作論證與 AI 寫作支援相關文獻；第三部分介紹系統設計與實作；第四部分說明研究方法；第五部分呈現學生與教師的初步評估結果；最後提出研究結論、系統改善建議與未來展望。",
    },
    {"time": "0:10", "note": "首先進入第一部分，緒論。"},
    {
        "time": "1:00",
        "note": "本研究的背景有三個面向。第一，隨著全球化與 EMI 課程推動，學生越來越需要用英文進行學術表達與專業溝通。第二，英文議論文是培養批判思考與論證能力的重要文類，學生需要提出立場、發展論點、提供證據並回應反方觀點。第三，對 EFL 學生而言，英文議論文不只困難在文法或詞彙，也困難在論點規劃、證據整合與文章結構安排。",
    },
    {
        "time": "0:55",
        "note": "合作論證能讓學生透過同儕討論產生多元觀點，也能促進批判思考與議題理解。另一方面，AI 聊天機器人能提供即時回饋與個人化引導。不過，目前很多合作論證平台主要支援討論本身，而 AI 寫作工具多集中在寫作中或寫作後的語言修正。本研究想處理的是兩者之間尚未被充分支援的環節：寫作前的論點整理與結構規劃。",
    },
    {
        "time": "1:15",
        "note": "因此，本研究的動機可整理成三點。第一，學生常缺乏議論文結構與論證規劃能力。第二，現有 AI 工具較少介入寫作前階段，較常是幫助修文法、潤飾或批改。第三，合作論證雖能產生豐富內容，但成果往往零散，學生仍不知道如何轉化為個人文章。基於這些問題，本研究開發一套平台，並初步評估學生與教師對平台的看法。",
    },
    {"time": "0:10", "note": "接下來說明文獻探討。"},
    {
        "time": "1:00",
        "note": "英文議論文的核心能力包含建立清楚立場、發展論點、提出證據，以及回應反方觀點。文獻指出，EFL 學生常見困難包括議論文架構理解不足、論點發展缺乏方向、證據與例子不足，以及無法有效組織段落。這也說明，只提供語言修正並不足夠，學生更需要寫作前的論證與架構支援。",
    },
    {
        "time": "1:00",
        "note": "合作論證能促進學生觀點交流、批判思考與議題深化，但合作論證與個人寫作之間存在轉化落差。小組討論產出的內容通常是對話式、片段式的，並不會自然變成一篇有結構的英文議論文。學生完成討論後，仍需篩選重點、整理論點、安排段落並轉換成英文表達，這正是本研究想支援的關鍵歷程。",
    },
    {
        "time": "0:55",
        "note": "AI 聊天機器人在教育中可作為個別化學習工具，提供即時建議與回饋，也可降低部分教學負擔。不過在英文寫作應用上，很多工具多聚焦於寫作中與寫作後，例如文法修正、拼字檢查、文章評分與修改建議。相較之下，本研究把 AI 定位為寫作前的認知鷹架，透過摘要、分類與提問，引導學生完成自己的寫作規劃。",
    },
    {
        "time": "0:45",
        "note": "本研究也比較了相關平台。Knowledge Forum 與 Kialo Edu 能支援合作論證，但缺少 AI 摘要與寫作引導。ChatGPT、因材網 AI 學伴與寫作批改系統能提供 AI 對話或回饋，但多數沒有串接合作論證歷程。因此，現有平台較少同時支援合作討論、論證摘要、寫作前規劃與寫作回饋。",
    },
    {
        "time": "0:55",
        "note": "本研究的平台定位就是整合這些功能。平台同時具備合作論證、AI 對話、論證摘要、階段式寫作引導與 AI 寫作回饋。重點不是讓 AI 直接替學生完成文章，而是協助學生把 Knowledge Forum 中的小組討論內容轉化為個人化的英文議論文寫作素材與大綱。",
    },
    {"time": "0:10", "note": "接著進入系統設計與實作。"},
    {
        "time": "0:45",
        "note": "系統開發由三種角色共同完成。數位學習教育研究者負責理論基礎與學習支援設計；教學現場教師提供英文議論文教學需求與課堂使用情境；系統開發人員則負責平台介面、前後端功能、AI 串接與測試。透過三方反覆討論，使系統能更貼近真實教學需求。",
    },
    {
        "time": "0:45",
        "note": "系統採用迭代開發流程。第一步是需求分析，了解教師與學生在英文議論文寫作中的困難。第二步進行 UI 與操作流程設計。第三步依據設計進行前端、後端與 AI 模組實作。第四步進行系統測試與修正。整個流程強調持續回饋與調整。",
    },
    {
        "time": "1:00",
        "note": "本平台有三個主要設計特色。第一，介入寫作前階段，協助學生在正式寫作前完成論點整理與大綱規劃。第二，強調 AI 引導而非代寫，透過蘇格拉底式提問促進學生思考。第三，串接合作論證與個人寫作，讓學生能把小組討論成果轉化為自己的文章素材。",
    },
    {
        "time": "1:15",
        "note": "系統功能分為學生端與教師端。學生端包含 Knowledge Forum 論證入口、KF Analysis、Writing Assistant、Writing Analysis 與寫作區。KF Analysis 會整理支持論點、反對論點與證據；Writing Assistant 先檢核議論文架構概念，再引導學生產出 writing outline；Writing Analysis 則在學生繳交前提供文章回饋。教師端則包含班級管理、學生歷程查看、AI 或人工批改，以及教師儀表板。",
    },
    {"time": "0:10", "note": "第四部分是研究方法。"},
    {
        "time": "0:50",
        "note": "本研究對象為北部某國立大學修習大一英文課程的學生。研究於 114 學年度第二學期，也就是 2026 年 4 月到 5 月進行，共五週。三個班級的學生使用平台完成「大學生是否應該使用 AI」這個議題的合作論證與英文議論文寫作。最後回收 86 份有效問卷，另外訪談 15 位學生與 2 位具英文教學經驗的教師。",
    },
    {
        "time": "1:20",
        "note": "系統評估流程包含四個階段。第一，教師介紹平台與英文議論文架構。第二，學生進入 Knowledge Forum，以三到四人為一組進行線上合作論證。第三，學生使用 AI chatbot，先取得 KF summary，再透過 Writing Assistant 產生個人 writing outline，之後到寫作區完成英文議論文。第四，完成活動後進行問卷、學生訪談與教師試用訪談，以了解平台的使用感受與教學可行性。",
    },
    {
        "time": "1:05",
        "note": "研究工具包含量化與質性資料。量化問卷以 TAM 科技接受模式為基礎，分為知覺有用性、知覺易用性與使用意願三個構面，共 22 題，採五點量表。三個構面的 Cronbach's alpha 分別為 .906、.875 與 .918，顯示信度良好。質性資料包含問卷開放題、15 位學生半結構式訪談，以及 2 位教師半結構式訪談。量化資料使用 SPSS 進行描述性統計，訪談資料則以主題分析法整理。",
    },
    {"time": "0:10", "note": "第五部分是研究結果與討論。"},
    {
        "time": "1:30",
        "note": "學生對平台的科技接受度整體為正向。知覺有用性平均數為 4.33，代表學生認為平台能協助英文議論文寫作與寫作規劃。知覺易用性平均數為 4.25，表示學生普遍認為平台操作清楚，尤其肯定筆記區與 AI 內容整理流程。使用意願平均數為 4.31，代表學生願意在未來課程或其他英文寫作任務中再次使用類似平台。相對較低的題目則集中在沒有教學說明時是否能自主上手，以及 AI 對話是否足夠深入，這也成為後續改善方向。",
    },
    {
        "time": "1:15",
        "note": "學生訪談進一步說明平台的幫助。第一，平台協助學生建立英文議論文架構，知道每段應包含立場、理由、證據與反方觀點。第二，Knowledge Forum 討論與 AI 回饋能擴充學生論點，也協助修正文章。第三，學生能分辨本平台與 ChatGPT 或 Gemini 的差異：一般 AI 可能直接生成文章，但本平台是一步一步引導學生完成自己的文章。第四，學生也提出流程仍可改善，特別是 KF、chatbot 與寫作區之間的資料串接可更自動化。",
    },
    {
        "time": "1:20",
        "note": "教師訪談結果也大致肯定平台。兩位教師認為，平台能把寫作歷程具體化，讓學生理解寫作不是直接產出文章，而是需要經過想法生成、論點整理、證據建構與段落組織。教師也認同 AI 寫作精靈應扮演引導者，而不是代寫工具。不過教師也提醒，若教師仍需逐篇輸入大量文字回饋，負擔仍然偏高，因此建議未來加入 checklist 式快速回饋。教師也指出，平台較適合多週期寫作活動，而不是單次短時間操作。",
    },
    {"time": "0:10", "note": "最後進入結論與建議。"},
    {
        "time": "1:10",
        "note": "本研究有三項主要結論。第一，平台能支援學生進行英文議論文架構理解與論點整理，尤其在寫作前規劃上有幫助。第二，AI 工具在本平台中能有效引導學生思考寫作歷程，而不是單純代寫，這也符合本研究對 AI 寫作支援的定位。第三，平台具有教學應用潛力，但實際導入課堂時仍需要持續優化操作流程、功能整合與系統穩定性。",
    },
    {
        "time": "0:55",
        "note": "根據研究結果，第一項改善建議是優化平台操作流程與功能整合。學生指出目前 chatbot、筆記區與寫作區之間仍需切換或複製，未來可自動同步 KF summary、writing outline 與寫作區內容。第二項建議是強化新手導覽與操作提示，例如加入第一次使用的任務導覽、提示視窗或範例，讓學生在沒有教師詳細說明時也能順利完成任務。",
    },
    {
        "time": "0:55",
        "note": "第三項改善建議是發展教師端智慧批改與回饋功能。教師端可加入 checklist 式評語勾選、常見問題快速標記與可編輯回饋模板，降低教師批改負擔。另外，平台也需要持續改善 AI 回應速度、多人同時使用時的穩定性，以及平板或不同裝置上的介面體驗，才能更適合真實課堂長期使用。",
    },
    {
        "time": "0:50",
        "note": "未來展望包含三個方向。第一，平台可擴充到不同英文寫作文類，例如一般寫作、研究報告、反思寫作或學術論文寫作。第二，可發展學生端學習歷程儀表板，讓學生查看自己在合作論證、AI 互動與寫作成績上的變化。第三，教師端可增加自訂評分標準與寫作體裁設定，提升平台在不同課程中的彈性。",
    },
    {
        "time": "0:25",
        "note": "以上是我的研究報告。謝謝各位老師的聆聽，也感謝兩位指導教授在研究過程中的指導。接下來敬請各位老師指教。",
    },
    {"time": "0:10", "note": "我現在準備回答各位老師的問題，謝謝。"},
]


def main() -> int:
    if len(sys.argv) != 4:
        print("usage: generate_thesis_defense_ppt.py <template.pptx> <output.pptx> <script.md>")
        return 2

    src = Path(sys.argv[1])
    out_ppt = Path(sys.argv[2])
    out_md = Path(sys.argv[3])

    prs = Presentation(str(src))
    while len(prs.slides) > 32:
        delete_slide(prs, len(prs.slides) - 1)

    # Slide 1
    shapes = text_shapes(prs.slides[0])
    set_text(shapes[0], "基於生成式人工智慧與合作論證理論之\n社會性科學議題導向英文議論文線上寫作平台\n開發與初步評估", 32, True, align=PP_ALIGN.CENTER)
    set_text(shapes[1], "論文口試", 22, True, align=PP_ALIGN.CENTER)
    set_text(shapes[2], "指導教授：吳穎沺老師、王立仁老師\n研究生：𣛮孟辰", 22, False, align=PP_ALIGN.RIGHT)
    set_text(shapes[3], "論文口試", 18, True, align=PP_ALIGN.CENTER)

    # Slide 2
    data = [
        ("緒論", "研究背景、動機、目的與研究問題"),
        ("研究方法", "研究對象、流程、評估方式與研究工具"),
        ("文獻探討", "英文議論文、合作論證、AI寫作鷹架與平台定位"),
        ("研究結果與討論", "學生問卷、學生訪談與教師訪談結果"),
        ("系統設計與實作", "平台流程、功能模組、技術架構與介面"),
        ("結論與建議", "研究結論、系統改善建議與未來展望"),
    ]
    shapes = text_shapes(prs.slides[1])
    set_text(shapes[1], "內容大綱", 32, True, align=PP_ALIGN.CENTER)
    for i, (title, body) in enumerate(data):
        idx = [0, 4, 2, 6, 8, 10][i]
        body_idx = idx + 1
        set_text(shapes[idx], title, 22, True, align=PP_ALIGN.CENTER)
        set_text(shapes[body_idx], body, 16, False, GRAY, align=PP_ALIGN.CENTER)

    # Section slides
    set_title(prs.slides[2], 0, "緒論")
    set_text(text_shapes(prs.slides[2])[1], "探討研究背景、研究動機\n並定義研究目的與問題", 24, False, GRAY, align=PP_ALIGN.CENTER)

    # Slide 4
    s = prs.slides[3]
    shapes = text_shapes(s)
    set_text(shapes[0], "緒論｜研究背景（一）", 34, True, align=PP_ALIGN.CENTER)
    set_text(shapes[1], "全球化與 EMI 教育發展", 21, True)
    set_text(shapes[2], "臺灣推動 2030 雙語國家政策\n大專院校逐步推廣 EMI 課程\n英語成為學術與專業溝通媒介", 18, False, GRAY)
    set_text(shapes[3], "英文議論文的重要性", 21, True)
    set_text(shapes[4], "展現批判思考能力\n展現論證與邏輯推理能力\n高等教育重要學術寫作文類", 18, False, GRAY)
    set_text(shapes[5], "EFL 學生常見困難", 21, True)
    set_text(shapes[6], "論點發展缺乏方向\n證據支持不足\n不熟悉議論文架構\n難以整合反方觀點", 18, False, GRAY)

    # Slide 5
    s = prs.slides[4]
    shapes = text_shapes(s)
    set_text(shapes[0], "緒論｜研究背景（二）", 34, True, align=PP_ALIGN.CENTER)
    set_text(shapes[1], "合作論證的價值", 21, True)
    set_text(shapes[2], "促進觀點交流\n提升批判思考能力\n深化議題理解", 18, False, GRAY)
    set_text(shapes[3], "人工智慧在教育中的優勢", 21, True)
    set_text(shapes[4], "即時回饋\n個人化引導\n可降低學習與教學負擔", 18, False, GRAY)
    set_text(shapes[5], "現有研究缺口", 21, True)
    set_text(shapes[6], "合作論證平台多支援想法生成\nAI 工具多支援寫作中、後回饋\n兩者在寫作前轉化歷程整合不足", 18, False, GRAY)

    # Slide 6
    s = prs.slides[5]
    shapes = text_shapes(s)
    set_text(shapes[0], "緒論｜研究動機與問題", 34, True, align=PP_ALIGN.CENTER)
    set_text(shapes[1], "學生缺乏議論文結構\n與論證規劃能力", 26, True, align=PP_ALIGN.CENTER)
    set_text(shapes[2], "AI 工具較少介入\n寫作前規劃階段", 26, True, align=PP_ALIGN.CENTER)
    set_text(shapes[3], "合作論證成果難以轉化\n為個人寫作素材", 26, True, align=PP_ALIGN.CENTER)
    add_bullet_box(
        s,
        4.1,
        9.15,
        11.8,
        1.2,
        "本研究聚焦",
        ["開發平台並初步評估學生科技接受度、學生使用經驗與教師教學觀點"],
        18,
        16,
    )

    # Slide 7
    set_title(prs.slides[6], 0, "文獻探討")
    set_text(text_shapes(prs.slides[6])[1], "聚焦英文議論文寫作困難、合作論證轉化落差、\nAI 聊天機器人作為寫作前認知鷹架，並分析相關平台定位。", 21, False, GRAY, align=PP_ALIGN.CENTER)

    # Slide 8
    s = prs.slides[7]
    shapes = text_shapes(s)
    set_text(shapes[2], "英文議論文寫作困難", 34, True, align=PP_ALIGN.CENTER)
    set_text(shapes[0], "英文議論文核心能力", 22, True)
    set_text(shapes[1], "建立立場（Claim）\n發展論點（Argument）\n提供證據（Evidence）\n回應反方觀點（Rebuttal）", 18, False, GRAY)
    set_text(shapes[3], "EFL 學生常見困難", 22, True)
    set_text(shapes[4], "議論文結構理解不足\n論點發展缺乏方向\n證據與例子不足\n論證組織能力不足", 18, False, GRAY)

    # Slide 9
    s = prs.slides[8]
    shapes = text_shapes(s)
    set_text(shapes[3], "合作論證到個人寫作之轉化落差", 33, True, align=PP_ALIGN.CENTER)
    set_text(shapes[0], "合作論證", 22, True)
    set_text(shapes[1], "促進觀點交流\n提升批判思考\n深化議題理解", 18, False, GRAY)
    set_text(shapes[2], "合作論證成果", 22, True)
    set_text(shapes[4], "零散且片段化", 22, True, align=PP_ALIGN.CENTER)
    set_text(shapes[5], "缺乏整理機制", 22, True, align=PP_ALIGN.CENTER)
    set_text(shapes[6], "難以轉化為\n個人英文議論文", 22, True, align=PP_ALIGN.CENTER)

    # Slide 10
    s = prs.slides[9]
    shapes = text_shapes(s)
    set_text(shapes[4], "AI 聊天機器人作為寫作前認知鷹架", 33, True, align=PP_ALIGN.CENTER)
    set_text(shapes[0], "AI 於教育中的輔助", 22, True)
    set_text(shapes[1], "個別化學習\n即時建議與回饋\n寫作支持\n降低教學負擔", 18, False, GRAY)
    set_text(shapes[2], "AI 多聚焦於寫作中、後", 22, True)
    set_text(shapes[3], "文法修正\n拼字檢查\n文章評分\n修改建議", 18, False, GRAY)

    # Slide 11
    s = prs.slides[10]
    shapes = text_shapes(s)
    set_text(shapes[1], "相關平台分析", 33, True, align=PP_ALIGN.CENTER)
    set_text(shapes[0], "合作論證平台", 24, True, align=PP_ALIGN.CENTER)
    set_text(shapes[2], "AI 輔助工具", 24, True, align=PP_ALIGN.CENTER)
    add_box(s, 2.0, 4.65, 6.6, 3.0, "Knowledge Forum / Kialo Edu", "支援觀點交流與知識建構\n能保存討論歷程\n缺少 AI 摘要與寫作引導")
    add_box(s, 11.2, 4.65, 6.6, 3.0, "ChatGPT / 因材網 / 寫作批改系統", "支援 AI 對話、問答或寫作回饋\n多聚焦單一功能\n較少串接合作論證歷程")

    # Slide 12
    s = prs.slides[11]
    clear_slide_extra_text(s, 1)
    set_text(text_shapes(s)[0], "本研究定位", 33, True, align=PP_ALIGN.CENTER)
    add_box(s, 2.0, 3.6, 4.8, 3.8, "合作論證", "Knowledge Forum\n小組觀點交流\n論點、證據與反方觀點產生")
    add_box(s, 7.6, 3.6, 4.8, 3.8, "AI 寫作前鷹架", "KF Summary\nWriting Assistant\n蘇格拉底式引導")
    add_box(s, 13.2, 3.6, 4.8, 3.8, "個人寫作", "Writing Outline\n寫作區\nWriting Analysis 回饋")
    add_bullet_box(s, 3.2, 8.25, 13.5, 1.4, "核心差異", ["不是代寫，而是協助學生將合作論證成果轉化為個人寫作素材"], 22, 18)

    # Slide 13
    set_title(prs.slides[12], 0, "系統設計與實作")
    set_text(text_shapes(prs.slides[12])[1], "說明系統開發流程、功能模組、\nAI 實作方式與學生端、教師端介面。", 23, False, GRAY, align=PP_ALIGN.CENTER)

    # Slide 14
    s = prs.slides[13]
    clear_slide_extra_text(s, 1)
    set_text(text_shapes(s)[0], "系統開發人員架構", 33, True, align=PP_ALIGN.CENTER)
    add_box(s, 2.0, 4.1, 4.7, 3.1, "數位學習教育研究者", "理論基礎\n學習支援設計\n研究流程規劃")
    add_box(s, 7.65, 4.1, 4.7, 3.1, "教學現場教師", "英文議論文教學需求\n課堂使用情境\n功能回饋")
    add_box(s, 13.3, 4.1, 4.7, 3.1, "系統開發人員", "前後端實作\nAI 服務串接\n測試與修正")

    # Slide 15
    s = prs.slides[14]
    clear_slide_extra_text(s, 1)
    set_text(text_shapes(s)[0], "系統開發流程", 33, True, align=PP_ALIGN.CENTER)
    steps = [
        ("01", "需求分析", "教師訪談\n教學情境觀察"),
        ("02", "UI/UX 設計", "使用案例\n流程圖與雛形"),
        ("03", "程式設計", "React\nNode.js / Express"),
        ("04", "測試與修正", "功能測試\n教師試用回饋"),
    ]
    for i, (num, title, body) in enumerate(steps):
        add_box(s, 1.4 + i * 4.65, 4.0, 4.0, 3.6, f"{num}｜{title}", body, 22, 18)

    # Slide 16
    s = prs.slides[15]
    clear_slide_extra_text(s, 1)
    set_text(text_shapes(s)[0], "系統設計特色", 33, True, align=PP_ALIGN.CENTER)
    add_box(s, 2.0, 3.8, 4.8, 3.7, "寫作前介入", "在正式寫作前\n整理論點、證據與反方觀點\n降低構思負擔")
    add_box(s, 7.6, 3.8, 4.8, 3.7, "AI 引導而非代寫", "透過階段式提問\n引導學生自行形成大綱\n避免直接生成文章")
    add_box(s, 13.2, 3.8, 4.8, 3.7, "合作到個人轉化", "串接 KF 討論內容\n形成個人化寫作素材\n支援議論文架構建立")

    # Slide 17
    s = prs.slides[16]
    clear_slide_extra_text(s, 1)
    set_text(text_shapes(s)[0], "系統功能與介面說明", 33, True, align=PP_ALIGN.CENTER)
    add_box(s, 1.55, 3.25, 5.0, 4.5, "學生端", "KF 論證入口\nKF Analysis：論點與證據摘要\nWriting Assistant：架構檢核與大綱生成\nWriting Analysis：文章回饋\n寫作區與教師回饋")
    add_box(s, 7.5, 3.25, 5.0, 4.5, "AI 模組", "GPT-4o + RAGFlow\nn8n 擷取 KF 討論資料\nSupport / Oppose / Evidence 分類\nIELTS 規準輔助寫作回饋")
    add_box(s, 13.45, 3.25, 5.0, 4.5, "教師端", "批次註冊與班級管理\n學習歷程查看\nAI / 手動批改\n教師儀表板與留言")

    # Slide 18
    set_title(prs.slides[17], 0, "研究方法")
    shapes = text_shapes(prs.slides[17])
    set_text(shapes[1], "說明研究對象、施測流程、\n系統評估方式、研究工具與資料分析方法。", 23, False, GRAY, align=PP_ALIGN.CENTER)
    for shape in shapes[2:]:
        set_text(shape, "")

    # Slide 19
    s = prs.slides[18]
    clear_slide_extra_text(s, 1)
    set_text(text_shapes(s)[0], "研究對象", 33, True, align=PP_ALIGN.CENTER)
    add_metric(s, 2.0, 3.5, 4.5, 2.6, "有效問卷", "86", "大一英文學生")
    add_metric(s, 7.75, 3.5, 4.5, 2.6, "學生訪談", "15", "三班各 5 位")
    add_metric(s, 13.5, 3.5, 4.5, 2.6, "教師訪談", "2", "十年以上英文教學經驗")
    add_bullet_box(s, 3.0, 7.1, 13.8, 1.7, "研究情境", ["2026 年 4-5 月，共五週；寫作主題為「大學生是否應該使用 AI」"], 22, 18)

    # Slide 20
    s = prs.slides[19]
    clear_slide_extra_text(s, 1)
    set_text(text_shapes(s)[0], "系統評估流程", 33, True, align=PP_ALIGN.CENTER)
    flow = [
        ("平台介紹", "熟悉介面與議論文架構"),
        ("KF 合作論證", "小組提出立場、理由與證據"),
        ("AI 寫作引導", "KF Summary 與 Writing Outline"),
        ("個人寫作", "完成英文議論文並取得回饋"),
        ("問卷與訪談", "蒐集學生與教師使用經驗"),
    ]
    for i, (title, body) in enumerate(flow):
        add_box(s, 0.85 + i * 3.78, 3.8, 3.25, 3.45, f"{i+1}. {title}", body, 18, 15)

    # Slide 21
    s = prs.slides[20]
    clear_slide_extra_text(s, 1)
    set_text(text_shapes(s)[0], "研究工具與資料分析", 33, True, align=PP_ALIGN.CENTER)
    add_box(s, 2.0, 3.5, 4.8, 3.8, "平台使用經驗問卷", "TAM 架構\nPU 8 題、PEOU 8 題、ITU 6 題\n五點 Likert 量表")
    add_box(s, 7.6, 3.5, 4.8, 3.8, "信度與量化分析", "Cronbach's α：\nPU .906\nPEOU .875\nITU .918\nSPSS 描述性統計")
    add_box(s, 13.2, 3.5, 4.8, 3.8, "質性資料", "問卷開放題\n學生半結構式訪談\n教師半結構式訪談\n主題分析法")

    # Slide 22
    set_title(prs.slides[21], 0, "研究結果與討論")
    shapes = text_shapes(prs.slides[21])
    set_text(shapes[1], "呈現學生科技接受度、學生訪談、教師訪談，\n並討論平台於英文議論文寫作教學中的應用意義。", 21, False, GRAY, align=PP_ALIGN.CENTER)
    for shape in shapes[2:]:
        set_text(shape, "")

    # Slide 23
    s = prs.slides[22]
    clear_slide_extra_text(s, 1)
    set_text(text_shapes(s)[0], "學生對平台之科技接受度", 33, True, align=PP_ALIGN.CENTER)
    add_metric(s, 2.1, 3.2, 4.6, 2.8, "知覺有用性", "4.33", "平台協助寫作規劃與論點整理")
    add_metric(s, 7.7, 3.2, 4.6, 2.8, "知覺易用性", "4.25", "操作流程與筆記區使用整體正向")
    add_metric(s, 13.3, 3.2, 4.6, 2.8, "使用意願", "4.31", "願意於未來寫作任務再次使用")
    add_bullet_box(s, 2.4, 7.0, 15.2, 2.0, "主要觀察", ["學生最肯定筆記區與 Writing Outline 對段落規劃的幫助", "相對需改進：自主上手程度、AI 提問深度與流程整合"], 22, 18)

    # Slide 24
    s = prs.slides[23]
    clear_slide_extra_text(s, 1)
    set_text(text_shapes(s)[0], "學生訪談結果分析", 33, True, align=PP_ALIGN.CENTER)
    add_box(s, 1.3, 3.2, 4.1, 3.7, "建立寫作架構", "學生表示 AI 能協助釐清段落內容與寫作大綱")
    add_box(s, 5.8, 3.2, 4.1, 3.7, "擴充與修正論點", "KF 討論提供不同觀點\nAI 回饋指出文章弱點")
    add_box(s, 10.3, 3.2, 4.1, 3.7, "引導而非代寫", "不同於 ChatGPT 直接生成\n平台協助學生完成自己的文章")
    add_box(s, 14.8, 3.2, 4.1, 3.7, "仍需改善流程", "KF、chatbot、寫作區資料轉換可更自動化")

    # Slide 25
    s = prs.slides[24]
    clear_slide_extra_text(s, 1)
    set_text(text_shapes(s)[0], "教師訪談結果分析", 33, True, align=PP_ALIGN.CENTER)
    add_box(s, 1.7, 3.1, 5.2, 3.6, "平台價值", "將英文議論文寫作歷程具體化\n呈現從想法生成到個人文章的過程")
    add_box(s, 7.4, 3.1, 5.2, 3.6, "AI 角色", "教師肯定 AI 應協助統整與提問\n而非直接替學生完成文章")
    add_box(s, 13.1, 3.1, 5.2, 3.6, "導入條件", "教師端需減輕批改負擔\n建議多週期寫作活動\n需重視穩定性與回應速度")

    # Slide 26
    set_title(prs.slides[25], 0, "結論與建議")
    set_text(text_shapes(prs.slides[25])[1], "總結研究發現，提出平台改善建議，\n並說明未來應用與研究方向。", 23, False, GRAY, align=PP_ALIGN.CENTER)

    # Slide 27
    s = prs.slides[26]
    clear_slide_extra_text(s, 1)
    set_text(text_shapes(s)[0], "研究結論", 33, True, align=PP_ALIGN.CENTER)
    add_box(s, 2.0, 3.3, 4.8, 3.9, "一、支援寫作前規劃", "平台有助於學生理解議論文架構\n並整理論點與證據")
    add_box(s, 7.6, 3.3, 4.8, 3.9, "二、AI 引導而非代寫", "AI 透過固定流程與階段性提問\n保留學生思考與參與")
    add_box(s, 13.2, 3.3, 4.8, 3.9, "三、具教學應用潛力", "學生與教師整體正向\n但仍需優化流程、介面與穩定性")

    # Slide 28
    s = prs.slides[27]
    clear_slide_extra_text(s, 1)
    set_text(text_shapes(s)[0], "系統改善建議（一）", 33, True, align=PP_ALIGN.CENTER)
    add_box(s, 3.2, 3.6, 6.0, 4.1, "優化功能整合", "自動同步 KF Summary、Writing Outline 與寫作區\n減少切換頁面與複製貼上\n降低學生操作時的認知負荷")
    add_box(s, 10.8, 3.6, 6.0, 4.1, "強化新手導覽", "加入第一次使用的流程導覽\n提供操作提示、範例與說明影片\n提升自主上手程度")

    # Slide 29
    s = prs.slides[28]
    clear_slide_extra_text(s, 1)
    set_text(text_shapes(s)[0], "系統改善建議（二）", 33, True, align=PP_ALIGN.CENTER)
    add_box(s, 2.0, 3.4, 4.8, 3.9, "教師批改支援", "Checklist 式評語勾選\n常見問題快速標記\n可編輯回饋模板")
    add_box(s, 7.6, 3.4, 4.8, 3.9, "AI 與系統效能", "提升 AI 回應速度\n強化多人同時使用穩定性\n降低等待造成的中斷感")
    add_box(s, 13.2, 3.4, 4.8, 3.9, "跨裝置體驗", "改善平板與小螢幕操作\n優化中英文排版\n讓任務要求更清楚")

    # Slide 30
    s = prs.slides[29]
    clear_slide_extra_text(s, 1)
    set_text(text_shapes(s)[0], "未來展望", 33, True, align=PP_ALIGN.CENTER)
    add_box(s, 2.0, 3.4, 4.8, 3.9, "擴充寫作文類", "一般寫作\n研究報告\n反思寫作\n學術論文寫作")
    add_box(s, 7.6, 3.4, 4.8, 3.9, "學生學習儀表板", "KF 參與情形\nAI 互動紀錄\n歷次作業與分數變化\n促進自我反思")
    add_box(s, 13.2, 3.4, 4.8, 3.9, "教師端彈性設定", "自訂評分標準\n自訂寫作體裁\n支援不同課程需求")

    # Slide 31
    s = prs.slides[30]
    shapes = text_shapes(s)
    set_text(shapes[0], "謝謝各位\n的聆聽", 44, True, align=PP_ALIGN.CENTER)
    set_text(shapes[1], "敬請老師指教", 24, False, GRAY, align=PP_ALIGN.CENTER)

    # Slide 32
    s = prs.slides[31]
    shapes = text_shapes(s)
    set_text(shapes[0], "Q&A", 48, True, align=PP_ALIGN.CENTER)
    set_text(shapes[1], "歡迎提問與指教", 25, False, GRAY, align=PP_ALIGN.CENTER)
    for shape in shapes[2:]:
        set_text(shape, "")

    for idx, slide in enumerate(prs.slides):
        ns = slide.notes_slide
        ns.notes_text_frame.clear()
        ns.notes_text_frame.text = f"預估時間：{slides[idx]['time']}\n\n{slides[idx]['note']}"

    total_seconds = 0
    md_lines = [
        "# 論文口試演講稿（約 25 分鐘）",
        "",
        "題目：基於生成式人工智慧與合作論證理論之社會性科學議題導向英文議論文線上寫作平台開發與初步評估",
        "",
    ]
    for idx, item in enumerate(slides, 1):
        m, sec = item["time"].split(":")
        total_seconds += int(m) * 60 + int(sec)
        title = text_shapes(prs.slides[idx - 1])[0].text_frame.text.replace("\n", " ")
        md_lines.append(f"## Slide {idx}｜{title}｜{item['time']}")
        md_lines.append("")
        md_lines.append(item["note"])
        md_lines.append("")
    md_lines.insert(4, f"總預估時間：約 {total_seconds // 60} 分 {total_seconds % 60} 秒")
    md_lines.insert(5, "")

    out_ppt.parent.mkdir(parents=True, exist_ok=True)
    out_md.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(out_ppt))
    out_md.write_text("\n".join(md_lines), encoding="utf-8")

    print(out_ppt)
    print(out_md)
    print(f"slides={len(prs.slides)} total_time={total_seconds // 60}:{total_seconds % 60:02d}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
