var MongoClient = require('mongodb').MongoClient;
var stringify = require('json-stringify');

var express = require('express');
var app = express();

var dbUsername = 'cmguser';
var dbPassword = 'cmgpass';

var DATABASE = 'gorilla';

var DATABASE_URL = 'mongodb://' + dbUsername + ':' + dbPassword + '@localhost:27017/' + DATABASE;

var USER_TABLE = 'users';
var TOURNAMENTS_TABLE = 'tournaments';

var port = 3000;

// Page for viewing raw users
app.get('/db/' + USER_TABLE, (req, res) => {
	MongoClient.connect(DATABASE_URL, function(err, db) {
		if (err) throw err;
		var users = db.collection(USER_TABLE);
		var allUsers = users.find({}).toArray(function(err, items) {
			if (err) throw err;
			var responseText = '';
			for(item of items){
				responseText += stringify(item);
				responseText += '<br>';
			}
			if(items.length == 0){
				res.send('No entries');
			} else {
				res.send(responseText);
			}
			db.close();
		});
	});
});

// Page for viewing raw tournaments
app.get('/db/' + TOURNAMENTS_TABLE, (req, res) => {
	MongoClient.connect(DATABASE_URL, function(err, db) {
		if (err) throw err;
		var tournaments = db.collection(TOURNAMENTS_TABLE);
		var allTournaments = tournaments.find({}, { _id: false }).toArray(function(err, items) {
			if (err) throw err;
			var responseText = '';
			for(item of items){
				responseText += stringify(item);
				responseText += '<br>';
			}
			if(items.length == 0){
				res.send('No entries');
			} else {
				res.send(responseText);
			}
			db.close();
		});
	});
});


MongoClient.connect(DATABASE_URL, function(err, db) {
	if (err) throw err;
	var users = db.collection(USER_TABLE);
	/*
	// Delete all users
	users.deleteMany();
	// Insert some random data for testing
	for(var i = 0; i < 20; i++){
		users.insertOne({number:Math.random()}, (err, res) => {
			if(err) throw err;
			console.log('inserted something');
		});
	}
	*/
	db.close();
});


app.use(express.static('public'));

app.listen(port, () => {
	console.log('Webserver listening on ' + port);
});