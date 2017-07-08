var MongoClient = require('mongodb').MongoClient;

var dbUsername = 'cmguser';
var dbPassword = 'cmgpass';

var DATABASE = 'gorilla';

var DATABASE_URL = 'mongodb://' + dbUsername + ':' + dbPassword + '@localhost:27017/' + DATABASE;

var USER_TABLE = 'users';
var TOURNAMENTS_TABLE = 'tournaments';

MongoClient.connect(DATABASE_URL, function(err, db) {
	if (err) throw err;

	console.log('Successfully connected to DB: ' + DATABASE);

	db.createCollection(USER_TABLE, function(err, res) {
		if (err) throw err;
		console.log('Table: ' + USER_TABLE + ' created!');
	});

	db.createCollection(TOURNAMENTS_TABLE, function(err, res) {
		if (err) throw err;
		console.log('Table: ' + TOURNAMENTS_TABLE + ' created!');
	});

	var users = db.collection(USER_TABLE);
	var tournaments = db.collection(TOURNAMENTS_TABLE);

	// TODO get users

	db.close();
});



/*
Documents:
user {
	_id: <id>,
	website: <website>,
	region: <region>,
	platforms: [<platform>],
	tournaments: [tournament._id], // Figure this out
	twitter: {username: <handle>, followers: <followers>},
	twitch: {username: <username>, followers: <followers>},
	youtube: {username: <username>, subscribers: <subscribers>}
}

tournament {
	_id: <id>,
	website: <website>,
	region: <region>,
	platform: <platform>,
	game: <game>,
	date: <date (including time)>,
	details: <specialized tournament info>,
	teamSize: <team size>,
	teamCount: <team count>,
	users: [user._id] // Figure this out
}
*/

// db.createUser({user:'cmguser',pwd:'cmgpass',roles:[{role:'readWrite',db:'gorilla'}]})

/*
// HTTP request
var http = require('http');

var host = "gamebattles.majorleaguegaming.com";
var path = "/mobile/miniclip-8-ball-pool/tournament/1v1-miniclip-8-ball-07-06/teams";

var options = {
	host: host,
	port: 80,
	path: path,
	headers: {'User-Agent':'javascript'}
};

http.get(options, function(res) {
	console.log("Got response: " + res.statusCode);
	res.setEncoding('utf8');
	res.on('data', (chunk) => {
		console.log(chunk);
	});
}).on('error', function(e) {
	console.log("Got error: " + e.message);
});

*/

/*

// Create table "users"
MongoClient.connect(url, function(err, db) {
	if (err) throw err;
	db.createCollection("users", function(err, res) {
		if (err) throw err;
		console.log("Table created!");
		db.close();
	});
});

*/


/*
// Insert a user to db
MongoClient.connect(url, function(err, db) {
	if (err) throw err;
	var user = {website: "umggaming.com", username: "1337skillz", platform: ["XBOX ONE", "PS4"], games: ["MWR", "BO3"]};
	var userTable = db.collection('users');
	userTable.insertOne(user, (err, res) => {
		if (err) throw err;
		console.log('1 record inserted');
		db.close();
	});
});

*/
