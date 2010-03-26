/* all.js
 * Utilities on all pages
 * @author ryanli
 */

Foxtrick.Pages.All = {
	getOwnTeamId : function(doc) {
		try {
			var id = FoxtrickHelper.findTeamId(doc.getElementById("teamLinks"));
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
	}
};
