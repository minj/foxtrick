"use strict";
/**
 * stars-counter.js
 * Count stars in match lineup page
 * @author larsw84, ryanli
 */

Foxtrick.modules["StarsCounter"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : new Array("matchLineup" ,"match"),
	CSS : Foxtrick.InternalPath +"resources/css/stars-counter.css",
	run : function(doc) {
		if(Foxtrick.isPage("matchLineup", doc))
			this.runMatchLineup(doc);
		else if(Foxtrick.isPage("match", doc))
			this.runMatch(doc);
	},

	runMatchLineup : function(doc){
		var yellow = 0;
		var brown = 0;
		var red = 0;
		var blue = 0;

		var imgToStars = {
			"star_big_yellow.png" : { yellow : 5 },
			"star_yellow.png" : { yellow : 1 },
			"star_brown.png" : { brown : 1 },
			"star_red.png" : { red : 1 },
			"star_yellow_to_brown.png" : { yellow : 0.5, brown : 0.5 },
			"star_yellow_to_brown_rtl.png" : { yellow : 0.5, brown : 0.5 },
			"star_yellow_to_red.png" : { yellow : 0.5, red : 0.5 },
			"star_yellow_to_red_rtl.png" : { yellow : 0.5, red : 0.5 },
			"star_half_yellow.png" : { yellow : 0.5 },
			"star_half_yellow_rtl.png" : { yellow : 0.5 },
			"star_half_brown.png" : { brown : 0.5 },
			"star_half_brown_rtl.png" : { brown : 0.5 },
			"star_half_red.png" : { red : 0.5 },
			"star_half_red_rtl.png" : { red : 0.5 },
			"star_big_blue.png" : { blue : 5 },
			"star_blue.png" : { blue : 1 },
			"star_half_blue.png" : { blue : 0.5 },
			"star_half_blue_rtl.png" : { blue : 0.5 }
		};

		// get information from the page
		var images = doc.getElementsByTagName("img");
		for (var i = 0; i < images.length; ++i) {
			var img = images[i];
			// don't count substituted players
			if (!Foxtrick.hasClass(img.parentNode.parentNode.parentNode, "substitute_holder")) {
				for (var src in imgToStars) {
					if (img.src.match(RegExp(src, "i"))) {
						if (imgToStars[src].yellow) {
							yellow += imgToStars[src].yellow;
						}
						if (imgToStars[src].brown) {
							brown += imgToStars[src].brown;
						}
						if (imgToStars[src].red) {
							red += imgToStars[src].red;
						}
						if (imgToStars[src].blue) {
							blue += imgToStars[src].blue;
						}
					}
				}
			}
		}

		// add the information to the page
		var mainBody = doc.getElementById("mainBody");
		var container = Foxtrick.createFeaturedElement(doc, this, "p");
		mainBody.appendChild(container);
		var title = doc.createElement("strong");
		title.appendChild(doc.createTextNode(Foxtrickl10n.getString("matches.lineup.totalStars") + ": "));
		container.appendChild(title);
		if (blue) {
			// meaning it's a youth team
			container.appendChild(doc.createTextNode(blue));
		}
		else if (yellow || brown || red) {
			container.appendChild(doc.createTextNode(yellow + brown + red));
			var detailed = doc.createElement("span");
			container.appendChild(detailed);
			detailed.appendChild(doc.createTextNode("("));
			var count = doc.createElement("span");
			var percentage = doc.createElement("span");
			detailed.appendChild(count);
			detailed.appendChild(doc.createTextNode(" / "));
			detailed.appendChild(percentage);
			detailed.appendChild(doc.createTextNode(")"));
			var firstStar = true; // if it's not the first star, add " + "
			if (yellow) {
				count.appendChild(doc.createTextNode(yellow));
				count.appendChild(this._getStar(doc, "yellow"));
				percentage.appendChild(doc.createTextNode(Math.round(100 * yellow / (yellow + brown + red)) + "%"));
				percentage.appendChild(this._getStar(doc, "yellow"));
				firstStar = false;
			}
			if (brown) {
				if (!firstStar) {
					count.appendChild(doc.createTextNode(" + "));
					percentage.appendChild(doc.createTextNode(" + "));
					firstStar = false;
				}
				count.appendChild(doc.createTextNode(brown));
				count.appendChild(this._getStar(doc, "brown"));
				percentage.appendChild(doc.createTextNode(Math.round(100 * brown / (yellow + brown + red)) + "%"));
				percentage.appendChild(this._getStar(doc, "brown"));
			}
			if (red) {
				if (!firstStar) {
					count.appendChild(doc.createTextNode(" + "));
				}
				count.appendChild(doc.createTextNode(red));
				count.appendChild(this._getStar(doc, "red"));
				percentage.appendChild(doc.createTextNode(Math.round(100 * red / (yellow + brown + red)) + "%"));
				percentage.appendChild(this._getStar(doc, "red"));
			}
		}
		else {
			// walk-overs have no stars
			container.appendChild(doc.createTextNode("0"));
		}
	},

	_getStar : function(doc, colour) {
		var star = doc.createElement("img");
		star.className = "starWhole";
		star.alt = star.title = "*";
		star.src = "/Img/Matches/star_" + colour + ".png";
		return star;
	},

	runMatch : function(doc){

		var getStars = function(doc, where){
			var stars = 0;
			var ratings = doc.querySelectorAll('.playersField > .playerBox'+ where +' > .playerRating');  //
			for(var i=0; i < ratings.length; i++){
				var id = Foxtrick.Pages.Players.getPlayerId(ratings[i].parentNode);
				stars += Number(ratings[i].textContent);
			}
			return stars;
		}
		var starsHome = getStars(doc, "Home");
		var starsAway = getStars(doc, "Away");

		var displayHome = doc.getElementsByClassName("playerRating")[0].cloneNode(true);
		var displayAway = displayHome.cloneNode(true);

		displayHome.getElementsByTagName("span")[0].textContent = '\u2211 ' + starsHome;
		displayAway.getElementsByTagName("span")[0].textContent = '\u2211 ' + starsAway;

		doc.getElementById("playersField").appendChild(displayHome);
		doc.getElementById("playersField").appendChild(displayAway);

		Foxtrick.addClass(displayHome, "ft-stars-counter-sum-home");
		Foxtrick.addClass(displayAway, "ft-stars-counter-sum-away");
	},

	change : function(doc){
		if(Foxtrick.isPage("match", doc))
			this.runMatch(doc);
	}
};
