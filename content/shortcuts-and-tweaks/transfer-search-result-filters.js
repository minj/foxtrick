/**
 * transfer-search-result-filters.js
 * Transfer list filters
 * @author convincedd, ryanli
 */

FoxtrickTransferSearchResultFilters = {
	MODULE_NAME : "TransferSearchResultFilters",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ['transferSearchForm','transferSearchResult'],

	// functions returning whether to hide a player
	FILTER_FUNC : {
		"hideBruised" : function(player, checked) { return player.bruised; },
		"hideInjured" : function(player, checked) { return player.injured; },
		"hideSuspended" : function(player, checked) { return player.redCard == 1; },
		"days" : function(player, min, max) {
			if (typeof(min) == "number" && player.age.days < min)
				return true;
			if (typeof(max) == "number" && player.age.days > max)
				return true;
			return false;
		}
	},

	// default filter values
	FILTER_VAL : [
		{ key : "hideBruised", type : "check", checked : false },
		{ key : "hideInjured", type : "check", checked : false },
		{ key : "hideSuspended", type : "check", checked : false },
		{ key : "days", type : "minmax", min : null, max : null }
	],

	getFilters : function(callback) {
		Foxtrick.sessionGet("transfer-search-result-filters", function(n) {
			try {
				if (n === undefined) {
					// set default filters if not set
					Foxtrick.sessionSet("transfer-search-result-filters",
						FoxtrickTransferSearchResultFilters.FILTER_VAL);
					callback(FoxtrickTransferSearchResultFilters.FILTER_VAL);
				}
				else {
					callback(n);
				}
			}
			catch (e) {
				Foxtrick.log(e);
			}
		});
	},

	setFilters : function(filters) {
		Foxtrick.sessionSet("transfer-search-result-filters", filters);
	},

	run : function(page, doc) {
		if (page == 'transferSearchForm') {
			FoxtrickTransferSearchResultFilters.addExtraFilters(doc);
			FoxtrickTransferSearchResultFilters.showHTSearchProfileComment(doc);
		}
		else if (page == 'transferSearchResult')
			FoxtrickTransferSearchResultFilters.filterResults(doc);
	},

	showHTSearchProfileComment: function(doc) {
		var HTProfileRow = doc.getElementById('ctl00_ctl00_CPContent_CPMain_rowProfiles');
		if (HTProfileRow) {
			var HTProfileSelect = doc.getElementById('ctl00_ctl00_CPContent_CPMain_ddlSearchProfile');
			var tr = doc.createElement('tr');
			var td = doc.createElement('td');
			td.textContent = HTProfileSelect.title;
			tr.appendChild(td)
			HTProfileRow.parentNode.insertBefore(tr, HTProfileRow.nextSibling)
		}
	},
	
	addExtraFilters : function(doc) {
		FoxtrickTransferSearchResultFilters.getFilters(function(filters) {
			var tableAdvanced = doc.getElementById('ctl00_ctl00_CPContent_CPMain_tblAdvanced');
			if (tableAdvanced === null) {
				return;  //only show if advanced filters is on
			}
			var table = doc.createElement('table');
			var tr = doc.createElement('tr');
			table.appendChild(tr);
			var td = doc.createElement('td');
			td.setAttribute('colspan','5');
			tr.appendChild(td);
			var div = doc.createElement('div');
			div.setAttribute('class','borderSeparator');
			td.appendChild(div);

			for (var j = 0; j < filters.length; ++j) {
				FoxtrickTransferSearchResultFilters.addNewFilter(doc,table,filters,j);
			}
			tableAdvanced.parentNode.insertBefore(table, tableAdvanced.nextSibling);

			var buttonClear = doc.getElementById('ctl00_ctl00_CPContent_CPMain_butClear');
			buttonClear.addEventListener('click', FoxtrickTransferSearchResultFilters.clearFilters, false);
		});
	},

	addNewFilter : function(doc, table, filters, idx) {
		var filter = filters[idx];

		var tr = doc.createElement('tr');
		table.appendChild(tr);

		if (filter.type == "minmax") {
			var td = doc.createElement('td');
			tr.appendChild(td);
			var strong = doc.createElement('strong');
			strong.textContent = Foxtrickl10n.getString("TransferSearchResultFilters." + filter.key);
			td.appendChild(strong);

			var td = doc.createElement('td');
			td.colSpan = 2;
			td.innerHTML = Foxtrickl10n.getString("minimum") + "&nbsp;";
			tr.appendChild(td);
			var input = doc.createElement("input");
			input.style.width = "90px";
			input.id = "FoxtrickTransferSearchResultFilters." + filter.key + ".min";
			input.value = filter.min;
			input.setAttribute("x-ft-filter-idx", idx);
			input.setAttribute("x-ft-filter-prop", "min");
			input.addEventListener("blur", FoxtrickTransferSearchResultFilters.saveEdit, false);
			td.appendChild(input);

			var td = doc.createElement('td');
			td.colSpan = 2;
			td.innerHTML = Foxtrickl10n.getString("maximum") + "&nbsp;";
			tr.appendChild(td);
			var input = doc.createElement("input");
			input.style.width = "90px";
			input.id = "FoxtrickTransferSearchResultFilters." + filter.key + ".max";
			input.value = filter.max;
			input.setAttribute("x-ft-filter-idx", idx);
			input.setAttribute("x-ft-filter-prop", "max");
			input.addEventListener("blur", FoxtrickTransferSearchResultFilters.saveEdit, false);
			td.appendChild(input);
		}
		else if (filter.type == "check") {
			var td = doc.createElement("td");
			td.colSpan = 5;
			tr.appendChild(td);
			var input = doc.createElement("input");
			input.type = "checkbox";
			input.id = "FoxtrickTransferSearchResultFilters." + filter.key + ".check";
			input.setAttribute("x-ft-filter-idx", idx);
			input.setAttribute("x-ft-filter-prop", "checked");
			if (filter.checked === true)
				input.setAttribute("checked", "checked");
			input.addEventListener("blur", FoxtrickTransferSearchResultFilters.saveEdit, false);
			td.appendChild(input);
			var label = doc.createElement("label");
			label.textContent = Foxtrickl10n.getString("TransferSearchResultFilters." + filter.key);
			label.htmlFor = input.id;
			td.appendChild(label);
		}
	},

	saveEdit : function(ev) {
		FoxtrickTransferSearchResultFilters.getFilters(function(filters) {
			if (ev.target.type == "text")
				filters[ev.target.getAttribute("x-ft-filter-idx")][ev.target.getAttribute("x-ft-filter-prop")] = Number(ev.target.value);
			else if (ev.target.type == "checkbox")
				filters[ev.target.getAttribute("x-ft-filter-idx")][ev.target.getAttribute("x-ft-filter-prop")] = Boolean(ev.target.checked);
			FoxtrickTransferSearchResultFilters.setFilters(filters);
		});
	},

	clearFilters : function(ev) {
		var doc = ev.target.ownerDocument;

		FoxtrickTransferSearchResultFilters.getFilters(function(filters) {
			for (var j = 0; j < filters.length; ++j) {
				var filter = filters[j];
				if (filter.type == "minmax") {
					filters[j].min = null;
					doc.getElementById("FoxtrickTransferSearchResultFilters." + filter.key + ".min").value = "";
					filters[j].max = null;
					doc.getElementById("FoxtrickTransferSearchResultFilters." + filter.key + ".max").value = "";
				}
				else if (filter.type == "check") {
					filters[j].checked = false;
					doc.getElementById("FoxtrickTransferSearchResultFilters." + filter.key + ".check").removeAttribute("checked");
				}
			}
			FoxtrickTransferSearchResultFilters.setFilters(filters);
		});
	},

	filterResults : function(doc) {
		FoxtrickTransferSearchResultFilters.getFilters(function(filters) {
			var playerList = Foxtrick.Pages.TransferSearchResults.getPlayerList(doc);
			var playerInfos = doc.getElementsByClassName("transferPlayerInfo");
			// Transform a live NodeList to an array because we'll remove
			// elements below. Without transformation the index would
			// point to incorrect nodes.
			playerInfos = Foxtrick.map(playerInfos, function(n) { return n; });

			// playerList and playerInfos should have the same order,
			// and the same length
			for (var i = 0; i < playerInfos.length; ++i) {
				var player = playerList[i];
				var hide = false;
				for (var j = 0; j < filters.length; ++j) {
					var filter = filters[j];
					if (filter.type == "minmax") {
						if (FoxtrickTransferSearchResultFilters.FILTER_FUNC[filter.key](player, filter.min, filter.max))
							hide = true;
					}
					else if (filter.type == "check") {
						if (filter.checked && FoxtrickTransferSearchResultFilters.FILTER_FUNC[filter.key](player))
							hide = true;
					}
					if (hide) {
						playerInfos[i].parentNode.removeChild(playerInfos[i]);
						break;
					}
				}
			}
		});
	}
};
