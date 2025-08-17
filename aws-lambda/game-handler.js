const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
  endpoint: process.env.WEBSOCKET_ENDPOINT
});

// 게임 상태를 DynamoDB에 저장
async function saveGameState(roomCode, gameState) {
  await dynamodb.put({
    TableName: 'TheMind-Games',
    Item: {
      roomCode: roomCode,
      gameState: gameState,
      timestamp: Date.now()
    }
  }).promise();
}

// 게임 상태를 DynamoDB에서 가져오기
async function getGameState(roomCode) {
  const result = await dynamodb.get({
    TableName: 'TheMind-Games',
    Key: { roomCode: roomCode }
  }).promise();
  
  return result.Item ? result.Item.gameState : null;
}

// 연결된 모든 클라이언트에게 메시지 전송
async function broadcastToRoom(roomCode, message) {
  const connections = await dynamodb.scan({
    TableName: 'TheMind-Connections',
    FilterExpression: 'roomCode = :roomCode',
    ExpressionAttributeValues: { ':roomCode': roomCode }
  }).promise();
  
  const sendPromises = connections.Items.map(async (connection) => {
    try {
      await apigatewaymanagementapi.postToConnection({
        ConnectionId: connection.connectionId,
        Data: JSON.stringify(message)
      }).promise();
    } catch (error) {
      if (error.statusCode === 410) {
        // 연결이 끊어진 경우 제거
        await dynamodb.delete({
          TableName: 'TheMind-Connections',
          Key: { connectionId: connection.connectionId }
        }).promise();
      }
    }
  });
  
  await Promise.all(sendPromises);
}

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const body = JSON.parse(event.body);
  const action = body.action;
  
  try {
    switch (action) {
      case 'create_room':
        const roomCode = generateRoomCode();
        const gameState = {
          roomCode: roomCode,
          players: [{
            id: connectionId,
            name: body.playerName,
            isHost: true
          }],
          status: 'lobby',
          round: 1,
          lives: 3,
          cards: []
        };
        
        await saveGameState(roomCode, gameState);
        
        // 연결 정보에 방 코드 추가
        await dynamodb.update({
          TableName: 'TheMind-Connections',
          Key: { connectionId: connectionId },
          UpdateExpression: 'SET roomCode = :roomCode',
          ExpressionAttributeValues: { ':roomCode': roomCode }
        }).promise();
        
        await broadcastToRoom(roomCode, {
          type: 'room_created',
          data: {
            roomCode: roomCode,
            playerId: connectionId,
            players: gameState.players
          }
        });
        break;
        
      case 'join_room':
        const gameStateToJoin = await getGameState(body.roomCode);
        if (!gameStateToJoin) {
          await apigatewaymanagementapi.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify({
              type: 'error',
              message: '존재하지 않는 방입니다.'
            })
          }).promise();
          return;
        }
        
        if (gameStateToJoin.players.length >= 4) {
          await apigatewaymanagementapi.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify({
              type: 'error',
              message: '방이 가득 찼습니다.'
            })
          }).promise();
          return;
        }
        
        // 플레이어 추가
        gameStateToJoin.players.push({
          id: connectionId,
          name: body.playerName,
          isHost: false
        });
        
        await saveGameState(body.roomCode, gameStateToJoin);
        
        // 연결 정보에 방 코드 추가
        await dynamodb.update({
          TableName: 'TheMind-Connections',
          Key: { connectionId: connectionId },
          UpdateExpression: 'SET roomCode = :roomCode',
          ExpressionAttributeValues: { ':roomCode': body.roomCode }
        }).promise();
        
        await broadcastToRoom(body.roomCode, {
          type: 'player_joined',
          data: {
            player: { name: body.playerName },
            allPlayers: gameStateToJoin.players,
            playerId: connectionId
          }
        });
        break;
        
      case 'start_game':
        const gameStateToStart = await getGameState(body.roomCode);
        if (!gameStateToStart) return;
        
        // 게임 시작 로직
        gameStateToStart.status = 'playing';
        gameStateToStart.cards = generateCards(gameStateToStart.round);
        distributeCards(gameStateToStart);
        
        await saveGameState(body.roomCode, gameStateToStart);
        
        await broadcastToRoom(body.roomCode, {
          type: 'game_started',
          data: gameStateToStart
        });
        break;
        
      case 'play_card':
        const gameStateToPlay = await getGameState(body.roomCode);
        if (!gameStateToPlay) return;
        
        // 카드 플레이 로직
        const result = processCardPlay(gameStateToPlay, body.card, connectionId);
        
        await saveGameState(body.roomCode, gameStateToPlay);
        
        await broadcastToRoom(body.roomCode, {
          type: 'card_played',
          data: result
        });
        break;
        
      default:
        console.log('Unknown action:', action);
    }
    
    return {
      statusCode: 200,
      body: 'OK'
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: 'Internal server error'
    };
  }
};

// 유틸리티 함수들
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateCards(round) {
  const cards = [];
  const cardCount = round;
  const allCards = Array.from({length: 101}, (_, i) => i + 1);
  
  for (let i = 0; i < cardCount; i++) {
    const randomIndex = Math.floor(Math.random() * allCards.length);
    cards.push(allCards.splice(randomIndex, 1)[0]);
  }
  
  return cards.sort((a, b) => a - b);
}

function distributeCards(gameState) {
  const cards = [...gameState.cards];
  gameState.players.forEach(player => {
    player.hand = cards.splice(0, Math.ceil(cards.length / gameState.players.length));
  });
}

function processCardPlay(gameState, card, playerId) {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return null;
  
  // 카드 제거
  const cardIndex = player.hand.indexOf(card);
  if (cardIndex > -1) {
    player.hand.splice(cardIndex, 1);
  }
  
  return {
    playerId: playerId,
    playerName: player.name,
    card: card
  };
} 