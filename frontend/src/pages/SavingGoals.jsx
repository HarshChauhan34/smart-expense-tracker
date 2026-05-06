import { useEffect, useState } from "react";
import {
  BadgeCheck,
  PlusCircle,
  PiggyBank,
  Target,
  Trash2,
  Trophy,
} from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  addSavingAmount,
  createSavingGoal,
  deleteSavingGoal,
  getSavingGoals,
} from "../services/savingGoalService";

function SavingGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    targetAmount: "",
    savedAmount: "",
    deadline: "",
    note: "",
  });

  const [addAmount, setAddAmount] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await getSavingGoals();
      setGoals(res.data);
    } catch (error) {
      toast.error("Failed to load saving goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();

    if (!form.title || !form.targetAmount) {
      toast.error("Goal title and target amount are required");
      return;
    }

    if (Number(form.targetAmount) <= 0) {
      toast.error("Target amount must be greater than 0");
      return;
    }

    if (form.savedAmount && Number(form.savedAmount) < 0) {
      toast.error("Saved amount cannot be negative");
      return;
    }

    try {
      await createSavingGoal({
        ...form,
        targetAmount: Number(form.targetAmount),
        savedAmount: Number(form.savedAmount || 0),
      });

      toast.success("Saving goal created");

      setForm({
        title: "",
        targetAmount: "",
        savedAmount: "",
        deadline: "",
        note: "",
      });

      fetchGoals();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create goal");
    }
  };

  const handleAddMoney = async (id) => {
    const amount = addAmount[id];

    if (!amount || Number(amount) <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    try {
      await addSavingAmount(id, {
        amount: Number(amount),
      });

      toast.success("Amount added to goal");
      setAddAmount({ ...addAmount, [id]: "" });
      fetchGoals();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add amount");
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteSavingGoal(deleteId);
      toast.success("Saving goal deleted");
      setDeleteId(null);
      fetchGoals();
    } catch (error) {
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.savedAmount, 0);
  const completedGoals = goals.filter((goal) => goal.status === "completed").length;

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Savings Goals
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Set financial goals and track your saving progress
        </p>
      </div>

      <div className="mb-6 grid gap-5 sm:grid-cols-3">
        <GoalStat title="Total Target" value={`₹${totalTarget}`} icon={Target} />
        <GoalStat title="Total Saved" value={`₹${totalSaved}`} icon={PiggyBank} />
        <GoalStat title="Completed Goals" value={completedGoals} icon={BadgeCheck} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Trophy />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Create Goal
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Add your new saving target
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateGoal} className="space-y-5">
            <input
              className="input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Target item"
            />

            <input
              className="input"
              type="number"
              name="targetAmount"
              value={form.targetAmount}
              onChange={handleChange}
              placeholder="Target amount"
            />

            <input
              className="input"
              type="number"
              name="savedAmount"
              value={form.savedAmount}
              onChange={handleChange}
              placeholder="Already saved amount"
            />

            <input
              className="input"
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
            />

            <textarea
              className="input min-h-24 resize-none"
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Optional note"
            />

            <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 font-bold text-white hover:bg-indigo-700">
              <PlusCircle size={20} />
              Create Goal
            </button>
          </form>
        </div>

        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
            Your Goals
          </h2>

          {loading ? (
            <p className="text-slate-500 dark:text-slate-400">
              Loading goals...
            </p>
          ) : goals.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">
              No saving goals found.
            </p>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress =
                  goal.targetAmount > 0
                    ? Math.min(
                        Math.round((goal.savedAmount / goal.targetAmount) * 100),
                        100
                      )
                    : 0;

                const remaining = Math.max(
                  goal.targetAmount - goal.savedAmount,
                  0
                );

                return (
                  <div
                    key={goal._id}
                    className="rounded-3xl border border-slate-200 p-5 dark:border-slate-800"
                  >
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {goal.title}
                          </h3>

                          {goal.status === "completed" && (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                              Completed
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Target ₹{goal.targetAmount} • Saved ₹{goal.savedAmount}
                        </p>

                        {goal.deadline && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Deadline:{" "}
                            {new Date(goal.deadline).toLocaleDateString("en-IN")}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => setDeleteId(goal._id)}
                        className="rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div>
                      <div className="mb-2 flex justify-between text-sm font-semibold">
                        <span className="text-slate-600 dark:text-slate-300">
                          Progress
                        </span>
                        <span className="text-slate-900 dark:text-white">
                          {progress}%
                        </span>
                      </div>

                      <div className="h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            progress >= 100 ? "bg-emerald-500" : "bg-indigo-600"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Remaining: ₹{remaining}
                      </p>
                    </div>

                    {goal.note && (
                      <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {goal.note}
                      </p>
                    )}

                    {goal.status !== "completed" && (
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <input
                          className="input"
                          type="number"
                          value={addAmount[goal._id] || ""}
                          onChange={(e) =>
                            setAddAmount({
                              ...addAmount,
                              [goal._id]: e.target.value,
                            })
                          }
                          placeholder="Add saving amount"
                        />

                        <button
                          onClick={() => handleAddMoney(goal._id)}
                          className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                        >
                          Add Money
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Saving Goal?"
        message="This saving goal will be permanently deleted."
        confirmText="Yes, Delete"
        type="danger"
        loading={deleteLoading}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </AppLayout>
  );
}

function GoalStat({ title, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </h2>
        </div>

        <div className="rounded-2xl bg-indigo-600 p-3 text-white">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

export default SavingGoals;