const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 게임 상태 관리
const rooms = new Map();
const players = new Map();

// 게임 설정
const GAME_CONFIG = {
  maxPlayers: 4,
  maxLives: 3,
  roundsByPlayers: {
    2: 12,
    3: 10,
    4: 10
  }
};

// WebSocket 연결 처리
wss.on('connection', (ws) => {
  console.log('새로운 클라이언트 연결');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(ws, data);
    } catch (error) {
      console.error('메시지 파싱 오류:', error);
    }
  });

  ws.on('close', () => {
    handlePlayerDisconnect(ws);
  });
});

// 메시지 핸들러
function handleMessage(ws, data) {
  switch (data.type) {
    case 'create_room':
      handleCreateRoom(ws, data);
      break;
    case 'join_room':
      handleJoinRoom(ws, data);
      break;
    case 'start_game':
      handleStartGame(ws, data);
      break;
    case 'play_card':
      handlePlayCard(ws, data);
      break;
    case 'emotion':
      handleEmotion(ws, data);
      break;
    case 'leave_room':
      handleLeaveRoom(ws, data);
      break;
    case 'use_hint':
      handleUseHint(ws, data);
      break;
    case 'restart_game':
      handleRestartGame(ws, data);
      break;
  }
}

// 방 생성
function handleCreateRoom(ws, data) {
  const roomCode = generateRoomCode();
  const playerId = uuidv4();
  
  const room = {
    id: roomCode,
    status: 'lobby', // 'waiting'에서 'lobby'로 변경
    players: [{
      id: playerId,
      name: data.data.playerName,
      isHost: true,
      ws: ws
    }]
  };
  
  rooms.set(roomCode, room);
  players.set(ws, { roomCode, playerId });
  
  ws.send(JSON.stringify({
    type: 'room_created',
    data: {
      roomCode,
      playerId,
      players: room.players.map(p => ({ 
        id: p.id, 
        name: p.name, 
        isHost: p.isHost,
        hand: p.hand || []
      }))
    }
  }));
  
  console.log(`방 생성됨: ${roomCode} by ${data.data.playerName}`);
}

// 방 참여
function handleJoinRoom(ws, data) {
  const room = rooms.get(data.data.roomCode);
  
  if (!room) {
    ws.send(JSON.stringify({
      type: 'error',
      message: '존재하지 않는 방입니다.'
    }));
    return;
  }
  
  if (room.players.length >= GAME_CONFIG.maxPlayers) {
    ws.send(JSON.stringify({
      type: 'error',
      message: '방이 가득 찼습니다.'
    }));
    return;
  }
  
  if (room.status !== 'lobby') {
    ws.send(JSON.stringify({
      type: 'error',
      message: '게임이 이미 진행 중입니다.'
    }));
    return;
  }
  
  const playerId = uuidv4();
  const player = {
    id: playerId,
    name: data.data.playerName,
    isHost: false,
    ws: ws
  };
  
  room.players.push(player);
  players.set(ws, { roomCode: data.data.roomCode, playerId });
  
  // 모든 플레이어에게 업데이트 전송 (전체 플레이어 목록 포함)
  broadcastToRoom(room, {
    type: 'player_joined',
    data: {
      player: { id: player.id, name: player.name, isHost: player.isHost },
      allPlayers: room.players.map(p => ({ 
        id: p.id, 
        name: p.name, 
        isHost: p.isHost,
        hand: p.hand || []
      }))
    }
  });
  
  // 참가한 플레이어에게 playerId 전송
  ws.send(JSON.stringify({
    type: 'player_joined',
    data: {
      player: { id: player.id, name: player.name, isHost: player.isHost },
      allPlayers: room.players.map(p => ({ 
        id: p.id, 
        name: p.name, 
        isHost: p.isHost,
        hand: p.hand || []
      })),
      playerId: player.id // 참가한 플레이어의 ID 전송
    }
  }));
  
  console.log(`${data.data.playerName}님이 방 ${data.data.roomCode}에 참가`);
}

// 게임 시작
function handleStartGame(ws, data) {
  const playerInfo = players.get(ws);
  if (!playerInfo) return;
  
  const room = rooms.get(playerInfo.roomCode);
  if (!room || room.status !== 'lobby') return;
  
  const player = room.players.find(p => p.id === playerInfo.playerId);
  if (!player || !player.isHost) return;
  
  // 게임 상태 초기화
  room.status = 'playing';
  room.gameState = {
    round: 1,
    totalRounds: room.players.length === 2 ? 12 : 10,
    lives: GAME_CONFIG.maxLives,
    playedCards: [],
    hintCards: []
  };
  
  // 전역 카드 풀 초기화
  resetGlobalCards();
  
  // 각 플레이어에게 카드 분배
  room.players.forEach(player => {
    const hand = generateHand(1); // 1라운드는 1장
    player.hand = hand;
    
    player.ws.send(JSON.stringify({
      type: 'game_started',
      data: {
        round: 1,
        totalRounds: room.gameState.totalRounds,
        lives: GAME_CONFIG.maxLives,
        hand,
        players: room.players.map(p => ({ 
          id: p.id, 
          name: p.name, 
          isHost: p.isHost,
          hand: p.hand || []
        }))
      }
    }));
  });
  
  console.log(`게임 시작: 방 ${room.id}`);
}

