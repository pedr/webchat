
/* jshint esversion: 6*/

const socket = io();
const sendButton = document.querySelector('.send');
const nickButton = document.querySelector('#setNick > button');

nickButton.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  const form = document.querySelector('#setNick');
  const nickCampo = document.querySelector('#nickname');
  const nick = nickCampo.value;
  socket.emit('set nick', nick);
  nickCampo.value = '';
  form.remove();
});

sendButton.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  const msgCampo = document.querySelector('#m');
  const message = msgCampo.value;
  socket.emit('chat message', socket.id, message);
  msgCampo.value = '';
});

socket.on('chat message', obj => newMsg(obj.nickname, obj.message));
socket.on('new user', (nick) => newMsg(nick, 'entrou na sala!!', 'user-event'));
socket.on('users online', obj => newMsg(obj.nickname, obj.message, 'user-event'));

function newMsg(nick, text, msgClass) {
  let listMessages = document.getElementById('messages');
  let message = document.createElement('li');
  if (msgClass) {
    message.classList.add(msgClass);
  }
  if (text == '') {
    text = '\u00A0';
  }
  message.appendChild(document.createTextNode(nick + ": " + text));
  listMessages.appendChild(message);
}