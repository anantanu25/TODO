-- ==============================================================================
-- TASKFLOW: Supabase Database Schema & Setup Script
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Create table `tasks`
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create index for faster querying and filtering
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks (priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks (due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks (created_at DESC);

-- 3. Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for Anon / Public access
-- (Allows full CRUD operations from the React web application)
DROP POLICY IF EXISTS "Allow public read access" ON public.tasks;
CREATE POLICY "Allow public read access"
    ON public.tasks FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON public.tasks;
CREATE POLICY "Allow public insert access"
    ON public.tasks FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access" ON public.tasks;
CREATE POLICY "Allow public update access"
    ON public.tasks FOR UPDATE
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete access" ON public.tasks;
CREATE POLICY "Allow public delete access"
    ON public.tasks FOR DELETE
    USING (true);

-- 6. Insert initial seed sample tasks for testing
INSERT INTO public.tasks (title, description, priority, status, due_date)
VALUES
    ('Design modern dashboard UI', 'Create wireframes and responsive layouts for desktop and mobile viewports.', 'high', 'completed', CURRENT_DATE - INTERVAL '1 day'),
    ('Connect Supabase backend', 'Set up tables, RLS policies, and test all CRUD API endpoints.', 'high', 'pending', CURRENT_DATE + INTERVAL '1 day'),
    ('Add search & filter controls', 'Implement real-time search by keywords and filter tabs for All, Pending, and Completed tasks.', 'medium', 'pending', CURRENT_DATE + INTERVAL '3 days'),
    ('Review accessibility & colors', 'Verify WCAG color contrast standards for priority badges and status pills.', 'low', 'pending', CURRENT_DATE + INTERVAL '5 days')
ON CONFLICT DO NOTHING;

