'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseCSV } from '@/lib/csv-parser';
import { importLeads } from '@/lib/actions';

export function ImportForm() {
  const router = useRouter();
  const [csvText, setCsvText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<{ company_name: string; first_name?: string | null; last_name?: string | null }[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      previewData(text);
    };
    reader.readAsText(file);
  };

  const previewData = (text: string) => {
    setError('');
    try {
      const leads = parseCSV(text);
      if (leads.length === 0) {
        setError('No valid leads found in CSV. Make sure your headers match the expected format.');
        setPreview([]);
        return;
      }
      setPreview(leads.slice(0, 5).map((l) => ({
        company_name: l.company_name,
        first_name: l.first_name,
        last_name: l.last_name,
      })));
    } catch {
      setError('Error parsing CSV. Please check the format.');
      setPreview([]);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCsvText(text);
    if (text.trim()) {
      previewData(text);
    } else {
      setPreview([]);
    }
  };

  const handleImport = async () => {
    if (!csvText.trim()) {
      setError('Please paste or upload CSV data first.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const leads = parseCSV(csvText);
      if (leads.length === 0) {
        setError('No valid leads found in CSV.');
        setIsLoading(false);
        return;
      }
      const result = await importLeads(leads);
      router.push(`/?imported=${result.count}`);
    } catch {
      setError('Error importing leads. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Import Leads from CSV</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Expected CSV Format</h2>
        <p className="text-gray-600 mb-4">Your CSV should have these column headers (tab or comma separated):</p>
        <div className="bg-gray-50 rounded p-4 text-sm font-mono text-gray-700 overflow-x-auto">
          Company Name, Number of Locations, Employees, Website, First Name, Last Name, Job Title, Job Start Date, Job Function, Company HQ Phone, Direct Phone Number, Mobile phone, Email Address, LinkedIn Contact Profile URL, Company Street Address, Company City, Company State, Company Zip Code, Annual Revenue, Primary Industry, Primary Sub-Industry, LinkedIn Company Profile URL, Facebook Company Profile URL, Twitter Company Profile URL
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h2>
        <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Or Paste CSV Data</h2>
        <textarea value={csvText} onChange={handleTextChange} placeholder="Paste your CSV data here..." rows={10} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm" />
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}
      {preview.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview (first {preview.length} leads)</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {preview.map((lead, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 text-gray-900">{lead.company_name}</td>
                  <td className="px-4 py-2 text-gray-600">{lead.first_name} {lead.last_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button onClick={handleImport} disabled={isLoading || !csvText.trim()} className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
        {isLoading ? 'Importing...' : 'Import Leads'}
      </button>
    </div>
  );
}
