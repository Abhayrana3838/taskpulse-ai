"""
Workflow Management API
Custom workflows with transitions like Jira
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import models, models_extended, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/workflows", tags=["workflows"])


@router.get("/statuses/{project_id}", response_model=List[dict])
def get_workflow_statuses(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get all workflow statuses for a project"""
    statuses = db.query(models_extended.WorkflowStatus).filter(
        models_extended.WorkflowStatus.project_id == project_id
    ).order_by(models_extended.WorkflowStatus.position).all()
    
    # If no custom workflow, return defaults
    if not statuses:
        default_statuses = [
            {"id": "todo", "name": "To Do", "category": "todo", "color": "#6b7280", "is_default": True},
            {"id": "in_progress", "name": "In Progress", "category": "in_progress", "color": "#0070f3", "is_default": True},
            {"id": "done", "name": "Done", "category": "done", "color": "#10b981", "is_default": True}
        ]
        return default_statuses
    
    return [
        {
            "id": s.id,
            "name": s.name,
            "category": s.category,
            "color": s.color,
            "position": s.position,
            "is_default": s.is_default
        }
        for s in statuses
    ]


@router.post("/statuses/{project_id}", response_model=dict)
def create_workflow_status(
    project_id: int,
    req: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a custom workflow status"""
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get next position
    max_position = db.query(models_extended.WorkflowStatus).filter(
        models_extended.WorkflowStatus.project_id == project_id
    ).count()
    
    status = models_extended.WorkflowStatus(
        project_id=project_id,
        name=req.get("name"),
        category=req.get("category", "in_progress"),
        color=req.get("color", "#0070f3"),
        position=req.get("position", max_position),
        is_default=False,
        created_at=datetime.utcnow()
    )
    
    db.add(status)
    db.commit()
    db.refresh(status)
    
    return {
        "id": status.id,
        "name": status.name,
        "category": status.category,
        "color": status.color,
        "position": status.position,
        "message": "Workflow status created"
    }


@router.get("/transitions/{project_id}", response_model=List[dict])
def get_workflow_transitions(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get all allowed workflow transitions for a project"""
    transitions = db.query(models_extended.WorkflowTransition).filter(
        models_extended.WorkflowTransition.project_id == project_id
    ).all()
    
    result = []
    for t in transitions:
        from_status = db.query(models_extended.WorkflowStatus).filter(
            models_extended.WorkflowStatus.id == t.from_status_id
        ).first()
        to_status = db.query(models_extended.WorkflowStatus).filter(
            models_extended.WorkflowStatus.id == t.to_status_id
        ).first()
        
        result.append({
            "id": t.id,
            "from_status": {
                "id": from_status.id if from_status else None,
                "name": from_status.name if from_status else "Unknown"
            },
            "to_status": {
                "id": to_status.id if to_status else None,
                "name": to_status.name if to_status else "Unknown"
            },
            "name": t.name,
            "requires_approval": t.requires_approval
        })
    
    return result


@router.post("/transitions/{project_id}", response_model=dict)
def create_workflow_transition(
    project_id: int,
    req: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a workflow transition"""
    transition = models_extended.WorkflowTransition(
        project_id=project_id,
        from_status_id=req.get("from_status_id"),
        to_status_id=req.get("to_status_id"),
        name=req.get("name"),
        requires_approval=req.get("requires_approval", False),
        created_at=datetime.utcnow()
    )
    
    db.add(transition)
    db.commit()
    db.refresh(transition)
    
    return {
        "id": transition.id,
        "name": transition.name,
        "from_status_id": transition.from_status_id,
        "to_status_id": transition.to_status_id,
        "message": "Transition created"
    }


@router.post("/validate-transition")
def validate_status_transition(
    req: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Validate if a status transition is allowed"""
    task_id = req.get("task_id")
    new_status_id = req.get("new_status_id")
    
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if transition exists
    # This is a simplified check - in real app would check from_status -> to_status
    allowed_transitions = db.query(models_extended.WorkflowTransition).filter(
        models_extended.WorkflowTransition.project_id == task.project_id
    ).all()
    
    # For now, allow all basic transitions
    return {
        "task_id": task_id,
        "current_status": task.status,
        "new_status": new_status_id,
        "is_allowed": True,
        "requires_approval": False
    }