// 카드 플레이
function handlePlayCard(ws, data) {
  const playerInfo = players.get(ws);
  if (!playerInfo) return;
  
  const room = rooms.get(playerInfo.roomCode);
  if (!room || room.status !== 'playing') return;
  
  const player = room.players.find(p => p.id === playerInfo.playerId);
  if (!player) return;
  
  const cardIndex = player.hand.indexOf(data.data.card);
  if (cardIndex === -1) return;
  
  // 카드 제거
  player.hand.splice(cardIndex, 1);
  
  // 카드 순서 검증
  const isCorrect = validateCardOrder(room, data.data.card);
  
  if (isCorrect) {
    room.gameState.playedCards.push({
      card: data.data.card,
      playerId: player.id,
      playerName: player.name
    });
    
    // 라운드 완료 체크
    if (isRoundComplete(room)) {
      handleRoundComplete(room);
    } else {
      // 모든 플레이어에게 카드 플레이 알림
      broadcastToRoom(room, {
        type: 'card_played',
        data: {
          card: data.data.card,
          playerId: player.id,
          playerName: player.name,
          isCorrect: true
        }
      });
    }
  } else {
    // 잘못된 순서 - 즉시 라운드 오버
    // 잘못된 카드를 playedCards에 추가
    room.gameState.playedCards.push({
      card: data.data.card,
      playerId: player.id,
      playerName: player.name
    });
    
    handleRoundOver(room, data.data.card, player);
  }
}

// 라운드 오버 (잘못된 순서)
function handleRoundOver(room, incorrectCard, player) {
  // HP 감소
  room.gameState.lives--;
  
  const roundOverData = {
    incorrectCard,
    playerName: player.name,
    round: room.gameState.round,
    lives: room.gameState.lives,
    playedCards: room.gameState.playedCards, // 플레이된 카드 정보 추가
    allPlayersCards: room.players.map(p => ({
      id: p.id,
      name: p.name,
      hand: p.hand || []
    }))
  };
  
  // 모든 플레이어에게 라운드 오버 알림 (모든 카드 공개)
  broadcastToRoom(room, {
    type: 'round_over',
    data: roundOverData
  });
  
  // 3초 후 라운드 재시작
  setTimeout(() => {
    restartRound(room, room.gameState.round);
  }, 3000);
}

// 게임 재시작
function handleRestartGame(ws, data) {
  const playerInfo = players.get(ws);
  if (!playerInfo) return;
  
  const room = rooms.get(playerInfo.roomCode);
  if (!room) return;
  
  const player = room.players.find(p => p.id === playerInfo.playerId);
  if (!player || !player.isHost) return; // 방장만 재시작 가능
  
  // 게임 상태 초기화
  room.status = 'playing';
  room.gameState = {
    round: 1,
    totalRounds: room.players.length === 2 ? 12 : 10,
    lives: GAME_CONFIG.maxLives,
    playedCards: [],
    hintCards: []
  };
  
  // 전역 카드 풀 초기화
  resetGlobalCards();
  
  // 각 플레이어에게 카드 분배
  room.players.forEach(player => {
    const hand = generateHand(1); // 1라운드는 1장
    player.hand = hand;
    
    player.ws.send(JSON.stringify({
      type: 'game_started',
      data: {
        round: 1,
        totalRounds: room.gameState.totalRounds,
        lives: GAME_CONFIG.maxLives,
        hand,
        players: room.players.map(p => ({ 
          id: p.id, 
          name: p.name, 
          isHost: p.isHost,
          hand: p.hand || []
        }))
      }
    }));
  });
  
  console.log(`게임 재시작: 방 ${room.roomCode}`);
}

