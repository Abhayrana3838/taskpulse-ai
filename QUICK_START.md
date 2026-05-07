# 🚀 TaskPulse - Quick Start Guide

## ⚠️ IMPORTANT: Start Backend First!

The login/signup will NOT work if the backend isn't running!

---

## Step 1: Start Backend (Terminal 1)

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

## Step 2: Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
```

---

## Step 3: Open Browser

Go to: `http://localhost:5174`

---

## 🔑 Demo Login

**Email:** `demo@taskpulse.ai`  
**Password:** `demo123`

Or click **"Test Backend Connection"** button on login page to verify backend is running.

---

## ❓ Troubleshooting

### "Network Error" or "Cannot connect to server"

**Problem:** Backend is not running

**Solution:**
1. Make sure you ran `uvicorn app.main:app --port 8000` in the backend folder
2. Check http://localhost:8000/api/health shows `{"status": "ok"}`

### Login page keeps refreshing

**Problem:** Authentication error

**Solution:**
1. Clear browser localStorage (F12 → Application → Local Storage → Clear)
2. Refresh and try again

### Database errors

**Solution:**
```bash
cd backend
rm taskpulse.db
# Restart backend - it will recreate the database
```

---

## ✅ What Works Now

- ✅ Login / Sign Up with error messages
- ✅ "Test Backend Connection" button
- ✅ Auto-redirect if already logged in
- ✅ Better error messages for network issues

---

## 🎯 Next Steps

After logging in, you'll see:
- Dashboard with stats
- AI Insights panel
- Active Sprints
- Real-time Activity Feed
