import { NewLead } from '@/db';

// Map CSV headers to database field names
const headerMap: Record<string, keyof NewLead> = {
  'Company Name': 'companyName',
  'Number of Locations': 'numberOfLocations',
  'Employees': 'employees',
  'Website': 'website',
  'First Name': 'firstName',
  'Last Name': 'lastName',
  'Job Title': 'jobTitle',
  'Job Start Date': 'jobStartDate',
  'Job Function': 'jobFunction',
  'Company HQ Phone': 'companyHqPhone',
  'Direct Phone Number': 'directPhoneNumber',
  'Mobile phone': 'mobilePhone',
  'Email Address': 'emailAddress',
  'LinkedIn Contact Profile URL': 'linkedinContactProfileUrl',
  'Company Street Address': 'companyStreetAddress',
  'Company City': 'companyCity',
  'Company State': 'companyState',
  'Company Zip Code': 'companyZipCode',
  'Annual Revenue': 'annualRevenue',
  'Primary Industry': 'primaryIndustry',
  'Primary Sub-Industry': 'primarySubIndustry',
  'LinkedIn Company Profile URL': 'linkedinCompanyProfileUrl',
  'Facebook Company Profile URL': 'facebookCompanyProfileUrl',
  'Twitter Company Profile URL': 'twitterCompanyProfileUrl',
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
    if (lead.companyName) {
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
