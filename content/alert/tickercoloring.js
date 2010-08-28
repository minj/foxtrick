/**
 * tickercoloring.js
 * Script which add colors to the ticker
 * @author htbaumanns
 */

var FoxtrickTickerColoring = {

    MODULE_NAME : "TickerColoring",
    MODULE_CATEGORY : Foxtrick.moduleCategories.ALERT,
	PAGES : new Array('all'),
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION : "0.5.1.2",
	LATEST_CHANGE : "Moved to alert category",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
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
    OLD_CSS:"",

    init : function() {
		var zaw = ''

		+'/*TICKERCOLOR_by_htbaumanns*/ @-moz-document domain(hattrick.org), domain(hattrick.interia.pl), domain(hattrick.ws)'
		+'{'
		/* LoginWelcome */
		+'#ticker a[href="/MyHattrick/"] {'+this.get_color(this.OPTIONS[0])+'}'
		/* LoginSupporters */
		+'#ticker a[href*="/Club/Manager/?teamId="] {'+this.get_color(this.OPTIONS[1])+'}'
		/* ForumReplyToMe */
		+'#ticker a[href*="/Forum/"] {'+this.get_color(this.OPTIONS[2])+'}'
		/* TransferMarket */
		+'#ticker a[href*="/Players/"] {'+this.get_color(this.OPTIONS[3])+'}'
		/* Challenges */
		+'#ticker a[href*="/Challenges/"] {'+this.get_color(this.OPTIONS[4])+'}'
		/* Guestbook */
		+'#ticker a[href*="/Club/Manager/Guestbook.aspx?teamid="] {'+this.get_color(this.OPTIONS[5])+'}'
		/* MailToMe */
		+'#ticker a[href*="/Inbox/"] {'+this.get_color(this.OPTIONS[6])+'}'
		/* MyHT Messages (e.g. raising bids) */
		+'#ticker a[href*="/Myhattrick/?actionType"] {'+this.get_color(this.OPTIONS[7])+'}'
		/* small margins */
		+'#ticker a {margin:2px;}'
		/* Hover */
		+'#ticker a:hover {'+this.get_color(this.OPTIONS[8])+'}'
		+'}'
		;
		this.OLD_CSS = this.CSS;
		if (Foxtrick.BuildFor=='Chrome') Foxtrick.load_css_permanent(zaw);
		else this.CSS=Foxtrick.GetDataURIText(zaw);

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
