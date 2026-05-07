# TaskPulse AI - Railway Deployment Guide

## Quick Deploy Steps

### 1. Create Railway Account
- Go to https://railway.app
- Sign up with GitHub or Email

### 2. Install Railway CLI (optional but recommended)
```bash
npm install -g @railway/cli
```

### 3. Deploy Backend

#### Option A: Using Railway Dashboard (Web UI)

1. **Go to Railway Dashboard**
   - https://railway.app/dashboard

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your TaskPulse AI repository

3. **Add PostgreSQL Database**
   - Click "New"
   - Select "Database"
   - Choose "Add PostgreSQL"

4. **Configure Environment Variables**
   Go to your backend service → Variables tab, add:
   ```
   DATABASE_URL = ${{Postgres.DATABASE_URL}}  (auto-filled by Railway)
   OPENAI_API_KEY = your_openai_api_key_here
   SECRET_KEY = your_random_secret_key_for_jwt
   CORS_ORIGINS = *
   ```

5. **Deploy**
   - Railway will auto-detect the `railway.toml` config
   - Click "Deploy"

#### Option B: Using Railway CLI

```bash
# Login
railway login

# Initialize project
railway init

# Link to existing project (if created via dashboard)
railway link

# Deploy
railway up
```

### 4. Deploy Frontend (Static Site)

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Railway Static Sites**
   - Create new service → "Static Site"
   - Upload or connect GitHub
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variable: `VITE_API_URL=https://your-backend-url.up.railway.app`

### 5. Configure Frontend API URL

Update the API URL to point to your Railway backend:

**Option 1: Via Railway Variables (Recommended)**
- In Railway Dashboard → Frontend service → Variables
- Add: `VITE_API_URL=https://your-backend-service.up.railway.app`

**Option 2: Via config file**
Create `frontend/.env.production`:
```
VITE_API_URL=https://your-backend-url.up.railway.app
```

### 6. Get Your Backend URL

After deployment, Railway will give you a URL like:
```
https://taskpulse-api.up.railway.app
```

This is your `VITE_API_URL` for the frontend.

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes (auto-provided) |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes |
| `SECRET_KEY` | JWT secret key | Yes (generate random) |
| `CORS_ORIGINS` | Allowed origins (use `*` for development) | Yes |
| `PORT` | Port to run on (Railway sets this) | Auto |

## Health Check

Test if your deployment works:
```bash
curl https://your-backend-url.up.railway.app/api/health
```

Should return: `{"status":"ok"}`

## Troubleshooting

### Issue: Database connection errors
- Ensure PostgreSQL service is provisioned
- Check `DATABASE_URL` is correctly set
- Railway auto-provides this when you add a Postgres database

### Issue: CORS errors
- Set `CORS_ORIGINS=*` for testing
- For production, set to your frontend URL: `CORS_ORIGINS=https://your-frontend.up.railway.app`

### Issue: OpenAI not working
- Verify `OPENAI_API_KEY` is set in Railway variables
- Check the key is valid at https://platform.openai.com/api-keys

### Issue: JWT errors
- Generate a random secret key: `openssl rand -hex 32`
- Set as `SECRET_KEY` in Railway variables

## Production Checklist

- [ ] PostgreSQL database connected
- [ ] OpenAI API key configured
- [ ] JWT secret key set
- [ ] CORS origins configured
- [ ] Frontend API URL updated
- [ ] Health check passing
- [ ] Login/Sign up working
- [ ] AI Insights generating

## Useful Railway Commands

```bash
# View logs
railway logs

# View deployment status
railway status

# Open dashboard
railway open

# Redeploy
railway up
```

## Cost

Railway provides:
- **$5 free credit** per month
- PostgreSQL included in free tier (up to limits)
- Frontend static hosting is free
- AI features use your OpenAI API key (pay per use)

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
