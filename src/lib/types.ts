export type Company = {
  id: string;
  slug: string;
  name: string;
  status: 'draft' | 'published';
  logo_url?: string;
  banner_url?: string;
  youtube_url?: string;
  seo_meta?: { title?: string; description?: string; keywords?: string };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily?: string;
  };
  sections: Section[];
  owner_id: string;
  created_at: string;
};

export type Section = {
  id: string;
  type: 'header' | 'about' | 'life' | 'team' | 'values' | 'jobs' | 'footer' | 'video';
  order: number;
  content: Record<string, unknown>;
};

export type Job = {
  id: string;
  company_id: string;
  title: string;
  location: string;
  job_type: string;
  work_policy?: string;
  employment_type?: string;
  department: string;
  experience_level?: string;
  salary_range?: string;
  job_slug?: string;
  posted_days_ago?: string;
  is_active: boolean;
  created_at: string;
};
