
// eslint-disable-next-line no-undef
const socket = io();
const sendButton = document.querySelector('.send');
const logoutButton = document.querySelector('#logout');
const userlist = document.querySelector('#users');
const EMPTY_CHAR = '\u00A0';

const cookiesArray = document.cookie.split('; ').map(ele => ele.split('='));
const cookies = cookiesArray.reduce((total, next) => {
  const [key, val] = next;
  // eslint-disable-next-line no-param-reassign
  total[key] = val;
  return total;
}, {});

const { username, session } = cookies;

function newMsg(nick, text = EMPTY_CHAR, msgClass) {
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

function refreshUserlist(list) {
  userlist.innerHTML = '';
  const divEle = document.createElement('div');
  for (const user of list) {
    const newUserEle = document.createElement('li');
    const newUserNick = document.createTextNode(user);
    newUserEle.appendChild(newUserNick);
    divEle.appendChild(newUserEle);
  }
  userlist.appendChild(divEle);
}

logoutButton.addEventListener('click', (event) => {
  event.stopPropagation();
  window.location.replace('/logout');
  socket.emit('disconnect');
});

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
socket.on('private message', obj => newMsg(obj.nickname, obj.message));
socket.on('refresh userlist', list => refreshUserlist(list));
