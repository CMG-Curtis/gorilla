// Provides a simple interface to the database for the server

const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://cmguser:cmgpass@localhost:27017/gorilla';
const USERS = 'users';
const TOURNAMENTS = 'tournaments';
var database = null;

var databaseModule = {};

// Adds a user to the database, or updates them if they already exist
databaseModule.upsertUser = function(url, website, username, region, platforms, tournaments, games, twitter, twitch, youtube){
	// Check all required arguments for null
	for (var i = 0; i < arguments.length - 3; i++) {
		if (arguments[i] == null) throw 'null values in user!';
	}
	// Check arrays are arrays
	if (platforms.constructor !== Array) throw 'platforms is not an Array!';
	if (tournaments.constructor !== Array) throw 'tournaments is not an Array!';
	if (games.constructor !== Array) throw 'games is not an Array!';
	// Get the user if it exists
	database.collection(USERS).find({ _id: url }).toArray((err, docs) => {
		if (err) { throw err; db.close(); };
		var user = {};
		if(docs.length == 1){
			user = docs[0];
			// Append lists to update user
			for(platform of platforms){
				if (!user.platforms.includes(platform)) platforms.push(platform);
			}
			user.platforms = platforms;
			for(tournament of tournaments){
				if (!user.tournaments.includes(tournament)) tournaments.push(tournament);
			}
			user.tournaments = tournaments;
			for(game of games){
				if (!user.games.includes(game)) games.push(game);
			}
			user.games = games;
		} else {
			// Fill in information for new user
			user._id = url;
			user.website = website;
			user.username = username;
			user.region = region;
			user.platforms = platforms;
			user.tournaments = tournaments;
			user.games = games;
		}
		// Update social media
		if (twitter) user.twitter = twitter;
		if (twitch) user.twitch = twitch;
		if (youtube) user.youtube = youtube;
		// Update last updated
		user.updated = new Date(Date.now());
		// Update the user in the db
		db.collection(USERS).update({ _id: url }, user, { upsert: true });
		db.close();
	});
};

databaseModule.upsertTournament = function(url, website, title, region, platform, date, game, entryFee, teamSize, teamCount, users){
	// Check db
	if (db == null) throw 'DB not initialized yet!';
	// Check all required arguments for null
	for (var i = 0; i < arguments.length; i++) {
		if (arguments[i] == null) throw 'null values in tournament!';
	}
	// Check arrays are arrays
	if (users.constructor !== Array) throw 'users is not an Array!';
	// Get the tournament if it exists
	database.collection(TOURNAMENTS).find({ _id: url }).toArray((err, docs) => {
		if (err) { throw err; db.close(); };
		var tourney = {};
		if(docs.length == 1){
			tourney = docs[0];
			// Append lists to update tourney
			for(user of users){
				if (!tourney.users.includes(user)) users.push(user);
			}
			tourney.users = users;
		} else {
			// Fill in information for new tourney
			tourney._id = url;
			tourney.website = website;
			tourney.title = title;
			tourney.region = region;
			tourney.platform = platform;
			tourney.date = date;
			tourney.game = game;
			tourney.entryFee = entryFee;
			tourney.teamSize = teamSize;
			tourney.teamCount = teamCount;
			tourney.users = users;
		}
		// Update last updated
		tourney.updated = new Date(Date.now());
		// Update the user in the db
		db.collection(TOURNAMENTS).update({ _id: url }, tourney, { upsert: true });
		db.close();
	});
};

databaseModule.deleteAllEntries = function(collection){
	database.collection(collection).deleteMany();
};

module.exports = function(){
	// Init code
	console.log('Initializing database connection');
	// Connect to database
	MongoClient.connect(MONGO_URL, (err, db) => {
		if (err) throw err;
		db = db;
	});
	return databaseModule;
};

/*

Documents:

User {
	_id (url)
	website
	username
	region
	platforms[]
	tournaments[]
	games[]
	twitter
	twitch
	youtube
	updated
}

Tournament {
	_id (url)
	website
	title
	region
	platform
	date
	game
	entryFee
	teamSize
	teamCount
	users[]
	updated
}

*/