// This module is responsible for getting the html of any page that is requested

// TODO create a more generic way of detecting ajax calls (search the html for 'ajax' maybe?)

const http = require('http');
const https = require('https');
const URL = require('url');

const phantom = require('phantom');

// Create a dictionary to get http or https
var http_protocols = {'http:': http, 'https:': https};

module.exports = function(url, callback){
	// Break the url into parts
	var u = URL.parse(url);
	// Get the node protocol to use
	var protocol = http_protocols[u.protocol];
	// Set the options for the request
	var options = {
		host: u.host,
		path: u.path,
		headers: {'User-Agent':'javascript'}
	};

	if(url.includes('profile.majorleaguegaming')){
		(async function() {
			const instance = await phantom.create();
			const page = await instance.createPage();
			await page.on("onResourceRequested", function(requestData) {
				//console.info('Requesting', requestData.url)
			});
		
			const status = await page.open(url);
			//console.log(status);
		
			const content = await page.property('content');
			callback(content);
		
			await instance.exit();
		}());
	} else {
		// Send the GET request for the page
		protocol.get(options, (res) => {
			// Parse the body of the response
			var body = '';
			res.on('data', (chunk) => { body += chunk; });
			res.on('end', () => {
				if(callback){
					// Return the page html to the callback function
					callback(body);
				}
			});
		});
	}

};