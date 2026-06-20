#!/bin/sh
set -e

. /docker/wait-for-postgres.sh postgres 5432
. /docker/wait-for-api.sh api 4000 120

/docker/build-site.sh

echo "Starting rebuild server..."
node /docker/rebuild-server.mjs &

echo "Starting nginx..."
exec nginx -g 'daemon off;'
