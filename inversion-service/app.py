from typing import Any, Dict

from fastapi import FastAPI

app = FastAPI(
    title="Geo-Invert Inversion Service",
    version="0.1.0",
)


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "service": "geo-invert-inversion"}


@app.post("/echo")
def echo(payload: Dict[str, Any]) -> Dict[str, Any]:
    return {"received": payload}
