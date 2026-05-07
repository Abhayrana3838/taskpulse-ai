import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import KanbanPage from './pages/KanbanPage';
import TaskDetailPage from './pages/TaskDetailPage';
import SettingsPage from './pages/SettingsPage';
import TeamPage from './pages/TeamPage';
import ReportsPage from './pages/ReportsPage';
import ActivityPage from './pages/ActivityPage';
import SprintsPage from './pages/SprintsPage';
import AIInsightsPage from './pages/AIInsightsPage';
import EpicsPage from './pages/EpicsPage';
import BacklogPage from './pages/BacklogPage';
import WorkflowsPage from './pages/WorkflowsPage';
import TimeTrackingPage from './pages/TimeTrackingPage';
import IntegrationsPage from './pages/IntegrationsPage';

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div {...pageTransition}>
            <LandingPage />
          </motion.div>
        } />
        <Route path="/login" element={
          <motion.div {...pageTransition}>
            <LoginPage />
          </motion.div>
        } />
        <Route path="/signup" element={
          <motion.div {...pageTransition}>
            <SignUpPage />
          </motion.div>
        } />
        <Route path="/dashboard" element={
          <motion.div {...pageTransition}>
            <DashboardPage />
          </motion.div>
        } />
        <Route path="/projects" element={
          <motion.div {...pageTransition}>
            <ProjectsPage />
          </motion.div>
        } />
        <Route path="/kanban" element={
          <motion.div {...pageTransition}>
            <KanbanPage />
          </motion.div>
        } />
        <Route path="/tasks/:id" element={
          <motion.div {...pageTransition}>
            <TaskDetailPage />
          </motion.div>
        } />
        <Route path="/settings" element={
          <motion.div {...pageTransition}>
            <SettingsPage />
          </motion.div>
        } />
        <Route path="/team" element={
          <motion.div {...pageTransition}>
            <TeamPage />
          </motion.div>
        } />
        <Route path="/reports" element={
          <motion.div {...pageTransition}>
            <ReportsPage />
          </motion.div>
        } />
        <Route path="/activity" element={
          <motion.div {...pageTransition}>
            <ActivityPage />
          </motion.div>
        } />
        <Route path="/sprints" element={
          <motion.div {...pageTransition}>
            <SprintsPage />
          </motion.div>
        } />
        <Route path="/ai-insights" element={
          <motion.div {...pageTransition}>
            <AIInsightsPage />
          </motion.div>
        } />
        <Route path="/epics" element={
          <motion.div {...pageTransition}>
            <EpicsPage />
          </motion.div>
        } />
        <Route path="/backlog" element={
          <motion.div {...pageTransition}>
            <BacklogPage />
          </motion.div>
        } />
        <Route path="/workflows" element={
          <motion.div {...pageTransition}>
            <WorkflowsPage />
          </motion.div>
        } />
        <Route path="/time-tracking" element={
          <motion.div {...pageTransition}>
            <TimeTrackingPage />
          </motion.div>
        } />
        <Route path="/notifications" element={
          <motion.div {...pageTransition}>
            <div style={{ minHeight: '100vh', background: '#131313', padding: '100px', color: '#e5e2e1', textAlign: 'center' }}>
              <h1>Notifications Center</h1>
              <p>All your notifications in one place - Coming fully soon...</p>
            </div>
          </motion.div>
        } />
        <Route path="/integrations" element={
          <motion.div {...pageTransition}>
            <IntegrationsPage />
          </motion.div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
