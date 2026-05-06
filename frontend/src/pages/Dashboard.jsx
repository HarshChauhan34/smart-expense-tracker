import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Target,
} from "lucide-react";
import AppLayout from "../components/AppLayout";
import StatCard from "../components/StatCard";
import CategoryPieChart from "../components/CategoryPieChart";
import MonthlyBarChart from "../components/MonthlyBarChart";
import {
  getCategoryReport,
  getMonthlyReport,
  getSummary,
} from "../services/reportService";
import { getTransactions } from "../services/transactionService";
import { getBudgetStatus } from "../services/budgetService";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDateRange = (type, currentFilter = {}) => {
  const now = new Date();

  if (type === "thisMonth") {
    return {
      type,
      startDate: formatDate(new Date(now.getFullYear(), now.getMonth(), 1)),
      endDate: formatDate(now),
    };
  }

  if (type === "lastMonth") {
    return {
      type,
      startDate: formatDate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      endDate: formatDate(new Date(now.getFullYear(), now.getMonth(), 0)),
    };
  }

  if (type === "last7days") {
    const start = new Date();
    start.setDate(start.getDate() - 6);

    return {
      type,
      startDate: formatDate(start),
      endDate: formatDate(now),
    };
  }

  if (type === "last30days") {
    const start = new Date();
    start.setDate(start.getDate() - 29);

    return {
      type,
      startDate: formatDate(start),
      endDate: formatDate(now),
    };
  }

  return {
    type: "custom",
    startDate: currentFilter.startDate || formatDate(now),
    endDate: currentFilter.endDate || formatDate(now),
  };
};

function Dashboard() {
  const initialFilter = getDateRange("thisMonth");

  const [summary, setSummary] = useState({});
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filter, setFilter] = useState(initialFilter);
  const [appliedFilter, setAppliedFilter] = useState(initialFilter);

  const fetchDashboardData = useCallback(async (activeFilter) => {
    try {
      setLoading(true);

      const params = {
        startDate: activeFilter.startDate,
        endDate: activeFilter.endDate,
      };

      const [summaryRes, categoryRes, monthlyRes, transactionRes, budgetRes] =
        await Promise.all([
          getSummary(params),
          getCategoryReport(params),
          getMonthlyReport(),
          getTransactions(params),
          getBudgetStatus(),
        ]);

      setSummary(summaryRes.data);
      setCategoryData(categoryRes.data);
      setMonthlyData(monthlyRes.data);
      setRecentTransactions(transactionRes.data.slice(0, 5));
      setBudgetStatus(budgetRes.data);
    } catch {
      setSummary({});
      setCategoryData([]);
      setMonthlyData([]);
      setRecentTransactions([]);
      setBudgetStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(appliedFilter);
  }, [appliedFilter, fetchDashboardData]);

  const handleQuickFilterChange = (e) => {
    const value = e.target.value;
    const range = getDateRange(value, filter);
    setFilter(range);
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;

    setFilter((prev) => ({
      ...prev,
      type: "custom",
      startDate: newStartDate,
      endDate:
        prev.endDate && new Date(prev.endDate) < new Date(newStartDate)
          ? newStartDate
          : prev.endDate,
    }));
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;

    setFilter((prev) => ({
      ...prev,
      type: "custom",
      endDate: newEndDate,
      startDate:
        prev.startDate && new Date(prev.startDate) > new Date(newEndDate)
          ? newEndDate
          : prev.startDate,
    }));
  };

  const handleApplyFilters = () => {
    setAppliedFilter(filter);
  };

  const handleResetFilters = () => {
    const defaultFilter = getDateRange("thisMonth");

    setFilter(defaultFilter);
    setAppliedFilter(defaultFilter);
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track your income, expenses, balance and monthly reports
        </p>
      </div>

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-4 xl:grid-cols-[1fr_220px_220px_auto] xl:items-end">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Quick Filter
            </label>

            <select
              className="input"
              value={filter.type}
              onChange={handleQuickFilterChange}
            >
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Start Date
            </label>

            <input
              className="input"
              type="date"
              value={filter.startDate}
              max={filter.endDate}
              onChange={handleStartDateChange}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              End Date
            </label>

            <input
              className="input"
              type="date"
              value={filter.endDate}
              min={filter.startDate}
              max={formatDate(new Date())}
              onChange={handleEndDateChange}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleApplyFilters}
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              Apply Filters
            </button>

            <button
              onClick={handleResetFilters}
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              Reset
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing data from {appliedFilter.startDate} to {appliedFilter.endDate}
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white p-8 text-center text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-300">
          Loading dashboard...
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Income"
              value={summary.totalIncome}
              icon={TrendingUp}
              color="bg-emerald-500"
            />

            <StatCard
              title="Total Expense"
              value={summary.totalExpense}
              icon={TrendingDown}
              color="bg-red-500"
            />

            <StatCard
              title="Current Balance"
              value={summary.balance}
              icon={PiggyBank}
              color="bg-indigo-500"
            />

            <StatCard
              title="Selected Range Expense"
              value={summary.thisMonthExpense}
              icon={CalendarDays}
              color="bg-orange-500"
            />
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                  <Target size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Monthly Budget
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {budgetStatus?.message ||
                      "Set your budget to track spending"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-3 flex justify-between text-sm font-semibold">
              <span className="text-slate-600 dark:text-slate-300">
                ₹{budgetStatus?.totalExpense || 0} spent
              </span>
              <span className="text-slate-900 dark:text-white">
                ₹{budgetStatus?.budgetAmount || 0} budget
              </span>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full ${
                  budgetStatus?.status === "danger"
                    ? "bg-red-500"
                    : budgetStatus?.status === "warning"
                      ? "bg-orange-500"
                      : "bg-emerald-500"
                }`}
                style={{
                  width: `${Math.min(budgetStatus?.usedPercent || 0, 100)}%`,
                }}
              />
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
              Used: {budgetStatus?.usedPercent || 0}% | Remaining: ₹
              {budgetStatus?.remaining || 0}
            </p>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <CategoryPieChart data={categoryData} />
            <MonthlyBarChart data={monthlyData} />
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Recent Transactions
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Latest records from selected date range
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentTransactions.length === 0 ? (
                <p className="py-4 text-sm text-slate-500 dark:text-slate-400">
                  No recent transactions found.
                </p>
              ) : (
                recentTransactions.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-wrap items-center justify-between gap-3 py-4"
                  >
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {item.category} •{" "}
                        {new Date(item.date).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                    <p
                      className={`font-bold ${
                        item.type === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {item.type === "income" ? "+" : "-"}₹{item.amount}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}

export default Dashboard;
