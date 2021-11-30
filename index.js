require('dotenv').config();
const debug = require('debug')("Main")
const db = require('./db');
const express = require('express')
const fs = require('fs');
const routes = require('./routes');
const studentPDFParse = require('./dataparse/dprparse');
// const checkPrereq = require('./dataparse/checkprereq');
const checkStudentCSProgress = require('./dataparse/removeclasstaken');
const path = require('path');
const app = express();
require('./routes')(app);

const port = 80;

var courses = {};
var paths = {};

function boot() {
  var coursepathsDirectory = fs.readdirSync("./coursepaths");

  paths = JSON.parse(fs.readFileSync("./paths.json"));

  for (var cp of coursepathsDirectory) {
    var cpData = fs.readFileSync("./coursepaths/" + cp);
    var cpObj = JSON.parse(cpData);
    var courseName = cpObj.name;
    courses[courseName] = cpObj.courses;
  }

  debug("Loaded " + Object.keys(courses).length + " course paths...");

  app.listen(port, () => {
    debug(`ACS Backend listening on http://localhost:${port}`)
  });
}

boot();


// Example to validate that the parse function works.
const pdf = './alan.pdf' // Add file name not path.
studentPDFParse((pdf), (JSON) => {
  const coursePDF = checkStudentCSProgress(JSON, paths);
});


