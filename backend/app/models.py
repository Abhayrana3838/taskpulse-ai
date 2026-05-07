from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    bio = Column(Text, default="")
    avatar_url = Column(String(500), default="")
    role = Column(String(50), default="Member")
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="owner")
    assigned_tasks = relationship("Task", back_populates="assignee")
    comments = relationship("Comment", back_populates="author")
    settings = relationship("UserSettings", back_populates="user", uselist=False)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, default="")
    icon = Column(String(50), default="token")
    status = Column(String(20), default="active")  # active, planning, staging, completed
    progress = Column(Float, default=0.0)
    color = Column(String(20), default="primary")  # primary, secondary, tertiary
    due_date = Column(String(50), default="")
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_key = Column(String(20), unique=True, nullable=False)  # e.g., AE-102
    title = Column(String(300), nullable=False)
    description = Column(Text, default="")
    project_id = Column(Integer, ForeignKey("projects.id"))
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(20), default="todo")  # todo, in_progress, done
    priority = Column(String(10), default="medium")  # high, medium, low
    due_date = Column(String(50), default="")
    tags = Column(JSON, default=list)
    checklist = Column(JSON, default=list)  # [{text: str, done: bool}]
    epic_id = Column(Integer, ForeignKey("epics.id"), nullable=True)
    issue_type = Column(String(20), default="task")  # task, bug, story, epic, subtask
    story_points = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="assigned_tasks")
    comments = relationship("Comment", back_populates="task", cascade="all, delete-orphan")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    task = relationship("Task", back_populates="comments")
    author = relationship("User", back_populates="comments")


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    theme = Column(String(10), default="dark")  # dark, light, system
    email_digest = Column(Boolean, default=True)
    push_alerts = Column(Boolean, default=True)
    team_activity = Column(Boolean, default=False)

    user = relationship("User", back_populates="settings")


class ActivityLog(Base):
    """Tracks all user activities like Jira - who did what, when"""
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action_type = Column(String(50), nullable=False)  # created, updated, deleted, commented, moved, assigned
    entity_type = Column(String(50), nullable=False)  # task, project, comment
    entity_id = Column(Integer, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    description = Column(Text, nullable=False)  # Human readable description
    meta_data = Column(JSON, default=dict)  # Additional data like old_value, new_value
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    project = relationship("Project")


class Notification(Base):
    """User notifications for mentions, assignments, updates"""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)  # mention, assignment, update, comment
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    entity_type = Column(String(50))  # task, project
    entity_id = Column(Integer)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class TimeEntry(Base):
    """Time tracking for tasks like Jira"""
    __tablename__ = "time_entries"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    description = Column(Text, default="")
    duration_minutes = Column(Integer, nullable=False)  # Time spent in minutes
    started_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    task = relationship("Task")
    user = relationship("User")


class Sprint(Base):
    """Sprint management for agile workflow"""
    __tablename__ = "sprints"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    goal = Column(Text, default="")
    status = Column(String(20), default="planning")  # planning, active, completed
    start_date = Column(String(50), default="")
    end_date = Column(String(50), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project")
    tasks = relationship("Task", secondary="sprint_tasks")


# Association table for Sprint-Task many-to-many
from sqlalchemy import Table
sprint_tasks = Table(
    "sprint_tasks",
    Base.metadata,
    Column("sprint_id", Integer, ForeignKey("sprints.id")),
    Column("task_id", Integer, ForeignKey("tasks.id"))
)
