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

		var AUTO_REFRESH_IN = 2 * Foxtrick.util.time.MSECS_IN_DAY;
		var resultId = 'ft-series-transfers-result';
		var timeId = 'ft-series-transfers-time';
		var now = Foxtrick.util.time.getHTTimeStamp(doc);

		var leagueTable = doc.getElementById('mainBody').getElementsByTagName('table')[0];

		// checks whether a team is ownerless
		var isNotOwnerless = function(link) {
			return !Foxtrick.hasClass(link, 'shy') &&
				Foxtrick.util.id.getTeamIdFromUrl(link.href);
		};

		// get bots/ownerless
		var teams = leagueTable.getElementsByTagName('a');
		var teamLinks = Foxtrick.filter(isNotOwnerless, teams);
		if (!teamLinks.length)
			// only bots
			return;

		// get teamdIds
		var teamIds = Foxtrick.map(function(link) {
			return Foxtrick.util.id.getTeamIdFromUrl(link.href);
		}, teamLinks);

		// build batchArgs
		var batchArgs = Foxtrick.map(function(n) {
			return [['file', 'players'], ['version', '2.2'], ['teamId', n]];
		}, teamIds);

		var invalidateCache = function() {
			Foxtrick.forEach(function(args) {
				var file = JSON.stringify(args);
				Foxtrick.util.api.setCacheLifetime(file, now);
			}, batchArgs);
		};

		var reFetch = function(ev) {
			invalidateCache();
			var win = ev.target.ownerDocument.defaultView;
			win.setTimeout(function() {
				var doc = this.document;
				Foxtrick.forEach(function(id) {
					var node = doc.getElementById(id);
					if (node)
						node.parentNode.removeChild(node);
				}, [resultId, timeId]);
				now = Foxtrick.util.time.getHTTimeStamp(doc);
				showPlayers();
			}, 300);
		};

		// create html
		var div = Foxtrick.createFeaturedElement(doc, this, 'div');
		var mainBody = doc.getElementById('mainBody');
		var before = Foxtrick.getMBElement(doc, 'ucForumSneakpeek_updSneakpeek');
		mainBody.insertBefore(div, before);

		var mainBox = doc.createElement('div');
		Foxtrick.addClass(mainBox, 'mainBox');

		var h2 = doc.createElement('h2');
		h2.textContent = Foxtrick.L10n.getString('SeriesTransfers.header');
		mainBox.appendChild(h2);

		var fetchDiv = doc.createElement('div');
		var fetchLink = doc.createElement('a');
		Foxtrick.addClass(fetchLink, 'ft-link');
		fetchLink.textContent = Foxtrick.L10n.getString('SeriesTransfers.fetch');
		Foxtrick.onClick(fetchLink, reFetch);
		fetchDiv.appendChild(fetchLink);
		mainBox.appendChild(fetchDiv);

		div.appendChild(mainBox);

		var createRowElement = function(type, textContent) {
			var elem = doc.createElement(type);
			elem.textContent = textContent;
			return elem;
		};

		var loading, table, tbody;
		var buildTable = function() {
			table = doc.createElement('table');
			Foxtrick.addClass(table, 'hidden');
			table.id = resultId;

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
				var localized_text = Foxtrick.L10n.getString(columns[i].text);
				var localized_alt_n_title = Foxtrick.L10n.getString(columns[i].title);
				var th = createRowElement('th', localized_text);
				th.setAttribute('title', localized_alt_n_title);
				th.setAttribute('alt', localized_alt_n_title);
				thead_tr.appendChild(th);
			}
			thead.appendChild(thead_tr);

			// tbody
			tbody = doc.createElement('tbody');
			table.appendChild(thead);
			table.appendChild(tbody);
			mainBox.insertBefore(table, fetchDiv);

			// loading note
			if (Foxtrick.Prefs.getBool('xmlLoad')) {
				loading = Foxtrick.util.note.createLoading(doc);
				mainBox.appendChild(loading);
			}
		};

		var processXMLs = function(xmls, errors, currencyRate) {
			var injuryFunc = function(cell, injury) {
				if (injury > -1) {
					var img;
					if (injury === 0) { //bruised
						img = doc.createElement('img');
						img.src = '/Img/Icons/bruised.gif';
						img.alt = Foxtrick.L10n.getString('Bruised.abbr');
						img.title = Foxtrick.L10n.getString('Bruised');
						cell.appendChild(img);
					}
					else {
						img = doc.createElement('img');
						img.src = '/Img/Icons/injured.gif';
						img.alt = Foxtrick.L10n.getString('Injured.abbr');
						img.title = Foxtrick.L10n.getString('Injured');
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
					var specialtyName = Foxtrick.L10n.getSpecialityFromNumber(spec);
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
			var oldestFile = Infinity;
			var idx = 1;
			Foxtrick.forEach(function(xml, i) {
				var errorText = errors[i];
				if (!xml || errorText) {
					Foxtrick.log('No XML in batchRetrieve', batchArgs[i], errorText);
					return;
				}
				var fetchDate = xml.time('FetchedDate');
				oldestFile = Math.min(fetchDate.valueOf(), oldestFile);

				var tid = xml.num('TeamID');
				var teamName = xml.text('TeamName');
				var players = xml.getElementsByTagName('Player');
				Foxtrick.forEach(function(player) {
					var num = function(field) {
						return xml.num(field, player);
					};
					var playerID = num('PlayerID');
					var isTransferListed = num('TransferListed');

					if (isTransferListed) {
						hasListedPlayers = true;

						var firstName = xml.text('FirstName', player);
						var lastName = xml.text('LastName', player);
						var playerName = firstName + ' ' + lastName;
						var playerTsi = num('TSI');
						var specialty = num('Specialty');
						var experience = num('Experience');
						var age = num('Age');
						var ageDays = num('AgeDays');
						var form = num('PlayerForm');
						var salary = xml.money('Salary', currencyRate, player);
						// var agreeability = num('Agreeability');
						// var aggressivness = num('Aggressiveness');
						// var honesty = num('Honesty');
						// var leadership = num('Leadership');
						// var cards = num('Cards');
						var countryID = num('CountryID');
						var injuryLevel = num('InjuryLevel');

						var tr = doc.createElement('tr');
						Foxtrick.addClass(tr, idx++ % 2 ? 'odd' : 'even');

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
				}, players);
			}, xmls);
			Foxtrick.removeClass(table, 'hidden');
			loading.parentNode.removeChild(loading);
			if (!hasListedPlayers) {
				table.parentNode.removeChild(table);
				var div = doc.createElement('div');
				div.id = resultId;
				div.textContent = Foxtrick.L10n.getString('SeriesTransfers.notransfers');
				mainBox.insertBefore(div, fetchDiv);
			}
			Foxtrick.localSet('series_transfers.' + seriesId, oldestFile);
			var infoDiv = doc.createElement('div');
			var info = Foxtrick.L10n.getString('SeriesTransfers.lastFetch');
			var dateText = Foxtrick.util.time.buildDate(new Date(oldestFile));
			infoDiv.textContent = info.replace(/%s/, dateText);
			infoDiv.id = timeId;
			fetchDiv.insertBefore(infoDiv, fetchLink);
		};

		var showPlayers = function() {
			buildTable();
			// retrieve currency rate
			Foxtrick.util.currency.establish(doc).then(function(curr) {
				var currencyRate = curr[0];
				// batch retrieve
				var time = now + AUTO_REFRESH_IN;
				Foxtrick.util.api.batchRetrieve(doc, batchArgs, { cache_lifetime: time },
				  function(xmls, errors) {
					if (xmls)
						processXMLs(xmls, errors, currencyRate);
				});

			}).catch(function(reason) {
				Foxtrick.log('WARNING: currency.establish aborted:', reason);
			});

		};

		var sidebar = doc.getElementById('sidebar');
		var seriesId = Foxtrick.util.id.findLeagueLeveUnitId(sidebar);
		var ownSeriesId = Foxtrick.modules.Core.TEAM.seriesId;
		Foxtrick.localGet('series_transfers.' + seriesId, function(time) {
			if (time || seriesId === ownSeriesId) {
				// we follow this series
				if (time + AUTO_REFRESH_IN < now)
					invalidateCache();
				showPlayers();
			}
		});

	}
};
