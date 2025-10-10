import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vuckmwqbewqyfyjzauik.supabase.co';
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Z5UDkq59juTcc-AFkLiTNw_keuXpEXY';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabasePublishableKey);

// For server-side operations that need elevated permissions
export const createServiceClient = () => {
    if (!process.env.SUPABASE_SECRET_KEY) {
        throw new Error('Missing SUPABASE_SECRET_KEY environment variable');
    }

    return createClient(supabaseUrl, process.env.SUPABASE_SECRET_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
};
