"""
Third-party Integrations API
GitHub, GitLab, Slack, Discord integrations
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import hashlib
import hmac
import json
from .. import models, models_extended, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/integrations", tags=["integrations"])


@router.get("/{project_id}", response_model=List[dict])
def list_integrations(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """List all integrations for a project"""
    integrations = db.query(models_extended.Integration).filter(
        models_extended.Integration.project_id == project_id
    ).all()
    
    return [
        {
            "id": i.id,
            "type": i.integration_type,
            "name": i.name,
            "is_active": i.is_active,
            "last_sync": i.last_sync.isoformat() if hasattr(i.last_sync, 'isoformat') else str(i.last_sync) if i.last_sync else None,
            "created_at": i.created_at.isoformat() if hasattr(i.created_at, 'isoformat') else str(i.created_at) if i.created_at else None,
            "config": {k: v for k, v in i.config.items() if k not in ['api_key', 'token', 'secret']}  # Hide sensitive data
        }
        for i in integrations
    ]


@router.post("/{project_id}", response_model=dict)
def create_integration(
    project_id: int,
    req: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a new integration"""
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    integration = models_extended.Integration(
        project_id=project_id,
        integration_type=req.get("type"),
        name=req.get("name"),
        config=req.get("config", {}),
        is_active=True,
        created_at=datetime.utcnow()
    )
    
    db.add(integration)
    db.commit()
    db.refresh(integration)
    
    return {
        "id": integration.id,
        "type": integration.integration_type,
        "name": integration.name,
        "is_active": integration.is_active,
        "message": "Integration created successfully"
    }


