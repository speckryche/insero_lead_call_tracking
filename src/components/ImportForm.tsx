'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { importLeads, createCampaign, getCampaigns } from '@/lib/actions';
import { Campaign } from '@/lib/supabase';

// Available fields that can be mapped
const AVAILABLE_FIELDS = [
  { key: 'company_name', label: 'Company Name', required: true },
  { key: 'first_name', label: 'First Name', required: true },
  { key: 'last_name', label: 'Last Name', required: false },
  { key: 'email_address', label: 'Email Address', required: false },
  { key: 'direct_phone_number', label: 'Direct Phone', required: false },
  { key: 'mobile_phone', label: 'Mobile Phone', required: false },
  { key: 'company_hq_phone', label: 'Company HQ Phone', required: false },
  { key: 'job_title', label: 'Job Title', required: false },
  { key: 'job_function', label: 'Job Function', required: false },
  { key: 'job_start_date', label: 'Job Start Date', required: false },
  { key: 'website', label: 'Website', required: false },
  { key: 'company_street_address', label: 'Street Address', required: false },
  { key: 'company_city', label: 'City', required: false },
  { key: 'company_state', label: 'State', required: false },
  { key: 'company_zip_code', label: 'Zip Code', required: false },
  { key: 'employees', label: 'Employees', required: false },
  { key: 'number_of_locations', label: 'Number of Locations', required: false },
  { key: 'annual_revenue', label: 'Annual Revenue', required: false },
  { key: 'primary_industry', label: 'Primary Industry', required: false },
  { key: 'primary_sub_industry', label: 'Primary Sub-Industry', required: false },
  { key: 'linkedin_contact_profile_url', label: 'LinkedIn Contact URL', required: false },
  { key: 'linkedin_company_profile_url', label: 'LinkedIn Company URL', required: false },
  { key: 'facebook_company_profile_url', label: 'Facebook URL', required: false },
  { key: 'twitter_company_profile_url', label: 'Twitter URL', required: false },
];

type Step = 'campaign' | 'upload' | 'mapping' | 'importing';

interface ParsedRow {
  [key: string]: string;
}

