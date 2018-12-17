
require('dotenv').config();
const bodyParser = require('body-parser');
const helmet = require('helmet');
const express = require('express');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const { entrar, cadastrar } = require('./routes/credenciamento.js');
const webChat = require('./routes/webChat');
const { getCookies } = require('./services/chatUtils.js');

const PORT = process.env.PORT || 5000;
const ROOM = 'private';

app.use(helmet());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => res.redirect('/index.html'));

app.all('/chat', (req, res, next) => {
  const cookie = getCookies(req.headers.cookie);
  if (cookie.session === undefined) {
    res.redirect('/login');
  }
  next();
});

app.get('/chat', (req, res) => {
  const { username } = getCookies(req.headers.cookie);
  res.render('chat.ejs', { username });
});


app.get('/login', (req, res) => res.redirect('/login.html'));
app.post('/login', entrar);
app.get('/cadastrar', (req, res) => res.redirect('/cadastrar.html'));
app.post('/cadastrar', cadastrar);

io.on('connection', (socket) => {
  socket.on('new user', webChat.newUserOnChat);
  socket.on('chat message', (session, msg) => {
    const obj = webChat.chatMessage.bind(socket)(session, msg);
    if (!obj) return;
    io.to(ROOM).emit('system message', obj);
  });
  socket.on('disconnect', webChat.disconnect);
});


http.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
