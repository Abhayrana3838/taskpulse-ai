"""
Extended Models for Enterprise Features
Adds missing Jira features + AI-powered innovations
"""
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON, Boolean, Enum, Table
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base


class IssueType(str, enum.Enum):
    """Jira-like issue types"""
    TASK = "task"
    BUG = "bug"
    STORY = "story"
    EPIC = "epic"
    SUBTASK = "subtask"
    SPIKE = "spike"


class WorkflowStatus(Base):
    """Custom workflow statuses for projects"""
    __tablename__ = "workflow_statuses"
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String(50), nullable=False)  # e.g., "In Review", "Testing", "Blocked"
    category = Column(String(20), default="in_progress")  # todo, in_progress, done
    color = Column(String(20), default="#0070f3")
    position = Column(Integer, default=0)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class WorkflowTransition(Base):
    """Workflow transitions between statuses"""
    __tablename__ = "workflow_transitions"
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    from_status_id = Column(Integer, ForeignKey("workflow_statuses.id"), nullable=False)
    to_status_id = Column(Integer, ForeignKey("workflow_statuses.id"), nullable=False)
    name = Column(String(100), nullable=False)  # e.g., "Start Progress", "Complete"
    requires_approval = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Epic(Base):
    """Epic management like Jira - large bodies of work"""
    __tablename__ = "epics"
    
    id = Column(Integer, primary_key=True, index=True)
    epic_key = Column(String(20), unique=True, nullable=False)  # e.g., E-101
    title = Column(String(300), nullable=False)
    description = Column(Text, default="")
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    color = Column(String(20), default="#0070f3")
    status = Column(String(20), default="in_progress")  # in_progress, done
    progress = Column(Float, default=0.0)  # 0-100
    story_points = Column(Integer, default=0)
    start_date = Column(String(50), default="")
    end_date = Column(String(50), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project")
    tasks = relationship("Task", backref="epic")


class Version(Base):
    """Version/Release management like Jira"""
    __tablename__ = "versions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # e.g., "v2.1.0", "Release 1"
    description = Column(Text, default="")
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    status = Column(String(20), default="unreleased")  # unreleased, released, archived
    release_date = Column(String(50), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project")


class Component(Base):
    """Component management like Jira - logical groups"""
    __tablename__ = "components"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, default="")
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    lead_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project")
    lead = relationship("User")


class Label(Base):
    """Labels for categorization"""
    __tablename__ = "labels"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    color = Column(String(20), default="#6b7280")
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class TaskLink(Base):
    """Task dependencies and relationships"""
    __tablename__ = "task_links"
    
    id = Column(Integer, primary_key=True)
    source_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    target_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    link_type = Column(String(50), nullable=False)  # blocks, is_blocked_by, relates_to, duplicates
    created_at = Column(DateTime, default=datetime.utcnow)


class Backlog(Base):
    """Backlog management for projects"""
    __tablename__ = "backlogs"
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, unique=True)
    is_ordered = Column(Boolean, default=True)  # Whether backlog is manually ordered
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project")


