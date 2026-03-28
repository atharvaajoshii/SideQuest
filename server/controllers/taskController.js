const pool = require('../config/db');

// CREATE TASK
exports.createTask = async (req, res) => {
  try {
    const { title, description, category, price } = req.body;
    const poster_id = req.user.id;

    const newTask = await pool.query(
      `INSERT INTO tasks (poster_id, title, description, category, price)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [poster_id, title, description, category, price]
    );

    res.json(newTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET ALL TASKS
exports.getTasks = async (req, res) => {
  try {
    const tasks = await pool.query(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    );
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
      'SELECT * FROM tasks WHERE id = $1',
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