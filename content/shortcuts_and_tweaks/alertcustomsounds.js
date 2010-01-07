/**
 * TickerCustomSounds.js
 * custom sounds for ticker events
 * @author convincedd
 */

var FoxtrickAlertCustomSounds = {
	
    MODULE_NAME : "AlertCustomSounds",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('all'), 
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.4.9.1",
	LATEST_CHANGE:"Setting default sounds",	
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	OPTIONS : new Array("LoginWelcome","LoginSupporters","ForumReplyToMe","TransferMarket","Challenges","Guestbook","MailToMe","MyHTMessages"),
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : new Array(Foxtrick.ResourcePath+"resources/sounds/DingLing.wav",  // LoginWelcome
											Foxtrick.ResourcePath+"resources/sounds/DingLing.wav",  // LoginSupporters
											Foxtrick.ResourcePath+"resources/sounds/DingLing.wav",  // ForumReplyToMe
											Foxtrick.ResourcePath+"resources/sounds/DingLing.wav",  // TransferMarket
											Foxtrick.ResourcePath+"resources/sounds/DingLing.wav",  // Challenges
											Foxtrick.ResourcePath+"resources/sounds/DingLing.wav",  // Guestbook
											Foxtrick.ResourcePath+"resources/sounds/DingLing.wav",  // MailToMe
											Foxtrick.ResourcePath+"resources/sounds/DingLing.wav"  // MyHTMessages
											),        
	urls: new Array(/\/MyHattrick\/$/gi,
					/\/Club\/Manager\/\?teamId=/gi,
					/\/Forum\//gi,
					/\/Players\//gi,
					/\/Challenges\//gi,
					/\/Club\/Manager\/Guestbook.aspx\?teamid=/gi,
					/\/Inbox\//gi,
					/\/Myhattrick\/\?actionType/gi
					),
											
    init : function() {
		if (Foxtrick.BuildFor=='Chrome') {
			this.OPTION_TEXTS_DEFAULT_VALUES[0] = "http://foxtrick.googlecode.com/svn/branches/chrome/resources/sounds/DingLing.mp3";  // LoginWelcome
			this.OPTION_TEXTS_DEFAULT_VALUES[0] = "http://foxtrick.foundationhorizont.org/alertsounds/LoginSupporters.mp3";  // LoginSupporters
			this.OPTION_TEXTS_DEFAULT_VALUES[0] = "http://foxtrick.foundationhorizont.org/alertsounds/ForumReplyToMe.mp3"; // ForumReplyToMe
			this.OPTION_TEXTS_DEFAULT_VALUES[0] = "http://foxtrick.foundationhorizont.org/alertsounds/TransferMarket.mp3"; // TransferMarket
			this.OPTION_TEXTS_DEFAULT_VALUES[0] = "http://foxtrick.foundationhorizont.org/alertsounds/Challenges.mp3"; // Challenges
			this.OPTION_TEXTS_DEFAULT_VALUES[0] = "http://foxtrick.foundationhorizont.org/alertsounds/Guestbook.mp3"; // Guestbook
			this.OPTION_TEXTS_DEFAULT_VALUES[0] = "http://foxtrick.foundationhorizont.org/alertsounds/MailToMe.mp3"; // MailToMe
			this.OPTION_TEXTS_DEFAULT_VALUES[0] = "http://foxtrick.foundationhorizont.org/alertsounds/MyHTMessages.mp3"; // MyHTMessages
		}       
    },

    run : function( page, doc ) {    		
	},
	
	change : function( page, doc ) {	
	},
};