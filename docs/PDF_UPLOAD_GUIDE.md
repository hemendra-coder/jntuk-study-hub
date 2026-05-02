# PDF Upload Guide — JNTUK Study Hub Admin

This guide explains where PDFs come from, how they're uploaded, where they're
stored, and how students download them. It also covers using the built-in
**Admin Panel** to upload one or many PDFs at a time.

---

## 1. Architecture in 30 seconds

```
[Admin browser] --(login as admin)--> /admin/pdfs
       │
       │ 1. Drag & drop PDFs
       ▼
[Supabase Storage]   private "pdfs" bucket   (the file bytes live here)
       │
       │ 2. Insert metadata row
       ▼
[pdf_files table]    title, subject_id, unit_id, year, tags, storage_path
       │
       │ 3. Student logs in, requests file
       ▼
[Public site] -> createSignedUrl(60s) -> browser downloads/opens PDF
```

- **Bucket**: `pdfs` (private). Only authenticated users can read; only admins can write/delete.
- **Table**: `public.pdf_files` (storage_path links the row to the bucket object).
- **Access**: Files are served via short-lived signed URLs — no public links.

---

## 2. Where the upload UI lives

Route: **`/admin/pdfs`** — one page, three sections:

| Section            | What it does                                                                 |
|--------------------|------------------------------------------------------------------------------|
| **Bulk uploader**  | Pick Subject + Unit + tags, then drag-drop or click to upload many PDFs.     |
| **Filters / search** | Find existing files by title, tag, year, or subject.                       |
| **List**           | View / download / edit / delete every uploaded PDF.                          |

You must be signed in as an **admin** to see the "Admin" link in the navbar.
The first user to sign up is auto-promoted to admin.

---

## 3. Step-by-step: uploading PDFs (admin)

1. **Sign in** at `/auth` with your admin email.
2. Click **Admin** in the navbar → you land on the Dashboard.
3. In the sidebar click **PDFs**.
4. (Recommended) In the Bulk-upload card pick:
   - **Subject** — which subject the PDFs belong to.
   - **Unit** — optional, filters to units of the chosen subject.
   - **Tags** — comma-separated, e.g. `notes, midterm, important`.
5. **Drag PDFs** onto the dotted area (or click to open the file picker).
   You can drop **many files at once**.
6. Watch the progress (`Uploading 3/10…`).
   Each successful file is inserted into `pdf_files` and shows up in the list below.
7. To edit metadata (rename, change subject/unit, edit tags) click the ✏️ icon.
   To delete, click 🗑 — both the file in Storage and the DB row are removed.

### Tips
- File names are sanitized and prefixed with a timestamp so duplicates never clash.
- Files inherit the **Year** from the chosen Subject automatically — no need to set it manually.
- Don't worry about pre-creating subjects: use **Subjects → Seed from JNTUK data** once
  to populate every subject for R20 + R23 + Years 1-4.

---

## 4. How upload works in code (frontend → backend)

The whole thing lives in **`src/routes/admin.pdfs.tsx`**:

```ts
// 1. Push the bytes into the private "pdfs" bucket
const path = `${subjectCode}/${Date.now()}-${file.name}`;
await supabase.storage.from("pdfs").upload(path, file, {
  contentType: "application/pdf",
});

// 2. Insert the metadata row
await supabase.from("pdf_files").insert({
  title: file.name.replace(/\.pdf$/i, ""),
  storage_path: path,
  file_size: file.size,
  subject_id: bulkSubject ?? null,
  unit_id: bulkUnit ?? null,
  year: subj?.year ?? null,
  tags,
  uploaded_by: user.id,
});
```

That's it — no edge function, no third-party storage. Supabase RLS makes sure
only an admin row can insert into `pdf_files`.

---

## 5. How students download / view

Files in the bucket are **private**, so we hand out short-lived signed URLs:

```ts
const { data } = await supabase.storage
  .from("pdfs")
  .createSignedUrl(p.storage_path, 60); // valid 60 seconds

window.open(data.signedUrl, "_blank");

// Track the action for analytics
await supabase.from("file_views").insert({
  pdf_id: p.id, user_id: user.id, action: "view",  // or "download"
});
```

