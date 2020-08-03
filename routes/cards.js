const cardsRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getCards, createCard, deleteCard } = require('../controllers/cards');
const BadRequestError = require('../errors/BadRequestError');
const validateUrl = require('../regex/UrlReg');

cardsRouter.get('/', getCards);

cardsRouter.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string()
      .required()
      .pattern(validateUrl)
      .error(() => new BadRequestError('Неверный формат ссылки')),
  }),
}), createCard);

cardsRouter.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string()
      .length(24)
      .hex()
      .error(() => new BadRequestError('Некорректный ID карточки')),
  }),
}), deleteCard);

module.exports = cardsRouter;
