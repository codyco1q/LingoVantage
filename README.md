# LingoVantage 🎓

A modern, dark-themed English learning platform website.
Pure HTML + CSS + JavaScript (no build step) — ready to deploy on **Netlify**, connected to **Supabase**.

---

## 📁 Project structure

```
lingovantage/
├── index.html          # Home (Hero, Features, Packages, Journey, FAQ, CTA, Footer)
├── pricing.html        # Pricing page (Fluency Group / Fluency Private)
├── assessment.html     # 30-question level test (A1–B1) with scoring
├── signup.html         # Registration form → Supabase
├── dashboard.html      # Admin dashboard (view registrations)
├── portal.html         # Student Portal (Sessions, Homework, Tests)
│
├── css/
│   └── styles.css      # ALL styles, organized into numbered sections
│
├── js/
│   ├── config.js       # 🔧 EDIT HERE: links, Supabase keys, packages, portal data
│   ├── main.js         # Shared UI: navbar, FAQ, reveal, social links
│   ├── supabase-client.js  # Supabase REST helper (insert/select/selectWhere)
│   ├── signup.js       # Signup form validation + save + Telegram notify
│   ├── assessment.js   # Level-test engine + 30 questions + scoring
│   ├── dashboard.js    # Admin dashboard logic
│   ├── portal.js       # Student portal login + tabs (sessions/homework)
│   ├── portal-tests.js # Tests tab: 1-attempt/IP, grading, save results
│   ├── tests-data.js   # 🔧 EDIT HERE: test questions + answer keys
│   ├── portal-homework.js # Homework tab: quiz + voice recorder + upload
│   └── homework-data.js   # 🔧 EDIT HERE: homework questions per unit
│
├── assets/             # Logo + favicons
├── netlify.toml        # Netlify config (pretty URLs + headers)
└── README.md
```

---

## ⚙️ Setup — 3 steps

### 1) Configure your links & keys
Open **`js/config.js`** and fill in:

```js
whatsappGroup: "https://chat.whatsapp.com/LmqmGQjqEhmLnWrSYAQe7M",  // ✅ already set
whatsappNumber: "201093567856",   // ✅ already set (your number)
discordInvite: "#",               // ⬅ paste your Discord invite when ready

// Supabase is now configured server-side via Cloudflare Pages environment variables.
// Set SUPABASE_URL, SUPABASE_ANON_KEY, etc. in Cloudflare Pages dashboard.
```

> 🔑 **Test page login:** credentials are set as environment variables in Cloudflare Pages.

### 2) Supabase table
You already created the `student` table with these columns (✅ matches the code):
`id, full_name, age, whatsapp, email, current_level, goal, package, created_at`

**Allow inserts from the website** — in Supabase run this SQL (SQL Editor):

```sql
-- Enable Row Level Security
alter table student enable row level security;

-- Allow anonymous visitors to INSERT registrations
create policy "Allow public inserts"
on student for insert
to anon
with check (true);

-- Allow reading rows (needed for the dashboard using the anon key)
create policy "Allow public select"
on student for select
to anon
using (true);
```

> 🔒 Note: the dashboard read policy above uses the public anon key.
> For stronger security later, switch the dashboard to Supabase Auth and
> restrict `select` to authenticated admins only.

#### Test results table (for the Student Portal → Tests tab)
Create a second table named **`test_results`** and add RLS policies.
Run this in the Supabase SQL Editor:

```sql
create table if not exists test_results (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  student_name text,      -- the name the student entered before the test
  test_id      text,
  test_name    text,
  ip           text,
  score        int4,      -- marks earned
  total_max    int4,      -- marks possible (e.g. 30)
  percent      int4,      -- score / total_max * 100
  grade        text,      -- A / B / C / D / -
  answers      jsonb      -- the student's chosen answers
);

alter table test_results enable row level security;

-- students can submit a result
create policy "tr public insert" on test_results
  for insert to anon with check (true);

-- students can see their own result (portal lists by IP)
create policy "tr public select" on test_results
  for select to anon using (true);
```

**How grading works**
- Tests are **100% auto-graded** (Multiple choice + Right/Wrong, 1 mark each).
- The student gets their **final score, percentage and grade instantly** on submitting.
- Everything is saved to `test_results`; returning students see their saved result.

Grading guide: ≥90% = A · ≥80% = B · ≥70% = C · ≥60% = D · below = needs practice.

> ⚠️ **One-attempt rule:** each visitor IP can take a given test only once
> (checked against `test_results`). Note this is per-network — students on the
> same Wi-Fi share an IP, and mobile data IPs can change. It stops casual
> retakes but isn't bulletproof. For strict per-student limits you'd need
> per-student logins (a future upgrade).

#### Student accounts (Supabase Auth + approval) 🔐
Each student signs up with their **own email + password** (real, hashed by
Supabase Auth). They can't enter the portal until **you approve** them in the
dashboard — and you can revoke anyone instantly if they share access.

**1. Turn on Email auth**
- Supabase → **Authentication → Providers → Email** → make sure it's **enabled**.
- For the smoothest student experience you can turn **"Confirm email" OFF**
  (Authentication → Providers → Email → uncheck *Confirm email*). Then approval
  is the only gate. If you leave it ON, students must click a confirmation link
  in their inbox *and* be approved by you.

