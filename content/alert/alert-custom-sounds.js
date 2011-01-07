/**
 * TickerCustomSounds.js
 * custom sounds for ticker events
 * @author convincedd
 */

var FoxtrickAlertCustomSounds = {
	MODULE_NAME : "AlertCustomSounds",
	MODULE_CATEGORY : Foxtrick.moduleCategories.ALERT,
	PAGES : ["all"],
	OPTIONS : ["LoginWelcome","LoginSupporters","ForumReplyToMe","TransferMarket","Challenges","Guestbook","MailToMe","MyHTMessages"],
	OPTION_TEXTS : true,
	urls : [/\/MyHattrick\/$/gi,
		/\/Club\/Manager\/\?teamId=/gi,
		/\/Forum\//gi,
		/\/Players\//gi,
		/\/Challenges\//gi,
		/\/Club\/Manager\/Guestbook.aspx\?teamid=/gi,
		/\/Inbox\//gi,
		/\/Myhattrick\/\?actionType/gi
	]
};
