/**
 * match-lineup-fixes.js
 * Fixes for the new style match lineup
 * @author LA-MJ
 */

'use strict';

Foxtrick.modules['MatchLineupFixes'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match'],
	OPTIONS: [
		'FixWeatherSEs', 'AddStarsToSubs', 'FixMultipleEvents',
	],
	NICE: 2, // after match-player-colouring

	// CSS: Foxtrick.InternalPath + 'resources/css/match-lineup-fixes.css',
	/** @param {document} doc */
	// eslint-disable-next-line complexity
	run: function(doc) {
		if (!Foxtrick.Pages.Match.hasRatingsTabs(doc))
			return;

		// START PREPARATION STAGE

		// this is where we fix HTs shit
		// we need to traverse the hidden input fields in the timeline
		// that are used as data sources by HTs to assemble the field on each click.
		// first, each minute/event has input.hidden[id$="_time"][value="min.sec"]
		var timeline = Foxtrick.Pages.Match.getTimeline(doc);

		// doc.querySelectorAll('input[id$="_playerRatings"]');
		// each minute has input.hidden[id$="_playerRatingsHome"][value="jsonArray"]
		// where jsonArray is an array of Player objects
		// Player = {
		//	Cards: 0,
		//	FromMin: -1,
		//	InjuryLevel: 0,
		//	IsCaptain: false,
		//	IsKicker: false,
		//	PlayerId: 360991810,
		//	PositionBehaviour: 0,
		//	PositionID: 100,
		//	Stamina: 1,
		//	Stars: 3,
		//	ToMin: 90,
		// };
		var playerRatingsHome = Foxtrick.Pages.Match.getTeamRatingsByEvent(doc, true);
		var playerRatingsAway = Foxtrick.Pages.Match.getTeamRatingsByEvent(doc, false);

		/**
		 * @param {MatchEventRatings[]} playerRatingsByEvent
		 */
		var saveRatings = function(playerRatingsByEvent) {
			// save modifications
			for (let player of playerRatingsByEvent)
				player.source.value = JSON.stringify(player.players);
		};

		/**
		 * Rewind player ratings to an earlier timeline index
		 * @param {MatchEventRatings[]} playerRatingsByEvent matchRatings to change
		 * @param {number}              eventIdx             event to rewind
		 * @param {number}              sourceIdx            event to rewind to
		 * @param {string[]}            [attributesToReset]  attributes to actually reset
		 */
		var rewindRatings = function(playerRatingsByEvent, eventIdx, sourceIdx, attributesToReset) {
			// TODO type
			let reset = attributesToReset || [
				'IsCaptain',
				'IsKicker',
				'PositionBehaviour',
				'PositionID',
				'Stars',

				// TODO exclude
				// stamina is not position dependent + it changes in time
			];

			let players = playerRatingsByEvent[eventIdx].players;
			let correctPlayers = playerRatingsByEvent[sourceIdx].players;
			players.forEach(function(player, p) {
				let correctPlayer = correctPlayers[p];
				reset.forEach(function(attr) {
					player[attr] = correctPlayer[attr];
				});
			});
		};

		// more stuff in each event:
		// doc.querySelectorAll('input[id$="_matchEventTypeId"]')
		// leaves field events: 91-97; not 94; 350-352; 512-514
		// other player movement events: 360-262; 370-372;

		// doc.querySelectorAll('input[id$="_eventIndex"]') points to the report tab!
		// the index does not match the timeline, however!
		var eventIndexByEvent = Foxtrick.Pages.Match.getEventIndicesByEvent(doc);

		// doc.querySelectorAll('input[id$="_timelineEventType"]')
		/* eslint-disable no-multi-spaces */
		var TIMELINE_EVENT_TYPES = {
			YELLOW_CARD: 6,
			SECOND_YELLOW_CARD: 7, // bug? unused!
			RED_CARD: 8,           // also second yellow now
			GOAL: 9,
			SUB: 10,               // also swap right now
			NEW_BEHAVIOR: 11,
			SWAP: 12,              // bug? unused!
			MINUTE: 14,
			PULLBACK: 15,
			CONFUSION: 16,
			INJURY: 18,
			BRUISED: 19,
			NERVES: 20,
			RAIN: 21,
			SUN: 22,
		};
		/* eslint-enable no-multi-spaces */

		var subEventTypes = [
			TIMELINE_EVENT_TYPES.SUB,
			TIMELINE_EVENT_TYPES.NEW_BEHAVIOR,
			TIMELINE_EVENT_TYPES.SWAP, // README: currently not in use!
		];
		var redCardEventTypes = [
			TIMELINE_EVENT_TYPES.SECOND_YELLOW_CARD, // README: currently not in use!
			TIMELINE_EVENT_TYPES.RED_CARD,
		];
		var lineupEventTypes = Foxtrick.concat(redCardEventTypes, subEventTypes);

		var weatherEventTypes = [
			TIMELINE_EVENT_TYPES.RAIN,
			TIMELINE_EVENT_TYPES.SUN,
		];

		var tEventTypeByEvent = Foxtrick.Pages.Match.getEventTypesByEvent(doc);
		var lineupEvents = Foxtrick.filter(function(event) {
			return Foxtrick.has(lineupEventTypes, event.type);
		}, tEventTypeByEvent);

		var weatherEvents = Foxtrick.filter(function(event) {
			return Foxtrick.has(weatherEventTypes, event.type);
		}, tEventTypeByEvent);

		// info for CHPP
		var SourceSystem = Foxtrick.Pages.Match.getSourceSystem(doc);
		var matchId = Foxtrick.Pages.Match.getId(doc);

		// add locale as argument to prevent using old cache after
		// language changed
		// var locale = Foxtrick.Prefs.getString('htLanguage');
		// var detailsArgs = [
		// 	['file', 'matchdetails'],
		// 	['matchEvents', 'true'],
		// 	['matchId', matchId],
		// 	['sourceSystem', SourceSystem],
		// 	['version', '2.3'],
		// 	['lang', locale],
		// ];


		// END PREPARATION STAGE


		// here comes the actual stuff

		// weather events don't have the player name in the timeline
		var fixWeatherSEs = function() {
			/** @type {NodeListOf<HTMLElement>} */
			var eventCol = doc.querySelectorAll('.matchevent');

			// this catches both original HT events
			// and our liveEvents (if match-report-format is on)
			// we need to exclude hidden events (originals after MRF has run)
			var events = [...eventCol].filter(evt => !Foxtrick.hasClass(evt, 'hidden'));

			Foxtrick.forEach(function(evt) {
				var evtType = parseInt(evt.dataset.eventtype, 10);
				// eslint-disable-next-line no-magic-numbers
				if (evtType > 300 && evtType < 310) {
					// weather events
					var playerLink = evt.querySelector('a');
					if (!playerLink) {
						// kid from the hood
						return;
					}

					playerLink = Foxtrick.cloneElement(playerLink, true);

					// let's inject a hidden row into
					// match highlights table (report tab)
					/** @type {HTMLTableElement} */
					var table = doc.querySelector('table.tblHighlights');
					var row = table.insertRow(-1);
					Foxtrick.addClass(row, 'hidden');
					var cell = row.insertCell(-1);

					/*
					 * here is the relevant snippet from HT code:
					className = ht.timeline.getEventTypeHighlightClass(type);
					eventControlSelector = "." + className + "#matchEventIndex_" + eventIndex
					eventControl = ht.$(eventControlSelector);
					 * getEventTypeHighlightClass returns undefined for weather SEs
					 * so we need to fake this cell accordingly to be picked up by HTs ;)
					 */

					// README: time line match event index no longer matches match report idx
					var sel = `[id$="_matchEventTypeId"][value="${evtType}"]`;
					var evtTypeInput = doc.querySelector(sel);
					var timelineEvent = evtTypeInput.parentNode;

					/** @type {HTMLInputElement} */
					var evtIdxInput = timelineEvent.querySelector('[id$="_eventIndex"]');
					cell.id = 'matchEventIndex_' + evtIdxInput.value;
					Foxtrick.addClass(cell, 'undefined');
					cell.appendChild(playerLink);
				}
			}, events);
		};

		// add stars for players that leave the field
		var addStarsToSubs = function(playerRatingsByEvent) {
			// filter players that have not played: { FromMin: 0, ToMin: 0 }
			// or { FromMin: -1, ToMin: -1 } => coaches
			// these have
			var played = [];
			playerRatingsByEvent[0].players.forEach(function(player, i) {
				if (player.ToMin !== -1 && !(player.FromMin === 0 && player.ToMin === 0)) {
					player.ftIdx = i; // saving the index in the original array
					played.push(player);
				}
			});

			// WARNING: those are object references, not clones, modify with care!
			// perhaps we should clone instead?

			// let's make some player groups

			// players who play till the end: { ToMin: LastMinuteInTheGame }
			// these don't
			var leavesField = Foxtrick.filter(function(player) {
				return player.ToMin != timeline[timeline.length - 1].min;
			}, played);

			// // players who start the game: { FromMin: -1}
			// // these don't
			// var entersField = Foxtrick.filter(function(player) {
			// 	return player.FromMin != -1;
			// }, played);
			//
			// // these players both entersField and leavesField later
			// var comesAndGoes = Foxtrick.intersect(leavesField, entersField);
			//
			// // some exlusive groups
			// var leavesFieldOnly = Foxtrick.filter(function(player) {
			// 	return !Foxtrick.has(comesAndGoes, player);
			// }, leavesField);
			// var entersFieldOnly = Foxtrick.filter(function(player) {
			// 	return !Foxtrick.has(comesAndGoes, player);
			// }, entersField);

			leavesField.forEach(function(player) {
				var subMin = player.ToMin;
				var idx = player.ftIdx; // index in the original players array

				// there are multiple events per minute
				// so we need to find the correct substitution event first
				// players on the bench: { Stars: -1 }
				for (var j = 0; j < timeline.length; ++j) {
					if (timeline[j].min == subMin) {
						// reached the sub minute
						// TODO rewrite: HTs changed something and Stars seem to no longer be reset
						while (playerRatingsByEvent[j].players[idx].Stars != -1) {
							let next = j + 1;
							if (timeline.length == next || timeline[next].min != subMin)
								break;

							j = next;
						}

						// reached the sub second because stars = -1
						// var subSec = timeline[j].sec;

						var starsLast = playerRatingsByEvent[j - 1].players[idx].Stars;

						// save stamina for later?
						// player.ftLastStamina = ratings.players[idx].Stamina;

						// add stars for all further events
						while (timeline[j] && playerRatingsByEvent[j]) {
							playerRatingsByEvent[j].players[idx].Stars = starsLast;
							++j;
						}

						// add stars for all events at the same second only
						// while (timeline[j].min == subMin && timeline[j].sec == subSec) {
						// 	playerRatingsByEvent[j].players[idx].Stars = starsLast;
						// 	++j;
						// }

						// timeline parsed: let's have a break =)
						break;
					}
				}
			});

			saveRatings(playerRatingsByEvent);
		};


		var undoPreviousEvents = function() {

			for (let i = 0; i < lineupEvents.length; i++) {
				let idx = lineupEvents[i].idx;
				let j = idx;

				// trace back and search for events at the same time
				let event = timeline[j];
				let { min, sec } = event;
				let found = false;

				--j;
				while (j > -1 && timeline[j].min == min && timeline[j].sec == sec) {
					if (Foxtrick.has(lineupEventTypes, tEventTypeByEvent[j].type)) {
						// multiple lineup events happen at the same time
						// will be fixed in fixMulipleSubs()
						break;
					}
					found = true;
					--j;
				}
				if (j < 0 || !found)
					continue;

				// j now points to an event before these events
				// while idx is still our lineup event
				// let's go forward and reset players one event at a time
				for (let k = j + 1; k < idx; k++) {
					rewindRatings(playerRatingsHome, k, j);
					rewindRatings(playerRatingsAway, k, j);
				}
			}
			saveRatings(playerRatingsHome);
			saveRatings(playerRatingsAway);
		};

		// this will fix red carded players going for the bench straight away
		// red card subs don't need fixing
		var undoRedCards = function() {
			var redCardEvents = Foxtrick.filter(function(event) {
				return Foxtrick.has(redCardEventTypes, event.type);
			}, tEventTypeByEvent);
			if (!redCardEvents.length)
				return;

			for (var i = 0; i < redCardEvents.length; i++) {
				var idx = redCardEvents[i].idx;
				var j = idx - 1;
				if (j < 0)
					continue;

				// j now points to an event before the red card
				// while idx is still our red card event
				// let's reset players
				rewindRatings(playerRatingsHome, idx, j);
				rewindRatings(playerRatingsAway, idx, j);
			}
			saveRatings(playerRatingsHome);
			saveRatings(playerRatingsAway);
		};

		// unfortunately there is not enough info available
		// to parse multiple subs that happen at the same time
		// so we will have to use chpp
		var fixMultipleSubs = function() {
			var subEvents = Foxtrick.filter(function(event) {
				return Foxtrick.has(subEventTypes, event.type);
			}, tEventTypeByEvent);
			if (!subEvents.length)
				return;

			// creating an object to store subs by time
			// e.g. { '1347': [ sub1, sub2, ... ] }
			// where '1347' is event time
			// and subN is { idx: timelineIndex, isHome: boolean }
			/** @typedef {{idx:number, isHome: boolean, xml?: Element}} MLFSub */
			/** @type {Object.<string, MLFSub[]>} */
			var subTimes = {};
			var multiple = false;
			for (let i = 0; i < subEvents.length; i++) {
				let idx = subEvents[i].idx;

				let matchEventIdx = eventIndexByEvent[idx].eventIdx;
				let eventDesc = doc.querySelector(`#matchEventIndex_${matchEventIdx}`);

				// points to report tab
				if (!eventDesc)
					continue;

				let isHomeEvent;
				if (Foxtrick.hasClass(eventDesc, 'highlightHome'))
					isHomeEvent = true;
				else if (Foxtrick.hasClass(eventDesc, 'highlightAway'))
					isHomeEvent = false;
				else
					continue;

				let event = timeline[idx];
				let { min, sec } = event;
				let eventTime = Number(min) * 100 + Number(sec);

				if (eventTime in subTimes) {
					// we had this time before
					multiple = true;
				}
				else {
					// first sub for this time
					subTimes[eventTime] = [];
				}
				let subs = subTimes[eventTime];
				subs.push({ idx: idx, isHome: isHomeEvent });
			}
			if (!multiple)
				return;

			// now we ditch the time and create just an array of subgroups
			// each group has subs happening at the same sec
			// we still keep single subs because they are later used
			// to bind correct xml to multiple subs
			/** @type {MLFSub[][]} */
			var subGroups = [];
			for (let time in subTimes) {
				let subs = subTimes[time];
				subGroups.push(subs);
			}

			// OK, so at this point in subGroups
			// we have groups of subs that happen at the same time

			// in HTO matches playerRatingsHome[i].players[j].PlayerID etc
			// is not the same as the real ID
			// the conversion is handled in HT classes exclusively
			// therefore we'll need some hack-work
			/** @type {HTMatchReportPlayerData[]} */
			var HTOPlayers;
			if (SourceSystem == 'HTOIntegrated') {
				HTOPlayers = Foxtrick.Pages.Match.parsePlayerData(doc);
				if (!HTOPlayers) {
					Foxtrick.log('MatchLineupFixes: failed to fetch HTO info from the script tag');
					return;
				}
			}

			var homeId = Foxtrick.Pages.Match.getHomeTeamId(doc);
			var awayId = Foxtrick.Pages.Match.getAwayTeamId(doc);

			/** @type {CHPPParams} */
			var homeArgs = [
				['file', 'matchlineup'],
				['version', '1.8'],
				['teamId', homeId],
				['matchId', matchId],
				['sourceSystem', SourceSystem],
			];

			/** @type {CHPPParams} */
			var awayArgs = [
				['file', 'matchlineup'],
				['version', '1.8'],
				['teamId', awayId],
				['matchId', matchId],
				['sourceSystem', SourceSystem],
			];

			/** @type {CHPPOpts} */
			var cOpts = { cache: 'session' };

			Foxtrick.util.api.retrieve(doc, homeArgs, cOpts, (homeXml, homeError) => {
				Foxtrick.util.api.retrieve(doc, awayArgs, cOpts, (awayXml, awayError) => {
					if (!homeXml || homeError || !awayXml || awayError) {
						Foxtrick.log(homeError, awayError);
						return;
					}

					/**
					 * add <Substitution> xml (home or away) to appropriate events
					 * @param {MLFSub[]}  subEvents an array of sub objects
					 * @param {Element[]} xmlSubs   an array of <substitution> xmls
					 * @param {number}    offset    offset to skip previously bound xml
					 */
					var bindXmlToEvents = function(subEvents, xmlSubs, offset) {
						for (let [i, subEvent] of subEvents.entries())
							subEvent.xml = xmlSubs[i + offset];
					};

					/**
					 * replace SbjPId & ObjPId in sub.xml with HTO IDs
					 * HTO IDs are used in the timeline/ratings for HTO matches
					 * @param  {MLFSub[]} subGroup array of sub objects
					 * @return {boolean}           whether successful or not
					 */
					var addHTOIds = function(subGroup) {
						/**
						 * @param  {number} sourceId
						 * @return {number}          HTO Id
						 */
						var findPId = function(sourceId) {
							for (let htoP of HTOPlayers) {
								if (htoP.SourcePlayerId == sourceId)
									return htoP.PlayerId;
							}
							return null;
						};

						for (let sub of subGroup) {
							if (!sub.xml) {
								// CHPP is unreliable
								continue;
							}
							let xml = /** @type {CHPPXML} */ (sub.xml.ownerDocument);

							let sbjIdEl = xml.node('SubjectPlayerID', sub.xml);
							let sbjId = xml.num('SubjectPlayerID', sub.xml);
							let realSbjId = findPId(sbjId);

							let objIdEl = xml.node('ObjectPlayerID', sub.xml);
							let objId = xml.num('ObjectPlayerID', sub.xml);

							let realObjId;

							// in case sbjPlayer leaves without sub
							// XML: objId = 0, newPosId = 0, newPosBeh = -1
							// @ref matchId: 394945951 teamId: 3110
							if (objId === 0)
								realObjId = 0;
							else
								realObjId = findPId(objId);

							if (realSbjId === null || realObjId === null)
								return false;

							sbjIdEl.textContent = realSbjId.toString();
							objIdEl.textContent = realObjId.toString();
						}
						return true;
					};

					// we really can't tell
					// how many stars the players have
					// in the middle steps
					// unless the position/behaviour is the same
					// as after all subs have happened
					/**
					 * @param {HTMatchReportRatingPlayer} player
					 * @param {MatchEventRatings}         finalRatings
					 */
					var setStarsIfKnown = function(player, finalRatings) {
						if (player.PositionID == -1)
							return;

						player.Stars = -1;
						let finalPlayer = Foxtrick.nth(function(p) {
							return p.PlayerId == player.PlayerId;
						}, finalRatings.players);

						if (player.PositionID == finalPlayer.PositionID &&
						    player.PositionBehaviour == finalPlayer.PositionBehaviour)
							player.Stars = finalPlayer.Stars;
					};

					var homeSubsXml = homeXml.getElementsByTagName('Substitution');
					var awaySubsXml = awayXml.getElementsByTagName('Substitution');

					// use two indices as offsets to bind correct xml
					var homeSubsCt = 0;
					var awaySubsCt = 0;

					subGroups.forEach(function(subGroup) {
						// divide the subs in subGroup by home/away
						/** @type {MLFSub[]} */
						var homeSubsInGroup = [];

						/** @type {MLFSub[]} */
						var awaySubsInGroup = [];
						for (var j = 0; j < subGroup.length; j++) {
							var sub = subGroup[j];
							if (sub.isHome)
								homeSubsInGroup.push(sub);
							else
								awaySubsInGroup.push(sub);
						}

						// bind the xml accordingly
						bindXmlToEvents(homeSubsInGroup, [...homeSubsXml], homeSubsCt);
						bindXmlToEvents(awaySubsInGroup, [...awaySubsXml], awaySubsCt);

						// update the offsets so that already used xml is skipped later
						homeSubsCt += homeSubsInGroup.length;
						awaySubsCt += awaySubsInGroup.length;
						if (subGroup.length == 1) {
							// we don't care about single subs any more
							// they served their purpose as offsets
							return;
						}

						if (SourceSystem == 'HTOIntegrated' && !addHTOIds(subGroup)) {
							// we can't do anything without HTOIds
							Foxtrick.log('MatchLineupFixes: failed to add HTO IDs');
							return;
						}

						// OK, we assume everything's OK now.
						// Let's go through subs one by one and fix each one except the last
						subGroup.forEach(function(sub) {
							if (!sub.xml) {
								// CHPP is unreliable
								return;
							}

							let ratingsData = sub.isHome ?
								playerRatingsHome :
								playerRatingsAway;

							let ratings = ratingsData[sub.idx];
							let players = ratings.players;

							// ratings at last event
							// used for setStarsIfKnown
							let finalIdx = subGroup[subGroup.length - 1].idx;
							let finalRatings = ratingsData[finalIdx];

							// rewind to the event before this one
							// since we go through subs one by one
							// this will update the current iteration
							// with previous changes (if any)
							let goodIdx = sub.idx - 1;
							rewindRatings(ratingsData, sub.idx, goodIdx);

							// get the relevant players and apply sub
							var xml = /** @type {CHPPXML} */ (sub.xml.ownerDocument);
							let sbjId = xml.num('SubjectPlayerID', sub.xml);
							let objId = xml.num('ObjectPlayerID', sub.xml);

							var sbjPlayer = Foxtrick.nth(function(p) {
								return p.PlayerId == sbjId;
							}, players);
							var objPlayer = Foxtrick.nth(function(p) {
								return p.PlayerId == objId;
							}, players);

							// in case sbjPlayer leaves without sub
							// XML: objId = 0, newPosId = 0, newPosBeh = -1
							// @ref matchId: 394945951 teamId: 3110
							// this means objPlayer is null
							if (objPlayer === null) {
								sbjPlayer.PositionID = -1;
							}
							else {
								let orderType = xml.num('OrderType', sub.xml);
								let targetPlayer = objPlayer, sourcePlayer = sbjPlayer;
								// eslint-disable-next-line no-magic-numbers
								if (orderType == 3) {
									// for some weird reason NewPositionId
									// is applied to sbjPlayer in swaps
									targetPlayer = sbjPlayer;
									sourcePlayer = objPlayer;
								}

								sourcePlayer.PositionBehaviour = targetPlayer.PositionBehaviour;
								sourcePlayer.PositionID = targetPlayer.PositionID;
								targetPlayer.PositionBehaviour =
									xml.num('NewPositionBehaviour', sub.xml);
								targetPlayer.PositionID =
									xml.num('NewPositionId', sub.xml);

								setStarsIfKnown(sbjPlayer, finalRatings);
								setStarsIfKnown(objPlayer, finalRatings);
							}
						});
					});

					// don't forget to save, dumbo!
					saveRatings(playerRatingsHome);
					saveRatings(playerRatingsAway);
				});
			});
		};

		// DO STUFF
		if (Foxtrick.Pages.Match.isPrematch(doc) || Foxtrick.Pages.Match.inProgress(doc))
			return;

		let table = Foxtrick.Pages.Match.getRatingsTable(doc);
		if (!table || Foxtrick.Pages.Match.isWalkOver(table))
			return;

		if (weatherEvents.length &&
			Foxtrick.Prefs.isModuleOptionEnabled('MatchLineupFixes', 'FixWeatherSEs'))
			fixWeatherSEs();

		// FF is executing twice, wtf?
		if (playerRatingsHome.length && !('ftIdx' in playerRatingsHome[0].players[0]) &&
			Foxtrick.Prefs.isModuleOptionEnabled('MatchLineupFixes', 'AddStarsToSubs')) {
			addStarsToSubs(playerRatingsHome);
			addStarsToSubs(playerRatingsAway);
		}
		if (lineupEvents.length &&
			Foxtrick.Prefs.isModuleOptionEnabled('MatchLineupFixes', 'FixMultipleEvents')) {
			undoPreviousEvents();
			undoRedCards();
			fixMultipleSubs();

			// we should be good now unless something weird happens
			// e.g. red card that _follows_ a sub (same second, obviously)
		}

	},
};
