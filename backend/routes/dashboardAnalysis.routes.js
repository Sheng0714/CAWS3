const dashboardAnalysisController = require("../controllers/dashboardAnalysis.controller");

module.exports = (app) => {
  const router = require("express").Router();

  router.get("/dashboard/argument-breakdown", dashboardAnalysisController.getArgumentBreakdown);
  router.post("/dashboard/argument-breakdown", dashboardAnalysisController.getArgumentBreakdown);

  app.use("/api", router);
};
