"""Activity logging API - Tracks everything like Jira"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/activity", tags=["activity"])


def get_time_ago(dt: datetime) -> str:
    """Convert datetime to human readable time ago"""
    now = datetime.utcnow()
    diff = now - dt
    
    if diff < timedelta(minutes=1):
        return "Just now"
    elif diff < timedelta(hours=1):
        minutes = int(diff.seconds / 60)
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    elif diff < timedelta(days=1):
        hours = int(diff.seconds / 3600)
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif diff < timedelta(days=7):
        days = diff.days
        return f"{days} day{'s' if days > 1 else ''} ago"
    else:
        return dt.strftime("%b %d, %Y")


def log_activity(
    db: Session,
    user_id: int,
    action_type: str,
    entity_type: str,
    entity_id: int,
    description: str,
    project_id: int = None,
    meta_data: dict = None
):
    """Helper function to log any activity"""
    activity = models.ActivityLog(
        user_id=user_id,
        action_type=action_type,
        entity_type=entity_type,
        entity_id=entity_id,
        project_id=project_id,
        description=description,
        meta_data=meta_data or {},
        created_at=datetime.utcnow()
    )
    db.add(activity)
    db.commit()
    return activity


@router.get("", response_model=List[schemas.ActivityLogResponse])
def get_recent_activity(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get recent activity feed for the user"""
    # Get activities from user's projects or all activities
    activities = (
        db.query(models.ActivityLog)
        .order_by(models.ActivityLog.created_at.desc())
        .limit(limit)
        .all()
    )
    
    result = []
    for activity in activities:
        # Get user info
        user = db.query(models.User).filter(models.User.id == activity.user_id).first()
        
        # Get project info if applicable
        project_name = None
        if activity.project_id:
            project = db.query(models.Project).filter(models.Project.id == activity.project_id).first()
            project_name = project.name if project else None
        
        result.append(schemas.ActivityLogResponse(
            id=activity.id,
            user_id=activity.user_id,
            user_name=user.name if user else "Unknown",
            user_avatar=user.avatar_url if user else "",
            action_type=activity.action_type,
            entity_type=activity.entity_type,
            entity_id=activity.entity_id,
            project_id=activity.project_id,
            project_name=project_name,
            description=activity.description,
            meta_data=activity.meta_data,
            created_at=activity.created_at,
            time_ago=get_time_ago(activity.created_at)
        ))
    
    return result


@router.get("/project/{project_id}", response_model=List[schemas.ActivityLogResponse])
def get_project_activity(
    project_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get activity for a specific project"""
    activities = (
        db.query(models.ActivityLog)
        .filter(models.ActivityLog.project_id == project_id)
        .order_by(models.ActivityLog.created_at.desc())
        .limit(limit)
        .all()
    )
    
    result = []
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    project_name = project.name if project else None
    
    for activity in activities:
        user = db.query(models.User).filter(models.User.id == activity.user_id).first()
        
        result.append(schemas.ActivityLogResponse(
            id=activity.id,
            user_id=activity.user_id,
            user_name=user.name if user else "Unknown",
            user_avatar=user.avatar_url if user else "",
            action_type=activity.action_type,
            entity_type=activity.entity_type,
            entity_id=activity.entity_id,
            project_id=activity.project_id,
            project_name=project_name,
            description=activity.description,
            meta_data=activity.meta_data,
            created_at=activity.created_at,
            time_ago=get_time_ago(activity.created_at)
        ))
    
    return result


@router.get("/task/{task_id}", response_model=List[schemas.ActivityLogResponse])
def get_task_activity(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get activity history for a specific task"""
    activities = (
        db.query(models.ActivityLog)
        .filter(models.ActivityLog.entity_type == "task", models.ActivityLog.entity_id == task_id)
        .order_by(models.ActivityLog.created_at.desc())
        .all()
    )
    
    result = []
    for activity in activities:
        user = db.query(models.User).filter(models.User.id == activity.user_id).first()
        
        project_name = None
        if activity.project_id:
            project = db.query(models.Project).filter(models.Project.id == activity.project_id).first()
            project_name = project.name if project else None
        
        result.append(schemas.ActivityLogResponse(
            id=activity.id,
            user_id=activity.user_id,
            user_name=user.name if user else "Unknown",
            user_avatar=user.avatar_url if user else "",
            action_type=activity.action_type,
            entity_type=activity.entity_type,
            entity_id=activity.entity_id,
            project_id=activity.project_id,
            project_name=project_name,
            description=activity.description,
            meta_data=activity.meta_data,
            created_at=activity.created_at,
            time_ago=get_time_ago(activity.created_at)
        ))
    
    return result
