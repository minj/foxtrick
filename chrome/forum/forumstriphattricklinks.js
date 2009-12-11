/**
* forumchangepstangelinks.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

var FoxtrickForumStripHattrickLinks = {

	MODULE_NAME : "ForumStripHattrickLinks",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forumWritePost','messageWritePost','guestbook','announcements','ads','newsletter',"forumModWritePost"),
    DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.9.1",
	LATEST_CHANGE: "Changes links to stagepages to normal hattrick pages",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	OPTIONS: new Array('NoConfirmStripping'),
	
	init : function() {
	},

	run : function( page, doc ) {
	try{
		var targets = doc.getElementById('mainBody').getElementsByTagName("input");  // Forum
        var target = targets[targets.length-1];
        var button_ok = null;
		if (page=='forumWritePost') button_ok = targets[targets.length-2];
        if (page=='guestbook') target = null;

		Foxtrick.dump(button_ok.getAttribute('id')+'\n');
		Foxtrick.dump(button_ok.getAttribute('onclick')+'\n');
		if (Foxtrick.isModuleFeatureEnabled( this, "NoConfirmStripping" )) 
				button_ok.setAttribute('onclick', "var textarea = document.getElementById('mainBody').getElementsByTagName('textarea')[0]; if (textarea && textarea.value.search(/\\[link=http:\\/\\/(stage|www(\\d+))\\.hattrick\\.org(.*?)\\]/) > -1)  { textarea.value = textarea.value.replace(/\\[link=http:\\/\\/(stage|www(\\d+))\\.hattrick\\.org(.*?)\\]/gi,'[link=$3]');} "+button_ok.getAttribute('onclick'));
		else
				button_ok.setAttribute('onclick', "var textarea = document.getElementById('mainBody').getElementsByTagName('textarea')[0]; if (textarea && textarea.value.search(/\\[link=http:\\/\\/(stage|www(\\d+))\\.hattrick\\.org(.*?)\\]/) > -1)  { if(confirm('"+Foxtrickl10n.getString('foxtrick.confirmstripserver')+"')) {textarea.value = textarea.value.replace(/\\[link=http:\\/\\/(stage|www(\\d+))\\.hattrick\\.org(.*?)\\]/gi,'[link=$3]');} else;} "+button_ok.getAttribute('onclick'));
		Foxtrick.dump(button_ok.getAttribute('onclick')+'\n');
		
	} catch(e) {Foxtrick.dump('FoxtrickForumStripHattrickLinks '+e+'\n');}
	},
	
	change : function( page, doc ) {
	},
};
