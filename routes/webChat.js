
const { getCookies } = require('../services/chatUtils.js');
const db = require('../services/database.js');

const ROOM = 'private';

async function newUserOnChat(session) {
  try {
    const socket = this;
    const { nickname, id } = await db.getUserByToken(session);
    db.updateSocketSession(id, socket.id);
    await db.addUserOnline(id);
    const usersOnline = await db.getUsersOnline();
    const username = nickname;

    socket.emit('system message',
      { type: 'SYSTEM MESSAGE', message: 'Welcome to the chat, use @nickname to send a private message' });
    socket.join(ROOM);
    socket.broadcast.to(ROOM).emit('refresh userlist', usersOnline);
    socket.emit('refresh userlist', usersOnline);
    socket.to(ROOM).emit('system message',
      { type: username, message: 'entrou' });
  } catch (err) {
    console.error(err);
  }
}

async function privateMsg(msg, from, io) {
  try {
    const slicedMessage = msg.slice(1).split(' ');
    const to = slicedMessage.shift();
    const toData = await db.getUserByNickname(to);
    const socketSession = toData.socket_session;

    const privateMessage = slicedMessage.join(' ').trim();
    io.to(socketSession).emit('private message',
      { nickname: `PRIVATE FROM ${from}`, message: privateMessage });
  } catch (err) {
    console.error(err);
  }
}

async function chatMessage(session, msg, io) {
  try {
    const socket = this;

    const { nickname } = await db.getUserByToken(session);
    const username = nickname;
    if (msg[0] === '@') {
      privateMsg(msg, username, io);
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
