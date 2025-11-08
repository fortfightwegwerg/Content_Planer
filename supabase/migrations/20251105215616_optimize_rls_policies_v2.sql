/*
  # Optimize RLS Policies for Performance

  ## Summary
  Optimizes all Row Level Security policies by wrapping auth function calls in SELECT statements
  to prevent re-evaluation for each row, improving query performance at scale.

  ## Changes
  1. Drop and recreate all RLS policies with optimized auth function calls
  2. Remove duplicate policies on content_posts table
  3. Fix function search paths for security
  4. Remove unused indexes

  ## Security
  - Maintains same security model
  - Improves performance without compromising security
  - Fixes mutable search path vulnerabilities
*/

-- Drop all existing policies to recreate them optimized
DROP POLICY IF EXISTS "Users can read their own posts" ON content_posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON content_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON content_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON content_posts;
DROP POLICY IF EXISTS "Users can view own content" ON content_posts;
DROP POLICY IF EXISTS "Users can create own content" ON content_posts;
DROP POLICY IF EXISTS "Users can update own content" ON content_posts;
DROP POLICY IF EXISTS "Users can delete own content" ON content_posts;

DROP POLICY IF EXISTS "Users can view own YouTube tokens" ON youtube_tokens;
DROP POLICY IF EXISTS "Users can insert own YouTube tokens" ON youtube_tokens;
DROP POLICY IF EXISTS "Users can update own YouTube tokens" ON youtube_tokens;
DROP POLICY IF EXISTS "Users can delete own YouTube tokens" ON youtube_tokens;

DROP POLICY IF EXISTS "Users can create company as owner" ON companies;
DROP POLICY IF EXISTS "Users can view own company as owner" ON companies;
DROP POLICY IF EXISTS "Users can update own company" ON companies;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

DROP POLICY IF EXISTS "Company owners can manage invite codes" ON company_invite_codes;
DROP POLICY IF EXISTS "Anyone can read active invite codes" ON company_invite_codes;

-- Recreate optimized policies for content_posts (single set, no duplicates)
CREATE POLICY "Users can view own content"
  ON content_posts FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own content"
  ON content_posts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own content"
  ON content_posts FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own content"
  ON content_posts FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Recreate optimized policies for youtube_tokens
CREATE POLICY "Users can view own YouTube tokens"
  ON youtube_tokens FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own YouTube tokens"
  ON youtube_tokens FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own YouTube tokens"
  ON youtube_tokens FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own YouTube tokens"
  ON youtube_tokens FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Recreate optimized policies for companies
CREATE POLICY "Users can create company as owner"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = (select auth.uid()));

CREATE POLICY "Users can view own company as owner"
  ON companies FOR SELECT
  TO authenticated
  USING (owner_id = (select auth.uid()));

CREATE POLICY "Users can update own company"
  ON companies FOR UPDATE
  TO authenticated
  USING (owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()));

-- Recreate optimized policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Users can create own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- Recreate optimized policies for company_invite_codes
CREATE POLICY "Anyone can read active invite codes"
  ON company_invite_codes FOR SELECT
  TO authenticated
  USING (
    expires_at > now() 
    AND is_active = true
  );

CREATE POLICY "Company owners can manage invite codes"
  ON company_invite_codes FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = (select auth.uid())
    )
  );

-- Drop unused indexes
DROP INDEX IF EXISTS idx_youtube_tokens_expires_at;
DROP INDEX IF EXISTS idx_invite_codes_code;
DROP INDEX IF EXISTS idx_user_profiles_company_id;
DROP INDEX IF EXISTS idx_content_posts_company_id;

-- Fix function search paths (drop trigger first for populate_user_profile_email)
DROP TRIGGER IF EXISTS set_user_profile_email ON user_profiles;

DROP FUNCTION IF EXISTS generate_company_code();
CREATE FUNCTION generate_company_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  code text;
  code_exists boolean;
BEGIN
  LOOP
    code := upper(substr(md5(random()::text), 1, 8));
    
    SELECT EXISTS(
      SELECT 1 FROM company_invite_codes 
      WHERE invite_code = code AND is_active = true
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN code;
END;
$$;

DROP FUNCTION IF EXISTS populate_user_profile_email() CASCADE;
CREATE FUNCTION populate_user_profile_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.email := (SELECT email FROM auth.users WHERE id = NEW.id);
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER set_user_profile_email
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION populate_user_profile_email();

DROP FUNCTION IF EXISTS delete_user();
CREATE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_company_id uuid;
  is_company_owner boolean;
BEGIN
  SELECT company_id, user_type = 'owner' INTO user_company_id, is_company_owner
  FROM user_profiles
  WHERE id = (select auth.uid());

  DELETE FROM content_posts WHERE user_id = (select auth.uid());
  DELETE FROM youtube_tokens WHERE user_id = (select auth.uid());

  IF is_company_owner AND user_company_id IS NOT NULL THEN
    DELETE FROM company_invite_codes WHERE company_id = user_company_id;
    DELETE FROM user_profiles WHERE company_id = user_company_id AND user_type = 'employee';
    DELETE FROM companies WHERE id = user_company_id;
  END IF;

  DELETE FROM user_profiles WHERE id = (select auth.uid());
  DELETE FROM auth.users WHERE id = (select auth.uid());
END;
$$;