DROP POLICY IF EXISTS "Auth upload to pdfs bucket" ON storage.objects;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_pdf_counter() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bump_pdf_counter() TO authenticated;