-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table (a user can have multiple projects)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Surveys table (a project can have multiple surveys)
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  method TEXT NOT NULL,
  sub_method TEXT,
  array_type TEXT,
  location TEXT,
  surveyed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Readings table (raw field data uploaded per survey)
CREATE TABLE IF NOT EXISTS readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  raw_file_path TEXT,
  status TEXT DEFAULT 'uploaded',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table (tracks inversion job status)
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_id UUID REFERENCES readings(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'queued',
  result_path TEXT,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
