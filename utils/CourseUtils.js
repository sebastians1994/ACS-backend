const fs = require('fs');
const pdfParse = require('pdf-parse');
const index = require('../index');

var majorData = {};

var majorpathsDirectory = fs.readdirSync("./majorpaths");

console.log("Loading majors.");

for (var mp of majorpathsDirectory) {
  var mpData = fs.readFileSync("./majorpaths/" + mp);
  var mpObj = JSON.parse(mpData);
  var majorName = mpObj.name;
  majorData[majorName] = mpObj;
}

function getMajorData(){
  return majorData;
}

function checkStudentProgress(studentJSON) {

    var allStudentCourses = {};

    for (var semester in studentJSON.course) { // Map all student taken courses into allStudentCourses
        var semesterCourses = studentJSON.course[semester];
        for (var course in semesterCourses) {
            allStudentCourses[course] = semesterCourses[course];
        }
    }

    var major = "Computer Science";//Take this from PDF in the future

    if(majorData[major] == null){
      return;
    }

    var courseData = majorData[major].courses;
    var duplicatePath = JSON.parse(JSON.stringify(majorData[major].path));


    for (var requirement in duplicatePath) {
        if (requirement == "Upper Division Electives")
            continue;

        var reqCourses = duplicatePath[requirement];

        for(var i = reqCourses.length-1;i >= 0;i--){
          var reqCourse = reqCourses[i];
          if (completed(reqCourse, allStudentCourses)) {
              reqCourses.splice(i, 1);
          }
        }
    }
    return duplicatePath;
}

//[["BIOL 106","BIOL 106L","BIOL 107","BIOL 107L",[["CHEM 101","CHEM 101L"],["GEOG 101","GEOG 102"],["GEOG 103","GEOG 105 "],["GEOL 101","GEOL 102"],["GEOL 110","GEOL 112"],["PHYS 220A","PHYS 220AL"]]],["CHEM 101","CHEM 101L","CHEM 102","CHEM 102L",[["BIOL 106","BIOL 106L"],["GEOG 101","GEOG 102"],["GEOG 103","GEOG 105 "],["GEOL 101","GEOL 102"],["GEOL 110","GEOL 112"],["PHYS 220A","PHYS 220AL"]]],["PHYS 220A","PHYS 220AL","PHYS 220B","PHYS 220BL",["BIOL 106","BIOL 106L"],["CHEM 101","CHEM 101L"],["GEOG 101","GEOG 102"],["GEOG 103","GEOG 105"],["GEOL 101","GEOL 102"],["GEOL 110","GEOL 112"]]]

function completed(requirementObj, allStudentCourses) {
    if (typeof requirementObj == "string") {
        return (allStudentCourses[requirementObj] != null)
    } else if (typeof requirementObj == "object") {
        if (typeof requirementObj[0] == "object") {
            for (var classes of requirementObj) {
                if (completed(classes, allStudentCourses)) {
                    return true;
                }
            }
            return false;
        } else {
            for (var course of requirementObj) {
                if (typeof course == "object") {
                    if (!completed(course, allStudentCourses)) {
                        return false;
                    }
                    continue;
                } else if (allStudentCourses[course] == null) {
                    return false;
                }
            }
            return true;
        }
    }
}

function parseDPR(studentPDF, callback) {

    var studentJSON = {}; //Student JSON with student ID and course with grades

    const studentIDPattern = /\d{9}/g; // Regular Expression for matching student ID in student DPR
    const courseListPattern = /.*[0-9][0-9][FS][APGU].*/g; // Regular Expression for matching student ID in DPR


    var semesterData = new Set();
    pdfParse(studentPDF).then(function (data) {

        var studentData = data.text.match(courseListPattern); //Extracts student data of course students take or taken in the DPR
        studentJSON.studentID = data.text.match(studentIDPattern)[0]; // Extracts student identification number (ID)

        var extractSemesterData = data.text.match(/[0-9][0-9][FS][APGU]/g)

        extractSemesterData.forEach((semester) => semesterData.add(semester))

        studentJSON.course = {};

        semesterData.forEach(semester => {
           var tempStudentHoldDataMap = new Map();

            studentData.forEach((dataLine => {
                var courseLine = dataLine.includes(semester)
                if (courseLine) {
                    var studentDataLine = dataLine.replace(/\s/g, '');

                    var decIndex = parseInt(studentDataLine.indexOf('.')); // Refrenceing course unit decimal point as a "base" index to extract other relevent data such as course and grade
                    var tempCourse = studentDataLine.substring(4, decIndex - 1); // Get Course (Ex: COMP110)
                    var firstNumberOccurence = (tempCourse.search(/\d/));
                    var course = tempCourse.substring(0, firstNumberOccurence) + " " + tempCourse.substring(firstNumberOccurence, tempCourse.length); // Modifiying tempCourse to statisfy proper csun course naming convention

                    var tempGrade = studentDataLine.substring(decIndex + 2, decIndex + 4);

                    var grade;
                    if (tempGrade == "IP") { //Validating if course grade is a standard letter grade or I and if so change to IP (In Progress)
                        grade = "IP";
                    }
                    else if (tempGrade == "CR"){ //Validating if course grade is CR (Credit)
                        grade = "CR"
                    }
                    else if (tempGrade.charAt(tempGrade.length - 1) == "-" || tempGrade.charAt(tempGrade.length - 1) == "+") {
                        grade = tempGrade;
                    } else {
                        grade = tempGrade.charAt(0);
                    }

                    tempStudentHoldDataMap.set(course, grade);

                    studentData.slice(dataLine);
                }
            }));

            studentJSON.course[semester] = Object.fromEntries(tempStudentHoldDataMap);
        });

        callback(studentJSON);
    }).catch(err => {
        console.error("Opening PDF error occured", err);
        callback();
    });
}

module.exports = {
  checkStudentProgress,
  getMajorData,
  parseDPR
};
