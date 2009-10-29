/**
 * teamStats.js
 * Foxtrick team overview
 * @author OBarros & spambot
 */
////////////////////////////////////////////////////////////////////////////////
Foxtrick.TeamStats= {
    
    MODULE_NAME : "FTTeamStats",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('players','YouthPlayers'), 
    DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8.9",
	LATEST_CHANGE:"Fixed pictures missing after multiple filter usage",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	latestMatch:0,
	top11star:0,

    init : function() {
    },

    run : function( page, doc ) {	
	
		var remain=doc.location.href.substr(doc.location.href.search(/Players\//i)+8);
		if (remain!="" && remain.search(/TeamID=/i)==-1) return;
			
		var NT_players = (doc.location.href.indexOf("NTPlayers") != -1);
        var Oldies = (doc.location.href.indexOf("Oldies.aspx") != -1);
        var Youth_players = (doc.location.href.indexOf("YouthPlayers\.aspx") != -1);
        var coach = (doc.location.href.indexOf("Coaches\.aspx") != -1);
        var facecards=false;
		
		var total_NT = 0;
        const _totalTSI = Foxtrickl10n.getString("foxtrick.FTTeamStats.totalTSI.label");
		const TSI = Foxtrickl10n.getString("foxtrick.playerliststats.tsi"); 
        var specs = {};
		
		var body = doc.getElementById("mainBody");
		var allDivs = body.getElementsByTagName('div');
		this.latestMatch=-1;
		var stars=new Array();
		var num_too_old=0;
		var num_not_too_old=0;
		var transferListed=0,reds=0,yellow=0,yellow_2=0,injuryInjured=0,injuryInjuredweeks=0,injuryBruised=0;
	
		for( var i = 0; i < allDivs.length; i++ ) {
				if (allDivs[i].className!="playerInfo") continue;
				
				var allDivs2 = allDivs[i].getElementsByTagName( "p" )[0];
				
				//JB: If is National team page counts Total TSI
				var specc = allDivs2;
				if (!Youth_players) {
					try { 
						var tsitot_in = specc.innerHTML.substr(0,specc.innerHTML.lastIndexOf('<br>'));
                        if (Oldies || NT_players) tsitot_in = tsitot_in.substr(0,tsitot_in.lastIndexOf('<br>'));
                        //dump (' => tsitot_in => [' + tsitot_in + ']\n');
						if (tsitot_in.search(/^\s*TSI/) != -1) tsitot_in = tsitot_in.replace(/,.+/,''); // In the language Vlaams, TSI and age are switched. This is a fix for that
						var lastindex = tsitot_in.lastIndexOf(' ');
						if (tsitot_in.lastIndexOf('=') > lastindex) lastindex = tsitot_in.lastIndexOf('=');
						tsitot_in = tsitot_in.substr(lastindex+1).replace('&nbsp;',''); 
						tsitot_in = parseInt(tsitot_in);  
						total_NT = parseInt(total_NT) + tsitot_in;
					}				
					catch(e) {
						dump('FTTeamStats'+e);
					}
				}
				else {
					var age = specc.innerHTML.match(/\d+/); 
					var ageday = specc.innerHTML.match(/(\d+)/g)[1];
					if (age>=19) {
						allDivs2.setAttribute('style','color:red; font-weight:bold;');
						++num_too_old;
					}
					else ++num_not_too_old;
				}
				
				if(specc) {
					// specialities
                    var specMatch = specc.textContent.match(/\[\D+\]/g);
                    // dump(' ==>' + specMatch+'\n');
                    if (specMatch != null) {
                        // dump(' == ==>' + specMatch+'\n');
                        var spec = Foxtrick.substr(specMatch[0], 0, specMatch[0].length);
                        if (typeof(specs[spec]) == 'undefined') {
                            specs[spec] = 1;
                        } else {
                            specs[spec]++;
                        }
                    }
				}
				
				var imgs = allDivs[i].getElementsByTagName( "img" );
				var img,k=0,num_star=0;
				while (img=imgs[k++]) {
					if (img.className=="starWhole") num_star+=1;
					else if (img.className=="starHalf") num_star+=0.5;
					else if (img.className=="transferListed") ++transferListed;
					else if (img.className=="cardsOne") { 
					    if (img.src.indexOf('red_card', 0) != -1 ) ++reds;   
						else ++yellow;
					}
					else if (img.className=="cardsTwo") ++yellow_2;					
					else if (img.className=="injuryInjured") {
						++injuryInjured;
						injuryInjuredweeks += parseInt(img.nextSibling.innerHTML);
					}
					else if (img.className=="injuryBruised") ++injuryBruised;
					
				}
				stars.push(num_star);
				
				var as=allDivs[i].getElementsByTagName('a');
				var j=0,a=null;
				while(a=as[j++]){if (a.href.search(/matchid/i)!=-1) break;}
				var matchday=0;
				if (a) matchday=Foxtrick.getUniqueDayfromCellHTML(a.innerHTML); 
				if (matchday>this.latestMatch) this.latestMatch = matchday;
		}
		stars.sort(this.starsortfunction);
		this.top11star=stars[10]; 

		
		if (body.getElementsByTagName("div")[0].className=='faceCard' || body.getElementsByTagName("div")[1].className=='faceCard') facecards=true;;		
			
		
		var boxrightt=doc.getElementById('sidebar');
		
        var specsTable = "";
		
				
		
		//If NT displays Total TSI
        if (!Youth_players && !coach) specsTable += "<tr><td class=\"ch\">" + _totalTSI + "</td><td>" + Foxtrick.ReturnFormatedValue(total_NT,'&nbsp;') + "</td></tr>";

		
        for (var spec in specs) {
          specsTable += "<tr><td class=\"ch\">" + spec.replace(/\[|\]/g,"") + "</td><td>" + specs[spec] + "</td></tr>";
        }
      
        var img_lis = '<img style="width: 10px; height: 18px;" ilo-full-src="http://www.hattrick.org/Img/Icons/dollar.gif" src="/Img/Icons/dollar.gif" class="transferListed" title="">';
        if (transferListed > 0) specsTable += "<tr><td class=\"ch\">" + img_lis + "</td><td>" + transferListed + "</td></tr>";

        var img_yel = '<img style="width: 8px; height: 12px;" ilo-full-src="http://www.hattrick.org/Img/Icons/yellow_card.gif" src="/Img/Icons/yellow_card.gif" class="cardsOne" title="">';
        if (yellow > 0)  specsTable += "<tr><td class=\"ch\">" + img_yel + "</td><td>" + yellow + "</td></tr>";        
        
		var img_yel = '<img style="width: 17px; height: 12px;" ilo-full-src="http://www.hattrick.org/Img/Icons/dual_yellow_card.gif" src="/Img/Icons/dual_yellow_card.gif" class="cardsTwo" title="">';
        if (yellow_2 > 0) specsTable += "<tr><td class=\"ch\">" + img_yel + "</td><td>" + yellow_2 + "</td></tr>"; 
        
		var img_red = '<img style="width: 8px; height: 12px;" ilo-full-src="http://www.hattrick.org/Img/Icons/red_card.gif" src="/Img/Icons/red_card.gif" class="cardsOne" title="">';
        if (reds > 0) specsTable += "<tr><td class=\"ch\">" + img_red + "</td><td>" + reds + "</td></tr>";
 
        var img_bru = '<img style="width: 19px; height: 8px;" ilo-full-src="http://www.hattrick.org/Img/Icons/bruised.gif" src="/Img/Icons/bruised.gif" class="injuryBruised" title="">';
        if (injuryBruised > 0) specsTable += "<tr><td class=\"ch\">" + img_bru + "</td><td>" + injuryBruised + "</td></tr>";
        
        var img_inj = '<img style="width: 11px; height: 11px;" ilo-full-src="http://www.hattrick.org/Img/Icons/injured.gif" src="/Img/Icons/injured.gif" class="injuryInjured" title="" alt="">';
        if (injuryInjured > 0) specsTable += "<tr><td class=\"ch\">" + img_inj + "</td><td>" + injuryInjured +  " (<b>" + injuryInjuredweeks + "</b>)" + "</td></tr>";
                
        if ( !NT_players ) {
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
		if (Youth_players) {
		  var style='';
		  if (num_not_too_old<9) style='color:red !important; font-weight:bold !important';
          specsTable += "<tr style='"+style+"'><td class=\"ch\">" + Foxtrickl10n.getString("foxtrick.FTTeamStats.PlayerNotToOld.label") + "</td><td>" + num_not_too_old + "</td></tr>";
          if (num_too_old>0) specsTable += "<tr><td class=\"ch\">" + Foxtrickl10n.getString("foxtrick.FTTeamStats.PlayerToOld.label") + "</td><td>" + num_too_old + "</td></tr>";                    
		}
        


		var	table = doc.createElement("table");
		table.setAttribute( "class", 'smallText' );
        table.innerHTML=specsTable;
		
		var	ownBoxBody = doc.createElement("div");
		var header = Foxtrickl10n.getString("foxtrick.FTTeamStats.label");
		var ownBoxId = "foxtrick_FTTeamStats_box";
		var ownBoxBodyId = "foxtrick_FTTeamStats_content";
		ownBoxBody.setAttribute( "id", ownBoxBodyId );
        ownBoxBody.appendChild(table);
		Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "last", "");

		/*var boxrightt=doc.getElementById('sidebar');
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
		*/
		
		
		// add filters
		var sortbybox= doc.getElementById("ctl00_CPMain_ucSorting_ddlSortBy"); 		
		if (Youth_players) sortbybox= doc.getElementById("ctl00_CPMain_ddlSortBy");
		sortbybox.setAttribute('style','font-size:1.05em;');
		var filterselect=doc.createElement('select');
		filterselect.setAttribute('style','font-size:1.05em;');
		//filterselect.setAttribute('class','sorting');
		filterselect.addEventListener('change',Foxtrick.TeamStats.Filter,false);
		var option=doc.createElement('option');
		option.setAttribute('value','');
		option.innerHTML='---';
		filterselect.appendChild(option);
		var option=doc.createElement('option');
		option.setAttribute('value','Cards');
		option.innerHTML=Foxtrickl10n.getString("foxtrick.FTTeamStats.Cards.label");
		filterselect.appendChild(option);
		var option=doc.createElement('option');
		option.setAttribute('value','Injured');
		option.innerHTML=Foxtrickl10n.getString("foxtrick.FTTeamStats.Injured.label");;
		filterselect.appendChild(option);
		if (!Youth_players) {
			var option=doc.createElement('option');
			option.setAttribute('value','TransferListed');
			option.innerHTML=Foxtrickl10n.getString("foxtrick.FTTeamStats.TransferListed.label");;
			filterselect.appendChild(option);
		}
		
		var option=doc.createElement('option');
		option.setAttribute('value','PlayedLatest');
		option.innerHTML=Foxtrickl10n.getString("foxtrick.FTTeamStats.PlayedLatest.label");;
		filterselect.appendChild(option);
		
		var option=doc.createElement('option');
		option.setAttribute('value','NotPlayedLatest');
		option.innerHTML=Foxtrickl10n.getString("foxtrick.FTTeamStats.NotPlayedLatest.label");;
		filterselect.appendChild(option);
		
		for (var spec in specs) {
			var purspec=spec.replace(/\[|\]/g,'');
			var option = doc.createElement('option');
			option.setAttribute('value',purspec);
			option.innerHTML = purspec
			filterselect.appendChild(option);
		}
		if (facecards) {
			var option=doc.createElement('option');
			option.setAttribute('value','Pictures');
			option.innerHTML=Foxtrickl10n.getString("foxtrick.FTTeamStats.Pictures.label");
			filterselect.appendChild(option);
		}
		
		var mainBody= doc.getElementById('mainBody');
		sortbybox=mainBody.removeChild(sortbybox);
		sortbybox.className="";
		sortbybox.setAttribute('style','width:100%');
		var table=doc.createElement('table');
		table.setAttribute('style','float:right; width:auto');
		var tbody=doc.createElement('tbody');
		table.appendChild(tbody);
		var tr=doc.createElement('tr');
		tbody.appendChild(tr);
		var td=doc.createElement('td');
		tr.appendChild(td);
		td.appendChild(sortbybox);
		var tr=doc.createElement('tr');
		tbody.appendChild(tr);
		var td=doc.createElement('td');
		tr.appendChild(td);
		td.appendChild(filterselect);
		mainBody.insertBefore(table,mainBody.firstChild);
		//sortbybox.parentNode.insertBefore(filterselect,sortbybox);
		Foxtrick.TeamStats.Filter.doc=doc;
		
        },
        
        _checkCountry : function ( ctrc ) {
            if (ctrc == null ) return;
            ctrc = Foxtrick._to_utf8(Foxtrick.substr(ctrc, Foxtrick.strrpos( ctrc, "</a>")+4, ctrc.lebgth));
            // dump('=> stripped => ' + ctrc + '\n');
            var found = -1;
            for (var i = 0; i < this.COUNTRYLIST.length; i++) {
                if (Foxtrick.strrpos( ctrc, this.COUNTRYLIST[i]) > 0 ) {
                    found = i;
                    break;
                }
            }
            if ( found != -1) {
                return Foxtrick._from_utf8(this.COUNTRYLIST[found]);
            }
            // dump('=> not found=> ' + this.COUNTRYLIST[found] + '\n');
            return false;
        },
        
        change : function( page, doc ) {
        
        },

		starsortfunction : function(a,b)  {return a[0]>b[0];},
		
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
        "Azərbaycan",
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
        "Česká republika",
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
        "Vietnam"),            

	// by convinced
	Filter : function (ev){
	try {
		var doc = Foxtrick.TeamStats.Filter.doc;
		var filter = ev.target.value;
		var isnotFF35 = !Foxtrick.isFF35(doc);
		
		var body = doc.getElementById("mainBody");
		var allDivs = body.getElementsByTagName('div');
		
		var no_playerlist=true,i=0,adiv;
		while (adiv = allDivs[i++]) {
			if (adiv.className == 'playerList') { no_playerlist=false; allDivs = adiv.childNodes; break;}
		} 
		if (no_playerlist)  { 
			allDivs = body.childNodes; 
			isnotFF35 = true;  // lazy fix for ff3.5 version as zaw currently uses only playerlist. fixable
		} 
		
		var lastborderSeparator = null, lastborder_j = -1;
		var count=0;
		
		var hide = false;
		var hide_category = true;
		var last_category = null, last_j = -1;
		var last_face = null;
		var zaw='/*FT_FILTER*/'; 
			
		var i=0,adiv,j=0;  
		while (adiv = allDivs[i++]) {
			if (adiv.nodeName=='DIV') ++j; 
			if (adiv.className=='category') {
				    if (last_category) { 
						if (hide_category==true || filter=='Pictures')  {
							if (isnotFF35) last_category.setAttribute('style','display:none !important;');
							else zaw += 'div.playerList>div:nth-of-type('+ (last_j-1) +') {display:none;}';						
						}
						else {
							if (isnotFF35) last_category.style.display=''; //dump(hide+' '+last_category.innerHTML+'\n');
						}
					}	
					last_category = adiv; 
					last_i = j;
					hide_category = true;
			}
			
			else if (adiv.className=='faceCard') last_face=adiv; 

			else if (adiv.className=='playerInfo') {			

				// get date
				var as=adiv.getElementsByTagName('a');
				var kk=0,a=null;
				while(a=as[kk++]){if (a.href.search(/matchid/i)!=-1) break;}
				var matchday=0;
				if (a) matchday=Foxtrick.getUniqueDayfromCellHTML(a.innerHTML); 

				/*
				// count stars
				var imgs = adiv.getElementsByTagName( "img" );	
				var img,k=0,num_star=0;
				while (img=imgs[k++]) {
					if (img.className=="starWhole") num_star+=1;
					else if (img.className=="starHalf") num_star+=0.5;
				} 
				*/
				
				if (filter=='Cards' && adiv.innerHTML.search('card.gif')==-1)  {
						if (isnotFF35) adiv.setAttribute('style','display:none !important;');
						else zaw += 'div.playerList>div:nth-of-type('+ j +') {display:none;}';
						hide = true; //dump('<-hide _nocard ');
				}
				else if (filter=='Injured' 
							&& (adiv.innerHTML.search('bruised.gif')==-1 && adiv.innerHTML.search('injured.gif')==-1))  {
						if (isnotFF35) adiv.setAttribute('style','display:none !important;');
						else zaw += 'div.playerList>div:nth-of-type('+ j +') {display:none;}';
						hide = true; //dump('hide');
				}
				else if (filter=='TransferListed' && adiv.innerHTML.search('dollar.gif')==-1)  {
						if (isnotFF35) adiv.setAttribute('style','display:none !important;');
						else zaw += 'div.playerList>div:nth-of-type('+ j +') {display:none;}';
						hide = true; //dump('hide');
				} 
				else if (filter=='Pictures')  {
						if (isnotFF35) adiv.setAttribute('style','display:none !important;');
						else zaw += 'div.playerList>div:nth-of-type('+ j +') {display:none;}';
						hide = true; //dump('hide');
				} 						
				else if (filter=='PlayedLatest' && matchday!=Foxtrick.TeamStats.latestMatch)  {
						if (isnotFF35) adiv.setAttribute('style','display:none !important;');
						else zaw += 'div.playerList>div:nth-of-type('+ j +') {display:none;}';
						hide = true; //dump('hide');
				}
				else if (filter=='NotPlayedLatest' && matchday==Foxtrick.TeamStats.latestMatch) {
						if (isnotFF35) adiv.setAttribute('style','display:none !important;');
						else zaw += 'div.playerList>div:nth-of-type('+ j +') {display:none;}';
						hide = true; //dump('hide');
				}
				/*else if (filter=='TopPlayers' && num_star < Foxtrick.TeamStats.top11star)  {
						if (isnotFF35) adiv.setAttribute('style','display:none !important;');
						else zaw += 'div.playerList>div:nth-of-type('+ j +') {display:none;}';
						hide = true; //dump('hide');
				}*/
				else if (filter!='Cards' && filter!='Injured' && filter!='TransferListed' 
							&& filter!='Pictures' && filter!='PlayedLatest'  && filter!='NotPlayedLatest' 
							&& filter!='TopPlayers' && adiv.innerHTML.search(filter)==-1)  {
						if (isnotFF35) adiv.setAttribute('style','display:none !important;');
						else zaw += 'div.playerList>div:nth-of-type('+ j +') {display:none;}';
						hide = true; //dump('hide');
				}				
				else {
					 	if (isnotFF35)  adiv.setAttribute('style','');
						hide = false; //dump('show');
						hide_category = false;										
				} 
				if (hide && filter!='Pictures') { 
					if (last_face) { 
						if (last_face.style.display) last_face.style.display='none !important;'; 
						else last_face.setAttribute('style',last_face.getAttribute('style')+'display:none !important;'); 
					}
				}
				else { 	if (last_face) {
							/*if (isnotFF35)*/  last_face.style.display=''; 
						}
				}
				//dump(' '+filter+' '+adiv.getElementsByTagName('a')[0].innerHTML+'\n');
				if (!hide || filter=='Pictures') ++count;
			}
			else if (adiv.className=='borderSeparator' || adiv.className=='separator' || adiv.className=='youthnotes') { //dump('border hide:'+hide+'\n');
				if (hide==true) {
					if (isnotFF35) adiv.setAttribute('style','display:none !important;');
					else zaw += 'div.playerList>div:nth-of-type('+ j +') {display:none;}';						
				}
				else if (isnotFF35) adiv.setAttribute('style','');				
			}	
			var lastborder_i;			
			if (adiv.className=='borderSeparator' || adiv.className=='separator') {
				lastborderSeparator=adiv;			
				lastborder_i = j;
			}
		}
		if (filter == 'Pictures') {
			if (isnotFF35) lastborderSeparator.style.display='';
		}
		if (last_category) { 
			if (hide_category==true || filter=='Pictures')  {
				if (isnotFF35) last_category.setAttribute('style','display:none !important;');
				else zaw += 'div.playerList>div:nth-of-type('+ (lastborder_j-1) +') {display:none;}';	
			}
			else if (isnotFF35) last_category.setAttribute('style','');
		}
				
		if (!isnotFF35) { 
			var head = doc.getElementsByTagName("head")[0];
			
			// remove old filter
            var styles = head.getElementsByTagName("style");
			var k=0, style;
			while (style=styles[k++]) {
				if (style.innerHTML.search(/FT_FILTER/)!=-1) {head.removeChild(style);break;}
			}
			
			// hide elements ff3.5
            var style = doc.createElement("style");
            style.setAttribute("type", "text/css");
			style.appendChild(doc.createTextNode(zaw));
            head.appendChild(style);
		}
		
		var h = body.getElementsByTagName('h1')[0];
		h.innerHTML = h.innerHTML.replace(/ \d+/,' '+String(count));
		
	}catch(e) {dump('FTTeamStats_Filter: '+e+'\n');}
	},	
};




