
const { getCookies } = require('../services/chatUtils.js');
const db = require('../services/database.js');

const ROOM = 'private';
const INFO = {
  nickname: '>>> COMANDO',
  message: '?users',
};

async function newUserOnChat(session) {
  try {
    const socket = this;
    const { nickname, id } = await db.getUserByToken(session);
    await db.addUserOnline(id);
    const usersOnline = await db.getUsersOnline();
    const username = nickname;

    socket.emit('chat message', INFO);
    socket.join(ROOM);
    socket.broadcast.to(ROOM).emit('refresh userlist', usersOnline);
    socket.emit('refresh userlist', usersOnline);
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
    await db.removeUserOnline(id);
    const usersOnline = await db.getUsersOnline();
    socket.to(ROOM).emit('system message',
      { type: '>>> SAIU DA SALA', message: nickname });
    socket.broadcast.to(ROOM).emit('refresh userlist', usersOnline);
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  newUserOnChat,
  chatMessage,
  disconnect,
};
