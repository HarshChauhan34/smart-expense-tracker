import { IndianRupee } from "lucide-react";

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            ₹{value || 0}
          </h2>
        </div>

        <div className={`rounded-2xl p-3 text-white ${color}`}>
          {Icon ? <Icon size={24} /> : <IndianRupee size={24} />}
        </div>
      </div>
    </div>
  );
}

export default StatCard;