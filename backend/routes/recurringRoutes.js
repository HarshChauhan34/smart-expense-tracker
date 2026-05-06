import express from "express";
import {
  createRecurringTransaction,
  deleteRecurringTransaction,
  generateRecurringTransactions,
  getRecurringTransactions,
  toggleRecurringTransaction,
} from "../controllers/recurringController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createRecurringTransaction);
router.get("/", protect, getRecurringTransactions);
router.post("/generate", protect, generateRecurringTransactions);
router.patch("/:id/toggle", protect, toggleRecurringTransaction);
router.delete("/:id", protect, deleteRecurringTransaction);

export default router;