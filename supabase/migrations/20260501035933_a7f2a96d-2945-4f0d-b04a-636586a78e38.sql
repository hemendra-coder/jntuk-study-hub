-- 1. Allow any authenticated user to insert PDFs (keeps admin-only for update/delete via existing "Admins manage pdfs" ALL policy + new INSERT policy)
CREATE POLICY "Auth users can upload pdfs"
ON public.pdf_files
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = uploaded_by);

-- 2. Storage policies for the private 'pdfs' bucket: any auth user can upload into their own uid-prefixed folder, all auth users can read.
CREATE POLICY "Auth read pdfs bucket"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'pdfs');

CREATE POLICY "Auth upload to pdfs bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pdfs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Enable realtime for pdf_files
ALTER TABLE public.pdf_files REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pdf_files;