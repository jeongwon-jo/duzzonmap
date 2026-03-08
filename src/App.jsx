// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import MainPage from './pages/Main/MainPage';
import RegisterPage from './pages/Register/RegisterPage';
import { subscribeToAuth } from './firebase/auth';
import './styles/global.scss';

const App = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuth((u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  if (authLoading) return null;

  return (
    <BrowserRouter>
      <Header user={user} />
      <Routes>
        <Route path="/" element={<MainPage user={user} />} />
        <Route path="/register" element={<RegisterPage user={user} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
