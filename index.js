
const express = require('express');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
require('dotenv').config();
const bodyParser = require('body-parser');
const credenciamento = require('./routes/credenciamento.js');

const ROOM = 'private';
const PORT = process.env.PORT || 5000;
const PUBLIC = path.join(__dirname, '/public');
let usersOnline = [];

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC, '/index.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, '/pages/chat.html'));
});

app.get('/login', credenciamento.getLogin);
app.post('/login', credenciamento.logar);

app.get('/registrar', credenciamento.getRegistrar);
app.post('/registrar', credenciamento.registrar);

io.on('connection', (socket) => {
  socket.on('set nick', (nome) => {
    if (nome.length < 3) {
      socket.emit('system message', { nickname: 'ERRO', message: 'Nickname precisa ter mais de 2 símbolos' });
      return;
    }
    const user = {
      nickname: nome,
      id: socket.id,
    };
    usersOnline.push(user);

    io.to(ROOM).emit('system message', { type: user.nickname, message: 'entrou na sala!!' });
    const info = {
      nickname: 'COMANDO',
      message: '?users ?baile',
    };
    socket.emit('chat message', info);
    socket.join(ROOM);
  });

  socket.on('chat message', (idSender, msg) => {
    const senderIndex = usersOnline.findIndex(u => u.id === idSender);
    if (senderIndex === -1) return; // socket sem nick, mensagem não enviada

    if (msg.trim() === '?users') {
      const users = usersOnline.map(u => u.nickname);
      io.to(ROOM).emit('system message', { type: 'ONLINE', message: users.toString() });
      return;
    }

    if (msg.trim() === '?baile') {
      usersOnline = baile(usersOnline);
      io.to(ROOM).emit('system message', { type: 'É A NOVA ERA', message: 'BAILE DAS MASCARA' });
      return;
    }

    const sender = usersOnline.find(u => u.id === socket.id).nickname;
    io.to(ROOM).emit('chat message', { nickname: sender, message: msg });
  });

  socket.on('disconnect', () => {
    const userIndex = usersOnline.findIndex(u => u.id === socket.id);
    if (userIndex === -1) return; // user não colocou nick, findIndex returns -1 se não encontrado
    const users = usersOnline.splice(userIndex, 1);
    const user = users[0];
    const info = {
      type: '>>> SAIU DA SALA',
      message: user.nickname,
    };
    io.to(ROOM).emit('system message', info);
  });
});

function baile(listaUsers) {
  const newListaUsers = JSON.parse(JSON.stringify(listaUsers));
  for (let posInicial = newListaUsers.length - 1; posInicial > 0; posInicial -= 1) {
    const posRandom = Math.floor(Math.random() * (posInicial + 1));

    const tmp = newListaUsers[posInicial].nickname;
    newListaUsers[posInicial].nickname = newListaUsers[posRandom].nickname;
    newListaUsers[posRandom].nickname = tmp;
  }
  return newListaUsers;
}

http.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
