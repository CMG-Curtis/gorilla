var loginDiv = document.getElementById('login-div');
var username = document.getElementById('username');
var password = document.getElementById('password');
var login = document.getElementById('login');

var collection = document.getElementById('collection');
var query = document.getElementById('query');
var submit = document.getElementById('submit');

var umgTournament = document.getElementById('umg-tournament');
var umgFarm = document.getElementById('umg-farm');

login.addEventListener('click', function(){
	Database.login(username.value, password.value, function(){
		loginDiv.className = 'login-success';
	}, function(){
		loginDiv.className = 'login-failure';
	});
});

submit.addEventListener('click', function(){
	Database.getDocuments(collection.value, JSON.parse(query.value));
});

umgFarm.addEventListener('click', function(){
	Database.insertUser(testSubject);
	/*
	UMG.processTournament(umgTournament.value, function(tournament, users){
		for(user of users){
			Database.insertUser(user, function(response){
				console.log(response);
			});
		}
		Database.insertDocument('tournaments', tournament, function(response){
			console.log(response);
		});
	});
	*/
});

var testSubject = new User('asdf', 'umg', 'username', 'US', ['PS4'], [],'myHandle');

// Makes the server get the HTML of a page so we don't have to worry about CORS
function getPage(url, callback){
	var original = dissectURL(url);
	var http = new XMLHttpRequest();
	http.open('POST', '/html');
	http.setRequestHeader("Content-type", "application/json");
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			var reply = http.responseText;
			if(responses){
				responses.innerHTML = reply;
			}
			if(callback){
				var page = document.createElement('div');
				page.innerHTML = reply;
				var links = page.querySelectorAll('a');
				for(link of links){
					var u = dissectURL(link.href);
					if(link.href.includes(window.location.host)){
						link.href = link.href.replace(window.location.host, original.host);
					}
					link.target = '_blank';
				}
				callback(page);
			}
		}
	}
	var body = {};
	body.url = url;
	http.send(JSON.stringify(body));
};

function dissectURL(url){
	var split = url.split('/');
	var u = {};
	u.protocol = split[0];
	u.host = split[2];
	u.path = '';
	for(dir of split.splice(3, split.length)){
		u.path += '/' + dir;
	}
	return u;
}

// TODO define all the functions necessary for farming users

var UMG = {};

UMG.processTournament = function(url){
	// TODO
};