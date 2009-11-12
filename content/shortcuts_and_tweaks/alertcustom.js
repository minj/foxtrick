/**
 * alertCustom.js
 * custom turn off for ticker events
 * @author convincedd
 */

var FoxtrickAlertCustomOff = {
	
    MODULE_NAME : "AlertCustomOff",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('all'), 
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.4.9",
	LATEST_CHANGE:"Option to custom turn off selected alert sliders",	
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	OPTIONS : new Array("LoginWelcome","LoginSupporters","ForumReplyToMe","TransferMarket","Challenges","Guestbook","MailToMe","MyHTMessages"),
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