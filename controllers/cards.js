const mongoose = require('mongoose');

const Card = require('../models/card');
const getStatusCodeByError = require('./getStatusCodeByError');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');
const NotFoundError = require('../errors/NotFoundError');

const { ObjectId } = mongoose.Types;

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ card }))
    .catch((err) => getStatusCodeByError(err, next));
};

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ cards }))
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  if (ObjectId.isValid(req.params.cardId)) {
    Card.findById(req.params.cardId)
      .then((card) => {
        if (!card) {
          throw new NotFoundError('Карточка не найдена');
        } else if (JSON.stringify(card.owner) !== JSON.stringify(req.user._id)) {
          throw new ForbiddenError('Невозможно удалить чужую карточку');
        } else {
          Card.deleteOne(card, (err) => {
            if (err) {
              throw err;
            } else {
              res.send({ card });
            }
          });
        }
      })
      .catch(next);
  } else {
    next(new BadRequestError('Некорректный ID карточки'));
  }
};
