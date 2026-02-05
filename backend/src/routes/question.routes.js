import express from "express";
import { authMiddleware } from "../middleware/auth.js"; 
import { 
  getTrendingQuestions, 
  voteQuestion,
  createQuestion // 1. Added this import
} from "../controllers/question.controller.js";

const router = express.Router();

// 2. Add the POST route to handle question creation
router.post("/", authMiddleware, createQuestion);

// This was your placeholder GET route
router.get("/", async (req, res) => {
  res.json([]);
});

router.get("/trending", getTrendingQuestions);
router.post("/:id/vote", authMiddleware, voteQuestion);

export default router;