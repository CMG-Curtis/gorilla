
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


var euQuery = document.getElementById('euquery');

euQuery.addEventListener('click', function(){
	results.innerHTML = '';
	var tableElement = document.createElement('table');
	var table = '';
	table += '<tr>';
	table += '<th>Profile link</th>';
	table += '<th>Twitter</th>';
	table += '<th>XBL</th>';
	table += '<th>PSN</th>';
	table += '</tr>';
	Database.getDocuments('users', { "region" : "EU" }, function(res){
		var len = res.documents.length;
		res.documents.forEach(function(listItem, index){
			table += '<tr>';
			table += '<td>' + '<a href="' + listItem.link + '">' + listItem.username + '</a></td>';
			if(listItem.twitter){
				table += '<td>' + '<a href="' + listItem.twitter + '">' + listItem.twitter + '</a></td>';
			} else {
				table += '<td></td>';
			}
			if(listItem.platforms['Xbox One']){
				table += '<td>' + listItem.platforms['Xbox One'] + '</td>';
			} else {
				table += '<td></td>';
			}
			if(listItem.platforms['Playstation 4']){
				table += '<td>' + listItem.platforms['Playstation 4'] + '</td>';
			} else {
				table += '<td></td>';
			}
			table += '</tr>';
			if(index == len - 1){
				tableElement.innerHTML = table;
				results.appendChild(tableElement);
			}
		});
	});
});