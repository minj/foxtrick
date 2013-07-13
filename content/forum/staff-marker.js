'use strict';
/**
 * staff-marker.js
 * Foxtrick forum staff (HT, GM, Mod, CHPP, LA) marker
 * @author bummerland, ryanli
 */

Foxtrick.modules['StaffMarker'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forumViewThread', 'forumWritePost', 'teamPage'],
	OPTIONS: ['officials', 'editors', 'foxtrick', 'chpp.contributors', 'chpp.holders', 'supporters', 'manager', 'own'],
	OPTION_EDITS: true,
	OPTION_EDITS_DISABLED_LIST: [true, true, true, true, true, true, true, false],

	CSS: Foxtrick.InternalPath + 'resources/css/staff-marker.css',

    hasLoadedOnce: false,

	init: function() {
		this.load();
	},

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
				Foxtrick.map(function(user) {
					obj[key][user.id] = true;
					if (key == 'chpp-holder')
						obj[key]['apps'][user.id] = user.appNames;

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
                    var teams = xml.getElementsByTagName('TeamID');
                    var team = null;
                    for(var t=0; t<teams.length; t++) {
                        if(teams[t].textContent == Foxtrick.util.id.getOwnTeamId()) {
                            team = teams[t].parentNode;
                            break;
                        }
                    }
                    if(team == null) {
                        todo--; // no supporter for this team
                    } else {
                       var ids = {type:'supported', list: []};
                       var sup = team.getElementsByTagName('SupportedTeams')[0];
                       var all = sup.getElementsByTagName('UserId');
                       for(var i=0; i<all.length; i++)
                           ids.list.push({id: all[i].textContent});
                       parseMarkers(JSON.stringify(ids));
                       var ids2 = {type:'supporter', list: []};
                       var sup2 = team.getElementsByTagName('MySupporters')[0];
                       var all2 = sup2.getElementsByTagName('UserId');
                       for(var i=0; i<all2.length; i++)
                           ids2.list.push({id: all2[i].textContent});
                       parseMarkers(JSON.stringify(ids2));
                    }
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
                if(enableOfficials) {
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
					if (data[type][id] == true) {
                        if((enableFoxtrick  && type == 'foxtrick')
                        || (enableEditors   && type == 'editor')
                        || (enableChppCont  && (type == 'htls' || type == 'hty'))
                        || (enableChppHold   && type == 'chpp-holder')
                        || (enableSupporter && (type == 'supporter' || type == 'supported')) )
							Foxtrick.addClass(object, 'ft-staff-' + type);
						if (type == 'chpp-holder' && enableChppHold) {
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
						// Work-around for supporter star
						if (uname.lastIndexOf('*') == uname.length - 1)
							uname = uname.substring(0, uname.length - 1);
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
					if (select.id.search(/filter/i) == -1
						&& select.id.search(/recipient/i) == -1)
						return;

					var css = '';
					var i = 1;
					var user_hasClass = {};
					var option;
					while (option = select.options[i++]) {
						var uname = Foxtrick.trim(option.textContent);
						uname = uname.substring(0, uname.indexOf(' '));
						if (uname == '')
							uname = Foxtrick.trim(option.textContent);
						if (uname == '')
							break;
						var uid = option.value.replace(/by_|to_/gi, '');

						modifier(uid, uname, option);
						// no background image in chrome for select. background-colors only

						if (option.value == -3) {
							Foxtrick.addClass(option, 'ft-staff-seperator');
						}
						else if (option.value == 'by_-1') {
							Foxtrick.addClass(option, 'ft-staff-official');
						}
					}
				}, selects);
			};

			var enableOfficials = FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'officials');
			var enableEditors = FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'editors');
			var enableFoxtrick = FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'foxtrick');
			var enableChppCont = FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'chpp.contributors');
			var enableChppHold = FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'chpp.holders');
			var enableSupporter = FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'supporters');
			if (Foxtrick.isPage(doc, 'forumViewThread')) {
				markThread(doc, modifier);
				markSelect(doc, modifier);
			}
			else if (Foxtrick.isPage(doc, 'forumWritePost')) {
				markThread(doc, modifier);
				markSelect(doc, modifier);
			}
			else if (Foxtrick.isPage(doc, 'teamPage')) {
				if (FoxtrickPrefs.isModuleOptionEnabled('StaffMarker', 'manager')) {
					markThread(doc, modifier);
				}
			}
		});
	}
};
