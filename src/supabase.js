import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://piwhywvpiwxwsjjxzwjm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpd2h5d3ZwaXd4d3Nqanh6d2ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjUyMzAsImV4cCI6MjA5NDI0MTIzMH0.nyL4TY6Mehdh_Tc7qj16iDuuBUnmSld7-APl43-Xzn8';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});