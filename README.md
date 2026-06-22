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
│   └── tests-data.js   # 🔧 EDIT HERE: test questions + answer keys
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

supabase: {
  url: "https://YOURPROJECT.supabase.co",   // ⬅ from Supabase > Settings > API
  anonKey: "eyJhbGciOi...",                  // ⬅ the public "anon" key
  table: "student"                            // ✅ matches your table
},

dashboardPassword: "lingo2026",   // ⬅ change this!

// The level test is behind a simple login:
assessmentAuth: {
  username: "test_user",
  password: "testme123%"
}
```

> 🔑 **Test page login:** username `test_user` · password `testme123%`
> (change these anytime in `js/config.js`).

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
- Protected by a login: username `test_user` / password `testme123%` (set in `js/config.js`).
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
