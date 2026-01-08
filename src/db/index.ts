import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema-sqlite';

// Local development uses SQLite
// For production with Supabase, see DEPLOY.md

const sqlite = new Database('local.db');

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    number_of_locations TEXT,
    employees TEXT,
    website TEXT,
    first_name TEXT,
    last_name TEXT,
    job_title TEXT,
    job_start_date TEXT,
    job_function TEXT,
    company_hq_phone TEXT,
    direct_phone_number TEXT,
    mobile_phone TEXT,
    email_address TEXT,
    linkedin_contact_profile_url TEXT,
    company_street_address TEXT,
    company_city TEXT,
    company_state TEXT,
    company_zip_code TEXT,
    annual_revenue TEXT,
    primary_industry TEXT,
    primary_sub_industry TEXT,
    linkedin_company_profile_url TEXT,
    facebook_company_profile_url TEXT,
    twitter_company_profile_url TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    contact_method TEXT NOT NULL,
    notes TEXT,
    created_at TEXT
  );
`);

export const db = drizzle(sqlite, { schema });
export * from './schema-sqlite';
