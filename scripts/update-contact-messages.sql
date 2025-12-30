-- =====================================================
-- Update contact_messages table to add missing columns
-- =====================================================
-- This script adds is_processed and updated_at columns
-- if they don't already exist
-- =====================================================

-- Add is_processed column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contact_messages' 
        AND column_name = 'is_processed'
    ) THEN
        ALTER TABLE contact_messages 
        ADD COLUMN is_processed BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Added is_processed column to contact_messages';
    ELSE
        RAISE NOTICE 'is_processed column already exists';
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contact_messages' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE contact_messages 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        
        RAISE NOTICE 'Added updated_at column to contact_messages';
    ELSE
        RAISE NOTICE 'updated_at column already exists';
    END IF;
END $$;

-- Make name, email, and message NOT NULL if they aren't already
DO $$ 
BEGIN
    -- Update any NULL values first
    UPDATE contact_messages SET name = 'Unknown' WHERE name IS NULL;
    UPDATE contact_messages SET email = 'unknown@example.com' WHERE email IS NULL;
    UPDATE contact_messages SET message = '' WHERE message IS NULL;
    
    -- Then set NOT NULL constraints
    ALTER TABLE contact_messages 
    ALTER COLUMN name SET NOT NULL,
    ALTER COLUMN email SET NOT NULL,
    ALTER COLUMN message SET NOT NULL;
    
    RAISE NOTICE 'Set NOT NULL constraints on name, email, message';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Constraints may already exist or error occurred: %', SQLERRM;
END $$;

-- Create index on is_processed if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_contact_messages_processed'
    ) THEN
        CREATE INDEX idx_contact_messages_processed ON contact_messages(is_processed);
        RAISE NOTICE 'Created index idx_contact_messages_processed';
    ELSE
        RAISE NOTICE 'Index idx_contact_messages_processed already exists';
    END IF;
END $$;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'contact_messages'
ORDER BY ordinal_position;
