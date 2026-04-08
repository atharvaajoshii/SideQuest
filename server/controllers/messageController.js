const pool = require('../config/db');

// ================= GET UNREAD MESSAGE COUNT =================
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT COUNT(*) as count FROM messages
      WHERE receiver_id = $1 AND is_read = FALSE
    `, [userId]);

    res.json({ count: parseInt(result.rows[0].count) || 0 });
  } catch (err) {
    console.error('❌ GET UNREAD MESSAGE COUNT ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

// ================= GET CONVERSATIONS =================
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await pool.query(`
      SELECT DISTINCT
        CASE
          WHEN m.sender_id = $1 THEN m.receiver_id
          ELSE m.sender_id
        END AS other_user_id,
        u.name,
        u.email,
        (SELECT content FROM messages
         WHERE (sender_id = $1 AND receiver_id = u.id)
            OR (sender_id = u.id AND receiver_id = $1)
         ORDER BY created_at DESC LIMIT 1) AS last_message,
        (SELECT created_at FROM messages
         WHERE (sender_id = $1 AND receiver_id = u.id)
            OR (sender_id = u.id AND receiver_id = $1)
         ORDER BY created_at DESC LIMIT 1) AS last_message_time,
        (SELECT COUNT(*) FROM messages
         WHERE sender_id = u.id AND receiver_id = $1 AND is_read = FALSE) AS unread_count,
        (SELECT m2.negotiation_id FROM messages m2
         WHERE m2.negotiation_id IS NOT NULL
           AND ((m2.sender_id = $1 AND m2.receiver_id = u.id)
            OR (m2.sender_id = u.id AND m2.receiver_id = $1))
         ORDER BY m2.created_at DESC LIMIT 1) AS negotiation_id,
        (SELECT t.title FROM tasks t
         INNER JOIN negotiations n ON t.id = n.task_id
         INNER JOIN messages m3 ON n.id = m3.negotiation_id
         WHERE m3.negotiation_id IS NOT NULL
           AND ((m3.sender_id = $1 AND m3.receiver_id = u.id)
            OR (m3.sender_id = u.id AND m3.receiver_id = $1))
         ORDER BY m3.created_at DESC LIMIT 1) AS task_title
      FROM messages m
      JOIN users u ON u.id = CASE
          WHEN m.sender_id = $1 THEN m.receiver_id
          ELSE m.sender_id
        END
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      ORDER BY last_message_time DESC
    `, [userId]);

    res.json({ conversations: conversations.rows });
  } catch (err) {
    console.error('❌ GET CONVERSATIONS ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

// ================= GET MESSAGES =================
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await pool.query(`
      SELECT m.*,
             sender.name AS sender_name,
             receiver.name AS receiver_name,
             reply.content AS reply_content,
             reply.sender_id AS reply_sender_id,
             replySender.name AS reply_sender_name   -- ✅ FIXED
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users receiver ON m.receiver_id = receiver.id
      LEFT JOIN messages reply ON m.reply_to = reply.id
      LEFT JOIN users replySender ON reply.sender_id = replySender.id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2)
         OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC
    `, [userId, otherUserId]);

    // mark as read
    await pool.query(`
      UPDATE messages SET is_read = TRUE
      WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE
    `, [otherUserId, userId]);

    res.json({ messages: messages.rows });
  } catch (err) {
    console.error('❌ GET MESSAGES ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

// ================= SEND MESSAGE =================
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiver_id, content, order_id, negotiation_id, reply_to, offered_price } = req.body;

    if (!receiver_id || !content) {
      return res.status(400).json({ message: 'Receiver ID and content are required' });
    }

    // Check if offered_price column exists
    const columnCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'messages' AND column_name = 'offered_price'
    `);

    const hasOfferedPrice = columnCheck.rows.length > 0;

    let newMessage;
    if (hasOfferedPrice) {
      newMessage = await pool.query(`
        INSERT INTO messages (sender_id, receiver_id, content, order_id, negotiation_id, reply_to, offered_price)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        senderId,
        receiver_id,
        content,
        order_id || null,
        negotiation_id || null,
        reply_to || null,
        offered_price || null
      ]);
    } else {
      // Fallback for databases without offered_price column
      newMessage = await pool.query(`
        INSERT INTO messages (sender_id, receiver_id, content, order_id, negotiation_id, reply_to)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        senderId,
        receiver_id,
        content,
        order_id || null,
        negotiation_id || null,
        reply_to || null
      ]);
    }

    // If this is a negotiation message with an offered price, send notification
    if (negotiation_id && offered_price) {
      // Get task details to find the poster
      const taskResult = await pool.query(`
        SELECT t.poster_id, t.id as task_id, t.title, u.name as freelancer_name
        FROM negotiations n
        JOIN tasks t ON n.task_id = t.id
        JOIN users u ON u.id = $1
        WHERE n.id = $2
      `, [senderId, negotiation_id]);

      if (taskResult.rows.length > 0) {
        const { poster_id, task_id, title, freelancer_name } = taskResult.rows[0];

        // Create notification for task poster with link to negotiation page
        await pool.query(`
          INSERT INTO notifications (user_id, title, message, type, link)
          VALUES ($1, $2, $3, 'negotiation', $4)
        `, [
          poster_id,
          'New Counter-Offer',
          `${freelancer_name} offered ₹${offered_price} for "${title}"`,
          `/negotiate-poster/${task_id}`
        ]);
      }
    }

    res.status(201).json({ message: newMessage.rows[0] });
  } catch (err) {
    console.error('❌ SEND MESSAGE ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

// ================= MARK AS READ =================
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const senderId = req.params.senderId;

    await pool.query(`
      UPDATE messages
      SET is_read = TRUE
      WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE
    `, [senderId, userId]);

    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error('❌ MARK AS READ ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

// ================= DELETE MESSAGE =================
exports.deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = parseInt(req.user.id); // ✅ FIX

    const msgCheck = await pool.query(
      'SELECT sender_id FROM messages WHERE id = $1',
      [messageId]
    );

    if (msgCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (parseInt(msgCheck.rows[0].sender_id) !== userId) { // ✅ FIX
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    await pool.query('DELETE FROM messages WHERE id = $1', [messageId]);

    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('❌ DELETE MESSAGE ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

// ================= DELETE CONVERSATION =================
exports.deleteConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId;

    await pool.query(`
      DELETE FROM messages
      WHERE (sender_id = $1 AND receiver_id = $2)
         OR (sender_id = $2 AND receiver_id = $1)
    `, [userId, otherUserId]);

    res.json({ message: 'Conversation deleted successfully' });
  } catch (err) {
    console.error('❌ DELETE CONVERSATION ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};