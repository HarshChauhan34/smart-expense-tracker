import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import recurringRoutes from "./routes/recurringRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import savingGoalRoutes from "./routes/savingGoalRoutes.js";

dotenv.config();

connectDB();

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

const envOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...envOrigins,
]);

app.use(
  cors({
    origin: (origin, callback) => {
      const normalizedOrigin = origin?.trim().replace(/\/+$/, "");
      if (!origin || allowedOrigins.has(normalizedOrigin)) {
        return callback(null, true);
      }
      return callback(new Error(`Not allowed by CORS: ${normalizedOrigin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/", (req, res) => {
  res.send("Smart Expense Tracker API is running...");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "smart-expense-tracker-api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/saving-goals", savingGoalRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Internal server error"
      : err.message || "Something went wrong";

  res.status(statusCode).json({ message });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const shutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
      process.exit(0);
    } catch (error) {
      console.error("Error closing MongoDB connection:", error.message);
      process.exit(1);
    }
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
