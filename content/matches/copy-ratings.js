/**
 * copy-ratings.js
 * Copies match ratings (HT-ML style)
 * @author spambot
 */

var FoxtrickCopyRatings = {

	MODULE_NAME : "CopyRatings",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : new Array('match'),

	NICE : 1,

	CSS : Foxtrick.ResourcePath + "resources/css/copy-ratings.css",
	CSS_SIMPLE : Foxtrick.ResourcePath + "resources/css/copy-ratings-simple.css",

	run : function(doc) {
		if (Foxtrick.Pages.Match.isPrematch(doc))
			return;

		var table = Foxtrick.Pages.Match.getRatingsTable(doc);
		if (!table)
			return;

		var createRatings = function(place, teams) {
			Foxtrick.log("Called with", place, teams);
			try {
				FoxtrickPrefs.setString("copyratings.teams", teams);
				if (place == "table")
					var insertBefore = doc.getElementById('mainBody').getElementsByTagName('h2')[0].parentNode;
				else if (place == "box")
					var insertBefore = doc.getElementById('foxtrick_addactionsbox_parentDiv');
				else {
					var insertBefore = doc.getElementsByTagName('h1')[0];
					doc.getElementsByClassName("ft-copy-ratings")[0].title = Foxtrickl10n.getString("CopyRatings." + teams);
	 			}
				var team1 = (teams == "both") || (teams == "home");
				var team2 = (teams == "both") || (teams == "away");

				var _d = Foxtrickl10n.getString("foxtrick.matchdetail.defence");
				var _m = Foxtrickl10n.getString("foxtrick.matchdetail.midfield");
				var _a = Foxtrickl10n.getString("foxtrick.matchdetail.attack");

				var headder = doc.getElementsByTagName('h1')[0].innerHTML;
				headder=Foxtrick.trim(headder);
				var start = Foxtrick.strrpos(headder, '<span>(') +7;
				var end = Foxtrick.strrpos(headder, ')</span>');

				var matchlink=doc.getElementById('mainWrapper').getElementsByTagName('h2')[0].getElementsByTagName('a')[0];
				var gameid = Foxtrick.util.id.getMatchIdFromUrl(matchlink.href);// headder.substr(start, end-start);

				start = Foxtrick.strrpos(headder, ' - ');
				var gameresult_h = Foxtrick.trim(headder.substr(start-2, 2));
				var gameresult_a = Foxtrick.trim(headder.substr(start+3, 2));

				var ad = '\n[table]\n';
				var table = doc.getElementById('mainBody').getElementsByTagName('h2')[0].parentNode.getElementsByTagName('table')[0].cloneNode(true);
				for (var row=0; row<table.rows.length; ++row) {
					if(!team1 && table.rows[row].cells.length>=2) table.rows[row].cells[1].innerHTML='###';
					if(!team2 && table.rows[row].cells.length>=3) table.rows[row].cells[2].innerHTML='###';
				}

				var youth = '';
				if (matchlink.href.search('isYouth=True')!=-1) youth = 'youth';

				for (var row = 0; row < table.rows.length; row ++) {
					if (row != table.rows.length-3 ) {
						try {
							// if ( table.rows[row].cells[1] && table.rows[row].cells[1].innerHTML.indexOf( '' ) != -1 ) {} else {
							//no hatstats detailes and no pic/mots/normal, i hope :)
							ad += '[tr]\n\n[th]';
							if ((table.rows[row].cells[0]) && row == 0) {
								ad += '['+ youth + 'matchid=' + gameid + ']';
							}
							else if (table.rows[row].cells[0]) {
								ad += table.rows[row].cells[0].textContent;
							}
							if (row == 0) ad += '[/th]\n[th]'; else ad += '[/th]\n[td]';
							if (table.rows[row].cells[1]) {
								if (row == 0) {
									var teamlink = table.rows[row].cells[1].getElementsByTagName('a')[0];
									if (teamlink)
										ad += teamlink.innerHTML + ((team2==true)?(' - ' + gameresult_h):'') + '[br]['+youth+'teamid='+Foxtrick.util.id.getTeamIdFromUrl(teamlink.href)+']';
								} else {
									ad += table.rows[row].cells[1].textContent.replace(_d, '[br]'+_d).replace(_m, '[br]'+_m).replace(_a, '[br]'+_a);
								}
							}
							if (row == 0) ad += '[/th]\n[th]'; else ad += '[/td]\n[td]';
							if (table.rows[row].cells[2]) {
								if (row == 0) {
									var teamlink = table.rows[row].cells[2].getElementsByTagName('a')[0];
									if (teamlink)
										ad += teamlink.innerHTML + ((team1==true)?(' - ' + gameresult_a):'') + '[br]['+youth+'teamid='+Foxtrick.util.id.getTeamIdFromUrl(teamlink.href)+']';
								} else {
									ad += table.rows[row].cells[2].textContent.replace(_d, '[br]'+_d).replace(_m, '[br]'+_m).replace(_a, '[br]'+_a);
								}
							}

							if (row == 0) ad += '[/th]\n\n[/tr]\n'; else ad += '[/td]\n\n[/tr]\n';
							// }

						} catch (e) {}
					}
				}
				ad = ad.replace(/\[td\]###\[\/td\]/gi,'');
				ad += '\n[/table]\n';

				if(!(team1 && team2)) {
					var ad_s = ad.split('[/tr]');
					for (var i = 0; i < ad_s.length; i++){
						if (i == 10) ad_s[i] = '[tr]';
						ad_s[i] = ad_s[i].replace(/\[th\]\[\/th\]/gi,'');
						ad_s[i] = ad_s[i].replace(/\[td\]\[\/td\]/gi,'');
					}
					ad = ad_s.join('[/tr]').replace(/\[tr\]\[\/tr\]/,'');
				}
				Foxtrick.copyStringToClipboard(ad);
				var note = Foxtrick.util.note.add(doc, insertBefore, "ft-ratings-copy-note", Foxtrickl10n.getString("CopyRatings.copied"), null, true);
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		// Copy links inside the table
		var tableHeader = table.parentNode.getElementsByClassName("tblBox")[0];
		var homeHeader = table.getElementsByTagName("th")[1];
		var awayHeader = table.getElementsByTagName("th")[2];

		var copyBoth = doc.createElement("span");
		copyBoth.className = "ft_copy_rating";
		copyBoth.appendChild(doc.createTextNode(Foxtrickl10n.getString("Copy")));
		copyBoth.title = Foxtrickl10n.getString("CopyRatings.both");
		copyBoth.setAttribute("teams", "both");
		copyBoth.setAttribute("place", "table");
		copyBoth.addEventListener("click", function() { createRatings("table", "both"); }, false);
		tableHeader.appendChild(copyBoth);

		var copyHome = doc.createElement("span");
		copyHome.className = "ft_copy_rating";
		copyHome.appendChild(doc.createTextNode("(" + Foxtrickl10n.getString("Copy") + ")"));
		copyHome.title = Foxtrickl10n.getString("CopyRatings.home");
		copyHome.setAttribute("teams", "home");
		copyHome.setAttribute("place", "table");
		copyHome.addEventListener("click", function() { createRatings("table", "home"); }, false);
		homeHeader.appendChild(copyHome);

		var copyAway = doc.createElement("span");
		copyAway.className = "ft_copy_rating";
		copyAway.appendChild(doc.createTextNode("(" + Foxtrickl10n.getString("Copy") + ")"));
		copyAway.title = Foxtrickl10n.getString("CopyRatings.away");
		copyAway.setAttribute("teams", "away");
		copyAway.setAttribute("place", "table");
		copyAway.addEventListener("click", function() { createRatings("table", "away"); }, false);
		awayHeader.appendChild(copyAway);

		var button = Foxtrick.util.copyButton.add(doc,
			Foxtrickl10n.getString("CopyRatings."
				+ FoxtrickPrefs.getString("copyratings.teams")));
		if (button) {
			Foxtrick.addClass(button, "ft-copy-ratings ft-pop-up-container");

			var versions=['both','home','away'];
			var list = doc.createElement("ul");
			list.className = "ft-pop";
			for (var j=0; j<versions.length; ++j) {
				var item = doc.createElement("li");
				var link = doc.createElement("span");
				link.addEventListener("click", (function(team) {
					// to keep team variable here
					return function() { createRatings("box", team); };
				})(versions[j]), false);
				link.setAttribute("teams", versions[j]);
				link.textContent = Foxtrickl10n.getString("CopyRatings."+versions[j]);
				item.appendChild(link);
				list.appendChild(item);
			}
			button.appendChild(list);
		}
	}
};
Foxtrick.util.module.register(FoxtrickCopyRatings);
