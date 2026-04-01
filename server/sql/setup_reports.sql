-- =====================================================
-- SideQuest - Reports Table Setup
-- This ensures the reports table exists for user reporting
-- =====================================================

-- Create reports table if it doesn't exist
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    target_id INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'user' or 'task'
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'resolved'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_id, type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);

-- Verify table exists
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reports';
