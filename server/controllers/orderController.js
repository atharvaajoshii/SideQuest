const pool = require('../config/db');

// GET ORDER BY ID (protected - only for users involved in the order)
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params; // ✅ was orderId
    const userId = req.user.id;

    const orderResult = await pool.query(
      `SELECT o.*, t.title as task_title, t.description as task_description,
        uc.name as client_name, uf.name as freelancer_name
       FROM orders o
       LEFT JOIN tasks t ON o.task_id = t.id
       LEFT JOIN users uc ON o.poster_id = uc.id
       LEFT JOIN users uf ON o.freelancer_id = uf.id
       WHERE o.id = $1 AND (o.poster_id = $2 OR o.freelancer_id = $2)`,
      [id, userId] // ✅ was orderId
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found or you do not have access' });
    }

    res.json({ order: orderResult.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.markOrderCompleted = async (req, res) => {
  try {
    const { id } = req.params; // ✅ was orderId
    const userId = req.user.id;

    const orderCheck = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND poster_id = $2',
      [id, userId] // ✅ was orderId
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found or you are not the client' });
    }

    const updatedOrder = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['completed', id] // ✅ was orderId
    );

    res.json({ order: updatedOrder.rows[0], message: 'Order marked as completed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET ALL ORDERS FOR CURRENT USER
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await pool.query(
      `SELECT o.*, t.title as task_title,
        uc.name as client_name, uf.name as freelancer_name
       FROM orders o
       LEFT JOIN tasks t ON o.task_id = t.id
       LEFT JOIN users uc ON o.poster_id = uc.id
       LEFT JOIN users uf ON o.freelancer_id = uf.id
       WHERE o.poster_id = $1 OR o.freelancer_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );

    res.json({ orders: orders.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// CREATE ORDER (from negotiation)
exports.createOrder = async (req, res) => {
  try {
    const { freelancer_id, task_id, agreed_price } = req.body;
    const poster_id = req.user.id;

    const newOrder = await pool.query(
      `INSERT INTO orders (poster_id, freelancer_id, task_id, agreed_price, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW())
       RETURNING *`,
      [poster_id, freelancer_id, task_id, agreed_price]
    );

    res.status(201).json({ order: newOrder.rows[0], message: 'Order created successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
