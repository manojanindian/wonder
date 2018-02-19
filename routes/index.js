var express = require('express');
var router = express.Router();
var request = require('request');
var smcat = require("state-machine-cat");
var machine = require('getmac');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {


	var url = `${req.query.u}/wonder.json`;
	request(url, function (error, response, body) {
		var testsList = JSON.parse(body);
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
			console.log(macAddress)
			console.log(req.headers['user-agent']);

			var fileContent = req.headers['user-agent'];
			var filepath = `reports/${macAddress}.txt`;
			
			fs.writeFile(filepath, fileContent, (err) => {
				if (err) throw err;
				console.log("The file was succesfully saved!");
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
				u: req.query.u
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
