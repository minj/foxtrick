/**
 * forum-thread-auto-ignore.js
 * Foxtrick Leave Conference module
 * @author convincedd
 */

var FoxtrickForumThreadAutoIgnore = {

	MODULE_NAME : "ForumThreadAutoIgnore",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forum'),
	OPTIONS : ["Tags","Whitelist_ThreadIDs"],
	OPTION_TEXTS : true,
	tagmarkers : [['\\[','\\]'],['{','}']], // any more known?
	tags : null,
	whitelist : null,

	run : function(doc) {
		this.checkthreads(doc);
		Foxtrick.listen(doc.getElementById('ctl00_ctl00_CPContent_ucLeftMenu_pnlLeftMenuScrollContent'),'DOMSubtreeModified',FoxtrickForumThreadAutoIgnore.myforum_change,true); 
	},

	
	deleting_thread_id: -1, // stores  thread is is currently trying to delete.
	
	checkthreads : function( doc ) { 
		
		if (!FoxtrickPrefs.isModuleOptionEnabled("ForumThreadAutoIgnore",'Tags')) return;
		var tags_string = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "Tags_text");
		if (!tags_string) return;

		// get tags. comma seperated in the prefs
		this.tags = tags_string.split(',');
		for (var i=0; i<this.tags.length; ++i) {
			this.tags[i] = this.tags[i].replace(/^\s+/,''); // leading space removed
			this.tags[i] = this.tags[i].replace(/\s+$/,''); // trailing space removed
		}

		// get whitelisted threadIDs. comma seperated in the prefs
		if (FoxtrickPrefs.isModuleOptionEnabled("ForumThreadAutoIgnore",'Whitelist_ThreadIDs')) {
			var whitelist_string = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "Whitelist_ThreadIDs_text");
			if (whitelist_string) {
				this.whitelist = whitelist_string.split(',');
				for (var i=0; i<this.whitelist.length; ++i) {
					this.whitelist[i] = this.whitelist[i].replace(/^\s+/,''); // leading space removed
					this.whitelist[i] = this.whitelist[i].replace(/\s+$/,''); // trailing space removed
					 //Foxtrick.dump(this.whitelist[i]+'\n');
				}
			}
		}

		var myForums = doc.getElementById('myForums');
		var threadItems = myForums.getElementsByClassName('threadItem');
		for (var i=0; i<threadItems.length; ++i) {
			var url =  threadItems[i].getElementsByClassName('url')[0];

			if (url== null) continue;

			var a = url.getElementsByTagName('a')[0];
			for (var j=0; j<this.tagmarkers.length; ++j){
				for (var k=0; k<this.tags.length; ++k){
					var reg = new RegExp(this.tagmarkers[j][0] + this.tags[k] + this.tagmarkers[j][1], "i");
					if (a.innerHTML.search(reg)!=-1) {
						// only autoignore if there is ht's ignore option
						var ignore = threadItems[i].getElementsByClassName('ignore')[0];
						if ( ignore ) {
							var thread_id = a.href.match(/\/Forum\/Read.aspx\?t=(\d+)/)[1];
							// check whitelist
							var whitelisted = false;
							if (whitelist_string) {
								for (var l=0; l<this.whitelist.length; ++l){
									if (this.whitelist[l]==thread_id) {
										whitelisted = true;
										continue;
									}
								}
							}
							if (whitelisted) continue;

							// check if finished deleting the last one. if ids match, the last delet order isn't finished. come back with next onchange
							if (thread_id == FoxtrickForumThreadAutoIgnore.deleting_thread_id) return;
							FoxtrickForumThreadAutoIgnore.deleting_thread_id = thread_id;
							
							// ignore thread using ht's javascript link
							var func = ignore.getAttribute('onclick');
							doc.location.href = func;
							Foxtrick.dump('autoignore '+this.tags[k]+': '+a.innerHTML+'\n');

							// only one at a time. recheck after page has changed
							return;
						}
					}
				}
			}
		}
	},

	myforum_change : function(ev) { 
		FoxtrickForumThreadAutoIgnore.checkthreads(ev.target.ownerDocument);
	}
};
