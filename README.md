# TaskPulse AI

AI-powered project management platform with intelligent insights, real-time collaboration, and advanced workflow automation.

![TaskPulse AI](https://img.shields.io/badge/TaskPulse-AI-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai)

## ✨ Features

- **AI-Powered Insights** - GPT-4o-mini generates intelligent recommendations
- **Project Management** - Full Jira-like functionality
- **Real-time Collaboration** - Kanban boards, sprints, epics
- **Time Tracking** - Built-in time logging
- **Workflow Automation** - Custom status transitions
- **Team Management** - Role-based access control
- **Integrations** - GitHub, GitLab, Slack, Discord, Jira, Trello

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- OpenAI API key

### Backend Setup

```bash
cd backend
python3 -m pip install -r requirements.txt

# Create .env file
echo "OPENAI_API_KEY=your_key_here" > .env
echo "SECRET_KEY=$(openssl rand -hex 32)" >> .env

# Run server
python3 -m uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Demo Credentials
- Email: `demo@taskpulse.ai`
- Password: `demo123`

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- TailwindCSS + Framer Motion
- Axios for API calls
- React Router v6

### Backend
- FastAPI + SQLAlchemy
- SQLite (local) / PostgreSQL (production)
- JWT Authentication
- OpenAI GPT-4o-mini

## 📦 Deployment

See [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md) for Railway deployment guide.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `SECRET_KEY` | JWT secret (generate with `openssl rand -hex 32`) |
| `DATABASE_URL` | Database connection string |
| `CORS_ORIGINS` | Allowed origins |
| `VITE_API_URL` | Backend API URL for frontend |

## 📂 Project Structure

```
taskpulse-ai/
├── backend/
│   ├── app/
│   │   ├── routes/         # API endpoints
│   │   ├── ai_service.py   # OpenAI integration
│   │   ├── main.py         # FastAPI app
│   │   └── ...
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/          # React pages
│   │   ├── components/     # UI components
│   │   └── lib/            # API client
│   └── package.json
└── README.md
```

## 🤖 AI Features

- **Smart Insights** - AI analyzes projects and generates actionable recommendations
- **Duplicate Detection** - Find similar tasks automatically
- **Time Estimation** - AI predicts task duration
- **Sentiment Analysis** - Analyze team mood from comments
- **Risk Assessment** - Identify project risks early

## 📝 License

MIT License - see LICENSE file

## 👥 Team

Built for high-performance teams who refuse to compromise.

---

**TaskPulse AI** - The operating system for modern teams 🤖⚡
