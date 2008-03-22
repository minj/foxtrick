// by atreus

function playerListStats(doc) {

   if (!isPlayersListUrl(doc.location.href)) return;
   if (!getShowTweak("playerliststats")) return;
   
   addStyleSheet(doc, "chrome://foxtrick/content/resources/css/playerliststats.css");
    
    var links = doc.links;

    var totalTSI = 0, totalAge = 0, totalForm = 0, totalExperience = 0, playerCount = 0, maxLeadership = 0;
    var yellowCards = 0, redCards = 0, injuries = 0, injuryweeks = 0, bruises = 0, forSale = 0;
    var tsiArray = new Array();
    
    var includeZeroTSIPlayers = doc.location.href.search(/viewOldieCoaches/i) > -1;
    var playersWithMaxLeadership;
    
    // specialities
    
	var specs = new Array();
	
	for (var i=0; i<doc.links.length; i++) {
	  var tmpNode = doc.links[i].nextSibling;
	  if (tmpNode != null) {
	    if (tmpNode.nodeName == "#text" && (tmpNode.parentNode.nodeName == "TD")) {
	      var specMatch = tmpNode.textContent.match(/\[\D+\]/g);
	      if (specMatch != null) {
	        var spec = specMatch[0];
        	if (typeof(specs[spec]) == 'undefined') {
        	  specs[spec] = 1;
        	} else {
        	  specs[spec]++;
        	}
          }
	    }
	  }
	}
	
	// stats
	
    for (var i=0; i<links.length - 1; i++) {
            if ( isPlayerDetailUrl(links[i].href) && isPlayerDetailUrl(links[i+1].href)) break;
        
            // We don't want the links on the right side, so if the link following it is a link, then ignore it.
            if ( isPlayerDetailUrl(links[i].href) && !isPlayerDetailUrl(links[i+1].href)) {
                
                    var textNode = findSibling(links[i], "BR").nextSibling;
                    
                    var tsiText = textNode.textContent;
					tsiText = tsiText.replace(/\D*=/,'');	//gets rid of 'TSI =' ; nat teams don't have that part
					tsiText = tsiText.replace(/\s/g, ''); //removes all white space

					var tsi_age= new Array();
					tsi_age = tsiText.split(/,/);

					var TSI = (+tsi_age[0]); //turns into number
                    var age = parseInt(tsi_age[1].match(/\d{2}/)[0]);					

					var temp = findSibling(textNode, "A");
                    var playerform = parseInt(getSkillLevelFromLink(temp));
					temp = findSibling(temp, "A");
                    var experience = parseInt(getSkillLevelFromLink(temp));
                    temp = findSibling(temp, "A");
                    var leadership = parseInt(getSkillLevelFromLink(temp));

                    if (includeZeroTSIPlayers || (TSI > 0)) {
/*
                        if ( leadership > maxLeadership) {
                            maxLeadership = leadership;
                            playersWithMaxLeadership = new Array();
                        }
                       
                        if ( leadership == maxLeadership ) {
                            playersWithMaxLeadership[playersWithMaxLeadership.length] = links[i];
                        }
*/                      
                        tsiArray[playerCount] = [TSI, age, playerform, experience];
                        
                        totalTSI += TSI;
                        totalAge += age;
                        totalForm += playerform;
                        totalExperience += experience;
                        playerCount++;
                    }
            }
    }
    
    for (var i=0; i<doc.images.length; i++) {
        var img = doc.images[i];

        if (img.src.match(/\/yellow_card/i)) yellowCards++;
        if (img.src.match(/dual_yellow_card/i)) yellowCards+=2;
        if (img.src.match(/red_card/i)) redCards++;
        if (img.src.match(/injured/i)) {
          injuries++;
          injuryweeks +=parseInt(img.nextSibling.textContent); //should work anywhere
        }
        if (img.src.match(/bruised/i)) bruises++;

        if (img.src.match(/dollar/i)) {
            forSale++;
        }
            
    }

    
    if ( playerCount > 0 ) {

        // Handle the max leadership condition, highlighting those players
/*        for ( i = 0; i < playersWithMaxLeadership.length; i++ ) {
            // Do whatever to the link
        }
*/        
        var divs = doc.getElementsByTagName("div");
        var playerTotals = doc.createElement("p");
        var avgAge = Math.round(10*totalAge/playerCount)/10;
        var avgForm = Math.round(10*totalForm/playerCount)/10;
        var avgExperience = Math.round(10*totalExperience/playerCount)/10;
        
        var avgAgeTop11, avgFormTop11, avgExperienceTop11;

        if ( playerCount >= 11 ) {

            function sortMultiDimensionalDescending(a,b)
            {
                return b[0] - a[0];
            }

            tsiArray.sort(sortMultiDimensionalDescending);            

            var totalStarterTSI = 0, totalStarterAge = 0, totalStarterForm = 0, totalStarterExp = 0;
            for (var i=0; i<11; i++) {
                totalStarterTSI += tsiArray[i][0];
                totalStarterAge += tsiArray[i][1];
                totalStarterForm += tsiArray[i][2];
                totalStarterExp += tsiArray[i][3];
            }
            
            avgAgeTop11 = Math.round(10*totalStarterAge / 11)/10;
            avgFormTop11 = Math.round(10*totalStarterForm / 11)/10;
            avgExperienceTop11 = Math.round(10*totalStarterExp / 11)/10;
           
        }
        
        function statRow(text, type, val1, val2) {
            
            var temp = "";
            switch (type) {
                case "total": { temp= "&sum;"} break;
                case "avg": {temp = "&Oslash;"} break;
            }
            
            return "<tr><th>" + temp + " "
            + messageBundle.GetStringFromName("foxtrick.playerliststats." + text) + "</th>"
            + "<td>" + val1 + "</td>"
            + "<td>" + val2 + "</td>"
            + "</tr>";
            
        }

        var txt = '<table class="foxtrick-playerlist foxtrick-playerliststats">';
        
        txt += "<tr><th></th><th></th>";
        if ( playerCount >= 11 ) {
            txt += '<th style="text-align: center;">Top 11</th>';
        }
        txt += "</tr>";
        
        txt += statRow("tsi", "total", totalTSI.toString().group(" "),
                            totalStarterTSI.toString().group(" "));
        txt += statRow("tsi", "avg", Math.round(totalTSI / playerCount).toString().group(" "),
                              Math.round(totalStarterTSI / 11).toString().group(" "));
        txt += statRow("age", "avg", avgAge, avgAgeTop11);
        txt += statRow("form", "avg", avgForm, avgFormTop11);
        txt += statRow("exp", "avg", avgExperience, avgExperienceTop11);
        
        txt += "</table>";            
        
        if (yellowCards>0 || redCards>0 || injuries>0 || bruises>0 || (forSale>0)) {
          txt += '<p class="foxtrick-playerlistcards">';
          if (yellowCards>0) txt += '<img src="/Common/images/icons/player/yellow_card.gif" />' + yellowCards + " ";
          if (redCards>0) txt += '<img src="/Common/images/icons/player/red_card.gif" />' + redCards + " ";
          if (injuries>0) txt += '<img src="/Common/images/icons/player/injured.gif" />' + injuries + " (" + injuryweeks + " " + messageBundle.GetStringFromName("foxtrick.playerliststats.weeks") +") ";
          if (bruises>0) txt += '<img src="/Common/images/icons/player/bruised.gif" />' + bruises + " ";
          if (forSale>0) txt += '<img src="/Common/images/icons/player/dollar.gif" />' + forSale + " ";
          txt += "</p>";
        }
        
        var specsTable = "";
        for (var spec in specs) {
          specsTable += "<tr><th>" + spec.replace(/\[|\]/g,"") + "</th><td>" + specs[spec] + "</td></tr>";
        }
        if (specsTable != "") txt+= '<table class="foxtrick-playerlist foxtrick-playerlistspecs">' + specsTable + "</table>";


        playerTotals.innerHTML = txt;
       
        var div = doc.createElement("div");
        div.innerHTML = "<h3>" + messageBundle.GetStringFromName("foxtrick.playerliststats.stats") + "</h3>";
        div.appendChild(playerTotals);
        
        // find a place for div insertion

        var temp = doc.links;
        
        for (var i=0; i < temp.length; i++) {
            if (temp[i].href.match(/players\.asp/i)) {
                temp[i].parentNode.insertBefore(div, findSibling(temp[i], "H3"));
                break;
            }

        }

     }

}
