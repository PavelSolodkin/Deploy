const mongoose = require('mongoose');
const Card = require('../models/card');

const { ObjectId } = mongoose.Types;

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send({ card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: err });
      } else {
        res.status(500).send({ message: err });
      }
    });
};

module.exports.getCards = (req, res) => {
  Card.find({})
    .populate('card')
    .then((cards) => res.send({ cards }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

// eslint-disable-next-line consistent-return
module.exports.deleteCard = (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send({ message: 'Невозможный ID карточки' });
  }
  Card.findById(req.params.id)
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: 'Карточка не найдена' });
      } else if (card.owner.toString() !== req.user._id) {
        res.status(403).send({ message: 'Невозможно удалить чужую карточку' });
      } else {
        Card.findByIdAndRemove(req.params.id)
          .then(() => res.status(200).send({ data: card }))
          .catch((err) => res.status(500).send({ message: err.message }));
      }
    });
};
