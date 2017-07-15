// This module is responsible for getting the html of a page

const http = require('http');
const https = require('https');
const URL = require('url');

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
};