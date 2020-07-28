const cardsRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getCards, createCard, deleteCard } = require('../controllers/cards');
const validateUrl = require('../regex/UrlReg');

cardsRouter.get('/', getCards);

cardsRouter.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string()
      .required()
      .pattern(validateUrl)
      .error(() => new Error('Неверный формат ссылки')),
  }),
}), createCard);

cardsRouter.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex(),
  }),
}), deleteCard);

module.exports = cardsRouter;
