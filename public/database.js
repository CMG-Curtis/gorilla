var Database = {};

var responses = document.getElementById('server-response');

Database.login = function(username, password, onSuccess, onFailure){
	Database.username = username;
	Database.password = password;
	Database._serverRequest('/db/users/', function(body){
		body.query = { authenticate: {} };
	}, function(response){
		if(response.err && response.err.code == 18){
			delete Database.username;
			delete Database.password;
			if(onFailure){
				onFailure();
			}
		} else {
			if(onSuccess){
				onSuccess();
			}
		}
	});
};

// Insert a document into the server
Database.insertDocument = function(collection, doc, callback){
	Database._serverRequest('/db/' + collection + '/', function(body){
		body.document = doc;
	}, function(response){
		if(callback){
			callback(response);
		}
	})
};

// Get a specific document
Database.getDocumentById = function(collection, id, callback){
	Database.getDocuments(collection, { _id: id }, function(docs){
		if(callback){
			callback(docs[0]);
		}
	});
};

// Used to query documents from the server
Database.getDocuments = function(collection, query, callback){
	Database._serverRequest('/db/' + collection + '/', function(body){
		body.query = query;
	}, function(response){
		if(callback){
			callback(response);
		}
	});
};

// All requests to the server must be POSTs so that they can pass along the credentials in the body of the request
Database._serverRequest = function(path, constructBody, onResponse){
	// TODO check for required paramaters
	if(!Database.username || !Database.password){
		if(responses){
			responses.innerHTML = 'Please verify credentials with Database.login before issuing any requests.';
		}
		return;
	}
	var http = new XMLHttpRequest();
	http.open('POST', path);
	http.setRequestHeader("Content-type", "application/json");
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			var doc = JSON.parse(http.responseText);
			if(doc.err){
				console.error(doc.err);
			}
			if(responses){
				responses.innerHTML = JSON.stringify(doc, null, '\t');
			}
			if(onResponse){
				onResponse(doc);
			}
		}
	}
	var body = {};
	body.credentials = {};
	body.credentials.username = this.username;
	body.credentials.password = this.password;
	if(constructBody){
		constructBody(body);
	}
	http.send(JSON.stringify(body));
}

function User(link, username, website, region, platforms, tournaments, twitterHandle, twitterFollowers, twitchUsername, twitchFollowers, youtubeUsername, youtubeSubscribers){
	var u = {};
	u.link = link;
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

function Tournament(link, website, region, platform, game, date, details, teamSize, teamCount, users){
	var t = {};
	t.link = link;
	t.website = website;
	t.region = region;
	t.platform = platform;
	t.game = game;
	t.date = date;
	t.title = title;
	t.teamSize = teamSize;
	t.teamCount = teamCount;
	t.users = users;
	return t;
}