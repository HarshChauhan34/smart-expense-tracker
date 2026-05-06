import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Edit,
  PlusCircle,
  Trash2,
  TrendingDown,
  TrendingUp,
  Repeat,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import {
  deleteTransaction,
  getTransactions,
} from "../services/transactionService";
import ConfirmDialog from "../components/ConfirmDialog";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await getTransactions();
      setTransactions(res.data);
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const categories = useMemo(() => {
    return ["all", ...new Set(transactions.map((item) => item.category))];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        item.note?.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, search, typeFilter, categoryFilter]);

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteTransaction(deleteId);
      toast.success("Transaction deleted");
      setDeleteId(null);
      fetchTransactions();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Title", "Type", "Category", "Amount", "Date", "Note"];

    const rows = filteredTransactions.map((item) => [
      item.title,
      item.type,
      item.category,
      item.amount,
      new Date(item.date).toLocaleDateString("en-IN"),
      item.note || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "transactions-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            All Transactions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Search, filter, edit and manage your records
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-3">
          <button
            onClick={exportCSV}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            <Download size={18} />
            <span>Export CSV</span>
          </button>

          <Link
            to="/recurring"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
          >
            <Repeat size={18} />
            <span>Recurring</span>
          </Link>

          <Link
            to="/add-transaction"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            <PlusCircle size={18} />
            <span>Add Transaction</span>
          </Link>
        </div>
      </div>

      <div className="mb-6 grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-3">
        <div className="relative">
          <input
            className="input pl-11"
            placeholder="Search title, category or note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="input"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          className="input"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "all" ? "All Categories" : cat}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white p-8 text-center text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-300">
          Loading transactions...
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-300">
          No transactions found
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="hidden grid-cols-6 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300 md:grid">
            <span>Title</span>
            <span>Type</span>
            <span>Category</span>
            <span>Amount</span>
            <span>Date</span>
            <span className="text-right">Action</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTransactions.map((item) => (
              <div
                key={item._id}
                className="grid gap-4 px-5 py-4 md:grid-cols-6 md:items-center"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </p>
                  {item.note && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {item.note}
                    </p>
                  )}
                </div>

                <div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                      item.type === "income"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                    }`}
                  >
                    {item.type === "income" ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    {item.type}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {item.category}
                </p>

                <p
                  className={`font-bold ${
                    item.type === "income"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {item.type === "income" ? "+" : "-"}₹{item.amount}
                </p>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {new Date(item.date).toLocaleDateString("en-IN")}
                </p>

                <div className="flex justify-end gap-2">
                  <Link
                    to={`/edit-transaction/${item._id}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-950"
                  >
                    <Edit size={16} />
                    Edit
                  </Link>

                  <button
                    onClick={() => setDeleteId(item._id)}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Transaction?"
        message="This transaction will be permanently deleted. This action cannot be undone."
        confirmText="Yes, Delete"
        type="danger"
        loading={deleteLoading}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </AppLayout>
  );
}

export default Transactions;
