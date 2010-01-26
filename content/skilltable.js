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

			// a temporary solution concerning adultskilltable's customization
			// will be unified
			if (table.id === "ft_adultskilltable") {
				var start = 2;
			}
			else {
				var start = 1;
			}
			for (var i = start; i < table.rows.length; ++i) {
				rows.push(table_old.rows[i]);
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

			for (var i=start; i < table.rows.length; ++i) {
				table.rows[i].innerHTML = rows[i-start].innerHTML;
			}
		}
		catch (e) {
			Foxtrick.dump("SkillTable: " + e + "\n");
		}
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

	_getCell : function(cell) {
		return Foxtrick.trim(cell.textContent);
	}
};