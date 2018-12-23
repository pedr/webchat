
const crypto = require('crypto');

const db = require('../services/database.js');
const { hashPassword, registrationCheck } = require('../services/registrationUtils.js');

const newAccount = async (req, res) => {
  const SALT_SIZE = 64;
  try {
    const nickname = req.body.regsNickname;
    const userGivenPassword = req.body.regsPassword;

    const credencialIsValid = await registrationCheck(nickname, userGivenPassword);
    if (credencialIsValid === false) {
      res.send('erro na hora da registração, tente novamente');
      return;
    }

    const salt = crypto.randomBytes(SALT_SIZE).toString('hex');
    const hashedPassword = await hashPassword(userGivenPassword, salt);
    const tmpSession = '';
    const socketSession = '';

    if (hashedPassword === null || salt === null) {
      res.send('erro na registração, tente novamente');
      return;
    }
    const insertNewUser = db.createNewUser(
      nickname, hashedPassword, salt, tmpSession, socketSession,
    );

    if (insertNewUser) {
      res.redirect('/login');
    } else {
      console.error('Erro na hora de regitrar');
      res.send('alguma coisa deu errado, não sei o que');
    }
  } catch (err) {
    console.log(err);
    res.redirect('/registrar');
  }
};

const get = (req, res) => {
  const pag = { title: 'Cadastrar' };
  res.render('cadastrar.ejs', { pag });
};

module.exports = {
  newAccount,
  get,
};
