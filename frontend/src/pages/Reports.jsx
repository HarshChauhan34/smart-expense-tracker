import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Calendar,
  PieChart as PieIcon,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import AppLayout from "../components/AppLayout";
import { getCategoryReport, getMonthlyReport } from "../services/reportService";
import { Download } from "lucide-react";
import { downloadMonthlyPDF } from "../services/pdfService";

const COLORS = ["#6366f1", "#22c55e", "#f97316", "#ec4899", "#06b6d4"];

function Reports() {
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const [categoryRes, monthlyRes] = await Promise.all([
        getCategoryReport(),
        getMonthlyReport(),
      ]);

      setCategoryData(categoryRes.data);
      setMonthlyData(monthlyRes.data);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryByMonth = useCallback(async () => {
    try {
      if (selectedMonth === "all") {
        const res = await getCategoryReport();
        setCategoryData(res.data);
        return;
      }

      const [month, year] = selectedMonth.split("-");

      const res = await getCategoryReport({ month, year });
      setCategoryData(res.data);
    } catch {
      toast.error("Failed to load category report");
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    fetchCategoryByMonth();
  }, [fetchCategoryByMonth]);

  const monthOptions = useMemo(() => {
    return [
      { label: "All Months", value: "all" },
      ...monthlyData.map((item) => ({
        label: `${item.monthName} ${item.year}`,
        value: `${item.month}-${item.year}`,
      })),
    ];
  }, [monthlyData]);

  const filteredMonthlyData = useMemo(() => {
    if (selectedMonth === "all") return monthlyData;

    return monthlyData.filter(
      (item) => `${item.month}-${item.year}` === selectedMonth,
    );
  }, [monthlyData, selectedMonth]);

  const tooltipStyle = {
    backgroundColor: "#020617",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    color: "#fff",
  };

  const handleDownloadPDF = async () => {
    try {
      let params = {};

      if (selectedMonth !== "all") {
        const [month, year] = selectedMonth.split("-");
        params = { month, year };
      }

      const res = await downloadMonthlyPDF(params);

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "monthly-expense-report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download PDF");
    }
  };

  return (
    <AppLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Analyze your monthly income, expenses and category spending
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
          >
            <Download size={18} />
            Download PDF
          </button>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Calendar
              size={18}
              className="text-indigo-600 dark:text-indigo-400"
            />

            <select
              className="bg-transparent text-sm font-semibold text-slate-700 outline-none dark:bg-slate-900 dark:text-slate-200"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {monthOptions.map((month) => (
                <option
                  key={month.value}
                  value={month.value}
                  className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                >
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white p-8 text-center text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-300">
          Loading reports...
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-3">
              <TrendingUp className="text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Income vs Expense
              </h2>
            </div>

            <div className="h-80 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="monthName" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="income" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-3">
                <PieIcon className="text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Category Wise Expenses
                </h2>
              </div>

              <div className="h-80 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="total"
                      nameKey="category"
                      outerRadius={100}
                      label
                    >
                      {categoryData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-3">
                <BarChart3 className="text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Monthly Expense Trend
                </h2>
              </div>

              <div className="h-80 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="monthName" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke="#ef4444"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default Reports;
