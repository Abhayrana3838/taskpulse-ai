import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import GlassCard from '../components/ui/GlassCard';

const XIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MessageSquareIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const CalendarIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const TagIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const CheckSquareIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState({
    id,
    title: 'Implement user authentication flow',
    description: 'Build a secure authentication system with JWT tokens, password hashing, and session management. Include login, register, and password reset functionality.',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2024-02-15',
    assignee: { name: 'Alex Johnson', avatar: null },
    tags: ['Authentication', 'Security', 'Backend'],
    checklist: [
      { id: 1, text: 'Set up JWT token generation', completed: true },
      { id: 2, text: 'Implement password hashing with bcrypt', completed: true },
      { id: 3, text: 'Create login endpoint', completed: true },
      { id: 4, text: 'Create register endpoint', completed: false },
      { id: 5, text: 'Add password reset flow', completed: false },
    ],
    comments: [
      { id: 1, user: 'Sarah Chen', avatar: null, content: 'Started working on the register endpoint today.', time: '2 hours ago' },
      { id: 2, user: 'Mike Wilson', avatar: null, content: 'Make sure to add rate limiting to prevent brute force attacks.', time: '5 hours ago' },
    ],
  });
  const [newComment, setNewComment] = useState('');

  const toggleChecklist = (itemId) => {
    setTask({
      ...task,
      checklist: task.checklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    });
  };

  const addComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setTask({
      ...task,
      comments: [
        ...task.comments,
        {
          id: task.comments.length + 1,
          user: 'You',
          avatar: null,
          content: newComment,
          time: 'Just now',
        },
      ],
    });
    setNewComment('');
  };

  const priorityColors = {
    high: 'danger',
    medium: 'warning',
    low: 'default',
  };

  const statusColors = {
    todo: 'default',
    in_progress: 'primary',
    done: 'success',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={() => navigate(-1)}
      >
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div className="flex items-center gap-4">
              <Badge variant={statusColors[task.status]}>{task.status.replace('_', ' ')}</Badge>
              <Badge variant={priorityColors[task.priority]}>{task.priority}</Badge>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <XIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="flex h-[calc(90vh-80px)]">
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <h1 className="text-2xl font-bold text-white mb-4">{task.title}</h1>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                <p className="text-gray-300 leading-relaxed">{task.description}</p>
              </div>

              {/* Checklist */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <CheckSquareIcon className="w-4 h-4" />
                  Checklist ({task.checklist.filter(c => c.completed).length}/{task.checklist.length})
                </h3>
                <div className="space-y-2">
                  {task.checklist.map((item) => (
                    <motion.div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => toggleChecklist(item.id)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <motion.div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          item.completed ? 'bg-blue-600 border-blue-600' : 'border-gray-600'
                        }`}
                        animate={{ scale: item.completed ? [1, 1.2, 1] : 1 }}
                      >
                        {item.completed && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </motion.div>
                      <span className={`flex-1 ${item.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                        {item.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <MessageSquareIcon className="w-4 h-4" />
                  Comments ({task.comments.length})
                </h3>
                <div className="space-y-4 mb-4">
                  {task.comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <Avatar name={comment.user} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">{comment.user}</span>
                          <span className="text-gray-500 text-sm">{comment.time}</span>
                        </div>
                        <p className="text-gray-300">{comment.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <form onSubmit={addComment} className="flex gap-3">
                  <Avatar name="You" size="sm" />
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button type="submit" size="sm">Send</Button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-72 border-l border-gray-800 p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Assignee */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Assignee
                  </h3>
                  <div className="flex items-center gap-2">
                    <Avatar name={task.assignee.name} size="md" />
                    <span className="text-white">{task.assignee.name}</span>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Due Date
                  </h3>
                  <p className="text-white">{task.dueDate}</p>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <TagIcon className="w-4 h-4" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="purple">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskDetailPage;
