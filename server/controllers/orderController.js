const pool = require('../config/db');

// ACCEPT A FREELANCER'S OFFER (creates order from task poster's perspective)
exports.acceptFreelancerOffer = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { freelancer_id, agreed_price } = req.body;
    const poster_id = req.user.id;

    if (!freelancer_id || !agreed_price) {
      return res.status(400).json({ message: 'Freelancer ID and agreed price are required' });
    }

    // Verify the task belongs to the user
    const taskCheck = await pool.query('SELECT * FROM tasks WHERE id = $1 AND poster_id = $2', [taskId, poster_id]);
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or you are not the poster' });
    }

    // Create the order
    const newOrder = await pool.query(
      `INSERT INTO orders (poster_id, freelancer_id, task_id, agreed_price, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'In Progress', NOW(), NOW())
       RETURNING *`,
      [poster_id, freelancer_id, taskId, agreed_price]
    );

    // Update task status
    await pool.query("UPDATE tasks SET status = 'In Progress' WHERE id = $1", [taskId]);

    // Create notification for freelancer
    await pool.query(
      `INSERT INTO notifications (user_id, message, type, is_read)
       VALUES ($1, $2, $3, FALSE)`,
      [freelancer_id, `Your offer for "${taskCheck.rows[0].title}" was accepted!`, 'order']
    );

    res.status(201).json({
      order: newOrder.rows[0],
      message: 'Offer accepted! Order created successfully.'
    });

  } catch (err) {
    console.error('❌ ACCEPT OFFER ERROR:', err);
    res.status(500).json({ message: 'Failed to accept offer. Please try again.' });
  }
};

// APPLY FOR TASK (freelancer applies/accepts the task)
exports.applyForTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const freelancer_id = req.user.id;
    const { message, offered_price } = req.body;

    // Verify task exists and is open
    const task = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (task.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.rows[0].status !== 'Open') {
      return res.status(400).json({ message: 'This task is no longer open for applications' });
    }

    // Check if already applied
    const existingOffer = await pool.query(
      'SELECT * FROM offers WHERE task_id = $1 AND freelancer_id = $2',
      [taskId, freelancer_id]
    );

    if (existingOffer.rows.length > 0) {
      return res.status(400).json({ message: 'You have already applied to this task' });
    }

    // Create offer
    const newOffer = await pool.query(
      `INSERT INTO offers (task_id, freelancer_id, offered_price, message, status, created_at)
       VALUES ($1, $2, $3, $4, 'Pending', NOW())
       RETURNING *`,
      [taskId, freelancer_id, offered_price || task.rows[0].price, message || '']
    );

    // Create notification for task poster
    await pool.query(
      `INSERT INTO notifications (user_id, message, type, is_read)
       VALUES ($1, $2, $3, FALSE)`,
      [task.rows[0].poster_id, `New application for "${task.rows[0].title}"`, 'task']
    );

    res.status(201).json({
      offer: newOffer.rows[0],
      message: 'Application submitted successfully!'
    });

  } catch (err) {
    console.error('❌ APPLY FOR TASK ERROR:', err);
    res.status(500).json({ message: 'Failed to apply for task.' });
  }
};

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
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`[markOrderCompleted] Order ID: ${id}, User ID: ${userId}`);

    const orderCheck = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND poster_id = $2',
      [id, userId]
    );

    if (orderCheck.rows.length === 0) {
      console.log(`[markOrderCompleted] Order not found or user not authorized`);
      return res.status(404).json({ message: 'Order not found or you are not the client' });
    }

    const order = orderCheck.rows[0];
    console.log(`[markOrderCompleted] Order found:`, order);

    // Check if order is already completed
    if (order.status === 'completed') {
      console.log(`[markOrderCompleted] Order already completed`);
      return res.status(400).json({ message: 'Order is already completed' });
    }

    const client = await pool.query('SELECT * FROM users WHERE id = $1', [order.poster_id]);
    const freelancer = await pool.query('SELECT * FROM users WHERE id = $1', [order.freelancer_id]);

    if (client.rows.length === 0 || freelancer.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const clientBalance = parseFloat(client.rows[0].wallet_balance || 0);
    const freelancerBalance = parseFloat(freelancer.rows[0].wallet_balance || 0);
    const agreedPrice = parseFloat(order.agreed_price);

    console.log(`[markOrderCompleted] Client balance: ${clientBalance}, Freelancer balance: ${freelancerBalance}, Agreed price: ${agreedPrice}`);

    // Check if client has enough balance
    if (clientBalance < agreedPrice) {
      console.log(`[markOrderCompleted] Insufficient balance: ${clientBalance} < ${agreedPrice}`);
      return res.status(400).json({
        message: `Client does not have enough wallet balance. Required: ₹${agreedPrice}, Available: ₹${clientBalance}`
      });
    }

    const newClientBalance = clientBalance - agreedPrice;
    const newFreelancerBalance = freelancerBalance + agreedPrice;

    console.log(`[markOrderCompleted] Updating balances: Client ${clientBalance} -> ${newClientBalance}, Freelancer ${freelancerBalance} -> ${newFreelancerBalance}`);

    await pool.query('UPDATE users SET wallet_balance = $1 WHERE id = $2', [newClientBalance, order.poster_id]);
    await pool.query('UPDATE users SET wallet_balance = $1 WHERE id = $2', [newFreelancerBalance, order.freelancer_id]);

    // Create transaction record for freelancer (earned)
    await pool.query(
      `INSERT INTO transactions (user_id, amount, type, description, reference_id, reference_type, status)
       VALUES ($1, $2, 'earned', 'Completed task: Payment received', $3, 'order', 'completed')`,
      [order.freelancer_id, agreedPrice, order.id]
    );

    // Create transaction record for client (spent)
    await pool.query(
      `INSERT INTO transactions (user_id, amount, type, description, reference_id, reference_type, status)
       VALUES ($1, $2, 'spent', 'Payment for task completion', $3, 'order', 'completed')`,
      [order.poster_id, agreedPrice, order.id]
    );

    const updatedOrder = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['completed', id]
    );

    // Create notification for freelancer
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES ($1, $2, $3, $4, $5)`,
      [order.freelancer_id, 'Task Completed', `Your task "${order.task_title || 'Task'}" has been marked as completed. ₹${agreedPrice} has been added to your wallet.`, 'order', `/orders/${id}`]
    );

    // Create notification for client
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES ($1, $2, $3, $4, $5)`,
      [order.poster_id, 'Quest Completed', `Your quest "${order.task_title || 'Task'}" has been completed by ${freelancer.rows[0].name}.`, 'order', `/orders/${id}`]
    );

    console.log(`[markOrderCompleted] Success! Order ${id} marked as completed`);

    res.json({ order: updatedOrder.rows[0], message: 'Order marked as completed. Payment transferred to freelancer.' });
  } catch (err) {
    console.error('[markOrderCompleted] Error:', err.message);
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
