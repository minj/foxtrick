/**
 * Transfer list filters
 * @author kolmis, bummerland
 */

FoxtrickTransferSearchResultFilters = {

	MODULE_NAME : "TransferSearchResultFilters",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('transferSearchForm','transferSearchResult'),
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION : "0.5.2.1",	
	LATEST_CHANGE : "Filters the search transfer search results",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	//OPTIONS : new Array("AddLeft","AddSpace","Supporterstats", "Transfers", "Prefs", "FoxTrickPrefs", "HtRadioWinamp","HtRadioMediaPlayer","DTRadioWinamp"),
	advanced_option_on : false,
	
	filters : 	[ {name : 'injuryDays', type : 'minmax', properties : {min: '', max : ''} },
				 {name : 'cards',  type : 'minmax', properties : {min: '', max : ''} },
				{name : 'days',  type : 'minmax', properties : {min: '', max : ''} }
	],

	
	init : function() {
	},

	run : function(page, doc) {
		try {
			if ( page=='transferSearchForm' ) this.addExtraFilters(doc);
			else if ( page=='transferSearchResult' ) this.filterResults(doc);
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	change : function( page, doc ) {
	},

	addExtraFilters : function(doc) {
		try {
			
			var tableAdvanced = doc.getElementById('ctl00_CPMain_tblAdvanced');	
			if (tableAdvanced===null) {
				this.advanced_option_on = false;
				return;  //only show if advanced filters is on
			}
			this.advanced_option_on = true;
			
			var table = doc.createElement('table');
			
			var tr = doc.createElement('tr');
			table.appendChild(tr);
			var td = doc.createElement('td');
			td.setAttribute('colspan','5');
			tr.appendChild(td);
			var div = doc.createElement('div');
			div.setAttribute('class','borderSeparator');
			td.appendChild(div);
						
			for (var j = 0; j < this.filters.length; ++j) {
				this.addNewFilter(doc,table,j);
			}
			tableAdvanced.parentNode.insertBefore(table, tableAdvanced.nextSibling);
		}	
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	addNewFilter : function(doc,table,j) {
		try {
			var filter = FoxtrickTransferSearchResultFilters.filters[j];
			var tr = doc.createElement('tr');
			table.appendChild(tr);
			
			var td = doc.createElement('td');
			tr.appendChild(td);
			var strong = doc.createElement('strong');
			strong.innerHTML = filter.name;
			td.appendChild(strong);
			
			if (filter.type=='minmax'){
				var td = doc.createElement('td');
				td.setAttribute('colspan','2');
				td.innerHTML = 'Min.&nbsp;';
				tr.appendChild(td);			
				var input = doc.createElement('input');
				input.index = j;
				input.filter = 'min';
				input.value = FoxtrickTransferSearchResultFilters.filters[j]['properties']['min'];
				input.addEventListener('blur',this.saveEdit,false);
				td.appendChild(input);
				
				var td = doc.createElement('td');
				td.setAttribute('colspan','2');
				td.innerHTML = 'Max.&nbsp;';
				tr.appendChild(td);			
				var input = doc.createElement('input');
				input.index = j;
				input.filter = 'max';
				input.value = FoxtrickTransferSearchResultFilters.filters[j]['properties']['max'];
				input.addEventListener('blur',this.saveEdit,false);
				td.appendChild(input);
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	saveEdit : function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			Foxtrick.dump('save\n');
			Foxtrick.dump(ev.target.value+'\n');
			Foxtrick.dump(ev.target.index+'\n');
			Foxtrick.dump(ev.target.filter+'\n');
			FoxtrickTransferSearchResultFilters.filters[ev.target.index]['properties'][ev.target.filter] = ev.target.value;
			Foxtrick.dump(FoxtrickTransferSearchResultFilters.filters[ev.target.index]['properties'][ev.target.filter]+'\n');
			Foxtrick.dump('\n');
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	filterResults : function(doc) {
		try {  
			var player;
			var transferTable = doc.getElementById("mainBody").getElementsByTagName("table")[0];
			for (var i = 0; i < transferTable.rows.length; ) {
				player = {};

				// skip sold players
				if (transferTable.rows[i + 1].cells[0].getElementsByClassName("borderSeparator").length > 0) {
					i += 2;
					continue;
				}
				
				player.ageText = transferTable.rows[i+3].cells[1].textContent;
				var ageMatch = player.ageText.match(/(\d+)/g);
				player.days = parseInt(ageMatch[1]);
				
				var imgs = transferTable.rows[i].getElementsByTagName("img");
				// red/yellow cards and injuries, these are shown as images
				player.cards = 0;
				player.redCard = 0;
				player.yellowCard = 0;
				player.injuredDays = 0;
				player.bruised = false;
				player.injured = 0;

				for (var j = 0; j < imgs.length; ++j) {
					if (imgs[j].className == "cardsOne") {
						if (imgs[j].src.indexOf("red_card", 0) != -1) {
							player.redCard = 1;
							player.cards += 3;
						}
						else {
							player.yellowCard = 1;
							player.cards += 1;
						}
					}
					else if (imgs[j].className == "cardsTwo") {
						player.yellowCard = 2;
						player.cards += 2;
					}
					else if (imgs[j].className == "injuryBruised") {
						player.bruised = true;
						player.injuredDays += 0.5;				
					}
					else if (imgs[j].className == "injuryInjured") {
						player.injured = parseInt(imgs[j].nextSibling.textContent);
						player.injuredDays += player.injured;				
					}
				}
				
				var hide = false;
				for (var j = 0; j < this.filters.length; ++j) {
					var filter = FoxtrickTransferSearchResultFilters.filters[j];
					if (filter.type=='minmax') {
						if  (  filter['properties']['min']!=='' && filter['properties']['min'] > player[filter.name] 
							|| filter['properties']['max']!=='' && filter['properties']['max'] < player[filter.name] ) {
							hide = true;
							continue;							
						}
					}	
				}
				
				//Foxtrick.dump(hide+' '+player.days+' '+player.cards+' '+player.injuredDays+'\n');
				
				for (var k = i; k < i+8 && k < transferTable.rows.length; k++) {
					if (hide) transferTable.rows[k].style.display='none';
					else transferTable.rows[k].style.display='';		
				}
				i += 8;
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	}
	
};
