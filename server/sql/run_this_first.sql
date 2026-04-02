-- =====================================================
-- SideQuest - REQUIRED DATABASE TABLES
-- Run this script FIRST to enable Contact Form and Forgot Password
-- =====================================================

-- 1. Create password_resets table (for Forgot Password feature)
CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);

-- 2. Create contact_messages table (for Contact Form)
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- 3. Delete test/dummy users and their data
DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email IN ('test@test.com', 'rahul@test.com', 'priya@test.com', 'arjun@test.com', 'rahul@example.com', 'priya@example.com', 'arjun@example.com'));
DELETE FROM messages WHERE sender_id IN (SELECT id FROM users WHERE email IN ('test@test.com', 'rahul@test.com', 'priya@test.com', 'arjun@test.com', 'rahul@example.com', 'priya@example.com', 'arjun@example.com')) OR receiver_id IN (SELECT id FROM users WHERE email IN ('test@test.com', 'rahul@test.com', 'priya@test.com', 'arjun@test.com', 'rahul@example.com', 'priya@example.com', 'arjun@example.com'));
DELETE FROM offers WHERE freelancer_id IN (SELECT id FROM users WHERE email IN ('test@test.com', 'rahul@test.com', 'priya@test.com', 'arjun@test.com', 'rahul@example.com', 'priya@example.com', 'arjun@example.com'));
DELETE FROM orders WHERE freelancer_id IN (SELECT id FROM users WHERE email IN ('test@test.com', 'rahul@test.com', 'priya@test.com', 'arjun@test.com', 'rahul@example.com', 'priya@example.com', 'arjun@example.com')) OR poster_id IN (SELECT id FROM users WHERE email IN ('test@test.com', 'rahul@test.com', 'priya@test.com', 'arjun@test.com', 'rahul@example.com', 'priya@example.com', 'arjun@example.com'));
DELETE FROM tasks WHERE poster_id IN (SELECT id FROM users WHERE email IN ('test@test.com', 'rahul@test.com', 'priya@test.com', 'arjun@test.com', 'rahul@example.com', 'priya@example.com', 'arjun@example.com'));
DELETE FROM transactions WHERE user_id IN (SELECT id FROM users WHERE email IN ('test@test.com', 'rahul@test.com', 'priya@test.com', 'arjun@test.com', 'rahul@example.com', 'priya@example.com', 'arjun@example.com'));
DELETE FROM reviews WHERE reviewer_id IN (SELECT id FROM users WHERE email IN ('test@test.com', 'rahul@test.com', 'priya@test.com', 'arjun@test.com', 'rahul@example.com', 'priya@example.com', 'arjun@example.com')) OR reviewee_id IN (SELECT id FROM users WHERE email IN ('test@test.com', 'rahul@test.com', 'priya@test.com', 'arjun@test.com', 'rahul@example.com', 'priya@example.com', 'arjun@example.com'));
DELETE FROM users WHERE email IN ('test@test.com', 'rahul@test.com', 'priya@test.com', 'arjun@test.com', 'rahul@example.com', 'priya@example.com', 'arjun@example.com');

-- Verify tables were created
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('password_resets', 'contact_messages');

-- 4. Add offered_price column to messages table (for negotiations)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS offered_price DECIMAL(10,2);

-- Show remaining users
SELECT id, name, email, role FROM users ORDER BY id;
