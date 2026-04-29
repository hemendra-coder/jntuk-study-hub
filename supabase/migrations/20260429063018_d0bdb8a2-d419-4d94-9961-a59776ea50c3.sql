-- Extensions first
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =========================================================
-- 1. ROLES
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'student');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users see own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins see all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 2. ACADEMIC STRUCTURE
-- =========================================================
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  year SMALLINT NOT NULL CHECK (year BETWEEN 1 AND 4),
  semester SMALLINT NOT NULL CHECK (semester BETWEEN 1 AND 2),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  regulation TEXT NOT NULL DEFAULT 'R23',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (branch_id, regulation, year, semester, code)
);
CREATE INDEX idx_subjects_branch ON public.subjects(branch_id, year, semester);

CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  unit_number SMALLINT NOT NULL CHECK (unit_number BETWEEN 1 AND 20),
  title TEXT NOT NULL,
  topics TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (subject_id, unit_number)
);
CREATE INDEX idx_units_subject ON public.units(subject_id);

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read branches" ON public.branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read units" ON public.units FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage branches" ON public.branches
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage subjects" ON public.subjects
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage units" ON public.units
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 3. PDF FILES
-- =========================================================
CREATE TABLE public.pdf_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  year SMALLINT CHECK (year BETWEEN 1 AND 4),
  semester SMALLINT CHECK (semester BETWEEN 1 AND 2),
  tags TEXT[] NOT NULL DEFAULT '{}',
  view_count INT NOT NULL DEFAULT 0,
  download_count INT NOT NULL DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pdf_branch_year_sem ON public.pdf_files(branch_id, year, semester);
CREATE INDEX idx_pdf_subject ON public.pdf_files(subject_id);
CREATE INDEX idx_pdf_unit ON public.pdf_files(unit_id);
CREATE INDEX idx_pdf_tags ON public.pdf_files USING GIN(tags);
CREATE INDEX idx_pdf_title_trgm ON public.pdf_files USING GIN (title gin_trgm_ops);

ALTER TABLE public.pdf_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read pdfs" ON public.pdf_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage pdfs" ON public.pdf_files
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 4. ANALYTICS
-- =========================================================
CREATE TABLE public.file_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pdf_id UUID NOT NULL REFERENCES public.pdf_files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('view','download')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_file_views_pdf ON public.file_views(pdf_id);
CREATE INDEX idx_file_views_created ON public.file_views(created_at DESC);

ALTER TABLE public.file_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth insert own views" ON public.file_views
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all views" ON public.file_views
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.bump_pdf_counter()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.action = 'view' THEN
    UPDATE public.pdf_files SET view_count = view_count + 1 WHERE id = NEW.pdf_id;
  ELSIF NEW.action = 'download' THEN
    UPDATE public.pdf_files SET download_count = download_count + 1 WHERE id = NEW.pdf_id;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_bump_pdf_counter
AFTER INSERT ON public.file_views
FOR EACH ROW EXECUTE FUNCTION public.bump_pdf_counter();

-- =========================================================
-- 5. updated_at trigger
-- =========================================================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_touch  BEFORE UPDATE ON public.profiles  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_branches_touch  BEFORE UPDATE ON public.branches  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_subjects_touch  BEFORE UPDATE ON public.subjects  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_units_touch     BEFORE UPDATE ON public.units     FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_pdfs_touch      BEFORE UPDATE ON public.pdf_files FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================================
-- 6. Auto-create profile + first admin bootstrap
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE user_count INT;
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;

  SELECT COUNT(*) INTO user_count FROM public.profiles;
  IF user_count <= 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- 7. STORAGE: private `pdfs` bucket
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdfs', 'pdfs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Auth read pdfs storage"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'pdfs');

CREATE POLICY "Admins upload pdfs storage"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update pdfs storage"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete pdfs storage"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'pdfs' AND public.has_role(auth.uid(), 'admin'));