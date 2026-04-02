const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
require('dotenv').config();

// REGISTER
exports.register = async (req, res) => {
  try {
    console.log("🔥 REGISTER REQUEST RECEIVED");

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if signups are allowed
    const settingsResult = await pool.query('SELECT allow_signups FROM settings LIMIT 1');
    const settings = settingsResult.rows[0];
    if (!settings || !settings.allow_signups) {
      return res.status(403).json({ message: 'Registration is currently disabled' });
    }

    const userCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [name, email, hashedPassword, 'user']
    );

    const user = newUser.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user });

  } catch (err) {
    console.error("❌ REGISTER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
// LOGIN
exports.login = async (req, res) => {
  try {
    console.log("🔥 LOGIN REQUEST RECEIVED");

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check maintenance mode (allow admin to login)
    const settingsResult = await pool.query('SELECT maintenance_mode FROM settings LIMIT 1');
    const settings = settingsResult.rows[0];
    if (settings && settings.maintenance_mode) {
      // Check if user is admin - allow admin login during maintenance
      const userCheck = await pool.query('SELECT role FROM users WHERE email = $1', [email]);
      if (userCheck.rows.length > 0 && userCheck.rows[0].role !== 'admin') {
        return res.status(403).json({ message: 'The platform is currently under maintenance. Please try again later.' });
      }
    }

    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    // ✅ Block suspended users from logging in
    if (user.is_suspended) {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet_balance: user.wallet_balance,
      }
    });

  } catch (err) {
    console.error("❌ LOGIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
// GET ME (restore session from token)
exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, wallet_balance, is_suspended, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ FIX: wrap in { user: ... } so AuthContext can read data.user
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("❌ GET ME ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// FORGOT PASSWORD - Generate reset token
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const userResult = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If that email exists, a reset link has been sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Store token in password_resets table
    await pool.query(
      `INSERT INTO password_resets (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET token = $2, expires_at = $3, created_at = NOW()`,
      [userResult.rows[0].id, hashedToken, expiresAt]
    );

    // In production, send email with reset link
    // For now, return the token (will be removed in production)
    console.log(`🔑 Password reset token for ${email}: ${resetToken}`);

    res.json({
      message: 'If that email exists, a reset link has been sent',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (err) {
    console.error("❌ FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// RESET PASSWORD - Validate token and update password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Find valid reset record
    const resetResult = await pool.query(
      `SELECT pr.user_id, pr.token, pr.expires_at, u.email
       FROM password_resets pr
       JOIN users u ON pr.user_id = u.id
       WHERE u.email = $1 AND pr.expires_at > NOW()
       ORDER BY pr.created_at DESC LIMIT 1`,
      [req.params.email]
    );

    if (resetResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const resetRecord = resetResult.rows[0];

    // Verify token
    const isMatch = await bcrypt.compare(token, resetRecord.token);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, resetRecord.user_id]
    );

    // Delete used reset tokens
    await pool.query(
      'DELETE FROM password_resets WHERE user_id = $1',
      [resetRecord.user_id]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error("❌ RESET PASSWORD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};