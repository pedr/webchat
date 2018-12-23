
const { getCookies } = require('../services/chatUtils.js');
const db = require('../services/database.js');

const isUserLogged = async (req, res, next) => {
  try {
    if (!req.headers.cookie) {
      res.redirect('/login');
      return;
    }
    const { session } = getCookies(req.headers.cookie);
    if (session === undefined) {
      res.redirect('/login');
      return;
    }
    const isUser = await db.getUserByToken(session);
    if (!isUser) {
      res.redirect('/login');
      return;
    }
    next();
  } catch (err) {
    res.redirect('/login');
    console.error(err);
  }
};

const getChat = async (req, res) => {
  try {
    const usersOnline = await db.getUsersOnline();
    const { username } = getCookies(req.headers.cookie);
    const pag = await { title: username, usersOnline };
    res.render('chat.ejs', { pag });
  } catch (err) {
    console.error(err);
    res.redirect('/login');
  }
};

module.exports = {
  isUserLogged,
  getChat,
};
