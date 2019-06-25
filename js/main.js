/*  
	main.js
	03/25/13
	author: Rob Acheson

*/

/* love this! */
function dumpObject(o) {
	out = "";
	for (i in o) {
		out += i +":" + o[i] +"\n";
	}
	alert(out);
}

/* default film object */
function Film() {
	this.title = "";
	this.ratings = 0;
	this.rank = 0;
	this.views = 0;
	this.siteNames = {};
}

/* default site object */
function Site() {
	this.name = "";
	this.country = "";
	this.lat = "";
	this.lon = "";
	this.views = 0;
}

/* dictionary of sites by name - Becomes an array sorted alphabetically after parse */
var sites = {};

var totalViews = 0;
var totalRatings = 0;
var maxViews = 0;
var	maxRatings = 0;
var shouldParse = true;

function updateViews() {
	updateMap();
	updateScatter();
	updateBar();
}

// load and parse country code lookup JSON
// JSON data courtesy of https://github.com/lukes/ISO-3166-Countries-with-Regional-Codes
var countryList;
d3.json("data/slim-3.json", countryListComplete);
function countryListComplete(d) {
	countryList = d;
}

function countryNameForCode(code) {
	for (var k in countryList) {
		if  (countryList[k]["alpha-3"] == code) {
			return countryList[k]["name"];
		};
	}
	return "";
}

// load the actual data
d3.json("data/data.json", jsonComplete);

/* Stores the JSON data */
var dataSource;

function jsonComplete(d) {
	dataSource = d;
	parse(dataSource);
	initList();
}

/* Parses a data object and updates all views - Pass a subset for filtering */
function parse(data) {
	totalViews = 0;
	totalRatings = 0;

	films = [];
	sites = {};

	for (var d in data) {
		
		// create a new film object
		var film = new Film();
		
		// set some properties
		film.title = data[d]["title"];
		film.rank = data[d]["Rank"];
		film.ratings = data[d]["IMDB"]["RatingCount"];
		totalRatings += data[d]["IMDB"]["RatingCount"];

		//get max number of ratings for a movie
		maxRatings = data[d]["IMDB"]["RatingCount"] > maxRatings ? data[d]["IMDB"]["RatingCount"] : maxRatings;

		// get 1channel object and iterate
		var channels = data[d]["1channel"];
		for (var ch in channels) {
			
			// create a new site object or get reference to existing in dictionary
			var site;
			if (sites[ch.toString()]) {
				site = sites[ch.toString()];
			}
			// ignore sponsored content
			else if (ch.toString() == "HD Sponsor") {
				continue;
			}
			else {
				site = new Site();
			}
			
			// populate site		
			site.name = ch.toString();
			site.country = channels[ch]["Location"]["country_code3"];
			site.lat = channels[ch]["Location"]["Lat"];
			site.lon = channels[ch]["Location"]["Lon"];
			site.views += channels[ch]["Views"];
			
			// update film views count
			film.views += channels[ch]["Views"];

			// maxViews is the maximum views for all movies
			maxViews = film.views > maxViews ? film.views : maxViews;
			
			// add the site name key to the films dictionary with views value
			film.siteNames[site.name] = channels[ch]["Views"];

			// update site in sites dictionary
			sites[site.name] = site;

			// update total views for all titles
			totalViews += channels[ch]["Views"];
		}	
		// add the film to the array
		films.push(film);	
		
	}
	
	// turn sites into an array so D3 can work with it easier
	var keys = Object.keys(sites);
	keys = keys.sort();
	var temp = [];
	for (var i = 0; i < keys.length; i++) {
		temp[i] = sites[keys[i]]
	};
	sites = temp;
	
	updateViews();
}

