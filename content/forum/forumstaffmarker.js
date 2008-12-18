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

    _MARK_STAFF : "mark_staff",


    init : function() {
        Foxtrick.registerPageHandler( 'forumViewThread',
                                      FoxtrickForumStaffMarker );
    },

    run : function( page, doc ) {
		
        // var doc = Foxtrick.current_doc;
		var editorsArray = ["1636ince",
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
						if (htreg.test(uname)) {
							a.style.background="red";
							//a.innerHTML = "<SPAN style=\"background: red\"><B>" + uname + "</B></SPAN>";
						} else if (gmreg.test(uname)) {
							a.style.background="orange";
							a.style.color="black";
							//a.innerHTML = "<SPAN style=\"color: black; background: orange\"><B>" + uname + "</B></SPAN>";
						} else if (modreg.test(uname)) {
							a.style.background="yellow";
							a.style.color="black";
							//a.innerHTML = "<SPAN style=\"color: black; background: yellow\"><B>" + uname + "</B></SPAN>";
						} else if (chppreg.test(uname)) {
							a.style.background="blue";
							//a.innerHTML = "<SPAN style=\"background: blue\"><B>" + uname + "</B></SPAN>";
						} else if (lareg.test(uname)) {
							a.style.background="white";
							a.style.color="green";
							//a.innerHTML = "<SPAN style=\"color: green; background: white\"><B>" + uname + "</B></SPAN>";
						} else if (editorsArray.join().search(uname) > -1) {
							a.style.background="green";
						}
					}
				}
    	
       			break;
        }
    }
};

