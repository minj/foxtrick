"use strict";
/**
 * ExtendedPlayerDetails
 * @desc displays wage without 20% bonus and time since player joined a team
 * @author spambot, ryanli
 */

Foxtrick.modules["ExtendedPlayerDetails"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : new Array('playerdetail'),
	RADIO_OPTIONS : new Array( "SWD", "SW", "SD", "WD", "D" ),

	run : function(doc) {
		this._Player_Joined(doc);
		
		// experiment: add language
		if (FoxtrickPrefs.isModuleOptionEnabled("ExtendedPlayerDetails", "Language")) {
			var addPlayerLanguage = function(playerid, node) {
				Foxtrick.Pages.Player.getPlayer(doc, playerid, function(player) {
					if (!player)
						return;
					if (player.PlayerLanguage) {
						var br = doc.createElement('br');
						br.className = 'clear';
						node.appendChild(br);
					
						var language = Foxtrick.createFeaturedElement(doc,Foxtrick.modules.ExtendedPlayerDetails, 'em');
						Foxtrick.addClass(language, 'shy');
						language.setAttribute('style', 'font-weight:normal; margin-left:5px;');
						language.textContent = player.PlayerLanguage;
						if (player.PlayerLanguageID)
							language.setAttribute('PlayerLanguageID', player.PlayerLanguageID);
						node.appendChild(language);
					}
				});
			};
			var id = Foxtrick.Pages.Player.getId(doc);
			var targetNode = doc.getElementById('mainBody').getElementsByClassName("byline")[0];
			console.log(id, targetNode)
			addPlayerLanguage(id, targetNode);
		}
	},

	_Player_Joined : function(doc) {
		// Player in team since...
		var processed = doc.getElementsByClassName("ft_since");
		if (processed.length > 0)
			return;

		var div = doc.getElementsByClassName("playerInfo")[0];
		if (!Foxtrick.util.id.findTeamId(div.getElementsByTagName('table')[0])) return; // player has no team

		var joined_elm = div.getElementsByClassName("shy")[0];

		var dateObj = Foxtrick.util.time.getDateFromText(joined_elm.textContent);
		var season_week = Foxtrick.util.time.gregorianToHT(dateObj);

		var htDate = Foxtrick.util.time.getHtDate(doc)

		var joined_s = Math.floor((htDate.getTime() - dateObj.getTime()) / 1000); //Sec

		var JoinedText = 'NaN';
		try {
			JoinedText = Foxtrick.util.time.timeDifferenceToText (joined_s , true);
		}
		catch(ee) {
			Foxtrick.dump('  JoinedText >' + ee + '\n');
		}

		if (JoinedText.search("NaN") == -1) {
			var part1 = Foxtrick.substr(joined_elm.innerHTML, 0, Foxtrick.strrpos( joined_elm.innerHTML, ")"));
			part1 = part1.replace('(', '<span class="shy smallText ft_since"><br>(');
			var ws = '';
			if (FoxtrickPrefs.isModuleEnabled("HTDateFormat")) 
				ws += '<span>('+ season_week.week + '/' + season_week.season + ')</span>, ';
			joined_elm.innerHTML = part1 + ' ' +ws + JoinedText + ')</span>';
			var span = joined_elm.getElementsByClassName('ft_since')[0];
			Foxtrick.makeFeaturedElement(span, this);
			if (span.getElementsByTagName('span')[0])
				Foxtrick.makeFeaturedElement(span.getElementsByTagName('span')[0], Foxtrick.modules.HTDateFormat);
		}
		else Foxtrick.dump('  Could not create jointime (NaN)\n');
	}
};

Foxtrick.modules["ExtendedPlayerDetailsWage"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : new Array('playerdetail'),
	OPTIONS : new Array( "WageWithoutBonus", "SeasonWage"),

	run : function(doc) {
		var div = doc.getElementById("ft_bonuswage");
		if (div != null) return;

		try {
			var div = doc.getElementsByClassName("playerInfo")[0];
			var wageElm = div.getElementsByTagName("table")[0].rows[2].cells[1];
		}
		catch (e) {
			// no such thing, return
			return;
		}
		if (!Foxtrick.util.id.findTeamId(div.getElementsByTagName('table')[0])) return; // player has no team

		var wageText = wageElm.textContent;
		var hasBonus = wageText.indexOf("%") > 0;

		// replace spaces in the currency to non-break spaces (U+00A0)
		var currency = Foxtrick.util.currency.getSymbol().replace(" ", "\u00a0");
		var currencyLen = currency.length;
		var splitPos = wageText.indexOf(currency) + currencyLen;
		var part1 = wageText.substr(0, splitPos);
		var part2 = wageText.substr(splitPos);

		var wage = parseInt(part1.replace(currency, "").replace(/\s/g, "").match(/\d+/)[0]);
		if (isNaN(wage))
			return;

		if (!hasBonus)
			var formattedWage = Foxtrick.formatNumber(wage, "&nbsp;");
		else {
			var reducedWage = Math.floor(wage / 1.2);
			var formattedWage = Foxtrick.formatNumber(reducedWage, "&nbsp;");
		}

		if (hasBonus && FoxtrickPrefs.isModuleOptionEnabled("ExtendedPlayerDetailsWage", "WageWithoutBonus")) {
			wageElm.innerHTML = part1
			+ '&nbsp;<span id="ft_bonuswage" style="direction: ltr !important; color:#666666; ">('
			+ formattedWage + '&nbsp;' + currency + ')</span> '
			+ part2;
			Foxtrick.makeFeaturedElement(doc.getElementById('ft_bonuswage'), this);
		}
		if (FoxtrickPrefs.isModuleOptionEnabled("ExtendedPlayerDetailsWage", "SeasonWage")) {
			wageElm.innerHTML += "<br><span id='ft_seasonwage'>"
				+ Foxtrick.formatNumber(wage * 16, "&nbsp;") + "&nbsp;"
				+ currency
				+ Foxtrickl10n.getString("foxtrick.ExtendedPlayerDetails.perseason")
				+ "</span>";
			Foxtrick.makeFeaturedElement(doc.getElementById('ft_seasonwage'), this);
		}
	}
};
