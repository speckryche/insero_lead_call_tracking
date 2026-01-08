'use server';

import { db } from '@/db';
import { leads, activities, NewLead, NewActivity } from '@/db/schema';
import { eq, desc, ilike, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getLeads(search?: string, status?: string) {
  let query = db.select().from(leads).orderBy(desc(leads.createdAt));

  if (search) {
    const searchLower = `%${search}%`;
    return db
      .select()
      .from(leads)
      .where(
        or(
          ilike(leads.companyName, searchLower),
          ilike(leads.firstName, searchLower),
          ilike(leads.lastName, searchLower),
          ilike(leads.emailAddress, searchLower)
        )
      )
      .orderBy(desc(leads.createdAt));
  }

  if (status && status !== 'all') {
    return db
      .select()
      .from(leads)
      .where(eq(leads.status, status))
      .orderBy(desc(leads.createdAt));
  }

  return query;
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
    .orderBy(desc(activities.createdAt));
}

export async function updateLeadStatus(id: number, status: string) {
  await db
    .update(leads)
    .set({ status, updatedAt: new Date() })
    .where(eq(leads.id, id));
  revalidatePath('/');
  revalidatePath(`/leads/${id}`);
}

export async function addActivity(data: NewActivity) {
  await db.insert(activities).values(data);
  // Also update lead status to 'contacted' if it's still 'new'
  const lead = await getLead(data.leadId);
  if (lead && lead.status === 'new') {
    await updateLeadStatus(data.leadId, 'contacted');
  }
  revalidatePath(`/leads/${data.leadId}`);
}

export async function importLeads(leadsData: NewLead[]) {
  if (leadsData.length === 0) return { count: 0 };

  await db.insert(leads).values(leadsData);
  revalidatePath('/');
  return { count: leadsData.length };
}

export async function getStats() {
  const allLeads = await db.select().from(leads);

  const stats = {
    total: allLeads.length,
    new: allLeads.filter((l) => l.status === 'new').length,
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
