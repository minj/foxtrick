/* all.js
 * Utilities on all pages
 * @author ryanli
 */

Foxtrick.Pages.All = {
	getOwnTeamId : function(doc) {
		try {
			var id =  FoxtrickHelper.getOwnTeamId();
			if (id) {
				return id;
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
		return null;
	},
	getTeamId : function(doc) {
		try {
			var id = FoxtrickHelper.findTeamId(doc.getElementById("content").getElementsByTagName("div")[0]);
			if (id) {
				return id;
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
		return null;
	},
	getTeamName : function(doc) {
		try {
			var mainRegular = doc.getElementsByClassName("mainRegular")[0];
			var header = mainRegular.getElementsByTagName("h2")[0];
			var links = header.getElementsByTagName("a")[0];
			for (var i = 0; i < links.length; ++i) {
				if (links[i].search(/TeamID=\d+/) !== -1) {
					return links[i].textContent;
				}
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
		return null;
	}
};
