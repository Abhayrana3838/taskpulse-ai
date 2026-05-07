# ⚡ TaskPulse AI

<p align="center">
  <img src="https://img.shields.io/badge/TaskPulse-AI-blue?style=for-the-badge" alt="TaskPulse AI"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=for-the-badge&logo=openai" alt="OpenAI"/>
</p>

<p align="center">
  <strong>AI-powered project management platform with intelligent insights, real-time collaboration, and advanced workflow automation.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#ai-features">AI Features</a> •
  <a href="#screenshots">Screenshots</a>
</p>

---

## ✨ Features

### 🎯 Core Project Management
- **📊 Dashboard** - Real-time overview with activity feed, velocity charts, and overdue tasks
- **📁 Projects** - Create, manage, and track multiple projects with team assignments
- **✅ Tasks** - Full task lifecycle with priorities, assignments, due dates, and comments
- **📋 Kanban Board** - Drag-and-drop task management with customizable columns
- **🏃 Sprints** - Agile sprint planning with burndown charts and velocity tracking
- **📚 Epics** - Group related tasks into epics with progress tracking
- **🔙 Backlog** - Product backlog management with sprint assignment

### 🤖 AI-Powered Features
- **💡 Smart Insights** - GPT-4o-mini analyzes projects and generates actionable recommendations
- **🔍 Duplicate Detection** - AI finds similar tasks to prevent redundancy
- **⏱️ Time Estimation** - Predicts task duration based on historical data
- **😊 Sentiment Analysis** - Analyzes team mood from comments and feedback
- **⚠️ Risk Assessment** - Identifies project risks early with AI-powered analysis

### 👥 Team & Collaboration
- **👤 User Management** - Role-based access control (Admin, Manager, Member)
- **⏰ Time Tracking** - Built-in time logging with live timer
- **🔔 Notifications** - Real-time activity notifications
- **📊 Reports** - Team productivity and project analytics

### 🔧 Integrations & Workflows
- **🔗 Integrations** - Connect with GitHub, GitLab, Slack, Discord, Jira, Trello
- **⚙️ Workflow Automation** - Custom status transitions and automation rules

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **Python** 3.11+
- **OpenAI API Key** - Get from [platform.openai.com](https://platform.openai.com/api-keys)

### 1. Clone Repository
```bash
git clone https://github.com/Abhayrana3838/taskpulse-ai.git
cd taskpulse-ai
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
python3 -m pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run server
python3 -m uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### 4. Access Application
- **Frontend:** http://localhost:5174
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### 🔑 Demo Credentials
| Email | Password |
|-------|----------|
| `demo@taskpulse.ai` | `demo123` |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **Vite** | Build Tool |
| **TailwindCSS** | Styling |
| **Framer Motion** | Animations |
| **Axios** | HTTP Client |
| **React Router v6** | Navigation |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | API Framework |
| **SQLAlchemy** | ORM |
| **SQLite/PostgreSQL** | Database |
| **JWT** | Authentication |
| **OpenAI GPT-4o-mini** | AI Features |
| **Uvicorn** | ASGI Server |

---

## 📦 Deployment

### Railway (Recommended)
One-click deployment with Railway:

1. **Fork** this repository
2. **Create Railway project** from GitHub repo
3. **Add PostgreSQL** database service
4. **Set environment variables** (see below)
5. **Deploy!**

📖 Detailed guide: [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md)

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ Yes | OpenAI API key for AI features |
| `SECRET_KEY` | ✅ Yes | JWT secret (generate: `openssl rand -hex 32`) |
| `DATABASE_URL` | ⚠️ Prod | Database URL (Railway auto-provides for PostgreSQL) |
| `CORS_ORIGINS` | ❌ No | Allowed CORS origins (default: `*`) |
| `VITE_API_URL` | ❌ No | Backend URL for frontend |

---

## 📂 Project Structure

```
taskpulse-ai/
├── backend/
│   ├── app/
│   │   ├── ai_service.py      # OpenAI integration
│   │   ├── auth.py            # Authentication logic
│   │   ├── database.py        # Database configuration
│   │   ├── main.py            # FastAPI application
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── seed.py            # Database seeding
│   │   └── routes/            # API endpoints
│   │       ├── ai_features.py   # AI-powered endpoints
│   │       ├── auth.py          # Auth endpoints
│   │       ├── dashboard.py     # Dashboard data
│   │       ├── projects.py      # Project management
│   │       ├── tasks.py         # Task management
│   │       └── ...
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── layout/        # Layout components
│   │   │   ├── modals/        # Modal dialogs
│   │   │   ├── three/         # 3D backgrounds
│   │   │   └── ui/            # UI primitives
│   │   ├── pages/           # Route pages
│   │   │   ├── AIInsightsPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── KanbanPage.jsx
│   │   │   └── ...
│   │   ├── lib/             # Utilities
│   │   └── context/         # React contexts
│   └── package.json
│
├── .env.example             # Environment template
├── railway.toml            # Railway config
├── nixpacks.toml           # Nixpacks config
└── README.md
```

---

## 🤖 AI Features Deep Dive

### Smart Insights
Analyzes your project data and generates:
- 🎯 Actionable recommendations
- 📈 Progress predictions
- ⚠️ Risk warnings
- 👥 Team workload balancing

### Duplicate Detection
Uses AI to:
- Find similar tasks
- Suggest merges
- Prevent redundant work

### Time Estimation
Predicts task completion time based on:
- Historical data
- Task complexity
- Team member velocity

### Sentiment Analysis
Monitors team mood through:
- Comment tone analysis
- Feedback sentiment
- Burnout risk detection

---

## 🖼️ Screenshots

| Dashboard | Kanban Board | AI Insights |
|-----------|--------------|-------------|
| *Real-time project overview* | *Drag-and-drop task management* | *AI-powered recommendations* |

---

## 🔧 API Documentation

FastAPI auto-generates interactive docs:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Key Endpoints
```
POST   /api/auth/login           # User login
POST   /api/auth/register        # User registration
GET    /api/projects              # List projects
POST   /api/projects              # Create project
GET    /api/tasks                 # List tasks
POST   /api/ai/generate-insights  # Generate AI insights
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## � License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## � Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [OpenAI](https://openai.com/) - AI capabilities
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations

---

<p align="center">
  <strong>TaskPulse AI</strong> - The operating system for modern teams 🤖⚡
  <br>
  Built with ❤️ for high-performance teams
</p>
