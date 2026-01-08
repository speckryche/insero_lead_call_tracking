'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

interface LeadFiltersProps {
  currentSearch: string;
  currentStatus: string;
  currentSort: string;
}

export function LeadFilters({ currentSearch, currentStatus, currentSort }: LeadFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch);

  const updateFilters = (newSearch?: string, newStatus?: string, newSort?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newSearch !== undefined) {
      if (newSearch) {
        params.set('search', newSearch);
      } else {
        params.delete('search');
      }
    }

    if (newStatus !== undefined) {
      if (newStatus && newStatus !== 'all') {
        params.set('status', newStatus);
      } else {
        params.delete('status');
      }
    }

    if (newSort !== undefined) {
      if (newSort && newSort !== 'default') {
        params.set('sort', newSort);
      } else {
        params.delete('sort');
      }
    }

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(search);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <form onSubmit={handleSearchSubmit} className="flex-1">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by company, name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            Search
          </button>
          {currentSearch && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                updateFilters('');
              }}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      <select
        value={currentStatus}
        onChange={(e) => updateFilters(undefined, e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
      >
        <option value="all">All Statuses</option>
        <option value="new">New</option>
        <option value="left_vm_emailed">Left VM / Emailed</option>
        <option value="contacted">Contacted</option>
        <option value="meeting_set">Meeting Set</option>
        <option value="not_interested">Not Interested</option>
      </select>

      <select
        value={currentSort}
        onChange={(e) => updateFilters(undefined, undefined, e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
      >
        <option value="default">Sort By</option>
        <option value="employees_desc">Employees (High-Low)</option>
        <option value="employees_asc">Employees (Low-High)</option>
        <option value="locations_desc">Locations (High-Low)</option>
        <option value="locations_asc">Locations (Low-High)</option>
        <option value="city_asc">City (A-Z)</option>
        <option value="city_desc">City (Z-A)</option>
      </select>
    </div>
  );
}
