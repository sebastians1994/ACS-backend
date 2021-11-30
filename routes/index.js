const routes = require('express').Router();
const login = require('./login');
const importRoute = require('./import');

module.exports = (app) => {
  app.use('/api/login', login);
  app.use('/api/import', importRoute);
};
