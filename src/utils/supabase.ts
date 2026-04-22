import { createClient, SupabaseClient } from '@supabase/supabase-js';
 
// Supabase configuration
// Note: The anon key is a public/publishable key and safe to include in client-side code
const supabaseUrl = 'https://edfzwtmwmisbckgekief.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZnp3dG13bWlzYmNrZ2VraWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjY1MDAsImV4cCI6MjA4NTgwMjUwMH0.Ddi5gLFmQ78yv7sR41gQxBfjQf0x3Lxe6frsTgutGVk';

// Create the Supabase client
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);