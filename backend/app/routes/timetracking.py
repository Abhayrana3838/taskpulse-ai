"""Time Tracking API - Like Jira time tracking"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/time", tags=["time tracking"])


def format_duration(minutes: int) -> str:
    """Format minutes into readable duration"""
    hours = minutes // 60
    mins = minutes % 60
    if hours > 0 and mins > 0:
        return f"{hours}h {mins}m"
    elif hours > 0:
        return f"{hours}h"
    else:
        return f"{mins}m"


@router.post("/track", response_model=schemas.TimeEntryResponse)
def log_time(
    req: schemas.TimeEntryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Log time spent on a task"""
    # Verify task exists
    task = db.query(models.Task).filter(models.Task.id == req.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    time_entry = models.TimeEntry(
        task_id=req.task_id,
        user_id=current_user.id,
        description=req.description,
        duration_minutes=req.duration_minutes,
        started_at=datetime.utcnow(),
        created_at=datetime.utcnow()
    )
    db.add(time_entry)
    db.commit()
    db.refresh(time_entry)
    
    return schemas.TimeEntryResponse(
        id=time_entry.id,
        task_id=time_entry.task_id,
        task_title=task.title,
        user_id=time_entry.user_id,
        user_name=current_user.name,
        description=time_entry.description,
        duration_minutes=time_entry.duration_minutes,
        started_at=time_entry.started_at,
        created_at=time_entry.created_at
    )


@router.get("/task/{task_id}", response_model=List[schemas.TimeEntryResponse])
def get_task_time_entries(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get all time entries for a task"""
    entries = db.query(models.TimeEntry).filter(
        models.TimeEntry.task_id == task_id
    ).order_by(models.TimeEntry.created_at.desc()).all()
    
    result = []
    for entry in entries:
        task = db.query(models.Task).filter(models.Task.id == entry.task_id).first()
        user = db.query(models.User).filter(models.User.id == entry.user_id).first()
        
        result.append(schemas.TimeEntryResponse(
            id=entry.id,
            task_id=entry.task_id,
            task_title=task.title if task else "Unknown",
            user_id=entry.user_id,
            user_name=user.name if user else "Unknown",
            description=entry.description,
            duration_minutes=entry.duration_minutes,
            started_at=entry.started_at,
            created_at=entry.created_at
        ))
    
    return result


@router.get("/user/{user_id}", response_model=List[schemas.TimeEntryResponse])
def get_user_time_entries(
    user_id: int,
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get time entries for a user (last N days)"""
    since = datetime.utcnow() - timedelta(days=days)
    
    entries = db.query(models.TimeEntry).filter(
        models.TimeEntry.user_id == user_id,
        models.TimeEntry.created_at >= since
    ).order_by(models.TimeEntry.created_at.desc()).all()
    
    result = []
    for entry in entries:
        task = db.query(models.Task).filter(models.Task.id == entry.task_id).first()
        user = db.query(models.User).filter(models.User.id == entry.user_id).first()
        
        result.append(schemas.TimeEntryResponse(
            id=entry.id,
            task_id=entry.task_id,
            task_title=task.title if task else "Unknown",
            user_id=entry.user_id,
            user_name=user.name if user else "Unknown",
            description=entry.description,
            duration_minutes=entry.duration_minutes,
            started_at=entry.started_at,
            created_at=entry.created_at
        ))
    
    return result


@router.get("/summary/task/{task_id}")
def get_task_time_summary(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get total time logged for a task"""
    entries = db.query(models.TimeEntry).filter(
        models.TimeEntry.task_id == task_id
    ).all()
    
    total_minutes = sum(entry.duration_minutes for entry in entries)
    entry_count = len(entries)
    
    return {
        "task_id": task_id,
        "total_minutes": total_minutes,
        "total_formatted": format_duration(total_minutes),
        "entry_count": entry_count
    }


@router.get("/summary/user/{user_id}")
def get_user_time_summary(
    user_id: int,
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get time summary for a user"""
    since = datetime.utcnow() - timedelta(days=days)
    
    entries = db.query(models.TimeEntry).filter(
        models.TimeEntry.user_id == user_id,
        models.TimeEntry.created_at >= since
    ).all()
    
    total_minutes = sum(entry.duration_minutes for entry in entries)
    entry_count = len(entries)
    
    # Group by day
    daily_minutes = {}
    for entry in entries:
        day = entry.created_at.strftime("%Y-%m-%d")
        daily_minutes[day] = daily_minutes.get(day, 0) + entry.duration_minutes
    
    return {
        "user_id": user_id,
        "days": days,
        "total_minutes": total_minutes,
        "total_formatted": format_duration(total_minutes),
        "entry_count": entry_count,
        "daily_breakdown": daily_minutes
    }
