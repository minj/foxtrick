/**
 * TickerCustomSounds.js
 * custom sounds for ticker events
 * @author convincedd
 */

var FoxtrickAlertCustomSounds = {
	
    MODULE_NAME : "AlertCustomSounds",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('all'), 
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.9",
	LATEST_CHANGE:"Option to use custom alert sounds by event",	
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	OPTIONS : new Array("LoginWelcome","LoginSupporters","ForumReplyToMe","TransferMarket","Challenges","Guestbook","MailToMe","MyHTMessages"),
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : new Array("chrome://foxtrick/content/resources/sounds/DingLing.wav",  // LoginWelcome
											"chrome://foxtrick/content/resources/sounds/DingLing.wav",  // LoginSupporters
											"chrome://foxtrick/content/resources/sounds/DingLing.wav",  // ForumReplyToMe
											"chrome://foxtrick/content/resources/sounds/DingLing.wav",  // TransferMarket
											"chrome://foxtrick/content/resources/sounds/DingLing.wav",  // Challenges
											"chrome://foxtrick/content/resources/sounds/DingLing.wav",  // Guestbook
											"chrome://foxtrick/content/resources/sounds/DingLing.wav",  // MailToMe
											"chrome://foxtrick/content/resources/sounds/DingLing.wav"  // MyHTMessages
											),        
	urls: new Array("/MyHattrick/$",
					"/Club/Manager/?teamId=",
					"/Forum/",
					"/Players/",
					"/Challenges/",
					"/Club/Manager/Guestbook.aspx?teamid=",
					"/Inbox/",
					"/Myhattrick/?actionType"
					),
											
    init : function() {
    },

    run : function( page, doc ) {    		
	},
	
	change : function( page, doc ) {	
	},
};