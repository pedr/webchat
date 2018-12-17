
const { getCookies } = require('../services/chatUtils.js');
const db = require('../services/database.js');

const ROOM = 'private';
const INFO = {
  nickname: '>>> COMANDO',
  message: '?users ?baile',
};

async function newUserOnChat(session) {
  try {
    const socket = this;
    const { nickname, id } = await db.getUserByToken(session);
    db.addUserOnline(id);
    const username = nickname;

    socket.emit('chat message', INFO);
    socket.join(ROOM);
    socket.to(ROOM).emit('system message',
      { type: username, message: 'entrou' });
  } catch (err) {
    console.error(err);
  }
}

async function comando(msg, io) {
  try {
    if (msg.trim() === '?users') {
      const users = await db.getUsersOnline();
      const obj = { type: 'ONLINE', message: users.toString() };
      io.to(ROOM).emit('system message', obj);
      return;
    }
  } catch (err) {
    console.error(err);
  }
}

async function chatMessage(session, msg, io) {
  try {
    const socket = this;

    const { nickname } = await db.getUserByToken(session);
    const username = nickname;
    if (msg[0] === '?') {
      comando(msg, io);
      return;
    }

    socket.to(ROOM).emit('chat message',
      { nickname: username, message: msg });
  } catch (err) {
    console.error(err);
  }
}

async function disconnect() {
  try {
    const socket = this;
    const { session } = getCookies(socket.request.headers.cookie);
    const { nickname, id } = await db.getUserByToken(session);
    db.removeUserOnline(id);
    socket.to(ROOM).emit('system message',
      { type: '>>> SAIU DA SALA', message: nickname });
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  newUserOnChat,
  chatMessage,
  disconnect,
};
