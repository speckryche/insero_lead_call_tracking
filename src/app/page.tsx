import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getLeads, getStats } from '@/lib/actions';
import { LeadFilters } from '@/components/LeadFilters';
import { getUser } from '@/lib/auth-actions';

export const dynamic = 'force-dynamic';

async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

type SearchParams = Promise<{ search?: string; status?: string; sort?: string }>;

export default async function Dashboard({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAuth();
  const params = await searchParams;
  const search = params.search || '';
  const status = params.status || 'all';
  const sort = params.sort || 'default';

  const [leads, stats] = await Promise.all([getLeads(search, status, sort), getStats()]);

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    left_vm_emailed: 'bg-orange-100 text-orange-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    meeting_set: 'bg-green-100 text-green-800',
    not_interested: 'bg-gray-100 text-gray-800',
  };

  const statusLabels: Record<string, string> = {
    new: 'New',
    left_vm_emailed: 'Left VM / Emailed',
    contacted: 'Contacted',
    meeting_set: 'Meeting Set',
    not_interested: 'Not Interested',
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Leads</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          <div className="text-sm text-gray-500">New</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.leftVmEmailed}</div>
          <div className="text-sm text-gray-500">Left VM / Emailed</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.contacted}</div>
          <div className="text-sm text-gray-500">Contacted</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{stats.meetingSet}</div>
          <div className="text-sm text-gray-500">Meeting Set</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-600">{stats.notInterested}</div>
          <div className="text-sm text-gray-500">Not Interested</div>
        </div>
      </div>

      <LeadFilters currentSearch={search} currentStatus={status} currentSort={sort} />

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden overflow-x-auto">
        {leads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-4">No leads found.</p>
            <Link href="/import" className="text-blue-600 hover:text-blue-800 font-medium">
              Import your first CSV →
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loc</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{lead.companyName}</div>
                    <div className="text-xs text-gray-500">{lead.primaryIndustry}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{lead.firstName} {lead.lastName}</div>
                    <div className="text-xs text-gray-500">{lead.jobTitle}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{lead.companyCity}</div>
                    <div className="text-xs text-gray-500">{lead.companyState}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-900">{lead.employees || '-'}</td>
                  <td className="px-4 py-3 text-gray-900">{lead.numberOfLocations || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[lead.status] || statusColors.new}`}>
                      {statusLabels[lead.status] || lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/leads/${lead.id}`} className="text-blue-600 hover:text-blue-800 font-medium">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
