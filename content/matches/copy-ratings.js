/**
 * copy-ratings.js
 * Copies match ratings (HT-ML style)
 * @author spambot
 */

var FoxtrickCopyRatings = {

	MODULE_NAME : "CopyRatings",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : new Array('match'),

	run : function(doc) {
		var isprematch = (doc.getElementById("ctl00_ctl00_CPContent_CPMain_pnlPreMatch") !== null);
		if (isprematch) {
			return;
		}

		var table = Foxtrick.Pages.Match.getRatingsTable(doc);
		if (!table) {
			return;
		}

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
		copyBoth.addEventListener("click", this.createRatings, false);
		tableHeader.appendChild(copyBoth);

		var copyHome = doc.createElement("span");
		copyHome.className = "ft_copy_rating";
		copyHome.appendChild(doc.createTextNode("(" + Foxtrickl10n.getString("Copy") + ")"));
		copyHome.title = Foxtrickl10n.getString("CopyRatings.home");
		copyHome.setAttribute("teams", "home");
		copyHome.setAttribute("place", "table");
		copyHome.addEventListener("click", this.createRatings, false);
		homeHeader.appendChild(copyHome);

		var copyAway = doc.createElement("span");
		copyAway.className = "ft_copy_rating";
		copyAway.appendChild(doc.createTextNode("(" + Foxtrickl10n.getString("Copy") + ")"));
		copyAway.title = Foxtrickl10n.getString("CopyRatings.away");
		copyAway.setAttribute("teams", "away");
		copyAway.setAttribute("place", "table");
		copyAway.addEventListener("click", this.createRatings, false);
		awayHeader.appendChild(copyAway);

		if (FoxtrickPrefs.getBool("smallcopyicons")) {
			// Copy links on the header

			if (doc.getElementById("copyratings")) {
				return;
			}

			var boxHead = doc.getElementById('mainWrapper').getElementsByTagName('div')[1];
			if (boxHead.className != "boxHead") {
				return;
			}

			if (Foxtrick.util.layout.isStandard(doc)) {
				doc.getElementById("mainBody").style.paddingTop = "10px";
			}

			var copyBoth = doc.createElement("a");
			copyBoth.className = "inner copyicon copyratings";
			copyBoth.setAttribute('parent_id','copyratingsid');
			copyBoth.id = "copyratingsid";
			copyBoth.title = Foxtrickl10n.getString("CopyRatings."+FoxtrickPrefs.getString('copyratings.teams'));
			copyBoth.setAttribute("teams", FoxtrickPrefs.getString('copyratings.teams'));
			copyBoth.addEventListener("click", this.createRatings, false);
			var img = doc.createElement("img");
			img.src = "/Img/Icons/transparent.gif";
			copyBoth.appendChild(img);

			var span = doc.createElement("span");
			span.className = "ft-pop-up-container icon header ci_third";
			span.appendChild(copyBoth);

			var versions=['both','home','away'];
			var list = doc.createElement("ul");
			list.className = "ft-pop";
			for (var j=0; j<versions.length; ++j) {
				var item = doc.createElement("li");
				var link = doc.createElement("span");
				link.addEventListener("click", this.createRatings, false);
				link.setAttribute( "teams", versions[j]);
				link.textContent = Foxtrickl10n.getString("CopyRatings."+versions[j]);
				link.setAttribute('parent_id', 'copyratingsid');
				item.appendChild(link);
				list.appendChild(item);
			}

			span.appendChild(list);
			boxHead.insertBefore(span, boxHead.firstChild);

			}
		else {
			var parentDiv = doc.createElement("div");
			parentDiv.id = "foxtrick_addactionsbox_parentDiv";

			var copyBoth = doc.createElement("a");
			copyBoth.className = "inner";
			copyBoth.title = Foxtrickl10n.getString("CopyRatings.both");
			copyBoth.setAttribute("teams", "both");
			copyBoth.setAttribute("place", "box");
			copyBoth.addEventListener("click", this.createRatings, false);

			var img = doc.createElement("img");
			img.className = "ft_actionicon_large ft_copyMatchRatings";
			img.alt = Foxtrickl10n.getString("CopyRatings.both");
			img.src = "/Img/Icons/transparent.gif";
			copyBoth.appendChild(img);

			parentDiv.appendChild(copyBoth);

			var newBoxId = "foxtrick_actions_box";
			Foxtrick.addBoxToSidebar(doc,
				Foxtrickl10n.getString("foxtrick.tweaks.actions"),
				parentDiv, newBoxId, "first", "");

			var copyHome = doc.createElement("a");
			copyHome.className = "inner";
			copyHome.title = Foxtrickl10n.getString("CopyRatings.home");
			copyHome.setAttribute("place", "box");
			copyHome.setAttribute("teams", "home");
			copyHome.addEventListener("click", this.createRatings, false);

			var img = doc.createElement("img");
			img.className = "ft_actionicon_large ft_copyHomeRatings";
			img.alt = Foxtrickl10n.getString("CopyRatings.home");
			img.src = "/Img/Icons/transparent.gif"; 
			copyHome.appendChild(img);

			parentDiv.appendChild(copyHome);

			var newBoxId = "foxtrick_actions_box";
			Foxtrick.addBoxToSidebar(doc,
				Foxtrickl10n.getString("foxtrick.tweaks.actions"),
				parentDiv, newBoxId, "first", "");

			var copyAway = doc.createElement("a");
			copyAway.className = "inner";
			copyAway.title = Foxtrickl10n.getString("CopyRatings.away");
			copyAway.setAttribute("place", "box");
			copyAway.setAttribute("teams", "away");
			copyAway.addEventListener("click", this.createRatings, false);

			var img = doc.createElement("img");
			img.className = "ft_actionicon_large ft_copyAwayRatings";
			img.alt = Foxtrickl10n.getString("CopyRatings.both");
			img.src = "/Img/Icons/transparent.gif";
			copyAway.appendChild(img);

			parentDiv.appendChild(copyAway);

			var newBoxId = "foxtrick_actions_box";
			Foxtrick.addBoxToSidebar(doc,
				Foxtrickl10n.getString("foxtrick.tweaks.actions"),
				parentDiv, newBoxId, "first", "");
		}
	},

	createRatings : function(ev) {
		try {
			var doc = ev.target.ownerDocument;

			if (ev.currentTarget.getAttribute("place")=="table") {
				var insertBefore = doc.getElementById('mainBody').getElementsByTagName('h2')[0].parentNode;
			}
			else if (ev.currentTarget.getAttribute("place")=="box") {
				var insertBefore = doc.getElementById('foxtrick_addactionsbox_parentDiv');
			}
			else {
				var insertBefore = doc.getElementsByTagName('h1')[0];
				FoxtrickPrefs.setString('copyratings.teams',ev.currentTarget.getAttribute("teams"));
				doc.getElementById(ev.currentTarget.getAttribute("parent_id")).title = Foxtrickl10n.getString("CopyRatings."+FoxtrickPrefs.getString('copyratings.teams'));
 			}
			var team1 = (ev.currentTarget.getAttribute("teams") == "both" || ev.currentTarget.getAttribute("teams") == "home");
			var team2 = (ev.currentTarget.getAttribute("teams") == "both" || ev.currentTarget.getAttribute("teams") == "away");

			var _d = Foxtrickl10n.getString("foxtrick.matchdetail.defence" );
			var _m = Foxtrickl10n.getString("foxtrick.matchdetail.midfield" );
			var _a = Foxtrickl10n.getString("foxtrick.matchdetail.attack" );

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
			//if (Foxtrick.strrpos(table.rows[0].cells[1].innerHTML, 'isYouth=True')) youth = 'youth';
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
	}
};
Foxtrick.util.module.register(FoxtrickCopyRatings);
