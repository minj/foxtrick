/**
 * Highlight Bot teams
 *  * @author ljushaff
 */

FoxtrickHiglightBotTeams = {
	MODULE_NAME : "HiglightBotTeams",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('league'), 
	ONPAGEPREF_PAGE : 'presentation', 
    DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8.9",
	LATEST_CHANGE:"Highlight Bot teams on series pages",	
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	OPTIONS : new Array("HiglightBotTeams")
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : new Array("background-image: url('chrome://foxtrick/content/resources/img/bot.png'); background-repeat: no-repeat; padding: 0px 0px 0px 18px; !important;" //BotHiglight
											),        
	CSS:"",
    OLD_CSS:"",
	
    init : function() {
		var zaw = ''
		
		+'@-moz-document domain(hattrick.org), domain(hattrick.interia.pl), domain(hattrick.ws)'
		+'{'
		/* HiglightBotTeams */
		+'#series .shy[href="/World/Series/Default.aspx?LeagueLevelUnitID="] {'+this.get_color(this.OPTIONS[0])+'}'
		+'}'
		;
		this.OLD_CSS = this.CSS;
		this.CSS = Foxtrick.GetDataURIText(zaw);
    },

    run : function( page, doc ) {    		
	},
	
	change : function( page, doc ) {	
	},
	
	get_color : function( option ) {	
	    if (Foxtrick.isModuleFeatureEnabled( this, option)) {
			var color = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + option+"_text"); 
			return color;
		}
		for (var i=0;i<this.OPTIONS.length;++i) {
			if (this.OPTIONS[i]==option) return this.OPTION_TEXTS_DEFAULT_VALUES[i];
		}
		return "";
	}
};