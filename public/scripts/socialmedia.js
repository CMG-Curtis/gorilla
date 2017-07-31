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
