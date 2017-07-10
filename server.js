// Dependencies 
var util = require('util');
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

// The POST node to insert data to the database
app.post('/db', (req, res) => {
	// Piece together req body
	var body = '';
	req.on('data', (chunk) => {
		body += chunk;
	}).on('end', () => {
		// Parse req body into object
		var reqDoc = JSON.parse(body);
		// Connect to db with given credentials
		MongoClient.connect(getDatabaseURL(reqDoc.credentials.username, reqDoc.credentials.password), (err, db) => {
			if (err) {
				// Send back any error messages
				res.send({err: err.message, document: reqDoc.document});
				console.log('Invalid authentication (POST): ' + util.inspect(reqDoc.credentials));
			} else {
				var col = db.collection(reqDoc.collection);
				col.insertOne(reqDoc.document);
				// Ping back the document received
				res.send({document: reqDoc.document});
				db.close();
			}
		});
	});
});

// The GET node to aqquire information from our database
app.get('/db', (req, res) => {
	var body = '';
	req.on('data', (chunk) => {
		body += chunk;
	}).on('end', () => {
		console.log(body);
		var reqDoc = JSON.parse(body);
		MongoClient.connect(getDatabaseURL(reqDoc.credentials.username, reqDoc.credentials.password), (err, db) => {
			if (err) {
				// Send back any error messages
				res.send({info: err.message, document: reqDoc.document});
				console.log('Invalid authentication (GET): ' + util.inspect(reqDoc.credentials));
			} else {
				var col = db.collection(reqDoc.collection);
				if(reqDoc.id){
					// return object with given id
					// TODO
					var result = col.findOne({_id:reqDoc.id});
					console.log(result);
				} else if(reqDoc.query){
					// return a list of query results
					// TODO
				}
				db.close();
			}
		});
	});
});

// TODO restful get nodes for viewing the database


// Get all entries for the given collection, stringify them, and add <br>s between them
function getEntriesForHTML(collection, db, req, res){
	var col = db.collection(collection);
	var allUsers = col.find({}, {_user: 0, _pass: 0}).toArray(function(err, items) {
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


function getDatabaseURL(username, password){
	return 'mongodb://' + username + ':' + password + '@localhost:27017/' + DATABASE;
}