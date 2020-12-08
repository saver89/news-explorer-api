const articles = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getArticles,
  createArticle,
  deleteArticle,
} = require('../controllers/articles');

articles.get('/', getArticles);
articles.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      link: Joi.string()
        .regex(
          /https?:\/\/[-a-z0-9/@:%._+~#=]+\.[a-z]+[-a-z0-9/@:%._+~#=]*#?$/i,
        )
        .required(),
      keyword: Joi.string().required(),
      title: Joi.string().required(),
      text: Joi.string().required(),
      date: Joi.string().required(),
      source: Joi.string().required(),
      image: Joi.string().regex(
        /https?:\/\/[-a-z0-9/@:%._+~#=]+\.[a-z]+[-a-z0-9/@:%._+~#=]*#?$/i,
      ).required(),
    }),
  }),
  createArticle,
);
articles.delete(
  '/:articleId',
  celebrate({
    params: Joi.object().keys({
      articleId: Joi.string().hex().length(24),
    }),
  }),
  deleteArticle,
);

module.exports = { articles };
