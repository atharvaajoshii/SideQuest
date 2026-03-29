const pool = require('../config/db');

// GET USER PROFILE BY ID
exports.getUserById = async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, name, email, role, wallet_balance, created_at FROM users WHERE id = $1',
      [req.params.id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET CURRENT USER PROFILE
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, name, email, role, wallet_balance, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// UPDATE CURRENT USER
exports.updateCurrentUser = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const updatedUser = await pool.query(
      'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, role, wallet_balance, created_at',
      [name.trim(), req.user.id]
    );

    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Get current user to verify password
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    // Verify current password
    const bcrypt = require('bcrypt');
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, req.user.id]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET ALL USERS (ADMIN ONLY)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await pool.query(
      'SELECT id, name, email, role, wallet_balance, created_at FROM users ORDER BY created_at DESC'
    );

    res.json(users.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// UPDATE USER ROLE (ADMIN ONLY)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const updatedUser = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      [role, userId]
    );

    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// SUSPEND/ACTIVATE USER (ADMIN ONLY)
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

// DELETE USER (ADMIN ONLY)
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

// GET USER STATS (ADMIN ONLY)
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
    const activeUsers = await pool.query('SELECT COUNT(*) FROM users WHERE is_suspended = false');
    const adminUsers = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");

    res.json({
      total: parseInt(totalUsers.rows[0].count),
      active: parseInt(activeUsers.rows[0].count),
      admins: parseInt(adminUsers.rows[0].count),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
