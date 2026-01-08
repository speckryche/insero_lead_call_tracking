import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getLead, getLeadActivities } from '@/lib/actions';
import { getUser } from '@/lib/auth-actions';
import { StatusSelector } from '@/components/StatusSelector';
import { ActivityForm } from '@/components/ActivityForm';
import { ActivityList } from '@/components/ActivityList';

export const dynamic = 'force-dynamic';

async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

type Params = Promise<{ id: string }>;

export default async function LeadDetailPage({ params }: { params: Params }) {
  await requireAuth();
  const { id } = await params;
  const leadId = parseInt(id, 10);

  if (isNaN(leadId)) {
    notFound();
  }

  const [lead, activities] = await Promise.all([
    getLead(leadId),
    getLeadActivities(leadId),
  ]);

  if (!lead) {
    notFound();
  }

  const statusLabels: Record<string, string> = {
    new: 'New',
    contacted: 'Contacted',
    meeting_set: 'Meeting Set',
    not_interested: 'Not Interested',
  };

  return (
    <div>
      <Link
        href="/"
        className="text-blue-600 hover:text-blue-800 font-medium mb-6 inline-block"
      >
        ← Back to Leads
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Lead details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company & Contact Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{lead.companyName}</h1>
                <p className="text-gray-600">{lead.primaryIndustry}</p>
              </div>
              <StatusSelector leadId={lead.id} currentStatus={lead.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Contact */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Contact</h3>
                <div className="space-y-2">
                  <p className="text-gray-900 font-medium">
                    {lead.firstName} {lead.lastName}
                  </p>
                  {lead.jobTitle && <p className="text-gray-600">{lead.jobTitle}</p>}
                  {lead.jobFunction && <p className="text-gray-500 text-sm">{lead.jobFunction}</p>}
                </div>
              </div>

              {/* Phone Numbers */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Phone</h3>
                <div className="space-y-2">
                  {lead.directPhoneNumber && (
                    <p>
                      <span className="text-gray-500 text-sm">Direct: </span>
                      <a href={`tel:${lead.directPhoneNumber}`} className="text-blue-600 hover:underline">
                        {lead.directPhoneNumber}
                      </a>
                    </p>
                  )}
                  {lead.mobilePhone && (
                    <p>
                      <span className="text-gray-500 text-sm">Mobile: </span>
                      <a href={`tel:${lead.mobilePhone}`} className="text-blue-600 hover:underline">
                        {lead.mobilePhone}
                      </a>
                    </p>
                  )}
                  {lead.companyHqPhone && (
                    <p>
                      <span className="text-gray-500 text-sm">HQ: </span>
                      <a href={`tel:${lead.companyHqPhone}`} className="text-blue-600 hover:underline">
                        {lead.companyHqPhone}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Email</h3>
                {lead.emailAddress && (
                  <a href={`mailto:${lead.emailAddress}`} className="text-blue-600 hover:underline">
                    {lead.emailAddress}
                  </a>
                )}
              </div>

              {/* Address */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Address</h3>
                <div className="text-gray-600">
                  {lead.companyStreetAddress && <p>{lead.companyStreetAddress}</p>}
                  <p>
                    {lead.companyCity}{lead.companyCity && lead.companyState && ', '}
                    {lead.companyState} {lead.companyZipCode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {lead.employees && (
                <div>
                  <p className="text-sm text-gray-500">Employees</p>
                  <p className="font-medium text-gray-900">{lead.employees}</p>
                </div>
              )}
              {lead.numberOfLocations && (
                <div>
                  <p className="text-sm text-gray-500">Locations</p>
                  <p className="font-medium text-gray-900">{lead.numberOfLocations}</p>
                </div>
              )}
              {lead.annualRevenue && (
                <div>
                  <p className="text-sm text-gray-500">Annual Revenue</p>
                  <p className="font-medium text-gray-900">{lead.annualRevenue}</p>
                </div>
              )}
              {lead.primarySubIndustry && (
                <div>
                  <p className="text-sm text-gray-500">Sub-Industry</p>
                  <p className="font-medium text-gray-900">{lead.primarySubIndustry}</p>
                </div>
              )}
            </div>

            {/* Links */}
            <div className="mt-6 flex flex-wrap gap-4">
              {lead.website && (
                <a
                  href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Website ↗
                </a>
              )}
              {lead.linkedinCompanyProfileUrl && (
                <a
                  href={lead.linkedinCompanyProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  LinkedIn ↗
                </a>
              )}
              {lead.linkedinContactProfileUrl && (
                <a
                  href={lead.linkedinContactProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Contact LinkedIn ↗
                </a>
              )}
              {lead.facebookCompanyProfileUrl && (
                <a
                  href={lead.facebookCompanyProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Facebook ↗
                </a>
              )}
              {lead.twitterCompanyProfileUrl && (
                <a
                  href={lead.twitterCompanyProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Twitter ↗
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Activity log */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Log Activity</h2>
            <ActivityForm leadId={lead.id} />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity History</h2>
            <ActivityList activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
}
