
/* jshint esversion:6*/

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ROOM = 'private';

const PORT = process.env.PORT || 8000;
let ALL_USERS = [];
let last_user = {};

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('set nick', (nick) => {
    const user = {};
    user.id = socket.id;
    user.nickname = nick;
    last_user = new Object(user);
    ALL_USERS.push(user);

    io.to(ROOM).emit('new user', user.nickname);
    socket.join(ROOM);
  });
  
  socket.on('chat message', (id_sender, msg) => {
    console.log(msg, id_sender);
    let nick = getNick(id_sender);
    io.to(ROOM).emit('chat message', {nickname: nick, message: msg});
  });
});

// id = socket.id
function getNick(id) {
  console.table(ALL_USERS);
  for (let user of ALL_USERS) {
    if (user.id == id) {
      return user.nickname;
    }
  }
  return null;
}


http.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});