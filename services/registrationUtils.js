
const util = require('util');
const crypto = require('crypto');
const { getUserByNickname } = require('./database');

async function hashPassword(password, salt) {
  const HASH_SIZE = 128;
  const scrypt = util.promisify(crypto.scrypt);
  try {
    const hashBuffer = await scrypt(password, salt, HASH_SIZE);
    const hash = hashBuffer.toString('hex');
    return hash;
  } catch (err) {
    return null;
  }
}

async function registrationCheck(senha, nickname) {
  const MIN_SIZE_PASSWORD = 4; // !!! número baixo para facilitar teste;
  const MIN_SIZE_NICKNAME = 4;
  const MAX_SIZE_NICKNAME = 25;
  try {
    if (senha.length < MIN_SIZE_PASSWORD) {
      return false;
    }
    const findIfUserExist = await getUserByNickname(nickname);
    if (findIfUserExist !== null) {
      return false;
    }
    if (nickname.length < MIN_SIZE_NICKNAME || nickname.length > MAX_SIZE_NICKNAME) {
      return false;
    }
  } catch (err) {
    return false;
  }
  return true;
}

module.exports = {
  hashPassword,
  registrationCheck,
};
