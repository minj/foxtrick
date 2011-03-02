/**
 * match.js
 * utilities on match page
 * @author taised, Jestar
 */
////////////////////////////////////////////////////////////////////////////////
Foxtrick.Pages.Match = {
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
			Foxtrick.dumpError(e);
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
			Foxtrick.dumpError(e);
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
			// first node that is neither <a> nor <span> and is non-empty
			var subLevelNode = Foxtrick.filter(link.parentNode.childNodes,
				function(n) {
					var nn = n.nodeName.toLowerCase();
					return nn != "a" && nn !== "span"
						&& Foxtrick.trim(n.textContent) !== ""
				})[0];
			var subLevel = Foxtrick.trim(subLevelNode.textContent);
			var path = "language/ratingSubLevels/sublevel[@text='" + subLevel + "']";
			subLevelValue = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml[lang], path, "value");
			if (!subLevelValue)	return -1;
		}
		catch (e) {
			Foxtrick.dumpError(e);
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
			subLevelValue = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml[lang], path, "type");
			if (subLevelValue)
				return subLevelValue;
			else
				return -1;
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
		return null;
	}
};
