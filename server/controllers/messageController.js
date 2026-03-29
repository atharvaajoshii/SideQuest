const pool = require('../config/db');

// Get all conversations for a user (list of users they've messaged with)
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all users who have exchanged messages with the current user
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
         WHERE sender_id = u.id AND receiver_id = $1 AND is_read = FALSE) AS unread_count
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

// Get messages between current user and another user
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await pool.query(`
      SELECT m.*,
             sender.name AS sender_name,
             receiver.name AS receiver_name
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users receiver ON m.receiver_id = receiver.id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2)
         OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC
    `, [userId, otherUserId]);

    // Mark received messages as read
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

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiver_id, content, order_id, negotiation_id } = req.body;

    if (!receiver_id || !content) {
      return res.status(400).json({ message: 'Receiver ID and content are required' });
    }

    const newMessage = await pool.query(`
      INSERT INTO messages (sender_id, receiver_id, content, order_id, negotiation_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [senderId, receiver_id, content, order_id || null, negotiation_id || null]);

    // Create a notification for the receiver
    await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      receiver_id,
      'New Message',
      content.substring(0, 100),
      'message',
      `/messages/${senderId}`
    ]);

    res.status(201).json({ message: newMessage.rows[0] });
  } catch (err) {
    console.error('❌ SEND MESSAGE ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

// Mark messages as read
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
