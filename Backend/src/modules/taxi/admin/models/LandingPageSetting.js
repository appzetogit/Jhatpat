import mongoose from 'mongoose';

/*
 * Text pages the apps and the /taxi/* static pages read: About, Careers,
 * Newsroom and the legal policies (HTML strings).
 *
 * The public website home page (hero, services, FAQs, contact, ...) is no longer
 * stored here -- it lives in TaxiWebsitePage and is edited under Taxi admin >
 * Website.
 */
const landingPageSettingSchema = new mongoose.Schema(
  {
    scope: {
      type: String,
      required: true,
      unique: true,
      default: 'default',
    },
    pages: {
      about_us: { type: String, default: '' },
      careers: { type: String, default: '' },
      newsroom: { type: String, default: '' },
      terms_conditions: { type: String, default: '' },
      privacy_policy: { type: String, default: '' },
      refund_policy: { type: String, default: '' },
      cancellation_policy: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

export const LandingPageSetting =
  mongoose.models.TaxiLandingPageSetting || mongoose.model('TaxiLandingPageSetting', landingPageSettingSchema);
