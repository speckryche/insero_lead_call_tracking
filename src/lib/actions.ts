'use server';

import { db, leads, activities, NewLead, NewActivity } from '@/db';
import { eq, desc, asc, like, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getLeads(search?: string, status?: string, sort?: string) {
  // Determine sort column and direction
  const getSortOrder = () => {
    switch (sort) {
      case 'employees_asc':
        return asc(leads.employees);
      case 'employees_desc':
        return desc(leads.employees);
      case 'locations_asc':
        return asc(leads.numberOfLocations);
      case 'locations_desc':
        return desc(leads.numberOfLocations);
      case 'city_asc':
        return asc(leads.companyCity);
      case 'city_desc':
        return desc(leads.companyCity);
      default:
        return desc(leads.id);
    }
  };

  const sortOrder = getSortOrder();

  if (search) {
    const searchPattern = `%${search.toLowerCase()}%`;
    return db
      .select()
      .from(leads)
      .where(
        or(
          like(leads.companyName, searchPattern),
          like(leads.firstName, searchPattern),
          like(leads.lastName, searchPattern),
          like(leads.emailAddress, searchPattern)
        )
      )
      .orderBy(sortOrder);
  }

  if (status && status !== 'all') {
    return db
      .select()
      .from(leads)
      .where(eq(leads.status, status))
      .orderBy(sortOrder);
  }

  return db.select().from(leads).orderBy(sortOrder);
}

export async function getLead(id: number) {
  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result[0] || null;
}

export async function getLeadActivities(leadId: number) {
  return db
    .select()
    .from(activities)
    .where(eq(activities.leadId, leadId))
    .orderBy(desc(activities.id));
}

export async function updateLeadStatus(id: number, status: string) {
  await db
    .update(leads)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(leads.id, id));
  revalidatePath('/');
  revalidatePath(`/leads/${id}`);
}

export async function addActivity(data: NewActivity) {
  await db.insert(activities).values({
    ...data,
    createdAt: new Date().toISOString(),
  });
  // Also update lead status to 'contacted' if it's still 'new'
  const lead = await getLead(data.leadId);
  if (lead && lead.status === 'new') {
    await updateLeadStatus(data.leadId, 'contacted');
  }
  revalidatePath(`/leads/${data.leadId}`);
}

export async function importLeads(leadsData: NewLead[]) {
  if (leadsData.length === 0) return { count: 0 };

  const now = new Date().toISOString();
  const leadsWithTimestamps = leadsData.map((lead) => ({
    ...lead,
    createdAt: now,
    updatedAt: now,
  }));

  await db.insert(leads).values(leadsWithTimestamps);
  revalidatePath('/');
  return { count: leadsData.length };
}

export async function getStats() {
  const allLeads = await db.select().from(leads);

  const stats = {
    total: allLeads.length,
    new: allLeads.filter((l) => l.status === 'new').length,
    leftVmEmailed: allLeads.filter((l) => l.status === 'left_vm_emailed').length,
    contacted: allLeads.filter((l) => l.status === 'contacted').length,
    meetingSet: allLeads.filter((l) => l.status === 'meeting_set').length,
    notInterested: allLeads.filter((l) => l.status === 'not_interested').length,
  };

  return stats;
}

export async function deleteLead(id: number) {
  await db.delete(leads).where(eq(leads.id, id));
  revalidatePath('/');
}
