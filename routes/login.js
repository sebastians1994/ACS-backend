var express = require('express'),
router = express.Router();

router.post('/', function(req,res){
  //Mock login later.
  res.json({status: "success"});
});

module.exports = router;
