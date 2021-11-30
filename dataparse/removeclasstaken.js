var allStudentCourses = {};

var dubplicatePath;

function checkStudentCSProgress(studentJSON, paths) {

    for (var semester in studentJSON.course) { // Map all student taken courses into allStudentCourses
        var semesterCourses = studentJSON.course[semester];
        for (var course in semesterCourses) {
            allStudentCourses[course] = semesterCourses[course];
        }
    }

    dubplicatePath = JSON.parse((JSON.stringify(paths.path)))

    for (var requirement in dubplicatePath) {
        if (requirement == "Upper Division Electives")
            continue;

        var courses = dubplicatePath[requirement];
        for (var reqCourse in courses) {
            //If this is an array, and its' fulfilled, then remove it 
            if (!completed(courses[reqCourse])) {
                break; //meaning something in the requirement is not fulfilled
            }

            dubplicatePath[requirement] = []; // If one array of array is fulliled, then the enitre requirement is fulliled.
        }
    }

    console.log(dubplicatePath);

}

function completed(requirementObj) {
    if (typeof requirementObj == "string") {
        return (allStudentCourses[requirementObj] != null)
    } else if (typeof requirementObj == "object") {
        if (typeof requirementObj[0] == "object") {//This is an array of arrays);
            for (var classes of requirementObj) {
                if (completed(classes)) {
                    return true;
                }
            }
            return false;
        } else {//This is an array of strings that also might //Make sure every single string is fulfilled
            for (var course of requirementObj) {
                if (typeof course == "object") {
                    if (!completed(course)) { //If thiers array in array of strings, student needs just one of the options to fulfill that spefic class requirement.
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
module.exports = checkStudentCSProgress;