// 힌트 사용
function handleUseHint(ws, data) {
  const playerInfo = players.get(ws);
  if (!playerInfo) return;
  
  const room = rooms.get(playerInfo.roomCode);
  if (!room) return;
  
  const player = room.players.find(p => p.id === playerInfo.playerId);
  if (!player) return;
  
  // 모든 플레이어의 가장 작은 카드 찾기
  const allLowestCards = [];
  room.players.forEach(p => {
    if (p.hand && p.hand.length > 0) {
      const lowestCard = Math.min(...p.hand);
      allLowestCards.push({
        card: lowestCard,
        playerId: p.id,
        playerName: p.name
      });
    }
  });
  
  // 가장 작은 카드들을 정렬
  allLowestCards.sort((a, b) => a.card - b.card);
  
  // 모든 플레이어에게 힌트 정보 전송
  broadcastToRoom(room, {
    type: 'hint_used',
    data: {
      playerId: player.id,
      playerName: player.name,
      hintCards: allLowestCards
    }
  });
  
  console.log(`${player.name}님이 힌트를 사용했습니다. 힌트 카드:`, allLowestCards);
}

// 감정 표현
function handleEmotion(ws, data) {
  const playerInfo = players.get(ws);
  if (!playerInfo) {
    return;
  }
  
  const room = rooms.get(playerInfo.roomCode);
  if (!room) {
    return;
  }
  
  const player = room.players.find(p => p.id === playerInfo.playerId);
  if (!player) {
    return;
  }
  
  // 감정 데이터 추출 (data.data.emotion 또는 data.emotion)
  const emotionType = data.data?.emotion || data.emotion;
  
  if (!emotionType) {
    return;
  }
  
  // 모든 플레이어에게 감정 표현 전송
  broadcastToRoom(room, {
    type: 'emotion',
    data: {
      playerId: player.id,
      playerName: player.name,
      emotion: emotionType
    }
  });
}

// 방 나가기
function handleLeaveRoom(ws, data) {
  const playerInfo = players.get(ws);
  if (!playerInfo) return;
  
  const room = rooms.get(playerInfo.roomCode);
  if (!room) return;
  
  const player = room.players.find(p => p.id === playerInfo.playerId);
  if (!player) return;
  
  const wasHost = player.isHost;
  
  // 플레이어 제거
  const playerIndex = room.players.findIndex(p => p.id === playerInfo.playerId);
  if (playerIndex !== -1) {
    room.players.splice(playerIndex, 1);
    
    // 방장이 나간 경우 새로운 방장 지정
    if (wasHost && room.players.length > 0) {
      room.players[0].isHost = true;
    }
    
    // 방이 비었으면 삭제
    if (room.players.length === 0) {
      rooms.delete(playerInfo.roomCode);
    } else {
      // 게임이 진행 중이었다면 게임 중단
      if (room.status === 'playing') {
        room.status = 'lobby';
      }
      
      // 남은 플레이어들에게 업데이트 전송
      broadcastToRoom(room, {
        type: 'player_left',
        data: {
          playerId: player.id,
          playerName: player.name,
          reason: 'left',
          remainingPlayers: room.players.length,
          newHost: room.players[0]?.id,
          newHostName: room.players[0]?.name
        }
      });
    }
  }
  
  // 플레이어 정보 정리
  players.delete(ws);
}

// 플레이어 연결 해제 처리
function handlePlayerDisconnect(ws) {
  const playerInfo = players.get(ws);
  if (!playerInfo) return;
  
  const room = rooms.get(playerInfo.roomCode);
  if (!room) return;
  
  const playerIndex = room.players.findIndex(p => p.id === playerInfo.playerId);
  if (playerIndex !== -1) {
    const player = room.players[playerIndex];
    const wasHost = player.isHost;
    
    // 플레이어 제거
    room.players.splice(playerIndex, 1);
    
    // 방장이 나간 경우 새로운 방장 지정
    if (wasHost && room.players.length > 0) {
      room.players[0].isHost = true;
    }
    
    // 방이 비었으면 삭제
    if (room.players.length === 0) {
      rooms.delete(playerInfo.roomCode);
    } else {
      // 게임이 진행 중이었다면 게임 중단
      if (room.status === 'playing') {
        room.status = 'lobby';
      }
      
      // 남은 플레이어들에게 업데이트 전송
      broadcastToRoom(room, {
        type: 'player_left',
        data: {
          playerId: player.id,
          playerName: player.name,
          reason: 'disconnected',
          remainingPlayers: room.players.length,
          newHost: room.players[0]?.id,
          newHostName: room.players[0]?.name
        }
      });
    }
  }
  
  // 플레이어 정보 정리
  players.delete(ws);
}

