/**
 * Module dependencies.
 */
var router = require('express').Router(),
    path = require('path'),
    multer = require('multer'),
    dir = path.join(__dirname, '..', '..', 'public/');

/* GET admin page. */
router.all('/', function(req, res) {
    res.sendFile(dir + 'index.html');
});

var uploading = multer({
  dest: path.join(dir, 'uploads/')
});

router.post('/upload', uploading.single('deal'), function(req, res) {
  console.log(req.body);
	console.log(req.file);
	res.status(204).end();
});
module.exports = router;
