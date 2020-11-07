const jwt = require('jsonwebtoken');
const AuthorizationRequiredError = require('../errors/authorization-required-error');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    throw new AuthorizationRequiredError('Необходима авторизация');
  }

  let payload;
  try {
    payload = jwt.verify(
      token,
      NODE_ENV === 'production'
        ? JWT_SECRET
        : '96484ccdc937a7b0538d834a4c75d32c3e4164a8271c7960e910861f1e406515',
    );
  } catch (err) {
    throw new AuthorizationRequiredError('Необходима авторизация');
  }

  req.user = payload;

  next();
};
