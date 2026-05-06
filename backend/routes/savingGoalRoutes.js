import express from "express";
import {
  addSavingAmount,
  createSavingGoal,
  deleteSavingGoal,
  getSavingGoals,
  updateSavingGoal,
} from "../controllers/savingGoalController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createSavingGoal);
router.get("/", protect, getSavingGoals);
router.put("/:id", protect, updateSavingGoal);
router.patch("/:id/add-money", protect, addSavingAmount);
router.delete("/:id", protect, deleteSavingGoal);

export default router;