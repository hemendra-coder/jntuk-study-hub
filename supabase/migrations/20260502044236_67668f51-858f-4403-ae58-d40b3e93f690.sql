
-- Idempotent retry: drop conflicting storage policy first, then create everything fresh.

-- NOTES
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  subject_id UUID,
  unit_id UUID,
  year SMALLINT,
  semester SMALLINT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  uploaded_by UUID,
  view_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth read notes" ON public.notes;
DROP POLICY IF EXISTS "Admins manage notes" ON public.notes;
CREATE POLICY "Auth read notes" ON public.notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage notes" ON public.notes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP TRIGGER IF EXISTS notes_touch ON public.notes;
CREATE TRIGGER notes_touch BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
ALTER TABLE public.notes REPLICA IDENTITY FULL;

-- FORMULAS
CREATE TABLE IF NOT EXISTS public.formulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  subject_id UUID,
  unit_id UUID,
  year SMALLINT,
  semester SMALLINT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  uploaded_by UUID,
  view_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.formulas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth read formulas" ON public.formulas;
DROP POLICY IF EXISTS "Admins manage formulas" ON public.formulas;
CREATE POLICY "Auth read formulas" ON public.formulas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage formulas" ON public.formulas FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP TRIGGER IF EXISTS formulas_touch ON public.formulas;
CREATE TRIGGER formulas_touch BEFORE UPDATE ON public.formulas FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
ALTER TABLE public.formulas REPLICA IDENTITY FULL;

-- PAPERS
CREATE TABLE IF NOT EXISTS public.papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  subject_id UUID,
  unit_id UUID,
  year SMALLINT,
  exam_year SMALLINT,
  semester SMALLINT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  uploaded_by UUID,
  view_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth read papers" ON public.papers;
DROP POLICY IF EXISTS "Admins manage papers" ON public.papers;
CREATE POLICY "Auth read papers" ON public.papers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage papers" ON public.papers FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP TRIGGER IF EXISTS papers_touch ON public.papers;
CREATE TRIGGER papers_touch BEFORE UPDATE ON public.papers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
ALTER TABLE public.papers REPLICA IDENTITY FULL;

-- VIDEOS
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  subject_id UUID,
  unit_id UUID,
  year SMALLINT,
  semester SMALLINT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  uploaded_by UUID,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth read videos" ON public.videos;
DROP POLICY IF EXISTS "Admins manage videos" ON public.videos;
CREATE POLICY "Auth read videos" ON public.videos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage videos" ON public.videos FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP TRIGGER IF EXISTS videos_touch ON public.videos;
CREATE TRIGGER videos_touch BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
ALTER TABLE public.videos REPLICA IDENTITY FULL;

-- Add tables to realtime publication if not already
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notes; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.formulas; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.papers; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.videos; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Tighten pdf_files: admin-only writes (remove public upload policy if present)
DROP POLICY IF EXISTS "Auth users can upload pdfs" ON public.pdf_files;

-- Storage policies on the 'pdfs' bucket: admin-only writes, authenticated reads.
DROP POLICY IF EXISTS "Auth users can upload to pdfs bucket" ON storage.objects;
DROP POLICY IF EXISTS "Auth read pdfs bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins write pdfs bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins update pdfs bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete pdfs bucket" ON storage.objects;

CREATE POLICY "Auth read pdfs bucket"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'pdfs');

CREATE POLICY "Admins write pdfs bucket"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'pdfs' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update pdfs bucket"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'pdfs' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete pdfs bucket"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'pdfs' AND has_role(auth.uid(), 'admin'::app_role));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notes_subject ON public.notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_notes_year ON public.notes(year);
CREATE INDEX IF NOT EXISTS idx_formulas_subject ON public.formulas(subject_id);
CREATE INDEX IF NOT EXISTS idx_papers_subject ON public.papers(subject_id);
CREATE INDEX IF NOT EXISTS idx_papers_exam_year ON public.papers(exam_year);
CREATE INDEX IF NOT EXISTS idx_videos_subject ON public.videos(subject_id);
