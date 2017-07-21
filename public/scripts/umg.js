// This page will contain all of the required code to farm umggaming.com

var gameImages = {
	'2eedef2994b174a58d81ddd0edca1a7a.png': Games.COD_MODERN_WARFARE_REMASTERED,
	'893b5bf3beae503b97aa3acc30ca2cfa.png': Games.COD_INFINITE_WARFARE,
	'78c844dd952d329f80bde3f88f075ef9.png': Games.COD_BLACK_OPS_3,
	'ed642a12eacd2d54e18695e6bf364ed5.png': Games.COD_BLACK_OPS_2,
	'fc917c0164bff63740f750a820d82642.png': Games.COD_GHOSTS,
	'df26bcb91e2d6bf72b0251a70a19d6e3.png': Games.COD_ADVANCED_WARFARE,
	'fbff0a6e8b3e72e0e79a601500c941a8.png': Games.GEARS_OF_WAR_4,
	'bd5498289c2c0a1665413ab48a70820b.png': Games.HALO_5,
	'502b8c78acaaf7e60ef33ff6d640b646.png': Games.ROCKET_LEAGUE,
	'ba736aade952f2fdcc1c4bee034a1209.png': Games.FIFA_17,
	'e3edda6c8c303e66add036a28d2e5799.png': Games.RAINBOW_SIX_SIEGE,
	'2d8eeff4192ea7d47e15a15920b44cdb.png': Games.NBA_2K17,
	'08eb564277e29298cffb6be168c1800d.png': Games.UNCHARTED_4,
	'778038c955d14664af0624c49f5bcfc5.png': Games.DISC_JAM,
	'05f076c88bbaefea1580c9cd7bb4c3fd.png': Games.POOL,
	'fabb4640ebd079c6af2abf85daa211ff.png': Games.CLASH_ROYALE,
	'7f9b33f6096621aaaa3365b322c40dc4.png': Games.SUPER_SMASH_BROS
};

var umgTournament = document.getElementById('umg-tournament');
var umgFarm = document.getElementById('umg-farm');
var umgSpinner = umgFarm.nextSibling.nextSibling;
umgFarm.disabled = true;

umgFarm.addEventListener('click', function(){
	// TODO make a check if the tournament already exists and only process it if the date is older than a certain amount of time
	if(!umgFarm.disabled){
		UMG.processTournament(umgTournament.value);
		umgFarm.style.display = 'none';
		umgSpinner.style.display = 'block';
	}
});

Login.onSuccess.push(function(){
	umgFarm.disabled = false;
});

var UMG = {};

UMG.onTournamentProcessingComplete = function(){
	console.log('Tournament successfully processed!');
	umgFarm.style.display = 'block';
	umgSpinner.style.display = 'none';
};

// Process a tournament from the given URL
UMG.processTournament = function(url){
	// Get tournament page
	getPage(url, function(dom){
		// Gather tournament information
		var gameTitle = UMG.getGameTitle(dom);
		var platform = UMG.getPlatform(dom);
		var title = UMG.getTitle(dom);
		var region = UMG.getRegion(dom);
		var tournamentTitle = UMG.getTitle(dom);
		var date = UMG.getDate(dom);
		var teamSize = UMG.getTeamSize(dom);

		// Open the teams page
		getPage(url + '/teams', function(dom){
			// Get the team links
			var teams = dom.querySelectorAll('table#leaderboard-table tbody a');
			// Get a bit more information
			var teamCount = teams.length;

			// Create tournament
			var tournament = new Tournament(url, parseURL(url).host, region, platform, gameTitle, tournamentTitle, date, teamSize, teamCount, []);

			// Insert tournament into DB without any users so we can get an _id
			Database.insertTournament(tournament, function(response){
				// Assign tournaments to the doc from the server to give it an _id
				tournament = response.documents[0];
				
				// Setup a count so we can keep track of when we are done processing users
				tournament.userCount = 0;
				tournament.userProcessed = 0;
				
				for(team of teams){
					UMG.processTeam(team, tournament);
				}
			});
		});
	});
};

UMG.processTeam = function(team, tournament){
	getPage(team.href, function(dom){
		// Build user list
		var table = dom.querySelector('div.table-responsive');
		var users = table.querySelectorAll('tbody tr td a.strong');
		
		// Track the amount of users that are being processed
		tournament.userCount += users.length;
		
		// Process all users
		for(user of users){
			UMG.processUser(user, tournament, team);
		}
	});
};

