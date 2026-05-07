"""
Epic Management API - Large bodies of work like Jira Epics
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from .. import models, models_extended, schemas
from ..database import get_db
from ..auth import get_current_user
from ..routes.activity import log_activity

router = APIRouter(prefix="/api/epics", tags=["epics"])


@router.get("", response_model=List[dict])
def list_epics(
    project_id: int = None,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """List all epics with progress information"""
    query = db.query(models_extended.Epic)
    if project_id:
        query = query.filter(models_extended.Epic.project_id == project_id)
    if status:
        query = query.filter(models_extended.Epic.status == status)
    
    epics = query.order_by(models_extended.Epic.created_at.desc()).all()
    
    result = []
    for epic in epics:
        # Calculate actual progress from child tasks
        tasks = db.query(models.Task).filter(models.Task.epic_id == epic.id).all()
        total_tasks = len(tasks)
        completed_tasks = sum(1 for t in tasks if t.status == "done")
        
        progress = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        # Update epic progress
        epic.progress = progress
        
        result.append({
            "id": epic.id,
            "epic_key": epic.epic_key,
            "title": epic.title,
            "description": epic.description,
            "project_id": epic.project_id,
            "color": epic.color,
            "status": epic.status,
            "progress": progress,
            "story_points": epic.story_points,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "start_date": epic.start_date,
            "end_date": epic.end_date,
            "created_at": epic.created_at.isoformat() if hasattr(epic.created_at, 'isoformat') else str(epic.created_at) if epic.created_at else None
        })
    
    return result


@router.get("/{epic_id}", response_model=dict)
def get_epic(
    epic_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get epic details with all child tasks"""
    epic = db.query(models_extended.Epic).filter(models_extended.Epic.id == epic_id).first()
    if not epic:
        raise HTTPException(status_code=404, detail="Epic not found")
    
    # Get child tasks
    tasks = db.query(models.Task).filter(models.Task.epic_id == epic.id).all()
    
    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.status == "done")
    in_progress = sum(1 for t in tasks if t.status == "in_progress")
    todo = sum(1 for t in tasks if t.status == "todo")
    
    return {
        "id": epic.id,
        "epic_key": epic.epic_key,
        "title": epic.title,
        "description": epic.description,
        "project_id": epic.project_id,
        "color": epic.color,
        "status": epic.status,
        "progress": epic.progress,
        "story_points": epic.story_points,
        "start_date": epic.start_date,
        "end_date": epic.end_date,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "in_progress": in_progress,
        "todo": todo,
        "tasks": [
            {
                "id": t.id,
                "task_key": t.task_key,
                "title": t.title,
                "status": t.status,
                "priority": t.priority,
                "assignee_id": t.assignee_id
            }
            for t in tasks
        ],
        "created_at": epic.created_at.isoformat() if hasattr(epic.created_at, 'isoformat') else str(epic.created_at) if epic.created_at else None
    }


@router.post("", response_model=dict)
def create_epic(
    req: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a new epic"""
    project_id = req.get("project_id")
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Generate epic key
    epic_count = db.query(models_extended.Epic).filter(
        models_extended.Epic.project_id == project_id
    ).count()
    epic_key = f"E-{epic_count + 100:03d}"
    
    epic = models_extended.Epic(
        epic_key=epic_key,
        title=req.get("title"),
        description=req.get("description", ""),
        project_id=project_id,
        color=req.get("color", "#0070f3"),
        story_points=req.get("story_points", 0),
        start_date=req.get("start_date", ""),
        end_date=req.get("end_date", ""),
        created_at=datetime.utcnow()
    )
    
    db.add(epic)
    db.commit()
    db.refresh(epic)
    
    # Log activity
    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="created",
        entity_type="epic",
        entity_id=epic.id,
        description=f"created epic {epic.epic_key}: {epic.title}",
        project_id=project_id,
        meta_data={"epic_key": epic.epic_key, "title": epic.title}
    )
    
    return {
        "id": epic.id,
        "epic_key": epic.epic_key,
        "title": epic.title,
        "message": "Epic created successfully"
    }


@router.put("/{epic_id}", response_model=dict)
def update_epic(
    epic_id: int,
    req: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update epic details"""
    epic = db.query(models_extended.Epic).filter(models_extended.Epic.id == epic_id).first()
    if not epic:
        raise HTTPException(status_code=404, detail="Epic not found")
    
    # Update fields
    if "title" in req:
        epic.title = req["title"]
    if "description" in req:
        epic.description = req["description"]
    if "color" in req:
        epic.color = req["color"]
    if "status" in req:
        epic.status = req["status"]
    if "story_points" in req:
        epic.story_points = req["story_points"]
    if "start_date" in req:
        epic.start_date = req["start_date"]
    if "end_date" in req:
        epic.end_date = req["end_date"]
    
    db.commit()
    db.refresh(epic)
    
    return {
        "id": epic.id,
        "epic_key": epic.epic_key,
        "title": epic.title,
        "message": "Epic updated successfully"
    }


@router.post("/{epic_id}/tasks/{task_id}")
def add_task_to_epic(
    epic_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Add a task to an epic"""
    epic = db.query(models_extended.Epic).filter(models_extended.Epic.id == epic_id).first()
    if not epic:
        raise HTTPException(status_code=404, detail="Epic not found")
    
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.epic_id = epic_id
    db.commit()
    
    # Log activity
    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="updated",
        entity_type="task",
        entity_id=task.id,
        description=f"added task {task.task_key} to epic {epic.epic_key}",
        project_id=task.project_id,
        meta_data={"task_key": task.task_key, "epic_key": epic.epic_key}
    )
    
    return {"success": True, "message": "Task added to epic"}


@router.delete("/{epic_id}/tasks/{task_id}")
def remove_task_from_epic(
    epic_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Remove a task from an epic"""
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.epic_id == epic_id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found in epic")
    
    epic = db.query(models_extended.Epic).filter(models_extended.Epic.id == epic_id).first()
    epic_key = epic.epic_key if epic else "Unknown"
    
    task.epic_id = None
    db.commit()
    
    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="updated",
        entity_type="task",
        entity_id=task.id,
        description=f"removed task {task.task_key} from epic {epic_key}",
        project_id=task.project_id,
        meta_data={"task_key": task.task_key, "epic_key": epic_key}
    )
    
    return {"success": True, "message": "Task removed from epic"}


@router.get("/{epic_id}/roadmap", response_model=dict)
def get_epic_roadmap(
    epic_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get roadmap visualization data for epic"""
    epic = db.query(models_extended.Epic).filter(models_extended.Epic.id == epic_id).first()
    if not epic:
        raise HTTPException(status_code=404, detail="Epic not found")
    
    # Get tasks with dates
    tasks = db.query(models.Task).filter(
        models.Task.epic_id == epic.id
    ).order_by(models.Task.created_at).all()
    
    # Calculate timeline
    timeline = []
    current_progress = 0
    
    for i, task in enumerate(tasks):
        status_weight = {"todo": 0, "in_progress": 0.5, "done": 1}
        weight = status_weight.get(task.status, 0)
        
        timeline.append({
            "task_id": task.id,
            "task_key": task.task_key,
            "title": task.title,
            "status": task.status,
            "position": i,
            "progress": weight
        })
    
    return {
        "epic_id": epic.id,
        "epic_key": epic.epic_key,
        "title": epic.title,
        "start_date": epic.start_date,
        "end_date": epic.end_date,
        "total_tasks": len(tasks),
        "overall_progress": epic.progress,
        "timeline": timeline,
        "dependencies": []  # Could add task dependencies here
    }
