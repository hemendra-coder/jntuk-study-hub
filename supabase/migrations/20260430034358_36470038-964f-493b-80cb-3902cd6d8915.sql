-- Make branch & semester optional everywhere so the public site and admin
-- can operate without those filters. Existing data is preserved (NULLs allowed,
-- non-null rows untouched).

ALTER TABLE public.subjects ALTER COLUMN branch_id DROP NOT NULL;
ALTER TABLE public.subjects ALTER COLUMN semester DROP NOT NULL;

-- Replace the old composite uniqueness (branch+regulation+year+semester+code)
-- with one that doesn't require branch/semester. Drop if it exists from prior
-- upserts in admin.subjects.tsx.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'subjects_branch_id_regulation_year_semester_code_key'
  ) THEN
    ALTER TABLE public.subjects
      DROP CONSTRAINT subjects_branch_id_regulation_year_semester_code_key;
  END IF;
END$$;

CREATE UNIQUE INDEX IF NOT EXISTS subjects_regulation_year_code_uniq
  ON public.subjects (regulation, year, code);
