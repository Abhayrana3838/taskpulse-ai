import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../lib/api';
import CreateTaskModal from '../components/modals/CreateTaskModal';
import { useRealtimeTasks } from '../hooks/useWebSocket';

const columns = [
  { id: 'todo', title: 'To Do', icon: 'radio_button_unchecked', color: 'var(--primary)' },
  { id: 'in_progress', title: 'In Progress', icon: 'pending', color: 'var(--secondary)' },
  { id: 'done', title: 'Done', icon: 'check_circle', color: 'var(--tertiary)' }
];

export default function KanbanPage() {
  const [tasks, setTasks] = useState({ todo: [], in_progress: [], done: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await api.get('/api/tasks');
        const grouped = { todo: [], in_progress: [], done: [] };
        data.forEach(t => grouped[t.status]?.push(t));
        setTasks(grouped);
      } catch (err) {
        console.error('Failed to load tasks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Real-time task updates
  useRealtimeTasks((newTasks) => {
    const grouped = { todo: [], in_progress: [], done: [] };
    newTasks.forEach(t => grouped[t.status]?.push(t));
    setTasks(grouped);
  });

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = [...tasks[source.droppableId]];
    const destCol = source.droppableId === destination.droppableId ? sourceCol : [...tasks[destination.droppableId]];
    
    const [movedTask] = sourceCol.splice(source.index, 1);
    movedTask.status = destination.droppableId;
    destCol.splice(destination.index, 0, movedTask);

    setTasks({
      ...tasks,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol
    });

    try {
      await api.put(`/api/tasks/${draggableId}`, { status: destination.droppableId });
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

  if (loading) return <div style={{ color: 'var(--on-surface-variant)' }}>Loading board...</div>;

  return (
    <div style={{ height: 'calc(100vh - 128px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ color: '#fff' }}>token</span>
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>Aether Engine</h1>
            <p style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>8 active members • Due Oct 24</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4 }}>
            <button style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, cursor: 'pointer' }}>Board</button>
            <button style={{ padding: '6px 12px', background: 'transparent', border: 'none', color: 'var(--on-surface-variant)', fontSize: 13, cursor: 'pointer' }}>List</button>
            <button style={{ padding: '6px 12px', background: 'transparent', border: 'none', color: 'var(--on-surface-variant)', fontSize: 13, cursor: 'pointer' }}>Timeline</button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', background: 'linear-gradient(135deg,#0070f3,#6807ba)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 20px rgba(0,112,243,0.3)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span> Task
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: 24, flex: 1, overflowX: 'auto', paddingBottom: 16 }}>
          {columns.map(col => (
            <div key={col.id} style={{ flex: '0 0 340px', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
              
              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: col.color }}>{col.icon}</span>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>{col.title}</h3>
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>{tasks[col.id]?.length || 0}</span>
                </div>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer' }}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>more_horiz</span></button>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, transition: 'background 0.2s', background: snapshot.isDraggingOver ? 'rgba(255,255,255,0.04)' : 'transparent' }}
                  >
                    <AnimatePresence>
                      {tasks[col.id]?.map((task, index) => (
                        <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                background: 'rgba(19,19,19,0.9)', backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16,
                                boxShadow: snapshot.isDragging ? '0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px var(--primary)' : '0 4px 12px rgba(0,0,0,0.2)',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)', letterSpacing: '0.05em' }}>{task.task_key}</span>
                                <span className={`label-caps priority-${task.priority}`} style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9 }}>{task.priority}</span>
                              </div>
                              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 8, lineHeight: 1.4 }}>{task.title}</h4>
                              {task.tags?.length > 0 && (
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                                  {task.tags.map(tag => (
                                    <span key={tag} style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: 4, fontSize: 10, color: 'var(--on-surface-variant)' }}>{tag}</span>
                                  ))}
                                </div>
                              )}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                <div style={{ display: 'flex', gap: 12, color: 'var(--on-surface-variant)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chat_bubble_outline</span>
                                    <span style={{ fontSize: 12 }}>{task.comment_count || 0}</span>
                                  </div>
                                  {task.checklist?.length > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_box</span>
                                      <span style={{ fontSize: 12 }}>{task.checklist.filter(c=>c.done).length}/{task.checklist.length}</span>
                                    </div>
                                  )}
                                </div>
                                {task.assignee && (
                                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#0070f3,#6807ba)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', border: '1px solid var(--surface)' }} title={task.assignee.name}>
                                    {task.assignee.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskCreated={(newTask) => {
          setTasks({
            ...tasks,
            [newTask.status]: [...tasks[newTask.status], newTask]
          });
        }}
      />
    </div>
  );
}
