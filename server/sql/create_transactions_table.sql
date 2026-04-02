-- =====================================================
-- SideQuest - TRANSACTIONS TABLE
-- Run this script to enable wallet transactions
-- =====================================================

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'earned', 'spent', 'withdrawal', 'added'
    description TEXT,
    reference_id INTEGER, -- Can reference order_id, task_id, etc.
    reference_type VARCHAR(50), -- 'order', 'task', 'withdrawal', etc.
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
