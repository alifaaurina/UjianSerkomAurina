import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lbalqunwxodkpkgcwmkp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiYWxxdW53eG9ka3BrZ2N3bWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MDgzMjUsImV4cCI6MjEwNDE4NDMyNX0.6L-czMTWnxDCsiPN5rY3Qz3YoQ7IlLpIr8PW4BrPAvk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
