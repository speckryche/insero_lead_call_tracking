'use client';

import { useState, useTransition } from 'react';
import { updateLeadStatus } from '@/lib/actions';

interface StatusSelectorProps {
  leadId: number;
  currentStatus: string;
}

const statuses = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'left_vm_emailed', label: 'Left VM / Emailed', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'meeting_set', label: 'Meeting Set', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'not_interested', label: 'Not Interested', color: 'bg-gray-100 text-gray-800 border-gray-300' },
];

export function StatusSelector({ leadId, currentStatus }: StatusSelectorProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    startTransition(async () => {
      await updateLeadStatus(leadId, newStatus);
    });
  };

  const currentStatusInfo = statuses.find((s) => s.value === status) || statuses[0];

  return (
    <div className="relative">
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isPending}
        className={`appearance-none px-4 py-2 pr-8 rounded-full font-semibold text-sm border cursor-pointer ${currentStatusInfo.color} ${isPending ? 'opacity-50' : ''}`}
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
