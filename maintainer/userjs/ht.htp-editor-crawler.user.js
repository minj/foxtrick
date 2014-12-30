// ==UserScript==
// @name   HT HTP Editor Crawler
// @namespace  HT
// @author  LA-MJ
// @description  Allows to export HTP Editors in a json file for StaffMarker. Visit https://stage.hattrick.org/Community/Crew/
// @match    https://stage.hattrick.org/Community/Crew/*
// @match    http://stage.hattrick.org/Community/Crew/*
// ==/UserScript==

(function() {
'use strict';

	var SCRIPT_NAME = 'HT HTP Editor Crawler';
	var LEAGUE_SELECT_ID = 'ctl00_ctl00_CPContent_CPMain_ucLeagues_ddlLeagues';
	var LEAGUE_SELECT_VALUE = '-1';
	var TYPE_SELECT_ID = 'ctl00_ctl00_CPContent_CPMain_ddlWorkerTypes';
	var TYPE_SELECT_VALUE = '48';
	var STAFF_TABLE_SELECTOR = 'table.indent';

	var leagueSelect = document.getElementById(LEAGUE_SELECT_ID);
	var typeSelect = document.getElementById(TYPE_SELECT_ID);
	if (!leagueSelect || !typeSelect) {
		console.error('Unexpected DOM structure in ' + SCRIPT_NAME);
		return;
	}

	var actionLink = document.createElement('a');
	if (leagueSelect.value !== LEAGUE_SELECT_VALUE ||
	    typeSelect.value !== TYPE_SELECT_VALUE) {
		// wrong page, add a link
		actionLink.textContent = 'Open HTP Editor list';
		actionLink.addEventListener('click', function() {
			leagueSelect.value = LEAGUE_SELECT_VALUE;
			typeSelect.value = TYPE_SELECT_VALUE;
			var e = new Event('change');
			typeSelect.dispatchEvent(e);
		});
	}
	else {
		var staffTable = document.querySelector(STAFF_TABLE_SELECTOR);
		if (!staffTable) {
			console.error('Unexpected DOM structure in ' + SCRIPT_NAME);
			return;
		}

		actionLink.textContent = 'Export HTP Editor list';
		actionLink.download = 'editor.json';

		var RE = /\d+/;
		var editorList = [].slice.call(staffTable.querySelectorAll('a[title][href*="Manager"]'));
		var editors = {};
		editorList.forEach(function(link) {
			var id = parseInt(link.href.match(RE), 10);
			var name = link.textContent;
			editors[id] = { id: id, name: name };
		});
		var ids = Object.keys(editors);
		ids.sort();
		// lexicographical sort since Object.keys() returns strings
		// even better for finding a person by id
		var list = ids.map(function(id) {
			return editors[id];
		});

		var header = '{\n\t"type": "editor",\n\t"internal": "true",\n\t"list": [\n';
		var footer = '\t]\n}\n';
		var output = JSON.stringify(list);
		output = output.replace(/([{[,:])(["\d])/g, '$1 $2');
		output = output.replace(/"([}\]])/g, '" $1');
		output = output.replace(/\},\{/g, '},\n\t\t{');
		output = output.replace(/\[\{/, header + '\t\t{');
		output = output.replace(/\}\]/, '}\n' + footer);
		var blob = new Blob([output], { type: 'text/json' });

		actionLink.href = window.URL.createObjectURL(blob);
	}

	typeSelect.parentNode.insertBefore(actionLink, typeSelect.nextSibling);

})();
