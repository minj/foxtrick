"use strict";
/**
 * match.js
 * utilities on match page
 * @author taised, Jestar
 */
////////////////////////////////////////////////////////////////////////////////
Foxtrick.Pages.Match = {
	isPrematch : function(doc) {
		return (doc.getElementById("ctl00_ctl00_CPContent_CPMain_pnlPreMatch") != null);
	},

	inProgress : function(doc) {
		var matchStatus = doc.getElementById("ctl00_ctl00_CPContent_CPMain_lblMatchStatus");
		return (matchStatus != null) && (matchStatus.textContent != "");
	},

	getRatingsTable: function(doc) {
		var ratingstable = null;
		var tables = doc.getElementById('mainBody').getElementsByTagName('table')
		if (tables) { //match is ended
			//finding the right table
			ratingstable = tables.item(0);
		}
		return ratingstable;
	},

	isWalkOver: function(ratingstable) {
		try {
			for (var i = 1; i <= 7; i++) {
				for (var j = 1; j <= 2; j++) {
					var value = this.getStatFromCell(ratingstable.rows[i].cells[j]);
					if (value > 0) { // no Walk-over
						return false;
					}
				}
			}
		}
		catch (e) {
			Foxtrick.log(e);
		}
		return true;
	},

	isCorrectLanguage: function(ratingstable) {
		try {
			for (var i = 1; i <= 7; i++) {
				for (var j = 1; j <= 2; j++) {
					var value = this.getStatFromCell(ratingstable.rows[i].cells[j]);
					if (value < 0) { // wrong language
						return false;
					}
				}
			}
		}
		catch (e) {
			Foxtrick.log(e);
		}
		return true;
	},

	getStatFromCell: function(cell) {
		var link = cell.firstChild;
		var baseValue = parseInt(link.href.replace(/.+lt=skill/i, "").replace(/.+ll=/i, "").match(/^\d+/)) - 1;
		if (baseValue == -1) {
			return 0; // non-existant
		}

		var subLevelValue=0;

		var lang = FoxtrickPrefs.getString("htLanguage");

		try {
			// remove <a> (baseValue above) and <span> (could be added
			// by HatStatsSeparated in module Ratings
			var nodeCloned = cell.cloneNode(true);
			var toRemove = Foxtrick.filter(function(n) {
					var nn = n.nodeName.toLowerCase();
					return nn == "a" || nn == "span";
				}, nodeCloned.childNodes);
			Foxtrick.map(function(n) { nodeCloned.removeChild(n); }, toRemove);
			var subLevel = Foxtrick.trim(nodeCloned.textContent);
			var path = "language/ratingSubLevels/sublevel[@text='" + subLevel + "']";
			subLevelValue = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml[lang], path, "value");
			if (!subLevelValue)	return -1;
		}
		catch (e) {
			Foxtrick.log(e);
		}

		return baseValue+parseFloat(subLevelValue);
	},

	getTacticsLevelFromCell: function(cell) {
		var basevalue=0;
		if (cell.firstChild.nodeName=='A')
			basevalue=parseInt(cell.firstChild.href.replace(/.+lt=skill/i, "").replace(/.+ll=/i, "").match(/^\d+/));
		return basevalue;
	},

	getTacticsFromCell: function(cell) {
		var tactics=Foxtrick.trim(cell.innerHTML);
		var lang = FoxtrickPrefs.getString("htLanguage");

		try {
			var path = "language/tactics/tactic[@value=\"" + tactics + "\"]";
			var subLevelValue = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml[lang], path, "type");
			return subLevelValue || -1;
		}
		catch (e) {
			Foxtrick.log(e);
		}
		return null;
	}
};
