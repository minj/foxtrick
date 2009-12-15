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
	OPTION_TEXTS_DEFAULT_VALUES : new Array("chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/sounds/DingLing.wav",  // LoginWelcome
											"chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/sounds/DingLing.wav",  // LoginSupporters
											"chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/sounds/DingLing.wav",  // ForumReplyToMe
											"chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/sounds/DingLing.wav",  // TransferMarket
											"chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/sounds/DingLing.wav",  // Challenges
											"chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/sounds/DingLing.wav",  // Guestbook
											"chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/sounds/DingLing.wav",  // MailToMe
											"chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/sounds/DingLing.wav"  // MyHTMessages
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
    },

    run : function( page, doc ) {    		
	},
	
	change : function( page, doc ) {	
	},
};