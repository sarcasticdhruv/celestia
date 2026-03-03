"""
Night Sky API — FastAPI backend
Run: uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import astronomy as astro

app = FastAPI(title="Night Sky API", version="2.0")

# NOTE: the frontend static mount needs to come *after* API route definitions,
# otherwise requests like /api/health will be caught by StaticFiles and return
# a 404.  We'll mount at the bottom of the file instead.


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
    """Simple health check used by Render and other hosts."""
    return {"status": "ok", "stars": len(astro.STARS)}

# after all API routes we mount the SPA so it doesn't intercept /api/*
from fastapi.staticfiles import StaticFiles
# `check_dir=False` prevents FastAPI from raising if the directory
# doesn't exist yet (e.g. during build time).  Render will have the files
# after the multi-stage build copies them in.
app.mount("/", StaticFiles(directory="static", html=True, check_dir=False), name="static")
