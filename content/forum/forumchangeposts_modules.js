//**********************************************************
/**
* forumchangeposts_modules.js
* module collection of forumchangeposts.js
* @author convinced
*/



//**********************************************************
/**
* forumcopypostid.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

var FoxtrickCopyPostID = {

	MODULE_NAME : "CopyPostID",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array("forumViewThread"), 
	NEW_AFTER_VERSION: "0.4.7.5",
	LASTEST_CHANGE:"Added confirmation alert. option to turn ALL copy confirmations off in preferences",
	DEFAULT_ENABLED : false,
	OPTIONS : new Array("AddCopyIcon"), 

	init : function() {
	},
	
	run : function( page, doc ) {
	},
	
	change : function( page, doc ) { return;
	},	
};

//**********************************************************
/**
* forumcopyposting.js
* Foxtrick Copies posting to clipboard
* @author convinced
*/
var FoxtrickCopyPosting = {

	MODULE_NAME : "CopyPosting",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array("forumViewThread"), 
	NEW_AFTER_VERSION: "0.4.7",	
	LASTEST_CHANGE:"Added option to copy forum posting",
	DEFAULT_ENABLED : false,

	init : function() {
	},
	
	run : function( page, doc ) {
	},
	
	change : function( page, doc ) { return;
	},	
};

//**********************************************************
/**
 * forumalterheaderline.js
 * Foxtrick Truncate long nicks in forum posts module
 * @author larsw84/convinced
 */

var FoxtrickForumAlterHeaderLine = {
	
    MODULE_NAME : "ForumAlterHeaderLine",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array("forumViewThread"), 
	DEFAULT_ENABLED : false,
	OPTIONS : new Array("SingleHeaderLine", "CheckDesign","TruncateLongNick","TruncateLeagueName",
						"SmallHeaderFont","ShortPostId","ReplaceSupporterStar"),
	OPTIONS_CSS: new Array ("chrome://foxtrick/content/resources/css/fixes/Forum_Header_Single.css",
							"",
							"",
							"",
							"chrome://foxtrick/content/resources/css/fixes/Forum_Header_Smallsize_Single.css",
							"",
							"chrome://foxtrick/content/resources/css/fixes/Forum_Header_RemoveSupporterStar.css"),
							
    init : function() {
    },
	
    run : function( page, doc ) {
	},
	
	change : function( page, doc ) {
	
	}
};


//**********************************************************
/**
 * forumredirmanagertoteam.js
 * Foxtrick redirect from manager to team page
 * @author convinced
 */

var FoxtrickForumRedirManagerToTeam = {
	
    MODULE_NAME : "ForumRedirManagerToTeam",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array("forumViewThread"), 
	DEFAULT_ENABLED : false,

	init : function() {
    },

    run : function( page, doc ) { 		
    },
	
	change : function( page, doc ) {
	},
};


//**********************************************************
/**
 * forummovelinks.js
 * Foxtrick Move Links in forum posts module
 * @author larsw84
 */

var FoxtrickMoveLinks = {
	
    MODULE_NAME : "MoveLinks",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array("forumViewThread"), 
	DEFAULT_ENABLED : false,

    init : function() {
    },

    run : function( page, doc ) { 
	},
	
	change : function( page, doc ) {
	
	}
};


//**********************************************************
/**
 * forumhideavataruserinfo.js
 * Foxtrick Hide Manager Avatar User Info module
 * @author larsw84/convinced
 */

var FoxtrickHideManagerAvatarUserInfo = {
       
    MODULE_NAME : "HideManagerAvatarUserInfo",
    MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array("forumViewThread"), 
    DEFAULT_ENABLED : false,

    init : function() {
    },

    run : function( page, doc ) { 
	},
       
    change : function( page, doc ) {
    }
};


//**********************************************************
/**
 * forumhideavatar.js
 * Foxtrick Hide Manager Avatar module
 * @author larsw84
 */

var FoxtrickHideManagerAvatar = {
	
    MODULE_NAME : "HideManagerAvatar",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array("forumViewThread"), 
	DEFAULT_ENABLED : false,

    init : function() {
    },

    run : function( page, doc ) { 
	},
	
	change : function( page, doc ) {
	
	}
};


//**********************************************************
/**
 * forumadddefaultfacecard.js
 * Foxtrick Add default faceCard module
 * @author larsw84
 */

var FoxtrickAddDefaultFaceCard = {
	
    MODULE_NAME : "AddDefaultFaceCard",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array("forumViewThread"), 
	DEFAULT_ENABLED : true,

    init : function() {
    },

    run : function( page, doc ) {
	},
	
	change : function( page, doc ) {
	
	}
};


/**
* forumalltidflags.js
* Foxtrick Show Alltid flags in forum posts module
* @author convinced
*/

//**********************************************************
var FoxtrickAlltidFlags = {

	MODULE_NAME : "AlltidFlags",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array("forumViewThread"), 
	DEFAULT_ENABLED : false,
	//RADIO_OPTIONS : new Array("LinkFlagToLeague","LinkFlagToAlltid"), 
	//CSS:"chrome://foxtrick/content/resources/css/conference.css",

	init : function() {
	},

	run : function( page, doc ) {  
			Foxtrick.addStyleSheet(doc, "chrome://foxtrick/content/"+
							"resources/css/conference.css");
	},
	
	change : function( page, doc ) { 
	},	
						
};


/**
* forumsearch.js
* Foxtrick Show Alltid flags in forum posts module
* @author convinced
*/

//**********************************************************
var FoxtrickForumSearch = {

	MODULE_NAME : "ForumSearch",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array("forumViewThread"), 
	DEFAULT_ENABLED : false,

	init : function() {
	},

	run : function( page, doc ) {  
	},
	
	change : function( page, doc ) { 
	},	
						
};