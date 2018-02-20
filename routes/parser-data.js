var express = require('express');
var request = require('request');
var findContentType = require('../modules/find-content-type.js');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

    

    var url = TEST_DOMAIN + req.originalUrl;
    url = url.split("?")[0];
    var ext =   findContentType.ext.getExt(url);
    var contentType =   findContentType.ext.getContentType(ext);
   
    try {
        var testName = req.headers.referer.match(/&t=(.*)&/g)[0].replace(/&/g,'').replace('t=','');
    } catch(e) {
        res.send('');
        return;
    }

	request(url, function (error, response, body) {

        if(ext === 'js') {
            var re = /Wonder:Test\s+for:{(.*)}\s+test:values{(.*)}/g;
            body = body.replace(re, function ($1) {

                var values = $1.match(/{(.*?)}/g).map(function(val){
                    return val.replace(/{/g,'').replace(/}/g,'');
                });
                if(values[0] !== testName) {
                    return $1;
                }

                var testData = JSON.parse(`{${values[1]}}`);

                return `${$1}\n(function(){

                    var message ='';
                    var validator = {${values[1]}};
                    var status = true;
    
                    for(var v in validator) {
                        var isValid = (document.querySelector(v).innerHTML === validator[v]);
            
                        if(!isValid) {
                            message = 'expected "' + validator[v] + '" found "' + document.querySelector(v).innerHTML + '"';
                            status = false;
                            break;
                        }
                    }

                    window.parent.postMessage({
                        edge: '${values[0]}',
                        status: status,
                        message: message,
                        location: window.location.href
                    }, '*');
                })();`;
            });

            var re = /Wonder:Setup\s+for:{(.*)}\s+data:{(.*)}\s+trigger:{(.*)}/g;
            body = body.replace(re, function ($1) {
                var values = $1.match(/{(.*?)}/g).map(function(val){
                    return val.replace(/{/g,'').replace(/}/g,'');
                });

                if(values[0] !== testName) {
                    return $1;
                }

                var dataTemplate = '';
                var data = JSON.parse(`{${values[1]}}`);

                for (var val in data) {
                    if (data.hasOwnProperty(val)) {
                        dataTemplate = `${dataTemplate}\ndocument.querySelector('${val}').value = '${data[val]}';`;
                    }
                }

                var triggerTemplate = '';
                var trigger = JSON.parse(`{${values[2]}}`);

                switch(trigger.event) {
                    case 'click' :
                        triggerTemplate = `var el = document.querySelector('${trigger.selector}');
                            if (el.onclick) {
                            el.onclick();
                            } else if (el.click) {
                            el.click();
                        }`;
                        break;
                }
                

                return `${$1}\nvar ${values[0]} = function() {
                    ${dataTemplate}
                    ${triggerTemplate}
                }\n${values[0]}()`;
            });
            
            
        }

        res.contentType(contentType);
		res.send(body); 
    });

    
});

module.exports = router;
