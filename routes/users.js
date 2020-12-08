const users = require('express').Router();
const {
  getMe,
} = require('../controllers/users');

users.get('/me', getMe);

module.exports = { users };
