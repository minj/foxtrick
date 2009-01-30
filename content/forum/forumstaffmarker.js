/**
 * forumstaffmarker.js
 * Foxtrick forum staff (HT, GM, Mod, CHPP, LA) marker
 * @author bummerland
 */

var FoxtrickForumStaffMarker = {

    MODULE_NAME : "ForumStaffMarker",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : true,
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : new Array("background:red;", //HT
											"background:orange; color:black;", //GM
                                            "background:yellow; color:black;", //MOD
											"background:white; color:green;", //LA
											"background:green; color:white;", //CHPP
											"background:green;", //editor
											"background:#c3d9ff; color:black;" //foxtrick-dev
											),
	OPTIONS : new Array("HT", "GM", "MOD", "LA", "CHPP", "editor", "foxtrick-dev"),

    _DOC : {},

	htreg : /^HT-/i,
	gmreg : /^GM-/i,
	modreg : /^MOD-/i,
	chppreg : /^CHPP-/i,
	lareg : /^LA-/i,


    // var doc = Foxtrick.current_doc;
    editorsArray : new Array (
			"1636ince",
			"7areega",
			"Abu_Ahmed",
			"accull",
			"alea_iacta_est",
			"Aleksandar-GIGANT",
			"animator",
			"Arlequin",
			"AroKing",
			"Assim",
			"bischhoffshausen",
			"ChatJam",
			"christ14",
			"CoachDinamo",
			"dancing_rob",
			"daZOOpolitis",
			"dekios",
			"Dr_Ed",
			"eblaise",
			"Editor-Bekurute",
			"Editor-Fileppi",
			"Editor-Huberth",
			"Ed-valkyria",
			"-erko-",
			"Gandalf28",
			"gibbo101",
			"GM-Mjoelnir",
			"GM-Sowjon",
			"Goats34",
			"GZ-Turkoo",
			"hallenberg",
			"ishuaia",
			"ivo_stoyanov",
			"Jugemon",
			"julianignacio",
			"kikso",
			"Krat64",
			"krespim",
			"LA-acarl",
			"LA-GQPOZ",
			"LA-monad",
			"Maauwke",
			"MachimoI",
			"Magnus47",
			"McOrionTT4",
			"MELAFEFON-omerzigdon",
			"mikesoft",
			"Mnord",
			"MOD-Gizmo",
			"Mod-Hurrican",
			"Mod-Karlthegreat",
			"Mod-Suso",
			"pacsey",
			"Pedro-Dusbaum",
			"Peluza",
			"Petrovitsj",
			"PuCeK17",
			"rcesantos",
			"Reallo",
			"Richard_B_Riddick",
			"rolacity",
			"sarfaraz",
			"sgtflint",
			"SH-Patrick",
			"Simsern",
			"Sir-Kiko",
			"SkyfireX",
			"snedy",
			"Suli_sul",
			"tha-king",
			"tobinov",
			"unrockbar",
			"Viriatus",
			"Yami-Yugi",
			"Yarka",
			"Yndy_",
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
			"convinced",
			"eekels",
			"franory",
            "Grif_07",
			"GTTWINS",
			"gucan",
			"Homzik",
            "JAM3SoN",
			"Jestar",
			"koba4ever",
			"kolmis",
			"LA-Foppe",
			"LA-Masterix",
			"larsw84",
			"LasseSvendsen",
			"Leach71",
			"ljushaff",
			"MarceloFBrandao",
			"Nanouk_HT33",
            "Mod-summercloud",
			"OBarros",
            "Piper_101",
			"Pyntsa",
			"smates",
			"spambot",
			"stephan57",
			"taised",
			"Theboyce"
    ),

    SELECT_ELEMENTS : new Array ( "ctl00_CPMain_ucThread_ucPagerTop_filterUser",
                                  "ctl00_CPMain_ucThread_ucPagerBottom_filterUser",
                                  "ctl00_CPMain_ddlRecipient"
    ),

    init : function() {
        Foxtrick.registerPageHandler( 'forumViewThread',
                                      FoxtrickForumStaffMarker );
        Foxtrick.registerPageHandler( 'forumWritePost',
                                      FoxtrickForumStaffMarker );
    },

    run : function( page, doc ) {
        this._DOC = doc;

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
            doc = this._DOC;
            userDivs = getElementsByClass("cfHeader", doc);

            //dump('forumViewThread => Alias\n');

            for (i=0; i< userDivs.length; i++){
                var user = userDivs[i];
                var as = user.getElementsByTagName('a');
                for (var j=0; j<as.length; j++) {
                    var a = as[j];
                    if (a.getAttribute("href").search(/\/Club\/Manager\/\?userId\=/i) == -1) continue;
                    if (a.getAttribute("href").search(/redir_to_league=true/i) != -1) continue;
                    var uname = Foxtrick.trim(a.textContent);

                    if (Foxtrick.isModuleFeatureEnabled( this, "HT") && this.htreg.test(uname)) {
                        var stl = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "HT_text");
                        if (!stl)
                            stl = this.OPTION_TEXTS_DEFAULT_VALUES[0];
                        a.setAttribute("style", stl);
                    } else if (Foxtrick.isModuleFeatureEnabled( this, "GM") && this.gmreg.test(uname)) {
                        var stl = FoxtrickPrefs.getString("modules." + this.MODULE_NAME + "." + "GM_text");
                        if (!stl)
                            stl = this.OPTION_TEXTS_DEFAULT_VALUES[1];
                        a.setAttribute("style", stl);
                    } else if (Foxtrick.isModuleFeatureEnabled( this, "MOD") && this.modreg.test(uname)) {
                        var stl = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "MOD_text");
                        if (!stl)
                            stl = this.OPTION_TEXTS_DEFAULT_VALUES[2];
                        a.setAttribute("style", stl);
                    } else if (Foxtrick.isModuleFeatureEnabled( this, "CHPP") && this.chppreg.test(uname)) {
                        var stl = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "CHPP_text");
                        if (!stl)
                            stl = this.OPTION_TEXTS_DEFAULT_VALUES[3];
                        a.setAttribute("style", stl);
                    } else if (Foxtrick.isModuleFeatureEnabled( this, "LA") && this.lareg.test(uname)) {
                        var stl = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "LA_text");
                        if (!stl)
                            stl = this.OPTION_TEXTS_DEFAULT_VALUES[4];
                        a.setAttribute("style", stl);
                    } else if (Foxtrick.isModuleFeatureEnabled( this, "editor") && this.editorsArray.join().search(uname) > -1) {
                        var stl = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "editor_text");
                        if (!stl)
                            stl = this.OPTION_TEXTS_DEFAULT_VALUES[5];
                        a.setAttribute("style", stl);
                    } else if (Foxtrick.isModuleFeatureEnabled( this, "foxtrick-dev") && this.foxtrickersArray.join().search(uname) > -1) {
                        var stl = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "foxtrick-dev_text");
                        if (!stl)
                            stl = this.OPTION_TEXTS_DEFAULT_VALUES[6];
                        a.setAttribute("style", stl);
                    }
                }
            }
        }
        catch(e) {
            dump(e);
        }
    },

    //SelectBox - Staff-Color
    _MarkAliases_select : function () {
        try {
            doc = this._DOC;

            // dump('forumSELECT => select\n');
            for (var boxes = 0; boxes < this.SELECT_ELEMENTS.length; boxes++) {
                var el_Select = doc.getElementById( this.SELECT_ELEMENTS[boxes] );
                if (el_Select != null){
                    // dump('forumSELECT => select box:'+ boxes + '.\n');
                    for (var i = 1; i < el_Select.length; i++) {
                        // dump('forumSELECT => select i:'+ i + '.\n');
                        var uname = Foxtrick.trim( el_Select.options[i].text );
                        uname = uname.substring(0, uname.indexOf(' '));
                        if (uname == '') uname = Foxtrick.trim( el_Select.options[i].text );
                        if  (uname == '') break;

                        if (Foxtrick.isModuleFeatureEnabled( this, "HT") && this.htreg.test(uname)) {
                            var stl = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "HT_text");
                            if (!stl)
                                stl = this.OPTION_TEXTS_DEFAULT_VALUES[0];
                            el_Select.options[i].setAttribute("style", stl);
                        } else if (Foxtrick.isModuleFeatureEnabled( this, "GM") && this.gmreg.test(uname)) {
                            var stl = FoxtrickPrefs.getString("modules." + this.MODULE_NAME + "." + "GM_text");
                            if (!stl)
                                stl = this.OPTION_TEXTS_DEFAULT_VALUES[1];
                            el_Select.options[i].setAttribute("style", stl);
                        } else if (Foxtrick.isModuleFeatureEnabled( this, "MOD") && this.modreg.test(uname)) {
                            var stl = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "MOD_text");
                            if (!stl)
                                stl = this.OPTION_TEXTS_DEFAULT_VALUES[2];
                            el_Select.options[i].setAttribute("style", stl);
                        } else if (Foxtrick.isModuleFeatureEnabled( this, "CHPP") && this.chppreg.test(uname)) {
                            var stl = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "CHPP_text");
                            if (!stl)
                                stl = this.OPTION_TEXTS_DEFAULT_VALUES[3];
                            el_Select.options[i].setAttribute("style", stl);
                        } else if (Foxtrick.isModuleFeatureEnabled( this, "LA") && this.lareg.test(uname)) {
                            var stl = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "LA_text");
                            if (!stl)
                                stl = this.OPTION_TEXTS_DEFAULT_VALUES[4];
                            el_Select.options[i].setAttribute("style", stl);
                        } else if (Foxtrick.isModuleFeatureEnabled( this, "editor") && this.editorsArray.join().search(uname) > -1) {
                            var stl = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "editor_text");
                            if (!stl)
                                stl = this.OPTION_TEXTS_DEFAULT_VALUES[5];
                            el_Select.options[i].setAttribute("style", stl);
                        } else if (Foxtrick.isModuleFeatureEnabled( this, "foxtrick-dev") && this.foxtrickersArray.join().search(uname) > -1) {
                            var stl = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "foxtrick-dev_text");
                            if (!stl)
                                stl = this.OPTION_TEXTS_DEFAULT_VALUES[6];
                            el_Select.options[i].setAttribute("style", stl);
                        }
                    }
                }
            }
        }
        catch(e) {
            dump(e);
        }
    },
};