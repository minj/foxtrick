/**
 * tickercoloring.js
 * Script which add colors to the ticker
 * @author htbaumanns
 */

var FoxtrickTickerColoring = {
	
    MODULE_NAME : "TickerColoring",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.7",
	LASTEST_CHANGE:"Option to use custom color added",	
	OPTIONS : new Array("LoginWelcome","LoginSupporters","ForumReplyToMe","TransferMarket","Challenges","Guestbook","MailToMe","MyHTMessages","Hover"),
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : new Array("color:#000; background-color:#DFEFC2;",  // LoginWelcome
											"color:#000; background-color:#FFE8CF;",  // LoginSupporters
											"color:#000; background-color:#DFEEFF;",  // ForumReplyToMe
											"color:#000; background-color:#FFFBCF;",  // TransferMarket
											"color:#000; background-color:#FFDFE0;",  // Challenges
											"color:#000; background-color:#DFFFFD;",  // Guestbook
											"color:#000; background-color:#EEDFFF;",  // MailToMe
											"color:#000; background-color:#DFDFDF;",  // MyHTMessages
											"color:#000 !important; background-color: transparent !important;"  // Hover
											),        
	CSS:"",
        	
    init : function() {
            Foxtrick.registerPageHandler( 'all',
                                          FoxtrickTickerColoring);
										  
		var zaw = ''
		/* Ticker colors by htbaumanns*/
		+'@-moz-document domain(hattrick.org), domain(hattrick.interia.pl), domain(hattrick.ws)'
		+'{';
		
		/* LoginWelcome */
		if (Foxtrick.isModuleFeatureEnabled( this, "LoginWelcome"))
			zaw+='#ticker a[href="/MyHattrick/"] {'+this.get_color(this.OPTIONS[0])+'}';
		/* LoginSupporters */
		if (Foxtrick.isModuleFeatureEnabled( this, "LoginSupporters"))
			zaw+='#ticker a[href*="/Club/Manager/?teamId="] {'+this.get_color(this.OPTIONS[1])+'}';
		/* ForumReplyToMe */
		if (Foxtrick.isModuleFeatureEnabled( this, "ForumReplyToMe"))
			zaw+='#ticker a[href*="/Forum/"] {'+this.get_color(this.OPTIONS[2])+'}';
		/* TransferMarket */
		if (Foxtrick.isModuleFeatureEnabled( this, "TransferMarket"))
			zaw+='#ticker a[href*="/Players/"] {'+this.get_color(this.OPTIONS[3])+'}';
		/* Challenges */
		if (Foxtrick.isModuleFeatureEnabled( this, "Challenges"))
			zaw+='#ticker a[href*="/Challenges/"] {'+this.get_color(this.OPTIONS[4])+'}';
		/* Guestbook */
		if (Foxtrick.isModuleFeatureEnabled( this, "Guestbook"))
			zaw+='#ticker a[href*="/Club/Manager/Guestbook.aspx?teamid="] {'+this.get_color(this.OPTIONS[5])+'}';
		/* MailToMe */
		if (Foxtrick.isModuleFeatureEnabled( this, "MailToMe"))
			zaw+='#ticker a[href*="/Inbox/"] {'+this.get_color(this.OPTIONS[6])+'}'
		/* MyHT Messages (e.g. raising bids) */
		if (Foxtrick.isModuleFeatureEnabled( this, "MyHTMessages"))
			zaw+='#ticker a[href*="/Myhattrick/?actionType"] {'+this.get_color(this.OPTIONS[7])+'}';
		/* small margins */
		+'#ticker a {margin:2px;}'
		/* Hover */
		if (Foxtrick.isModuleFeatureEnabled( this, "Hover"))
			zaw+='#ticker a:hover {'+this.get_color(this.OPTIONS[8])+'}';
		zaw+='}';
		
		this.CSS = FoxtrickGetDataURIText(zaw);
										  
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
			if (this.OPTIONS[i]==option) return OPTION_TEXTS_DEFAULT_VALUES[i];
		}
		return "";
	}
};