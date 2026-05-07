import { createClient } from '@supabase/supabase-js';

// @ts-ignore
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    // Add protocol if missing
    if (!supabaseUrl.startsWith('http')) {
      // If it's just a project ID without dots, append .supabase.co
      if (!supabaseUrl.includes('.')) {
        supabaseUrl = `https://${supabaseUrl}.supabase.co`;
      } else {
        supabaseUrl = `https://${supabaseUrl}`;
      }
    }
    
    // Sanitize the URL in case the user accidentally copied the /rest/v1/ path
    const url = new URL(supabaseUrl);
    supabaseUrl = `${url.protocol}//${url.host}`;
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("Failed to initialize Supabase client. Please check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY", error);
  }
}

export const supabase = supabaseClient;
