import { useEffect, useState } from "react";
import { Target, WalletCards } from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import { getBudgetStatus, setBudget } from "../services/budgetService";

function Budget() {
  const now = new Date();

  const [form, setForm] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    amount: "",
  });

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBudgetStatus = async () => {
    try {
      const res = await getBudgetStatus({
        month: form.month,
        year: form.year,
      });

      setStatus(res.data);
    } catch {
      toast.error("Failed to load budget status");
    }
  };

  useEffect(() => {
    fetchBudgetStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.month, form.year]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: Number(e.target.value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("Enter valid budget amount");
      return;
    }

    try {
      setLoading(true);

      await setBudget({
        month: Number(form.month),
        year: Number(form.year),
        amount: Number(form.amount),
      });

      toast.success("Budget saved successfully");
      setForm({ ...form, amount: "" });
      fetchBudgetStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save budget");
    } finally {
      setLoading(false);
    }
  };

  const progress = Math.min(status?.usedPercent || 0, 100);

  const progressColor =
    status?.status === "danger"
      ? "bg-red-500"
      : status?.status === "warning"
      ? "bg-orange-500"
      : "bg-emerald-500";

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Budget Limit
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Set your monthly budget and track expense usage
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Target />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Set Monthly Budget
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Add or update budget for selected month
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Month
                </label>
                <select
                  className="input"
                  name="month"
                  value={form.month}
                  onChange={handleChange}
                >
                  {[
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
                  ].map((m, index) => (
                    <option key={m} value={index + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Year
                </label>
                <input
                  className="input"
                  type="number"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Budget Amount
              </label>
              <input
                className="input"
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Example: 20000"
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-2xl bg-indigo-600 px-5 py-4 font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Budget"}
            </button>
          </form>
        </div>

        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <WalletCards />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Budget Status
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Current month expense usage
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm font-semibold">
                <span className="text-slate-600 dark:text-slate-300">
                  Used Budget
                </span>
                <span className="text-slate-900 dark:text-white">
                  {status?.usedPercent || 0}%
                </span>
              </div>

              <div className="h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full ${progressColor}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard title="Budget" value={`₹${status?.budgetAmount || 0}`} />
              <InfoCard title="Expense" value={`₹${status?.totalExpense || 0}`} />
              <InfoCard title="Remaining" value={`₹${status?.remaining || 0}`} />
              <InfoCard title="Status" value={status?.status || "not_set"} />
            </div>

            <div
              className={`rounded-2xl border p-4 text-sm font-semibold ${
                status?.status === "danger"
                  ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
                  : status?.status === "warning"
                  ? "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-400"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400"
              }`}
            >
              {status?.message || "Set your monthly budget to track spending."}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
        {value}
      </h3>
    </div>
  );
}

export default Budget;
