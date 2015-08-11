'use strict';
/**
 * match-simulator.js
 * compare to other teams and simulate matches using htms
 * @author convinced, LA-MJ
 */

Foxtrick.modules.MatchSimulator = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['matchOrder'],
	RADIO_OPTIONS: ['RatingsOnTop', 'RatingsBelow', 'RatingsRight'],
	OPTIONS: ['HTMSPrediction', 'UseRatingsModule', 'StaminaPrediction'],
	CSS: Foxtrick.InternalPath + 'resources/css/match-simulator.css',

	MatchTypes: {
		1: { className: 'ftMatchLeague', title: 'League match' },
		2: { className: 'ftMatchQualification', title: 'Qualification match' },
		3: { className: 'ftMatchCup', title: 'Cup match (standard league match)' },
		4: { className: 'ftMatchFriendly', title: 'Friendly (normal rules)' },
		5: { className: 'ftMatchFriendly', title: 'Friendly (cup rules)' },
		6: {
			className: '',
			title: 'Not currently in use, but reserved for international ' +
				'competition matches with normal rules (may or may not be implemented at some ' +
				'future point).',
		},
		7: { className: 'ftMatchMasters', title: 'Hattrick Masters' },
		8: { className: 'ftMatchFriendly', title: 'International friendly (normal rules)' },
		9: { className: 'ftMatchFriendly', title: 'International friendly (cup rules)' },
		10: {
			className: 'ftUpcomingNationalIcon',
			title: 'National teams competition match (normal rules)',
		},
		11: {
			className: 'ftUpcomingNationalIcon',
			title: 'National teams competition match (cup rules)',
		},
		12: { className: 'ftMatchFriendly', title: 'National teams friendly' },
		50: { className: 'ftMatchTournament', title: 'Tournament match  (normal rules)' },
		51: { className: 'ftMatchTournament', title: 'Tournament match  (cup rules)' },
		100: { className: 'ftMatchLeague', title: 'Youth league match' },
		101: { className: 'ftMatchFriendly', title: 'Youth friendly match' },
		102: { className: '', title: 'RESERVED' },
		103: { className: 'ftMatchFriendly', title: 'Youth friendly match (cup rules)' },
		104: { className: '', title: 'RESERVED' },
		105: { className: 'ftMatchFriendly', title: 'Youth international friendly match' },
		106: {
			className: 'ftMatchFriendly',
			title: 'Youth international friendly match (Cup rules)',
		},
		107: { className: '', title: 'RESERVED' },
	},

	run: function(doc) {
		var module = this;

		var ownId = Foxtrick.util.id.getOwnTeamId();

		var isYouth = Foxtrick.Pages.Match.isYouth(doc);
		if (isYouth)
			return;

		var isHome;
		var teamNames = new Array(2); // global var to be used for HTMS
		// matchId automatically imported when loading the lineup of already played match
		var oldLineupId = null;

		var isHTOIntegrated = Foxtrick.Pages.Match.isHTOIntegrated(doc);
		var useRatings = Foxtrick.Prefs.isModuleEnabled('Ratings') &&
			Foxtrick.Prefs.isModuleOptionEnabled('MatchSimulator', 'UseRatingsModule');
		var useHTMS = Foxtrick.Prefs.isModuleOptionEnabled('MatchSimulator', 'HTMSPrediction');
		var useStaminaPred =
			Foxtrick.Prefs.isModuleOptionEnabled('MatchSimulator', 'StaminaPrediction');

		var displayOption = Foxtrick.Prefs.getInt('module.MatchSimulator.value');
		var FIELD_OVERLAY_ID = 'fieldOverlay';
		var fieldOverlay = doc.getElementById(FIELD_OVERLAY_ID);
		if (displayOption == 1)
			Foxtrick.addClass(fieldOverlay, 'displayBelow');
		else if (displayOption == 2)
			Foxtrick.addClass(fieldOverlay, 'displayRight');

		// TODO: remove once new match engine alert is gone
		var newME = doc.querySelector('#order_tabs div.alert');
		if (newME)
			Foxtrick.addClass(fieldOverlay, 'newME');

		// ratings and tactic for predicted and for selected other team's match
		var currentRatings = new Array(9), currentRatingsOther = new Array(9),
			orgRatings = new Array(9), oldRatings = new Array(9);

		var currentMatchXML = null, currentOtherTeamID = null, currentHomeAway = null;

		var normalizeRatings = function(level) {
			return Math.floor((level + 0.125) * 4) / 4;
		};

		if (useStaminaPred) {
			var staminaData = {};
			var dataText = Foxtrick.Prefs.getString('StaminaData.' + ownId);
			if (dataText) {
				try {
					staminaData = JSON.parse(dataText);
				}
				catch (e) {
					Foxtrick.log('Error parsing staminaData:', e);
				}
			}
		}

		// updating or adding HTMS prediction based on rating prediction
		// and selected match of another team
		var updateHTMSPrediction = function() {
			if (!useHTMS)
				return;

			// create or unhide overlayHTMS
			var overlayHTMS = doc.getElementById('ft-overlayHTMS');
			if (!overlayHTMS) {
				overlayHTMS = Foxtrick.createFeaturedElement(doc, module, 'div');
				overlayHTMS.id = 'ft-overlayHTMS';
				doc.getElementById('ft-overlayBottom').appendChild(overlayHTMS);
			}
			else
				Foxtrick.removeClass(overlayHTMS, 'hidden');

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
					h2.textContent = Foxtrick.L10n.getString('matchOrder.previousPrediction');
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

			// if there are numbers from other team's match,
			// collect and submit them to HTMS, else clear overlays
			if (typeof currentRatingsOther[0] !== 'undefined') {
				var tacticAbbr = ['', 'pressing', 'ca', 'aim', 'aow', 'cre', 'long'];
				var midfieldLevel = [
					normalizeRatings(currentRatings[3]) - 1,
					currentRatingsOther[3] - 1,
				];
				var rdefence = [
					normalizeRatings(currentRatings[0]) - 1,
					currentRatingsOther[6] - 1,
				];
				var cdefence = [
					normalizeRatings(currentRatings[1]) - 1,
					currentRatingsOther[5] - 1,
				];
				var ldefence = [
					normalizeRatings(currentRatings[2]) - 1,
					currentRatingsOther[4] - 1,
				];
				var rattack = [
					normalizeRatings(currentRatings[4]) - 1,
					currentRatingsOther[2] - 1,
				];
				var cattack = [
					normalizeRatings(currentRatings[5]) - 1,
					currentRatingsOther[1] - 1,
				];
				var lattack = [
					normalizeRatings(currentRatings[6]) - 1,
					currentRatingsOther[0] - 1,
				];

				var tactics = [
					tacticAbbr[currentRatings[7]],
					tacticAbbr[currentRatingsOther[7]],
				];
				var tacticsLevel = [currentRatings[8], currentRatingsOther[8]];
				var htms = Foxtrick.modules['HTMSPrediction'];
				htms.insertPrediction(
					doc, overlayHTMSCurrent,
					midfieldLevel,
					rdefence, cdefence, ldefence,
					rattack, cattack, lattack,
					tactics, tacticsLevel,
					teamNames
				);
			}
			else {
				if (overlayHTMS)
					overlayHTMS.textContent = '';
			}
		};

		// add Ratings module functionality
		var addRatingsModule = function(currentRatings, currentRatingsOther) {
			var tacticNames = ['normal', 'pressing', 'ca', 'aim', 'aow', 'creatively', 'longshots'];

			var midfieldLevel = [
				normalizeRatings(currentRatings[3]) - 1,
				currentRatingsOther[3] - 1,
			];
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

			var twoTeams = typeof currentRatingsOther[0] !== 'undefined';
			Foxtrick.modules['Ratings'].addRatings(
				doc, newTable,
				midfieldLevel,
				rdefence, cdefence, ldefence,
				rattack, cattack, lattack,
				tactics, tacticsLevel,
				twoTeams
			);

			ratingsTable.parentNode.replaceChild(newTable, ratingsTable);
		};

		var showLevelNumbers = function(target) {
			if (!Foxtrick.hasClass(target, 'posLabel') &&
			    target.id != 'ft_stamina_discount_check' &&
			    target.id != 'ft_attVsDef_check' &&
			    target.id != 'ft_realProbabilities_check')
				return;

			var updateOther = target.id == 'ft_attVsDef_check' ||
				target.id == 'ft_realProbabilities_check';
			var updateHTMS = !updateOther;
			var updatePctgDiff = target.id != 'ft_attVsDef_check';

			// Foxtrick.log('showLevelNumbers')
			var overlayRatings = fieldOverlay.getElementsByClassName('overlayRatings');
			var posLabel = fieldOverlay.getElementsByClassName('posLabel');
			var tacticLevelLabel = doc.getElementById('tacticLevelLabel');

			// get some tactics etc labels for common use
			var speechLevelDiv = doc.getElementsByClassName('speechLevel')[0].cloneNode(true);
			var speechLevelTitle = speechLevelDiv.firstChild.textContent.trim();

			var teamTacticsDiv = doc.getElementById('tactics').cloneNode(true);
			teamTacticsDiv.removeChild(teamTacticsDiv.getElementsByClassName('speechLevel')[0]);
			teamTacticsDiv.removeChild(teamTacticsDiv.getElementsByTagName('select')[0]);
			var teamTacticsTitle = teamTacticsDiv.textContent.trim();

			var attVsDef = doc.getElementById('ft_attVsDef_check');
			Foxtrick.Prefs.setBool('MatchSimulator.attVsDefOn', attVsDef.checked);

			var realProb = doc.getElementById('ft_realProbabilities_check');
			Foxtrick.Prefs.setBool('MatchSimulator.realProbabilitiesOn', realProb.checked);

			// change bars to represent percentage of ratings comparison between predicted ratings
			// and selected other team's match ratings and update HTMSPrediction
			var updateBarsAndHTMSPrediction = function() {
				if (updateHTMS)
					updateHTMSPrediction();

				if (useRatings)
					addRatingsModule(currentRatings, currentRatingsOther);

				var attVsDefCheck = doc.getElementById('ft_attVsDef_check');
				var realProbabilitiesCheck = doc.getElementById('ft_realProbabilities_check');
				var doRealProb = attVsDefCheck.checked && realProbabilitiesCheck.checked;
				var realProbTitle = Foxtrick.L10n.getString('matchOrder.probability.title');

				var percentImages = fieldOverlay.getElementsByClassName('percentImage');
				Foxtrick.forEach(function(percentImage, i) {
					var percentNumber;
					if (typeof currentRatingsOther[i] !== 'undefined') {
						// change to zero-based ratings
						var curr = currentRatings[i] ? currentRatings[i] - 1 : 0;
						var other = currentRatingsOther[i] ? currentRatingsOther[i] - 1 : 0;
						var percent = curr / (curr + other);

						var oldVal;
						if (doRealProb) {
							oldVal = Math.floor(percent * 100) + '%';
							if (i < 3) {
								// defence
								// [post=15766691.221]
								percent = Foxtrick.Predict.defence(percent);
							}
							else if (i == 3) {
								// midfield
								// [post=15766691.242]
								percent = Foxtrick.Predict.possession(percent);
							}
							else {
								// attack
								// [post=15766691.221]
								percent = Foxtrick.Predict.attack(percent);
							}
						}

						var title = Math.floor(percent * 100) + '%';
						var barPos;
						if (Foxtrick.util.layout.isStandard(doc))
							barPos = Math.floor(-315 + (315 - 156) * percent);
						else
							barPos = Math.floor(-235 + (235 - 116) * percent);
						percentImage.style.backgroundPosition = barPos + 'px';
						percentImage.title = title;
						percentImage.alt = title;
						Foxtrick.removeClass(percentImage, 'hidden');

						if (percentImage.nextSibling.className != 'percentNumber') {
							percentNumber = doc.createElement('div');
							percentNumber.textContent = title;
							percentNumber.title = doRealProb ?
								realProbTitle.replace(/%s/, oldVal) : '';
							percentNumber.className = 'percentNumber';
							var before = percentImage.nextSibling;
							percentImage.parentNode.insertBefore(percentNumber, before);
						}
						else {
							percentNumber = percentImage.nextSibling;
							percentNumber.textContent = title;
							percentNumber.title = doRealProb ?
								realProbTitle.replace(/%s/, oldVal) : '';

							if (updatePctgDiff) {
								var newPctg = Math.floor(percent * 100);
								var oldPercent = parseFloat(percentNumber.getAttribute('percent'));
								var oldPctg = Math.floor(oldPercent * 100);
								var diff = newPctg - oldPctg;

								var span = doc.createElement('span');
								span.textContent = ' (' + diff + '%)';
								if (diff < 0) {
									span.className = 'ft-colorLower ft-percentChange';
									percentNumber.appendChild(span);
								}
								else if (diff > 0) {
									span.className = 'ft-colorHigher ft-percentChange';
									percentNumber.appendChild(span);
								}
							}
						}
						percentNumber.setAttribute('percent', percent);
					}
					else {
						if (percentImage.nextSibling &&
						    percentImage.nextSibling.className == 'percentNumber') {
							percentNumber = percentImage.nextSibling;
							percentNumber.parentNode.removeChild(percentNumber);
						}
						Foxtrick.addClass(percentImage[i], 'hidden');
					}
				}, percentImages);
			};

			var updateOtherRatings = function(selectedMatchXML, otherTeamID, homeAway) {
				// select team node
				var teamLink = Foxtrick.Pages.All.getBreadCrumbs(doc)[0];
				var thisTeamID = Foxtrick.util.id.getTeamIdFromUrl(teamLink.href);

				var HomeTeamID = selectedMatchXML.num('HomeTeamID');
				var AwayTeamID = selectedMatchXML.num('AwayTeamID');

				var doHome = true;
				if (homeAway == 'away' || // chose away
				    (homeAway != 'home' && // auto detect away
				     (otherTeamID == AwayTeamID || thisTeamID == HomeTeamID || // one of the teams
				      isHome && otherTeamID != HomeTeamID && thisTeamID != AwayTeamID)
				      // none of the teams match + playing home
				    )) {
					doHome = false;
				}

				var teamNode;
				if (doHome) {
					teamNode = selectedMatchXML.node('HomeTeam');
					teamNames[1] = selectedMatchXML.text('HomeTeamName');
				}
				else {
					teamNode = selectedMatchXML.node('AwayTeam');
					teamNames[1] = selectedMatchXML.text('AwayTeamName');
				}
				// get ratings
				var selectedRatings = [
					{ type: 'RatingLeftAtt' },
					{ type: 'RatingMidAtt' },
					{ type: 'RatingRightAtt' },
					{ type: 'RatingMidfield' },
					{ type: 'RatingLeftDef' },
					{ type: 'RatingMidDef' },
					{ type: 'RatingRightDef' },
					{ type: 'TacticType' },
					{ type: 'TacticSkill' },
				];

				// get ratings and ratings text
				Foxtrick.forEach(function(rating) {
					var htValue = selectedMatchXML.num(rating.type, teamNode);
					if (rating.type == 'TacticType') {
						rating.value = htValue;
						rating.text = Foxtrick.L10n.getTacticById(htValue);
					}
					else if (rating.type == 'TacticSkill') {
						rating.value = htValue;
						rating.text = Foxtrick.L10n.getLevelByTypeAndValue('levels', htValue);
					}
					else {
						// adjust scale: non-existent has no sublevels
						rating.value = Foxtrick.Math.hsToFloat(htValue, true);
						rating.text = Foxtrick.L10n.getFullLevelByValue(rating.value);
					}
				}, selectedRatings);

				// display other teams ratings
				var attVsDefCheck = doc.getElementById('ft_attVsDef_check');
				var ratingBoxes = doc.getElementsByClassName('ratingInnerBox');
				for (var i = 0; i < ratingBoxes.length; ++i) {
					var j = attVsDefCheck.checked ? i : ratingBoxes.length - 1 - i;
					// reverse order?

					var fullLevel = selectedRatings[j].value;
					var levelText = '[' + fullLevel.toFixed(2) + ']';

					var label, overlayOther;

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
								span.className = 'ft-colorLower ft-otherChange';
								div.appendChild(span);
							}
							else if (diff > 0) {
								span.className = 'ft-colorHigher ft-otherChange';
								div.appendChild(span);
							}
						}
						label = ratingBoxes[i].querySelector('.posLabelOther');
						label.textContent = posLabel[6 - j].textContent;
						overlayOther = ratingBoxes[i].querySelector('.overlayRatingsOther');
					}
					else {
						// no other match ratings had been shown
						// add other rating containers and their ratings
						var otherWrapper = doc.createElement('div');
						otherWrapper.className = 'ft-otherWrapper';

						label = doc.createElement('div');
						label.className = 'posLabelOther';
						otherWrapper.appendChild(label);
						label.textContent = attVsDefCheck.checked ? posLabel[6 - i].textContent :
							posLabel[i].textContent; // reverse order?

						overlayOther = doc.createElement('div');
						overlayOther.className = 'overlayRatingsOther';
						otherWrapper.appendChild(overlayOther);

						var overlayNumOther = doc.createElement('div');
						overlayNumOther.id = id;
						overlayNumOther.className = 'overlayRatingsNumOther';
						overlayNumOther.textContent = levelText;
						otherWrapper.appendChild(overlayNumOther);

						ratingBoxes[i].appendChild(otherWrapper);
					}
					overlayOther.textContent = selectedRatings[j].text;

					// README: index must match to fullLevel definition above
					currentRatingsOther[j] = fullLevel;
				}

				// add tactics
				var TACTIC_LABEL_TMPL = '{label}{type} / {levelLabel}: {level} ({num})';
				var tacticLevelLabel = doc.getElementById('tacticLevelLabel');
				var tacticLevelLabelOther = doc.getElementById('tacticLevelLabelOther');
				if (!tacticLevelLabelOther) {
					tacticLevelLabelOther = doc.createElement('div');
					tacticLevelLabelOther.id = 'tacticLevelLabelOther';
					Foxtrick.insertAfter(tacticLevelLabelOther, tacticLevelLabel);
				}
				var tacticLevelLabelTitle = tacticLevelLabel.textContent.split(':')[0];
				currentRatingsOther[7] = selectedRatings[7].value;
				currentRatingsOther[8] = selectedRatings[8].value;

				var info = {
					label: teamTacticsTitle,
					levelLabel: tacticLevelLabelTitle,
					type: selectedRatings[7].text,
					level: selectedRatings[8].text,
					num: selectedRatings[8].value,
				};
				tacticLevelLabelOther.textContent = Foxtrick.format(TACTIC_LABEL_TMPL, info);

				// remove my rating changes for clarity
				var ratingChanges = fieldOverlay.getElementsByClassName('ft-ratingChange');
				Foxtrick.forEach(function(change) {
					change.textContent = '';
				}, ratingChanges);
			};
			var copyRatings = function(ev) {
				var doc = ev.target.ownerDocument;
				var text = '';

				// the teams. highlight own team
				var crumbs = Foxtrick.Pages.All.getBreadCrumbs(doc);
				var thisTeam = crumbs[0].textContent;
				var bothTeams = crumbs[1].textContent;
				var re = Foxtrick.strToRe(thisTeam);
				var matched = bothTeams.match(re);
				var replaced = matched ? bothTeams.replace(re, '[b]' + thisTeam + '[/b]') :
					bothTeams += ' - ' + '[b]' + thisTeam + '[/b]';
				text += replaced;

				// match link
				text += matchId ? ' [matchid=' + matchId + ']' + '\n' : '\n';

				// formation
				var formations = doc.getElementById('formations').textContent;
				text += formations + '\n';

				// pic/mots
				var speechLevelWrapper = doc.querySelector('.speechLevel');
				if (speechLevelWrapper.style.display !== 'none') {
					var speechLevelSelect = doc.getElementById('speechLevel');
					var selectedSpeech = speechLevelSelect.options[speechLevelSelect.selectedIndex];
					var speechLevel = selectedSpeech.textContent;
					text += speechLevelTitle;
					text += '[u]' + speechLevel + '[/u]\n';
				}

				// coach type
				text += doc.getElementById('trainerTypeLabel').textContent + '\n';

				// tactics
				var teamTacticsSelect = doc.getElementById('teamtactics');
				var selectedTactics = teamTacticsSelect.options[teamTacticsSelect.selectedIndex];
				var tactics = selectedTactics.textContent;
				text += teamTacticsTitle;
				text += '[u]' + tactics + '[/u] / ';
				text += doc.getElementById('tacticLevelLabel').textContent + '\n\n';

				// add other match info if appropriate
				var otherMatchId;
				var matchSelect = doc.getElementById('ft-matchSelect');
				if (matchSelect) {
					otherMatchId = parseInt(matchSelect.value, 10);
					if (otherMatchId > 0) {
						var selectedMatch = matchSelect.options[matchSelect.selectedIndex];

						text += Foxtrick.L10n.getString('matchOrder.comparedTo') + '\n';
						text += selectedMatch.textContent + ' [matchid=' + otherMatchId + ']\n';
						text += doc.getElementById('tacticLevelLabelOther').textContent + '\n\n';
					}
				}

				// ratings
				var calcRatings = doc.getElementById('calcRatings').value;
				text += '[table][tr][th colspan=3 align=center]' + calcRatings + '[/th][/tr]\n';
				for (var i = 0, count = 0; i < 14; ++i) {

					if (i === 0 || i == 6 || i == 8) {
						// new rows for defence, mid, attack
						text += '[tr]';
					}
					if (i == 6) {
						// midfield
						text += '[td colspan=3 align=center]';
					}
					else if (i % 2 === 0) {
						// posLabel
						text += '[td align=center]';
					}
					// jscs:disable disallowEmptyBlocks
					else {
						// ratings. add to same cell
					}
					// jscs:enable disallowEmptyBlocks

					if (Foxtrick.hasClass(overlayRatings[i], 'posLabel')) {
						// sector label
						text += '[b]' + overlayRatings[i].textContent + '[/b]\n';
					}
					else {
						// sector rating
						if (!Foxtrick.hasClass(overlayRatings[i], 'hidden')) {
							text += overlayRatings[i].textContent + '\n';
						}
						else {
							// stamina discounted
							text += overlayRatings[i].nextSibling.textContent + '\n';
						}
						text += doc.getElementById('ft-full-level' + count++).textContent + '\n';

						// add other teams ratings if appropriate
						if (otherMatchId > 0) {
							var ratingInnerBox = overlayRatings[i].parentNode;
							var rating = ratingInnerBox.querySelector('.percentNumber');
							text += '[q]' + rating.textContent + '[/q]';
							var divs = ratingInnerBox.querySelectorAll('.ft-otherWrapper div');
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

				// copy HTMS prediction
				var overlayHTMS = doc.getElementById('overlayHTMSCurrent');
				if (overlayHTMS) {
					text += Foxtrick.modules['HTMSPrediction'].copy(overlayHTMS);
				}

				Foxtrick.copyStringToClipboard(text);
				var target = doc.getElementById('ft-overlayBottom');
				var copied = Foxtrick.L10n.getString('copy.ratings.copied');
				Foxtrick.util.note.add(doc, copied, 'ft-ratings-copy-note', { to: target });
			};

			// get levels from ratings text and display them
			var ratingInnerBoxes = doc.getElementsByClassName('ratingInnerBox');
			Foxtrick.forEach(function(box, i) {
				var overlayRatingDiscounted = box.querySelector('.overlayRatingsDiscounted');
				if (overlayRatingDiscounted)
					overlayRatingDiscounted.parentNode.removeChild(overlayRatingDiscounted);
				var overlayRating = box.getElementsByClassName('overlayRatings')[1];
				Foxtrick.removeClass(overlayRating, 'hidden');

				var rating = overlayRating.getAttribute('data-rating');
				var fullLevel = Foxtrick.Math.hsToFloat(rating, true);
				var levelText = '[' + fullLevel.toFixed(2) + ']';
				var id = 'ft-full-level' + i;

				var div;
				if (typeof currentRatings[i] !== 'undefined') {
					div = doc.getElementById(id);
					div.textContent = levelText;
				}
				else {
					div = doc.createElement('div');
					div.id = id;
					div.className = 'overlayRatingsNum';
					div.textContent = levelText;
				}

				box.insertBefore(div, overlayRating.nextSibling);
				oldRatings[i] = currentRatings[i];
				currentRatings[i] = orgRatings[i] = fullLevel;
			}, ratingInnerBoxes);

			// store tactics for HTMS
			var teamTacticsSelect = doc.getElementById('teamtactics');
			currentRatings[7] = teamTacticsSelect.selectedIndex;
			if (teamTacticsSelect.value !== '0' && teamTacticsSelect.value !== '7') {
				var tacticsSpan = tacticLevelLabel.querySelector('span[data-tacticlevel]');
				currentRatings[8] = tacticsSpan.getAttribute('data-tacticlevel');
			}

			// remove other changes for clarity
			var otherChanges = fieldOverlay.getElementsByClassName('ft-otherChange');
			Foxtrick.forEach(function(change) {
				change.textContent = '';
			}, otherChanges);

			var staminaDiscountCheck = doc.getElementById('ft_stamina_discount_check');
			if (staminaDiscountCheck.checked) {
				Foxtrick.Prefs.setBool('MatchSimulator.staminaDiscountOn', true);
				ft_stamina_discount();
			}
			else {
				Foxtrick.Prefs.setBool('MatchSimulator.staminaDiscountOn', false);
			}

			for (var i = 0; i < 7; ++i) {
				if (oldRatings[i] !== undefined) {
					var id = 'ft-full-level' + i;
					var div = doc.getElementById(id);
					var diff = currentRatings[i] - oldRatings[i];

					var span = doc.createElement('span');
					span.textContent = ' (' + diff.toFixed(2) + ')';
					if (diff < 0) {
						span.className = 'ft-colorLower ft-ratingChange';
						div.appendChild(span);
					}
					else if (diff > 0) {
						span.className = 'ft-colorHigher ft-ratingChange';
						div.appendChild(span);
					}
				}
			}

			var matchId = Foxtrick.util.id.getMatchIdFromUrl(doc.location.href);
			if (!matchId)
				return;

			updateBarsAndHTMSPrediction();

			if (updateOther && currentMatchXML)
				updateOtherRatings(currentMatchXML, currentOtherTeamID, currentHomeAway);

			// keep it visible till closed
			Foxtrick.addClass(fieldOverlay, 'visible');

			// opened first time
			if (!doc.getElementById('ft-copyRatingsButton')) {
				// close button tweaked.
				var hideOverlay = function(ev) {
					var doc = ev.target.ownerDocument;
					Foxtrick.removeClass(fieldOverlay, 'visible');
					var overlayHTMS = doc.getElementById('ft-overlayHTMS');
					if (overlayHTMS)
						Foxtrick.addClass(overlayHTMS, 'hidden');
				};
				Foxtrick.onClick(doc.getElementById('closeOverlay'), hideOverlay);

				// add copy button
				var copyButton = doc.createElement('input');
				copyButton.type = 'button';
				copyButton.value = Foxtrick.L10n.getString('button.copy');
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

				var SourceSystem = 'Hattrick';
				if (isHTOIntegrated)
					SourceSystem = 'HTOIntegrated';
				var orderMatchArgs = [
					['file', 'matchdetails'],
					['version', '2.3'],
					['matchId', matchId],
					['sourceSystem', SourceSystem],
				];

				Foxtrick.util.api.retrieve(doc, orderMatchArgs, { cache_lifetime: 'session' },
				  function(orderMatchXml, errorText) {
					if (!orderMatchXml || errorText) {
						if (loadingOtherMatches && loadingOtherMatches.parentNode) {
							loadingOtherMatches.parentNode.removeChild(loadingOtherMatches);
							loadingOtherMatches = null;
						}
						Foxtrick.log(errorText);
						return;
					}
					// determine otherTeamId
					var HomeTeamID = orderMatchXml.num('HomeTeamID');
					var AwayTeamID = orderMatchXml.num('AwayTeamID');
					var crumbs = Foxtrick.Pages.All.getBreadCrumbs(doc);
					var thisTeamID = Foxtrick.util.id.getTeamIdFromUrl(crumbs[0].href);

					var otherTeamID;
					if (thisTeamID == HomeTeamID) {
						isHome = true;
						otherTeamID = AwayTeamID;
						teamNames[0] = orderMatchXml.text('HomeTeamName');
						teamNames[1] = orderMatchXml.text('AwayTeamName');
					}
					else {
						isHome = false;
						otherTeamID = HomeTeamID;
						teamNames[1] = orderMatchXml.text('HomeTeamName');
						teamNames[0] = orderMatchXml.text('AwayTeamName');
					}

					// now get other team's matches
					var otherMatchesArgs = [
						['file', 'matchesarchive'],
						['teamId', otherTeamID],
					];
					if (isHTOIntegrated)
						otherMatchesArgs.push(['sourceSystem', 'HTOIntegrated']);

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
						if (!otherMatchesXml)
							return;

						var MATCH_LIST_TMPL = '{date}: {home} - {goalsHome}:{goalsAway} - {away}';
						var getMatchDetails =
						  function(selectedMatchid, SourceSystem, homeAway, isNew) {
							if (loadingOtherMatches && loadingOtherMatches.parentNode) {
								loadingOtherMatches.parentNode.removeChild(loadingOtherMatches);
								loadingOtherMatches = null;
							}

							// get selected match
							var loading;
							if ((loading = doc.getElementById('loadingMatchID'))) {
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
								['matchId', selectedMatchid],
								['sourceSystem', SourceSystem],
							];
							var cacheArgs = { cache_lifetime: 'session' };
							Foxtrick.util.api.retrieve(doc, selectedMatchArgs, cacheArgs,
							  function(selectedMatchXML, errorText) {
								if (errorText || !selectedMatchXML) {
									if (loadingMatch && loadingMatch.parentNode) {
										loadingMatch.textContent = errorText;
									}
									Foxtrick.log(errorText);
									select.value = -1;
									return;
								}
								if (loadingMatch && loadingMatch.parentNode) {
									loadingMatch.parentNode.removeChild(loadingMatch);
									loadingMatch = null;
								}

								if (!selectedMatchXML.node('HomeGoals')) {
									// game not played
									select.value = -1;
									return;
								}

								// update match select
								if (isNew) {
									var option = doc.createElement('option');
									option.value = selectedMatchXML.text('MatchID');
									option.setAttribute('SourceSystem', SourceSystem);
									option.setAttribute('homeAway', homeAway);
									var MatchType = selectedMatchXML.num('MatchType');
									option.className = 'ftOptionIcon ' +
										module.MatchTypes[MatchType].className;

									var MatchDate = selectedMatchXML.time('MatchDate');
									var date =
										Foxtrick.util.time.buildDate(MatchDate,
										                             { showTime: false });
									var howeAwayStr =
										Foxtrick.L10n.getString('matchOrder.' + homeAway + '.abbr');

									var tmpl = '{HA}: ' + MATCH_LIST_TMPL;
									var info = {
										HA: howeAwayStr,
										date: date,
										home: selectedMatchXML.text('HomeTeamName').substr(0, 20),
										away: selectedMatchXML.text('AwayTeamName').substr(0, 20),
										goalsHome: selectedMatchXML.text('HomeGoals'),
										goalsAway: selectedMatchXML.text('AwayGoals'),
									};
									option.textContent = Foxtrick.format(tmpl, info);

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
						var optionNoMatch = doc.createElement('option');
						optionNoMatch.value = -1;
						optionNoMatch.textContent =
							Foxtrick.L10n.getString('matchOrder.noMatchSelected');
						select.appendChild(optionNoMatch);

						var option = doc.createElement('option');
						option.value = 0;
						option.textContent = Foxtrick.L10n.getString('matchOrder.AddMatchManually');
						select.appendChild(option);

						var otherMatchesNodes = otherMatchesXml.getElementsByTagName('Match');
						Foxtrick.forEach(function(match) {
							// no HTO in match archive
							var SourceSystem = 'Hattrick';
							// var SourceSystem = otherMatchesXml.text('SourceSystem', match);
							var MatchType = otherMatchesXml.num('MatchType', match);

							// skip friendlies
							var isFriendly = Foxtrick.any(function(type) {
								return type === MatchType;
							}, Foxtrick.Pages.Matches.Friendly);
							if (isFriendly)
								return;

							var MatchDate = otherMatchesXml.time('MatchDate', match);
							var date = Foxtrick.util.time.buildDate(MatchDate, { showTime: false });
							var MatchID = otherMatchesXml.text('MatchID', match);

							var option = doc.createElement('option');
							var className = module.MatchTypes[MatchType].className;
							option.className = 'ftOptionIcon ' + className;
							option.setAttribute('SourceSystem', SourceSystem);
							option.value = MatchID;

							var info = {
								date: date,
								home: otherMatchesXml.text('HomeTeamName', match).substr(0, 20),
								away: otherMatchesXml.text('AwayTeamName', match).substr(0, 20),
								goalsHome: otherMatchesXml.text('HomeGoals', match),
								goalsAway: otherMatchesXml.text('AwayGoals', match),
							};
							option.textContent = Foxtrick.format(MATCH_LIST_TMPL, info);

							select.appendChild(option);
						}, otherMatchesNodes);

						// on selecting a match, matchId and get ratings if appropriate
						var onMatchSelect = function(ev) {
							var selectedMatchid = parseInt(select.value, 10);
							var selectedOption = select.options[select.selectedIndex];
							var SourceSystem = selectedOption.getAttribute('SourceSystem');
							var homeAway = selectedOption.getAttribute('homeAway');

							// if no match selected,
							// cleanup old ratings display and reset currentRatingsOther,
							// so that percentBars and HTMS gets cleaned as well
							if (selectedMatchid == -1) {
								var otherWrappers = fieldOverlay
									.getElementsByClassName('ft-otherWrapper');

								Foxtrick.forEach(function(wrapper, i) {
									wrapper.parentNode.removeChild(wrapper);
									currentRatingsOther[i] = undefined;
								}, otherWrappers);

								var tacticLevelLabelOther =
									doc.getElementById('tacticLevelLabelOther');

								if (tacticLevelLabelOther) {
									var labelParent = tacticLevelLabelOther.parentNode;
									labelParent.removeChild(tacticLevelLabelOther);
								}

								updateBarsAndHTMSPrediction();

								return;
							}
							// add a matchId manually
							else if (selectedMatchid === 0) {
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
						var addMatchDiv = doc.createElement('div');
						addMatchDiv.className = 'hidden';
						addMatchDiv.id = 'addMatchDiv';
						fieldOverlay.appendChild(addMatchDiv);

						var addMatchText = doc.createElement('input');
						addMatchText.id = 'addMatchText';
						addMatchText.type = 'text';
						if (oldLineupId) {
							// FIXME: debug this for HTO etc
							addMatchText.value = oldLineupId;
							Foxtrick.removeClass(addMatchDiv, 'hidden');
							Foxtrick.addClass(select, 'hidden');
						}
						addMatchText.size = 10;
						addMatchDiv.appendChild(addMatchText);

						var addMatchHomeAwayLabel = doc.createElement('label');
						addMatchHomeAwayLabel.id = 'addMatchhomeAwayLabel';
						addMatchHomeAwayLabel.textContent =
							Foxtrick.L10n.getString('matchOrder.homeAway.abbr');
						addMatchHomeAwayLabel.title =
							Foxtrick.L10n.getString('matchOrder.homeAway');
						addMatchDiv.appendChild(addMatchHomeAwayLabel);

						var addMatchHomeAwaySelect = doc.createElement('select');
						addMatchHomeAwaySelect.id = 'addMatchHomeAwaySelect';
						addMatchHomeAwaySelect.title =
							Foxtrick.L10n.getString('matchOrder.homeAway');
						addMatchDiv.appendChild(addMatchHomeAwaySelect);

						var optionDefault = doc.createElement('option');
						optionDefault.value = 'default';
						optionDefault.textContent = Foxtrick.L10n.getString('matchOrder.default');
						addMatchHomeAwaySelect.appendChild(optionDefault);
						var optionHome = doc.createElement('option');
						optionHome.value = 'home';
						optionHome.textContent = Foxtrick.L10n.getString('matchOrder.home');
						addMatchHomeAwaySelect.appendChild(optionHome);
						var optionAway = doc.createElement('option');
						optionAway.value = 'away';
						optionAway.textContent = Foxtrick.L10n.getString('matchOrder.away');
						addMatchHomeAwaySelect.appendChild(optionAway);

						var addMatchCheck = doc.createElement('input');
						addMatchCheck.id = 'addMatchIsHTO';
						addMatchCheck.type = 'checkBox';
						addMatchDiv.appendChild(addMatchCheck);

						var addMatchCheckLabel = doc.createElement('label');
						addMatchCheckLabel.setAttribute('for', 'addMatchIsHTO');
						addMatchCheckLabel.textContent =
							Foxtrick.L10n.getString('matchOrder.tournamentMatch');
						addMatchDiv.appendChild(addMatchCheckLabel);

						var addMatchButtonOk = doc.createElement('input');
						addMatchButtonOk.id = 'addMatchButton';
						addMatchButtonOk.type = 'button';
						addMatchButtonOk.value = Foxtrick.L10n.getString('button.add');
						addMatchDiv.appendChild(addMatchButtonOk);

						var addMatch = function(ev) {
							var doc = ev.target.ownerDocument;

							var addMatchIsHTO = doc.getElementById('addMatchIsHTO');
							var sourceSystem = addMatchIsHTO.checked ? 'HTOIntegrated' : 'Hattrick';

							var addMatchText = doc.getElementById('addMatchText');
							var matchId = parseInt(addMatchText.value, 10);
							if (isNaN(matchId))
								return;

							var addMatchHomeAwaySelect =
								doc.getElementById('addMatchHomeAwaySelect');

							var homeAway = addMatchHomeAwaySelect.value;
							getMatchDetails(matchId, sourceSystem, homeAway, true);

							var addMatchDiv = doc.getElementById('addMatchDiv');
							var select = doc.getElementById('ft-matchSelect');
							Foxtrick.addClass(addMatchDiv, 'hidden');
							Foxtrick.removeClass(select, 'hidden');
						};
						Foxtrick.onClick(addMatchButtonOk, addMatch);

						var addMatchButtonCancel = doc.createElement('input');
						addMatchButtonCancel.id = 'addMatchButtonCancel';
						addMatchButtonCancel.type = 'button';
						addMatchButtonCancel.value = Foxtrick.L10n.getString('button.cancel');
						var addMatchCancel = function(ev) {
							var doc = ev.target.ownerDocument;
							var addMatchDiv = doc.getElementById('addMatchDiv');
							var select = doc.getElementById('ft-matchSelect');
							Foxtrick.addClass(addMatchDiv, 'hidden');
							Foxtrick.removeClass(select, 'hidden');
							select.selectedIndex = 0;
						};
						Foxtrick.onClick(addMatchButtonCancel, addMatchCancel);
						addMatchDiv.appendChild(addMatchButtonCancel);
					});
				});
			}
		};

		var clickHandler = function(ev) {
			showLevelNumbers(ev.target);
		};

		// old lineup import click
		var oldLineups = doc.getElementById('oldLineups');
		Foxtrick.onClick(oldLineups, function(ev) {
			var target = ev.target;
			while (target.id != 'oldLineups' && !Foxtrick.hasClass(target, 'savedLineup'))
				target = target.parentNode;

			if (target.id == 'oldLineups')
				return;

			oldLineupId = target.id.match(/matchlineup_(\d+)/)[1];

			var addMatchText = doc.getElementById('addMatchText');
			if (addMatchText) {
				addMatchText.value = oldLineupId;
				Foxtrick.removeClass(doc.getElementById('addMatchDiv'), 'hidden');
				Foxtrick.addClass(doc.getElementById('ft-matchSelect'), 'hidden');
			}
		});

		// -- stamina discount --
		var getStaminaFactor = function(stamina, staminaPrediction) {
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

			return Foxtrick.Predict.averageEnergy90(stamina);
			// http://www.nrgjack.altervista.org/wordpress/2008/07/31/percentuale-resistenza/
			// return 0.2472 * Math.log(stamina) + 0.472;
			// from unwritten manual [post=15172393.4] (HO)
			// var cutOff = parseFloat(Foxtrick.Prefs.getString('staminaCutoff'));
			// return Math.pow(Math.min(stamina + (14 - cutOff), 15.25) / 14, 0.6) / 1.05265;
			// Foxtrick.log(stamina, 1 - 0.0072415286 * Math.pow(9 - stamina, 1.9369819898));
			// from http://imageshack.us/photo/my-images/854/contributiontablestamin.png/
			// return 1 - 0.0072415286 * Math.pow(9 - stamina, 1.9369819898);
		};

		var contributions = [
			{
				p: 0, t: 'n',
				c: [
					{ s: 1, sk: 'gk', v: 0.866 },
					{ s: 1, sk: 'df', v: 0.425 },
					{ s: 0, sk: 'gk', v: 0.597 },
					{ s: 2, sk: 'ke', v: 0.597 },
					{ s: 0, sk: 'df', v: 0.276 },
					{ s: 2, sk: 'df', v: 0.276 },
				],
			},
			{
				p: 3, t: 'n',
				c: [
					{ s: 3, sk: 'pm', v: 0.236 },
					{ s: 1, sk: 'df', v: 1.000 },
					{ s: 0, sk: 'df', v: 0.260 },
					{ s: 2, sk: 'df', v: 0.260 },
				],
			},
			{
				p: 3, t: 'o',
				c: [
					{ s: 3, sk: 'pm', v: 0.318 },
					{ s: 1, sk: 'df', v: 0.725 },
					{ s: 0, sk: 'df', v: 0.190 },
					{ s: 2, sk: 'df', v: 0.190 },
				],
			},
			{
				p: 2, t: 'n',
				c: [
					{ s: 3, sk: 'pm', v: 0.236 },
					{ s: 1, sk: 'df', v: 1.000 },
					{ s: 0, sk: 'df', v: 0.516 },
				],
			},
			{
				p: 2, t: 'tw',
				c: [
					{ s: 3, sk: 'pm', v: 0.165 },
					{ s: 1, sk: 'df', v: 0.778 },
					{ s: 0, sk: 'df', v: 0.711 },
					{ s: 4, sk: 'wi', v: 0.246 },
				],
			},
			{
				p: 2, t: 'o',
				c: [
					{ s: 3, sk: 'pm', v: 0.318 },
					{ s: 1, sk: 'df', v: 0.725 },
					{ s: 0, sk: 'df', v: 0.378 },
				],
			},
			{
				p: 4, t: 'n',
				c: [
					{ s: 3, sk: 'pm', v: 0.236 },
					{ s: 1, sk: 'df', v: 1.000 },
					{ s: 2, sk: 'df', v: 0.516 },
				],
			},
			{
				p: 4, t: 'tw',
				c: [
					{ s: 3, sk: 'pm', v: 0.165 },
					{ s: 1, sk: 'df', v: 0.778 },
					{ s: 2, sk: 'df', v: 0.711 },
					{ s: 6, sk: 'wi', v: 0.246 },
				],
			},
			{
				p: 4, t: 'o',
				c: [
					{ s: 3, sk: 'pm', v: 0.318 },
					{ s: 1, sk: 'df', v: 0.725 },
					{ s: 2, sk: 'df', v: 0.378 },
				],
			},
			{
				p: 1, t: 'n',
				c: [
					{ s: 3, sk: 'pm', v: 0.167 },
					{ s: 1, sk: 'df', v: 0.450 },
					{ s: 0, sk: 'df', v: 0.919 },
					{ s: 4, sk: 'wi', v: 0.506 },
				],
			},
			{
				p: 1, t: 'd',
				c: [
					{ s: 3, sk: 'pm', v: 0.066 },
					{ s: 1, sk: 'df', v: 0.479 },
					{ s: 0, sk: 'df', v: 1.000 },
					{ s: 4, sk: 'wi', v: 0.323 },
				],
			},
			{
				p: 1, t: 'tm',
				c: [
					{ s: 3, sk: 'pm', v: 0.167 },
					{ s: 1, sk: 'df', v: 0.683 },
					{ s: 0, sk: 'df', v: 0.687 },
					{ s: 4, sk: 'wi', v: 0.279 },
				],
			},
			{
				p: 1, t: 'o',
				c: [
					{ s: 3, sk: 'pm', v: 0.230 },
					{ s: 1, sk: 'df', v: 0.382 },
					{ s: 0, sk: 'df', v: 0.698 },
					{ s: 4, sk: 'wi', v: 0.618 },
				],
			},
			{
				p: 5, t: 'n',
				c: [
					{ s: 3, sk: 'pm', v: 0.167 },
					{ s: 1, sk: 'df', v: 0.450 },
					{ s: 2, sk: 'df', v: 0.919 },
					{ s: 6, sk: 'wi', v: 0.506 },
				],
			},
			{
				p: 5, t: 'd',
				c: [
					{ s: 3, sk: 'pm', v: 0.066 },
					{ s: 1, sk: 'df', v: 0.479 },
					{ s: 2, sk: 'df', v: 1.000 },
					{ s: 6, sk: 'wi', v: 0.323 },
				],
			},
			{
				p: 5, t: 'tm',
				c: [
					{ s: 3, sk: 'pm', v: 0.167 },
					{ s: 1, sk: 'df', v: 0.683 },
					{ s: 2, sk: 'df', v: 0.687 },
					{ s: 6, sk: 'wi', v: 0.279 },
				],
			},
			{
				p: 5, t: 'o',
				c: [
					{ s: 3, sk: 'pm', v: 0.230 },
					{ s: 1, sk: 'df', v: 0.382 },
					{ s: 2, sk: 'df', v: 0.698 },
					{ s: 6, sk: 'wi', v: 0.618 },
				],
			},
			{
				p: 8, t: 'n',
				c: [
					{ s: 3, sk: 'pm', v: 1.000 },
					{ s: 1, sk: 'df', v: 0.400 },
					{ s: 0, sk: 'df', v: 0.095 },
					{ s: 2, sk: 'df', v: 0.095 },
					{ s: 5, sk: 'ps', v: 0.325 },
					{ s: 4, sk: 'ps', v: 0.110 },
					{ s: 6, sk: 'ps', v: 0.110 },
				],
			},
			{
				p: 8, t: 'o',
				c: [
					{ s: 3, sk: 'pm', v: 0.944 },
					{ s: 1, sk: 'df', v: 0.216 },
					{ s: 0, sk: 'df', v: 0.051 },
					{ s: 2, sk: 'df', v: 0.051 },
					{ s: 5, sk: 'ps', v: 0.483 },
					{ s: 4, sk: 'ps', v: 0.110 },
					{ s: 6, sk: 'ps', v: 0.110 },
				],
			},
			{
				p: 8, t: 'd',
				c: [
					{ s: 3, sk: 'pm', v: 0.944 },
					{ s: 1, sk: 'df', v: 0.594 },
					{ s: 0, sk: 'df', v: 0.135 },
					{ s: 2, sk: 'df', v: 0.135 },
					{ s: 5, sk: 'ps', v: 0.219 },
					{ s: 4, sk: 'ps', v: 0.070 },
					{ s: 6, sk: 'ps', v: 0.070 },
				],
			},
			{
				p: 7, t: 'n',
				c: [
					{ s: 3, sk: 'pm', v: 1.000 },
					{ s: 1, sk: 'df', v: 0.400 },
					{ s: 0, sk: 'df', v: 0.189 },
					{ s: 5, sk: 'ps', v: 0.325 },
					{ s: 4, sk: 'ps', v: 0.218 },
				],
			},
			{
				p: 7, t: 'o',
				c: [
					{ s: 3, sk: 'pm', v: 0.944 },
					{ s: 1, sk: 'df', v: 0.216 },
					{ s: 0, sk: 'df', v: 0.102 },
					{ s: 5, sk: 'ps', v: 0.483 },
					{ s: 4, sk: 'ps', v: 0.216 },
				],
			},
			{
				p: 7, t: 'd',
				c: [
					{ s: 3, sk: 'pm', v: 0.944 },
					{ s: 1, sk: 'df', v: 0.594 },
					{ s: 0, sk: 'df', v: 0.270 },
					{ s: 5, sk: 'ps', v: 0.219 },
					{ s: 4, sk: 'ps', v: 0.140 },
				],
			},
			{
				p: 7, t: 'tw',
				c: [
					{ s: 3, sk: 'pm', v: 0.881 },
					{ s: 1, sk: 'df', v: 0.348 },
					{ s: 0, sk: 'df', v: 0.291 },
					{ s: 5, sk: 'ps', v: 0.227 },
					{ s: 4, sk: 'wi', v: 0.494 },
					{ s: 4, sk: 'ps', v: 0.271 },
				],
			},
			{
				p: 9, t: 'n',
				c: [
					{ s: 3, sk: 'pm', v: 1.000 },
					{ s: 1, sk: 'df', v: 0.400 },
					{ s: 2, sk: 'df', v: 0.189 },
					{ s: 5, sk: 'ps', v: 0.325 },
					{ s: 6, sk: 'ps', v: 0.218 },
				],
			},
			{
				p: 9, t: 'o',
				c: [
					{ s: 3, sk: 'pm', v: 0.944 },
					{ s: 1, sk: 'df', v: 0.216 },
					{ s: 2, sk: 'df', v: 0.102 },
					{ s: 5, sk: 'ps', v: 0.483 },
					{ s: 6, sk: 'ps', v: 0.216 },
				],
			},
			{
				p: 9, t: 'd',
				c: [
					{ s: 3, sk: 'pm', v: 0.944 },
					{ s: 1, sk: 'df', v: 0.594 },
					{ s: 2, sk: 'df', v: 0.270 },
					{ s: 5, sk: 'ps', v: 0.219 },
					{ s: 6, sk: 'ps', v: 0.140 },
				],
			},
			{
				p: 9, t: 'tw',
				c: [
					{ s: 3, sk: 'pm', v: 0.881 },
					{ s: 1, sk: 'df', v: 0.348 },
					{ s: 2, sk: 'df', v: 0.291 },
					{ s: 5, sk: 'ps', v: 0.227 },
					{ s: 6, sk: 'wi', v: 0.494 },
					{ s: 6, sk: 'ps', v: 0.271 },
				],
			},
			{
				p: 6, t: 'n',
				c: [
					{ s: 3, sk: 'pm', v: 0.455 },
					{ s: 1, sk: 'df', v: 0.201 },
					{ s: 0, sk: 'df', v: 0.349 },
					{ s: 5, sk: 'ps', v: 0.104 },
					{ s: 4, sk: 'wi', v: 0.854 },
					{ s: 4, sk: 'ps', v: 0.210 },
				],
			},
			{
				p: 6, t: 'o',
				c: [
					{ s: 3, sk: 'pm', v: 0.381 },
					{ s: 1, sk: 'df', v: 0.085 },
					{ s: 0, sk: 'df', v: 0.180 },
					{ s: 5, sk: 'ps', v: 0.135 },
					{ s: 4, sk: 'wi', v: 1.000 },
					{ s: 4, sk: 'ps', v: 0.246 },
				],
			},
			{
				p: 6, t: 'tm',
				c: [
					{ s: 3, sk: 'pm', v: 0.574 },
					{ s: 1, sk: 'df', v: 0.244 },
					{ s: 0, sk: 'df', v: 0.284 },
					{ s: 5, sk: 'ps', v: 0.148 },
					{ s: 4, sk: 'wi', v: 0.564 },
					{ s: 4, sk: 'ps', v: 0.133 },
				],
			},
			{
				p: 6, t: 'd',
				c: [
					{ s: 3, sk: 'pm', v: 0.381 },
					{ s: 1, sk: 'df', v: 0.264 },
					{ s: 0, sk: 'df', v: 0.485 },
					{ s: 5, sk: 'ps', v: 0.052 },
					{ s: 4, sk: 'wi', v: 0.723 },
					{ s: 4, sk: 'ps', v: 0.173 },
				],
			},
			{
				p: 10, t: 'n',
				c: [
					{ s: 3, sk: 'pm', v: 0.455 },
					{ s: 1, sk: 'df', v: 0.201 },
					{ s: 2, sk: 'df', v: 0.349 },
					{ s: 5, sk: 'ps', v: 0.104 },
					{ s: 6, sk: 'wi', v: 0.854 },
					{ s: 6, sk: 'ps', v: 0.210 },
				],
			},
			{
				p: 10, t: 'o',
				c: [
					{ s: 3, sk: 'pm', v: 0.381 },
					{ s: 1, sk: 'df', v: 0.085 },
					{ s: 2, sk: 'df', v: 0.180 },
					{ s: 5, sk: 'ps', v: 0.135 },
					{ s: 6, sk: 'wi', v: 1.000 },
					{ s: 6, sk: 'ps', v: 0.246 },
				],
			},
			{
				p: 10, t: 'tm',
				c: [
					{ s: 3, sk: 'pm', v: 0.574 },
					{ s: 1, sk: 'df', v: 0.244 },
					{ s: 2, sk: 'df', v: 0.284 },
					{ s: 5, sk: 'ps', v: 0.148 },
					{ s: 6, sk: 'wi', v: 0.564 },
					{ s: 6, sk: 'ps', v: 0.133 },
				],
			},
			{
				p: 10, t: 'd',
				c: [
					{ s: 3, sk: 'pm', v: 0.381 },
					{ s: 1, sk: 'df', v: 0.264 },
					{ s: 2, sk: 'df', v: 0.485 },
					{ s: 5, sk: 'ps', v: 0.052 },
					{ s: 6, sk: 'wi', v: 0.723 },
					{ s: 6, sk: 'ps', v: 0.173 },
				],
			},
			{
				p: 12, t: 'n',
				c: [
					{ s: 5, sk: 'sc', v: 1.000 },
					{ s: 5, sk: 'ps', v: 0.369 },
					{ s: 4, sk: 'wi', v: 0.190 },
					{ s: 6, sk: 'wi', v: 0.190 },
					{ s: 4, sk: 'ps', v: 0.122 },
					{ s: 6, sk: 'ps', v: 0.122 },
					{ s: 4, sk: 'sc', v: 0.224 },
					{ s: 6, sk: 'sc', v: 0.224 },
				],
			},
			{
				p: 12, t: 'd',
				c: [
					{ s: 3, sk: 'pm', v: 0.406 },
					{ s: 5, sk: 'sc', v: 0.583 },
					{ s: 5, sk: 'ps', v: 0.543 },
					{ s: 4, sk: 'wi', v: 0.124 },
					{ s: 6, sk: 'wi', v: 0.124 },
					{ s: 4, sk: 'ps', v: 0.215 },
					{ s: 6, sk: 'ps', v: 0.215 },
					{ s: 4, sk: 'sc', v: 0.109 },
					{ s: 6, sk: 'sc', v: 0.109 },
				],
			},
			{
				p: 11, t: 'n',
				c: [
					{ s: 5, sk: 'sc', v: 1.000 },
					{ s: 5, sk: 'ps', v: 0.369 },
					{ s: 4, sk: 'wi', v: 0.190 },
					{ s: 6, sk: 'wi', v: 0.190 },
					{ s: 4, sk: 'ps', v: 0.122 },
					{ s: 6, sk: 'ps', v: 0.122 },
					{ s: 4, sk: 'sc', v: 0.224 },
					{ s: 6, sk: 'sc', v: 0.224 },
				],
			},
			{
				p: 11, t: 'd',
				c: [
					{ s: 3, sk: 'pm', v: 0.406 },
					{ s: 5, sk: 'sc', v: 0.583 },
					{ s: 5, sk: 'ps', v: 0.543 },
					{ s: 4, sk: 'wi', v: 0.124 },
					{ s: 6, sk: 'wi', v: 0.124 },
					{ s: 4, sk: 'ps', v: 0.215 },
					{ s: 6, sk: 'ps', v: 0.215 },
					{ s: 4, sk: 'sc', v: 0.109 },
					{ s: 6, sk: 'sc', v: 0.109 },
				],
			},
			{
				p: 11, t: 'tw',
				c: [
					{ s: 5, sk: 'sc', v: 0.607 },
					{ s: 5, sk: 'ps', v: 0.261 },
					{ s: 4, sk: 'wi', v: 0.174 },
					{ s: 6, sk: 'wi', v: 0.522 },
					{ s: 4, sk: 'ps', v: 0.060 },
					{ s: 6, sk: 'ps', v: 0.180 },
					{ s: 4, sk: 'sc', v: 0.150 },
					{ s: 6, sk: 'sc', v: 0.451 },
				],
			},
			{
				p: 13, t: 'n',
				c: [
					{ s: 5, sk: 'sc', v: 1.000 },
					{ s: 5, sk: 'ps', v: 0.369 },
					{ s: 4, sk: 'wi', v: 0.190 },
					{ s: 6, sk: 'wi', v: 0.190 },
					{ s: 4, sk: 'ps', v: 0.122 },
					{ s: 6, sk: 'ps', v: 0.122 },
					{ s: 4, sk: 'sc', v: 0.224 },
					{ s: 6, sk: 'sc', v: 0.224 },
				],
			},
			{
				p: 13, t: 'd',
				c: [
					{ s: 3, sk: 'pm', v: 0.406 },
					{ s: 5, sk: 'sc', v: 0.583 },
					{ s: 5, sk: 'ps', v: 0.543 },
					{ s: 4, sk: 'wi', v: 0.124 },
					{ s: 6, sk: 'wi', v: 0.124 },
					{ s: 4, sk: 'ps', v: 0.215 },
					{ s: 6, sk: 'ps', v: 0.215 },
					{ s: 4, sk: 'sc', v: 0.109 },
					{ s: 6, sk: 'sc', v: 0.109 },
				],
			},
			{
				p: 13, t: 'tw',
				c: [
					{ s: 5, sk: 'sc', v: 0.607 },
					{ s: 5, sk: 'ps', v: 0.261 },
					{ s: 4, sk: 'wi', v: 0.522 },
					{ s: 6, sk: 'wi', v: 0.174 },
					{ s: 4, sk: 'ps', v: 0.180 },
					{ s: 6, sk: 'ps', v: 0.060 },
					{ s: 4, sk: 'sc', v: 0.451 },
					{ s: 6, sk: 'sc', v: 0.150 },
				],
			},
		];

		var tactics = {
			normal: 'n',
			middle: 'tm',
			wing: 'tw',
			offensive: 'o',
			defensive: 'd',
		};

		var ft_stamina_discount = function() {
			try {
				var overlayRatingsNums = doc.getElementsByClassName('overlayRatingsNum');
				var overlayRatings = doc.getElementsByClassName('overlayRatings');
				var positionDivs = doc.querySelectorAll('#fieldplayers .position');
				for (var sector = 0; sector < overlayRatingsNums.length; ++sector) {
					var old_rating = orgRatings[sector];
					var sum_sq_c_ij_times_func_of_s_i = 0;
					var sum_sq_c_ij = 0;
					for (var position = 0; position < 14; ++position) {
						var positionDiv = positionDivs[position];
						var playerDiv = positionDiv.getElementsByClassName('player')[0];
						if (!playerDiv)
							continue;
						var id = playerDiv.id.match(/\d+/)[0];
						var playerStrip = doc.querySelector('#players #list_playerID' + id);
						// HTs use the same ID for elements in '#players' and in '.position'
						var player = JSON.parse(playerStrip.dataset.json);
						if (!player.stamina)
							continue;
						if (typeof (staminaData) == 'object' &&
							staminaData.hasOwnProperty(player.id)) {
							player.staminaPrediction = parseFloat(staminaData[player.id][1]);
						}
						else
							player.staminaPrediction = null;

						var tactic = 'normal', t;
						for (t in tactics) {
							if (Foxtrick.hasClass(positionDiv, t)) {
								tactic = t;
							}
						}

						for (var i = 0; i < contributions.length; ++i) {
							if (contributions[i].p == position &&
							    contributions[i].t == tactics[tactic]) {
								for (var j = 0; j < contributions[i].c.length; ++j) {
									if (contributions[i].c[j].s == sector) {
										var sq_c_ij = contributions[i].c[j].v *
											contributions[i].c[j].v;

										var staQ = getStaminaFactor(player.stamina,
										                            player.staminaPrediction);
										sum_sq_c_ij_times_func_of_s_i += sq_c_ij * staQ;
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
					div.textContent = Foxtrick.L10n.getFullLevelByValue(new_rating_rounded);
					Foxtrick.addClass(overlayRatings[sector * 2 + 1], 'hidden');
					overlayRatingsNums[sector].textContent = '[' + new_rating.toFixed(2) + ']';
					currentRatings[sector] = new_rating;
				}
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		Foxtrick.getChanges(fieldOverlay, function(nodes) {
			// run once and only if posLabels change
			Foxtrick.any(function(node) {
				if (Foxtrick.hasClass(node, 'posLabel')) {
					showLevelNumbers(node);
					return true;
				}
				return false;
			}, nodes);
		});

		// stamina discount
		var optionsDiv = Foxtrick.createFeaturedElement(doc, module, 'div');
		optionsDiv.id = 'ft_matchsimulator_options';
		optionsDiv.className = 'overlaySector overlayMidfield';
		fieldOverlay.appendChild(optionsDiv);

		var optionsStamina = doc.createElement('div');
		optionsDiv.appendChild(optionsStamina);

		var staminaDiscountCheck = doc.createElement('input');
		staminaDiscountCheck.id = 'ft_stamina_discount_check';
		staminaDiscountCheck.type = 'checkbox';

		staminaDiscountCheck.checked = Foxtrick.Prefs.getBool('MatchSimulator.staminaDiscountOn');
		Foxtrick.onClick(staminaDiscountCheck, clickHandler);
		optionsStamina.appendChild(staminaDiscountCheck);

		var staminaDiscountLabel = doc.createElement('label');
		staminaDiscountLabel.setAttribute('for', 'ft_stamina_discount_check');
		staminaDiscountLabel.textContent = Foxtrick.L10n.getString('matchOrder.staminaDiscount');
		staminaDiscountLabel.title = Foxtrick.L10n.getString('matchOrder.staminaDiscount.title');
		optionsStamina.appendChild(staminaDiscountLabel);

		var optionsAttVsDef = doc.createElement('div');
		optionsDiv.appendChild(optionsAttVsDef);

		var attVsDefCheck = doc.createElement('input');
		attVsDefCheck.id = 'ft_attVsDef_check';
		attVsDefCheck.type = 'checkbox';
		attVsDefCheck.checked = Foxtrick.Prefs.getBool('MatchSimulator.attVsDefOn');
		Foxtrick.onClick(attVsDefCheck, clickHandler);
		optionsAttVsDef.appendChild(attVsDefCheck);

		var attVsDefLabel = doc.createElement('label');
		attVsDefLabel.setAttribute('for', 'ft_attVsDef_check');
		attVsDefLabel.textContent = Foxtrick.L10n.getString('matchOrder.attVsDef');
		attVsDefLabel.title = Foxtrick.L10n.getString('matchOrder.attVsDef.title');
		optionsAttVsDef.appendChild(attVsDefLabel);

		var optionsRealProb = doc.createElement('div');
		optionsDiv.appendChild(optionsRealProb);

		var realProbabilitiesCheck = doc.createElement('input');
		realProbabilitiesCheck.id = 'ft_realProbabilities_check';
		realProbabilitiesCheck.type = 'checkbox';
		realProbabilitiesCheck.checked =
			Foxtrick.Prefs.getBool('MatchSimulator.realProbabilitiesOn');
		Foxtrick.onClick(realProbabilitiesCheck, clickHandler);
		optionsRealProb.appendChild(realProbabilitiesCheck);

		var realProbabilitiesLabel = doc.createElement('label');
		realProbabilitiesLabel.setAttribute('for', 'ft_realProbabilities_check');
		realProbabilitiesLabel.textContent =
			Foxtrick.L10n.getString('matchOrder.realProbabilities');
		realProbabilitiesLabel.title =
			Foxtrick.L10n.getString('matchOrder.realProbabilities.title');
		optionsRealProb.appendChild(realProbabilitiesLabel);

		var overlayBottom;
		if (useRatings || useHTMS) {
			overlayBottom = doc.createElement('div');
			fieldOverlay.appendChild(overlayBottom).id = 'ft-overlayBottom';
		}

		// ratings
		if (useRatings) {
			var ratingsDiv = Foxtrick.createFeaturedElement(doc, module, 'div');
			ratingsDiv.id = 'ft_simulation_ratings';
			var ratingsLabel = doc.createElement('h2');
			ratingsDiv.appendChild(ratingsLabel).textContent =
				Foxtrick.L10n.getString('matchOrder.ratings');
			var ratingsTable = doc.createElement('table');
			ratingsDiv.appendChild(ratingsTable).id = 'ft_simulation_ratings_table';
			overlayBottom.appendChild(ratingsDiv);
		}

		// --- flipping ---
		var checkFlipped = function(doc) {
			var fieldOverlay = doc.getElementById(FIELD_OVERLAY_ID);
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
			// ff is too fast, so we queue to ensure CSS has been added by page already
			var win = ev.target.ownerDocument.defaultView;
			Foxtrick.rAF(win, function() {
				checkFlipped(this.document);
			});
		});
		checkFlipped(doc);
	},
};
