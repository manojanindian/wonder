process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var express = require('express');
var request = require('request');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

	TEST_DOMAIN = req.query.u;
	var testPage = req.query.p;
	
	request(TEST_DOMAIN+testPage, function (error, response, body) {
		res.send(body);
	});
});

module.exports = router;
