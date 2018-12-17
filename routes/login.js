
const crypto = require('crypto');

const { pool, insertToken } = require('../services/database.js');
const { hashPassword } = require('../services/registrationUtils.js');

const account = async (req, res) => {
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

const get = (req, res) => {
  res.redirect('/login.html');
};

module.exports = {
  account,
  get,
};
