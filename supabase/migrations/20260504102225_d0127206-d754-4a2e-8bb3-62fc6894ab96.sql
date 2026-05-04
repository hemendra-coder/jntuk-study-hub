-- Allow public (anon + authenticated) read access to academic content
-- so that files appear on every device whether or not the user is signed in.
-- Writes remain admin-only via existing "Admins manage ..." policies.

DROP POLICY IF EXISTS "Auth read subjects" ON public.subjects;
CREATE POLICY "Public read subjects" ON public.subjects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth read units" ON public.units;
CREATE POLICY "Public read units" ON public.units FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth read branches" ON public.branches;
CREATE POLICY "Public read branches" ON public.branches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth read notes" ON public.notes;
CREATE POLICY "Public read notes" ON public.notes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth read formulas" ON public.formulas;
CREATE POLICY "Public read formulas" ON public.formulas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth read papers" ON public.papers;
CREATE POLICY "Public read papers" ON public.papers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth read videos" ON public.videos;
CREATE POLICY "Public read videos" ON public.videos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth read pdfs" ON public.pdf_files;
CREATE POLICY "Public read pdfs" ON public.pdf_files FOR SELECT USING (true);

-- Allow anonymous visitors to also generate signed URLs for the pdfs bucket
-- so downloads/views work without forcing sign-in. (Bucket itself stays private;
-- access is only via short-lived signed URLs created server-side by Storage.)
DROP POLICY IF EXISTS "Public read pdfs bucket" ON storage.objects;
CREATE POLICY "Public read pdfs bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pdfs');