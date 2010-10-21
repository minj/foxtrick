/**
* forumshowprefbutton.js
* Foxtrick shows forum preference button on all forum pages
* @author convinced
*/

var FoxtrickShowForumPrefButton = {

	MODULE_NAME : "ShowForumPrefButton",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forumViewThread','forumOverView','forumDefault'),
	DEFAULT_ENABLED : true,

	run : function( page, doc ) {
	var boxHead = doc.getElementById('mainWrapper').getElementsByTagName('div')[1];
	if (boxHead.className!='boxHead') return;
	var forumprefs = doc.createElement('a');
	forumprefs.href = '/MyHattrick/Preferences/ForumSettings.aspx';
	forumprefs.innerHTML='<img src="'+Foxtrick.ResourcePath+'resources/img/transparent.gif">';
	forumprefs.setAttribute('class','forumSettings');
	boxHead.insertBefore(forumprefs,boxHead.firstChild);
	}
};
