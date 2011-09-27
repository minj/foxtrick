/**
 * staff-marker.js
 * Foxtrick forum staff (HT, GM, Mod, CHPP, LA) marker
 * @author bummerland, ryanli
 */

Foxtrick.util.module.register({
	MODULE_NAME : "StaffMarker",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : ["forumViewThread", "forumWritePost", "teamPage"],
	OPTIONS : ["flag", "own", "manager"],
	OPTION_TEXTS : true,
	OPTION_TEXTS_DISABLED_LIST : [true, false, true],

	CSS : Foxtrick.InternalPath + "resources/css/staff-marker.css",

	// get Hattrick-youthclub staffs
	getData : function(callback) {
		var dataKey = "staff-marker-data";
		var stored = Foxtrick.sessionGet(dataKey);
		if (stored == undefined) {
			var obj = {};
			// JSON files to be downloaded
			var uris = [
				"http://www.foxtrick.org/data/staff/foxtrick.json",
				"http://www.foxtrick.org/data/staff/chpp.json",
				"http://www.foxtrick.org/data/staff/editor.json",
				"http://www.hattrick-youthclub.org/_admin/foxtrick/team.json"
			];
			// counter of URI remaining to fetch
			var todo = uris.length;
			Foxtrick.map(function(uri) {
				Foxtrick.load(uri, function(text) {
					try {
						var parsed = JSON.parse(text);
					}
					catch (e) {
						// JSON.parse failed
						Foxtrick.log("Cannot parse file from: ", uri);
					}
					if (parsed) {
						var key = parsed["type"];
						var list = parsed["list"];
						// add them!
						obj[key] = {};
						Foxtrick.map(function(user) {
							obj[key][user.id] = true;
						}, list);
					}
					// all your data are belong to us
					if (--todo == 0) {
						Foxtrick.sessionSet(dataKey, obj);
						Foxtrick.log("Staff marker data loaded.");
						callback(obj);
					}
				}, true);
			}, uris);
		}
		else {
			callback(stored);
		}
	},

	run : function(doc) {
		this.getData(function(data) {
			// getting user-defined IDs and colors
			var customMarker = {};
			if (FoxtrickPrefs.isModuleOptionEnabled("StaffMarker", "own")) {
				var customText = FoxtrickPrefs.getString("module.StaffMarker.own_text");
				try {
					customMarker = JSON.parse(customText);
				}
				catch (e) {
					Foxtrick.log("JSON parse error: ", customText);
				}
			}
			// tell whether user is staff by id or alias,
			// and attach class and/or user-defined style to object
			var modifier = function(id, alias, object) {
				// alias in select boxes might have a Left-to-Right
				// Overwrite (LRO, U+202D) in front
				var markers = [
					[/^\D*HT-/, "ht"],
					[/^\D*GM-/, "gm"],
					[/^\D*Mod-/, "mod"],
					[/^\D*CHPP-/, "chpp"],
					[/^\D*LA-/, "la"]
				];
				// user-defined style
				if (customMarker[id] !== undefined)
					object.setAttribute("style", customMarker[id]);
				// exclusive classes for official staffs
				var first = Foxtrick.nth(0, function(pair) {
						return alias.search(pair[0]) == 0;
					}, markers);
				if (first) {
					Foxtrick.addClass(object, "ft-staff-" + first[1]);
				}

				// data loaded from external files
				for (var type in data) {
					if (data[type][id] == true)
						Foxtrick.addClass(object, "ft-staff-" + type);
				}
			};

			// mark staffs in thread
			var markThread = function() {
				var userDivs = doc.getElementById("mainWrapper").getElementsByClassName("float_left");
				Foxtrick.map(function(user) {
					var links = user.getElementsByTagName("a");
					Foxtrick.map(function(a) {
						if (!a.href) return; // eg our copy link
						if (a.getAttribute("href").search(/\/Club\/Manager\/\?userId\=/i) == -1
							|| a.getAttribute("href").search(/redir_to_league=true/i) != -1)
							return;
						var uname = Foxtrick.trim(a.title);
						// Work-around for supporter star
						if (uname.lastIndexOf("*") == uname.length-1)
							uname = uname.substring(0,uname.length-1);
						var uid = a.href.replace(/.+userId=/i, "").match(/^\d+/);

						modifier(uid, uname, a);
					}, links);
				}, userDivs);
			};
			// mark staffs in select box
			var markSelect = function() {
				var do_flag = FoxtrickPrefs.isModuleOptionEnabled("StaffMarker", "flag");

				var selects = doc.getElementById("mainWrapper").getElementsByClassName("threadPagingFilter");
				var select = selects[0];
				if ( select ) {
					if (select.id.search(/filter/i) == -1
						&& select.id.search(/recipient/i) == -1)
						return;

					var css = '';
					var i = 1;
					var user_hasClass = {};
					var option;
					while (option = select.options[i++]) {
						var uname = Foxtrick.trim(option.textContent);
						uname = uname.substring(0, uname.indexOf(" "));
						if (uname == "")
							uname = Foxtrick.trim(option.textContent);
						if (uname == "")
							break;
						var uid = option.value.replace(/by_|to_/gi, "");

						modifier(uid, uname, option); // no background image in chrome for select. background-colors only

						if (option.value==-3) {
							Foxtrick.addClass(option, "ft-staff-seperator");
						}
						else if (option.value=="by_-1") {
							Foxtrick.addClass(option, "ft-staff-official");
						}
						else if ( do_flag && Foxtrick.arch === "Gecko") { // no background image in chrome for select
							Foxtrick.addClass(option, "ft-userid-"+uid);
							if (user_hasClass[uid])
								continue;
							css += ".ft-userid-" + uid + " {"
								+ "background-image: url('http://flags.alltidhattrick.org/userflags/" + uid + ".gif');"
								+ "background-position: 180px 50%;"
								+ "background-repeat: no-repeat;"
								+ "padding: 1px 1px 1px 1px;"
								+ "width: 198px;"
								+ "border-bottom: dotted thin #ddd;}\n";
							user_hasClass[uid] = true; // css for that users addes
						}
					}
					if (do_flag)
						Foxtrick.util.inject.css(doc, css);
					if (selects[0] && selects[1])
						selects[1].innerHTML = selects[0].innerHTML;
				}
			};

			if (Foxtrick.isPage("forumViewThread", doc)) {
				markThread(doc, modifier);
				markSelect(doc, modifier);
			}
			else if (Foxtrick.isPage("forumWritePost", doc)) {
				markSelect(doc, modifier);
			}
			else if (Foxtrick.isPage("teamPage", doc)) {
				if (FoxtrickPrefs.isModuleOptionEnabled("StaffMarker", "manager")) {
					markThread(doc, modifier);
				}
			}
		});
	}
});
