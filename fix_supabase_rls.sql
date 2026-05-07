-- Run this in your Supabase SQL Editor to allow the app to save members
-- Since we bypassed the Supabase login, the app acts as an "anonymous" user.
-- These lines disable the security rules that are blocking the save.

ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;

-- If you prefer keeping RLS enabled but allowing all access, run this instead:
-- CREATE POLICY "Allow public read/write" ON members FOR ALL USING (true) WITH CHECK (true);
-- (and repeat for other tables)
