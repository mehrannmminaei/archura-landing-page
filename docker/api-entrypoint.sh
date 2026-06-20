#!/bin/sh
set -e

. /docker/wait-for-postgres.sh postgres 5432

cd /app

echo "Applying database schema..."
npm run db:push --workspace=api

if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "Seeding database..."
  npm run db:seed --workspace=api || echo "Seed skipped (database may already be seeded)."
fi

echo "Starting API..."
exec "$@"
