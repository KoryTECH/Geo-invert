# Decisions

| Decision | Reason |
|---|---|
| pyGIMLi, no custom inversion math | Custom inversion is the riskiest, hardest part to validate |
| Python only for pyGIMLi, separate service | Test and debug alone; one narrow HTTP boundary |
| Plain JavaScript frontend | Explicit choice; TypeScript rejected |
| Ubuntu 24.04 devcontainer, Python 3.11 | pgcore ships only glibc wheels, none for Alpine (musl) |
| Python service in a Docker container | Isolated, reproducible, pinned |
| Pin `pygimli==1.6.1`, `pgcore==1.6.0` | Proven together |
| SeaweedFS instead of MinIO | MinIO stopped publishing images and is archived; SeaweedFS is Apache-2.0 and S3-compatible |
| Backend not in compose yet | Still built and run locally during development |
| One method at a time, validated before the next | Solo project; avoid many half-finished methods |
| SP first | No inversion needed; exercises the whole pipeline |
