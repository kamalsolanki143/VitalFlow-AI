from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import escalations, followups, health, reports

app = FastAPI(
    title="VitalFlow AI",
    description="Clinical Report Routing System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://vital-flow-ai-azure.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(reports.router)
app.include_router(followups.router)
app.include_router(escalations.router)

@app.get("/")
def root():
    return {"message": "VitalFlow Backend Running"}