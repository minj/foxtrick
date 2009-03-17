/**
* copymatchid.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

var FoxtrickCopyMatchID = {

	MODULE_NAME : "CopyMatchID",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : false,

	init : function() {
		Foxtrick.registerPageHandler( 'matches',
			FoxtrickCopyMatchID );
		Foxtrick.registerPageHandler( 'matchesarchiv',
			FoxtrickCopyMatchID );
	},
	
	run : function( page, doc ) { 
	try {
		var table = doc.getElementById('mainBody').getElementsByTagName('table')[0];
		var count = 0;
		for (var i = 0; i < table.rows.length; i++) { 
				if (table.rows[i].cells.length<2) continue;
			 	var matchid=FoxtrickHelper.findMatchId(table.rows[i]); 
				var link=doc.createElement('a');
				var img=table.rows[i].cells[1].innerHTML;
				table.rows[i].cells[1].innerHTML="";
				link.innerHTML=img;
				link.href='javascript:void(0);';
				link.setAttribute("matchid",matchid);
				link.setAttribute("id","_"+this.MODULE_NAME+count);
				link.addEventListener( "click", FoxtrickCopyMatchID._copy_matchid_to_clipboard, false );	
				table.rows[i].cells[1].appendChild(link);
				var img_n = table.rows[i].cells[1].getElementsByTagName('img')[0];
				img_n.setAttribute('title',img_n.title+ ' : '+Foxtrickl10n.getString( 'foxtrick.CopyPostID')); 
				
				count++; 
		}
	} catch(e) {dump('FoxtrickCopyMatchID: '+e+'\n');}
	},
	
	change : function( page, doc ) {
		var spanId = "_"+this.MODULE_NAME+"0";  
		if( !doc.getElementById ( spanId ) ) {
			this.run( page, doc );
		}
	},	

	_copy_matchid_to_clipboard : function(ev) { 
		var matchid = ev.target.parentNode.getAttribute("matchid");
		Foxtrick.copyStringToClipboard(matchid);        
	},	
};