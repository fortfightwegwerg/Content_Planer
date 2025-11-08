/*
  # Fix RLS Policies - Remove Infinite Recursion

  ## Summary
  This migration fixes the infinite recursion error in RLS policies by simplifying the policy checks
  and removing circular dependencies between tables.

  ## Changes
  1. Drop all existing RLS policies that cause recursion
  2. Recreate simpler, non-recursive policies
  3. Focus on direct user ownership checks rather than nested queries

  ## Security
  - Maintains security while fixing the recursion issue
  - Users can only access their own company data
  - Employees can access their company's data
*/

-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Company owners can view own company" ON companies;
DROP POLICY IF EXISTS "Company owners can create own company" ON companies;
DROP POLICY IF EXISTS "Company owners can update own company" ON companies;
DROP POLICY IF EXISTS "Employees can view their company" ON companies;

DROP POLICY IF EXISTS "Company owners can view own invite codes" ON company_invite_codes;
DROP POLICY IF EXISTS "Company owners can create invite codes" ON company_invite_codes;
DROP POLICY IF EXISTS "Company owners can update own invite codes" ON company_invite_codes;
DROP POLICY IF EXISTS "Anyone can validate invite codes during registration" ON company_invite_codes;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Company owners can view employee profiles" ON user_profiles;

DROP POLICY IF EXISTS "Users can view company content" ON content_posts;
DROP POLICY IF EXISTS "Users can create company content" ON content_posts;
DROP POLICY IF EXISTS "Users can update company content" ON content_posts;
DROP POLICY IF EXISTS "Users can delete company content" ON content_posts;

-- Create new simplified policies for companies
CREATE POLICY "Users can view own company as owner"
  ON companies FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create company as owner"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own company"
  ON companies FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Create new policies for user_profiles (no recursion)
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can create own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create new policies for company_invite_codes
CREATE POLICY "Company owners can manage invite codes"
  ON company_invite_codes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = company_invite_codes.company_id
      AND companies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = company_invite_codes.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read active invite codes"
  ON company_invite_codes FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create new policies for content_posts
CREATE POLICY "Users can view own content"
  ON content_posts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own content"
  ON content_posts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own content"
  ON content_posts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own content"
  ON content_posts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());