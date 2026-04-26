const axios = require("axios");

const DEFAULT_MODEL = process.env.OPENAI_TITLE_MODEL || "gpt-4o";
const TITLE_PROMPT =
  "You generate concise chat titles. Return exactly one plain title in 4 to 10 words. Do not use quotes, numbering, markdown, or punctuation at the end.";

const resolveTitlePrompt = (promptInput) => {
  if (typeof promptInput !== "string") return TITLE_PROMPT;
  const trimmed = promptInput.trim();
  return trimmed || TITLE_PROMPT;
};

const normalizeMessages = (messagesInput) => {
  if (!Array.isArray(messagesInput)) return [];

  return messagesInput
    .map((message) => {
      const role = message?.role === "assistant" ? "assistant" : "user";
      const content = typeof message?.content === "string" ? message.content.trim() : "";
      return { role, content };
    })
    .filter((message) => message.content);
};

const buildConversationText = (messages) => {
  return messages
    .slice(-6)
    .map((message) => `${message.role === "assistant" ? "Assistant" : "User"}: ${message.content}`)
    .join("\n");
};

const sanitizeTitle = (titleInput) => {
  if (typeof titleInput !== "string") return "";

  const normalized = titleInput
    .replace(/[\r\n]+/g, " ")
    .replace(/["']/g, "")
    .replace(/[\u201C\u201D\u2018\u2019]/g, "")
    .replace(/[.]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return "";

  const words = normalized.split(" ").filter(Boolean).slice(0, 10);
  return words.join(" ");
};

exports.generateChatTitle = async (req, res) => {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    return res.status(500).send({ message: "OPENAI_API_KEY is not configured." });
  }

  const messages = normalizeMessages(req.body?.messages);
  const titlePrompt = resolveTitlePrompt(req.body?.prompt);
  if (messages.length === 0) {
    return res.status(400).send({ message: "messages is required." });
  }

  const hasUser = messages.some((message) => message.role === "user");
  const hasAssistant = messages.some((message) => message.role === "assistant");
  if (!hasUser || !hasAssistant) {
    return res.status(400).send({ message: "messages must include both user and assistant roles." });
  }

  const conversationText = buildConversationText(messages);

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: DEFAULT_MODEL,
        temperature: 0.2,
        max_tokens: 24,
        messages: [
          { role: "system", content: titlePrompt },
          {
            role: "user",
            content: `Generate one short title for this conversation:\n${conversationText}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    const rawTitle = response?.data?.choices?.[0]?.message?.content || "";
    const title = sanitizeTitle(rawTitle) || "New Chat";

    return res.status(200).send({
      title,
      model: DEFAULT_MODEL,
    });
  } catch (error) {
    const status = error?.response?.status || 500;
    const detail =
      error?.response?.data?.error?.message || error?.response?.data?.message || error?.message;
    return res.status(status).send({
      message: "Failed to generate chat title.",
      detail,
    });
  }
};
