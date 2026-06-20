host="${1:-api}"
port="${2:-4000}"
max="${3:-120}"

echo "Waiting for API at ${host}:${port} (up to ${max}s)..."
elapsed=0
until node -e "
  fetch('http://${host}:${port}/health')
    .then((r) => process.exit(r.ok ? 0 : 1))
    .catch(() => process.exit(1));
" 2>/dev/null; do
  sleep 2
  elapsed=$((elapsed + 2))
  if [ "$elapsed" -ge "$max" ]; then
    echo "API not ready after ${max}s — building site anyway (blog may be empty)."
    exit 0
  fi
done
echo "API is ready."
