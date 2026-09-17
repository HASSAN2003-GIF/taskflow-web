import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState([]);
  const [error, setError] = useState('');
  // State to hold the text input for new boards, keyed by workspace ID
  const [newBoardNames, setNewBoardNames] = useState({});
  const navigate = useNavigate();

  const fetchWorkspaces = useCallback(async () => {
    try {
      const response = await api.get('/workspaces');
      setWorkspaces(response.data.workspaces);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load workspaces.');
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  // Submit the new board to the Laravel API
  const handleCreateBoard = async (workspaceId) => {
    const name = newBoardNames[workspaceId];
    if (!name || name.trim() === '') return;

    try {
      await api.post(`/workspaces/${workspaceId}/boards`, { name, status: 'active' });
      
      // Clear the input field for this specific workspace
      setNewBoardNames(prev => ({ ...prev, [workspaceId]: '' }));
      
      // Refresh to show the new board instantly
      fetchWorkspaces();
    } catch (err) {
      console.error('Failed to create board:', err);
      alert('Could not create board. Check console.');
    }
  };

  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
        <h1 style={{ color: '#0f172a', margin: 0 }}>TaskFlow Dashboard</h1>
        <button 
          onClick={handleLogout}
          style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Logout
        </button>
      </div>

      {workspaces.length === 0 ? (
        <p style={{ color: '#64748b' }}>No workspaces found.</p>
      ) : (
        workspaces.map((workspace) => (
          <div key={workspace.id} style={{ marginBottom: '40px' }}>
            <h2 style={{ color: '#334155', borderBottom: '2px solid #3b82f6', display: 'inline-block', paddingBottom: '5px' }}>
              {workspace.name}
            </h2>
            
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
              {workspace.boards?.length > 0 && workspace.boards.map((board) => (
                <Link 
                  key={board.id} 
                  to={`/board/${board.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '20px', width: '250px', cursor: 'pointer', transition: 'transform 0.2s, boxShadow 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                       onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'; }}
                       onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; }}
                  >
                    <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>{board.name}</h3>
                    <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#dcfce3', color: '#166534', borderRadius: '12px', fontWeight: 'bold' }}>
                      {board.status}
                    </span>
                  </div>
                </Link>
              ))}
              
              {/* NEW: Functional Create Board Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#ffffff', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '20px', width: '250px', boxSizing: 'border-box' }}>
                <input 
                  type="text" 
                  placeholder="New board name..."
                  value={newBoardNames[workspace.id] || ''}
                  onChange={(e) => setNewBoardNames(prev => ({ ...prev, [workspace.id]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreateBoard(workspace.id); }}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100%', boxSizing: 'border-box', fontSize: '14px' }}
                />
                <button 
                  onClick={() => handleCreateBoard(workspace.id)}
                  style={{ padding: '8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  + Create Board
                </button>
              </div>

            </div>
          </div>
        ))
      )}
    </div>
  );
}