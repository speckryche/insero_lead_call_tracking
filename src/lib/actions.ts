'use server';

import { supabase, Lead, NewLead, NewActivity } from './supabase';
import { revalidatePath } from 'next/cache';

export async function getLeads(search?: string, status?: string, sort?: string) {
  let query = supabase.from('leads').select('*');

  if (search) {
    const searchPattern = `%${search.toLowerCase()}%`;
    query = query.or(
      `company_name.ilike.${searchPattern},first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},email_address.ilike.${searchPattern}`
    );
  }

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  switch (sort) {
    case 'employees_asc':
      query = query.order('employees', { ascending: true });
      break;
    case 'employees_desc':
      query = query.order('employees', { ascending: false });
      break;
    case 'locations_asc':
      query = query.order('number_of_locations', { ascending: true });
      break;
    case 'locations_desc':
      query = query.order('number_of_locations', { ascending: false });
      break;
    case 'city_asc':
      query = query.order('company_city', { ascending: true });
      break;
    case 'city_desc':
      query = query.order('company_city', { ascending: false });
      break;
    default:
      query = query.order('id', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(mapLeadToCamelCase);
}

export async function getLead(id: number) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data ? mapLeadToCamelCase(data) : null;
}

export async function getLeadActivities(leadId: number) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('lead_id', leadId)
    .order('id', { ascending: false });

  if (error) throw error;

  return (data || []).map((a) => ({
    id: a.id,
    leadId: a.lead_id,
    contactMethod: a.contact_method,
    notes: a.notes,
    createdAt: a.created_at,
  }));
}

export async function updateLeadStatus(id: number, status: string) {
  const { error } = await supabase
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;

  revalidatePath('/');
  revalidatePath(`/leads/${id}`);
}

export async function addActivity(data: NewActivity) {
  const { error } = await supabase.from('activities').insert({
    lead_id: data.lead_id,
    contact_method: data.contact_method,
    notes: data.notes,
  });

  if (error) throw error;

  const lead = await getLead(data.lead_id);
  if (lead && lead.status === 'new') {
    await updateLeadStatus(data.lead_id, 'left_vm_emailed');
  }

  revalidatePath(`/leads/${data.lead_id}`);
}

export async function importLeads(leadsData: NewLead[]) {
  if (leadsData.length === 0) return { count: 0 };

  const dbLeads = leadsData.map((lead) => ({
    company_name: lead.company_name,
    number_of_locations: lead.number_of_locations,
    employees: lead.employees,
    website: lead.website,
    first_name: lead.first_name,
    last_name: lead.last_name,
    job_title: lead.job_title,
    job_start_date: lead.job_start_date,
    job_function: lead.job_function,
    company_hq_phone: lead.company_hq_phone,
    direct_phone_number: lead.direct_phone_number,
    mobile_phone: lead.mobile_phone,
    email_address: lead.email_address,
    linkedin_contact_profile_url: lead.linkedin_contact_profile_url,
    company_street_address: lead.company_street_address,
    company_city: lead.company_city,
    company_state: lead.company_state,
    company_zip_code: lead.company_zip_code,
    annual_revenue: lead.annual_revenue,
    primary_industry: lead.primary_industry,
    primary_sub_industry: lead.primary_sub_industry,
    linkedin_company_profile_url: lead.linkedin_company_profile_url,
    facebook_company_profile_url: lead.facebook_company_profile_url,
    twitter_company_profile_url: lead.twitter_company_profile_url,
    status: lead.status || 'new',
  }));

  const { error } = await supabase.from('leads').insert(dbLeads);

  if (error) throw error;

  revalidatePath('/');
  return { count: leadsData.length };
}

export async function getStats() {
  const { data, error } = await supabase.from('leads').select('status');

  if (error) throw error;

  const allLeads = data || [];

  return {
    total: allLeads.length,
    new: allLeads.filter((l) => l.status === 'new').length,
    leftVmEmailed: allLeads.filter((l) => l.status === 'left_vm_emailed').length,
    contacted: allLeads.filter((l) => l.status === 'contacted').length,
    meetingSet: allLeads.filter((l) => l.status === 'meeting_set').length,
    notInterested: allLeads.filter((l) => l.status === 'not_interested').length,
  };
}

export async function deleteLead(id: number) {
  const { error } = await supabase.from('leads').delete().eq('id', id);

  if (error) throw error;

  revalidatePath('/');
}

function mapLeadToCamelCase(lead: Lead) {
  return {
    id: lead.id,
    companyName: lead.company_name,
    numberOfLocations: lead.number_of_locations,
    employees: lead.employees,
    website: lead.website,
    firstName: lead.first_name,
    lastName: lead.last_name,
    jobTitle: lead.job_title,
    jobStartDate: lead.job_start_date,
    jobFunction: lead.job_function,
    companyHqPhone: lead.company_hq_phone,
    directPhoneNumber: lead.direct_phone_number,
    mobilePhone: lead.mobile_phone,
    emailAddress: lead.email_address,
    linkedinContactProfileUrl: lead.linkedin_contact_profile_url,
    companyStreetAddress: lead.company_street_address,
    companyCity: lead.company_city,
    companyState: lead.company_state,
    companyZipCode: lead.company_zip_code,
    annualRevenue: lead.annual_revenue,
    primaryIndustry: lead.primary_industry,
    primarySubIndustry: lead.primary_sub_industry,
    linkedinCompanyProfileUrl: lead.linkedin_company_profile_url,
    facebookCompanyProfileUrl: lead.facebook_company_profile_url,
    twitterCompanyProfileUrl: lead.twitter_company_profile_url,
    status: lead.status,
    createdAt: lead.created_at,
    updatedAt: lead.updated_at,
  };
}
