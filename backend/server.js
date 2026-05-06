import express from "express";
import dotenv from "dotenv";
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

const normalizeOrigin = (value) => value?.trim().replace(/\/$/, "");
const isAllowedVercelOrigin = (origin) => {
  if (!origin) return false;
  return /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);
};

const envOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...envOrigins,
]);

app.use((req, res, next) => {
  const requestOrigin = normalizeOrigin(req.headers.origin);
  const isAllowed =
    !requestOrigin ||
    allowedOrigins.has(requestOrigin) ||
    isAllowedVercelOrigin(requestOrigin);

  if (isAllowed && requestOrigin) {
    res.header("Access-Control-Allow-Origin", requestOrigin);
    res.header("Vary", "Origin");
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(isAllowed ? 204 : 403);
  }

  if (!isAllowed) {
    return res
      .status(403)
      .json({ message: `Not allowed by CORS: ${requestOrigin}` });
  }

  next();
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Smart Expense Tracker API is running...");
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
