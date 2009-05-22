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
	
    init : function() {
        Foxtrick.registerPageHandler( 'YouthPlayers', this );
    },

    run : function( page, doc ) {
				var allDivs = doc.getElementsByTagName("div");
				
				
				var tablediv = doc.createElement('div');
				tablediv.setAttribute('id','ft_youthskilltable');
				var h2 = doc.createElement('h2');
				h2.innerHTML = Foxtrickl10n.getString('Youthskills.Skilltable');
				FoxtrickYouthSkillTableHeaderClick.doc=doc;
				h2.addEventListener( "click", FoxtrickYouthSkillTableHeaderClick, true );						
				h2.setAttribute('class','ft_youthskilltable_collapsed');
				tablediv.appendChild(h2);
				
				var table = doc.createElement('table');
				table.setAttribute('style','display:none');
				var tr = doc.createElement('tr');
				table.appendChild(tr);
				tablediv.appendChild(table);
				
				var sn=['Player','GK','VT','PM','WI','PS','SC','SP'];
				for(var j = 0; j < 8; j++) {
							var th = doc.createElement('th');
							th.innerHTML = Foxtrickl10n.getString(sn[j]);
							tr.appendChild(th);
				}
				var count =0;
				for(var i = 0; i < allDivs.length; i++) {
					
					if(allDivs[i].className=="playerInfo") {
						count++;
						var tr = doc.createElement('tr');
						if (count==4) {tr.setAttribute('class','ft_skilltable_blockend'); count=0;}
						table.appendChild(tr);
						var td = doc.createElement('td');
						td.appendChild(allDivs[i].getElementsByTagName("a")[0].cloneNode(true));
						tr.appendChild(td);
						
						var even = true;			
						var trs = allDivs[i].getElementsByTagName("tr");
						for(var j = 0; j < trs.length; j++) {
							var td = doc.createElement('td');
							if (even) {td.setAttribute('class','ft_table_even'); even=false;}
							else {td.setAttribute('class','ft_table_odd'); even=true;}
							tr.appendChild(td);
							
							var tds = trs[j].getElementsByTagName("td");
							var imgs = tds[1].getElementsByTagName('img');
							if (imgs.length!=0) {
								max = imgs[0].getAttribute('title').match(/\d/);
								cur = imgs[1].title.match(/-?\d/);
								unknown = imgs[1].title.match(/-1/); 
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
					}
				}
				
				header=doc.getElementsByTagName('h1')[0];
				header.parentNode.insertBefore(tablediv,header.nextSibling);
	},
	
	change : function( page, doc ) {
	
	},
}

function FoxtrickYouthSkillTableHeaderClick(evt) {
 try{
	var doc=FoxtrickYouthSkillTableHeaderClick.doc;
	var tablediv = doc.getElementById('ft_youthskilltable');
	tablediv.getElementsByTagName('h2')[0].setAttribute('class','ft_youthskilltable_unfold');
	var table = tablediv.getElementsByTagName('table')[0]
	if (table.style.display=='none') table.style.display='inline';
	else table.style.display='none';						
} catch(e) {dump(e);}
}