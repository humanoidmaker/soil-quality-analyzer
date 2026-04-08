from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import connect_db, close_db
from .api.auth import router as auth_router
from .api.analyze import router as analyze_router

app = FastAPI(
    title="SoilSense API",
    description="Soil Quality Analyzer",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await connect_db()


@app.on_event("shutdown")
async def shutdown():
    await close_db()


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "SoilSense"}


app.include_router(auth_router)
app.include_router(analyze_router)
