'use strict';
/**
 * staff-marker.js
 * Foxtrick forum staff (HT, GM, Mod, CHPP, LA) marker
 * @author bummerland, ryanli, LA-MJ, CHPP-teles, CatzHoek
 */

Foxtrick.modules['StaffMarker'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forumViewThread', 'forumWritePost', 'teamPage'],
	NICE: 11, // after team-popup-links
	OPTIONS: [
		'officials',
		'editor',
		'foxtrick',
		'chpp-contributors',
		'chpp-holder',
		'supporters',
		'coach',

		'manager',
		'own'
	],
	OPTION_EDITS: true,
	OPTION_EDITS_DISABLED_LIST: [
		true,
		true,
		true,
		true,
		true,
		true,
		true,

		true,
		false
	],

	CSS: Foxtrick.InternalPath + 'resources/css/staff-marker.css',

	// [type1, type2,.. typeN, option]
	// or type when type=option
	// where type is type in json
	type_map: [
		'officials',
		'editor',
		'foxtrick',
		['htls', 'hy', 'chpp-contributors'],
		'chpp-holder',
		['supporter', 'supported', 'supporters'],
		'coach',
	],

	// placeholder for StaffMarker.type strings
	title_map: {},

	// [file1, file2,.. fileN, type]
	// or file when file=type
	file_map: [
		// no file for officials
		'editor',
		'foxtrick',
		'htls', 'hy',
		'chpp-holder',
		// supporters use custom scheme
		['nt', 'u20', 'coach'],
	],

	// functions called for each type
	type_callback_map: {
		'chpp-holder': function(obj) {
			obj['chpp-holder']['apps'] = {};
		},
		'coach': function(obj) {
			if (typeof obj['coach']['nts'] === 'undefined')
				obj['coach']['nts'] = {};
		},
	},

	// functions called for each user by type
	user_callback_map: {
		'chpp-holder': function(obj, user) {
			obj['chpp-holder']['apps'][user.id] = user.appNames;
		},
		'coach': function(obj, user) {
			obj['coach']['nts'][user.id] = {
				leagueId: user.LeagueId,
				name: user.TeamName,
				teamId: user.TeamId
			};
		},
	},

	// functions called for the marked object by type
	// if an element is returned it will be appended instead of default icon
	object_callback_map: {
		'chpp-holder': function(data, id, object, icon, link) {
			var appNames = '';
			Foxtrick.map(function(appName) {
				appNames = appNames + ' \n● ' + appName;
			}, data['chpp-holder']['apps'][id]);
			icon.title = icon.title + appNames;
			icon.alt = icon.alt + appNames;
		},
		'coach': function(data, id, object, icon, link) {
			var nt = data['coach']['nts'][id];
			var title = icon.title.replace(/%s/, nt.name);
			var url = '/Club/NationalTeam/NationalTeam.aspx?teamId=' + nt.teamId;
			var flagImg = Foxtrick.util.id
				.createFlagFromLeagueId(object.ownerDocument, nt.leagueId, url, title);
			Foxtrick.addClass(flagImg, 'ft-no-popup');
			return flagImg;
		},
	},

	getTitle: function(type, duty) {
		var str = 'StaffMarker.' + type + (duty ? '.' + duty : '');
		return Foxtrickl10n.isStringAvailable(str) ? Foxtrickl10n.getString(str) : null;
	},

	// parse enable map
	getEnabledTypes: function() {
		var enable = {}, m = this.type_map;
		for (var i = 0, t; i < m.length && (t = m[i]); i++) {
			if (typeof t === 'string') {
				enable[t] = FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', t);
				this.title_map[t] = this.getTitle(t);
			}
			else {
				var superTypeEnabled = FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', t[t.length-1]);
				for (var j = 0, e; j < t.length && (e = t[j]); ++j) {
					enable[e] = superTypeEnabled;
					this.title_map[e] = this.getTitle(e);
				}
			}
		}
		return enable;
	},

	hasLoadedOnce: false,

	init: function() {
		Foxtrick.sessionSet('staff-marker-reset', true);
		Foxtrick.log('Initialisation started: staff-marker needs a reset');
	},

	// get staffs
	load: function(doc) {
		var module = this;
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
				if (typeof obj[key] === 'undefined')
					obj[key] = {};

				if (parsed['url']) {
					obj[key]['url'] = parsed['url'];
				}

				if (typeof parsed['duties'] !== 'undefined') {
					obj[key]['hasDuties'] = true;
					obj[key]['duties'] = parsed['duties'];
					if (typeof obj[key]['duty'] === 'undefined')
						obj[key]['duty'] = {};
				}

				var type_func = module.type_callback_map[key];
				if (typeof type_func === 'function')
					type_func(obj);

				var user_func = module.user_callback_map[key];

				Foxtrick.map(function(user) {
					obj[key][user.id] = true;
					if (obj[key]['hasDuties'] && user.duty !== 'undefined') {
						obj[key]['duty'][user.id] = user.duty;
					}
					if (typeof user_func === 'function')
						user_func(obj, user);
				}, list);
			}
			// all your data are belong to us
			if (--todo == 0) {
				Foxtrick.sessionSet('staff-marker-data.' +
									Foxtrick.modules['Core'].getSelfTeamInfo().teamId, obj);
				Foxtrick.log('Staff marker data loaded.');

				// at start run() is performed without data
				// then load() is done and data are available
				// we try a new run() just after
				// but only once in order to avoid too many loop
				// if things get weird, it will be displayed next page load
				if (Foxtrick.modules.StaffMarker.hasLoadedOnce == false) {
					Foxtrick.modules.StaffMarker.hasLoadedOnce = true;
					Foxtrick.modules.StaffMarker.run(doc);
				}
			}
		};

		var obj = {}, uris = [];
		// JSON files to be downloaded
		var enable = this.getEnabledTypes();
		var files = this.file_map;
		for (var i = 0, f; i < files.length && (f = files[i]); ++i) {
			if (typeof f === 'string') {
				if (enable[f])
					uris.push(Foxtrick.DataPath + 'staff/' + f + '.json');
			}
			else if (enable[f.pop()]) {
				for (var j = 0, e; j < f.length && (e = f[j]); ++j) {
					uris.push(Foxtrick.DataPath + 'staff/' + e + '.json');
				}
			}
		}
		// custom URLs
		if (enable['supporter']	&& Foxtrick.util.layout.isSupporter(doc)) {
			uris.push('supporter');
			uris.push('supported');
		}

		// counter of URI remaining to fetch
		var todo = uris.length;
		Foxtrick.map(function(uri) {
			if (uri == 'supporter' || uri == 'supported') {
				if (uri == 'supported')
					return;
				// no need to parse the file twice, but we need 2 uris :)

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
					var idsS = { type: 'supported', list: [] };
					var idsM = { type: 'supporter', list: [] };
					var teams = xml.getElementsByTagName('Team');
					for (var t = 0; t < teams.length; t++) {
						var team = teams[t];
						var sups = team.getElementsByTagName('SupportedTeams');
						for (var s = 0; s < sups.length; s++) {
							var sup = sups[s];
							var all = sup.getElementsByTagName('UserId');
							for (var i = 0; i < all.length; i++)
								idsS.list.push({ id: all[i].textContent });
						}
						sups = team.getElementsByTagName('MySupporters');
						for (s = 0; s < sups.length; s++) {
							sup = sups[s];
							all = sup.getElementsByTagName('UserId');
							for (i = 0; i < all.length; i++)
								idsM.list.push({ id: all[i].textContent });
						}
					}
					parseMarkers(JSON.stringify(idsS));
					parseMarkers(JSON.stringify(idsM));
				});
			} else {
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
		var module = this;
		Foxtrick.sessionGet('staff-marker-data.' + Foxtrick.modules['Core'].getSelfTeamInfo().teamId,
		  function(data) {
			Foxtrick.sessionGet('staff-marker-reset', function(reset) {
				if (!data || reset) {
					// get staffmarker and display on next load. didn't auto call run here to prevent
					// endless loop
					Foxtrick.sessionSet('staff-marker-reset', false);
					Foxtrick.log('Resetting staff-marker...');
					Foxtrick.modules.StaffMarker.load(doc);
					return;
				}

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
					if (enable['officials']) {
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
							Foxtrick.addClass(object, 'ft-staff-style ft-staff-' + first[1]);
						}
					}
					// data loaded from external files
					var img = doc.createElement('img');
					img.src = '/Img/Icons/transparent.gif';
					var type;

					for (type in data) {
						if (data[type][id] == true && enable[type] == true) {
							var icon = img.cloneNode(), link, element;
							Foxtrick.addClass(object, 'ft-staff-' + type);
							Foxtrick.addClass(icon, 'ft-staff-icon ft-staff-' + type);
							icon.title = icon.alt = module.title_map[type];
							var duty, dutyDesc;
							if (data[type]['hasDuties'] && (duty = data[type]['duty'][id]) &&
								(dutyDesc = data[type]['duties'][duty])) {
								icon.title = icon.alt = module.getTitle(type, duty) || dutyDesc.alt || '';
								if (dutyDesc.url) {
									icon.setAttribute('style', 'background-image: url("' +
													  dutyDesc.url.replace(/chrome:\/\/foxtrick\/content\//,
																		   Foxtrick.ResourcePath) +
													  '");');
								}

							}
							var url;
							if (url = data[type]['url']) {
								link = doc.createElement('a');
								url = url.replace(/\[id\]/, id);
								link.target = '_blank';
								link.href = url;
								Foxtrick.addClass(link, 'ft-no-popup');
								link.appendChild(icon);
								element = link;
							}
							else
								element = icon;

							var obj_func = module.object_callback_map[type];
							if (typeof obj_func === 'function') {
								var newElement = obj_func(data, id, object, icon, link);
								if (typeof newElement !== 'undefined')
									element = newElement;
							}
							object.insertBefore(element, object.firstChild);
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

				var enable = module.getEnabledTypes();

				if (Foxtrick.isPage(doc, 'forumViewThread') || Foxtrick.isPage(doc, 'forumWritePost')) {
					markThread(doc, modifier);
					markSelect(doc, modifier);
				}
				else if (Foxtrick.isPage(doc, 'teamPage') && FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'manager')) {
					markThread(doc, modifier);
				}
			});
		});
	}
};
