'use strict';
/*
 * player-filters.js
 * Add a select box for filtering players
 * @author OBarros, spambot, convinced, ryanli
 */

Foxtrick.modules['PlayerFilters'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['players', 'youthPlayers'],

	FILTER_SELECT_ID: 'foxtrick-filter-select',

	run: function(doc) {
		if (doc.getElementById(this.FILTER_SELECT_ID))
			return;

		var sortSelect = doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucSorting_ddlSortBy');
		if (Foxtrick.Pages.Players.isYouthPlayersPage(doc)) {
			sortSelect = doc.getElementById('ctl00_ctl00_CPContent_CPMain_ddlSortBy');
		}

		if (!sortSelect)
			return;

		var filterSelect = Foxtrick.createFeaturedElement(doc, this, 'select');
		filterSelect.id = this.FILTER_SELECT_ID;

		var playerList = Foxtrick.modules.Core.getPlayerList(doc);

		var selectClick = function() {
			try {
				if (filterSelect.getAttribute('scanned') === 'true') {
					// we only scan the players for once and mark it as scanned
					return;
				}

				var filterSelectOptionsDiv = doc.createElement('div');
				filterSelectOptionsDiv.id = 'filterSelectOptionsDiv';
				filterSelectOptionsDiv.className = 'hidden';
				container.appendChild(filterSelectOptionsDiv);
				var filterSelectOptions = doc.createElement('select');
				filterSelectOptions.id = 'filterSelectOptions';
				filterSelectOptions.setAttribute('tabindex', '3');
				//Foxtrick.listen(filterSelect, 'change', changeListener, false);
				var option = doc.createElement('option');
				option.value = 'equal';
				option.textContent = Foxtrick.L10n.getString('Filters.equal');
				filterSelectOptions.appendChild(option);
				var option = doc.createElement('option');
				option.value = 'notEqual';
				option.textContent = Foxtrick.L10n.getString('Filters.notEqual');
				filterSelectOptions.appendChild(option);
				var option = doc.createElement('option');
				option.value = 'over';
				option.textContent = Foxtrick.L10n.getString('Filters.over');
				filterSelectOptions.appendChild(option);
				var option = doc.createElement('option');
				option.value = 'under';
				option.textContent = Foxtrick.L10n.getString('Filters.under');
				filterSelectOptions.appendChild(option);
				filterSelectOptionsDiv.appendChild(filterSelectOptions);

				var input = doc.createElement('input');
				input.setAttribute('id', 'filterSelectOptionsText');
				input.setAttribute('value', '');
				input.setAttribute('type', 'text');
				input.setAttribute('maxlength', '20');
				input.setAttribute('size', '5');
				input.setAttribute('tabindex', '4');
				input.setAttribute('style', 'margin-left:5px;margin-right:5px;');
				filterSelectOptionsDiv.appendChild(input);

				var button_ok = doc.createElement('input');
				button_ok.setAttribute('value', Foxtrick.L10n.getString('button.ok'));
				button_ok.setAttribute('id', 'filterSelectOptionsOk');
				button_ok.setAttribute('type', 'button');
				Foxtrick.onClick(button_ok, changeListener);
				button_ok.setAttribute('tabindex', '5');
				filterSelectOptionsDiv.appendChild(button_ok);

				// rename filter to all
				filterSelect.getElementsByTagName('option')[0].textContent =
					Foxtrick.L10n.getString('Filters.noFilter');

				// remove 'addFilterOptions'
				filterSelect.removeChild(filterSelect.getElementsByTagName('option')[1]);

				var lastMatch = 0;
				for (var i = 0; i < playerList.length; ++i) {
					var matchDate = playerList[i].lastMatchDate;
					if (matchDate && matchDate > lastMatch) {
						lastMatch = matchDate;
					}
				}

				var specialities = {};
				var specialityCount = 0;

				var allPlayers = doc.getElementsByClassName('playerInfo');
				for (var i = 0; i < allPlayers.length; ++i) {
					var id = Foxtrick.Pages.Players.getPlayerId(allPlayers[i]);
					var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList, id);
					// All players have attribute 'all' set to 'true', so that the
					// filter can be cleared using an 'all' filter
					allPlayers[i].setAttribute('all', 'true');
					if (player.redCard || player.yellowCard) {
						allPlayers[i].setAttribute('cards', 'true');
					}
					if (player.transferListed) {
						allPlayers[i].setAttribute('transfer-listed', 'true');
					}
					else {
						allPlayers[i].setAttribute('not-transfer-listed', 'true');
					}
					if (player.injured) {
						allPlayers[i].setAttribute('injured', 'true');
					}
					if (player.speciality) {
						if (specialities[player.speciality] === undefined) {
							specialities[player.speciality] = specialityCount++;
						}
						allPlayers[i].setAttribute('speciality',
						                           'speciality-' + Foxtrick.L10n
						                           .getEnglishSpeciality(player.speciality));
					}
					if (Foxtrick.Pages.Players.isPropertyInList(playerList, 'lastMatchDate')) {
						if (lastMatch && player.lastMatchDate &&
						    lastMatch.getTime() === player.lastMatchDate.getTime()) {
							allPlayers[i].setAttribute('played-latest', 'true');
						}
						else {
							allPlayers[i].setAttribute('not-played-latest', 'true');
						}
					}
					if (player.motherClubBonus) {
						allPlayers[i].setAttribute('homegrown-player', 'true');
					}
					else {
						allPlayers[i].setAttribute('purchased-player', 'true');
					}
				}

				if (Foxtrick.Pages.Players.isPropertyInList(playerList, 'redCard')
					|| Foxtrick.Pages.Players.isPropertyInList(playerList, 'yellowCard')) {
					var option = doc.createElement('option');
					option.value = 'cards';
					option.textContent = Foxtrick.L10n.getString('TeamStats.Cards');
					filterSelect.appendChild(option);
				}

				if (Foxtrick.Pages.Players.isPropertyInList(playerList, 'injured')
					|| Foxtrick.Pages.Players.isPropertyInList(playerList, 'bruised')) {
					var option = doc.createElement('option');
					option.value = 'injured';
					option.textContent = Foxtrick.L10n.getString('TeamStats.Injured');
					filterSelect.appendChild(option);
				}

				if (Foxtrick.Pages.Players.isPropertyInList(playerList, 'transferListed')) {
					var option = doc.createElement('option');
					option.value = 'transfer-listed';
					option.textContent = Foxtrick.L10n.getString('TeamStats.TransferListed');
					filterSelect.appendChild(option);

					var option = doc.createElement('option');
					option.value = 'not-transfer-listed';
					option.textContent = Foxtrick.L10n.getString('TeamStats.NotTransferListed');
					filterSelect.appendChild(option);
				}

				if (Foxtrick.Pages.Players.isPropertyInList(playerList, 'lastMatch')) {
					var option = doc.createElement('option');
					option.value = 'played-latest';
					option.textContent = Foxtrick.L10n.getString('TeamStats.PlayedLatest');
					filterSelect.appendChild(option);

					var option = doc.createElement('option');
					option.value = 'not-played-latest';
					option.textContent = Foxtrick.L10n.getString('TeamStats.NotPlayedLatest');
					filterSelect.appendChild(option);
				}

				if (Foxtrick.Pages.Players.isPropertyInList(playerList, 'speciality')) {
					var speciality;
					for (speciality in specialities) {
						var option = doc.createElement('option');
						option.value = 'speciality-' + Foxtrick.L10n.getEnglishSpeciality(speciality);
						option.textContent = speciality;
						filterSelect.appendChild(option);
					}
				}

				if (Foxtrick.Pages.Players.isOldiesPage(doc) && Foxtrick.util.api.authorized()) {
					var option = doc.createElement('option');
					option.value = 'active';
					option.textContent = Foxtrick.L10n.getString('TeamStats.ActivePlayers');
					filterSelect.appendChild(option);
				}

				var faceCards = doc.getElementsByClassName('faceCard');
				if (faceCards.length > 0) {
					var option = doc.createElement('option');
					option.value = 'face';
					option.textContent = Foxtrick.L10n.getString('TeamStats.Pictures');
					filterSelect.appendChild(option);
				}

				if (Foxtrick.Pages.Players.isSeniorPlayersPage(doc)) {
					if (Foxtrick.Pages.Players.isPropertyInList(playerList, 'motherClubBonus')) {
						var option = doc.createElement('option');
						option.value = 'homegrown-player';
						option.textContent = Foxtrick.L10n.getString('TeamStats.HomeGrownPlayers');
						filterSelect.appendChild(option);

						var option = doc.createElement('option');
						option.value = 'purchased-player';
						option.textContent = Foxtrick.L10n.getString('TeamStats.PurchasedPlayers');
						filterSelect.appendChild(option);
					}
				}

				// adding attribute filters (senior pages)
				var attributeOptions = [
					{ name: 'TSI', property: 'tsi', pages: ['seniorPlayers', 'oldPlayers',
						'ntPlayers'] },
					{ name: 'Age', property: 'ageYears', pages: ['players', 'youthPlayers'] },
					{ name: 'Leadership', property: 'leadership', pages: ['seniorPlayers',
						'oldPlayers', 'ntPlayers'] },
					{ name: 'Experience', property: 'experience', pages: ['seniorPlayers',
						'oldPlayers', 'ntPlayers'] },
					{ name: 'Form', property: 'form', pages: ['seniorPlayers', 'oldPlayers',
						'ntPlayers']},
					{ name: 'Stamina', property: 'stamina', pages: ['seniorPlayers', 'oldPlayers',
						'ntPlayers']},
					{ name: 'Loyalty', property: 'loyalty', pages: ['seniorPlayers', 'oldPlayers']},
					{ name: 'Keeper', property: 'keeper', pages: ['ownPlayers']},
					{ name: 'Defending', property: 'defending', pages: ['ownPlayers']},
					{ name: 'Playmaking', property: 'playmaking', pages: ['ownPlayers']},
					{ name: 'Winger', property: 'winger', pages: ['ownPlayers']},
					{ name: 'Passing', property: 'passing', pages: ['ownPlayers']},
					{ name: 'Scoring', property: 'scoring', pages: ['ownPlayers']},
					{ name: 'Set_pieces', property: 'setPieces', pages: ['ownPlayers']},
					/*{ name: 'HTMS_Ability', property: 'htmsAbility', pages: ['seniorPlayers'] },
					{ name: 'HTMS_Potential', property: 'htmsPotential' , pages: ['seniorPlayers']},
					{ name: 'Agreeability', property: 'agreeability', pages: ['seniorPlayers']},
					{ name: 'Aggressiveness', property: 'aggressiveness', pages: ['seniorPlayers']},
					{ name: 'Honesty', property: 'honesty', pages: ['seniorPlayers']},*/
					{ name: 'Last_stars', property: 'lastRating', pages: ['seniorPlayers',
						'youthPlayers']}
				];
				var option = doc.createElement('option');
				option.value = 'attribute-all';
				option.textContent = '---' + Foxtrick.L10n.getString('Filters.Attributes') + '---';
				filterSelect.appendChild(option);
				for (var i = 0; i < attributeOptions.length; ++i) {
					if (!Foxtrick.isOneOfPages(attributeOptions[i].pages, doc))
						continue;
					var option = doc.createElement('option');
					option.value = 'attribute-' + attributeOptions[i].property;
					option.textContent = Foxtrick.L10n.getString(attributeOptions[i].name);
					filterSelect.appendChild(option);
				}

				filterSelect.setAttribute('scanned', 'true');
			} catch (e) { Foxtrick.log('Player filter click:', e); }
		};


		var hasBotsMarked = false;
		var markBotPlayers = function() {
			var loading = Foxtrick.util.note.createLoading(doc);
			doc.getElementsByTagName('p')[0].appendChild(loading);

			var batchArgs = [];
			Foxtrick.map(function(n) {
				var args = [['file', 'teamdetails'], ['teamId', n.currentClubId]];
				batchArgs.push(args);
			}, playerList);

			Foxtrick.util.api.batchRetrieve(doc, batchArgs, { cache_lifetime: 'session' },
			  function(xmls, errors) {
				if (xmls) {
					for (var i = 0; i < xmls.length; ++i) {
						var xml = xmls[i];
						var errorText = errors[i];
						if (!xml || errorText) {
							Foxtrick.log('No XML in batchRetrieve', batchArgs[i], errorText);
							continue;
						}
						var tid = xml.num('TeamID');
						var IsBot = xml.bool('IsBot');

						// update playerInfo
						Foxtrick.map(function(n) {
							var currentClubId = Foxtrick.util.id.findTeamId(n);
							if (tid == currentClubId) {
								if (!IsBot)
									n.setAttribute('active', !IsBot);
							}
						}, doc.getElementsByClassName('playerInfo'));

						// update skilltable
						var skilltable = doc.getElementById('ft_skilltable');
						if (skilltable) {
							Foxtrick.map(function(n) {
								var currentClubId = Foxtrick.util.id.findTeamId(n);
								if (tid == currentClubId) {
									if (!IsBot)
										n.setAttribute('active', 'true');
								}
							}, skilltable.rows);
						}
					}
				}
				hasBotsMarked = true;
				if (loading)
					loading.parentNode.removeChild(loading);
				changeListener();
			});
		};

		var changeListener = function(ev) {
			if (filterSelect.getAttribute('scanned') !== 'true') {
				selectClick();
				return;
			}

			var filter = filterSelect.value;
			if (filter == 'active' && !hasBotsMarked) {
				markBotPlayers();
				return; // comes back here when bots marked
			}
			// invalidate again. might be new page next time
			hasBotsMarked = false;

			var filterSelectOptionsDiv = doc.getElementById('filterSelectOptionsDiv');
			var attributeFilter = filter.match(/attribute-(.+)/);
			if (attributeFilter)
				Foxtrick.removeClass(filterSelectOptionsDiv, 'hidden');
			else
				Foxtrick.addClass(filterSelectOptionsDiv, 'hidden');
			var filterSelectOptions = doc.getElementById('filterSelectOptions').value;
			var filterSelectOptionsText = doc.getElementById('filterSelectOptionsText').value;

			var compare = {
				over: function(a, b) {
					return a > b;
				},
				under: function(a, b) {
					return a < b;
				},
				equal: function(a, b) {
					return a == b;
				},
				notEqual: function(a, b) {
					return a != b;
				}
			};

			//var parsedPlayerList = playerList;

			var lastMatch = 0;
			var body = doc.getElementById('mainBody');
			var allElems;
			if (doc.getElementsByClassName('playerList').length) {
				var playerNodeList = doc.getElementsByClassName('playerList')[0];
				allElems = playerNodeList.childNodes;
			}
			else {
				allElems = body.childNodes;
			}

			// recording how many players are shown
			var count = 0;
			if (filter === 'face') {
				var faceCards = doc.getElementsByClassName('faceCard');
				if (faceCards.length > 0) {
					count = faceCards.length;
					for (var i = 0; i < allElems.length; ++i) {
						var elem = allElems[i];
						if (Foxtrick.hasClass(elem, 'faceCard')) {
							Foxtrick.removeClass(elem, 'hidden');
						}
						else if (Foxtrick.hasClass(elem, 'category')
							|| Foxtrick.hasClass(elem, 'playerInfo')
							|| Foxtrick.hasClass(elem, 'borderSeparator')
							|| Foxtrick.hasClass(elem, 'separator')
							|| Foxtrick.hasClass(elem, 'youthnotes')) {
							// these are attached infomation divisions
							Foxtrick.addClass(elem, 'hidden');
						}
					}

					// Face cards are floated to the left, so we need a
					// cleaner to maintain the container's length.
					var container = faceCards[0].parentNode;
					var cleaner = doc.createElement('div');
					cleaner.className = 'clear';
					if (Foxtrick.Pages.Players.isSeniorPlayersPage(doc)
						&& !Foxtrick.Pages.Players.isNtPlayersPage(doc)
						&& !Foxtrick.Pages.Players.isOldiesPage(doc)
						&& !Foxtrick.Pages.Players.isCoachesPage(doc)) {
						// If it's normal senior players list, there is an
						// a element in the bottom for navigating back to top,
						// and the cleaner should be inserted before it.
						var containerLinks = container.getElementsByTagName('a');
						var backTopAnchor = containerLinks[containerLinks.length - 1];
						container.insertBefore(cleaner, backTopAnchor);
					}
					else {
						container.appendChild(cleaner);
					}
				}
			}
			else {
				var hide = false;
				var hideCategory = true;
				var lastCategory = null;
				var lastborderSeparator = null;
				var lastFace = null;

				for (var i = 0; i < allElems.length; ++i) {
					var elem = allElems[i];
					if (Foxtrick.hasClass(elem, 'category')) {
						if (lastCategory) {
							if (hideCategory == true) {
								Foxtrick.addClass(lastCategory, 'hidden');
							}
							else {
								Foxtrick.removeClass(lastCategory, 'hidden');
							}
						}
						lastCategory = elem;
						hideCategory = true;
					}
					else if (Foxtrick.hasClass(elem, 'faceCard')) {
						lastFace = elem;
					}
					else if (Foxtrick.hasClass(elem, 'playerInfo')) {
						var pid = Foxtrick.util.id.findPlayerId(elem);
						var player = Foxtrick.Pages.Players
							.getPlayerFromListById(playerList, pid);
						if (elem.getAttribute(filter) === 'true'
							 || elem.getAttribute('speciality') === filter
							 || (attributeFilter != null && attributeFilter[1] == 'all')
							 || (attributeFilter != null && player[attributeFilter[1]] != null
							 && compare[filterSelectOptions](player[attributeFilter[1]],
							                                 filterSelectOptionsText))) {
							Foxtrick.removeClass(elem, 'hidden');
							hide = false;
							hideCategory = false;
						}
						else {
							Foxtrick.addClass(elem, 'hidden');
							hide = true;
						}
						if (lastFace) {
							if (hide) {
								Foxtrick.addClass(lastFace, 'hidden');
							}
							else {
								Foxtrick.removeClass(lastFace, 'hidden');
							}
						}
						if (!hide) {
							++count;
						}
					}
					else if (Foxtrick.hasClass(elem, 'borderSeparator')
						|| Foxtrick.hasClass(elem, 'separator')
						|| Foxtrick.hasClass(elem, 'youthnotes')) {
						if (hide === true) {
							Foxtrick.addClass(elem, 'hidden');
						}
						else {
							Foxtrick.removeClass(elem, 'hidden');
						}
					}
					if (Foxtrick.hasClass(elem, 'borderSeparator')
						|| Foxtrick.hasClass(elem, 'separator')) {
						lastborderSeparator = elem;
					}
				}
				if (lastCategory) {
					if (hideCategory === true) {
						Foxtrick.addClass(lastCategory, 'hidden');
					}
					else {
						Foxtrick.removeClass(lastCategory, 'hidden');
					}
				}
			}
			// update player count
			var h = body.getElementsByTagName('h1')[0];
			h.textContent = h.textContent.replace(/\d+/, count);

			// update skilltable
			var skilltable = doc.getElementById('ft_skilltable');
			if (skilltable) {
				for (var i = 1; i < skilltable.rows.length; ++i) {
					var pid = Number(skilltable.rows[i].getAttribute('playerid'));
					var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList, pid);
					if (filter == 'all' || skilltable.rows[i].getAttribute(filter)
						|| skilltable.rows[i].getAttribute('speciality-' + filter)
						|| (attributeFilter != null && attributeFilter[1] == 'all')
						|| (attributeFilter != null && player[attributeFilter[1]] != null
						&& compare[filterSelectOptions](player[attributeFilter[1]],
							                                filterSelectOptionsText)))
						Foxtrick.removeClass(skilltable.rows[i], 'hidden');
					else
						Foxtrick.addClass(skilltable.rows[i], 'hidden');
				}
			}

			// update team-stats
			var	box = doc.getElementById('ft-team-stats-box');
			if (box) {
				Foxtrick.modules.TeamStats.run(doc);
			}
		};
		Foxtrick.onClick(filterSelect, function() {
			try {
				// replaced with a filter option to fill the select. seems better
				// (and needed for OsX+webkit)
				//selectClick();
			}
			catch (e) {
				Foxtrick.log(e);
			}
		});
		Foxtrick.listen(filterSelect, 'change', function() {
			try {
				changeListener();
			}
			catch (e) {
				Foxtrick.log(e);
			}
		}, false);

		// this is used to clear filters, and we use this to select all
		// players
		var option = doc.createElement('option');
		option.value = 'all';
		option.textContent = '-- ' + Foxtrick.L10n.getString('Filters.label') + ' --';
		filterSelect.appendChild(option);

		var option = doc.createElement('option');
		option.value = 'addFilters';
		option.textContent = Foxtrick.L10n.getString('Filters.addFilterOptions');
		filterSelect.appendChild(option);


		var parentNode = sortSelect.parentNode;
		var insertBefore = sortSelect.nextSibling;
		sortSelect.parentNode.removeChild(sortSelect);

		var container = doc.createElement('div');
		container.className = 'ft-select-container';
		container.appendChild(sortSelect);
		container.appendChild(filterSelect);

		parentNode.insertBefore(container, insertBefore);
	},

	change: function(doc) {
		//this.run(doc);
	}
};
