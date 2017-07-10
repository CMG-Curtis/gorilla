var Database = {};

var usernameField = document.getElementById('username');
var passwordField = document.getElementById('password');
var stat = document.getElementById('status');

var testButton = document.getElementById('testButton');

var USERS_COLLECTION = 'users';
var TOURNAMENTS_COLLECTION = 'tournaments';

Database.users = USERS_COLLECTION;
Database.tournaments = TOURNAMENTS_COLLECTION;
Database.post = postToDB;

testButton.addEventListener('click', function(){
	postToDB('users', {number: Math.random()});
});


function postToDB(collection, doc){
	var http = new XMLHttpRequest();
	http.open('POST', '/db/' + collection, true);
	http.setRequestHeader("Content-type", "text/plain");
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			var text = http.responseText;
			stat.innerHTML = text;
			console.log(text);
		}
	}
	doc._user = usernameField.value;
	doc._pass = passwordField.value;
	http.send(JSON.stringify(doc));
}

// This should only be called by insertTrounament
function insertUser(u){
	// TODO check if that user already exists by looking for an entry with same username and website and update that entry if it already exists
}

function insertTournament(t){
	// TODO check all users 
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