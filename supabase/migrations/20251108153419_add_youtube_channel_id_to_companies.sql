/*
  # Add YouTube Channel ID to Companies Table

  1. Changes
    - Add `youtube_channel_id` column to `companies` table
      - `youtube_channel_id` (text, nullable) - Stores the YouTube channel ID for each company
      - Each company can have their own YouTube channel ID
      - This allows company-specific YouTube integration instead of global configuration

  2. Security
    - No RLS changes needed as companies table already has RLS enabled
    - Existing policies cover this new column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'youtube_channel_id'
  ) THEN
    ALTER TABLE companies ADD COLUMN youtube_channel_id text;
  END IF;
END $$;