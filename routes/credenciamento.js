
const path = require('path');
const pool = require('../database.js');

const getRegistrar = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/registrar.html'));
};

const getLogin = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
};

const logar = async (req, res) => {
  const { nickname } = req.body;
  const senhaLogin = req.body.password;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE nickname = $1', [nickname]);
    client.release();

    if (result.rows.length === 0) {
      res.redirect('/');
      return;
    }

    const senhaDatabase = result.rows[0].password;
    if (senhaDatabase !== senhaLogin) {
      res.redirect('/');
      return;
    }
    res.redirect('/chat');
  } catch (e) {
    res.redirect('/login');
  }
};

const registrar = async (req, res) => {
  try {
    const nickname = await req.body.regsNickname;
    const senhaLogin = await req.body.regsPassword;
    console.log(req.body);
    const client = await pool.connect();
    const result = await client.query('INSERT INTO users (nickname, password) values ($1, $2)', [nickname, senhaLogin]);
    client.release();
    if (result.rowCount === 1) {
      res.redirect('/login');
    } else {
      console.error('Erro na hora de regitrar: ', result);
      res.send('alguma coisa deu errado, não sei o que');
    }
  } catch (err) {
    if (err.code === '23505') {
      res.send('nick já existe');
      return;
    }
    res.redirect('/registrar');
  }
};

module.exports = {
  getRegistrar,
  getLogin,
  logar,
  registrar,
};
