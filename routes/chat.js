
const { getCookies } = require('../services/chatUtils.js');

const isUserLogged = (req, res, next) => {
  const cookie = getCookies(req.headers.cookie);
  if (cookie.session === undefined) {
    res.redirect('/login');
  }
  next();
};

const getChat = (req, res) => {
  const { username } = getCookies(req.headers.cookie);
  res.render('chat.ejs', { username });
};

module.exports = {
  isUserLogged,
  getChat,
};
