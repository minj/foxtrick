'use strict';
/**
* export-top-youth-players.js
* Export to csv functions to top youth players
* @author fgaldeano, maurooaranda
*/

Foxtrick.modules['ExportTopYouth'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['statsTopYouthPlayers'],
	OPTIONS: [],
	CSS: Foxtrick.InternalPath + 'resources/css/export-top-youth-players.css',
	run: function(doc) {
		if (!Foxtrick.isPage(doc, 'statsTopYouthPlayers')) {
			return;
		}
		const results = doc.querySelectorAll('#pnlResult > div.mainBox > table.tablesorter > tbody > tr');
		if(results.length === 0) { //No Search performed
			return;
		} 
		const panel = doc.querySelector('#pnlResult');
		const playerType = doc.querySelector('#ctl00_ctl00_CPContent_CPMain_ddlPosition');
		const ageInput = doc.querySelector('#ctl00_ctl00_CPContent_CPMain_txtAge');
		let csvContent = "data:text/csv;charset=utf-8,";
		let players = {};
		let processed = 0;

		const getExportData = function() {
		    let playerPosition = playerType.options[playerType.selectedIndex].text;
		    const header = [
		    	Foxtrick.L10n.getString('ExportTopYouth.header.name'), 
				Foxtrick.L10n.getString('ExportTopYouth.header.id'), 
				Foxtrick.L10n.getString('ExportTopYouth.header.years'), 
				Foxtrick.L10n.getString('ExportTopYouth.header.days'), 
				Foxtrick.L10n.getString('ExportTopYouth.header.toPromote'), 
				Foxtrick.L10n.getString('ExportTopYouth.header.specialty'), 
				Foxtrick.L10n.getString('ExportTopYouth.header.stars'), 
				Foxtrick.L10n.getString('ExportTopYouth.header.position'),
				Foxtrick.L10n.getString('ExportTopYouth.header.minutesPlayed')
			];
			csvContent += header.join(',') + '\r\n';
			for(let tr of results) {
				let row = getRowFromTR(tr);
				row.push(playerPosition);
				players[row[1]] = row;
			}
		};
		
		const addExportButton = function() {
			let encodedUri = encodeURI(csvContent);
			let link = doc.createElement("a");
			link.setAttribute("href", encodedUri);
			link.setAttribute("download", getFileName());
			link.innerHTML = Foxtrick.L10n.getString('ExportTopYouth.exportToCsv');
			link.className = 'exportLink';
			panel.parentNode.insertBefore(link, panel);
		};
		
		const getRowFromTR = function(tr) {
			let rowArray = [];
			let index = 0;
			let youthPlayerId;
			for(let td of tr.querySelectorAll('td')) {
				let images = td.querySelectorAll('img');
				let playerLink = td.querySelector('a');
				let innerText = td.innerText.trim();
			    if(index === 0 && playerLink) {
			    	youthPlayerId = playerLink.href.substring(playerLink.href.indexOf('=') + 1);
					rowArray.push(innerText);
					rowArray.push(youthPlayerId);
				}
				if(index === 1 && innerText.indexOf('(') !== -1) {
					let splitted = innerText.split(' (');
					rowArray.push(splitted[0]);
					rowArray.push(splitted[1].substring(0, splitted[1].length - 1));
				}
				if(index > 1 && index < 4) {
					rowArray.push(innerText);
				}
				if(index === 4 && images.length > 0) {
					rowArray.push(getNumberFromStars(images));
				}
				index++;
			}
			addMinutesPlayed(youthPlayerId);
			return rowArray;
		};

		const getNumberFromStars = function(images) {
			let number = 0;
			for(let img of images) {
				if(img.className.indexOf('starBig') !== -1) {
					number += 5;
				}
				if(img.className.indexOf('starWhole') !== -1) {
					number += 1;
				}
				if(img.className.indexOf('starHalf') !== -1) {
					number += 0.5;
				}
			}

			return number;
		};

		const getFileName = function() {
			if (playerType.selectedIndex == -1) {
				return 'Players.csv';
			}
			let rawAge = ageInput.value;
			let age = parseInt(rawAge);
			if (!age || age > 17 || age < 15) {
				return playerType.options[playerType.selectedIndex].text.replace(' ', '_') + '.csv';
			}
			else {
				return playerType.options[playerType.selectedIndex].text.replace(' ', '_') + ' (' + rawAge + ')' + '.csv';
			}
		};

		const addMinutesPlayed = function (youthPlayerId) {
			if(Object.keys(players).length > 50) {
				return;
			}
			const params = [
				['file', 'youthplayerdetails'],
				['version', '1.1'],
				['actionType', 'details'],
				['showLastMatch', 'true'],
				['youthPlayerId', parseInt(youthPlayerId)]
			];
			Foxtrick.util.api.retrieve(doc, params, { cache_lifetime: 'default' },
			  function(xml, errorText) {
			  	let minutes = xml.num('PlayedMinutes');
			  	players[youthPlayerId].push(minutes);
			  	csvContent += players[youthPlayerId].join(',') + '\r\n';
			  	processed++;
			  	if(processed == 50 || processed === results.length) {
			  		addExportButton();
			  	}
			});
		};

		getExportData();
	}
};