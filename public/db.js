var Database = {};

Database.insertDocument = function(username, password, collection, doc,callback){
	var http = new XMLHttpRequest();
	http.open('POST', '/db');
	http.setRequestHeader("Content-type", "application/json");
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			var text = http.responseText;
			var dd = JSON.parse(text);
			if(dd.err){
				console.error(dd.err);
			} else {
				console.dir(JSON.stringify(dd.document));
			}
			// TODO callback();
		}
	}
	var d = {};
	d.credentials = {};
	d.credentials.username = username;
	d.credentials.password = password;
	d.collection = collection;
	d.document = doc;
	http.send(JSON.stringify(d));
};

Database.getDocumentById = function(username, password, collection, id){
	var http = new XMLHttpRequest();
	http.open('GET', '/db');
	http.setRequestHeader("Content-type", "application/json");
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			var text = http.responseText;
			var dd = JSON.parse(text);
			if(dd.err){
				console.error(dd.err);
			} else {
				console.dir(JSON.stringify(dd.document));
			}
		}
	}
	var d = {};
	d.credentials = {};
	d.credentials.username = username;
	d.credentials.password = password;
	d.collection = collection;
	d.id = id;
	console.log(JSON.stringify(d));
	http.send(JSON.stringify(d));
};

Database.getDocuments = function(username, password, collection, query){

};

Database.insertUser = function(user){
	// TODO query the database to see if the user exists
	var http = new XMLHttpRequest();
	http.open();
};

//Database.insertDocument('cmguser', 'cmgpass', 'users', {hello: 'database'});

Database.getDocumentById('cmguser', 'cmgpass', 'users', '5962d099b154432b780ccf09');

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