var gbTournament = document.getElementById('gb-tournament');
var gbFarm = document.getElementById('gb-farm');
var gbSpinner = gbFarm.nextSibling.nextSibling;
gbFarm.disabled = true;

var GB = {};

gbFarm.addEventListener('click', function(){
	// TODO make a check if the tournament already exists and only process it if the date is older than a certain amount of time
	if(!gbFarm.disabled){
		GB.processTournament(gbTournament.value);
		gbFarm.style.display = 'none';
		gbSpinner.style.display = 'block';
	}
});

Login.onSuccess.push(function(){
	gbFarm.disabled = false;
});

GB.onTournamentProcessingComplete = function(){
	console.log('Tournament successfully processed!');
	gbFarm.style.display = 'block';
	gbSpinner.style.display = 'none';
};

// Process a tournament from the given URL
GB.processTournament = function(url){
	var info = url + '/info';
	// Get tournament page
	getPage(info, function(dom){
		// Gather tournament information
		var gameTitle = GB.getGameTitle(dom);
		var platform = GB.getPlatform(dom);
		var title = GB.getTitle(dom);
		var region = GB.getRegion(dom);
		var tournamentTitle = GB.getTitle(dom);
		var date = GB.getDate(dom);
		var entry = GB.getEntry(dom);
		var teamSize = GB.getTeamSize(dom);

		// Open the teams page
		getPage(url + '/teams', function(dom){
			// Get the team links
			var teams = dom.querySelectorAll('div#StatsPanel tbody a');
			// Get a bit more information
			var teamCount = teams.length;

			// Create tournament
			var tournament = new Tournament(url, parseURL(url).host, region, platform, gameTitle, tournamentTitle, date, entry, teamSize, teamCount, []);

			// Insert tournament into DB without any users so we can get an _id
			Database.insertTournament(tournament, function(response){
				// Assign tournaments to the doc from the server to give it an _id
				tournament = response.documents[0];
				
				// Setup a count so we can keep track of when we are done processing users
				tournament.userCount = 0;
				tournament.userProcessed = 0;
				
				for(team of teams){
					GB.processTeam(team, tournament);
				}
			});
		});
	});
};

GB.processTeam = function(team, tournament){
	getPage(team.href, function(dom){
		// Build user list
		var users = dom.querySelectorAll('div.boxOuter.full.lt tbody tr td:first-child a');
		
		// Track the amount of users that are being processed
		tournament.userCount += users.length;
		
		// Process all users
		for(user of users){
			GB.processUser(user, tournament, team);
		}
	});
};

GB.processUser = function(user, tournament, team){
	getPage(user.href, function(dom){
		var username = GB.getUsername(dom);
		var website = parseURL(user.href).host;
		var region = tournament.region;
		var platforms = GB.getPlatforms(dom);
		var tournaments = [tournament._id];
		var twitter = GB.getTwitter(dom);
		var twitch = GB.getTwitch(dom);
		var youtube = GB.getYoutube(dom);
		var u = new User(user.href, username, website, region, platforms, tournaments, twitter, twitch, youtube);
		Database.insertUser(u, function(response){
			// Get the id of the user that was just inserted
			tournament.users.push(response.documents[0]._id);
			// Increment the processed users
			tournament.userProcessed++;
			// If we have processed all the users
			if(tournament.userProcessed == tournament.userCount){
				delete tournament.userProcessed;
				delete tournament.userCount;
				// Insert tournament with updated users array
				Database.insertTournament(tournament, function(response){
					GB.onTournamentProcessingComplete();
				});
			}
		});
	});
}

GB.getGameTitle = function(dom){
	var element = dom.querySelector('div.boxContent > div.smpad > ul.rules:last-child > p');
	if(element){
		return element.innerHTML.substring(18).split(" on ")[0];
	}
	return null;
};

GB.getPlatform = function(dom){
	var link = dom.querySelector('div.boxContent > a').href;
	if(link.toLowerCase().includes('xbox')){
		return Platforms.XB1;
	} else if(link.toLowerCase().includes('ps4')){
		return Platforms.PS4;
	} else if(link.toLowerCase().includes('steam')){
		return Platforms.STEAM;
	} else if(link.toLowerCase().includes('mobile')){
		return Platforms.MOBILE;
	}
	return null;
};

GB.getTitle = function(dom){
	var element = dom.querySelector('div.boxContent > div.lt > h2');
	if(element){
		return element.innerHTML;
	}
	return null;
};

GB.getDate = function(dom){
	var element = dom.querySelector('div.boxContent > div.smpad > ul.rules:nth-child(4) strong');
	var date = null;
	if(element){
		var text = element.innerHTML;
		date = new Date(text);
	}
	return date;
};

GB.getEntry = function(dom){
	var element = dom.querySelector('div.boxContent > div.lt > strong:nth-child(4)');
	if(element){
		return parseInt(element.innerHTML);
	}
	return null;
};

GB.getRegion = function(dom) {
	var element = dom.querySelector('div.boxContent > div.rt > img');
	if(element){
		if(element.src.endsWith('/1.png')){
			return Regions.NA;
		} else if(element.src.endsWith('/2.png')){
			return Regions.EU;
		}
	}
	return null;
};

GB.getTeamSize = function(dom){
	var element = dom.querySelector('div.boxContent > div.smpad > ul.rules:nth-child(6) strong');
	if(element){
		return parseInt(element.innerHTML);
	}
	return null;
};

GB.getUsername = function(dom){
	var element  = dom.querySelector('div.mlg-profile-name.ng-scope > a');
	if(element){
		return element.innerHTML;
	}
	return null;
}

GB.getPlatforms = function(dom){
	var platforms = {};
	var tags = dom.querySelectorAll('div.mlg-profile-gamertags > a');
	if(tags){
		for(tag of tags){
			if(tag.getAttribute('network-name').toLowerCase().includes('playstation')){
				platforms[Platforms.PS4] = tag.getAttribute('gamer-tag');
			} else if(tag.getAttribute('network-name').toLowerCase().includes('xbox')){
				platforms[Platforms.XB1] = tag.getAttribute('gamer-tag');
			}
		}
	}
	return platforms;
}

GB.getTwitter = function(dom){
	var element  = dom.querySelector('div.mlg-networks > span[network-url*="twitter.com"]');
	if(element){
		return element.getAttribute('network-url');
	}
	return null;
}

GB.getTwitch = function(dom){
	var element  = dom.querySelector('div.mlg-networks > span[network-url*="twitch.tv"');
	if(element){
		return element.getAttribute('network-url');
	}
	return null;
}

GB.getYoutube = function(dom){
	var element  = dom.querySelector('div.mlg-networks > span[network-url*="youtube.com"');
	if(element){
		return element.getAttribute('network-url');
	}
	return null;
}