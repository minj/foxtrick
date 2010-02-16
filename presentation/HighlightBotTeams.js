/**
 * Highlight Bot teams
 *  * @author ljushaff
 */

FoxtrickHighlightBotTeams = {
	MODULE_NAME : "HighlightBotTeams",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('league'), 
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.4.9",
	LATEST_CHANGE:"Highlight Bot teams on series pages",	
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	OPTIONS : new Array("ChooseColorHighlight"),
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : new Array("background-image: url('"+Foxtrick.ResourcePath+"resources/img/bot.png'); background-repeat: no-repeat; padding: 0px 0px 0px 18px;" //BotHiglight
											),        
	CSS:"",
    OLD_CSS:"",
	
    init : function() {
		var zaw = ''
		
		+'@-moz-document domain(hattrick.org), domain(hattrick.interia.pl), domain(hattrick.ws)'
		+'{'
		/* HighlightBotTeams */
		+'#aspnetForm[action*="Default.aspx?LeagueLevelUnitID="] table[class="indent"] .shy {'+this.get_color(this.OPTIONS[0])+'}'
		+'}'
		;
		this.OLD_CSS = this.CSS;
		if (Foxtrick.BuildFor=='Chrome') Foxtrick.load_css_permanent(zaw);
		else this.CSS=Foxtrick.GetDataURIText(zaw);
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