// Dependencies 
const http = require('http');
const https = require('https');
const util = require('util');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const express = require('express');
const app = express();
const port = 3000;


// Database information
var DATABASE = 'gorilla';

var collections = ['users', 'tournaments'];

app.post('/html', (req, res) => {
	var body = '';
	req.on('data', (chunk) => {
		body += chunk;
	}).on('end', () => {
		var reqDoc = JSON.parse(body);
		if(!reqDoc.url){
			res.send('Invalid url');
			return;
		}
		var u = reqDoc.url.split('/');
		var host = u[2];
		var end = u.slice(3, u.length);
		var p = '';
		for(part of end){
			p += '/' + part
		}
		var options = {
			host: host,
			path: p,
			headers: {'User-Agent':'javascript'}
			//headers: {'User-Agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0'}
		};
		var protocol = (u[0] == 'http' ? http : https);
		protocol.get(options, (r) => {
			var body = '';
			r.on('data', (chunk) => {
				body += chunk;
			}).on('end', () => {
				res.send(body);
			});
		});
	});
});

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
				// TODO if reqDoc.delete
				if(reqDoc.query){
					var query = reqDoc.query;
					if(query._id){
						// Convert any instances of _id to ObjectID so they work correctly
						query._id = ObjectID(query._id);
					}
					db.collection(req.params.collection).find(query).toArray((err, docs) => {
						if (err) {
							res.send(generateResponse([], err));
							db.close()
							return;
						}
						res.send(generateResponse(docs));
						db.close()
					});
				} else if(reqDoc.document){
					if(reqDoc.document._id){
						// Replace old document with new one
						reqDoc.document._id = ObjectID(reqDoc.document._id);
						db.collection(req.params.collection).replaceOne({_id: reqDoc.document._id},reqDoc.document);
						db.close();
					} else {
						// Insert new document and have ID generated
						db.collection(req.params.collection).insertOne(reqDoc.document);
						db.close();
					}
					res.send(generateResponse([reqDoc.document]));
				}
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

//deleteAllEntries('cmguser', 'cmgpass', 'users');
//deleteAllEntries('cmguser', 'cmgpass', 'tournaments');

// Setup static routes for webserver
app.use(express.static('public'));

// Start webserver on given port
app.listen(port, () => {
	console.log('Webserver listening on ' + port);
});


function getDatabaseURL(username, password){
	return 'mongodb://' + username + ':' + password + '@localhost:27017/' + DATABASE;
}