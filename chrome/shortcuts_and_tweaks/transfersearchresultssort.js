/**
 * transfersearchresultssort.js
 * hide unknown youthskills
 * @Authors:  convincedd
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickTransferSearchResultsSort = {
    
    MODULE_NAME : "TransferSearchResultsSort",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('TransferSearchResults'), 
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.9.1",
	LATEST_CHANGE:"Added TransferSearchResultsSort",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
    //OPTIONS : new Array("HideSpecialty","HideLastStars","HideLastPosition","CopySkillTable"), 
	//CSS: "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/adultskilltable.css",
	
	htLanguagesXml : null,
	
    init : function() {
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
				FoxtrickTransferSearchResultsSort.HeaderClick.doc=doc;
				h2.addEventListener( "click", this.HeaderClick, true );						
				h2.setAttribute('class','ft_boxBodyCollapsed');
				tablediv.appendChild(h2);
				var header=doc.getElementsByTagName('h1')[0];
				header.parentNode.insertBefore(tablediv,header.nextSibling);			
		} catch(e) {Foxtrick.dump('FoxtrickTransferSearchResultsSort.run error: '+e+'\n');}
	},
	
	change : function( page, doc ) {	
	},

	
	sortfunction: function(a,b) {return a.cells[FoxtrickTransferSearchResultsSort.s_index].innerHTML.localeCompare(b.cells[FoxtrickTransferSearchResultsSort.s_index].innerHTML);},
	sortdownfunction: function(a,b) {return parseInt(b.cells[FoxtrickTransferSearchResultsSort.s_index].innerHTML.replace(/\&nbsp| /g,'')) > parseInt(a.cells[FoxtrickTransferSearchResultsSort.s_index].innerHTML.replace(/\&nbsp| /g,''));},
	sortdowntextfunction: function(a,b) {return (b.cells[FoxtrickTransferSearchResultsSort.s_index].innerHTML.localeCompare(a.cells[FoxtrickTransferSearchResultsSort.s_index].innerHTML));},
	sortlinksfunction: function(a,b) {return a.cells[FoxtrickTransferSearchResultsSort.s_index].getElementsByTagName('a')[0].innerHTML.localeCompare(b.cells[FoxtrickTransferSearchResultsSort.s_index].getElementsByTagName('a')[0].innerHTML);},
	sortagefunction: function(a,b) {return a.cells[FoxtrickTransferSearchResultsSort.s_index].getAttribute('age').localeCompare(b.cells[FoxtrickTransferSearchResultsSort.s_index].getAttribute('age'));},

	sortClick : function(ev) {
	try{
		Foxtrick.dump('search sort\n');
		var doc = ev.originalTarget.ownerDocument;
		var tablediv = doc.getElementById('ft_adultskilltable');
		var table = tablediv.getElementsByTagName('table')[0];
		var table_old = table.cloneNode(true);
		FoxtrickTransferSearchResultsSort.s_index = ev.target.getAttribute('s_index');
		if (!FoxtrickTransferSearchResultsSort.s_index)  FoxtrickTransferSearchResultsSort.s_index = ev.target.parentNode.getAttribute('s_index');
		
		//Foxtrick.dump('sortby: '+FoxtrickTransferSearchResultsSort.s_index+'\n');
		
		var rows= new Array();
		for (var i=1;i<table.rows.length;++i) {
			rows.push(table_old.rows[i]);
		}
		//table.rows[3].innerHTML = table_old.rows[1].innerHTML;
		if (FoxtrickTransferSearchResultsSort.s_index==0) rows.sort(FoxtrickTransferSearchResultsSort.sortlinksfunction);
		else if (FoxtrickTransferSearchResultsSort.s_index==1) rows.sort(FoxtrickTransferSearchResultsSort.sortagefunction);
		else if (FoxtrickTransferSearchResultsSort.s_index<=4) rows.sort(FoxtrickTransferSearchResultsSort.sortdownfunction);
		else if (FoxtrickTransferSearchResultsSort.s_index<=11) rows.sort(FoxtrickTransferSearchResultsSort.sortdownfunction);
		else rows.sort(FoxtrickTransferSearchResultsSort.sortdowntextfunction);
		
		for (var i=1;i<table.rows.length;++i) {
			table.rows[i].innerHTML = rows[i-1].innerHTML;
		}
	} catch(e) {Foxtrick.dump('sortClick '+e+'\n');}
	},

	HeaderClick : function(ev) {
	try{
		var doc = ev.target.ownerDocument;
		var tablediv = doc.getElementById('ft_adultskilltable');
        
		var table = tablediv.getElementsByTagName('table')[0]
		if (!table || table.style.display=='none')  {

				tablediv.getElementsByTagName('h2')[0].setAttribute('class','ft_boxBodyUnfolded');
				if (table) {
					table.style.display='inline';
					return;
				}
													
				table = doc.createElement('table');
				table.setAttribute('style','display:inline');
				var tr = doc.createElement('tr');
				table.appendChild(tr);
				
				var sn=['Player','YearsDays','TSI','Fo','Sta','GK','PM','PS','WI','DF','SC','SP','YC','RC','Br','In','Spec','ST','PO'];
				for(var j = 0; j < 12; j++) {
							var th = doc.createElement('th');
							th.setAttribute('class','ft_adultskilltable_td_normal');
							th.setAttribute('s_index',j);
							th.addEventListener( "click", FoxtrickTransferSearchResultsSort.sortClick, true );						
							th.title=Foxtrickl10n.getString("SortBy");
							th.innerHTML = Foxtrickl10n.getString(sn[j]);
							tr.appendChild(th);
				}
				
				// yellow cards header
				/*FoxtrickTransferSearchResultsSort.copy_string += '[th]';
				var th = doc.createElement('th');
				th.setAttribute('class','ft_adultskilltable_td_small');
				th.setAttribute('s_index',12);
				th.addEventListener( "click", FoxtrickTransferSearchResultsSort.sortClick, true );						
				th.title=Foxtrickl10n.getString("SortBy");
				FoxtrickTransferSearchResultsSort.copy_string += Foxtrickl10n.getString(sn[12]);
				th.innerHTML = '<img alt="'+Foxtrickl10n.getString(sn[12])+'" class="cardsOne" src="/Img/Icons/yellow_card.gif" ilo-full-src="http://www.hattrick.org/Img/Icons/yellow_card.gif" style="width: 8px; height: 12px;"/>';					
				tr.appendChild(th);
				FoxtrickTransferSearchResultsSort.copy_string += '[/th]';
				*/
				
				tablediv.appendChild(table);
		}
		else  {
			table.style.display='none';						
			tablediv.getElementsByTagName('h2')[0].setAttribute('class','ft_boxBodyCollapsed');
		}
	} catch(e) {Foxtrick.dump('SkillTableHeaderClick: '+e+'\n');}
	},
}