The `file_views` insert trips a DB trigger that increments
`pdf_files.view_count` / `pdf_files.download_count` — that's what powers the
**Analytics** dashboard.

---

## 6. Data model recap

```
branches        (legacy, optional now)
subjects        (regulation, year, code, name)        ← Year is the only academic dimension required
units           (subject_id, unit_number, title, topics[])
pdf_files       (subject_id?, unit_id?, year?, tags[], storage_path)
file_views      (pdf_id, user_id, action)             ← drives analytics
```

Branch & Semester were removed from the public flow per product decision.
The columns still exist on `pdf_files` (nullable) so any pre-existing rows
keep their data.

---

## 7. Required libraries

Already installed in the project:

| Package           | Why                                  |
|-------------------|--------------------------------------|
| `@supabase/supabase-js` | Storage + DB client            |
| `react-dropzone`  | Drag-and-drop file picker            |
| `sonner`          | Toast notifications                  |
| `lucide-react`    | Icons                                |

No extra install needed.

---

## 8. Common questions

**Q: Can a student upload?**
No. RLS only allows `has_role(auth.uid(), 'admin')` to insert/update/delete
in `pdf_files` and `storage.objects` for the `pdfs` bucket.

**Q: How big can a PDF be?**
Supabase Storage default: 50 MB per file. Increase in the Supabase dashboard
(Storage → settings) if needed.

**Q: Where do I see download counts?**
Admin → Analytics. Numbers are updated in real time via the
`bump_pdf_counter` trigger on `file_views`.

**Q: I uploaded by mistake — how do I delete?**
Admin → PDFs → 🗑. Storage object + DB row are both removed.

---

## Update — Separated content tables (Notes / Formulas / Papers / Videos)

The single `pdf_files` table is now superseded by **four content tables**, one per type:

| Table       | What it stores                            | Bucket folder convention   |
|-------------|-------------------------------------------|----------------------------|
| `notes`     | Lecture notes PDFs                        | `pdfs/notes/<SUBJECT>/...` |
| `formulas`  | Formula sheet PDFs                        | `pdfs/formulas/<SUBJECT>/...` |
| `papers`    | Previous-year question papers             | `pdfs/papers/<SUBJECT>/...` |
| `videos`    | Video links (YouTube etc.) — no file      | n/a (URL only)             |

All four tables enforce the same access rule:
- **Read:** any authenticated user
- **Write / update / delete:** only admins (`has_role(auth.uid(), 'admin')`)

### Filename auto-classification

When you drop PDFs into `/admin/pdfs`, each file is automatically tagged with a
content type by scanning the filename:

- `formula`, `sheet`, `cheatsheet` → **Formulas**
- `pyq`, `paper`, `prev`, `mid1`, `2023` (any 4-digit year), `exam` → **Papers**
- `notes`, `lecture`, `unit3`, `chapter`, `handout` → **Notes**
- everything else → **Notes** (safe default)

Each staged file shows a dropdown next to it so you can **manually override** the
detected type before clicking *Upload*. A global "Force type" selector at the top
lets you skip auto-detection entirely for a batch.

### Public routes for students

| URL          | Reads from   | Notes                       |
|--------------|--------------|-----------------------------|
| `/notes`     | `notes`      | Real-time, instant search   |
| `/formulas`  | `formulas`   | Real-time, instant search   |
| `/papers`    | `papers`     | Real-time, instant search   |
| `/videos`    | `videos`     | Click-through to video URL  |
| `/edubot`    | (AI Gateway) | Global teacher-style tutor  |

All four content browsers share the same realtime subscription pattern: as soon
as an admin uploads, every signed-in viewer sees the new item appear without a
page refresh.

### Adding a video

Videos are URL-only. From `/admin/pdfs` click **"Add a video link"**, paste the
URL, optionally pick subject/unit/tags, and save. The row appears live in
`/videos` for all users.

