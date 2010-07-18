/**
 * ForumThreadAutoIgnore.js
 * Foxtrick Leave Conference module
 * @author larsw84
 */

var FoxtrickForumThreadAutoIgnore = {

    MODULE_NAME : "ForumThreadAutoIgnore",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forum'),
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.5.1.3",
	LATEST_CHANGE:"Auto ignore of forum topics with user selected tags",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	tagmarkers: [['\\[','\\]'],['{','}']], // any more known?
	tags: ['NT','U20','Stammtisch','cup'], // to be user set 
	//OPTIONS : ["Tags"],
	//OPTION_TEXTS : true,
	//OPTION_TEXTS_DEFAULT_VALUES : [""],
	
    run : function( page, doc ) {
		this.checkthreads(doc);
	},
		
    checkthreads : function( doc ) {
		try {
			var myForums = doc.getElementById('myForums');
			var threadItems = myForums.getElementsByClassName('threadItem');
			for (var i=0; i<threadItems.length; ++i) {
				var url =  threadItems[i].getElementsByClassName('url')[0];
				var a = url.getElementsByTagName('a')[0];
				for (var j=0; j<this.tagmarkers.length; ++j){
					for (var k=0; k<this.tags.length; ++k){
						var reg = new RegExp(this.tagmarkers[j][0] + this.tags[k] + this.tagmarkers[j][1], "i");
						if (a.innerHTML.search(reg)!=-1) {
							var ignore = threadItems[i].getElementsByClassName('ignore')[0];
							if ( ignore ) {
								var func = ignore.getAttribute('onclick');
								doc.location.href = func;
								Foxtrick.dump('autoignore '+this.tags[k]+': '+a.innerHTML+'\n');
								return;
							}
						}
					}
				}
			}		
		 } catch(e) {
            Foxtrick.dumpError(e);
        }
	},
	
	change : function( page, doc ) {
		var forumprogress = doc.getElementById('ctl00_ctl00_CPContent_ucLeftMenu_uppMain');
		if (forumprogress.getAttribute('style').search(/display: none;/)!=-1) {
			this.checkthreads(doc);
		}
	},
};
