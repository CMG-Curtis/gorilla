var Database = {};

// Used to query documents from the server
Database.getDocuments = function(username, password, collection, query, callback){
	Database._serverRequest(username, password, '/db/' + collection + '/', function(body){
		body.query = query;
	}, function(response){
		//console.log(response);
		if(callback){
			callback(response);
		}
	});
};

// All requests to the server must be POSTs so that they can pass along the credentials in the body of the request
Database._serverRequest = function(username, password, path, constructBody, onResponse){
	var http = new XMLHttpRequest();
	http.open('POST', path);
	http.setRequestHeader("Content-type", "application/json");
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			var doc = JSON.parse(http.responseText);
			if(doc.err){
				console.error(doc.err);
			} else {
				if(onResponse){
					onResponse(doc);
				}
			}
		}
	}
	var body = {};
	body.credentials = {};
	body.credentials.username = username;
	body.credentials.password = password;
	body.query = {};
	if(constructBody){
		constructBody(body);
	}
	http.send(JSON.stringify(body));
}

function User(username, website, region, platforms, tournaments, twitterHandle, twitterFollowers, twitchUsername, twitchFollowers, youtubeUsername, youtubeSubscribers){
	var u = {};
	u.username = username;
	u.website = website;
	u.region = region;
	u.platforms = platforms;
	u.tournaments = tournaments;
	u.twitter = {};
	u.twitter.username = twitterHandle;
	u.twitter.followers = twitterFollowers;
	u.twitch = {};
	u.twitch.username = twitchUsername;
	u.twitch.followers = twitchFollowers;
	u.youtube = {};
	u.youtube.username = youtubeUsername;
	u.youtube.username = youtubeSubscribers;
	return u;
}

function Tournament(website, region, platform, game, date, details, teamSize, teamCount, users){
	var t = {};
	t.website = website;
	t.region = region;
	t.platform = platform;
	t.game = game;
	t.date = date;
	t.details = details;
	t.teamSize = teamSize;
	t.teamCount = teamCount;
	t.users = users;
	return t;
}