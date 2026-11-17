# Environment and Commands

Environment: GitHub Codespaces, Ubuntu 24.04, Python 3.11. Rebuilding the Codespace wipes everything outside `/workspaces` (including editor-agent installs); `.devcontainer/setup.sh` reinstalls what the project needs.

## Start the stack
```
cd infra && docker compose up -d postgres redis seaweedfs inversion-service
cd backend && cmake --preset default && cmake --build --preset default && ./build/backend
cd frontend && npm run dev        # open forwarded port 5173
```

## Checks
```
curl localhost:8000/health
curl localhost:8080/health
curl localhost:8080/api/bridge/health
curl -X POST localhost:8080/api/bridge/echo -H "Content-Type: application/json" -d '{"hello":"ert"}'
```

## Python venv (for local experiments)
```
cd inversion-service && source .venv/bin/activate
```

## Handy fixes
- Port in use: `pkill -f "uvicorn app:app"` or `pkill -f build/backend`
- Stale C++ build: `rm -rf backend/build`, then the cmake preset commands
- Keep Codespaces ports **private**. If a private port shows a blank page in Brave, turn off Shields for the site.

## Dev credentials (throwaway, local only)
SeaweedFS S3: `geocalc` / `geocalc_pass` at `http://localhost:9000`. Real deployments need real secrets from the environment.
