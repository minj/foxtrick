//**********************************************************
/**
* forum-change-posts-modules.js
* module collection of forum-change-posts.js
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

	run : function(doc) {
		//format view
		if (Foxtrick.isPage("messageWritePost", doc)
			|| Foxtrick.isPage("guestbook", doc)) {
			try{
				var org = new Array(/\[pre\](.*?)\[\/pre\]/gi , /·/gi);
				var rep = new Array("<pre>$1</pre>", "");
				var messages = doc.getElementsByClassName("feedItem");
				for (var i = 0; i < messages.length; i++){
					var count_pre = Foxtrick.substr_count(messages[i].innerHTML, '[pre');
					// Foxtrick.dump('FORMAT TEXT ' + count_pre + '\n');
					for (var j = 0; j <= count_pre; j++) {
						for ( var k = 0; k < org.length; k++) {
							messages[i].innerHTML = messages[i].innerHTML.replace(org[k],rep[k]);
						}
					}
				}
			} catch(e_format) {Foxtrick.dump('FormatPostingText: FORMAT TEXT ' + e_format + '\n');}
		}
		else { // reformat edit
			var textarea = doc.getElementById("mainBody").getElementsByTagName("textarea")[0];
			if (textarea) textarea.value = FoxtrickFormatPostingText.reformat(textarea.value);
		}

		// add to all targets. send button unclear (eg MyHattrick/Inbox/Default.aspx?actionType=readMail) . doesn't harm to add it to all
		var targets = doc.getElementById("mainBody").getElementsByTagName("input");  // Forum
		for (var i = 0; i < targets.length; ++i) {
			if (targets[i].type == "submit") {
				targets[i].addEventListener("click", this.submitListener, false);
			}
		}
	},

	reformat : function(string) {
		var org = new Array(/\[pre\](.*?)\[\/pre\]/gi , /·/gi);
		var rep = new Array("[pre]$1[/pre]", "");
		var count_pre = Foxtrick.substr_count(string, '[pre');
		for (var j = 0; j <= count_pre; j++) {
			for ( var k = 0; k < org.length; k++) {
					string = string.replace(org[k],rep[k]);
			}
		}
		return string;
	},

	format : function(string) {
			string = string
				.replace(/·/gi, "")
				.replace(/(\<)(\S)/gi, "<·$2");

				var vstring = string.split('[pre]');
				var r_string = vstring[0]
				var remain=0;
				for (var j = 1; j < vstring.length; j++) {
					r_string+='[pre]';
					var ivstring = vstring[j].split('[/pre]');
					var num_do = Math.min(ivstring.length-1, remain+1);
					remain -= (num_do-1);
					for (var i=0;i<num_do;++i) r_string += ivstring[i].replace(/\[/g,'[·')+'[/pre]';
					for ( var k = num_do; k < ivstring.length; k++) {
						r_string += ivstring[k];
					}
				}
			return r_string;
	},

	submitListener : function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			var textarea = doc.getElementById("mainBody").getElementsByTagName("textarea")[0];
			textarea.value = FoxtrickFormatPostingText.format(textarea.value);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	}
};

var FoxtrickCopyPostID = {

	MODULE_NAME : "CopyPostID",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array("forumViewThread"),
	OPTIONS : new Array("AddCopyIcon")
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

	CSS_SIMPLE : Foxtrick.ResourcePath+"resources/css/fixes/Forum_Header_Single_SimpleFix.css"
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
	PAGES : new Array("forumViewThread")
};
