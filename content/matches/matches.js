/**
 * matches.js
 * adds info on matches page
 * @author taised, Jestar
 */
////////////////////////////////////////////////////////////////////////////////
var Matches = {

	htLanguagesXml : null,

	init : function() {
		this.initHtLang();
	},
	
	_getRatingsTable: function(doc) {
		var ratingstable = null;
		var sidebar = doc.getElementById('sidebar');
		if (sidebar.childNodes.length > 7) { //match is ended
			//finding the right table
			var divs;
			if (doc.getElementById('mainBody').childNodes.length>3)
				divs=doc.getElementById('mainBody').childNodes[3].getElementsByTagName('div');
			else
				divs=doc.getElementById('mainBody').childNodes[1].getElementsByTagName('div');
			for (i=0;i<divs.length;i++)
			{
				if (divs[i].className=='mainBox')
					ratingstable=divs[i].getElementsByTagName('table').item(0);
			}
		}
		return ratingstable;
	},

	_getStatFromCell: function(cell)
	{
		var link = cell.firstChild;
		var baseValue = parseInt(link.href.replace(/.+lt=skill/i, "").replace(/.+ll=/i, "").match(/^\d+/)) - 1;
		if (baseValue == -1) {
			return 0; // non-existant
		}
		var subLevelValue=0;
		try {
		  var lang = FoxtrickPrefs.getString("htLanguage");
		} catch (e) {
		  lang = "en";
		}

		try {
			var subLevel = Foxtrick.trim(link.parentNode.textContent.substring(link.textContent.length));
			var path = "hattricklanguages/language[@name='" + lang + "']/ratingSubLevels/sublevel[@text='" + subLevel + "']";
			var obj = this.htLanguagesXml.evaluate(path,this.htLanguagesXml,null,this.htLanguagesXml.DOCUMENT_NODE,null).singleNodeValue;
			if (obj)
				subLevelValue = parseFloat(obj.attributes.getNamedItem("value").textContent);
			else
				return -1;
		} catch (e) {
			dump('matches.js _getStatFromCell: '+e);
		}

		return baseValue+subLevelValue;
	},

	_getTacticsLevelFromCell: function(cell) {
		var basevalue=0;
		if (cell.firstChild.nodeName=='A')
			basevalue=parseInt(cell.firstChild.href.replace(/.+lt=skill/i, "").replace(/.+ll=/i, "").match(/^\d+/));
		return basevalue;
	},

	_getTacticsFromCell: function(cell) {
		var tactics=Foxtrick.trim(cell.innerHTML);
		try {
			var lang = FoxtrickPrefs.getString("htLanguage");
		} catch (e) {
			lang = "en";
		}

		try {

			var path = "hattricklanguages/language[@name='" + lang + "']/tactics/tactic[@value=\"" + tactics + "\"]";
			var obj = this.htLanguagesXml.evaluate(path,this.htLanguagesXml,null,this.htLanguagesXml.DOCUMENT_NODE,null).singleNodeValue;

			return obj.attributes.getNamedItem("type").textContent;

		} catch (e) {
			return null;
		}

	},

	initHtLang: function ()
	{
		try {
			this.htLanguagesXml = this._loadXmlIntoDOM("chrome://foxtrick/content/htlocales/htlang.xml");
		} catch (e) {
			dump('matches.js initHtLang: '+e+"\n");
		}
	},

	_loadXmlIntoDOM: function(url) {
		var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
		req.open("GET", url, false);
		req.send(null);
		var doc = req.responseXML;
		if (doc.documentElement.nodeName == "parsererror") {
			dump("error parsing " + url+"\n");
			return null;
		}
		return doc;
	}

};