/**
 * adultskilltable.js
 * hide unknown youthskills
 * @Authors:  convincedd
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickAdultSkillTable = {
    
    MODULE_NAME : "AdultSkillTable",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('players'), 
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.4.9.1",
	LATEST_CHANGE:"Added adultskilltable",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
    OPTIONS : new Array("HideSpecialty","HideLastStars","HideLastPosition","CopySkillTable"), 
	CSS: "chrome://foxtrick/content/resources/css/adultskilltable.css",
	
	copy_string:"",
	htLanguagesXml : null,
	
    init : function() {
 		this.initHtLang();
    },

    run : function( page, doc ) {
		try  {
				var ownteamid = FoxtrickHelper.findTeamId(doc.getElementById('teamLinks'));
				var teamid = FoxtrickHelper.findTeamId(doc.getElementById('content').getElementsByTagName('div')[0]);
				var is_ownteam = (ownteamid==teamid);
				//if (!is_ownteam) return;
				
				var tablediv = doc.createElement('div');
				tablediv.setAttribute('id','ft_adultskilltable');
				var h2 = doc.createElement('h2');
				h2.innerHTML = Foxtrickl10n.getString('Youthskills.Skilltable');
				FoxtrickAdultSkillTable.HeaderClick.doc=doc;
				h2.addEventListener( "click", this.HeaderClick, true );						
				h2.setAttribute('class','ft_boxBodyCollapsed');
				tablediv.appendChild(h2);
				var header=doc.getElementsByTagName('h1')[0];
				header.parentNode.insertBefore(tablediv,header.nextSibling);			
		} catch(e) {Foxtrick.dump('FoxtrickAdultSkillTable.run error: '+e+'\n');}
	},
	
	change : function( page, doc ) {	
	},

	
	copyTable : function( ev ) {
		var doc = ev.target.ownerDocument;
		Foxtrick.copyStringToClipboard(FoxtrickAdultSkillTable.copy_string );
		if (FoxtrickPrefs.getBool( "copyfeedback" )) 
					Foxtrick.alert(Foxtrickl10n.getString("foxtrick.tweaks.yskilltablecopied"));			
	},

	sortfunction: function(a,b) {return a.cells[FoxtrickAdultSkillTable.s_index].innerHTML.localeCompare(b.cells[FoxtrickAdultSkillTable.s_index].innerHTML);},
	sortdownfunction: function(a,b) {return parseInt(b.cells[FoxtrickAdultSkillTable.s_index].innerHTML.replace(/\&nbsp| /g,'')) > parseInt(a.cells[FoxtrickAdultSkillTable.s_index].innerHTML.replace(/\&nbsp| /g,''));},
	sortdowntextfunction: function(a,b) {return (b.cells[FoxtrickAdultSkillTable.s_index].innerHTML.localeCompare(a.cells[FoxtrickAdultSkillTable.s_index].innerHTML));},
	sortlinksfunction: function(a,b) {return a.cells[FoxtrickAdultSkillTable.s_index].getElementsByTagName('a')[0].innerHTML.localeCompare(b.cells[FoxtrickAdultSkillTable.s_index].getElementsByTagName('a')[0].innerHTML);},
	sortagefunction: function(a,b) {return a.cells[FoxtrickAdultSkillTable.s_index].getAttribute('age').localeCompare(b.cells[FoxtrickAdultSkillTable.s_index].getAttribute('age'));},

	sortClick : function(ev) {
	try{
		var doc = ev.originalTarget.ownerDocument;
		var tablediv = doc.getElementById('ft_adultskilltable');
		var table = tablediv.getElementsByTagName('table')[0];
		var table_old = table.cloneNode(true);
		FoxtrickAdultSkillTable.s_index = ev.target.getAttribute('s_index');
		if (!FoxtrickAdultSkillTable.s_index)  FoxtrickAdultSkillTable.s_index = ev.target.parentNode.getAttribute('s_index');
		
		//Foxtrick.dump('sortby: '+FoxtrickAdultSkillTable.s_index+'\n');
		
		var rows= new Array();
		for (var i=1;i<table.rows.length;++i) {
			rows.push(table_old.rows[i]);
		}
		//table.rows[3].innerHTML = table_old.rows[1].innerHTML;
		if (FoxtrickAdultSkillTable.s_index==0) rows.sort(FoxtrickAdultSkillTable.sortlinksfunction);
		else if (FoxtrickAdultSkillTable.s_index==1) rows.sort(FoxtrickAdultSkillTable.sortagefunction);
		else if (FoxtrickAdultSkillTable.s_index<=4) rows.sort(FoxtrickAdultSkillTable.sortdownfunction);
		else if (FoxtrickAdultSkillTable.s_index<=11) rows.sort(FoxtrickAdultSkillTable.sortdownfunction);
		else rows.sort(FoxtrickAdultSkillTable.sortdowntextfunction);
		
		for (var i=1;i<table.rows.length;++i) {
			table.rows[i].innerHTML = rows[i-1].innerHTML;
		}
	} catch(e) {Foxtrick.dump('sortClick '+e+'\n');}
	},

	HeaderClick : function(ev) {
	try{
		var doc = ev.target.ownerDocument;
		var tablediv = doc.getElementById('ft_adultskilltable');
		var NT_players = (doc.location.href.indexOf("NTPlayers") != -1);
        var Oldies = (doc.location.href.indexOf("Oldies.aspx") != -1);
        var Youth_players = (doc.location.href.indexOf("YouthPlayers\.aspx") != -1);
        var coach = (doc.location.href.indexOf("Coaches\.aspx") != -1);
        
		var table = tablediv.getElementsByTagName('table')[0]
		if (!table || table.style.display=='none')  {

				tablediv.getElementsByTagName('h2')[0].setAttribute('class','ft_boxBodyUnfolded');
				if (table) {
					table.style.display='inline';
					return;
				}
							
				var ownteamid = FoxtrickHelper.findTeamId(doc.getElementById('teamLinks'));
				var teamid = FoxtrickHelper.findTeamId(doc.getElementById('content').getElementsByTagName('div')[0]);
				var is_ownteam = (ownteamid==teamid);
				Foxtrick.dump('is_ownteam: '+is_ownteam+'\n');
				var hasbars=true;
				var allDivs = doc.getElementsByTagName("div");				
				if (is_ownteam && !Oldies && !coach)
				{	for (var i = 0; i < allDivs.length; i++) {				
						if(allDivs[i].className=="playerInfo") {
							var trs = allDivs[i].getElementsByTagName("table")[0].getElementsByTagName("tr");						
							if (trs.length==4) {hasbars=false; break;}
						}	
					}
					Foxtrick.dump('hasbars: '+hasbars+'\n');
				}
						
				FoxtrickAdultSkillTable.copy_string = '[table]';
				table = doc.createElement('table');
				table.setAttribute('style','display:inline');
				FoxtrickAdultSkillTable.copy_string += '[tr]';
				var tr = doc.createElement('tr');
				table.appendChild(tr);
				
				if (hasbars) var sn=['Player','YearsDays','TSI','Fo','Sta','GK','DF','PM','WI','PS','SC','SP','YC','RC','Br','In','Spec','ST','PO'];
				else var sn=['Player','YearsDays','TSI','Fo','Sta','GK','PM','PS','WI','DF','SC','SP','YC','RC','Br','In','Spec','ST','PO'];
				for(var j = 0; j < 12; j++) {
							FoxtrickAdultSkillTable.copy_string += '[th]';
							var th = doc.createElement('th');
							if ((!is_ownteam || Oldies || NT_players || coach )  && j>=5) th.setAttribute('style','display:none');
							if (j>0) th.setAttribute('class','ft_adultskilltable_td_normal');
							th.setAttribute('s_index',j);
							th.addEventListener( "click", FoxtrickAdultSkillTable.sortClick, true );						
							th.title=Foxtrickl10n.getString("SortBy");
							FoxtrickAdultSkillTable.copy_string +=  Foxtrickl10n.getString(sn[j]);
							th.innerHTML = Foxtrickl10n.getString(sn[j]);
							tr.appendChild(th);
							FoxtrickAdultSkillTable.copy_string += '[/th]';										
				}
				
				// yellow cards header
				FoxtrickAdultSkillTable.copy_string += '[th]';
				var th = doc.createElement('th');
				th.setAttribute('class','ft_adultskilltable_td_small');
				th.setAttribute('s_index',12);
				th.addEventListener( "click", FoxtrickAdultSkillTable.sortClick, true );						
				th.title=Foxtrickl10n.getString("SortBy");
				FoxtrickAdultSkillTable.copy_string += Foxtrickl10n.getString(sn[12]);
				th.innerHTML = '<img alt="'+Foxtrickl10n.getString(sn[12])+'" class="cardsOne" src="/Img/Icons/yellow_card.gif" ilo-full-src="http://www.hattrick.org/Img/Icons/yellow_card.gif" style="width: 8px; height: 12px;"/>';					
				tr.appendChild(th);
				FoxtrickAdultSkillTable.copy_string += '[/th]';
				
				// red cards header
				FoxtrickAdultSkillTable.copy_string += '[th]';
				var th = doc.createElement('th');
				th.setAttribute('class','ft_adultskilltable_td_small');
				th.addEventListener( "click", FoxtrickAdultSkillTable.sortClick, true );						
				th.title=Foxtrickl10n.getString("SortBy");
				th.setAttribute('s_index',13);
				FoxtrickAdultSkillTable.copy_string += Foxtrickl10n.getString(sn[13]);
				th.innerHTML = '<img alt="'+Foxtrickl10n.getString(sn[13])+'" class="cardsOne" src="/Img/Icons/red_card.gif" ilo-full-src="http://www.hattrick.org/Img/Icons/red_card.gif" style="width: 8px; height: 12px;"/>';					
				tr.appendChild(th);
				FoxtrickAdultSkillTable.copy_string += '[/th]';
				
				// bruised header
				FoxtrickAdultSkillTable.copy_string += '[th]';
				var th = doc.createElement('th');
				th.setAttribute('class','ft_adultskilltable_td_small');
				th.setAttribute('s_index',14);
				th.addEventListener( "click", FoxtrickAdultSkillTable.sortClick, true );						
				th.title=Foxtrickl10n.getString("SortBy");
				FoxtrickAdultSkillTable.copy_string += '(+)';
				th.innerHTML = '<img alt="(+)" class="injuryBruised" src="/Img/Icons/bruised.gif" style="width: 11px; height: 11px;"/>';					
				tr.appendChild(th);
				FoxtrickAdultSkillTable.copy_string += '[/th]';
				
				// injured header
				FoxtrickAdultSkillTable.copy_string += '[th]';
				var th = doc.createElement('th');
				th.setAttribute('class','ft_adultskilltable_td_small');
				th.setAttribute('s_index',15);
				th.addEventListener( "click", FoxtrickAdultSkillTable.sortClick, true );						
				th.title=Foxtrickl10n.getString("SortBy");
				FoxtrickAdultSkillTable.copy_string += '+';
				th.innerHTML = '<img alt="+" class="injuryInjured" src="/Img/Icons/injured.gif" ilo-full-src="http://www.hattrick.org/Img/Icons/injured.gif" style="width: 11px; height: 11px;"/>';					
				tr.appendChild(th);
				FoxtrickAdultSkillTable.copy_string += '[/th]';
				
				// specialty header
				if (!Foxtrick.isModuleFeatureEnabled( FoxtrickAdultSkillTable, "HideSpecialty" )) 
				{
				FoxtrickAdultSkillTable.copy_string += '[th]';
				var th = doc.createElement('th');
				th.setAttribute('class','ft_adultskilltable_td_small');
				th.setAttribute('s_index',16);
				th.addEventListener( "click", FoxtrickAdultSkillTable.sortClick, true );						
				th.title=Foxtrickl10n.getString("SortBy");
				FoxtrickAdultSkillTable.copy_string += Foxtrickl10n.getString(sn[16]);
				th.innerHTML = Foxtrickl10n.getString(sn[16]);
				tr.appendChild(th);
				FoxtrickAdultSkillTable.copy_string += '[/th]';
				}
				
				// played last match stars header
				if (!Foxtrick.isModuleFeatureEnabled( FoxtrickAdultSkillTable, "HideLastStars" )) 
				{
				FoxtrickAdultSkillTable.copy_string += '[th]';
				var th = doc.createElement('th');
				th.setAttribute('class','ft_adultskilltable_td_small');
				th.setAttribute('s_index',17);
				th.addEventListener( "click", FoxtrickAdultSkillTable.sortClick, true );						
				th.title=Foxtrickl10n.getString("SortBy");
				FoxtrickAdultSkillTable.copy_string += '*';
				th.innerHTML = '<img alt="*" class="starWhole" src="/Img/Matches/star_blue.png" ilo-full-src="http://www.hattrick.org/Img/Matches/star_blue.png"/>';					
				tr.appendChild(th);
				FoxtrickAdultSkillTable.copy_string += '[/th]';
				}
				
				// played last match position header 
				if (!Foxtrick.isModuleFeatureEnabled( FoxtrickAdultSkillTable, "HideLastPosition" )) 
				{
				FoxtrickAdultSkillTable.copy_string += '[th]';
				var th = doc.createElement('th');
				th.setAttribute('class','ft_adultskilltable_td_small');
				th.setAttribute('s_index',18);
				th.addEventListener( "click", FoxtrickAdultSkillTable.sortClick, true );						
				th.title=Foxtrickl10n.getString("SortBy");
				FoxtrickAdultSkillTable.copy_string += Foxtrickl10n.getString(sn[18]);
				th.innerHTML = Foxtrickl10n.getString(sn[18]);
				tr.appendChild(th);
				FoxtrickAdultSkillTable.copy_string += '[/th]';
				}
									
				FoxtrickAdultSkillTable.copy_string += '[/tr]';

				// get last match  
				var latestMatch=-1;
				if (!Oldies && !NT_players && !coach) {
				for(var i = 0; i < allDivs.length; i++) {			
					if(allDivs[i].className=="playerInfo") {
						var as=allDivs[i].getElementsByTagName('a');
						var j=0,a=null;
						while(a=as[j++]){if (a.href.search(/matchid/i)!=-1) break;}
						var matchday=0;
						if (a) matchday=Foxtrick.getUniqueDayfromCellHTML(a.innerHTML); 
						if (matchday>latestMatch) latestMatch = matchday;
					}
				}}

				var count =0;
				for(var i = 0; i < allDivs.length; i++) {
					
					var even=true;
					
					if(allDivs[i].className=="playerInfo") {
						count++;

						var sktable = allDivs[i].getElementsByTagName("table")[0];
						if (sktable && sktable.parentNode.className.search('myht2')!=-1) sktable=null;
						if (sktable) var trs = sktable.getElementsByTagName("tr");	
						
						FoxtrickAdultSkillTable.copy_string += '[tr]';
						var tr = doc.createElement('tr');
						if (count==4) {tr.setAttribute('class','ft_skilltable_blockend'); count=0;}
						table.appendChild(tr);
						
						// name (linked)
						FoxtrickAdultSkillTable.copy_string += '[td]';
						var td = doc.createElement('td');
						FoxtrickAdultSkillTable.copy_string += allDivs[i].getElementsByTagName("a")[0].innerHTML;  // unlinked
						td.appendChild(allDivs[i].getElementsByTagName("a")[0].cloneNode(true));
						FoxtrickAdultSkillTable.copy_string += '[/td]';
						tr.appendChild(td);
												
						// age
						var age = allDivs[i].getElementsByTagName("p")[0].innerHTML.match(/(\d+)/g);						
						FoxtrickAdultSkillTable.copy_string += '[td]';
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_adultskilltable_td_normal'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_adultskilltable_td_normal'); even=true;}
						FoxtrickAdultSkillTable.copy_string += age[0]+'.'+age[1];
						td.innerHTML=age[0]+'.'+age[1]; 
						td.setAttribute('age',age[0]+'.'+(age[1].length==1?('00'+age[1]):(age[1].length==2?('0'+age[1]):age[1]))); 
						FoxtrickAdultSkillTable.copy_string += '[/td]';
						tr.appendChild(td);
						
						var specc = allDivs[i].getElementsByTagName( "p" )[0];
						
						// tsi etc
							FoxtrickAdultSkillTable.copy_string += '[td]';
							var td = doc.createElement('td');
							if (even) {td.setAttribute('class','ft_table_even ft_adultskilltable_td_small'); even=false;}
							else {td.setAttribute('class','ft_table_odd ft_adultskilltable_td_small'); even=true;}							
							var tsitot_in = allDivs[i].getElementsByTagName('p')[0].innerHTML.substr(0,specc.innerHTML.lastIndexOf('<br>'));
							if (Oldies || NT_players) tsitot_in = tsitot_in.substr(0,tsitot_in.lastIndexOf('<br>'));
							//Foxtrick.dump (' => tsitot_in => [' + tsitot_in + ']\n');
							if (tsitot_in.search(/^\s*TSI/) != -1) tsitot_in = tsitot_in.replace(/,.+/,''); // In the language Vlaams, TSI and age are switched. This is a fix for that
							var lastindex = tsitot_in.lastIndexOf(' ');
							if (tsitot_in.lastIndexOf('=') > lastindex) lastindex = tsitot_in.lastIndexOf('=');
							tsitot_in = tsitot_in.substr(lastindex+1).replace('&nbsp;',''); 
							tsitot_in = parseInt(tsitot_in);  													
							td.appendChild(doc.createTextNode(tsitot_in));
							FoxtrickAdultSkillTable.copy_string += '[/td]';
							tr.appendChild(td);												

							FoxtrickAdultSkillTable.copy_string += '[td]';
							var td = doc.createElement('td');
							if (even) {td.setAttribute('class','ft_table_even ft_adultskilltable_td_small'); even=false;}
							else {td.setAttribute('class','ft_table_odd ft_adultskilltable_td_small'); even=true;}						
							var val = allDivs[i].getElementsByTagName("a")[1].href.match(/ll=(\d+)/)[1];  
							td.appendChild(doc.createTextNode(val));
							FoxtrickAdultSkillTable.copy_string += val						
							FoxtrickAdultSkillTable.copy_string += '[/td]';
							tr.appendChild(td);												

							FoxtrickAdultSkillTable.copy_string += '[td]';
							var td = doc.createElement('td');
							if (even) {td.setAttribute('class','ft_table_even ft_adultskilltable_td_small'); even=false;}
							else {td.setAttribute('class','ft_table_odd ft_adultskilltable_td_small'); even=true;}
							var val = allDivs[i].getElementsByTagName("a")[2].href.match(/ll=(\d+)/)[1];  
							td.appendChild(doc.createTextNode(val));
							FoxtrickAdultSkillTable.copy_string += val						
							FoxtrickAdultSkillTable.copy_string += '[/td]';
							tr.appendChild(td);												

						
						// skills
						var start=0,end=7,inc=1; 
						if (!hasbars) {start=2,end=16;inc=2;}
						for(var j = start; j < end; j+=inc) {
							FoxtrickAdultSkillTable.copy_string += '[td]';
							var td = doc.createElement('td');
							if (even) {td.setAttribute('class','ft_table_even ft_adultskilltable_td_normal'); even=false;}
							else {td.setAttribute('class','ft_table_odd ft_adultskilltable_td_normal'); even=true;}
							tr.appendChild(td);							
							if (!is_ownteam || Oldies || NT_players || coach ) {td.setAttribute('style','display:none'); continue;}

							if (sktable) { 
								if (hasbars) {
									var tds = trs[j].getElementsByTagName("td");
									var imgs = tds[1].getElementsByTagName('img');
									var cur = imgs[0].title.match(/-?\d+/);								
									FoxtrickAdultSkillTable.copy_string += cur;
									td.innerHTML = cur;
								}
								else {
									var tds= allDivs[i].getElementsByTagName("table")[0].getElementsByTagName("td");
									var cur = tds[j+1].getElementsByTagName('a')[0].href.match(/ll=(\d+)/)[1];
									FoxtrickAdultSkillTable.copy_string += cur;
									td.innerHTML = cur;									
								}	
							}
							FoxtrickAdultSkillTable.copy_string += '[/td]';
						}
						if (!is_ownteam) even=true;
						
						// card+injuries
						var cardsyellow=0;
						var cardsred=0;
						var bruised=0;
						var injured=0;						
						var img = allDivs[i].getElementsByTagName("img");
						
						for(var j = 0; j < img.length; j++) {
							if (img[j].className=='cardsOne') {
							    if (img[j].src.indexOf('red_card', 0) != -1 ) cardsred = 1;   
								else cardsyellow=1;
							}
							if (img[j].className=='cardsTwo') {
							    cardsyellow=2;
							}
							if (img[j].className=='injuryBruised') bruised=1;
							if (img[j].className=='injuryInjured') injured = img[j].nextSibling.innerHTML;
						}
						
						FoxtrickAdultSkillTable.copy_string += '[td]';
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_adultskilltable_td_small'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_adultskilltable_td_small'); even=true;}
						if (cardsyellow>0) {
							td.appendChild(doc.createTextNode(cardsyellow));
							FoxtrickAdultSkillTable.copy_string += cardsyellow;
						}
						FoxtrickAdultSkillTable.copy_string += '[/td]';
						tr.appendChild(td);
						
						FoxtrickAdultSkillTable.copy_string += '[td]';
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_adultskilltable_td_small'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_adultskilltable_td_small'); even=true;}
						if (cardsred>0) {
							td.appendChild(doc.createTextNode(cardsred));
							FoxtrickAdultSkillTable.copy_string += cardsred;
						}
						FoxtrickAdultSkillTable.copy_string += '[/td]';
						tr.appendChild(td);
						
						FoxtrickAdultSkillTable.copy_string += '[td]';
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_adultskilltable_td_small'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_adultskilltable_td_small'); even=true;}
						if (bruised>0) {
							td.appendChild(doc.createTextNode(bruised));
							FoxtrickAdultSkillTable.copy_string += bruised;
						}
						FoxtrickAdultSkillTable.copy_string += '[/td]';
						tr.appendChild(td);
						
						FoxtrickAdultSkillTable.copy_string += '[td]';
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_adultskilltable_td_small'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_adultskilltable_td_small'); even=true;}
						if (injured>0) {
							td.appendChild(doc.createTextNode(injured));
							FoxtrickAdultSkillTable.copy_string += injured;
						}
						FoxtrickAdultSkillTable.copy_string += '[/td]';
						tr.appendChild(td);
						
						// specialty
						if (!Foxtrick.isModuleFeatureEnabled( FoxtrickAdultSkillTable, "HideSpecialty" )) 
						{
						FoxtrickAdultSkillTable.copy_string += '[td]';
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_adultskilltable_td_small'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_adultskilltable_td_small'); even=true;}
						specMatch = specc.textContent.match(/\[(\D+)\]/);
						if (specMatch) {					
							var shortspecc = FoxtrickAdultSkillTable._getShortSpecialty(specMatch[1]);
							if (shortspecc) {
								specMatch = shortspecc;
							}	
							else {
								specMatch = specMatch[1].substr(0,2);
								Foxtrick.dump('fallback '+specMatch+'\n')
							}
						}
						else specMatch='';
						td.appendChild(doc.createTextNode(specMatch));
						FoxtrickAdultSkillTable.copy_string += specMatch;
						
						FoxtrickAdultSkillTable.copy_string += '[/td]';
						tr.appendChild(td);
						}
						
						
						// get played last match
						var as=allDivs[i].getElementsByTagName('a');
						var kk=0,a=null;
						while(a=as[kk++]){if (a.href.search(/matchid/i)!=-1) break;}
						var matchday=0;
						if (a) matchday=Foxtrick.getUniqueDayfromCellHTML(a.innerHTML); 
						
						// stars
						if (!Foxtrick.isModuleFeatureEnabled( FoxtrickAdultSkillTable, "HideLastStars" )) 
						{
						FoxtrickAdultSkillTable.copy_string += '[td]';
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_adultskilltable_td_small'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_adultskilltable_td_small'); even=true;}						
						if (matchday==latestMatch) {
							var imgs=a.parentNode.parentNode.getElementsByTagName('img');
							var starcount=0;
							for (var sc=0;sc<imgs.length;++sc) {
								if (imgs[sc].className=='starBig') starcount+=5;
								else if (imgs[sc].className=='starWhole') starcount+=1;
								else if (imgs[sc].className=='starHalf') starcount+=0.5;
							}
							td.appendChild(doc.createTextNode(starcount));
							FoxtrickAdultSkillTable.copy_string += starcount;						
						}
						FoxtrickAdultSkillTable.copy_string += '[/td]';
						tr.appendChild(td);
						}
						
						// last position
						if (!Foxtrick.isModuleFeatureEnabled( FoxtrickAdultSkillTable, "HideLastPosition" )) 
						{
						FoxtrickAdultSkillTable.copy_string += '[td]';
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_adultskilltable_td_small'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_adultskilltable_td_small'); even=true;}
						if (matchday == latestMatch) {
							var pos = a.parentNode.nextSibling.nextSibling.innerHTML.match(/\((.+)\)/)[1];
							var shortpos = FoxtrickAdultSkillTable._getShortPos(pos);
							if (shortpos) {
								pos = shortpos;
							}
							else {
								var sp_pos = pos.search(/ |\&nbsp;/);
								if (sp_pos == -1) pos=pos.substr(0,2)
								else pos = pos.substr(0,1)+pos.substr(sp_pos+1,1);
								Foxtrick.dump('fallback '+pos+'\n')							
							}
							td.appendChild(doc.createTextNode(pos));
							FoxtrickAdultSkillTable.copy_string += pos;												
						}
						FoxtrickAdultSkillTable.copy_string += '[/td]';
						tr.appendChild(td);
						}
												
						
						//Foxtrick.dump(matchday+' '+latestMatch+'\n');
						FoxtrickAdultSkillTable.copy_string += '[/tr]';						
					}
				}
			FoxtrickAdultSkillTable.copy_string += '[/table]';
				
			tablediv.appendChild(table);
				
				
			// copy button
			if (Foxtrick.isModuleFeatureEnabled( FoxtrickAdultSkillTable, "CopySkillTable" )) {	 	
				if (FoxtrickPrefs.getBool( "smallcopyicons" )) {
					if (doc.getElementById('copyskilltable')) return;
					var boxHead = doc.getElementById('mainWrapper').getElementsByTagName('div')[1];
					if (boxHead.className!='boxHead') return;
			
					var top=6;
					var right = 6;
					if (Foxtrick.isStandardLayout ( doc ) ) {top=10;if (doc.getElementById('hattrick')) {right+=25;}}
					if (doc.getElementById('hattrick')) {right+=25;}
					
					var messageLink = doc.createElement("a");
					messageLink.className = "inner";
					messageLink.setAttribute("style","cursor: pointer; right:"+right+"px; position:absolute; top: "+top+"px; z-index:99");
					messageLink.title = Foxtrickl10n.getString("foxtrick.tweaks.copyskilltable" );
					messageLink.id = "copyskilltable" ;
					messageLink.addEventListener("click", FoxtrickAdultSkillTable.copyTable, false)
	
					var img = doc.createElement("img");
					img.setAttribute('style',"padding: 0px 5px 0px 0px; height:22px; width:22px; background: transparent url(chrome://foxtrick/content/resources/img/copyplayerad_22.png) no-repeat scroll 0 0;");
					img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyskilltable" );
					img.src = "chrome://foxtrick/content/resources/img/transparent_002.gif";
			
					messageLink.appendChild(img);
					boxHead.insertBefore(messageLink,boxHead.firstChild);
				}
				else {
					var parentDiv = doc.createElement("div");
					parentDiv.id = "foxtrick_copy_parentDiv";
		
					var messageLink = doc.createElement("a");
					messageLink.className = "inner";
					messageLink.title = Foxtrickl10n.getString("foxtrick.tweaks.copyskilltable" );
					messageLink.setAttribute("style","cursor: pointer;");
					messageLink.addEventListener("click", FoxtrickAdultSkillTable.copyTable, false)
		
					var img = doc.createElement("img");
					img.style.padding = "0px 5px 0px 0px;";
					img.className = "actionIcon";
					img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyskilltable" );
					img.src = "chrome://foxtrick/content/resources/img/copyplayerad.png";
					messageLink.appendChild(img);
				
					parentDiv.appendChild(messageLink);
		
					var newBoxId = "foxtrick_actions_box";
					Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString( 
						"foxtrick.tweaks.actions" ), parentDiv, newBoxId, "first", ""); 	
				}
			}
		}
		else  {
			table.style.display='none';						
			tablediv.getElementsByTagName('h2')[0].setAttribute('class','ft_boxBodyCollapsed');
		}
	} catch(e) {Foxtrick.dump('SkillTableHeaderClick: '+e+'\n');}
	},
	
	_getShortPos: function(pos)
	{
		var short_pos='';
		try {
		  var lang = FoxtrickPrefs.getString("htLanguage");
		} catch (e) {
		  return null;
		}

		try {
			var type = pos.replace(/&nbsp;/,' ');
			var path = "hattricklanguages/language[@name='" + lang + "']/positions/position[@value='" + type + "']";
			var obj = FoxtrickAdultSkillTable.htLanguagesXml.evaluate(path,FoxtrickAdultSkillTable.htLanguagesXml,null,FoxtrickAdultSkillTable.htLanguagesXml.DOCUMENT_NODE,null).singleNodeValue;
			if (obj)
				short_pos = obj.attributes.getNamedItem("short").textContent;
			else
				return null;
		} catch (e) {
			Foxtrick.dump('youthskill.js _getShort: '+e + "\n");
			return null;
		}

		return short_pos;
	},

	_getShortSpecialty: function(pos)
	{
		var short_pos='';
		try {
		  var lang = FoxtrickPrefs.getString("htLanguage");
		} catch (e) {
		  return null;
		}

		try {
			var type = pos.replace(/&nbsp;/,' ');
			var path = "hattricklanguages/language[@name='" + lang + "']/specialties/specialty[@value='" + type + "']";
			var obj = FoxtrickAdultSkillTable.htLanguagesXml.evaluate(path,FoxtrickAdultSkillTable.htLanguagesXml,null,FoxtrickAdultSkillTable.htLanguagesXml.DOCUMENT_NODE,null).singleNodeValue;
			if (obj)
				short_pos = obj.attributes.getNamedItem("short").textContent;
			else
				return null;
		} catch (e) {
			Foxtrick.dump('youthskill.js _getShort: '+e + "\n");
			return null;
		}

		return short_pos;
	},

	initHtLang: function ()
	{
		try {
			this.htLanguagesXml = this._loadXmlIntoDOM("chrome://foxtrick/content/htlocales/htlang.xml");
		} catch (e) {
			Foxtrick.dump('youthskill.js initHtLang: '+e+"\n");
		}
	},

	_loadXmlIntoDOM: function(url) {
		var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
		req.open("GET", url, false);
		req.send(null);
		var doc = req.responseXML;
		if (doc.documentElement.nodeName == "parsererror") {
			Foxtrick.dump("error parsing " + url+"\n");
			return null;
		}
		return doc;
	},
}

