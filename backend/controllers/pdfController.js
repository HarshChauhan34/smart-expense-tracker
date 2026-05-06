import PDFDocument from "pdfkit";
import Transaction from "../models/Transaction.js";

export const downloadMonthlyPDF = async (req, res) => {
  try {
    const { month, year } = req.query;

    const selectedMonth = Number(month) || new Date().getMonth() + 1;
    const selectedYear = Number(year) || new Date().getFullYear();

    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 1);

    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startDate, $lt: endDate },
    }).sort({ date: -1 });

    const income = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);

    const expense = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    const balance = income - expense;

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=expense-report-${selectedMonth}-${selectedYear}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(22).text("SpendSense AI", { align: "center" });
    doc.fontSize(14).text("Monthly Expense Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Month: ${selectedMonth}`);
    doc.text(`Year: ${selectedYear}`);
    doc.text(`Generated On: ${new Date().toLocaleDateString("en-IN")}`);
    doc.moveDown();

    doc.fontSize(16).text("Summary");
    doc.moveDown(0.5);

    doc.fontSize(12).text(`Total Income: Rs. ${income}`);
    doc.text(`Total Expense: Rs. ${expense}`);
    doc.text(`Balance: Rs. ${balance}`);
    doc.moveDown();

    doc.fontSize(16).text("Transactions");
    doc.moveDown(0.5);

    if (transactions.length === 0) {
      doc.fontSize(12).text("No transactions found for this month.");
    } else {
      transactions.forEach((item, index) => {
        doc
          .fontSize(11)
          .text(
            `${index + 1}. ${item.title} | ${item.type.toUpperCase()} | ${
              item.category
            } | Rs. ${item.amount} | ${new Date(
              item.date
            ).toLocaleDateString("en-IN")}`
          );

        if (item.note) {
          doc.fontSize(10).text(`   Note: ${item.note}`);
        }

        doc.moveDown(0.4);
      });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to generate PDF",
    });
  }
};