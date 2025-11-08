/*
  # Add Delete User Function

  ## Summary
  Creates a function that allows users to delete their own account and all associated data.

  ## Changes
  1. Create a function `delete_user()` that:
     - Deletes user's content posts
     - Deletes user's profile
     - Deletes the user from auth.users (if user is the owner, also delete company data)

  ## Security
  - Function uses SECURITY DEFINER to access auth schema
  - Only allows users to delete their own account
*/

-- Function to delete user and all associated data
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_company_id uuid;
  is_company_owner boolean;
BEGIN
  -- Get user's company info
  SELECT company_id, user_type = 'owner' INTO user_company_id, is_company_owner
  FROM user_profiles
  WHERE id = auth.uid();

  -- Delete user's content posts
  DELETE FROM content_posts WHERE user_id = auth.uid();

  -- Delete user's YouTube tokens
  DELETE FROM youtube_tokens WHERE user_id = auth.uid();

  -- If user is a company owner, delete company data
  IF is_company_owner AND user_company_id IS NOT NULL THEN
    -- Delete all company invite codes
    DELETE FROM company_invite_codes WHERE company_id = user_company_id;
    
    -- Delete all employee profiles from this company
    DELETE FROM user_profiles WHERE company_id = user_company_id AND user_type = 'employee';
    
    -- Delete the company
    DELETE FROM companies WHERE id = user_company_id;
  END IF;

  -- Delete user profile
  DELETE FROM user_profiles WHERE id = auth.uid();

  -- Delete user from auth.users
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;