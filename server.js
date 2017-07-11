// Dependencies 
var util = require('util');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var express = require('express');
var app = express();
var port = 3000;

// Database information
var DATABASE = 'gorilla';

var collections = ['users', 'tournaments'];

// The node for inserting documents, as well as retreiving them with authentication
app.post('/db/:collection/', (req, res) => {
	if(collections.includes(req.params.collection)){
		var body = '';
		req.on('data', (chunk) => {
			body += chunk;
		}).on('end', () => {
			// Parse req body into object
			var reqDoc = JSON.parse(body);
			MongoClient.connect(getDatabaseURL(reqDoc.credentials.username, reqDoc.credentials.password), (err, db) => {
				if (err) {
					res.send(generateResponse([], err));
					return;
				}
				if(reqDoc.query){
					var query = reqDoc.query;
					if(query._id){
						// Convert any instances of _id to ObjectID so they work correctly
						query._id = ObjectID(query._id);
					}
					db.collection(req.params.collection).find(query).toArray((err, docs) => {
						if (err) {
							res.send(generateResponse([], err));
							return;
						}
						res.send(generateResponse([docs]));
					});
				} else if(reqDoc.document){
					if(reqDoc.document._id){
						reqDoc.document._id = ObjectID(reqDoc.document._id);
						db.collection(req.params.collection).replaceOne({_id: reqDoc.document._id},reqDoc.document);
					} else {
						db.collection(req.params.collection).insertOne(reqDoc.document);
					}
					res.send(generateResponse([reqDoc.document]));
				}
				db.close();
			});
		});
	} else {
		res.send(generateResponse([],'Invalid collection'));
	}
});

function generateResponse(documents, err){
	var responseObject = {};
	responseObject.documents = documents;
	if(err){
		responseObject.err = err;
	}
	return JSON.stringify(responseObject);
}

// Remove all entries from the given collection
// TODO create a way of exposing this to werver request with proper response
function deleteAllEntries(username, password, collection){
	MongoClient.connect(getDatabaseURL(username, password), (err, db) => {
		if (err) throw err;
		var col = db.collection(collection);
		col.deleteMany();
		db.close();
	});
}

// Setup static routes for webserver
app.use(express.static('public'));

// Start webserver on given port
app.listen(port, () => {
	console.log('Webserver listening on ' + port);
});


function getDatabaseURL(username, password){
	return 'mongodb://' + username + ':' + password + '@localhost:27017/' + DATABASE;
}