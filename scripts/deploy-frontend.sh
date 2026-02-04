#!/usr/bin/env bash
set -e

### CONFIG ###
BUCKET_NAME="deployment-tool-frontend-dev"
CLOUDFRONT_DISTRIBUTION_ID="E9CTHMV1VAAXA"

export NODE_ENV=production
export NEXT_PUBLIC_API_URL="https://api.deployment-tool.pl"

echo "Deploying frontend..."

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm use v25.0.0

cd frontend

echo "Cleaning old build..."
rm -rf .next out

echo "Building frontend (production)..."
NODE_ENV=production npm run build

echo "🔍 Checking for localhost references..."
if grep -R "localhost:8000" out/; then
  echo "ERROR: localhost found in production build"
  exit 1
fi

echo "Uploading to S3..."
aws s3 sync out/ s3://$BUCKET_NAME --delete

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"

echo "Frontend deployed successfully!"