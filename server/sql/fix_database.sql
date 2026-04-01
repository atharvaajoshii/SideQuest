-- =====================================================
-- SideQuest Database Fix Script
-- =====================================================
-- This script:
-- 1. Creates password_resets table (fixes forgot password)
-- 2. Removes ALL dummy/test data from the database
-- =====================================================

BEGIN;

-- =====================================================
-- PART 1: Create password_resets table
-- =====================================================

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

-- =====================================================
-- PART 2: Remove ALL dummy/test data
-- =====================================================

-- First, delete all notifications for test users
DELETE FROM notifications
WHERE user_id IN (
    SELECT id FROM users
    WHERE email IN ('rahul@test.com', 'priya@test.com', 'arjun@test.com', 'rahul@example.com', 'priya@example.com', 'arjun@example.com')
);

-- Delete all messages involving test users
DELETE FROM messages
WHERE sender_id IN (
    SELECT id FROM users
    WHERE email IN ('rahul@test.com', 'priya@test.com', 'arjun@test.com', 'rahul@example.com', 'priya@example.com', 'arjun@example.com')
)
OR receiver_id IN (
    SELECT id FROM users
    WHERE email IN ('rahul@test.com', 'priya@test.com', 'arjun@test.com', 'rahul@example.com', 'priya@example.com', 'arjun@example.com')
);

-- Delete all offers by test users
DELETE FROM offers
WHERE freelancer_id IN (
    SELECT id FROM users
    WHERE email IN ('rahul@test.com', 'priya@test.com', 'arjun@test.com', 'rahul@example.com', 'priya@example.com', 'arjun@example.com')
);

-- Delete all orders involving test users
DELETE FROM orders
WHERE freelancer_id IN (
    SELECT id FROM users
    WHERE email IN ('rahul@test.com', 'priya@test.com', 'arjun@test.com', 'rahul@example.com', 'priya@example.com', 'arjun@example.com')
)
OR poster_id IN (
    SELECT id FROM users
    WHERE email IN ('rahul@test.com', 'priya@test.com', 'arjun@test.com', 'rahul@example.com', 'priya@example.com', 'arjun@example.com')
);

-- Delete all tasks posted by test users
DELETE FROM tasks
WHERE poster_id IN (
    SELECT id FROM users
    WHERE email IN ('rahul@test.com', 'priya@test.com', 'arjun@test.com', 'rahul@example.com', 'priya@example.com', 'arjun@example.com')
);

-- Delete all transactions for test users
DELETE FROM transactions
WHERE user_id IN (
    SELECT id FROM users
    WHERE email IN ('rahul@test.com', 'priya@test.com', 'arjun@test.com', 'rahul@example.com', 'priya@example.com', 'arjun@example.com')
);

-- Delete all reviews involving test users
DELETE FROM reviews
WHERE reviewer_id IN (
    SELECT id FROM users
    WHERE email IN ('rahul@test.com', 'priya@test.com', 'arjun@test.com', 'rahul@example.com', 'priya@example.com', 'arjun@example.com')
)
OR reviewee_id IN (
    SELECT id FROM users
    WHERE email IN ('rahul@test.com', 'priya@test.com', 'arjun@test.com', 'rahul@example.com', 'priya@example.com', 'arjun@example.com')
);

-- Finally, delete the test users themselves
DELETE FROM users
WHERE email IN (
    'rahul@test.com',
    'priya@test.com',
    'arjun@test.com',
    'rahul@example.com',
    'priya@example.com',
    'arjun@example.com'
);

-- Also remove any users with 'test' in their email (catch any other test accounts)
-- COMMENT OUT the next line if you want to keep real users with 'test' in their email
-- DELETE FROM users WHERE email LIKE '%test%';

COMMIT;

-- =====================================================
-- Verification queries (optional - remove when running)
-- =====================================================
-- SELECT email, name FROM users ORDER BY id;
-- SELECT COUNT(*) FROM password_resets;
