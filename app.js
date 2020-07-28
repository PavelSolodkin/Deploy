require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const { celebrate, Joi, errors } = require('celebrate');

const cardsRoute = require('./routes/cards');
const usersRoute = require('./routes/users');

const auth = require('./middlewares/auth');
const { login, createUser } = require('./controllers/users');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const NotFoundError = require('./errors/NotFoundError');

const validateUrl = require('./regex/UrlReg');
const validatePass = require('./regex/PasReg');

const app = express();
const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
    }),
  }),
  login,
);
app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string()
        .required()
        .pattern(validatePass)
        .error(() => new Error('Необходим задать пароль, содержащий строчные латинские буквы и цифры длинной не менее 8 символов')),
      name: Joi.string().required().min(2).max(30),
      about: Joi.string().required().min(2).max(30),
      avatar: Joi.string()
        .required()
        .pattern(validateUrl)
        .error(() => new Error('Неверный формат ссылки')),
    }),
  }),
  createUser,
);

app.use('/cards', auth, cardsRoute);
app.use('/users', auth, usersRoute);

app.use('*', (req, res, next) => {
  next(new NotFoundError('Запрашиваемый ресурс не найден'));
});

app.use(errorLogger);

app.use(errors());

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500 ? 'На сервере произошла ошибка' : message,
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Приложение запущено на localhost:${PORT}`);
});
