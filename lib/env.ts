/**
 * Environment access. Public values are inlined at build time; server values
 * are read lazily so a missing secret fails loudly on the server only.
 */

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
};

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

export const serverEnv = {
  get supabaseSecretKey() {
    return required("SUPABASE_SECRET_KEY");
  },
  get adminAuthEmail() {
    return required("ADMIN_AUTH_EMAIL");
  },
  get cronSecret() {
    return required("CRON_SECRET");
  },
  get appTimeZone() {
    return process.env.APP_TIME_ZONE || "America/Vancouver";
  },
};
