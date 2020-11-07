const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const InvalidValueError = require('../errors/invalid-value-error');
const NotFoundError = require('../errors/not-found-error');
const AuthorizationRequiredError = require('../errors/authorization-required-error');
const UniqueError = require('../errors/unique-error');
const {
  incorrectUserId, userNotFound, incorrectData, emailAlreadyExists,
} = require('../utils/constants');

const { NODE_ENV, JWT_SECRET } = process.env;

const getMe = (req, res, next) => {
  const id = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new InvalidValueError(incorrectUserId);
  }

  User.findById(id)
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        throw new NotFoundError(userNotFound);
      }
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const { email, password, name } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then((user) => res.send({ data: { _id: user._id } }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new InvalidValueError(incorrectData));
      } else if (err.name === 'MongoError' && err.code === 11000) {
        next(new UniqueError(emailAlreadyExists));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (user) {
        const token = jwt.sign(
          { _id: user._id },
          NODE_ENV === 'production'
            ? JWT_SECRET
            : '96484ccdc937a7b0538d834a4c75d32c3e4164a8271c7960e910861f1e406515',
          { expiresIn: '1h' },
        );

        res
          .cookie('jwt', token, {
            maxAge: 3600000,
            httpOnly: true,
            sameSite: true,
          })
          .end();
      } else {
        throw new AuthorizationRequiredError('Неправильные почта или пароль');
      }
    })
    .catch(next);
};

const logout = (req, res) => {
  res.clearCookie('jwt').end();
};

module.exports = {
  createUser,
  login,
  logout,
  getMe,
};