// 라운드 완료 처리
function handleRoundComplete(room) {
  const nextRound = room.gameState.round + 1;
  
  if (nextRound > room.gameState.totalRounds) {
    // 게임 승리
    handleGameOver(room, true);
    return;
  }
  
  // 다음 라운드 시작
  room.gameState.round = nextRound;
  room.gameState.playedCards = [];
  
  // 전역 카드 풀 초기화 (새 라운드 시작)
  resetGlobalCards();
  
  // 힌트 라운드 체크
  if (nextRound === 3 || nextRound === 6 || nextRound === 9) {
    room.gameState.hintCards = [];
    room.players.forEach(player => {
      if (player.hand.length > 0) {
        const lowestCard = Math.min(...player.hand);
        room.gameState.hintCards.push({
          playerId: player.id,
          playerName: player.name,
          card: lowestCard
        });
      }
    });
  }
  
  // 각 플레이어에게 새 카드 분배
  room.players.forEach(player => {
    player.hand = generateHand(nextRound);
    
    player.ws.send(JSON.stringify({
      type: 'round_completed',
      data: {
        round: nextRound,
        hand: player.hand,
        hintCards: room.gameState.hintCards,
        lives: room.gameState.lives,
        players: room.players.map(p => ({ 
          id: p.id, 
          name: p.name, 
          isHost: p.isHost,
          hand: p.hand || []
        }))
      }
    }));
  });
  
  console.log(`라운드 ${room.gameState.round} 완료`);
}

// 라운드 재시작
function handleRoundRestart(room, incorrectCard, player) {
  // 현재 라운드 정보 저장
  const currentRound = room.gameState.round;
  
  // 모든 플레이어에게 라운드 재시작 알림
  broadcastToRoom(room, {
    type: 'round_restart',
    data: {
      incorrectCard,
      playerName: player.name,
      round: currentRound
    }
  });
  
  // 잠시 후 라운드 재시작
  setTimeout(() => {
    restartRound(room, currentRound);
  }, 2000);
}

// 라운드 재시작 실행
function restartRound(room, round) {
  // 플레이된 카드 초기화
  room.gameState.playedCards = [];
  
  // 전역 카드 풀 초기화 (라운드 재시작)
  resetGlobalCards();
  
  // 각 플레이어에게 새 카드 분배
  room.players.forEach(player => {
    player.hand = generateHand(round);
    
    player.ws.send(JSON.stringify({
      type: 'round_restarted',
      data: {
        round,
        hand: player.hand,
        lives: room.gameState.lives,
        players: room.players.map(p => ({ 
          id: p.id, 
          name: p.name, 
          isHost: p.isHost,
          hand: p.hand || []
        }))
      }
    }));
  });
  
  console.log(`라운드 ${round} 재시작`);
}

// 게임 오버 처리
function handleGameOver(room, success) {
  room.status = 'finished';
  
  broadcastToRoom(room, {
    type: 'game_over',
    data: {
      success,
      finalScore: {
        round: room.gameState.round,
        lives: room.gameState.lives
      }
    }
  });
  
  console.log(`게임 종료: 방 ${room.id}, 성공: ${success}`);
}

// 카드 순서 검증
function validateCardOrder(room, card) {
  // 현재 플레이된 카드들
  const playedCards = room.gameState.playedCards.map(pc => pc.card);
  
  // 모든 플레이어의 남은 카드들
  const remainingCards = [];
  room.players.forEach(player => {
    remainingCards.push(...player.hand);
  });
  
  // 플레이하려는 카드보다 작은 카드가 남아있는지 확인
  for (let remainingCard of remainingCards) {
    if (remainingCard < card) {
      return false; // 더 작은 카드가 남아있으면 즉시 false
    }
  }
  
  // 순서가 올바른지 확인 (오름차순)
  const allCards = [...playedCards, card];
  allCards.sort((a, b) => a - b);
  return allCards[allCards.length - 1] === card;
}

// 라운드 완료 체크
function isRoundComplete(room) {
  return room.players.every(player => player.hand.length === 0);
}

// 전역적으로 사용된 카드 추적
const globalUsedCards = new Set();

// 카드 생성 (중복 방지)
function generateHand(round) {
  const hand = [];
  
  for (let i = 0; i < round; i++) {
    let card;
    do {
      card = Math.floor(Math.random() * 100) + 1;
    } while (globalUsedCards.has(card));
    
    hand.push(card);
    globalUsedCards.add(card);
  }
  
  return hand.sort((a, b) => a - b);
}

// 라운드 시작 시 전역 카드 초기화
function resetGlobalCards() {
  globalUsedCards.clear();
  console.log('전역 카드 풀 초기화됨');
}

// 방 코드 생성
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 방 내 모든 플레이어에게 메시지 전송
function broadcastToRoom(room, message) {
  room.players.forEach(player => {
    if (player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(JSON.stringify(message));
    }
  });
}

// 서버 시작
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});

// 상태 확인 엔드포인트
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    rooms: rooms.size,
    players: players.size,
    timestamp: new Date().toISOString()
  });
});