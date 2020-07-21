const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const cardsRoute = require('./routes/cards');
const usersRoute = require('./routes/users');

const auth = require('./middlewares/auth');
const { login, createUser } = require('./controllers/users');

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

const noUrl = (req, res, next) => {
  if (!res.headersSent) {
    res.status(404).send({
      message: 'Запрашиваемый ресурс не найден',
    });
  }
  next();
};

app.post('/signin', login);
app.post('/signup', createUser);

app.use(auth);

app.use('/cards', cardsRoute);
app.use('/users', usersRoute);

app.use(noUrl);

app.listen(PORT, () => {
  console.log(`Приложение запущено на localhost:${PORT}`);
});
