const Notification = require("../models/Notification");

// Get notifications for a designer
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ designerId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10); // Get the latest 10 notifications
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  const { notificationId } = req.body;
  try {
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};
