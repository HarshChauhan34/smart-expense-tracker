import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import { addTransaction } from "../services/transactionService";

function AddTransaction() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: "expense",
    title: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  const [loading, setLoading] = useState(false);

  const incomeCategories = ["Salary", "Freelancing", "Business", "Gift", "Other"];

  const expenseCategories = [
    "Food",
    "Travel",
    "Shopping",
    "Rent",
    "Bills",
    "Education",
    "Health",
    "Entertainment",
    "Other",
  ];

  const categories =
    form.type === "income" ? incomeCategories : expenseCategories;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "type") {
      setForm({
        ...form,
        type: value,
        category: value === "income" ? "Salary" : "Food",
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

    if (!form.title || !form.amount || !form.category) {
      toast.error("Title, amount and category are required");
      return;
    }

    if (Number(form.amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    try {
      setLoading(true);

      await addTransaction({
        ...form,
        amount: Number(form.amount),
      });

      toast.success("Transaction added successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Add Transaction
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Add your income or expense details
        </p>
      </div>

      <div className="max-w-3xl rounded-4xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Transaction Type
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label
                className={`cursor-pointer rounded-2xl border p-4 text-center font-semibold transition ${
                  form.type === "income"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
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
                className={`cursor-pointer rounded-2xl border p-4 text-center font-semibold transition ${
                  form.type === "expense"
                    ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
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

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Title
            </label>
            <input
              className="input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Example: Pizza, Salary, Rent"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Amount
              </label>
              <input
                className="input"
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Category
              </label>
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
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Date
            </label>
            <input
              className="input"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Note
            </label>
            <textarea
              className="input min-h-28 resize-none"
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Optional note"
            />
          </div>

          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            <PlusCircle size={20} />
            {loading ? "Adding..." : "Add Transaction"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}

export default AddTransaction;