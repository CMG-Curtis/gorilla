const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const path = require('path');

var http = require('http');

// https://umggaming.com/tournaments/1862/teams
// https://umggaming.com/m/2329149

var url = 'http://umggaming.com/tournaments/1862/teams';

function getPage(url, callback){
	var u = url.split('/');
	var host = u[2];
	u = u.slice(3, u.length);
	var p = '';
	for(part of u){
		p += '/' + part
	}
	var options = {
		host: host,
		path: p,
		//headers: {'User-Agent':'javascript'}
		headers: {'Origin':'url','User-Agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0'}
	};
	http.get(options, (res) => {
		var body = '';
		res.on('data', (chunk) => {
			body += chunk;
		}).on('end', () => {
			const dom = new JSDOM(body);
			callback(body);
		});
	});
}

getPage(url, (html) => {
	console.log(html);
});