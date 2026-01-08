import { sql } from '@vercel/postgres';

async function migrate() {
  console.log('Running migrations...');

  // Create leads table
  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Create activities table
  await sql`
    CREATE TABLE IF NOT EXISTS activities (
      id SERIAL PRIMARY KEY,
      lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      contact_method TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  console.log('Migrations completed!');
}

migrate().catch(console.error);
