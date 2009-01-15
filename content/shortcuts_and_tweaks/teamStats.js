/**
 * teamStats.js
 * Foxtrick team overview
 * @author OBarros
 */
////////////////////////////////////////////////////////////////////////////////
var FTTeamStats= {
    
    MODULE_NAME : "FTTeamStats",
        MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
        DEFAULT_ENABLED : true,

    init : function() {
            Foxtrick.registerPageHandler( 'players',
                                          FTTeamStats);
    },

    run : function( page, doc ) {

		var remain=doc.location.href.substr(doc.location.href.search(/Players\//i)+8);
		if (remain!="" && remain.search(/TeamID=/i)==-1) return;
	
        var specs = {};
		var allDivs2 = doc.getElementsByTagName( "p" );
		for( var i = 0; i < allDivs2.length; i++ ) {
			
			if( allDivs2[i].textContent.match(/TSI\ \=/g) ) {
				var specc = allDivs2[i];
				if(specc) {
					// specialities
                    var specMatch = specc.textContent.match(/\[\D+\]/g);
                    // dump(' ==>' + specMatch+'\n');
                    if (specMatch != null) {
                        // dump(' == ==>' + specMatch+'\n');
                        var spec = substr(specMatch[0], 0, specMatch[0].length);
                        if (typeof(specs[spec]) == 'undefined') {
                            specs[spec] = 1;
                        } else {
                            specs[spec]++;
                        }
                    }
				}
			}
		}

		var boxrightt=doc.getElementById('sidebar');
		
        var specsTable = "";
        for (var spec in specs) {
          specsTable += "<tr><td class=\"ch\">" + spec.replace(/\[|\]/g,"") + "</td><td>" + specs[spec] + "</td></tr>";
        }
      
        var transferListed = getElementsByClass( "transferListed", doc );
        var img_lis = '<img style="width: 10px; height: 18px;" ilo-full-src="http://www.hattrick.org/Img/Icons/dollar.gif" src="/Img/Icons/dollar.gif" class="transferListed" title="">';
        if (transferListed.length > 0) {
          specsTable += "<tr><td class=\"ch\">" + img_lis + "</td><td>" + transferListed.length + "</td></tr>";
        }

        var yellow = getElementsByClass( "cardsOne", doc );
        var img_yel = '<img style="width: 8px; height: 12px;" ilo-full-src="http://www.hattrick.org/Img/Icons/yellow_card.gif" src="/Img/Icons/yellow_card.gif" class="cardsOne" title="">';
        if (yellow.length > 0) {
            var yels = 0;
            try {
                for (var j = 0; j < yellow.length; j++) {
                    var head = yellow[j].parentNode;
                    
                    if (head.innerHTML.indexOf('yellow_card', 0) != -1 ) yels += 1;              
                }
            } 
            catch(e) {
                dump(e);
            }
            if (yels > 0) specsTable += "<tr><td class=\"ch\">" + img_yel + "</td><td>" + yels + "</td></tr>";
        }

        var yellow_2 = getElementsByClass( "cardsTwo", doc );
        var img_yel = '<img style="width: 17px; height: 12px;" ilo-full-src="http://www.hattrick.org/Img/Icons/dual_yellow_card.gif" src="/Img/Icons/dual_yellow_card.gif" class="cardsTwo" title="">';
        if (yellow_2.length > 0) {
          specsTable += "<tr><td class=\"ch\">" + img_yel + "</td><td>" + yellow_2.length + "</td></tr>";
        }

        var red = getElementsByClass( "cardsOne", doc );
        var img_red = '<img style="width: 8px; height: 12px;" ilo-full-src="http://www.hattrick.org/Img/Icons/red_card.gif" src="/Img/Icons/red_card.gif" class="cardsOne" title="">';
        if (red.length > 0) {
            var reds = 0;
            try {
                for (var j = 0; j < red.length; j++) {
                    var head = red[j].parentNode;
                    
                    if (head.innerHTML.indexOf('red_card', 0) != -1 ) reds += 1;              
                }
            } 
            catch(e) {
                dump(e);
            }
            if (reds > 0) specsTable += "<tr><td class=\"ch\">" + img_red + "</td><td>" + reds + "</td></tr>";
        }

        var injuries = getElementsByClass( "injuryBruised", doc );
        var img_bru = '<img style="width: 19px; height: 8px;" ilo-full-src="http://www.hattrick.org/Img/Icons/bruised.gif" src="/Img/Icons/bruised.gif" class="injuryBruised" title="">';
        if (injuries.length > 0) {
          specsTable += "<tr><td class=\"ch\">" + img_bru + "</td><td>" + injuries.length + "</td></tr>";
        }

        var injuries = getElementsByClass( "injuryInjured", doc );
        if (injuries) {
            var weeks = 0;
            try {
                for (var j = 0; j < injuries.length; j++) {
                    var head = injuries[j].parentNode;
                    weeks += parseInt(substr(head.innerHTML, strrpos( head.innerHTML, "<span>")+6, 1));              
                }
            } 
            catch(e) {
                dump(e);
            }
        }
        var img_inj = '<img style="width: 11px; height: 11px;" ilo-full-src="http://www.hattrick.org/Img/Icons/injured.gif" src="/Img/Icons/injured.gif" class="injuryInjured" title="" alt="">';
        if (weeks > 0) specsTable += "<tr><td class=\"ch\">" + img_inj + "</td><td>" + injuries.length +  " (<b>" + weeks + "</b>)" + "</td></tr>";
                
        if (true) {
		//<p>Aktueller Verein: <a href="/Club/?TeamID=1720048" title="&amp;FC&amp; BESIKTAS">&FC& BESIKTAS</a> (Türkiye)</p>

            var countries = {};
            var found = false;
            var allDivs2 = doc.getElementsByTagName( "p" );
            for( var i = 0; i < allDivs2.length; i++ ) {
                
                if( allDivs2[i].textContent.match(/\:/g) ) {
                    var ctrc = allDivs2[i];
                    if(ctrc) {
                        // specialities
                        var ctrMatch = ctrc.textContent.match(/\(\D+\)/g);
                        dump(' ==>' + ctrMatch+'\n');
                        if (ctrMatch != null) {
                            dump(' == ==>' + ctrMatch+'\n');
                            var land = substr(ctrMatch[0], 0, ctrMatch[0].length);
                            if (typeof(countries[land]) == 'undefined') {
                                countries[land] = 1;
                                found = true;
                            } else {
                                countries[land]++;
                            }
                        }
                    }
                }
            }
            
            if (found){
                var countriesTable = '';
                countriesTable += '<tr><td class="ch"><u>'+ Foxtrickl10n.getString("foxtrick.FTTeamStats.countries.label") + '</u></td></td>';
                for (var land in countries) {
                    countriesTable += "<tr><td class=\"\">" + land.replace(/\(|\)/g,"") + "</td><td>" + countries[land] + "</td></tr>";
                }
                specsTable += countriesTable;            
                // dump(countries);
            }
            
        }
        
		var boxrightt=doc.getElementById('sidebar');
        var contentDiv = boxrightt.innerHTML;

        var txt ='';
        if (specsTable != "") txt = '<table class="smallText">' + specsTable + "</table>";

		var NovaVar; 
		
		NovaVar = '<div class="sidebarBox">';
		NovaVar += '<div class="boxHead">';
		NovaVar += '<div class="boxLeft">';
		NovaVar += '<h2 class="">'+ Foxtrickl10n.getString("foxtrick.FTTeamStats.label") + '</h2>';
		NovaVar += '</div>';
		NovaVar += '</div>';
		NovaVar += '<div class="boxBody">';
		if (txt !="") NovaVar += txt;
		NovaVar += '</div>';
		NovaVar += '<div class="boxFooter"><div class="boxLeft">&nbsp;</div>';
		NovaVar += '</div>';
		NovaVar += '</div>';

		if (txt !="") boxrightt.innerHTML = contentDiv + NovaVar;
        },
        
        change : function( page, doc ) {
        
        }
};