import express from "express";
import {
  getReportedPolls,
  deletePoll,
  toggleBanUser,
  getReportedComments,
  deleteComment,
  getUsers
} from "../controllers/admin.controller.js";

import { authMiddleware } from "../middleware/auth.js";
import { adminMiddleware } from "../middleware/admin.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/polls/reported", getReportedPolls);
router.delete("/poll/:id", deletePoll);

router.get("/comments/reported", getReportedComments);
router.delete("/comment/:id", deleteComment);

router.get("/users", getUsers);
router.post("/user/:id/ban", toggleBanUser);

export default router;
