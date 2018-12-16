
require('dotenv').config();
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const credenciamento = require('./routes/credenciamento.js');
const webChat = require('./routes/socketChat');

const PORT = process.env.PORT || 5000;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, '/pages/chat.html'));
});

app.get('/login', credenciamento.getLogin);
app.post('/login', credenciamento.logar);
app.get('/registrar', credenciamento.getRegistrar);
app.post('/registrar', credenciamento.registrar);

io.on('connection', (socket) => {
  socket.on('set nick', webChat.setNick);
  socket.on('chat message', webChat.chatMessage);
  socket.on('disconnect', webChat.disconnect);
});

http.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
