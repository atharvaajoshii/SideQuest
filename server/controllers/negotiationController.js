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

// Get negotiation by negotiation ID
exports.getNegotiationById = async (req, res) => {
  try {
    const negotiationId = req.params.id;
    const userId = req.user.id;

    const negotiation = await pool.query(
      `SELECT * FROM negotiations
       WHERE id = $1 AND (freelancer_id = $2 OR client_id = $2)
       LIMIT 1`,
      [negotiationId, userId]
    );

    if (negotiation.rows.length === 0) {
      return res.status(404).json({ message: 'Negotiation not found' });
    }

    res.json({ negotiation: negotiation.rows[0] });
  } catch (err) {
    console.error('Negotiation error:', err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};

// Get negotiation between current user and another user
exports.getNegotiationWithUser = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user.id;

    const negotiation = await pool.query(
      `SELECT * FROM negotiations
       WHERE (client_id = $1 AND freelancer_id = $2)
          OR (client_id = $2 AND freelancer_id = $1)
       ORDER BY created_at DESC
       LIMIT 1`,
      [currentUserId, otherUserId]
    );

    res.json({ negotiation: negotiation.rows[0] || null });
  } catch (err) {
    console.error('Negotiation error:', err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};

// Get ALL negotiations for a task (task poster view).
// Sources people from BOTH the negotiations table AND direct messages,
// so nobody is missed even if they messaged without hitting the negotiate page.
exports.getAllNegotiationsForTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user.id;

    // Verify the requester is the task poster
    const taskCheck = await pool.query(
      'SELECT id, poster_id FROM tasks WHERE id = $1',
      [taskId]
    );
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (taskCheck.rows[0].poster_id !== userId) {
      return res.status(403).json({ message: 'Only the task poster can view all negotiations' });
    }

    // ── Source 1: formal negotiations rows ───────────────────────────────
    const fromNegotiations = await pool.query(
      `SELECT
         n.id               AS negotiation_id,
         n.freelancer_id,
         u.name             AS freelancer_name,
         u.email            AS freelancer_email,
         n.status           AS negotiation_status,
         n.created_at       AS negotiation_created_at,
         (
           SELECT offered_price FROM messages
           WHERE negotiation_id = n.id
             AND sender_id = n.freelancer_id
             AND offered_price IS NOT NULL
           ORDER BY created_at DESC LIMIT 1
         ) AS latest_offered_price,
         (
           SELECT content FROM messages m2
           WHERE (m2.sender_id = n.freelancer_id AND m2.receiver_id = $2)
              OR (m2.sender_id = $2 AND m2.receiver_id = n.freelancer_id)
           ORDER BY m2.created_at DESC LIMIT 1
         ) AS last_message,
         (
           SELECT created_at FROM messages m2
           WHERE (m2.sender_id = n.freelancer_id AND m2.receiver_id = $2)
              OR (m2.sender_id = $2 AND m2.receiver_id = n.freelancer_id)
           ORDER BY m2.created_at DESC LIMIT 1
         ) AS last_message_time
       FROM negotiations n
       JOIN users u ON n.freelancer_id = u.id
       WHERE n.task_id = $1`,
      [taskId, userId]
    );

    // ── Source 2: users who messaged the poster with an offered_price,
    //    even if no negotiations row was ever created ──────────────────────
    const fromMessages = await pool.query(
      `SELECT DISTINCT
         m.sender_id        AS freelancer_id,
         u.name             AS freelancer_name,
         u.email            AS freelancer_email,
         NULL::int          AS negotiation_id,
         'via_message'      AS negotiation_status,
         MIN(m.created_at)  AS negotiation_created_at,
         (
           SELECT offered_price FROM messages m2
           WHERE m2.sender_id = m.sender_id
             AND m2.receiver_id = $2
             AND m2.offered_price IS NOT NULL
           ORDER BY m2.created_at DESC LIMIT 1
         ) AS latest_offered_price,
         (
           SELECT content FROM messages m3
           WHERE (m3.sender_id = m.sender_id AND m3.receiver_id = $2)
              OR (m3.sender_id = $2 AND m3.receiver_id = m.sender_id)
           ORDER BY m3.created_at DESC LIMIT 1
         ) AS last_message,
         (
           SELECT created_at FROM messages m3
           WHERE (m3.sender_id = m.sender_id AND m3.receiver_id = $2)
              OR (m3.sender_id = $2 AND m3.receiver_id = m.sender_id)
           ORDER BY m3.created_at DESC LIMIT 1
         ) AS last_message_time
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.receiver_id = $2
         AND m.sender_id != $2
         AND m.offered_price IS NOT NULL
       GROUP BY m.sender_id, u.name, u.email`,
      [taskId, userId]
    );

    // ── Merge: formal negotiations take priority; message-only people fill gaps
    const negMap = new Map();

    for (const row of fromNegotiations.rows) {
      negMap.set(row.freelancer_id, row);
    }
    for (const row of fromMessages.rows) {
      if (!negMap.has(row.freelancer_id)) {
        negMap.set(row.freelancer_id, row);
      } else {
        // Supplement missing offered_price on formal row from message history
        const existing = negMap.get(row.freelancer_id);
        if (!existing.latest_offered_price && row.latest_offered_price) {
          existing.latest_offered_price = row.latest_offered_price;
        }
      }
    }

    // Sort by last_message_time descending
    const result = Array.from(negMap.values()).sort((a, b) => {
      const ta = a.last_message_time ? new Date(a.last_message_time) : new Date(0);
      const tb = b.last_message_time ? new Date(b.last_message_time) : new Date(0);
      return tb - ta;
    });

    res.json({ negotiations: result });
  } catch (err) {
    console.error('getAllNegotiationsForTask error:', err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};
