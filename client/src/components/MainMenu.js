import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';

const MainMenuContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
`;

const Title = styled(motion.h1)`
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 900;
  background: linear-gradient(135deg, #ff6b6b 0%, #ffd93d 25%, #6bcf7f 50%, #4d9de0 75%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  margin-bottom: 20px;
  text-shadow: 0 0 30px rgba(255, 107, 107, 0.5);
  letter-spacing: -0.02em;
`;

const Subtitle = styled(motion.p)`
  color: rgba(255, 255, 255, 0.8);
  font-size: clamp(1.1rem, 3vw, 1.5rem);
  text-align: center;
  margin-bottom: 60px;
  font-weight: 400;
  max-width: 600px;
  line-height: 1.6;
`;

const MenuContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  max-width: 500px;
  width: 100%;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
`;

const StyledInput = styled(motion.input)`
  padding: 20px 25px;
  border: none;
  border-radius: 15px;
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  color: white;
  text-align: center;
  font-weight: 500;
  letter-spacing: 1px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(255, 107, 107, 0.8);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 30px rgba(255, 107, 107, 0.3);
  }
  
  &.error {
    border-color: #ff4757;
    background: rgba(255, 71, 87, 0.1);
    box-shadow: 0 0 20px rgba(255, 71, 87, 0.3);
  }
`;

const ErrorMessage = styled(motion.div)`
  color: #ff4757;
  font-size: 0.9rem;
  margin-top: 5px;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

const Button = styled(motion.button)`
  padding: 20px 30px;
  border: none;
  border-radius: 15px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  width: 100%;
  color: white;
  font-family: inherit;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const CreateButton = styled(Button)`
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(255, 107, 107, 0.6);
  }
`;

const JoinButton = styled(Button)`
  background: linear-gradient(135deg, #ffd93d 0%, #ff9800 100%);
  box-shadow: 0 8px 25px rgba(255, 217, 61, 0.4);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(255, 217, 61, 0.6);
  }
`;

const JoinSection = styled(motion.div)`
  width: 100%;
  margin-top: 20px;
  padding: 20px;
  background: rgba(107, 207, 127, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(107, 207, 127, 0.3);
`;

const JoinInput = styled(StyledInput)`
  margin-bottom: 15px;
`;

const JoinConfirmButton = styled(Button)`
  background: linear-gradient(135deg, #6bcf7f 0%, #8dd99c 100%);
  box-shadow: 0 8px 25px rgba(107, 207, 127, 0.4);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(107, 207, 127, 0.6);
  }
`;

const FloatingCards = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
`;

const FloatingCard = styled(motion.div)`
  position: absolute;
  width: 60px;
  height: 90px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
`;

const HintButton = styled(Button)`
  background: linear-gradient(135deg, #ffd93d 0%, #ff9800 100%);
  border: none;
  border-radius: 15px;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  color: white;
  font-family: inherit;
  box-shadow: 0 8px 25px rgba(255, 217, 61, 0.4);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(255, 217, 61, 0.6);
  }
`;

const BackButton = styled(motion.button)`
  padding: 15px 30px;
  border: none;
  border-radius: 15px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  color: white;
  font-family: inherit;
  background: linear-gradient(135deg, #4d9de0 0%, #7bb3f0 100%);
  box-shadow: 0 8px 25px rgba(77, 157, 224, 0.4);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(77, 157, 224, 0.6);
  }
`;

const NoticeContainer = styled.div`
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 2px solid #ffc107;
  border-radius: 15px;
  padding: 20px;
  margin: 20px 0;
  text-align: center;
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
`;

const NoticeIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 10px;
`;

const NoticeText = styled.div`
  color: #856404;
  line-height: 1.6;
  margin-bottom: 15px;
  
  strong {
    color: #664d03;
  }
`;

const NoticeButton = styled.button`
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 193, 7, 0.4);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 193, 7, 0.6);
  }
`;

const MainMenu = ({ sendMessage }) => {
  const { playerName, roomCode, players, dispatch } = useGame();
  const [inputName, setInputName] = useState(playerName || '');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [nameError, setNameError] = useState(false);
  const [joinCodeError, setJoinCodeError] = useState(false);
  
  // GitHub Pages 환경 확인
  const isGitHubPages = window.location.hostname.includes('github.io');
  
  // 방 코드와 플레이어가 있으면 자동으로 로비로 이동
  useEffect(() => {
    if (roomCode && players && players.length > 0) {
      dispatch({ type: 'SET_GAME_STATUS', payload: 'lobby' });
    }
  }, [roomCode, players, dispatch]);

  const validateName = (name) => {
    if (!name.trim()) {
      setNameError(true);
      return false;
    }
    setNameError(false);
    return true;
  };

  const validateJoinCode = (code) => {
    if (!code.trim() || code.trim().length !== 6) {
      setJoinCodeError(true);
      return false;
    }
    setJoinCodeError(false);
    return true;
  };

  const handleCreateRoom = () => {
    if (!validateName(inputName)) {
      return;
    }

    dispatch({ type: 'SET_PLAYER_NAME', payload: inputName.trim() });
    
    sendMessage({
      type: 'create_room',
      data: { playerName: inputName.trim() }
    });
  };

  const handleJoinRoom = () => {
    if (!validateName(inputName)) {
      return;
    }
    
    if (!validateJoinCode(joinCode)) {
      return;
    }

    dispatch({ type: 'SET_PLAYER_NAME', payload: inputName.trim() });
    dispatch({ type: 'SET_ROOM_CODE', payload: joinCode.trim() });
    
    sendMessage({
      type: 'join_room',
      data: { 
        roomCode: joinCode.trim(),
        playerName: inputName.trim()
      }
    });
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <MainMenuContainer>
      <FloatingCards>
        {[...Array(8)].map((_, i) => (
          <FloatingCard
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: Math.random() * 360
            }}
            animate={{
              y: [0, -100, 0],
              rotate: [0, 180, 360],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </FloatingCards>

      <Title
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        더 마인드
      </Title>
      
      <Subtitle
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
      >
        마음으로 소통하는 협동 카드 게임
      </Subtitle>

      {/* GitHub Pages 환경 안내 */}
      {isGitHubPages && (
        <NoticeContainer>
          <NoticeIcon>⚠️</NoticeIcon>
          <NoticeText>
            <strong>GitHub Pages 환경</strong><br />
            멀티플레이어 기능을 사용하려면 WebSocket 서버가 필요합니다.<br />
            로컬에서 서버를 실행하거나 무료 WebSocket 서비스를 사용해주세요.
          </NoticeText>
          <NoticeButton onClick={() => window.open('https://github.com/badarang/TheMind#readme', '_blank')}>
            자세히 보기
          </NoticeButton>
        </NoticeContainer>
      )}
      
      <MenuContainer
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
      >
        <InputGroup>
          <StyledInput
            type="text"
            placeholder="닉네임을 입력하세요"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleCreateRoom)}
            maxLength={10}
            className={nameError ? 'error' : ''}
            animate={nameError ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
            whileFocus={{ scale: 1.02 }}
            whileHover={{ scale: 1.01 }}
          />
          {nameError && (
            <ErrorMessage
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              닉네임을 입력해주세요.
            </ErrorMessage>
          )}
        </InputGroup>

        <ButtonGroup>
          <CreateButton
            onClick={handleCreateRoom}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🎮 방 만들기
          </CreateButton>
          
          <JoinButton
            onClick={() => setShowJoinInput(!showJoinInput)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🔗 방 참여하기
          </JoinButton>
        </ButtonGroup>

        {showJoinInput && (
          <JoinSection
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <JoinInput
              type="text"
              placeholder="초대 코드 6자리"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => handleKeyPress(e, handleJoinRoom)}
              maxLength={6}
              className={joinCodeError ? 'error' : ''}
              animate={joinCodeError ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.5 }}
              whileFocus={{ scale: 1.02 }}
              whileHover={{ scale: 1.01 }}
            />
            {joinCodeError && (
              <ErrorMessage
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                초대 코드를 입력해주세요.
              </ErrorMessage>
            )}
            <JoinConfirmButton
              onClick={handleJoinRoom}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              참가하기
            </JoinConfirmButton>
          </JoinSection>
        )}
      </MenuContainer>
    </MainMenuContainer>
  );
};

export default MainMenu; 