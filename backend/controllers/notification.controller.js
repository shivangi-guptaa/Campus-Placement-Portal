import { Notification } from "../models/index.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.id;
    const notifications = await Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: 20,
    });

    const unreadCount = await Notification.count({
      where: { userId, isRead: false },
    });

    return res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notif = await Notification.findByPk(notificationId);
    if (notif) {
      notif.isRead = true;
      await notif.save();
    }
    return res.status(200).json({ success: true, message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
