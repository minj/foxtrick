/**
* forumchangepstangelinks.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

var FoxtrickForumStripHattrickLinks = {

	MODULE_NAME : "ForumStripHattrickLinks",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forumWritePost','messageWritePost','guestbook','announcements','ads','newsletter',"forumModWritePost","forumViewThread"),
    DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.5.0.3",
	LATEST_CHANGE: "Added whitespace for nested i/b/u in pre tags",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	OPTIONS: new Array('NoConfirmStripping'),
	
	init : function() {
	},

	onclick : function( ev ) {
	try{  
		var a = ev.target; 
		if (a.nodeName=='A') {
			var hostname = ev.target.ownerDocument.location.hostname;
			if ( a.href.search(/.+hattrick\.(org|ws|interia\.pl).*?/i)!=-1 && a.href.search(hostname)==-1) {
				if (Foxtrick.isModuleFeatureEnabled( FoxtrickForumStripHattrickLinks, "NoConfirmStripping" )) {
					a.href = a.href.replace(/.+hattrick\.(org|ws|interia\.pl)(.*?)/i,'http://'+hostname+'$2');
				}
				else if (Foxtrick.confirmDialog('Replace server with '+hostname +'?')) a.href = a.href.replace(/.+hattrick\.(org|ws|interia\.pl)(.*?)/i,'http://'+hostname+'$2');
			}
			//else a.target=+'_blank';
		}
	} catch(e) {Foxtrick.dump('FoxtrickForumStripHattrickLinksonclick '+e+'\n');}
	},

	run : function( page, doc ) {
	try{
		doc.getElementById('mainBody').addEventListener('click',this.onclick,true);
		if (page=='forumViewThread') return;
	
		var targets = doc.getElementById('mainBody').getElementsByTagName("input");  // Forum
        var target = targets[targets.length-1];
        var button_ok = null;
		if (page=='forumWritePost') button_ok = targets[targets.length-2];
        if (page=='guestbook') target = null;

		Foxtrick.dump(button_ok.getAttribute('id')+'\n');
		Foxtrick.dump(button_ok.getAttribute('onclick')+'\n');
		if (Foxtrick.isModuleFeatureEnabled( this, "NoConfirmStripping" )) 
				button_ok.setAttribute('onclick', "var textarea = document.getElementById('mainBody').getElementsByTagName('textarea')[0]; textarea.value = textarea.value.replace(/\\n/g, '[FTbr]').replace(/\\</gi,'<·').replace(/\\[pre\\](.*?)\\[(i|u|b)\\](.*?)\\[\\/pre\\]/gi,'[pre]$1[ $2 ]$3[/pre]').replace(/\\[FTbr\\]/g, '\\n'); if (textarea && textarea.value.search(/\\[link=.+hattrick\.(org|ws|interia\.pl)(.*?)\\]/) > -1)  { textarea.value = textarea.value.replace(/\\[link=.+hattrick\.(org|ws|interia\.pl)(.*?)\\]/gi,'[link=$2]');} "+button_ok.getAttribute('onclick'));
		else
				button_ok.setAttribute('onclick', "var textarea = document.getElementById('mainBody').getElementsByTagName('textarea')[0]; textarea.value = textarea.value.replace(/\\n/g, '[FTbr]').replace(/\\</gi,'<·').replace(/\\[pre\\](.*?)\\[(i|u|b)\\](.*?)\\[\\/pre\\]/gi,'[pre]$1[ $2 ]$3[/pre]').replace(/\\[FTbr\\]/g, '\\n'); if (textarea && textarea.value.search(/\\[link=.+hattrick\.(org|ws|interia\.pl)(.*?)\\]/) > -1)  { if(confirm('"+Foxtrickl10n.getString('foxtrick.confirmstripserver')+"')) {textarea.value = textarea.value.replace(/\\[link=.+hattrick\.(org|ws|interia\.pl)(.*?)\\]/gi,'[link=$2]');} else;} "+button_ok.getAttribute('onclick'));
		Foxtrick.dump(button_ok.getAttribute('onclick')+'\n');
		
	} catch(e) {Foxtrick.dump('FoxtrickForumStripHattrickLinks '+e+'\n');}
	},
	
	change : function( page, doc ) {
	},
};
