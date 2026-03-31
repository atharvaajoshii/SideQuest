const pool = require('../config/db');

// Get all notifications for a user (only announcements)
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    // Only fetch announcements (type = 'announcement')
    const notifications = await pool.query(`
      SELECT * FROM notifications
      WHERE type = 'announcement'
      ORDER BY created_at DESC
      LIMIT 50
    `, []);

    res.json({ notifications: notifications.rows });
  } catch (err) {
    console.error('❌ GET NOTIFICATIONS ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

// Mark a notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;

    await pool.query(`
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1
    `, [notificationId]);

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('❌ MARK NOTIFICATION ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(`
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = $1 AND is_read = FALSE
    `, [userId]);

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('❌ MARK ALL NOTIFICATIONS ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT COUNT(*) as unread_count
      FROM notifications
      WHERE user_id = $1 AND is_read = FALSE
    `, [userId]);

    res.json({ unreadCount: parseInt(result.rows[0].unread_count) });
  } catch (err) {
    console.error('❌ GET UNREAD COUNT ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};
