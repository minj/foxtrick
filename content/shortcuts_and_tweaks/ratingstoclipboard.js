/**
 * ratingstoclipboard.js
 * Copies matchratings to the clipboard (table style)
 * @author spambot
 */

var FoxtrickCopyRatingsToClipboard = {

    MODULE_NAME : "CopyRatingsToClipboard",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : false,

	init : function() {
        Foxtrick.registerPageHandler( 'match', this );
    },
    
    run : function( page, doc ) {
        var mainBody = doc.getElementById('mainBody');
        var table = mainBody.getElementsByTagName('table')[0];
        if (table == null ) return;
        
        try {
            var parentDiv = doc.createElement("div");
            parentDiv.id = "foxtrick_addactionsbox_parentDiv";
            
            var messageLink = doc.createElement("a");
            messageLink.className = "inner";
            messageLink.title = Foxtrickl10n.getString( "foxtrick.tweaks.copyratings" );
            messageLink.setAttribute("style","cursor: pointer;");
            messageLink.addEventListener("click", this.createRatings, false)
            
            var img = doc.createElement("img");
            img.style.padding = "0px 5px 0px 0px;";
            img.className = "actionIcon";
            img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyratings" );
            img.src = "chrome://foxtrick/content/resources/img/copyplayerad.png";
            messageLink.appendChild(img);
                    
            parentDiv.appendChild(messageLink);
            
            var newBoxId = "foxtrick_actions_box";
            Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString( 
                "foxtrick.tweaks.actions" ), parentDiv, newBoxId, "first", "");
        } catch(e) { dump(e) }
	},
	
	change : function( page, doc ) {
		var id = "foxtrick_addactionsbox_parentDiv";
		if(!doc.getElementById(id)) {
			this.run( page, doc );
		}
	},
	
	createRatings : function( ev ) {
        
		var doc = ev.target.ownerDocument;
        var ad = '[table]';
        var table = doc.getElementsByTagName('table')[0];
        for (var row = 0; row < table.rows.length; row ++) {
            if (row != table.rows.length-3 )  {
                try {
                    if ( table.rows[row].cells[1] && table.rows[row].cells[1].innerHTML.indexOf( '<br>' ) != -1 ) {} else {
                    //no hatstats detailes and no pic/mots/normal, i hope :)
                    ad += '[tr][td]';
                    if (table.rows[row].cells[0]) ad += table.rows[row].cells[0].textContent;
                    ad += '[/td][td]';
                    if (table.rows[row].cells[1]) ad += table.rows[row].cells[1].textContent;
                    ad += '[/td][td]';
                    if (table.rows[row].cells[2]) ad += table.rows[row].cells[2].textContent;            
                    ad += '[/td][/tr]';
                    }
                } catch (e) {}
            }
        }
        ad += '[/table]';        
		try {

			Foxtrick.alert(Foxtrickl10n.getString("foxtrick.tweaks.ratingscopied"));
			Foxtrick.copyStringToClipboard(ad);
			
		} catch (e) {
			Foxtrick.alert(e);
		}
        
	}
};