-- Run this in Supabase SQL Editor to allow updates without authentication (DEV ONLY)
-- This adds a policy that allows updates to companies with no owner

-- Drop existing policies first
DROP POLICY IF EXISTS "owner_access" ON companies;
DROP POLICY IF EXISTS "public_read" ON companies;
DROP POLICY IF EXISTS "dev_all_access" ON companies;

-- Create new policies
-- Allow public read for published companies
CREATE POLICY "public_read" ON companies FOR SELECT USING (status = 'published');

-- Allow full access when owner_id is null (dev mode)
CREATE POLICY "dev_all_access" ON companies FOR ALL USING (owner_id IS NULL);

-- Allow owner access when owner_id matches
CREATE POLICY "owner_access" ON companies FOR ALL USING (auth.uid() = owner_id);
