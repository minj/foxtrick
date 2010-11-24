/**
* copymatchid.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

var FoxtrickCopyMatchID = {

	MODULE_NAME : "CopyMatchID",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
 	PAGES : new Array('matches','matchesarchiv','matcheshistory',
					'matchesLatest','arena','matchLineup','match'),
	NEW_AFTER_VERSION : "0.5.2.1",
	LATEST_CHANGE : "Removed HT-ML tag.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,

	run : function( page, doc ) {
		var count = 0;

		if (page=='matchesarchiv' || page =='matches' || page =='matcheshistory' || page =='matchesLatest'||page=='arena') {
			var cells = doc.getElementById('mainBody').getElementsByTagName('td');
			for (var i = 0; i < cells.length; i++) {
				// nested table check
				var td = cells[i].getElementsByTagName('td').length;
				if (td!=0) continue;

				var images = cells[i].getElementsByTagName('img');
				for (var j = 0; j < images.length; j++) {
					if (images[j].className.search(/matchLeague|matchFriendly|matchMasters|matchCup|matchQualification/)==-1) continue;

					var href='';
					var links = cells[i+1].getElementsByTagName('a');
					for (var j=0; j < links.length; j++) {
						if ( links[j].href.match(/Club\/Matches\/Match\.aspx/i) ) {
							href = links[j].href;
							break;
						}
					}
					var matchid = href.replace(/.+matchID=/i, "").match(/^\d+/)[0];

					var link = doc.createElement('a');
					images[j].setAttribute('title',images[j].title+ ' : '+Foxtrickl10n.getString( 'foxtrick.copymatchid'));
					var link=doc.createElement('a');
					link.appendChild(images[j].cloneNode(true));
					link.href='javascript:void(0);';
					link.setAttribute("matchid", matchid);
					link.setAttribute("id","_"+this.MODULE_NAME+count);
					link.addEventListener( "click", FoxtrickCopyMatchID._copy_matchid_to_clipboard, false );
					var div=images[j].parentNode;
					div.replaceChild(link,images[j]);

					count++;
				}
			}
		}
		else if (page=='matchLineup'||page=='match')
			{
			var images = doc.getElementById('mainBody').getElementsByTagName('img');
			for (var i = 0; i < images.length; i++) {
				if (images[i].className.search(/matchLeague|matchFriendly|matchMasters|matchCup|matchQualification/)==-1) continue;

				var href='';
				var links = doc.getElementById('mainWrapper').getElementsByTagName('a');
				for (var j=0; j < links.length; j++) {
					if ( links[j].href.match(/Club\/Matches\/Match\.aspx/i) ) {
						href = links[j].href;
						break;
					}
				}
				var matchid = href.replace(/.+matchID=/i, "").match(/^\d+/)[0];

				images[i].setAttribute('title',images[i].title+ ' : '+Foxtrickl10n.getString( 'foxtrick.copymatchid'));
				var link=doc.createElement('a');
				link.appendChild(images[i].cloneNode(true));
				link.href='javascript:void(0);';
				link.setAttribute("matchid", matchid);
				link.setAttribute("id","_"+this.MODULE_NAME+count);
				link.addEventListener( "click", FoxtrickCopyMatchID._copy_matchid_to_clipboard, false );
				var div=images[i].parentNode;
				div.replaceChild(link,images[i]);

				count++;
				break;

			}
		}
	},

	_copy_matchid_to_clipboard : function(ev) {
	try{
		var doc = ev.target.ownerDocument;
		var matchid = ev.target.parentNode.getAttribute("matchid");
		var insertBefore = doc.getElementsByTagName('h1')[0];
		Foxtrick.copyStringToClipboard(matchid);
		var note = Foxtrick.util.note.add(doc, insertBefore, "ft-match-id-copy-note", Foxtrickl10n.getString("foxtrick.tweaks.matchidcopied"), null, true, true);
	} catch(e){Foxtrick.dumpError(e);}
	}
};
