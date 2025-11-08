/*
  # Company Registration and Employee System

  ## Summary
  This migration creates a comprehensive company registration system where business owners can create companies and generate invitation codes for employees to join.

  ## 1. New Tables

  ### `companies`
  - `id` (uuid, primary key) - Unique identifier for each company
  - `name` (text, required) - Company name
  - `owner_id` (uuid, required) - References auth.users (the business owner)
  - `created_at` (timestamptz) - When the company was created
  - `updated_at` (timestamptz) - Last update timestamp

  ### `company_invite_codes`
  - `id` (uuid, primary key) - Unique identifier for each invite code
  - `company_id` (uuid, required) - References companies table
  - `code` (text, unique, required) - 8-character invitation code
  - `is_active` (boolean, default true) - Whether the code can still be used
  - `created_at` (timestamptz) - When the code was created
  - `expires_at` (timestamptz, nullable) - Optional expiration date
  - `used_count` (integer, default 0) - How many times the code has been used

  ### `user_profiles`
  - `id` (uuid, primary key) - References auth.users
  - `user_type` (text, required) - 'company_owner' or 'employee'
  - `company_id` (uuid, nullable) - References companies table (null for owners, set for employees)
  - `invite_code_used` (text, nullable) - The invite code used during registration (for employees)
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security (Row Level Security)
  - All tables have RLS enabled
  - Company owners can manage their own companies
  - Employees can view their company information
  - Invite codes can be validated by anyone during registration
  - Users can only access data related to their own company

  ## 3. Functions
  - `generate_company_code()` - Generates a random 8-character alphanumeric code

  ## 4. Important Notes
  - Each company owner creates one company
  - Employees must use a valid invite code to register
  - Invite codes are reusable unless deactivated
  - Content posts will be filtered by company in future updates
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(owner_id)
);

-- Create company invite codes table
CREATE TABLE IF NOT EXISTS company_invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  used_count integer DEFAULT 0
);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('company_owner', 'employee')),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  invite_code_used text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_owner_id ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_invite_codes_company_id ON company_invite_codes(company_id);
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON company_invite_codes(code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON user_profiles(company_id);

-- Function to generate random company code
CREATE OR REPLACE FUNCTION generate_company_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies table
CREATE POLICY "Company owners can view own company"
  ON companies FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Company owners can create own company"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Company owners can update own company"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Employees can view their company"
  ON companies FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

-- RLS Policies for company_invite_codes table
CREATE POLICY "Company owners can view own invite codes"
  ON company_invite_codes FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can create invite codes"
  ON company_invite_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can update own invite codes"
  ON company_invite_codes FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can validate invite codes during registration"
  ON company_invite_codes FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for user_profiles table
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Company owners can view employee profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

-- Update content_posts to include company_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_posts' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE content_posts ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    CREATE INDEX idx_content_posts_company_id ON content_posts(company_id);
  END IF;
END $$;

-- Update RLS policies for content_posts to include company filtering
DROP POLICY IF EXISTS "Users can view own content" ON content_posts;
DROP POLICY IF EXISTS "Users can create own content" ON content_posts;
DROP POLICY IF EXISTS "Users can update own content" ON content_posts;
DROP POLICY IF EXISTS "Users can delete own content" ON content_posts;

CREATE POLICY "Users can view company content"
  ON content_posts FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
    OR company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create company content"
  ON content_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
    OR company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update company content"
  ON content_posts FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
    OR company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
    OR company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete company content"
  ON content_posts FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
    OR company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );