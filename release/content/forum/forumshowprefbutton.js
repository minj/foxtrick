/**
* forumshowprefbutton.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

var FoxtrickShowForumPrefButton = {

	MODULE_NAME : "ShowForumPrefButton",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : false,

	init : function() {
		Foxtrick.registerPageHandler( 'forumViewThread',
			FoxtrickShowForumPrefButton );
	},
	
	run : function( page, doc ) { 
	
	var boxHead = doc.getElementById('mainWrapper').getElementsByTagName('div')[1];
	if (boxHead.className!='boxHead') return;
    if (Foxtrick.isStandardLayout ( doc ) ) {
		Foxtrick.addStyleSheet(doc, "chrome://foxtrick/content/"+
                                "resources/css/conference_settings.css");
	}
	var forumprefs = doc.createElement('a');
	forumprefs.href = '/MyHattrick/Preferences/ForumSettings.aspx';
	forumprefs.innerHTML='<img src="chrome://foxtrick/content/resources/img/transparent_002.gif">';
	forumprefs.setAttribute('class','forumSettings');
	boxHead.insertBefore(forumprefs,boxHead.firstChild);
	},
 
 	
	change : function( page, doc ) {
	},	
};