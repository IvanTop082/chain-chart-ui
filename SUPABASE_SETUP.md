# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details and wait for it to be created

## Step 2: Get Your API Keys

1. Go to your project settings (gear icon)
2. Navigate to "API" section
3. Copy:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## Step 3: Set Environment Variables

1. Create a `.env.local` file in the `chainchart` directory
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to "SQL Editor"
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL script
4. This will create:
   - `user_profiles` table (tracks tutorial completion)
   - `projects` table (stores your contracts)
   - Row Level Security (RLS) policies
   - Indexes for performance

## Step 5: Verify Setup

1. Start your development server: `npm run dev`
2. Try signing up a new account
3. You should be redirected to the tutorial
4. After completing the tutorial, you can create and save projects

## Features Enabled

✅ User authentication (signup/login)
✅ Tutorial flow for new users
✅ Projects stored in Supabase database
✅ Automatic project syncing
✅ User-specific project access (RLS)

## Troubleshooting

- **"Invalid API key"**: Check your `.env.local` file has the correct keys
- **"Table doesn't exist"**: Make sure you ran the SQL schema script
- **"Permission denied"**: Check that RLS policies were created correctly


