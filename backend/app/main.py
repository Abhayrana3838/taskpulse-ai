import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal

# Import ALL models first to register them with Base
from . import models
from . import models_extended

from .routes import auth, projects, tasks, dashboard, users, activity, notifications, timetracking, sprints
from .routes import epics, ai_features, workflow, backlog, integrations
from .seed import seed_database

# Create all tables (including extended models)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TaskPulse AI API",
    description="AI-powered project management backend",
    version="2.0.0",
)

# CORS — configurable for Railway deployment
allow_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)
app.include_router(users.router)
app.include_router(activity.router)
app.include_router(notifications.router)
app.include_router(timetracking.router)
app.include_router(sprints.router)

# Extended features (Jira-like)
app.include_router(epics.router)
app.include_router(backlog.router)
app.include_router(workflow.router)

# AI-powered features
app.include_router(ai_features.router)

# Third-party integrations
app.include_router(integrations.router)


@app.on_event("startup")
def on_startup():
    """Seed database with demo data on first run."""
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@app.get("/api/health")
def health_check():
    return {
        "status": "ok", 
        "app": "TaskPulse API", 
        "version": "2.0.0",
        "features": [
            "Projects", "Tasks", "Sprints", "Epics", "Backlog",
            "Workflows", "Time Tracking", "AI Insights", "Activity Log",
            "Notifications", "Sentiment Analysis", "Smart Assignment",
            "Duplicate Detection", "Voice Commands", "Integrations"
        ]
    }
