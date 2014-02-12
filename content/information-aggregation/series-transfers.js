'use strict';
/**
 * series-transfers.js
 * Lists all players for sale within a certain league on league pages
 * @author CatzHoek
 */

Foxtrick.modules['SeriesTransfers'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['series'],

	run: function(doc) {
		var leagueTable = doc.getElementById('mainBody').getElementsByTagName('table')[0];

		// checks whether a team is ownerless
		var isNotOwnerless = function(link) {
			return !Foxtrick.hasClass(link, 'shy') &&
				Foxtrick.getParameterFromUrl(link.getAttribute('href'), 'teamid');
		};

		// get bots/ownerless
		var teams = leagueTable.getElementsByTagName('a');
		var teamLinks = Foxtrick.filter(isNotOwnerless, teams);

		// get teamdIds
		var teamIds = [];
		for (var i in teamLinks) {
			var teamId = Foxtrick.getParameterFromUrl(teamLinks[i].getAttribute('href'), 'teamid');
			teamIds.push(teamId);
		}

		// build batchArgs
		var batchArgs = [];
		Foxtrick.map(function(n) {
			var args = { 'teamid': n, 'file': 'players' };
			batchArgs.push(args);
		}, teamIds);

		// create html
		var div = Foxtrick.createFeaturedElement(doc, this, 'div');
		var mainBody = doc.getElementById('mainBody');
		var before =
			doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucForumSneakpeek_updSneakpeek');
		mainBody.insertBefore(div, before);

		var mainBox = doc.createElement('div');
		Foxtrick.addClass(mainBox, 'mainBox');

		var h2 = doc.createElement('h2');
		h2.textContent = Foxtrickl10n.getString('SeriesTransfers.header');

		mainBox.appendChild(h2);
		div.appendChild(mainBox);

		var createRowElement = function(type, textContent) {
			var elem = doc.createElement(type);
			elem.textContent = textContent;
			return elem;
		};

		var table = doc.createElement('table');
		Foxtrick.addClass(table, 'hidden');
		table.setAttribute('id', 'ft-players-for-sale');

		// thead
		var columns = [
			{ text: 'Nationality.abbr', title: 'Nationality' },
			{ text: 'Player', title: 'Player' },
			{ text: 'Team', title: 'Team' },
			{ text: 'Speciality.abbr', title: 'Speciality' },
			{ text: 'Age.abbr', title: 'Age' },
			{ text: 'Experience.abbr', title: 'Experience' },
			{ text: 'Form.abbr', title: 'Form' },
			{ text: 'TSI.abbr', title: 'TSI' },
			{ text: 'Salary.abbr', title: 'Salary' },
			{ text: 'Injured.abbr', title: 'Injured' },
		];

		var thead = doc.createElement('thead');
		var thead_tr = doc.createElement('tr');
		for (var i = 0; i < columns.length; i++) {
			var localized_text = Foxtrickl10n.getString(columns[i].text);
			var localized_alt_n_title = Foxtrickl10n.getString(columns[i].title);
			var th = createRowElement('th', localized_text);
			th.setAttribute('title', localized_alt_n_title);
			th.setAttribute('alt', localized_alt_n_title);
			thead_tr.appendChild(th);
		}
		thead.appendChild(thead_tr);

		// tbody
		var tbody = doc.createElement('tbody');
		table.appendChild(thead);
		table.appendChild(tbody);
		mainBox.appendChild(table);

		// loading note
		if (FoxtrickPrefs.getBool('xmlLoad')) {
			var loading = Foxtrick.util.note.createLoading(doc);
			mainBox.appendChild(loading);
		}

		// retrieve currency rate
		Foxtrick.util.currency.establish(doc, function() {
			var currencyRate = Foxtrick.util.currency.getRate(doc);
			// batch retrieve
			Foxtrick.util.api.batchRetrieve(doc, batchArgs, { cache_lifetime: 'session' },
			  function(xmls, errorText) {
				if (xmls)
					processXMLs(xmls, errorText, currencyRate);
			});
		});

		var processXMLs = function(xmls, errorText, currencyRate) {
			var getNumFromXML = function(field) {
				return Number(player.getElementsByTagName(field)[0].textContent);
			};
			var injuryFunc = function(cell, injury) {
				if (injury > -1) {
					var img;
					if (injury === 0) { //bruised
						img = doc.createElement('img');
						img.src = '/Img/Icons/bruised.gif';
						img.alt = Foxtrickl10n.getString('Bruised.abbr');
						img.title = Foxtrickl10n.getString('Bruised');
						cell.appendChild(img);
					}
					else {
						img = doc.createElement('img');
						img.src = '/Img/Icons/injured.gif';
						img.alt = Foxtrickl10n.getString('Injured.abbr');
						img.title = Foxtrickl10n.getString('Injured');
						cell.appendChild(img);
						// player.injured is number from players page,
						// or boolean from transfer result page.
						if (typeof(injury) == 'number' && injury > 1) {
							cell.appendChild(doc.createTextNode(injury));
						}
					}
				}
			};
			var specialityFunc = function(cell, spec) {
				if (spec) {
					var icon_suffix = '';
					var specialtyName = Foxtrickl10n.getSpecialityFromNumber(spec);
					var specialtyUrl = Foxtrick.getSpecialtyImagePathFromNumber(spec);
					Foxtrick.addImage(doc, cell, {
						alt: specialtyName,
						title: specialtyName,
						src: specialtyUrl
					});
				}
				cell.setAttribute('index', spec);
			};
			var hasListedPlayers = false;
			for (var i = 0; i < xmls.length; ++i) {
				var xml = xmls[i];
				if (!xml) {
					Foxtrick.log('No XML in batchRetrieve', batchArgs[i], errorText);
					continue;
				}
				var tid = Number(xml.getElementsByTagName('TeamID')[0].textContent);
				var teamName = xml.getElementsByTagName('TeamName')[0].textContent;
				var players = xml.getElementsByTagName('Player');
				for (var p = 0; p < players.length; p++) {
					var player = players[p];
					var playerID = getNumFromXML('PlayerID');
					var isTransferListed = getNumFromXML('TransferListed');

					if (isTransferListed) {
						hasListedPlayers = true;

						var playerName = player.getElementsByTagName('PlayerName')[0].textContent;
						var playerTsi = getNumFromXML('TSI');
						var specialty = getNumFromXML('Specialty');
						var experience = getNumFromXML('Experience');
						var age = getNumFromXML('Age');
						var ageDays = getNumFromXML('AgeDays');
						var form = getNumFromXML('PlayerForm');
						var salary = Math.floor(getNumFromXML('Salary') / (10 * currencyRate));
						var agreeability = getNumFromXML('Agreeability');
						var aggressivness = getNumFromXML('Aggressiveness');
						var honesty = getNumFromXML('Honesty');
						var leadership = getNumFromXML('Leadership');
						var cards = getNumFromXML('Cards');
						var countryID = getNumFromXML('CountryID');
						var injuryLevel = getNumFromXML('InjuryLevel');

						var tr = doc.createElement('tr');

						// country + image
						var countryTd = doc.createElement('td');
						var flag = Foxtrick.util.id.createFlagFromCountryId(doc, countryID);
						countryTd.appendChild(flag);
						tr.appendChild(countryTd);

						// link to player
						var playerLinkTD = doc.createElement('td');
						var playerLink = createRowElement('a', playerName);
						playerLink.href = '/Club/Players/Player.aspx?PlayerID=' + playerID;
						playerLink.setAttribute('alt', playerName);
						playerLink.setAttribute('title', playerName);
						playerLinkTD.appendChild(playerLink);
						tr.appendChild(playerLinkTD);

						// link to team
						var teamLinkTD = doc.createElement('td');
						var teamLink = createRowElement('a', teamName);
						teamLink.setAttribute('href', '/Club/?TeamID=' + tid);
						teamLink.setAttribute('alt', teamName);
						teamLink.setAttribute('title', teamName);
						teamLinkTD.appendChild(teamLink);
						tr.appendChild(teamLinkTD);

						// specialty + respective icon
						var specialtyTD = doc.createElement('td');
						specialityFunc(specialtyTD, specialty);
						tr.appendChild(specialtyTD);

						// rest
						tr.appendChild(createRowElement('td', age + '.' + ageDays));
						tr.appendChild(createRowElement('td', experience));
						tr.appendChild(createRowElement('td', form));
						var tsi = Foxtrick.formatNumber(playerTsi, '\u00a0');
						tr.appendChild(createRowElement('td', tsi));
						var wage = Foxtrick.formatNumber(salary, '\u00a0');
						tr.appendChild(createRowElement('td', wage));

						// injurytd
						var injuryTD = doc.createElement('td');
						injuryFunc(injuryTD, injuryLevel);
						tr.appendChild(injuryTD);

						tbody.appendChild(tr);
					}
				}
			}
			Foxtrick.removeClass(table, 'hidden');
			loading.parentNode.removeChild(loading);
			if (!hasListedPlayers) {
				table.parentNode.removeChild(table);
				var span = doc.createElement('span');
				span.textContent = Foxtrickl10n.getString('SeriesTransfers.notransfers');
				mainBox.appendChild(span);
			}
		};
	}
};
