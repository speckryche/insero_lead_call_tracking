import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCampaigns, getCampaignStats } from '@/lib/actions';
import { getUser } from '@/lib/auth-actions';

export const dynamic = 'force-dynamic';

async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export default async function CampaignsPage() {
  await requireAuth();
  const campaigns = await getCampaigns();

  // Get stats for each campaign
  const campaignsWithStats = await Promise.all(
    campaigns.map(async (campaign) => {
      const stats = await getCampaignStats(campaign.id);
      return { ...campaign, stats };
    })
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <Link
          href="/import"
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
        >
          Import CSV
        </Link>
      </div>

      {campaignsWithStats.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h2>
          <p className="text-gray-600 mb-6">Import your first CSV to create a campaign.</p>
          <Link
            href="/import"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            Import CSV
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaignsWithStats.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/campaigns/${campaign.id}`}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{campaign.name}</h2>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{campaign.stats.total}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{campaign.stats.meetingSet}</div>
                  <div className="text-xs text-gray-500">Meetings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{campaign.stats.new}</div>
                  <div className="text-xs text-gray-500">New</div>
                </div>
              </div>

              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">
                  {campaign.stats.leftVmEmailed} Left VM
                </span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                  {campaign.stats.contacted} Contacted
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                  {campaign.stats.notInterested} Not Int.
                </span>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Created {new Date(campaign.created_at!).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
