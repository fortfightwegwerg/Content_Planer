/*
  # Add Email to User Profiles

  ## Summary
  This migration adds an email column to user_profiles so we can display employee emails
  without needing to access the auth.users table directly.

  ## Changes
  1. Add email column to user_profiles
  2. Create a function to automatically populate email on profile creation
  3. Create a trigger to update email when user signs up
*/

-- Add email column to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN email text;
  END IF;
END $$;

-- Function to populate email from auth.users
CREATE OR REPLACE FUNCTION populate_user_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Get email from auth.users and set it in user_profiles
  NEW.email := (SELECT email FROM auth.users WHERE id = NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-populate email
DROP TRIGGER IF EXISTS set_user_profile_email ON user_profiles;
CREATE TRIGGER set_user_profile_email
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION populate_user_profile_email();

-- Backfill existing profiles with emails
UPDATE user_profiles
SET email = (SELECT email FROM auth.users WHERE auth.users.id = user_profiles.id)
WHERE email IS NULL;