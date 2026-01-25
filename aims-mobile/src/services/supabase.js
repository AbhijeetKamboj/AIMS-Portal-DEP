import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://gmguxvyxypzoijxwcjzy.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtZ3V4dnl4eXB6b2lqeHdjanp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5OTY1NTAsImV4cCI6MjA4NDU3MjU1MH0.V1dXC3CWgO00cs_6-adfGv9yQKd0nuv4lql9fgVpDOU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});