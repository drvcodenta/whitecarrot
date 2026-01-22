-- Companies with embedded sections
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  theme JSONB DEFAULT '{"primaryColor":"#1D4ED8","secondaryColor":"#1E3A5F","accentColor":"#0EA5E9"}',
  sections JSONB DEFAULT '[]',
  youtube_url TEXT,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  location TEXT,
  work_policy TEXT CHECK (work_policy IN ('Remote', 'Hybrid', 'On-site')),
  department TEXT,
  employment_type TEXT CHECK (employment_type IN ('Full time', 'Part time', 'Contract')),
  experience_level TEXT CHECK (experience_level IN ('Junior', 'Mid-level', 'Senior')),
  job_type TEXT CHECK (job_type IN ('Permanent', 'Temporary', 'Internship')),
  salary_range TEXT,
  job_slug TEXT UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_access" ON companies FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "public_read" ON companies FOR SELECT USING (status = 'published');

CREATE POLICY "job_owner" ON jobs FOR ALL 
  USING (EXISTS (SELECT 1 FROM companies WHERE id = company_id AND owner_id = auth.uid()));
CREATE POLICY "job_public" ON jobs FOR SELECT 
  USING (is_active AND EXISTS (SELECT 1 FROM companies WHERE id = company_id AND status = 'published'));
