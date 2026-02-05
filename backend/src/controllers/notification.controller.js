import Notification from "../models/Notification.js";

/* 🔔 Get Notifications */
export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id })
    .populate("fromUser", "name avatar")
    .sort({ createdAt: -1 });

  res.json(notifications);
};

/* ✅ Mark as read */
export const markAsRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, {
    read: true
  });
  res.json({ success: true });
};
