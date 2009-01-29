/**
* forumcopypostid.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/ 

////////////////////////////////////////////////// //////////////////////////////
//---------------------------------------------------------------------------    

var FoxtrickCopyPostID = {

	MODULE_NAME : "CopyPostID",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : true,

	init : function() {
		Foxtrick.registerPageHandler( 'forumViewThread',
			FoxtrickCopyPostID );
	},
	
	run : function( page, doc ) { 
		var alldivs = doc.getElementById('mainBody').getElementsByTagName('div');
		var num=0;
		for (var i = 0; i < alldivs.length; i++) {
			if (alldivs[i].className=="cfWrapper") {
				var linksArray = alldivs[i].getElementsByTagName('a');
				for (var j=0; j<linksArray.length; j++) {
					var link = linksArray[j];
					if (link.href.search(/showMInd/) > -1) {
						var PostID=link.href.match(/\d+\.\d+/g)[0]; 
						link.href='javascript:void(0);';
						//link.href='javascript:alert(document.lastModified);';
						link.title=Foxtrickl10n.getString( 'foxtrick.CopyPostID' );
						link.setAttribute("name",PostID);
						link.setAttribute("id","_"+this.MODULE_NAME+num);
						link.addEventListener( "click", FoxtrickCopyPostID._copy_postid_to_clipboard, false );	
						break;
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
		var postid = ev.target.getAttribute("name");
		Foxtrick.copyStringToClipboard(postid);
        ev.target.innerHTML=postid;
	},	
};