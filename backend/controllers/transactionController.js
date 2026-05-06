import Transaction from "../models/Transaction.js";

export const addTransaction = async (req, res) => {
  try {
    const { type, title, amount, category, date, note } = req.body;

    if (!type || !title || !amount || !category) {
      return res.status(400).json({
        message: "Type, title, amount and category are required",
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      title,
      amount,
      category,
      date,
      note,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to add transaction",
    });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter =
      startDate && endDate
        ? {
            date: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          }
        : {};

    const transactions = await Transaction.find({
      user: req.user._id,
      ...dateFilter,
    }).sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to get transactions",
    });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to get transaction",
    });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    const { type, title, amount, category, date, note } = req.body;

    transaction.type = type || transaction.type;
    transaction.title = title || transaction.title;
    transaction.amount = amount || transaction.amount;
    transaction.category = category || transaction.category;
    transaction.date = date || transaction.date;
    transaction.note = note ?? transaction.note;

    const updatedTransaction = await transaction.save();

    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to update transaction",
    });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    await transaction.deleteOne();

    res.json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to delete transaction",
    });
  }
};
