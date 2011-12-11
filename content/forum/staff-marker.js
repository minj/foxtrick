/**
 * staff-marker.js
 * Foxtrick forum staff (HT, GM, Mod, CHPP, LA) marker
 * @author bummerland, ryanli
 */

var FoxtrickStaffMarker = {
	MODULE_NAME : "StaffMarker",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : ["forumViewThread", "forumWritePost", "teamPage"],
	OPTIONS : ["own", "manager"],
	OPTION_TEXTS : true,
	OPTION_TEXTS_DISABLED_LIST : [false, true],

	CSS : Foxtrick.InternalPath + "resources/css/staff-marker.css",

	chppHolders : {},
	editors : {},
	foxtrickers : {},

	init : function() {
		// parse ID from nodes in aboutXML and record in obj
		var parseId = function(nodes, obj) {
			Foxtrick.map(function(node) {
				if (node.hasAttribute("id")) {
					var id = Number(node.getAttribute("id"));
					if (!isNaN(id))
						obj[id] = true;
				}
			}, nodes);
		};

		// FoxTrick
		var ftTags = [
			"head_developer",
			"project_owner",
			"developer",
			"designer",
			"translator"
		];
		Foxtrick.map(function(tag) {
			var nodes = Foxtrick.XMLData.aboutXML.getElementsByTagName(tag);
			parseId(nodes, FoxtrickStaffMarker.foxtrickers);
		}, ftTags);

		// Editors
		var editors = Foxtrick.XMLData.aboutXML.getElementsByTagName("editor");
		parseId(editors, FoxtrickStaffMarker.editors);

		// CHPP holders
		var chpps = Foxtrick.XMLData.aboutXML.getElementsByTagName("chpp");
		parseId(chpps, FoxtrickStaffMarker.chppHolders);
	},

	// get Hattrick-youthclub staffs
	getHty : function(callback) { try{
			const htySessionKey = "staff-marker-hty-list";
			Foxtrick.sessionGet(htySessionKey, function(stored) {
				if (stored == undefined) {
					const htyUri = "http://www.hattrick-youthclub.org/_admin/foxtrick/team.xml";
					Foxtrick.loadXml(htyUri, function(xml) {
						var obj = {};
						var nodes = xml.getElementsByTagName("User");
						Foxtrick.map(function(node) {
							var id = Number(node.getAttribute("ID"));
							if (!isNaN(id))
								obj[id] = true;
						}, nodes);
						Foxtrick.sessionSet(htySessionKey, obj);
						Foxtrick.log("Hattrick-youthclub staffs loaded.");
						callback(obj);
					}, true);
				}
				else {
					callback(stored);
				}
			});
			} catch(e){Foxtrick.log(e);}
		},

	run : function(doc) {
		this.getHty(function(hty) {
			try {
			// getting user-defined IDs and colors
			var customMarker = {};
			if (FoxtrickPrefs.isModuleOptionEnabled("StaffMarker", "own")) {
				var customText = FoxtrickPrefs.getString("module." + FoxtrickStaffMarker.MODULE_NAME + "." + "own_text");
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
				var htreg = /^HT-/i;
				var gmreg = /^GM-/i;
				var modreg = /^MOD-/i;
				var chppreg = /^CHPP-/i;
				var lareg = /^LA-/i;
				// user-defined style
				if (customMarker[id] !== undefined)
					object.setAttribute("style", customMarker[id]);
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
			if (Foxtrick.isPage("forumViewThread", doc)) {
				FoxtrickStaffMarker._MarkAliases_thread(doc, modifier);
				FoxtrickStaffMarker._MarkAliases_select(doc, modifier);
			}
			else if (Foxtrick.isPage("forumWritePost", doc)) {
				FoxtrickStaffMarker._MarkAliases_select(doc, modifier);
			}
			else if (Foxtrick.isPage("teamPage", doc)) {
				if (FoxtrickPrefs.isModuleOptionEnabled("StaffMarker", "manager")) {
					FoxtrickStaffMarker._MarkAliases_thread(doc, modifier);
				}
			}
		} catch(e){Foxtrick.log(e);}
		});
	},

	_MarkAliases_thread : function(doc, modifier) {
		var userDivs = doc.getElementById("mainWrapper").getElementsByClassName("float_left");
		Foxtrick.map(function(user) {
			var links = user.getElementsByTagName("a");
			Foxtrick.map(function(a) {
				if (!a.href) {Foxtrick.log('error ',a.parentNode.innerHTML);return;}
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
	},

	_MarkAliases_select : function(doc, modifier) {
		var selects = doc.getElementById("mainWrapper").getElementsByClassName("threadPagingFilter");
		var select = selects[0];
		if ( select ) {
			if (select.id.search(/filter/i) == -1
				&& select.id.search(/recipient/i) == -1)
				return;

			var css = '';
			this.getHty(function(hty) {
				try{
				var i = 1;
				var user_hasClass = {};
				var option;
				while (option = select.options[i++]) {
					var uname = Foxtrick.trim(option.textContent);
					uname = uname.substring(0, uname.indexOf(" "));
					if (uname == "")
						uname = Foxtrick.trim(option.text);
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
				}
				if ( selects[0] && selects[1] ) selects[1].innerHTML = selects[0].innerHTML;
			} catch(e){Foxtrick.log(e);}
			});
		}
	}
};
Foxtrick.util.module.register(FoxtrickStaffMarker);
