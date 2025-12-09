#!/bin/sh

# Coolify deployment script
set -e

echo "🚀 Starting Coolify deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Build the application
echo "🏗️ Building application..."
npm run build

# Start the server
echo "🌟 Starting server..."
npm start