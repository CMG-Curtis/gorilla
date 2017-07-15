// This page will contain all of the required code to farm umggaming.com

var umgTournament = document.getElementById('umg-tournament');
var umgFarm = document.getElementById('umg-farm');

umgFarm.addEventListener('click', function(){
	processUmgTournament(umgTournament.value);
});

// Process a tournament from the given URL
function processUmgTournament(url){
	// TODO get tournament information first
	
	// Get tournament page
	getPage(url, function(dom){
		// Get the team links
		var teams = dom.querySelectorAll('table#leaderboard-table tbody a');

		for(team of teams){
			console.log(team.href);
			getPage(team.href, function(dom){
				console.log(dom);
			});
		}
	});
}