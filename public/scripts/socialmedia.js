// This file will contain the functions for finding out information from social outlets

var Twitter = {};

// Passes back the amount of followers from a given twitter page
Twitter.getFollowers = function(url, callback){
	getPage(url, function(html){
		var data = JSON.parse(html.querySelector('input.json-data').value);
		callback(data.profile_user.followers_count);
	});
};

// Tesing of twitter getFollowers stuff
Database.login('cmguser', 'cmgpass');

Database.getDocuments('users', { "twitter" : { "$exists" : true } }, function(res){
	console.log(res.documents[0].twitter);
	Twitter.getFollowers(res.documents[0].twitter);
	for(doc of res.documents){
		//console.log(doc.twitter);
	}
});