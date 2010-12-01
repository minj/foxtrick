/**
 * Transfer list filters
 * @author kolmis, bummerland
 */

FoxtrickTransferSearchResultFilters = {

	MODULE_NAME : "TransferSearchResultFilters",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('transferSearchForm','transferSearchResult'),
	NEW_AFTER_VERSION : "0.5.2.1",
	LATEST_CHANGE : "Filters the search transfer search results",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	advanced_option_on : false,

	filters : 	[ {name : 'hide_bruised', type : 'check', properties : {checked: false} },
				  {name : 'hide_injured', type : 'check', properties : {checked: false} },
				  {name : 'cards',  type : 'minmax', properties : {min: '', max : ''} },
				  {name : 'days',  type : 'minmax', properties : {min: '', max : ''} }
	],

	run : function(page, doc) {
		if ( page=='transferSearchForm' ) this.addExtraFilters(doc);
		else if ( page=='transferSearchResult' ) this.filterResults(doc);
	},


	addExtraFilters : function(doc) {
		var tableAdvanced = doc.getElementById('ctl00_ctl00_CPContent_CPMain_tblAdvanced');
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

		var buttonClear = doc.getElementById('ctl00_ctl00_CPContent_CPMain_butClear');
		buttonClear.addEventListener('click', this.clearFilters, false);
	},

	addNewFilter : function(doc,table,j) {
		var filter = FoxtrickTransferSearchResultFilters.filters[j];
		var tr = doc.createElement('tr');
		table.appendChild(tr);


		if (filter.type=='minmax'){
			var td = doc.createElement('td');
			tr.appendChild(td);
			var strong = doc.createElement('strong');
			strong.innerHTML = Foxtrickl10n.getString("TransferSearchResultFilters." + filter.name);
			td.appendChild(strong);

			var td = doc.createElement('td');
			td.setAttribute('colspan','2');
			td.innerHTML = Foxtrickl10n.getString("minimum")+'&nbsp;';
			tr.appendChild(td);
			var input = doc.createElement('input');
			input.setAttribute('style','width:90px;')
			input.id = 'FoxtrickTransferSearchResultFilters.'+filter.name+'.min';
			input.name = 'FoxtrickTransferSearchResultFilters.'+filter.name+'.min';
			input.index = j;
			input.filter = 'min';
			input.value = FoxtrickTransferSearchResultFilters.filters[j]['properties']['min'];
			input.addEventListener('blur',this.saveEdit,false);
			td.appendChild(input);

			var td = doc.createElement('td');
			td.setAttribute('colspan','2');
			td.innerHTML = Foxtrickl10n.getString("maximum")+'&nbsp;';
			tr.appendChild(td);
			var input = doc.createElement('input');
			input.setAttribute('style','width:90px;')
			input.id = 'FoxtrickTransferSearchResultFilters.'+filter.name+'.max';
			input.name = 'FoxtrickTransferSearchResultFilters.'+filter.name+'.max';
			input.index = j;
			input.filter = 'max';
			input.value = FoxtrickTransferSearchResultFilters.filters[j]['properties']['max'];
			input.addEventListener('blur',this.saveEdit,false);
			td.appendChild(input);
		}
		if (filter.type=='check') {
			var td = doc.createElement('td');
			td.setAttribute('colspan','5');
			tr.appendChild(td);
			var input = doc.createElement('input');
			input.type = 'checkbox';
			input.id = 'FoxtrickTransferSearchResultFilters.'+filter.name+'.check';
			input.name = 'FoxtrickTransferSearchResultFilters.'+filter.name+'.check';
			input.index = j;
			input.filter = 'checked';
			if (FoxtrickTransferSearchResultFilters.filters[j]['properties']['checked']===true) input.setAttribute('checked', 'checked');
			input.addEventListener('blur',this.saveEdit,false);
			td.appendChild(input);
			var label = doc.createElement('label');
			label.innerHTML = Foxtrickl10n.getString("TransferSearchResultFilters." + filter.name);
			td.appendChild(label);
		}
	},

	saveEdit : function(ev) {
		try {
			if (ev.target.type=='text') FoxtrickTransferSearchResultFilters.filters[ev.target.index]['properties'][ev.target.filter] = ev.target.value;
			else if (ev.target.type=='checkbox') FoxtrickTransferSearchResultFilters.filters[ev.target.index]['properties'][ev.target.filter] = ev.target.checked;
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	clearFilters : function(ev) {
		try {
			var doc = ev.target.ownerDocument;

			for (var j = 0; j < FoxtrickTransferSearchResultFilters.filters.length; ++j) {
				var filter = FoxtrickTransferSearchResultFilters.filters[j];
				if (filter.type=='minmax'){
					FoxtrickTransferSearchResultFilters.filters[j]['properties']['min'] = '';
					doc.getElementById('FoxtrickTransferSearchResultFilters.'+filter.name+'.min').value='';
					FoxtrickTransferSearchResultFilters.filters[j]['properties']['max'] = '';
					doc.getElementById('FoxtrickTransferSearchResultFilters.'+filter.name+'.max').value='';
				}
				if (filter.type=='check') {
					FoxtrickTransferSearchResultFilters.filters[j]['properties']['checked'] = false;
					doc.getElementById('FoxtrickTransferSearchResultFilters.'+filter.name+'.check').removeAttribute('checked');
				}
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	filterResults : function(doc) {
		for (var j = 0; j < this.filters.length; ++j) {
			var filter = FoxtrickTransferSearchResultFilters.filters[j];
		}

		var player;
		var transferTable = doc.getElementById("mainBody").getElementsByTagName("table")[0];
		var hide = false;
		for (var i = 0; i < transferTable.rows.length; ) {
			player = {};

			// with psico last row wasn't border but psico, hide one more
			if (transferTable.rows[i].cells[0].getElementsByClassName("borderSeparator").length > 0) {
				if (hide) transferTable.rows[i].style.display='none';
				else transferTable.rows[i].style.display='';
				i += 1;
			}


			// skip sold players
			if (transferTable.rows[i + 1].cells[0].getElementsByClassName("borderSeparator").length > 0) {
				i += 2;
				continue;
			}

			hide = false;
			player.ageText = transferTable.rows[i+3].cells[1].textContent;
			var ageMatch = player.ageText.match(/(\d+)/g);
			player.days = parseInt(ageMatch[1]);

			var imgs = transferTable.rows[i].getElementsByTagName("img");
			// red/yellow cards and injuries, these are shown as images
			player.cards = 0;
			player.redCard = 0;
			player.yellowCard = 0;
			player.bruised = false;
			player.injured = false;

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
				}
				else if (imgs[j].className == "injuryInjured") {
					player.injured = true
				}
			}

			for (var j = 0; j < this.filters.length; ++j) {
				var filter = FoxtrickTransferSearchResultFilters.filters[j];
				if (filter.type=='minmax') {
					if  (  filter['properties']['min']!=='' && filter['properties']['min'] > player[filter.name]
						|| filter['properties']['max']!=='' && filter['properties']['max'] < player[filter.name] ) {
						hide = true;
						continue;
					}
				} else if (filter.type=='check') {
					if (filter.name.search(/^hide_/)!=-1) {
						var name = filter.name.match(/^hide_(.+)/)[1];
						if  ( filter['properties']['checked']===true && player[name] ) {
							hide = true;
							continue;
						}
					}
					else {
						if  ( filter['properties']['checked']===true && !player[filter.name] ) {
							hide = true;
							continue;
						}
					}
				}
			}

			for (var k = i; k < i+8 && k < transferTable.rows.length; k++) {
				if (hide) transferTable.rows[k].style.display='none';
				else transferTable.rows[k].style.display='';
			}
			i += 8;
		}
	}
};
