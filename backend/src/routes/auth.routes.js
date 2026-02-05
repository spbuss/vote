import express from "express";
import { login, register } from "../controllers/auth.controller.js";

const router = express.Router();

// TEMP test route
router.get("/test", (req, res) => {
  res.send("Auth route working ✅");
});

router.post("/register", register);
router.post("/login", login);

export default router;
