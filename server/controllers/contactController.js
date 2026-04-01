const pool = require('../config/db');

// Submit contact message
exports.submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate subject is one of the allowed values
    const allowedSubjects = ['general', 'support', 'billing', 'report', 'feedback', 'partnership'];
    if (!allowedSubjects.includes(subject)) {
      return res.status(400).json({ message: 'Invalid subject' });
    }

    // Insert into database
    const result = await pool.query(
      `INSERT INTO contact_messages (name, email, subject, message, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [name, email, subject, message]
    );

    const newMessage = result.rows[0];

    // In production, you could send an email notification to admins here
    console.log(`📩 New contact message from ${name} (${email}): ${subject}`);

    res.status(201).json({
      message: 'Thank you for contacting us! We will respond within 24 hours.',
      data: newMessage
    });

  } catch (err) {
    console.error('❌ CONTACT SUBMIT ERROR:', err);
    res.status(500).json({ message: 'Failed to submit message. Please try again.' });
  }
};

// Get all contact messages (admin only)
exports.getAllMessages = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT id, name, email, subject, message, status, admin_notes, created_at, updated_at
      FROM contact_messages
    `;

    let countQuery = 'SELECT COUNT(*) FROM contact_messages';

    if (status) {
      query += ` WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
      countQuery += ` WHERE status = $1`;
      const result = await pool.query(query, [status, limit, offset]);
      const countResult = await pool.query(countQuery, [status]);

      res.json({
        messages: result.rows,
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } else {
      query += ` ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
      const result = await pool.query(query, [limit, offset]);
      const countResult = await pool.query(countQuery);

      res.json({
        messages: result.rows,
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit)
      });
    }

  } catch (err) {
    console.error('❌ GET CONTACT MESSAGES ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

// Get single message by ID
exports.getMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM contact_messages WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: result.rows[0] });

  } catch (err) {
    console.error('❌ GET MESSAGE ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch message' });
  }
};

// Update message status
exports.updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const allowedStatuses = ['pending', 'read', 'replied', 'archived'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (admin_notes !== undefined) {
      updates.push(`admin_notes = $${paramCount++}`);
      values.push(admin_notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE contact_messages
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    res.json({
      message: 'Message updated successfully',
      data: result.rows[0]
    });

  } catch (err) {
    console.error('❌ UPDATE MESSAGE ERROR:', err);
    res.status(500).json({ message: 'Failed to update message' });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM contact_messages WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });

  } catch (err) {
    console.error('❌ DELETE MESSAGE ERROR:', err);
    res.status(500).json({ message: 'Failed to delete message' });
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'read') as read,
        COUNT(*) FILTER (WHERE status = 'replied') as replied,
        COUNT(*) FILTER (WHERE status = 'archived') as archived
      FROM contact_messages
    `);

    res.json({ stats: stats.rows[0] });

  } catch (err) {
    console.error('❌ GET STATS ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};
