/**
 * youthskilltable.js
 * hide unknown youthskills
 * @Authors:  convincedd
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickYouthSkillTable = {
    
    MODULE_NAME : "YouthSkillTable",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('YouthPlayers'), 
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.4.9.1",
	LATEST_CHANGE:"Better abreviations of specialties and positions for some languages. Some options",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
    OPTIONS : new Array("HideSpecialty","HideLastStars","HideLastPosition","CopySkillTable"), 
	CSS: "chrome://foxtrick/content/resources/css/youthskilltable.css",
	
	copy_string:"",
	htLanguagesXml : null,
	
    init : function() {
 		this.initHtLang();
    },

    run : function( page, doc ) {
		try  {
				var tablediv = doc.createElement('div');
				tablediv.setAttribute('id','ft_youthskilltable');
				var h2 = doc.createElement('h2');
				h2.innerHTML = Foxtrickl10n.getString('Youthskills.Skilltable');
				FoxtrickYouthSkillTable.HeaderClick.doc=doc;
				h2.addEventListener( "click", this.HeaderClick, true );						
				h2.setAttribute('class','ft_boxBodyCollapsed');
				tablediv.appendChild(h2);
				var header=doc.getElementsByTagName('h1')[0];
				header.parentNode.insertBefore(tablediv,header.nextSibling);			
		} catch(e) {Foxtrick.dump('FoxtrickYouthSkillTable.run error: '+e+'\n');}
	},
	
	change : function( page, doc ) {	
	},

	
	copyTable : function( ev ) {
		var doc = ev.target.ownerDocument;
		Foxtrick.copyStringToClipboard(FoxtrickYouthSkillTable.copy_string );
		if (FoxtrickPrefs.getBool( "copyfeedback" )) 
					Foxtrick.alert(Foxtrickl10n.getString("foxtrick.tweaks.yskilltablecopied"));			
	},

	sortfunction: function(a,b) {return a.cells[FoxtrickYouthSkillTable.s_index].innerHTML.localeCompare(b.cells[FoxtrickYouthSkillTable.s_index].innerHTML);},
	sortdownfunction: function(a,b) {return (b.cells[FoxtrickYouthSkillTable.s_index].innerHTML.localeCompare(a.cells[FoxtrickYouthSkillTable.s_index].innerHTML));},
	sortlinksfunction: function(a,b) {return a.cells[FoxtrickYouthSkillTable.s_index].getElementsByTagName('a')[0].innerHTML.localeCompare(b.cells[FoxtrickYouthSkillTable.s_index].getElementsByTagName('a')[0].innerHTML);},
	sortagefunction: function(a,b) {return a.cells[FoxtrickYouthSkillTable.s_index].getAttribute('age').localeCompare(b.cells[FoxtrickYouthSkillTable.s_index].getAttribute('age'));},

	sortClick : function(ev) {
	try{
		var doc = ev.originalTarget.ownerDocument;
		var tablediv = doc.getElementById('ft_youthskilltable');
		var table = tablediv.getElementsByTagName('table')[0];
		var table_old = table.cloneNode(true);
		FoxtrickYouthSkillTable.s_index = ev.target.getAttribute('s_index');
		if (!FoxtrickYouthSkillTable.s_index)  FoxtrickYouthSkillTable.s_index = ev.target.parentNode.getAttribute('s_index');
		
		var rows= new Array();
		for (var i=1;i<table.rows.length;++i) {
			rows.push(table_old.rows[i]);
		}
		//table.rows[3].innerHTML = table_old.rows[1].innerHTML;
		if (FoxtrickYouthSkillTable.s_index==0) rows.sort(FoxtrickYouthSkillTable.sortlinksfunction);
		else if (FoxtrickYouthSkillTable.s_index==1) rows.sort(FoxtrickYouthSkillTable.sortagefunction);
		else rows.sort(FoxtrickYouthSkillTable.sortdownfunction);
		
		for (var i=1;i<table.rows.length;++i) {
			table.rows[i].innerHTML = rows[i-1].innerHTML;
		}
			} catch(e) {Foxtrick.dump(e);}
	},

	HeaderClick : function(ev) {
	try{
		var doc = ev.target.ownerDocument;
		var tablediv = doc.getElementById('ft_youthskilltable');
		var table = tablediv.getElementsByTagName('table')[0]
		if (!table || table.style.display=='none')  {

				tablediv.getElementsByTagName('h2')[0].setAttribute('class','ft_boxBodyUnfolded');
				if (table) {
					table.style.display='inline';
					return;
				}
							
				FoxtrickYouthSkillTable.copy_string = '[table]';
				table = doc.createElement('table');
				table.setAttribute('style','display:inline');
				FoxtrickYouthSkillTable.copy_string += '[tr]';
				var tr = doc.createElement('tr');
				table.appendChild(tr);
				
				var sn=['Player','YearsDays','GK','DF','PM','WI','PS','SC','SP','YC','RC','Br','In','Spec','ST','PO'];
				for(var j = 0; j < 9; j++) {
							FoxtrickYouthSkillTable.copy_string += '[th]';
							var th = doc.createElement('th');
							if (j>0) th.setAttribute('class','ft_youthskilltable_td_normal');
							th.setAttribute('s_index',j);
							th.addEventListener( "click", FoxtrickYouthSkillTable.sortClick, true );						
							th.title=Foxtrickl10n.getString("SortBy");
							FoxtrickYouthSkillTable.copy_string +=  Foxtrickl10n.getString(sn[j]);
							th.innerHTML = Foxtrickl10n.getString(sn[j]);
							tr.appendChild(th);
							FoxtrickYouthSkillTable.copy_string += '[/th]';
				
				}
				
				FoxtrickYouthSkillTable.copy_string += '[th]';
				var th = doc.createElement('th');
				th.setAttribute('class','ft_youthskilltable_td_small');
				th.setAttribute('s_index',9);
				th.addEventListener( "click", FoxtrickYouthSkillTable.sortClick, true );						
				th.title=Foxtrickl10n.getString("SortBy");
				FoxtrickYouthSkillTable.copy_string += Foxtrickl10n.getString(sn[9]);
				th.innerHTML = '<img alt="'+Foxtrickl10n.getString(sn[9])+'" class="cardsOne" src="/Img/Icons/yellow_card.gif" ilo-full-src="http://www.hattrick.org/Img/Icons/yellow_card.gif" style="width: 8px; height: 12px;"/>';					
				tr.appendChild(th);
				FoxtrickYouthSkillTable.copy_string += '[/th]';
				
				FoxtrickYouthSkillTable.copy_string += '[th]';
				var th = doc.createElement('th');
				th.setAttribute('class','ft_youthskilltable_td_small');
				th.addEventListener( "click", FoxtrickYouthSkillTable.sortClick, true );						
				th.title=Foxtrickl10n.getString("SortBy");
				th.setAttribute('s_index',10);
				FoxtrickYouthSkillTable.copy_string += Foxtrickl10n.getString(sn[10]);
				th.innerHTML = '<img alt="'+Foxtrickl10n.getString(sn[10])+'" class="cardsOne" src="/Img/Icons/red_card.gif" ilo-full-src="http://www.hattrick.org/Img/Icons/red_card.gif" style="width: 8px; height: 12px;"/>';					
				tr.appendChild(th);
				FoxtrickYouthSkillTable.copy_string += '[/th]';
				
				FoxtrickYouthSkillTable.copy_string += '[th]';
				var th = doc.createElement('th');
				th.setAttribute('class','ft_youthskilltable_td_small');
				th.setAttribute('s_index',11);
				th.addEventListener( "click", FoxtrickYouthSkillTable.sortClick, true );						
				th.title=Foxtrickl10n.getString("SortBy");
				FoxtrickYouthSkillTable.copy_string += '(+)';
				th.innerHTML = '<img alt="(+)" class="injuryBruised" src="/Img/Icons/bruised.gif" style="width: 11px; height: 11px;"/>';					
				tr.appendChild(th);
				FoxtrickYouthSkillTable.copy_string += '[/th]';
				
				FoxtrickYouthSkillTable.copy_string += '[th]';
				var th = doc.createElement('th');
				th.setAttribute('class','ft_youthskilltable_td_small');
				th.setAttribute('s_index',12);
				th.addEventListener( "click", FoxtrickYouthSkillTable.sortClick, true );						
				th.title=Foxtrickl10n.getString("SortBy");
				FoxtrickYouthSkillTable.copy_string += '+';
				th.innerHTML = '<img alt="+" class="injuryInjured" src="/Img/Icons/injured.gif" ilo-full-src="http://www.hattrick.org/Img/Icons/injured.gif" style="width: 11px; height: 11px;"/>';					
				tr.appendChild(th);
				FoxtrickYouthSkillTable.copy_string += '[/th]';
				
				// specialty header
				if (!Foxtrick.isModuleFeatureEnabled( FoxtrickYouthSkillTable, "HideSpecialty" )) 
				{
				FoxtrickYouthSkillTable.copy_string += '[th]';
				var th = doc.createElement('th');
				th.setAttribute('class','ft_youthskilltable_td_small');
				th.setAttribute('s_index',13);
				th.addEventListener( "click", FoxtrickYouthSkillTable.sortClick, true );						
				th.title=Foxtrickl10n.getString("SortBy");
				FoxtrickYouthSkillTable.copy_string += Foxtrickl10n.getString(sn[13]);
				th.innerHTML = Foxtrickl10n.getString(sn[13]);
				tr.appendChild(th);
				FoxtrickYouthSkillTable.copy_string += '[/th]';
				}
				
				// played last match stars header
				if (!Foxtrick.isModuleFeatureEnabled( FoxtrickYouthSkillTable, "HideLastStars" )) 
				{
				FoxtrickYouthSkillTable.copy_string += '[th]';
				var th = doc.createElement('th');
				th.setAttribute('class','ft_youthskilltable_td_small');
				th.setAttribute('s_index',14);
				th.addEventListener( "click", FoxtrickYouthSkillTable.sortClick, true );						
				th.title=Foxtrickl10n.getString("SortBy");
				FoxtrickYouthSkillTable.copy_string += '*';
				th.innerHTML = '<img alt="*" class="starWhole" src="/Img/Matches/star_blue.png" ilo-full-src="http://www.hattrick.org/Img/Matches/star_blue.png"/>';					
				tr.appendChild(th);
				FoxtrickYouthSkillTable.copy_string += '[/th]';
				}
				
				// played last match position header 
				if (!Foxtrick.isModuleFeatureEnabled( FoxtrickYouthSkillTable, "HideLastPosition" )) 
				{
				FoxtrickYouthSkillTable.copy_string += '[th]';
				var th = doc.createElement('th');
				th.setAttribute('class','ft_youthskilltable_td_small');
				th.setAttribute('s_index',15);
				th.addEventListener( "click", FoxtrickYouthSkillTable.sortClick, true );						
				th.title=Foxtrickl10n.getString("SortBy");
				FoxtrickYouthSkillTable.copy_string += Foxtrickl10n.getString(sn[15]);
				th.innerHTML = Foxtrickl10n.getString(sn[15]);
				tr.appendChild(th);
				FoxtrickYouthSkillTable.copy_string += '[/th]';
				}
				
				FoxtrickYouthSkillTable.copy_string += '[/tr]';

				var allDivs = doc.getElementsByTagName("div");				
				// get last match  
				var latestMatch=-1;
				for(var i = 0; i < allDivs.length; i++) {			
					if(allDivs[i].className=="playerInfo") {
						var as=allDivs[i].getElementsByTagName('a');
						var j=0,a=null;
						while(a=as[j++]){if (a.href.search(/matchid/i)!=-1) break;}
						var matchday=0;
						if (a) matchday=Foxtrick.getUniqueDayfromCellHTML(a.innerHTML); 
						if (matchday>latestMatch) latestMatch = matchday;
					}
				}

				var count =0;
				for(var i = 0; i < allDivs.length; i++) {
					
					if(allDivs[i].className=="playerInfo") {
						count++;
						FoxtrickYouthSkillTable.copy_string += '[tr]';
						var tr = doc.createElement('tr');
						if (count==4) {tr.setAttribute('class','ft_skilltable_blockend'); count=0;}
						table.appendChild(tr);
						
						// name (linked)
						FoxtrickYouthSkillTable.copy_string += '[td]';
						var td = doc.createElement('td');
						FoxtrickYouthSkillTable.copy_string += allDivs[i].getElementsByTagName("a")[0].innerHTML;  // unlinked
						td.innerHTML = allDivs[i].getElementsByTagName("b")[0].innerHTML;
						FoxtrickYouthSkillTable.copy_string += '[/td]';
						tr.appendChild(td);
						
						var even = true;
						
						// age
						var age = allDivs[i].getElementsByTagName("p")[0].innerHTML.match(/(\d+)/g);						
						FoxtrickYouthSkillTable.copy_string += '[td]';
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_youthskilltable_td_normal'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_youthskilltable_td_normal'); even=true;}
						FoxtrickYouthSkillTable.copy_string += age[0]+'.'+age[1];
						td.innerHTML=age[0]+'.'+age[1]; 
						td.setAttribute('age',age[0]+'.'+(age[1].length==1?('00'+age[1]):(age[1].length==2?('0'+age[1]):age[1]))); 
						FoxtrickYouthSkillTable.copy_string += '[/td]';
						tr.appendChild(td);
							
						// skills
						var trs = allDivs[i].getElementsByTagName("table")[0].getElementsByTagName("tr");
						
						if (trs.length<7) return;  // not your own team. quit
						
						for(var j = 0; j < trs.length; j++) {
							FoxtrickYouthSkillTable.copy_string += '[td]';
							var td = doc.createElement('td');
							if (even) {td.setAttribute('class','ft_table_even ft_youthskilltable_td_normal'); even=false;}
							else {td.setAttribute('class','ft_table_odd ft_youthskilltable_td_normal'); even=true;}
							
							var tds = trs[j].getElementsByTagName("td");
							var imgs = tds[1].getElementsByTagName('img');
							if (imgs.length!=0) {
								var max = imgs[0].getAttribute('title').match(/\d/);
								var cur = imgs[1].title.match(/-?\d/);
								var unknown = imgs[1].title.match(/-1/); 
								if (!cur) {
									FoxtrickYouthSkillTable.copy_string +=  '[b]'+max+'/'+max+'[/b]';
									td.innerHTML = max+'/'+max;
									td.setAttribute('class', td.getAttribute('class')+' ft_table_skill_maxed'); 							
								}
								else { 
									if (unknown) cur='-';
									if (!max) max='-';
									FoxtrickYouthSkillTable.copy_string += cur+'/'+max;
									td.innerHTML = cur+'/'+max;
								}
							}
							FoxtrickYouthSkillTable.copy_string += '[/td]';
							tr.appendChild(td);							
						}
						
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
						
						FoxtrickYouthSkillTable.copy_string += '[td]';
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_youthskilltable_td_small'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_youthskilltable_td_small'); even=true;}
						if (cardsyellow>0) {
							td.appendChild(doc.createTextNode(cardsyellow));
							FoxtrickYouthSkillTable.copy_string += cardsyellow;
						}
						FoxtrickYouthSkillTable.copy_string += '[/td]';
						tr.appendChild(td);
						
						FoxtrickYouthSkillTable.copy_string += '[td]';
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_youthskilltable_td_small'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_youthskilltable_td_small'); even=true;}
						if (cardsred>0) {
							td.appendChild(doc.createTextNode(cardsred));
							FoxtrickYouthSkillTable.copy_string += cardsred;
						}
						FoxtrickYouthSkillTable.copy_string += '[/td]';
						tr.appendChild(td);
						
						FoxtrickYouthSkillTable.copy_string += '[td]';
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_youthskilltable_td_small'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_youthskilltable_td_small'); even=true;}
						if (bruised>0) {
							td.appendChild(doc.createTextNode(bruised));
							FoxtrickYouthSkillTable.copy_string += bruised;
						}
						FoxtrickYouthSkillTable.copy_string += '[/td]';
						tr.appendChild(td);
						
						FoxtrickYouthSkillTable.copy_string += '[td]';
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_youthskilltable_td_small'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_youthskilltable_td_small'); even=true;}
						if (injured>0) {
							td.appendChild(doc.createTextNode(injured));
							FoxtrickYouthSkillTable.copy_string += injured;
						}
						FoxtrickYouthSkillTable.copy_string += '[/td]';
						tr.appendChild(td);
						
						// specialty
						if (!Foxtrick.isModuleFeatureEnabled( FoxtrickYouthSkillTable, "HideSpecialty" )) 
						{
						FoxtrickYouthSkillTable.copy_string += '[td]';
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_youthskilltable_td_small'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_youthskilltable_td_small'); even=true;}
						var specc = allDivs[i].getElementsByTagName( "p" )[0];
						specMatch = specc.textContent.match(/\[(\D+)\]/);
						if (specMatch) {					
							var shortspecc = FoxtrickYouthSkillTable._getShortSpecialty(specMatch[1]);
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
						FoxtrickYouthSkillTable.copy_string += specMatch;
						
						FoxtrickYouthSkillTable.copy_string += '[/td]';
						tr.appendChild(td);
						}
						
						
						// get played last match
						var as=allDivs[i].getElementsByTagName('a');
						var kk=0,a=null;
						while(a=as[kk++]){if (a.href.search(/matchid/i)!=-1) break;}
						var matchday=0;
						if (a) matchday=Foxtrick.getUniqueDayfromCellHTML(a.innerHTML); 
						
						// stars
						if (!Foxtrick.isModuleFeatureEnabled( FoxtrickYouthSkillTable, "HideLastStars" )) 
						{
						FoxtrickYouthSkillTable.copy_string += '[td]';
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_youthskilltable_td_small'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_youthskilltable_td_small'); even=true;}						
						if (matchday==latestMatch) {
							var imgs=a.parentNode.parentNode.getElementsByTagName('img');
							var starcount=0;
							for (var sc=0;sc<imgs.length;++sc) {
								if (imgs[sc].className=='starBig') starcount+=5;
								else if (imgs[sc].className=='starWhole') starcount+=1;
								else if (imgs[sc].className=='starHalf') starcount+=0.5;
							}
							td.appendChild(doc.createTextNode(starcount));
							FoxtrickYouthSkillTable.copy_string += starcount;						
						}
						FoxtrickYouthSkillTable.copy_string += '[/td]';
						tr.appendChild(td);
						}
						
						// last position
						if (!Foxtrick.isModuleFeatureEnabled( FoxtrickYouthSkillTable, "HideLastPosition" )) 
						{
						FoxtrickYouthSkillTable.copy_string += '[td]';
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_youthskilltable_td_small'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_youthskilltable_td_small'); even=true;}
						if (matchday == latestMatch) {
							var pos = a.parentNode.nextSibling.nextSibling.innerHTML.match(/\((.+)\)/)[1];
							var shortpos = FoxtrickYouthSkillTable._getShortPos(pos);
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
							FoxtrickYouthSkillTable.copy_string += pos;												
						}
						FoxtrickYouthSkillTable.copy_string += '[/td]';
						tr.appendChild(td);
						}
						//Foxtrick.dump(matchday+' '+latestMatch+'\n');
						FoxtrickYouthSkillTable.copy_string += '[/tr]';						
					}
				}
			FoxtrickYouthSkillTable.copy_string += '[/table]';
				
			tablediv.appendChild(table);
				
				
			// copy button
			if (Foxtrick.isModuleFeatureEnabled( FoxtrickYouthSkillTable, "CopySkillTable" )) {	 	
				var parentDiv = doc.createElement("div");
				parentDiv.id = "foxtrick_copy_parentDiv";
		
				var messageLink = doc.createElement("a");
				messageLink.className = "inner";
				messageLink.title = Foxtrickl10n.getString("foxtrick.tweaks.copyskilltable" );
				messageLink.setAttribute("style","cursor: pointer;");
				messageLink.addEventListener("click", FoxtrickYouthSkillTable.copyTable, false)
		
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
			var obj = FoxtrickYouthSkillTable.htLanguagesXml.evaluate(path,FoxtrickYouthSkillTable.htLanguagesXml,null,FoxtrickYouthSkillTable.htLanguagesXml.DOCUMENT_NODE,null).singleNodeValue;
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
			var obj = FoxtrickYouthSkillTable.htLanguagesXml.evaluate(path,FoxtrickYouthSkillTable.htLanguagesXml,null,FoxtrickYouthSkillTable.htLanguagesXml.DOCUMENT_NODE,null).singleNodeValue;
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

