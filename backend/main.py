"""
Night Sky API — FastAPI backend
Run: uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import astronomy as astro

app = FastAPI(title="Night Sky API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

@app.get("/api/sky")
def get_sky(
    lat: float = Query(..., description="Latitude in degrees"),
    lon: float = Query(..., description="Longitude in degrees"),
    jd: float = Query(None, description="Julian Day (optional, default=now)"),
):
    """Return full sky data for a given location and time."""
    data = astro.get_sky_data(lat, lon, jd)
    return JSONResponse(content=data)

@app.get("/api/capitals")
def get_capitals():
    """Return all country capitals."""
    return astro.COUNTRY_CAPITALS

@app.get("/api/health")
def health():
    return {"status": "ok", "stars": len(astro.STARS)}
