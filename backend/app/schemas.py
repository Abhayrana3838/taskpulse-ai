from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ── Auth ──────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── User ──────────────────────────────────────────────
class UserBase(BaseModel):
    name: str
    email: str
    bio: Optional[str] = ""
    avatar_url: Optional[str] = ""
    role: Optional[str] = "Member"


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


# ── User Settings ─────────────────────────────────────
class UserSettingsResponse(BaseModel):
    theme: str = "dark"
    email_digest: bool = True
    push_alerts: bool = True
    team_activity: bool = False

    class Config:
        from_attributes = True


class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = None
    email_digest: Optional[bool] = None
    push_alerts: Optional[bool] = None
    team_activity: Optional[bool] = None


# ── Project ───────────────────────────────────────────
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = ""
    icon: Optional[str] = "token"
    status: Optional[str] = "active"
    color: Optional[str] = "primary"
    due_date: Optional[str] = ""


class ProjectCreate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: int
    progress: float
    owner_id: Optional[int] = None
    created_at: datetime
    member_count: Optional[int] = 0

    class Config:
        from_attributes = True


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[float] = None
    due_date: Optional[str] = None


# ── Task ──────────────────────────────────────────────
class ChecklistItem(BaseModel):
    text: str
    done: bool = False


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = ""
    status: Optional[str] = "todo"
    priority: Optional[str] = "medium"
    due_date: Optional[str] = ""
    tags: Optional[list[str]] = []
    checklist: Optional[list[ChecklistItem]] = []


class TaskCreate(TaskBase):
    project_id: int
    assignee_id: Optional[int] = None


class TaskResponse(TaskBase):
    id: int
    task_key: str
    project_id: int
    assignee_id: Optional[int] = None
    assignee: Optional[UserResponse] = None
    created_at: datetime
    comment_count: Optional[int] = 0

    class Config:
        from_attributes = True


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee_id: Optional[int] = None
    due_date: Optional[str] = None
    tags: Optional[list[str]] = None
    checklist: Optional[list[ChecklistItem]] = None


# ── Comment ───────────────────────────────────────────
class CommentCreate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: int
    content: str
    user_id: int
    author: Optional[UserResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Dashboard ─────────────────────────────────────────
class DashboardStats(BaseModel):
    active_projects: int
    total_tasks: int
    team_pulse_score: int
    tasks_due_today: int
    project_increase_pct: float


class ActivityItem(BaseModel):
    id: int
    title: str
    user_name: str
    time_ago: str
    detail: Optional[str] = ""
    color: str = "primary"


class VelocityData(BaseModel):
    label: str
    value: float


class OverdueTask(BaseModel):
    id: int
    title: str
    assignee_name: str
    overdue_by: str


# ── Activity Log ────────────────────────────────────────
class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_avatar: Optional[str] = ""
    action_type: str  # created, updated, deleted, commented, moved, assigned
    entity_type: str  # task, project, comment
    entity_id: int
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    description: str
    meta_data: dict = {}
    created_at: datetime
    time_ago: str

    class Config:
        from_attributes = True


# ── Notifications ────────────────────────────────────
class NotificationResponse(BaseModel):
    id: int
    type: str  # mention, assignment, update, comment
    title: str
    message: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    is_read: bool
    created_at: datetime
    time_ago: str

    class Config:
        from_attributes = True


class NotificationCreate(BaseModel):
    user_id: int
    type: str
    title: str
    message: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None


# ── Time Tracking ─────────────────────────────────────
class TimeEntryResponse(BaseModel):
    id: int
    task_id: int
    task_title: str
    user_id: int
    user_name: str
    description: str
    duration_minutes: int
    started_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class TimeEntryCreate(BaseModel):
    task_id: int
    description: str
    duration_minutes: int


# ── Sprints ────────────────────────────────────────────
class SprintResponse(BaseModel):
    id: int
    name: str
    project_id: int
    project_name: str
    goal: str
    status: str  # planning, active, completed
    start_date: str
    end_date: str
    task_count: int
    completed_tasks: int
    created_at: datetime

    class Config:
        from_attributes = True


class SprintCreate(BaseModel):
    name: str
    project_id: int
    goal: str
    start_date: str
    end_date: str


class SprintUpdate(BaseModel):
    name: Optional[str] = None
    goal: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
