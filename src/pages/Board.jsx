import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../api/axios';

export default function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [error, setError] = useState('');
  
  const [newTaskTitles, setNewTaskTitles] = useState({});
  // NEW: State for creating a new list
  const [newListName, setNewListName] = useState('');

  const fetchBoard = useCallback(async () => {
    try {
      const response = await api.get(`/boards/${id}`);
      setBoard(response.data.board);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load board data.');
      }
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const handleInputChange = (listId, value) => {
    setNewTaskTitles(prev => ({ ...prev, [listId]: value }));
  };

  const handleCreateTask = async (listId) => {
    const title = newTaskTitles[listId];
    if (!title || title.trim() === '') return;

    try {
      await api.post(`/lists/${listId}/tasks`, { title });
      setNewTaskTitles(prev => ({ ...prev, [listId]: '' }));
      fetchBoard();
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Could not create task.');
    }
  };

  // NEW: Function to create a new list
  const handleCreateList = async () => {
    if (!newListName || newListName.trim() === '') return;

    try {
      await api.post(`/boards/${id}/lists`, { 
        name: newListName,
        // Automatically calculate the next position based on how many lists currently exist
        position: board.lists.length + 1 
      });
      
      setNewListName(''); // Clear the input
      fetchBoard();       // Refresh the UI
    } catch (err) {
      console.error('Failed to create list:', err);
      alert('Could not create list. Check console.');
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newBoard = { ...board };
    const sourceListIndex = newBoard.lists.findIndex(l => l.id.toString() === source.droppableId);
    const destListIndex = newBoard.lists.findIndex(l => l.id.toString() === destination.droppableId);
    
    const sourceList = newBoard.lists[sourceListIndex];
    const destList = newBoard.lists[destListIndex];
    
    const [movedTask] = sourceList.tasks.splice(source.index, 1);
    destList.tasks.splice(destination.index, 0, movedTask);
    
    setBoard(newBoard);

    try {
      await api.patch(`/tasks/${draggableId}/move`, {
        task_list_id: parseInt(destination.droppableId),
        position: destination.index
      });
    } catch (err) {
      console.error('Failed to move task on server:', err);
      fetchBoard();
    }
  };

  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  if (!board) return <div style={{ padding: '20px' }}>Loading board...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      
      {/* Navigation & Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ padding: '8px 12px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ← Back to Dashboard
        </button>
        <h2 style={{ color: '#0f172a', margin: 0 }}>{board.name}</h2>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', overflowX: 'auto', flexGrow: 1, paddingBottom: '20px' }}>
          
          {board.lists.map((list) => (
            <div key={list.id} style={{ backgroundColor: '#f1f5f9', borderRadius: '8px', minWidth: '300px', maxWidth: '300px', padding: '15px' }}>
              
              <h3 style={{ marginTop: '0', fontSize: '16px', color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
                {list.name}
                <span style={{ fontSize: '12px', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '12px' }}>
                  {list.tasks.length}
                </span>
              </h3>
              
              <Droppable droppableId={list.id.toString()}>
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps}
                    style={{ 
                      display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px', minHeight: '50px',
                      backgroundColor: snapshot.isDraggingOver ? '#e2e8f0' : 'transparent',
                      transition: 'background-color 0.2s ease',
                      borderRadius: '6px'
                    }}
                  >
                    {list.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{ 
                              backgroundColor: 'white', padding: '15px', borderRadius: '6px', 
                              boxShadow: snapshot.isDragging ? '0 5px 15px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)', 
                              border: '1px solid #e2e8f0',
                              ...provided.draggableProps.style 
                            }}
                          >
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#0f172a' }}>{task.title}</h4>
                            {task.description && (
                              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>{task.description}</p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" placeholder="Add a new task..."
                  value={newTaskTitles[list.id] || ''}
                  onChange={(e) => handleInputChange(list.id, e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreateTask(list.id); }}
                  style={{ flexGrow: 1, padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
                <button 
                  onClick={() => handleCreateTask(list.id)}
                  style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '0 12px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  +
                </button>
              </div>

            </div>
          ))}
          
          {/* NEW: Functional Create List Input */}
          <div style={{ minWidth: '300px', backgroundColor: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="New list name (e.g. Backlog)..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateList(); }}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />
            <button 
              onClick={handleCreateList}
              style={{ padding: '8px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              + Add List
            </button>
          </div>

        </div>
      </DragDropContext>
    </div>
  );
}