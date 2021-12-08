const CourseUtils = require('../utils/CourseUtils');
var express = require('express'),
router = express.Router();

router.post('/', function(req,res){

  if(req.files == null){
    res.json({error: "No file uploaded."});
    return;
  }

  if(typeof req.files != "object"){
    res.json({error: "Invalid parameter type"});
    return;
  }

  if(Object.keys(req.files).length != 1){
    res.json({error: "Only 1 upload permitted"});
    return;
  }

  var uploadedFile = req.files[Object.keys(req.files)[0]];

  CourseUtils.parseDPR(uploadedFile.data, (semesterCourses) => {

    if(semesterCourses == null){
      res.json({error: "Uploaded file not detected as DPR"});
      return;
    }

    let remainingRequirements = CourseUtils.checkStudentProgress(semesterCourses);

    res.json({status: "success", data:{remainingRequirements: remainingRequirements, majorData: CourseUtils.getMajorData()}, semester: semesterCourses.course});
  });
});

router.get("/", function(req, res){
  res.json({status: "success"})
})

module.exports = router;
