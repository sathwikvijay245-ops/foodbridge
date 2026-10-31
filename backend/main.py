import os
import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.config import settings
from backend.database import engine, Base
from backend.routers import (
    auth, listings, requests, admin, impact, notifications, reports
)
from backend.seed_data import seed_database

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Food Redistribution Platform connecting food businesses with verified charitable organizations (HACK-P197).",
    version="1.0.0"
)

# CORS — wildcard origin is only valid when allow_credentials=False
# JWT auth uses Authorization header (not cookies) so credentials=False is correct
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler — logs full traceback for any unhandled error
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    print(f"\n[500 ERROR] {request.method} {request.url}")
    print(tb)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

# Include API Routers
app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(requests.router)
app.include_router(admin.router)
app.include_router(impact.router)
app.include_router(notifications.router)
app.include_router(reports.router)

@app.on_event("startup")
def on_startup():
    print(f"Starting {settings.PROJECT_NAME} backend...")
    seed_database()

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "hackathon": settings.HACKATHON_CODE,
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "FoodBridge API"}
