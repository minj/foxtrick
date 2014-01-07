'use strict';
/**
 * match-order.js
 * adding extra info to match order interface
 * @author convinced
 */

Foxtrick.modules['MatchOrderInterface'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['matchOrder', 'matchLineup'],
	OPTIONS: ['GotTrainingOnField', 'DisplayLastMatchInDetails', 'Specialties', 'ShowFaces',
		'SwapPositions', 'StayOnPage', ['CloneOrder', 'AutoExpandCloned'], 'FixPenaltyTakers',
		['AddPenaltyTakerButtons', 'UseSubsForPenalties', 'DontSortPenaltyTakers', 'PrioritizeSP',
		'ClearPenaltyTakersFirst']],
	CSS: Foxtrick.InternalPath + 'resources/css/match-order.css',
	OPTIONS_CSS: ['', '', Foxtrick.InternalPath + 'resources/css/match-order-specialties.css',
		Foxtrick.InternalPath + 'resources/css/match-order-faces.css', '', '',
		[Foxtrick.InternalPath + 'resources/css/match-order-clone.css']],
	run: function(doc) {
		var module = this;
		var check_images = function(doc, target, avatarsXml, getID, scale) {
			if (!Foxtrick.Prefs.isModuleOptionEnabled('MatchOrderInterface', 'ShowFaces'))
				return;
			var isYouth = (doc.location.href.search(/isYouth=true|SourceSystem=Youth/i) != -1);
			var add_image = function(fieldplayer) {
				var id = getID(fieldplayer);
				if (!id)
					return;
				var players = avatarsXml.getElementsByTagName((isYouth ? 'Youth' : '') + 'Player');
				for (var i = 0; i < players.length; ++i) {
					if (id == Number(players[i].getElementsByTagName((isYouth ? 'Youth' : '') +
					    'PlayerID')[0].textContent))
						break;
				}
				if (i == players.length)
					return; // id not found

				Foxtrick.addClass(fieldplayer, 'smallFaceCardBox');

				var shirt = fieldplayer.getElementsByClassName('shirt')[0];

				if (shirt) {
					var kiturl = shirt.getAttribute('kiturl');
					if (!kiturl && !isYouth) {
						var shirtstyle = shirt.getAttribute('style');
						if(shirtstyle) {
							var regexp = /http:\/\/res.hattrick.org\/kits\/\d+\/\d+\/\d+\/\d+\//;
							var kiturl = shirtstyle.search(regexp) != -1 ?
								shirtstyle.match(regexp)[0] : '';
							shirt.setAttribute('kiturl', kiturl);
						}
					}
				} else {
					var outer = doc.createElement('div');
					outer.className = 'smallFaceCardOuter';
					fieldplayer.appendChild(outer);
					shirt = doc.createElement('div');
					outer.appendChild(shirt);
				}

				if (Foxtrick.hasClass(shirt, 'smallFaceCard'))
					return;

					Foxtrick.addClass(shirt, 'smallFaceCard');
				var style =
					'background-image:url('
					// cleaning background//+players[i].getElementsByTagName('BackgroundImage')[0].textContent
					+ ');'
					+ 'top:-20px; width:' + Math.round(100 / scale) + 'px; height:' +
					Math.round(123 / scale) + 'px';
				shirt.setAttribute('style', style);
				var sizes = {
					backgrounds: [0, 0],// don't show
					kits: [92, 123],
					bodies: [92, 123],
					faces: [92, 123],
					eyes: [60, 60],
					mouths: [50, 50],
					goatees: [70, 70],
					noses: [70, 70],
					hair: [92, 123],
					misc: [0, 0] // don't show (eg cards)
				};
				var layers = players[i].getElementsByTagName('Layer');
				for (var j = 0; j < layers.length; ++j) {
					var src = layers[j].getElementsByTagName('Image')[0].textContent;
					var bodypart;
					for (bodypart in sizes) {
						if (src.search(bodypart) != -1)
							break;
					}
					if (!bodypart)
						continue;

					if (bodypart == 'backgrounds')
						src = '';

					if (kiturl && bodypart == 'kits') {
						var body = src.match(/([^\/]+)(\w+$)/)[0];
						src = kiturl + body;
					}
					var x = Math.round(Number(layers[j].getAttribute('x')) / scale);
					var y = Math.round(Number(layers[j].getAttribute('y')) / scale);
					var img = doc.createElement('img');
					if (Foxtrick.Prefs.isModuleOptionEnabled('OriginalFace', 'ColouredYouth'))
						src = src.replace(/y_/, '');
					img.src = src;
					img.setAttribute('style', 'top:' + y + 'px;left:' + x + 'px;position:absolute;');
					img.width = Math.round(sizes[bodypart][0] / scale);
					img.height = Math.round(sizes[bodypart][1] / scale);
					shirt.appendChild(img);
				}
			};

			if (Foxtrick.isPage(doc, 'matchOrder'))	{
				var playerdivs = target.getElementsByClassName('player');
				for (var k = 0; k < playerdivs.length; ++k)
					add_image(playerdivs[k]);
			}
			else if (Foxtrick.isPage(doc, 'matchLineup')) {
				var playerdivs = target.getElementsByClassName('box_lineup');
				for (var k = 0; k < playerdivs.length; ++k)
					add_image(playerdivs[k]);
				playerdivs = target.getElementsByClassName('box_substitute');
				for (var k = 0; k < playerdivs.length; ++k)
					add_image(playerdivs[k]);
				playerdivs = target.getElementsByClassName('box_highlighted');
				for (var k = 0; k < playerdivs.length; ++k)
					add_image(playerdivs[k]);
				playerdivs = target.getElementsByClassName('box_replaced');
				for (var k = 0; k < playerdivs.length; ++k)
					add_image(playerdivs[k]);
			}
		};
		var savePenaltySkills = function(playerList) {
			var players = {};
			for (var i = 0, p, skill; p = playerList[i]; ++i) {
				// formula by HO
				skill = p.experience * 1.5 + p.setPiecesSkill * 0.7 + p.scorerSkill * 0.3;
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

						Foxtrick.addClass(cards_health[i], 'ft-specialty');
						var title = Foxtrick.L10n.getSpecialityFromNumber(player.specialityNumber);
						var icon_suffix = '';
						if (Foxtrick.Prefs.getBool('anstoss2icons'))
							icon_suffix = '_alt';
						Foxtrick.addImage(doc, cards_health[i], {
							alt: title,
							title: title,
							src: Foxtrick.InternalPath + 'resources/img/matches/spec' +
								player.specialityNumber + icon_suffix + '.png',
							class: 'ft-specialty'
						});
					}
				}
			}
		};

		var runMatchLineup = function(doc) {
			var isYouth = (doc.location.href.search(/isYouth=true|SourceSystem=Youth/i) != -1);
			if (isYouth) {
				var teamid = Foxtrick.util.id
					.findYouthTeamId(doc.getElementsByClassName('subMenu')[0]);
				var ownteamid = Foxtrick.util.id.getOwnYouthTeamId();
			}
			else {
				var teamid = Foxtrick.util.id.findTeamId(doc.getElementsByClassName('subMenu')[0]);
				var ownteamid = Foxtrick.util.id.getOwnTeamId();
			}
			var getID = function(fieldplayer) {
				return Foxtrick.util.id.findPlayerId(fieldplayer);
			};

			// load ahead players and then wait for interface loaded
			Foxtrick.Pages.Players.getPlayerList(doc,
			  function(playerInfo) {
				if (!playerInfo || playerInfo.length == 0) {
					Foxtrick.log('unable to retrieve player list.');
					return;
				}
				check_Specialties(doc, doc.getElementsByClassName('field')[0], playerInfo, getID,
				                  'box_lineup');
				check_Specialties(doc, doc.getElementsByClassName('field')[0], playerInfo, getID,
				                  'box_substitute');
				check_Specialties(doc, doc.getElementsByClassName('field')[0], playerInfo, getID,
				                  'box_highlighted');
				check_Specialties(doc, doc.getElementsByClassName('field')[0], playerInfo, getID,
				                  'box_replaced');
			}, { teamid: teamid, current_squad: true, includeMatchInfo: true });


			if (teamid == ownteamid) {
				Foxtrick.util.api.retrieve(doc, [
					['file', (isYouth ? 'youth' : '') + 'avatars'],
					['version', '1.1'],
					[(isYouth ? 'youthT' : 't') + 'eamId', teamid]
				  ],
				  { cache_lifetime: 'session' },
				  function(xml, errorText) {
					if (errorText) {
						/*if (loadingOtherMatches && loadingOtherMatches.parentNode) {
							loadingOtherMatches.parentNode.removeChild(loadingOtherMatches);
							loadingOtherMatches = null;
						}*/
						Foxtrick.log(errorText);
						return;
					}
					check_images(doc, doc.getElementsByClassName('field')[0], xml, getID, 4);
				});
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
				var cloneById = function(src_id) {
					cloneAsTypeById(src_id, mapping[src_id]);
				};

				Foxtrick.onClick(doc.getElementById('addSub'), function(ev) {
					mapping[getLastId()] = 'addSub';
				});
				Foxtrick.listen(doc.getElementById('addChange'), function(ev) {
					mapping[getLastId()] = 'addChange';
				});
				Foxtrick.listen(doc.getElementById('addSwap'), function(ev) {
					mapping[getLastId()] = 'addSwap';
				});

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
			var teamid = Foxtrick.util.id.findTeamId(doc.getElementById('ctl00_ctl00_CPContent_divStartMain'));
			//store most accurate list on first load
			var lastMatchDates = null;

			// load ahead players and then wait for interface loaded
			Foxtrick.Pages.Players.getPlayerList(doc,
			  function(playerInfo) {
				if (!playerInfo || playerInfo.length == 0) {
					Foxtrick.log('unable to retrieve player list.');
					return;
				}

				Foxtrick.log('hasPlayerInfo');
				hasPlayerInfo = true;
				playerList = playerInfo;

				savePenaltySkills(playerList);

				if (hasInterface)
					showPlayerInfo(doc.getElementById('orders'));
			}, { teamid: teamid, current_squad: true, includeMatchInfo: true });

			Foxtrick.util.api.retrieve(doc, [
				['file', (isYouth ? 'youth' : '') + 'avatars'],
				['version', '1.1'],
				[(isYouth ? 'youthT' : 't') + 'eamId', teamid]
			  ],
			  { cache_lifetime: 'session' },
			  function(xml, errorText) {
				if (errorText) {
					/*if (loadingOtherMatches && loadingOtherMatches.parentNode) {
						loadingOtherMatches.parentNode.removeChild(loadingOtherMatches);
						loadingOtherMatches = null;
					}*/
					Foxtrick.log(errorText);
					return;
				}
				Foxtrick.log('hasAvatars');
				avatarsXml = xml;
				hasAvatars = true;
				if (hasInterface)
					check_images(doc, doc.getElementById('field'), avatarsXml, getID, 3);
			});

			var loading = doc.getElementById('loading');
			var waitForInterface = function(ev) {
				loading.removeEventListener('DOMCharacterDataModified', waitForInterface, false);
				loading.removeEventListener('DOMSubtreeModified', waitForInterface, false);
				loading.removeEventListener('DOMNodeInserted', waitForInterface, false);
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
					// invoke our injected script which changes the webpage's script variables
					//swapPositionsLink.setAttribute('onclick', 'javascript:ft_swap_positions();');
					swapPositionsLink.textContent =
						Foxtrick.L10n.getString('matchOrder.swapPositions');
					swapPositionsDiv.appendChild(swapPositionsLink);
					var formations = doc.getElementById('formations');
					formations.parentNode.insertBefore(swapPositionsDiv, formations.nextSibling);
					Foxtrick.util.inject.js(doc, "document.getElementById('ft_swap_positions')" +
											".addEventListener('click', function() {" +
											"ft_swap_positions();" +
											"}, false);");
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
					Foxtrick.util.inject.js(doc, "document.getElementById('ft_clear_penalty_takers')" +
											".addEventListener('click', function() {" +
											"ft_clear_penalty_takers();" +
											"}, false);");
				}

				if (Foxtrick.Prefs.isModuleOptionEnabled('MatchOrderInterface', 'StayOnPage')) {
					// use our injected script to changes the webpage's script after action url
					//doc.getElementById('send').setAttribute('onclick',
					//                                        'javascript:ft_stay_on_page()');
					Foxtrick.util.inject.js(doc, "document.getElementById('send')" +
											".addEventListener('click', function() {" +
											"ft_stay_on_page();" +
											"}, false);");
				}
				if (Foxtrick.Prefs.isModuleOptionEnabled('MatchOrderInterface',
				    'FixPenaltyTakers')) {
					//var penaltiesLink = doc.querySelector('#li_tab_subs + li > a');
					//penaltiesLink.setAttribute('onclick', 'javascript:ft_fix_penalty_takers();');
					Foxtrick.util.inject.js(doc, "document.querySelector('#li_tab_subs + li > a')" +
											".addEventListener('click', function() {" +
											"ft_fix_penalty_takers();" +
											"}, false);");
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
				Foxtrick.addMutationEventListener(details, 'DOMNodeInserted',
				  function(ev) {
					//Foxtrick.log('details change');
					if (hasPlayerInfo) {
						if (Foxtrick.Prefs.isModuleOptionEnabled('MatchOrderInterface',
						    'DisplayLastMatchInDetails'))
							addLastMatchtoDetails();
						if (Foxtrick.Prefs.isModuleEnabled('LoyaltyDisplay'))
							injectLoyaltyBars();
					}
				}, false);

				var list = doc.getElementById('list');
				Foxtrick.addMutationEventListener(list, 'DOMNodeInserted',
				  function(ev) {
					//Foxtrick.log('list change');
					if (hasPlayerInfo)
						showPlayerInfo(list);
					if (hasAvatars)
						check_images(doc, list, avatarsXml, getID, 3);
				}, false);

				var fieldplayers = doc.getElementById('fieldplayers');
				Foxtrick.addMutationEventListener(fieldplayers, 'DOMNodeInserted',
				  function(ev) {
					//Foxtrick.log('fieldplayers change');
					if (hasPlayerInfo)
						showPlayerInfo(fieldplayers);
					if (hasAvatars)
						check_images(doc, fieldplayers, avatarsXml, getID, 3);
				}, false);

				var tab_subs = doc.getElementById('tab_subs');
				Foxtrick.addMutationEventListener(tab_subs, 'DOMNodeInserted',
				  function(ev) {
					//Foxtrick.log('tab_subs change');
					if (hasPlayerInfo)
						showPlayerInfo(tab_subs);
					if (hasAvatars)
						check_images(doc, tab_subs, avatarsXml, getID, 3);

					runAddCloneButtons();
				}, false);

				var tab_penaltytakers = doc.getElementById('tab_penaltytakers');
				Foxtrick.addMutationEventListener(tab_penaltytakers, 'DOMNodeInserted',
				  function(ev) {
					//Foxtrick.log('tab_penaltytakers change');
					if (hasPlayerInfo)
						showPlayerInfo(tab_penaltytakers);
					if (hasAvatars)
						check_images(doc, tab_penaltytakers, avatarsXml, getID, 3);
				}, false);
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
					//players aren't send with the document, but the addMutationEventListeners
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

/*			loading.addEventListener('DOMCharacterDataModified', waitForInterface, false);
			loading.addEventListener('DOMSubtreeModified', waitForInterface, false);
			loading.addEventListener('DOMNodeInserted', waitForInterface, false);
*/
			doc.addEventListener('interface_ready', function(e) {
				Foxtrick.log('interface ready: ', doc.getElementById('tab_penaltytakers')
				             .getElementsByTagName('div').length !== 0);
				waitForInterface();
			}, false);
			if (Foxtrick.platform == 'Opera')
				waitForInterface();
		};

		var isYouth = (doc.location.href.search(/isYouth=true|SourceSystem=Youth/i) != -1);
		if (Foxtrick.isPage(doc, 'matchOrder')) {
			runMatchOrder(doc);
			Foxtrick.util.inject.jsLink(doc, Foxtrick.InternalPath + 'resources/js/matchOrder.js');
		}
		else if (Foxtrick.isPage(doc, 'matchLineup'))
			runMatchLineup(doc);
	}
};
