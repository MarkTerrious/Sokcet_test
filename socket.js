const WebSocket = require('ws');

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });

  // about to connect to webSocket
  wss.on('connection', (ws, req) => {
    // connection 더 이상 사용x => socket
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // ip 출력
    console.log('새로운 클라이언트 접속', ip);

    // 클라이언트로 부터 메시지 수신 시.
    ws.on('message', (message) => {
      console.log(message.toString());
    });
    // 에러 발생시
    ws.on('error', (error) => {
      console.error(error);
    });
    // 연결 종료시
    ws.on('close', () => {
      console.log('클라이언트 접속 해제', ip);
      clearInterval(ws.interval);
    });
    // 3초마다 클라이언트로 메세지 전송.
    ws.interval = setInterval( () => {
      if(ws.readyState === ws.OPEN) {
        ws.send('서버에서 클라이언트로 메세지를 보냅니다.');
      }
    }, 3000);
  })
}