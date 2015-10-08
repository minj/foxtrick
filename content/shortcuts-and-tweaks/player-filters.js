'use strict';
/*
 * player-filters.js
 * Add a select box for filtering players
 * @author OBarros, spambot, convinced, ryanli
 */

Foxtrick.modules['PlayerFilters'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['allPlayers', 'youthPlayers'],

	FILTER_SELECT_ID: 'foxtrick-filter-select',

	run: function(doc) {
		if (doc.getElementById(this.FILTER_SELECT_ID))
			return;

		var sortSelect = Foxtrick.getMBElement(doc, 'ucSorting_ddlSortBy');
		if (Foxtrick.Pages.Players.isYouth(doc)) {
			sortSelect = Foxtrick.getMBElement(doc, 'ddlSortBy');
		}

		if (!sortSelect)
			return;

		var insertBefore = sortSelect.nextSibling;

		var filterSelect = Foxtrick.createFeaturedElement(doc, this, 'select');
		filterSelect.id = this.FILTER_SELECT_ID;

		// this is used to clear filters, and we use this to select all
		// players
		var optionAll = doc.createElement('option');
		optionAll.value = 'all';
		optionAll.textContent = '-- ' + Foxtrick.L10n.getString('Filters.label') + ' --';
		filterSelect.appendChild(optionAll);

		var optionAdd = doc.createElement('option');
		optionAdd.value = 'addFilters';
		optionAdd.textContent = Foxtrick.L10n.getString('Filters.addFilterOptions');
		filterSelect.appendChild(optionAdd);

		var container = doc.createElement('div');
		container.className = 'ft-select-container';
		container.appendChild(sortSelect);
		container.appendChild(filterSelect);

		insertBefore.parentNode.insertBefore(container, insertBefore);

		var playerList = Foxtrick.modules.Core.getPlayerList(doc);

		var addFilters = function() {
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
				filterSelectOptions.tabIndex = 3;

				var options = ['equal', 'notEqual', 'over', 'under'];
				Foxtrick.forEach(function(opt) {
					var option = doc.createElement('option');
					option.value = opt;
					option.textContent = Foxtrick.L10n.getString('Filters.' + opt);
					filterSelectOptions.appendChild(option);
				}, options);
				filterSelectOptionsDiv.appendChild(filterSelectOptions);

				var input = doc.createElement('input');
				input.id = 'filterSelectOptionsText';
				input.type = 'text';
				input.maxLength = 20;
				input.size = 5;
				input.tabIndex = 4;
				input.setAttribute('style', 'margin-eft:5px;margin-right:5px;');
				filterSelectOptionsDiv.appendChild(input);

				var btnOK = doc.createElement('input');
				btnOK.value = Foxtrick.L10n.getString('button.ok');
				btnOK.id = 'filterSelectOptionsOk';
				btnOK.type = 'button';
				Foxtrick.onClick(btnOK, changeListener);
				btnOK.tabIndex = 5;
				filterSelectOptionsDiv.appendChild(btnOK);

				// disable enter to submit HT form
				// redirect to FT button instead
				Foxtrick.listen(input, 'keypress', function(ev) {
					var doc = this.ownerDocument;
					if (ev.keyCode == 13) {
						ev.preventDefault();
						doc.getElementById('filterSelectOptionsOk').click();
					}
				});

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

				var playerDivs = doc.getElementsByClassName('playerInfo');
				Foxtrick.forEach(function(div) {
					var id = Foxtrick.Pages.Players.getPlayerId(div);
					var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList, id);
					if (player.redCard || player.yellowCard) {
						div.setAttribute('cards', 'true');
					}
					if (player.transferListed) {
						div.setAttribute('transfer-listed', 'true');
					}
					else {
						div.setAttribute('not-transfer-listed', 'true');
					}
					if (player.injured) {
						div.setAttribute('injured', 'true');
					}
					if (player.speciality) {
						if (typeof specialities[player.speciality] === 'undefined') {
							specialities[player.speciality] = specialityCount++;
						}
						var spec = Foxtrick.L10n.getEnglishSpeciality(player.speciality);
						div.setAttribute('speciality-' + spec, 'true');
					}
					if (Foxtrick.Pages.Players.isPropertyInList(playerList, 'lastMatchDate')) {
						if (lastMatch && player.lastMatchDate &&
						    lastMatch.getTime() === player.lastMatchDate.getTime()) {
							div.setAttribute('played-latest', 'true');
						}
						else {
							div.setAttribute('not-played-latest', 'true');
						}
					}
					if (player.motherClubBonus) {
						div.setAttribute('homegrown-player', 'true');
					}
					else {
						div.setAttribute('purchased-player', 'true');
					}
				}, playerDivs);

				var filters = [
					{ props: ['redCard', 'yellowCard'], name: 'cards', l10n: 'Cards', },
					{ props: ['injured', 'bruised'], name: 'injured', l10n: 'Injured', },
					{ props: ['transferListed'],
						name: 'transfer-listed', l10n: 'TransferListed', },
					{ props: ['transferListed'],
						name: 'not-transfer-listed', l10n: 'NotTransferListed', },
					{ props: ['lastMatch'], name: 'played-latest', l10n: 'PlayedLatest', },
					{ props: ['lastMatch'], name: 'not-played-latest', l10n: 'NotPlayedLatest', },
				];

				if (Foxtrick.Pages.Players.isRegular(doc)) {
					filters.push({
						props: ['motherClubBonus'],
						name: 'homegrown-player', l10n: 'HomeGrownPlayers',
					});
					filters.push({
						props: ['motherClubBonus'],
						name: 'purchased-player', l10n: 'PurchasedPlayers',
					});
				}

				if (Foxtrick.Pages.Players.isOldies(doc) && Foxtrick.util.api.authorized()) {
					filters.push({
						props: ['id'],
						name: 'active', l10n: 'ActivePlayers',
					});
				}

				for (var speciality in specialities) {
					var spec = Foxtrick.L10n.getEnglishSpeciality(speciality);
					filters.push({
						props: ['speciality'],
						name: 'speciality-' + spec, title: speciality,
					});
				}

				var faceCards = doc.getElementsByClassName('faceCard');
				if (faceCards.length > 0) {
					filters.push({
						props: ['id'],
						name: 'face', l10n: 'Pictures',
					});
				}

				Foxtrick.forEach(function(filter) {
					var active = Foxtrick.any(function(prop) {
						return Foxtrick.Pages.Players.isPropertyInList(playerList, prop);
					}, filter.props);

					if (!active)
						return;

					var option = doc.createElement('option');
					option.value = filter.name;
					if (filter.l10n)
						option.textContent = Foxtrick.L10n.getString('TeamStats.' + filter.l10n);
					else
						option.textContent = filter.title;

					filterSelect.appendChild(option);
				}, filters);

				// adding attribute filters (senior pages)
				var attributeOptions = [
					{ name: 'TSI', property: 'tsi', pages: ['allPlayers'], },
					{ name: 'Age', property: 'ageYears', pages: ['allPlayers', 'youthPlayers'], },
					{ name: 'Leadership', property: 'leadership', pages: ['allPlayers'], },
					{ name: 'Experience', property: 'experience', pages: ['allPlayers'], },
					{ name: 'Form', property: 'form', pages: ['allPlayers'], },
					{ name: 'Stamina', property: 'stamina', pages: ['allPlayers'], },
					{ name: 'Loyalty', property: 'loyalty', pages: ['players', 'oldPlayers'], },
					{ name: 'Keeper', property: 'keeper', pages: ['ownPlayers'], },
					{ name: 'Defending', property: 'defending', pages: ['ownPlayers'], },
					{ name: 'Playmaking', property: 'playmaking', pages: ['ownPlayers'], },
					{ name: 'Winger', property: 'winger', pages: ['ownPlayers'], },
					{ name: 'Passing', property: 'passing', pages: ['ownPlayers'], },
					{ name: 'Scoring', property: 'scoring', pages: ['ownPlayers'], },
					{ name: 'Set_pieces', property: 'setPieces', pages: ['ownPlayers'], },
					// { name: 'HTMS_Ability', property: 'htmsAbility', pages: ['players'], },
					// { name: 'HTMS_Potential', property: 'htmsPotential' , pages: ['players'], },
					// { name: 'Agreeability', property: 'agreeability', pages: ['players'], },
					// { name: 'Aggressiveness', property: 'aggressiveness', pages: ['players'], },
					// { name: 'Honesty', property: 'honesty', pages: ['players'], },
					{ name: 'Last_stars', property: 'lastRating',
						pages: ['players', 'youthPlayers'], },
				];

				var optionAttr = doc.createElement('option');
				optionAttr.value = 'attribute-all';
				var attrL10n = Foxtrick.L10n.getString('Filters.Attributes');
				optionAttr.textContent = '---' + attrL10n + '---';
				filterSelect.appendChild(optionAttr);

				Foxtrick.forEach(function(opt) {
					if (!Foxtrick.isOneOfPages(doc, opt.pages))
						return;

					var option = doc.createElement('option');
					option.value = 'attribute-' + opt.property;
					option.textContent = Foxtrick.L10n.getString(opt.name);
					filterSelect.appendChild(option);
				}, attributeOptions);

				filterSelect.setAttribute('scanned', 'true');
			}
			catch (e) { Foxtrick.log('Player filter click:', e); }
		};

		var hasBotsMarked = false;
		var markBotPlayers = function() {
			var loading = Foxtrick.util.note.createLoading(doc);
			doc.querySelector('#mainBody p').appendChild(loading);

			var batchArgs = [];
			Foxtrick.map(function(n) {
				var args = [['file', 'teamdetails'], ['teamId', n.currentClubId]];
				batchArgs.push(args);
			}, playerList);

			Foxtrick.util.api.batchRetrieve(doc, batchArgs, { cache_lifetime: 'session' },
			  function(xmls, errors) {
				if (xmls) {
					var skillTables = doc.querySelectorAll('.ft_skilltable');
					Foxtrick.forEach(function(xml, i) {
						var errorText = errors[i];
						if (!xml || errorText) {
							Foxtrick.log('No XML in batchRetrieve', batchArgs[i], errorText);
							return;
						}
						var TeamID = xml.num('TeamID');
						var IsBot = xml.bool('IsBot');

						if (!IsBot) {
							// update playerInfo
							Foxtrick.map(function(div) {
								var thisTeamId = Foxtrick.util.id.findTeamId(div);
								if (thisTeamId == TeamID) {
									div.setAttribute('active', 'true');
								}
							}, doc.getElementsByClassName('playerInfo'));

							// update skillTables
							Foxtrick.forEach(function(table) {
								var rows = Foxtrick.toArray(table.rows).slice(1); // skip header
								Foxtrick.map(function(row) {
									var thisTeamId = Foxtrick.util.id.findTeamId(row);
									if (TeamID == thisTeamId) {
										row.setAttribute('active', 'true');
									}
								}, rows);
							}, skillTables);
						}
					}, xmls);
				}

				hasBotsMarked = true;
				if (loading)
					loading.parentNode.removeChild(loading);
				changeListener();
			});
		};

		var changeListener = function(ev) {
			if (filterSelect.getAttribute('scanned') !== 'true') {
				addFilters();
				return;
			}

			var filter = filterSelect.value;
			if (filter == 'active' && !hasBotsMarked) {
				markBotPlayers();
				return; // continues after bots are marked
			}
			// invalidate again. might be new page next time
			hasBotsMarked = false;

			var filterSelectOptionsDiv = doc.getElementById('filterSelectOptionsDiv');
			var attribute = '';
			var attributeFilter = filter.match(/attribute-(.+)/);
			if (attributeFilter) {
				Foxtrick.removeClass(filterSelectOptionsDiv, 'hidden');
				attribute = attributeFilter[1];
			}
			else {
				Foxtrick.addClass(filterSelectOptionsDiv, 'hidden');
			}

			var COMPARE = {
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
				},
			};

			var compValue = doc.getElementById('filterSelectOptionsText').value;
			var compType = doc.getElementById('filterSelectOptions').value;
			var comp = COMPARE[compType];

			var isVisible = function(elem, player) {
				if (filter == 'all' || attribute == 'all')
					return true;

				if (elem.getAttribute(filter) === 'true')
					return true;

				if (attribute && typeof player[attribute] !== 'undefined')
					return comp(player[attribute], compValue);

				return false;
			};

			var body = doc.getElementById('mainBody');

			var allElems;
			if (doc.getElementsByClassName('playerList').length) {
				var playerNodeList = doc.getElementsByClassName('playerList')[0];
				allElems = playerNodeList.childNodes;
			}
			else {
				allElems = body.childNodes;
			}

			// these are attached information divs
			var hideFace = ['category', 'playerInfo', 'borderSeparator', 'separator', 'youthnotes'];
			var hideOther = ['borderSeparator', 'separator', 'youthnotes'];
			var sepCls = ['borderSeparator', 'separator'];

			// recording how many players are shown
			var count = 0;
			if (filter === 'face') {

				var faceCards = doc.getElementsByClassName('faceCard');
				if (faceCards.length) {
					count = faceCards.length;
					Foxtrick.forEach(function(elem) {
						var hasHiddenCls = Foxtrick.any(function(cls) {
							return Foxtrick.hasClass(elem, cls);
						}, hideFace);

						if (hasHiddenCls) {
							Foxtrick.addClass(elem, 'hidden');
						}
						else if (Foxtrick.hasClass(elem, 'faceCard')) {
							Foxtrick.removeClass(elem, 'hidden');
						}
					}, allElems);

					// Face cards are floated to the left, so we need a
					// cleaner to maintain the container's length.
					var container = faceCards[0].parentNode;
					var cleaner = doc.createElement('div');
					cleaner.className = 'clear';
					if (Foxtrick.Pages.Players.isRegular(doc)) {
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
				var lastBorderSeparator = null;
				var lastFace = null;
				Foxtrick.forEach(function(elem) {
					var hasHiddenCls = Foxtrick.any(function(cls) {
						return Foxtrick.hasClass(elem, cls);
					}, hideOther);
					var isSeparator = Foxtrick.any(function(cls) {
						return Foxtrick.hasClass(elem, cls);
					}, sepCls);

					if (Foxtrick.hasClass(elem, 'category')) {
						if (lastCategory) {
							if (hideCategory) {
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
						var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList, pid);
						if (isVisible(elem, player)) {
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
					else if (hasHiddenCls) {
						if (hide) {
							Foxtrick.addClass(elem, 'hidden');
						}
						else {
							Foxtrick.removeClass(elem, 'hidden');
						}
					}
					if (isSeparator) {
						lastBorderSeparator = elem;
					}
				}, allElems);

				if (lastCategory) {
					if (hideCategory) {
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

			// update skillTables
			var skillTables = doc.querySelectorAll('.ft_skilltable');
			Foxtrick.forEach(function(table) {
				var rows = Foxtrick.toArray(table.rows).slice(1); // skip header
				Foxtrick.forEach(function(row) {
					var pid = parseInt(row.getAttribute('playerid'), 10);
					var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList, pid);
					if (isVisible(row, player)) {
						Foxtrick.removeClass(row, 'hidden');
					}
					else {
						Foxtrick.addClass(row, 'hidden');
					}
				}, rows);
			}, skillTables);
			Foxtrick.modules['SkillTable'].updateBrowseIds(doc);

			// update team-stats
			var	box = doc.getElementById('ft-team-stats-box');
			if (box) {
				Foxtrick.modules.TeamStats.run(doc);
			}
		};

		Foxtrick.listen(filterSelect, 'change', function() {
			try {
				changeListener();
			}
			catch (e) {
				Foxtrick.log(e);
			}
		});

	},
};
