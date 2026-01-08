import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface Lead {
  id: number;
  company_name: string;
  number_of_locations: string | null;
  employees: string | null;
  website: string | null;
  first_name: string | null;
  last_name: string | null;
  job_title: string | null;
  job_start_date: string | null;
  job_function: string | null;
  company_hq_phone: string | null;
  direct_phone_number: string | null;
  mobile_phone: string | null;
  email_address: string | null;
  linkedin_contact_profile_url: string | null;
  company_street_address: string | null;
  company_city: string | null;
  company_state: string | null;
  company_zip_code: string | null;
  annual_revenue: string | null;
  primary_industry: string | null;
  primary_sub_industry: string | null;
  linkedin_company_profile_url: string | null;
  facebook_company_profile_url: string | null;
  twitter_company_profile_url: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface Activity {
  id: number;
  lead_id: number;
  contact_method: string;
  notes: string | null;
  created_at: string | null;
}

export type NewLead = Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
export type NewActivity = Omit<Activity, 'id' | 'created_at'>;
