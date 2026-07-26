#!/usr/bin/env bash
set -e

# Usage: ./deploy.sh "commit message"
#        ./deploy.sh            (uses a default message)

MSG="${1:-"Update game"}"
SERVER="arash@192.168.1.200"
REMOTE_DIR="/var/www/ecopolis"
SERVER_PASS="Ahoora!1"

echo "==> Staging changes..."
git add -A

if git diff --cached --quiet; then
  echo "    Nothing to commit — working tree clean."
else
  git commit -m "$MSG

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
  echo "==> Committed: $MSG"
fi

echo "==> Pushing to GitHub..."
git push origin main
echo "    GitHub up to date."

echo "==> Deploying to server..."
expect -c "
  set timeout 30
  spawn ssh -o StrictHostKeyChecking=no $SERVER \
    \"cd $REMOTE_DIR && echo $SERVER_PASS | sudo -S git pull origin main\"
  expect \"password:\"
  send \"$SERVER_PASS\r\"
  expect eof
" 2>&1 | grep -v "^spawn\|^$"

echo "==> Done."
