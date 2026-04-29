-- Move pg_trgm to its own schema
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Lock down trigger-only functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user()    FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_pdf_counter()   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at()   FROM PUBLIC, anon, authenticated;

-- has_role: only signed-in users may call it
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;