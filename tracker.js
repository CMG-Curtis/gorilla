// Responsible for keeping track of tournaments and scheduling when to scrape them

// TODO scraper.js probably needs to be fleshed out before attacking this

const gethtml = require('./gethtml');

var gb = "http://gamebattles.majorleaguegaming.com/tournaments?mlg_source=header";
var umg = "https://umggaming.com/tournaments";

var tracker = {};

tracker.start = function(){
	// call update every hour
	// 1 hour: 36000000
	setInterval(update, 3600000);
	update();
}

function update(){
	// TODO update tournaments
	
}

module.exports = function(){
	console.log('Initializing tracker');
	return tracker;
};