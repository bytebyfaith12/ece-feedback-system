import express from "express";
import { accounts, adminMenu, assignedTeams, feedbackCategories, feedbackStatuses, ratings, roles, sites, userTypes } from "../../shared/constants.js";

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({
    data: {
      accounts,
      adminMenu,
      assignedTeams,
      feedbackCategories,
      feedbackStatuses,
      ratings,
      roles,
      sites,
      userTypes,
    },
  });
});

export default router;
