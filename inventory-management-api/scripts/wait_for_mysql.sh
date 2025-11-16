#!/usr/bin/env bash
set -e

host=${1:-mysql}
port=${2:-3306}
timeout=${3:-60}
shift 3 || true

echo "Waiting for $host:$port (timeout ${timeout}s)..."

python - <<PY
import socket, time, sys
host = "$host"
port = int("$port")
timeout = int("$timeout")
t0 = time.time()
while True:
    try:
        s = socket.create_connection((host, port), 2)
        s.close()
        sys.exit(0)
    except Exception:
        if time.time() - t0 > timeout:
            print("Timed out waiting for %s:%s" % (host, port))
            sys.exit(1)
        time.sleep(1)
PY

echo "$host:$port is available"
if [ "$#" -gt 0 ]; then
  exec "$@"
fi