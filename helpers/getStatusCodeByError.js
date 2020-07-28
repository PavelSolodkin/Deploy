const BadRequestError = require('../errors/BadRequestError');

module.exports = (err, next) => {
  if (err.name === 'ValidationError') {
    next(new BadRequestError(err.message));
  } else {
    next(err);
  }
};