**2. Create the profiles table** (holds the approved flag) — run in SQL Editor:

```sql
create table if not exists student_profiles (
  id         uuid primary key,          -- matches the auth user id
  created_at timestamptz default now(),
  email      text,
  full_name  text,
  approved   boolean default false
);

alter table student_profiles enable row level security;

-- portal can read a profile to check the approved flag
create policy "profiles public select" on student_profiles
  for select to anon using (true);
-- a new signup can create its own profile row
create policy "profiles public insert" on student_profiles
  for insert to anon with check (true);
-- dashboard approves / revokes
create policy "profiles public update" on student_profiles
  for update to anon using (true) with check (true);
```

**How it works**
- Portal shows **Log in / Sign up** tabs. New students sign up (name + email +
  password) → they see a "pending approval" screen.
- In the dashboard → **🔑 Student Accounts** tab: you see everyone, with
  **Approve** / **Revoke** buttons and pending/approved counts.
- Approved students log in with their email; their **name auto-fills** on tests
  and homework. Revoke = blocked immediately.
- "Forgot password?" sends a Supabase reset email automatically.

> ✅ This is the secure option: passwords are hashed by Supabase Auth (never
> stored in plain text), and each account is a real personal email — which
> strongly discourages sharing. The old shared username/password login has been
> removed.

#### Homework submissions table (Student Portal → Submit Homework)
Interactive homework = **10 auto-graded questions + a 60-second voice note** per unit.
Create the table + a Storage bucket for the voice notes.

**1. Table** — run in the Supabase SQL Editor:

```sql
create table if not exists homework_submissions (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  student_name text,
  batch        text,
  unit         int4,        -- unit number (1–12)
  unit_title   text,
  ip           text,
  score        int4,        -- quiz marks earned
  total_max    int4,        -- quiz marks possible (10)
  percent      int4,
  answers      jsonb,       -- the student's quiz answers
  voice_url    text         -- public URL of the uploaded voice note
);

alter table homework_submissions enable row level security;

create policy "hw public insert" on homework_submissions
  for insert to anon with check (true);
create policy "hw public select" on homework_submissions
  for select to anon using (true);
```

**2. Storage bucket for voice notes** (in Supabase → **Storage**):
- Click **New bucket** → name it exactly **`voicenotes`** → tick **Public bucket** → Create.
- Then allow uploads/reads with the anon key (SQL Editor):

```sql
-- allow anyone to upload a voice note
create policy "voicenotes insert" on storage.objects
  for insert to anon with check (bucket_id = 'voicenotes');
-- allow reading the files (bucket is public anyway)
create policy "voicenotes read" on storage.objects
  for select to anon using (bucket_id = 'voicenotes');
```

**How it works**
- Student picks a unit → enters name + batch → answers 10 questions → records a
  voice note (≤60s, with playback + re-record) → submits.
- Quiz is **auto-graded instantly**; the voice note uploads to the `voicenotes` bucket.
- **One attempt per IP per unit.**
- In the **admin dashboard → 📤 Homework** tab: every submission shows the student,
  unit, quiz score, and whether a voice note exists. **Click any row** to see their
  quiz answers (✓/✗ marked) and **play the voice note** right there.
- Test-result rows are clickable too (full answer sheet).

**Adding more units:** open `js/homework-data.js`, fill a unit's `questions`
(10 items) + `voicePrompt`, and set `available: true`.

### 3) Deploy to Netlify
- Push this folder to GitHub.
- In Netlify: **Add new site → Import from GitHub** → pick the repo.
- **Publish directory:** `.` (root) — no build command needed.
- Done! Your site is live.

---

## 🔄 How registration flow works

```
Student fills Signup form
        ↓
   js/signup.js validates
        ↓
   Saved to Supabase (table: student)
        ↓
   Appears in dashboard.html
        ↓
   (Backup) student can also tap "Send on WhatsApp"
            → goes to your number +201093567856
```

---

## 🧪 Assessment test
- Protected by a login: set credentials as environment variables in Cloudflare Pages.
- 30 questions: 10 × A1, 10 × A2, 10 × B1.
- 1 point per correct answer (score out of 30).
- Level logic: you must score ≥60% in lower sections to claim a higher level.
- Result shows level (A1/A2/B1), % score, per-section breakdown, and a
  pre-filled signup link with the recommended package.

To **add/edit questions**, open `js/assessment.js` → the `LV_QUESTIONS` array.

---

## 🎨 Customizing
- **Colors / spacing:** top of `css/styles.css` (`:root` variables).
- **Text & sections:** directly in each `.html` file (clearly commented).
- **Prices:** `pricing.html` — uses `data-monthly` / `data-yearly` attributes.

---

## 🧰 Local preview
Just open `index.html` in a browser, or run a tiny server:

```bash
cd lingovantage
python3 -m http.server 8000
# visit http://localhost:8000
```

> Supabase calls work from `localhost` and your Netlify domain.
> If you see CORS issues, that's expected when opening via `file://` — use the server above.
