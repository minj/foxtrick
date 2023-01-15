/**
 * match-simulator.js
 * compare to other teams and simulate matches using HTMS
 * @author convinced, LA-MJ
 */

'use strict';

Foxtrick.modules.MatchSimulator = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['matchOrder'],
	RADIO_OPTIONS: ['RatingsOnTop', 'RatingsBelow', 'RatingsRight'],
	OPTIONS: ['HTMSPrediction', 'UseRatingsModule', 'StaminaPrediction'],
	CSS: Foxtrick.InternalPath + 'resources/css/match-simulator.css',

	FIELD_OVERLAY_ID: 'fieldOverlay',
	CONTROLS_ID: 'ft-simulator-controls',
	MATCH_SELECT_ID: 'ft-matchSelect',
	run: function(doc) {
		var module = this;

		var IS_YOUTH = Foxtrick.Pages.Match.isYouth(doc);
		if (IS_YOUTH)
			return;

		// global vars, NOT constants!
		var gTeamNames = new Array(2); // global var to be used for HTMS,

		// ratings and tactic for predicted and for selected other team's match
		var gRatings = new Array(9), gRatingsOther = new Array(9);
		var gOldRatings = new Array(9); // previous ratings
		var gOrgRatings = new Array(9); // no stamina discount
		var gSimulatorReady = false; // track first run

		var gMatchXML = null, gOtherTeamID = null, gHomeAway = null;

		var IS_HTO = Foxtrick.Pages.Match.isHTOIntegrated(doc);
		var SOURCE_SYSTEM = IS_HTO ? SOURCE_SYSTEM = 'HTOIntegrated' : 'Hattrick';
		var IS_HOME; // defined later but once only!

		var TEAM_ID = Foxtrick.Pages.Match.getMyTeamId(doc);

		var MATCH_ID = Foxtrick.util.id.getMatchIdFromUrl(doc.location.href);
		if (!MATCH_ID) {
			// no matchId: match sandbox
			IS_HOME = true;
			var crumbs = Foxtrick.Pages.All.getBreadCrumbs(doc);
			gTeamNames[0] = crumbs[0].textContent.trim();
		}

		var displayOption = Foxtrick.Prefs.getInt('module.MatchSimulator.value');
		var fieldOverlay = doc.getElementById(module.FIELD_OVERLAY_ID);
		if (displayOption == 1)
			Foxtrick.addClass(fieldOverlay, 'displayBelow');
		else if (displayOption == 2)
			Foxtrick.addClass(fieldOverlay, 'displayRight');

		var useRatings = Foxtrick.Prefs.isModuleEnabled('Ratings') &&
			Foxtrick.Prefs.isModuleOptionEnabled(module, 'UseRatingsModule');
		var useHTMS = Foxtrick.Prefs.isModuleOptionEnabled(module, 'HTMSPrediction');

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

		// old lineup import click
		var oldLineupId = null;
		var oldLineupSource = 'Hattrick';

		var oldLineups = doc.getElementById('oldLineups');
		let savedLineups = oldLineups.querySelectorAll('.savedLineup');
		for (let saved of savedLineups) {
			saved.setAttribute('role', 'button');
			saved.setAttribute('tabindex', '0');
		}

		Foxtrick.listen(oldLineups, 'click', function(ev) {
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
				Foxtrick.log(new Error('Failed to detect matchTypeIcon type: ' + matchClass));
			}

			var addMatchText = doc.getElementById('addMatchText');
			if (addMatchText) {
				addMatchText.value = oldLineupId;

				var addMatchCheck = doc.getElementById('addMatchIsHTO');
				addMatchCheck.checked = oldLineupSource === 'HTOIntegrated';
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

		var MATCH_LIST_TMPL = '{date}: {HomeTeamName} - {HomeGoals}:{AwayGoals} - {AwayTeamName}';

		var addTeam = function(ev, opts) {
			var doc = ev.target.ownerDocument;

			var addTeamText = doc.getElementById('addTeamText');
			var teamId = parseInt(addTeamText.value, 10);
			if (isNaN(teamId))
				return;

			var addTeamDiv = doc.getElementById('addTeamDiv');
			Foxtrick.addClass(addTeamDiv, 'hidden');

			var predControls = doc.querySelector('.ft-simulator-pred-controls');
			if (predControls)
				Foxtrick.removeClass(predControls, 'hidden');

			var select = doc.getElementById(module.MATCH_SELECT_ID);
			select.selectedIndex = 0;
			Foxtrick.removeClass(select, 'hidden');

			// var addTeamOption = doc.getElementById('addTeamOption');
			// addTeamOption.parentNode.removeChild(addTeamOption);

			// add a flag for buildMatchSimulator to skip recreating everything
			opts.matchesOnly = true;
			// set opts to ensure auto-detect works properly
			opts.teamId = teamId;
			getMatchList(teamId, opts);
		};
		var addMatch = function(ev, opts) {
			var doc = ev.target.ownerDocument;

			var addMatchText = doc.getElementById('addMatchText');
			var matchId = parseInt(addMatchText.value, 10);
			if (isNaN(matchId))
				return;

			var addMatchIsHTO = doc.getElementById('addMatchIsHTO');
			var sourceSystem = addMatchIsHTO.checked ? 'HTOIntegrated' : 'Hattrick';

			var addMatchHomeAwaySelect = doc.getElementById('addMatchHomeAwaySelect');
			opts.homeAway = addMatchHomeAwaySelect.value;
			opts.isNew = true;

			var addMatchDiv = doc.getElementById('addMatchDiv');
			Foxtrick.addClass(addMatchDiv, 'hidden');

			var predControls = doc.querySelector('.ft-simulator-pred-controls');
			if (predControls)
				Foxtrick.removeClass(predControls, 'hidden');

			var select = doc.getElementById(module.MATCH_SELECT_ID);
			Foxtrick.removeClass(select, 'hidden');

			getMatchDetails(matchId, sourceSystem, opts);
		};
		var addNewMatch = function(matchXML, homeAway) {
			var option = doc.createElement('option');
			var matchId = matchXML.text('MatchID');
			option.value = matchId;
			var MatchType = matchXML.num('MatchType');
			option.className = module.getIconClass(MatchType);
			var SourceSystem = matchXML.text('SourceSystem');
			option.dataset.SourceSystem = SourceSystem;
			option.dataset.homeAway = homeAway;

			var date = null;
			var MatchDate = matchXML.time('MatchDate');
			MatchDate = Foxtrick.util.time.toUser(doc, MatchDate);
			if (MatchDate)
				date = Foxtrick.util.time.buildDate(MatchDate, { showTime: false });

			var howeAwayStr = Foxtrick.L10n.getString('matchOrder.homeAway.' + homeAway + '.abbr');
			var tmpl = '{HA}: ' + MATCH_LIST_TMPL;
			var info = {
				HA: howeAwayStr,
				date: date || '???',
				HomeTeamName: matchXML.text('HomeTeamName').slice(0, 20),
				AwayTeamName: matchXML.text('AwayTeamName').slice(0, 20),
				HomeGoals: matchXML.text('HomeGoals'),
				AwayGoals: matchXML.text('AwayGoals'),
			};
			option.textContent = Foxtrick.format(tmpl, info);

			var select = doc.getElementById(module.MATCH_SELECT_ID);
			select.appendChild(option);
			select.value = matchId;
		};
		// on selecting a match, matchId and get ratings if appropriate
		var onMatchSelect = function(ev, opts) {
			var doc = ev.target.ownerDocument;
			var select = doc.getElementById(module.MATCH_SELECT_ID);
			var fieldOverlay = doc.getElementById(module.FIELD_OVERLAY_ID);
			var predControls = doc.querySelector('.ft-simulator-pred-controls');

			var selectedMatchId = parseInt(select.value, 10);
			var selectedOption = select.options[select.selectedIndex];
			var SourceSystem = selectedOption.dataset.SourceSystem;
			var homeAway = selectedOption.dataset.homeAway;

			// add team
			if (selectedMatchId == -2) {
				Foxtrick.addClass(ev.target, 'hidden');
				if (predControls)
					Foxtrick.addClass(predControls, 'hidden');
				var addTeamDiv = doc.getElementById('addTeamDiv');
				Foxtrick.removeClass(addTeamDiv, 'hidden');
				return;
			}
			// if no match selected,
			// cleanup old ratings display and reset gRatingsOther,
			// so that percentBars and HTMS gets cleaned as well
			else if (selectedMatchId == -1) {
				var otherWrappers = fieldOverlay.getElementsByClassName('ft-otherWrapper');

				Foxtrick.forEach(function(wrapper, i) {
					wrapper.parentNode.removeChild(wrapper);
					gRatingsOther[i] = void 0;
				}, otherWrappers);

				var tacticLevelLabelOther = doc.getElementById('tacticLevelLabelOther');
				if (tacticLevelLabelOther) {
					var labelParent = tacticLevelLabelOther.parentNode;
					labelParent.removeChild(tacticLevelLabelOther);
				}

				module.updateBarsAndHTMS(doc, gRatings, gRatingsOther, opts);
				return;
			}
			// add a matchId manually
			else if (selectedMatchId === 0) {
				Foxtrick.addClass(ev.target, 'hidden');
				if (predControls)
					Foxtrick.addClass(predControls, 'hidden');
				var addMatchDiv = doc.getElementById('addMatchDiv');
				Foxtrick.removeClass(addMatchDiv, 'hidden');
				return;
			}

			opts.homeAway = homeAway;
			opts.isNew = false;
			getMatchDetails(selectedMatchId, SourceSystem, opts);
		};
		var processMatch = function(matchXML, opts) {
			gMatchXML = matchXML;
			gHomeAway = opts.homeAway;
			gOtherTeamID = opts.teamId;

			module.updateOtherRatings(doc, gRatingsOther, matchXML, gTeamNames, opts);
			module.updateBarsAndHTMS(doc, gRatings, gRatingsOther, opts);
		};
		var getMatchDetails = function(matchId, sourceSystem, opts) {
			var isNew = opts.isNew;
			var homeAway = opts.homeAway;

			// get selected match
			var loading = doc.getElementById('loadingMatchID');
			if (loading) {
				loading.parentNode.removeChild(loading);
			}

			loading = Foxtrick.util.note.createLoading(doc);
			loading.id = 'loadingMatchID';

			var overlayHTMS = doc.getElementById('ft-overlayHTMS');
			if (overlayHTMS)
				overlayHTMS.insertBefore(loading, overlayHTMS.firstChild);
			else
				doc.getElementById('field').appendChild(loading);

			/** @type {CHPPParams} */
			var selectedMatchArgs = [
				['file', 'matchdetails'],
				['version', '2.3'],
				['matchId', parseInt(matchId, 10)],
				['sourceSystem', sourceSystem],
			];

			/** @type {CHPPOpts} */
			var cacheArgs = { cache: 'session' };
			Foxtrick.util.api.retrieve(doc, selectedMatchArgs, cacheArgs, (matchXML, errorText) => {
				var select = doc.getElementById(module.MATCH_SELECT_ID);
				if (errorText || !matchXML) {
					if (loading) {
						loading.textContent = errorText;
					}
					Foxtrick.log(errorText);
					select.selectedIndex = 0;
					return;
				}
				if (loading && loading.parentNode) {
					loading.parentNode.removeChild(loading);
				}

				if (!matchXML.node('HomeGoals')) {
					// game not played
					Foxtrick.log('Skipping future match', matchId);
					select.selectedIndex = 0;
					return;
				}

				if (isNew) {
					addNewMatch(matchXML, homeAway);
				}

				processMatch(matchXML, opts);
			});
		};
		var buildAddMatch = function(select, opts) {
			// manual add a match

			var option = doc.createElement('option');
			option.value = 0;
			option.textContent = Foxtrick.L10n.getString('matchOrder.AddMatchManually');
			select.appendChild(option);

			var addMatchDiv = doc.createElement('div');
			addMatchDiv.className = 'hidden';
			addMatchDiv.id = 'addMatchDiv';

			var controls = doc.getElementById(module.CONTROLS_ID);
			controls.appendChild(addMatchDiv);

			var addMatchText = doc.createElement('input');
			addMatchText.id = 'addMatchText';
			addMatchText.type = 'text';
			addMatchText.size = 10;
			addMatchDiv.appendChild(addMatchText);

			var HOME_AWAY_DESC = Foxtrick.L10n.getString('matchOrder.homeAway');
			var addMatchHomeAwayLabel = doc.createElement('label');
			addMatchHomeAwayLabel.id = 'addMatchhomeAwayLabel';
			addMatchHomeAwayLabel.textContent = Foxtrick.L10n.getString('matchOrder.homeAway.abbr');
			addMatchHomeAwayLabel.title = HOME_AWAY_DESC;
			addMatchDiv.appendChild(addMatchHomeAwayLabel);

			var addMatchHomeAwaySelect = doc.createElement('select');
			addMatchHomeAwaySelect.id = 'addMatchHomeAwaySelect';
			addMatchHomeAwaySelect.title = HOME_AWAY_DESC;
			addMatchDiv.appendChild(addMatchHomeAwaySelect);

			var optionAuto = doc.createElement('option');
			optionAuto.value = 'auto';
			optionAuto.textContent = Foxtrick.L10n.getString('matchOrder.homeAway.auto');
			addMatchHomeAwaySelect.appendChild(optionAuto);
			var optionHome = doc.createElement('option');
			optionHome.value = 'home';
			optionHome.textContent = Foxtrick.L10n.getString('matchOrder.homeAway.home');
			addMatchHomeAwaySelect.appendChild(optionHome);
			var optionAway = doc.createElement('option');
			optionAway.value = 'away';
			optionAway.textContent = Foxtrick.L10n.getString('matchOrder.homeAway.away');
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
				addMatchCheck.checked = oldLineupSource === 'HTOIntegrated';
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
				Foxtrick.addClass(addMatchDiv, 'hidden');

				var predControls = doc.querySelector('.ft-simulator-pred-controls');
				if (predControls)
					Foxtrick.removeClass(predControls, 'hidden');

				var select = doc.getElementById(module.MATCH_SELECT_ID);
				Foxtrick.removeClass(select, 'hidden');
				select.selectedIndex = 0;
			};
			Foxtrick.onClick(addMatchButtonCancel, addMatchCancel);
			addMatchDiv.appendChild(addMatchButtonCancel);
		};
		var buildAddTeam = function(select, opts) {
			var addTeamOption = doc.createElement('option');
			addTeamOption.id = 'addTeamOption';
			addTeamOption.value = -2;
			addTeamOption.textContent = Foxtrick.L10n.getString('matchOrder.addTeam');
			select.appendChild(addTeamOption);

			// add team
			var addTeamDiv = doc.createElement('div');
			addTeamDiv.className = 'hidden';
			addTeamDiv.id = 'addTeamDiv';

			var controls = doc.getElementById(module.CONTROLS_ID);
			controls.appendChild(addTeamDiv);

			var addTeamLabel = doc.createElement('label');
			addTeamLabel.setAttribute('for', 'addTeamText');
			addTeamLabel.textContent = Foxtrick.L10n.getString('matchOrder.enterTeamId');
			addTeamDiv.appendChild(addTeamLabel);

			var addTeamText = doc.createElement('input');
			addTeamText.id = 'addTeamText';
			addTeamText.type = 'text';
			addTeamText.size = 10;
			addTeamDiv.appendChild(addTeamText);

			var addTeamButtonOk = doc.createElement('input');
			addTeamButtonOk.id = 'addTeamButton';
			addTeamButtonOk.type = 'button';
			addTeamButtonOk.value = Foxtrick.L10n.getString('button.ok');
			addTeamDiv.appendChild(addTeamButtonOk);

			Foxtrick.onClick(addTeamButtonOk, function(ev) {
				addTeam(ev, opts);
			});

			var addTeamButtonCancel = doc.createElement('input');
			addTeamButtonCancel.id = 'addTeamButtonCancel';
			addTeamButtonCancel.type = 'button';
			addTeamButtonCancel.value = Foxtrick.L10n.getString('button.cancel');
			var addTeamCancel = function(ev) {
				var doc = ev.target.ownerDocument;

				var addTeamDiv = doc.getElementById('addTeamDiv');
				Foxtrick.addClass(addTeamDiv, 'hidden');

				var predControls = doc.querySelector('.ft-simulator-pred-controls');
				if (predControls)
					Foxtrick.removeClass(predControls, 'hidden');

				var select = doc.getElementById(module.MATCH_SELECT_ID);
				Foxtrick.removeClass(select, 'hidden');
				select.selectedIndex = 0;
			};
			Foxtrick.onClick(addTeamButtonCancel, addTeamCancel);
			addTeamDiv.appendChild(addTeamButtonCancel);
		};
		var buildMatchSimulator = function(matchesXML, opts) {
			if (opts.matchesOnly) {
				// called from addTeam: skip building
				if (matchesXML)
					addMatches(matchesXML);
				return;
			}

			var select = doc.createElement('select');
			select.id = module.MATCH_SELECT_ID;
			var optionNoMatch = doc.createElement('option');
			optionNoMatch.value = -1;
			optionNoMatch.textContent = Foxtrick.L10n.getString('matchOrder.noMatchSelected');
			select.appendChild(optionNoMatch);

			var controls = doc.getElementById(module.CONTROLS_ID);
			controls.appendChild(select);

			buildAddMatch(select, opts);
			buildAddTeam(select, opts);

			if (matchesXML) {
				addMatches(matchesXML);
			}

			Foxtrick.listen(select, 'change', function(ev) {
				onMatchSelect(ev, opts);
			});
		};
		var addMatches = function(matchesXML) {
			var select = doc.getElementById(module.MATCH_SELECT_ID);

			var selectedTeamID = matchesXML.text('TeamID');
			var matchNodes = matchesXML.getElementsByTagName('Match');
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

				var date = null;
				var MatchDate = matchesXML.time('MatchDate', match);
				MatchDate = Foxtrick.util.time.toUser(doc, MatchDate);
				if (MatchDate)
					date = Foxtrick.util.time.buildDate(MatchDate, { showTime: false });

				var MatchID = matchesXML.text('MatchID', match);
				var AwayTeamID = matchesXML.text('AwayTeamID', match);

				var option = doc.createElement('option');
				option.className = module.getIconClass(MatchType);
				option.dataset.SourceSystem = SourceSystem;

				// ensure homeAway exists for automatically added matches
				option.dataset.homeAway = selectedTeamID == AwayTeamID ? 'away' : 'home';
				option.value = MatchID;

				var info = {
					date: date || '???',
					HomeTeamName: matchesXML.text('HomeTeamName', match).slice(0, 20),
					AwayTeamName: matchesXML.text('AwayTeamName', match).slice(0, 20),
					HomeGoals: matchesXML.text('HomeGoals', match),
					AwayGoals: matchesXML.text('AwayGoals', match),
				};
				option.textContent = Foxtrick.format(MATCH_LIST_TMPL, info);

				select.appendChild(option);
			}, matchNodes);
		};

		var getMatchList = function(teamId, opts) {
			var loadingMatchList = opts.loading;

			/** @type {CHPPParams} */
			var otherMatchArgs = [
				['file', 'matchesarchive'],
				['teamId', parseInt(teamId, 10)],
			];

			/** @type {CHPPOpts} */
			var cacheArgs = { cache: 'session' };
			Foxtrick.util.api.retrieve(doc, otherMatchArgs, cacheArgs, (matchesXML, errorText) => {
				if (errorText) {
					Foxtrick.log(errorText);
					if (loadingMatchList)
						loadingMatchList.textContent = errorText;
				}
				else if (loadingMatchList && loadingMatchList.parentNode) {
					loadingMatchList.parentNode.removeChild(loadingMatchList);
					opts.loading = null;
				}
				if (!matchesXML)
					return;

				buildMatchSimulator(matchesXML, opts);
			});
		};

		var setupSimulator = function(opts) {
			gSimulatorReady = true;

			var hideOverlay = function(ev) {
				var doc = ev.target.ownerDocument;
				var fieldOverlay = doc.getElementById(module.FIELD_OVERLAY_ID);
				Foxtrick.removeClass(fieldOverlay, 'visible');
				var overlayHTMS = doc.getElementById('ft-overlayHTMS');
				if (overlayHTMS)
					Foxtrick.addClass(overlayHTMS, 'hidden');
			};
			Foxtrick.onClick(doc.getElementById('closeOverlay'), hideOverlay);

			var fieldOverlay = doc.getElementById(module.FIELD_OVERLAY_ID);
			var controls = Foxtrick.createFeaturedElement(doc, module, 'div');
			controls.id = module.CONTROLS_ID;
			fieldOverlay.appendChild(controls);

			// add copy button
			var copyButton = doc.createElement('input');
			copyButton.type = 'button';
			copyButton.value = Foxtrick.L10n.getString('button.copy');
			copyButton.id = 'ft-copyRatingsButton';
			Foxtrick.onClick(copyButton, function(ev) {
				module.copyRatings(ev, opts);
			});
			controls.appendChild(copyButton);

			// relocate prediction controls
			var coachModDiv = doc.getElementById('coachModifier');
			var neighbor = coachModDiv.previousElementSibling;
			if (Foxtrick.hasClass(neighbor, 'ratingPredictionsOverlay')) {
				Foxtrick.addClass(neighbor, 'ft-simulator-pred-controls');
				// move controls back to fieldOverlay
				controls.appendChild(neighbor);
			}

			if (!MATCH_ID) {
				// no matchId: match sandbox
				buildMatchSimulator(null, opts);
				return;
			}

			// display selection of matches to compare to
			// first, get team id of other team
			var loadingMatchList = Foxtrick.util.note.createLoading(doc);
			var overlayHTMS = doc.getElementById('ft-overlayHTMS');
			if (overlayHTMS)
				overlayHTMS.appendChild(loadingMatchList);
			else
				doc.getElementById('field').appendChild(loadingMatchList);

			/** @type {CHPPParams} */
			var orderMatchArgs = [
				['file', 'matchdetails'],
				['version', '2.3'],
				['matchId', MATCH_ID],
				['sourceSystem', SOURCE_SYSTEM],
			];

			/** @type {CHPPOpts} */
			var oCache = { cache: 'session' };

			Foxtrick.util.api.retrieve(doc, orderMatchArgs, oCache, (orderMatchXml, errorText) => {
				if (!orderMatchXml || errorText) {
					if (loadingMatchList)
						loadingMatchList.textContent = errorText;

					Foxtrick.log(errorText);
					return;
				}

				// determine otherTeamId
				var HomeTeamID = orderMatchXml.num('HomeTeamID');
				var AwayTeamID = orderMatchXml.num('AwayTeamID');

				var teamId;
				if (TEAM_ID == HomeTeamID) {
					IS_HOME = true;
					teamId = AwayTeamID;
					gTeamNames[0] = orderMatchXml.text('HomeTeamName');
					gTeamNames[1] = orderMatchXml.text('AwayTeamName');
				}
				else {
					IS_HOME = false;
					teamId = HomeTeamID;
					gTeamNames[1] = orderMatchXml.text('HomeTeamName');
					gTeamNames[0] = orderMatchXml.text('AwayTeamName');
				}
				opts.teamId = teamId;
				opts.loading = loadingMatchList;
				getMatchList(teamId, opts);
			});
		};

		// eslint-disable-next-line complexity
		var updateUI = function(target) {
			if (!Foxtrick.hasClass(target, 'posLabel') &&
			    target.id != 'ft_stamina_discount_check' &&
			    target.id != 'ft_attVsDef_check' &&
			    target.id != 'ft_realProbabilities_check')
				return;

			// Foxtrick.log('updateUI')
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

				var rating = overlayRating.dataset.rating;
				var fullLevel = Foxtrick.Math.hsToFloat(rating, true);
				var levelText = '[' + fullLevel.toFixed(2) + ']';
				var id = 'ft-full-level' + i;

				var ratingsNum;
				if (typeof gRatings[i] !== 'undefined') {
					ratingsNum = doc.getElementById(id);
					ratingsNum.textContent = levelText;
				}
				else {
					ratingsNum = doc.createElement('div');
					ratingsNum.id = id;
					ratingsNum.className = 'overlayRatingsNum';
					ratingsNum.textContent = levelText;
				}

				Foxtrick.insertAfter(ratingsNum, overlayRating);
				gOldRatings[i] = gRatings[i]; // save previous
				gRatings[i] = gOrgRatings[i] = fullLevel; // save sans stamina discount
			}, ratingInnerBoxes);

			// store tactics for HTMS
			var teamTacticsSelect = doc.getElementById('teamtactics');
			var tactics = gRatings[7] = parseInt(teamTacticsSelect.value, 10);
			if (tactics !== 0 && tactics !== 7) {
				var tacticsSpan = tacticLevelLabel.querySelector('span[data-tacticlevel]');
				gRatings[8] = tacticsSpan.dataset.tacticlevel;
			}
			else {
				// normal/creatively
				gRatings[8] = 0;
			}

			// remove other changes for clarity
			var otherChanges = fieldOverlay.getElementsByClassName('ft-otherChange');
			Foxtrick.forEach(function(change) {
				change.textContent = '';
			}, otherChanges);

			var staminaDiscountCheck = doc.getElementById('ft_stamina_discount_check');
			if (staminaDiscountCheck.checked) {
				Foxtrick.Prefs.setBool('MatchSimulator.staminaDiscountOn', true);
				module.staminaDiscount(doc, gOrgRatings, gRatings);
			}
			else {
				Foxtrick.Prefs.setBool('MatchSimulator.staminaDiscountOn', false);
			}

			for (var i = 0; i < 7; ++i) {
				if (typeof gOldRatings[i] !== 'undefined') {
					var id = 'ft-full-level' + i;
					var fullLevelDiv = doc.getElementById(id);
					var diff = gRatings[i] - gOldRatings[i];
					var diffStr = diff.toFixed(2);
					var diffTrunc = parseFloat(diffStr);

					var span = doc.createElement('span');
					span.textContent = ' (' + diffStr + ')';
					if (diffTrunc < 0) {
						span.className = 'ft-colorLower ft-ratingChange';
						fullLevelDiv.appendChild(span);
					}
					else if (diffTrunc > 0) {
						span.className = 'ft-colorHigher ft-ratingChange';
						fullLevelDiv.appendChild(span);
					}
				}
			}

			var updateOther = target.id == 'ft_attVsDef_check' ||
				target.id == 'ft_realProbabilities_check';
			var updateHTMS = !updateOther;
			var updatePctgDiff = target.id != 'ft_attVsDef_check';

			// make a clone if possible to prevent unintentional changes
			var teamNames = gSimulatorReady ? gTeamNames.slice() : gTeamNames;
			var opts = {
				teamNames: teamNames,
				IS_HOME: IS_HOME,
				TEAM_ID: TEAM_ID,
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
			module.updateBarsAndHTMS(doc, gRatings, gRatingsOther, opts);

			if (!gSimulatorReady) {
				// opened first time
				setupSimulator(opts);
			}
			else {
				if (updateOther && gMatchXML) {
					opts.teamId = gOtherTeamID;
					opts.homeAway = gHomeAway;

					// passing gTeamNames separately to modify
					module.updateOtherRatings(doc, gRatingsOther, gMatchXML, gTeamNames, opts);
				}
			}
		};

		Foxtrick.getChanges(fieldOverlay, function(nodes) {
			// run once and only if posLabels change
			Foxtrick.any(function(node) {
				if (Foxtrick.hasClass(node, 'posLabel')) {
					updateUI(node);
					return true;
				}
				return false;
			}, nodes);
		});

		var clickHandler = function(ev) {
			updateUI(ev.target);
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
		// TODO: replace with L10n string
		try {
			var teamTacticsDiv = Foxtrick.cloneElement(doc.getElementById('tactics'), true);
			var speechLevelTxt = teamTacticsDiv.getElementsByClassName('speechLevel')[0];
			speechLevelTxt.parentNode.removeChild(speechLevelTxt);
			var speechLevel = teamTacticsDiv.getElementsByTagName('select')[0];
			speechLevel.parentNode.removeChild(speechLevel);
			return teamTacticsDiv.textContent.trim();
		}
		catch (e) {
			Foxtrick.log(e);
			return 'Tactics:';
		}
	},
	getIconClass: function(type) {
		var icon = Foxtrick.Pages.Matches.IconsByType[type];
		var iconClass = 'ftM' + icon.slice(1);

		var isNT = Foxtrick.any(function(ntType) {
			return ntType === type;
		}, Foxtrick.Pages.Matches.NT);
		if (isNT)
			iconClass += 'NT';

		return 'ftOptionIcon ' + iconClass;
	},

	/**
	 * Round to nearest sublevel
	 * @param  {number} level
	 * @return {number}
	 */
	normalizeRatings: function(level) {
		return Math.floor((level + 0.125) * 4) / 4;
	},
	copyRatings: function(ev, opts) {
		var module = this;

		var doc = ev.target.ownerDocument;

		var text = '';

		var fieldOverlay = doc.getElementById(module.FIELD_OVERLAY_ID);
		var overlayRatings = fieldOverlay.getElementsByClassName('overlayRatings');

		// get team names and highlight own team
		var crumbs = Foxtrick.Pages.All.getBreadCrumbs(doc);
		var thisTeam = crumbs[0].textContent;
		var bothTeams = crumbs[1].textContent;
		var re = Foxtrick.strToRe(thisTeam);
		var matched = bothTeams.match(re);
		var replaced = matched ? bothTeams.replace(re, '[b]' + thisTeam + '[/b]') :
			bothTeams += ' - ' + '[b]' + thisTeam + '[/b]';
		text += replaced;

		// match link
		var MATCH_ID = opts.MATCH_ID;
		text += MATCH_ID ? ' [matchid=' + MATCH_ID + ']' + '\n' : '\n';

		// formation
		var formations = doc.getElementById('formations').textContent;
		text += formations + '\n';

		// pic/mots
		var speechLevelWrapper = doc.querySelector('.speechLevel');
		if (speechLevelWrapper.style.display !== 'none') {
			// TODO: replace with L10n string
			var speechLevelTitle = speechLevelWrapper.firstChild.textContent.trim();
			var speechLevelSelect = doc.getElementById('speechLevel');
			var selectedSpeech = speechLevelSelect.options[speechLevelSelect.selectedIndex];
			var speechLevel = selectedSpeech.textContent;
			text += speechLevelTitle;
			text += ' [u]' + speechLevel + '[/u]\n';
		}

		// coach type
		var coachTypeModifier = doc.getElementById('coachTypeModifier');
		if (coachTypeModifier) {
			// new tactic assistant type coach modifier
			var coachModifierTitle = doc.getElementById('coachModifierTitle');
			var coachModifierLabel = doc.getElementById('coachModifierLabel');
			text += coachModifierTitle.textContent + ': ' + coachModifierLabel.textContent + '\n';
		}
		else {
			// old style
			text += doc.getElementById('trainerTypeLabel').textContent + '\n';
		}

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
		var matchSelect = doc.getElementById(module.MATCH_SELECT_ID);
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

			var overlay = overlayRatings[i];

			if (Foxtrick.hasClass(overlay, 'posLabel')) {
				// sector label
				text += '[b]' + overlay.textContent.trim() + '[/b]\n';
			}
			else {
				// sector rating
				if (!Foxtrick.hasClass(overlay, 'hidden')) {
					text += overlay.textContent.trim() + '\n';
				}
				else {
					// stamina discounted
					text += overlay.nextSibling.textContent.trim() + '\n';
				}
				text += doc.getElementById('ft-full-level' + count++).textContent.trim() + '\n';

				// add other teams ratings if appropriate
				if (otherMatchId > 0) {
					var ratingInnerBox = overlay.parentNode;
					var rating = ratingInnerBox.querySelector('.percentNumber');
					text += '[q]' + rating.textContent.trim() + '[/q]'; // percentage
					var opponentInfo = ratingInnerBox.querySelectorAll('.ft-otherWrapper div');
					text += '[b]' + opponentInfo[0].textContent.trim() + '[/b]\n'; // sector
					text += opponentInfo[1].textContent.trim() + '\n'; // text rating
					text += opponentInfo[2].textContent.trim() + '\n'; // number rating
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

		Foxtrick.copy(doc, text);
		var target = doc.getElementById('ft-overlayBottom');
		var copied = Foxtrick.L10n.getString('copy.ratings.copied');
		Foxtrick.util.note.add(doc, copied, 'ft-ratings-copy-note', { to: target });
	},
	// change bars to represent percentage of ratings comparison between predicted ratings
	// and selected other team's match ratings and update HTMSPrediction
	updateBarsAndHTMS: function(doc, gRatings, gRatingsOther, opts) {
		var module = this;

		var updateHTMS = opts.update.htms;
		var updatePctgDiff = opts.update.pctgDiff;

		var useHTMS = Foxtrick.Prefs.isModuleOptionEnabled(module, 'HTMSPrediction');
		var useRatings = Foxtrick.Prefs.isModuleEnabled('Ratings') &&
			Foxtrick.Prefs.isModuleOptionEnabled(module, 'UseRatingsModule');

		if (updateHTMS && useHTMS)
			module.updateHTMS(doc, gRatings, gRatingsOther, opts);

		if (useRatings)
			module.addRatings(doc, gRatings, gRatingsOther);

		var attVsDefCheck = doc.getElementById('ft_attVsDef_check');
		var realProbabilitiesCheck = doc.getElementById('ft_realProbabilities_check');
		var doRealProb = attVsDefCheck.checked && realProbabilitiesCheck.checked;
		var realProbTitle = Foxtrick.L10n.getString('matchOrder.probability.title');

		var fieldOverlay = doc.getElementById(module.FIELD_OVERLAY_ID);
		var percentImages = fieldOverlay.getElementsByClassName('percentImage');
		Foxtrick.forEach(function(percentImage, i) {
			var percentNumber;
			if (typeof gRatingsOther[i] !== 'undefined') {
				// change to zero-based ratings
				var curr = gRatings[i] ? gRatings[i] - 1 : 0;
				var other = gRatingsOther[i] ? gRatingsOther[i] - 1 : 0;
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
					Foxtrick.insertAfter(percentNumber, percentImage);
				}
				else {
					percentNumber = percentImage.nextSibling;
					percentNumber.textContent = title;
					percentNumber.title = doRealProb ? realProbTitle.replace(/%s/, oldVal) : '';

					if (updatePctgDiff) {
						var newPctg = Math.floor(percent * 100);
						var oldPercent = parseFloat(percentNumber.dataset.percent);
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
				percentNumber.dataset.percent = percent;
			}
			else {
				percentNumber = percentImage.nextSibling;
				if (percentNumber && percentNumber.className == 'percentNumber') {
					percentNumber.parentNode.removeChild(percentNumber);
				}
				Foxtrick.addClass(percentImage[i], 'hidden');
			}
		}, percentImages);
	},
	// updating or adding HTMS prediction based on rating prediction
	// and selected match of another team
	updateHTMS: function(doc, gRatings, gRatingsOther, opts) {
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
			overlayHTMSPrevious = Foxtrick.cloneElement(overlayHTMSCurrent, true);
			overlayHTMSPrevious.id = 'overlayHTMSPrevious';
			var table = overlayHTMSPrevious.getElementsByTagName('table')[0];
			if (table) {
				table.id = 'ft-htmstablePrevious';
				var h2 = overlayHTMSPrevious.querySelector('h2');
				h2.textContent = Foxtrick.L10n.getString('matchOrder.previousPrediction');
				var changePrediction = overlayHTMSPrevious.querySelector('a');
				changePrediction.parentNode.removeChild(changePrediction);
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
		if (typeof gRatingsOther[0] !== 'undefined') {
			var tacticAbbr = ['', 'pressing', 'ca', 'aim', 'aow', '', '', 'cre', 'long'];
			var midfieldLevel = [normalizeRatings(gRatings[3]) - 1, gRatingsOther[3] - 1];
			var rdefence = [normalizeRatings(gRatings[0]) - 1, gRatingsOther[6] - 1];
			var cdefence = [normalizeRatings(gRatings[1]) - 1, gRatingsOther[5] - 1];
			var ldefence = [normalizeRatings(gRatings[2]) - 1, gRatingsOther[4] - 1];
			var rattack = [normalizeRatings(gRatings[4]) - 1, gRatingsOther[2] - 1];
			var cattack = [normalizeRatings(gRatings[5]) - 1, gRatingsOther[1] - 1];
			var lattack = [normalizeRatings(gRatings[6]) - 1, gRatingsOther[0] - 1];

			var tactics = [tacticAbbr[gRatings[7]], tacticAbbr[gRatingsOther[7]]];
			var tacticsLevel = [gRatings[8], gRatingsOther[8]];
			var htms = Foxtrick.modules['HTMSPrediction'];
			htms.insertPrediction(
				doc, overlayHTMSCurrent,
				midfieldLevel,
				rdefence, cdefence, ldefence,
				rattack, cattack, lattack,
				tactics, tacticsLevel,
				opts.teamNames
			);
		}
		else {
			// ratings cleared or non-existent: remove HTMS
			if (overlayHTMS)
				overlayHTMS.textContent = '';
		}
	},


	// eslint-disable-next-line complexity
	updateOtherRatings: function(doc, gRatingsOther, xml, gTeamNames, opts) {
		var module = this;

		var teamId = opts.teamId; // opponent
		var homeAway = opts.homeAway; // selected match
		var update = opts.update.other;
		var IS_HOME = opts.IS_HOME;
		var TEAM_ID = opts.TEAM_ID;

		var HomeTeamID = xml.num('HomeTeamID');
		var AwayTeamID = xml.num('AwayTeamID');

		var doHome = true;
		if (homeAway == 'away' || // chose away
		    (homeAway != 'home' && // auto detect away
		     (teamId == AwayTeamID || TEAM_ID == HomeTeamID || // one of the teams
		      IS_HOME && teamId != HomeTeamID && TEAM_ID != AwayTeamID)
		      // none of the teams match + playing home
		    )) {
			doHome = false;
		}

		var teamNode;
		if (doHome) {
			teamNode = xml.node('HomeTeam');
			gTeamNames[1] = xml.text('HomeTeamName');
		}
		else {
			teamNode = xml.node('AwayTeam');
			gTeamNames[1] = xml.text('AwayTeamName');
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
			var levelDiv = doc.getElementById(id);
			if (levelDiv) {
				// there was another match selected before. show ratings and differences
				levelDiv.textContent = levelText;
				if (!update) {
					var diff = fullLevel - gRatingsOther[j];
					var diffStr = diff.toFixed(2);
					var diffTrunc = parseFloat(diffStr);

					var span = doc.createElement('span');
					span.textContent = ' (' + diffStr + ')';
					if (diffTrunc < 0) {
						span.className = 'ft-colorLower ft-otherChange';
						levelDiv.appendChild(span);
					}
					else if (diffTrunc > 0) {
						span.className = 'ft-colorHigher ft-otherChange';
						levelDiv.appendChild(span);
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
			gRatingsOther[j] = fullLevel;
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
		gRatingsOther[7] = selectedRatings[7].value;
		gRatingsOther[8] = selectedRatings[8].value;

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
	addRatings: function(doc, gRatings, gRatingsOther) {
		var module = this;

		var normalizeRatings = module.normalizeRatings;
		var tacticNames = [
			'normal', 'pressing',
			'ca', 'aim', 'aow',
			'', '',
			'creatively', 'longshots',
		];

		var midfieldLevel = [normalizeRatings(gRatings[3]) - 1, gRatingsOther[3] - 1];
		var rdefence = [normalizeRatings(gRatings[0]) - 1, gRatingsOther[6] - 1];
		var cdefence = [normalizeRatings(gRatings[1]) - 1, gRatingsOther[5] - 1];
		var ldefence = [normalizeRatings(gRatings[2]) - 1, gRatingsOther[4] - 1];
		var rattack = [normalizeRatings(gRatings[4]) - 1, gRatingsOther[2] - 1];
		var cattack = [normalizeRatings(gRatings[5]) - 1, gRatingsOther[1] - 1];
		var lattack = [normalizeRatings(gRatings[6]) - 1, gRatingsOther[0] - 1];

		var tactics = [tacticNames[gRatings[7]], tacticNames[gRatingsOther[7]]];
		var tacticsLevel = [gRatings[8], gRatingsOther[8]];

		var ratingsTable = doc.getElementById('ft_simulation_ratings_table');
		var newTable = Foxtrick.cloneElement(ratingsTable, false);

		var twoTeams = typeof gRatingsOther[0] !== 'undefined';
		Foxtrick.modules['Ratings'].addRatings(
			doc, newTable,
			midfieldLevel, rdefence, cdefence, ldefence, rattack, cattack, lattack,
			tactics, tacticsLevel,
			twoTeams
		);

		ratingsTable.parentNode.replaceChild(newTable, ratingsTable);
	},
	staminaDiscount: function(doc, gOrgRatings, gRatings) {
		var module = this;

		var noPrediction = true;
		var getStaminaFactor = function(stamina, predData) {
			// formula by lizardopoli/Senzascrupoli/Pappagallopoli et al
			// [post=15917246.1]
			// latest data:
			// https://docs.google.com/file/d/0Bzy0IjRlxhtxaGp0VXlmNjljaTA/edit?usp=sharing

			var prediction = null;
			if (predData) {
				prediction = parseFloat(predData[1]) || null;
				noPrediction = false;
			}

			if (prediction !== null) {

				if (parseInt(prediction, 10) == stamina) {
					stamina = prediction;
				}
				else {
					// our prediction data is inaccurate
					var d = new Date(predData[0]);
					// assume high subskill if stamina is lower
					// assume low subskill otherwise
					Foxtrick.log('WARNING: inaccurate stamina prediction', prediction, stamina, d);
					if (stamina < prediction)
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
		var contributions = Foxtrick.Predict.contributionFactors();

		// using defaults to disregard user settings
		// gives more consistency and allows to play around with them w/o affecting stamina
		var skillOpts = Foxtrick.modules['PlayerPositionsEvaluations'].getDefaultPrefs();
		skillOpts.stamina = false; // reset stamina effect

		var players = {};
		var playersMissing = false;
		Foxtrick.forEach(function(div) {
			if (!div.dataset.json) {
				Foxtrick.log('No player JSON in staminaDiscount: #', div.id);
				playersMissing = true;
				return;
			}

			var player = JSON.parse(div.dataset.json);
			player.effectiveSkills =
				Foxtrick.Predict.effectiveSkills(player.skills, player, skillOpts);

			player.energy = getStaminaFactor(player.stamina, staminaData[player.id]);

			players[player.id] = player;
		}, doc.querySelectorAll('#players .player'));

		if (noPrediction)
			Foxtrick.log('WARNING: no staminaPrediction');

		if (playersMissing)
			Foxtrick.log(new Error('Player JSON missing in staminaDiscount'));

		try {
			var overlayRatingsNums = doc.getElementsByClassName('overlayRatingsNum');
			var overlayRatings = doc.getElementsByClassName('overlayRatings');
			var positionDivs = doc.querySelectorAll('#fieldplayers .position');
			var positions = Foxtrick.toArray(positionDivs).slice(0, 14); // truncate bench
			Foxtrick.forEach(function(ratingsNum, sector) {
				var sumVEnergy = 0;
				var sumV = 0;

				var sectorSkills = [], center = 0;
				if (sector < 3) {
					sectorSkills = ['keeper', 'defending'];
					center = 1;
				}
				else if (sector === 3) {
					sectorSkills = ['playmaking'];
					center = 3;
				}
				else {
					sectorSkills = ['passing', 'scoring', 'winger'];
					center = 5;
				}
				var wing = sector - center; // left:-1, center:0, right:1

				var missing = false;
				Foxtrick.forEach(function(positionDiv, pos) {
					var playerDiv = positionDiv.getElementsByClassName('player')[0];
					if (!playerDiv)
						return;

					var id = playerDiv.id.match(/\d+/)[0];
					var player = players[id];
					if (!player) {
						missing = true;
						Foxtrick.log('Missing:', id, 'sector', sector, 'pos', pos);
						return;
					}

					var tacticClass = 'normal'; // default to normal player tactic
					var tacticAbbrs = module.TACTICS;
					for (var cls in tacticAbbrs) {
						if (Foxtrick.hasClass(positionDiv, cls)) {
							tacticClass = cls;
						}
					}
					var tacticAbbr = tacticAbbrs[tacticClass];

					var posDef = module.POSITIONS[pos];
					var posId = posDef.pos + tacticAbbr;
					if (posId === 'fwd' && player.specialty === 1)
						posId = 'tdf';

					var cntrbSkills = contributions[posId];
					for (var skill in cntrbSkills) {
						if (Foxtrick.has(sectorSkills, skill)) {
							var cntrb = cntrbSkills[skill];
							var factor = 0;
							if (wing) {
								if (posDef.wing && !posDef.noTransfer) {
									if (wing === posDef.wing) {
										// transferring both sides to this wing
										// i.e. left CD does not contribute to right defence
										factor = cntrb.wings;
									}
								}
								else {
									// no transfer
									// (forwards or other centered positions: GK/CCD/CIM)
									// only matters for fwtw since side=farSide otherwise
									factor = wing === posDef.wing ? cntrb.side : cntrb.farSide;
								}
							}
							else {
								factor = cntrb.center;
							}
							var skillVal = player.effectiveSkills[skill];
							var value = skillVal * factor;
							sumV += value;
							sumVEnergy += value * player.energy;
						}
					}

				}, positions);

				var oldRating = gOrgRatings[sector];
				var newRating = oldRating;

				if (missing)
					Foxtrick.log('WARNING: skipping staminaDiscount');
				else
					newRating = oldRating * sumVEnergy / sumV;

				gRatings[sector] = newRating;
				ratingsNum.textContent = '[' + newRating.toFixed(2) + ']';

				var newOverlay = doc.createElement('div');
				newOverlay.className = 'overlayRatingsDiscounted';
				var newRatingNorm = module.normalizeRatings(newRating);
				newOverlay.textContent = Foxtrick.L10n.getFullLevelByValue(newRatingNorm);

				var oldOverlay = overlayRatings[sector * 2 + 1];
				Foxtrick.addClass(oldOverlay, 'hidden');
				Foxtrick.insertAfter(newOverlay, oldOverlay);
			}, overlayRatingsNums);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},
	get STAMINA_DATA() {
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
		delete this.STAMINA_DATA;
		this.STAMINA_DATA = staminaData;
		return staminaData;
	},
	POSITIONS: [
		{ pos: 'kp', wing: 0, },
		{ pos: 'wb', wing: -1, },
		{ pos: 'cd', wing: -1, },
		{ pos: 'cd', wing: 0, },
		{ pos: 'cd', wing: 1, },
		{ pos: 'wb', wing: 1, },
		{ pos: 'w', wing: -1, },
		{ pos: 'im', wing: -1, },
		{ pos: 'im', wing: 0, },
		{ pos: 'im', wing: 1, },
		{ pos: 'w', wing: 1, },
		{ pos: 'fw', wing: -1, noTransfer: true },
		{ pos: 'fw', wing: 0, },
		{ pos: 'fw', wing: 1, noTransfer: true },
	],
	TACTICS: {
		normal: '',
		middle: 'tm',
		wing: 'tw',
		offensive: 'o',
		defensive: 'd',
	},
};
