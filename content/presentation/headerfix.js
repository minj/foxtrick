/**
 * headerfix.js
 * Script which fixes the header
 * @author htbaumanns, CSS by Catalyst2950  
 */

var FoxtrickHeaderFix = {
	
    MODULE_NAME : "HeaderFix",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.4.8.1",
	LASTEST_CHANGE:"Disabled on LiveFlash page",
	OPTIONS : new Array("FixLeft"),
	CSS_SIMPLE:"chrome://foxtrick/content/resources/css/headerfix.css",
	CSS:"chrome://foxtrick/content/resources/css/headerfix_std.css",
	CSS_SIMPLE_RTL:"chrome://foxtrick/content/resources/css/headerfix_rtl.css",
	CSS_RTL:"chrome://foxtrick/content/resources/css/headerfix_std_rtl.css",
	
    init : function() {
		if (Foxtrick.isModuleFeatureEnabled( this, "FixLeft"))
			FoxtrickPrefs.setBool( "module.HeaderFixLeft.enabled", true );				
		else FoxtrickPrefs.setBool( "module.HeaderFixLeft.enabled", false );
	
		dump ("module.HeaderFixLeft.enabled="+FoxtrickPrefs.getBool( "module.HeaderFixLeft.enabled")+'\n')	
    
        Foxtrick.registerPageHandler( 'match',this);
    },

    run : function( page, doc ) { 
	
	if (doc.location.href.search(/\/Club\/Matches\/Match.aspx/i)==-1) return;
	if (doc.location.href.search(/isYouth/i)!=-1) return;
	
	var ctl00_CPMain_pnlPreMatch = doc.getElementById("ctl00_CPMain_pnlPreMatch");
	var ctl00_CPMain_pnlTeamInfo = doc.getElementById("ctl00_CPMain_pnlTeamInfo");
	if (!ctl00_CPMain_pnlPreMatch || !ctl00_CPMain_pnlTeamInfo) return;	
	var ctl00_CPMain_pnlArenaFlash = doc.getElementById("ctl00_CPMain_pnlArenaFlash");
	var divs = ctl00_CPMain_pnlPreMatch.getElementsByTagName('div');
	var arenaInfo = ctl00_CPMain_pnlArenaFlash.nextSibling;
	var separator=null;
	for (var i=0;i<divs.length;++i) { 
		if (divs[i].className=='arenaInfo') {arenaInfo=divs[i];}
		if (divs[i].className=='separator') {separator=divs[i];}
	}

	ctl00_CPMain_pnlTeamInfo.setAttribute('style','float:left !important; margin-top:-20px;');

	if (separator) {
		separator = ctl00_CPMain_pnlPreMatch.removeChild(separator);	
		ctl00_CPMain_pnlPreMatch.appendChild(separator);
	}

	if (arenaInfo) {
		arenaInfo = ctl00_CPMain_pnlPreMatch.removeChild(arenaInfo);	
		ctl00_CPMain_pnlPreMatch.appendChild(arenaInfo);
		if (Foxtrick.isStandardLayout(doc)) arenaInfo.setAttribute('style','float:right !important;');
		else arenaInfo.setAttribute('style','float:right !important; width:190px !important;');
	}

	ctl00_CPMain_pnlArenaFlash = ctl00_CPMain_pnlPreMatch.removeChild(ctl00_CPMain_pnlArenaFlash);
	ctl00_CPMain_pnlPreMatch.appendChild(ctl00_CPMain_pnlArenaFlash);
	ctl00_CPMain_pnlArenaFlash.setAttribute('style','margin-top:25px;');

	
	},
	
	change : function( page, doc ) {	
	}
};

var FoxtrickHeaderFixLeft = {
	
    MODULE_NAME : "HeaderFixLeft",
    DEFAULT_ENABLED : false,	
	CSS_SIMPLE:"chrome://foxtrick/content/resources/css/headerfix_left.css",
	CSS_SIMPLE_RTL:"chrome://foxtrick/content/resources/css/headerfix_rtl_left.css",
	CSS:"chrome://foxtrick/content/resources/css/headerfix_std_left.css",
	CSS_RTL:"chrome://foxtrick/content/resources/css/headerfix_std_rtl_left.css",
	
    init : function() {  
	
	if (!Foxtrick.isModuleEnabled(FoxtrickHeaderFix))
		FoxtrickPrefs.setBool( "module.HeaderFixLeft.enabled", false );  
	dump ("module.HeaderFixLeft.enabled="+FoxtrickPrefs.getBool( "module.HeaderFixLeft.enabled")+'\n')	
    },

    run : function( page, doc ) { 
	},
	
	change : function( page, doc ) {	
	}
};