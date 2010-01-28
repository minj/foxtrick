/**
 * skilltable.js
 * Utilities for skill tables
 * @author convicedd, luminaryan
 */

var FoxtrickSkillTable = {
	MODULE_NAME : "SkillTable",
	DEFAULT_ENABLED : true,

	init : function() {
	},

	run : function(page, doc) {
	},

	change : function(page, doc) {
	},

	sortfunction: function(a,b) {return a.cells[FoxtrickSkillTable.sortIndex].innerHTML.localeCompare(b.cells[FoxtrickSkillTable.sortIndex].innerHTML);},
	sortindexfunction: function(a,b) {return parseInt(b.cells[FoxtrickSkillTable.sortIndex].getAttribute('index')) < parseInt(a.cells[FoxtrickSkillTable.sortIndex].getAttribute('index'));},
	sortdownfunction: function(a,b) {return parseInt(b.cells[FoxtrickSkillTable.sortIndex].innerHTML.replace(/\&nbsp| /g,'')) > parseInt(a.cells[FoxtrickSkillTable.sortIndex].innerHTML.replace(/\&nbsp| /g,''));},
	sortdowntextfunction: function(a,b) {return (b.cells[FoxtrickSkillTable.sortIndex].innerHTML.localeCompare(a.cells[FoxtrickSkillTable.sortIndex].innerHTML));},
	sortlinksfunction: function(a,b) {return a.cells[FoxtrickSkillTable.sortIndex].getElementsByTagName('a')[0].innerHTML.localeCompare(b.cells[FoxtrickSkillTable.sortIndex].getElementsByTagName('a')[0].innerHTML);},
	sortagefunction: function(a,b) {return a.cells[FoxtrickSkillTable.sortIndex].getAttribute('age').localeCompare(b.cells[FoxtrickSkillTable.sortIndex].getAttribute('age'));},

	sortClick : function(ev, doc, index, sort) {
		try {
			if (ev) {
				var doc = ev.target.ownerDocument;
				FoxtrickSkillTable.sortIndex = ev.currentTarget.getAttribute('s_index');
				FoxtrickSkillTable.sort = ev.currentTarget.getAttribute('sort');
			}
			else {
				FoxtrickSkillTable.sortIndex = index;
				FoxtrickSkillTable.sort = sort;
			}
			var table = doc.getElementsByClassName("ft_skilltable")[0];
			var table_old = table.cloneNode(true);
			Foxtrick.dump('sortby: '+FoxtrickSkillTable.sortIndex+' '+FoxtrickSkillTable.sort+'\n');

			var rows = new Array();

			for (var i = 1; i < table.rows.length; ++i) {
				rows.push(table_old.rows[i].cloneNode(true));
			}
			//table.rows[3].innerHTML = table_old.rows[1].innerHTML;
			if (FoxtrickSkillTable.sort == "link")
				rows.sort(FoxtrickSkillTable.sortlinksfunction);
			else if (FoxtrickSkillTable.sort == "age")
				rows.sort(FoxtrickSkillTable.sortagefunction);
			else if (FoxtrickSkillTable.sort == "int")
				rows.sort(FoxtrickSkillTable.sortdownfunction);
			else if (FoxtrickSkillTable.sort == "index")
				rows.sort(FoxtrickSkillTable.sortindexfunction);
			else if (FoxtrickSkillTable.sort == "text")
				rows.sort(FoxtrickSkillTable.sortdowntextfunction);
			
			for (var i = 1; i < table.rows.length; ++i) {
				table_old.rows[i].innerHTML = rows[i-1].innerHTML;
			}
			table.innerHTML = table_old.innerHTML;
			
			for (var i = 0; i < table.rows[0].cells.length; ++i) {
				table.rows[0].cells[i].addEventListener("click", FoxtrickSkillTable.sortClick, false);
			}
		}
		catch (e) {
			Foxtrick.dump("SkillTable: " + e + "\n");
		}
		finally {
			if (ev) ev.stopPropagation();
		}
	},

	toggleDisplay : function(doc) {
		try {
			var tablediv = doc.getElementsByClassName("ft_skilltablediv")[0];
			var h2 = tablediv.getElementsByTagName("h2")[0];
			Foxtrick.toggleClass(h2, "ft_boxBodyUnfolded");
			Foxtrick.toggleClass(h2, "ft_boxBodyCollapsed");
			var show = Foxtrick.hasClass(h2, "ft_boxBodyUnfolded");

			if (FoxtrickSkillTable.isAdult(tablediv)) {
				if (!FoxtrickAdultSkillTable.tableCreated) {
					// create adult skill table
					FoxtrickAdultSkillTable.createTable(doc);
					FoxtrickAdultSkillTable.tableCreated = true;
				}
				FoxtrickPrefs.setBool("module.AdultSkillTable.show", show);
			}
			else if (FoxtrickSkillTable.isYouth(tablediv)) {
				if (!FoxtrickYouthSkillTable.tableCreated) {
					// create youth skill table
					FoxtrickYouthSkillTable.createTable(doc);
					FoxtrickYouthSkillTable.tableCreated = true;
				}
				FoxtrickPrefs.setBool("module.YouthSkillTable.show", show);
			}

			var customize = tablediv.getElementsByClassName("ft_skilltable_customize")[0];
			var customizeTable = tablediv.getElementsByClassName("ft_skilltable_customizetable")[0];
			var viewContainer = tablediv.getElementsByClassName("ft_skilltable_viewcont")[0];
			if (show) {
				// show the objects
				Foxtrick.removeClass(customize, "hidden");
				Foxtrick.removeClass(viewContainer, "hidden");
			}
			else {
				// hide the objects
				Foxtrick.addClass(customize, "hidden");
				Foxtrick.removeClass(customize, "customizing");
				Foxtrick.addClass(customizeTable, "hidden");
				Foxtrick.addClass(viewContainer, "hidden");
			}
		}
		catch(e) {Foxtrick.dump("SkillTable.toggleDisplay: "+e+"\n");}
	},	

	headerClick : function(ev) {
		FoxtrickSkillTable.toggleDisplay(ev.target.ownerDocument);
	},

	view : function(ev) {
		var doc = ev.target.ownerDocument;
		var tablediv = doc.getElementsByClassName("ft_skilltablediv")[0];
		var viewContainer = doc.getElementsByClassName("ft_skilltable_viewcont")[0];
		Foxtrick.toggleClass(viewContainer, "on_top");
		if (FoxtrickSkillTable.isAdult(tablediv)) {
			FoxtrickPrefs.setBool("module.AdultSkillTable.top", Foxtrick.hasClass(viewContainer, "on_top"));
		}
		else if (FoxtrickSkillTable.isYouth(tablediv)) {
			FoxtrickPrefs.setBool("module.YouthSkillTable.top", Foxtrick.hasClass(viewContainer, "on_top"));
		}
	},

	customize : function(ev) {
		var doc = ev.target.ownerDocument;
		var customize = doc.getElementsByClassName("ft_skilltable_customize")[0];
		Foxtrick.addClass(customize, "customizing");

		var customizeTable = doc.getElementsByClassName("ft_skilltable_customizetable")[0];
		Foxtrick.removeClass(customizeTable, "hidden");

		var viewContainer = doc.getElementsByClassName("ft_skilltable_viewcont")[0];
		Foxtrick.addClass(viewContainer, "hidden");
	},

	save : function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			var ownteamid = FoxtrickHelper.findTeamId(doc.getElementById('teamLinks'));
			var teamid = FoxtrickHelper.findTeamId(doc.getElementById('content').getElementsByTagName('div')[0]);
			var is_ownteam = (ownteamid==teamid);
			Foxtrick.dump('is_ownteam: '+is_ownteam+'\n');

			var kind='own';
			if (!is_ownteam) kind='other';

			var tablediv = doc.getElementsByClassName('ft_skilltablediv')[0];
			var module = "";
			if (tablediv.id === "ft_adultskilltablediv") {
				module = "AdultSkillTable";
			}
			else if (tablediv.id === "ft_youthskilltablediv") {
				module = "YouthSkillTable";
			}
			var input = tablediv.getElementsByTagName('input');
			for (var i=0; i<input.length; ++i) {
				FoxtrickPrefs.setBool("module." + module + "." + kind+'.'+input[i].id + ".enabled", input[i].checked );
				Foxtrick.dump(input[i].id + ": " + input[i].checked + "\n");
			}
			doc.location.reload();
		}catch(e) {Foxtrick.dump('customize '+e+'\n');}
	},

	cancel : function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			var tablediv = doc.getElementsByClassName("ft_skilltablediv")[0];
			var customize = tablediv.getElementsByClassName("ft_skilltable_customize")[0];
			var customizeTable = tablediv.getElementsByClassName("ft_skilltable_customizetable")[0];
			var viewContainer = tablediv.getElementsByClassName("ft_skilltable_viewcont")[0];
			Foxtrick.removeClass(customize, "customizing");
			Foxtrick.addClass(customizeTable, "hidden");
			Foxtrick.removeClass(viewContainer, "hidden");
		}
		catch(e) {Foxtrick.dump('customize '+e+'\n');}
	},

	createView : function(doc) {
		var div = doc.createElement("div");
		div.className = "ft_skilltable_view";
		var view = doc.createElement("a");
		div.appendChild(view);
		view.appendChild(doc.createTextNode(Foxtrickl10n.getString("Switch_view")));
		view.setAttribute("title", Foxtrickl10n.getString("foxtrick.SkillTable.Switch_view_title"));
		view.addEventListener("click", FoxtrickSkillTable.view, false);

		return div;
	},

	createCustomize : function(doc) {
		var div = doc.createElement("div");
		div.className = "ft_skilltable_customize";

		var customize = doc.createElement("a");
		customize.className = "customize_item";
		customize.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.buttonCustomize")));
		customize.addEventListener("click", FoxtrickSkillTable.customize, false);

		var save = doc.createElement("a");
		save.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.buttonSave")));
		save.addEventListener("click", FoxtrickSkillTable.save, false);

		var cancel = doc.createElement("a");
		cancel.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.buttonCancel")));
		cancel.addEventListener("click", FoxtrickSkillTable.cancel, false);

		div.appendChild(customize);
		div.appendChild(save);
		div.appendChild(cancel);

		return div;
	},

	createCustomizeTable : function(id, properties, doc) {
		var table = doc.createElement("table");
		table.id = "ft_" + id + "skilltable_customizetable";
		table.className = "ft_skilltable_customizetable";
		var thead = doc.createElement("thead");
		var tbody = doc.createElement("tbody");
		var headRow = doc.createElement("tr");
		var checkRow = doc.createElement("tr");
		table.appendChild(thead);
		table.appendChild(tbody);
		thead.appendChild(headRow);
		tbody.appendChild(checkRow);
		for (var i = 0; i < properties.length; ++i) {
			if (properties[i].available) {
				var th = doc.createElement("th");
				if (properties[i].abbr) {
					var abbr = doc.createElement("abbr");
					abbr.setAttribute("title", Foxtrickl10n.getString(properties[i].name));
					abbr.appendChild(doc.createTextNode(Foxtrickl10n.getString(properties[i].name + ".abbr")));
					th.appendChild(abbr);
					if (properties[i].img) {
						abbr.style.display = "none";
						th.style.backgroundImage = "url('" + properties[i].img + "')";
						th.style.backgroundRepeat = "no-repeat";
						th.style.minWidth = properties[i].width;
						th.style.minHeight = properties[i].height;
					}
				}
				else {
					var span = doc.createElement("span");
					span.appendChild(doc.createTextNode(Foxtrickl10n.getString(properties[i].name)));
					th.appendChild(span);
					if (properties[i].img) {
						span.style.display = "none";
						th.style.backgroundImage = "url('" + properties[i].img + "')";
						th.style.backgroundRepeat = "no-repeat";
						th.style.minWidth = properties[i].width;
						th.style.minHeight = properties[i].height;
					}
				}
				var td = doc.createElement("td");
				var check = doc.createElement("input");
				check.id = properties[i].name;
				check.setAttribute("type", "checkbox");
				if (properties[i].enabled) {
					check.setAttribute("checked", "checked");
				}
				td.appendChild(check);
				headRow.appendChild(th);
				checkRow.appendChild(td);
			}
		}
		return table;
	},

	addCopyButton : function(doc) {
		if (FoxtrickPrefs.getBool( "smallcopyicons" )) {
			if (doc.getElementById('copyskilltable')) return;
			var boxHead = doc.getElementById('mainWrapper').getElementsByTagName('div')[1];
			if (boxHead.className!='boxHead') return;

			if (Foxtrick.isStandardLayout(doc)) {
				doc.getElementById('mainBody').setAttribute('style','padding-top:20px;');
			}

			var messageLink = doc.createElement("a");
			messageLink.className = "inner copyicon copyplayerad ci_first";
			messageLink.title = Foxtrickl10n.getString("foxtrick.tweaks.copyskilltable" );
			messageLink.id = "copyskilltable" ;
			messageLink.addEventListener("click", FoxtrickSkillTable.copyTable, false)

			var img = doc.createElement("img");
			img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyskilltable" );
			img.src = Foxtrick.ResourcePath+"resources/img/transparent_002.gif";

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
			messageLink.addEventListener("click", FoxtrickSkillTable.copyTable, false)

			var img = doc.createElement("img");
			img.style.padding = "0px 5px 0px 0px;";
			img.className = "actionIcon";
			img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyskilltable" );
			img.src = Foxtrick.ResourcePath+"resources/img/copyplayerad.png";
			messageLink.appendChild(img);

			parentDiv.appendChild(messageLink);

			var newBoxId = "foxtrick_actions_box";
			Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString(
				"foxtrick.tweaks.actions" ), parentDiv, newBoxId, "first", "");
		}
	},

	copyTable : function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			var table = doc.getElementsByClassName("ft_skilltable")[0];
			Foxtrick.copyStringToClipboard(FoxtrickSkillTable.toHtMl(table));
			if (FoxtrickPrefs.getBool( "copyfeedback" ))
				Foxtrick.alert(Foxtrickl10n.getString("foxtrick.tweaks.yskilltablecopied"));
		}
		catch (e) {
			Foxtrick.dump("SkillTable: " + e + "\n");
		}
	},

	toHtMl : function(table) {
		try {
			var ret = "[table]";
			for (var rowIndex = 0; rowIndex < table.rows.length; ++rowIndex) {
				var row = table.rows[rowIndex];
				ret += "[tr]";
				for (var cellIndex = 0; cellIndex < row.cells.length; ++cellIndex) {
					var cell = row.cells[cellIndex];
					var tagName = cell.tagName.toLowerCase();
					ret += "[" + tagName + "]" + this._getCell(cell) + "[/" + tagName +"]";
				}
				ret += "[/tr]";
			}
			ret += "[/table]";
			return ret;
		}
		catch (e) {
			Foxtrick.dump("SkillTable: " + e + "\n");
		}
	},

	isAdult : function(tablediv) {
		return (tablediv.id === "ft_adultskilltablediv");
	},

	isYouth : function(tablediv) {
		return (tablediv.id === "ft_youthskilltablediv");
	},

	_getCell : function(cell) {
		return Foxtrick.trim(cell.textContent);
	},

	_getShortPos: function(pos) {
		var short_pos='';
		try {
		  var lang = FoxtrickPrefs.getString("htLanguage");
		}
		catch (e) {
		  return null;
		}

		try {
			var type = pos.replace(/&nbsp;/,' ');
			var path = "hattricklanguages/language[@name='" + lang + "']/positions/position[@value='" + type + "']";
			short_pos = Foxtrick.xml_single_evaluate(Foxtrick.XMLData.htLanguagesXml, path, "short");
			return short_pos
		}
		catch (e) {
			Foxtrick.dump('youthskill.js _getShort: '+e + "\n");
			return null;
		}

		return short_pos;
	},

	_getShortSpecialty: function(pos) {
		var short_pos='';
		try {
		  var lang = FoxtrickPrefs.getString("htLanguage");
		}
		catch (e) {
		  return null;
		}

		try {
			var type = pos.replace(/&nbsp;/,' ');
			var path = "hattricklanguages/language[@name='" + lang + "']/specialties/specialty[@value='" + type + "']";
			short_pos = Foxtrick.xml_single_evaluate(Foxtrick.XMLData.htLanguagesXml, path, "short");
			return short_pos
		}
		catch (e) {
			Foxtrick.dump('youthskill.js _getShort: '+e + "\n");
			return null;
		}

		return short_pos;
	}
};