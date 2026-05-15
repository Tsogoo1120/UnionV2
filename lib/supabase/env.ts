/**
 * Env var accessors with friendly error messages.
 * Throw at call site instead of crashing on import — easier to diagnose
 * when running locally without a .env.local.
 */

export const supabaseUrl = (): string => {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) {
    throw new Error(
      `Missing environment variable: NEXT_PUBLIC_SUPABASE_URL\n` +
        `Copy .env.example to .env.local and fill in your Supabase credentials.`,
    );
  }
  return value;
};

export const supabaseAnonKey = (): string => {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) {
    throw new Error(
      `Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY\n` +
        `Copy .env.example to .env.local and fill in your Supabase credentials.`,
    );
  }
  return value;
};