UMG.processUser = function(user, tournament, team){
	getPage(user.href, function(dom){
		var username = UMG.getUsername(dom);
		var website = parseURL(user.href).host;
		var region = tournament.region;
		var platforms = UMG.getPlatforms(dom);
		var tournaments = [tournament._id];
		var twitter = UMG.getTwitter(dom);
		var twitch = UMG.getTwitch(dom);
		var youtube = UMG.getYoutube(dom);
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
					UMG.onTournamentProcessingComplete();
				});
			}
		});
	});
}

UMG.getGameTitle = function(dom){
	var text = dom.querySelector('div.tournament-image > div').getAttribute('style');
	for(var key in gameImages){
		if(text.includes(key)){
			return gameImages[key];
		}
	}
	return null;
};

UMG.getPlatform = function(dom){
	var text = dom.querySelector('div.col-sm-10 div.col-sm-12').innerHTML;
	if(text.toLowerCase().includes('xbox')){
		return Platforms.XB1;
	} else if(text.toLowerCase().includes('ps4')){
		return Platforms.PS4;
	} else if(text.toLowerCase().includes('steam')){
		return Platforms.STEAM;
	} else if(text.toLowerCase().includes('mobile')){
		return Platforms.MOBILE;
	}
	return null;
};

UMG.getTitle = function(dom){
	var title = dom.querySelectorAll('col-cm-6 > h2');
	if(title){
		return title.innerHTML;
	}

	return null;
};

UMG.getDate = function(dom){
	var element = dom.querySelector('div.container div.row div.row ul:nth-child(2) li:nth-child(2) p span');
	var date = null;
	if(element){
		var text = element.innerHTML;
		var d = text.match(/\d+/g);
		var month = parseInt(d[0] - 1);
		var day = parseInt(d[1]);
		var year = parseInt(d[2]) + 2000;
		var hour = parseInt(d[3]);
		var minute = parseInt(d[4]);
		if(text.toLowerCase().includes('pm')){
			hour += 12;
		}
		date = new Date(year, month, day, hour, minute);
	}
	return date;
};

UMG.getRegion = function(dom) {
	var element = dom.querySelector('div.col-sm-6 > ul > li');
	if(element){
		if(element.innerHTML.toLowerCase().includes('usa')){
			return Regions.NA;
		} else if(element.innerHTML.toLowerCase().includes('europe')){
			return Regions.EU;
		}
	}
	return null;
};

UMG.getTeamSize = function(dom){
	var element = dom.querySelector('div.col-sm-10 > div.row > ul:nth-child(3) > li:nth-child(2) span');
	if(element){
		return element.innerHTML;
	}
	return null;
};

UMG.getUsername = function(dom){
	var element  = dom.querySelector('div.col-sm-6 > h2');
	if(element){
		return element.innerHTML.replace(/\r?\n|\r| |\t/g, '');
	}
	return null;
}

UMG.getPlatforms = function(dom){
	var element  = dom.querySelector('div.col-sm-6 > ul:nth-child(3)');
	if(element){
		var platforms = {};
		if(element.innerHTML.includes('xbox')){
			var gt = element.querySelector('li > i[class*="xbox"]').nextSibling.textContent.substring(1);
			platforms[Platforms.XB1] = gt;
		}
		if(element.innerHTML.includes('ps4')){
			var gt = element.querySelector('li > i[class*="ps4"]').nextSibling.textContent.substring(1);
			platforms[Platforms.PS4] = gt;
		}
		return platforms;
	}
	return {};
}

UMG.getTwitter = function(dom){
	var element  = dom.querySelector('div.col-sm-6 > ul:nth-child(2) a[href*="twitter.com"]');
	if(element){
		return element.href;
	}
	return null;
}

UMG.getTwitch = function(dom){
	var element  = dom.querySelector('div.col-sm-6 > ul:nth-child(1) a[href*="twitch.tv"]');
	if(element){
		return element.href;
	}
	return null;
}

UMG.getYoutube = function(dom){
	var element  = dom.querySelector('div.col-sm-6 > ul:nth-child(1) a[href*="youtube.com"]');
	if(element){
		return element.href;
	}
	return null;
}