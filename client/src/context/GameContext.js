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

  const connect = useCallback(() => {
    if (isConnectingRef.current || wsRef.current || hasConnectedRef.current) {
      return;
    }

    isConnectingRef.current = true;
    
    try {
      const websocket = new WebSocket('ws://localhost:3001');
      
      websocket.onopen = () => {
        dispatch({ type: 'SET_WEBSOCKET', payload: websocket });
        isConnectingRef.current = false;
        hasConnectedRef.current = true;
        reconnectAttemptsRef.current = 0;
        
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { text: '서버에 연결되었습니다.', type: 'success' }
        });
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('WebSocket 메시지 파싱 오류:', error);
        }
      };

      websocket.onclose = (event) => {
        if (event.code !== 1000 && event.code !== 1001) {
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          } else {
            hasConnectedRef.current = false;
            dispatch({
              type: 'ADD_MESSAGE',
              payload: { text: '서버 연결에 실패했습니다. 페이지를 새로고침해주세요.', type: 'error' }
            });
          }
        }
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
  }, []);

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
        // 게임 시작 시 힌트 개수 설정 (3, 6, 9라운드에 힌트 제공)
        const initialHints = data.data.round === 3 || data.data.round === 6 || data.data.round === 9 ? 1 : 0;
        dispatch({ type: 'SET_HINTS', payload: initialHints });
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { text: '게임이 시작되었습니다!', type: 'success' }
        });
        break;
        
      case 'card_played':
        dispatch({ type: 'ADD_PLAYED_CARD', payload: data.data });
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { text: `${data.data.playerName}님이 ${data.data.card}번 카드를 플레이했습니다.`, type: 'info' }
        });
        break;
        
      case 'life_lost':
        dispatch({ type: 'UPDATE_LIVES', payload: data.data.remainingLives });
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { text: `${data.data.playerName}님이 잘못된 순서로 카드를 플레이했습니다. 생명이 하나 줄었습니다.`, type: 'error' }
        });
        break;
        
      case 'round_completed':
        dispatch({ type: 'SET_GAME_STATE', payload: data.data });
        dispatch({ type: 'CLEAR_PLAYED_CARDS' });
        // 마지막으로 완료된 라운드 설정
        dispatch({ type: 'SET_LAST_COMPLETED_ROUND', payload: data.data.round - 1 });
        // 다음 라운드에서 힌트 제공 여부 확인
        const nextRoundHints = data.data.round === 3 || data.data.round === 6 || data.data.round === 9 ? 1 : 0;
        dispatch({ type: 'SET_HINTS', payload: nextRoundHints });
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { text: `라운드 ${data.data.round - 1} 완료! 다음 라운드 시작`, type: 'success' }
        });
        break;
        
      case 'round_restart':
        dispatch({ type: 'CLEAR_PLAYED_CARDS' });
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { text: `${data.data.playerName}님이 잘못된 순서로 카드를 플레이했습니다. 라운드 ${data.data.round}를 다시 시작합니다.`, type: 'error' }
        });
        break;
        
      case 'round_over':
        dispatch({ type: 'SET_ROUND_OVER', payload: data.data });
        // 플레이된 카드를 roundOver 데이터에서 가져온 것으로 설정
        dispatch({ type: 'SET_PLAYED_CARDS_FOR_ROUND_OVER', payload: data.data.playedCards });
        dispatch({ type: 'SET_GAME_STATE', payload: { ...state.gameState, lives: data.data.lives } });
        // lastCompletedRound는 설정하지 않음 (라운드 오버는 완료가 아님)
        dispatch({ type: 'ADD_MESSAGE', payload: { text: `잘못된 순서입니다! 라운드 ${data.data.round} 오버!`, type: 'error' } });
        break;
        
      case 'round_restarted':
        dispatch({ type: 'SET_GAME_STATE', payload: data.data });
        dispatch({ type: 'CLEAR_PLAYED_CARDS' });
        dispatch({ type: 'CLEAR_ROUND_OVER' });
        // 라운드 재시작 시 lastCompletedRound 초기화
        dispatch({ type: 'SET_LAST_COMPLETED_ROUND', payload: 0 });
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { text: `라운드 ${data.data.round} 재시작!`, type: 'info' }
        });
        break;
        
      case 'game_over':
        dispatch({ type: 'SET_GAME_STATUS', payload: 'finished' });
        dispatch({ type: 'SET_GAME_STATE', payload: { 
          ...state.gameState, 
          success: data.data.success,
          finalScore: data.data.finalScore 
        }});
        break;
        
      case 'hint_used':
        dispatch({ type: 'USE_HINT' });
        dispatch({ type: 'SET_HINT_CARDS', payload: data.data.hintCards });
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { text: `${data.data.playerName}님이 힌트를 사용했습니다!`, type: 'info' }
        });
        break;
        
      case 'emotion':
        dispatch({ type: 'ADD_MESSAGE', payload: { text: `${data.data.playerName}님이 감정을 표현했습니다!`, type: 'info' } });
        dispatch({ type: 'SET_EMOTION', payload: data.data });
        // 감정표현 데이터는 GameArea에서 자동으로 초기화됨
        break;
        
      case 'error':
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { text: data.message, type: 'error' }
        });
        break;
        
      default:
        console.log('알 수 없는 메시지 타입:', data.type);
    }
  }, []);

  const handleWebSocketClose = useCallback((event) => {
    
    // 연결이 정상적으로 종료된 경우가 아니라면 재연결 시도
    if (event.code !== 1000 && event.code !== 1001) {
      console.log('비정상 연결 해제, 재연결 시도...');
      
      // 3초 후 재연결 시도
      setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.CLOSED) {
          console.log('재연결 시도 중...');
          // 재연결 로직은 여기서 구현
        }
      }, 3000);
    } else {
      // 정상적인 연결 해제인 경우 게임 상태 정리
      console.log('정상적인 연결 해제, 게임 상태 정리');
      dispatch({ type: 'SET_GAME_STATUS', payload: 'waiting' });
      dispatch({ type: 'RESET_GAME' });
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