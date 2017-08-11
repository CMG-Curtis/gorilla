// Controls all of the modules and code for actually scraping website info and putting it into the database

// TODO come up with a way to control scraper modules

// TODO keep in mind that some of these scrapes will require multiple requests for each piece of information sometimes (use a callback chain? maybe promises)

// TODO cheerio

// TODO import cheerio and gethtml here

// Each scraper module file will be pretty dumb, it will basically outline functions that will be called here with real information

const URL = require('URL');

const database = require('./database');

var scraper = {};

// For scraping the page on the website that has a list of tournaments
scraper.scrapeTournaments = function(url){
	var u = URL.parse(url);
	// TODO scrape the listing of tournaments
};

// For scraping information from a tournament page
scraper.scrapeTournament = function(url){
	var u = URL.parse(url);
	// TODO scrape the information from a tournament
};

// For scraping information from a users page
scraper.scrapeUser = function(url){
	var u = URL.parse(url);
	// TODO scrape the information from a user
};

module.exports = scraper;