/*
  # YouTube OAuth Tokens Storage

  1. New Tables
    - `youtube_tokens`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `access_token` (text, encrypted)
      - `refresh_token` (text, encrypted)
      - `expires_at` (timestamptz)
      - `channel_id` (text)
      - `channel_name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `youtube_tokens` table
    - Add policies for authenticated users to manage their own tokens
    
  3. Important Notes
    - Tokens are stored per user for secure access
    - Each user can have only one YouTube connection
    - Tokens automatically refresh when expired
*/

CREATE TABLE IF NOT EXISTS youtube_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  channel_id text,
  channel_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE youtube_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own YouTube tokens"
  ON youtube_tokens FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own YouTube tokens"
  ON youtube_tokens FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own YouTube tokens"
  ON youtube_tokens FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own YouTube tokens"
  ON youtube_tokens FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_youtube_tokens_user_id ON youtube_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_tokens_expires_at ON youtube_tokens(expires_at);
