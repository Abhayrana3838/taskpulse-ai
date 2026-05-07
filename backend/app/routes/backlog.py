"""
Backlog Management API
Product backlog with prioritization and ordering
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from .. import models, models_extended, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/backlog", tags=["backlog"])


@router.get("/{project_id}", response_model=dict)
def get_backlog(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get product backlog for a project with ordered items"""
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get or create backlog
    backlog = db.query(models_extended.Backlog).filter(
        models_extended.Backlog.project_id == project_id
    ).first()
    
    if not backlog:
        backlog = models_extended.Backlog(
            project_id=project_id,
            is_ordered=True,
            created_at=datetime.utcnow()
        )
        db.add(backlog)
        db.commit()
        db.refresh(backlog)
    
    # Get backlog items with task details
    items = db.query(models_extended.BacklogItem).filter(
        models_extended.BacklogItem.backlog_id == backlog.id
    ).order_by(models_extended.BacklogItem.position).all()
    
    # Get tasks not in any sprint (backlog tasks)
    backlog_tasks = []
    for item in items:
        task = db.query(models.Task).filter(models.Task.id == item.task_id).first()
        if task and not item.sprint_id:
            backlog_tasks.append({
                "backlog_item_id": item.id,
                "position": item.position,
                "task": {
                    "id": task.id,
                    "task_key": task.task_key,
                    "title": task.title,
                    "description": task.description,
                    "status": task.status,
                    "priority": task.priority,
                    "story_points": getattr(task, 'story_points', None),
                    "assignee_id": task.assignee_id,
                    "epic_id": task.epic_id
                }
            })
    
    # Also get tasks that are not in backlog but have no sprint
    orphaned_tasks = db.query(models.Task).filter(
        models.Task.project_id == project_id,
        models.Task.status.in_(["todo", "in_progress"])
    ).all()
    
    # Filter out tasks already in backlog
    existing_task_ids = {item.task_id for item in items}
    for task in orphaned_tasks:
        if task.id not in existing_task_ids:
            backlog_tasks.append({
                "backlog_item_id": None,
                "position": len(backlog_tasks),
                "task": {
                    "id": task.id,
                    "task_key": task.task_key,
                    "title": task.title,
                    "description": task.description,
                    "status": task.status,
                    "priority": task.priority,
                    "story_points": getattr(task, 'story_points', None),
                    "assignee_id": task.assignee_id,
                    "epic_id": task.epic_id
                }
            })
    
    return {
        "backlog_id": backlog.id,
        "project_id": project_id,
        "is_ordered": backlog.is_ordered,
        "total_items": len(backlog_tasks),
        "items": backlog_tasks
    }


@router.post("/{project_id}/add-task")
def add_task_to_backlog(
    project_id: int,
    req: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Add a task to the product backlog"""
    task_id = req.get("task_id")
    position = req.get("position", None)  # If None, add to end
    
    # Get or create backlog
    backlog = db.query(models_extended.Backlog).filter(
        models_extended.Backlog.project_id == project_id
    ).first()
    
    if not backlog:
        backlog = models_extended.Backlog(
            project_id=project_id,
            is_ordered=True,
            created_at=datetime.utcnow()
        )
        db.add(backlog)
        db.commit()
        db.refresh(backlog)
    
    # If position not specified, add to end
    if position is None:
        max_position = db.query(models_extended.BacklogItem).filter(
            models_extended.BacklogItem.backlog_id == backlog.id
        ).count()
        position = max_position
    
    # Create backlog item
    item = models_extended.BacklogItem(
        backlog_id=backlog.id,
        task_id=task_id,
        position=position,
        sprint_id=None,
        created_at=datetime.utcnow()
    )
    
    db.add(item)
    db.commit()
    
    return {
        "success": True,
        "backlog_item_id": item.id,
        "position": position,
        "message": "Task added to backlog"
    }


@router.put("/{project_id}/reorder")
def reorder_backlog(
    project_id: int,
    req: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Reorder backlog items (drag and drop)"""
    item_orders = req.get("items", [])  # [{item_id: 1, new_position: 0}, ...]
    
    backlog = db.query(models_extended.Backlog).filter(
        models_extended.Backlog.project_id == project_id
    ).first()
    
    if not backlog:
        raise HTTPException(status_code=404, detail="Backlog not found")
    
    for update in item_orders:
        item_id = update.get("item_id")
        new_position = update.get("new_position")
        
        item = db.query(models_extended.BacklogItem).filter(
            models_extended.BacklogItem.id == item_id,
            models_extended.BacklogItem.backlog_id == backlog.id
        ).first()
        
        if item:
            item.position = new_position
    
    db.commit()
    
    return {
        "success": True,
        "message": "Backlog reordered successfully"
    }


@router.post("/{project_id}/move-to-sprint")
def move_to_sprint(
    project_id: int,
    req: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Move backlog items to a sprint"""
    item_ids = req.get("item_ids", [])
    sprint_id = req.get("sprint_id")
    
    backlog = db.query(models_extended.Backlog).filter(
        models_extended.Backlog.project_id == project_id
    ).first()
    
    if not backlog:
        raise HTTPException(status_code=404, detail="Backlog not found")
    
    # Verify sprint exists
    sprint = db.query(models_extended.Sprint).filter(
        models_extended.Sprint.id == sprint_id
    ).first()
    
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    
    for item_id in item_ids:
        item = db.query(models_extended.BacklogItem).filter(
            models_extended.BacklogItem.id == item_id
        ).first()
        
        if item:
            # Add to sprint
            db.execute(
                models_extended.sprint_tasks.insert().values(
                    sprint_id=sprint_id,
                    task_id=item.task_id
                )
            )
            
            # Remove from backlog or mark as in-sprint
            item.sprint_id = sprint_id
    
    db.commit()
    
    return {
        "success": True,
        "moved_count": len(item_ids),
        "sprint_id": sprint_id,
        "message": f"Moved {len(item_ids)} items to sprint"
    }


@router.get("/{project_id}/stats", response_model=dict)
def get_backlog_stats(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get backlog statistics and insights"""
    backlog = db.query(models_extended.Backlog).filter(
        models_extended.Backlog.project_id == project_id
    ).first()
    
    if not backlog:
        return {
            "total_items": 0,
            "by_priority": {},
            "by_status": {},
            "story_points": 0
        }
    
    items = db.query(models_extended.BacklogItem).filter(
        models_extended.BacklogItem.backlog_id == backlog.id,
        models_extended.BacklogItem.sprint_id == None
    ).all()
    
    total_items = len(items)
    by_priority = {"high": 0, "medium": 0, "low": 0}
    by_status = {"todo": 0, "in_progress": 0}
    total_story_points = 0
    
    for item in items:
        task = db.query(models.Task).filter(models.Task.id == item.task_id).first()
        if task:
            priority = task.priority or "medium"
            by_priority[priority] = by_priority.get(priority, 0) + 1
            
            status = task.status or "todo"
            if status in by_status:
                by_status[status] += 1
            
            story_points = getattr(task, 'story_points', 0) or 0
            total_story_points += story_points
    
    return {
        "total_items": total_items,
        "by_priority": by_priority,
        "by_status": by_status,
        "total_story_points": total_story_points,
        "estimated_sprints": round(total_story_points / 20, 1) if total_story_points > 0 else 0
    }
