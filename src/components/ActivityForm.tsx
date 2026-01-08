'use client';

import { useState, useTransition } from 'react';
import { addActivity } from '@/lib/actions';

interface ActivityFormProps {
  leadId: number;
}

export function ActivityForm({ leadId }: ActivityFormProps) {
  const [contactMethod, setContactMethod] = useState('call');
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!notes.trim()) return;

    startTransition(async () => {
      await addActivity({
        leadId,
        contactMethod,
        notes: notes.trim(),
      });
      setNotes('');
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contact Method
        </label>
        <div className="flex gap-2">
          {['call', 'email', 'text'].map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setContactMethod(method)}
              className={`px-4 py-2 rounded-lg font-medium text-sm capitalize ${
                contactMethod === method
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this interaction..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !notes.trim()}
        className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Saving...' : 'Log Activity'}
      </button>
    </form>
  );
}
