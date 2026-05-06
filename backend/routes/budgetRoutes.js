import express from "express";
import {
  getBudgetStatus,
  setBudget,
} from "../controllers/budgetController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, setBudget);
router.get("/status", protect, getBudgetStatus);

export default router;