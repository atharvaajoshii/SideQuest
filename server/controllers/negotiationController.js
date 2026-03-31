const pool = require('../config/db');

// Get or create negotiation for a task
exports.getOrCreateNegotiation = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user.id;

    // Check if negotiation exists for this task and user
    let negotiation = await pool.query(
      `SELECT * FROM negotiations
       WHERE task_id = $1 AND (freelancer_id = $2 OR client_id = $2)
       ORDER BY created_at DESC LIMIT 1`,
      [taskId, userId]
    );

    if (negotiation.rows.length === 0) {
      // Get task poster (client)
      const task = await pool.query('SELECT poster_id FROM tasks WHERE id = $1', [taskId]);
      if (task.rows.length === 0) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const clientId = task.rows[0].poster_id;

      // Create new negotiation
      negotiation = await pool.query(
        `INSERT INTO negotiations (task_id, client_id, freelancer_id, status, created_at)
         VALUES ($1, $2, $3, 'pending', NOW())
         RETURNING *`,
        [taskId, clientId, userId]
      );
    }

    // Get messages for this negotiation
    const messages = await pool.query(
      `SELECT m.*, sender.name as sender_name, receiver.name as receiver_name
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users receiver ON m.receiver_id = receiver.id
       WHERE m.negotiation_id = $1
       ORDER BY m.created_at ASC`,
      [negotiation.rows[0].id]
    );

    res.json({
      negotiation: negotiation.rows[0],
      messages: messages.rows
    });
  } catch (err) {
    console.error('Negotiation error:', err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};
