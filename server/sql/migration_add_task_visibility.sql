-- Migration: Add is_visible column to tasks table
-- Run this to enable task visibility toggle feature

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Also add deadline column if it doesn't exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deadline VARCHAR(50);

-- Update existing tasks to be visible
UPDATE tasks SET is_visible = true WHERE is_visible IS NULL;
