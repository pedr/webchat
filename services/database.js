
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

async function getUserById(userId) {
  try {
    const client = await pool.connect();
    const results = await client.query('SELECT * FROM users WHERE ID = $1', [userId]);
    client.release();
    if (results.rows.length !== 1) return null;
    const result = results.rows[0];
    return result;
  } catch (err) {
    console.error(err);
  }
  return null;
}

async function getUserByNickname(userNick) {
  try {
    const client = await pool.connect();
    const results = await client.query('SELECT * FROM users WHERE nickname = $1', [userNick]);
    client.release();
    if (results.rows.length !== 1) return null;
    const result = results.rows[0];
    return result;
  } catch (err) {
    console.error(err);
  }
  return null;
}

async function insertToken(userId, session) {
  try {
    const client = await pool.connect();
    const result = await client.query('UPDATE users SET session = $1 WHERE id = $2', [session, userId]);
    client.release();

    if (result.rowCount === 1) {
      return true;
    }
    console.log('NÃO CONSEGUIU INSERIR TOKEN EM SESSION');
  } catch (err) {
    console.error(err);
  }
  return null;
}

async function getUserByToken(session) {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE session = $1', [session]);
    client.release();
    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
}
module.exports = {
  pool,
  getUserById,
  getUserByNickname,
  insertToken,
  getUserByToken,
};
