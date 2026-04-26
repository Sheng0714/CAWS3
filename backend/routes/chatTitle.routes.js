const chatTitleController = require("../controllers/chatTitle.controller");

module.exports = (app) => {
  const router = require("express").Router();

  router.post("/chat-title/generate", chatTitleController.generateChatTitle);

  app.use("/api", router);
};
