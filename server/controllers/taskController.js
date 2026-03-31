const pool = require('../config/db');

// CREATE TASK
exports.createTask = async (req, res) => {
  try {
    const { title, description, category, price, deadline, is_visible } = req.body;
    const poster_id = req.user.id;

    const newTask = await pool.query(
      `INSERT INTO tasks (poster_id, title, description, category, price, deadline, is_visible)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [poster_id, title, description, category, price, deadline, is_visible ?? true]
    );

    res.status(201).json(newTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET ALL TASKS (with filters, excludes current user's tasks)
exports.getTasks = async (req, res) => {
  try {
    const { category, min_price, max_price, search } = req.query;
    const userId = req.user?.id; // Optional - may be called without auth

    let query = `
      SELECT t.*, u.name as poster_name
      FROM tasks t
      JOIN users u ON t.poster_id = u.id
      WHERE t.is_visible = true AND LOWER(t.status) = 'open'
    `;

    const values = [];
    let paramCount = 1;

    // Exclude current user's tasks if logged in
    if (userId) {
      query += ` AND t.poster_id != $${paramCount}`;
      values.push(userId);
      paramCount++;
    }

    if (category) {
      query += ` AND t.category = $${paramCount}`;
      values.push(category);
      paramCount++;
    }

    if (min_price) {
      query += ` AND t.price >= $${paramCount}`;
      values.push(min_price);
      paramCount++;
    }

    if (max_price) {
      query += ` AND t.price <= $${paramCount}`;
      values.push(max_price);
      paramCount++;
    }

    if (search) {
      query += ` AND (t.title ILIKE $${paramCount} OR t.description ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY t.created_at DESC';

    const tasks = await pool.query(query, values);
    res.json(tasks.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET SINGLE TASK
exports.getTaskById = async (req, res) => {
  try {
    const task = await pool.query(
      `SELECT t.*, u.name as poster_name, u.email as poster_email
       FROM tasks t
       JOIN users u ON t.poster_id = u.id
       WHERE t.id = $1`,
      [req.params.id]
    );

    if (task.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET MY POSTED TASKS
exports.getMyTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await pool.query(
      `SELECT t.*,
        COUNT(o.id) as offers_count,
        CASE
          WHEN t.status = 'open' THEN 'Open'
          WHEN t.status = 'in_progress' THEN 'In Progress'
          WHEN t.status = 'completed' THEN 'Completed'
          ELSE t.status
        END as status_display
       FROM tasks t
       LEFT JOIN orders o ON o.task_id = t.id AND o.status != 'cancelled'
       WHERE t.poster_id = $1
       GROUP BY t.id
       ORDER BY t.created_at DESC`,
      [userId]
    );

    res.json(tasks.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET TASKS I'M WORKING ON (freelancer)
exports.getMyAcceptedTasks = async (req, res) => {
  try {
    const freelancerId = req.user.id;

    const tasks = await pool.query(
      `SELECT t.*, o.id as order_id, o.status as order_status, o.agreed_price,
        u.name as client_name
       FROM tasks t
       JOIN orders o ON o.task_id = t.id
       JOIN users u ON t.poster_id = u.id
       WHERE o.freelancer_id = $1 AND o.status != 'cancelled'
       ORDER BY o.created_at DESC`,
      [freelancerId]
    );

    res.json(tasks.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// UPDATE TASK
exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const { title, description, category, price, deadline, status, is_visible } = req.body;

    // Check if user owns the task
    const taskCheck = await pool.query(
      'SELECT poster_id FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (taskCheck.rows[0].poster_id !== userId) {
      return res.status(403).json({ message: 'You can only edit your own tasks' });
    }

    const updatedTask = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           price = COALESCE($4, price),
           deadline = COALESCE($5, deadline),
           status = COALESCE($6, status),
           is_visible = COALESCE($7, is_visible)
       WHERE id = $8
       RETURNING *`,
      [title, description, category, price, deadline, status, is_visible, taskId]
    );

    res.json(updatedTask.rows[0]);
  } catch (err) {
    console.error('Update task error:', err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};

// DELETE TASK
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    // Check if user owns the task
    const taskCheck = await pool.query(
      'SELECT poster_id FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (taskCheck.rows[0].poster_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own tasks' });
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// TOGGLE TASK VISIBILITY
exports.toggleTaskVisibility = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    // Check if user owns the task
    const taskCheck = await pool.query(
      'SELECT poster_id, is_visible FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (taskCheck.rows[0].poster_id !== userId) {
      return res.status(403).json({ message: 'You can only edit your own tasks' });
    }

    const newVisibility = !taskCheck.rows[0].is_visible;

    await pool.query(
      'UPDATE tasks SET is_visible = $1 WHERE id = $2',
      [newVisibility, taskId]
    );

    res.json({
      message: `Task is now ${newVisibility ? 'visible' : 'hidden'}`,
      is_visible: newVisibility
    });
  } catch (err) {
    console.error('Toggle visibility error:', err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};

// GET RECOMMENDED TASKS (tasks not posted by current user)
exports.getRecommendedTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await pool.query(
      `SELECT t.*, u.name as poster_name
       FROM tasks t
       JOIN users u ON t.poster_id = u.id
       WHERE t.is_visible = true
         AND LOWER(t.status) = 'open'
         AND t.poster_id != $1
       ORDER BY t.created_at DESC`,
      [userId]
    );

    res.json(tasks.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};
