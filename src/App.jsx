import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import { GameProvider } from './context/GameContext';
import { ChessProvider } from './context/ChessContext';
import GameComponent from './components/GameComponent';
import './App.css';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <GameProvider>
      <ChessProvider>
        <GameComponent />
      </ChessProvider>
    </GameProvider>
  );
};

export default App;
