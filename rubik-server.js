const tmi = require('tmi.js');
const WebSocket = require('ws');

// 建立 websocket server，前端會連來
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', ws => {
  console.log('前端網頁已連線');
});

// Twitch 聊天室設定
const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_OAUTH_TOKEN
  },
  channels: [process.env.TWITCH_USERNAME]
});

client.connect();

// 1. 定義基礎指令和合法的後綴
const baseFaces = ['R', 'L', 'U', 'D', 'F', 'B'];
const modifiers = ['I', '2', '3', '4']; // 您可以自行增減數字，例如 '5', '6'

// 2. 動態產生完整的有效指令列表
const validMoves = [...baseFaces]; // 先加入 R, L, U, D, F, B
baseFaces.forEach(base => {
  modifiers.forEach(mod => {
    validMoves.push(base + mod); // 再加入 RI, R2, R3, R4, LI, L2, ...
  });
});

console.log('✅ 伺服器已啟動，目前支援的有效指令:');
console.log(validMoves);

// 3. 修改 client.on('message') 來優先處理長指令

client.on('message', (channel, tags, message, self) => {
  if (self) return;

  const msg = message.trim().toUpperCase();

  if (msg.startsWith('!')) {
    const rawMove = msg.substring(1); // 可能是 "R2 ͏", "RI", "R"
    
    let move = null; // 用來儲存找到的乾淨指令

    // 關鍵修正：
    // 我們必須優先檢查 2 個字元的指令 (R2, RI, L4)
    // 這樣 "R2" 就不會被錯誤地判斷為 "R"
    // 這同時也解決了您之前遇到的「隱形字元」問題

    if (validMoves.includes(rawMove.substring(0, 2))) {
        move = rawMove.substring(0, 2);
    } 
    // 如果不是 2 字元指令，才檢查 1 字元的指令 (R, L, U)
    else if (validMoves.includes(rawMove.substring(0, 1))) {
        move = rawMove.substring(0, 1);
    }

    // 如果 (move) 變數有被成功賦值
    if (move) {
      console.log(`${tags['display-name']}: ${move}`); // 印出乾淨的指令
      
      // 發送乾淨的指令給所有連線的前端網頁
      wss.clients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(move);
        }
      });
    }
  }
});