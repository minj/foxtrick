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
	FIELD_OVERLAY_ID: 'fieldOverlay',
	run: function(doc) {
		var module = this;

		var isYouth = Foxtrick.Pages.Match.isYouth(doc);
		if (isYouth)
			return;

		var isHTOIntegrated = Foxtrick.Pages.Match.isHTOIntegrated(doc);
		var isHome;

		var displayOption = Foxtrick.Prefs.getInt('module.MatchSimulator.value');
		var fieldOverlay = doc.getElementById(module.FIELD_OVERLAY_ID);
		if (displayOption == 1)
			Foxtrick.addClass(fieldOverlay, 'displayBelow');
		else if (displayOption == 2)
			Foxtrick.addClass(fieldOverlay, 'displayRight');

		// TODO: remove once new match engine alert is gone
		var newME = doc.querySelector('#order_tabs div.alert');
		if (newME)
			Foxtrick.addClass(fieldOverlay, 'newME');

		var useRatings = Foxtrick.Prefs.isModuleEnabled('Ratings') &&
			Foxtrick.Prefs.isModuleOptionEnabled('MatchSimulator', 'UseRatingsModule');
		var useHTMS = Foxtrick.Prefs.isModuleOptionEnabled('MatchSimulator', 'HTMSPrediction');

		var overlayBottom;
		if (useRatings || useHTMS) {
			overlayBottom = doc.createElement('div');
			fieldOverlay.appendChild(overlayBottom).id = 'ft-overlayBottom';
		}
		var teamNames = new Array(2); // global var to be used for HTMS

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

		// old lineup import click
		var oldLineupId = null;
		var oldLineupSource = 'Hattrick';

		var oldLineups = doc.getElementById('oldLineups');
		Foxtrick.onClick(oldLineups, function(ev) {
			var target = ev.target;
			while (target.id != 'oldLineups' && !Foxtrick.hasClass(target, 'savedLineup'))
				target = target.parentNode;

			if (target.id == 'oldLineups')
				return;

			oldLineupId = target.id.match(/matchlineup_(\d+)/)[1];
			oldLineupSource = 'Hattrick';
			var matchIcon = target.querySelector('.matchTypeIcon img');
			var matchClass = matchIcon.className;
			var type = Foxtrick.Pages.Matches.getTypeFromIcon(matchClass);
			if (type) {
				var isHTO = Foxtrick.any(function(htoType) {
					return htoType === type;
				}, Foxtrick.Pages.Matches.HTO);
				if (isHTO)
					oldLineupSource = 'HTOIntegrated';
			}
			else {
				Foxtrick.error('Failed to detect matchTypeIcon type: ' + matchClass);
			}

			var addMatchText = doc.getElementById('addMatchText');
			if (addMatchText) {
				addMatchText.value = oldLineupId;

				var addMatchCheck = doc.getElementById('addMatchIsHTO');
				addMatchCheck.checked = oldLineupSource === 'HTOIntegrated';

				Foxtrick.removeClass(doc.getElementById('addMatchDiv'), 'hidden');
				Foxtrick.addClass(doc.getElementById('ft-matchSelect'), 'hidden');
			}
		});

		// --- flipping ---
		var checkFlipped = function(doc) {
			var fieldOverlay = doc.getElementById(module.FIELD_OVERLAY_ID);
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

		var MATCH_LIST_TMPL = '{date}: {home} - {goalsHome}:{goalsAway} - {away}';
		var MATCH_SELECT_ID = 'ft-matchSelect';

		// ratings and tactic for predicted and for selected other team's match
		var currentRatings = new Array(9), currentRatingsOther = new Array(9),
			orgRatings = new Array(9), oldRatings = new Array(9);

		var currentMatchXML = null, currentOtherTeamID = null, currentHomeAway = null;

		var addMatch = function(ev, opts) {
			var doc = ev.target.ownerDocument;

			var addMatchIsHTO = doc.getElementById('addMatchIsHTO');
			var sourceSystem = addMatchIsHTO.checked ? 'HTOIntegrated' : 'Hattrick';

			var addMatchText = doc.getElementById('addMatchText');
			var matchId = parseInt(addMatchText.value, 10);
			if (isNaN(matchId))
				return;

			var addMatchHomeAwaySelect = doc.getElementById('addMatchHomeAwaySelect');
			opts.homeAway = addMatchHomeAwaySelect.value;
			opts.isNew = true;

			var addMatchDiv = doc.getElementById('addMatchDiv');
			var select = doc.getElementById('ft-matchSelect');
			Foxtrick.addClass(addMatchDiv, 'hidden');
			Foxtrick.removeClass(select, 'hidden');

			getMatchDetails(matchId, sourceSystem, opts);
		};
		var addNewMatch = function(matchXML, homeAway) {
			var option = doc.createElement('option');
			option.value = matchXML.text('MatchID');
			var SourceSystem = matchXML.text('SourceSystem');
			option.setAttribute('SourceSystem', SourceSystem);
			option.setAttribute('homeAway', homeAway);
			var MatchType = matchXML.num('MatchType');
			option.className = 'ftOptionIcon ' + module.MatchTypes[MatchType].className;

			var MatchDate = matchXML.time('MatchDate');
			var date = Foxtrick.util.time.buildDate(MatchDate, { showTime: false });
			var howeAwayStr = Foxtrick.L10n.getString('matchOrder.' + homeAway + '.abbr');

			var tmpl = '{HA}: ' + MATCH_LIST_TMPL;
			var info = {
				HA: howeAwayStr,
				date: date,
				home: matchXML.text('HomeTeamName').substr(0, 20),
				away: matchXML.text('AwayTeamName').substr(0, 20),
				goalsHome: matchXML.text('HomeGoals'),
				goalsAway: matchXML.text('AwayGoals'),
			};
			option.textContent = Foxtrick.format(tmpl, info);

			var select = doc.getElementById(MATCH_SELECT_ID);
			select.appendChild(option);
			select.selectedIndex = select.options.length - 1;
		};
		// on selecting a match, matchId and get ratings if appropriate
		var onMatchSelect = function(ev, opts) {
			var doc = ev.target.ownerDocument;
			var select = doc.getElementById(MATCH_SELECT_ID);
			var fieldOverlay = doc.getElementById(module.FIELD_OVERLAY_ID);

			var selectedMatchId = parseInt(select.value, 10);
			var selectedOption = select.options[select.selectedIndex];
			var SourceSystem = selectedOption.getAttribute('SourceSystem');
			var homeAway = selectedOption.getAttribute('homeAway');

			// if no match selected,
			// cleanup old ratings display and reset currentRatingsOther,
			// so that percentBars and HTMS gets cleaned as well
			if (selectedMatchId == -1) {
				var otherWrappers = fieldOverlay.getElementsByClassName('ft-otherWrapper');

				Foxtrick.forEach(function(wrapper, i) {
					wrapper.parentNode.removeChild(wrapper);
					currentRatingsOther[i] = undefined;
				}, otherWrappers);

				var tacticLevelLabelOther = doc.getElementById('tacticLevelLabelOther');

				if (tacticLevelLabelOther) {
					var labelParent = tacticLevelLabelOther.parentNode;
					labelParent.removeChild(tacticLevelLabelOther);
				}

				module.updateBarsAndHTMS(doc, currentRatings, currentRatingsOther, opts);
				return;
			}
			// add a matchId manually
			else if (selectedMatchId === 0) {
				Foxtrick.addClass(ev.target, 'hidden');
				var addMatchDiv = doc.getElementById('addMatchDiv');
				Foxtrick.removeClass(addMatchDiv, 'hidden');
				return;
			}

			opts.homeAway = homeAway;
			opts.isNew = false;
			getMatchDetails(selectedMatchId, SourceSystem, opts);
		};
		var processMatch = function(matchXML, opts) {
			currentMatchXML = matchXML;
			currentHomeAway = opts.homeAway;
			currentOtherTeamID = opts.teamId;

			module.updateOtherRatings(doc, currentRatingsOther, matchXML, opts);
			module.updateBarsAndHTMS(doc, currentRatings, currentRatingsOther, opts);
		};
		// var getMatchDetails = function(selectedMatchid, sourceSystem, homeAway, isNew) {
		var getMatchDetails = function(matchId, sourceSystem, opts) {
			var loadingMatchList = opts.loading;
			var isNew = opts.isNew;
			var homeAway = opts.homeAway;

			if (loadingMatchList && loadingMatchList.parentNode) {
				loadingMatchList.parentNode.removeChild(loadingMatchList);
				loadingMatchList = null;
			}

			// get selected match
			var loading;
			if ((loading = doc.getElementById('loadingMatchID'))) {
				loading.parentNode.removeChild(loading);
			}

			var loadingMatch = Foxtrick.util.note.createLoading(doc);
			loadingMatch.id = 'loadingMatchID';
			opts.loading = loadingMatch;

			var overlayHTMS = doc.getElementById('ft-overlayHTMS');
			if (overlayHTMS)
				overlayHTMS.insertBefore(loadingMatch, overlayHTMS.firstChild);
			else
				doc.getElementById('field').appendChild(loadingMatch);

			var selectedMatchArgs = [
				['file', 'matchdetails'],
				['version', '2.3'],
				['matchId', parseInt(matchId, 10)],
				['sourceSystem', sourceSystem],
			];
			var cacheArgs = { cache_lifetime: 'session' };
			Foxtrick.util.api.retrieve(doc, selectedMatchArgs, cacheArgs,
			  function(matchXML, errorText) {
				var select = doc.getElementById(MATCH_SELECT_ID);
				if (errorText || !matchXML) {
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

				if (!matchXML.node('HomeGoals')) {
					// game not played
					select.value = -1;
					return;
				}

				if (isNew) {
					addNewMatch(matchXML, homeAway);
				}

				processMatch(matchXML, opts);
			});
		};
		var buildMatchList = function(matchesXML, opts) {
			var select = doc.createElement('select');
			select.id = MATCH_SELECT_ID;
			var optionNoMatch = doc.createElement('option');
			optionNoMatch.value = -1;
			optionNoMatch.textContent = Foxtrick.L10n.getString('matchOrder.noMatchSelected');
			select.appendChild(optionNoMatch);

			var option = doc.createElement('option');
			option.value = 0;
			option.textContent = Foxtrick.L10n.getString('matchOrder.AddMatchManually');
			select.appendChild(option);

			var otherMatchesNodes = matchesXML.getElementsByTagName('Match');
			Foxtrick.forEach(function(match) {
				// README: no HTO in match archive
				var SourceSystem = 'Hattrick';
				// var SourceSystem = matchesXML.text('SourceSystem', match);
				var MatchType = matchesXML.num('MatchType', match);

				// skip friendlies
				var isFriendly = Foxtrick.any(function(type) {
					return type === MatchType;
				}, Foxtrick.Pages.Matches.Friendly);
				if (isFriendly)
					return;

				var MatchDate = matchesXML.time('MatchDate', match);
				var date = Foxtrick.util.time.buildDate(MatchDate, { showTime: false });
				var MatchID = matchesXML.text('MatchID', match);

				var option = doc.createElement('option');
				var className = module.MatchTypes[MatchType].className;
				option.className = 'ftOptionIcon ' + className;
				option.setAttribute('SourceSystem', SourceSystem);
				option.value = MatchID;

				var info = {
					date: date,
					home: matchesXML.text('HomeTeamName', match).substr(0, 20),
					away: matchesXML.text('AwayTeamName', match).substr(0, 20),
					goalsHome: matchesXML.text('HomeGoals', match),
					goalsAway: matchesXML.text('AwayGoals', match),
				};
				option.textContent = Foxtrick.format(MATCH_LIST_TMPL, info);

				select.appendChild(option);
			}, otherMatchesNodes);

			Foxtrick.listen(select, 'change', function(ev) {
				onMatchSelect(ev, opts);
			});
			var fieldOverlay = doc.getElementById(module.FIELD_OVERLAY_ID);
			fieldOverlay.appendChild(select);

			// manual add a match
			var addMatchDiv = doc.createElement('div');
			addMatchDiv.className = 'hidden';
			addMatchDiv.id = 'addMatchDiv';
			fieldOverlay.appendChild(addMatchDiv);

			var addMatchText = doc.createElement('input');
			addMatchText.id = 'addMatchText';
			addMatchText.type = 'text';
			addMatchText.size = 10;
			addMatchDiv.appendChild(addMatchText);

			var addMatchHomeAwayLabel = doc.createElement('label');
			addMatchHomeAwayLabel.id = 'addMatchhomeAwayLabel';
			addMatchHomeAwayLabel.textContent = Foxtrick.L10n.getString('matchOrder.homeAway.abbr');
			addMatchHomeAwayLabel.title = Foxtrick.L10n.getString('matchOrder.homeAway');
			addMatchDiv.appendChild(addMatchHomeAwayLabel);

			var addMatchHomeAwaySelect = doc.createElement('select');
			addMatchHomeAwaySelect.id = 'addMatchHomeAwaySelect';
			addMatchHomeAwaySelect.title = Foxtrick.L10n.getString('matchOrder.homeAway');
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
			addMatchCheckLabel.textContent = Foxtrick.L10n.getString('matchOrder.tournamentMatch');
			addMatchDiv.appendChild(addMatchCheckLabel);

			if (oldLineupId) {
				addMatchText.value = oldLineupId;
				if (oldLineupSource === 'HTOIntegrated')
					addMatchCheck.checked = true;

				Foxtrick.removeClass(addMatchDiv, 'hidden');
				Foxtrick.addClass(select, 'hidden');
			}

			var addMatchButtonOk = doc.createElement('input');
			addMatchButtonOk.id = 'addMatchButton';
			addMatchButtonOk.type = 'button';
			addMatchButtonOk.value = Foxtrick.L10n.getString('button.add');
			addMatchDiv.appendChild(addMatchButtonOk);

			Foxtrick.onClick(addMatchButtonOk, function(ev) {
				addMatch(ev, opts);
			});

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
		};

		var getMatchList = function(teamId, opts) {
			var loadingMatchList = opts.loading;
			var otherMatchesArgs = [
				['file', 'matchesarchive'],
				['teamId', parseInt(teamId, 10)],
			];

			var cacheArgs = { cache_lifetime: 'session' };
			Foxtrick.util.api.retrieve(doc, otherMatchesArgs, cacheArgs,
			  function(matchesXML, errorText) {
				if (errorText) {
					Foxtrick.log(errorText);
					if (loadingMatchList)
						loadingMatchList.textContent = errorText;
				}
				else if (loadingMatchList && loadingMatchList.parentNode) {
					loadingMatchList.parentNode.removeChild(loadingMatchList);
					loadingMatchList = null;
				}
				if (!matchesXML)
					return;

				buildMatchList(matchesXML, opts);
			});
		};

		var setupSimulator = function(matchId, opts) {
			// close button tweaked.
			var hideOverlay = function(ev) {
				var doc = ev.target.ownerDocument;
				var fieldOverlay = doc.getElementById(module.FIELD_OVERLAY_ID);
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
			Foxtrick.onClick(copyButton, module.copyRatings.bind(module));

			var fieldOverlay = doc.getElementById(module.FIELD_OVERLAY_ID);
			fieldOverlay.appendChild(copyButton);

			// display selection of matches to compare to
			// first, get team id of other team
			var loadingMatchList = Foxtrick.util.note.createLoading(doc);
			var overlayHTMS = doc.getElementById('ft-overlayHTMS');
			if (overlayHTMS)
				overlayHTMS.appendChild(loadingMatchList);
			else
				doc.getElementById('field').appendChild(loadingMatchList);

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
					if (loadingMatchList && loadingMatchList.parentNode) {
						loadingMatchList.parentNode.removeChild(loadingMatchList);
						loadingMatchList = null;
					}
					Foxtrick.log(errorText);
					return;
				}

				// determine otherTeamId
				var HomeTeamID = orderMatchXml.num('HomeTeamID');
				var AwayTeamID = orderMatchXml.num('AwayTeamID');
				var crumbs = Foxtrick.Pages.All.getBreadCrumbs(doc);
				var thisTeamID = Foxtrick.util.id.getTeamIdFromUrl(crumbs[0].href);

				var teamId;
				if (thisTeamID == HomeTeamID) {
					isHome = true;
					teamId = AwayTeamID;
					teamNames[0] = orderMatchXml.text('HomeTeamName');
					teamNames[1] = orderMatchXml.text('AwayTeamName');
				}
				else {
					isHome = false;
					teamId = HomeTeamID;
					teamNames[1] = orderMatchXml.text('HomeTeamName');
					teamNames[0] = orderMatchXml.text('AwayTeamName');
				}
				opts.teamId = teamId;
				opts.loading = loadingMatchList;
				getMatchList(teamId, opts);
			});
		};

		var showLevelNumbers = function(target) {
			if (!Foxtrick.hasClass(target, 'posLabel') &&
			    target.id != 'ft_stamina_discount_check' &&
			    target.id != 'ft_attVsDef_check' &&
			    target.id != 'ft_realProbabilities_check')
				return;

			// Foxtrick.log('showLevelNumbers')
			var tacticLevelLabel = doc.getElementById('tacticLevelLabel');

			var attVsDef = doc.getElementById('ft_attVsDef_check');
			Foxtrick.Prefs.setBool('MatchSimulator.attVsDefOn', attVsDef.checked);

			var realProb = doc.getElementById('ft_realProbabilities_check');
			Foxtrick.Prefs.setBool('MatchSimulator.realProbabilitiesOn', realProb.checked);

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
				module.staminaDiscount(doc, orgRatings, currentRatings);
			}
			else {
				Foxtrick.Prefs.setBool('MatchSimulator.staminaDiscountOn', false);
			}

			for (var i = 0; i < 7; ++i) {
				if (oldRatings[i] !== undefined) {
					var id = 'ft-full-level' + i;
					var div = doc.getElementById(id);
					var diff = currentRatings[i] - oldRatings[i];
					var diffStr = diff.toFixed(2);
					var diffTrunc = parseFloat(diffStr);

					var span = doc.createElement('span');
					span.textContent = ' (' + diffStr + ')';
					if (diffTrunc < 0) {
						span.className = 'ft-colorLower ft-ratingChange';
						div.appendChild(span);
					}
					else if (diffTrunc > 0) {
						span.className = 'ft-colorHigher ft-ratingChange';
						div.appendChild(span);
					}
				}
			}

			var updateOther = target.id == 'ft_attVsDef_check' ||
				target.id == 'ft_realProbabilities_check';
			var updateHTMS = !updateOther;
			var updatePctgDiff = target.id != 'ft_attVsDef_check';

			var opts = {
				isHome: isHome,
				teamNames: teamNames,
				update: {
					other: updateOther,
					htms: updateHTMS,
					pctgDiff: updatePctgDiff,
				},
			};

			if (displayOption) {
				// keep it visible till closed
				Foxtrick.addClass(fieldOverlay, 'visible');
			}

			// this injects Ratings module so should always run
			module.updateBarsAndHTMS(doc, currentRatings, currentRatingsOther, opts);

			var matchId = Foxtrick.util.id.getMatchIdFromUrl(doc.location.href);
			if (!matchId)
				return;

			// opened first time
			if (!doc.getElementById('ft-copyRatingsButton')) {
				setupSimulator(matchId, opts);
			}
			else {
				if (updateOther && currentMatchXML) {
					opts.teamId = currentOtherTeamID;
					opts.homeAway = currentHomeAway;
					module.updateOtherRatings(doc, currentRatingsOther, currentMatchXML, opts);
				}
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

		var clickHandler = function(ev) {
			showLevelNumbers(ev.target);
		};
		module.buildOptions(doc, clickHandler);
	},
	buildOptions: function(doc, clickHandler) {
		var module = this;

		var fieldOverlay = doc.getElementById(module.FIELD_OVERLAY_ID);

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
	},
	getTacticsLabel: function(doc) {
		var teamTacticsDiv = doc.getElementById('tactics').cloneNode(true);
		teamTacticsDiv.removeChild(teamTacticsDiv.getElementsByClassName('speechLevel')[0]);
		teamTacticsDiv.removeChild(teamTacticsDiv.getElementsByTagName('select')[0]);
		return teamTacticsDiv.textContent.trim();
	},
	normalizeRatings: function(level) {
		return Math.floor((level + 0.125) * 4) / 4;
	},
	copyRatings: function(ev) {
		var module = this;

		var doc = ev.target.ownerDocument;

		var text = '';

		var fieldOverlay = doc.getElementById(module.FIELD_OVERLAY_ID);
		var overlayRatings = fieldOverlay.getElementsByClassName('overlayRatings');

		// get some tactics etc labels for common use
		var speechLevelDiv = doc.getElementsByClassName('speechLevel')[0].cloneNode(true);
		var speechLevelTitle = speechLevelDiv.firstChild.textContent.trim();

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
		var matchId = Foxtrick.util.id.getMatchIdFromUrl(doc.location.href);
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
			text += ' [u]' + speechLevel + '[/u]\n';
		}

		// coach type
		text += doc.getElementById('trainerTypeLabel').textContent + '\n';

		// tactics
		var teamTacticsTitle = module.getTacticsLabel(doc);
		var teamTacticsSelect = doc.getElementById('teamtactics');
		var selectedTactics = teamTacticsSelect.options[teamTacticsSelect.selectedIndex];
		var tactics = selectedTactics.textContent;
		text += teamTacticsTitle;
		text += ' [u]' + tactics + '[/u] / ';
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
		var calcRatings = doc.getElementById('calcRatings').value.trim();
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
				text += '[b]' + overlayRatings[i].textContent.trim() + '[/b]\n';
			}
			else {
				// sector rating
				if (!Foxtrick.hasClass(overlayRatings[i], 'hidden')) {
					text += overlayRatings[i].textContent.trim() + '\n';
				}
				else {
					// stamina discounted
					text += overlayRatings[i].nextSibling.textContent.trim() + '\n';
				}
				text += doc.getElementById('ft-full-level' + count++).textContent.trim() + '\n';

				// add other teams ratings if appropriate
				if (otherMatchId > 0) {
					var ratingInnerBox = overlayRatings[i].parentNode;
					var rating = ratingInnerBox.querySelector('.percentNumber');
					text += '[q]' + rating.textContent.trim() + '[/q]';
					var divs = ratingInnerBox.querySelectorAll('.ft-otherWrapper div');
					text += '[b]' + divs[0].textContent.trim() + '[/b]\n';
					text += divs[1].textContent.trim() + '\n';
					text += divs[2].textContent.trim() + '\n';
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
	},
	// change bars to represent percentage of ratings comparison between predicted ratings
	// and selected other team's match ratings and update HTMSPrediction
	updateBarsAndHTMS: function(doc, ratings, ratingsOther, opts) {
		var module = this;

		var updateHTMS = opts.update.htms;
		var updatePctgDiff = opts.update.pctgDiff;
		var teamNames = opts.teamNames;

		var useHTMS = Foxtrick.Prefs.isModuleOptionEnabled('MatchSimulator', 'HTMSPrediction');
		var useRatings = Foxtrick.Prefs.isModuleEnabled('Ratings') &&
			Foxtrick.Prefs.isModuleOptionEnabled('MatchSimulator', 'UseRatingsModule');

		if (updateHTMS && useHTMS)
			module.updateHTMS(doc, ratings, ratingsOther, teamNames);

		if (useRatings)
			module.addRatings(doc, ratings, ratingsOther);

		var attVsDefCheck = doc.getElementById('ft_attVsDef_check');
		var realProbabilitiesCheck = doc.getElementById('ft_realProbabilities_check');
		var doRealProb = attVsDefCheck.checked && realProbabilitiesCheck.checked;
		var realProbTitle = Foxtrick.L10n.getString('matchOrder.probability.title');

		var fieldOverlay = doc.getElementById(module.FIELD_OVERLAY_ID);
		var percentImages = fieldOverlay.getElementsByClassName('percentImage');
		Foxtrick.forEach(function(percentImage, i) {
			var percentNumber;
			if (typeof ratingsOther[i] !== 'undefined') {
				// change to zero-based ratings
				var curr = ratings[i] ? ratings[i] - 1 : 0;
				var other = ratingsOther[i] ? ratingsOther[i] - 1 : 0;
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
					percentNumber.title = doRealProb ? realProbTitle.replace(/%s/, oldVal) : '';
					percentNumber.className = 'percentNumber';
					var before = percentImage.nextSibling;
					percentImage.parentNode.insertBefore(percentNumber, before);
				}
				else {
					percentNumber = percentImage.nextSibling;
					percentNumber.textContent = title;
					percentNumber.title = doRealProb ? realProbTitle.replace(/%s/, oldVal) : '';

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
	},
	// updating or adding HTMS prediction based on rating prediction
	// and selected match of another team
	updateHTMS: function(doc, ratings, ratingsOther, teamNames) {
		var module = this;

		var normalizeRatings = module.normalizeRatings;

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
		if (typeof ratingsOther[0] !== 'undefined') {
			var tacticAbbr = ['', 'pressing', 'ca', 'aim', 'aow', 'cre', 'long'];
			var midfieldLevel = [normalizeRatings(ratings[3]) - 1, ratingsOther[3] - 1];
			var rdefence = [normalizeRatings(ratings[0]) - 1, ratingsOther[6] - 1];
			var cdefence = [normalizeRatings(ratings[1]) - 1, ratingsOther[5] - 1];
			var ldefence = [normalizeRatings(ratings[2]) - 1, ratingsOther[4] - 1];
			var rattack = [normalizeRatings(ratings[4]) - 1, ratingsOther[2] - 1];
			var cattack = [normalizeRatings(ratings[5]) - 1, ratingsOther[1] - 1];
			var lattack = [normalizeRatings(ratings[6]) - 1, ratingsOther[0] - 1];

			var tactics = [tacticAbbr[ratings[7]], tacticAbbr[ratingsOther[7]]];
			var tacticsLevel = [ratings[8], ratingsOther[8]];
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
	},
	updateOtherRatings: function(doc, ratings, xml, opts) {
		var module = this;

		var teamId = opts.teamId; // opponent
		var homeAway = opts.homeAway; // selected match
		var isHome = opts.isHome; // simulated match
		var update = opts.update.other;
		var teamNames = opts.teamNames;

		// select team node
		var teamLink = Foxtrick.Pages.All.getBreadCrumbs(doc)[0];
		var thisTeamID = Foxtrick.util.id.getTeamIdFromUrl(teamLink.href);

		var HomeTeamID = xml.num('HomeTeamID');
		var AwayTeamID = xml.num('AwayTeamID');

		var doHome = true;
		if (homeAway == 'away' || // chose away
		    (homeAway != 'home' && // auto detect away
		     (teamId == AwayTeamID || thisTeamID == HomeTeamID || // one of the teams
		      isHome && teamId != HomeTeamID && thisTeamID != AwayTeamID)
		      // none of the teams match + playing home
		    )) {
			doHome = false;
		}

		var teamNode;
		if (doHome) {
			teamNode = xml.node('HomeTeam');
			teamNames[1] = xml.text('HomeTeamName');
		}
		else {
			teamNode = xml.node('AwayTeam');
			teamNames[1] = xml.text('AwayTeamName');
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
			var htValue = xml.num(rating.type, teamNode);
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

		var fieldOverlay = doc.getElementById(module.FIELD_OVERLAY_ID);

		// display other teams ratings
		var attVsDefCheck = doc.getElementById('ft_attVsDef_check');
		var ratingBoxes = doc.getElementsByClassName('ratingInnerBox');
		for (var i = 0; i < ratingBoxes.length; ++i) {
			var j = attVsDefCheck.checked ? i : ratingBoxes.length - 1 - i;
			// reverse order?

			var fullLevel = selectedRatings[j].value;
			var levelText = '[' + fullLevel.toFixed(2) + ']';

			var posLabel = fieldOverlay.getElementsByClassName('posLabel');
			var label, overlayOther;

			var id = 'ft-full-level-other' + i;
			var div = doc.getElementById(id);
			if (div) {
				// there was another match selected before. show ratings and differences
				div.textContent = levelText;
				if (!update) {
					var diff = fullLevel - ratings[j];
					var diffStr = diff.toFixed(2);
					var diffTrunc = parseFloat(diffStr);

					var span = doc.createElement('span');
					span.textContent = ' (' + diffStr + ')';
					if (diffTrunc < 0) {
						span.className = 'ft-colorLower ft-otherChange';
						div.appendChild(span);
					}
					else if (diffTrunc > 0) {
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
				label.textContent = posLabel[6 - j].textContent;

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
			ratings[j] = fullLevel;
		}

		// add tactics
		var TACTIC_LABEL_TMPL = '{label} {type} / {levelLabel}: {level} ({num})';
		var tacticLevelLabel = doc.getElementById('tacticLevelLabel');
		var tacticLevelLabelOther = doc.getElementById('tacticLevelLabelOther');
		if (!tacticLevelLabelOther) {
			tacticLevelLabelOther = doc.createElement('div');
			tacticLevelLabelOther.id = 'tacticLevelLabelOther';
			Foxtrick.insertAfter(tacticLevelLabelOther, tacticLevelLabel);
		}
		var tacticLevelLabelTitle = tacticLevelLabel.textContent.split(':')[0];
		ratings[7] = selectedRatings[7].value;
		ratings[8] = selectedRatings[8].value;

		var teamTacticsTitle = module.getTacticsLabel(doc);
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
	},
	// add Ratings module functionality
	addRatings: function(doc, ratings, ratingsOther) {
		var module = this;

		var normalizeRatings = module.normalizeRatings;
		var tacticNames = ['normal', 'pressing', 'ca', 'aim', 'aow', 'creatively', 'longshots'];

		var midfieldLevel = [normalizeRatings(ratings[3]) - 1, ratingsOther[3] - 1];
		var rdefence = [normalizeRatings(ratings[0]) - 1, ratingsOther[6] - 1];
		var cdefence = [normalizeRatings(ratings[1]) - 1, ratingsOther[5] - 1];
		var ldefence = [normalizeRatings(ratings[2]) - 1, ratingsOther[4] - 1];
		var rattack = [normalizeRatings(ratings[4]) - 1, ratingsOther[2] - 1];
		var cattack = [normalizeRatings(ratings[5]) - 1, ratingsOther[1] - 1];
		var lattack = [normalizeRatings(ratings[6]) - 1, ratingsOther[0] - 1];

		var tactics = [tacticNames[ratings[7]], tacticNames[ratingsOther[7]]];
		var tacticsLevel = [ratings[8], ratingsOther[8]];

		var ratingsTable = doc.getElementById('ft_simulation_ratings_table');
		var newTable = ratingsTable.cloneNode(false);

		var twoTeams = typeof ratingsOther[0] !== 'undefined';
		Foxtrick.modules['Ratings'].addRatings(
			doc, newTable,
			midfieldLevel, rdefence, cdefence, ldefence, rattack, cattack, lattack,
			tactics, tacticsLevel,
			twoTeams
		);

		ratingsTable.parentNode.replaceChild(newTable, ratingsTable);
	},
	staminaDiscount: function(doc, orgRatings, currentRatings) {
		var module = this;

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

		var staminaData = module.STAMINA_DATA;

		try {
			var overlayRatingsNums = doc.getElementsByClassName('overlayRatingsNum');
			var overlayRatings = doc.getElementsByClassName('overlayRatings');
			var positionDivs = doc.querySelectorAll('#fieldplayers .position');
			var positions = Foxtrick.toArray(positionDivs).slice(0, 14); // truncate bench
			Foxtrick.forEach(function(ratingsNum, sector) {
				var sumSquareVEnergy = 0;
				var sumSquareV = 0;
				Foxtrick.forEach(function(positionDiv, pos) {
					var playerDiv = positionDiv.getElementsByClassName('player')[0];
					if (!playerDiv)
						return;

					var id = playerDiv.id.match(/\d+/)[0];
					var playerStrip = doc.querySelector('#players #list_playerID' + id);
					// HTs use the same ID for elements in '#players' and in '.position'
					var player = JSON.parse(playerStrip.dataset.json);
					if (!player.stamina)
						return;

					var staminaPrediction = null;
					if (staminaData[player.id]) {
						staminaPrediction = parseFloat(staminaData[player.id][1]);
					}

					var tacticClass = 'normal'; // default to normal player tactic
					var tacticAbbrs = module.TACTICS;
					for (var cls in tacticAbbrs) {
						if (Foxtrick.hasClass(positionDiv, cls)) {
							tacticClass = cls;
						}
					}
					var tacticAbbr = tacticAbbrs[tacticClass];

					var position = Foxtrick.nth(function(p) {
						return p.p == pos && p.t == tacticAbbr;
					}, module.CONTRIBUTIONS);

					var contributions = Foxtrick.filter(function(c) {
						return c.s == sector;
					}, position.c);

					Foxtrick.forEach(function(c) {
						var squareV = c.v * c.v;
						var energy = getStaminaFactor(player.stamina, staminaPrediction);
						sumSquareVEnergy += squareV * energy;
						sumSquareV += squareV;
					}, contributions);

				}, positions);

				var oldRating = orgRatings[sector];
				var newRating = oldRating * sumSquareVEnergy / sumSquareV;
				var newRatingNorm = module.normalizeRatings(newRating);
				var discount = doc.createElement('div');
				discount.className = 'overlayRatingsDiscounted';
				discount.textContent = Foxtrick.L10n.getFullLevelByValue(newRatingNorm);

				Foxtrick.insertAfter(discount, overlayRatings[sector * 2 + 1]);
				Foxtrick.addClass(overlayRatings[sector * 2 + 1], 'hidden');

				ratingsNum.textContent = '[' + newRating.toFixed(2) + ']';
				currentRatings[sector] = newRating;
			}, overlayRatingsNums);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},
	get STAMINA_DATA() {
		if (!this._STAMINA_DATA) {
			var staminaData = {};
			var useStaminaPred = Foxtrick.Prefs.isModuleOptionEnabled(this, 'StaminaPrediction');
			if (useStaminaPred) {
				var ownId = Foxtrick.util.id.getOwnTeamId();
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
			this._STAMINA_DATA = staminaData;
		}
		return this._STAMINA_DATA;
	},
	CONTRIBUTIONS: [
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
	],
	TACTICS: {
		normal: 'n',
		middle: 'tm',
		wing: 'tw',
		offensive: 'o',
		defensive: 'd',
	},
};
