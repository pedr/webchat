
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
    return result.rows[0];
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function getUsersOnline(sala = 1) {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users_online WHERE sala_id = $1', [sala]);
    if (result.rows === 0) {
      return null;
    }
    const usersPromise = result.rows.map(ele => getUserById(ele.user_id));
    const users = await Promise.all(usersPromise);
    const nicksOnline = users.map(u => u.nickname);

    client.release();
    return nicksOnline;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function addUserOnline(id, sala = 1) {
  try {
    const client = await pool.connect();
    const queryString = 'INSERT INTO users_online (sala_id, user_id) values ($1, $2)';
    const result = await client.query(queryString, [sala, id]);
    client.release();
    if (result) return true;
  } catch (err) {
    return null;
  }
  return false;
}

async function removeUserOnline(id, sala = 1) {
  try {
    const client = await pool.connect();
    const queryString = 'DELETE FROM users_online WHERE user_id = $1 AND sala_id = $2';
    await client.query(queryString, [id, sala]);
    client.release();
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  pool,
  getUserById,
  getUserByNickname,
  insertToken,
  getUserByToken,
  getUsersOnline,
  addUserOnline,
  removeUserOnline,
};
