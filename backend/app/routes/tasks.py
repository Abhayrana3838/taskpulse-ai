from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user
from ..routes.activity import log_activity
import random

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=List[schemas.TaskResponse])
def list_tasks(
    project_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """List tasks, optionally filtered by project_id and/or status."""
    query = db.query(models.Task)
    if project_id:
        query = query.filter(models.Task.project_id == project_id)
    if status:
        query = query.filter(models.Task.status == status)
    tasks = query.order_by(models.Task.created_at.desc()).all()

    result = []
    for t in tasks:
        comment_count = db.query(models.Comment).filter(models.Comment.task_id == t.id).count()
        assignee = None
        if t.assignee:
            assignee = schemas.UserResponse(
                id=t.assignee.id,
                name=t.assignee.name,
                email=t.assignee.email,
                bio=t.assignee.bio,
                avatar_url=t.assignee.avatar_url,
                role=t.assignee.role,
                created_at=t.assignee.created_at,
            )
        result.append(schemas.TaskResponse(
            id=t.id,
            task_key=t.task_key,
            title=t.title,
            description=t.description,
            project_id=t.project_id,
            assignee_id=t.assignee_id,
            assignee=assignee,
            status=t.status,
            priority=t.priority,
            due_date=t.due_date,
            tags=t.tags or [],
            checklist=t.checklist or [],
            created_at=t.created_at,
            comment_count=comment_count,
        ))
    return result


@router.get("/{task_id}", response_model=schemas.TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get a single task with full details."""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    comment_count = db.query(models.Comment).filter(models.Comment.task_id == task.id).count()
    assignee = None
    if task.assignee:
        assignee = schemas.UserResponse(
            id=task.assignee.id,
            name=task.assignee.name,
            email=task.assignee.email,
            bio=task.assignee.bio,
            avatar_url=task.assignee.avatar_url,
            role=task.assignee.role,
            created_at=task.assignee.created_at,
        )
    return schemas.TaskResponse(
        id=task.id,
        task_key=task.task_key,
        title=task.title,
        description=task.description,
        project_id=task.project_id,
        assignee_id=task.assignee_id,
        assignee=assignee,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        tags=task.tags or [],
        checklist=task.checklist or [],
        created_at=task.created_at,
        comment_count=comment_count,
    )


@router.post("", response_model=schemas.TaskResponse)
def create_task(
    req: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a new task."""
    # Generate unique task key
    project = db.query(models.Project).filter(models.Project.id == req.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    task_count = db.query(models.Task).filter(models.Task.project_id == req.project_id).count()
    prefix = project.name[:2].upper()
    task_key = f"{prefix}-{task_count + 100:03d}"

    checklist_data = [item.model_dump() for item in (req.checklist or [])]

    task = models.Task(
        task_key=task_key,
        title=req.title,
        description=req.description,
        project_id=req.project_id,
        assignee_id=req.assignee_id,
        status=req.status,
        priority=req.priority,
        due_date=req.due_date,
        tags=req.tags or [],
        checklist=checklist_data,
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    # Log activity
    log_activity(
        db=db,
        user_id=current_user.id,
        action_type="created",
        entity_type="task",
        entity_id=task.id,
        description=f"created task {task.task_key}: {task.title}",
        project_id=task.project_id,
        meta_data={"task_key": task.task_key, "title": task.title}
    )

    return schemas.TaskResponse(
        id=task.id,
        task_key=task.task_key,
        title=task.title,
        description=task.description,
        project_id=task.project_id,
        assignee_id=task.assignee_id,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        tags=task.tags or [],
        checklist=task.checklist or [],
        created_at=task.created_at,
        comment_count=0,
    )


@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: int,
    req: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update a task (status, priority, assignee, etc.)."""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = req.model_dump(exclude_unset=True)
    if "checklist" in update_data and update_data["checklist"] is not None:
        update_data["checklist"] = [item.model_dump() if hasattr(item, "model_dump") else item for item in update_data["checklist"]]

    # Track changes for activity log
    old_status = task.status
    old_assignee = task.assignee_id

    for key, value in update_data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)

    # Log activity based on what changed
    if "status" in update_data and update_data["status"] != old_status:
        log_activity(
            db=db,
            user_id=current_user.id,
            action_type="moved",
            entity_type="task",
            entity_id=task.id,
            description=f"moved task {task.task_key} from {old_status} to {task.status}",
            project_id=task.project_id,
            meta_data={"task_key": task.task_key, "old_status": old_status, "new_status": task.status}
        )
    
    if "assignee_id" in update_data and update_data["assignee_id"] != old_assignee:
        assignee_name = "Unassigned"
        if task.assignee_id:
            assignee = db.query(models.User).filter(models.User.id == task.assignee_id).first()
            assignee_name = assignee.name if assignee else "Unknown"
        
        log_activity(
            db=db,
            user_id=current_user.id,
            action_type="assigned",
            entity_type="task",
            entity_id=task.id,
            description=f"assigned task {task.task_key} to {assignee_name}",
            project_id=task.project_id,
            meta_data={"task_key": task.task_key, "assignee_id": task.assignee_id, "assignee_name": assignee_name}
        )

    comment_count = db.query(models.Comment).filter(models.Comment.task_id == task.id).count()
    return schemas.TaskResponse(
        id=task.id,
        task_key=task.task_key,
        title=task.title,
        description=task.description,
        project_id=task.project_id,
        assignee_id=task.assignee_id,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        tags=task.tags or [],
        checklist=task.checklist or [],
        created_at=task.created_at,
        comment_count=comment_count,
    )


@router.get("/{task_id}/comments", response_model=List[schemas.CommentResponse])
def get_comments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get all comments for a task."""
    comments = (
        db.query(models.Comment)
        .filter(models.Comment.task_id == task_id)
        .order_by(models.Comment.created_at.desc())
        .all()
    )
    result = []
    for c in comments:
        author = None
        if c.author:
            author = schemas.UserResponse(
                id=c.author.id,
                name=c.author.name,
                email=c.author.email,
                bio=c.author.bio,
                avatar_url=c.author.avatar_url,
                role=c.author.role,
                created_at=c.author.created_at,
            )
        result.append(schemas.CommentResponse(
            id=c.id,
            content=c.content,
            user_id=c.user_id,
            author=author,
            created_at=c.created_at,
        ))
    return result


@router.post("/{task_id}/comments", response_model=schemas.CommentResponse)
def add_comment(
    task_id: int,
    req: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Add a comment to a task."""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    comment = models.Comment(
        task_id=task_id,
        user_id=current_user.id,
        content=req.content,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    author = schemas.UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        bio=current_user.bio,
        avatar_url=current_user.avatar_url,
        role=current_user.role,
        created_at=current_user.created_at,
    )
    return schemas.CommentResponse(
        id=comment.id,
        content=comment.content,
        user_id=comment.user_id,
        author=author,
        created_at=comment.created_at,
    )
