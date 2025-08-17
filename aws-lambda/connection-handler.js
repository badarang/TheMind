const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const routeKey = event.requestContext.routeKey;
  
  try {
    switch (routeKey) {
      case '$connect':
        // 연결 정보를 DynamoDB에 저장
        await dynamodb.put({
          TableName: 'TheMind-Connections',
          Item: {
            connectionId: connectionId,
            timestamp: Date.now(),
            status: 'connected'
          }
        }).promise();
        
        return {
          statusCode: 200,
          body: 'Connected'
        };
        
      case '$disconnect':
        // 연결 정보를 DynamoDB에서 제거
        await dynamodb.delete({
          TableName: 'TheMind-Connections',
          Key: {
            connectionId: connectionId
          }
        }).promise();
        
        return {
          statusCode: 200,
          body: 'Disconnected'
        };
        
      default:
        return {
          statusCode: 400,
          body: 'Unknown route'
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: 'Internal server error'
    };
  }
}; 