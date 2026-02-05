import express from "express";
import {
  autoSuggest,
  personalizedTrending,
  locationTrending,
  sponsoredTrending,
  exploreFeed
} from "../controllers/search.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/suggest", autoSuggest);
router.get("/personalized", authMiddleware, personalizedTrending);
router.get("/location", locationTrending);
router.get("/sponsored", sponsoredTrending);
router.get("/explore", exploreFeed);

export default router;
