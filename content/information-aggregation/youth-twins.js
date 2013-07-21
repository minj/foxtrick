'use strict';
/* youth-twins.js
 * Displays twin information for youth squad players using an API supplied by HY.
 * @author CatzHoek, LA-MJ, HY backend/API by MackShot
 */


Foxtrick.modules['YouthTwins'] = {


	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['youthPlayers'],
	OPTIONS: ['HideInfoLink'],
	CSS: Foxtrick.InternalPath + 'resources/css/youth-twins.css',
	run: function(doc) {
		var ignoreHours = 24;

		if (!Foxtrick.isPage(doc, 'ownYouthPlayers'))
			return;

		var getYouthPlayerList = function(teamId, callback) {
			var args = [];
			args.push(['file', 'youthplayerlist']);
			args.push(['youthTeamID', teamId]);
			args.push(['actionType', 'details']);
			args.push(['showScoutCall', true]);
			args.push(['version', '1.0']);
			Foxtrick.util.api.retrieve(doc, args, { cache_lifetime: 'session' }, callback);
		};
		var getYouthAvatars = function(teamId, callback) {
			var args = [];
			args.push(['file', 'youthavatars']);
			args.push(['version', '1.1']);
			args.push(['youthTeamID', teamId]);
			Foxtrick.util.api.retrieve(doc, args, { cache_lifetime: 'session'}, callback);
		};

		var getUtcFromTimestamp = function(ts) {
			var date = new Date();
			date.setTime(ts);
			return date.toUTCString();
		};

		//icons resources for representation
		var icon_green = Foxtrick.InternalPath + 'resources/img/twins/twin.png';
		var icon_red = Foxtrick.InternalPath + 'resources/img/twins/twin_red.png';
		var icon_yellow = Foxtrick.InternalPath + 'resources/img/twins/twin_yellow.png';

		//params
		//teamid: Current Foxtrick user
		//forceUpdate: Force HY to update, avoid!
		//debug: Fakes a reponse where twins will be present
		//callback: function to be called after HY was queried
		var getTwinsFromHY = function(teamid, forceupdate, debug, userType, callback) {
			getYouthPlayerList(teamid, function(playerlist) {
				if (!playerlist || !playerlist.getElementsByTagName('YouthPlayer')) {
					Foxtrick.log('[ERROR] YouthTwins: no playerlist');
					return;
				}
				getYouthAvatars(teamid, function(avatars) {
					if (!avatars || !avatars.getElementsByTagName('YouthPlayer')) {
						Foxtrick.log('[ERROR] YouthTwins: no avatars');
						return;
					}
					//urlencode xml files
					var pl = encodeURIComponent((new window.XMLSerializer())
					                            .serializeToString(playerlist));
					var av = encodeURIComponent((new window.XMLSerializer())
					                            .serializeToString(avatars));

					//api url
					var url = 'http://www.hattrick-youthclub.org' +
						'/_data_provider/foxtrick/playersTwinsCheck';

					//assemble param string
					var params = 'players=' + pl + '&avatars=' + av;

					//forceUpdate to avoid getting the cached HY response, use carefully
					if (forceupdate)
						params = params + '&forceUpdate=1';

					//debug: Generates a random reponse where twins will be present
					if (debug)
						params = params + '&debug=1';

					//ability to fake if the user is a hy user or not,
					//influeces response of 'marked and non'
					if (userType == 'user')
						params = params + '&isHyUser=1';
					else if (userType == 'foreigner')
						params = params + '&isHyUser=0';
					else {
						//HY determines on its own
					}
					// load and callback
					Foxtrick.api.hy.getYouthTwins(function(json) {
						// update the userId on _real_ successful request
						// therefore need to use the request time, not current time
						// avoids stale cache in case user joins/leaves HY
						var userId = json.userId;
						if (typeof(userId) == 'number') {
							var then = json.fetchTime * 1000; // JS vs PHP
							var teamId = Foxtrick.modules['Core'].getSelfTeamInfo().teamId;
							Foxtrick.localGet('YouthClub.' + teamId + '.userId.fetchTime',
							  function (saved) {
								if (saved >= then)
									return;
								Foxtrick.log('[HY_API][playersTwinsCheck] updating userId cache:',
											 userId, then);
								Foxtrick.localSet('YouthClub.' + teamId + '.userId',
												  JSON.stringify(userId));
								Foxtrick.localSet('YouthClub.' + teamId + '.userId.fetchTime', then);
							});
						}
						// proceed as normally
						callback(json);
					}, params);
				});
			});
		};
		var handleHyResponse = function(json) {

			var isHYuser = Foxtrick.api.hy.isUserId(json.userId);
			var playerInfos = doc.getElementsByClassName('playerInfo');
			for (var i = 0; i < playerInfos.length; i++) {
				var playerInfo = playerInfos[i];

				//find spot to place the images
				var target = playerInfo.getElementsByTagName('b')[0];

				//get playerid
				var playerID = playerInfo.getElementsByTagName('a')[0].href
					.match(/YouthPlayerID=(\d+)/i)[1];

				//new player pulled, needs a forceUpdate
				if (json.players[playerID] === undefined) {
					Foxtrick.log('YouthTwins: New player pulled', playerID);
					continue;
				}

				//amounts of twins by category, for non hattrick youthclub users
				//marked and non are not present by api definition
				var possible = parseInt(json.players[playerID].possible, 10);
				var marked = isHYuser ? parseInt(json.players[playerID].marked, 10) : 0;
				var non = isHYuser ? parseInt(json.players[playerID].non, 10) : 0;
				var missing = possible - marked - non;

				//l10n strings
				var l10n_possible_twins = Foxtrickl10n.getString('YouthTwins.possibleTwins',
				                                                 possible).replace('%1', possible);
				var l10n_marked_twins = Foxtrickl10n
					.getString('YouthTwins.markedTwins').replace('%1', marked);
				var l10n_non_twins = Foxtrickl10n
					.getString('YouthTwins.nonTwins').replace('%1', non);
				var l10n_undecided_twins = Foxtrickl10n
					.getString('YouthTwins.undecidedTwins').replace('%1', missing);
				var l10n_non_hy_user = Foxtrickl10n.getString('YouthTwins.nonHyUser');

				//assemble title
				if (isHYuser)
					var title = ' ' + l10n_possible_twins + '\n ' + l10n_marked_twins + '\n ' +
						l10n_non_twins + '\n ' + l10n_undecided_twins;
				else
					var title = ' ' + l10n_possible_twins + '\n ' + l10n_non_hy_user;

				//repeat twin icon in representative color according to amount of twin category
				var link =
					Foxtrick.createFeaturedElement(doc, Foxtrick.modules['YouthTwins'], 'a');
				var container =
					Foxtrick.createFeaturedElement(doc, Foxtrick.modules['YouthTwins'], 'span');
				Foxtrick.addClass(container, 'ft-youth-twins-container');
				container.setAttribute('title', title);
				container.setAttribute('alt', title);

				//add icons according to amount of occurance
				var addIcons = function(parent, limit, alt, className, src) {
					for (var k = 0; k < limit; k++) {
						Foxtrick.addImage(doc, parent, { alt: alt, class: className, src: src});
					}
				};
				addIcons(container, marked, l10n_marked_twins, 'ft-youth-twins-icon', icon_green);
				addIcons(container, missing, l10n_undecided_twins,
				         'ft-youth-twins-icon', icon_yellow);
				addIcons(container, non, l10n_non_twins, 'ft-youth-twins-icon', icon_red);

				link.appendChild(container);

				//link destinations as Mackshot from HY requested
				if (isHYuser)
					link.setAttribute('href',
					                  'http://www.hattrick-youthclub.org/site/players_twins');
				else
					link.setAttribute('href',
					                  'http://www.hattrick-youthclub.org');

				link.setAttribute('target', '_blank');

				if (possible > 0 &&
				    !FoxtrickPrefs.isModuleOptionEnabled('YouthTwins','HideInfoLink')) {
					//and a neat info button
					var infolink =
						Foxtrick.createFeaturedElement(doc, Foxtrick.modules['YouthTwins'], 'a');
					Foxtrick.addClass(infolink, 'ft-youth-twins-info');
					infolink.href = 'http://www.hattrick-youthclub.org/site/wiki-player_twins';
					infolink.target = '_blank';
					var infotext = Foxtrickl10n.getString('YouthTwins.infoText');
					target.parentNode.insertBefore(infolink, target.nextSibling);
					Foxtrick.addImage(doc, infolink,
					                  { alt: infotext, title: infotext, src: '/Img/Icons/info.png' }
					);
				}
				//add the whole stuff to the site
				target.parentNode.insertBefore(link, target.nextSibling);
			}
		};

		//teamid for chpp playerList
		var teamid = doc.location.href.match(/teamid=(\d+)/i)[1];
		getTwinsFromHY(teamid, false, false, 'auto', handleHyResponse);

	}
};
