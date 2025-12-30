-- Add mobile video support to hero_videos table
-- This allows a different video to be shown on mobile devices

ALTER TABLE hero_videos 
ADD COLUMN mobile_media_id INTEGER REFERENCES media(id) ON DELETE SET NULL;

COMMENT ON COLUMN hero_videos.mobile_media_id IS 'Media ID for mobile-specific hero video (optional)';
