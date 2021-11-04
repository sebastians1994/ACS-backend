const debug = require('debug')('DB');

var mysql = require('mysql');

debug("Connecting to MySQL @ " + process.env.DB_HOST);

var pool = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DB_HOST,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASS,
  database        : 'acs',
  connectTimeout: 2000
});

pool.on('connection', function(connection) {
    debug('Connected!');
});

module.exports = pool;
