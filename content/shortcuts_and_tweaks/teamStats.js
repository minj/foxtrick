/**
 * teamStats.js
 * Foxtrick team overview
 * @author OBarros & spambot
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
	
		var NT_players = doc.location.href.indexOf("NTPlayers");
		var total_NT = 0;
		
        var specs = {};
		var allDivs2 = doc.getElementsByTagName( "p" );
		for( var i = 0; i < allDivs2.length; i++ ) {
			
			if( allDivs2[i].textContent.match(/TSI\ \=/g) ) {
				
				//JB: If is National team page counts Total TSI
				var specc = allDivs2[i];
				if (NT_players > 1) {
					try {
	
						var tsipos1 = parseInt(specc.textContent.indexOf("TSI = ") + 6);				
						var tsitot_in = specc.textContent.substr(tsipos1, 8);
						tsitot_in = tsitot_in.replace(/[\(\)\.\-\s,]/g, "");
						tsitot_in = parseInt(tsitot_in);
						total_NT = parseInt(total_NT) + tsitot_in;
						
					}				
					catch(e) {
						dump(e);
					}
				}
				
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
		
		
		
		//JB: Function to format numbers with spaces
		
		function addSpace(nStr)
		{
			nStr += '';
			x = nStr.split('.');
			x1 = x[0];
			x2 = x.length > 1 ? '.' + x[1] : '';
			var rgx = /(\d+)(\d{3})/;
			while (rgx.test(x1)) {
				x1 = x1.replace(rgx, '$1' + ' ' + '$2');
			}
			return x1 + x2;
		}
		
		//If NT displays Total TSI
        if (NT_players > 1) specsTable += "<tr><td class=\"ch\">TOTAL TSI</td><td>" + addSpace(total_NT) + "</td></tr>";

		
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
                
        if ( true ) {
		// Early test of country counter. Works, but has no finished design
            var countries = {};
            var found = false;
            var allDivs2 = doc.getElementsByTagName( "p" );
            for( var i = 0; i < allDivs2.length; i++ ) {
                
                if( allDivs2[i].innerHTML.indexOf('TeamID=', 0) != -1 ) {
                    var ctrc = allDivs2[i].innerHTML;
                    // dump('    ['+ctrc + ']\n');
                    if(ctrc) {
                        // specialities
                        var ctrMatch = this._checkCountry( ctrc );
                        
                        // dump(' ==>' + ctrMatch+'\n');
                        if (ctrMatch != null) {
                            // dump(' == ==>' + ctrMatch + '\n');
                            if (typeof(countries[ctrMatch]) == 'undefined') {
                                countries[ctrMatch] = 1;
                                found = true;
                            } else {
                                countries[ctrMatch]++;
                            }
                        }
                    }
                } else {
                    // dump('    ['+allDivs2[i].innerHTML + ']\n');                
                }
            }
            
            if (found){
				// put in array and sort
				var landarray = new Array();
				for (var land in countries) { landarray.push({"land":land,"value":countries[land]});}			
				landarray.sort(function (a,b) { return a["land"].localeCompare(b["land"])}); 
				landarray.sort(function (a,b) { return a["value"]<b["value"]}); 
				
				var countriesTable = '';
                countriesTable += '<tr><td class="ch"><u>'+ Foxtrickl10n.getString("foxtrick.FTTeamStats.countries.label") + '</u></td></td>';
                for (var i=0;i< landarray.length;i++) {
                    countriesTable += "<tr><td class=\"\">" + landarray[i].land.replace(/\(|\)/g,"") + "</td><td>" + landarray[i].value + "</td></tr>";
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
        
        _checkCountry : function ( ctrc ) {
            if (ctrc == null ) return;
            ctrc = substr(ctrc, strrpos( ctrc, "</a>")+4, ctrc.lebgth);
            // dump('=> stripped => ' + ctrc + '\n');
            var found = -1;
            for (var i = 0; i < this.COUNTRYLIST.length; i++) {
                if (strrpos( ctrc, this.COUNTRYLIST[i]) > 0 ) {
                    found = i;
                    break;
                }
            }
            if ( found != -1) {
                return this.COUNTRYLIST[found];
            }
            return false;
        },
        
        change : function( page, doc ) {
        
        },

        COUNTRYLIST : new Array (
        "Al Iraq",
        "Al Kuwayt",
        "Al Maghrib",
        "Al Urdun",
        "Al Yaman",
        "Algérie",
        "Andorra",
        "Angola",
        "Argentina",
        "Az?rbaycan",
        "Bahrain",
        "Bangladesh",
        "Barbados",
        "Belarus",
        "België",
        "Benin",
        "Bolivia",
        "Bosna i Hercegovina",
        "Brasil",
        "Brunei",
        "Bulgaria",
        "Cabo Verde",
        "Canada",
        "Ceská republika",
        "Chile",
        "China",
        "Chinese Taipei",
        "Colombia",
        "Costa Rica",
        "Côte d’Ivoire",
        "Crna Gora",
        "Cymru",
        "Cyprus",
        "Danmark",
        "Dawlat Qatar",
        "Deutschland",
        "Dhivehi Raajje",
        "Ecuador",
        "Eesti",
        "El Salvador",
        "England",
        "España",
        "Føroyar",
        "France",
        "Ghana",
        "Guatemala",
        "Hanguk",
        "Hayastan",
        "Hellas",
        "Honduras",
        "Hong Kong",
        "Hrvatska",
        "India",
        "Indonesia",
        "Iran",
        "Ireland",
        "Ísland",
        "Israel",
        "Italia",
        "Jamaica",
        "Kampuchea",
        "Kazakhstan",
        "Kenya",
        "Kyrgyzstan",
        "Latvija",
        "Lëtzebuerg",
        "Liechtenstein",
        "Lietuva",
        "Lubnan",
        "Magyarország",
        "Makedonija",
        "Malaysia",
        "Malta",
        "México",
        "Misr",
        "Moçambique",
        "Moldova",
        "Mongol Uls",
        "Nederland",
        "Nicaragua",
        "Nigeria",
        "Nippon",
        "Norge",
        "Northern Ireland",
        "Oceania",
        "Oman",
        "Österreich",
        "Pakistan",
        "Panamá",
        "Paraguay",
        "Perú",
        "Philippines",
        "Polska",
        "Portugal",
        "Prathet Thai",
        "Republica Dominicana",
        "România",
        "Rossiya",
        "Sakartvelo",
        "Saudi Arabia",
        "Schweiz",
        "Scotland",
        "Sénégal",
        "Shqiperia",
        "Singapore",
        "Slovenija",
        "Slovensko",
        "South Africa",
        "Srbija",
        "Suomi",
        "Suriname",
        "Suriyah",
        "Sverige",
        "Tanzania",
        "Tounes",
        "Trinidad &amp; Tobago",
        "Türkiye",
        "Uganda",
        "Ukraina",
        "United Arab Emirates",
        "Uruguay",
        "USA",
        "Venezuela",
        "Vietnam")            
};