class BacklogItem(Base):
    """Items in backlog with ordering"""
    __tablename__ = "backlog_items"
    
    id = Column(Integer, primary_key=True)
    backlog_id = Column(Integer, ForeignKey("backlogs.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    position = Column(Integer, default=0)  # Order in backlog
    sprint_id = Column(Integer, ForeignKey("sprints.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    backlog = relationship("Backlog")
    task = relationship("Task")
    sprint = relationship("Sprint")


# Association tables for many-to-many relationships
task_labels = Table(
    "task_labels",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("tasks.id")),
    Column("label_id", Integer, ForeignKey("labels.id"))
)

task_components = Table(
    "task_components",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("tasks.id")),
    Column("component_id", Integer, ForeignKey("components.id"))
)


class AutomationRule(Base):
    """Automation rules like Jira - trigger actions based on events"""
    __tablename__ = "automation_rules"
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String(200), nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Trigger conditions
    trigger_event = Column(String(50), nullable=False)  # task_created, status_changed, etc.
    trigger_conditions = Column(JSON, default=dict)  # {"status": "done", "priority": "high"}
    
    # Actions to perform
    actions = Column(JSON, default=list)  # [{"type": "assign", "value": "user_id"}]
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RoadmapItem(Base):
    """Roadmap planning for epics"""
    __tablename__ = "roadmap_items"
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    epic_id = Column(Integer, ForeignKey("epics.id"), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    progress = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project")
    epic = relationship("Epic")


class AIInsight(Base):
    """AI-generated insights and recommendations"""
    __tablename__ = "ai_insights"
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    insight_type = Column(String(50), nullable=False)  # risk_assessment, duplicate_detection, time_estimate, assignment_recommendation
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    confidence_score = Column(Float, default=0.0)  # 0-1 AI confidence
    is_read = Column(Boolean, default=False)
    meta_data = Column(JSON, default=dict)  # Additional AI data
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project")
    task = relationship("Task")
    user = relationship("User")


class SentimentAnalysis(Base):
    """Sentiment analysis on comments"""
    __tablename__ = "sentiment_analyses"
    
    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=True)
    overall_sentiment = Column(String(20), default="neutral")  # positive, neutral, negative
    sentiment_score = Column(Float, default=0.0)  # -1 to 1
    urgency_level = Column(String(20), default="normal")  # low, normal, high, critical
    team_mood = Column(String(20), default="neutral")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    task = relationship("Task")
    comment = relationship("Comment")


class SmartAssignment(Base):
    """Smart auto-assignment recommendations"""
    __tablename__ = "smart_assignments"
    
    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    recommended_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(Text, nullable=False)  # Why this user is recommended
    match_score = Column(Float, default=0.0)  # 0-1 match score
    factors = Column(JSON, default=dict)  # {skills_match: 0.9, workload: 0.8, past_performance: 0.95}
    is_applied = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    task = relationship("Task")
    recommended_user = relationship("User")


class TimePrediction(Base):
    """AI time estimation predictions"""
    __tablename__ = "time_predictions"
    
    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False, unique=True)
    predicted_hours = Column(Float, nullable=False)
    confidence_interval_low = Column(Float, default=0)
    confidence_interval_high = Column(Float, default=0)
    factors = Column(JSON, default=dict)  # What influenced the prediction
    actual_hours = Column(Float, nullable=True)  # Filled in later for learning
    accuracy = Column(Float, nullable=True)  # How accurate was the prediction
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    task = relationship("Task")


class DuplicateTaskDetection(Base):
    """Duplicate/similar task detection"""
    __tablename__ = "duplicate_task_detections"
    
    id = Column(Integer, primary_key=True)
    source_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    potential_duplicate_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    similarity_score = Column(Float, default=0.0)  # 0-1 similarity
    matching_fields = Column(JSON, default=list)  # ["title", "description"]
    is_dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    source_task = relationship("Task", foreign_keys=[source_task_id])
    potential_duplicate = relationship("Task", foreign_keys=[potential_duplicate_task_id])


class Integration(Base):
    """Third-party integrations (GitHub, GitLab, Slack, etc.)"""
    __tablename__ = "integrations"
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    integration_type = Column(String(50), nullable=False)  # github, gitlab, slack, discord
    name = Column(String(100), nullable=False)
    config = Column(JSON, default=dict)  # API keys, webhooks, settings
    is_active = Column(Boolean, default=True)
    last_sync = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project")


class IntegrationEvent(Base):
    """Events from integrations (commits, PRs, deployments)"""
    __tablename__ = "integration_events"
    
    id = Column(Integer, primary_key=True)
    integration_id = Column(Integer, ForeignKey("integrations.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    event_type = Column(String(50), nullable=False)  # commit, pr_opened, pr_merged, deployment
    external_id = Column(String(200), nullable=False)  # GitHub commit SHA, PR number, etc.
    title = Column(String(300), nullable=False)
    description = Column(Text, default="")
    author = Column(String(100), default="")
    url = Column(String(500), default="")
    meta_data = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    integration = relationship("Integration")
    task = relationship("Task")


class VoiceCommand(Base):
    """Voice commands for hands-free task management"""
    __tablename__ = "voice_commands"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    command_text = Column(Text, nullable=False)  # Raw voice transcription
    parsed_intent = Column(String(50), nullable=False)  # create_task, update_status, etc.
    parsed_entities = Column(JSON, default=dict)  # {task_title: "...", assignee: "..."}
    was_successful = Column(Boolean, default=False)
    result = Column(Text, default="")  # What action was taken
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")


class ProjectTemplate(Base):
    """Project templates for quick project creation"""
    __tablename__ = "project_templates"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, default="")
    category = Column(String(50), default="software")  # software, marketing, design, etc.
    default_workflow = Column(JSON, default=dict)  # Predefined workflow statuses
    default_issue_types = Column(JSON, default=list)  # ["bug", "story", "task"]
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Filter(Base):
    """Saved filters/search queries"""
    __tablename__ = "filters"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, default="")
    query = Column(JSON, default=dict)  # {status: ["todo"], assignee: [1, 2], priority: ["high"]}
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")


class CustomField(Base):
    """Custom fields for tasks like Jira"""
    __tablename__ = "custom_fields"
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String(100), nullable=False)
    field_type = Column(String(50), nullable=False)  # text, number, date, select, multi_select, user
    options = Column(JSON, default=list)  # For select/multi_select
    is_required = Column(Boolean, default=False)
    default_value = Column(String(200), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project")


class TaskCustomField(Base):
    """Values for custom fields on tasks"""
    __tablename__ = "task_custom_fields"
    
    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    custom_field_id = Column(Integer, ForeignKey("custom_fields.id"), nullable=False)
    value = Column(Text, default="")  # Stored as string, parsed based on field_type
    
    task = relationship("Task")
    custom_field = relationship("CustomField")


class NotificationPreference(Base):
    """Granular notification preferences"""
    __tablename__ = "notification_preferences"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Email notifications
    email_task_assigned = Column(Boolean, default=True)
    email_task_completed = Column(Boolean, default=False)
    email_comments = Column(Boolean, default=True)
    email_mentions = Column(Boolean, default=True)
    email_digest_frequency = Column(String(20), default="daily")  # never, daily, weekly
    
    # Push notifications
    push_task_assigned = Column(Boolean, default=True)
    push_mentions = Column(Boolean, default=True)
    push_due_soon = Column(Boolean, default=True)
    
    # In-app notifications
    inapp_all = Column(Boolean, default=True)
    
    # Slack/Discord
    slack_enabled = Column(Boolean, default=False)
    slack_webhook = Column(String(500), default="")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", uselist=False)
