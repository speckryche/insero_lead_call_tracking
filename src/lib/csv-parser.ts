import { NewLead } from './supabase';

// Map CSV headers to database field names (snake_case)
const headerMap: Record<string, keyof NewLead> = {
  'Company Name': 'company_name',
  'Number of Locations': 'number_of_locations',
  'Employees': 'employees',
  'Website': 'website',
  'First Name': 'first_name',
  'Last Name': 'last_name',
  'Job Title': 'job_title',
  'Job Start Date': 'job_start_date',
  'Job Function': 'job_function',
  'Company HQ Phone': 'company_hq_phone',
  'Direct Phone Number': 'direct_phone_number',
  'Mobile phone': 'mobile_phone',
  'Email Address': 'email_address',
  'LinkedIn Contact Profile URL': 'linkedin_contact_profile_url',
  'Company Street Address': 'company_street_address',
  'Company City': 'company_city',
  'Company State': 'company_state',
  'Company Zip Code': 'company_zip_code',
  'Annual Revenue': 'annual_revenue',
  'Primary Industry': 'primary_industry',
  'Primary Sub-Industry': 'primary_sub_industry',
  'LinkedIn Company Profile URL': 'linkedin_company_profile_url',
  'Facebook Company Profile URL': 'facebook_company_profile_url',
  'Twitter Company Profile URL': 'twitter_company_profile_url',
};

export function parseCSV(csvText: string): NewLead[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // Handle both comma and tab-separated values
  const delimiter = lines[0].includes('\t') ? '\t' : ',';

  const headers = parseCSVLine(lines[0], delimiter);
  const leads: NewLead[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], delimiter);
    if (values.length === 0 || values.every((v) => !v.trim())) continue;

    const lead: Partial<NewLead> = {};

    headers.forEach((header, index) => {
      const fieldName = headerMap[header.trim()];
      if (fieldName && values[index]) {
        (lead as Record<string, string>)[fieldName] = values[index].trim();
      }
    });

    // Only add if we have at least a company name
    if (lead.company_name) {
      lead.status = 'new';
      leads.push(lead as NewLead);
    }
  }

  return leads;
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}
