-- Fix: Add admin authorization check to get_user_id_by_email to prevent non-admin users from enumerating user IDs
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow admins to call this function
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: only admins can look up users by email';
  END IF;
  RETURN (SELECT id FROM auth.users WHERE email = _email LIMIT 1);
END;
$$;