@router.put("/{integration_id}", response_model=dict)
def update_integration(
    integration_id: int,
    req: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update integration settings"""
    integration = db.query(models_extended.Integration).filter(
        models_extended.Integration.id == integration_id
    ).first()
    
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    if "name" in req:
        integration.name = req["name"]
    if "config" in req:
        # Merge configs
        integration.config.update(req["config"])
    if "is_active" in req:
        integration.is_active = req["is_active"]
    
    db.commit()
    db.refresh(integration)
    
    return {
        "id": integration.id,
        "name": integration.name,
        "is_active": integration.is_active,
        "message": "Integration updated"
    }


@router.delete("/{integration_id}")
def delete_integration(
    integration_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Delete an integration"""
    integration = db.query(models_extended.Integration).filter(
        models_extended.Integration.id == integration_id
    ).first()
    
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    db.delete(integration)
    db.commit()
    
    return {"success": True, "message": "Integration deleted"}


@router.post("/{integration_id}/sync")
def sync_integration(
    integration_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Manually trigger integration sync"""
    integration = db.query(models_extended.Integration).filter(
        models_extended.Integration.id == integration_id
    ).first()
    
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    # Update last sync time
    integration.last_sync = datetime.utcnow()
    db.commit()
    
    return {
        "integration_id": integration_id,
        "last_sync": integration.last_sync.isoformat() if hasattr(integration.last_sync, 'isoformat') else str(integration.last_sync) if integration.last_sync else None,
        "status": "synced"
    }


@router.get("/{integration_id}/events", response_model=List[dict])
def get_integration_events(
    integration_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get events from an integration (commits, PRs, deployments)"""
    events = db.query(models_extended.IntegrationEvent).filter(
        models_extended.IntegrationEvent.integration_id == integration_id
    ).order_by(models_extended.IntegrationEvent.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": e.id,
            "event_type": e.event_type,
            "external_id": e.external_id,
            "title": e.title,
            "description": e.description,
            "author": e.author,
            "url": e.url,
            "metadata": e.metadata,
            "created_at": e.created_at.isoformat() if hasattr(e.created_at, 'isoformat') else str(e.created_at) if e.created_at else None,
            "task": {
                "id": e.task.id,
                "task_key": e.task.task_key,
                "title": e.task.title
            } if e.task else None
        }
        for e in events
    ]


# Webhook endpoints for receiving events from external services
@router.post("/webhook/github/{integration_id}")
async def github_webhook(
    integration_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    """Receive GitHub webhooks"""
    # Verify webhook signature
    body = await request.body()
    
    integration = db.query(models_extended.Integration).filter(
        models_extended.Integration.id == integration_id,
        models_extended.Integration.integration_type == "github"
    ).first()
    
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    # Process GitHub event
    event_type = request.headers.get("X-GitHub-Event", "")
    payload = json.loads(body)
    
    # Extract task reference from commit message or PR title
    task_ref = extract_task_reference(payload)
    
    if task_ref and event_type in ["push", "pull_request", "pull_request_review"]:
        # Create integration event
        event = models_extended.IntegrationEvent(
            integration_id=integration_id,
            task_id=task_ref.get("task_id"),
            event_type=map_github_event(event_type, payload),
            external_id=str(payload.get("after", payload.get("number", ""))),
            title=get_github_event_title(event_type, payload),
            description=get_github_event_description(event_type, payload),
            author=get_github_author(payload),
            url=get_github_url(event_type, payload),
            metadata=payload,
            created_at=datetime.utcnow()
        )
        db.add(event)
        db.commit()
    
    return {"status": "received"}


@router.post("/webhook/gitlab/{integration_id}")
async def gitlab_webhook(
    integration_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    """Receive GitLab webhooks"""
    body = await request.body()
    
    integration = db.query(models_extended.Integration).filter(
        models_extended.Integration.id == integration_id,
        models_extended.Integration.integration_type == "gitlab"
    ).first()
    
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    # Process GitLab event
    event_type = request.headers.get("X-GitLab-Event", "")
    payload = json.loads(body)
    
    # Extract task reference
    task_ref = extract_task_reference_gitlab(payload)
    
    if task_ref:
        event = models_extended.IntegrationEvent(
            integration_id=integration_id,
            task_id=task_ref.get("task_id"),
            event_type=map_gitlab_event(event_type, payload),
            external_id=str(payload.get("after", payload.get("merge_request", {}).get("iid", ""))),
            title=get_gitlab_event_title(event_type, payload),
            description=get_gitlab_event_description(event_type, payload),
            author=get_gitlab_author(payload),
            url=get_gitlab_url(event_type, payload),
            metadata=payload,
            created_at=datetime.utcnow()
        )
        db.add(event)
        db.commit()
    
    return {"status": "received"}


@router.post("/webhook/slack/{integration_id}")
async def slack_webhook(
    integration_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    """Receive Slack slash commands or events"""
    form_data = await request.form()
    
    integration = db.query(models_extended.Integration).filter(
        models_extended.Integration.id == integration_id,
        models_extended.Integration.integration_type == "slack"
    ).first()
    
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    command = form_data.get("command", "")
    text = form_data.get("text", "")
    
    # Handle Slack commands like /taskpulse create task "Title"
    if command == "/taskpulse":
        parts = text.split(maxsplit=1)
        action = parts[0] if parts else ""
        
        return {
            "response_type": "ephemeral",
            "text": f"Command '{action}' received. Processing..."
        }
    
    return {"status": "received"}


# Helper functions for webhook processing
def extract_task_reference(payload: dict) -> Optional[dict]:
    """Extract task reference from commit message or PR title"""
    # Look for patterns like "Fixes #123" or "TP-123" in commits or PRs
    import re
    
    # Check commits
    commits = payload.get("commits", [])
    for commit in commits:
        message = commit.get("message", "")
        # Match patterns like "TP-123", "#123", "Fixes TP-123"
        matches = re.findall(r'(?:TP-|#)(\d+)', message)
        if matches:
            return {"task_id": int(matches[0]), "reference": matches[0]}
    
    # Check PR title
    pr = payload.get("pull_request", {})
    title = pr.get("title", "")
    matches = re.findall(r'(?:TP-|#)(\d+)', title)
    if matches:
        return {"task_id": int(matches[0]), "reference": matches[0]}
    
    return None

def extract_task_reference_gitlab(payload: dict) -> Optional[dict]:
    """Extract task reference from GitLab payload"""
    import re
    
    # Check commits
    commits = payload.get("commits", [])
    for commit in commits:
        message = commit.get("message", "")
        matches = re.findall(r'(?:TP-|#)(\d+)', message)
        if matches:
            return {"task_id": int(matches[0]), "reference": matches[0]}
    
    # Check MR title
    mr = payload.get("merge_request", {})
    title = mr.get("title", "")
    matches = re.findall(r'(?:TP-|#)(\d+)', title)
    if matches:
        return {"task_id": int(matches[0]), "reference": matches[0]}
    
    return None

def map_github_event(event_type: str, payload: dict) -> str:
    """Map GitHub event to our event types"""
    if event_type == "push":
        return "commit"
    elif event_type == "pull_request":
        action = payload.get("action", "")
        if action == "opened":
            return "pr_opened"
        elif action == "closed" and payload.get("pull_request", {}).get("merged"):
            return "pr_merged"
        elif action == "closed":
            return "pr_closed"
    elif event_type == "pull_request_review":
        return "pr_review"
    elif event_type == "deployment":
        return "deployment"
    return "other"

def map_gitlab_event(event_type: str, payload: dict) -> str:
    """Map GitLab event to our event types"""
    if event_type == "Push Hook":
        return "commit"
    elif event_type == "Merge Request Hook":
        action = payload.get("object_attributes", {}).get("action", "")
        if action == "open":
            return "pr_opened"
        elif action == "merge":
            return "pr_merged"
    elif event_type == "Deployment Hook":
        return "deployment"
    return "other"

def get_github_event_title(event_type: str, payload: dict) -> str:
    """Extract title from GitHub event"""
    if event_type == "push":
        commits = payload.get("commits", [])
        if commits:
            return commits[0].get("message", "New commits")
    elif event_type == "pull_request":
        return payload.get("pull_request", {}).get("title", "Pull Request")
    return "GitHub Event"

def get_github_event_description(event_type: str, payload: dict) -> str:
    """Extract description from GitHub event"""
    if event_type == "push":
        commits = payload.get("commits", [])
        return f"{len(commits)} new commit(s)"
    elif event_type == "pull_request":
        return payload.get("pull_request", {}).get("body", "")[:500]
    return ""

def get_github_author(payload: dict) -> str:
    """Extract author from GitHub event"""
    if "pusher" in payload:
        return payload["pusher"].get("name", "Unknown")
    elif "pull_request" in payload:
        return payload["pull_request"].get("user", {}).get("login", "Unknown")
    return "Unknown"

def get_github_url(event_type: str, payload: dict) -> str:
    """Extract URL from GitHub event"""
    if event_type == "push":
        return payload.get("compare", "")
    elif event_type == "pull_request":
        return payload.get("pull_request", {}).get("html_url", "")
    return ""

def get_gitlab_event_title(event_type: str, payload: dict) -> str:
    """Extract title from GitLab event"""
    if event_type == "Push Hook":
        commits = payload.get("commits", [])
        if commits:
            return commits[0].get("message", "New commits")
    elif event_type == "Merge Request Hook":
        return payload.get("object_attributes", {}).get("title", "Merge Request")
    return "GitLab Event"

def get_gitlab_event_description(event_type: str, payload: dict) -> str:
    """Extract description from GitLab event"""
    if event_type == "Push Hook":
        commits = payload.get("commits", [])
        return f"{len(commits)} new commit(s)"
    elif event_type == "Merge Request Hook":
        return payload.get("object_attributes", {}).get("description", "")[:500]
    return ""

def get_gitlab_author(payload: dict) -> str:
    """Extract author from GitLab event"""
    if "user_name" in payload:
        return payload["user_name"]
    elif "user" in payload:
        return payload["user"].get("name", "Unknown")
    return "Unknown"

def get_gitlab_url(event_type: str, payload: dict) -> str:
    """Extract URL from GitLab event"""
    if event_type == "Push Hook":
        return payload.get("commits", [{}])[0].get("url", "")
    elif event_type == "Merge Request Hook":
        return payload.get("object_attributes", {}).get("url", "")
    return ""
