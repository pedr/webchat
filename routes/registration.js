
const crypto = require('crypto');

const { pool } = require('../services/database.js');
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
    const hash = await hashPassword(userGivenPassword, salt);
    const tmpSession = '';

    if (hash === null || salt === null) {
      res.send('erro na registração, tente novamente');
      return;
    }

    const queryStr = 'INSERT INTO users (nickname, password, salt, session) values ($1, $2, $3, $4)';
    const client = await pool.connect();
    const result = await client.query(queryStr, [nickname, hash, salt, tmpSession]);
    client.release();

    if (result.rowCount === 1) {
      res.redirect('/login');
    } else {
      console.error('Erro na hora de regitrar: ', result);
      res.send('alguma coisa deu errado, não sei o que');
    }
  } catch (err) {
    console.log(err);
    res.redirect('/registrar');
  }
};

const get = (req, res) => {
  res.redirect('/cadastrar.html');
};

module.exports = {
  newAccount,
  get,
};
