import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import MainMenu from './components/MainMenu';
import RoomLobby from './components/RoomLobby';
import GameArea from './components/GameArea';
import { GameProvider, useGame } from './context/GameContext';

const AppContainer = styled.div`
  min-height: 100vh;
  background: radial-gradient(circle at center, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  overflow-x: hidden;
`;

const BackgroundParticles = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
    animation: float 20s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }
`;

const ContentContainer = styled.div`
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

// AppContent 컴포넌트를 GameProvider 내부에서 사용
const AppContent = () => {
  const { gameStatus, gameState, ws, connect, disconnect, sendMessage } = useGame();

  useEffect(() => {
    // WebSocket 연결
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const handlePhaseChange = (phase, data = null) => {
    // 이 함수는 이제 사용되지 않지만, 필요한 경우를 위해 유지
  };

  const renderPhase = () => {
    switch (gameStatus) {
      case 'lobby':
        return (
          <RoomLobby 
            gameData={gameState}
            ws={ws}
            sendMessage={sendMessage}
          />
        );
      case 'playing':
        return (
          <GameArea 
            gameData={gameState}
            ws={ws}
            sendMessage={sendMessage}
          />
        );
      case 'finished':
        return (
          <GameArea 
            gameData={gameState}
            ws={ws}
            sendMessage={sendMessage}
          />
        );
      default:
        return (
          <MainMenu 
            ws={ws}
            sendMessage={sendMessage}
          />
        );
    }
  };

  return (
    <AppContainer>
      <BackgroundParticles />
      <ContentContainer>
        <AnimatePresence mode="wait">
          <motion.div
            key={gameStatus}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {renderPhase()}
          </motion.div>
        </AnimatePresence>
      </ContentContainer>
    </AppContainer>
  );
};

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App; 