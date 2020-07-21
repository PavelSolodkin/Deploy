const usersRouter = require('express').Router();
const { getUsers, getSingleUser } = require('../controllers/users');

usersRouter.get('/', getUsers);
usersRouter.get('/:id', getSingleUser);

module.exports = usersRouter;
