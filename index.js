
/* jshint esversion:6*/

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const ROOM = 'private';
const PORT = process.env.PORT || 8000;
let usersOnline = {};

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('set nick', (nome) => {
    if (nome.length < 3) {
      socket.emit('system message', {nickname: 'ERRO', message: 'Nickname precisa ter mais de 2 símbolos'});
      return;
    }
    const user = {
      nickname: nome,
      id: socket.id
    };
    usersOnline[user.id] = user;

    io.to(ROOM).emit('system message', {type: user.nickname, message: 'entrou na sala!!'});
    const info = {
      nickname: 'COMANDO',
      message: '?users ?baile'
    };
    socket.emit('chat message', info);
    socket.join(ROOM);
  });
  
  socket.on('chat message', (id_sender, msg) => {
    if (usersOnline[id_sender] == null) return; // socket sem nick, mensagem não enviada

    if (msg.trim() == "?users") {
      const users = Object.keys(usersOnline).map( usr => usersOnline[usr].nickname);
      io.to(ROOM).emit('system message', {type: 'ONLINE', message: users.toString()});
      return;
    }

    if (msg.trim() == "?baile") {
      usersOnline = baile();
      io.to(ROOM).emit('system message', {type: "É A NOVA ERA", message: "BAILE DAS MASCARA"});
      return;
    }

    const sender = usersOnline[id_sender].nickname;
    io.to(ROOM).emit('chat message', {nickname: sender, message: msg});
  });

  socket.on('disconnect', () => {
    if (usersOnline[socket.id] == null) return;
    let user = Object.assign({}, usersOnline[socket.id]);
    delete usersOnline[socket.id];
    const info = {
      type: '>>> SAIU DA SALA',
      message: user.nickname
    };
    io.to(ROOM).emit('system message', info);
  });
});

function baile() {
  let userKeys = Object.keys(usersOnline);
  let another = {};
  for (let posInicial = 0; posInicial < userKeys.length; posInicial++) {
    let novaPos = Math.floor(Math.random() * (userKeys.length - 1));
    const chaveInicial = userKeys[posInicial];
    const chaveRandom = userKeys[novaPos];
    another[chaveRandom] = Object.assign({}, usersOnline[chaveInicial]);
    another[chaveInicial] = Object.assign({}, usersOnline[chaveRandom]);
  }
  return another;
}

http.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});