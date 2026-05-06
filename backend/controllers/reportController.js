import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

const getRangeFilter = (startDate, endDate) => {
  if (!startDate || !endDate) return {};

  return {
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };
};

const getDateFilter = (month, year) => {
  if (!month || !year) return {};

  const startDate = new Date(Number(year), Number(month) - 1, 1);
  const endDate = new Date(Number(year), Number(month), 1);

  return {
    date: {
      $gte: startDate,
      $lt: endDate,
    },
  };
};

export const getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = getRangeFilter(startDate, endDate);

    const transactions = await Transaction.find({
      user: req.user._id,
      ...dateFilter,
    });

    const totalIncome = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);

    const totalExpense = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    const balance = totalIncome - totalExpense;

    res.json({
      totalIncome,
      totalExpense,
      balance,
      thisMonthExpense: totalExpense,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to get summary",
    });
  }
};

export const getCategoryReport = async (req, res) => {
  try {
    const { month, year, startDate, endDate } = req.query;

    const dateFilter =
      startDate && endDate
        ? getRangeFilter(startDate, endDate)
        : getDateFilter(month, year);

    const report = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          type: "expense",
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          total: 1,
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    res.json(report);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to get category report",
    });
  }
};

export const getMonthlyReport = async (req, res) => {
  try {
    const report = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: {
            month: "$_id.month",
            year: "$_id.year",
          },
          income: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          income: 1,
          expense: 1,
          balance: { $subtract: ["$income", "$expense"] },
        },
      },
      {
        $sort: { year: 1, month: 1 },
      },
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formatted = report.map((item) => ({
      ...item,
      monthName: monthNames[item.month - 1],
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to get monthly report",
    });
  }
};
