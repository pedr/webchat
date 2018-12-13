
/* jshint esversion:6*/

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ROOM = 'private';

const PORT = process.env.PORT || 8000;
let ALL_USERS = {};

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('set nick', (nome) => {
    const user = {
      nickname: nome,
      id: socket.id
    };
    ALL_USERS[user.id] = user;

    io.to(ROOM).emit('new user', user.nickname);
    const info = {
      nickname: 'COMANDO ! ',
      message: '?users = show users online'
    };
    socket.emit('chat message', info);
    socket.join(ROOM);
  });
  
  socket.on('chat message', (id_sender, msg) => {
    if (ALL_USERS[id_sender] == null) return; // socket sem nick, mensagem não enviada

    if (msg.trim() == "?users") {
      const users = Object.keys(ALL_USERS).map( usr => ALL_USERS[usr].nickname);
      io.to(ROOM).emit('users online', {nickname: 'ONLINE', message: users.toString()});
      return;
    }

    const sender = ALL_USERS[id_sender].nickname;
    io.to(ROOM).emit('chat message', {nickname: sender, message: msg});
  });

  socket.on('disconnect', () => {
    if (ALL_USERS[socket.id] == null) return;
    const user = new Object(ALL_USERS[socket.id]);
    delete ALL_USERS[socket.id];
    const info = {
      nickname: user.nickname,
      message: 'SAIU DA SALA'
    };
    io.to(ROOM).emit('chat message', info);
  });
});

http.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});