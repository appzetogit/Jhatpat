import mongoose from 'mongoose';

/*
 * The public website home page (jhatpattaxi.com "/"), managed from
 * Taxi admin > Website. One document holds every section; the admin edits
 * `content`, the site renders it. Sections are switchable via `sections`.
 *
 * `content` is deliberately free-form (Mixed): the shape is owned by
 * websiteDefaults.js and the admin editor, so adding a field needs no migration.
 *
 * This is separate from TaxiLandingPageSetting, which still owns the About /
 * Careers / Newsroom / legal text the apps and /taxi/* pages read.
 */
const websitePageSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'home' },
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
    published: { type: Boolean, default: true },
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true, minimize: false, collection: 'taxi_website_pages' },
);

export const WebsitePage =
  mongoose.models.TaxiWebsitePage || mongoose.model('TaxiWebsitePage', websitePageSchema);
