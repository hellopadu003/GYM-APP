-- Copy and paste this into the Supabase SQL Editor to create the necessary tables

-- 1. Create Members Table
CREATE TABLE IF NOT EXISTS members (
  member_id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_whatsapp BOOLEAN DEFAULT false,
  address TEXT,
  age INTEGER,
  gender TEXT,
  join_date DATE,
  blood_group TEXT,
  photo_url TEXT,
  plan_type TEXT,
  monthly_fee INTEGER,
  admission_fee INTEGER,
  discount INTEGER,
  expiry_date DATE,
  status TEXT
);

-- 2. Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id TEXT REFERENCES members(member_id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  date DATE NOT NULL,
  method TEXT NOT NULL,
  type TEXT NOT NULL
);

-- 3. Create Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount INTEGER NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  description TEXT
);

-- 4. Create Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id TEXT REFERENCES members(member_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL,
  UNIQUE(member_id, date)
);

-- Disable Row Level Security (RLS) so the app can read/write without complex Auth setup
-- If you want to enable Auth later, you can turn these to ENABLE ROW LEVEL SECURITY
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
