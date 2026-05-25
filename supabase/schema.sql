-- ==============================================================================
-- Schema setup for StackAudit (Phase 7 — Backend & Database)
-- Deploy this in the Supabase SQL Editor
-- ==============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Audits Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    input JSONB NOT NULL,
    summary JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    ai_summary TEXT,                                       -- Phase 8: Gemini AI summary (nullable)
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Migration: add ai_summary column to existing databases (safe to run multiple times)
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS ai_summary TEXT;


-- Index on created_at for fast dashboard sorting or analytics queries
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON public.audits(created_at DESC);

-- Enable RLS on audits
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone (anon or authenticated) can write an audit report
CREATE POLICY "Allow public inserts on audits" ON public.audits
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Policy: Anyone can read audit results if they have the UUID link
CREATE POLICY "Allow public reads on audits" ON public.audits
    FOR SELECT TO anon, authenticated
    USING (true);


-- ------------------------------------------------------------------------------
-- 2. Leads Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID REFERENCES public.audits(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    name TEXT,                                                 -- Phase 9: optional submitter name
    notified_at TIMESTAMPTZ,                                   -- Phase 9: timestamp of last confirmation email sent
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Migration: add name + notified_at columns to existing databases (safe to run multiple times)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;

-- Indexes for emails and foreign keys
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_audit_id ON public.leads(audit_id);

-- Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit their email (anon or authenticated)
CREATE POLICY "Allow public inserts on leads" ON public.leads
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Note: No SELECT policies are defined for 'anon' or 'authenticated' on the leads table.
-- This keeps email database collections write-only from the client, preventing leakages.
-- Only the service_role key (Admin) is allowed read/select access by default.
