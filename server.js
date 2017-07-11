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
					res.send(JSON.stringify(err));
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
							res.send(JSON.stringify(err));
							return;
						}
						res.send(JSON.stringify(docs));
						db.close();
					});
				} else if(reqDoc.document){
					if(reqDoc.document._id){
						reqDoc.document._id = ObjectID(reqDoc.document._id);
						// TODO Replace old document
					} else {
						// TODO insert new document
						// TODO check if inserting a document with the same id overrides it anyway
					}
				}
			});
		});
	} else {
		res.send('Invalid collection');
	}
});

// Remove all entries from the given collection
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