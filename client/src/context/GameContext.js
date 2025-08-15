import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';

const GameContext = createContext();

const initialState = {
  playerName: '',
  roomCode: '',
  playerId: '',
  players: [],
  currentRound: 1,
  totalRounds: 12,
  lives: 3,
  hand: [],
  playedCards: [],
  hintCards: [],
  hints: 0, // 힌트 개수
  lastCompletedRound: 0, // 마지막으로 완료된 라운드
  gameStatus: 'waiting', // waiting, lobby, playing, finished
  isHost: false,
  messages: [],
  ws: null,
  emotion: null,
  roundOver: null // 라운드 오버 시 모든 플레이어의 카드 정보
};

const gameReducer = (state, action) => {
  let newState;
  
  switch (action.type) {
    case 'SET_PLAYER_NAME':
      newState = { ...state, playerName: action.payload };
      break;
    
    case 'SET_ROOM_CODE':
      newState = { ...state, roomCode: action.payload };
      break;
    
    case 'SET_PLAYER_ID':
      newState = { ...state, playerId: action.payload };
      break;
    
    case 'SET_PLAYERS':
      newState = { ...state, players: action.payload };
      break;
    
    case 'REMOVE_PLAYER':
      newState = { ...state, players: state.players.filter(p => p.id !== action.payload) };
      break;
    
    case 'SET_NEW_HOST':
      newState = { 
        ...state, 
        players: state.players.map(p => ({
          ...p,
          isHost: p.id === action.payload
        })),
        isHost: action.payload === state.playerId
      };
      break;
    
    case 'SET_GAME_STATE':
      newState = { 
        ...state, 
        currentRound: action.payload.round,
        totalRounds: action.payload.totalRounds,
        lives: action.payload.lives,
        hand: action.payload.hand,
        playedCards: action.payload.playedCards || [],
        hintCards: action.payload.hintCards || []
      };
      break;
    
    case 'SET_GAME_STATUS':
      newState = { ...state, gameStatus: action.payload };
      break;
    
    case 'SET_IS_HOST':
      newState = { ...state, isHost: action.payload };
      break;
    
    case 'UPDATE_HAND':
      newState = { ...state, hand: action.payload };
      break;
    
    case 'ADD_PLAYED_CARD':
      newState = { 
        ...state, 
        playedCards: [...state.playedCards, action.payload]
      };
      break;
    
    case 'CLEAR_PLAYED_CARDS':
      newState = { ...state, playedCards: [] };
      break;
    
    case 'SET_PLAYED_CARDS_FOR_ROUND_OVER':
      newState = { ...state, playedCards: action.payload || [] };
      break;
    
    case 'UPDATE_LIVES':
      newState = { ...state, lives: action.payload };
      break;
    
    case 'ADD_MESSAGE':
      newState = { 
        ...state, 
        messages: [...state.messages, action.payload]
      };
      break;
    
    case 'CLEAR_MESSAGES':
      newState = { ...state, messages: [] };
      break;
    
    case 'SET_WEBSOCKET':
      newState = { ...state, ws: action.payload };
      break;
    
    case 'SET_EMOTION':
      newState = { ...state, emotion: action.payload };
      break;
      
    case 'SET_ROUND_OVER':
      newState = { ...state, roundOver: action.payload };
      break;
      
    case 'CLEAR_ROUND_OVER':
      newState = { ...state, roundOver: null };
      break;
    
    case 'SET_HINTS':
      newState = { ...state, hints: action.payload };
      break;
    
    case 'SET_LAST_COMPLETED_ROUND':
      newState = { ...state, lastCompletedRound: action.payload };
      break;
    
    case 'USE_HINT':
      newState = { ...state, hints: Math.max(0, state.hints - 1) };
      break;
    
    case 'SET_HINT_CARDS':
      newState = { ...state, hintCards: action.payload };
      break;
      
    case 'RESET_GAME':
      newState = { ...initialState };
      break;
    
    default:
      newState = state;
  }
  
  return newState;
};

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const isConnectingRef = useRef(false);
  const hasConnectedRef = useRef(false);

  const handleWebSocketMessage = useCallback((data) => {
    
    switch (data.type) {
      case 'room_created':
        dispatch({ type: 'SET_ROOM_CODE', payload: data.data.roomCode });
        dispatch({ type: 'SET_PLAYER_ID', payload: data.data.playerId });
        dispatch({ type: 'SET_IS_HOST', payload: true });
        dispatch({ type: 'SET_PLAYERS', payload: data.data.players });
        dispatch({ type: 'SET_GAME_STATUS', payload: 'lobby' });
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { text: '방이 생성되었습니다!', type: 'success' }
        });
        break;
        
      case 'player_joined':
        if (data.data.allPlayers) {
          dispatch({ type: 'SET_PLAYERS', payload: data.data.allPlayers });
        }
        // 참가한 플레이어의 playerId 설정
        if (data.data.playerId) {
          dispatch({ type: 'SET_PLAYER_ID', payload: data.data.playerId });
        }
        // 방 참가 시 로비 상태로 설정
        dispatch({ type: 'SET_GAME_STATUS', payload: 'lobby' });
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { text: `${data.data.player.name}님이 입장했습니다!`, type: 'info' }
        });
        break;
        
      case 'player_left':
        // 플레이어 목록 업데이트
        if (data.data.remainingPlayers === 0) {
          // 방이 비었으면 게임 종료
          dispatch({ type: 'SET_GAME_STATUS', payload: 'finished' });
          dispatch({
            type: 'ADD_MESSAGE',
            payload: { text: '모든 플레이어가 나갔습니다. 게임이 종료됩니다.', type: 'error' }
          });
        } else {
          // 플레이어 목록에서 나간 플레이어 제거
          dispatch({ type: 'REMOVE_PLAYER', payload: data.data.playerId });
          
          // 방장이 바뀐 경우
          if (data.data.newHost) {
            dispatch({ type: 'SET_NEW_HOST', payload: data.data.newHost });
            dispatch({
              type: 'ADD_MESSAGE',
              payload: { text: `${data.data.newHostName}님이 새로운 방장이 되었습니다.`, type: 'success' }
            });
          }
          
          // 게임이 진행 중이었다면 중단
          if (data.data.reason === 'disconnected') {
            dispatch({ type: 'SET_GAME_STATUS', payload: 'lobby' });
            dispatch({
              type: 'ADD_MESSAGE',
              payload: { text: `${data.data.playerName}님이 연결이 끊어졌습니다. 게임이 중단되었습니다.`, type: 'warning' }
            });
          } else {
            dispatch({
              type: 'ADD_MESSAGE',
              payload: { text: `${data.data.playerName}님이 방을 나갔습니다.`, type: 'info' }
            });
          }
        }
        break;
        
      case 'game_started':
        dispatch({ type: 'SET_GAME_STATE', payload: data.data });
        dispatch({ type: 'SET_GAME_STATUS', payload: 'playing' });
        dispatch({ type: 'SET_CURRENT_ROUND', payload: data.data.round });
        dispatch({ type: 'SET_LIVES', payload: data.data.lives });
        dispatch({ type: 'SET_HAND', payload: data.data.hand });
        dispatch({ type: 'SET_PLAYED_CARDS', payload: [] });
        dispatch({ type: 'SET_ROUND_OVER', payload: null });
        
        // 힌트 개수 설정 (3, 6, 9라운드에서 힌트 제공)
        const initialHints = [3, 6, 9].includes(data.data.round) ? 1 : 0;
        dispatch({ type: 'SET_HINTS', payload: initialHints });
        
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { text: `라운드 ${data.data.round} 시작!`, type: 'success' }
        });
        break;
        
      case 'card_played':
        dispatch({ type: 'ADD_PLAYED_CARD', payload: data.data });
        dispatch({ type: 'REMOVE_CARD_FROM_HAND', payload: data.data.card });
        break;
        
      case 'round_completed':
        dispatch({ type: 'SET_LAST_COMPLETED_ROUND', payload: data.data.round - 1 });
        dispatch({ type: 'SET_CURRENT_ROUND', payload: data.data.round });
        dispatch({ type: 'SET_HAND', payload: data.data.hand });
        dispatch({ type: 'SET_PLAYED_CARDS', payload: [] });
        dispatch({ type: 'SET_ROUND_OVER', payload: null });
        
        // 다음 라운드 힌트 개수 설정
        const nextRoundHints = [3, 6, 9].includes(data.data.round) ? 1 : 0;
        dispatch({ type: 'SET_HINTS', payload: nextRoundHints });
        
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { text: `라운드 ${data.data.round - 1} 완료! 다음 라운드 시작`, type: 'success' }
        });
        break;
        
      case 'round_over':
        dispatch({ type: 'SET_ROUND_OVER', payload: data.data });
        dispatch({ type: 'SET_LIVES', payload: data.data.lives });
        
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { text: `잘못된 순서입니다! 라운드 ${data.data.round} 오버!`, type: 'error' }
        });
        break;
        
      case 'round_restarted':
        dispatch({ type: 'SET_LAST_COMPLETED_ROUND', payload: 0 });
        dispatch({ type: 'SET_CURRENT_ROUND', payload: data.data.round });
        dispatch({ type: 'SET_HAND', payload: data.data.hand });
        dispatch({ type: 'SET_PLAYED_CARDS', payload: [] });
        dispatch({ type: 'SET_ROUND_OVER', payload: null });
        
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { text: `라운드 ${data.data.round} 재시작!`, type: 'info' }
        });
        break;
        
      case 'hint_used':
        dispatch({ type: 'USE_HINT' });
        dispatch({ type: 'SET_HINT_CARDS', payload: data.data.hintCards });
        break;
        
      case 'emotion':
        dispatch({ type: 'ADD_MESSAGE', payload: { text: `${data.data.playerName}님이 감정을 표현했습니다!`, type: 'info' } });
        dispatch({ type: 'SET_EMOTION', payload: data.data });
        break;
        
      case 'game_over':
        dispatch({ type: 'SET_GAME_STATUS', payload: 'finished' });
        dispatch({ type: 'SET_GAME_STATE', payload: { success: data.data.success, finalScore: data.data.finalScore } });
        
        if (data.data.success) {
          dispatch({
            type: 'ADD_MESSAGE',
            payload: { text: '축하합니다! 모든 라운드를 클리어했습니다!', type: 'success' }
          });
        } else {
          dispatch({
            type: 'ADD_MESSAGE',
            payload: { text: '게임 오버! 모든 생명을 잃었습니다.', type: 'error' }
          });
        }
        break;
        
      default:
        console.log('알 수 없는 메시지 타입:', data.type);
    }
  }, [dispatch]);

  const connect = useCallback(() => {
    if (isConnectingRef.current || wsRef.current || hasConnectedRef.current) {
      return;
    }
    
    isConnectingRef.current = true;
    
    // 환경별 WebSocket URL 설정
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    let wsUrl;
    if (isLocalhost) {
      wsUrl = 'ws://localhost:3001';
    } else if (isGitHubPages) {
      // GitHub Pages에서는 무료 WebSocket 서비스 사용 (예: glitch.com)
      // 또는 사용자에게 로컬 서버 실행 안내
      wsUrl = null;
    } else {
      // 프로덕션 환경
      wsUrl = 'wss://your-websocket-server.com';
    }
    
    if (!wsUrl) {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: { 
          text: 'GitHub Pages에서는 WebSocket 서버가 필요합니다. 로컬에서 서버를 실행하거나 무료 WebSocket 서비스를 사용해주세요.', 
          type: 'warning' 
        }
      });
      isConnectingRef.current = false;
      return;
    }
    
    try {
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        dispatch({ type: 'SET_WEBSOCKET', payload: websocket });
        isConnectingRef.current = false;
        hasConnectedRef.current = true;
        reconnectAttemptsRef.current = 0;
      };
      
      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('메시지 파싱 오류:', error);
        }
      };
      
      websocket.onclose = (event) => {
        if (event.code !== 1000 && event.code !== 1001) {
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 30000);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          } else {
            dispatch({
              type: 'ADD_MESSAGE',
              payload: { text: 'WebSocket 재연결에 실패했습니다. 페이지를 새로고침해주세요.', type: 'error' }
            });
          }
        }
        
        wsRef.current = null;
        dispatch({ type: 'SET_WEBSOCKET', payload: null });
        isConnectingRef.current = false;
        hasConnectedRef.current = false;
      };
      
      websocket.onerror = (error) => {
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { text: 'WebSocket 연결 오류가 발생했습니다.', type: 'error' }
        });
      };
    } catch (error) {
      console.error('WebSocket 연결 오류:', error);
      isConnectingRef.current = false;
    }
  }, [dispatch]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, '사용자 요청으로 연결 해제');
      wsRef.current = null;
      dispatch({ type: 'SET_WEBSOCKET', payload: null });
    }
    
    isConnectingRef.current = false;
    hasConnectedRef.current = false;
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket이 연결되지 않았습니다.');
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const value = {
    ...state,
    dispatch,
    connect,
    disconnect,
    sendMessage
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 