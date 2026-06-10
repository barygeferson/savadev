
-- 1) Restrict invite_codes reads: drop public-read policy, only admins can read
DROP POLICY IF EXISTS "anyone can read invite codes" ON public.invite_codes;
DROP POLICY IF EXISTS "Anyone can read invite codes" ON public.invite_codes;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='invite_codes' AND policyname='Admins can read invite codes'
  ) THEN
    CREATE POLICY "Admins can read invite codes"
      ON public.invite_codes
      FOR SELECT
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Anon can no longer read invite codes; redemption goes via SECURITY DEFINER function
REVOKE SELECT ON public.invite_codes FROM anon;

-- 2) Lock down SECURITY DEFINER functions: revoke EXECUTE from public/anon for
--    trigger-only functions that should never be invoked directly.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- redeem_invite must be callable by anon (signup-time redemption) and authenticated
REVOKE EXECUTE ON FUNCTION public.redeem_invite(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_invite(text) TO anon, authenticated;

-- has_role is used inside RLS policies; revoke from anon (no anonymous role checks needed),
-- keep accessible to authenticated.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
