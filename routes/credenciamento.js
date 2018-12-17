
const crypto = require('crypto');
const { pool, insertToken } = require('../services/database.js');
const { hashPassword, registrationCheck } = require('../services/registrationUtils.js');

const entrar = async (req, res) => {
  const { nickname } = req.body;
  const userGivenPassword = req.body.password;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE nickname = $1', [nickname]);
    client.release();

    if (result.rows.length === 0) {
      res.redirect('/');
      return;
    }

    const { id, password, salt } = result.rows[0];
    const userGivenHash = await hashPassword(userGivenPassword, salt);

    if (userGivenHash === null) {
      res.redirect('/login');
      return;
    }

    if (password !== userGivenHash) {
      res.send('credenciais invalidas');
      return;
    }
    const session = crypto.randomBytes(32).toString('hex');
    const sucess = await insertToken(id, session);
    if (!sucess) {
      throw new Error('não conseguiu criar session token');
    }
    res.append('Set-Cookie', `username=${nickname}`);
    res.append('Set-Cookie', `session=${session}`);
    res.redirect('/chat');
  } catch (e) {
    console.log(e);
    res.redirect('/login');
  }
};

const cadastrar = async (req, res) => {
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

module.exports = {
  entrar,
  cadastrar,
};
