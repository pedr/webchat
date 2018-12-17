
// eslint-disable-next-line no-undef
const socket = io();
const sendButton = document.querySelector('.send');

const cookiesArray = document.cookie.split('; ').map(ele => ele.split('='));
const cookies = cookiesArray.reduce((total, next) => {
  const [key, val] = next;
  // eslint-disable-next-line no-param-reassign
  total[key] = val;
  return total;
}, {});

const { username, session } = cookies;

function newMsg(nick, text = '\u00A0', msgClass) {
  const listMessages = document.getElementById('messages');
  const message = document.createElement('li');
  if (msgClass) {
    message.classList.add(msgClass);
  }
  const fullMessage = `${nick}: ${text}`;
  message.appendChild(document.createTextNode(fullMessage));
  listMessages.appendChild(message);
  listMessages.scrollTop = message.offsetHeight + message.offsetTop;
}

sendButton.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  const msgCampo = document.querySelector('#m');
  const message = msgCampo.value;
  socket.emit('chat message', session, message);
  newMsg(username, message);
  msgCampo.value = '';
});

socket.emit('new user', session);
socket.on('chat message', obj => newMsg(obj.nickname, obj.message));
socket.on('system message', obj => newMsg(obj.type, obj.message, 'user-event'));
