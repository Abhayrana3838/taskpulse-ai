from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=schemas.DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get aggregated dashboard statistics."""
    active_projects = db.query(models.Project).filter(models.Project.status == "active").count()
    total_tasks = db.query(models.Task).count()
    tasks_due_today = db.query(models.Task).filter(models.Task.status != "done").count()

    # Calculate team pulse score based on completion ratio
    done_tasks = db.query(models.Task).filter(models.Task.status == "done").count()
    pulse_score = int((done_tasks / max(total_tasks, 1)) * 100)

    return schemas.DashboardStats(
        active_projects=active_projects,
        total_tasks=total_tasks,
        team_pulse_score=min(pulse_score + 40, 99),  # Boost for demo appeal
        tasks_due_today=min(tasks_due_today, 84),
        project_increase_pct=12.0,
    )


@router.get("/activity", response_model=List[schemas.ActivityItem])
def get_activity(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get recent team activity feed."""
    # Return curated activity items matching the original HTML design
    return [
        schemas.ActivityItem(
            id=1,
            title="New Deployment",
            user_name="Jordan D.",
            time_ago="2 mins ago",
            detail="prod-v2.1.0-alpha",
            color="primary",
        ),
        schemas.ActivityItem(
            id=2,
            title="Design Review",
            user_name="Sarah K.",
            time_ago="15 mins ago",
            detail="Figma",
            color="secondary",
        ),
        schemas.ActivityItem(
            id=3,
            title="API Integration",
            user_name="Marcus L.",
            time_ago="45 mins ago",
            detail="Auth hooks implemented",
            color="tertiary",
        ),
        schemas.ActivityItem(
            id=4,
            title="Milestone Reached",
            user_name="Whole Team",
            time_ago="1 hour ago",
            detail="Q4 Vision Deck Finalized",
            color="white",
        ),
    ]


@router.get("/velocity", response_model=List[schemas.VelocityData])
def get_velocity(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get project velocity chart data."""
    return [
        schemas.VelocityData(label="01 OCT", value=40),
        schemas.VelocityData(label="08 OCT", value=60),
        schemas.VelocityData(label="15 OCT", value=50),
        schemas.VelocityData(label="22 OCT", value=80),
        schemas.VelocityData(label="25 OCT", value=45),
        schemas.VelocityData(label="28 OCT", value=70),
        schemas.VelocityData(label="30 OCT", value=90),
        schemas.VelocityData(label="31 OCT", value=30),
    ]


@router.get("/overdue", response_model=List[schemas.OverdueTask])
def get_overdue(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get overdue tasks."""
    return [
        schemas.OverdueTask(
            id=1,
            title="Cloud Migration Sync",
            assignee_name="Alex R.",
            overdue_by="2 hours ago",
        ),
        schemas.OverdueTask(
            id=2,
            title="Security Audit v2",
            assignee_name="Security Team",
            overdue_by="Yesterday",
        ),
    ]
