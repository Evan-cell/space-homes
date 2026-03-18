import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// For client-side / regular RLS-bound requests
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For server-side / admin requests bypassing RLS
export const getSupabaseAdmin = () => {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseServiceKey) {
        console.warn("SUPABASE_SERVICE_ROLE_KEY is missing! Using anon key instead. Some admin features (like dashboard stats) may fail RLS.");
        return createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            }
        });
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        }
    });
};
