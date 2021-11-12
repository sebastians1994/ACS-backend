const routes = require('express').Router();
const login = require('./login');
const fileImport = require('./import');

module.exports = (app) => {
  app.use('/api/login', login);
};
