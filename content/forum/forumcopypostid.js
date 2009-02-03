/**
* forumcopypostid.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

var FoxtrickCopyPostID = {

	MODULE_NAME : "CopyPostID",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : true,

	init : function() {
		Foxtrick.registerPageHandler( 'forumViewThread',
			FoxtrickCopyPostID );
	},
	
	run : function( page, doc ) { 
	
	var mainbody = doc.getElementById('mainBody');
	var forumprefs = doc.createElement('a');
	forumprefs.href = '/MyHattrick/Preferences/ForumSettings.aspx';
	forumprefs.innerHTML='<img src="chrome://foxtrick/content/resources/img/transparent_002.gif">';
	forumprefs.setAttribute('class','forumSettings');
	mainbody.insertBefore(forumprefs,mainbody.firstChild);
 
		var alldivs = doc.getElementsByTagName('div');
		var num=0;
		for (var i = 0; i < alldivs.length; i++) {
			if (alldivs[i].className=="cfWrapper") {
				var linksArray = alldivs[i].getElementsByTagName('a');
				var count=0;
				for (var j=0; j<linksArray.length; j++) {
					var link = linksArray[j];
					if (link.href.search(/showMInd/) > -1) {
						var PostID=link.href.match(/\d+\.\d+/g)[0]; 
						if (count==0) {
						link.href='javascript:void(0);';
						//link.href='javascript:alert(document.lastModified);';
						link.title+=' & '+Foxtrickl10n.getString( 'foxtrick.CopyPostID' );
						link.setAttribute("name",PostID);
						link.setAttribute("id","_"+this.MODULE_NAME+num);
						link.addEventListener( "click", FoxtrickCopyPostID._copy_postid_to_clipboard, false );	
						}
						else { 
							link.href='/Forum/Read.aspx?t='+PostID.replace(/\.\d+/,'')+'&n='+PostID.replace(/\d+\./,'');	
							link.title="";						
						}
						count++;
						if (count==2) break;
					}
				} 
				num++;
			}
		}
	},
	
	change : function( page, doc ) {
		var spanId = "_"+this.MODULE_NAME+"0";  
		if( !doc.getElementById ( spanId ) ) {
			this.run( page, doc );
		}
	},	

	_copy_postid_to_clipboard : function(ev) { 
		var PostID = ev.target.getAttribute("name");
		Foxtrick.copyStringToClipboard(PostID);
        ev.target.innerHTML=PostID; 
		ev.target.addEventListener( "click", FoxtrickCopyPostID._to_top, false );	
		ev.target.RemoveEventListener( "click", FoxtrickCopyPostID._copy_postid_to_clipboard, false );	
	},	
	
	_to_top : function(ev) {
		var PostID = ev.target.getAttribute("name");
		ev.target.href='/Forum/Read.aspx?t='+PostID.replace(/\.\d+/,'')+'&n='+PostID.replace(/\d+\./,'');	
	},	
};