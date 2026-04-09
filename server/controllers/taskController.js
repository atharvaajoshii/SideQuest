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

// GET ALL TASKS (public, with optional search/category filter)
exports.getTasks = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = `SELECT t.*, u.name as poster_name 
                 FROM tasks t 
                 LEFT JOIN users u ON t.poster_id = u.id
                 WHERE t.status = 'Open'`;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (t.title ILIKE $${params.length} OR t.description ILIKE $${params.length})`;
    }

    if (category && category !== 'All') {
      params.push(category);
      query += ` AND t.category = $${params.length}`;
    }

    query += ' ORDER BY t.created_at DESC';

    const tasks = await pool.query(query, params);
    res.json(tasks.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET RECOMMENDED TASKS (not posted by current user)
exports.getRecommendedTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await pool.query(
      `SELECT t.*, u.name as poster_name 
       FROM tasks t 
       LEFT JOIN users u ON t.poster_id = u.id
       WHERE t.status = 'Open' AND t.poster_id != $1
       ORDER BY t.created_at DESC
       LIMIT 10`,
      [userId]
    );

    res.json(tasks.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET MY POSTED TASKS
exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await pool.query(
      `SELECT t.*, 
              COUNT(DISTINCT o.id) as offer_count
       FROM tasks t
       LEFT JOIN offers o ON t.id = o.task_id
       WHERE t.poster_id = $1
       GROUP BY t.id
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );

    res.json(tasks.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET TASKS I'M WORKING ON AS FREELANCER
exports.getMyAcceptedTasks = async (req, res) => {
  try {
    const tasks = await pool.query(
      `SELECT t.*, ord.id as order_id, ord.status as order_status,
              u.name as poster_name
       FROM orders ord
       JOIN tasks t ON ord.task_id = t.id
       JOIN users u ON t.poster_id = u.id
       WHERE ord.freelancer_id = $1
       ORDER BY ord.created_at DESC`,
      [req.user.id]
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
      `SELECT t.*, u.name as poster_name, u.email as poster_email
       FROM tasks t
       LEFT JOIN users u ON t.poster_id = u.id
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

// UPDATE TASK
exports.updateTask = async (req, res) => {
  try {
    const { title, description, category, price } = req.body;
    const taskId = req.params.id;

    const check = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (check.rows.length === 0) return res.status(404).json({ message: 'Task not found' });
    if (check.rows[0].poster_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const updated = await pool.query(
      `UPDATE tasks SET title=$1, description=$2, category=$3, price=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [title, description, category, price, taskId]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// DELETE TASK
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const check = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (check.rows.length === 0) return res.status(404).json({ message: 'Task not found' });
    if (check.rows[0].poster_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

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

    const check = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (check.rows.length === 0) return res.status(404).json({ message: 'Task not found' });
    if (check.rows[0].poster_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const newStatus = check.rows[0].status === 'Open' ? 'Closed' : 'Open';
    const updated = await pool.query(
      'UPDATE tasks SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [newStatus, taskId]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// UPDATE TASK PRICE FROM NEGOTIATION (poster accepts counter-offer)
exports.updateTaskPriceFromNegotiation = async (req, res) => {
  try {
    const { taskId, newPrice, freelancerId } = req.body;

    if (!taskId || !newPrice || !freelancerId) {
      return res.status(400).json({ message: 'Task ID, new price, and freelancer ID are required' });
    }

    // Verify user owns the task
    const taskCheck = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (taskCheck.rows[0].poster_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Get freelancer's previous offer amount
    const prevOfferResult = await pool.query(
      `SELECT offered_price FROM offers
       WHERE task_id = $1 AND freelancer_id = $2 AND status = 'Pending'
       ORDER BY created_at DESC LIMIT 1`,
      [taskId, freelancerId]
    );
    const prevOffer = prevOfferResult.rows.length > 0
      ? prevOfferResult.rows[0].offered_price
      : newPrice;

    // Update task price
    const updated = await pool.query(
      'UPDATE tasks SET price=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [newPrice, taskId]
    );

    // Update previous offer status to 'Countered'
    await pool.query(
      `UPDATE offers SET status = 'Countered', updated_at = NOW()
       WHERE task_id = $1 AND freelancer_id = $2 AND status = 'Pending'`,
      [taskId, freelancerId]
    );

    // Create notification for freelancer — this is a counter-offer response
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        freelancerId,
        'Counter-Offer',
        `Your offer of ₹${prevOffer} was countered`,
        'negotiation',
        `/negotiate-poster/${taskId}`
      ]
    );

    res.json({ message: 'Task price updated successfully', task: updated.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};