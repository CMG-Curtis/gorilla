// This file is responsible for assigning actions to the farming interface

var loginDiv = document.getElementById('login-div');
var username = document.getElementById('username');
var password = document.getElementById('password');
var login = document.getElementById('login');

var collection = document.getElementById('collection');
var query = document.getElementById('query');
var submit = document.getElementById('submit');

var results = document.getElementById('results');

var Login = {};
Login.onSuccess = [];
Login.onFailure = [];

login.addEventListener('click', function(){
	Database.login(username.value, password.value, function(){
		for(func of Login.onSuccess){
			func();
		}
	}, function(){
		for(func of Login.onFailure){
			func();
		}
	});
});

Login.onSuccess.push(function(){
	loginDiv.className = 'login-success';
});

Login.onFailure.push(function(){
	loginDiv.className = 'login-failure';
});

submit.addEventListener('click', function(){
	Database.getDocuments(collection.value, JSON.parse(query.value));
});

// Makes the server get the HTML of a page so we don't have to worry about CORS
function getPage(url, callback){
	// Parse the given url so that we can use that info later
	var original = parseURL(url);
	// Create a new http request
	var http = new XMLHttpRequest();
	// Set the method to POST onto '/html'
	http.open('POST', '/html');
	// Set the content type of the request
	http.setRequestHeader("Content-type", "application/json");
	// Define what happens when we get a responses
	http.onreadystatechange = function() {
		// When its fully ready
		if(http.readyState == 4 && http.status == 200) {
			if(callback){
				// Create fake element to store the html into
				var page = document.createElement('div');
				// Set the innerHTML of the fake element
				page.innerHTML = http.responseText;
				// Process all of the links
				var links = page.querySelectorAll('a');
				// Correct the host for all of the links
				for(link of links){
					// Parse the individual link
					var u = parseURL(link.href);
					// Check if the url contains the current host
					if(link.href.includes(window.location.host)){
						// Replace the current host with the original requests' host
						link.href = link.href.replace(window.location.host, original.host);
						// Replace the current protocol with the correct protocol
						link.href = link.href.replace(u.protocol, original.protocol);
					}
				}
				// Forward the DOM element with the HTML to the callback function
				callback(page);
			}
		}
	}
	var body = {};
	body.url = url;
	http.send(JSON.stringify(body));
};

// Creates a temporary a tag to break down links into parts
function parseURL(url){
	var a = document.createElement('a');
	a.href = url;
	return a;
}
