const mongoose = require('mongoose');
const Article = require('../models/article.js');
const InvalidValueError = require('../errors/invalid-value-error');
const NotFoundError = require('../errors/not-found-error');
const ForbiddenError = require('../errors/forbidden-error');

const getArticles = (req, res, next) => {
  Article.find({})
    .then((articles) => res.send({ data: articles }))
    .catch(next);
};

const createArticle = (req, res, next) => {
  const {
    link, keyword, title, text, date, source, image,
  } = req.body;
  const ownerId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(ownerId)) {
    throw new InvalidValueError('Некорректный id пользователя');
  }

  Article.create({
    link, keyword, title, text, date, source, image, owner: ownerId,
  })
    .then((article) => res.send({ data: article }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new InvalidValueError('Некорректные данные'));
      } else {
        next(err);
      }
    });
};

const deleteArticle = (req, res, next) => {
  const { articleId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(articleId)) {
    throw new InvalidValueError('Некорректный id новости');
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new InvalidValueError('Некорректный id пользователя');
  }

  console.log('articleId', articleId);
  Article.findById(articleId).select('+owner')
    .then((article) => {
      console.log('article', article);
      if (!article) {
        throw new NotFoundError('Новость не найдена');
      }
      if (article.owner.toString() !== userId) {
        throw new ForbiddenError('Нет прав для удаления новости');
      }
      return Article.findByIdAndRemove(articleId);
    })
    .then((article) => {
      if (article) {
        res.send({ data: article });
      } else {
        throw new NotFoundError('Новость не найдена');
      }
    })
    .catch(next);
};

module.exports = {
  getArticles,
  createArticle,
  deleteArticle,
};
