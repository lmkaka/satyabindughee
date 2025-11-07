import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cjswvivzbdpdrqbyfwux.supabase.co'; // Get from Supabase dashboard
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqc3d2aXZ6YmRwZHJxYnlmd3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTEwMzcsImV4cCI6MjA3ODAyNzAzN30.bVPynaJd35zoig1ZeIjm-K4y-8KLj7tJzOQGyMZOFcM'; // Get from Supabase dashboard

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
