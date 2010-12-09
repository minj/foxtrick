/**
 * TickerCustomSounds.js
 * custom sounds for ticker events
 * @author convincedd
 */

var FoxtrickAlertCustomSounds = {
    MODULE_NAME : "AlertCustomSounds",
    MODULE_CATEGORY : Foxtrick.moduleCategories.ALERT,
	PAGES : new Array('all'),
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
			this.OPTION_TEXTS_DEFAULT_VALUES[1] = "http://foxtrick.foundationhorizont.org/alertsounds/LoginSupporters.mp3";  // LoginSupporters
			this.OPTION_TEXTS_DEFAULT_VALUES[2] = "http://foxtrick.foundationhorizont.org/alertsounds/ForumReplyToMe.mp3"; // ForumReplyToMe
			this.OPTION_TEXTS_DEFAULT_VALUES[3] = "http://foxtrick.foundationhorizont.org/alertsounds/TransferMarket.mp3"; // TransferMarket
			this.OPTION_TEXTS_DEFAULT_VALUES[4] = "http://foxtrick.foundationhorizont.org/alertsounds/Challenges.mp3"; // Challenges
			this.OPTION_TEXTS_DEFAULT_VALUES[5] = "http://foxtrick.foundationhorizont.org/alertsounds/Guestbook.mp3"; // Guestbook
			this.OPTION_TEXTS_DEFAULT_VALUES[6] = "http://foxtrick.foundationhorizont.org/alertsounds/MailToMe.mp3"; // MailToMe
			this.OPTION_TEXTS_DEFAULT_VALUES[7] = "http://foxtrick.foundationhorizont.org/alertsounds/MyHTMessages.mp3"; // MyHTMessages
		}
    }
};
