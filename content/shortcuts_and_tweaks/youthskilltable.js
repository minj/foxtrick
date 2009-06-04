/**
 * youthskilltable.js
 * hide unknown youthskills
 * @Authors:  convincedd
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickYouthSkillTable = {
    
    MODULE_NAME : "YouthSkillTable",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.4.8.1",
	LASTEST_CHANGE:"Show youth skills as table",
    CSS: "chrome://foxtrick/content/resources/css/youthskilltable.css",
	
	_collaped_class:'',
	_unfold_class:'',
	
    init : function() {
        Foxtrick.registerPageHandler( 'YouthPlayers', this );
    },

    run : function( page, doc ) {
				this._collaped_class='ft_youthskilltable_collapsed';
				this._unfold_class='ft_youthskilltable_unfold';
				if (Foxtrick.isStandardLayout(doc)) {
					this._collaped_class='ft_youthskilltable_collapsed_std';
					this._unfold_class='ft_youthskilltable_unfold_std';				
				}
				var allDivs = doc.getElementsByTagName("div");
				
				
				var tablediv = doc.createElement('div');
				tablediv.setAttribute('id','ft_youthskilltable');
				var h2 = doc.createElement('h2');
				h2.innerHTML = Foxtrickl10n.getString('Youthskills.Skilltable');
				FoxtrickYouthSkillTable.HeaderClick.doc=doc;
				h2.addEventListener( "click", this.HeaderClick, true );						
				h2.setAttribute('class',this._collaped_class);
				tablediv.appendChild(h2);
				
				var table = doc.createElement('table');
				table.setAttribute('style','display:none');
				var tr = doc.createElement('tr');
				table.appendChild(tr);
				tablediv.appendChild(table);
				
				var sn=['Player','YearsDays','GK','DF','PM','WI','PS','SC','SP'];
				for(var j = 0; j < 9; j++) {
							var th = doc.createElement('th');
							if (j>0) th.setAttribute('class','ft_youthskilltable_td_normal');
							th.innerHTML = Foxtrickl10n.getString(sn[j]);
							tr.appendChild(th);
				}
				
				var th = doc.createElement('th');
				th.setAttribute('class','ft_youthskilltable_td_small');
				th.innerHTML = '<img alt="Y" class="cardsOne" src="/Img/Icons/yellow_card.gif" ilo-full-src="http://www.hattrick.org/Img/Icons/yellow_card.gif" style="width: 8px; height: 12px;"/>';					
				tr.appendChild(th);
				
				var th = doc.createElement('th');
				th.setAttribute('class','ft_youthskilltable_td_small');
				th.innerHTML = '<img alt="R" class="cardsOne" src="/Img/Icons/red_card.gif" ilo-full-src="http://www.hattrick.org/Img/Icons/red_card.gif" style="width: 8px; height: 12px;"/>';					
				tr.appendChild(th);
				
				var th = doc.createElement('th');
				th.setAttribute('class','ft_youthskilltable_td_small');
				th.innerHTML = '<img alt="(+)" class="injuryBruised" src="/Img/Icons/bruised.gif" style="width: 11px; height: 11px;"/>';					
				tr.appendChild(th);
				
				var th = doc.createElement('th');
				th.setAttribute('class','ft_youthskilltable_td_small');
				th.innerHTML = '<img alt="+" class="injuryInjured" src="/Img/Icons/injured.gif" ilo-full-src="http://www.hattrick.org/Img/Icons/injured.gif" style="width: 11px; height: 11px;"/>';					
				tr.appendChild(th);

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
							    if (img[j].parentNode.innerHTML.indexOf('red_card', 0) != -1 ) cardsred = 1;   
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
						
					}
				}
				
				var header=doc.getElementsByTagName('h1')[0];
				header.parentNode.insertBefore(tablediv,header.nextSibling);
	},
	
	change : function( page, doc ) {	
	},

	HeaderClick : function(evt) {
	try{
		var doc=FoxtrickYouthSkillTable.HeaderClick.doc;
		var tablediv = doc.getElementById('ft_youthskilltable');
		var table = tablediv.getElementsByTagName('table')[0]
		if (table.style.display=='none')  {
			table.style.display='inline';
			tablediv.getElementsByTagName('h2')[0].setAttribute('class',FoxtrickYouthSkillTable._unfold_class);
		}
		else  {
			table.style.display='none';						
			tablediv.getElementsByTagName('h2')[0].setAttribute('class',FoxtrickYouthSkillTable._collaped_class);
		}
	} catch(e) {dump(e);}
	},
}

