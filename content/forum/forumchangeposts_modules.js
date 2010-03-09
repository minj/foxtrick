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

var FoxtrickFormatPostingText = {

	MODULE_NAME : "FormatPostingText",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forumWritePost','messageWritePost','guestbook','announcements','ads','newsletter',"forumModWritePost"),
    NEW_AFTER_VERSION: "0.4.9",
	LATEST_CHANGE:"Added Option for replacing Foxtrick-HT-ML Tags (format [pre])",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	DEFAULT_ENABLED : true,
	
	init : function() {
	},
	
	run : function( page, doc ) {
	try{
		var targets = doc.getElementById('mainBody').getElementsByTagName("input");  // Forum
        for(var i=0;i<targets.length;++i) {Foxtrick.dump(targets[i].type+'\n'); if (targets[i].type=='submit') break;}
		var button_ok = targets[i];

		Foxtrick.dump(button_ok.getAttribute('id')+'\n');
		Foxtrick.dump(button_ok.getAttribute('onclick')+'\n');
		button_ok.setAttribute('onclick', "var textarea = document.getElementById('mainBody').getElementsByTagName('textarea')[0]; textarea.value = textarea.value.replace(/·/gi,'').replace(/\\n/g, '[FTbr]').replace(/\\</gi,'<·').replace(/\\[pre\\](.*?)\\[(i|u|b)\\](.*?)\\[\\/pre\\]/gi,'[pre]$1[ $2 ]$3[/pre]').replace(/\\[FTbr\\]/g, '\\n');"+button_ok.getAttribute('onclick'));
		Foxtrick.dump(button_ok.getAttribute('onclick')+'\n');
		
	} catch(e) {Foxtrick.dump('FoxtrickFormatPostingText '+e+'\n');}
	},
	
	change : function( page, doc ) { return;
	},	
};

var FoxtrickCopyPostID = {

	MODULE_NAME : "CopyPostID",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array("forumViewThread"), 
	NEW_AFTER_VERSION: "0.4.7.5",
	LATEST_CHANGE:"Added confirmation alert. option to turn ALL copy confirmations off in preferences",
	DEFAULT_ENABLED : true,
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
	NEW_AFTER_VERSION: "0.4.9",	
	LATEST_CHANGE:"Some fixing for spoilers, quotes & tables.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	DEFAULT_ENABLED : true,
	OPTIONS : new Array("CopyWikiStyle"), 
	
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
	NEW_AFTER_VERSION: "0.4.9.1",
	LATEST_CHANGE:"HideOldTime fixing for some dateformats",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	OPTIONS : new Array("SingleHeaderLine", "CheckDesign","TruncateLongNick","TruncateLeagueName","HideOldTime",
						"SmallHeaderFont","ShortPostId","ReplaceSupporterStar","BookmarkHeaderSmall","HighlightThreadOpener"),
	OPTIONS_CSS: new Array (Foxtrick.ResourcePath+"resources/css/fixes/Forum_Header_Single.css",
							Foxtrick.ResourcePath+"resources/css/fixes/Forum_Header_CheckDesign.css",
							"",
							"",
							"",
							Foxtrick.ResourcePath+"resources/css/fixes/Forum_Header_Smallsize_Single.css",
							"",
							Foxtrick.ResourcePath+"resources/css/fixes/Forum_Header_RemoveSupporterStar.css",
							Foxtrick.ResourcePath+"resources/css/fixes/BookmarkHeaderSmall.css"),

	CSS_SIMPLE : Foxtrick.ResourcePath+"resources/css/fixes/Forum_Header_Single_SimpleFix.css",

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
	//CSS: Foxtrick.ResourcePath+"resources/css/conference.css",

	init : function() {
	},

	run : function( page, doc ) {  
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