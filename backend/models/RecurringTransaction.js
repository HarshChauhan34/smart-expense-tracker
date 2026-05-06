import mongoose from "mongoose";

const recurringTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },

    frequency: {
      type: String,
      enum: ["monthly"],
      default: "monthly",
    },

    dayOfMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastGeneratedMonth: {
      type: Number,
      default: null,
    },

    lastGeneratedYear: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

const RecurringTransaction = mongoose.model(
  "RecurringTransaction",
  recurringTransactionSchema
);

export default RecurringTransaction;