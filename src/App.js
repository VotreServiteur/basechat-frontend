import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/features/auth/LoginForm';
import RegisterForm from './components/features/auth/RegisterForm';
import Chat from './components/features/chat/Chat';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/" element={<LoginForm />} />
        <Route path="/chat" element={<Chat />} />

      </Routes>
    </Router>
  );
}

export default App;