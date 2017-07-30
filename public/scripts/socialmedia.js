// This file will contain the functions for finding out information from social outlets

var Twitter = {};

// Passes back the amount of followers from a given twitter page
Twitter.getFollowers = function(url, callback){
	getPage(url, function(html){
		var element = html.querySelector('input.json-data');
		if(!element){
			callback(-1);
			return;
		}
		var data = JSON.parse(element.value);
		if(data){
			if(!data.profile_user){
				callback(-1);
				return;
			}
			callback(data.profile_user.followers_count);
		} else {
			callback(-1);
		}
	});
};

var twitterQuery = document.getElementById('twitter');
var twitterQueryFilter = document.getElementById('twitterFollwersFilter');

var results = document.getElementById('results');

twitterQuery.addEventListener('click', function(){
	results.innerHTML = '';
	Database.getDocuments('users', { "twitter" : { "$exists" : true } }, function(res){
		var len = res.documents.length;
		res.documents.forEach(function(listItem, index){
			Twitter.getFollowers(listItem.twitter, function(followers){
				if(followers > twitterQueryFilter.value){
					var splitting = listItem.twitter.split('/');
					var handle = splitting[splitting.length - 1];
					results.innerHTML += '<a target="_blank" href="' + listItem.twitter + '">' + followers  + ' : ' + handle + '</a>';
				}
				if(index == len - 1){
					results.innerHTML += '<p>Done.</p>'
				}
			});
		});
	});
});
