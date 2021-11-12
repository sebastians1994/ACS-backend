require('dotenv').config();
const debug = require('debug')("Main")
const db = require('./db');
const express = require('express')
const fs = require('fs');
const routes = require('./routes');
const studentPDFParse = require('./dataparse/dprparse');

const app = express();
require('./routes')(app);

const port = 80;

var courses = {};

function boot(){
  var coursepathsDirectory = fs.readdirSync("./coursepaths");

  for(var cp of coursepathsDirectory){
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
// const pdf = './...' // Add file name not path.
// studentPDFParse((pdf), (json) =>{
//   console.log(json);
// })

