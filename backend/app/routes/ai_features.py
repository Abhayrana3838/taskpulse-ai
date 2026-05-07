"""
AI-Powered Features API
Smart automation, insights, and intelligent task management
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import asyncio
from .. import models, models_extended, schemas
from ..database import get_db
from ..auth import get_current_user
from ..ai_service import ai_service

router = APIRouter(prefix="/api/ai", tags=["ai-features"])


@router.post("/analyze-duplicate")
async def analyze_duplicate_task(
    req: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    AI-powered duplicate task detection
    Analyzes new task against all existing tasks
    """
    task_title = req.get("title", "")
    task_description = req.get("description", "")
    project_id = req.get("project_id")
    
    # Get existing tasks from the same project
    query = db.query(models.Task)
    if project_id:
        query = query.filter(models.Task.project_id == project_id)
    
    existing_tasks = query.limit(50).all()
    
    task_list = [
        {
            "id": t.id,
            "task_key": t.task_key,
            "title": t.title,
            "description": t.description,
            "status": t.status
        }
        for t in existing_tasks
    ]
    
    # Call AI service
    result = await ai_service.analyze_task_duplicate(task_title, task_description, task_list)
    
    # Store detection results
    if "duplicates" in result and result["duplicates"]:
        for dup in result["duplicates"]:
            if dup.get("similarity_score", 0) > 0.7:  # High similarity threshold
                detection = models_extended.DuplicateTaskDetection(
                    source_task_id=0,  # New task (not created yet)
                    potential_duplicate_task_id=dup.get("task_id"),
                    similarity_score=dup.get("similarity_score", 0),
                    matching_fields=dup.get("matching_fields", []),
                    is_dismissed=False,
                    created_at=datetime.utcnow()
                )
                db.add(detection)
        db.commit()
    
    return {
        "potential_duplicates": result.get("duplicates", []),
        "analysis": result.get("analysis", ""),
        "recommendation": result.get("recommendation", "")
    }


