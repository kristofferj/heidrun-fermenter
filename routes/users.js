var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/getTemp', function(req, res) {
  res.send('temp');
});

module.exports = router;
