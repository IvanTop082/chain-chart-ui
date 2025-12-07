import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Check if Supabase is configured
  if (!supabaseUrl || !supabaseKey) {
    const errorMsg = 'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.';
    console.error('❌', errorMsg);
    console.error('   File location: ChainChart_new ui/.env.local');
    throw new Error(errorMsg);
  }
  
  if (!supabaseUrl.startsWith('http')) {
    const errorMsg = `Invalid Supabase URL: ${supabaseUrl}. It should start with https://`;
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }
  
  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch (e) {
    const errorMsg = `Invalid Supabase URL format: ${supabaseUrl}`;
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }
  
  console.log('✅ Supabase client initialized:', supabaseUrl);
  
  return createBrowserClient(supabaseUrl, supabaseKey);
}