@router.post("/estimate-time/{task_id}")
async def estimate_task_time(
    task_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    AI-powered time estimation for a task
    Considers task complexity and historical data
    """
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Get similar completed tasks
    similar_tasks = db.query(models.Task).filter(
        models.Task.project_id == task.project_id,
        models.Task.status == "done"
    ).limit(10).all()
    
    history = [
        {
            "title": t.title,
            "description": t.description[:200] if t.description else "",
            "time_entries": [
                {"duration": te.duration_minutes}
                for te in db.query(models_extended.TimeEntry).filter(
                    models_extended.TimeEntry.task_id == t.id
                ).all()
            ]
        }
        for t in similar_tasks
    ]
    
    # Get AI estimate
    result = await ai_service.estimate_task_time(
        task.title,
        task.description or "",
        history
    )
    
    # Store prediction
    prediction = models_extended.TimePrediction(
        task_id=task_id,
        predicted_hours=result.get("estimated_hours", 4),
        confidence_interval_low=result.get("confidence_interval_low", 0),
        confidence_interval_high=result.get("confidence_interval_high", 0),
        factors=result.get("factors", {}),
        created_at=datetime.utcnow()
    )
    db.add(prediction)
    db.commit()
    
    # Create AI insight
    insight = models_extended.AIInsight(
        project_id=task.project_id,
        task_id=task_id,
        user_id=current_user.id,
        insight_type="time_estimate",
        title="Time Estimate Available",
        description=f"AI predicts this task will take {result.get('estimated_hours', 4)} hours (confidence: {result.get('confidence_score', 0.5):.0%})",
        confidence_score=result.get("confidence_score", 0.5),
        metadata=result,
        is_read=False,
        created_at=datetime.utcnow()
    )
    db.add(insight)
    db.commit()
    
    return {
        "task_id": task_id,
        "estimated_hours": result.get("estimated_hours", 4),
        "confidence_score": result.get("confidence_score", 0.5),
        "confidence_interval": {
            "low": result.get("confidence_interval_low", 0),
            "high": result.get("confidence_interval_high", 0)
        },
        "factors": result.get("factors", {}),
        "explanation": result.get("explanation", "")
    }


@router.post("/recommend-assignee/{task_id}")
async def recommend_assignee(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Smart auto-assignment recommendations
    Based on skills, workload, and past performance
    """
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Get team members
    team_members = db.query(models.User).limit(20).all()
    
    # Get workload data for each member
    workload_data = {}
    for member in team_members:
        active_tasks = db.query(models.Task).filter(
            models.Task.assignee_id == member.id,
            models.Task.status.in_(["todo", "in_progress"])
        ).count()
        
        completed_tasks = db.query(models.Task).filter(
            models.Task.assignee_id == member.id,
            models.Task.status == "done"
        ).count()
        
        workload_data[member.id] = {
            "active_tasks": active_tasks,
            "completed_tasks": completed_tasks,
            "workload_score": min(active_tasks / 10, 1.0)  # 0-1, higher = busier
        }
    
    members_list = [
        {
            "id": m.id,
            "name": m.name,
            "role": m.role,
            "bio": m.bio
        }
        for m in team_members
    ]
    
    # Get AI recommendation
    result = await ai_service.recommend_assignee(
        task.title,
        task.description or "",
        members_list,
        workload_data
    )
    
    # Store recommendation
    if result.get("recommended_user_id"):
        recommendation = models_extended.SmartAssignment(
            task_id=task_id,
            recommended_user_id=result["recommended_user_id"],
            reason=result.get("reason", ""),
            match_score=result.get("match_score", 0),
            factors=result.get("factors", {}),
            is_applied=False,
            created_at=datetime.utcnow()
        )
        db.add(recommendation)
        db.commit()
        
        # Create AI insight
        insight = models_extended.AIInsight(
            project_id=task.project_id,
            task_id=task_id,
            user_id=current_user.id,
            insight_type="assignment_recommendation",
            title="Smart Assignment Suggestion",
            description=f"AI recommends assigning to {result.get('recommended_name', 'team member')} ({result.get('match_score', 0):.0%} match)",
            confidence_score=result.get("match_score", 0),
            metadata=result,
            is_read=False,
            created_at=datetime.utcnow()
        )
        db.add(insight)
        db.commit()
    
    return {
        "task_id": task_id,
        "recommendations": [
            {
                "user_id": result.get("recommended_user_id"),
                "name": result.get("recommended_name"),
                "match_score": result.get("match_score", 0),
                "reason": result.get("reason", ""),
                "factors": result.get("factors", {})
            }
        ] if result.get("recommended_user_id") else [],
        "alternative_assignees": result.get("alternatives", [])
    }


@router.post("/analyze-sentiment/{task_id}")
async def analyze_task_sentiment(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Sentiment analysis for task comments
    Detects team mood and urgency
    """
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Get all comments
    comments = db.query(models.Comment).filter(
        models.Comment.task_id == task_id
    ).order_by(models.Comment.created_at.desc()).all()
    
    all_text = f"{task.title}\n{task.description or ''}\n"
    for comment in comments[:10]:  # Last 10 comments
        all_text += f"{comment.content}\n"
    
    # Analyze sentiment
    result = await ai_service.analyze_sentiment(all_text)
    
    # Store analysis
    sentiment = models_extended.SentimentAnalysis(
        task_id=task_id,
        overall_sentiment=result.get("sentiment", "neutral"),
        sentiment_score=result.get("score", 0),
        urgency_level=result.get("urgency_level", "normal"),
        team_mood=result.get("team_mood", "neutral"),
        created_at=datetime.utcnow()
    )
    db.add(sentiment)
    db.commit()
    
    # If high urgency detected, create insight
    if result.get("urgency_level") in ["high", "critical"]:
        insight = models_extended.AIInsight(
            project_id=task.project_id,
            task_id=task_id,
            user_id=current_user.id,
            insight_type="urgency_alert",
            title="High Urgency Detected",
            description="AI analysis detected high urgency in task discussion. Consider prioritizing.",
            confidence_score=abs(result.get("score", 0)),
            metadata=result,
            is_read=False,
            created_at=datetime.utcnow()
        )
        db.add(insight)
        db.commit()
    
    return {
        "task_id": task_id,
        "sentiment": result.get("sentiment", "neutral"),
        "score": result.get("score", 0),
        "urgency_level": result.get("urgency_level", "normal"),
        "team_mood": result.get("team_mood", "neutral"),
        "keywords": result.get("keywords", [])
    }


@router.get("/insights", response_model=List[dict])
def get_ai_insights(
    project_id: int = None,
    is_read: bool = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Get AI-generated insights for user
    """
    query = db.query(models_extended.AIInsight).filter(
        models_extended.AIInsight.user_id == current_user.id
    )
    
    if project_id:
        query = query.filter(models_extended.AIInsight.project_id == project_id)
    if is_read is not None:
        query = query.filter(models_extended.AIInsight.is_read == is_read)
    
    insights = query.order_by(models_extended.AIInsight.created_at.desc()).limit(50).all()
    
    return [
        {
            "id": insight.id,
            "insight_type": insight.insight_type,
            "title": insight.title,
            "description": insight.description,
            "confidence_score": insight.confidence_score,
            "is_read": insight.is_read,
            "task_id": insight.task_id,
            "project_id": insight.project_id,
            "created_at": insight.created_at.isoformat() if hasattr(insight.created_at, 'isoformat') else str(insight.created_at) if insight.created_at else None,
            "metadata": insight.metadata
        }
        for insight in insights
    ]


@router.post("/insights/{insight_id}/mark-read")
def mark_insight_read(
    insight_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Mark an AI insight as read"""
    insight = db.query(models_extended.AIInsight).filter(
        models_extended.AIInsight.id == insight_id,
        models_extended.AIInsight.user_id == current_user.id
    ).first()
    
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")
    
    insight.is_read = True
    db.commit()
    
    return {"success": True, "message": "Insight marked as read"}


@router.post("/predict-risks/{project_id}")
async def predict_project_risks(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    AI risk prediction for project
    Analyzes project health and identifies potential issues
    """
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get project data
    tasks = db.query(models.Task).filter(
        models.Task.project_id == project_id
    ).all()
    
    # Get recent activity
    recent_activity = db.query(models_extended.ActivityLog).filter(
        models_extended.ActivityLog.project_id == project_id
    ).order_by(models_extended.ActivityLog.created_at.desc()).limit(20).all()
    
    project_data = {
        "id": project.id,
        "name": project.name,
        "status": project.status,
        "progress": project.progress,
        "total_tasks": len(tasks),
        "completed_tasks": sum(1 for t in tasks if t.status == "done"),
        "overdue_tasks": sum(1 for t in tasks if t.due_date and datetime.strptime(t.due_date, "%Y-%m-%d") < datetime.now()),
        "blocked_tasks": sum(1 for t in tasks if hasattr(t, "status") and t.status == "blocked")
    }
    
    task_list = [
        {
            "id": t.id,
            "title": t.title,
            "status": t.status,
            "priority": t.priority,
            "due_date": t.due_date
        }
        for t in tasks
    ]
    
    # Get AI risk analysis
    risks = await ai_service.predict_project_risks(project_data, task_list)
    
    # Create insights for high-severity risks
    for risk in risks:
        if risk.get("severity") in ["high", "critical"]:
            insight = models_extended.AIInsight(
                project_id=project_id,
                user_id=current_user.id,
                insight_type="risk_assessment",
                title=f"Risk Alert: {risk.get('risk_type', 'Unknown')}",
                description=risk.get("description", ""),
                confidence_score=0.8,
                metadata=risk,
                is_read=False,
                created_at=datetime.utcnow()
            )
            db.add(insight)
    
    db.commit()
    
    return {
        "project_id": project_id,
        "risks": risks,
        "project_health_score": calculate_project_health(tasks),
        "generated_at": datetime.utcnow().isoformat()
    }


def calculate_project_health(tasks: List[models.Task]) -> float:
    """Calculate overall project health score"""
    if not tasks:
        return 100.0
    
    total = len(tasks)
    completed = sum(1 for t in tasks if t.status == "done")
    in_progress = sum(1 for t in tasks if t.status == "in_progress")
    
    # Simple scoring
    score = (completed / total * 50) + (in_progress / total * 30) + 20
    return min(score, 100.0)


@router.post("/suggest-subtasks/{task_id}")
async def suggest_subtasks(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    AI suggests breaking down a large task into subtasks
    """
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Get AI suggestions
    suggestions = await ai_service.suggest_subtasks(task.title, task.description or "")
    
    return {
        "task_id": task_id,
        "suggested_subtasks": suggestions,
        "total_estimated_hours": sum(s.get("estimated_hours", 0) for s in suggestions)
    }


@router.post("/voice-command")
async def process_voice_command(
    req: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Process voice commands using AI
    """
    transcription = req.get("transcription", "")
    
    # Parse voice command
    result = await ai_service.parse_voice_command(transcription)
    
    # Store command
    voice_cmd = models_extended.VoiceCommand(
        user_id=current_user.id,
        command_text=transcription,
        parsed_intent=result.get("intent", "unknown"),
        parsed_entities=result.get("entities", {}),
        was_successful=False,  # Will update after execution
        result="",
        created_at=datetime.utcnow()
    )
    db.add(voice_cmd)
    db.commit()
    
    # Try to execute the command
    execution_result = await execute_voice_command(result, current_user, db)
    
    # Update command result
    voice_cmd.was_successful = execution_result.get("success", False)
    voice_cmd.result = execution_result.get("message", "")
    db.commit()
    
    return {
        "intent": result.get("intent"),
        "entities": result.get("entities"),
        "confidence": result.get("confidence", 0),
        "execution": execution_result
    }


async def execute_voice_command(parsed: dict, user: models.User, db: Session) -> dict:
    """Execute the parsed voice command"""
    intent = parsed.get("intent", "unknown")
    entities = parsed.get("entities", {})
    
    try:
        if intent == "create_task":
            # Create task from voice
            title = entities.get("title", "Voice Task")
            project_id = entities.get("project_id", 1)
            
            task_count = db.query(models.Task).filter(
                models.Task.project_id == project_id
            ).count()
            
            prefix = "TASK"
            task_key = f"{prefix}-{task_count + 100:03d}"
            
            task = models.Task(
                task_key=task_key,
                title=title,
                description=entities.get("description", ""),
                project_id=project_id,
                status="todo",
                priority=entities.get("priority", "medium"),
                created_at=datetime.utcnow()
            )
            db.add(task)
            db.commit()
            
            return {"success": True, "message": f"Created task {task_key}", "task_id": task.id}
        
        elif intent == "update_status":
            task_id = entities.get("task_id")
            new_status = entities.get("status")
            
            if task_id and new_status:
                task = db.query(models.Task).filter(models.Task.id == task_id).first()
                if task:
                    task.status = new_status
                    db.commit()
                    return {"success": True, "message": f"Updated task status to {new_status}"}
            
            return {"success": False, "message": "Could not find task or status"}
        
        elif intent == "list_tasks":
            project_id = entities.get("project_id")
            query = db.query(models.Task).filter(models.Task.assignee_id == user.id)
            if project_id:
                query = query.filter(models.Task.project_id == project_id)
            
            tasks = query.limit(5).all()
            task_list = [f"{t.task_key}: {t.title}" for t in tasks]
            
            return {"success": True, "message": f"Your tasks: {', '.join(task_list)}"}
        
        else:
            return {"success": False, "message": f"Unknown intent: {intent}"}
    
    except Exception as e:
        return {"success": False, "message": f"Error executing command: {str(e)}"}


@router.post("/generate-insights/{project_id}")
async def generate_ai_insights(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Generate AI-powered insights for a project using OpenAI GPT-4
    """
    import os
    
    # Check if OpenAI API key is configured
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured. Please set OPENAI_API_KEY in .env file.")
    
    # Get project data
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        # Get project tasks
        tasks = db.query(models.Task).filter(models.Task.project_id == project_id).all()
        task_list = [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "status": t.status,
                "priority": t.priority,
                "assignee_id": t.assignee_id,
                "due_date": t.due_date.isoformat() if hasattr(t.due_date, 'isoformat') else str(t.due_date) if t.due_date else None,
            }
            for t in tasks
        ]
        
        # Get team members
        team_members = db.query(models.User).filter(models.User.role == "member").all()
        team_list = [{"id": u.id, "name": u.name} for u in team_members]
        
        print(f"🔄 Generating insights for project: {project.name} (ID: {project_id})")
        print(f"📋 Tasks: {len(task_list)}, Team: {len(team_list)}")
        
        # Generate insights using AI
        insights = await ai_service.generate_project_insights(
            {
                "id": project.id,
                "name": project.name,
                "progress": project.progress or 0,
                "status": project.status,
            },
            task_list,
            team_list
        )
        
        print(f"✅ Generated {len(insights)} insights")
        
        if not insights:
            return {
                "insights": [],
                "generated_count": 0,
                "message": "No insights generated. This may be due to insufficient data or API issues."
            }
        
        # Save insights to database
        saved_insights = []
        for insight_data in insights:
            insight = models_extended.AIInsight(
                user_id=current_user.id,
                project_id=project_id,
                insight_type=insight_data.get("insight_type", "general"),
                title=insight_data.get("title", "AI Insight"),
                description=insight_data.get("description", ""),
                confidence_score=insight_data.get("confidence_score", 0.8),
                is_read=False,
            )
            db.add(insight)
            saved_insights.append(insight)
        
        db.commit()
        
        # Helper to format datetime
        def format_datetime(dt):
            if hasattr(dt, 'isoformat'):
                return dt.isoformat()
            elif isinstance(dt, str):
                return dt
            return datetime.now().isoformat()
        
        return {
            "insights": [
                {
                    "id": i.id,
                    "title": i.title,
                    "description": i.description,
                    "insight_type": i.insight_type,
                    "confidence_score": i.confidence_score,
                    "created_at": format_datetime(i.created_at),
                }
                for i in saved_insights
            ],
            "generated_count": len(saved_insights),
        }
    except Exception as e:
        print(f"❌ Error generating insights: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")
