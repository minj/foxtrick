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
	NEW_AFTER_VERSION: "0.4.8.9",
	LATEST_CHANGE:"Added specialty and marker for played in last match. Added basic sort function",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
    CSS: "chrome://foxtrick/content/resources/css/youthskilltable.css",
	
	
    init : function() {
    },

    run : function( page, doc ) {
				var allDivs = doc.getElementsByTagName("div");
								
				var tablediv = doc.createElement('div');
				tablediv.setAttribute('id','ft_youthskilltable');
				var h2 = doc.createElement('h2');
				h2.innerHTML = Foxtrickl10n.getString('Youthskills.Skilltable');
				FoxtrickYouthSkillTable.HeaderClick.doc=doc;
				h2.addEventListener( "click", this.HeaderClick, true );						
				h2.setAttribute('class','ft_boxBodyCollapsed');
				tablediv.appendChild(h2);
				
				var table = doc.createElement('table');
				table.setAttribute('style','display:none');
				var tr = doc.createElement('tr');
				table.appendChild(tr);
				tablediv.appendChild(table);
				
				var sn=['Player','YearsDays','GK','DF','PM','WI','PS','SC','SP','Spec','PL'];
				for(var j = 0; j < 9; j++) {
							var th = doc.createElement('th');
							if (j>0) th.setAttribute('class','ft_youthskilltable_td_normal');
							th.setAttribute('s_index',j);
							th.addEventListener( "click", this.sortClick, true );						
							th.innerHTML = Foxtrickl10n.getString(sn[j]);
							tr.appendChild(th);
				}
				
				var th = doc.createElement('th');
				th.setAttribute('class','ft_youthskilltable_td_small');
				th.setAttribute('s_index',9);
				th.addEventListener( "click", this.sortClick, true );						
				th.innerHTML = '<img alt="Y" class="cardsOne" src="/Img/Icons/yellow_card.gif" ilo-full-src="http://www.hattrick.org/Img/Icons/yellow_card.gif" style="width: 8px; height: 12px;"/>';					
				tr.appendChild(th);
				
				var th = doc.createElement('th');
				th.setAttribute('class','ft_youthskilltable_td_small');
				th.addEventListener( "click", this.sortClick, true );						
				th.setAttribute('s_index',10);
				th.innerHTML = '<img alt="R" class="cardsOne" src="/Img/Icons/red_card.gif" ilo-full-src="http://www.hattrick.org/Img/Icons/red_card.gif" style="width: 8px; height: 12px;"/>';					
				tr.appendChild(th);
				
				var th = doc.createElement('th');
				th.setAttribute('class','ft_youthskilltable_td_small');
				th.setAttribute('s_index',11);
				th.addEventListener( "click", this.sortClick, true );						
				th.innerHTML = '<img alt="(+)" class="injuryBruised" src="/Img/Icons/bruised.gif" style="width: 11px; height: 11px;"/>';					
				tr.appendChild(th);
				
				var th = doc.createElement('th');
				th.setAttribute('class','ft_youthskilltable_td_small');
				th.setAttribute('s_index',12);
				th.addEventListener( "click", this.sortClick, true );						
				th.innerHTML = '<img alt="+" class="injuryInjured" src="/Img/Icons/injured.gif" ilo-full-src="http://www.hattrick.org/Img/Icons/injured.gif" style="width: 11px; height: 11px;"/>';					
				tr.appendChild(th);

				// specialty header
				var th = doc.createElement('th');
				th.setAttribute('class','ft_youthskilltable_td_small');
				th.setAttribute('s_index',13);
				th.addEventListener( "click", this.sortClick, true );						
				th.innerHTML = Foxtrickl10n.getString(sn[9]);
				tr.appendChild(th);

				// played last match header
				var th = doc.createElement('th');
				th.setAttribute('class','ft_youthskilltable_td_small');
				th.setAttribute('s_index',14);
				th.addEventListener( "click", this.sortClick, true );						
				th.innerHTML = Foxtrickl10n.getString(sn[10]);
				tr.appendChild(th);

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
						var tr = doc.createElement('tr');
						if (count==4) {tr.setAttribute('class','ft_skilltable_blockend'); count=0;}
						table.appendChild(tr);
						
						// name (linked)
						var td = doc.createElement('td');
						td.innerHTML = allDivs[i].getElementsByTagName("b")[0].innerHTML;
						tr.appendChild(td);
						
						var even = true;
						
						// age
						var age = allDivs[i].getElementsByTagName("p")[0].innerHTML.match(/(\d+)/g);						
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_youthskilltable_td_normal'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_youthskilltable_td_normal'); even=true;}
						td.innerHTML=age[0]+'.'+age[1]; 
						tr.appendChild(td);
							
						// skills
						var trs = allDivs[i].getElementsByTagName("table")[0].getElementsByTagName("tr");
						
						if (trs.length<7) return;  // not your own team. quit
						
						for(var j = 0; j < trs.length; j++) {
							var td = doc.createElement('td');
							if (even) {td.setAttribute('class','ft_table_even ft_youthskilltable_td_normal'); even=false;}
							else {td.setAttribute('class','ft_table_odd ft_youthskilltable_td_normal'); even=true;}
							tr.appendChild(td);
							
							var tds = trs[j].getElementsByTagName("td");
							var imgs = tds[1].getElementsByTagName('img');
							if (imgs.length!=0) {
								var max = imgs[0].getAttribute('title').match(/\d/);
								var cur = imgs[1].title.match(/-?\d/);
								var unknown = imgs[1].title.match(/-1/); 
								if (!cur) {
									td.innerHTML = max+'/'+max;
									td.setAttribute('class', td.getAttribute('class')+' ft_table_skill_maxed'); 							
								}
								else { 
									if(unknown) cur='-';
									if (!max) max='-';
									td.innerHTML = cur+'/'+max;
								}
							}
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
						
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_youthskilltable_td_small'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_youthskilltable_td_small'); even=true;}
						if (cardsyellow>0) td.appendChild(doc.createTextNode(cardsyellow));
						tr.appendChild(td);
						
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_youthskilltable_td_small'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_youthskilltable_td_small'); even=true;}
						if (cardsred>0) td.appendChild(doc.createTextNode(cardsred));
						tr.appendChild(td);
						
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_youthskilltable_td_small'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_youthskilltable_td_small'); even=true;}
						if (bruised>0) td.appendChild(doc.createTextNode(bruised));
						tr.appendChild(td);
						
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_youthskilltable_td_small'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_youthskilltable_td_small'); even=true;}
						if (injured>0) td.appendChild(doc.createTextNode(injured));
						tr.appendChild(td);
						
						// specialty
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_youthskilltable_td_small'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_youthskilltable_td_small'); even=true;}
						var specc = allDivs[i].getElementsByTagName( "p" )[0];
						var specMatch = specc.textContent.match(/\[\D+\]/g);
						if (specMatch != null) {
							td.appendChild(doc.createTextNode(specMatch[0].substr(1,2)));
						}
						tr.appendChild(td);
						
						// get played last match
						var td = doc.createElement('td');
						if (even) {td.setAttribute('class','ft_table_even ft_youthskilltable_td_small'); even=false;}
						else {td.setAttribute('class','ft_table_odd ft_youthskilltable_td_small'); even=true;}
						
						var as=allDivs[i].getElementsByTagName('a');
						var kk=0,a=null;
						while(a=as[kk++]){if (a.href.search(/matchid/i)!=-1) break;}
						var matchday=0;
						if (a) matchday=Foxtrick.getUniqueDayfromCellHTML(a.innerHTML); 
						if (matchday==latestMatch) {
							td.appendChild(doc.createTextNode('#'));						
						}
						tr.appendChild(td);
						dump(matchday+' '+latestMatch+'\n');
					}
				}
				
				var header=doc.getElementsByTagName('h1')[0];
				header.parentNode.insertBefore(tablediv,header.nextSibling);
	},
	
	change : function( page, doc ) {	
	},

	sortfunction: function(a,b) {return a.cells[FoxtrickYouthSkillTable.s_index].innerHTML.localeCompare(b.cells[FoxtrickYouthSkillTable.s_index].innerHTML);},
	sortdownfunction: function(a,b) {return (b.cells[FoxtrickYouthSkillTable.s_index].innerHTML.localeCompare(a.cells[FoxtrickYouthSkillTable.s_index].innerHTML));},
	sortlinksfunction: function(a,b) {return a.cells[FoxtrickYouthSkillTable.s_index].getElementsByTagName('a')[0].innerHTML.localeCompare(b.cells[FoxtrickYouthSkillTable.s_index].getElementsByTagName('a')[0].innerHTML);},

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
		else if (FoxtrickYouthSkillTable.s_index==1) rows.sort(FoxtrickYouthSkillTable.sortfunction);		
		else rows.sort(FoxtrickYouthSkillTable.sortdownfunction);
		
		for (var i=1;i<table.rows.length;++i) {
			table.rows[i].innerHTML = rows[i-1].innerHTML;
		}
			} catch(e) {dump(e);}
	},

	HeaderClick : function(ev) {
	try{
		var doc = ev.target.ownerDocument;
		var tablediv = doc.getElementById('ft_youthskilltable');
		var table = tablediv.getElementsByTagName('table')[0]
		if (table.style.display=='none')  {
			table.style.display='inline';
			tablediv.getElementsByTagName('h2')[0].setAttribute('class','ft_boxBodyUnfolded');
		}
		else  {
			table.style.display='none';						
			tablediv.getElementsByTagName('h2')[0].setAttribute('class','ft_boxBodyCollapsed');
		}
	} catch(e) {dump(e);}
	},
}

