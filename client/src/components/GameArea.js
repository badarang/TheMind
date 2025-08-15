import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import GameCard from './GameCard';

const GameContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-wrap: wrap;
  gap: 20px;
`;

const StatusItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 80px;
`;

const StatusLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-weight: 500;
`;

const StatusValue = styled.div`
  color: white;
  font-size: 1.5rem;
  font-weight: 800;
`;

const LivesContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const Life = styled.div`
  width: 24px;
  height: 24px;
  background: ${props => props.$lost ? 'rgba(255, 255, 255, 0.2)' : '#ff6b6b'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.$lost ? 'rgba(255, 255, 255, 0.3)' : '#ff6b6b'};
  
  ${props => props.$lost && css`
    color: rgba(255, 255, 255, 0.5);
    transform: scale(0.8);
  `}
`;

const GameBoard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  padding: 40px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const PlayedCardsSection = styled.div`
  text-align: center;
`;

const PlayedCardsTitle = styled.h3`
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 20px;
`;

const PlayedCardsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
  min-height: 120px;
  align-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const EmptyMessage = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.1rem;
  font-style: italic;
`;

const HintSection = styled.div`
  text-align: center;
  padding: 20px;
  background: rgba(255, 217, 61, 0.1);
  border-radius: 15px;
  border: 2px solid rgba(255, 217, 61, 0.3);
`;

const HintTitle = styled.h3`
  color: #ffd93d;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 15px;
`;

const PlayerHandSection = styled.div`
  text-align: center;
  margin: 30px 0;
`;

const PlayerHandTitle = styled.h3`
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 20px;
`;

const PlayerHandContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  min-height: 150px;
`;

const EmotionsSection = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: 30px 0;
`;

const EmotionButton = styled(motion.button)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: none;
  font-size: 2.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 40px rgba(255, 255, 255, 0.4);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const HintButton = styled(EmotionButton)`
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
  min-width: 120px; /* 최소 너비 설정 */
  width: auto; /* 자동 너비 */
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(255, 217, 61, 0.6);
  }
`;

const BackButton = styled(motion.button)`
  background: linear-gradient(135deg, #4d9de0 0%, #7bb3f0 100%);
  border: none;
  border-radius: 15px;
  padding: 18px 36px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  color: white;
  font-family: inherit;
  box-shadow: 0 8px 25px rgba(77, 157, 224, 0.4);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(77, 157, 224, 0.6);
  }
`;

const OtherPlayersSection = styled.div`
  text-align: center;
  margin: 20px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const OtherPlayersTitle = styled.h3`
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const OtherPlayersContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
`;

const OtherPlayerCard = styled.div`
  text-align: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const OtherPlayerName = styled.div`
  color: white;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const OtherPlayerCards = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
`;

const EmotionBubble = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 25px;
  border-radius: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(102, 126, 234, 0.4);
  z-index: 1000;
  pointer-events: none;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
`;

const EmotionIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 8px;
  text-align: center;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
`;

const EmotionBubbleText = styled.div`
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
`;

const FloatingCard = styled(motion.div)`
  position: fixed;
  pointer-events: none;
  z-index: 1000;
`;

const RoundOverOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(231, 76, 60, 0.6);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: white;
`;

const GameOverOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const GameOverContent = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
`;

const GameOverTitle = styled.h2`
  color: white;
  font-size: 2.5rem;
  margin-bottom: 30px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const GameOverButtons = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 30px;
`;

const GameOverButton = styled.button`
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.restart {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(76, 175, 80, 0.3);
    }
  }
  
  &.leave {
    background: linear-gradient(135deg, #f44336 0%, #da190b 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(244, 67, 54, 0.3);
    }
  }
`;

const CardsRevealSection = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  width: 100%;
  box-sizing: border-box;
`;

const CardsRevealTitle = styled.h4`
  color: #ffd93d;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 15px;
  text-align: center;
`;

const CardsRevealContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
`;

const PlayerCardsReveal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
`;

const PlayerCardsRevealName = styled.div`
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const EmotionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 20px;
`;

const RoundOverText = styled.div`
  font-size: 4rem;
  margin-bottom: 10px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const RoundOverSubtext = styled.div`
  color: white;
  font-size: 1.2rem;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const HintCardsSection = styled.div`
  margin: 20px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const HintCardsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 15px;
