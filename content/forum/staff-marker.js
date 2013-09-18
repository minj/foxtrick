'use strict';
/**
 * staff-marker.js
 * Foxtrick forum staff (HT, GM, Mod, CHPP, LA) marker
 * @author bummerland, ryanli
 */

Foxtrick.modules['StaffMarker'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forumViewThread', 'forumWritePost', 'teamPage'],
	OPTIONS: [
		'officials', 'editors', 'foxtrick',
		'chpp.contributors', 'chpp.holders',
		'supporters', 'nationalCoaches',
		'manager', 'own'
	],
	OPTION_EDITS: true,
	OPTION_EDITS_DISABLED_LIST: [true, true, true, true, true, true, true, true, false],

	CSS: Foxtrick.InternalPath + 'resources/css/staff-marker.css',

	hasLoadedOnce: false,

	// get staffs
	load: function(doc) {
		var parseMarkers = function(text) {
			try {
				var parsed = JSON.parse(text);
			}
			catch (e) {
				// JSON.parse failed
				Foxtrick.log('Cannot parse file from: ', text);
			}
			if (parsed) {
				var key = parsed['type'];
				var list = parsed['list'];
				// add them!
				obj[key] = {};
				if (key == 'chpp-holder')
					obj[key]['apps'] = {};
				else if (key == 'coach')
					obj[key]['nts'] = {};
				Foxtrick.map(function(user) {
					obj[key][user.id] = true;
					if (key == 'chpp-holder')
						obj[key]['apps'][user.id] = user.appNames;
					else if (key == 'coach') {
						obj[key]['nts'][user.id] = { leagueId: user.LeagueId, name: user.TeamName };
					}
				}, list);
			}
			// all your data are belong to us
			if (--todo == 0) {
				Foxtrick.sessionSet('staff-marker-data', obj);
				Foxtrick.log('Staff marker data loaded.');

				// at start run() is performed without data
				// then load() is done and data are available
				// we try a new run() just after
				// but only once in order to avoid too many loop
				// if things get weird, it will be displayed next page load
				if(Foxtrick.modules.StaffMarker.hasLoadedOnce == false) {
					Foxtrick.modules.StaffMarker.hasLoadedOnce = true;
					Foxtrick.modules.StaffMarker.run(doc);
				}
			}
		};

		var obj = {}, uris = [];
		// JSON files to be downloaded
		if (FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'foxtrick')) {
			uris.push(Foxtrick.DataPath + 'staff/foxtrick.json');
		}
		if (FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'chpp.holders')) {
			uris.push(Foxtrick.DataPath + 'staff/chpp.json');
		}
		if (FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'editors')) {
			uris.push(Foxtrick.DataPath + 'staff/editor.json');
		}
		if (FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'chpp.contributors')) {
			uris.push(Foxtrick.DataPath + 'staff/hy.json');
			uris.push(Foxtrick.DataPath + 'staff/htls.json');
		}
		if (FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'supporters')
			&& Foxtrick.util.layout.isSupporter(doc)) {
			uris.push('supporter');
			uris.push('supported');
		}
		if (FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'nationalCoaches')) {
			uris.push(Foxtrick.DataPath + 'staff/ntcoaches.json');
			uris.push(Foxtrick.DataPath + 'staff/u20coaches.json');
		}

		// counter of URI remaining to fetch
		var todo = uris.length;
		Foxtrick.map(function(uri) {
			if(uri == 'supporter' || uri == 'supported') {
				if(uri == 'supported') return; // no need to parse the file twice, but we need 2 uri :)
				Foxtrick.util.api.retrieve(doc, [
					['file', 'teamdetails'],
					['version', '2.9'],
					['teamId', Foxtrick.util.id.getOwnTeamId()],
					['includeSupporters', 'true']
				  ],
				  { cache_lifetime: 'session' },
				  function(xml, errorText) {
					if (errorText) {
						Foxtrick.log(errorText);
						return;
					}
					var idsS = {type:'supported', list: []}, idsM = {type:'supporter', list: []};
					var teams = xml.getElementsByTagName('Team');
					for(var t=0; t<teams.length; t++) {
						var team = teams[t];
						var sups = team.getElementsByTagName('SupportedTeams');
						for(var s=0; s<sups.length; s++) {
							var sup = sups[s];
							var all = sup.getElementsByTagName('UserId');
							for(var i=0; i<all.length; i++)
							 idsS.list.push({id: all[i].textContent});
						}
						sups = team.getElementsByTagName('MySupporters');
						for(s=0; s<sups.length; s++) {
							sup = sups[s];
							all = sup.getElementsByTagName('UserId');
							for(i=0; i<all.length; i++)
							idsM.list.push({id: all[i].textContent});
						}
					}
					parseMarkers(JSON.stringify(idsS));
					parseMarkers(JSON.stringify(idsM));
				});
			} else {
				// counter of URI remaining to fetch
				Foxtrick.util.load.get(uri)('success',
				  function(text) {
					Foxtrick.log('parse ', uri);
					parseMarkers(text);
					Foxtrick.localSet('Markers.' + uri, text);
				})('failure', function(code) {
					Foxtrick.log('Failure loading file: ' + uri, '. Using cached markers.');
					Foxtrick.localGet('Markers.' + uri, parseMarkers);
				});
			}
		}, uris);

	},

	run: function(doc) {
		Foxtrick.sessionGet('staff-marker-data', function(data) {
			if (!data) {
				// get staffmarker and display on next load. didn't auto call run here to prevent
				// endless loop
				Foxtrick.modules.StaffMarker.load(doc);
				return;
			}

			var coachTitle = Foxtrickl10n.getString('StaffMarker.coachTitle');

			// getting user-defined IDs and colors
			var customMarker = {};
			if (FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'own')) {
				var customText = FoxtrickPrefs.getString('module.StaffMarker.own_text');
				try {
					customMarker = JSON.parse(customText);
				}
				catch (e) {
					Foxtrick.log('JSON parse error: ', customText);
				}
			}
			// tell whether user is staff by id or alias,
			// and attach class and/or user-defined style to object
			var modifier = function(id, alias, object) {
				// user-defined style
				if (customMarker[id] !== undefined)
					object.setAttribute('style', customMarker[id]);
				// exclusive classes for official staffs
				if(enable['officials']) {
					// alias in select boxes might have a Left-to-Right
					// Overwrite (LRO, U+202D) in front
					var markers = [
						[/^\u202d?HT-/i, 'ht'],
						[/^\u202d?GM-/i, 'gm'],
						[/^\u202d?Mod-/i, 'mod'],
						[/^\u202d?CHPP-/i, 'chpp'],
						[/^\u202d?LA-/i, 'la']
					];
					var first = Foxtrick.nth(0, function(pair) {
						return alias.search(pair[0]) == 0;
					}, markers);
					if (first) {
						Foxtrick.addClass(object, 'ft-staff-' + first[1]);
					}
				}
				// data loaded from external files
				var type;
				for (type in data) {
					if (data[type][id] == true && enable[type] == true) {
						Foxtrick.addClass(object, 'ft-staff-' + type);
						if (type == 'chpp-holder') {
							var appNames = '';
							Foxtrick.map(function(appName) {
								appNames = appNames + ' \n● ' + appName;
							}, data[type]['apps'][id]);
							if (object.getAttribute('title'))
								object.setAttribute('title', object.getAttribute('title') +
													appNames);
							else
								object.setAttribute('title', object.textContent.match(/\S+/)[0] +
													appNames);
						}
						else if (type == 'coach') {
							var nt = data[type]['nts'][id];
							var title = coachTitle.replace(/%s/, nt.name);
							var flagImg = Foxtrick.util.id
								.createFlagFromLeagueId(doc, nt.leagueId, null, title, true);
							object.insertBefore(flagImg, object.firstChild);
						}
					}
				}
			};

			// mark staffs in thread
			var markThread = function() {
				var userDivs = doc.getElementById('mainBody').parentNode
					.getElementsByClassName('float_left');
				Foxtrick.map(function(user) {
					var links = user.getElementsByTagName('a');
					Foxtrick.map(function(a) {
						if (!a.href) return; // eg our copy link
						if (a.getAttribute('href').search(/\/Club\/Manager\/\?userId\=/i) == -1
							|| a.getAttribute('href').search(/redir_to_league=true/i) != -1)
							return;
						var uname = Foxtrick.trim(a.title);
						var uid = a.href.replace(/.+userId=/i, '').match(/^\d+/);
						modifier(uid, uname, a);
					}, links);
				}, userDivs);
			};
			// mark staffs in select box
			var markSelect = function() {
				var selects = doc.getElementById('mainBody').parentNode
					.querySelectorAll('select.threadPagingFilter, select[id$="_ddlRecipient"]');
				Foxtrick.map(function(select) {
					// to avoid select box which don't contains users
					if (select.id.search(/filter/i) == -1
						&& select.id.search(/recipient/i) == -1)
						return;

					var css = '';
					var i = 1;
					var user_hasClass = {};
					var option;
					while (option = select.options[i++]) {
						var uname = Foxtrick.trim(option.textContent);
						if (uname == '')
							break;
						var uid = option.value.replace(/by_|to_/gi, '');

						modifier(uid, uname, option);
						// no background image in chrome for select. background-colors only

						// special colors for options which are not users in filter select box
						if (option.value == -3) {
							Foxtrick.addClass(option, 'ft-staff-seperator');
						}
						else if (option.value == 'by_-1') {
							Foxtrick.addClass(option, 'ft-staff-official');
						}
					}
				}, selects);
			};

			var enable = {};
			enable['officials'] = FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'officials');
			enable['editor'] = FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'editors');
			enable['foxtrick'] = FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'foxtrick');
			enable['htls'] = enable['hty'] = FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'chpp.contributors');
			enable['chpp-holder'] = FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'chpp.holders');
			enable['supporter'] = enable['supported'] = FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'supporters');
			enable['coach'] = FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'supporters');

			if (Foxtrick.isPage(doc, 'forumViewThread') || Foxtrick.isPage(doc, 'forumWritePost')) {
				markThread(doc, modifier);
				markSelect(doc, modifier);
			}
			else if (Foxtrick.isPage(doc, 'teamPage') && FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'manager')) {
				markThread(doc, modifier);
			}
		});
	}
};
