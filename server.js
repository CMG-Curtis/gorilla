// NPM modules
const express = require('express');
const app = express();
const port = 3000;

// Local modules
const database = require('./database')();
const gethtml = require('./gethtml');
const tracker = require('./tracker');

// Database information
var DATABASE = 'gorilla';

var collections = ['users', 'tournaments'];

app.post('/html', (req, res) => {
	// Parse request
	var body = '';
	req.on('data', (chunk) => { body += chunk; });
	req.on('end', () => {
		var reqDoc = JSON.parse(body);
		// Check if the request contains the URL
		if(!reqDoc.url){
			res.send('Invalid url');
			return;
		}
		// Send back the html of the page
		gethtml(reqDoc.url, (html) => {
			res.send(html);
		});
	});
});

// The node for inserting documents, as well as retreiving them with authentication
app.post('/db/', (req, res) => {
	// Chunk together request body
	var body = '';
	req.on('data', (chunk) => { body += chunk; });
	req.on('end', () => {
		// Parse body from JSON object
		var reqDoc = JSON.parse(body);
		if(!reqDoc.collection || !collections.includes(reqDoc.collection)){
			res.send(generateResponse([],'Invalid collection'));
		}
		// Connect to database
		MongoClient.connect(getDatabaseURL(reqDoc.credentials.username, reqDoc.credentials.password), (err, db) => {
			// Send back the error object
			if (err) {
				res.send(generateResponse([], err));
				return;
			}
			if(reqDoc.query){ // If there is a query
				var query = reqDoc.query;
				// Convert any instances of _id to ObjectID so they work correctly
				if(query._id){
					query._id = ObjectID(query._id);
				}
				// Open the collection
				db.collection(reqDoc.collection).find(query).toArray((err, docs) => {
					if (err) {
						res.send(generateResponse([], err));
						db.close()
						return;
					}
					res.send(generateResponse(docs));
					db.close()
				});
			} else if(reqDoc.document){ // If there is a document attatched
				if(reqDoc.document._id){
					// Replace old document with new one
					reqDoc.document._id = ObjectID(reqDoc.document._id);
					db.collection(reqDoc.collection).replaceOne({_id: reqDoc.document._id},reqDoc.document);
					db.close();
				} else {
					// Insert new document and have ID generated
					db.collection(reqDoc.collection).insertOne(reqDoc.document);
					db.close();
				}
				// Pings back the document inserted
				res.send(generateResponse([reqDoc.document]));
			}
		});
	});
});

// Generate a response
function generateResponse(documents, err){
	var responseObject = {};
	responseObject.documents = documents;
	if(err){
		responseObject.err = err;
	}
	return JSON.stringify(responseObject);
}

// Setup static routes for webserver
app.use(express.static('public'));

// Start webserver on given port
app.listen(port, () => {
	console.log('Webserver listening on ' + port);
});

// Start tournament tracking
tracker.start();