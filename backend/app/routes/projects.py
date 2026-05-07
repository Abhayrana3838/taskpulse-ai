from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=List[schemas.ProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """List all projects."""
    projects = db.query(models.Project).all()
    result = []
    for p in projects:
        task_count = db.query(models.Task).filter(models.Task.project_id == p.id).count()
        # Get unique assignees count as member_count
        members = (
            db.query(models.Task.assignee_id)
            .filter(models.Task.project_id == p.id, models.Task.assignee_id.isnot(None))
            .distinct()
            .count()
        )
        resp = schemas.ProjectResponse(
            id=p.id,
            name=p.name,
            description=p.description,
            icon=p.icon,
            status=p.status,
            color=p.color,
            progress=p.progress,
            due_date=p.due_date,
            owner_id=p.owner_id,
            created_at=p.created_at,
            member_count=members,
        )
        result.append(resp)
    return result


@router.get("/{project_id}", response_model=schemas.ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get a single project by ID."""
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    members = (
        db.query(models.Task.assignee_id)
        .filter(models.Task.project_id == project.id, models.Task.assignee_id.isnot(None))
        .distinct()
        .count()
    )
    return schemas.ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        icon=project.icon,
        status=project.status,
        color=project.color,
        progress=project.progress,
        due_date=project.due_date,
        owner_id=project.owner_id,
        created_at=project.created_at,
        member_count=members,
    )


@router.post("", response_model=schemas.ProjectResponse)
def create_project(
    req: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a new project."""
    project = models.Project(
        name=req.name,
        description=req.description,
        icon=req.icon,
        status=req.status,
        color=req.color,
        due_date=req.due_date,
        owner_id=current_user.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return schemas.ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        icon=project.icon,
        status=project.status,
        color=project.color,
        progress=0.0,
        due_date=project.due_date,
        owner_id=project.owner_id,
        created_at=project.created_at,
        member_count=0,
    )


@router.put("/{project_id}", response_model=schemas.ProjectResponse)
def update_project(
    project_id: int,
    req: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update project details."""
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)

    db.commit()
    db.refresh(project)
    members = (
        db.query(models.Task.assignee_id)
        .filter(models.Task.project_id == project.id, models.Task.assignee_id.isnot(None))
        .distinct()
        .count()
    )
    return schemas.ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        icon=project.icon,
        status=project.status,
        color=project.color,
        progress=project.progress,
        due_date=project.due_date,
        owner_id=project.owner_id,
        created_at=project.created_at,
        member_count=members,
    )
