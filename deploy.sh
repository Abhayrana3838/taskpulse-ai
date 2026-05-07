#!/bin/bash

# TaskPulse AI - Railway Deployment Script

echo "🚀 TaskPulse AI - Railway Deployment Script"
echo "============================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Please login to Railway:"
railway login

# Initialize project (if not already done)
echo "🏗️ Initializing Railway project..."
railway init

# Link to existing project if needed
# railway link

# Add PostgreSQL database
echo "🗄️ Adding PostgreSQL database..."
railway add --database postgresql

# Set environment variables
echo "⚙️ Setting environment variables..."

# Get DATABASE_URL automatically from Railway
# Set other required variables
read -p "Enter your OPENAI_API_KEY: " openai_key
read -p "Enter your SECRET_KEY (or press Enter to generate): " secret_key

if [ -z "$secret_key" ]; then
    secret_key=$(openssl rand -hex 32)
    echo "Generated SECRET_KEY: $secret_key"
fi

# Set variables in Railway
railway variables set OPENAI_API_KEY="$openai_key"
railway variables set SECRET_KEY="$secret_key"
railway variables set CORS_ORIGINS="*"

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "📊 View logs: railway logs"
echo "🌐 Open dashboard: railway open"
