-- Seed dummy messages and notifications for testing
-- Run this after the schema has been created

-- First, create some dummy users if they don't exist (for demo purposes)
-- These will be fake users to show conversations with multiple people

INSERT INTO users (name, email, password, role, wallet_balance) VALUES
('Rahul Sharma', 'rahul@example.com', '$2b$10$dummyhashforthepassword', 'user', 500.00),
('Priya Patel', 'priya@example.com', '$2b$10$dummyhashforthepassword', 'user', 750.00),
('Arjun Singh', 'arjun@example.com', '$2b$10$dummyhashforthepassword', 'user', 300.00)
ON CONFLICT (email) DO NOTHING;

-- Messages between user 1 (Atmika) and user 2 (Atmika - second account)
INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES
(1, 2, 'Hey! I saw your task posting. Can you tell me more about the requirements?', true, NOW() - INTERVAL '2 days'),
(2, 1, 'Sure! I need help debugging a React app that keeps re-rendering infinitely.', true, NOW() - INTERVAL '2 days'),
(1, 2, 'I can definitely help with that. I''ve worked on similar issues before. What''s your budget?', true, NOW() - INTERVAL '2 days'),
(2, 1, 'I was thinking around ₹300-400. Can you work within that?', true, NOW() - INTERVAL '2 days'),
(1, 2, 'Yes, that works for me! When do you need this done?', true, NOW() - INTERVAL '1 day'),
(2, 1, 'As soon as possible! Ideally within the next 2-3 hours if you can.', false, NOW() - INTERVAL '1 day');

-- Get the IDs of newly created users (or existing ones)
-- User 3: Rahul, User 4: Priya, User 5: Arjun

-- Messages between user 1 and Rahul (user 3)
INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES
(3, 1, 'Hi! I noticed you posted a task for Python data analysis. Is it still available?', true, NOW() - INTERVAL '5 days'),
(1, 3, 'Yes, it is! Are you interested?', true, NOW() - INTERVAL '5 days'),
(3, 1, 'Definitely! I have experience with pandas and numpy. Can you share the dataset?', true, NOW() - INTERVAL '5 days'),
(1, 3, 'Sure, I''ll send it over. The deadline is end of week.', true, NOW() - INTERVAL '4 days'),
(3, 1, 'Perfect! I''ll get started on it tomorrow.', true, NOW() - INTERVAL '4 days');

-- Messages between user 1 and Priya (user 4) - negotiation context
INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES
(4, 1, 'Hello! I can complete your logo design task. Check out my portfolio!', true, NOW() - INTERVAL '1 week'),
(1, 4, 'Looks great! What''s your price for 3 logo variations?', true, NOW() - INTERVAL '1 week'),
(4, 1, 'I can do 3 variations for ₹500. Unlimited revisions included.', true, NOW() - INTERVAL '1 week'),
(1, 4, 'That''s a bit over my budget. Could you do ₹400?', true, NOW() - INTERVAL '6 days'),
(4, 1, 'Let me counter at ₹450. That''s my best price for this scope.', false, NOW() - INTERVAL '6 days');

-- Messages between user 1 and Arjun (user 5)
INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES
(5, 1, 'Hey! I saw you''re looking for a writer. I''d love to help with your blog posts!', false, NOW() - INTERVAL '15 minutes');

-- Additional unread message from user 2
INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES
(2, 1, 'Just checking in - are you still available to help?', false, NOW() - INTERVAL '30 minutes');

-- Seed notifications for user 1
INSERT INTO notifications (user_id, title, message, type, is_read, link, created_at) VALUES
(1, 'New Message', 'Hey! I saw your task posting...', 'message', true, '/messages/2', NOW() - INTERVAL '2 days'),
(1, 'Order Update', 'Your order #123 has been accepted!', 'order', true, '/orders', NOW() - INTERVAL '1 day'),
(1, 'New Message', 'Just checking in - are you still available?', 'message', false, '/messages/2', NOW() - INTERVAL '30 minutes'),
(1, 'Task Announcement', 'Your task has been featured!', 'task', false, '/tasks/mine', NOW() - INTERVAL '1 hour'),
(1, 'New Message', 'Hey! I saw you''re looking for a writer...', 'message', false, '/messages/5', NOW() - INTERVAL '15 minutes'),
(1, 'System Update', 'Welcome to SideQuest! Complete your profile to get started.', 'system', false, '/profile', NOW() - INTERVAL '3 days'),
(1, 'Payment Received', '₹350 has been added to your wallet.', 'order', true, '/wallet', NOW() - INTERVAL '2 days');

-- Some notifications for user 2 as well
INSERT INTO notifications (user_id, title, message, type, is_read, link, created_at) VALUES
(2, 'Welcome!', 'Thanks for signing up! Browse tasks to get started.', 'system', true, '/search', NOW() - INTERVAL '1 day'),
(2, 'New Task Posted', 'A new React debugging task matches your skills!', 'task', false, '/search', NOW() - INTERVAL '2 hours');
