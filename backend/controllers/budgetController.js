import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import { createNotification } from "./notificationController.js";

export const setBudget = async (req, res) => {
  try {
    const { month, year, amount } = req.body;

    if (!month || !year || !amount) {
      return res.status(400).json({
        message: "Month, year and amount are required",
      });
    }

    const budget = await Budget.findOneAndUpdate(
      {
        user: req.user._id,
        month,
        year,
      },
      {
        user: req.user._id,
        month,
        year,
        amount,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    res.json(budget);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to set budget",
    });
  }
};

export const getBudgetStatus = async (req, res) => {
  try {
    const now = new Date();

    const month = Number(req.query.month) || now.getMonth() + 1;
    const year = Number(req.query.year) || now.getFullYear();

    const budget = await Budget.findOne({
      user: req.user._id,
      month,
      year,
    });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const expenses = await Transaction.find({
      user: req.user._id,
      type: "expense",
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

    const budgetAmount = budget?.amount || 0;
    const remaining = budgetAmount - totalExpense;

    const usedPercent =
      budgetAmount > 0 ? Math.round((totalExpense / budgetAmount) * 100) : 0;

    let status = "not_set";
    let message = "Set your monthly budget to track spending.";

    if (budgetAmount > 0) {
      if (usedPercent >= 100) {
        status = "danger";
        message = "Budget exceeded! Control your expenses now.";
      } else if (usedPercent >= 70) {
        status = "warning";
        message = "You used more than 70% of your budget.";
      } else {
        status = "safe";
        message = "Your budget is under control.";
      }
    }

    if (budgetAmount > 0 && usedPercent >= 100) {
      await createNotification({
        user: req.user._id,
        type: "danger",
        title: "Budget Exceeded",
        message: `You have spent ₹${totalExpense}, which is above your budget of ₹${budgetAmount}.`,
      });
    } else if (budgetAmount > 0 && usedPercent >= 70) {
      await createNotification({
        user: req.user._id,
        type: "warning",
        title: "Budget Warning",
        message: `You have used ${usedPercent}% of your monthly budget.`,
      });
    }

    res.json({
      month,
      year,
      budgetAmount,
      totalExpense,
      remaining,
      usedPercent,
      status,
      message,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to get budget status",
    });
  }
};
