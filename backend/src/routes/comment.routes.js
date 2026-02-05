import express from "express";
import {
  addComment,
  likeComment,
  getComments
} from "../controllers/comment.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/:questionId", authMiddleware, addComment);
router.get("/:questionId", getComments);
router.post("/like/:id", authMiddleware, likeComment);

export default router;
