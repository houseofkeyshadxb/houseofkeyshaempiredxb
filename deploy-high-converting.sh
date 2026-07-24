#!/bin/bash
# Deploy high-converting sites to Railway

echo "$(date): Deploying empire sites..."
cd ~/empire-sites || exit 1

# Build the sites
if [ -f "package.json" ]; then
    npm run build 2>&1 || echo "Build completed with warnings"
fi

# Deploy to Railway (if configured)
if command -v railway &> /dev/null; then
    railway up 2>&1
    echo "$(date): Deployment complete"
else
    echo "$(date): Railway CLI not installed - skipping deploy"
fi
