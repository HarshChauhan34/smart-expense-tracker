import { useEffect, useState } from "react";
import {
  PlusCircle,
  RefreshCcw,
  Repeat,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import {
  createRecurringTransaction,
  deleteRecurringTransaction,
  generateRecurringTransactions,
  getRecurringTransactions,
  toggleRecurringTransaction,
} from "../services/recurringService";

function Recurring() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [form, setForm] = useState({
    type: "expense",
    title: "",
    amount: "",
    category: "Rent",
    dayOfMonth: 1,
    note: "",
  });

  const incomeCategories = ["Salary", "Freelancing", "Business", "Gift", "Other"];

  const expenseCategories = [
    "Rent",
    "Bills",
    "Food",
    "Travel",
    "Shopping",
    "Education",
    "Health",
    "Entertainment",
    "Other",
  ];

  const categories =
    form.type === "income" ? incomeCategories : expenseCategories;

  const fetchRecurring = async () => {
    try {
      setLoading(true);
      const res = await getRecurringTransactions();
      setItems(res.data);
    } catch {
      toast.error("Failed to load recurring transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurring();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "type") {
      setForm({
        ...form,
        type: value,
        category: value === "income" ? "Salary" : "Rent",
      });
      return;
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.amount || !form.category || !form.dayOfMonth) {
      toast.error("All required fields are needed");
      return;
    }

    if (Number(form.amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    try {
      await createRecurringTransaction({
        ...form,
        amount: Number(form.amount),
        dayOfMonth: Number(form.dayOfMonth),
      });

      toast.success("Recurring transaction created");

      setForm({
        type: "expense",
        title: "",
        amount: "",
        category: "Rent",
        dayOfMonth: 1,
        note: "",
      });

      fetchRecurring();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create recurring");
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await generateRecurringTransactions();
      toast.success(res.data.message);
      fetchRecurring();
    } catch (error) {
      toast.error(error.response?.data?.message || "Generate failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleRecurringTransaction(id);
      toast.success("Status updated");
      fetchRecurring();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this recurring transaction?");
    if (!confirmDelete) return;

    try {
      await deleteRecurringTransaction(id);
      toast.success("Recurring transaction deleted");
      fetchRecurring();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <AppLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Recurring Transactions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Auto-create monthly salary, rent, bills, and subscriptions
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          <RefreshCcw size={18} />
          {generating ? "Generating..." : "Generate This Month"}
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Repeat />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Add Recurring
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Create monthly auto transaction
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Type
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`cursor-pointer rounded-2xl border p-4 text-center font-semibold ${
                    form.type === "income"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value="income"
                    checked={form.type === "income"}
                    onChange={handleChange}
                    className="hidden"
                  />
                  Income
                </label>

                <label
                  className={`cursor-pointer rounded-2xl border p-4 text-center font-semibold ${
                    form.type === "expense"
                      ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                      : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value="expense"
                    checked={form.type === "expense"}
                    onChange={handleChange}
                    className="hidden"
                  />
                  Expense
                </label>
              </div>
            </div>

            <input
              className="input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Example: Monthly Rent"
            />

            <input
              className="input"
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="Amount"
            />

            <select
              className="input"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Generate Day of Month
              </label>
              <input
                className="input"
                type="number"
                min="1"
                max="28"
                name="dayOfMonth"
                value={form.dayOfMonth}
                onChange={handleChange}
                placeholder="1 to 28"
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Recommended: use 1 to 28 to avoid invalid dates.
              </p>
            </div>

            <textarea
              className="input min-h-24 resize-none"
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Optional note"
            />

            <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 font-bold text-white hover:bg-indigo-700">
              <PlusCircle size={20} />
              Add Recurring
            </button>
          </form>
        </div>

        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
            Recurring List
          </h2>

          {loading ? (
            <p className="text-slate-500 dark:text-slate-400">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">
              No recurring transactions found.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {item.category} • Day {item.dayOfMonth} •{" "}
                        {item.isActive ? "Active" : "Paused"}
                      </p>

                      <p
                        className={`mt-2 font-bold ${
                          item.type === "income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {item.type === "income" ? "+" : "-"}₹{item.amount}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggle(item._id)}
                        className="rounded-xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        title="Toggle active status"
                      >
                        {item.isActive ? (
                          <ToggleRight size={22} />
                        ) : (
                          <ToggleLeft size={22} />
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(item._id)}
                        className="rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  {item.note && (
                    <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {item.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default Recurring;
