/**
 * Transfer list filters
 * @author kolmis, bummerland
 */

FoxtrickTransferSearchFilters = {

	MODULE_NAME : "TransferSearchFilters",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('transferSearchForm'),
	_MAX_FILTER_DISP_LENGTH : 23,

	backwardCompatibleCodes : {
		"_01" : "ctl00$ctl00$CPContent$CPMain$ddlDeadline",
		"_02" : "ctl00$ctl00$CPContent$CPMain$ddlAgeMin",
		"_03" : "ctl00$ctl00$CPContent$CPMain$ddlAgeMax",
		"_04" : "ctl00$ctl00$CPContent$CPMain$ddlSkill1",
		"_05" : "ctl00$ctl00$CPContent$CPMain$ddlSkill1Min",
		"_06" : "ctl00$ctl00$CPContent$CPMain$ddlSkill1Max",
		"_07" : "ctl00$ctl00$CPContent$CPMain$ddlSkill2",
		"_08" : "ctl00$ctl00$CPContent$CPMain$ddlSkill2Min",
		"_09" : "ctl00$ctl00$CPContent$CPMain$ddlSkill2Max",
		"_10" : "ctl00$ctl00$CPContent$CPMain$ddlSkill3",
		"_11" : "ctl00$ctl00$CPContent$CPMain$ddlSkill3Min",
		"_12" : "ctl00$ctl00$CPContent$CPMain$ddlSkill3Max",
		"_13" : "ctl00$ctl00$CPContent$CPMain$ddlSkill4",
		"_14" : "ctl00$ctl00$CPContent$CPMain$ddlSkill4Min",
		"_15" : "ctl00$ctl00$CPContent$CPMain$ddlSkill4Max",
		"_16" : "ctl00$ctl00$CPContent$CPMain$ddlSpecialty",
		"_17" : "ctl00$ctl00$CPContent$CPMain$ddlZone",
		"_18" : "ctl00$ctl00$CPContent$CPMain$ddlBornIn",
		"_19" : "ctl00_ctl00_CPContent_CPMain_txtTSIMin_text",
		"_20" : "ctl00$ctl00$CPContent$CPMain$txtTSIMin",
//		"_21" : "ctl00_ctl00_CPContent_CPMain_txtTSIMin_ClientState",
		"_22" : "ctl00_ctl00_CPContent_CPMain_txtTSIMax_text",
		"_23" : "ctl00$ctl00$CPContent$CPMain$txtTSIMax",
//		"_24" : "ctl00_ctl00_CPContent_CPMain_txtTSIMax_ClientState",
		"_25" : "ctl00_ctl00_CPContent_CPMain_txtBidMin_text",
		"_26" : "ctl00$ctl00$CPContent$CPMain$txtBidMin",
//		"_27" : "ctl00_ctl00_CPContent_CPMain_txtBidMin_ClientState",
		"_28" : "ctl00_ctl00_CPContent_CPMain_txtBidMax_text",
		"_29" : "ctl00$ctl00$CPContent$CPMain$txtBidMax",
//		"_30" : "ctl00_ctl00_CPContent_CPMain_txtBidMax_ClientState",
		"_31" : "ctl00$ctl00$CPContent$CPMain$ddlGlobalSkillMax",
		"_32" : "ctl00$ctl00$CPContent$CPMain$chkUseGlobalMax",

		"_51" : "FoxtrickTransferSearchResultFilters.hideBruised.check",
		"_52" : "FoxtrickTransferSearchResultFilters.hideInjured.check",
		"_53" : "FoxtrickTransferSearchResultFilters.hideSuspended.check",
		"_55" : "FoxtrickTransferSearchResultFilters.days.min",
		"_56" : "FoxtrickTransferSearchResultFilters.days.max",
	},

	run : function(doc) {
		if ( doc.location.href.search(/TransfersSearchResult/i) > 0 ) return;

		var ownBoxBody = doc.createElement("div");
		var header = Foxtrickl10n.getString("foxtrick.transferfilter.Foxtrick_Filters");
		var ownBoxBodyId = "foxtrick_transferfilter_content";
		ownBoxBody.id = ownBoxBodyId;

		// add link
		var addlink = doc.createElement("a");
		addlink.id = "foxtrick_transferfilter_new";
		addlink.addEventListener("click", FoxtrickTransferSearchFilters.addNewFilter, false);
		addlink.innerHTML = Foxtrickl10n.getString("foxtrick.transferfilter.save_new_filter");
		ownBoxBody.appendChild(addlink);

		var namelist = FoxtrickPrefs.getList("transferfilterlist");
		namelist.sort();
		var table = doc.createElement("table");
		table.id = "table_transfer_filters";
		for (var i=0; i< namelist.length; i++) {
			this._addFilter(doc, table, namelist[i]);
		}
		ownBoxBody.appendChild(table);
		Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, 1);
	},

	addNewFilter : function(ev) {
		try {
			var doc = ev.target.ownerDocument;

			var filtername = prompt(Foxtrickl10n.getString("foxtrick.transferfilter.Enter_filter_name"));
			if (filtername == '') return;

			filtername = filtername.substring( 0, FoxtrickTransferSearchFilters._MAX_FILTER_DISP_LENGTH );

			var formString = "<root>";
			for (var i in FoxtrickTransferSearchFilters.backwardCompatibleCodes) {
				var el = FoxtrickTransferSearchFilters.findFormElement(i, doc);
				if (el == null) {
					var subst = FoxtrickTransferSearchFilters.backwardCompatibleCodes[i];
					if (typeof(subst) != 'undefined') {
						el = FoxtrickTransferSearchFilters.findFormElement(subst, doc);
					}
				}
				if (el != null && el.type != "radio" && el.type != "checkbox" ) {
					if (el.value.search('{')!=-1) continue;  // don't save hidden imputs
					formString = formString + "<elem>";
					formString = formString + "<name>" + i + "</name>";
					formString = formString + "<value>" + el.value + "</value>";
					formString = formString + "</elem>";
				}

				if (el != null && el.type != "radio" && el.type == "checkbox" ) {
					formString = formString + "<elem>";
					formString = formString + "<name>" + i + "</name>";
					formString = formString + "<value>" + el.checked + "</value>";
					formString = formString + "</elem>";
				}
			}
			formString = formString + "</root>";

			var namelist = FoxtrickPrefs.getList("transferfilterlist");
			var bExists = false;
			for (var i=0; i< namelist.length; i++) {
				if (namelist[i] == filtername){
					bExists = true;
					break;
				}
			}
			FoxtrickPrefs.setString("transferfilter." + filtername, formString);
			if (bExists){
				FoxtrickPrefs.delListPref("transferfilterlist", filtername);
				var el = doc.getElementById("filter_" + filtername);
					if (el)
						el.parentNode.removeChild(el);
			}
			FoxtrickPrefs.addPrefToList("transferfilterlist", filtername);
			var table = doc.getElementById("table_transfer_filters");
			if (table) {
				FoxtrickTransferSearchFilters._addFilter(doc, table, filtername);
			}
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	deleteFilter : function( ev ) {
		var doc = ev.target.ownerDocument;
		if (Foxtrick.confirmDialog(Foxtrickl10n.getString('foxtrick.transferfilter.delete_filter_ask'))) {
		  FoxtrickPrefs.delListPref( "transferfilterlist", ev.target.msg );
		  FoxtrickPrefs.deleteValue("transferfilter." + ev.target.msg);
			var el = doc.getElementById("filter_" + ev.target.msg);
			if (el)
				el.parentNode.removeChild(el);
		}
	},

	fillForm : function(ev) {
		try {
			var filter = ev.target.getAttribute("filter");
			var doc = ev.target.ownerDocument;
			// parse it
			var myDomParser = new DOMParser();
			var obj = myDomParser.parseFromString(filter, "text/xml");

			var root = obj.firstChild;

			for (var i=0; i<root.childNodes.length; i++) {
				var name = root.childNodes[i].childNodes[0].textContent;

				var value;
				if (root.childNodes[i].childNodes[1].childNodes.length >0) {
					value = root.childNodes[i].childNodes[1].textContent;
				}
				else {
					value="";
				}

				// set the value in form
				var el = FoxtrickTransferSearchFilters.findFormElement(name, doc);
				if (el == null) {
					var subst = FoxtrickTransferSearchFilters.backwardCompatibleCodes[name];
					if (typeof(subst) != 'undefined') {
						el = FoxtrickTransferSearchFilters.findFormElement(subst, doc);
					}
				}
				if (el == null) continue;

				if (el.type != "radio") {
					el.value=value;
				}
				if (el.type == 'checkbox' && value == 'true' ) {el.checked = true;} else {el.checked = false;}
				el.disabled = false;
			}
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	findFormElement : function(name, doc) {
		var els = doc.getElementsByName(name);
		if (els.length > 0) return els[0];
		return null;
	},

	_addFilter : function(doc, table, name) {
		var filter = FoxtrickPrefs.getString("transferfilter." + name);

		var tr = doc.createElement("tr");
		tr.id = "filter_" + name;
		table.appendChild(tr);

		var td_fname = doc.createElement("td");
		var td_remove = doc.createElement("td");
		tr.appendChild(td_fname);
		tr.appendChild(td_remove);

		var link = doc.createElement("a");
		link.addEventListener("click", this.fillForm, false);
		link.innerHTML = name;
		link.setAttribute("filter", filter);
		td_fname.appendChild(link);

		var remover = doc.createElement("div");
		remover.className = "foxtrickRemove";
		remover.msg = name;
		remover.addEventListener("click", this.deleteFilter, false);
		td_remove.appendChild(remover);
	}
};
Foxtrick.util.module.register(FoxtrickTransferSearchFilters);
