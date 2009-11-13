/**
 * predefinedChallenges.js
 * auto save challange settings
 * @author spambot
 */

var FoxTrickPredefinedChallenges = {

    MODULE_NAME : "PredefinedChallenges",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('teamPage'), 
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8.9",
	LATEST_CHANGE: "Automatic saving of challenge settings",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,

	init : function() {
    },

    run : function( page, doc ) {
        try {
            var sel_1 = doc.getElementById('ctl00_CPSidebar_ucVisitorActions_ddlMatchtype');
            if (sel_1 == null) return;
            var sel_2 = doc.getElementById('ctl00_CPSidebar_ucVisitorActions_ddlMatchPlace');
            var f_1 = FoxtrickPrefs.getInt("challenge.sel_1"); if (!f_1) f_1 = 0;
            var f_2 = FoxtrickPrefs.getInt("challenge.sel_2"); if (!f_2) f_2 = 0;
            sel_1.selectedIndex = f_1;
            sel_2.selectedIndex = f_2;
            sel_1.addEventListener('change',this.saveChallenge,false);
            sel_2.addEventListener('change',this.saveChallenge,false);
        } catch(e) {
            Foxtrick.dump(this.MODULE_NAME + ': ' + e + '\n');
        }        
        
	},

	change : function( page, doc ) {
		var sel_1 = 'ctl00_CPSidebar_ucVisitorActions_ddlMatchtype';
		if (doc.getElementById(sel_1)) {
			this.run( page, doc );
		}
	},
    
    saveChallenge : function (evt) {
        try {
            var doc = evt.target.ownerDocument;
            var sel_1 = doc.getElementById('ctl00_CPSidebar_ucVisitorActions_ddlMatchtype');
            var sel_2 = doc.getElementById('ctl00_CPSidebar_ucVisitorActions_ddlMatchPlace');
            FoxtrickPrefs.setInt("challenge.sel_1", sel_1.selectedIndex);
            FoxtrickPrefs.setInt("challenge.sel_2", sel_2.selectedIndex);
            return false;
        } catch(ee) {Foxtrick.alert(ee);}
    }
};