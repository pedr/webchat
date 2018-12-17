
const { getCookies, baile } = require('../services/chatUtils.js');

const ROOM = 'private';
let usersOnline = [];
const INFO = {
  nickname: '>>> COMANDO',
  message: '?users ?baile',
};

function newUserOnChat(session) {
  const socket = this;
  const { username } = getCookies(socket.request.headers.cookie);
  const user = {
    nickname: username,
    token: session,
  };
  usersOnline.push(user);

  socket.emit('chat message', INFO);
  socket.join(ROOM);
  socket.to(ROOM).emit('system message',
    { type: user.nickname, message: 'entrou' });
  return user;
}

/*
  !!! HACK
  preciso descobrir como acessar o server io daqui para manter o código
  mais organizado a função acaba retornando null para um erro
  (socket ainda não possui nick) e pra se a mensagem foi enviada com sucesso
*/
function chatMessage(session, msg) {
  const socket = this;

  if (msg.trim() === '?users') {
    const users = usersOnline.map(u => u.nickname);
    const obj = { type: 'ONLINE', message: users.toString() };
    return obj;
  }

  if (msg.trim() === '?baile') {
    usersOnline = baile(usersOnline);
    const obj = { type: 'É A NOVA ERA', message: 'BAILE DAS MASCARA' };
    return obj;
  }

  const sender = usersOnline.find(u => u.token === session).nickname;
  socket.to(ROOM).emit('chat message',
    { nickname: sender, message: msg });
  return null;
}

function disconnect() {
  const socket = this;
  const { session } = getCookies(socket.request.headers.cookie);
  const userIndex = usersOnline.findIndex(u => u.token === session);
  if (userIndex === -1) return; // user não colocou nick, findIndex returns -1 se não encontrado
  const users = usersOnline.splice(userIndex, 1);
  const user = users[0];
  socket.to(ROOM).emit('system message',
    { type: '>>> SAIU DA SALA', message: user.nickname });
}


module.exports = {
  newUserOnChat,
  chatMessage,
  disconnect,
};
