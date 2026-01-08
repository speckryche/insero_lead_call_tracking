import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const leads = sqliteTable('leads', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // Company info
  companyName: text('company_name').notNull(),
  numberOfLocations: text('number_of_locations'),
  employees: text('employees'),
  website: text('website'),

  // Contact info
  firstName: text('first_name'),
  lastName: text('last_name'),
  jobTitle: text('job_title'),
  jobStartDate: text('job_start_date'),
  jobFunction: text('job_function'),

  // Phone numbers
  companyHqPhone: text('company_hq_phone'),
  directPhoneNumber: text('direct_phone_number'),
  mobilePhone: text('mobile_phone'),

  // Email & social
  emailAddress: text('email_address'),
  linkedinContactProfileUrl: text('linkedin_contact_profile_url'),

  // Address
  companyStreetAddress: text('company_street_address'),
  companyCity: text('company_city'),
  companyState: text('company_state'),
  companyZipCode: text('company_zip_code'),

  // Business info
  annualRevenue: text('annual_revenue'),
  primaryIndustry: text('primary_industry'),
  primarySubIndustry: text('primary_sub_industry'),

  // Company social profiles
  linkedinCompanyProfileUrl: text('linkedin_company_profile_url'),
  facebookCompanyProfileUrl: text('facebook_company_profile_url'),
  twitterCompanyProfileUrl: text('twitter_company_profile_url'),

  // Tracking fields
  status: text('status').notNull().default('new'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

export const activities = sqliteTable('activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  leadId: integer('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),

  contactMethod: text('contact_method').notNull(),
  notes: text('notes'),

  createdAt: text('created_at'),
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
