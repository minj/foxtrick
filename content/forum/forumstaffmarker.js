/**
 * forumstaffmarker.js
 * Foxtrick forum staff (HT, GM, Mod, CHPP, LA) marker
 * @author bummerland
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickForumStaffMarker = {
   
   
  MODULE_NAME : "ForumStaffMarker",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : true,
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : new Array("background:red;", 
																					"background:orange; color:black;",
																					"background:yellow; color:black;",
																					"background:blue; color:black;",
																					"background:white; color:green;",
																					"background:green;",
																					"background:#c3d9ff; color:black;"
																					),
	OPTIONS : new Array("HT", "MOD", "GM", "LA", "CHPP", "editor", "foxtrick-dev"),



    init : function() {
        Foxtrick.registerPageHandler( 'forumViewThread',
                                      FoxtrickForumStaffMarker );
    },

    run : function( page, doc ) {
		
        // var doc = Foxtrick.current_doc;
		var editorsArray = [
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
			"ZurrieqGiants",];
		var foxtrickersArray = [
			"_KOHb_",
			"_recluso_",
			"05erth",
			"baler0",
			"bummerland",
			"caracca",
			"convinced",
			"eekels",
			"franory",
			"GTTWINS",
			"gucan",
			"Homzik",
			"Jestar",
			"koba4ever",
			"kolmis",
			"LA-Fryslanner-777",
			"larsw84",
			"LasseSvendsen",
			"Leach71",
			"ljushaff",
			"MarceloFBrandao",
			"Masterix",
			"obarros",
			"Pyntsa",
			"smates",
			"spambot",
			"stephan57",
			"taised",
			"Theboyce",];		
        switch( page )
        {
            case 'forumViewThread':
            
                // if ( !FoxtrickPrefs.getBool(
                            // FoxtrickForumStaffMarker._MARK_STAFF ) )
                    // break;
                 
                var userDivs = doc.evaluate(
		    	    "//div[@class='cfHeader']",
		    	    doc,
		    	    null,
		    	    Components.interfaces.nsIDOMXPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
		    	    null);
		    	
		    	for (i=0; i< userDivs.snapshotLength; i++){
		    		var user = userDivs.snapshotItem(i);
					var as = user.getElementsByTagName('a');
					for (var j=0; j<as.length; j++) {
						var a = as[j];
						if (a.getAttribute("href").search(/\/Club\/Manager\/\?userId\=/i) == -1) continue;
						var uname = Foxtrick.trim(a.textContent);
						htreg = /^HT-/i;
						gmreg = /^GM-/i;
						modreg = /^MOD-/i;
						chppreg = /^CHPP-/i;
						lareg = /^LA-/i;
						if (Foxtrick.isModuleFeatureEnabled( this, "HT") && htreg.test(uname)) {
							var stl = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "HT_text");
							if (!stl)
								stl = this.OPTION_TEXTS_DEFAULT_VALUES[0];
							a.setAttribute("style", stl);
						} else if (Foxtrick.isModuleFeatureEnabled( this, "GM") && gmreg.test(uname)) {
							var stl = FoxtrickPrefs.getString("modules." + this.MODULE_NAME + "." + "GM_text");
							if (!stl)
								stl = this.OPTION_TEXTS_DEFAULT_VALUES[1];
							a.setAttribute("style", stl);
						} else if (Foxtrick.isModuleFeatureEnabled( this, "MOD") && modreg.test(uname)) {
							var stl = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "MOD_text");
							if (!stl)
								stl = this.OPTION_TEXTS_DEFAULT_VALUES[2];
							a.setAttribute("style", stl);
						} else if (Foxtrick.isModuleFeatureEnabled( this, "CHPP") && chppreg.test(uname)) {
							var stl = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "CHPP_text");
							if (!stl)
								stl = this.OPTION_TEXTS_DEFAULT_VALUES[3];
							a.setAttribute("style", stl);
						} else if (Foxtrick.isModuleFeatureEnabled( this, "LA") && lareg.test(uname)) {
							var stl = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "LA_text");
							if (!stl)
								stl = this.OPTION_TEXTS_DEFAULT_VALUES[4];
							a.setAttribute("style", stl);
						} else if (Foxtrick.isModuleFeatureEnabled( this, "editor") && editorsArray.join().search(uname) > -1) {
							var stl = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "editor_text");
							if (!stl)
								stl = this.OPTION_TEXTS_DEFAULT_VALUES[5];
							a.setAttribute("style", stl);
						} else if (Foxtrick.isModuleFeatureEnabled( this, "foxtrick-dev") && foxtrickersArray.join().search(uname) > -1) {
							var stl = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "foxtrick-dev_text");
							if (!stl)
								stl = this.OPTION_TEXTS_DEFAULT_VALUES[6];
							a.setAttribute("style", stl);
						}						
					}
				}
    	
       			break;
        }
    },
	
	change : function( page, doc ) {
	
	}
};