export function ImportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCampaignId = searchParams.get('campaign');

  const [step, setStep] = useState<Step>('campaign');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignMode, setCampaignMode] = useState<'new' | 'existing'>('new');
  const [newCampaignName, setNewCampaignName] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(
    preselectedCampaignId ? parseInt(preselectedCampaignId, 10) : null
  );
  const [csvText, setCsvText] = useState('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<ParsedRow[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    if (preselectedCampaignId) {
      setCampaignMode('existing');
      setSelectedCampaignId(parseInt(preselectedCampaignId, 10));
    }
  }, [preselectedCampaignId]);

  async function loadCampaigns() {
    const data = await getCampaigns();
    setCampaigns(data);
  }

  function parseCSVText(text: string) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return { headers: [], rows: [] };

    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    const headers = parseCSVLine(lines[0], delimiter);
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i], delimiter);
      if (values.length === 0 || values.every((v) => !v.trim())) continue;

      const row: ParsedRow = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.trim() || '';
      });
      rows.push(row);
    }

    return { headers: headers.map((h) => h.trim()), rows };
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

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      const { headers, rows } = parseCSVText(text);
      setCsvHeaders(headers);
      setCsvRows(rows);
      setError('');
    };
    reader.readAsText(file);
  }

  function handleCampaignNext() {
    if (campaignMode === 'new' && !newCampaignName.trim()) {
      setError('Please enter a campaign name');
      return;
    }
    if (campaignMode === 'existing' && !selectedCampaignId) {
      setError('Please select a campaign');
      return;
    }
    setError('');
    setStep('upload');
  }

  function handleUploadNext() {
    if (csvRows.length === 0) {
      setError('Please upload a CSV file with data');
      return;
    }
    setError('');

    // Auto-map fields with matching names
    const autoMapping: Record<string, string> = {};
    csvHeaders.forEach((header) => {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const matchingField = AVAILABLE_FIELDS.find((f) => {
        const normalizedField = f.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
        return normalizedHeader === normalizedField || normalizedHeader.includes(normalizedField) || normalizedField.includes(normalizedHeader);
      });
      if (matchingField) {
        autoMapping[header] = matchingField.key;
      }
    });
    setFieldMapping(autoMapping);

    setStep('mapping');
  }

  function handleMappingChange(csvHeader: string, fieldKey: string) {
    setFieldMapping((prev) => {
      const newMapping = { ...prev };
      if (fieldKey === '') {
        delete newMapping[csvHeader];
      } else {
        newMapping[csvHeader] = fieldKey;
      }
      return newMapping;
    });
  }

  function validateMapping(): boolean {
    const requiredFields = AVAILABLE_FIELDS.filter((f) => f.required).map((f) => f.key);
    const mappedFields = Object.values(fieldMapping);

    // Check company_name is mapped
    if (!mappedFields.includes('company_name')) {
      setError('Company Name must be mapped');
      return false;
    }

    // Check at least first_name or last_name is mapped
    if (!mappedFields.includes('first_name') && !mappedFields.includes('last_name')) {
      setError('At least First Name or Last Name must be mapped');
      return false;
    }

    // Check at least one contact method (phone or email)
    const hasContact = mappedFields.includes('email_address') ||
      mappedFields.includes('direct_phone_number') ||
      mappedFields.includes('mobile_phone') ||
      mappedFields.includes('company_hq_phone');

    if (!hasContact) {
      setError('At least one phone number or email must be mapped');
      return false;
    }

    return true;
  }

  async function handleImport() {
    if (!validateMapping()) return;

    setIsLoading(true);
    setError('');
    setStep('importing');

    try {
      // Create campaign if needed
      let campaignId = selectedCampaignId;
      if (campaignMode === 'new') {
        const campaign = await createCampaign(newCampaignName.trim());
        campaignId = campaign.id;
      }

      if (!campaignId) {
        throw new Error('No campaign selected');
      }

      // Transform data using mapping
      const leadsData = csvRows.map((row) => {
        const mappedData: Record<string, string> = {};
        const extraFields: Record<string, string> = {};

        Object.entries(row).forEach(([csvHeader, value]) => {
          const mappedField = fieldMapping[csvHeader];
          if (mappedField) {
            mappedData[mappedField] = value;
          } else if (value) {
            extraFields[csvHeader] = value;
          }
        });

        return { campaignId: campaignId!, mappedData, extraFields };
      });

      const result = await importLeads(campaignId, leadsData);
      router.push(`/campaigns/${campaignId}?imported=${result.count}`);
    } catch (err) {
      setError('Error importing leads. Please try again.');
      setStep('mapping');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Import Leads from CSV</h1>

      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        {['Campaign', 'Upload', 'Map Fields', 'Import'].map((label, i) => {
          const stepIndex = ['campaign', 'upload', 'mapping', 'importing'].indexOf(step);
          const isActive = i <= stepIndex;
          const isCurrent = i === stepIndex;
          return (
            <div key={label} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                } ${isCurrent ? 'ring-2 ring-blue-600 ring-offset-2' : ''}`}
              >
                {i + 1}
              </div>
              <span className={`ml-2 text-sm ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                {label}
              </span>
              {i < 3 && <div className={`w-12 h-0.5 mx-2 ${isActive ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Step 1: Campaign Selection */}
      {step === 'campaign' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select or Create Campaign</h2>

          <div className="space-y-4">
            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                checked={campaignMode === 'new'}
                onChange={() => setCampaignMode('new')}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">Create New Campaign</div>
                <div className="text-sm text-gray-500">Start a new campaign for this CSV</div>
              </div>
            </label>

            {campaignMode === 'new' && (
              <div className="ml-8">
                <input
                  type="text"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="Campaign name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {campaigns.length > 0 && (
              <>
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    checked={campaignMode === 'existing'}
                    onChange={() => setCampaignMode('existing')}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Add to Existing Campaign</div>
                    <div className="text-sm text-gray-500">Add leads to an existing campaign</div>
                  </div>
                </label>

                {campaignMode === 'existing' && (
                  <div className="ml-8">
                    <select
                      value={selectedCampaignId || ''}
                      onChange={(e) => setSelectedCampaignId(parseInt(e.target.value, 10))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a campaign</option>
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleCampaignNext}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Upload CSV */}
      {step === 'upload' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h2>

          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer mb-4"
          />

          {csvRows.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                Found {csvRows.length} rows with {csvHeaders.length} columns
              </p>
              <p className="text-green-600 text-sm mt-1">
                Columns: {csvHeaders.slice(0, 5).join(', ')}
                {csvHeaders.length > 5 && ` and ${csvHeaders.length - 5} more...`}
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep('campaign')}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleUploadNext}
              disabled={csvRows.length === 0}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Field Mapping */}
      {step === 'mapping' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Map CSV Columns to Fields</h2>
          <p className="text-gray-600 text-sm mb-4">
            Match your CSV columns to the corresponding fields. Required fields are marked with *.
          </p>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {csvHeaders.map((header) => (
              <div key={header} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-1/2">
                  <span className="font-medium text-gray-900">{header}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    (e.g., {csvRows[0]?.[header]?.substring(0, 30) || 'empty'})
                  </span>
                </div>
                <div className="w-1/2">
                  <select
                    value={fieldMapping[header] || ''}
                    onChange={(e) => handleMappingChange(header, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Don&apos;t import --</option>
                    {AVAILABLE_FIELDS.map((field) => (
                      <option key={field.key} value={field.key}>
                        {field.label} {field.required ? '*' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Required:</strong> Company Name, First Name or Last Name, and at least one Phone or Email.
              Unmapped columns will be saved as additional information.
            </p>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep('upload')}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleImport}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              Import {csvRows.length} Leads
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Importing */}
      {step === 'importing' && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900">Importing leads...</h2>
          <p className="text-gray-600 mt-2">Please wait while we import your data.</p>
        </div>
      )}
    </div>
  );
}
