var Database = {};

// Try to get the dedicated element for displaying the most recent server response
var responses = document.getElementById('server-response');

// Needs to be called (and succeed) before using any other Database functions
Database.login = function(username, password, onSuccess, onFailure){
	// Set the username and password (for now)
	Database.username = username;
	Database.password = password;
	// Send a bogus query to just to check authentication from the server
	Database._serverRequest('/db/', function(body){
		body.collection = 'users';
		body.query = { authenticate: {} };
	}, function(response){
		// If authentication fails
		if(response.err && response.err.code == 18){
			// Revoke the username and password definitions
			delete Database.username;
			delete Database.password;
			// Call the function for failures
			if(onFailure){
				onFailure();
			}
		} else {
			// Call the function for success
			if(onSuccess){
				onSuccess();
			}
		}
	});
};

// Insert a document into the server
Database.insertDocument = function(collection, doc, callback){
	Database._serverRequest('/db/', function(body){
		body.document = doc;
		body.collection = collection;
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
	Database._serverRequest('/db/', function(body){
		body.collection = collection;
		body.query = query;
	}, function(response){
		if(callback){
			callback(response);
		}
	});
};

// Insert a user into the database, or update the old recrod for the user
Database.insertUser = function(user, callback){
	Database.getDocuments('users', {link: user.link}, function(responseDoc){
		// The user already exists, we need to update
		if(responseDoc.documents && responseDoc.documents.length == 1){
			var oldUser = responseDoc.documents[0];
			// Set the id of the new user document to the old one so that it replaces the old user
			user._id = oldUser._id;
			// Add the old list of tournaments onto the new user doc
			user.tournaments = _union(oldUser.tournaments, user.tournaments);
		}
		// Insert the new document into the DB
		Database.insertDocument('users', user, callback);
	});
};

Database.insertTournament = function(tournament, callback){
	Database.getDocuments('tournaments', {link: tournament.link}, function(responseDoc){
		// The user already exists, we need to update
		if(responseDoc.documents && responseDoc.documents.length == 1){
			var oldTourney = responseDoc.documents[0];
			// Set the id of the new user document to the old one so that it replaces the old user
			tournament._id = oldTourney._id;
			// Add the old list of tournaments onto the new user doc
			tournament.users = _union(oldTourney.users, tournament.users);
		}
		// Insert the new document into the DB
		Database.insertDocument('tournaments', tournament, callback);
	});
};

// All requests to the server must be POSTs so that they can pass along the credentials in the body of the request
Database._serverRequest = function(path, constructBody, onResponse){
	// Check for credentials
	if(!Database.username || !Database.password){
		if(responses){
			responses.innerHTML = 'Please verify credentials with Database.login before issuing any requests.';
		}
		return;
	}
	// Create new http request
	var http = new XMLHttpRequest();
	// Make the request a POST to path
	http.open('POST', path);
	// Set the headers for the type of content
	http.setRequestHeader("Content-type", "application/json");
	// Define what happens on response
	http.onreadystatechange = function() {
		// On valid response
		if(http.readyState == 4 && http.status == 200) {
			var doc = JSON.parse(http.responseText);
			if(doc.err){
				console.error(doc.err);
			}
			// If there exists a server-response element
			if(responses){
				// Inject the response into the element
				responses.innerHTML = JSON.stringify(doc, null, '\t');
			}
			// Give the response back to the onResponse function
			if(onResponse){
				onResponse(doc);
			}
		}
	}
	// Define the required request variables
	var body = {};
	body.credentials = {};
	body.credentials.username = this.username;
	body.credentials.password = this.password;
	// Pass the request object to the constructBody function
	if(constructBody){
		constructBody(body);
	}
	// Send the request
	http.send(JSON.stringify(body));
}

// Constructs a user document
function User(link, username, website, region, platforms, tournaments, twitter, twitch, youtube){
	var u = {};
	// TODO make a check for required info
	u.link = link;
	u.username = username;
	u.website = website;
	u.region = region;
	u.platforms = platforms;
	u.tournaments = tournaments;
	if(twitter){
		u.twitter = twitter;
	}
	if(twitch){
		u.twitch = twitch;
	}
	if(youtube){
		u.youtube = youtube;
	}
	return u;
}


// Constructs a tournament document
function Tournament(link, website, region, platform, game, title, date, entry, teamSize, teamCount, users){
	// TODO make a check for required info
	var t = {};
	t.link = link;
	t.website = website;
	t.region = region;
	t.platform = platform;
	t.game = game;
	t.title = title;
	t.date = date;
	t.entry = entry;
	t.teamSize = teamSize;
	t.teamCount = teamCount;
	t.users = users;
	t.updated = new Date(Date.now());
	return t;
}

// Combines two sets of arrays without putting in any duplicates
// Does not remove duplicates (probably should be implemented)
function _union(x, y){
	var u = [];
	for(var a of x){
		u.push(a);
	}
	for(var b of y){
		if(!u.includes(b)){
			u.push(b);
		}
	}
	return u;
}

// Constants

var Games = {};

Games.COD_MODERN_WARFARE_REMASTERED = 'Call of Duty: Modern Warfare Remastered';
Games.COD_INFINITE_WARFARE = 'Call of Duty: Infinite Warfare';
Games.COD_BLACK_OPS_3 = 'Call of Duty: Black Ops III';
Games.COD_ADVANCED_WARFARE = 'Call of Duty: Advanced Warfare';
Games.COD_GHOSTS = 'Call of Duty: Ghosts';
Games.COD_BLACK_OPS_2 = 'Call of Duty: Black Ops II';
Games.GEARS_OF_WAR_4 = 'Gears of War 4s'
Games.HALO_5 = 'Halo 5';
Games.ROCKET_LEAGUE = 'Rocket League';
Games.FIFA_17 = 'FIFA 17';
Games.RAINBOW_SIX_SIEGE = 'Rainbow Six: Siege';
Games.NBA_2K17 = 'NBA 2K17';
Games.UNCHARTED_4 = 'Uncharted 4';
Games.DISC_JAM = 'Disc Jam';
Games.POOL = '8 Ball Pool';
Games.CLASH_ROYALE = 'Clash Royale';
Games.SUPER_SMASH_BROS = 'Super Smash Bros';

var Platforms = {};

Platforms.XB1 = 'Xbox One';
Platforms.PS4 = 'Playstation 4';
Platforms.STEAM = 'Steam';
Platforms.MOBILE = 'Mobile';

var Regions = {};

Regions.NA = 'NA';
Regions.EU = 'EU';