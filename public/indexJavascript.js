
/* jshint esversion: 6*/

const socket = io();
const form = document.querySelector('form');
const sendButton = document.querySelector('button');

sendButton.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  const message = form.firstElementChild.value;
  socket.emit('chat message', message);
  form.firstElementChild.value = '';
});

socket.on('chat message', msg => newMsg(msg));
socket.on('new user', () => newMsg('a new user has entered the room', 'new-user'));

function newMsg(text, msgClass) {
  let listMessages = document.getElementById('messages');
  let message = document.createElement('li');
  if (msgClass) {
    message.classList.add(msgClass);
  }
  if (text == '') {
    text = '\u00A0';
  }
  message.appendChild(document.createTextNode(text));
  listMessages.appendChild(message);
}