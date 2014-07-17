'use strict';
/**
 * staff-marker.js
 * Foxtrick forum staff (HT, GM, Mod, CHPP, LA) marker
 * @author bummerland, ryanli, LA-MJ, CHPP-teles, CatzHoek
 */

Foxtrick.modules['StaffMarker'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: [
		'forumViewThread', 'forumWritePost',
		'teamPage', 'guestbook', 'supported', 'supporters', 'series' // grouped by if/else
	],
	OPTIONS: [
		'officials',
		'editor',
		'foxtrick',
		'chpp-contributors',
		'chpp-holder',
		'supporters',
		'coach',

		'manager',
		'own',
		'forumInterface'
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
		false,
		true
	],

	CSS: Foxtrick.InternalPath + 'resources/css/staff-marker.css',

	// [option, type1, type2,.. typeN]
	// or type when type=option
	// where type is type in json
	type_map: [
		'officials',
		'editor',
		'foxtrick',
		['chpp-contributors', 'htls', 'hy', 'ho'],
		'chpp-holder',
		['supporters', 'supporter', 'supported'],
		'coach',
	],

	// placeholder for StaffMarker.type strings
	title_map: {},

	// [type, file1, file2,.. fileN]
	// or file when file=type
	file_map: [
		// no file for officials
		'editor',
		'foxtrick',
		'htls', 'hy', 'ho',
		'chpp-holder',
		// supporters use custom scheme
		['coach', 'nt', 'u20'],
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
	// if false is returned the element is not appended
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
			var flagLink = Foxtrick.util.id
				.createFlagFromLeagueId(object.ownerDocument, nt.leagueId, url, title);
			Foxtrick.addClass(flagLink, 'ft-no-popup');
			flagLink.target = '_blank';
			return flagLink;
		},
		'supporter': function(data, id, object, icon, link) {
			var doc = object.ownerDocument;
			if (Foxtrick.isPage(doc, 'supported') || Foxtrick.isPage(doc, 'supporters'))
				return false;
			return true;
		},
		'supported': function(data, id, object, icon, link) {
			var doc = object.ownerDocument;
			if (Foxtrick.isPage(doc, 'supported') || Foxtrick.isPage(doc, 'supporters'))
				return false;
			return true;
		},
	},

	getTitle: function(type, duty) {
		var str = 'StaffMarker.' + type + (duty ? '.' + duty : '');
		return Foxtrick.L10n.isStringAvailable(str) ? Foxtrick.L10n.getString(str) : null;
	},

	// parse enable map
	getEnabledTypes: function() {
		var enable = {}, m = this.type_map;
		for (var i = 0, t; i < m.length && (t = m[i]); i++) {
			if (typeof t === 'string') {
				enable[t] = Foxtrick.Prefs.isModuleOptionEnabled('StaffMarker', t);
				this.title_map[t] = this.getTitle(t);
			}
			else {
				var superTypeEnabled = Foxtrick.Prefs.isModuleOptionEnabled('StaffMarker', t[0]);
				for (var j = 1, e; j < t.length && (e = t[j]); ++j) {
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
				if (module.hasLoadedOnce == false) {
					module.hasLoadedOnce = true;
					module.run(doc);
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
			else if (enable[f[0]]) {
				for (var j = 1, e; j < f.length && (e = f[j]); ++j) {
					uris.push(Foxtrick.DataPath + 'staff/' + e + '.json');
				}
			}
		}
		// custom URLs
		if (enable['supporter'] && Foxtrick.util.layout.isSupporter(doc)) {
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

				if (!Foxtrick.Prefs.getBool('xmlLoad'))
					return;

				var TEAMS_PER_PAGE = 200;
				var teamId = Foxtrick.util.id.getOwnTeamId();
				var entry = doc.querySelector('#mainBody');
				var loading = Foxtrick.util.note.createLoading(doc);
				entry.insertBefore(loading, entry.firstChild);

				Foxtrick.util.api.retrieve(doc, [
					['file', 'teamdetails'],
					['version', '3.1'],
					['teamId', teamId],
					['includeSupporters', 'true']
				  ],
				  { cache_lifetime: 'session' },
				  function(xml, errorText) {
					if (!xml || errorText) {
						Foxtrick.log(errorText);
						return;
					}
					var batchArgs = [], supportedCt;
					var teams = xml.getElementsByTagName('Team');
					for (var t = 0; t < teams.length; t++) {
						var team = teams[t];
						var id = team.getElementsByTagName('TeamID')[0].textContent;
						var sups = team.getElementsByTagName('SupportedTeams')[0];
						supportedCt = parseInt(sups.getAttribute('TotalItems'), 10);
						sups = team.getElementsByTagName('MySupporters')[0];
						var supporterCt = parseInt(sups.getAttribute('TotalItems'), 10);
						var pageCt = Math.ceil(supporterCt / TEAMS_PER_PAGE);
						for (var p = 0; p < pageCt; p++) {
							batchArgs.push([
								['file', 'supporters'],
								['version', '1.0'],
								['teamId', parseInt(id, 10)], // use int for consistency (cache)
								['actionType', 'mysupporters'],
								['pageSize', TEAMS_PER_PAGE],
								['pageIndex', p],
							]);
						}
					}
					// supported teams are same for both teams so added once only
					var pageCt = Math.ceil(supportedCt / TEAMS_PER_PAGE);
					for (var p = 0; p < pageCt; p++) {
						batchArgs.push([
							['file', 'supporters'],
							['version', '1.0'],
							['teamId', teamId],
							['actionType', 'supportedteams'],
							['pageSize', TEAMS_PER_PAGE],
							['pageIndex', p],
						]);
					}
					Foxtrick.util.api.batchRetrieve(doc, batchArgs, { cache_lifetime: 'session' },
					  function(xmls, errors) {
						if (xmls) {
							var idsS = { type: 'supported', list: [] };
							var idsM = { type: 'supporter', list: [] };
							for (var x = 0; x < xmls.length; ++x) {
								var xml = xmls[x];
								var errorText = errors[x];
								if (!xml || errorText) {
									Foxtrick.log('No XML in batchRetrieve', batchArgs[x], errorText);
									continue;
								}
								var sup = xml.getElementsByTagName('MySupporters')[0];
								var list = idsM.list;
								if (!sup) {
									sup = xml.getElementsByTagName('SupportedTeams')[0];
									list = idsS.list;
								}

								var all = sup.getElementsByTagName('UserId');
								for (var i = 0; i < all.length; i++)
									list.push({ id: all[i].textContent });

							}
							parseMarkers(JSON.stringify(idsS));
							parseMarkers(JSON.stringify(idsM));
							loading.parentNode.removeChild(loading);
						}
					});
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
		if (Foxtrick.isPage(doc, 'forumViewThread') &&
			doc.getElementsByClassName('ft-staff-marker-opts').length === 0 &&
			Foxtrick.Prefs.isModuleOptionEnabled('StaffMarker', 'forumInterface'))
			this.addForumInterface(doc);

		Foxtrick.sessionGet('staff-marker-data.' + Foxtrick.modules['Core'].getSelfTeamInfo().teamId,
		  function(data) {
			Foxtrick.sessionGet('staff-marker-reset', function(reset) {
				if (!data || reset) {
					// get staffmarker and display on next load. didn't auto call run here to prevent
					// endless loop
					Foxtrick.sessionSet('staff-marker-reset', false);
					Foxtrick.log('Resetting staff-marker...');
					module.load(doc);
					return;
				}

				module.hasLoadedOnce = false;

				// getting user-defined IDs and colors
				var customMarker = {};
				if (Foxtrick.Prefs.isModuleOptionEnabled('StaffMarker', 'own')) {
					var customText = Foxtrick.Prefs.getString('module.StaffMarker.own_text');
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
						var first = Foxtrick.nth(function(pair) {
							return alias.search(pair[0]) == 0;
						}, markers);
						if (first) {
							Foxtrick.addClass(object, 'ft-staff ft-staff-style ft-staff-' +
							                  first[1]);
						}
					}
					// data loaded from external files
					var img = doc.createElement('img');
					img.src = '/Img/Icons/transparent.gif';
					var type;

					for (type in data) {
						if (data[type][id] == true && enable[type] == true) {
							var icon = img.cloneNode(), link, element;
							Foxtrick.addClass(object, 'ft-staff ft-staff-' + type);
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
							var include = true;
							if (typeof obj_func === 'function') {
								var newElement = obj_func(data, id, object, icon, link);
								if (typeof newElement !== 'undefined') {
									if (typeof newElement === 'boolean')
										include = newElement;
									else
										element = newElement;
								}
							}
							if (include)
								object.insertBefore(element, object.firstChild);
						}
					}
				};

				// mark staffs in thread
				var markThread = function() {
					//var userDivs = doc.getElementById('mainBody').parentNode
					//	.getElementsByClassName('float_left');
					var userDivs =
						doc.querySelectorAll('#mainBody .float_left, #sidebar, .mainBox, ' +
											 '#ctl00_ctl00_CPContent_CPMain_pnlSupportedTeams, ' +
											 '#ctl00_ctl00_CPContent_CPMain_pnlMySupporters, ' +
											 '#ctl00_ctl00_CPContent_CPMain_upGB');

					Foxtrick.map(function(user) {
						var links = user.getElementsByTagName('a');
						Foxtrick.map(function(a) {
							if (!a.href) return; // eg our copy link
							if (a.getAttribute('href').search(/\/Club\/Manager\/\?userId\=/i) == -1
								|| a.getAttribute('href').search(/redir_to_league=true/i) != -1)
								return;
							var uname = a.title.trim();
							var uid = a.href.replace(/.+userId=/i, '').match(/^\d+/);
							modifier(uid, uname, a);
						}, links);
					}, userDivs);
					if (Foxtrick.isPage(doc, 'guestbook')) {
						var id = 'ctl00_ctl00_CPContent_CPMain_upGB';
						var gb = doc.getElementById(id);
						Foxtrick.onChange(gb, function() {
							if (gb.getElementsByClassName('ft-staff').length)
								return;
							markThread();
						}, { subtree: false });
					}
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
							var uname = option.textContent.trim();
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

				if (Foxtrick.isPage(doc, 'forumViewThread') ||
				    Foxtrick.isPage(doc, 'forumWritePost')) {
					markThread(doc, modifier);
					Foxtrick.modules['ForumAlterHeaderLine'].ensureUnbrokenHeaders(doc);
					markSelect(doc, modifier);
				}
				else if (Foxtrick.Prefs.isModuleOptionEnabled('StaffMarker', 'manager')) {
					markThread(doc, modifier);
				}
			});
		});
	},
	addForumInterface: function(doc) {
		var module = this;
		var markUser = Foxtrick.L10n.getString('StaffMarker.userColor');
		var fgColor = Foxtrick.L10n.getString('StaffMarker.textColor');
		var bgColor = Foxtrick.L10n.getString('StaffMarker.bgColor');
		var saveText = Foxtrick.L10n.getString('button.save');
		var closeText = Foxtrick.L10n.getString('button.close');
		var resetText = Foxtrick.L10n.getString('button.reset');

		var customMarker = {};
		var customText = Foxtrick.Prefs.getString('module.StaffMarker.own_text');
		try {
			customMarker = JSON.parse(customText);
		}
		catch (e) {
			Foxtrick.log('StaffMarker.own_text JSON parse error: ', customText);
		}
		var elems = doc.getElementsByClassName('cfWrapper');
		for (var i = 0; i < elems.length; i++) {
			var cfHeader = elems[i].getElementsByClassName('cfHeader')[0];
			if (!cfHeader)
				continue;
			var userId = Foxtrick.util.id.findUserId(cfHeader);
			var userName = cfHeader.querySelector('a[href*="' + userId + '"][title]').title;
			if (userName.match(/^(GM|LA|HT|CHPP|Mod)-/i))
				// custom coloring for staff is not feasible due to CSS cascading issues
				continue;
			var cfFooter = elems[i].getElementsByClassName('cfFooter')[0];
			var markerOptions = Foxtrick.createFeaturedElement(doc, module, 'div');
			markerOptions.id = 'ft-staff-marker-opts-' + i;
			Foxtrick.addClass(markerOptions, 'ft-staff-marker-opts hidden');
			var fgLabel = doc.createElement('label');
			fgLabel.textContent = fgColor;
			fgLabel.setAttribute('for', 'ft-staff-marker-fg-' + i);
			markerOptions.appendChild(fgLabel);
			markerOptions.appendChild(doc.createTextNode('\u00a0'));
			var fg = doc.createElement('input');
			fg.id = 'ft-staff-marker-fg-' + i;
			fg.setAttribute('size', 7);
			fg.setAttribute('type', 'color');
			fg.value = '';
			var colorSupported = !!fg.value;
			markerOptions.appendChild(fg);
			markerOptions.appendChild(doc.createTextNode('\u00a0'));
			var bgLabel = doc.createElement('label');
			bgLabel.textContent = bgColor;
			bgLabel.setAttribute('for', 'ft-staff-marker-bg-' + i);
			markerOptions.appendChild(bgLabel);
			markerOptions.appendChild(doc.createTextNode('\u00a0'));
			var bg = doc.createElement('input');
			bg.id = 'ft-staff-marker-bg-' + i;
			bg.setAttribute('size', 7);
			bg.setAttribute('type', 'color');

			var style = customMarker[userId];
			var color = style ? style.match(/([^-]|^)color\s*:\s*(#[0-9a-f]{6})/i) : null;
			fg.value = color ? color[2] : '#ffffff';
			color = style ? style.match(/background-color\s*:\s*(#[0-9a-f]{6})/i) : null;
			bg.value = color ? color[1] : '#ffffff';

			markerOptions.appendChild(bg);
			markerOptions.appendChild(doc.createElement('br'));
			var btnSave = doc.createElement('button');
			btnSave.textContent = saveText;
			Foxtrick.onClick(btnSave, (function(i, userId) {
				return function(ev) {
					var doc = ev.target.ownerDocument;
					Foxtrick.removeClass(doc.getElementById('foxtrick-marker-link-' + i), 'hidden');
					Foxtrick.addClass(doc.getElementById('ft-staff-marker-opts-' + i), 'hidden');
					var fg = doc.getElementById('ft-staff-marker-fg-' + i);
					var bg = doc.getElementById('ft-staff-marker-bg-' + i);

					var styleString = '';
					if (fg.value !== '#ffffff' && fg.value !== '')
						styleString = 'color:' + fg.value + ';';
					if (bg.value !== '#ffffff' && bg.value !== '')
						styleString += 'background-color:' + bg.value + ';';
					if (styleString === '')
						delete customMarker[userId];
					else
						customMarker[userId] = styleString;
					Foxtrick.Prefs.setString('module.StaffMarker.own_text',
											 JSON.stringify(customMarker));
					Foxtrick.Prefs.setModuleEnableState('StaffMarker.own', true);
					ev.preventDefault();
				};
			})(i, userId));
			markerOptions.appendChild(btnSave);
			markerOptions.appendChild(doc.createTextNode('\u00a0'));
			var btnClose = doc.createElement('button');
			btnClose.textContent = closeText;
			Foxtrick.onClick(btnClose, (function(i) {
				return function(ev) {
					var doc = ev.target.ownerDocument;
					Foxtrick.addClass(doc.getElementById('ft-staff-marker-opts-' + i), 'hidden');
					Foxtrick.removeClass(doc.getElementById('foxtrick-marker-link-' + i), 'hidden');
					ev.preventDefault();
				};
			})(i));
			markerOptions.appendChild(btnClose);
			markerOptions.appendChild(doc.createTextNode('\u00a0'));
			markerOptions.appendChild(doc.createTextNode('\u00a0'));
			var btnReset = doc.createElement('button');
			btnReset.textContent = resetText;
			Foxtrick.onClick(btnReset, (function(i, userId) {
				return function(ev) {
					var doc = ev.target.ownerDocument;
					var fg = doc.getElementById('ft-staff-marker-fg-' + i);
					var bg = doc.getElementById('ft-staff-marker-bg-' + i);
					fg.value = (colorSupported && '#ffffff') || '';
					bg.value = (colorSupported && '#ffffff') || '';
					ev.preventDefault();
				};
			})(i, userId));
			markerOptions.appendChild(btnReset);
			cfFooter.appendChild(markerOptions);

			var markerLink = Foxtrick.createFeaturedElement(doc, module, 'a');
			markerLink.id = 'foxtrick-marker-link-' + i;
			markerLink.className = 'foxtrick-marker-link ft-link';
			markerLink.textContent = markerLink.title = markUser;
			Foxtrick.onClick(markerLink, (function(i) {
				return function(ev) {
					var link = ev.target, doc = link.ownerDocument;
					Foxtrick.addClass(link, 'hidden');
					Foxtrick.removeClass(doc.getElementById('ft-staff-marker-opts-' + i), 'hidden');
				};
			})(i));
			var secondaryLinks = cfFooter.getElementsByClassName('float_right')[0];
			secondaryLinks.insertBefore(markerLink, secondaryLinks.firstChild);
		}
	}
};
