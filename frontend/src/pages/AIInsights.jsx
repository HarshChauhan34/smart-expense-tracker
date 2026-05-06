import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Brain,
  Lightbulb,
  ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import { getAIInsights } from "../services/aiService";

function AIInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await getAIInsights();
      setData(res.data);
    } catch {
      toast.error("Failed to load AI insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);
  

  const getStyle = (type) => {
    if (type === "danger") {
      return {
        icon: ShieldAlert,
        box: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400",
      };
    }

    if (type === "warning") {
      return {
        icon: AlertTriangle,
        box: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-400",
      };
    }

    if (type === "success") {
      return {
        icon: BadgeCheck,
        box: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400",
      };
    }

    return {
      icon: Lightbulb,
      box: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-400",
    };
  };

  return (
    <AppLayout>
        
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          AI Insights
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Smart saving suggestions based on your spending pattern
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white p-8 text-center text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-300">
          Loading AI insights...
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-5 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Income
              </p>
              <h2 className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹{data?.totalIncome || 0}
              </h2>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Expense
              </p>
              <h2 className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
                ₹{data?.totalExpense || 0}
              </h2>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Balance
              </p>
              <h2 className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                ₹{data?.balance || 0}
              </h2>
            </div>
          </div>

          <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {data?.ai?.summary && (
              <div className="mb-6 rounded-3xl border border-indigo-200 bg-indigo-50 p-5 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300">
                <h2 className="text-lg font-bold">AI Summary</h2>
                <p className="mt-2 text-sm leading-6">{data.ai.summary}</p>

                <p className="mt-3 text-sm font-bold">
                  Finance Score: {data.ai.score}/100
                </p>
              </div>
            )}
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                <Brain size={24} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Smart Suggestions
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  AI-based money saving tips
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {data?.insights?.map((item, index) => {
                const style = getStyle(item.type);
                const Icon = style.icon;

                return (
                  <div
                    key={index}
                    className={`rounded-2xl border p-5 ${style.box}`}
                  >
                    <div className="flex gap-3">
                      <Icon size={24} className="shrink-0" />
                      <div>
                        <h3 className="font-bold">{item.title}</h3>
                        <p className="mt-1 text-sm leading-6">{item.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}

export default AIInsights;
