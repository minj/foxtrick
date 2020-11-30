/**
 * staff-marker.js
 * Foxtrick forum staff (HT, GM, Mod, CHPP, LA) marker
 *
 * @author bummerland, ryanli, LA-MJ, CHPP-teles, CatzHoek
 */

'use strict';

Foxtrick.modules.StaffMarker = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: [
		'forumViewThread', 'forumWritePost',
		'teamPage', 'guestbook', 'supported', 'supporters', 'series', // grouped by if/else
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
		'forumInterface',
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
		true,
	],

	CSS: Foxtrick.InternalPath + 'resources/css/staff-marker.css',

	/**
	 * StaffMarker type specifications
	 *
	 * [option, type1, type2,.. typeN]
	 * or type when type==option
	 * where type is `type` in json
	 *
	 * @type {Array}
	 */
	TYPE_LIST: [
		'officials',
		'editor',
		'foxtrick',
		['chpp-contributors', 'htls', 'hy', 'ho'],
		'chpp-holder',
		['supporters', 'supporter', 'supported'],
		'coach',
	],

	/**
	 * Placeholder for StaffMarker.type strings
	 *
	 * @type {Object}
	 */
	TITLE_MAP: {},

	/**
	 * StaffMarker file specifications
	 *
	 * [type, file1, file2,.. fileN]
	 * or file when file==type
	 *
	 * @type {Array}
	 */
	FILE_LIST: [
		// no file for officials
		'editor',
		'foxtrick',
		'htls', 'hy', 'ho',
		'chpp-holder',

		// supporters use custom scheme
		['coach', 'nt', 'u20'],
	],

	/**
	 * Callback map for each StaffMarker type.
	 *
	 * Used to add custom properties to
	 * the StaffMarker data map being built.
	 *
	 * @type {Object}
	 */
	TYPE_CALLBACK_MAP: {
		'chpp-holder': function(data) {
			data['chpp-holder']['apps'] = {};
		},
		coach: function(data) {
			if (typeof data['coach']['nts'] === 'undefined')
				data['coach']['nts'] = {};
		},
	},

	/**
	 * Callback map for each user definition
	 * in a certain StaffMarker type.
	 *
	 * Receives the StaffMarker data map being built
	 * and the user definition in JSON.
	 *
	 * @type {Object}
	 */
	USER_CALLBACK_MAP: {
		'chpp-holder': function(data, user) {
			data['chpp-holder']['apps'][user.id] = user.appNames;
		},
		coach: function(data, user) {
			data['coach']['nts'][user.id] = {
				leagueId: user.LeagueId,
				name: user.TeamName,
				teamId: user.TeamId,
			};
		},
	},

	/**
	 * Callback map for each element to be marked
	 * as a certain StaffMarker type.
	 *
	 * callback signature:
	 * function(elements, data, userId): Boolean|Element where:
	 * elements is {target, icon, link}
	 * data is the StaffMarker data map
	 *
	 * If true is returned the element is skipped.
	 * If an element is returned it will be used instead of the default icon.
	 *
	 * @type {Object}
	 */
	TARGET_CALLBACK_MAP: {
		'chpp-holder': function(elements, data, userId) {
			var apps = data['chpp-holder']['apps'][userId];
			var appNames = apps.reduce(function(prev, appName) {
				return prev + '\n● ' + appName;
			}, '');

			var icon = elements.icon;
			icon.title += appNames;
			icon.alt += appNames;
		},
		coach: function(elements, data, userId) {
			var doc = elements.target.ownerDocument;
			var nt = data['coach']['nts'][userId];

			var url = '/Club/NationalTeam/NationalTeam.aspx?teamId=' + nt.teamId;
			var title = elements.icon.title.replace(/%s/, nt.name);
			var flagLink = Foxtrick.util.id.createFlagFromLeagueId(doc, nt.leagueId, url, title);

			Foxtrick.addClass(flagLink, 'ft-no-popup');
			flagLink.target = '_blank';

			return flagLink;
		},
		supporter: function(elements) {
			var doc = elements.target.ownerDocument;
			if (Foxtrick.isPage(doc, ['supported', 'supporters']))
				return true; // skip

			return false;
		},
		supported: function(elements) {
			var doc = elements.target.ownerDocument;
			if (Foxtrick.isPage(doc, ['supported', 'supporters']))
				return true; // skip

			return false;
		},
	},

	getStaffTitle: function(type, duty) {
		var str = 'StaffMarker.' + type + (duty ? '.' + duty : '');
		return Foxtrick.L10n.isStringAvailable(str) ? Foxtrick.L10n.getString(str) : null;
	},

	// parse enable map
	getEnabledTypes: function() {
		var enabled = {};
		for (var type of this.TYPE_LIST) {
			if (typeof type === 'string') {
				enabled[type] = Foxtrick.Prefs.isModuleOptionEnabled('StaffMarker', type);
				this.TITLE_MAP[type] = this.getStaffTitle(type);
			}
			else {
				var superTypeEnabled = Foxtrick.Prefs.isModuleOptionEnabled('StaffMarker', type[0]);

				var subTypes = type.slice(1);
				for (var subType of subTypes) {
					enabled[subType] = superTypeEnabled;
					this.TITLE_MAP[subType] = this.getStaffTitle(subType);
				}
			}
		}
		return enabled;
	},

	// get staffs
	load: function(doc) {
		var module = this;

		var entry = doc.getElementById('mainBody');
		var loading = Foxtrick.util.note.createLoading(doc);
		entry.insertBefore(loading, entry.firstChild);

		var gData = {};

		var parseMarkers = function(text) {
			if (!text) {
				Foxtrick.log('WARNING: parseMarkers got null');
				return false;
			}

			var parsed = null;
			try {
				parsed = JSON.parse(text);
			}
			catch (e) {
				Foxtrick.log('WARNING: Cannot parse StaffMarker JSON');
			}

			if (!parsed) {
				return false;
			}

			var key = parsed['type'];
			var list = parsed['list'];

			// add them!
			if (typeof gData[key] === 'undefined')
				gData[key] = {};

			if (parsed['url']) {
				gData[key]['url'] = parsed['url'];
			}

			if (typeof parsed['duties'] !== 'undefined') {
				gData[key]['hasDuties'] = true;
				gData[key]['duties'] = parsed['duties'];

				if (typeof gData[key]['duty'] === 'undefined')
					gData[key]['duty'] = {};
			}

			var callback = module.TYPE_CALLBACK_MAP[key];
			if (typeof callback === 'function')
				callback(gData);

			var userCb = module.USER_CALLBACK_MAP[key];

			Foxtrick.map(function(user) {
				gData[key][user.id] = true;

				if (gData[key]['hasDuties'] && user.duty !== 'undefined') {
					gData[key]['duty'][user.id] = user.duty;
				}

				if (typeof userCb === 'function')
					userCb(gData, user);

			}, list);

			return true;
		};

		var addSupporters = function() {
			var TEAMS_PER_PAGE = 200;
			var teamId = Foxtrick.util.id.getOwnTeamId();

			return new Promise(function(fulfill, reject) {
				/** @type {CHPPParams} */
				let args = [
					['file', 'teamdetails'],
					['version', '3.1'],
					['teamId', teamId],
					['includeSupporters', 'true'],
				];
				Foxtrick.util.api.retrieve(doc, args, { cache: 'session' }, (xml, errorText) => {
					if (!xml || errorText) {
						Foxtrick.log('StaffMarker teamdetails failed:', errorText);
						reject();
						return;
					}

					/** @type {CHPPParams[]} */
					var bArgs = [];
					var supportedCt = 0, supporterCt = 0;
					var pageCt, p;

					// supporter teams are different for both teams
					var teams = xml.getElementsByTagName('Team');
					for (var team of Foxtrick.toArray(teams)) {
						var id = xml.num('TeamID', team);

						var sups = xml.node('MySupporters', team);
						if (sups) {
							supporterCt = parseInt(sups.getAttribute('TotalItems'), 10);

							pageCt = Math.ceil(supporterCt / TEAMS_PER_PAGE);
							for (p = 0; p < pageCt; p++) {
								bArgs.push([
									['file', 'supporters'],
									['version', '1.0'],
									['teamId', id],
									['actionType', 'mysupporters'],
									['pageSize', TEAMS_PER_PAGE],
									['pageIndex', p],
								]);
							}
						}

						// set supportedCt as long as we are here
						sups = xml.node('SupportedTeams', team);
						if (sups)
							supportedCt = parseInt(sups.getAttribute('TotalItems'), 10);
					}

					// supported teams are same for both teams so added once only
					pageCt = Math.ceil(supportedCt / TEAMS_PER_PAGE);
					for (p = 0; p < pageCt; p++) {
						bArgs.push([
							['file', 'supporters'],
							['version', '1.0'],
							['teamId', teamId],
							['actionType', 'supportedteams'],
							['pageSize', TEAMS_PER_PAGE],
							['pageIndex', p],
						]);
					}

					/** @type {CHPPOpts} */
					let cOpts = { cache: 'session' };
					Foxtrick.util.api.batchRetrieve(doc, bArgs, cOpts, (xmls, errors) => {
						if (!xmls) {
							Foxtrick.log('StaffMarker supporters failed');
							reject();
							return;
						}

						var supportedIds = { type: 'supported', list: [] };
						var supporterIds = { type: 'supporter', list: [] };

						for (var x = 0; x < xmls.length; ++x) {
							var xml = xmls[x];
							var errorText = errors[x];
							if (!xml || errorText) {
								Foxtrick.log('No XML in batchRetrieve', bArgs[x], errorText);
								continue;
							}

							var sups = xml.node('MySupporters');
							var list = supporterIds.list;
							if (!sups) {
								sups = xml.node('SupportedTeams');
								list = supportedIds.list;
							}

							var userIds = sups.getElementsByTagName('UserId');
							for (var userId of Foxtrick.toArray(userIds))
								list.push({ id: userId.textContent });

						}

						fulfill([JSON.stringify(supporterIds), JSON.stringify(supportedIds)]);

					});
				});

			}).then(function(sups) {


				var supportersOK = parseMarkers(sups[0]);
				if (supportersOK)
					Foxtrick.storage.set('Markers.supporters.' + teamId, sups[0]);

				var supportedOK = parseMarkers(sups[1]);
				if (supportedOK)
					Foxtrick.storage.set('Markers.supported.' + teamId, sups[1]);

			}, function(e) {

				if (e instanceof Error)
					Foxtrick.catch(module)(e);

				var by = Foxtrick.storage.get('Markers.supporters.' + teamId).then(parseMarkers);
				var who = Foxtrick.storage.get('Markers.supported.' + teamId).then(parseMarkers);

				return Promise.all([by, who]);

			}).catch(Foxtrick.catch(module));

		};

		// JSON files to be downloaded
		var urls = [];
		var enabled = this.getEnabledTypes();
		for (var file of this.FILE_LIST) {
			if (typeof file === 'string') {
				if (enabled[file])
					urls.push(Foxtrick.DataPath + 'staff/' + file + '.json');
			}
			else if (enabled[file[0]]) {
				var subFiles = file.slice(1);
				for (var subFile of subFiles) {
					urls.push(Foxtrick.DataPath + 'staff/' + subFile + '.json');
				}
			}
		}

		var parsePromises = Foxtrick.map(function(url) {

			return Foxtrick.load(url).then(function(text) {

				// set only if parsing step does not throw or fail
				var parseOK = parseMarkers(text);
				if (parseOK)
					Foxtrick.storage.set('Markers.' + url, text);
				else
					Foxtrick.log('StaffMarker parsing failed:', url, text);

			}, function(resp) {

				Foxtrick.log('Failure loading file:', resp.url, '. Using cached markers.');

				return Foxtrick.storage.get('Markers.' + url).then(parseMarkers);

			}).catch(Foxtrick.catch(module));

		}, urls);

		if (enabled['supporter'] && Foxtrick.Prefs.getBool('xmlLoad') &&
		    Foxtrick.util.layout.isSupporter(doc)) {
			parsePromises.push(addSupporters());
		}

		return Promise.all(parsePromises).then(function() {
			// all your data are belong to us
			Foxtrick.log('StaffMarker data loaded.');

			loading.parentNode.removeChild(loading);

			return gData;

		});

	},

	run: function(doc) {
		var module = this;

		var MAIN = '#' + Foxtrick.getMainIDPrefix();
		var gEnabled = module.getEnabledTypes();

		// get user-defined IDs and colors
		var gCustomMarker = {};
		if (Foxtrick.Prefs.isModuleOptionEnabled('StaffMarker', 'own')) {
			var customText = Foxtrick.Prefs.getString('module.StaffMarker.own_text');
			try {
				gCustomMarker = JSON.parse(customText);
			}
			catch (e) {
				Foxtrick.log('Custom marker JSON parse error:', customText);
			}
		}

		// modify target element to mark staff types
		// eslint-disable-next-line complexity
		var modify = function(target, data, id, alias) {
			// user-defined style in custom marker
			if (typeof gCustomMarker[id] !== 'undefined')
				target.setAttribute('style', gCustomMarker[id]);

			// check whether user is official staff by alias
			// and add an exclusive class
			if (gEnabled['officials']) {
				// alias in select boxes might have a Left-to-Right
				// Overwrite (LRO, U+202D) in front
				var markers = [
					[/^\u202d?HT-/i, 'ht'],
					[/^\u202d?GM-/i, 'gm'],
					[/^\u202d?Mod-/i, 'mod'],
					[/^\u202d?CHPP-/i, 'chpp'],
					[/^\u202d?LA-/i, 'la'],
				];
				var firstMatch = Foxtrick.nth(function(spec) {
					return spec[0].test(alias);
				}, markers);

				if (firstMatch) {
					var staffClasses = 'ft-staff ft-staff-style ft-staff-' + firstMatch[1];
					Foxtrick.addClass(target, staffClasses);
				}
			}

			// data loaded from external files
			var img = doc.createElement('img');
			img.src = '/Img/Icons/transparent.gif';
			var URL_RE = /^chrome:\/\/foxtrick\/content\//;

			for (var type in data) {
				if (!gEnabled[type] || !data[type][id])
					continue;

				var icon = Foxtrick.cloneElement(img, false), link, marker;

				Foxtrick.addClass(target, 'ft-staff ft-staff-' + type);
				Foxtrick.addClass(icon, 'ft-staff-icon ft-staff-' + type);
				icon.title = icon.alt = module.TITLE_MAP[type];

				var duty, dutyDesc;
				if (data[type]['hasDuties'] && (duty = data[type]['duty'][id]) &&
				    (dutyDesc = data[type]['duties'][duty])) {

					icon.alt = module.getStaffTitle(type, duty) || dutyDesc.alt || '';
					icon.title = icon.alt;

					if (dutyDesc.url) {
						var iUrl = dutyDesc.url.replace(URL_RE, Foxtrick.ResourcePath);
						var style = Foxtrick.format('background-image: url("{}");', [iUrl]);
						icon.setAttribute('style', style);
					}
				}

				var url;
				if ((url = data[type]['url'])) {
					url = url.replace(/\[id\]/, id);

					link = doc.createElement('a');
					Foxtrick.addClass(link, 'ft-no-popup');
					link.href = url;
					link.target = '_blank';
					link.appendChild(icon);

					marker = link;
				}
				else
					marker = icon;

				var skip = false;
				var callback = module.TARGET_CALLBACK_MAP[type];
				if (typeof callback === 'function') {
					var elements = { target: target, icon: icon, link: link };

					var ret = callback(elements, data, id);
					if (ret) {
						if (ret === true)
							skip = true;
						else
							marker = ret;
					}
				}

				if (!skip)
					target.insertBefore(marker, target.firstChild);
			}
		};

		// mark staffs in thread
		var markThread = function(data) {
			var query = '#mainBody .float_left, #sidebar, .mainBox, ' +
				MAIN + 'pnlSupportedTeams, ' + MAIN + 'pnlMySupporters, ' + MAIN + 'upGB';

			var originRe = new RegExp('^' + Foxtrick.strToRe(doc.location.origin));

			var userDivs = doc.querySelectorAll(query);
			Foxtrick.map(function(user) {
				if (user.parentElement.closest(query)) {
					// re-entrancy, this element was processed with the parent
					return;
				}
				var links = user.getElementsByTagName('a');
				Foxtrick.map(function(a) {
					if (!a.href)
						return; // e.g. our copy link

					// make relative URL manually due to inconsistent absolute URL use
					var href = a.href.replace(originRe, '');

					if (!/^\/Club\/Manager\/\?userId\=/i.test(href) ||
					    Foxtrick.hasClass(a, 'ft-popup-list-link'))
						return;

					var userName = a.title.trim();
					var userId = Foxtrick.getUrlParam(a.href, 'userId');
					modify(a, data, userId, userName);

				}, links);

			}, userDivs);

			if (Foxtrick.isPage(doc, 'guestbook')) {
				var gb = Foxtrick.getMBElement(doc, 'upGB');
				Foxtrick.onChange(gb, function() {
					if (gb.querySelector('.ft-staff'))
						return;

					markThread(data);
				}, { subtree: false });
			}
		};

		// mark staffs in select box
		var markSelect = function(data) {
			var body = doc.getElementById('mainBody');
			var query = MAIN + 'ucThread_ucPagerTop_filterUser, ' + MAIN + 'ddlRecipient';
			var selects = body.querySelectorAll(query);

			Foxtrick.map(function(select) {
				// avoid select boxes that do not contain users
				if (!/filter/i.test(select.id) && !/recipient/i.test(select.id))
					return;

				var i = 1; // skip first
				var option;
				while ((option = select.options[i++])) {
					var userName = option.textContent.trim();
					if (userName === '')
						break;

					var userId = option.value.replace(/by_|to_/gi, '');

					// no background images in options in chrome; background-colors only
					modify(option, data, userId, userName);

					// special colors for options which are not users in filter select box
					if (option.value == -3) {
						Foxtrick.addClass(option, 'ft-staff-separator');
					}
					else if (option.value == 'by_-1') {
						Foxtrick.addClass(option, 'ft-staff-official');
					}
				}
			}, selects);
		};

		if (Foxtrick.isPage(doc, 'forumViewThread') &&
			!doc.querySelector('.ft-staff-marker-opts') &&
			Foxtrick.Prefs.isModuleOptionEnabled('StaffMarker', 'forumInterface'))
			this.addForumInterface(doc);

		module.load(doc).then(function(data) {

			if (Foxtrick.isPage(doc, ['forumViewThread', 'forumWritePost'])) {
				markThread(data);

				Foxtrick.modules['ForumAlterHeaderLine'].ensureUnbrokenHeaders(doc);

				markSelect(data);
			}
			else if (Foxtrick.Prefs.isModuleOptionEnabled('StaffMarker', 'manager')) {
				markThread(data);
			}

		}).catch(Foxtrick.catch(module));

	},
	addForumInterface: function(doc) {
		var module = this;
		var markerLinkTitle = Foxtrick.L10n.getString('StaffMarker.userColor');
		var fgColorText = Foxtrick.L10n.getString('StaffMarker.textColor');
		var bgColorText = Foxtrick.L10n.getString('StaffMarker.bgColor');
		var saveText = Foxtrick.L10n.getString('button.save');
		var closeText = Foxtrick.L10n.getString('button.close');
		var resetText = Foxtrick.L10n.getString('button.reset');

		var customText = Foxtrick.Prefs.getString('module.StaffMarker.own_text');
		var customMarker = {};
		try {
			customMarker = JSON.parse(customText);
		}
		catch (e) {
			Foxtrick.log('StaffMarker.own_text JSON parse error:', customText);
		}

		var temp = doc.createElement('input');
		temp.type = 'color';
		temp.value = '';
		var COLOR_SUPPORTED = !!temp.value;

		var makeSaveListener = function(i, userId) {
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
			};
		};

		var makeCloseListener = function(i) {
			return function(ev) {
				var doc = ev.target.ownerDocument;

				Foxtrick.addClass(doc.getElementById('ft-staff-marker-opts-' + i), 'hidden');
				Foxtrick.removeClass(doc.getElementById('foxtrick-marker-link-' + i), 'hidden');
			};
		};

		var makeResetListener = function(i) {
			return function(ev) {
				var doc = ev.target.ownerDocument;

				var fg = doc.getElementById('ft-staff-marker-fg-' + i);
				var bg = doc.getElementById('ft-staff-marker-bg-' + i);

				fg.value = COLOR_SUPPORTED && '#ffffff' || '';
				bg.value = COLOR_SUPPORTED && '#ffffff' || '';
			};
		};

		var makeOpenListener = function(i) {
			return function(ev) {
				var link = ev.target, doc = link.ownerDocument;

				Foxtrick.addClass(link, 'hidden');
				Foxtrick.removeClass(doc.getElementById('ft-staff-marker-opts-' + i), 'hidden');
			};
		};

		var elems = doc.getElementsByClassName('cfWrapper');
		for (var i = 0; i < elems.length; i++) {
			var elem = elems[i];

			var cfHeader = elem.querySelector('.cfHeader');
			if (!cfHeader)
				continue;

			var cfFooter = elem.querySelector('.cfFooter');

			var markerLink = Foxtrick.createFeaturedElement(doc, module, 'a');
			markerLink.id = 'foxtrick-marker-link-' + i;
			markerLink.className = 'foxtrick-marker-link ft-link';
			markerLink.textContent = markerLink.title = markerLinkTitle;
			Foxtrick.onClick(markerLink, makeOpenListener(i));
			var secondaryLinks = cfFooter.querySelector('.float_right');
			secondaryLinks.insertBefore(markerLink, secondaryLinks.firstChild);

			var markerOptions = Foxtrick.createFeaturedElement(doc, module, 'div');
			markerOptions.id = 'ft-staff-marker-opts-' + i;
			Foxtrick.addClass(markerOptions, 'ft-staff-marker-opts hidden');

			var fgLabel = doc.createElement('label');
			fgLabel.textContent = fgColorText;
			fgLabel.htmlFor = 'ft-staff-marker-fg-' + i;
			markerOptions.appendChild(fgLabel);
			markerOptions.appendChild(doc.createTextNode('\u00a0'));

			var fg = doc.createElement('input');
			fg.id = 'ft-staff-marker-fg-' + i;
			fg.size = 7;
			fg.type = 'color';
			fg.value = '';
			fg.placeholder = '#ffffff';
			markerOptions.appendChild(fg);
			markerOptions.appendChild(doc.createTextNode('\u00a0'));

			var bgLabel = doc.createElement('label');
			bgLabel.textContent = bgColorText;
			bgLabel.htmlFor = 'ft-staff-marker-bg-' + i;
			markerOptions.appendChild(bgLabel);
			markerOptions.appendChild(doc.createTextNode('\u00a0'));

			var bg = doc.createElement('input');
			bg.id = 'ft-staff-marker-bg-' + i;
			bg.size = 7;
			bg.type = 'color';
			bg.value = '';
			bg.placeholder = '#ffffff';
			markerOptions.appendChild(bg);
			markerOptions.appendChild(doc.createElement('br'));

			var userId = Foxtrick.util.id.findUserId(cfHeader);
			var style = customMarker[userId];

			var color = style ? style.match(/(?:[^-]|^)color\s*:\s*(#[0-9a-f]{6})/i) : null;
			fg.value = color ? color[1] : '#ffffff';
			color = style ? style.match(/background-color\s*:\s*(#[0-9a-f]{6})/i) : null;
			bg.value = color ? color[1] : '#ffffff';

			var btnSave = doc.createElement('button');
			btnSave.type = 'button';
			btnSave.textContent = saveText;
			Foxtrick.onClick(btnSave, makeSaveListener(i, userId));
			markerOptions.appendChild(btnSave);
			markerOptions.appendChild(doc.createTextNode('\u00a0'));

			var btnClose = doc.createElement('button');
			btnClose.type = 'button';
			btnClose.textContent = closeText;
			Foxtrick.onClick(btnClose, makeCloseListener(i));
			markerOptions.appendChild(btnClose);
			markerOptions.appendChild(doc.createTextNode('\u00a0\u00a0'));

			var btnReset = doc.createElement('button');
			btnReset.type = 'button';
			btnReset.textContent = resetText;
			Foxtrick.onClick(btnReset, makeResetListener(i));
			markerOptions.appendChild(btnReset);

			cfFooter.appendChild(markerOptions);
		}
	},
};
