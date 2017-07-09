// Dependencies 
var MongoClient = require('mongodb').MongoClient;
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
app.get('/db/*', (req, res) => {
	var collection = req.path.split('/');
	collection = collection[collection.length - 1];
	MongoClient.connect(DATABASE_URL, function(err, db) {
		if (err) throw err;
		getEntriesForHTML(collection, db, req, res);
	});
	// TODO check if exists 
});

app.post('/db/*', (req, res) => {
	var collection = req.path.split('/');
	collection = collection[collection.length - 1];
	console.log('POST request recieved for: ' + collection);
	// Get info from request
	var body = '';
	req.on('data', (chunk) => {
		body += chunk;
	}).on('end', () => {
		var doc = JSON.parse(body);
		console.log(doc);
		if(doc._user == dbUsername && doc._pass == dbPassword){
			MongoClient.connect(DATABASE_URL, function(err, db) {
				if (err) throw err;
				var col = db.collection(collection);
				col.insertOne(doc);
				res.end('Successful insertion');
				db.close();
			});
		} else {
			res.end('Invalid credentials');
		}
		// Send things back to client
	});
});

// Get all entries for the given collection, stringify them, and add <br>s between them
function getEntriesForHTML(collection, db, req, res){
	var col = db.collection(collection);
	var allUsers = col.find({}, {_id: 0, _user: 0, _pass: 0}).toArray(function(err, items) {
		if (err) throw err;
		var responseText = '';
		for(item of items){
			responseText += '<p>';
			responseText += JSON.stringify(item);
			responseText += '</p>';
		}
		if(items.length == 0){
			res.send('No entries');
		} else {
			res.send(responseText);
		}
		db.close();
	});
}

// Remove all entries from the given collection
function deleteAllEntries(collection){
	MongoClient.connect(DATABASE_URL, function(err, db) {
		if (err) throw err;
		var col = db.collection(collection);
		col.deleteMany();
		db.close();
	});
}

//deleteAllEntries('users');
//deleteAllEntries('user');

// Setup static routes for webserver
app.use(express.static('public'));

// Start webserver on given port
app.listen(port, () => {
	console.log('Webserver listening on ' + port);
});