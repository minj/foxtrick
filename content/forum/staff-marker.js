/**
 * staff-marker.js
 * Foxtrick forum staff (HT, GM, Mod, CHPP, LA) marker
 * @author bummerland, ryanli
 */

var FoxtrickStaffMarker = {

	MODULE_NAME : "StaffMarker",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forumViewThread','forumWritePost','teamPage'),
	OPTIONS : ["flag", "own", "manager"],
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : ["",
		"userId=1000 userId=1001 style='color:yellow;' userId=1002 style='background-color:yellow;'", //own
		""],
	OPTION_TEXTS_DISABLED_LIST : [true, false, true],

	CSS : Foxtrick.ResourcePath + "resources/css/staff-marker.css",

	htreg : /^HT-/i,
	gmreg : /^GM-/i,
	modreg : /^MOD-/i,
	chppreg : /^CHPP-/i,
	lareg : /^LA-/i,

	hty_staff: [],

	ulist : {}, // users and colors

	chppholder : [],
	editorsArray : [],
	foxtrickersArray : [],

	updateHtyXML : function() {
		Foxtrick.LoadXML("http://www.hattrick-youthclub.org/_admin/foxtrick/team.xml",
			function(xml) {
				try {
					var htyusers = xml.getElementsByTagName("User");
					for (var i = 0; i < htyusers.length; ++i) {
						FoxtrickStaffMarker.hty_staff.push(htyusers[i].getElementsByTagName("Alias")[0].textContent);
					}
					Foxtrick.dump("Hattrick-youthclub staffs loaded.\n");
				}
				catch (e) {
					Foxtrick.dumpError(e);
				}
			},
			true
		);
	},

	init : function() {
		// Hattrick youth club
		this.updateHtyXML();
		// FoxTrick
		var ftTags = [ "head_developer", "project_owner", "developer",
			"designer", "translation" ];
		for (var i = 0; i < ftTags.length; ++i) {
			var tags = Foxtrick.XMLData.aboutXML.getElementsByTagName(ftTags[i]);
			for (var j = 0; j < tags.length; ++j) {
				var idList = tags[j].getAttribute("value").match(/\(\d+\)/g);
				for (var k = 0; idList && k < idList.length; ++k) {
					var id = idList[k].match(/\d+/)[0];
					this.foxtrickersArray[id] = "x";
				}
			}
		}

		var editor = Foxtrick.XMLData.aboutXML.getElementsByTagName("editor");
		for (var i = 0; i < editor.length; ++i) {
			var id = editor[i].getAttribute("value");
			var name = editor[i].getAttribute("name");
			this.editorsArray[id]=name;
		}

		var chpp=Foxtrick.XMLData.aboutXML.getElementsByTagName("chpp");
		for (var i = 0; i < chpp.length; ++i) {
			var id = chpp[i].getAttribute("value");
			var name = chpp[i].getAttribute("name");
			this.chppholder[id] = name;
		}
	},

	run : function(page, doc) {
		// not on open new thread
		if (doc.location.href.search(/\/Forum\/Write\.aspx\?v=/)!=-1) return;

		// getting userids and colors
		var utext = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "own_text");
		if (!utext)
			utext = this.OPTION_TEXTS_DEFAULT_VALUES[7];
		var users = '';
		if (Foxtrick.isModuleFeatureEnabled( this, "own")) {
			users = utext.match(/userid=(\d+)/ig);

			var ii=0,user;
			while (user = users[ii++]) {
				try {
					var ustyle = utext.substring(utext.search(user)).match(/style='(.+)'/)[1];
					this.ulist[user.replace(/userid=/i,'')] = ustyle;
				}
				catch (e) {
					Foxtrick.dumpError(e);
				}
			}
		}
		switch( page ) {
			case 'forumViewThread':
				// Foxtrick.dump('forumViewThread\n');
				FoxtrickStaffMarker._MarkAliases_thread(doc);
				FoxtrickStaffMarker._MarkAliases_select(doc);
			break;

			case 'forumWritePost':
				// Foxtrick.dump('forumWritePost\n');
				FoxtrickStaffMarker._MarkAliases_select(doc);
			break;

			case 'teamPage':
				if (Foxtrick.isModuleFeatureEnabled( this, "manager")) {
					FoxtrickStaffMarker._MarkAliases_thread(doc);
				}
			break;
		}
	},

	//Alias - Staff-Color
	_MarkAliases_thread : function (doc) {
		var do_own = Foxtrick.isModuleFeatureEnabled( this, "own");

		var userDivs = doc.getElementById("mainWrapper").getElementsByClassName("float_left");
		var i=0, user;
		while ( user = userDivs[i++] ) {
			var as = user.getElementsByTagName('a');
			var j=0, a;
			while ( a = as[j++] ) {
				if (a.getAttribute("href").search(/\/Club\/Manager\/\?userId\=/i) == -1) continue;
				if (a.getAttribute("href").search(/redir_to_league=true/i) != -1) continue;
				var uname = Foxtrick.trim(a.title);
				//Workarround for supporter star
				if (uname.lastIndexOf('*') == uname.length-1) {
					// Foxtrick.dump (uname + '\n');
					// Foxtrick.dump (uname.substring(0,uname.length-1) + '\n');
					uname = uname.substring(0,uname.length-1);
				}
				var uid = a.href.replace(/.+userId=/i, "").match(/^\d+/);

				// earlier overwrites later.
				if (do_own && this.ulist[uid]!=null) {
					a.setAttribute('style',this.ulist[uid]);
				}

				// exclusive categories
				if (this.htreg.test(uname)) {
					Foxtrick.addClass(a, "ft-staff-ht");
				}
				else if (this.gmreg.test(uname)) {
					Foxtrick.addClass(a, "ft-staff-gm");
				}
				else if (this.modreg.test(uname)) {
					Foxtrick.addClass(a, "ft-staff-mod");
				}
				else if (this.chppreg.test(uname)) {
					Foxtrick.addClass(a, "ft-staff-chpp");
				}
				else if (this.lareg.test(uname)) {
					Foxtrick.addClass(a, "ft-staff-la");
				}

				if (this.editorsArray[uid] != null) {
					Foxtrick.addClass(a, "ft-staff-editor");
				}
				if (this.hty_staff != null && Foxtrick.in_array(this.hty_staff, uname)) {
					Foxtrick.addClass(a, "ft-staff-hty");
				}
				if (this.foxtrickersArray[uid] != null) {
					Foxtrick.addClass(a, "ft-staff-foxtrick");
				}
				if (this.chppholder[uid]!=null) {
					Foxtrick.addClass(a, "ft-staff-chpp-holder");
				}
			}
		}
	},

	//SelectBox - Staff-Color
	_MarkAliases_select : function (doc) {
		var do_flag = Foxtrick.isModuleFeatureEnabled(this, "flag");
		var do_own = Foxtrick.isModuleFeatureEnabled(this, "own");

		var selects = doc.getElementById('mainWrapper').getElementsByTagName('select');
		for (var k=0;k<selects.length;++k) {
			el_Select = selects[k];
			if (el_Select.id.search(/filter/i) > -1
				|| el_Select.id.search(/recipient/i) > -1) {
				//Foxtrick.dump('forumSELECT => select box:'+ el_Select.id + '.\n');
				var i = 1, option;
				while ( option = el_Select.options[i++] ) {
					var uname = Foxtrick.trim(option.textContent);
					uname = uname.substring(0, uname.indexOf(' '));
					if (uname == '') uname = Foxtrick.trim( option.text );
					if (uname == '') break;
					var uid = option.value.replace(/by_|to_/gi,'');

					// exclusive categories
					if (this.htreg.test(uname)) {
						Foxtrick.addClass(option, "ft-staff-ht");
					}
					else if (this.gmreg.test(uname)) {
						Foxtrick.addClass(option, "ft-staff-gm");
					}
					else if (this.modreg.test(uname)) {
						Foxtrick.addClass(option, "ft-staff-mod");
					}
					else if (this.chppreg.test(uname)) {
						Foxtrick.addClass(option, "ft-staff-chpp");
					}
					else if (this.lareg.test(uname)) {
						Foxtrick.addClass(option, "ft-staff-la");
					}

					if (this.editorsArray[uid] != null) {
						Foxtrick.addClass(option, "ft-staff-editor");
					}
					if (this.hty_staff != null && Foxtrick.in_array(this.hty_staff,uname)) {
						Foxtrick.addClass(option, "ft-staff-hty");
					}
					if (this.foxtrickersArray[uid] != null) {
						Foxtrick.addClass(option, "ft-staff-foxtrick");
					}
					if (this.chppholder[uid] != null) {
						Foxtrick.addClass(option, "ft-staff-chpp-holder");
					}

					var style = option.getAttribute("style") || "";
					if (do_own && this.ulist[uid]!=null) {
						style += this.ulist[uid];
					}
					if (do_flag) {
						style += ';background-image: url("http://flags.alltidhattrick.org/userflags/' + option.value.replace(/by_|to_/,'') + '.gif"); background-repeat:no-repeat; padding-left:2px; background-position:180px 50%; width:195px;border-bottom:dotted thin #ddd';
					}

					if (style!='') {
						option.setAttribute("style", style);
					}
				}
			}
		}
	}
};
