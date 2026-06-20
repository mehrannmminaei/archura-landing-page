host="${1:-postgres}"
port="${2:-5432}"

echo "Waiting for PostgreSQL at ${host}:${port}..."
until nc -z "$host" "$port" 2>/dev/null; do
  sleep 1
done
echo "PostgreSQL is ready."
