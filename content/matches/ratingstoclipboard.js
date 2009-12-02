/**
 * ratingstoclipboard.js
 * Copies matchratings to the clipboard (table style)
 * @author spambot
 */

var FoxtrickCopyRatingsToClipboard = {

    MODULE_NAME : "CopyRatingsToClipboard",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : new Array('match'), 
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.9.1",	
	LATEST_CHANGE:"Fixing away match copy, youth team links",    
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,

	init : function() {
    },
    
    run : function( page, doc ) {
        var isprematch = (doc.getElementById("ctl00_CPMain_pnlPreMatch")!=null);
		if (isprematch) return;

		var mainBody = doc.getElementById('mainBody');
        var table = mainBody.getElementsByTagName('table')[0];
        if (table == null ) return;
        
        try {
		
		if (FoxtrickPrefs.getBool( "smallcopyicons" )) {
			if (doc.getElementById('copyratings')) return;
			
			var boxHead = doc.getElementById('mainWrapper').getElementsByTagName('div')[1];
			if (boxHead.className!='boxHead') return;

            // both
			var top=6;
			var right=6;
			if (Foxtrick.isStandardLayout ( doc ) ) {top=10;if (doc.getElementById('hattrick')) {right+=25;}}
			if (doc.getElementById('hattrick')) {right+=25;}
			
			var messageLink = doc.createElement("a");
			messageLink.className = "inner";
			messageLink.setAttribute("style","cursor: pointer; right:"+right+"px; position:absolute; top: "+top+"px; z-index:99");
			messageLink.title = Foxtrickl10n.getString("foxtrick.tweaks.copyratings" );
			messageLink.setAttribute("team1","true");
            messageLink.setAttribute("team2","true");
            messageLink.setAttribute("id","copyratings");
            messageLink.addEventListener("click", this.createRatings, false)
			var img = doc.createElement("img");
			img.setAttribute('style',"padding: 0px 5px 0px 0px; height:22px; width:22px; background: transparent url(chrome://foxtrick/content/resources/img/copyplayerad_22.png) no-repeat scroll 0 0;");
			img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyratings" );
			img.src = "chrome://foxtrick/content/resources/img/transparent_002.gif";			
			messageLink.appendChild(img);
			boxHead.insertBefore(messageLink,boxHead.firstChild);

			var top=6;
			var right=33;
			if (Foxtrick.isStandardLayout ( doc ) ) {top=10;if (doc.getElementById('hattrick')) {right+=25;}}
			if (doc.getElementById('hattrick')) {right+=25;}

			var messageLink = doc.createElement("a");
			messageLink.className = "inner";
			messageLink.setAttribute("style","cursor: pointer; right:"+right+"px; position:absolute; top: "+top+"px; z-index:99");
			messageLink.title = Foxtrickl10n.getString("foxtrick.tweaks.copyratings.home" );
			messageLink.setAttribute("team1","true");
            messageLink.setAttribute("team2","false");
            messageLink.addEventListener("click", this.createRatings, false)
			var img = doc.createElement("img");
			img.setAttribute('style',"padding: 0px 5px 0px 0px; height:22px; width:22px; background: transparent url(chrome://foxtrick/content/resources/img/copyratingshome_22.png) no-repeat scroll 0 0;");
			img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyratings.home" );
			img.src = "chrome://foxtrick/content/resources/img/transparent_002.gif";			
			messageLink.appendChild(img);
			boxHead.insertBefore(messageLink,boxHead.firstChild);
		

			var top=6;
			var right=60;
			if (Foxtrick.isStandardLayout ( doc ) ) {top=10;if (doc.getElementById('hattrick')) {right+=25;}}
			if (doc.getElementById('hattrick')) {right+=25;}

			var messageLink = doc.createElement("a");
			messageLink.className = "inner";
			messageLink.setAttribute("style","cursor: pointer; right:"+right+"px; position:absolute; top: "+top+"px; z-index:99");
			messageLink.title = Foxtrickl10n.getString("foxtrick.tweaks.copyratings.away" );
			messageLink.setAttribute("team1","false");
            messageLink.setAttribute("team2","true");
            messageLink.addEventListener("click", this.createRatings, false)
			var img = doc.createElement("img");
			img.setAttribute('style',"padding: 0px 5px 0px 0px; height:22px; width:22px; background: transparent url(chrome://foxtrick/content/resources/img/copyratingsaway_22.png) no-repeat scroll 0 0;");
			img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyratings.away" );
			img.src = "chrome://foxtrick/content/resources/img/transparent_002.gif";			
			messageLink.appendChild(img);
			boxHead.insertBefore(messageLink,boxHead.firstChild);
		}
		else {
		
            var parentDiv = doc.createElement("div");
            parentDiv.id = "foxtrick_addactionsbox_parentDiv";
            
            // both
			var messageLink = doc.createElement("a");
            messageLink.className = "inner";
            messageLink.title = Foxtrickl10n.getString( "foxtrick.tweaks.copyratings" );
            messageLink.setAttribute("style","cursor: pointer;");
            messageLink.setAttribute("team1","true");
            messageLink.setAttribute("team2","true");
            messageLink.addEventListener("click", this.createRatings, false)
            
            var img = doc.createElement("img");
            img.setAttribute("style","padding:0px 5px 0px 0px;");
            img.className = "actionIcon";
            img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyratings" );
            img.src = "chrome://foxtrick/content/resources/img/copyplayerad.png";
            messageLink.appendChild(img);
                    
            parentDiv.appendChild(messageLink);
            
            var newBoxId = "foxtrick_actions_box";
            Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString( 
                "foxtrick.tweaks.actions" ), parentDiv, newBoxId, "first", "");
				
			// team home	
            var messageLink = doc.createElement("a");
            messageLink.className = "inner";
            messageLink.title = Foxtrickl10n.getString( "foxtrick.tweaks.copyratings.home" );
            messageLink.setAttribute("style","cursor: pointer;");
            messageLink.setAttribute("team1","true");
            messageLink.setAttribute("team2","false");
            messageLink.addEventListener("click", this.createRatings, false)
            
            var img = doc.createElement("img");
            img.setAttribute("style","padding:0px 5px 0px 0px;");
            img.className = "actionIcon";
            img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyratings.home" );
            img.src = "chrome://foxtrick/content/resources/img/copyratingshome.png";
            messageLink.appendChild(img);
                    
            parentDiv.appendChild(messageLink);
            
            var newBoxId = "foxtrick_actions_box";
            Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString( 
                "foxtrick.tweaks.actions" ), parentDiv, newBoxId, "first", "");
            
			// team away
			var messageLink = doc.createElement("a");
            messageLink.className = "inner";
            messageLink.title = Foxtrickl10n.getString( "foxtrick.tweaks.copyratings.away" );
            messageLink.setAttribute("style","cursor: pointer;");
            messageLink.setAttribute("team1","false");
            messageLink.setAttribute("team2","true");
            messageLink.addEventListener("click", this.createRatings, false)
            
            var img = doc.createElement("img");
            img.setAttribute("style","padding:0px 5px 0px 0px;");
            img.className = "actionIcon";
            img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyratings" );
            img.src = "chrome://foxtrick/content/resources/img/copyratingsaway.png";
            messageLink.appendChild(img);
                    
            parentDiv.appendChild(messageLink);
            
            var newBoxId = "foxtrick_actions_box";
            Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString( 
                "foxtrick.tweaks.actions" ), parentDiv, newBoxId, "first", "");
		}
		} catch(e) { Foxtrick.dump(e) }
	},
	
	change : function( page, doc ) {
		var id = "foxtrick_addactionsbox_parentDiv";
		if(!doc.getElementById(id)) {
			this.run( page, doc );
		}
	},
	
	createRatings : function( ev ) {
	try {
		var team1=ev.target.parentNode.getAttribute('team1')=='true';
		var team2=ev.target.parentNode.getAttribute('team2')=='true';
		
        var _d = Foxtrickl10n.getString("foxtrick.matchdetail.defence" );
        var _m = Foxtrickl10n.getString("foxtrick.matchdetail.midfield" );
        var _a = Foxtrickl10n.getString("foxtrick.matchdetail.attack" );
        
		var doc = ev.target.ownerDocument;
        
        var headder = doc.getElementsByTagName('h1')[0].innerHTML;  
        headder=Foxtrick.trim(headder);
        var start = Foxtrick.strrpos(headder, '<span>(') +7;
        var end = Foxtrick.strrpos(headder, ')</span>');
        
        var matchlink=doc.getElementById('mainWrapper').getElementsByTagName('a')[0];
		var gameid = FoxtrickHelper.getMatchIdFromUrl(matchlink.href);// headder.substr(start, end-start);
        
        start = Foxtrick.strrpos(headder, ' - ');
        var gameresult_h = Foxtrick.trim(headder.substr(start-2, 2));
        var gameresult_a = Foxtrick.trim(headder.substr(start+3, 2));            
        
        
        var ad = '\n[table]\n';
        var table = doc.getElementsByTagName('table')[0].cloneNode(true);
		for (var row=0; row<table.rows.length; ++row) {
				if(!team1 && table.rows[row].cells.length>=2) table.rows[row].cells[1].innerHTML='###';
				if(!team2 && table.rows[row].cells.length>=3) table.rows[row].cells[2].innerHTML='###';
		}
		
        var youth = '';
        //if (Foxtrick.strrpos(table.rows[0].cells[1].innerHTML, 'isYouth=True')) youth = 'youth';
        if (matchlink.href.search('isYouth=True')!=-1) youth = 'youth';
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
							var teamlink = table.rows[row].cells[1].getElementsByTagName('a')[0];
							if (teamlink)
								ad += teamlink.innerHTML + ((team2==true)?(' - ' + gameresult_h):'') + '[br]['+youth+'teamid='+FoxtrickHelper.getTeamIdFromUrl(teamlink.href)+']';
                        } else {
                            ad += table.rows[row].cells[1].textContent.replace(_d, '[br]'+_d).replace(_m, '[br]'+_m).replace(_a, '[br]'+_a);
                        }
                    }
                    if (row == 0) ad += '[/th]\n[th]'; else ad += '[/td]\n[td]';
                    if (table.rows[row].cells[2]) {
                        if (row == 0) {
                        	var teamlink = table.rows[row].cells[2].getElementsByTagName('a')[0];
                            if (teamlink)
								ad += teamlink.innerHTML + ((team1==true)?(' - ' + gameresult_a):'') + '[br]['+youth+'teamid='+FoxtrickHelper.getTeamIdFromUrl(teamlink.href)+']';
                        } else {
                            ad += table.rows[row].cells[2].textContent.replace(_d, '[br]'+_d).replace(_m, '[br]'+_m).replace(_a, '[br]'+_a);
                        }
                    }

                    if (row == 0) ad += '[/th]\n\n[/tr]\n'; else ad += '[/td]\n\n[/tr]\n';
                    // }
					
				} catch (e) {}
            }
        }
		ad = ad.replace(/\[td\]###\[\/td\]/gi,'');
        ad += '\n[/table]\n';
        
        if(!(team1 && team2)) {
            var ad_s = ad.split('[/tr]');
            for (var i = 0; i < ad_s.length; i++){
                if (i == 10) ad_s[i] = '[tr]';
                ad_s[i] = ad_s[i].replace(/\[th\]\[\/th\]/gi,'');
                ad_s[i] = ad_s[i].replace(/\[td\]\[\/td\]/gi,'');
            }
            ad = ad_s.join('[/tr]').replace(/\[tr\]\[\/tr\]/,'');
        }    
	} catch(e) {Foxtrick.dump('ratingscopied error: '+e+'\n');}
		try {

			if (FoxtrickPrefs.getBool( "copyfeedback" )) 
				Foxtrick.alert(Foxtrickl10n.getString("foxtrick.tweaks.ratingscopied"));
			Foxtrick.copyStringToClipboard(ad);
			
		} catch (e) {
			Foxtrick.alert(e);
		}
        
	}
};