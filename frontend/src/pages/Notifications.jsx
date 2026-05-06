import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  CheckCheck,
  Info,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationService";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      setNotifications(res.data);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      fetchNotifications();
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      toast.success("All notifications marked as read");
      fetchNotifications();
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteNotification(deleteId);
      toast.success("Notification deleted");
      setDeleteId(null);
      fetchNotifications();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

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
      icon: Info,
      box: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-400",
    };
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View budget alerts, recurring updates and system messages
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCheck size={18} />
          Mark All Read
        </button>
      </div>

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
            <Bell size={24} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {unreadCount} Unread Notification{unreadCount === 1 ? "" : "s"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Keep track of important financial updates
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white p-8 text-center text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-300">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-300">
          No notifications found.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((item) => {
            const style = getStyle(item.type);
            const Icon = style.icon;

            return (
              <div
                key={item._id}
                className={`rounded-3xl border p-5 ${style.box} ${
                  item.isRead ? "opacity-70" : ""
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <Icon size={24} className="shrink-0" />

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold">{item.title}</h3>

                        {!item.isRead && (
                          <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-bold dark:bg-black/20">
                            New
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm leading-6">{item.message}</p>

                      <p className="mt-2 text-xs opacity-80">
                        {new Date(item.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 sm:justify-end">
                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkRead(item._id)}
                        className="rounded-xl bg-white/70 px-3 py-2 text-xs font-bold hover:bg-white dark:bg-black/20 dark:hover:bg-black/30"
                      >
                        Mark Read
                      </button>
                    )}

                    <button
                      onClick={() => setDeleteId(item._id)}
                      className="rounded-xl bg-white/70 p-2 hover:bg-white dark:bg-black/20 dark:hover:bg-black/30"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Notification?"
        message="This notification will be permanently deleted."
        confirmText="Yes, Delete"
        type="danger"
        loading={deleteLoading}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </AppLayout>
  );
}

export default Notifications;
