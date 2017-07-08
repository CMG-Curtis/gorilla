// Dependencies 
var MongoClient = require('mongodb').MongoClient;
var stringify = require('json-stringify');
var express = require('express');
var app = express();
var port = 3000;

// Login information for server
var dbUsername = 'cmguser';
var dbPassword = 'cmgpass';

// Database information
var DATABASE = 'gorilla';
var DATABASE_URL = 'mongodb://' + dbUsername + ':' + dbPassword + '@localhost:27017/' + DATABASE;

// Collections on the databse
var USERS_COLLECTION = 'users';
var TOURNAMENTS_COLLECTION = 'tournaments';

// Page for viewing raw collections from the database
app.get('/db/' + USERS_COLLECTION, (req, res) => {
	var collection = req.path.split('/');
	collection = collection[collection.length - 1];
	getEntriesForHTML(USERS_COLLECTION, req, res);
});

// Get all entries for the given collection, stringify them, and add <br>s between them
function getEntriesForHTML(collection, req, res){
	MongoClient.connect(DATABASE_URL, function(err, db) {
		if (err) throw err;
		var users = db.collection(collection);
		var allUsers = users.find({}, {_id: 0}).toArray(function(err, items) {
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
}

// Remove all entries from the given collection
function deleteAllEntries(collection){
	MongoClient.connect(DATABASE_URL, function(err, db) {
		if (err) throw err;
		var collection = db.collection(collection);
		collection.deleteMany();
		db.close();
	});
}

// Setup static routes for webserver
app.use(express.static('public'));

// Start webserver on given port
app.listen(port, () => {
	console.log('Webserver listening on ' + port);
});