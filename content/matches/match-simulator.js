'use strict';
/**
 * match-simulator.js
 * compare to other teams and simulate matches using htms
 * @author convinced
 */

Foxtrick.modules.MatchSimulator = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['matchOrder'],
	RADIO_OPTIONS: ['RatingsOnTop', 'RatingsBelow', 'RatingsRight'],
	OPTIONS: ['HTMSPrediction', 'UseRatingsModule', 'StaminaPrediction'],
	CSS: Foxtrick.InternalPath + 'resources/css/match-simulator.css',

	MatchTypes: {
		'1': { className: 'ftMatchLeague', title: 'League match' },
		'2': { className: 'ftMatchQualification', title: 'Qualification match' },
		'3': { className: 'ftMatchCup', title: 'Cup match (standard league match)' },
		'4': { className: 'ftMatchFriendly', title: 'Friendly (normal rules)' },
		'5': { className: 'ftMatchFriendly', title: 'Friendly (cup rules)' },
		'6': { className: '', title: 'Not currently in use, but reserved for international ' +
			'competition matches with normal rules (may or may not be implemented at some ' +
			'future point).' },
		'7': { className: 'ftMatchMasters', title: 'Hattrick Masters' },
		'8': { className: 'ftMatchFriendly', title: 'International friendly (normal rules)' },
		'9': { className: 'ftMatchFriendly', title: 'Internation friendly (cup rules)' },
		'10': { className: 'ftUpcomingNationalIcon', title: 'National teams competition match ' +
			'(normal rules)' },
		'11': { className: 'ftUpcomingNationalIcon', title: 'National teams competition match ' +
			'(cup rules)' },
		'12': { className: 'ftMatchFriendly', title: 'National teams friendly' },
		'50': { className: 'ftMatchTournament', title: 'Tournament match  (normal rules)' },
		'51': { className: 'ftMatchTournament', title: 'Tournament match  (cup rules)' },
		'100': { className: 'ftMatchLeague', title: 'Youth league match' },
		'101': { className: 'ftMatchFriendly', title: 'Youth friendly match' },
		'102': { className: '', title: 'RESERVED' },
		'103': { className: 'ftMatchFriendly', title: 'Youth friendly match (cup rules)' },
		'104': { className: '', title: 'RESERVED' },
		'105': { className: 'ftMatchFriendly', title: 'Youth international friendly match' },
		'106': { className: 'ftMatchFriendly', title: 'Youth international friendly match ' +
			'(Cup rules)' },
		'107': { className: '', title: 'RESERVED' }
	},

	run: function(doc) {
		var isYouth = Foxtrick.Pages.Match.isYouth(doc);
		var isHTOIntegrated = Foxtrick.Pages.Match.isHTOIntegrated(doc);
		var useRatings = FoxtrickPrefs.isModuleEnabled('Ratings') &&
			FoxtrickPrefs.isModuleOptionEnabled('MatchSimulator', 'UseRatingsModule');
		var useHTMS = FoxtrickPrefs.isModuleOptionEnabled('MatchSimulator', 'HTMSPrediction');
		var useStaminaPred = FoxtrickPrefs.isModuleOptionEnabled('MatchSimulator', 'StaminaPrediction');

		var displayOption = FoxtrickPrefs.getInt('module.MatchSimulator.value');
		var fieldOverlay = doc.getElementById('fieldOverlay');
		if (displayOption == 1)
			Foxtrick.addClass(fieldOverlay, 'displayBelow');
		else if (displayOption == 2)
			Foxtrick.addClass(fieldOverlay, 'displayRight');

		// ratings and tactic for predicted and for selected others team match
		var currentRatings = new Array(9), orgRatings = new Array(9), oldRatings = new Array(9),
			currentRatingsOther = new Array(9), teamNames = new Array(2), isHome;
		var currentMatchXML = null, currentOtherTeamID = null, currentHomeAway = null;
		var oldLineupId = null;

		var normalizeRatings = function(level) {
			return Math.floor((level + 0.125) * 4) / 4;
		};

		if (useStaminaPred) {
			var ownId = Foxtrick.util.id.getOwnTeamId();
			var staminaData = {}, dataText = FoxtrickPrefs.get('StaminaData.' + ownId);
			if (dataText) {
				try {
					staminaData = JSON.parse(dataText);
				}
				catch(e) {
					Foxtrick.log('Error parsing staminaData:', e);
				}
			}
		}

		// updating or adding htms prediction based on rating prediction and seleted match of
		// another team
		var updateHTMSPrediction = function() {
			if (!useHTMS)
				return;

			// create or unhide overlayHTMS
			var overlayHTMS = doc.getElementById('ft-overlayHTMS');
			if (!overlayHTMS) {
				overlayHTMS = Foxtrick.createFeaturedElement(doc, Foxtrick.modules.MatchSimulator,
				                                             'div');
				overlayHTMS.id = 'ft-overlayHTMS';
				doc.getElementById('ft-overlayBottom').appendChild(overlayHTMS);
			}
			else Foxtrick.removeClass(overlayHTMS, 'hidden');

			// clear 'previous prediction', if there
			var overlayHTMSPrevious = doc.getElementById('overlayHTMSPrevious');
			if (overlayHTMSPrevious)
				overlayHTMSPrevious.parentNode.removeChild(overlayHTMSPrevious);

			// move current prediction, if there, to previous. else create current
			var overlayHTMSCurrent = doc.getElementById('overlayHTMSCurrent');
			if (overlayHTMSCurrent) {
				overlayHTMSPrevious = overlayHTMSCurrent.cloneNode(true);
				overlayHTMSPrevious.id = 'overlayHTMSPrevious';
				var table = overlayHTMSPrevious.getElementsByTagName('table')[0];
				if (table) {
					table.id = 'ft-htmstablePrevious';
					var h2 = overlayHTMSPrevious.getElementsByTagName('h2')[0];
					h2.textContent = Foxtrickl10n.getString('matchOrder.previousPrediction');
					var link = overlayHTMSPrevious.getElementsByTagName('a')[0];
					link.parentNode.removeChild(link);
				}
				overlayHTMS.appendChild(overlayHTMSPrevious);
				overlayHTMSCurrent.textContent = '';
			}
			else {
				overlayHTMSCurrent = doc.createElement('div');
				overlayHTMSCurrent.id = 'overlayHTMSCurrent';
				overlayHTMS.appendChild(overlayHTMSCurrent);
			}

			// if has number from other match, collect and submit them to htms. else clear overlay
			if (currentRatingsOther[0] != undefined) {
				var tacticAbbr = ['', 'pressing', 'ca', 'aim', 'aow', 'cre', 'long'];
				var midfieldLevel = [normalizeRatings(currentRatings[3]) - 1,
					currentRatingsOther[3] - 1];
				var rdefence = [normalizeRatings(currentRatings[0]) - 1, currentRatingsOther[6] - 1];
				var cdefence = [normalizeRatings(currentRatings[1]) - 1, currentRatingsOther[5] - 1];
				var ldefence = [normalizeRatings(currentRatings[2]) - 1, currentRatingsOther[4] - 1];
				var rattack = [normalizeRatings(currentRatings[4]) - 1, currentRatingsOther[2] - 1];
				var cattack = [normalizeRatings(currentRatings[5]) - 1, currentRatingsOther[1] - 1];
				var lattack = [normalizeRatings(currentRatings[6]) - 1, currentRatingsOther[0] - 1];

				var tactics = [tacticAbbr[currentRatings[7]], tacticAbbr[currentRatingsOther[7]]];
				var tacticsLevel = [currentRatings[8], currentRatingsOther[8]];
				Foxtrick.modules['HTMSPrediction'].insertPrediction(doc, overlayHTMSCurrent,
				                      midfieldLevel, rdefence, cdefence, ldefence,
				                      rattack, cattack, lattack,
				                      tactics, tacticsLevel, teamNames);
			}
			else {
				if (overlayHTMS)
					overlayHTMS.textContent = '';
			}
		};

		// add Ratings module functionality
		var addRatingsModule = function(currentRatings, currentRatingsOther) {
			var tacticNames = ['normal', 'pressing', 'ca', 'aim', 'aow', 'creatively', 'longshots'];

			var midfieldLevel = [normalizeRatings(currentRatings[3]) - 1, currentRatingsOther[3] - 1];
			var rdefence = [normalizeRatings(currentRatings[0]) - 1, currentRatingsOther[6] - 1];
			var cdefence = [normalizeRatings(currentRatings[1]) - 1, currentRatingsOther[5] - 1];
			var ldefence = [normalizeRatings(currentRatings[2]) - 1, currentRatingsOther[4] - 1];
			var rattack = [normalizeRatings(currentRatings[4]) - 1, currentRatingsOther[2] - 1];
			var cattack = [normalizeRatings(currentRatings[5]) - 1, currentRatingsOther[1] - 1];
			var lattack = [normalizeRatings(currentRatings[6]) - 1, currentRatingsOther[0] - 1];

			var tactics = [tacticNames[currentRatings[7]], tacticNames[currentRatingsOther[7]]];
			var tacticsLevel = [currentRatings[8], currentRatingsOther[8]];

			var ratingsTable = doc.getElementById('ft_simulation_ratings_table');
			var newTable = ratingsTable.cloneNode(false);

			Foxtrick.modules['Ratings'].addRatings(
				doc, newTable, midfieldLevel, rdefence, cdefence, ldefence, rattack, cattack,
				lattack, tactics, tacticsLevel, (currentRatingsOther[0] !== undefined)
			);

			ratingsTable.parentNode.replaceChild(newTable, ratingsTable);
		};

		var showLevelNumbers = function(ev) {
			// only listen to rating prediction changes
			if (!Foxtrick.hasClass(ev.target.parentNode, 'posLabel')
				&& ev.target.id != 'ft_stamina_discount_check'
				&& ev.target.id != 'ft_attVsDef_check')
				return;
			var updateHTMS = (ev.target.id != 'ft_attVsDef_check');
			var updateOther = !updateHTMS;

			//Foxtrick.log('showLevelNumbers')
			var overlayRatings = fieldOverlay.getElementsByClassName('overlayRatings');
			var posLabel = fieldOverlay.getElementsByClassName('posLabel');
			var tacticLevelLabel = doc.getElementById('tacticLevelLabel');

			// get some tactics etc lables for common use
			var speechLevelDiv = doc.getElementsByClassName('speechLevel')[0].cloneNode(true);
			var speechLevelTitle = speechLevelDiv.firstChild.textContent.replace(/^\s+/g, '')
				.replace(/\s+$/g, '');

			var teamtacticsDiv = doc.getElementById('tactics').cloneNode(true);
			teamtacticsDiv.removeChild(teamtacticsDiv.getElementsByClassName('speechLevel')[0]);
			teamtacticsDiv.removeChild(teamtacticsDiv.getElementsByTagName('select')[0]);
			var teamtacticsTitle = Foxtrick.trim(teamtacticsDiv.textContent);

			var attVsDefCheck = doc.getElementById('ft_attVsDef_check');
			if (attVsDefCheck.checked)
				FoxtrickPrefs.setBool('MatchSimulator.attVsDefOn', true);
			else
				FoxtrickPrefs.setBool('MatchSimulator.attVsDefOn', false);

			// change bars to represent percentage of ratings comparision between predicted ratings
			// and selected other teams match ratings and update HTMSPrediction
			var updateBarsAndHTMSPrediction = function() {
				if (updateHTMS)
					updateHTMSPrediction();

				if (useRatings)
					addRatingsModule(currentRatings, currentRatingsOther);

				var percentImage = fieldOverlay.getElementsByClassName('percentImage');
				for (var i = 0; i < percentImage.length; ++i) {
					if (currentRatingsOther[i] != undefined) {
						// change to zero-based ratings
						var curr = currentRatings[i] ? currentRatings[i] - 1 : 0;
						var other = currentRatingsOther[i] ? currentRatingsOther[i] - 1 : 0;
						var percent = curr / (curr + other);

						var title = Math.floor(percent * 100) + '%';
						var barPos;
						if (Foxtrick.util.layout.isStandard(doc))
							barPos = Math.floor(-315 + (315 - 156) * percent);
						else
							barPos = Math.floor(-235 + (235 - 116) * percent);
						percentImage[i].style.backgroundPosition = barPos + 'px';
						percentImage[i].title = title;
						percentImage[i].alt = title;
						Foxtrick.removeClass(percentImage[i], 'hidden');
						if (percentImage[i].nextSibling.className != 'percentNumber') {
							var div = doc.createElement('div');
							div.textContent = title;
							div.className = 'percentNumber';
							percentImage[i].parentNode.insertBefore(div, percentImage[i].nextSibling);
						}
						else {
							var div = percentImage[i].nextSibling;
							div.textContent = title;
							if (!updateOther) {
								var diff = Math.floor(percent * 100) -
									Math.floor(Number(div.getAttribute('percent')) * 100);
								var span = doc.createElement('span');
								span.textContent = ' (' + diff + '%)';
								if (diff < 0) {
									span.className = 'colorLower percentChange';
									div.appendChild(span);
								}
								else if (diff > 0) {
									span.className = 'colorHigher percentChange';
									div.appendChild(span);
								}
							}
						}
						div.setAttribute('percent', percent);
					}
					else {
						if (percentImage[i].nextSibling
							&& percentImage[i].nextSibling.className == 'percentNumber') {
							var div = percentImage[i].nextSibling;
							div.parentNode.removeChild(div);
						}
						Foxtrick.addClass(percentImage[i], 'hidden');
					}
				}
			};

			var updateOtherRatings = function(selectedMatchXML, otherTeamID, homeAway) {
				// select team node
				var HomeTeamID = Number(selectedMatchXML.getElementsByTagName('HomeTeamID')[0]
				                         .textContent);
				var AwayTeamID = Number(selectedMatchXML.getElementsByTagName('AwayTeamID')[0]
				                         .textContent);
				var h2 = doc.getElementById('ctl00_ctl00_CPContent_divStartMain').getElementsByTagName('h2')[0];
				var thisTeamID = Foxtrick.util.id.getTeamIdFromUrl(h2.getElementsByTagName('a')[0]
				                                                   .href);
				if (homeAway == 'home' ||
					(homeAway != 'away' &&	(otherTeamID == HomeTeamID ||
					 thisTeamID == AwayTeamID))) {
					var teamNode = selectedMatchXML.getElementsByTagName('HomeTeam')[0];
					teamNames[1] = selectedMatchXML.getElementsByTagName('HomeTeamName')[0]
						.textContent;
				}
				else if (homeAway == 'away' || otherTeamID == AwayTeamID ||
				         thisTeamID == HomeTeamID) {
					var teamNode = selectedMatchXML.getElementsByTagName('AwayTeam')[0];
					teamNames[1] = selectedMatchXML.getElementsByTagName('AwayTeamName')[0]
						.textContent;
				}
				else if (isHome) {
					var teamNode = selectedMatchXML.getElementsByTagName('AwayTeam')[0];
					teamNames[1] = selectedMatchXML.getElementsByTagName('AwayTeamName')[0]
						.textContent;
				}
				else {
					var teamNode = selectedMatchXML.getElementsByTagName('HomeTeam')[0];
					teamNames[1] = selectedMatchXML.getElementsByTagName('HomeTeamName')[0]
						.textContent;
				}
				// get ratings
				var selectedratings = [
					{ type: 'RatingLeftAtt' },
					{ type: 'RatingMidAtt' },
					{ type: 'RatingRightAtt' },
					{ type: 'RatingMidfield' },
					{ type: 'RatingLeftDef' },
					{ type: 'RatingMidDef' },
					{ type: 'RatingRightDef' },
					{ type: 'TacticType' },
					{ type: 'TacticSkill' }
				];

				// get ratings and ratings text
				for (var i = 0; i < selectedratings.length; ++i) {
					var htvalue = Number(teamNode.getElementsByTagName(selectedratings[i].type)[0]
					                     .textContent);
					if (selectedratings[i].type == 'TacticType') {

						selectedratings[i].value = htvalue;
						selectedratings[i].text = Foxtrickl10n.getTacticById(htvalue);
					}
					else if (selectedratings[i].type == 'TacticSkill') {
						selectedratings[i].value = htvalue;
						selectedratings[i].text = Foxtrickl10n.getLevelByTypeAndValue('levels',
						                                                              htvalue);
					}
					else {
						// adjust scale. non-existant has no sublevels
						selectedratings[i].value = htvalue / 4;
						if (selectedratings[i].value != 0)
							selectedratings[i].value += 0.75;

						selectedratings[i].text = Foxtrickl10n
							.getFullLevelByValue(selectedratings[i].value);
					}
				}


				// display other teams ratings
				var attVsDefCheck = doc.getElementById('ft_attVsDef_check');
				var ratingInnerBoxs = doc.getElementsByClassName('ratingInnerBox');
				for (var i = 0; i < ratingInnerBoxs.length; ++i) {
					var j = attVsDefCheck.checked ? i : ratingInnerBoxs.length - 1 - i;
					// reverse order?

					var fullLevel = selectedratings[j].value;
					var levelText = '[' + fullLevel.toFixed(2) + ']';

					var id = 'ft-full-level-other' + i;
					var div = doc.getElementById(id);
					if (div) {
						// there was another match selected before. show ratings and differences
						div.textContent = levelText;
						if (!updateOther) {
							var diff = fullLevel - currentRatingsOther[j];
							var span = doc.createElement('span');
							span.textContent = ' (' + diff.toFixed(2) + ')';
							if (diff < 0) {
								span.className = 'colorLower otherChange';
								div.appendChild(span);
							}
							else if (diff > 0) {
								span.className = 'colorHigher otherChange';
								div.appendChild(span);
							}
						}
						var label = ratingInnerBoxs[i].getElementsByClassName('posLabelOther')[0];
						label.textContent = posLabel[6 - j].textContent;
						var overlayRatingOther = ratingInnerBoxs[i]
							.getElementsByClassName('overlayRatingsOther')[0];
					}
					else {
						// no other match ratings had been shown. add other ratings containers
						// and the ratings
						var otherWrapper = doc.createElement('div');
						otherWrapper.className = 'ft-otherWrapper';

						var label = doc.createElement('div');
						label.className = 'posLabelOther';
						otherWrapper.appendChild(label);
						label.textContent = attVsDefCheck.checked ? posLabel[6 - i].textContent :
							posLabel[i].textContent; // reverse order?

						var overlayRatingOther = doc.createElement('div');
						overlayRatingOther.className = 'overlayRatingsOther';
						otherWrapper.appendChild(overlayRatingOther);

						var div = doc.createElement('div');
						div.id = id;
						div.className = 'overlayRatingsNumOther';
						div.textContent = levelText;
						otherWrapper.appendChild(div);

						ratingInnerBoxs[i].appendChild(otherWrapper);
					}
					overlayRatingOther.textContent = selectedratings[j].text;

					currentRatingsOther[j] = fullLevel;
					// index must match to selectedratings: i. e. attack first ALWAYS
				}

				// add tactics
				var tacticLevelLabelOther = doc.getElementById('tacticLevelLabelOther');
				if (!tacticLevelLabelOther) {
					var tacticLevelLabelOther = doc.createElement('div');
					tacticLevelLabelOther.id = 'tacticLevelLabelOther';

					var tacticLevelLabel = doc.getElementById('tacticLevelLabel');
					tacticLevelLabel.parentNode.insertBefore(tacticLevelLabelOther,
					                                         tacticLevelLabel.nextSibling);
				}
				var tacticLevelLabelTitle = doc.getElementById('tacticLevelLabel')
					.textContent.split(':')[0];
				currentRatingsOther[7] = selectedratings[7].value;
				currentRatingsOther[8] = selectedratings[8].value;

				tacticLevelLabelOther.textContent = teamtacticsTitle
												+ selectedratings[7].text
												+ ' / ' + tacticLevelLabelTitle + ': '
												+ selectedratings[8].text
												+ ' (' + selectedratings[8].value + ')';

				// remove my rating changes for clearity
				var ratingChange = fieldOverlay.getElementsByClassName('ratingChange');
				for (var j = 0; j < ratingChange.length; ++j) {
					ratingChange[j].textContent = '';
				}
			};
			var copyRatings = function(ev) {
				var text = '';

				// the teams. highlight own team
				var h2 = doc.getElementById('ctl00_ctl00_CPContent_divStartMain').getElementsByTagName('h2')[0];
				var thisTeam = h2.getElementsByTagName('a')[0].textContent;
				var bothTeams = h2.getElementsByTagName('a')[1].textContent
					.replace(thisTeam, '[b]' + thisTeam + '[/b]');
				text += bothTeams;

				// match link
				var matchid = Foxtrick.util.id.getMatchIdFromUrl(doc.location.href);
				text += ' [matchid=' + matchid + ']' + '\n';

				// formation
				var formations = doc.getElementById('formations').textContent;
				text += formations + '\n';

				// pic/mots
				var speechLevel_select = doc.getElementById('speechLevel');
				var speechLevel = speechLevel_select.options[speechLevel_select.selectedIndex]
					.textContent;
				text += speechLevelTitle;
				text += '[u]' + speechLevel + '[/u]\n';

				// coach type
				text += doc.getElementById('trainerTypeLabel').textContent + '\n'

				// tactics
				var teamtactics_select = doc.getElementById('teamtactics');
				var tactics = teamtactics_select.options[teamtactics_select.selectedIndex]
					.textContent;
				text += teamtacticsTitle;
				text += '[u]' + tactics + '[/u] / ';
				text += doc.getElementById('tacticLevelLabel').textContent + '\n\n';

				// add other match info if appropriate
				var matchSelect = doc.getElementById('ft-matchSelect');
				if (matchSelect) {
					var otherMatchId = matchSelect.value;
					if (otherMatchId > 0) {
						text += Foxtrickl10n.getString('matchOrder.comparedTo') + '\n';
						text += matchSelect.options[matchSelect.selectedIndex].textContent +
							' [matchid=' + otherMatchId + ']\n';
						text += doc.getElementById('tacticLevelLabelOther').textContent + '\n\n';
					}
				}

				// ratings
				text += '[table][tr][th colspan=3 align=center]' +
					doc.getElementById('calcRatings').value + '[/th][/tr]\n';
				for (var i = 0, count = 0; i < 14; ++i) {

					if (i == 0 || i == 6 || i == 8) {
						// new rows for defence, mid, attack
						text += '[tr]';
					}
					if (i == 6) {
						// midfield
						text += '[td colspan=3 align=center]';
					} else if (i % 2 == 0) {
							// posLabel
							text += '[td align=center]';
					} else {
						// ratings. add to same cell
					}

					if (Foxtrick.hasClass(overlayRatings[i], 'posLabel')) {
						// sector label
						text += '[b]' + overlayRatings[i].textContent + '[/b]\n';
					}
					else {
						// sector rating
						if (!Foxtrick.hasClass(overlayRatings[i], 'hidden'))
							text += overlayRatings[i].textContent + '\n';
						else // stamina discounted
							text += overlayRatings[i].nextSibling.textContent + '\n';
						text += doc.getElementById('ft-full-level' + count++).textContent + '\n';

						// add other teams ratings if appropriate
						if (otherMatchId && otherMatchId > 0) {
							var ratingInnerBox = overlayRatings[i].parentNode;
							text += '[q]' + ratingInnerBox.getElementsByClassName('percentNumber')[0]
								.textContent + '[/q]';
							var divs = ratingInnerBox.getElementsByClassName('ft-otherWrapper')[0]
								.getElementsByTagName('div');
							text += '[b]' + divs[0].textContent + '[/b]\n';
							text += divs[1].textContent + '\n';
							text += divs[2].textContent + '\n';
						}
						text += '[/td]';
					}
					if (i == 5 || i == 7 || i == 13) {
						text += '[/tr]';
					}
				}
				text += '[/table]';

				// copy ratings
				var ratingsTable = doc.getElementById('ft_simulation_ratings_table');
				if (ratingsTable) {
					text += Foxtrick.modules['Ratings'].copy(ratingsTable.parentNode);
				}

				// copy htms prediction.
				var overlayHTMS = doc.getElementById('overlayHTMSCurrent');
				if (overlayHTMS) {
					text += Foxtrick.modules['HTMSPrediction'].copy(overlayHTMS);
				}

				Foxtrick.copyStringToClipboard(text);
				var note = Foxtrick.util.note.add(doc, doc.getElementById('mainBody').firstChild,
				                                  'ft-ratings-copy-note',
				                                  Foxtrickl10n.getString('copy.ratings.copied'),
				                                  null, true);
			};

			// get levels from ratings text and display them
			var ratingInnerBoxs = doc.getElementsByClassName('ratingInnerBox');
			for (var i = 0; i < ratingInnerBoxs.length; ++i) {
				var overlayRatingDiscounted = ratingInnerBoxs[i]
					.getElementsByClassName('overlayRatingsDiscounted')[0];
				if (overlayRatingDiscounted)
					overlayRatingDiscounted.parentNode.removeChild(overlayRatingDiscounted);
				var overlayRating = ratingInnerBoxs[i].getElementsByClassName('overlayRatings')[1];
				Foxtrick.removeClass(overlayRating, 'hidden');

				var fullLevel = Foxtrick.hsToFloat(overlayRating.getAttribute('data-rating'), true);
				var levelText = '[' + fullLevel.toFixed(2) + ']';
				var id = 'ft-full-level' + i;
				if (currentRatings[i] !== undefined) {
					var div = doc.getElementById(id);
					div.textContent = levelText;
				}
				else {
					var div = doc.createElement('div');
					div.id = id;
					div.className = 'overlayRatingsNum';
					div.textContent = levelText;
				}
				ratingInnerBoxs[i].insertBefore(div, overlayRating.nextSibling);
				oldRatings[i] = currentRatings[i];
				currentRatings[i] = fullLevel;
				orgRatings[i] = fullLevel;
			}
			// store tactics for htms
			var teamtactics_select = doc.getElementById('teamtactics');
			currentRatings[7] = teamtactics_select.selectedIndex;
			if (teamtactics_select.value != 0 && teamtactics_select.value != 7) {
				var tacticsSpan = tacticLevelLabel.querySelector('span[data-tacticlevel]');
				currentRatings[8] = tacticsSpan.getAttribute('data-tacticlevel');
			}

			// remove other changes for clearity
			var otherChange = fieldOverlay.getElementsByClassName('otherChange');
			for (var j = 0; j < otherChange.length; ++j) {
				otherChange[j].textContent = '';
			}

			var staminaDiscountCheck = doc.getElementById('ft_stamina_discount_check');
			if (staminaDiscountCheck.checked) {
				FoxtrickPrefs.setBool('MatchSimulator.staminaDiscountOn', true);
				ft_stamina_discount();
			}
			else {
				FoxtrickPrefs.setBool('MatchSimulator.staminaDiscountOn', false);
			}

			for (var i = 0; i < 7; ++i) {
				if (oldRatings[i] !== undefined) {
					var id = 'ft-full-level' + i;
					var div = doc.getElementById(id);
					var diff = currentRatings[i] - oldRatings[i];

					var span = doc.createElement('span');
					span.textContent = ' (' + diff.toFixed(2) + ')';
					if (diff < 0) {
						span.className = 'colorLower ratingChange';
						div.appendChild(span);
					}
					else if (diff > 0) {
						span.className = 'colorHigher ratingChange';
						div.appendChild(span);
					}
				}
			}

			updateBarsAndHTMSPrediction();

			if (updateOther && currentMatchXML)
				updateOtherRatings(currentMatchXML, currentOtherTeamID, currentHomeAway);

			// keep it visible till closed
			Foxtrick.addClass(fieldOverlay, 'visible');

			// opened first time
			if (!doc.getElementById('ft-copyRatingsButton')) {
				// close button tweaked.
				var hideOverlay = function(ev) {
					Foxtrick.removeClass(fieldOverlay, 'visible');
					var overlayHTMS = doc.getElementById('ft-overlayHTMS');
					if (overlayHTMS)
						Foxtrick.addClass(overlayHTMS, 'hidden');
				};
				Foxtrick.onClick(doc.getElementById('closeOverlay'), hideOverlay);

				// add copy button
				var copyButton = doc.createElement('input');
				copyButton.type = 'button';
				copyButton.value = Foxtrickl10n.getString('button.copy');
				copyButton.id = 'ft-copyRatingsButton';
				fieldOverlay.appendChild(copyButton);
				Foxtrick.onClick(copyButton, copyRatings);

				// display selection of matches to compare to
				// first, get team id of other team
				var loadingOtherMatches = Foxtrick.util.note.createLoading(doc);
				var overlayHTMS = doc.getElementById('ft-overlayHTMS');
				if (overlayHTMS)
					overlayHTMS.appendChild(loadingOtherMatches);
				else
					doc.getElementById('field').appendChild(loadingOtherMatches);

				var matchid = Foxtrick.util.id.getMatchIdFromUrl(doc.location.href);
				var SourceSystem = 'Hattrick';
				if (isHTOIntegrated)
					SourceSystem = 'HTOIntegrated';
				var orderMatchArgs = [
					['file', 'matchdetails'],
					['version', '2.3'],
					['matchID', matchid],
					['SourceSystem', SourceSystem]
				];

				Foxtrick.util.api.retrieve(doc, orderMatchArgs, { cache_lifetime: 'session' },
				  function(orderMatchXml, errorText) {
					if (errorText) {
						if (loadingOtherMatches && loadingOtherMatches.parentNode) {
							loadingOtherMatches.parentNode.removeChild(loadingOtherMatches);
							loadingOtherMatches = null;
						}
						Foxtrick.log(errorText);
						return;
					}
					// determine otherTeamId
					var HomeTeamID = Number(orderMatchXml.getElementsByTagName('HomeTeamID')[0]
					                        .textContent);
					var AwayTeamID = Number(orderMatchXml.getElementsByTagName('AwayTeamID')[0]
					                        .textContent);
					var h2 = doc.getElementById('ctl00_ctl00_CPContent_divStartMain').getElementsByTagName('h2')[0];
					var thisTeamID = Foxtrick.util.id
						.getTeamIdFromUrl(h2.getElementsByTagName('a')[0].href);
					if (thisTeamID == HomeTeamID) {
						isHome = true;
						var otherTeamID = AwayTeamID;
						teamNames[0] = orderMatchXml.getElementsByTagName('HomeTeamName')[0]
							.textContent;
						teamNames[1] = orderMatchXml.getElementsByTagName('AwayTeamName')[0]
							.textContent;
					}
					else {
						isHome = false;
						var otherTeamID = HomeTeamID;
						teamNames[1] = orderMatchXml.getElementsByTagName('HomeTeamName')[0]
							.textContent;
						teamNames[0] = orderMatchXml.getElementsByTagName('AwayTeamName')[0]
							.textContent;
					}

					// now get other teams matches
					var otherMatchesArgs = [
						['file', 'matchesarchive'],
						['teamID', otherTeamID]
					];
					if (isHTOIntegrated)
						otherMatchesArgs.push(['SourceSystem', 'HTOIntegrated']);

					Foxtrick.util.api.retrieve(doc, otherMatchesArgs, { cache_lifetime: 'session' },
					  function(otherMatchesXml, errorText) {
						if (errorText) {
							Foxtrick.log(errorText);
							if (loadingOtherMatches)
								loadingOtherMatches.textContent = errorText;
						}
						else if (loadingOtherMatches && loadingOtherMatches.parentNode) {
							loadingOtherMatches.parentNode.removeChild(loadingOtherMatches);
							loadingOtherMatches = null;
						}

						var getMatchDetails =
						  function(selectedMatchid, SourceSystem, homeAway, isNew) {
							if (loadingOtherMatches && loadingOtherMatches.parentNode) {
								loadingOtherMatches.parentNode.removeChild(loadingOtherMatches);
								loadingOtherMatches = null;
							}

							// get selected match
							var loading;
							if (loading = doc.getElementById('loadingMatchID')) {
									loading.parentNode.removeChild(loading);
								}
							var loadingMatch = Foxtrick.util.note.createLoading(doc);
							loadingMatch.id = 'loadingMatchID';
							var overlayHTMS = doc.getElementById('ft-overlayHTMS');
							if (overlayHTMS)
								overlayHTMS.insertBefore(loadingMatch, overlayHTMS.firstChild);
							else
								doc.getElementById('field').appendChild(loadingMatch);

							var selectedMatchArgs = [
								['file', 'matchdetails'],
								['version', '2.3'],
								['matchID', selectedMatchid],
								['SourceSystem', SourceSystem]
							];
							Foxtrick.util.api.retrieve(doc, selectedMatchArgs,
							                           { cache_lifetime: 'session' },
							  function(selectedMatchXML, errorText) {
								if (errorText) {
									if (loadingMatch && loadingMatch.parentNode) {
										loadingMatch.textContent = errorText;
									}
									Foxtrick.log(errorText);
									return;
								}
								if (loadingMatch && loadingMatch.parentNode) {
									loadingMatch.parentNode.removeChild(loadingMatch);
									loadingMatch = null;
								}
								// update match select
								if (isNew) {
									var option = doc.createElement('option');
									option.value = selectedMatchXML
										.getElementsByTagName('MatchID')[0].textContent;
									option.setAttribute('SourceSystem', SourceSystem);
									option.setAttribute('homeAway', homeAway);
									var MatchType = Number(selectedMatchXML
									                       .getElementsByTagName('MatchType')[0]
									                       .textContent);
									option.className = 'ftOptionIcon ' + Foxtrick.modules
										.MatchSimulator.MatchTypes[MatchType].className;
									var MatchDate =
										Foxtrick.util.time.buildDate(Foxtrick.util.time
											.getDateFromText(selectedMatchXML
												.getElementsByTagName('MatchDate')[0].textContent,
												'yyyy-mm-dd'));
									var howeAwayStr =
										Foxtrickl10n.getString('matchOrder.default.abbr');
									if (homeAway == 'home')
										howeAwayStr = Foxtrickl10n.getString('matchOrder.home.abbr');
									if (homeAway == 'away')
										howeAwayStr = Foxtrickl10n.getString('matchOrder.away.abbr');
									option.textContent =
										howeAwayStr + ': ' + MatchDate + ': ' + selectedMatchXML
										.getElementsByTagName('HomeTeamName')[0].textContent
										.substr(0, 20) + ' ' + selectedMatchXML
										.getElementsByTagName('HomeGoals')[0].textContent + ' - ' +
										selectedMatchXML.getElementsByTagName('AwayGoals')[0]
										.textContent + ' ' +
										selectedMatchXML.getElementsByTagName('AwayTeamName')[0]
										.textContent.substr(0, 20);
									select.appendChild(option);
									select.selectedIndex = select.options.length - 1;
								}
								currentMatchXML = selectedMatchXML;
								currentHomeAway = homeAway;
								currentOtherTeamID = otherTeamID;
								updateOtherRatings(selectedMatchXML, otherTeamID, homeAway);

								updateBarsAndHTMSPrediction();
							});
						};

						var select = doc.createElement('select');
						select.id = 'ft-matchSelect';
						var option = doc.createElement('option');
						option.value = -1;
						option.textContent = Foxtrickl10n.getString('matchOrder.noMatchSelected');
						select.appendChild(option);

						var option = doc.createElement('option');
						option.value = 0;
						option.textContent = Foxtrickl10n.getString('matchOrder.AddMatchManually');
						select.appendChild(option);

						var otherMatchesNodes = otherMatchesXml.getElementsByTagName('Match');
						if (otherMatchesNodes) {
							for (var i = 0; i < otherMatchesNodes.length; ++i) {

								// not friendlies for now to keep it clean
								var SourceSystem = 'Hattrick';
								//otherMatchesNodes[i].getElementsByTagName('SourceSystem')[0]
								//	.textContent;
								var MatchType = Number(otherMatchesNodes[i]
								                       .getElementsByTagName('MatchType')[0]
								                       .textContent);
								if (MatchType != 1 && MatchType != 2 && MatchType != 3 &&
								    MatchType != 50 && MatchType != 51) {
									continue;
								}
								var option = doc.createElement('option');
								option.value = otherMatchesNodes[i]
									.getElementsByTagName('MatchID')[0].textContent;
								option.setAttribute('SourceSystem', SourceSystem);
								option.className = 'ftOptionIcon ' +
									Foxtrick.modules.MatchSimulator.MatchTypes[MatchType].className;
								var MatchDate =
									Foxtrick.util.time.buildDate(Foxtrick.util.time
										.getDateFromText(otherMatchesNodes[i]
										                 .getElementsByTagName('MatchDate')[0]
										                 .textContent, 'yyyy-mm-dd'));
								option.textContent =
									MatchDate + ': ' + otherMatchesNodes[i]
									.getElementsByTagName('HomeTeamName')[0]
									.textContent.substr(0, 20) + ' - ' +
									otherMatchesNodes[i].getElementsByTagName('HomeGoals')[0]
									.textContent + ':' + otherMatchesNodes[i]
									.getElementsByTagName('AwayGoals')[0].textContent + ' - ' +
									otherMatchesNodes[i].getElementsByTagName('AwayTeamName')[0]
									.textContent.substr(0, 20);
								select.appendChild(option);
							}
						}

						// on selecting a match, matchid and get ratings if appropriate
						var onMatchSelect = function(ev) {
							var selectedMatchid = Number(select.value);
							var SourceSystem = select.options[select.selectedIndex].getAttribute('SourceSystem');
							var homeAway = select.options[select.selectedIndex].getAttribute('homeAway');
							// if no match selected, cleanup old ratings display
							// reset currentRatingsOther, so percentBars and htms gets cleaned as well
							if (selectedMatchid == -1) {
								var otherWrappers = fieldOverlay
									.getElementsByClassName('ft-otherWrapper');
								var otherWrapper, count = 0;
								while (otherWrapper = otherWrappers[0]) {
									otherWrapper.parentNode.removeChild(otherWrapper);
									currentRatingsOther[count++] = undefined;
								}
								var tacticLevelLabelOther =
									doc.getElementById('tacticLevelLabelOther');
								tacticLevelLabelOther.parentNode.removeChild(tacticLevelLabelOther);

								updateBarsAndHTMSPrediction();

								return;
							}
							// add a matchid manually
							else if (selectedMatchid == 0) {
								Foxtrick.addClass(ev.target, 'hidden');
								var addMatchDiv = doc.getElementById('addMatchDiv');
								Foxtrick.removeClass(addMatchDiv, 'hidden');
								return;
							}

							getMatchDetails(selectedMatchid, SourceSystem, homeAway);
						};

						Foxtrick.listen(select, 'change', onMatchSelect, false);
						fieldOverlay.appendChild(select);

						// manual add a match
						var addMatchDiv = doc.createElement('addMatchDiv');
						addMatchDiv.className = 'hidden';
						addMatchDiv.id = 'addMatchDiv';
						fieldOverlay.appendChild(addMatchDiv);

						var addMatchText = doc.createElement('input');
						addMatchText.id = 'addMatchText';
						addMatchText.type = 'text';
						if (oldLineupId) {
							addMatchText.value = oldLineupId;
							Foxtrick.removeClass(addMatchDiv, 'hidden');
							Foxtrick.addClass(select, 'hidden');
						}
						addMatchText.setAttribute('size', '10');
						addMatchDiv.appendChild(addMatchText);

						var addMatchHomeAwayLabel = doc.createElement('label');
						addMatchHomeAwayLabel.id = 'addMatchhomeAwayLabel';
						addMatchHomeAwayLabel.textContent =
							Foxtrickl10n.getString('matchOrder.homeAway.abbr');
						addMatchHomeAwayLabel.title = Foxtrickl10n.getString('matchOrder.homeAway');
						addMatchDiv.appendChild(addMatchHomeAwayLabel);

						var addMatchHomeAwaySelect = doc.createElement('select');
						addMatchHomeAwaySelect.id = 'addMatchHomeAwaySelect';
						addMatchHomeAwaySelect.title = Foxtrickl10n.getString('matchOrder.homeAway');
						addMatchDiv.appendChild(addMatchHomeAwaySelect);

						var addMatchOption = doc.createElement('option');
						addMatchOption.value = 'default';
						addMatchOption.textContent = Foxtrickl10n.getString('matchOrder.default');
						addMatchHomeAwaySelect.appendChild(addMatchOption);
						var addMatchOption = doc.createElement('option');
						addMatchOption.value = 'home';
						addMatchOption.textContent = Foxtrickl10n.getString('matchOrder.home');
						addMatchHomeAwaySelect.appendChild(addMatchOption);
						var addMatchOption = doc.createElement('option');
						addMatchOption.value = 'away';
						addMatchOption.textContent = Foxtrickl10n.getString('matchOrder.away');
						addMatchHomeAwaySelect.appendChild(addMatchOption);

						var addMatchCheck = doc.createElement('input');
						addMatchCheck.id = 'addMatchisHTOIntegrated';
						addMatchCheck.type = 'checkBox';
						addMatchDiv.appendChild(addMatchCheck);

						var addMatchCheckLabel = doc.createElement('label');
						addMatchCheckLabel.textContent =
							Foxtrickl10n.getString('matchOrder.tournamentMatch');
						addMatchDiv.appendChild(addMatchCheckLabel);

						var addMatchButtonOk = doc.createElement('input');
						addMatchButtonOk.id = 'addMatchButton';
						addMatchButtonOk.type = 'button';
						addMatchButtonOk.value = Foxtrickl10n.getString('button.add');
						addMatchDiv.appendChild(addMatchButtonOk);

						var addMatch = function(ev) {
							var matchid = Number(addMatchText.value);
							var SourceSystem = 'Hattrick';
							if (doc.getElementById('addMatchisHTOIntegrated').checked)
								SourceSystem = 'HTOIntegrated';
							var HomeAway = addMatchHomeAwaySelect.value;
							getMatchDetails(matchid, SourceSystem, HomeAway, true);

							Foxtrick.addClass(addMatchDiv, 'hidden');
							Foxtrick.removeClass(select, 'hidden');
						};
						Foxtrick.onClick(addMatchButtonOk, addMatch);

						var addMatchButtonCancel = doc.createElement('input');
						addMatchButtonCancel.id = 'addMatchButtonCancel';
						addMatchButtonCancel.type = 'button';
						addMatchButtonCancel.value = Foxtrickl10n.getString('button.cancel');
						addMatchDiv.appendChild(addMatchButtonCancel);

						var addMatchCancel = function(ev) {
							Foxtrick.addClass(addMatchDiv, 'hidden');
							Foxtrick.removeClass(select, 'hidden');
							select.selectedIndex = 0;
							//onMatchSelect();
						};
						Foxtrick.onClick(addMatchButtonCancel, addMatchCancel);
					});
				});
			}
			//Foxtrick.addMutationEventListener(fieldOverlay, 'DOMNodeInserted', showLevelNumbers, false);
		};

		// old lineup import click
		Foxtrick.onClick(doc.getElementById('oldLineups'), function(ev) {
			var savedLineupNode = ev.target;
			if (!Foxtrick.hasClass(savedLineupNode, 'savedLineup'))
				savedLineupNode = savedLineupNode.parentNode;
			if (!Foxtrick.hasClass(savedLineupNode, 'savedLineup'))
				savedLineupNode = savedLineupNode.parentNode;
			if (!Foxtrick.hasClass(savedLineupNode, 'savedLineup'))
				return;
			oldLineupId = savedLineupNode.id.match(/matchlineup_(\d+)/)[1];

			var addMatchText = doc.getElementById('addMatchText');
			if (addMatchText) {
				addMatchText.value = oldLineupId;
				Foxtrick.removeClass(doc.getElementById('addMatchDiv'), 'hidden');
				Foxtrick.addClass(doc.getElementById('ft-matchSelect'), 'hidden');
			}
		});

		// -- stamina discount --
		function getStaminaFactor(stamina, staminaPrediction) {
			// formula by lizardopoli/Senzascrupoli/Pappagallopoli et al
			// [post=15917246.1]
			// latest data:
			// https://docs.google.com/file/d/0Bzy0IjRlxhtxaGp0VXlmNjljaTA/edit?usp=sharing

			if (staminaPrediction !== null) {
				if (parseInt(staminaPrediction, 10) == stamina)
					stamina = staminaPrediction;
				else {
					// our prediction data is inaccurate
					// assume high subskill if stamina is lower
					// assume low subskill otherwise
					if (stamina < staminaPrediction)
						stamina += 0.99;
				}
			}
			else
				stamina += 0.5; // assuming average subskill by default

			var checkpoint, currentEnergy, decay, initialEnergy, rest, totalEnergy, _i;
			if (stamina >= 8.63) {
				return 1;
			}
			totalEnergy = 0;
			initialEnergy = 1 + (0.0292 * stamina + 0.05);
			if (stamina > 8) {
				initialEnergy += 0.15 * (stamina - 8);
			}
			decay = Math.max(0.0325, -0.0039 * stamina + 0.0634);
			rest = 0.1875;
			for (checkpoint = _i = 1; _i <= 18; checkpoint = ++_i) {
				currentEnergy = initialEnergy - checkpoint * decay;
				if (checkpoint > 9) {
					currentEnergy += rest;
				}
				currentEnergy = Math.min(1, currentEnergy);
				totalEnergy += currentEnergy;
			}
			return totalEnergy / 18;
			//http://www.nrgjack.altervista.org/wordpress/2008/07/31/percentuale-resistenza/
			//return 0.2472 * Math.log(stamina) + 0.472;
			// from unwritten manual [post=15172393.4] (HO)
			//return Math.pow( Math.min(stamina+(14-parseFloat(FoxtrickPrefs.getString('staminaCutoff'))), 15.25)/14, 0.6)/1.05265;
			//Foxtrick.log(stamina, (1-0.0072415286*Math.pow(9-stamina,1.9369819898)))
			// from http: //imageshack.us/photo/my-images/854/contributiontablestamin.png/
			//return (1-0.0072415286*Math.pow(9-stamina,1.9369819898));
		}

		var contributions = [
			{p: 0, t: 'n', c: [		{s: 1, sk: 'gk', v: 0.866},	{s: 1, sk: 'df', v: 0.425},	{s: 0, sk: 'gk', v: 0.597},	{s: 2, sk: 'ke', v: 0.597},	{s: 0, sk: 'df', v: 0.276},	{s: 2, sk: 'df', v: 0.276},									]},
			{p: 3, t: 'n', c: [	{s: 3, sk: 'pm', v: 0.236},		{s: 1, sk: 'df', v: 1.000},			{s: 0, sk: 'df', v: 0.260},	{s: 2, sk: 'df', v: 0.260},									]},
			{p: 3, t: 'o', c: [	{s: 3, sk: 'pm', v: 0.318},		{s: 1, sk: 'df', v: 0.725},			{s: 0, sk: 'df', v: 0.190},	{s: 2, sk: 'df', v: 0.190},									]},
			{p: 2, t: 'n', c: [	{s: 3, sk: 'pm', v: 0.236},		{s: 1, sk: 'df', v: 1.000},			{s: 0, sk: 'df', v: 0.516},										]},
			{p: 2, t: 'tw', c: [	{s: 3, sk: 'pm', v: 0.165},		{s: 1, sk: 'df', v: 0.778},			{s: 0, sk: 'df', v: 0.711},				{s: 4, sk: 'wi', v: 0.246},						]},
			{p: 2, t: 'o', c: [	{s: 3, sk: 'pm', v: 0.318},		{s: 1, sk: 'df', v: 0.725},			{s: 0, sk: 'df', v: 0.378},										]},
			{p: 4, t: 'n', c: [	{s: 3, sk: 'pm', v: 0.236},		{s: 1, sk: 'df', v: 1.000},				{s: 2, sk: 'df', v: 0.516},									]},
			{p: 4, t: 'tw', c: [	{s: 3, sk: 'pm', v: 0.165},		{s: 1, sk: 'df', v: 0.778},				{s: 2, sk: 'df', v: 0.711},				{s: 6, sk: 'wi', v: 0.246},					]},
			{p: 4, t: 'o', c: [	{s: 3, sk: 'pm', v: 0.318},		{s: 1, sk: 'df', v: 0.725},				{s: 2, sk: 'df', v: 0.378},									]},
			{p: 1, t: 'n', c: [	{s: 3, sk: 'pm', v: 0.167},		{s: 1, sk: 'df', v: 0.450},			{s: 0, sk: 'df', v: 0.919},				{s: 4, sk: 'wi', v: 0.506},						]},
			{p: 1, t: 'd', c: [	{s: 3, sk: 'pm', v: 0.066},		{s: 1, sk: 'df', v: 0.479},			{s: 0, sk: 'df', v: 1.000},				{s: 4, sk: 'wi', v: 0.323},						]},
			{p: 1, t: 'tm', c: [	{s: 3, sk: 'pm', v: 0.167},		{s: 1, sk: 'df', v: 0.683},			{s: 0, sk: 'df', v: 0.687},				{s: 4, sk: 'wi', v: 0.279},						]},
			{p: 1, t: 'o', c: [	{s: 3, sk: 'pm', v: 0.230},		{s: 1, sk: 'df', v: 0.382},			{s: 0, sk: 'df', v: 0.698},				{s: 4, sk: 'wi', v: 0.618},						]},
			{p: 5, t: 'n', c: [	{s: 3, sk: 'pm', v: 0.167},		{s: 1, sk: 'df', v: 0.450},				{s: 2, sk: 'df', v: 0.919},				{s: 6, sk: 'wi', v: 0.506},					]},
			{p: 5, t: 'd', c: [	{s: 3, sk: 'pm', v: 0.066},		{s: 1, sk: 'df', v: 0.479},				{s: 2, sk: 'df', v: 1.000},				{s: 6, sk: 'wi', v: 0.323},					]},
			{p: 5, t: 'tm', c: [	{s: 3, sk: 'pm', v: 0.167},		{s: 1, sk: 'df', v: 0.683},				{s: 2, sk: 'df', v: 0.687},				{s: 6, sk: 'wi', v: 0.279},					]},
			{p: 5, t: 'o', c: [	{s: 3, sk: 'pm', v: 0.230},		{s: 1, sk: 'df', v: 0.382},				{s: 2, sk: 'df', v: 0.698},				{s: 6, sk: 'wi', v: 0.618},					]},
			{p: 8, t: 'n', c: [	{s: 3, sk: 'pm', v: 1.000},		{s: 1, sk: 'df', v: 0.400},			{s: 0, sk: 'df', v: 0.095},	{s: 2, sk: 'df', v: 0.095},		{s: 5, sk: 'ps', v: 0.325},			{s: 4, sk: 'ps', v: 0.110},	{s: 6, sk: 'ps', v: 0.110},			]},
			{p: 8, t: 'o', c: [	{s: 3, sk: 'pm', v: 0.944},		{s: 1, sk: 'df', v: 0.216},			{s: 0, sk: 'df', v: 0.051},	{s: 2, sk: 'df', v: 0.051},		{s: 5, sk: 'ps', v: 0.483},			{s: 4, sk: 'ps', v: 0.110},	{s: 6, sk: 'ps', v: 0.110},			]},
			{p: 8, t: 'd', c: [	{s: 3, sk: 'pm', v: 0.944},		{s: 1, sk: 'df', v: 0.594},			{s: 0, sk: 'df', v: 0.135},	{s: 2, sk: 'df', v: 0.135},		{s: 5, sk: 'ps', v: 0.219},			{s: 4, sk: 'ps', v: 0.070},	{s: 6, sk: 'ps', v: 0.070},			]},
			{p: 7, t: 'n', c: [	{s: 3, sk: 'pm', v: 1.000},		{s: 1, sk: 'df', v: 0.400},			{s: 0, sk: 'df', v: 0.189},			{s: 5, sk: 'ps', v: 0.325},			{s: 4, sk: 'ps', v: 0.218},				]},
			{p: 7, t: 'o', c: [	{s: 3, sk: 'pm', v: 0.944},		{s: 1, sk: 'df', v: 0.216},			{s: 0, sk: 'df', v: 0.102},			{s: 5, sk: 'ps', v: 0.483},			{s: 4, sk: 'ps', v: 0.216},				]},
			{p: 7, t: 'd', c: [	{s: 3, sk: 'pm', v: 0.944},		{s: 1, sk: 'df', v: 0.594},			{s: 0, sk: 'df', v: 0.270},			{s: 5, sk: 'ps', v: 0.219},			{s: 4, sk: 'ps', v: 0.140},				]},
			{p: 7, t: 'tw', c: [	{s: 3, sk: 'pm', v: 0.881},		{s: 1, sk: 'df', v: 0.348},			{s: 0, sk: 'df', v: 0.291},			{s: 5, sk: 'ps', v: 0.227},	{s: 4, sk: 'wi', v: 0.494},		{s: 4, sk: 'ps', v: 0.271},				]},
			{p: 9, t: 'n', c: [	{s: 3, sk: 'pm', v: 1.000},		{s: 1, sk: 'df', v: 0.400},				{s: 2, sk: 'df', v: 0.189},		{s: 5, sk: 'ps', v: 0.325},				{s: 6, sk: 'ps', v: 0.218},			]},
			{p: 9, t: 'o', c: [	{s: 3, sk: 'pm', v: 0.944},		{s: 1, sk: 'df', v: 0.216},				{s: 2, sk: 'df', v: 0.102},		{s: 5, sk: 'ps', v: 0.483},				{s: 6, sk: 'ps', v: 0.216},			]},
			{p: 9, t: 'd', c: [	{s: 3, sk: 'pm', v: 0.944},		{s: 1, sk: 'df', v: 0.594},				{s: 2, sk: 'df', v: 0.270},		{s: 5, sk: 'ps', v: 0.219},				{s: 6, sk: 'ps', v: 0.140},			]},
			{p: 9, t: 'tw', c: [	{s: 3, sk: 'pm', v: 0.881},		{s: 1, sk: 'df', v: 0.348},				{s: 2, sk: 'df', v: 0.291},		{s: 5, sk: 'ps', v: 0.227},		{s: 6, sk: 'wi', v: 0.494},		{s: 6, sk: 'ps', v: 0.271},			]},
			{p: 6, t: 'n', c: [	{s: 3, sk: 'pm', v: 0.455},		{s: 1, sk: 'df', v: 0.201},			{s: 0, sk: 'df', v: 0.349},			{s: 5, sk: 'ps', v: 0.104},	{s: 4, sk: 'wi', v: 0.854},		{s: 4, sk: 'ps', v: 0.210},				]},
			{p: 6, t: 'o', c: [	{s: 3, sk: 'pm', v: 0.381},		{s: 1, sk: 'df', v: 0.085},			{s: 0, sk: 'df', v: 0.180},			{s: 5, sk: 'ps', v: 0.135},	{s: 4, sk: 'wi', v: 1.000},		{s: 4, sk: 'ps', v: 0.246},				]},
			{p: 6, t: 'tm', c: [	{s: 3, sk: 'pm', v: 0.574},		{s: 1, sk: 'df', v: 0.244},			{s: 0, sk: 'df', v: 0.284},			{s: 5, sk: 'ps', v: 0.148},	{s: 4, sk: 'wi', v: 0.564},		{s: 4, sk: 'ps', v: 0.133},				]},
			{p: 6, t: 'd', c: [	{s: 3, sk: 'pm', v: 0.381},		{s: 1, sk: 'df', v: 0.264},			{s: 0, sk: 'df', v: 0.485},			{s: 5, sk: 'ps', v: 0.052},	{s: 4, sk: 'wi', v: 0.723},		{s: 4, sk: 'ps', v: 0.173},				]},
			{p: 10, t: 'n', c: [	{s: 3, sk: 'pm', v: 0.455},		{s: 1, sk: 'df', v: 0.201},				{s: 2, sk: 'df', v: 0.349},		{s: 5, sk: 'ps', v: 0.104},		{s: 6, sk: 'wi', v: 0.854},		{s: 6, sk: 'ps', v: 0.210},			]},
			{p: 10, t: 'o', c: [	{s: 3, sk: 'pm', v: 0.381},		{s: 1, sk: 'df', v: 0.085},				{s: 2, sk: 'df', v: 0.180},		{s: 5, sk: 'ps', v: 0.135},		{s: 6, sk: 'wi', v: 1.000},		{s: 6, sk: 'ps', v: 0.246},			]},
			{p: 10, t: 'tm', c: [	{s: 3, sk: 'pm', v: 0.574},		{s: 1, sk: 'df', v: 0.244},				{s: 2, sk: 'df', v: 0.284},		{s: 5, sk: 'ps', v: 0.148},		{s: 6, sk: 'wi', v: 0.564},		{s: 6, sk: 'ps', v: 0.133},			]},
			{p: 10, t: 'd', c: [	{s: 3, sk: 'pm', v: 0.381},		{s: 1, sk: 'df', v: 0.264},				{s: 2, sk: 'df', v: 0.485},		{s: 5, sk: 'ps', v: 0.052},		{s: 6, sk: 'wi', v: 0.723},		{s: 6, sk: 'ps', v: 0.173},			]},
			{p: 12, t: 'n', c: [								{s: 5, sk: 'sc', v: 1.000},	{s: 5, sk: 'ps', v: 0.369},	{s: 4, sk: 'wi', v: 0.190},	{s: 6, sk: 'wi', v: 0.190},	{s: 4, sk: 'ps', v: 0.122},	{s: 6, sk: 'ps', v: 0.122},	{s: 4, sk: 'sc', v: 0.224},	{s: 6, sk: 'sc', v: 0.224},	]},
			{p: 12, t: 'd', c: [	{s: 3, sk: 'pm', v: 0.406},							{s: 5, sk: 'sc', v: 0.583},	{s: 5, sk: 'ps', v: 0.543},	{s: 4, sk: 'wi', v: 0.124},	{s: 6, sk: 'wi', v: 0.124},	{s: 4, sk: 'ps', v: 0.215},	{s: 6, sk: 'ps', v: 0.215},	{s: 4, sk: 'sc', v: 0.109},	{s: 6, sk: 'sc', v: 0.109},	]},
			{p: 11, t: 'n', c: [								{s: 5, sk: 'sc', v: 1.000},	{s: 5, sk: 'ps', v: 0.369},	{s: 4, sk: 'wi', v: 0.190},	{s: 6, sk: 'wi', v: 0.190},	{s: 4, sk: 'ps', v: 0.122},	{s: 6, sk: 'ps', v: 0.122},	{s: 4, sk: 'sc', v: 0.224},	{s: 6, sk: 'sc', v: 0.224},	]},
			{p: 11, t: 'd', c: [	{s: 3, sk: 'pm', v: 0.406},							{s: 5, sk: 'sc', v: 0.583},	{s: 5, sk: 'ps', v: 0.543},	{s: 4, sk: 'wi', v: 0.124},	{s: 6, sk: 'wi', v: 0.124},	{s: 4, sk: 'ps', v: 0.215},	{s: 6, sk: 'ps', v: 0.215},	{s: 4, sk: 'sc', v: 0.109},	{s: 6, sk: 'sc', v: 0.109},	]},
			{p: 11, t: 'tw', c: [								{s: 5, sk: 'sc', v: 0.607},	{s: 5, sk: 'ps', v: 0.261},	{s: 4, sk: 'wi', v: 0.174},	{s: 6, sk: 'wi', v: 0.522},	{s: 4, sk: 'ps', v: 0.060},	{s: 6, sk: 'ps', v: 0.180},	{s: 4, sk: 'sc', v: 0.150},	{s: 6, sk: 'sc', v: 0.451},	]},
			{p: 13, t: 'n', c: [								{s: 5, sk: 'sc', v: 1.000},	{s: 5, sk: 'ps', v: 0.369},	{s: 4, sk: 'wi', v: 0.190},	{s: 6, sk: 'wi', v: 0.190},	{s: 4, sk: 'ps', v: 0.122},	{s: 6, sk: 'ps', v: 0.122},	{s: 4, sk: 'sc', v: 0.224},	{s: 6, sk: 'sc', v: 0.224},	]},
			{p: 13, t: 'd', c: [	{s: 3, sk: 'pm', v: 0.406},							{s: 5, sk: 'sc', v: 0.583},	{s: 5, sk: 'ps', v: 0.543},	{s: 4, sk: 'wi', v: 0.124},	{s: 6, sk: 'wi', v: 0.124},	{s: 4, sk: 'ps', v: 0.215},	{s: 6, sk: 'ps', v: 0.215},	{s: 4, sk: 'sc', v: 0.109},	{s: 6, sk: 'sc', v: 0.109},	]},
			{p: 13, t: 'tw', c: [								{s: 5, sk: 'sc', v: 0.607},	{s: 5, sk: 'ps', v: 0.261},	{s: 4, sk: 'wi', v: 0.522},	{s: 6, sk: 'wi', v: 0.174},	{s: 4, sk: 'ps', v: 0.180},	{s: 6, sk: 'ps', v: 0.060},	{s: 4, sk: 'sc', v: 0.451},	{s: 6, sk: 'sc', v: 0.150},	]},
		];

		var tactics = {
			normal: 'n',
			middle: 'tm',
			wing: 'tw',
			offensive: 'o',
			defensive: 'd'
		};

		var skills = {
			df: 'defending',
			gk: 'keeper',
			ps: 'passing',
			pm: 'playmaking',
			sc: 'scoring',
			sp: 'setpieces',
			wi: 'winger'
		};

		var ft_stamina_discount = function() {
			try {
				var overlayRatingsNums = doc.getElementsByClassName('overlayRatingsNum');
				var overlayRatings = doc.getElementsByClassName('overlayRatings');
				var overlayRatingsDiscounted =
					doc.getElementsByClassName('overlayRatingsDiscounted');
				var playerdivs =
					doc.getElementById('fieldplayers').getElementsByClassName('position');
				for (var sector = 0; sector < overlayRatingsNums.length; ++sector) {
					var old_rating = orgRatings[sector];
					var sum_sq_c_ij_times_func_of_s_i = 0;
					var sum_sq_c_ij = 0;
					for (var position = 0; position < 14; ++position) {
						var player = {};
						player.stamina = Number(playerdivs[position].getAttribute('stamina'));
						if (!player.stamina)
							continue;
						player.id = Number(playerdivs[position].getAttribute('playerId'));
						if (typeof (staminaData) == 'object' &&
							staminaData.hasOwnProperty(player.id)) {
							player.staminaPrediction = parseFloat(staminaData[player.id][1]);
						}
						else
							player.staminaPrediction = null;

						var tactic = 'normal', t;
						for (t in tactics) {
							if (Foxtrick.hasClass(playerdivs[position], t)) {
								tactic = t;
							}
						}

						for (var i = 0; i < contributions.length; ++i) {
							if (contributions[i].p == position &&
							    contributions[i].t == tactics[tactic]) {
								for (var j = 0; j < contributions[i].c.length; ++j) {
									if (contributions[i].c[j].s == sector) {
										var sq_c_ij = contributions[i].c[j].v * contributions[i].c[j].v;
										sum_sq_c_ij_times_func_of_s_i += sq_c_ij *
											getStaminaFactor(player.stamina, player.staminaPrediction);
										sum_sq_c_ij += sq_c_ij;
									}
								}
							}
						}
					}
					var new_rating = old_rating * sum_sq_c_ij_times_func_of_s_i / sum_sq_c_ij;
					var new_rating_rounded = Math.floor((new_rating + 0.125) * 4.0) / 4.0;
					var div = doc.createElement('div');
					div.className = 'overlayRatingsDiscounted';
					overlayRatings[sector * 2 + 1].parentNode
						.insertBefore(div, overlayRatings[sector * 2 + 1].nextSibling);
					div.textContent = Foxtrickl10n.getFullLevelByValue(new_rating_rounded);
					Foxtrick.addClass(overlayRatings[sector * 2 + 1], 'hidden');
					overlayRatingsNums[sector].textContent = '[' + new_rating.toFixed(2) + ']';
					currentRatings[sector] = new_rating;
				}
			} catch (e) {
				Foxtrick.log(e);
			}
		};

		Foxtrick.addMutationEventListener(fieldOverlay, 'DOMNodeInserted', showLevelNumbers, false);


		// stamina discount
		var optionsDiv = Foxtrick.createFeaturedElement(doc, this, 'div');
		optionsDiv.id = 'ft_matchsimulator_options';
		optionsDiv.className = 'overlaySector overlayMidfield';
		var fieldOverlay = doc.getElementById('fieldOverlay');
		fieldOverlay.appendChild(optionsDiv);

		var optionsDivElm = doc.createElement('div');
		optionsDiv.appendChild(optionsDivElm);

		var staminaDiscountCheck = doc.createElement('input');
		staminaDiscountCheck.id = 'ft_stamina_discount_check';
		staminaDiscountCheck.type = 'checkbox';

		if (FoxtrickPrefs.getBool('MatchSimulator.staminaDiscountOn'))
			staminaDiscountCheck.checked = 'checked';
		Foxtrick.onClick(staminaDiscountCheck, showLevelNumbers);
		optionsDivElm.appendChild(staminaDiscountCheck);

		var staminaDiscountLabel = doc.createElement('label');
		staminaDiscountLabel.setAttribute('for', 'ft_stamina_discount_check');
		staminaDiscountLabel.textContent = Foxtrickl10n.getString('matchOrder.staminaDiscount');
		staminaDiscountLabel.setAttribute('title',
		                                  Foxtrickl10n.getString('matchOrder.staminaDiscount.title'));
		optionsDivElm.appendChild(staminaDiscountLabel);

		var optionsDivElm = doc.createElement('div');
		optionsDiv.appendChild(optionsDivElm);
		var attVsDefCheck = doc.createElement('input');
		attVsDefCheck.id = 'ft_attVsDef_check';
		attVsDefCheck.type = 'checkbox';
		if (FoxtrickPrefs.getBool('MatchSimulator.attVsDefOn'))
			attVsDefCheck.checked = 'checked';
		Foxtrick.onClick(attVsDefCheck, showLevelNumbers);
		optionsDivElm.appendChild(attVsDefCheck);

		var attVsDefLabel = doc.createElement('label');
		attVsDefLabel.setAttribute('for', 'ft_attVsDef_check');
		attVsDefLabel.textContent = Foxtrickl10n.getString('matchOrder.attVsDef');
		attVsDefLabel.setAttribute('title', Foxtrickl10n.getString('matchOrder.attVsDef.title'));
		optionsDivElm.appendChild(attVsDefLabel);

		Foxtrick.util.inject.jsLink(doc, Foxtrick.InternalPath + 'resources/js/matchSimulator.js');

		if (useRatings || useHTMS) {
			var overlayBottom = doc.createElement('div');
			fieldOverlay.appendChild(overlayBottom).id = 'ft-overlayBottom';
		}

		// ratings
		if (useRatings) {
			var ratingsDiv = Foxtrick.createFeaturedElement(doc, this, 'div');
			ratingsDiv.id = 'ft_simulation_ratings';
			var ratingsLabel = doc.createElement('h2');
			ratingsDiv.appendChild(ratingsLabel).textContent =
				Foxtrickl10n.getString('matchOrder.ratings');
			var ratingsTable = doc.createElement('table');
			ratingsDiv.appendChild(ratingsTable).id = 'ft_simulation_ratings_table';
			overlayBottom.appendChild(ratingsDiv);
		}

		// --- flipping ---
		var checkFlipped = function() {
			if (Foxtrick.util.layout.isFlipped(doc)) {
				Foxtrick.log('is flipped');
				Foxtrick.removeClass(fieldOverlay, 'not_flipped');
				Foxtrick.addClass(fieldOverlay, 'flipped');
			}
			else {
				Foxtrick.log('not flipped');
				Foxtrick.addClass(fieldOverlay, 'not_flipped');
				Foxtrick.removeClass(fieldOverlay, 'flipped');
			}
		};
		Foxtrick.onClick(doc.getElementById('flip_lineup'), function(ev) {
			// ff is too fast. so we cue to ensure css add been added by page already
			window.setTimeout(function () { checkFlipped(); }, 0);
		});
		checkFlipped();
	}
};
