/**
 * forumstaffmarker.js
 * Foxtrick forum staff (HT, GM, Mod, CHPP, LA) marker
 * @author bummerland
 */

var FoxtrickForumStaffMarker = {

    MODULE_NAME : "ForumStaffMarker",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forumViewThread','forumWritePost'),
	DEFAULT_ENABLED : true,
	//NEW_AFTER_VERSION: "0.4.8.1",
	//LASTEST_CHANGE:"added flags dumdidum",
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : new Array("background-color:red;", //HT
											"background-color:orange; color:black;", //GM
                                            "background-color:yellow; color:black;", //MOD
											"background-color:white; color:green;", //LA
											"background-color:green; color:white;", //CHPP
											"background-color:green;", //editor
											"background-color:#c3d9ff; color:black;", //foxtrick-dev
											"userId=1000 userId=1001 style='color:yellow;' userId=1002 style='background-color:yellow;'", //own
                                            "background-color:white; color:black;" //flag
											),
    OPTIONS : new Array("HT", "GM", "MOD", "LA", "CHPP", "editor", "foxtrick-dev","own", "flag"),
    // OPTIONS : new Array("HT", "GM", "MOD", "LA", "CHPP", "editor", "foxtrick-dev","own"),

    _DOC : {},

	htreg : /^HT-/i,
	gmreg : /^GM-/i,
	modreg : /^MOD-/i,
	chppreg : /^CHPP-/i,
	lareg : /^LA-/i,

	ulist:{},  // users and colors

    // var doc = Foxtrick.current_doc;
    editorsArray : new Array (
            "7areega",
            "Abu_Ahmed",
            "accull",
            "alea_iacta_est",
            "Aleksandar-GIGANT",
            "animator",
            "Arlequin",
            "AroKing",
            "bacardi444",
            "bischhoffshausen",
            "ChatJam",
            "christ14",
            "CoachDinamo",
            "daZOOpolitis",
            "dekios",
            "Editor-Bekurute",
            "Editor-Fileppi",
            "ehsan_farabi",
            "-erko-",
            "flexor_01",
            "gibbo101",
            "GM-Gizmo",
            "GM-Mjoelnir",
            "GM-Sowjon",
            "Goats34",
            "Guatemala",
            "GZ-Turkoo",
            "HajduckoSrce-Buska",
            "hallenberg",
            "Heidarr",
            "Hubert",
            "HuynhNamTuoc",
            "ibroal",
            "ishuaia",
            "ivo_stoyanov",
            "Jugemon",
            "julianignacio",
            "kikso",
            "kissherceg",
            "Krat64",
            "krespim",
            "LA-acarl",
            "LA-dancing_rob",
            "LA-GQPOZ",
            "LA-monad",
            "Maauwke",
            "MachimoI",
            "Magnus47",
            "MELAFEFON-zigdon",
            "mikesoft",
            "Mnord",
            "Mod-Assim",
            "Mod-Ed",
            "Mod-Hurrican",
            "Mod-Karlthegreat",
            "Mod-Suso",
            "MOD-Yarka",
            "pacsey",
            "Pedro-Dusbaum",
            "Peluza",
            "Petrovitsj",
            "prime_minister",
            "PuCeK17",
            "rcesantos",
            "Reallo",
            "Richard_B_Riddick",
            "sarfaraz",
            "SH-Patrick",
            "Sir-Kiko",
            "SkyfireX",
            "SLV-Stakvik",
            "snedy",
            "storm_lord",
            "Suli_sul",
            "tobinov",
            "ulrikbachmann",
            "unrockbar",
            "Viriatus",
            "Yami-Yugi",
            "Yndy_",
            "Zokisu",
            "ZurrieqGiants"
    ),

	foxtrickersArray : new Array (
			"_KOHb_",
			"_recluso_",
			"05erth",
			"baler0",
            "baumanns",
			"bummerland",
			"caracca",
            "carlesmu",
			"damyr",
			"eekels",
			"Egophobia",
            "ei04004",
			"franory",
            "Grif_07",
			"GTTWINS",
			"gucan",
			"Homzik",
            "JAM3SoN",
			"Jestar",
			"koba4ever",
			"kolmis",
			"Foppe-",
			"LA-Masterix",
			"LA-csajszi",
			"larsw84",
			"LasseSvendsen",
			"Leachey",
			"ljushaff",
			"MarceloFBrandao",
            "McTripas",
            "Mod-Karlthegreat",
			"MOD-odris",
			"Mod-spambot",
            "Mod-summercloud",
            "Nanouk_HT33",
			"OBarros",
            "Piper_101",
            "poceh_b",
			"Pyntsa",
            "Skoglund",
            "slader",
			"smates",
			"stephan57",
			"taised",
            "white_eagle"
    ),

    SELECT_ELEMENTS : new Array ( "ctl00_CPMain_ucThread_ucPagerTop_filterUser",
                                  "ctl00_CPMain_ucThread_ucPagerBottom_filterUser",
                                  "ctl00_CPMain_ddlRecipient"
    ),

		stl_HT :'',
		stl_GM : '',
		stl_MOD : '',
		stl_CHPP : '',
		stl_LA : '',
		stl_editor : '',
		editorsArray_joined : '',
		stl_foxtrick_dev : '',
        stl_flag : '',
		foxtrickersArray_joined :'',

    init : function() {

		this.stl_HT = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "HT_text");
          if (!this.stl_HT) this.stl_HT = this.OPTION_TEXTS_DEFAULT_VALUES[0];
        this.stl_GM = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "GM_text");
          if (!this.stl_GM) this.stl_GM = this.OPTION_TEXTS_DEFAULT_VALUES[1];
        this.stl_MOD = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "MOD_text");
          if (!this.stl_MOD) this.stl_MOD = this.OPTION_TEXTS_DEFAULT_VALUES[2];
        this.stl_CHPP = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "CHPP_text");
          if (!this.stl_CHPP) this.stl_CHPP = this.OPTION_TEXTS_DEFAULT_VALUES[3];
        this.stl_LA = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "LA_text");
          if (!this.stl_LA) this.stl_LA = this.OPTION_TEXTS_DEFAULT_VALUES[4];
        this.stl_editor = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "editor_text");
          if (!this.stl_editor) this.stl_editor = this.OPTION_TEXTS_DEFAULT_VALUES[5];
		this.editorsArray_joined = this.editorsArray.join();
		this.stl_foxtrick_dev = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "foxtrick-dev_text");
          if (!this.stl_foxtrick_dev) this.stl_foxtrick_dev = this.OPTION_TEXTS_DEFAULT_VALUES[6];
		this.stl_flag = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "flag_text");
          if (!this.stl_flag) this.stl_flag = this.OPTION_TEXTS_DEFAULT_VALUES[8];
        this.foxtrickersArray_joined = this.foxtrickersArray.join();

    },

    run : function( page, doc ) {
        this._DOC = doc;

			// getting userids and colors
			var utext = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "own_text");
            if (!utext)
				utext = this.OPTION_TEXTS_DEFAULT_VALUES[7];
            var users = '';
			if (Foxtrick.isModuleFeatureEnabled( this, "own")) {
				users = utext.match(/userid=(\d+)/ig);
				var ii=0,user;
				while ( user = users[ii++] ) {
					try {
						var ustyle = utext.substring(utext.search(user)).match(/style=\'(.+)\'/)[1];
						this.ulist[user.replace(/userid=/i,'')] = ustyle;
					} catch (e) {Foxtrick.alert('ForumStaffMarker: Error in Style for: '+ user);}
				}
			}

        switch( page )
        {
            case 'forumViewThread':
                // dump('forumViewThread\n');
                FoxtrickForumStaffMarker._MarkAliases_thread();
                FoxtrickForumStaffMarker._MarkAliases_select();
            break;

            case 'forumWritePost':
                // dump('forumWritePost\n');
                FoxtrickForumStaffMarker._MarkAliases_select();
            break;
        }
    },

	change : function( page, doc ) {

	},

    //Alias - Staff-Color
    _MarkAliases_thread : function () {
        try {
            var doc = this._DOC;

			var do_HT = Foxtrick.isModuleFeatureEnabled( this, "HT") ;
			var do_GM = Foxtrick.isModuleFeatureEnabled( this, "GM") ;
			var do_MOD = Foxtrick.isModuleFeatureEnabled( this, "MOD") ;
			var do_CHPP = Foxtrick.isModuleFeatureEnabled( this, "CHPP") ;
			var do_LA = Foxtrick.isModuleFeatureEnabled( this, "LA") ;
			var do_editor = Foxtrick.isModuleFeatureEnabled( this, "editor") ;
			var do_foxtrick_dev = Foxtrick.isModuleFeatureEnabled( this, "foxtrick-dev") ;
			var do_own = Foxtrick.isModuleFeatureEnabled( this, "own");

			var userDivs = Foxtrick.getElementsByClass("float_left", doc.getElementById('mainWrapper'));
			var i=0, user;
            while ( user = userDivs[i++] ) {
                var as = user.getElementsByTagName('a');
				var j=0, a;
                while ( a = as[j++] ) {
                    if (a.getAttribute("href").search(/\/Club\/Manager\/\?userId\=/i) == -1) continue;
                    if (a.getAttribute("href").search(/redir_to_league=true/i) != -1) continue;
                    var uname = Foxtrick.trim(a.textContent);
					var uid = a.href.replace(/.+userId=/i, "").match(/^\d+/);

                    if (do_HT && this.htreg.test(uname)) {
                        a.setAttribute("style", this.stl_HT);
                    } else if (do_GM && this.gmreg.test(uname)) {
                         a.setAttribute("style", this.stl_GM);
                    } else if (do_MOD && this.modreg.test(uname)) {
                        a.setAttribute("style", this.stl_MOD);
                    } else if (do_CHPP && this.chppreg.test(uname)) {
                        a.setAttribute("style", this.stl_CHPP);
                    } else if (do_LA && this.lareg.test(uname)) {
                        a.setAttribute("style", this.stl_LA);
                    } else if (do_editor && this.editorsArray_joined.search(uname) > -1) {
                        a.setAttribute("style", this.stl_editor);
                    } else if (do_foxtrick_dev && this.foxtrickersArray_joined.search(uname) > -1) {
                         a.setAttribute("style", this.stl_foxtrick_dev);
                    }
					if (do_own && this.ulist[uid]!=null) {
                        a.setAttribute("style", this.ulist[uid]);
                    }
                }
            }
        }
        catch(e) {
            dump('_MarkAliases_thread: '+e+'\n');
        }
    },

    //SelectBox - Staff-Color
    _MarkAliases_select : function () {
        try {
            var doc = this._DOC;
			var do_HT = Foxtrick.isModuleFeatureEnabled( this, "HT") ;
			var do_GM = Foxtrick.isModuleFeatureEnabled( this, "GM") ;
			var do_MOD = Foxtrick.isModuleFeatureEnabled( this, "MOD") ;
			var do_CHPP = Foxtrick.isModuleFeatureEnabled( this, "CHPP") ;
			var do_LA = Foxtrick.isModuleFeatureEnabled( this, "LA") ;
			var do_editor = Foxtrick.isModuleFeatureEnabled( this, "editor") ;
			var do_foxtrick_dev = Foxtrick.isModuleFeatureEnabled( this, "foxtrick-dev") ;
			var do_own = Foxtrick.isModuleFeatureEnabled( this, "own");

            var do_flag = Foxtrick.isModuleFeatureEnabled( this, "flag");

            var new_style = '';
            // dump('forumSELECT => select\n');
            for (var boxes = 0; boxes < this.SELECT_ELEMENTS.length; boxes++) {
                var el_Select = doc.getElementById( this.SELECT_ELEMENTS[boxes] );
                if (el_Select != null){
                    // dump('forumSELECT => select box:'+ boxes + '.\n');
					var i = 1, option;
                    while ( option = el_Select.options[i++] ) {
                        new_style = '';
                        //dump('forumSELECT => select i:'+ i + '.\n');
						var uname = Foxtrick.trim( option.text );
                        uname = uname.substring(0, uname.indexOf(' '));
                        if (uname == '') uname = Foxtrick.trim( option.text );
                        if  (uname == '') break;
						var uid=option.value;

						if (do_HT && this.htreg.test(uname)) {
							new_style += this.stl_HT;
						} else if (do_GM && this.gmreg.test(uname)) {
							new_style += this.stl_GM;
						} else if (do_MOD && this.modreg.test(uname)) {
							new_style += this.stl_MOD;
						} else if (do_CHPP && this.chppreg.test(uname)) {
							new_style += this.stl_CHPP;
						} else if (do_LA && this.lareg.test(uname)) {
							new_style += this.stl_LA;
						} else if (do_editor && this.editorsArray_joined.search(uname) > -1) {
							new_style += this.stl_editor;
						} else if (do_foxtrick_dev && this.foxtrickersArray_joined.search(uname) > -1) {
							new_style += this.stl_foxtrick_dev;
						}
						if (do_own && this.ulist[uid]!=null) {
							new_style = this.ulist[uid];
						}

                        if (do_flag) {
                            new_style += 'background-image: url("http://flags.alltidhattrick.org/userflags/' + option.value + '.gif"); background-position:2px 50%; background-repeat:no-repeat; padding-left:24px;';
                        }

                        option.setAttribute("style", new_style);
                    }
                }
            }
        }
        catch(e) {
            dump('FoxtrickForumStaffMarker'+e);
        }
    },
};
