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
	PAGES : new Array("forumViewThread"), 
	NEW_AFTER_VERSION: "0.4.9",
	LATEST_CHANGE:"Added Option for replacing Foxtrick-HT-ML Tags (format [pre])",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	DEFAULT_ENABLED : false,
	//OPTIONS : new Array("AddCopyIcon"), 
	
	init : function() {
	},
	
	run : function( page, doc ) {
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
* forumSingleline2.js
* Foxtrick Show Alltid flags in forum posts module
* @author convinced
*/

//**********************************************************
var FoxtrickSingleline2 = {

	MODULE_NAME : "Singleline2",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array("forumViewThread"), 
	DEFAULT_ENABLED : false,
	CSS: Foxtrick.ResourcePath+"resources/css/Singleline2.css",
	NEW_AFTER_VERSION: "0.4.8.2",
	LATEST_CHANGE:"Alternative 'HT-Detailed header to single line' module. Slightly faster then then other versions. Disables some conflicting forum post changing modules.",

	init : function() {
	},

	run : function( page, doc ) {  
	
		var do_copy_post_id = Foxtrick.isModuleEnabled(FoxtrickCopyPostID); 
		var do_add_copy_icon = do_copy_post_id && Foxtrick.isModuleFeatureEnabled( FoxtrickCopyPostID, "AddCopyIcon"); 
		var do_copy_posting = Foxtrick.isModuleEnabled(FoxtrickCopyPosting); 

		// part of copypostid
		var img = doc.createElement('img');
		img.setAttribute('src',Foxtrick.ResourcePath+"resources/img/copy_yellow_small.png");
		img.setAttribute('style',"vertical-align: middle; margin-right:3px;");
										
		var copy_link1 = doc.createElement('a');
		copy_link1.setAttribute('href','javascript:void(0);');
		copy_link1.setAttribute('title',Foxtrickl10n.getString( 'foxtrick.CopyPostID' ));
		copy_link1.appendChild(img);					

		// part of copy_posting_link
						
		var copy_posting_link = doc.createElement('a');
		copy_posting_link.setAttribute('href','javascript:void(0);');
		copy_posting_link.setAttribute('title',Foxtrickl10n.getString( 'foxtrick.CopyPosting' ));
		//copy_posting_link.setAttribute('style',"float:right; right:12px; position:relative; vertical-align: middle; width:0px; top: 2px;");
		copy_posting_link.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'foxtrick.linkscustom.copy' )));					

		var alldivs = doc.getElementById('mainBody').childNodes;
		var i = 0, wrapper;
		while ( wrapper = alldivs[++i] ) {  
		  if ( wrapper.className=="cfWrapper" ) {
		    var allwrapperdivs = wrapper.childNodes;
		    var ii = 0, header;
		    while ( header = allwrapperdivs[++ii] ) {
			  if ( header.className && header.className.search(/cfHeader/)!=-1 ) {

				// +++++++++++ gather info and nodes +++++++++++++++++++++++++
				var header_left = header.childNodes[0];
				header_left.setAttribute('style','z-index:2 !important');
						
				var header_right_div=header.childNodes[1]; 
				header_right_div.setAttribute('style','z-index:1 !important');
				
				/* add someting to test removal later		*/	
				var forumprefs = doc.createElement('a');
				forumprefs.href = '/MyHattrick/Preferences/ForumSettings.aspx';
				forumprefs.innerHTML='<img src="'+Foxtrick.ResourcePath+'resources/img/transparent_002.gif">';
				forumprefs.setAttribute('class','bookmarkMessage');
				if (header_right_div) header_right_div.appendChild(forumprefs);
				
				var bookmark = forumprefs;//header_right_inner.getElementsByTagName('a')[0];
				if (bookmark) { 
						bookmark = bookmark.parentNode.removeChild(bookmark);
						bookmark.setAttribute('style','float:right;');
						header.insertBefore(bookmark,header_right_div);
						header.setAttribute('style','margin-bottom:5px');
						//header_right.removeChild(header_right_div);
					 }
				
				// get post_links from header
				var header_left_links = header_left.getElementsByTagName('a');
				var post_link1 = null;
				var post_link2 = null;								
				var k = 0, header_left_link; 
				while ( header_left_link = header_left_links[k++]) {
					if (!post_link1) { 
						if (header_left_link.href.search(/Forum\/Read\.aspx/) != -1) post_link1 = header_left_link;
					} else { 
						if (header_left_link.href.search(/Forum\/Read\.aspx/) != -1) {post_link2 = header_left_link; break;}
					}					
				}
															
				// copy post id ---------------------------------------------
				if (do_copy_post_id) { 
					if (do_add_copy_icon) {					
						var copy_link=copy_link1.cloneNode(true);
						copy_link.firstChild.addEventListener( "click", FoxtrickForumChangePosts._copy_postid_to_clipboard, false );		
						header_left.insertBefore(copy_link, post_link1);
					}
				}  // end copy post id
											
					// short_postid ---------------------------------------------
					var PostID_message = post_link1.title.replace(/\d+\./,'');
					if (!do_add_copy_icon) {
						var PostID_thread = post_link1.title.replace(/\.\d+/g,'');
						post_link1.href="javascript:showMInd('"+PostID_thread+"-"+PostID_message+"',%20'/Forum/Read.aspx?t="+PostID_thread+"&n="+PostID_message+"&v=2',%20'"+PostID_thread+"."+PostID_message+"');"
						post_link1.setAttribute('id',PostID_thread+"-"+PostID_message);
					}
					post_link1.innerHTML=String(PostID_message);
					//###post_link1.addEventListener( "DOMSubtreeModified", FoxtrickForumChangePosts._postid_adjust_height, false );
					if (post_link2) {
						var PostID_message = post_link2.title.replace(/\d+\./,'');
						post_link2.innerHTML=String(PostID_message);
					}								
			  }
			  if ( header.className && header.className.search(/cfFooter/)!=-1 ) {
				// copy posting ---------------------------------------------
				if (do_copy_posting) { 
						var copy_link=copy_posting_link.cloneNode(true);
						copy_link.addEventListener( "click", FoxtrickSingleline2._copy_posting_to_clipboard, false );		
						header.firstChild.appendChild(copy_link);
				}  // end copy posting
			  }
			}
		  }  
		}
	},
	
	change : function( page, doc ) { 
	},	
					
	_copy_posting_to_clipboard : function(ev) {  
		try{
				var header=ev.target.parentNode.parentNode.parentNode.childNodes[1];
				var header_left = null;
				var header_right = null;
				
				var k = 0, header_part; 
				while ( header_part = header.childNodes[k++]) {
					if (header_part.className.search(/float_left/)!=-1 ) header_left = header_part;
					if (header_part.className.search(/float_right/)!=-1 ) {
						if (header_right==null) header_right = header_part;
					}
				}
				var header_right_inner =  Foxtrick.stripHTML(header_right.innerHTML);							
				
				// get post_links, poster_links, poster_id from header
				var header_left_links = header_left.getElementsByTagName('a');
				var post_link1 = null;
				var poster_link1 = null;
				var poster_id1 = null;	
				var post_link2 = null;
				var poster_link2 = null;
				var poster_id2 = null;
				var supporter_link1 = null;
				var supporter_link2 = null;
				var league_link1 = null;
				var league_link2 = null;
				var post_id1 = null;
				var post_id2 = null;
				
				
				var k = 0, header_left_link; 
				if (header_left_links[0].href.search(/showMInd/)==-1 ) this.bDetailedHeader = true; 
				while ( header_left_link = header_left_links[k++]) {
					if (!poster_link1) { 
						if (header_left_link.href.search(/showMInd/) != -1) { 
							post_id1 = header_left_link.href.match(/(\d+)-\d+/)[1]+'.'+header_left_link.href.match(/\d+-(\d+)/,'')[1];
							post_link1 = header_left_link;
						}
						else if (header_left_link.href.search(/Forum\/Read\.aspx/) != -1) {
							post_id1 = header_left_link.title; 
							post_link1 = header_left_link;
						}
						else if (header_left_link.href.search(/Club\/Manager\/\?userId=/i) != -1) { 
							poster_link1 = header_left_link; 
							poster_id1 = poster_link1.href.match(/\d+$/);
							if (header_left_links[k] 
								&& header_left_links[k].href.search(/Supporter/i) != -1) {
									supporter_link1 = header_left_links[k];
							}
						}					
					} else { 
						if (header_left_link.href.search(/showMInd|Forum\/Read\.aspx/) != -1) post_link2 = header_left_link;
						else if (header_left_link.href.search(/Club\/Manager\/\?userId=/i) != -1) { 
							poster_link2 = header_left_link;
							poster_id2 = poster_link2.href.match(/\d+$/);
							if (header_left_links[k] 
								&& header_left_links[k].href.search(/Supporter/i) != -1) {
									supporter_link2 = header_left_links[k];
							}
						}												
					}					
					/*if (!isStandardLayout) {
						if (!league_link1 && header_left_link.href.search(/LeagueLevelUnitID/i) != -1) league_link1 = header_left_link;
						else if (header_left_link.href.search(/LeagueLevelUnitID/i) != -1) league_link2 = header_left_link;
					 }*/					
				}
		 
			var headstr = post_id1+': '+poster_link1.title+' » ';
			if (poster_link2 && post_link2)  headstr+=post_link2.title+': '+poster_link2.title+'\n';
			else headstr+='all\n';
			headstr = header_right_inner.replace(/^ /,'')+"  \n"+headstr+'\n';
			
			var message_raw = header.nextSibling.firstChild.innerHTML;
			message_raw=message_raw.replace(/\<hr\>|\<br\>/g,'\n');
			var message = (Foxtrick.stripHTML(message_raw)).replace(/&amp;/g,'&').replace(/&gt;/g,'>').replace(/&lt;/g,'<');
			
			Foxtrick.copyStringToClipboard(headstr+message); 
			if (FoxtrickPrefs.getBool( "copyfeedback" )) 
				Foxtrick.alert(Foxtrickl10n.getString("foxtrick.tweaks.postingcopied"));
		} catch(e){ Foxtrick.dump('_copy_posting_to_clipboard :'+e+'\n');}
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