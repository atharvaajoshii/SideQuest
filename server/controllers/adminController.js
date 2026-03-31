const pool = require('../config/db');

// GET PLATFORM STATS
exports.getPlatformStats = async (req, res) => {
  try {
    const totalUsersResult = await pool.query('SELECT COUNT(*) FROM users');
    const totalTasksResult = await pool.query('SELECT COUNT(*) FROM tasks');
    const totalOrdersResult = await pool.query('SELECT COUNT(*) FROM orders');
    const volumeResult = await pool.query('SELECT SUM(price) FROM tasks');

    res.json({
      totalUsers: parseInt(totalUsersResult.rows[0].count),
      totalTasks: parseInt(totalTasksResult.rows[0].count),
      totalOrders: parseInt(totalOrdersResult.rows[0].count),
      totalVolume: parseFloat(volumeResult.rows[0].sum || 0),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET ALL USERS (with optional search)
exports.getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT id, name, email, role, wallet_balance, is_suspended, created_at FROM users';

    if (search) {
      query += " WHERE name ILIKE $1 OR email ILIKE $1";
      const users = await pool.query(query, [`%${search}%`]);
      return res.json(users.rows);
    }

    query += ' ORDER BY created_at DESC';
    const users = await pool.query(query);
    res.json(users.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// SUSPEND/ACTIVATE USER
exports.toggleUserStatus = async (req, res) => {
  try {
    const { is_suspended } = req.body;
    const userId = req.params.id;

    const updatedUser = await pool.query(
      'UPDATE users SET is_suspended = $1 WHERE id = $2 RETURNING id, name, email, role, is_suspended',
      [is_suspended, userId]
    );

    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET ALL TASKS (with optional reports filter)
exports.getAllTasks = async (req, res) => {
  try {
    const { reported } = req.query;
    let query = `
      SELECT t.*, u.name as poster_name,
             COALESCE(COUNT(r.id), 0) as report_count
      FROM tasks t
      LEFT JOIN users u ON t.poster_id = u.id
      LEFT JOIN reports r ON t.id = r.target_id AND r.type = 'task'
      GROUP BY t.id, u.name
      ORDER BY t.created_at DESC
    `;

    if (reported === 'true') {
      query = `
        SELECT t.*, u.name as poster_name,
               COALESCE(COUNT(r.id), 0) as report_count
        FROM tasks t
        LEFT JOIN users u ON t.poster_id = u.id
        LEFT JOIN reports r ON t.id = r.target_id AND r.type = 'task'
        GROUP BY t.id, u.name
        HAVING COUNT(r.id) > 0
        ORDER BY report_count DESC
      `;
    }

    const tasks = await pool.query(query);
    res.json(tasks.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
// DELETE TASK
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET ALL REPORTS (pending or resolved)
exports.getReports = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT r.id, r.type, r.reason, r.status, r.created_at,
             r.target_id,
             CASE WHEN r.type = 'task' THEN t.title ELSE u.name END as target_name,
             reporter.name as reporter_name
      FROM reports r
      LEFT JOIN tasks t ON r.target_id = t.id AND r.type = 'task'
      LEFT JOIN users u ON r.target_id = u.id AND r.type = 'user'
      LEFT JOIN users reporter ON r.reporter_id = reporter.id
    `;

    // ✅ WHERE must come BEFORE ORDER BY
    if (status === 'pending') {
      query += ` WHERE r.status = 'pending'`;
    }

    query += ` ORDER BY r.created_at DESC`;

    const reports = await pool.query(query);
    res.json(reports.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// RESOLVE REPORT
exports.resolveReport = async (req, res) => {
  try {
    const { status, action } = req.body;
    const reportId = req.params.id;

    await pool.query(
      'UPDATE reports SET status = $1 WHERE id = $2',
      [status, reportId]
    );

    // If action is ban/suspend, handle it
    if (action === 'ban_user') {
      const report = await pool.query('SELECT target_id FROM reports WHERE id = $1', [reportId]);
      if (report.rows.length > 0 && report.rows[0].type === 'user') {
        await pool.query('UPDATE users SET is_suspended = true WHERE id = $1', [report.rows[0].target_id]);
      }
    }

    res.json({ message: 'Report resolved successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET ANNOUNCEMENTS
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await pool.query(
      'SELECT * FROM announcements ORDER BY created_at DESC'
    );
    res.json(announcements.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// CREATE ANNOUNCEMENT (creates notification for all users)
exports.createAnnouncement = async (req, res) => {
  try {
    const { text, title } = req.body;
    const admin_id = req.user.id;

    // Create announcement
    const newAnnouncement = await pool.query(
      'INSERT INTO announcements (admin_id, text) VALUES ($1, $2) RETURNING *',
      [admin_id, text]
    );

    // Create notification for ALL users (type = 'announcement')
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
       SELECT id, $1, $2, 'announcement' FROM users`,
      [title || 'New Announcement', text]
    );

    res.json(newAnnouncement.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};

// DELETE ANNOUNCEMENT
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcementId = req.params.id;
    await pool.query('DELETE FROM announcements WHERE id = $1', [announcementId]);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET SETTINGS
exports.getSettings = async (req, res) => {
  try {
    const settings = await pool.query('SELECT * FROM settings LIMIT 1');
    res.json(settings.rows[0] || {
      platform_fee_percent: 5,
      allow_signups: true,
      maintenance_mode: false
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// UPDATE SETTINGS
exports.updateSettings = async (req, res) => {
  try {
    const { platform_fee_percent, allow_signups, maintenance_mode } = req.body;

    const updatedSettings = await pool.query(
      `INSERT INTO settings (platform_fee_percent, allow_signups, maintenance_mode)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET
         platform_fee_percent = $1,
         allow_signups = $2,
         maintenance_mode = $3
       RETURNING *`,
      [platform_fee_percent, allow_signups, maintenance_mode]
    );

    res.json(updatedSettings.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
