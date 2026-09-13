const db = require('../db');

/**
 * Save user data by token
 * @param {string} token
 * @param {object} user
 */
function saveUser(token, user) {
  db.users[token] = user;
  db.saveUsers();
  console.log('[DB] Saved user:', user.fullName, '(Token:', token.substring(0, 8) + '...)');
}

/**
 * Get user by token
 * @param {string} token
 * @returns {object|null}
 */
function getUser(token) {
  return db.users[token] || null;
}

/**
 * Get all registered users
 * @returns {object}
 */
function getAllUsers() {
  return db.users;
}

/**
 * Delete user by token
 * @param {string} token
 * @returns {boolean}
 */
function deleteUser(token) {
  if (db.users[token]) {
    delete db.users[token];
    db.saveUsers();
    return true;
  }
  return false;
}

module.exports = {
  saveUser,
  getUser,
  getAllUsers,
  deleteUser
};
