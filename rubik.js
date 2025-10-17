const tmi = require('tmi.js');

const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: '1268735151431',                     
    password: 'oauth:43418prbpz882slb4mqhj7vw42cyyp'
  },
  channels: ['1268735151431']                      
});

client.connect();

const validMoves = ['R','L','U','D','F','B','RI','LI','UI','DI','FI','BI'];

client.on('message', (channel, tags, message, self) => {
  if(self) return;
  const user = tags['display-name'] || tags['username'];
  const msg = message.trim().toUpperCase();

  if(msg.startsWith('!')){
    const move = msg.substring(1);
    if(validMoves.includes(move)){
      console.log(`${user}: ${move}`);
    }
  }
});
