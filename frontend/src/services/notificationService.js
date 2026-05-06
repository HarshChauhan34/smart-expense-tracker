import api from "./api";

export const getNotifications = () => {
  return api.get("/notifications");
};

export const getUnreadCount = () => {
  return api.get("/notifications/unread-count");
};

export const markNotificationAsRead = (id) => {
  return api.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = () => {
  return api.patch("/notifications/mark-all-read");
};

export const deleteNotification = (id) => {
  return api.delete(`/notifications/${id}`);
};