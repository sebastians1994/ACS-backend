const routes = require('express').Router();
const login = require('./login');

module.exports = (app) => {
  app.use('/api/login', login);
};
