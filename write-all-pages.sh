#!/bin/bash
# Generate all static pages

echo "$(date): Generating static pages..."
cd ~/empire-sites || exit 1

# Run page generator if it exists
if [ -f "generate-pages.js" ]; then
    node generate-pages.js 2>&1
elif [ -f "build.js" ]; then
    node build.js 2>&1
else
    echo "$(date): No page generator found - checking npm scripts"
    npm run generate 2>&1 || echo "No generate script"
fi

echo "$(date): Page generation complete"
