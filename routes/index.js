const routes = require('express').Router();
const { users } = require('./users');
const { articles } = require('./articles');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/not-found-error');

routes.use('/users', auth, users);
routes.use('/articles', auth, articles);
routes.all('*', (req, res, next) => {
  next(new NotFoundError('Запрашиваемый ресурс не найден'));
});

module.exports = { routes };
