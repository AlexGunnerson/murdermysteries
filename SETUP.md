# Setup Guide for MurderMysteries.AI

## Prerequisites

1. Node.js 18 or higher
2. npm or yarn package manager
3. Git for version control

## Step 1: Clone and Install Dependencies

```bash
cd murdermysteries
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in the project details:
   - **Name**: murdermysteries-ai (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is fine for development
5. Click "Create new project" and wait for it to initialize (~2 minutes)

### 2.2 Get Your Supabase Credentials

1. In your Supabase project dashboard, click on "Settings" (gear icon in sidebar)
2. Go to "API" section
3. Copy the following values:
   - **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (click "Reveal" first) → This is your `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Important**: Keep the `service_role` key secret! Never commit it or expose it to the client.

## Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and fill in your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. Generate a NextAuth secret:
   ```bash
   openssl rand -base64 32
   ```
   Add the output to `.env.local`:
   ```bash
   NEXTAUTH_SECRET=your_generated_secret_here
   ```

## Step 4: Set Up Google OAuth (for Task 1.5)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen
6. Set the redirect URI to: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret to `.env.local`

## Step 5: Get Gemini API Key (for Task 4.2)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy it to `.env.local` as `GEMINI_API_KEY`

## Step 6: Run Database Migrations

After setting up authentication (Task 1.3), you'll run:

```bash
# Migrations will be applied through Supabase CLI or dashboard
# Instructions will be added when we reach Task 1.3
```

## Step 7: Start the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## Optional: Set Up Monitoring & Analytics

### Sentry (Error Monitoring)
1. Go to [https://sentry.io](https://sentry.io)
2. Create a new project for Next.js
3. Copy the DSN to `.env.local`

### PostHog (Analytics)
1. Go to [https://posthog.com](https://posthog.com)
2. Create an account and project
3. Copy the API key to `.env.local`

### Stripe (Payments)
1. Go to [https://stripe.com](https://stripe.com)
2. Create an account
3. Get your API keys from the Dashboard
4. Copy them to `.env.local`

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
Run `npm install` again to ensure all dependencies are installed.

### "Invalid API key" errors
Double-check that you've copied the correct keys from Supabase settings and that there are no extra spaces.

### Next.js build errors
Make sure you're using Node.js 18 or higher:
```bash
node --version
```

## Next Steps

Once setup is complete, follow the task list in `tasks/tasks-prd-murdermysteries-v1.md` to continue development.

