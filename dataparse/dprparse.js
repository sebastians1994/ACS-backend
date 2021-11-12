const pdfParse = require('pdf-parse');
const fs = require('fs');

function studentPDFParse(studentPDF, callback) {

    var tempStudentHoldDataMap = new Map();
    var studentJSON = {}; //Student JSON with student ID and course with grades

    const studentIDPattern = /\d{9}/g; // Regular Expression for matching student ID in student DPR
    const courseListPattern = /.*[0-9][0-9][FS][APGU].*/g; // Regular Expression for matching student ID in DPR


    pdfParse(studentPDF).then(function (data) {

        var studentData = data.text.match(courseListPattern); //Extracts student data of course students take or taken in the DPR
        const studentID = data.text.match(studentIDPattern)[0]; // Extracts student identification number (ID)


        for (let index = 0; index < studentData.length; index++) {
            var studentDataLine = studentData[index].replace(/\s/g, ''); //Removing whitespace.
            var decIndex = parseInt(studentDataLine.indexOf('.')); // Refrenceing course unit decimal point as a "base" index to extract other relevent data such as course and grade

            var tempCourse = studentDataLine.substring(4, decIndex - 1); // Get Course (Ex: COMP110)
            var firstNumberOccurence = (tempCourse.search(/\d/));
            var course = tempCourse.substring(0, firstNumberOccurence) + " " + tempCourse.substring(firstNumberOccurence, tempCourse.length); // Modifiying tempCourse to statisfy proper csun course naming convention 

            var tempGrade = studentDataLine.substring(decIndex + 2, decIndex + 4); 

            var grade;
            if (tempGrade == "IP") { //Validating if course grade is a standard letter grade or I and if so change to IP (In Progress)
                grade = "IP";
            }
            else if (tempGrade.charAt(tempGrade.length - 1) == "-" || tempGrade.charAt(tempGrade.length - 1) == "+") { 
                grade = tempGrade;
            } else {
                grade = tempGrade.charAt(0);
            }

            tempStudentHoldDataMap.set(course, grade); //Adding to map to remove possible duplicate data
        }

        studentJSON.studentID = studentID;
        studentJSON.course = Object.fromEntries(tempStudentHoldDataMap);

        callback(studentJSON);
    }).catch(err => {
        console.error("Opening PDF error occured", err);
    });
}

module.exports = studentPDFParse;