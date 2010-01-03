/**
* forumshowprefbutton.js
* Foxtrick shows forum preference button on all forum pages
* @author convinced
*/

var FoxtrickShowForumPrefButton = {

	MODULE_NAME : "ShowForumPrefButton",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forumViewThread'), 
	DEFAULT_ENABLED : false,

	init : function() {
	},
	
	run : function( page, doc ) { 
	
	var boxHead = doc.getElementById('mainWrapper').getElementsByTagName('div')[1];
	if (boxHead.className!='boxHead') return;
    if (Foxtrick.isStandardLayout ( doc ) ) {
		Foxtrick.addStyleSheet(doc, "chrome-extension://bpfbbngccefbbndginomofgpagkjckik/"+
                                "resources/css/conference_settings.css");
	}
	var forumprefs = doc.createElement('a');
	forumprefs.href = '/MyHattrick/Preferences/ForumSettings.aspx';
	forumprefs.innerHTML='<img src="chrome-extension://bpfbbngccefbbndginomofgpagkjckik/resources/img/transparent_002.gif">';
	forumprefs.setAttribute('class','forumSettings');
	boxHead.insertBefore(forumprefs,boxHead.firstChild);
	},
 
 	
	change : function( page, doc ) {
	},	
};