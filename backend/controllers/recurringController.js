import RecurringTransaction from "../models/RecurringTransaction.js";
import Transaction from "../models/Transaction.js";
import { createNotification } from "./notificationController.js";

export const createRecurringTransaction = async (req, res) => {
  try {
    const { type, title, amount, category, note, dayOfMonth } = req.body;

    if (!type || !title || !amount || !category || !dayOfMonth) {
      return res.status(400).json({
        message: "Type, title, amount, category and day are required",
      });
    }

    const recurring = await RecurringTransaction.create({
      user: req.user._id,
      type,
      title,
      amount,
      category,
      note,
      dayOfMonth,
    });

    res.status(201).json(recurring);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to create recurring transaction",
    });
  }
};

export const getRecurringTransactions = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(recurring);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to get recurring transactions",
    });
  }
};

export const toggleRecurringTransaction = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!recurring) {
      return res.status(404).json({
        message: "Recurring transaction not found",
      });
    }

    recurring.isActive = !recurring.isActive;
    await recurring.save();

    res.json(recurring);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to update recurring transaction",
    });
  }
};

export const deleteRecurringTransaction = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!recurring) {
      return res.status(404).json({
        message: "Recurring transaction not found",
      });
    }

    await recurring.deleteOne();

    res.json({
      message: "Recurring transaction deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to delete recurring transaction",
    });
  }
};

export const generateRecurringTransactions = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const recurringList = await RecurringTransaction.find({
      user: req.user._id,
      isActive: true,
    });

    const generated = [];

    for (const item of recurringList) {
      const alreadyGenerated =
        item.lastGeneratedMonth === month && item.lastGeneratedYear === year;

      if (alreadyGenerated) continue;

      const transactionDate = new Date(
        year,
        month - 1,
        Math.min(item.dayOfMonth, 28),
      );

      const transaction = await Transaction.create({
        user: req.user._id,
        type: item.type,
        title: item.title,
        amount: item.amount,
        category: item.category,
        date: transactionDate,
        note: item.note || "Auto generated recurring transaction",
      });

      item.lastGeneratedMonth = month;
      item.lastGeneratedYear = year;
      await item.save();

      generated.push(transaction);
    }

    if (generated.length > 0) {
      await createNotification({
        user: req.user._id,
        type: "success",
        title: "Recurring Transactions Generated",
        message: `${generated.length} recurring transaction(s) generated successfully.`,
      });
    }

    res.json({
      message:
        generated.length > 0
          ? "Recurring transactions generated successfully"
          : "No new recurring transactions to generate",
      generated,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to generate recurring transactions",
    });
  }
};
