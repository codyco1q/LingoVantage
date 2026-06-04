# LingoVantage 🎓

A modern, dark-themed English learning platform website.
Pure HTML + CSS + JavaScript (no build step) — ready to deploy on **Netlify**, connected to **Supabase**.

---

## 📁 Project structure

```
lingovantage/
├── index.html          # Home (Hero, Features, Packages, Journey, FAQ, CTA, Footer)
├── pricing.html        # Pricing page (Fluency / Business + free test)
├── assessment.html     # 30-question level test (A1–B1) with scoring
├── signup.html         # Registration form → Supabase
├── dashboard.html      # Simple admin dashboard (view registrations)
│
├── css/
│   └── styles.css      # ALL styles, organized into numbered sections
│
├── js/
│   ├── config.js       # 🔧 EDIT HERE: links, Supabase keys, packages, logins
│   ├── main.js         # Shared UI: navbar, FAQ, pricing toggle, reveal
│   ├── supabase-client.js  # Supabase REST helper
│   ├── signup.js       # Signup form validation + save
│   ├── assessment.js   # Test login gate + engine + 30 questions + scoring
│   └── dashboard.js    # Admin dashboard logic
│
├── assets/
│   └── logo.png        # Your LingoVantage logo (transparent)
│
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
