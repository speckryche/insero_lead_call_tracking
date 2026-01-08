'use server';

import { supabase, Lead, NewLead, NewActivity, Campaign } from './supabase';
import { revalidatePath } from 'next/cache';

// Campaign functions
export async function getCampaigns() {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getCampaign(id: number) {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createCampaign(name: string) {
  const { data, error } = await supabase
    .from('campaigns')
    .insert({ name })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/');
  return data;
}

export async function getCampaignStats(campaignId: number) {
  const { data, error } = await supabase
    .from('leads')
    .select('status')
    .eq('campaign_id', campaignId);

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

// Lead functions
export async function getLeads(campaignId: number, search?: string, status?: string, sort?: string) {
  let query = supabase.from('leads').select('*').eq('campaign_id', campaignId);

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
  const lead = await getLead(id);
  const { error } = await supabase
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;

  revalidatePath('/');
  if (lead) {
    revalidatePath(`/campaigns/${lead.campaignId}`);
  }
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

export interface ImportLeadData {
  campaignId: number;
  mappedData: Record<string, string>;
  extraFields: Record<string, string>;
}

export async function importLeads(campaignId: number, leadsData: ImportLeadData[]) {
  if (leadsData.length === 0) return { count: 0 };

  const dbLeads = leadsData.map((lead) => ({
    campaign_id: campaignId,
    company_name: lead.mappedData.company_name || 'Unknown Company',
    number_of_locations: lead.mappedData.number_of_locations || null,
    employees: lead.mappedData.employees || null,
    website: lead.mappedData.website || null,
    first_name: lead.mappedData.first_name || null,
    last_name: lead.mappedData.last_name || null,
    job_title: lead.mappedData.job_title || null,
    job_start_date: lead.mappedData.job_start_date || null,
    job_function: lead.mappedData.job_function || null,
    company_hq_phone: lead.mappedData.company_hq_phone || null,
    direct_phone_number: lead.mappedData.direct_phone_number || null,
    mobile_phone: lead.mappedData.mobile_phone || null,
    email_address: lead.mappedData.email_address || null,
    linkedin_contact_profile_url: lead.mappedData.linkedin_contact_profile_url || null,
    company_street_address: lead.mappedData.company_street_address || null,
    company_city: lead.mappedData.company_city || null,
    company_state: lead.mappedData.company_state || null,
    company_zip_code: lead.mappedData.company_zip_code || null,
    annual_revenue: lead.mappedData.annual_revenue || null,
    primary_industry: lead.mappedData.primary_industry || null,
    primary_sub_industry: lead.mappedData.primary_sub_industry || null,
    linkedin_company_profile_url: lead.mappedData.linkedin_company_profile_url || null,
    facebook_company_profile_url: lead.mappedData.facebook_company_profile_url || null,
    twitter_company_profile_url: lead.mappedData.twitter_company_profile_url || null,
    status: 'new',
    extra_fields: Object.keys(lead.extraFields).length > 0 ? lead.extraFields : null,
  }));

  const { error } = await supabase.from('leads').insert(dbLeads);

  if (error) throw error;

  revalidatePath('/');
  revalidatePath(`/campaigns/${campaignId}`);
  return { count: leadsData.length };
}

export async function deleteLead(id: number) {
  const lead = await getLead(id);
  const { error } = await supabase.from('leads').delete().eq('id', id);

  if (error) throw error;

  revalidatePath('/');
  if (lead) {
    revalidatePath(`/campaigns/${lead.campaignId}`);
  }
}

function mapLeadToCamelCase(lead: Lead) {
  return {
    id: lead.id,
    campaignId: lead.campaign_id,
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
    extraFields: lead.extra_fields,
    createdAt: lead.created_at,
    updatedAt: lead.updated_at,
  };
}
