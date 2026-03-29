// Seed script to populate messages and notifications for testing
require('dotenv').config();
const pool = require('../config/db');
const bcrypt = require('bcrypt');

async function seed() {
  console.log('🌱 Starting seed...');

  try {
    // Create dummy users if they don't exist
    const dummyPassword = await bcrypt.hash('password123', 10);

    const users = await pool.query(`
      INSERT INTO users (name, email, password, role, wallet_balance)
      VALUES
        ('Rahul Sharma', 'rahul@test.com', $1, 'user', 500.00),
        ('Priya Patel', 'priya@test.com', $1, 'user', 750.00),
        ('Arjun Singh', 'arjun@test.com', $1, 'user', 300.00)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name, email
    `, [dummyPassword]);

    console.log('✅ Users ready:', users.rows.map(u => `${u.name} (ID: ${u.id})`));

    const rahulId = users.rows.find(u => u.email === 'rahul@test.com')?.id;
    const priyaId = users.rows.find(u => u.email === 'priya@test.com')?.id;
    const arjunId = users.rows.find(u => u.email === 'arjun@test.com')?.id;

    if (!rahulId || !priyaId || !arjunId) {
      console.error('❌ Could not get user IDs');
      return;
    }

    // Clear existing messages and notifications for clean seed
    await pool.query('DELETE FROM messages WHERE sender_id IN ($1, $2, $3, $4, $5)', [1, rahulId, priyaId, arjunId, 2]);
    await pool.query('DELETE FROM notifications WHERE user_id = $1 OR user_id = $2', [1, 2]);

    console.log('🗑️  Cleared old data');

    // Messages between user 1 and user 2
    await pool.query(`
      INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES
      (1, 2, 'Hey! I saw your task posting. Can you tell me more about the requirements?', true, NOW() - INTERVAL '2 days'),
      (2, 1, 'Sure! I need help debugging a React app that keeps re-rendering infinitely.', true, NOW() - INTERVAL '2 days'),
      (1, 2, 'I can definitely help with that. I''ve worked on similar issues before. What''s your budget?', true, NOW() - INTERVAL '2 days'),
      (2, 1, 'I was thinking around ₹300-400. Can you work within that?', true, NOW() - INTERVAL '2 days'),
      (1, 2, 'Yes, that works for me! When do you need this done?', true, NOW() - INTERVAL '1 day'),
      (2, 1, 'As soon as possible! Ideally within the next 2-3 hours if you can.', false, NOW() - INTERVAL '1 day')
    `);

    // Messages between user 1 and Rahul
    await pool.query(`
      INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES
      ($1, 1, 'Hi! I noticed you posted a task for Python data analysis. Is it still available?', true, NOW() - INTERVAL '5 days'),
      (1, $1, 'Yes, it is! Are you interested?', true, NOW() - INTERVAL '5 days'),
      ($1, 1, 'Definitely! I have experience with pandas and numpy. Can you share the dataset?', true, NOW() - INTERVAL '5 days'),
      (1, $1, 'Sure, I''ll send it over. The deadline is end of week.', true, NOW() - INTERVAL '4 days'),
      ($1, 1, 'Perfect! I''ll get started on it tomorrow.', true, NOW() - INTERVAL '4 days')
    `, [rahulId]);

    // Messages between user 1 and Priya (negotiation context)
    await pool.query(`
      INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES
      ($1, 1, 'Hello! I can complete your logo design task. Check out my portfolio!', true, NOW() - INTERVAL '1 week'),
      (1, $1, 'Looks great! What''s your price for 3 logo variations?', true, NOW() - INTERVAL '1 week'),
      ($1, 1, 'I can do 3 variations for ₹500. Unlimited revisions included.', true, NOW() - INTERVAL '1 week'),
      (1, $1, 'That''s a bit over my budget. Could you do ₹400?', true, NOW() - INTERVAL '6 days'),
      ($1, 1, 'Let me counter at ₹450. That''s my best price for this scope.', false, NOW() - INTERVAL '6 days')
    `, [priyaId]);

    // Messages between user 1 and Arjun
    await pool.query(`
      INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES
      ($1, 1, 'Hey! I saw you''re looking for a writer. I''d love to help with your blog posts!', false, NOW() - INTERVAL '15 minutes')
    `, [arjunId]);

    // Additional unread message from user 2
    await pool.query(`
      INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES
      (2, 1, 'Just checking in - are you still available to help?', false, NOW() - INTERVAL '30 minutes')
    `);

    console.log('💬 Messages seeded');

    // Notifications for user 1
    await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, is_read, link, created_at) VALUES
      (1, 'New Message', 'Hey! I saw your task posting...', 'message', true, '/messages/2', NOW() - INTERVAL '2 days'),
      (1, 'Order Update', 'Your order #123 has been accepted!', 'order', true, '/orders', NOW() - INTERVAL '1 day'),
      (1, 'New Message', 'Just checking in - are you still available?', 'message', false, '/messages/2', NOW() - INTERVAL '30 minutes'),
      (1, 'Task Announcement', 'Your task has been featured!', 'task', false, '/tasks/mine', NOW() - INTERVAL '1 hour'),
      (1, 'New Message', 'Hey! I saw you''re looking for a writer...', 'message', false, '/messages/5', NOW() - INTERVAL '15 minutes'),
      (1, 'System Update', 'Welcome to SideQuest! Complete your profile to get started.', 'system', false, '/profile', NOW() - INTERVAL '3 days'),
      (1, 'Payment Received', '₹350 has been added to your wallet.', 'order', true, '/wallet', NOW() - INTERVAL '2 days')
    `);

    // Notifications for user 2
    await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, is_read, link, created_at) VALUES
      (2, 'Welcome!', 'Thanks for signing up! Browse tasks to get started.', 'system', true, '/search', NOW() - INTERVAL '1 day'),
      (2, 'New Task Posted', 'A new React debugging task matches your skills!', 'task', false, '/search', NOW() - INTERVAL '2 hours')
    `);

    console.log('🔔 Notifications seeded');

    console.log('✅ Seed completed successfully!');
    console.log('');
    console.log('📋 Test accounts:');
    console.log('   - Atmika (ID: 1): atvika02@gmail.com');
    console.log('   - Atmika2 (ID: 2): atmikanayak021206@gmail.com');
    console.log('   - Rahul (ID: ' + rahulId + '): rahul@test.com / password123');
    console.log('   - Priya (ID: ' + priyaId + '): priya@test.com / password123');
    console.log('   - Arjun (ID: ' + arjunId + '): arjun@test.com / password123');

  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    pool.end();
  }
}

seed();
