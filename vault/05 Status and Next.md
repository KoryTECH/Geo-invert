# Status and Next

## Done (Stage 1, verified by running it)
- Docker services: PostgreSQL, Redis, SeaweedFS
- Database schema created (contents not re-inspected since)
- C++ backend (Crow) builds from a clean folder with a CMake preset
- Python inversion service with pinned pyGIMLi, running as a container
- C++ -> Python bridge with 400/502 handling
- React shell; status light tracks the Python service (green/red)
- pyGIMLi 1.6.1 + pgcore 1.6.0 import natively on Ubuntu

## Not started
- Authentication (login route is a placeholder)
- File upload (route is a placeholder)
- Every Stage 2 item; no inversion has been run or validated

## Not yet verified
- pyGIMLi import run *inside* the container
- Postgres schema vs planned tables
- Redis usage

## Next: Stage 2, SP first
1. [[06 Stage 2 SP Data Format Brief]] - common data format (spec, schema, example) before any parser code.
2. SP pipeline: upload -> parse -> QC -> plot -> report.
3. Add auth and upload routes as the SP pipeline needs them.
