var express = require('express');
var router = express.Router();
var request = require('request');
var smcat = require("state-machine-cat");
var machine = require('getmac');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {

	if(req.query.u === '' || req.query.u === undefined) {
		res.render('getUrl',{
			port: SERVER_PORT
		});
		return;
	}

	var url = `${req.query.u}/wonder.json`;
	
	request(url, function (error, response, body) {
		try {
			var testsList = JSON.parse(body);
		} catch (e) {
			res.render('error',{
				message: `Error!!!`,
				hint: `File "${url}" not created or JSON structure is invalid`
			})
			return false;
		}

		var tests = null;
		var testsPage = null;

		var findTestPages = function() {
			var pages = [];
			for(var i=0; i<tests.length; i++) {
				var page = testsList[tests[i]];
				pages.push(page);
			}
			return pages;
		}
		
		machine.getMac(function(err, macAddress){
			if (err)  throw err

			var fileContent = req.headers['user-agent'];
			var filepath = `reports/${macAddress}.txt`;
			
			fs.writeFile(filepath, fileContent, (err) => {
				if (err) throw err;
			}); 

		});

		var lSVGInAString = smcat.render(
			`
					Login => Home: Success;
					# this test has been fail
					# expected 3 got 6
					Login => Login: Fail;
			`,
			{
					outputType: "svg",
					direction: "top-bottom"
			}
		);

		//res.send(lSVGInAString);
		
	
		var render = function() {
			res.render('index', { 
				title: 'Wonder',
				tests: tests,
				testsPages: testsPage,
				u: req.query.u,
				port: SERVER_PORT
			});
		}

		if(req.query.t) {
			tests = req.query.t.split(',');
		} else {
			tests = Object.keys(testsList);
		}
		
		testsPage = findTestPages();
		render();
	});
});

module.exports = router;
