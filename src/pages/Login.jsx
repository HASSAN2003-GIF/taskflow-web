import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('hassan@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', { email, password });
      localStorage.setItem('access_token', response.data.access_token);
      
      // Redirect to the board automatically after successful login
      navigate('/board/1'); 
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '15px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>TaskFlow Login</h2>
        {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
        
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Sign In
        </button>
      </form>
    </div>
  );
}