"""Seed the database with realistic demo data matching the TaskPulse HTML mockups."""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from . import models
from .auth import hash_password


def seed_database(db: Session):
    """Populate the database with demo data if empty."""
    # Check if already seeded
    if db.query(models.User).count() > 0:
        return

    # ── Users ─────────────────────────────────────────
    users_data = [
        {
            "name": "Alexander Vance",
            "email": "alex@taskpulse.ai",
            "password": "password123",
            "bio": "Product Designer at TaskPulse. Focused on building high-performance design systems and AI-driven task orchestration for enterprise teams.",
            "role": "Lead Designer",
        },
        {
            "name": "Jordan Devereaux",
            "email": "jordan@taskpulse.ai",
            "password": "password123",
            "bio": "Full-stack engineer specializing in cloud infrastructure and CI/CD pipelines.",
            "role": "Senior Engineer",
        },
        {
            "name": "Sarah Kim",
            "email": "sarah@taskpulse.ai",
            "password": "password123",
            "bio": "UX researcher and design lead with 8 years in enterprise SaaS.",
            "role": "Design Lead",
        },
        {
            "name": "Marcus Holloway",
            "email": "marcus@taskpulse.ai",
            "password": "password123",
            "bio": "Graphics engineer working on rendering pipelines and shader optimization.",
            "role": "Graphics Engineer",
        },
        {
            "name": "Priya Sharma",
            "email": "priya@taskpulse.ai",
            "password": "password123",
            "bio": "Security architect focused on enterprise-grade encryption and compliance.",
            "role": "Security Lead",
        },
        {
            "name": "Demo User",
            "email": "demo@taskpulse.ai",
            "password": "demo123",
            "bio": "Try out TaskPulse with this demo account!",
            "role": "Member",
        },
    ]

    users = []
    for u in users_data:
        user = models.User(
            name=u["name"],
            email=u["email"],
            password_hash=hash_password(u["password"]),
            bio=u["bio"],
            role=u["role"],
        )
        db.add(user)
        db.flush()

        # Create settings for each user
        settings = models.UserSettings(user_id=user.id)
        db.add(settings)
        users.append(user)

    # ── Projects ──────────────────────────────────────
    projects_data = [
        {
            "name": "Aether Engine",
            "description": "Next-gen rendering core optimization for high-density visual data processing and real-time shadows.",
            "icon": "token",
            "status": "active",
            "progress": 74.0,
            "color": "primary",
            "due_date": "DUE IN 4 DAYS",
            "owner": users[0],
        },
        {
            "name": "Q3 Roadmap",
            "description": "Strategic alignment of feature sets for the third quarter with a focus on developer experience and API stability.",
            "icon": "map",
            "status": "planning",
            "progress": 32.0,
            "color": "secondary",
            "due_date": "STARTING AUG 1",
            "owner": users[1],
        },
        {
            "name": "Client Portal",
            "description": "A secure, glass-themed interface for enterprise clients to monitor their infrastructure and service health logs.",
            "icon": "captive_portal",
            "status": "staging",
            "progress": 91.0,
            "color": "tertiary",
            "due_date": "FINAL REVIEW",
            "owner": users[2],
        },
        {
            "name": "Log Pipeline",
            "description": "Refactoring the data ingestion layer to handle 100k events per second with sub-millisecond latency.",
            "icon": "database",
            "status": "active",
            "progress": 48.0,
            "color": "primary",
            "due_date": "DUE IN 12 DAYS",
            "owner": users[3],
        },
        {
            "name": "Vault v2",
            "description": "End-to-end encryption upgrade for all stored secrets and sensitive environmental variables.",
            "icon": "security",
            "status": "planning",
            "progress": 15.0,
            "color": "secondary",
            "due_date": "EST. 3 MONTHS",
            "owner": users[4],
        },
    ]

    projects = []
    for p in projects_data:
        project = models.Project(
            name=p["name"],
            description=p["description"],
            icon=p["icon"],
            status=p["status"],
            progress=p["progress"],
            color=p["color"],
            due_date=p["due_date"],
            owner_id=p["owner"].id,
        )
        db.add(project)
        db.flush()
        projects.append(project)

    # ── Tasks (Aether Engine Kanban) ──────────────────
    tasks_data = [
        # To Do
        {
            "task_key": "AE-102",
            "title": "Implement Volumetric Lighting Pass",
            "description": "Integrate the new volumetric scattering algorithms into the primary rendering pipeline. This pass must handle light shafts and atmospheric density calculation without exceeding the 2ms frame budget on standard hardware.\n\nKey focus: GPU-accelerated ray marching and jittering techniques to minimize banding artifacts in low-light environments.",
            "project": projects[0],
            "assignee": users[3],
            "status": "todo",
            "priority": "high",
            "due_date": "Oct 24",
            "tags": ["PERFORMANCE", "RENDERING"],
            "checklist": [
                {"text": "Profile core rendering loops", "done": True},
                {"text": "Optimize shadow map sampling", "done": True},
                {"text": "Implement temporal anti-aliasing (TAA) integration", "done": False},
            ],
        },
        {
            "task_key": "AE-115",
            "title": "Shaders Refactoring",
            "description": "Refactor the shader compilation pipeline to support hot-reloading and better error diagnostics.",
            "project": projects[0],
            "assignee": users[2],
            "status": "todo",
            "priority": "medium",
            "due_date": "Oct 28",
            "tags": ["SHADERS"],
            "checklist": [],
        },
        {
            "task_key": "AE-098",
            "title": "Documentation: Buffer Layouts",
            "description": "Document all GPU buffer layout specifications for the new rendering backend.",
            "project": projects[0],
            "assignee": users[1],
            "status": "todo",
            "priority": "low",
            "due_date": "Nov 02",
            "tags": ["DOCS"],
            "checklist": [],
        },
        # In Progress
        {
            "task_key": "AE-201",
            "title": "Async Texture Loading",
            "description": "Moving resource creation to worker threads to eliminate main thread hitching during level transition.",
            "project": projects[0],
            "assignee": users[3],
            "status": "in_progress",
            "priority": "high",
            "due_date": "Oct 25",
            "tags": ["PERFORMANCE", "THREADING"],
            "checklist": [
                {"text": "Create worker thread pool", "done": True},
                {"text": "Implement texture streaming", "done": False},
                {"text": "Add fallback textures", "done": False},
            ],
        },
        {
            "task_key": "AE-184",
            "title": "Metal API Compatibility Layer",
            "description": "Build an abstraction layer for Apple Metal API to ensure cross-platform rendering support.",
            "project": projects[0],
            "assignee": users[1],
            "status": "in_progress",
            "priority": "medium",
            "due_date": "Oct 26",
            "tags": ["PLATFORM", "METAL"],
            "checklist": [],
        },
        # Done
        {
            "task_key": "AE-085",
            "title": "Root Motion System Fix",
            "description": "Fixed root motion blending artifacts in character animation pipeline.",
            "project": projects[0],
            "assignee": users[3],
            "status": "done",
            "priority": "high",
            "due_date": "Oct 20",
            "tags": ["ANIMATION"],
            "checklist": [
                {"text": "Identify root cause", "done": True},
                {"text": "Implement fix", "done": True},
                {"text": "QA verification", "done": True},
            ],
        },
        {
            "task_key": "AE-072",
            "title": "Vulkan Extension Support",
            "description": "Added support for VK_KHR_ray_tracing_pipeline extension.",
            "project": projects[0],
            "assignee": users[2],
            "status": "done",
            "priority": "medium",
            "due_date": "Oct 18",
            "tags": ["VULKAN", "RAY TRACING"],
            "checklist": [],
        },
        # Additional tasks for other projects
        {
            "task_key": "Q3-100",
            "title": "API Versioning Strategy",
            "description": "Define the versioning strategy for the public API v3 release.",
            "project": projects[1],
            "assignee": users[1],
            "status": "in_progress",
            "priority": "high",
            "due_date": "Aug 15",
            "tags": ["API", "STRATEGY"],
            "checklist": [],
        },
        {
            "task_key": "CP-100",
            "title": "Client Dashboard Polish",
            "description": "Final UI polish pass on the client-facing dashboard.",
            "project": projects[2],
            "assignee": users[2],
            "status": "in_progress",
            "priority": "medium",
            "due_date": "Nov 01",
            "tags": ["UI", "POLISH"],
            "checklist": [],
        },
        {
            "task_key": "LP-100",
            "title": "Event Ingestion Benchmark",
            "description": "Benchmark the new event ingestion pipeline at 100k events/sec.",
            "project": projects[3],
            "assignee": users[3],
            "status": "todo",
            "priority": "high",
            "due_date": "Nov 10",
            "tags": ["PERFORMANCE", "DATA"],
            "checklist": [],
        },
    ]

    tasks = []
    for t in tasks_data:
        task = models.Task(
            task_key=t["task_key"],
            title=t["title"],
            description=t["description"],
            project_id=t["project"].id,
            assignee_id=t["assignee"].id,
            status=t["status"],
            priority=t["priority"],
            due_date=t["due_date"],
            tags=t["tags"],
            checklist=t["checklist"],
        )
        db.add(task)
        db.flush()
        tasks.append(task)

    # ── Comments ──────────────────────────────────────
    comments_data = [
        {
            "task": tasks[0],  # Volumetric Lighting
            "user": users[3],
            "content": "The banding issues in the fog pass have been mitigated. I've uploaded the new shader profile for review.",
        },
        {
            "task": tasks[0],
            "user": users[0],
            "content": "Looks great Marcus. Can you also add a performance comparison between the old and new approaches?",
        },
        {
            "task": tasks[3],  # Async Texture Loading
            "user": users[3],
            "content": "Worker thread pool is ready. Moving to texture streaming implementation next.",
        },
        {
            "task": tasks[3],
            "user": users[1],
            "content": "Make sure we handle the edge case where textures are requested before the worker pool is initialized.",
        },
    ]

    for c in comments_data:
        comment = models.Comment(
            task_id=c["task"].id,
            user_id=c["user"].id,
            content=c["content"],
        )
        db.add(comment)

    db.commit()
    print("✅ Database seeded with demo data!")
