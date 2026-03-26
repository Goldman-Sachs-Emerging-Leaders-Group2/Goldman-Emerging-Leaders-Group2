#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=8080
FRONTEND_PORT=5173
BACKEND_PID=""
FRONTEND_PID=""

GOLD='\033[38;5;179m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

cleanup() {
    echo ""
    echo -e "${GOLD}Shutting down...${NC}"
    if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID" 2>/dev/null
        wait "$FRONTEND_PID" 2>/dev/null || true
    fi
    if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID" 2>/dev/null
        wait "$BACKEND_PID" 2>/dev/null || true
    fi
    echo -e "${GREEN}All processes stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Source bashrc for Java/Maven PATH
if [[ -f "$HOME/.bashrc" ]]; then
    set +euo pipefail
    source "$HOME/.bashrc"
    set -euo pipefail
fi

echo -e "${GOLD}━━━ Goldman Sachs Emerging Leaders ━━━${NC}"
echo ""

# Start backend
echo "Starting Spring Boot backend..."
cd "$SCRIPT_DIR"
mvn spring-boot:run -q &
BACKEND_PID=$!

echo -n "Waiting for backend"
MAX_WAIT=60
WAITED=0
while ! curl -sf "http://localhost:${BACKEND_PORT}/api/mutualfunds" > /dev/null 2>&1; do
    if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
        echo ""
        echo -e "${RED}Backend failed to start. Check Java/Maven setup.${NC}"
        exit 1
    fi
    if (( WAITED >= MAX_WAIT )); then
        echo ""
        echo -e "${RED}Backend did not start within ${MAX_WAIT}s.${NC}"
        exit 1
    fi
    echo -n "."
    sleep 1
    WAITED=$((WAITED + 1))
done
echo ""
echo -e "${GREEN}Backend ready.${NC}"

# Start frontend
echo "Starting frontend..."
cd "$SCRIPT_DIR/frontend"
yarn dev &
FRONTEND_PID=$!
sleep 2

echo ""
echo -e "${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}App running at: http://localhost:${FRONTEND_PORT}${NC}"
echo -e "Press Ctrl+C to stop."
echo -e "${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

wait