`;

const SectionTitle = styled.h3`
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 15px;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const RoundClearOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(76, 175, 80, 0.6);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const RoundClearContent = styled.div`
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
`;

const RoundClearTitle = styled.h2`
  color: white;
  font-size: 3rem;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const RoundClearSubtitle = styled.div`
  color: white;
  font-size: 1.5rem;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const MessageNotification = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  z-index: 1000;
  max-width: 300px;
  word-wrap: break-word;
  
  &.success {
    background: linear-gradient(135deg, #2ed573 0%, #17c0eb 100%);
    box-shadow: 0 8px 25px rgba(46, 213, 115, 0.4);
  }
  
  &.warning {
    background: linear-gradient(135deg, #ffa502 0%, #ff6348 100%);
    box-shadow: 0 8px 25px rgba(255, 165, 2, 0.4);
  }
  
  &.error {
    background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%);
    box-shadow: 0 8px 25px rgba(255, 71, 87, 0.4);
  }
  
  &.info {
    background: linear-gradient(135deg, #3742fa 0%, #5352ed 100%);
    box-shadow: 0 8px 25px rgba(55, 66, 250, 0.4);
  }
`;

const GameArea = ({ gameData, ws, sendMessage }) => {
  const {
    playerName,
    roomCode,
    playerId,
    players,
    currentRound,
    totalRounds,
    lives,
    hand,
    playedCards,
    hintCards,
    emotion,
    roundOver,
    hints, // hints 추가
    lastCompletedRound, // lastCompletedRound 추가
    gameStatus, // gameStatus 추가
    messages // messages 추가
  } = useGame();
  
  // 모든 useState와 useEffect를 early return 이전에 호출
  const [showEmotion, setShowEmotion] = useState(false);
  const [emotionData, setEmotionData] = useState(null);
  const [emotionPosition, setEmotionPosition] = useState({ x: 0, y: 0 }); // 감정표현 위치 추가
  const [showRoundOver, setShowRoundOver] = useState(false);
  const [floatingCard, setFloatingCard] = useState(null);
  const [clickedCardId, setClickedCardId] = useState(null); // 클릭된 카드 ID 추가
  const [playedCardIds, setPlayedCardIds] = useState(new Set()); // 플레이된 카드 ID들 추적
  const [showRoundClear, setShowRoundClear] = useState(false); // 라운드 클리어 표시
  const [showGameOver, setShowGameOver] = useState(false); // 게임 종료 선택 창
  const [opponentFloatingCard, setOpponentFloatingCard] = useState(null); // 상대방 카드 이동 애니메이션
  const [messageNotification, setMessageNotification] = useState(null); // 메시지 알림

  // 플레이된 카드가 추가될 때마다 playedCardIds 업데이트
  useEffect(() => {
    if (playedCards && playedCards.length > 0) {
      const newPlayedIds = new Set(playedCards.map(pc => pc.card));
      setPlayedCardIds(newPlayedIds);
      
      // 상대방이 카드를 낸 경우에만 애니메이션 표시
      const lastPlayedCard = playedCards[playedCards.length - 1];
      
      if (lastPlayedCard && lastPlayedCard.playerId !== playerId) {
        // 상대방의 실제 위치 계산 (화면 우측에서 시작)
        const startX = window.innerWidth - 200; // 화면 우측
        const startY = window.innerHeight / 2; // 화면 중앙
        
        setOpponentFloatingCard({
          card: lastPlayedCard.card,
          playerName: lastPlayedCard.playerName,
          startX: startX,
          startY: startY,
          endX: window.innerWidth / 2,
          endY: window.innerHeight / 2 - 100
        });
        
        setTimeout(() => {
          setOpponentFloatingCard(null);
        }, 1000);
      }
    }
  }, [playedCards, playerId, players]);

  // 라운드가 변경될 때 playedCardIds 초기화
  useEffect(() => {
    if (currentRound && currentRound > 1) {
      setPlayedCardIds(new Set());
    }
  }, [currentRound]);

  // 라운드 완료 시 승리 창 표시
  useEffect(() => {
    // lastCompletedRound가 0보다 크고, 현재 라운드보다 작으며, roundOver가 없을 때만 승리 창 표시
    if (lastCompletedRound > 0 && lastCompletedRound < currentRound && !roundOver) {
      setShowRoundClear(true);
      setTimeout(() => {
        setShowRoundClear(false);
      }, 3000);
    }
  }, [lastCompletedRound, currentRound, roundOver]);

  // 라운드 클리어 체크
  useEffect(() => {
    
    if (hand && hand.length === 0 && playedCards && playedCards.length > 0 && !roundOver) {
      setShowRoundClear(true);
      setTimeout(() => {
        setShowRoundClear(false);
      }, 3000);
    }
  }, [hand, playedCards, roundOver]);

  // 라운드 오버 상태 감지
  useEffect(() => {
    
    if (roundOver) {
      setShowRoundOver(true);
      setTimeout(() => {
        setShowRoundOver(false);
      }, 3000);
    } else {
      setShowRoundOver(false);
    }
  }, [roundOver]);

  // 게임 종료 상태 감지
  useEffect(() => {
    if (lives <= 0) {
      setShowGameOver(true);
    }
  }, [lives]);

  // 메시지 알림 표시
  useEffect(() => {
    
    if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      setMessageNotification(lastMessage);
      
      // 3초 후 알림 제거
      setTimeout(() => {
        setMessageNotification(null);
      }, 3000);
    }
  }, [messages]);

  // 감정표현 처리
  useEffect(() => {
    
    if (emotion && emotion.emotion) { // emotion.emotion이 존재하는지 확인
      // 랜덤한 위치 설정 (겹침 방지)
      const randomX = Math.random() * 200 - 100; // -100 ~ 100
      const randomY = Math.random() * 200 - 100; // -100 ~ 100
      setEmotionPosition({ x: randomX, y: randomY });
      
      setEmotionData(emotion);
      setShowEmotion(true);
      
      // 3초 후 감정표현 숨김
      const hideTimer = setTimeout(() => {
        setShowEmotion(false);
      }, 3000);
      
      // 3.3초 후 데이터 정리 (사라짐 애니메이션 완료 후)
      const cleanupTimer = setTimeout(() => {
        setEmotionData(null);
      }, 3300);
      
      // 컴포넌트 언마운트 시 타이머 정리
      return () => {
        clearTimeout(hideTimer);
        clearTimeout(cleanupTimer);
      };
    }
  }, [emotion]);

  // 감정표현 표시 (3초 후 자동으로 사라짐)
  useEffect(() => {
    if (showEmotion && emotionData) {
      const timer = setTimeout(() => {
        setShowEmotion(false);
        setEmotionData(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showEmotion, emotionData]);

  // 게임 데이터가 로드되지 않은 경우 로딩 표시
  if ((!hand || !players || players.length === 0) && !roundOver) {
    
    return (
      <GameContainer>
        <div style={{ 
          color: 'white', 
          textAlign: 'center', 
          fontSize: '1.5rem',
          marginTop: '100px'
        }}>
          게임 로딩 중...
          <br />
          <small style={{ fontSize: '1rem', opacity: 0.7 }}>
            hand: {hand ? `${hand.length}장` : '없음'} | 
            players: {players ? `${players.length}명` : '없음'} |
            roundOver: {roundOver ? '있음' : '없음'}
          </small>
        </div>
      </GameContainer>
    );
  }

  const handleCardClick = (card) => {
    
    // 이미 클릭된 카드가 있다면 무시
    if (clickedCardId) {
      return;
    }
    
    // 카드 클릭 시 플로팅 카드 생성
    const cardElement = document.querySelector(`[data-card="${card}"]`);
    if (cardElement) {
      const rect = cardElement.getBoundingClientRect();
      const playedCardsContainer = document.querySelector('.played-cards-container');
      
      let endX, endY;
      if (playedCardsContainer) {
        const containerRect = playedCardsContainer.getBoundingClientRect();
        endX = containerRect.left + containerRect.width / 2;
        endY = containerRect.top + containerRect.height / 2;
      } else {
        // 플레이된 카드 컨테이너를 찾을 수 없는 경우 화면 중앙으로
        endX = window.innerWidth / 2;
        endY = window.innerHeight / 2 - 100;
      }
      
      // 클릭된 카드 ID 설정 (원래 카드 숨김용)
      setClickedCardId(card);
      
      setFloatingCard({
        card,
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
        endX,
        endY
      });
      
      // 애니메이션 완료 후 서버에 메시지 전송
      setTimeout(() => {
        setFloatingCard(null);
        setClickedCardId(null); // 클릭된 카드 ID 초기화
        sendMessage({
          type: 'play_card',
          data: { card }
        });
      }, 800);
    } else {
      console.error('카드 요소를 찾을 수 없음:', card);
      // 요소를 찾을 수 없는 경우 바로 서버에 메시지 전송
      sendMessage({
        type: 'play_card',
        data: { card }
      });
    }
  };

  const handleEmotion = (emotionType) => {
    
    sendMessage({
      type: 'emotion',
      data: { emotion: emotionType }
    });
  };

  const handleUseHint = () => {
    
    sendMessage({
      type: 'use_hint',
      data: {}
    });
  };

  const handleLeaveGame = () => {
    sendMessage({
      type: 'leave_room',
      data: { roomCode: roomCode }
    });
    
    // 메인 메뉴로 돌아가기
    // dispatch({ type: 'RESET_GAME' }); // 이 부분은 컨텍스트에서 처리하므로 제거
  };

  return (
    <GameContainer>
      {/* 게임 상태 표시 */}
      <GameHeader>
        <StatusItem>
          <StatusLabel>라운드</StatusLabel>
          <StatusValue>{currentRound}</StatusValue>
        </StatusItem>
        
        <StatusItem>
          <StatusLabel>힌트</StatusLabel>
          <StatusValue>{hints}</StatusValue>
        </StatusItem>
        
        <StatusItem>
          <StatusLabel>생명</StatusLabel>
          <LivesContainer>
            {[1, 2, 3].map((life) => (
              <Life key={life} $lost={life > lives}>
                ♥
              </Life>
            ))}
          </LivesContainer>
        </StatusItem>
        
        <StatusItem>
          <StatusLabel>플레이어</StatusLabel>
          <StatusValue>{players.length}</StatusValue>
        </StatusItem>
      </GameHeader>

      {/* 플레이된 카드들 */}
      <PlayedCardsSection>
        <SectionTitle>플레이된 카드들</SectionTitle>
        <PlayedCardsContainer className="played-cards-container">
          <AnimatePresence>
            {playedCards && playedCards.map((playedCard, index) => (
              <motion.div
                key={`${playedCard.card}-${index}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <GameCard
                  card={playedCard.card}
                  $isPlayed={true}
                  $isHand={false}
                  $isHint={false}
                  $index={index}
                  $color={playedCard.playerId === playerId ? 'blue' : 'red'}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </PlayedCardsContainer>
      </PlayedCardsSection>

      {/* 힌트 카드들 */}
      {hintCards && hintCards.length > 0 && (
        <HintCardsSection>
          <SectionTitle>힌트 카드들</SectionTitle>
          <HintCardsContainer>
            {hintCards.map((hintCard, index) => (
              <GameCard
                key={`hint-${hintCard.card}-${index}`}
                card={hintCard.card}
                $isPlayed={false}
                $isHand={false}
                $isHint={true}
                $index={index}
                $color="yellow"
              />
            ))}
          </HintCardsContainer>
        </HintCardsSection>
      )}

      {/* 내 카드 섹션 */}
      <PlayerHandSection>
        <PlayerHandTitle>내 카드</PlayerHandTitle>
        <PlayerHandContainer>
          <AnimatePresence>
            {hand && hand.map((card, index) => (
              // 플레이된 카드나 클릭된 카드는 숨김
              (playedCardIds.has(card) || clickedCardId === card) ? null : (
                <motion.div
                  key={`hand-${card}-${index}`}
                  initial={{ opacity: 0, y: 50, rotate: -180, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                  exit={{ 
                    opacity: 0, 
                    y: -50, 
                    rotate: 180, 
                    scale: 0.5,
                    x: Math.random() * 200 - 100
                  }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    exit: { duration: 0.4 }
                  }}
                  whileHover={{ 
                    scale: 1.1, 
                    y: -10,
                    rotate: Math.random() * 10 - 5
                  }}
                >
                  <GameCard
                    card={card}
                    isHand={true}
                    onClick={() => handleCardClick(card)}
                    data-card={card}
                    index={index}
                  />
                </motion.div>
              )
            ))}
          </AnimatePresence>
        </PlayerHandContainer>
      </PlayerHandSection>

      {/* 감정표현 버튼들 */}
      <EmotionButtons>
        <EmotionButton onClick={() => handleEmotion('stop')}>✋</EmotionButton>
        <EmotionButton onClick={() => handleEmotion('ok')}>👌</EmotionButton>
        <EmotionButton onClick={() => handleEmotion('low')}>👇</EmotionButton>
        <EmotionButton onClick={() => handleEmotion('high')}>👆</EmotionButton>
        
        {/* 힌트 버튼 */}
        {hints > 0 && (
          <HintButton onClick={handleUseHint}>
            💡 힌트 ({hints})
          </HintButton>
        )}
      </EmotionButtons>

      <div style={{ textAlign: 'center' }}>
        {gameStatus === 'lobby' && (
          <BackButton
            onClick={handleLeaveGame}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🏠 로비로 돌아가기
          </BackButton>
        )}
      </div>

      {/* 감정표현 버블 */}
      <AnimatePresence>
        {showEmotion && emotionData && emotionData.emotion && (
          <EmotionBubble
            initial={{ 
              opacity: 0, 
              scale: 0.5, 
              x: emotionPosition.x, 
              y: emotionPosition.y 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              x: emotionPosition.x, 
              y: emotionPosition.y 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.5, 
              x: emotionPosition.x, 
              y: emotionPosition.y 
            }}
            transition={{ 
              duration: 0.2, // 빠른 등장
              exit: { duration: 0.3 } // 빠른 사라짐
            }}
          >
            <EmotionIcon>
              {emotionData.emotion === 'stop' && '✋'}
              {emotionData.emotion === 'ok' && '👌'}
              {emotionData.emotion === 'low' && '👇'}
              {emotionData.emotion === 'high' && '👆'}
            </EmotionIcon>
            <EmotionBubbleText>
              {emotionData.playerName}님
            </EmotionBubbleText>
          </EmotionBubble>
        )}
      </AnimatePresence>

      {/* 메시지 알림 */}
      <AnimatePresence>
        {messageNotification && (
          <MessageNotification
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className={messageNotification.type}
          >
            {messageNotification.text}
          </MessageNotification>
        )}
      </AnimatePresence>

      {/* 라운드 오버 오버레이 */}
      <AnimatePresence>
        {showRoundOver && (
          <RoundOverOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <RoundOverText>😣</RoundOverText>
            <RoundOverSubtext>라운드 오버!</RoundOverSubtext>
            <RoundOverSubtext>모든 카드를 공개합니다.</RoundOverSubtext>
            
            {/* 모든 카드 공개 (플레이된 카드 + 남은 카드) */}
            <CardsRevealSection>
              <CardsRevealTitle>이번 라운드의 모든 카드:</CardsRevealTitle>
              
              {/* 플레이된 카드들 */}
              {((playedCards && playedCards.length > 0) || (roundOver && roundOver.playedCards && roundOver.playedCards.length > 0)) && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ 
                    color: '#6bcf7f', 
                    fontSize: '1rem', 
                    fontWeight: '600',
                    marginBottom: '10px',
                    textAlign: 'center'
                  }}>
                    플레이된 카드들:
                  </div>
                  <CardsRevealContainer>
                    {(roundOver && roundOver.playedCards ? roundOver.playedCards : playedCards).map((playedCard, index) => (
                      <motion.div
                        key={`played-card-${playedCard.card}-${index}`}
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <GameCard
                          card={playedCard.card}
                          isHand={false}
                          isPlayed={true}
                          playerName={playedCard.playerName}
                        />
                      </motion.div>
                    ))}
                  </CardsRevealContainer>
                </div>
              )}
              
              {/* 각 플레이어의 남은 카드들 */}
              {roundOver && roundOver.allPlayersCards && (
                <div>
                  <div style={{ 
                    color: '#e74c3c', 
                    fontSize: '1rem', 
                    fontWeight: '600',
                    marginBottom: '10px',
                    textAlign: 'center'
                  }}>
                    남은 카드들:
                  </div>
                  {roundOver.allPlayersCards.map((player, playerIndex) => (
                    <PlayerCardsReveal key={player.id}>
                      <PlayerCardsRevealName>
                        {player.name} {player.id === playerId ? '(나)' : ''}:
                      </PlayerCardsRevealName>
                      <CardsRevealContainer>
                        {player.hand && player.hand.length > 0 ? (
                          player.hand.map((card, index) => (
                            <motion.div
                              key={`remaining-card-${player.id}-${card}-${index}`}
                              initial={{ opacity: 0, scale: 0.5, y: 20 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: (playerIndex * 0.2) + (index * 0.1) }}
                            >
                              <GameCard
                                card={card}
                                isHand={false}
                                isPlayed={false}
                                isOtherPlayer={player.id !== playerId}
                                isRevealed={true}
                                playerName=""
                              />
                            </motion.div>
                          ))
                        ) : (
                          <div style={{ 
                            color: 'rgba(255,255,255,0.7)', 
                            fontSize: '0.9rem',
                            fontStyle: 'italic'
                          }}>
                            모든 카드를 플레이함
                          </div>
                        )}
                      </CardsRevealContainer>
                    </PlayerCardsReveal>
                  ))}
                </div>
              )}
            </CardsRevealSection>
          </RoundOverOverlay>
        )}
      </AnimatePresence>

      {/* 라운드 클리어 오버레이 */}
      <AnimatePresence>
        {showRoundClear && (
          <RoundClearOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <RoundClearContent>
              <RoundClearTitle>🎉</RoundClearTitle>
              <RoundClearSubtitle>라운드 승리!</RoundClearSubtitle>
              <RoundClearSubtitle>다음 라운드로 넘어갑니다.</RoundClearSubtitle>
            </RoundClearContent>
          </RoundClearOverlay>
        )}
      </AnimatePresence>

      {/* 플로팅 카드 애니메이션 */}
      <AnimatePresence>
        {floatingCard && (
          <FloatingCard
            initial={{ 
              x: floatingCard.startX - 50, // 카드의 중심점으로 조정
              y: floatingCard.startY - 75,
              scale: 1,
              rotate: 0,
              opacity: 1,
              zIndex: 1000
            }}
            animate={{ 
              x: floatingCard.endX - 50, // 카드의 중심점으로 조정
              y: floatingCard.endY - 75,
              scale: 1.1,
              rotate: 15,
              opacity: 0.9,
              zIndex: 1000
            }}
            exit={{ 
              scale: 0.8,
              opacity: 0,
              rotate: 30
            }}
            transition={{ 
              duration: 0.8,
              ease: "easeInOut"
            }}
          >
            <GameCard
              card={floatingCard.card}
              isHand={false}
              isPlayed={false}
              playerName=""
            />
          </FloatingCard>
        )}
      </AnimatePresence>

      {/* 상대방 카드 플로팅 애니메이션 */}
      <AnimatePresence>
        {opponentFloatingCard && (
          <FloatingCard
            initial={{ 
              x: opponentFloatingCard.startX - 50, // 카드의 중심점으로 조정
              y: opponentFloatingCard.startY - 75,
              scale: 1,
              rotate: 0,
              opacity: 1,
              zIndex: 1000
            }}
            animate={{ 
              x: opponentFloatingCard.endX - 50, // 카드의 중심점으로 조정
              y: opponentFloatingCard.endY - 75,
              scale: 1.1,
              rotate: 15,
              opacity: 0.9,
              zIndex: 1000
            }}
            exit={{ 
              scale: 0.8,
              opacity: 0,
              rotate: 30
            }}
            transition={{ 
              duration: 0.8,
              ease: "easeInOut"
            }}
          >
            <GameCard
              card={opponentFloatingCard.card}
              isHand={false}
              isPlayed={false}
              playerName={opponentFloatingCard.playerName}
            />
          </FloatingCard>
        )}
      </AnimatePresence>

      {/* 게임 종료 선택 창 */}
      <AnimatePresence>
        {showGameOver && (
          <GameOverOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GameOverContent>
              <GameOverTitle>게임 종료</GameOverTitle>
              <GameOverButtons>
                <GameOverButton
                  className="restart"
                  onClick={() => {
                    setShowGameOver(false);
                    sendMessage({ type: 'restart_game' });
                  }}
                >
                  게임 재시작
                </GameOverButton>
                <GameOverButton
                  className="leave"
                  onClick={() => {
                    setShowGameOver(false);
                    handleLeaveGame();
                  }}
                >
                  방 나가기
                </GameOverButton>
              </GameOverButtons>
            </GameOverContent>
          </GameOverOverlay>
        )}
      </AnimatePresence>
    </GameContainer>
  );
};

export default GameArea; 