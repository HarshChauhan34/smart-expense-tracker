import express from "express";
import { downloadMonthlyPDF } from "../controllers/pdfController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/monthly", protect, downloadMonthlyPDF);

export default router;