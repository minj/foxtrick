/* players.js
 * Utilities on players page
 * @author convincedd, ryanli
 */

Foxtrick.Pages.Players = {
	lastSuccessfulXML : "", // last successful XML retrieve location
	lastSuccessfulTime : 0, // last successful XML retrieve time (in milliseconds)
	cachedXML : null, // use this if lastSuccessfulPage matches
	XMLExpiry : 60000, // reload XML after this period of time (in milliseconds)
	getXML : function(doc) {
		if (doc.location.href.search(/\/Club\/Players\/\?TeamID=/i) == -1
			&& doc.location.href.search(/\/Club\/Players\/$/) == -1
			&& doc.location.href.search(/\/Club\/Players\/Oldies.aspx/) == -1
			&& doc.location.href.search(/\/Club\/Players\/Coaches.aspx/) == -1
			&& doc.location.href.search(/\/Club\/Players\/\?TeamID=/i) == -1
			&& doc.location.href.search(/\/Club\/NationalTeam\/NTPlayers.aspx/i) == -1) {
			// not the page we are looking for
			return null;
		}
		if (FoxtrickPrefs.getBool("ExtraPlayerslistInfo")) {
			var file = "file=players"; // default normal team
			var team = ""; // default own team
			var selection = ""; // default current players

			// determine xml file
			var teamid = doc.location.href.match(/teamid=(\d+)/i)[1];
			var Oldies = doc.location.href.search(/\/Club\/Players\/Oldies.aspx/i) != -1;
			var Coaches = doc.location.href.search(/\/Club\/Players\/Coaches.aspx/i) != -1;
			var NTplayers = doc.location.href.search(/\/Club\/NationalTeam\/NTPlayers.aspx/i) != -1;
			if (teamid) team = "&teamId="+teamid;
			if (Oldies) selection = "&actionType=viewOldies";
			if (Coaches) selection = "&actionType=viewOldCoaches";
			if (NTplayers) file = "file=nationalplayers&ShowAll=true&actiontype=supporterstats";

			var location = "http://" + doc.location.hostname + "/Community/CHPP/Players/chppxml.axd?" + file + team + selection;

			var cacheAge = (new Date()).getTime() - this.lastSuccessfulTime;
			if (this.lastSuccessfulXML === location && cacheAge < this.XMLExpiry) {
				// use cached XML
				Foxtrick.dump("Foxtrick.Pages.Players has cached " + location + ", reusing cache.\n");
				Foxtrick.dump("Cache age: " + cacheAge + "ms; will be reloaded after " + (this.XMLExpiry - cacheAge) + "ms.\n");
				return this.cachedXML;
			}
			else {
				Foxtrick.dump("Foxtrick.Pages.Players getting: " + location + "\n");
				// get players.xml
				try {
					var req = new XMLHttpRequest();
					req.open("GET", location, false);
					req.send(null);
					if (req.status == 200) {
						var error = req.responseXML.getElementsByTagName("Error");
						if (error.length == 0) {
							Foxtrick.dump("FileName: " + req.responseXML.getElementsByTagName("FileName")[0].textContent + "\n");
							Foxtrick.dump("Version: " + req.responseXML.getElementsByTagName("Version")[0].textContent + "\n");
							Foxtrick.dump("UserID: " + req.responseXML.getElementsByTagName("UserID")[0].textContent + "\n");
							Foxtrick.dump("ActionType: " + req.responseXML.getElementsByTagName("ActionType")[0].textContent + "\n");
							this.lastSuccessfulXML = location;
							this.lastSuccessfulTime = (new Date()).getTime();
							this.cachedXML = req.responseXML;
							return this.cachedXML;
						}
						else {
							Foxtrick.dump("Error: " + error[0].textContent+"\n");
							Foxtrick.dump("Server: " + req.responseXML.getElementsByTagName("Server")[0].textContent + "\n");
						}
					}
					else {
						Foxtrick.dump("Failure getting " + location + ", request status: " + req.status + ".\n");
					}
				}
				catch (e) {
					Foxtrick.dump("Failure getting " + location + ": " + e + "\n");
				}
			}
		}
		// In case of errors or ExtraPlayerslistInfo disabled, return null
		return null;
	}
};
