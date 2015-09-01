'use strict';
/**
 * match-order.js
 * adding extra info to match order interface
 * @author convinced
 */

Foxtrick.modules['MatchOrderInterface'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['matchOrder'],
	OPTIONS: [
		'GotTrainingOnField', 'DisplayLastMatchInDetails',
		'Specialties',
		'ShowFaces',
		'SwapPositions', 'StayOnPage',
		['CloneOrder', 'AutoExpandCloned'],
		'FixPenaltyTakers',
		[
			'AddPenaltyTakerButtons',
			'UseSubsForPenalties',
			'DontSortPenaltyTakers',
			'PrioritizeSP',
			'ClearPenaltyTakersFirst'
		]
	],
	CSS: Foxtrick.InternalPath + 'resources/css/match-order.css',
	OPTIONS_CSS: [
		null, null,
		Foxtrick.InternalPath + 'resources/css/match-order-specialties.css',
		Foxtrick.InternalPath + 'resources/css/match-order-faces.css',
		null, null,
		[Foxtrick.InternalPath + 'resources/css/match-order-clone.css'],
		null,
		[]
	],
	run: function(doc) {
		var module = this;
		var avatarsParamsString;
		var getAvatars;
		var getPlayers;
		var check_images = function(doc, target, avatarsXml, getID, scale, recursion) {
			if (!Foxtrick.Prefs.isModuleOptionEnabled('MatchOrderInterface', 'ShowFaces'))
				return;
			var isYouth = (doc.location.href.search(/isYouth=true|SourceSystem=Youth/i) != -1);
			var add_image = function(fieldplayer) {
				var id = getID(fieldplayer);
				if (!id)
					return false;

				var elName = (isYouth ? 'Youth' : '') + 'Player';
				var players = avatarsXml.getElementsByTagName(elName);
				for (var i = 0; i < players.length; ++i) {
					if (id === avatarsXml.num(elName + 'ID', players[i]))
						break;
				}
				if (i == players.length) {
					// id not found, possibly new player, invalidate cache and refetch
					if (!recursion) {
						var now = Foxtrick.util.time.getHtTimeStamp(doc);
						Foxtrick.util.api.setCacheLifetime(avatarsParamsString, now);
						Foxtrick.log('New player found: refreshing player cache.');
						getPlayers(true);
						getAvatars(JSON.parse(avatarsParamsString), { recursion: true });
					}
					else {
						Foxtrick.error('Infinite recursion in MatchOrderInterface');
					}
					return true;
				}

				Foxtrick.addClass(fieldplayer, 'smallFaceCardBox');

				var shirt = fieldplayer.getElementsByClassName('shirt')[0];

				if (Foxtrick.hasClass(shirt, 'smallFaceCard'))
					return false;

				Foxtrick.addClass(shirt, 'smallFaceCard');
				var style = 'top:-20px; width:' + Math.round(100 / scale) + 'px; height:' +
					Math.round(123 / scale) + 'px';
				shirt.setAttribute('style', style);

				Foxtrick.Pages.Match.makeAvatar(shirt, players[i], scale);
				return false;
			};

			Foxtrick.any(add_image, target.getElementsByClassName('player'));
		};
		var savePenaltySkills = function(playerList) {
			var players = {};
			for (var i = 0, p, skill; p = playerList[i]; ++i) {
				// formula by HO
				skill = p.experience * 1.5 + p.setPieces * 0.7 + p.scoring * 0.3;
				skill = (p.specialityNumber == 1) ? skill * 1.1 : skill;
				players[p.id] = skill;
			}
			Foxtrick.sessionSet('match-orders-penalty-skills', players);
		};
		var check_Specialties = function(doc, target, playerList, getID, targetClass) {
			if (Foxtrick.Prefs.isModuleOptionEnabled('MatchOrderInterface', 'Specialties')) {
				var cards_health = target.getElementsByClassName(targetClass);
				for (var i = 0; i < cards_health.length; ++i) {
					var id = getID(cards_health[i]);
					if (!id || Foxtrick.hasClass(cards_health[i], 'ft-specialty'))
						continue;

					var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList, id);
					if (player && player.specialityNumber != 0) {
						var specIdx = player.specialityNumber;
						Foxtrick.addClass(cards_health[i], 'ft-specialty');
						var title = Foxtrick.L10n.getSpecialityFromNumber(specIdx);
						var specUrl = Foxtrick.getSpecialtyImagePathFromNumber(specIdx);
						Foxtrick.addImage(doc, cards_health[i], {
							alt: title,
							title: title,
							src: specUrl,
							class: 'ft-specialty'
						});
					}
				}
			}
		};

		//button to clone last order
		var runAddCloneButtons = function() {
			//the brain, remembers which id is what kind of setting, substitution, swap or change
			var mapping = {};

			if (Foxtrick.Prefs.isModuleOptionEnabled('MatchOrderInterface', 'CloneOrder')) {
				var getLastNode = function() {
					var orders = doc.getElementsByClassName('substitution');
					if (!orders.length)
						return null;

					return orders[orders.length - 1];
				};
				var getIdFromNode = function(node) {
					try {
						return parseInt(node.id.match(/\d+/)[0], 10);
					}
					catch (e) {
						return 0;
					}
				};
				var getLastId = function() {
					var lastnode = getLastNode();
					if (lastnode !== null)
						return getIdFromNode(lastnode);
					return 0;
				};
				//figure out the types of the loaded stuff
				var figureLoadedOrders = function() {
					var orders = doc.getElementsByClassName('substitution');
					if (!orders.length)
						return 0;

					for (var i = 0; i < orders.length; i++) {
						var id = getIdFromNode(orders[i]);
						if (id) {
							if (doc.getElementById('change_' + id)) {
								mapping[id] = 'addChange';
							}
							if (doc.getElementById('swapout_' + id)) {
								mapping[id] = 'addSwap';
							}
							if (doc.getElementById('out_' + id)) {
								mapping[id] = 'addSub';
							}
						}
					}
				};
				//addCloneAsTypeButton
				var addCloneAsTypeButtonForNode = function(node, type, class_name, title, alt,
				                                           text, link_type) {

						if (node.getElementsByClassName(class_name).length)
							return;

						var sub = node.getElementsByClassName('remove')[0];
						var cloned = sub.cloneNode(true);
						cloned.textContent = text;
						Foxtrick.removeClass(cloned, 'remove');
						Foxtrick.addClass(cloned, class_name);
						Foxtrick.addClass(cloned, 'ft-match-order-clone-button');
						cloned.setAttribute('title', title);
						cloned.setAttribute('alt', alt);
						node.appendChild(cloned);

						Foxtrick.onClick(cloned, function(ev) {
							cloneAsTypeById(getIdFromNode(ev.target.parentNode), link_type);

						});
				};
				var cloneOpts = {
					'clone': {
						title: Foxtrick.L10n.getString('matchOrder.cloneOrder'),
						alt: Foxtrick.L10n.getString('matchOrder.cloneOrder'),
						text: Foxtrick.L10n.getString('matchOrder.cloneOrder.abbr'),
					},
					'addSwap': {
						title: Foxtrick.L10n.getString('matchOrder.cloneAsSwap'),
						alt: Foxtrick.L10n.getString('matchOrder.cloneAsSwap'),
						text: Foxtrick.L10n.getString('matchOrder.cloneAsSwap.abbr'),
					},
					'addChange': {
						title: Foxtrick.L10n.getString('matchOrder.cloneAsChange'),
						alt: Foxtrick.L10n.getString('matchOrder.cloneAsChange'),
						text: Foxtrick.L10n.getString('matchOrder.cloneAsChange.abbr'),
					},
					'addSub': {
						title: Foxtrick.L10n.getString('matchOrder.cloneAsSub'),
						alt: Foxtrick.L10n.getString('matchOrder.cloneAsSub'),
						text: Foxtrick.L10n.getString('matchOrder.cloneAsSub.abbr'),
					},

				};
				var addCloneButtonForNodeByType = function(node, type, idx) {
					var title = cloneOpts[type].title;
					var alt = cloneOpts[type].alt;
					var text = cloneOpts[type].text;
					if (type == 'clone')
						type = mapping[getIdFromNode(node)];

					var desiredClass = 'ft-match-order-clone-' + idx;
					addCloneAsTypeButtonForNode(node, type, desiredClass, title, alt, text, type);
				};
				var cloneAsTypeById = function(src_id, type) {
					var clone_settings = function(sourceId, targetId) {
						//adjust minutes
						var min = doc.getElementById('minutestext_' + targetId);
						var min_org = doc.getElementById('minutestext_' + sourceId);
						while (min.textContent != min_org.textContent) {
							doc.getElementById('minutesplus_' + id).click();
						}
						//display advanced, default copy from src, otherwise autoexpand
						if (!Foxtrick.Prefs.isModuleOptionEnabled('MatchOrderInterface',
						    'AutoExpandCloned'))
							doc.getElementById('advanced_' + targetId)
								.setAttribute('style', doc.getElementById('advanced_' + sourceId)
								              .getAttribute('style'));
						else
							doc.getElementById('advanced_' + targetId)
								.setAttribute('style', 'display:block;');
						//behaviour
						if (doc.getElementById('behaviour_' + targetId) &&
						    doc.getElementById('behaviour_' + sourceId))
							doc.getElementById('behaviour_' + targetId).value =
								doc.getElementById('behaviour_' + sourceId).value;
						//cardcond
						doc.getElementById('cardcond_' + targetId).value =
							doc.getElementById('cardcond_' + sourceId).value;
						//standingcond
						doc.getElementById('standingcond_' + targetId).value =
							doc.getElementById('standingcond_' + sourceId).value;
						//minifield
						//it does not make much sence to clone the minifield and might lead to
						//unwanted errors if we ever want to enabled it, here's the code:
						/*
						if (doc.getElementById('minifield_' + sourceId)) {
							var lastactive = doc.getElementById('minifield_' + sourceId).getElementsByClassName('active')[0];
							if (lastactive && doc.getElementById('minifield_' + targetId)) {
								var lastactiveid = lastactive.className.match(/\d+/)[0];
								doc.getElementById('minifield_' + targetId).getElementsByClassName('p'+lastactiveid)[0].click();
							}
						}
						*/
					};
					//get button for the order by id
					var srcTypeButton = doc.getElementById(type);

					//click it
					srcTypeButton.click();

					//get id of the cloned entry and update mapping
					var id = getLastId();
					mapping[id] = mapping[src_id];

					//clone the settings
					clone_settings(src_id, id);
				};

				var addCloneButtonsForNode = function(node) {

					//counter for class naming, used in styling
					var i = 0;
					//normal clone button
					addCloneButtonForNodeByType(node, 'clone', ++i);

					var type = mapping[getIdFromNode(node)];

					if (type != 'addSub') {
						addCloneButtonForNodeByType(node, 'addSub', ++i);
					}
					if (type != 'addChange') {
						addCloneButtonForNodeByType(node, 'addChange', ++i);
					}
					if (type != 'addSwap') {
						addCloneButtonForNodeByType(node, 'addSwap', ++i);
					}
				};

				figureLoadedOrders();
				var orders = doc.getElementsByClassName('substitution');
				if (orders.length) {
					for (var i = 0; i < orders.length; i++) {
						addCloneButtonsForNode(orders[i]);
					}
				}
			}
		};

		var runMatchOrder = function(doc) {
			var isYouth = (doc.location.href.search(/isYouth=true|SourceSystem=Youth/i) != -1);
			var getID = function(fieldplayer) {
				if (!fieldplayer.id)
					return null;
				return Number(fieldplayer.id.match(/list_playerID(\d+)/i)[1]);
			};
			var getIDParent = function(node) {
				if (!node.parentNode.id)
					return null;
				return Number(node.parentNode.id.match(/list_playerID(\d+)/i)[1]);
			};

			// add extra info
			var hasPlayerInfo = false;
			var hasAvatars = false;
			var hasInterface = false;
			var playerList = null;
			var avatarsXml = null;
			// NT team ID can only be found in URL it seems
			var seniorId = Foxtrick.util.id.getTeamIdFromUrl(doc.location.href);
			var youthId = Foxtrick.util.id.getYouthTeamIdFromUrl(doc.location.href);
			var teamId = isYouth ? youthId : seniorId;

			// load ahead players and then wait for interface loaded
			getPlayers = function(fresh) {
				Foxtrick.Pages.Players.getPlayerList(doc,
				  function(playerInfo) {
					if (!playerInfo || playerInfo.length === 0) {
						Foxtrick.log('unable to retrieve player list.');
						return;
					}

					Foxtrick.log('hasPlayerInfo');
					hasPlayerInfo = true;
					playerList = playerInfo;

					savePenaltySkills(playerList);

					if (hasInterface)
						showPlayerInfo(doc.getElementById('orders'));
				}, { teamId: teamId, currentSquad: true, includeMatchInfo: true, refresh: fresh });
			};
			getPlayers();

			var avatarsParams = [
				['file', (isYouth ? 'youth' : '') + 'avatars'],
				['version', '1.1'],
				[(isYouth ? 'youthT' : 't') + 'eamId', teamId]
			];
			avatarsParamsString = JSON.stringify(avatarsParams); // save as string (immutable)
			getAvatars = function(avatarsParams, opts) {
				Foxtrick.util.api.retrieve(doc, avatarsParams, { cache_lifetime: 'session' },
				  function(xml, errorText) {
					if (!xml || errorText) {
						Foxtrick.log(errorText);
						return;
					}
					Foxtrick.log('hasAvatars');
					avatarsXml = xml;
					hasAvatars = true;
					var field = doc.getElementById('field');
					var rec = opts && opts.recursion;
					if (hasInterface)
						check_images(doc, field, avatarsXml, getID, 3, rec);
				});
			};
			getAvatars(avatarsParams);

			var loading = doc.getElementById('loading');
			var waitForInterface = function(ev) {
				if (hasInterface)
					return;
				Foxtrick.log('hasInterface');
				hasInterface = true;
				if (hasPlayerInfo)
					showPlayerInfo(doc.getElementById('orders'));
				if (hasAvatars)
					check_images(doc, doc.getElementById('field'), avatarsXml, getID, 3);

				//checkbox to swap positions
				var needsSwapPositions = Foxtrick.Prefs.isModuleOptionEnabled('MatchOrderInterface',
				                                                             'SwapPositions');
				if (needsSwapPositions && !doc.getElementById('ft_swap_positions')) {
					var swapPositionsDiv = Foxtrick
						.createFeaturedElement(doc, Foxtrick.modules.MatchOrderInterface, 'div');
					swapPositionsDiv.id = 'ft_swap_positions';
					var swapPositionsLink = doc.createElement('span');
					swapPositionsLink.textContent =
						Foxtrick.L10n.getString('matchOrder.swapPositions');
					swapPositionsDiv.appendChild(swapPositionsLink);
					var formations = doc.getElementById('formations');
					formations.parentNode.insertBefore(swapPositionsDiv, formations.nextSibling);
					doc.dispatchEvent(new Event('ft_enable_swap'));
					doc.documentElement.dataset.ft_enable_swap = true;
				}


				//fill & clear penalty takers
				var needsPenalties = Foxtrick.Prefs.isModuleOptionEnabled('MatchOrderInterface',
				                                                         'AddPenaltyTakerButtons');

				if (needsPenalties && !doc.getElementById('ft_penalty_controls')) {

					var penaltyOptionsDiv = doc.createElement('div');
					penaltyOptionsDiv.id = 'ft_penalty_options';
					var options = [
						'UseSubsForPenalties',
						'DontSortPenaltyTakers',
						'PrioritizeSP',
						'ClearPenaltyTakersFirst',
					];

					for (var o = 0, opt; o < options.length && (opt = options[o]); o++) {
						var toggleDiv = doc.createElement('div');
						var toggle = doc.createElement('input');
						toggle.type = 'checkbox';
						toggle.id = 'ft-penaltyOpt-' + opt;
						toggle.checked =
							Foxtrick.Prefs.isModuleOptionEnabled('MatchOrderInterface', opt);
						Foxtrick.onClick(toggle, (function(opt) {
							return function(ev) {
								var on = ev.target.checked;
								Foxtrick.Prefs.setModuleEnableState('MatchOrderInterface.' + opt, on);
							};
						})(opt));
						toggleDiv.appendChild(toggle);
						var togLabel = doc.createElement('label');
						togLabel.setAttribute('for', 'ft-penaltyOpt-' + opt);
						togLabel.textContent =
							Foxtrick.L10n.getString('module.MatchOrderInterface.' + opt + '.desc');
						toggleDiv.appendChild(togLabel);
						penaltyOptionsDiv.appendChild(toggleDiv);
					}

					var FillPenaltyTakersLink = doc.createElement('span');
					FillPenaltyTakersLink.id = 'ft_fill_penalty_takers';
					FillPenaltyTakersLink.textContent =
						Foxtrick.L10n.getString('matchOrder.fillPenaltyTakers');

					Foxtrick.onClick(FillPenaltyTakersLink, function() {

						var useSubs = Foxtrick.Prefs.isModuleOptionEnabled('MatchOrderInterface',
																		  'UseSubsForPenalties');
						var customSort = !Foxtrick.Prefs.isModuleOptionEnabled('MatchOrderInterface',
																			  'DontSortPenaltyTakers');
						var priority = Foxtrick.Prefs.isModuleOptionEnabled('MatchOrderInterface',
																		   'PrioritizeSP');
						var clearFirst = Foxtrick.Prefs.isModuleOptionEnabled('MatchOrderInterface',
																			 'ClearPenaltyTakersFirst');

						if (clearFirst)
							doc.getElementById('ft_clear_penalty_takers').click();

						Foxtrick.sessionGet('match-orders-penalty-skills',
						  function(ps) {

							// collect data about existing kickers first
							var taken = [], placed = [], sp;
							// let's find the sp player (position #20)
							var spPlayer = doc.getElementById(20).firstChild;
							if (spPlayer)
								sp = spPlayer.id;

							for (var i = 21; i < 32; ++i) { // position #21 is first kicker
								taken[i] = doc.getElementById(i).firstChild;
								if (taken[i])
									placed[taken[i].id] = i;
							}
							var lastTaken = 20; // index to last filled position

							var players = doc.querySelectorAll('#players > div');
							players = Foxtrick.map(function(n) { return n; }, players);
							// change live node list into array

							if (customSort && hasPlayerInfo && ps !== undefined) {
								players.sort(function(a, b) { // sort descending
									var aid = a.id.match(/\d+/)[0], bid = b.id.match(/\d+/)[0];
									if (ps[aid] !== null && ps[bid] !== null) {
										return (ps[bid] - ps[aid]);
									}
									else return 0;
								});
							}

							if (priority && sp) {
								var idx;
								for (var i = 0, player; player = players[i]; ++i) {
									if (player.id == sp) {
										idx = i;
										break;
									}
								}
								// remove sp taker from the middle and add to the front
								var taker = players.splice(idx, 1)[0];
								players.unshift(taker);
							}

							for (var i = 0, player; (player = players[i]) && lastTaken < 31; ++i) {
								// player exists and we have unchecked positions

								// skip unused players, already placed players and subs
								if (!useSubs && Foxtrick.hasClass(player, 'bench') ||
									!Foxtrick.hasClass(player, 'used') ||
								    placed[player.id])
									continue;

								while (lastTaken < 31) {
									// next position exists
									if (taken[lastTaken + 1]) {
										// next position is taken: check another one
										++lastTaken;
										continue;
									}
									// next position is free: placing player
									player.click();
									doc.getElementById(lastTaken + 1).click();
									++lastTaken;
									// continue with next player
									break;
								}
							}
						});
					});

					var clearPenaltyTakersLink = doc.createElement('span');
					clearPenaltyTakersLink.id = 'ft_clear_penalty_takers';
					clearPenaltyTakersLink.textContent =
						Foxtrick.L10n.getString('matchOrder.clearPenaltyTakers');

					var penaltyButtons = doc.createElement('div');
					penaltyButtons.id = 'ft_penalty_buttons';
					penaltyButtons.appendChild(clearPenaltyTakersLink);
					penaltyButtons.appendChild(FillPenaltyTakersLink);
					var frag = Foxtrick.createFeaturedElement(doc, module, 'div');
					frag.id = 'ft_penalty_controls';
					frag.appendChild(penaltyButtons);
					frag.appendChild(doc.createElement('hr'));
					frag.appendChild(penaltyOptionsDiv);

					var penalties = doc.getElementById('tab_penaltytakers');
					penalties.appendChild(frag);
					doc.dispatchEvent(new Event('ft_enable_penalty_controls'));
					doc.documentElement.dataset.ft_enable_penalty_controls = true;
				}

				if (Foxtrick.Prefs.isModuleOptionEnabled('MatchOrderInterface', 'StayOnPage')) {
					doc.dispatchEvent(new Event('ft_enable_stay'));
					doc.documentElement.dataset.ft_enable_stay = true;
				}
				if (Foxtrick.Prefs.isModuleOptionEnabled('MatchOrderInterface',
				    'FixPenaltyTakers')) {
					doc.dispatchEvent(new Event('ft_enable_penalties_fix'));
					doc.documentElement.dataset.ft_enable_penalties_fix = true;
				}

				// add playerid to details
				Foxtrick.listen(doc.getElementById('players'), 'mouseover',
				  function(ev) {
					if (Foxtrick.hasClass(ev.target, 'player')) {
						var detailsTemplate = doc.getElementById('detailsTemplate');
						var idSearch = ev.target.id.match(/list_playerID(\d+)/i);
						if (idSearch)
							detailsTemplate.setAttribute('playerid', idSearch[1]);
					}
				}, true);

				// listen to all that has players (seperatelly to reduce excessive calling)
				var details = doc.getElementById('details');
				Foxtrick.onChange(details, function() {
					//Foxtrick.log('details change');
					if (hasPlayerInfo) {
						if (Foxtrick.Prefs.isModuleOptionEnabled('MatchOrderInterface',
						    'DisplayLastMatchInDetails'))
							addLastMatchtoDetails();
						if (Foxtrick.Prefs.isModuleEnabled('LoyaltyDisplay'))
							injectLoyaltyBars();
					}
				});

				var list = doc.getElementById('list');
				Foxtrick.onChange(list, function() {
					//Foxtrick.log('list change');
					if (hasPlayerInfo)
						showPlayerInfo(list);
					if (hasAvatars)
						check_images(doc, list, avatarsXml, getID, 3);
				});

				var fieldplayers = doc.getElementById('fieldplayers');
				Foxtrick.onChange(fieldplayers, function() {
					//Foxtrick.log('fieldplayers change');
					if (hasPlayerInfo)
						showPlayerInfo(fieldplayers);
					if (hasAvatars)
						check_images(doc, fieldplayers, avatarsXml, getID, 3);
				});

				var tab_subs = doc.getElementById('tab_subs');
				Foxtrick.onChange(tab_subs, function() {
					//Foxtrick.log('tab_subs change');
					if (hasPlayerInfo)
						showPlayerInfo(tab_subs);
					if (hasAvatars)
						check_images(doc, tab_subs, avatarsXml, getID, 3);

					runAddCloneButtons();
				});

				var tab_penaltytakers = doc.getElementById('tab_penaltytakers');
				Foxtrick.onChange(tab_penaltytakers, function() {
					//Foxtrick.log('tab_penaltytakers change');
					if (hasPlayerInfo)
						showPlayerInfo(tab_penaltytakers);
					if (hasAvatars)
						check_images(doc, tab_penaltytakers, avatarsXml, getID, 3);
				});
			};

			var addLastMatchtoDetails = function() {
				// add last match to details
				var details = doc.getElementById('details');
				var specials = details.getElementsByClassName('specials')[0];
				if (specials && !details.getElementsByClassName('ft-extraInfo')[0]) {
					var playerid = Number(specials.parentNode.getAttribute('playerid'));
					if (playerid) {
						var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList,
						                                                          playerid);
						if (!player)
							return;
						var span = doc.createElement('span');
						span.className = 'ft-extraInfo';
						span.appendChild(doc.createElement('br'));
						span.appendChild(doc.createTextNode(player.lastMatchText));
						specials.appendChild(span);
					}
				}
			};

			//loyalty, uses loyalty-display.js module code
			var injectLoyaltyBars = function() {
				var details = doc.getElementById('details');
				var specials = details.getElementsByClassName('specials')[0];
				if (specials) {
					var playerid = Number(specials.parentNode.getAttribute('playerid'));
					if (playerid) {
						var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList,
						                                                          playerid);
						if (!player)
							return;
						Foxtrick.modules['LoyaltyDisplay']
							.replacePercentageImage(player, doc.getElementById('details'));
					}
				}
			};

			var showPlayerInfo = function(target) {

				//original version was removed due to HT request,
				//this highlights players on the field for supporters only
				if (Foxtrick.Prefs.isModuleOptionEnabled('MatchOrderInterface',
				    'GotTrainingOnField')) {
					//players aren't send with the document, but the eventListeners
					//later will take care
					var listplayers = target.getElementsByClassName('player');

					if (!listplayers.length)
						return;

					for (var i = 0; i < listplayers.length; ++i)
						if (Foxtrick.hasClass(listplayers[i], 'trained')) //only for supporters
							Foxtrick.addClass(listplayers[i], 'ft-highlight-onfield');
				}

				//show potential speciality icons
				check_Specialties(doc, target, playerList, getIDParent, 'cards_health');
			};

			Foxtrick.listen(doc, 'interface_ready', function(e) {
				Foxtrick.log('interface ready: ', doc.getElementById('tab_penaltytakers')
				             .getElementsByTagName('div').length !== 0);
				waitForInterface();
			});
		};

		var isYouth = (doc.location.href.search(/isYouth=true|SourceSystem=Youth/i) != -1);
		runMatchOrder(doc);
		Foxtrick.util.inject.jsLink(doc, Foxtrick.InternalPath + 'resources/js/matchOrder.js');
	}
};
