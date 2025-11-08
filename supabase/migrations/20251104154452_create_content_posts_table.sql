/*
  # Create content_posts table

  1. New Tables
    - `content_posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `content` (text)
      - `platform` (text)
      - `category` (text)
      - `hashtags` (text)
      - `scheduled_date` (timestamptz)
      - `scheduled_time` (text)
      - `assignee` (text)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `content_posts` table
    - Add policy for authenticated users to create their own posts
    - Add policy for authenticated users to read their own posts
    - Add policy for authenticated users to update their own posts
    - Add policy for authenticated users to delete their own posts
*/

CREATE TABLE IF NOT EXISTS content_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  platform text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  hashtags text DEFAULT '',
  scheduled_date timestamptz,
  scheduled_time text DEFAULT '12:00',
  assignee text DEFAULT 'myself',
  status text DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own posts"
  ON content_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own posts"
  ON content_posts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON content_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON content_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_content_posts_user_id ON content_posts(user_id);
CREATE INDEX idx_content_posts_created_at ON content_posts(created_at DESC);
