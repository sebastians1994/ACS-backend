require('dotenv').config();
const debug = require('debug')("Main")
const db = require('./db');
const express = require('express')
const fs = require('fs');
const routes = require('./routes');
const CourseUtils = require('./utils/CourseUtils');
const path = require('path');
const fileUpload = require('express-fileupload');
const app = express();

app.use(fileUpload({}));

require('./routes')(app);

const port = 80;

function boot() {

  app.listen(port, () => {
    debug(`ACS Backend listening on http://localhost:${port}`)
  });

  const pdf = './andre.pdf' // Add file name not path.
  CourseUtils.parseDPR((pdf), (JSON) => {

    const neededCourses = CourseUtils.checkStudentProgress(JSON);
    console.log(neededCourses);
  });
}

boot();
