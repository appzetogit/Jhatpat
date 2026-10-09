#!/bin/bash
# Deploys ONLY jhatpat (food + taxi). Every other project on this box is left alone.
#
#   repo     /root/jhatpat            pm2 apps  jhatpat-backend (port 5040), jhatpat-workers
#   webroot  /var/www/jhatpattaxi     uploads   /var/www/jhatpat-uploads (isolated)
#
# Run from anywhere: bash /root/jhatpat/deploy.sh
set -e

REPO=/root/jhatpat
BRANCH=main
WEBROOT=/var/www/jhatpattaxi
APP=jhatpat-backend
WORKER_APP=jhatpat-workers

echo "==> Pulling $BRANCH"
cd "$REPO"
git fetch --quiet origin "$BRANCH"
git checkout --quiet "$BRANCH"
git pull --quiet origin "$BRANCH"
echo "    at $(git rev-parse --short HEAD)"

echo "==> Building frontend"
cd "$REPO/Frontend"
npm install --silent
npm run build

echo "==> Publishing frontend"
rm -rf "${WEBROOT:?}"/*
cp -r dist/* "$WEBROOT"/

echo "==> Backend"
cd "$REPO/Backend"
npm install --omit=dev --silent

echo "==> Restarting $APP"
if pm2 describe "$APP" > /dev/null 2>&1; then
    pm2 reload "$APP" --update-env
else
    pm2 start "$REPO/deploy/jhatpat.ecosystem.config.cjs" --only "$APP"
fi

echo "==> Restarting $WORKER_APP"
if pm2 describe "$WORKER_APP" > /dev/null 2>&1; then
    pm2 reload "$WORKER_APP" --update-env
else
    pm2 start "$REPO/deploy/jhatpat.ecosystem.config.cjs" --only "$WORKER_APP"
fi
pm2 save

echo "==> Done. $APP on port 5040, $WORKER_APP running, https://jhatpattaxi.com"
