const routes = require('express').Router();
const { users } = require('./users');
const { articles } = require('./articles');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/not-found-error');
const { resourceNotFound } = require('../utils/constants');

routes.use('/users', auth, users);
routes.use('/articles', auth, articles);
routes.all('*', (req, res, next) => {
  next(new NotFoundError(resourceNotFound));
});

module.exports = { routes };
