#!/bin/bash
set -e

echo "🔧 Starting deployment build..."

# Navigate to recipe-app
cd recipe-app

# Inject environment variables
echo "📝 Injecting environment variables..."
node inject-env.js

# Build Angular app
echo "🏗️ Building Angular application..."
npm run build

# Go back to root
cd ..

# Create Chefai directory (workaround for publicDir in .replit)
echo "📦 Copying files to deployment directory..."
mkdir -p Chefai
cp -r recipe-app/dist/recipe-app/browser/* Chefai/

echo "✅ Build complete! Files ready in Chefai/ directory"
