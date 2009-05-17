/**
 * ratingstoclipboard.js
 * Copies matchratings to the clipboard (table style)
 * @author spambot
 */

var FoxtrickCopyRatingsToClipboard = {

    MODULE_NAME : "CopyRatingsToClipboard",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8",	
	SCREENSHOT:"",
	PREF_SCREENSHOT:"",
	LASTEST_CHANGE:"new table format, added matchID and result",    

	init : function() {
        Foxtrick.registerPageHandler( 'match', this );
    },
    
    run : function( page, doc ) {
        var isprematch = (doc.getElementById("ctl00_CPMain_pnlPreMatch")!=null);
		if (isprematch) return;

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
        var _d = Foxtrickl10n.getString("foxtrick.matchdetail.defence" );
        var _m = Foxtrickl10n.getString("foxtrick.matchdetail.midfield" );
        var _a = Foxtrickl10n.getString("foxtrick.matchdetail.attack" );
        
		var doc = ev.target.ownerDocument;
        
        var headder = doc.getElementsByTagName('h1')[0].innerHTML;
        headder=Foxtrick.trim(headder);
        var start = strrpos(headder, '<span>(') +7;
        var end = strrpos(headder, ')</span>');
        
        var gameid = headder.substr(start, end-start);
        
        start = strrpos(headder, ' - ');
        var gameresult_h = Foxtrick.trim(headder.substr(start-2, 2));
        var gameresult_a = Foxtrick.trim(headder.substr(start+3, 2));            
        
        
        var ad = '\n[table]\n';
        var table = doc.getElementsByTagName('table')[0];
        var youth = '';
        if (strrpos(table.rows[0].cells[1].innerHTML, 'isYouth=True')) youth = 'youth';
        // Foxtrick.alert(table.rows[0].cells[1].innerHTML);

        for (var row = 0; row < table.rows.length; row ++) {
            if (row != table.rows.length-3 )  {
                try {
                    // if ( table.rows[row].cells[1] && table.rows[row].cells[1].innerHTML.indexOf( '' ) != -1 ) {} else {
                    //no hatstats detailes and no pic/mots/normal, i hope :)
                    ad += '[tr]\n\n[th]';
                    if ((table.rows[row].cells[0]) && row == 0) {ad += '['+  youth + 'matchid=' + gameid + ']';}
                      else 
                        if (table.rows[row].cells[0]) {ad += table.rows[row].cells[0].textContent;}
                    if (row == 0) ad += '[/th]\n[th]'; else ad += '[/th]\n[td]';
                    if (table.rows[row].cells[1]) {
                        if (row == 0) {
                            ad += table.rows[row].cells[1].textContent.replace(_d, '[br]'+_d).replace(_m, '[br]'+_m).replace(_a, '[br]'+_a) + ' ' + gameresult_h + '';
                        } else {
                            ad += table.rows[row].cells[1].textContent.replace(_d, '[br]'+_d).replace(_m, '[br]'+_m).replace(_a, '[br]'+_a);
                        }
                    }
                    if (row == 0) ad += '[/th]\n[th]'; else ad += '[/td]\n[td]';
                    if (table.rows[row].cells[2]) {
                        if (row == 0) {
                            ad += table.rows[row].cells[2].textContent.replace(_d, '[br]'+_d).replace(_m, '[br]'+_m).replace(_a, '[br]'+_a) + ' ' + gameresult_a + '';
                        } else {
                            ad += table.rows[row].cells[2].textContent.replace(_d, '[br]'+_d).replace(_m, '[br]'+_m).replace(_a, '[br]'+_a);
                        }
                    }

                    if (row == 0) ad += '[/th]\n\n[/tr]\n'; else ad += '[/td]\n\n[/tr]\n';
                    // }
                } catch (e) {}
            }
        }
        ad += '\n[/table]\n';        
		try {

			Foxtrick.alert(Foxtrickl10n.getString("foxtrick.tweaks.ratingscopied"));
			Foxtrick.copyStringToClipboard(ad);
			
		} catch (e) {
			Foxtrick.alert(e);
		}
        
	}
};