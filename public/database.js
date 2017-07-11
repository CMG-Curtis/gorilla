var Database = {};

// Insert a document into the server
Database.insertDocument = function(username, password, collection, doc, callback){
	Database._serverRequest(username, password, '/db/' + collection + '/', function(body){
		body.document = doc;
	}, function(response){
		if(callback){
			callback(response);
		}
	})
};

// Get a specific document
Database.getDocumentById = function(username, password, collection, id, callback){
	Database.getDocuments(username, password, collection, { _id: id }, function(docs){
		if(callback){
			callback(docs[0]);
		}
	});
};

// Used to query documents from the server
Database.getDocuments = function(username, password, collection, query, callback){
	Database._serverRequest(username, password, '/db/' + collection + '/', function(body){
		body.query = query;
	}, function(response){
		if(callback){
			callback(response);
		}
	});
};

// All requests to the server must be POSTs so that they can pass along the credentials in the body of the request
Database._serverRequest = function(username, password, path, constructBody, onResponse){
	// TODO check for required paramaters
	var http = new XMLHttpRequest();
	http.open('POST', path);
	http.setRequestHeader("Content-type", "application/json");
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			var doc = JSON.parse(http.responseText);
			if(doc.err){
				console.error(doc.err);
			}
			if(onResponse){
				onResponse(doc);
			}
		}
	}
	var body = {};
	body.credentials = {};
	body.credentials.username = username;
	body.credentials.password = password;
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
	if(twitterHandle || twitterFollowers){
		u.twitter = {};
		u.twitter.username = twitterHandle;
		u.twitter.followers = twitterFollowers;
	}
	if(twitchUsername || twitchFollowers){
		u.twitch = {};
		u.twitch.username = twitchUsername;
		u.twitch.followers = twitchFollowers;
	}
	if(youtubeUsername || youtubeSubscribers){
		u.youtube = {};
		u.youtube.username = youtubeUsername;
		u.youtube.username = youtubeSubscribers;
	}
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