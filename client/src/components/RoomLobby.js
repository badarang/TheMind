import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';

const LobbyContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
`;

const LobbyCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 800px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const LobbyTitle = styled.h2`
  color: white;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const InviteSection = styled.div`
  text-align: center;
  margin-bottom: 40px;
  padding: 30px;
  background: rgba(255, 217, 61, 0.1);
  border-radius: 20px;
  border: 2px solid rgba(255, 217, 61, 0.3);
`;

const InviteLabel = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin-bottom: 20px;
  font-weight: 500;
`;

const InviteCode = styled.div`
  font-size: 3rem;
  font-weight: 900;
  color: #ffd93d;
  text-align: center;
  letter-spacing: 8px;
  text-shadow: 0 0 30px rgba(255, 217, 61, 0.8);
  margin: 20px 0;
  font-family: 'Courier New', monospace;
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 15px;
  border: 2px solid rgba(255, 217, 61, 0.5);
`;

const CopyButton = styled(motion.button)`
  background: linear-gradient(135deg, #ffd93d 0%, #ffb347 100%);
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 217, 61, 0.4);
  }
`;

const PlayersSection = styled.div`
  margin-bottom: 40px;
`;

const PlayersTitle = styled.h3`
  color: white;
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: 600;
`;

const PlayersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const PlayerCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }
  
  &:hover::before {
    transform: translateX(100%);
  }
`;

const HostPlayerCard = styled(PlayerCard)`
  border-color: #ffd93d;
  background: rgba(255, 217, 61, 0.1);
  box-shadow: 0 0 30px rgba(255, 217, 61, 0.3);
  
  &::after {
    content: '👑';
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 1.2rem;
    animation: crownGlow 2s ease-in-out infinite alternate;
  }
  
  @keyframes crownGlow {
    0% { filter: brightness(1) rotate(0deg); }
    100% { filter: brightness(1.3) rotate(5deg); }
  }
`;

const PlayerName = styled.div`
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  margin-bottom: 8px;
`;

const PlayerStatus = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled(motion.button)`
  padding: 18px 36px;
  border: none;
  border-radius: 15px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  font-family: inherit;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const StartButton = styled(Button)`
  background: linear-gradient(135deg, #6bcf7f 0%, #8dd99c 100%);
  box-shadow: 0 8px 25px rgba(107, 207, 127, 0.4);
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(107, 207, 127, 0.6);
  }
`;

const LeaveButton = styled(Button)`
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(255, 107, 107, 0.6);
  }
`;

const WaitingMessage = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin-top: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const RoomLobby = ({ gameData, ws, sendMessage }) => {
  const { roomCode, players, isHost, dispatch } = useGame();

  // 방장만 게임 시작 가능
  const handleStartGame = () => {
    if (!isHost) return;
    
    sendMessage({
      type: 'start_game',
      data: { roomCode }
    });
  };

  const handleLeaveRoom = () => {
    sendMessage({
      type: 'leave_room',
      data: { roomCode }
    });
    
    // 메인 메뉴로 돌아가기
    dispatch({ type: 'RESET_GAME' });
  };

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      alert('초대 코드가 복사되었습니다!');
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
      // 폴백: 텍스트 선택
      const textArea = document.createElement('textarea');
      textArea.value = roomCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('초대 코드가 복사되었습니다!');
    }
  };

  const canStartGame = isHost && players.length >= 2;

  // roomCode가 없으면 로딩 상태 표시
  if (!roomCode) {
    return (
      <LobbyContainer>
        <LobbyCard
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <LobbyTitle>연결 중...</LobbyTitle>
          <div style={{ textAlign: 'center', color: 'white' }}>
            서버에 연결하고 있습니다. 잠시만 기다려주세요.
          </div>
        </LobbyCard>
      </LobbyContainer>
    );
  }

  return (
    <LobbyContainer>
      <LobbyCard
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <LobbyTitle>게임 대기실</LobbyTitle>
        
        <InviteSection>
          <InviteLabel>친구들에게 초대 코드를 공유하세요!</InviteLabel>
          <InviteCode>{roomCode}</InviteCode>
          <CopyButton
            onClick={copyInviteCode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📋 코드 복사
          </CopyButton>
        </InviteSection>

        <PlayersSection>
          <PlayersTitle>플레이어 ({players.length}/4)</PlayersTitle>
          <PlayersGrid>
            <AnimatePresence>
              {players.map((player, index) => {
                const PlayerComponent = player.isHost ? HostPlayerCard : PlayerCard;
                return (
                  <PlayerComponent
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <PlayerName>{player.name}</PlayerName>
                    <PlayerStatus>
                      {player.isHost ? '👑 방장' : '플레이어'}
                    </PlayerStatus>
                  </PlayerComponent>
                );
              })}
            </AnimatePresence>
          </PlayersGrid>
        </PlayersSection>

        <ActionButtons>
          <StartButton
            onClick={handleStartGame}
            disabled={!canStartGame}
            whileHover={canStartGame ? { scale: 1.02 } : {}}
            whileTap={canStartGame ? { scale: 0.98 } : {}}
          >
            🚀 게임 시작
          </StartButton>
          
          <LeaveButton
            onClick={handleLeaveRoom}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🚪 방 나가기
          </LeaveButton>
        </ActionButtons>

        {!canStartGame && (
          <WaitingMessage>
            {isHost 
              ? `게임을 시작하려면 최소 2명이 필요합니다. (현재 ${players.length}명)`
              : '방장이 게임을 시작할 때까지 기다려주세요.'
            }
          </WaitingMessage>
        )}
      </LobbyCard>
    </LobbyContainer>
  );
};

export default RoomLobby; 