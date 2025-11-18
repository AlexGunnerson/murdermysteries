# Deployment Guide for MurderMysteries.AI

This guide will walk you through deploying the MurderMysteries.AI application to Vercel.

## Prerequisites

1. A Vercel account ([sign up at vercel.com](https://vercel.com))
2. Completed Supabase setup (see `SETUP.md`)
3. All required environment variables configured
4. Google OAuth credentials (if using Google sign-in)
5. Gemini API key

## Step 1: Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

## Step 2: Connect Your Repository

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository (GitHub, GitLab, or Bitbucket)
4. Select the `murdermysteries` repository
5. Vercel will auto-detect Next.js and configure build settings

### Option B: Deploy via CLI

```bash
cd murdermysteries
vercel
```

Follow the prompts to link your project.

## Step 3: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

### Required Variables

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXTAUTH_URL` | Your production URL (e.g., `https://murdermysteries.ai`) | Production, Preview |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Production, Preview |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | All |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Production, Preview, Development |
| `GEMINI_API_KEY` | Google Gemini API key | All |

### Optional Variables (Add Later)

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry project DSN | Production, Preview |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog API key | Production, Preview |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host URL | All |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | All |
| `STRIPE_SECRET_KEY` | Stripe secret key | Production, Preview |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Production, Preview |

## Step 4: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth 2.0 Client
3. Add your Vercel deployment URLs to **Authorized redirect URIs**:
   - `https://your-project.vercel.app/api/auth/callback/google`
   - `https://murdermysteries.ai/api/auth/callback/google` (if using custom domain)

## Step 5: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain (e.g., `murdermysteries.ai`)
3. Follow Vercel's instructions to configure DNS:
   - Add A record or CNAME to your domain registrar
   - Wait for DNS propagation (can take up to 48 hours)
4. Vercel automatically provisions SSL certificates

## Step 6: Apply Database Migrations

After your first deployment, apply the database migrations:

1. Follow instructions in `supabase/README.md`
2. Use Supabase Dashboard SQL Editor or CLI
3. Apply migrations in order: `001`, `002`, `003`

## Step 7: Deploy

### Via Dashboard
- Click **Deploy** after configuring everything
- Vercel will build and deploy automatically

### Via CLI
```bash
vercel --prod
```

## Step 8: Verify Deployment

1. Visit your deployed URL
2. Test authentication:
   - Sign up with email/password
   - Sign in with Google
   - Test password reset
3. Check that protected routes redirect properly
4. Verify environment variables are working

## Continuous Deployment

Once connected, Vercel will automatically deploy:
- **Production**: When you push to `main` branch
- **Preview**: For every pull request

## Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Ensure all environment variables are set
3. Test build locally: `npm run build`

### Authentication Errors

1. Verify `NEXTAUTH_URL` matches your deployment URL
2. Check `NEXTAUTH_SECRET` is set
3. Confirm Google OAuth redirect URIs are correct

### Database Connection Issues

1. Verify Supabase environment variables
2. Check Supabase project is not paused
3. Ensure migrations are applied

### API Routes Return 500

1. Check Vercel function logs
2. Verify service role keys are correct
3. Ensure Gemini API key is valid

## Rollback

If you need to rollback to a previous deployment:

1. Go to Vercel dashboard → **Deployments**
2. Find the working deployment
3. Click **⋯** → **Promote to Production**

## Monitoring

After deployment, monitor:
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking (once configured)
- **PostHog**: User analytics (once configured)
- **Supabase Dashboard**: Database performance and logs

## Performance Optimization

For production, consider:
1. Enable Vercel Analytics
2. Configure caching headers
3. Optimize images with Next.js Image component
4. Enable compression
5. Monitor Core Web Vitals

## Security Checklist

Before going live:
- [ ] All environment variables are secure (no keys in code)
- [ ] Rate limiting configured for API routes
- [ ] CORS properly configured
- [ ] RLS policies tested in Supabase
- [ ] Authentication flows tested
- [ ] Protected routes verified
- [ ] SSL certificate active
- [ ] Domain security headers configured

## Cost Estimation

### Vercel
- **Free Tier**: Hobby projects (personal use)
- **Pro Tier**: $20/month (recommended for production)

### Supabase
- **Free Tier**: Up to 500MB database, 2GB file storage
- **Pro Tier**: $25/month (recommended for production)

### External Services
- **Gemini API**: Pay per token (varies by usage)
- **Sentry**: Free for small projects, paid plans start at $26/month
- **PostHog**: Free for up to 1M events/month

## Next Steps

1. Set up monitoring and analytics (Tasks 1.9, 1.10)
2. Populate first case content (Task 8)
3. Test complete game flow
4. Prepare for launch 🚀

