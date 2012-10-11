'use strict';
/**
 * match-lineup-fixes.js
 * Fixes for the new style match lineup
 * @author LA-MJ
 */

Foxtrick.modules['MatchLineupFixes'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match'],
	OPTIONS: [
		'FixWeatherSEs', 'AddStarsToSubs', 'FixMultipleEvents'
	],
	//CSS: Foxtrick.InternalPath + 'resources/css/match-lineup-fixes.css',
	run: function(doc) {
		// START PREPARATION STAGE

		// this is where we fix HTs shit
		// we need to traverse the hidden input fields in the timeline
		// that are used as data sources by HTs to assemble the field on each click.
		// first, each minute/event has input.hidden[id$="_time"][value="min.sec"]
		var timeline = Foxtrick.map(function(el) {
			var time = el.value;
			return { min: Number(time.match(/^\d+/)), sec: Number(time.match(/\d+$/)) };
		}, doc.querySelectorAll('input[id$="_time"]'));

		//doc.querySelectorAll('input[id$="_playerRatings'"]);
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
		//};

		var initTeamRatings = function(isHome) {
			var playerRatings = doc.querySelectorAll('input[id$="_playerRatings' +
													 (isHome ? 'Home' : 'Away') + '"]');
			var playerRatingsByEvent = Foxtrick.map(function(ratings) {
				return { players: JSON.parse(ratings.value), source: ratings };
			}, playerRatings);
			// keep playerRatingsByEvent[i].source as a pointer to the input
			// so that we know where to save
			return playerRatingsByEvent;
		};
		var playerRatingsHome = initTeamRatings(true);
		var playerRatingsAway = initTeamRatings(false);

		var saveRatings = function(playerRatingsByEvent) {
			// save modifications
			for (var i = 0; i < playerRatingsByEvent.length; ++i) {
				playerRatingsByEvent[i].source.value = JSON.stringify(playerRatingsByEvent[i].players);
			}
		};

		var resetPlayers = function(playerRatingsByEvent, eventIdx, sourceIdx, attributesToReset) {
			if (typeof (attributesToReset) == 'undefined')
				attributesToReset = [
					'IsCaptain',
					'IsKicker',
					'PositionBehaviour',
					'PositionID',
					'Stars',
					// stamina is not position dependent + it changes in time
				];
			var players = playerRatingsByEvent[eventIdx].players;
			var correctPlayers = playerRatingsByEvent[sourceIdx].players;
			for (var l = 0; l < players.length; l++) {
				for (var m = 0, attr; attr = attributesToReset[m]; m++) {
					players[l][attr] = correctPlayers[l][attr];
				}
			}
		};

		// more stuff in each event:
		//doc.querySelectorAll('input[id$="_matchEventTypeId"]')
		// leaves field events: 91-97; not 94; 350-352; 512-514
		// other player movement events: 360-262; 370-372;

		//doc.querySelectorAll('input[id$="_eventIndex"]') points to the report tab!
		var eventIndices = doc.querySelectorAll('input[id$="_eventIndex"]');
		var eventIndexByEvent = [];
		for (var i = 0; i < eventIndices.length; i++) {
			eventIndexByEvent.push({ eventIdx: Number(eventIndices[i].value), idx: i });
		}

		//doc.querySelectorAll('input[id$="_timelineEventType"]')
		var TIMELINE_EVENT_TYPES = {
			YELLOW_CARD: 6,
			SECOND_YELLOW_CARD: 7, 	// TODO: bug? unused!
			RED_CARD: 8,			// also second yellow now
			GOAL: 9,
			SUB: 10, 				// also swap right now
			NEW_BEHAVIOR: 11,
			SWAP: 12, 				// bug? unused!
			MINUTE: 14,
			PULLBACK: 15,
			CONFUSION: 16,
			INJURY: 18,
			BRUISED: 19,
			NERVES: 20,
			RAIN: 21,
			SUN: 22,
		};
		var subEventTypes = [
			TIMELINE_EVENT_TYPES.SUB,
			TIMELINE_EVENT_TYPES.NEW_BEHAVIOR,
			TIMELINE_EVENT_TYPES.SWAP // TODO: currently not in use!
		];
		var redCardEventTypes = [
			TIMELINE_EVENT_TYPES.SECOND_YELLOW_CARD, // TODO: currently not in use!
			TIMELINE_EVENT_TYPES.RED_CARD,
		];
		var lineupEventTypes = Foxtrick.union(redCardEventTypes, subEventTypes);

		var timelineEvents = doc.querySelectorAll('input[id$="_timelineEventType"]');
		var tEventTypeByEvent = [];
		for (var i = 0; i < timelineEvents.length; i++) {
			tEventTypeByEvent.push({ type: Number(timelineEvents[i].value), idx: i });
		}

		var lineupEvents = Foxtrick.filter(function(event) {
			return Foxtrick.member(event.type, lineupEventTypes);
		}, tEventTypeByEvent);


		// info for CHPP
		var SourceSystem = 'Hattrick';
		var isYouth = Foxtrick.Pages.Match.isYouth(doc);
		var isHTOIntegrated = Foxtrick.Pages.Match.isHTOIntegrated(doc);
		if (isYouth)
			SourceSystem = 'Youth';
		if (isHTOIntegrated)
			SourceSystem = 'HTOIntegrated';
		var matchId = Foxtrick.Pages.Match.getId(doc);
		// add locale as argument to prevent using old cache after
		// language changed
		var locale = FoxtrickPrefs.getString('htLanguage');
		var detailsArgs = [
			['file', 'matchdetails'],
			['matchEvents', 'true'],
			['matchID', matchId],
			['SourceSystem', SourceSystem],
			['version', '2.3'],
			['lang', locale]
		];


		// END PREPARATION STAGE



		// here comes the actual stuff

		var fixWeatherSEs = function() {
			Foxtrick.util.api.retrieve(doc, detailsArgs, { cache_lifetime: 'session' },
			  function(xml) {
				var events = xml.getElementsByTagName('Event');
				Foxtrick.map(function(evt) {
					var evtMarkup = evt.getElementsByTagName('EventText')[0]
						.textContent.replace(RegExp('<br\\s*/?>', 'g'), '');
					var evtType = evt.getElementsByTagName('EventTypeID')[0]
						.textContent;

					if (evtType > 300 && evtType < 310) {
						//whether events
						var temp = doc.createElement('div');
						Foxtrick.util.sanitize.addHTML(doc, evtMarkup, temp);
						//trusted source
						var link = temp.getElementsByTagName('a')[0];
						var table = doc.querySelector('table.tblHighlights');
						var row = table.insertRow(-1);
						Foxtrick.addClass(row, 'hidden');
						var cell = row.insertCell(-1);
						cell.id = 'matchEventIndex_' +
							evt.attributes.getNamedItem('Index').textContent;
						Foxtrick.addClass(cell, 'undefined');
						cell.appendChild(link);
					}
				}, events);
			});
		};

		// add stars for players that leave the field
		var addStarsToSubs = function(playerRatingsByEvent) {
			// filter players that have not played: { FromMin: 0, ToMin: 0 }
			// these have
			var played = [];
			for (var i = 0; i < playerRatingsByEvent[0].players.length; ++i) {
				var player = playerRatingsByEvent[0].players[i];
				if (!(player.FromMin == 0 && player.ToMin == 0)) {
					player.ftIdx = i; // saving the index in the original array
					played.push(player);
				}
			}
			// WARNING: those are object references, not clones, modify with care!
			// perhaps we should clone instead?

			// let's make some player groups

			// players who play till the end: { ToMin: LastMinuteInTheGame }
			// these don't
			var leavesField = Foxtrick.filter(function(player) {
				return player.ToMin != timeline[timeline.length - 1].min;
			}, played);

			//// players who start the game: { FromMin: -1}
			//// these don't
			//var entersField = Foxtrick.filter(function(player) {
			//	return player.FromMin != -1;
			//}, played);
			//
			// these players both entersField and leavesField later
			//var comesAndGoes = Foxtrick.intersect(leavesField, entersField);
			//
			// some exlusive groups
			//var leavesFieldOnly = Foxtrick.filter(function(player) {
			//	return !Foxtrick.member(player, comesAndGoes);
			//}, leavesField);
			//var entersFieldOnly = Foxtrick.filter(function(player) {
			//	return !Foxtrick.member(player, comesAndGoes);
			//}, entersField);

			for (var i = 0; i < leavesField.length; ++i) {
				var player = leavesField[i];
				var subMin = player.ToMin;
				var idx = player.ftIdx;
				// index in the original players array

				// there are multiple events per minute
				// so we need to find the correct substitution event first
				// players on the bench: { Stars: -1 }
				for (var j = 0; j < timeline.length; ++j) {
					if (timeline[j].min == subMin) {
						// reached the sub minute
						while (playerRatingsByEvent[j].players[idx].Stars != -1)
							++j;
						// reached the sub second because stars = -1

						var starsLast = playerRatingsByEvent[j - 1].players[idx].Stars;
						var subSec = timeline[j].sec;
						// save stamina for later?
						// player.ftLastStamina = ratings.players[idx].Stamina;

						// add stars for all further events
						while (timeline[j]) {
							playerRatingsByEvent[j].players[idx].Stars = starsLast;
							++j;
						}
						// add stars for all events at the same second only
						//while (timeline[j].min == subMin && timeline[j].sec == subSec) {
						//	playerRatingsByEvent[j].players[idx].Stars = starsLast;
						//	++j;
						//}

						// timeline parsed: let's have a break =)
						break;
					}
				}
			}

			saveRatings(playerRatingsByEvent);
		};


		var undoPreviousEvents = function() {

			for (var i = 0; i < lineupEvents.length; i++) {
				var idx = lineupEvents[i].idx;
				var j = idx;
				// trace back and search for events at the same time
				var eventMin = timeline[j].min;
				var eventSec = timeline[j].sec;
				var found = false;
				--j;
				while (j > -1 && timeline[j].min == eventMin && timeline[j].sec == eventSec) {
					if (Foxtrick.member(tEventTypeByEvent[j].type, lineupEventTypes))
						// multiple lineup events happen at the same time
						// will be fixed in fixMulipleSubs()
						break;
					found = true;
					--j;
				}
				if (j < 0 || !found)
					continue;

				// j now points to an event before these events
				// while idx is still our lineup event
				// let's go forward and reset players one event at a time
				for (var k = j + 1; k < idx ; k++) {
					resetPlayers(playerRatingsHome, k, j);
					resetPlayers(playerRatingsAway, k, j);
				}
			}
			saveRatings(playerRatingsHome);
			saveRatings(playerRatingsAway);
		};

		// this will fix red carded players going for the bench straight away
		// red card subs don't need fixing
		var undoRedCards = function() {
			var redCardEvents = Foxtrick.filter(function(event) {
				return Foxtrick.member(event.type, redCardEventTypes);
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
				resetPlayers(playerRatingsHome, idx, j);
				resetPlayers(playerRatingsAway, idx, j);
			}
			saveRatings(playerRatingsHome);
			saveRatings(playerRatingsAway);
		};

		// unfortunately there is not enough info available
		// to parse multiple subs that happen at the same time
		// so we will have to use chpp
		var fixMultipleSubs = function() {
			var subEvents = Foxtrick.filter(function(event) {
				return Foxtrick.member(event.type, subEventTypes);
			}, tEventTypeByEvent);
			if (!subEvents.length)
				return;

			var subTimes = {}, multiple = false;
			for (var i = 0; i < subEvents.length; i++) {
				var idx = subEvents[i].idx;
				var eventMin = timeline[idx].min;
				var eventSec = timeline[idx].sec;
				var eventTime = Number(eventMin) * 100 + Number(eventSec);
				var matchEventIdx = eventIndexByEvent[idx].eventIdx;
				var eventDesc = doc.querySelector('#matchEventIndex_' +
												  matchEventIdx);
				if (!eventDesc)
					continue;
				var isHomeEvent;
				if (Foxtrick.hasClass(eventDesc, 'highlightHome'))
					isHomeEvent = true;
				else if (Foxtrick.hasClass(eventDesc, 'highlightAway'))
					isHomeEvent = false;
				else
					continue;

				if (!subTimes.hasOwnProperty(eventTime)) {
					subTimes[eventTime] = [];
				}
				else
					multiple = true;

				subTimes[eventTime].push({
					idx: idx, isHome: isHomeEvent
				});
			}
			if (!multiple)
				return;

			var subGroups = [];
			for (var time in subTimes) {
				//if (subTimes[time].length > 1) {
					subGroups.push(subTimes[time]);
				//}
			}
			// OK, so at this point in subGroups
			// we have groups of subs that happen at the same time

			// in HTO matches playerRatingsHome[i].players[j].PlayerID etc
			// is not the same as the real ID
			// the conversion is handled in HT classes exclusively
			// therefore we'll need some hack-work
			var fetchHTOInfo = function() {
				var scripts = doc.getElementsByTagName('script');
				var regex = /ht\.matchAnalysis\.playerData\s*=\s*'([\s\S]+?)';/m;
				var playerData;
				for (var i = 0; i < scripts.length; i++) {
					if (regex.test(scripts[i].textContent)) {
						playerData =
							JSON.parse(regex.exec(scripts[i].textContent)[1]);
						break;
					}
				}
				return playerData;
			};
			if (SourceSystem == 'HTOIntegrated') {
				var HTOPlayers = fetchHTOInfo();
				if (!HTOPlayers)
					return;
			}

			Foxtrick.util.api.retrieve(doc, detailsArgs, { cache_lifetime: 'session' },
			  function(xml) {
				var homeId = xml.getElementsByTagName('HomeTeamID')[0].textContent;
				var awayId = xml.getElementsByTagName('AwayTeamID')[0].textContent;
				var homeName = xml.getElementsByTagName('HomeTeamName')[0].textContent;
				var awayName = xml.getElementsByTagName('AwayTeamName')[0].textContent;

				var homeArgs = [
					['file', 'matchlineup'],
					['matchID', matchId],
					['teamID', homeId],
					['SourceSystem', SourceSystem],
					['version', '1.8']
				];
				var awayArgs = [
					['file', 'matchlineup'],
					['matchID', matchId],
					['teamID', awayId],
					['SourceSystem', SourceSystem],
					['version', '1.8']
				];

				Foxtrick.util.api.retrieve(doc, homeArgs, { cache_lifetime: 'session' },
				  function(homeXml) {
					Foxtrick.util.api.retrieve(doc, awayArgs, { cache_lifetime: 'session' },
					  function(awayXml) {
						var events = xml.getElementsByTagName('Event');
						var homeSubsXml = homeXml.getElementsByTagName('Substitution');
						var awaySubsXml = awayXml.getElementsByTagName('Substitution');
						var homeSubsCt = 0;
						var awaySubsCt = 0;
						var bindXmlToEvents = function(subEvents, xmlSubs, offset) {
							for (var i = 0; i < subEvents.length; i++) {
								subEvents[i].xml = xmlSubs[i + offset];
							}
						};
						var addHTOIds = function(subGroup) {
							var findPId = function(sourceId) {
								for (var i = 0; i < HTOPlayers.length; i++) {
									if (HTOPlayers[i].SourcePlayerId == sourceId)
										return HTOPlayers[i].PlayerId;
								}
								return null;
							};
							for (var j = 0; j < subGroup.length; j++) {
								var subXml = subGroup[j].xml;
								var sbjIdEl = subXml.getElementsByTagName('SubjectPlayerID')[0];
								var objIdEl = subXml.getElementsByTagName('ObjectPlayerID')[0];
								var realSbjId = findPId(sbjIdEl.textContent);
								var realObjId = findPId(objIdEl.textContent);
								if (!realSbjId || !realObjId)
									return false;
								sbjIdEl.textContent = realSbjId;
								objIdEl.textContent = realObjId;
							}
							return true;
						};

						for (var i = 0; i < subGroups.length; i++) {
							var subGroup = subGroups[i];
							var homeSubsInGroup = [];
							var awaySubsInGroup = [];
							for (var j = 0; j < subGroup.length; j++) {
								var sub = subGroup[j];
								if (sub.isHome)
									homeSubsInGroup.push(sub);
								else
									awaySubsInGroup.push(sub);
							}
							bindXmlToEvents(homeSubsInGroup, homeSubsXml, homeSubsCt);
							bindXmlToEvents(awaySubsInGroup, awaySubsXml, awaySubsCt);
							homeSubsCt += homeSubsInGroup.length;
							awaySubsCt += awaySubsInGroup.length;
							if (subGroup.length == 1)
								continue;
							if (SourceSystem == 'HTOIntegrated' && !addHTOIds(subGroup)) {
								return;
							}

							// OK, we assume everything's OK now.
							// Let's go through subs one by one and fix each one except the last
							for (var j = 0; j < subGroup.length - 1; j++) {
								var sub = subGroup[j];
								var goodIdx = sub.idx - 1;
								var ratingsData = (sub.isHome) ? playerRatingsHome :
									playerRatingsAway;
								// rewind by one
								resetPlayers(ratingsData, sub.idx, goodIdx);
								var ratings = ratingsData[sub.idx];
								var sbjId = sub.xml
									.getElementsByTagName('SubjectPlayerID')[0].textContent;
								var objId = sub.xml
									.getElementsByTagName('ObjectPlayerID')[0].textContent;
								var objPlayer = Foxtrick.filter(function(p) {
									return p.PlayerId == objId;
								}, ratings.players)[0];
								var sbjPlayer = Foxtrick.filter(function(p) {
									return p.PlayerId == sbjId;
								}, ratings.players)[0];
								sbjPlayer.PositionBehaviour = objPlayer.PositionBehaviour;
								sbjPlayer.PositionID = objPlayer.PositionID;
								objPlayer.PositionBehaviour = Number(sub.xml
									.getElementsByTagName('NewPositionBehaviour')[0].textContent);
								objPlayer.PositionID = Number(sub.xml
									.getElementsByTagName('NewPositionId')[0].textContent);
								// we really can't tell what the stars of these players are
								// in the middle steps
								if (sbjPlayer.PositionID != -1)
									sbjPlayer.Stars = -1;
								if (objPlayer.PositionID != -1)
									objPlayer.Stars = -1;
							}
						}

						// don't forget to save, dumbo!
						saveRatings(playerRatingsHome);
						saveRatings(playerRatingsAway);
					});
				});
			});
		};



		// DO STUFF
		if (Foxtrick.Pages.Match.isPrematch(doc)
			|| Foxtrick.Pages.Match.inProgress(doc))
			return;

		if (!Foxtrick.Pages.Match.hasNewRatings(doc))
			return;

		if (FoxtrickPrefs.isModuleOptionEnabled('MatchLineupFixes', 'FixWeatherSEs'))
			fixWeatherSEs();

		if (!playerRatingsHome[0].players[0].hasOwnProperty('ftIdx') && // FF is executing twice, wtf?
			FoxtrickPrefs.isModuleOptionEnabled('MatchLineupFixes', 'AddStarsToSubs')) {
			addStarsToSubs(playerRatingsHome);
			addStarsToSubs(playerRatingsAway);
		}
		if (lineupEvents.length &&
			FoxtrickPrefs.isModuleOptionEnabled('MatchLineupFixes', 'FixMultipleEvents')) {
			undoPreviousEvents();
			undoRedCards();
			fixMultipleSubs();
			// we should be good now unless something weird happens
			// e.g. red card that _follows_ a sub (same second, obviously)
		}

	},
};
