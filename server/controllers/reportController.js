const pool = require('../config/db');

// Submit a report (user or task)
exports.submitReport = async (req, res) => {
  try {
    const { target_id, type, reason } = req.body;
    const reporter_id = req.user.id; // From auth middleware

    // Validate
    if (!target_id || !type || !reason) {
      return res.status(400).json({ message: 'Target ID, type, and reason are required' });
    }

    if (!['user', 'task'].includes(type.toLowerCase())) {
      return res.status(400).json({ message: 'Type must be either "user" or "task"' });
    }

    // Verify the target exists
    let targetName;
    if (type.toLowerCase() === 'user') {
      const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [target_id]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      targetName = userResult.rows[0].name;
    } else {
      const taskResult = await pool.query('SELECT title FROM tasks WHERE id = $1', [target_id]);
      if (taskResult.rows.length === 0) {
        return res.status(404).json({ message: 'Task not found' });
      }
      targetName = taskResult.rows[0].title;
    }

    // Check if user already reported this target
    const existingReport = await pool.query(
      'SELECT id FROM reports WHERE reporter_id = $1 AND target_id = $2 AND type = $3',
      [reporter_id, target_id, type.toLowerCase()]
    );

    if (existingReport.rows.length > 0) {
      return res.status(400).json({ message: 'You have already reported this ' + type });
    }

    // Insert report
    const result = await pool.query(
      `INSERT INTO reports (reporter_id, target_id, type, reason, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [reporter_id, target_id, type.toLowerCase(), reason]
    );

    console.log(`🚩 New report: User ${req.user.email} reported ${type} #${target_id} (${targetName})`);

    res.status(201).json({
      message: 'Report submitted successfully. Our team will review it shortly.',
      report: result.rows[0]
    });

  } catch (err) {
    console.error('❌ SUBMIT REPORT ERROR:', err);
    res.status(500).json({ message: 'Failed to submit report. Please try again.' });
  }
};

// Get reports submitted by the current user
exports.getMyReports = async (req, res) => {
  try {
    const reporter_id = req.user.id;

    const result = await pool.query(
      `SELECT r.*,
              CASE WHEN r.type = 'task' THEN t.title ELSE u.name END as target_name
       FROM reports r
       LEFT JOIN tasks t ON r.target_id = t.id AND r.type = 'task'
       LEFT JOIN users u ON r.target_id = u.id AND r.type = 'user'
       WHERE r.reporter_id = $1
       ORDER BY r.created_at DESC`,
      [reporter_id]
    );

    res.json({ reports: result.rows });

  } catch (err) {
    console.error('❌ GET MY REPORTS ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
};
