-- Tighten file_views: prevent NULL user_id spoofing on inserts
ALTER TABLE public.file_views ALTER COLUMN user_id SET NOT NULL;

DROP POLICY IF EXISTS "Auth insert own views" ON public.file_views;
CREATE POLICY "Auth insert own views"
ON public.file_views
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);