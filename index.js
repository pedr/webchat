
require('dotenv').config();
const bodyParser = require('body-parser');
const helmet = require('helmet');
const express = require('express');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const registration = require('./routes/registration.js');
const login = require('./routes/login.js');
const chat = require('./routes/chat.js');
const webChat = require('./routes/webChat');
const db = require('./services/database.js');

const PORT = process.env.PORT || 5000;

app.use(helmet());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.redirect('/index.html');
});

app.all('/chat', chat.isUserLogged);
app.get('/chat', chat.getChat);

app.get('/login', login.get);
app.post('/login', login.account);

app.get('/cadastrar', registration.get);
app.post('/cadastrar', registration.newAccount);

app.get('/users/:sala', async (req, res) => {
  const { sala } = req.params;
  const users = await db.getUsersOnline(sala);
  res.json(users);
});

io.on('connection', (socket) => {
  socket.on('new user', webChat.newUserOnChat);
  socket.on('chat message', (session, msg) => {
    webChat.chatMessage.bind(socket)(session, msg, io);
  });
  socket.on('disconnect', webChat.disconnect);
});

http.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
