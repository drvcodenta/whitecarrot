# whitecarrot

a multi-tenant careers page builder. recruiters can create and customize their own careers pages, add job listings, and publish them for job seekers to browse.

built with next.js 16, supabase, and tailwindcss.

---

## how to setup

### prerequisites

- node.js 18+
- npm
- a supabase project (free tier works)

### 1. clone the repo

```bash
git clone https://github.com/drvcodenta/whitecarrot.git
cd whitecarrot
```

### 2. install dependencies

```bash
npm install
```

### 3. setup environment variables

create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

fill in your supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

you can find these in your supabase dashboard under settings > api.

### 4. setup the database

run the sql in `supabase/schema.sql` in your supabase sql editor. this creates the `companies` and `jobs` tables with row level security policies.

### 5. seed sample data (optional)

```bash
npm run seed
```
data exists inside the `data` folder.
this populates the database with sample companies and job listings.

### 6. run the dev server

```bash
npm run dev
```

open http://localhost:3000 in your browser.

---

## user flows

### job seeker flow

1. land on the homepage (`/`)
2. click "browse jobs" to go to the global jobs page (`/jobs`)
3. use filters to narrow down by location, job type, work policy, etc.
4. click on a job card to view details
5. optionally visit a specific company's careers page (`/[company-slug]/careers`)

### recruiter flow

1. land on the homepage (`/`)
2. click "recruiter login" to go to the login page (`/login`)
3. sign up or log in with email/password via supabase auth
4. after login, get redirected to the page builder (`/[company-slug]/edit`)
5. customize the careers page:
   - reorder sections (header, jobs, youtube, life at company, footer)
   - update brand settings (colors, logo)
   - add/edit seo meta tags
   - embed youtube videos
   - upload life at company images
6. click "preview" to see a live preview (`/[company-slug]/preview`)
7. click "publish" to make the careers page live
8. the published page is now accessible at `/[company-slug]/careers`

### job management flow

1. from the page builder, navigate to job management (`/jobs/edit`)
2. add new job listings with:
   - title, location, department
   - work policy (remote/hybrid/on-site)
   - employment type (full time/part time/contract)
   - experience level (junior/mid-level/senior)
   - job type (permanent/temporary/internship)
   - salary range
3. toggle jobs active/inactive
4. jobs appear on both the company careers page and the global jobs page

---

## project structure

```
src/
  app/
    page.tsx              # homepage
    login/                # auth page
    jobs/                 # global job listing
      edit/               # job management for recruiters
    [companySlug]/
      edit/               # page builder (recruiter only)
      preview/            # live preview
      careers/            # public careers page
  components/
    Editor.tsx            # page builder ui
    CareerPage.tsx        # careers page renderer
    FilterDrawer.tsx      # job filters
    MobileDrawer.tsx      # mobile navigation
  lib/
    supabase-server.ts    # server-side supabase client
    supabase-browser.ts   # client-side supabase client
    types.ts              # typescript types
supabase/
  schema.sql              # database schema
data/
  sample.json             # sample data for seeding
```

---

## tech stack

- next.js 16 (app router)
- supabase (auth + database)
- tailwindcss 4
- typescript

---

## deployment

deploy to vercel:

```bash
npm install -g vercel
vercel login
vercel
```

make sure to add your environment variables in vercel's dashboard under settings > environment variables.
