const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const key = require('../jwtconfig');
const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .populate('user')
    .then((users) => res.send({ users }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports.getSingleUser = (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        res.status(404).send({ message: 'Такой пользователь не найден' });
      } else {
        res.send({ user });
      }
    })
    .catch(() => res.status(404).send({ message: 'Невозможный ID пользователя' }));
};

module.exports.createUser = (req, res) => {
  const {
    name, about, avatar, email,
  } = req.body;
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.send({
      _id: user._id, name: user.name, about: user.about, avatar: user.avatar, email: user.email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: err });
      } else {
        res.status(401).send({ message: err });
      }
    });
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  if (password) {
    return User.findUserByCredentials(email, password)
      .then((user) => {
        const token = jwt.sign({ _id: user._id }, key, { expiresIn: '7d' });
        res.status(200).send({ token });
      })
      .catch((err) => {
        res
          .status(401)
          .send({ message: err.message });
      });
  }
  return res.status(400).send({ message: 'Необходимо ввести пароль' });
};
