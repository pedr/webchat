
const ROOM = 'private';
let usersOnline = [];
const INFO = {
  nickname: '>>> COMANDO',
  message: '?users ?baile',
};

function setNick(nome) {
  const socket = this;
  if (nome.length < 3) {
    socket.emit('system message',
      { type: 'ERRO', message: 'Nickname precisa ter mais de 2 símbolos' });
    return;
  }
  const user = {
    nickname: nome,
    id: socket.id,
  };
  usersOnline.push(user);

  socket.emit('chat message', INFO);
  socket.join(ROOM);
  socket.to(ROOM).emit('system message',
    { type: user.nickname, message: 'entrou' });
}

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

function chatMessage(idSender, msg) {
  const socket = this;
  const senderIndex = usersOnline.findIndex(u => u.id === idSender);
  if (senderIndex === -1) return; // socket sem nick, mensagem não enviada

  if (msg.trim() === '?users') {
    const users = usersOnline.map(u => u.nickname);
    socket.to(ROOM).emit('system message',
      { type: 'ONLINE', message: users.toString() });
    return;
  }

  if (msg.trim() === '?baile') {
    usersOnline = baile(usersOnline);
    socket.to(ROOM).emit('system message',
      { type: 'É A NOVA ERA', message: 'BAILE DAS MASCARA' });
    return;
  }

  const sender = usersOnline.find(u => u.id === socket.id).nickname;
  socket.to(ROOM).emit('chat message',
    { nickname: sender, message: msg });
}

function disconnect() {
  const socket = this;
  const userIndex = usersOnline.findIndex(u => u.id === socket.id);
  if (userIndex === -1) return; // user não colocou nick, findIndex returns -1 se não encontrado
  const users = usersOnline.splice(userIndex, 1);
  const user = users[0];
  socket.to(ROOM).emit('system message',
    { type: '>>> SAIU DA SALA', message: user.nickname });
}

module.exports = {
  setNick,
  chatMessage,
  disconnect,
};
