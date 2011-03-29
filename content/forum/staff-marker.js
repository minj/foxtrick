/**
 * staff-marker.js
 * Foxtrick forum staff (HT, GM, Mod, CHPP, LA) marker
 * @author bummerland, ryanli
 */

var FoxtrickStaffMarker = {
	MODULE_NAME : "StaffMarker",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : ["forumViewThread", "forumWritePost", "teamPage"],
	OPTIONS : ["flag", "own", "manager"],
	OPTION_TEXTS : true,
	OPTION_TEXTS_DISABLED_LIST : [true, false, true],

	CSS : Foxtrick.ResourcePath + "resources/css/staff-marker.css",

	chppHolders : {},
	editors : {},
	foxtrickers : {},

	init : function() {
		// parse ID from nodes in aboutXML and record in obj
		var parseId = function(nodes, obj) {
			Foxtrick.map(nodes, function(node) {
				if (node.hasAttribute("id")) {
					var id = Number(node.getAttribute("id"));
					if (!isNaN(id))
						obj[id] = true;
				}
			});
		};

		// FoxTrick
		var ftTags = [
			"head_developer",
			"project_owner",
			"developer",
			"designer",
			"translator"
		];
		Foxtrick.map(ftTags, function(tag) {
			var nodes = Foxtrick.XMLData.aboutXML.getElementsByTagName(tag);
			parseId(nodes, FoxtrickStaffMarker.foxtrickers);
		});

		// Editors
		var editors = Foxtrick.XMLData.aboutXML.getElementsByTagName("editor");
		parseId(editors, FoxtrickStaffMarker.editors);

		// CHPP holders
		var chpps = Foxtrick.XMLData.aboutXML.getElementsByTagName("chpp");
		parseId(chpps, FoxtrickStaffMarker.chppHolders);
	},

	run : function(page, doc) {
		// get Hattrick-youthclub staffs
		var getHty = function(callback) {
			const htySessionKey = "staff-marker-hty-list";
			Foxtrick.sessionGet(htySessionKey, function(stored) {
				if (stored == undefined) {
					const htyUri = "http://www.hattrick-youthclub.org/_admin/foxtrick/team.xml";
					Foxtrick.loadXml(htyUri, function(xml) {
						var obj = {};
						var nodes = xml.getElementsByTagName("User");
						Foxtrick.map(nodes, function(node) {
							var id = Number(node.getAttribute("ID"));
							if (!isNaN(id))
								obj[id] = true;
						});
						Foxtrick.sessionSet(htySessionKey, obj);
						Foxtrick.dump("Hattrick-youthclub staffs loaded.\n");
						callback(obj);
					}, true);
				}
				else {
					callback(stored);
				}
			});
		};
		getHty(function(hty) {
			// getting user-defined IDs and colors
			var ulist = {};
			if (Foxtrick.isModuleFeatureEnabled(FoxtrickStaffMarker, "own")) {
				var utext = FoxtrickPrefs.getString("module." + FoxtrickStaffMarker.MODULE_NAME + "." + "own_text");
				var users = utext.match(/userid=(\d+)/ig);

				var i = 0;
				while (user = users[ii++]) {
					try {
						var uid = user.replace(/userid=/i, "");
						var ustyle = utext.substring(utext.search(user)).match(/style=['"](.+)['"]/)[1];
						ulist[uid] = ustyle;
					}
					catch (e) {
						Foxtrick.dumpError(e);
					}
				}
			}
			// tell whether user is staff by id or alias,
			// and attach class and/or user-defined style to object
			var modifier = function(id, alias, object) {
				var htreg = /^HT-/i;
				var gmreg = /^GM-/i;
				var modreg = /^MOD-/i;
				var chppreg = /^CHPP-/i;
				var lareg = /^LA-/i;
				// user-defined style
				if (ulist[id] !== undefined)
					object.style = ulist[id];
				// exclusive classes for official staffs
				if (htreg.test(alias)) {
					Foxtrick.addClass(object, "ft-staff-ht");
				}
				else if (gmreg.test(alias)) {
					Foxtrick.addClass(object, "ft-staff-gm");
				}
				else if (modreg.test(alias)) {
					Foxtrick.addClass(object, "ft-staff-mod");
				}
				else if (chppreg.test(alias)) {
					Foxtrick.addClass(object, "ft-staff-chpp");
				}
				else if (lareg.test(alias)) {
					Foxtrick.addClass(object, "ft-staff-la");
				}

				// others
				if (FoxtrickStaffMarker.editors[id] !== undefined) {
					Foxtrick.addClass(object, "ft-staff-editor");
				}
				if (hty[id] !== undefined) {
					Foxtrick.addClass(object, "ft-staff-hty");
				}
				if (FoxtrickStaffMarker.foxtrickers[id] !== undefined) {
					Foxtrick.addClass(object, "ft-staff-foxtrick");
				}
				if (FoxtrickStaffMarker.chppHolders[id] != undefined) {
					Foxtrick.addClass(object, "ft-staff-chpp-holder");
				}
			};
			switch(page) {
				case "forumViewThread":
					FoxtrickStaffMarker._MarkAliases_thread(doc, modifier);
					FoxtrickStaffMarker._MarkAliases_select(doc, modifier);
				break;

				case "forumWritePost":
					FoxtrickStaffMarker._MarkAliases_select(doc. modifier);
				break;

				case "teamPage":
					if (Foxtrick.isModuleFeatureEnabled(FoxtrickStaffMarker, "manager")) {
						FoxtrickStaffMarker._MarkAliases_thread(doc, modifier);
					}
				break;
			}
		});
	},

	_MarkAliases_thread : function(doc, modifier) {
		var userDivs = doc.getElementById("mainWrapper").getElementsByClassName("float_left");
		Foxtrick.map(userDivs, function(user) {
			var links = user.getElementsByTagName("a");
			Foxtrick.map(links, function(a) {
				if (a.getAttribute("href").search(/\/Club\/Manager\/\?userId\=/i) == -1
					|| a.getAttribute("href").search(/redir_to_league=true/i) != -1)
					return;
				var uname = Foxtrick.trim(a.title);
				// Work-around for supporter star
				if (uname.lastIndexOf("*") == uname.length-1)
					uname = uname.substring(0,uname.length-1);
				var uid = a.href.replace(/.+userId=/i, "").match(/^\d+/);

				modifier(uid, uname, a);
			});
		});
	},

	_MarkAliases_select : function(doc, modifier) {
		var do_flag = Foxtrick.isModuleFeatureEnabled(FoxtrickStaffMarker, "flag");

		var selects = doc.getElementById("mainWrapper").getElementsByTagName("select");
		Foxtrick.map(selects, function(select) {
			if (select.id.search(/filter/i) == -1
				|| select.id.search(/recipient/i) == -1)
				return;

			var i = 1;
			while (option = select.options[i++]) {
				var uname = Foxtrick.trim(option.textContent);
				uname = uname.substring(0, uname.indexOf(" "));
				if (uname == "")
					uname = Foxtrick.trim(option.text);
				if (uname == "")
					break;
				var uid = option.value.replace(/by_|to_/gi, "");

				modifier(uid, uname, option);

				if (do_flag) {
					option.style.backgroundImage = "url('http://flags.alltidhattrick.org/userflags/" + uid + ".gif')";
					option.style.backgroundRepeat = "no-repeat"
					option.style.paddingLeft = "2px";
					option.style.backgroundPosition = "180px 50%";
					option.style.width = "195px";
					option.style.borderbottom = "dotted thin #ddd";
				}
			}
		});
	}
};
