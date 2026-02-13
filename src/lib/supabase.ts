
import 'react-native-url-polyfill/auto';
import { createClient,SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zcqguwshcnmowggjfcys.supabase.co'.trim(); 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcWd1d3NoY25tb3dnZ2pmY3lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MzQ3MDUsImV4cCI6MjA4NjIxMDcwNX0.bqTwO7GuyM9B2hKDs0u0C3Q-HzALseymGvmdIZTYMmI'.trim();


const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);


export const supabase = supabaseClient;


export const supabaseAuth = supabaseClient.auth;




