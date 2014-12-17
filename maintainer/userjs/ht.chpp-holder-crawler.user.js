// ==UserScript==
// @name   HT CHPP Holder Crawler
// @namespace  HT
// @author  LA-MJ
// @description  Allows to export CHPP holders in a json file for StaffMarker. Visit https://stage.hattrick.org/Community/CHPP/ChppPrograms.aspx
// @match    https://stage.hattrick.org/Community/CHPP/ChppPrograms.aspx
// @match    http://stage.hattrick.org/Community/CHPP/ChppPrograms.aspx
// ==/UserScript==

(function() {

	var SCRIPT_NAME = 'HT CHPP Holder Crawler';
	var CHPP_APP_SELECTOR = '#approvedApplications td:first-child';
	var SEARCH_BAR_SELECTOR = 'div.search-bar';

	var cells = document.querySelectorAll(CHPP_APP_SELECTOR);
	var searchBar = document.querySelector(SEARCH_BAR_SELECTOR);
	if (!cells.length || !searchBar) {
		console.error('Unexpected DOM structure in ' + SCRIPT_NAME);
		return;
	}

	var actionLink = document.createElement('a');
	actionLink.textContent = 'Export CHPP Holder list';
	actionLink.download = 'chpp-holder.json';

	var RE = /\d+/;
	var appList = [].slice.call(cells);
	var holders = {};
	appList.forEach(function(cell) {
		var appLink = cell.querySelector('a');
		var appName = appLink.textContent;
		var holderLink = cell.querySelector('a[title][href*="Manager"]');
		var id = parseInt(holderLink.href.match(RE), 10);
		var name = holderLink.textContent;
		if (!(id in holders)) {
			holders[id] = { id: id, name: name, appNames: [] };
		}
		holders[id].appNames.push(appName);
	});
	var ids = Object.keys(holders);
	ids.sort();
	// lexicographical sort since Object.keys() returns strings
	// even better for finding a person by id
	var list = ids.map(function(id) {
		var user = holders[id];
		user.appNames.sort();
		return user;
	});

	var header = '{\n\t"type": "chpp-holder",\n\t"internal": "true",\n\t"list": [\n';
	var footer = '\t]\n}\n';
	var output = JSON.stringify(list);
	output = output.replace(/([{[,:\]])(["\d[}])/g, '$1 $2');
	output = output.replace(/\},\{/g, '},\n\t\t{');
	output = output.replace(/\[\{/, header + '\t\t{');
	output = output.replace(/\}\]/, '}\n' + footer);
	var blob = new Blob([output], { type: 'text/json' });

	actionLink.href = window.URL.createObjectURL(blob);

	searchBar.parentNode.insertBefore(actionLink, searchBar.nextSibling);

})();
