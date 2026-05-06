import SavingGoal from "../models/SavingGoal.js";
import { createNotification } from "./notificationController.js";

export const createSavingGoal = async (req, res) => {
  try {
    const { title, targetAmount, savedAmount, deadline, note } = req.body;

    if (!title || !targetAmount) {
      return res.status(400).json({
        message: "Title and target amount are required",
      });
    }

    const goal = await SavingGoal.create({
      user: req.user._id,
      title,
      targetAmount,
      savedAmount: savedAmount || 0,
      deadline,
      note,
      status: Number(savedAmount || 0) >= Number(targetAmount) ? "completed" : "active",
    });

    await createNotification({
      user: req.user._id,
      type: "success",
      title: "Savings Goal Created",
      message: `Your goal "${goal.title}" has been created.`,
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to create saving goal",
    });
  }
};

export const getSavingGoals = async (req, res) => {
  try {
    const goals = await SavingGoal.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(goals);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to get saving goals",
    });
  }
};

export const updateSavingGoal = async (req, res) => {
  try {
    const goal = await SavingGoal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        message: "Saving goal not found",
      });
    }

    const { title, targetAmount, savedAmount, deadline, note } = req.body;

    goal.title = title || goal.title;
    goal.targetAmount = targetAmount ?? goal.targetAmount;
    goal.savedAmount = savedAmount ?? goal.savedAmount;
    goal.deadline = deadline ?? goal.deadline;
    goal.note = note ?? goal.note;
    goal.status =
      Number(goal.savedAmount) >= Number(goal.targetAmount)
        ? "completed"
        : "active";

    const updatedGoal = await goal.save();

    if (updatedGoal.status === "completed") {
      await createNotification({
        user: req.user._id,
        type: "success",
        title: "Savings Goal Completed",
        message: `Great! You completed your goal "${updatedGoal.title}".`,
      });
    }

    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to update saving goal",
    });
  }
};

export const addSavingAmount = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Valid amount is required",
      });
    }

    const goal = await SavingGoal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        message: "Saving goal not found",
      });
    }

    goal.savedAmount += Number(amount);
    goal.status =
      Number(goal.savedAmount) >= Number(goal.targetAmount)
        ? "completed"
        : "active";

    const updatedGoal = await goal.save();

    await createNotification({
      user: req.user._id,
      type: updatedGoal.status === "completed" ? "success" : "info",
      title:
        updatedGoal.status === "completed"
          ? "Savings Goal Completed"
          : "Savings Added",
      message:
        updatedGoal.status === "completed"
          ? `Congratulations! You completed "${updatedGoal.title}".`
          : `₹${amount} added to "${updatedGoal.title}".`,
    });

    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to add saving amount",
    });
  }
};

export const deleteSavingGoal = async (req, res) => {
  try {
    const goal = await SavingGoal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        message: "Saving goal not found",
      });
    }

    await goal.deleteOne();

    res.json({
      message: "Saving goal deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to delete saving goal",
    });
  }
};