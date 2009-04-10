/**
 * headerfix.js
 * Script which fixes the header
 * @author htbaumanns, CSS by Catalyst2950  
 */

var FoxtrickHeaderFix = {
	
    MODULE_NAME : "HeaderFix",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.4.6.2",
	SCREENSHOT:"",
	PREF_SCREENSHOT:"",
	LASTEST_CHANGE:"Moved fixing of submenue to a seperate option (default on)",
	OPTIONS : new Array("FixLeft"),
	CSS_SIMPLE:"chrome://foxtrick/content/resources/css/headerfix.css",
	CSS:"chrome://foxtrick/content/resources/css/headerfix_std.css",
	
    init : function() {
		if (Foxtrick.isModuleFeatureEnabled( this, "FixLeft"))
			FoxtrickPrefs.setBool( "module.HeaderFixLeft.enabled", true );				
		else FoxtrickPrefs.setBool( "module.HeaderFixLeft.enabled", false );
    },

    run : function( page, doc ) { 
	},
	
	change : function( page, doc ) {	
	}
};

var FoxtrickHeaderFixLeft = {
	
    MODULE_NAME : "HeaderFixLeft",
    DEFAULT_ENABLED : false,
	CSS_SIMPLE:"chrome://foxtrick/content/resources/css/headerfix_left.css",
	CSS_SIMPLE_RTL:"chrome://foxtrick/content/resources/css/headerfix_left_rtl.css",
	CSS:"chrome://foxtrick/content/resources/css/headerfix_left_std.css",
	CSS_RTL:"chrome://foxtrick/content/resources/css/headerfix_left_std_rtl.css",
	
    init : function() {    
    },

    run : function( page, doc ) { 
	},
	
	change : function( page, doc ) {	
	}
};