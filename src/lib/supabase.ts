import { createClient } from "@supabase/supabase-js"
import { Database } from "./database.types"

// Server-side Supabase client - only use in Server Components or API routes
// This uses the service role key which has full admin access
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

// Use this function in server components or API routes
export const getServerSupabase = () => {
  return createServerSupabaseClient()
}
