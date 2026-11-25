# Architecture

browser (React) -> Vite proxy -> C++ backend (Crow, :8080) -> Python inversion service (FastAPI + pyGIMLi, :8000)

| Piece | Tech | Port | How it runs |
|---|---|---|---|
| Frontend | React + Vite, **plain JavaScript** (no TypeScript) | 5173 | `npm run dev` in `frontend/` |
| Backend | C++20, Crow, cpp-httplib | 8080 | CMake preset, run locally |
| Inversion service | Python 3.11, FastAPI, uvicorn, pyGIMLi 1.6.1, pgcore 1.6.0 | 8000 | Docker container |
| Database | PostgreSQL 16 | 5432 | Docker |
| Queue | Redis 7 | 6379 | Docker |
| Object storage | SeaweedFS (S3 API) | 9000 | Docker |

## Repo layout (current)
```
.devcontainer/        Ubuntu 24.04 devcontainer + setup.sh
backend/              C++ (src/main.cpp, src/inversion_client.*, CMakePresets.json)
frontend/             React shell (Vite, plain JS)
inversion-service/    FastAPI app, Dockerfile, requirements.txt (pins)
infra/                docker-compose.yml, init.sql, seaweedfs-s3.json
docs/                 beginning.md (plan), DEVLOG.md
stitch-designs/       UI designs and DESIGN.md tokens
vcpkg/                C++ dependencies (crow, cpp-httplib)
```

## The bridge (C++ -> Python)
- `backend/src/inversion_client.{h,cpp}`: HTTP client on cpp-httplib. Host/port from `INVERSION_HOST` / `INVERSION_PORT` (default `127.0.0.1:8000`). Connect timeout 2 s, read timeout 60 s. Never throws.
- Routes: `GET /api/bridge/health`, `POST /api/bridge/echo`. 400 on invalid JSON, 502 with `{"status":"error","message":...}` if Python is unreachable.
- Real inversions run for minutes, so Stage 2 must use the Redis job queue, not one blocking request.

## Frontend shell
- Routes: `/`, `/projects/:projectId`, `/projects/:projectId/surveys/new`, `/surveys/:surveyId` with tabs data, qc, 3d, interpretation, export. All placeholders.
- Sidebar status light polls `/api/bridge/health` every 15 s.
- `ErrorBoundary` shows runtime errors on the page.

## Storage
Access object storage only through the S3 API (endpoint, credentials, path-style in environment variables) so the backend can be swapped by config.
