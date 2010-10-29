/**
 * alertCustom.js
 * custom turn off for ticker events
 * @author convincedd
 */

var FoxtrickAlertCustomOff = {
    MODULE_NAME : "AlertCustomOff",
    MODULE_CATEGORY : Foxtrick.moduleCategories.ALERT,
	PAGES : new Array('all'),
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION : "0.5.1.2",
	LATEST_CHANGE : "Moved to alert category.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	OPTIONS : new Array("LoginWelcome","LoginSupporters","ForumReplyToMe","TransferMarket","Challenges","Guestbook","MailToMe","MyHTMessages"),
	urls: new Array(/\/MyHattrick\/$/gi,
					/\/Club\/Manager\/\?teamId=/gi,
					/\/Forum\//gi,
					/\/Players\//gi,
					/\/Challenges\//gi,
					/\/Club\/Manager\/Guestbook.aspx\?teamid=/gi,
					/\/Inbox\//gi,
					/\/Myhattrick\/\?actionType/gi
					)
};
