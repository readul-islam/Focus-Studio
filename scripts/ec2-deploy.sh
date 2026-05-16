#!/usr/bin/env bash
# Run on EC2 after git pull (manually or from GitHub Actions).
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/focus-studio}"
SERVER_DIR="$APP_DIR/server"

cd "$SERVER_DIR"
source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate --noinput
python manage.py collectstatic --noinput

sudo systemctl restart focus-api
echo "Deploy finished: $(date -Is)"
