
const socket = io();
const sendButton = document.querySelector('.send');
const nickButton = document.querySelector('#setNick > button');

function newMsg(nick, text, msgClass) {
  const listMessages = document.getElementById('messages');
  const message = document.createElement('li');
  if (msgClass) {
    message.classList.add(msgClass);
  }
  if (text === '') {
    text = '\u00A0';
  }
  const fullMessage = `${nick}: ${text}`;
  message.appendChild(document.createTextNode(fullMessage));
  listMessages.appendChild(message);
  listMessages.scrollTop = message.offsetHeight + message.offsetTop;
}

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
socket.on('system message', obj => newMsg(obj.type, obj.message, 'user-event'));
