"""Sprint Management API - Agile sprints like Jira"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/sprints", tags=["sprints"])


@router.get("", response_model=List[schemas.SprintResponse])
def list_sprints(
    project_id: int = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """List all sprints, optionally filtered by project"""
    query = db.query(models.Sprint)
    if project_id:
        query = query.filter(models.Sprint.project_id == project_id)
    
    sprints = query.order_by(models.Sprint.created_at.desc()).all()
    
    result = []
    for sprint in sprints:
        project = db.query(models.Project).filter(models.Project.id == sprint.project_id).first()
        
        # Count tasks
        task_count = db.query(models.sprint_tasks).filter(
            models.sprint_tasks.c.sprint_id == sprint.id
        ).count()
        
        # Count completed tasks
        completed_count = (
            db.query(models.Task)
            .join(models.sprint_tasks, models.Task.id == models.sprint_tasks.c.task_id)
            .filter(
                models.sprint_tasks.c.sprint_id == sprint.id,
                models.Task.status == "done"
            )
            .count()
        )
        
        result.append(schemas.SprintResponse(
            id=sprint.id,
            name=sprint.name,
            project_id=sprint.project_id,
            project_name=project.name if project else "Unknown",
            goal=sprint.goal,
            status=sprint.status,
            start_date=sprint.start_date,
            end_date=sprint.end_date,
            task_count=task_count,
            completed_tasks=completed_count,
            created_at=sprint.created_at
        ))
    
    return result


@router.get("/active", response_model=List[schemas.SprintResponse])
def get_active_sprints(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get all active sprints"""
    sprints = db.query(models.Sprint).filter(
        models.Sprint.status == "active"
    ).order_by(models.Sprint.created_at.desc()).all()
    
    result = []
    for sprint in sprints:
        project = db.query(models.Project).filter(models.Project.id == sprint.project_id).first()
        
        task_count = db.query(models.sprint_tasks).filter(
            models.sprint_tasks.c.sprint_id == sprint.id
        ).count()
        
        completed_count = (
            db.query(models.Task)
            .join(models.sprint_tasks, models.Task.id == models.sprint_tasks.c.task_id)
            .filter(
                models.sprint_tasks.c.sprint_id == sprint.id,
                models.Task.status == "done"
            )
            .count()
        )
        
        result.append(schemas.SprintResponse(
            id=sprint.id,
            name=sprint.name,
            project_id=sprint.project_id,
            project_name=project.name if project else "Unknown",
            goal=sprint.goal,
            status=sprint.status,
            start_date=sprint.start_date,
            end_date=sprint.end_date,
            task_count=task_count,
            completed_tasks=completed_count,
            created_at=sprint.created_at
        ))
    
    return result


@router.get("/{sprint_id}", response_model=schemas.SprintResponse)
def get_sprint(
    sprint_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get a single sprint with details"""
    sprint = db.query(models.Sprint).filter(models.Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    
    project = db.query(models.Project).filter(models.Project.id == sprint.project_id).first()
    
    task_count = db.query(models.sprint_tasks).filter(
        models.sprint_tasks.c.sprint_id == sprint.id
    ).count()
    
    completed_count = (
        db.query(models.Task)
        .join(models.sprint_tasks, models.Task.id == models.sprint_tasks.c.task_id)
        .filter(
            models.sprint_tasks.c.sprint_id == sprint.id,
            models.Task.status == "done"
        )
        .count()
    )
    
    return schemas.SprintResponse(
        id=sprint.id,
        name=sprint.name,
        project_id=sprint.project_id,
        project_name=project.name if project else "Unknown",
        goal=sprint.goal,
        status=sprint.status,
        start_date=sprint.start_date,
        end_date=sprint.end_date,
        task_count=task_count,
        completed_tasks=completed_count,
        created_at=sprint.created_at
    )


@router.post("", response_model=schemas.SprintResponse)
def create_sprint(
    req: schemas.SprintCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a new sprint"""
    # Verify project exists
    project = db.query(models.Project).filter(models.Project.id == req.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    sprint = models.Sprint(
        name=req.name,
        project_id=req.project_id,
        goal=req.goal,
        status="planning",
        start_date=req.start_date,
        end_date=req.end_date,
        created_at=datetime.utcnow()
    )
    db.add(sprint)
    db.commit()
    db.refresh(sprint)
    
    return schemas.SprintResponse(
        id=sprint.id,
        name=sprint.name,
        project_id=sprint.project_id,
        project_name=project.name,
        goal=sprint.goal,
        status=sprint.status,
        start_date=sprint.start_date,
        end_date=sprint.end_date,
        task_count=0,
        completed_tasks=0,
        created_at=sprint.created_at
    )


@router.put("/{sprint_id}", response_model=schemas.SprintResponse)
def update_sprint(
    sprint_id: int,
    req: schemas.SprintUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update sprint details"""
    sprint = db.query(models.Sprint).filter(models.Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    
    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(sprint, key, value)
    
    db.commit()
    db.refresh(sprint)
    
    project = db.query(models.Project).filter(models.Project.id == sprint.project_id).first()
    
    task_count = db.query(models.sprint_tasks).filter(
        models.sprint_tasks.c.sprint_id == sprint.id
    ).count()
    
    completed_count = (
        db.query(models.Task)
        .join(models.sprint_tasks, models.Task.id == models.sprint_tasks.c.task_id)
        .filter(
            models.sprint_tasks.c.sprint_id == sprint.id,
            models.Task.status == "done"
        )
        .count()
    )
    
    return schemas.SprintResponse(
        id=sprint.id,
        name=sprint.name,
        project_id=sprint.project_id,
        project_name=project.name if project else "Unknown",
        goal=sprint.goal,
        status=sprint.status,
        start_date=sprint.start_date,
        end_date=sprint.end_date,
        task_count=task_count,
        completed_tasks=completed_count,
        created_at=sprint.created_at
    )


@router.post("/{sprint_id}/tasks/{task_id}")
def add_task_to_sprint(
    sprint_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Add a task to a sprint"""
    sprint = db.query(models.Sprint).filter(models.Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Add task to sprint (insert into association table)
    db.execute(
        models.sprint_tasks.insert().values(sprint_id=sprint_id, task_id=task_id)
    )
    db.commit()
    
    return {"success": True, "message": "Task added to sprint"}


@router.delete("/{sprint_id}/tasks/{task_id}")
def remove_task_from_sprint(
    sprint_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Remove a task from a sprint"""
    db.execute(
        models.sprint_tasks.delete().where(
            models.sprint_tasks.c.sprint_id == sprint_id,
            models.sprint_tasks.c.task_id == task_id
        )
    )
    db.commit()
    
    return {"success": True, "message": "Task removed from sprint"}


@router.get("/{sprint_id}/burndown")
def get_sprint_burndown(
    sprint_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get burndown chart data for a sprint"""
    sprint = db.query(models.Sprint).filter(models.Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    
    # Get all tasks in sprint
    tasks = (
        db.query(models.Task)
        .join(models.sprint_tasks, models.Task.id == models.sprint_tasks.c.task_id)
        .filter(models.sprint_tasks.c.sprint_id == sprint_id)
        .all()
    )
    
    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.status == "done")
    remaining_tasks = total_tasks - completed_tasks
    
    # Calculate ideal burndown (linear from total to 0)
    # For simplicity, return current stats
    # In a real app, you'd track daily progress
    
    return {
        "sprint_id": sprint_id,
        "sprint_name": sprint.name,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "remaining_tasks": remaining_tasks,
        "progress_percentage": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    }
