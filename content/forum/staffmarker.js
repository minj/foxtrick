/**
 * staffmarker.js
 * Foxtrick forum staff (HT, GM, Mod, CHPP, LA) marker
 * @author bummerland
 */

var FoxtrickStaffMarker = {

    MODULE_NAME : "StaffMarker",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forumViewThread','forumWritePost'),
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8.3",
	LASTEST_CHANGE:"added flags to select boxes, added CHPP holder",
	LASTEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : new Array("background-color:red;", //HT
											"background-color:orange; color:black;", //GM
                                            "background-color:yellow; color:black;", //MOD
											"background-color:white; color:green;", //LA
											"background-color:green; color:white;", //CHPP
											"background-color:green;", //editor
											"background-image: url('chrome://foxtrick/content/resources/linkicons/foxtrick_2.png'); background-repeat: no-repeat; padding: 1px 0px 3px 18px;", //foxtrick-dev
											"background-image: url('chrome://foxtrick/content/resources/linkicons/chpp.png'); background-repeat: no-repeat; padding: 1px 0px 3px 40px;", //chpps
											"background-image: url('chrome://foxtrick/content/resources/linkicons/hyouthclub_small.png'); background-repeat: no-repeat; padding: 1px 0px 3px 18px;", //hty_staff
											"background-color:white; color:black;", //flag
											"userId=1000 userId=1001 style='color:yellow;' userId=1002 style='background-color:yellow;'" //own
                                            ),
    OPTIONS : new Array("HT", "GM", "MOD", "LA", "CHPP", "editor", "foxtrick-dev", "chpp-holder", "hty_staff", "flag", "own"),
    // OPTIONS : new Array("HT", "GM", "MOD", "LA", "CHPP", "editor", "foxtrick-dev","own"),
    
	htreg : /^HT-/i,
	gmreg : /^GM-/i,
	modreg : /^MOD-/i,
	chppreg : /^CHPP-/i,
	lareg : /^LA-/i,

	ulist:{},  // users and colors
	
	chppholder : new Array (
                            'CAT-POGF',
                            'Absolut',
                            'amiad21',
                            'Nils-N',
                            'bertbert',
                            'sylvain',
                            'MD-JakobTrier',
                            'Multiplex',
                            'facol',
                            'Loke_',
                            'Rheuma-Kai',
                            'HT-Thomas',
                            'gardier',
                            'Odiobill',
                            'adrianomm',
                            'qc6803',
                            'HT-Chris',
                            'aYcon',
                            'DorkPower',
                            'Canhao',
                            'Mackshot',
                            'peter20',
                            'FreshT',
                            'hayde',
                            'hayde',
                            'hayde',
                            'Perseo_FIC',
                            'Odiobill',
                            'Wladi',
                            '-tof-',
                            'goran77',
                            'MD-JakobTrier',
                            'MD-JakobTrier',
                            'MD-JakobTrier',
                            'carlesmu',
                            'groton',
                            'dbdbdb',
                            'Kusco',
                            'Brzi_',
                            'HT-weird_ed',
                            'joeridb',
                            'Scratchy',
                            'adrianomm',
                            'Xirius',
                            'Joselo1971',
                            'wysota',
                            'CAT-POGF',
                            'Rheuma-Kai',
                            'gardier',
                            'JoseEstebes',
                            'Frederic-HT2D',
                            'Causea',
                            '0scar',
                            'Kusco',
                            'hayde',
                            'CHPP-IndianaRed',
                            'Hitman_47',
                            'CAT-POGF',
                            'HT-weird_ed',
                            'a_alvarez',
                            'PatrickBrans',
                            'CHPP-Alf',
                            'griggle',
                            'hayde',
                            'Mod-Jacome',
                            'nmendes',
                            'abyssahx',
                            'Rob1n',
                            'hayde',
                            'Pupske',
                            'beebop',
                            'taised',
                            'bennh',
                            'TopGodo',
                            'mikehell',
                            'vitrail',
                            'Ostekiks',
                            'Lobster',
                            'abubilla',
                            'hayde',
                            'RinghioCoach',
                            'hybris0',
                            'Polock',
                            'Mod-Jacome',
                            'llezama',
                            'DerKanzler',
                            'destor77',
                            'Peaso',
                            'hayde',
                            'Mackalito',
                            'Peaso',
                            'yeltzin',
                            'CHPP-IndianaRed',
                            'smates',
                            'borzos',
                            '-Edke',
                            'MarcicoX',
                            'Belette',
                            'obsy_',
                            'Guyroux',
                            'Mati_',
                            'hayde',
                            'alcek2004',
                            'GM-LA-beawolf',
                            'Mistr_Moon',
                            'GM-Accusor',
                            'gegevert',
                            'RoniMenashe',
                            'SSK-DavisvilleSC',
                            'smates',
                            'Siramthar',
                            'taxitzis',
                            'hobbyisten',
                            'Deslatos',
                            'Minkfish',
                            'RodrigoChopp',
                            'Adjanakis',
                            'Emporeor',
                            'taxitzis',
                            'tgudlek',
                            'TopGodo',
                            'reuvem',
                            'SSK-DavisvilleSC',
                            'RoniMenashe',
                            'SSK-DavisvilleSC',
                            'RoniMenashe',
                            'SSK-DavisvilleSC',
                            'Emporeor',
                            'RoniMenashe',
                            'Maauwke',
                            'doof92',
                            'TopGodo',
                            'magnusts',
                            'Mod-Jacome',
                            'SSK-DavisvilleSC',
                            'SSK-DavisvilleSC',
                            'suchywojtas',
                            'fabdan14',
                            'GRASSU_',
                            'SSK-DavisvilleSC',
                            '--MK--',
                            'SSK-DavisvilleSC',
                            'RoniMenashe',
                            'smates',
                            'GM-LA-beawolf',
                            'Emporeor',
                            'Poul_UA',
                            'SSK-DavisvilleSC',
                            'HT-weird_ed',
                            'Anosmie',
                            'GM-Mjoelnir',
                            'Mod-spambot',
                            'Hoedinie',
                            'hayde',
                            'kiusap',
                            'vlaFN',
                            'Re4VeR',
                            'GOD-Jalonen',
                            'GM-teles',
                            'MD-JakobTrier'
    ),

    editorsArray : new Array (
            "7areega",
            "Abu_Ahmed",
            "Adhamino",
            "alea_iacta_est",
            "Aleksandar-GIGANT",
            "animator",
            "Arlequin",
            "AroKing",
            "astra_",
            "bacardi444",
            "bischhoffshausen",
            "bot_fl",
            "Buska",
            "ChatJam",
            "Chiminicuarta",
            "christ14",
            "CoachDinamo",
            "daZOOpolitis",
            "dekios",
            "Editor-Alexo",
            "Editor-Bekurute",
            "Editor-Fileppi",
            "Editor-JDelhaRD",
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
            "hallenberg",
            "Heidarr",
            "HuynhNamTuoc",
            "ibroal",
            "ishuaia",
            "ivo_stoyanov",
            "-Juge-",
            "julianignacio",
            "kikso",
            "Krat64",
            "krespim",
            "LA-acarl",
            "LA-dancing_rob",
            "LA-GQPOZ",
            "Maauwke",
            "MachimoI",
            "MELAFEFON-zigdon",
            "mikesoft",
            "Mnord",
            "MOD-accull",
            "Mod-Assim",
            "Mod-Ed",
            "Mod-Hurrican",
            "Mod-Karlthegreat",
            "Mod-monad",
            "Mod-Shamil",
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
            "Thomaswilliamhudson",
            "tobinov",
            "ulrikbachmann",
            "unrockbar",
            "Viriatus",
            "Yami-Yugi",
            "Yndy_",
            "Zokisu",
            "Zolfaghar",
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
			"Foppe-",
			"luminaryan",
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
            "GM-Nanouk",
			"OBarros",
            "Piper_101",
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
		stl_hty_staff : '',
		stl_LA : '',
		stl_editor : '',
		//editorsArray_joined : '',
        chpps_joined : '',
		//hty_staff_joined : '',
		stl_foxtrick_dev : '',
        stl_flag : '',
		//foxtrickersArray_joined :'',

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
		//this.editorsArray_joined = this.editorsArray.join();
        this.stl_foxtrick_dev = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "foxtrick-dev_text");
          if (!this.stl_foxtrick_dev) this.stl_foxtrick_dev = this.OPTION_TEXTS_DEFAULT_VALUES[6];
		//this.foxtrickersArray_joined = this.foxtrickersArray.join();
		this.stl_chpps = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "chpps_text");
          if (!this.stl_chpps) this.stl_chpps = this.OPTION_TEXTS_DEFAULT_VALUES[7];
		//this.chpps_joined = this.chppholder.join();
		this.stl_hty_staff = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "hty_staff_text");
          if (!this.stl_hty_staff) this.stl_hty_staff = this.OPTION_TEXTS_DEFAULT_VALUES[8];
		//this.hty_staff_joined = this.hty_staff.join();
		this.stl_flag = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "flag_text");
          if (!this.stl_flag) this.stl_flag = this.OPTION_TEXTS_DEFAULT_VALUES[9];
        
    },

    run : function( page, doc ) {
        
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
					} catch (e) {Foxtrick.alert('StaffMarker: Error in Style for: '+ user);}
				}
			}

        switch( page )
        {
            case 'forumViewThread':
                // dump('forumViewThread\n');
                FoxtrickStaffMarker._MarkAliases_thread(doc);
                FoxtrickStaffMarker._MarkAliases_select(doc);
            break;

            case 'forumWritePost':
                // dump('forumWritePost\n');
                FoxtrickStaffMarker._MarkAliases_select(doc);
            break;
        }
    },

	change : function( page, doc ) {

	},

    //Alias - Staff-Color
    _MarkAliases_thread : function (doc) {
        try {
			var do_HT = Foxtrick.isModuleFeatureEnabled( this, "HT") ;
			var do_GM = Foxtrick.isModuleFeatureEnabled( this, "GM") ;
			var do_MOD = Foxtrick.isModuleFeatureEnabled( this, "MOD") ;
			var do_CHPP = Foxtrick.isModuleFeatureEnabled( this, "CHPP") ;
			var do_LA = Foxtrick.isModuleFeatureEnabled( this, "LA") ;
			var do_editor = Foxtrick.isModuleFeatureEnabled( this, "editor") ;
			var do_foxtrick_dev = Foxtrick.isModuleFeatureEnabled( this, "foxtrick-dev") ;
			var do_chpps = Foxtrick.isModuleFeatureEnabled( this, "chpp-holder") ;
			var do_hty_staff = Foxtrick.isModuleFeatureEnabled( this, "hty_staff") ;
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
                    //Workarround for supporter star
                    if (uname.lastIndexOf('*') == uname.length-1) {
                        // dump (uname + '\n');
                        // dump (uname.substring(0,uname.length-1) + '\n');
                        uname = uname.substring(0,uname.length-1);
                    }
					var uid = a.href.replace(/.+userId=/i, "").match(/^\d+/);

					// earlier overwrites later. 
					if (do_own && this.ulist[uid]!=null) {
                        a.setAttribute("style", this.ulist[uid]);
                    }
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
                    } else if (do_editor && Foxtrick.in_array(this.editorsArray,uname)) {
                        a.setAttribute("style", this.stl_editor);
                    } 
					// adding background images. lowest priority first
					if (do_hty_staff && Foxtrick.in_array(this.hty_staff,uname)) {
                        a.setAttribute("style",  a.getAttribute("style")+this.stl_hty_staff);
                    } 
					if (do_chpps && Foxtrick.in_array(this.chppholder,uname)) {
                        a.setAttribute("style", a.getAttribute("style")+this.stl_chpps );
                    } 
					if (do_foxtrick_dev && Foxtrick.in_array(this.foxtrickersArray,uname)) {
						 a.setAttribute("style", a.getAttribute("style")+this.stl_foxtrick_dev);						
                    }
					
                }
            }
        }
        catch(e) {
            dump('_MarkAliases_thread: '+e+'\n');
        }
    },

    //SelectBox - Staff-Color
    _MarkAliases_select : function (doc) {
        try {
			var do_HT = Foxtrick.isModuleFeatureEnabled( this, "HT") ;
			var do_GM = Foxtrick.isModuleFeatureEnabled( this, "GM") ;
			var do_MOD = Foxtrick.isModuleFeatureEnabled( this, "MOD") ;
			var do_CHPP = Foxtrick.isModuleFeatureEnabled( this, "CHPP") ;
			var do_LA = Foxtrick.isModuleFeatureEnabled( this, "LA") ;
			var do_editor = Foxtrick.isModuleFeatureEnabled( this, "editor") ;
			var do_foxtrick_dev = Foxtrick.isModuleFeatureEnabled( this, "foxtrick-dev") ;
            var do_chpps = Foxtrick.isModuleFeatureEnabled( this, "chpp-holder") ;
			var do_hty_staff = Foxtrick.isModuleFeatureEnabled( this, "hty_staff") ;
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

						if (do_own && this.ulist[uid]!=null) {
							new_style = this.ulist[uid];
						}
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
                        } else if (do_editor && Foxtrick.in_array(this.editorsArray,uname)) {
                            new_style +=  this.stl_editor;
                        } else if (do_hty_staff && Foxtrick.in_array(this.hty_staff,uname)) {
                            new_style += this.stl_hty_staff;
                        } else if (do_chpps && Foxtrick.in_array(this.chppholder,uname)) {
                            new_style += this.stl_chpps;
                        } else if (do_foxtrick_dev && Foxtrick.in_array(this.foxtrickersArray,uname)) {
                            new_style +=  this.stl_foxtrick_dev;
                        }
					
                        if (do_flag) {
                            new_style += ';background-image: url("http://flags.alltidhattrick.org/userflags/' + option.value + '.gif");  background-repeat:no-repeat; padding-left:2px; background-position:180px 50%; width:195px;border-bottom:dotted thin #ddd';
                        }
                        option.setAttribute("style", new_style);
                    }
                }
            }
        }
        catch(e) {
            dump('FoxtrickStaffMarker'+e);
        }
    },
};
