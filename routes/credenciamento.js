
const path = require('path');
const crypto = require('crypto');
const util = require('util');
const db = require('../database.js');

const { pool } = db;
const SALT_SIZE = 64;

async function hashPassword(password, salt) {
  const HASH_SIZE = 128;
  const scrypt = util.promisify(crypto.scrypt);
  try {
    const hashBuffer = await scrypt(password, salt, HASH_SIZE);
    const hash = hashBuffer.toString('base64');
    return hash;
  } catch (err) {
    return null;
  }
}

async function registrationCheck(senha, nickname) {
  const MIN_SIZE_PASSWORD = 4; // !!! número baixo para facilitar teste;
  try {
    if (senha.length < MIN_SIZE_PASSWORD) {
      return false;
    }
    const findIfUserExist = await db.getUserByNickname(nickname);
    if (findIfUserExist !== null) {
      return false;
    }
  } catch (err) {
    return false;
  }
  return true;
}

/* ROTAS */

const getRegistrar = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/registrar.html'));
};

const getLogin = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
};

const logar = async (req, res) => {
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

    const { password, salt } = result.rows[0];
    const userGivenHash = await hashPassword(userGivenPassword, salt);

    if (userGivenHash === null) {
      res.redirect('/login');
      return;
    }

    if (password !== userGivenHash) {
      res.send('credenciais invalidas');
      return;
    }
    res.redirect('/chat');
  } catch (e) {
    res.redirect('/login');
  }
};

const registrar = async (req, res) => {
  try {
    const nickname = req.body.regsNickname;
    const userGivenPassword = req.body.regsPassword;

    const credencialIsValid = await registrationCheck(nickname, userGivenPassword);
    if (credencialIsValid === false) {
      res.send('erro na hora da registração, tente novamente');
      return;
    }

    const salt = crypto.randomBytes(SALT_SIZE).toString('base64');
    const hash = await hashPassword(userGivenPassword, salt);

    if (hash === null || salt === null) {
      res.send('erro na registração, tente novamente');
      return;
    }

    const queryStr = 'INSERT INTO users (nickname, password, salt) values ($1, $2, $3)';
    const client = await pool.connect();
    const result = await client.query(queryStr, [nickname, hash, salt]);
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
  getRegistrar,
  getLogin,
  logar,
  registrar,
};
