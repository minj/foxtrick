"use strict";
/*
 * u20-lastmatch.js
 * Shows which would be the last official u20 match of a certain player.
 * @Author: rferromoreno
 */

Foxtrick.modules["U20LastMatch"] = {
  MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
  PAGES: ["youthPlayerDetails", "playerDetails", "allPlayers"],
  OPTIONS: [
		'YouthPlayers', 'SeniorPlayers', 'AllPlayers'
	],
  MATCHES_OFFSETS: [
    7,
    14,
    21,
    28,
    35,
    42,
    49,
    56,
    63,
    70,
    77,
    84,
    91,
    147,
    150,
    154,
    182,
    185,
    189,
    192,
    196,
    199,
    203,
    205,
    224
  ],

  romanize: function(num) {
    if (isNaN(num)) return "";
    var digits = String(+num).split(""),
      key = [
        "",
        "C",
        "CC",
        "CCC",
        "CD",
        "D",
        "DC",
        "DCC",
        "DCCC",
        "CM",
        "",
        "X",
        "XX",
        "XXX",
        "XL",
        "L",
        "LX",
        "LXX",
        "LXXX",
        "XC",
        "",
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX"
      ],
      roman = "",
      i = 3;
    while (i--) roman = (key[+digits.pop() + i * 10] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
  },

  calculate: function(age, doc) {
    var DAYS_IN_SEASON = Foxtrick.util.time.DAYS_IN_SEASON;
    var MSECS_IN_DAY = Foxtrick.util.time.MSECS_IN_DAY;
    var WORLD_CUP_DURATION = DAYS_IN_SEASON * 2;

    var playerAgeInDays = DAYS_IN_SEASON * age.years + age.days;
    var daysUntil21Years = DAYS_IN_SEASON * 21 - playerAgeInDays;

    var now = Foxtrick.util.time.getHTDate(doc);
    var dateWhenPlayerIs21 = Foxtrick.util.time.addDaysToDate(
      now,
      daysUntil21Years
    );

    // Round I, Match #1 of World Cup XXVI. (26/05/2017)
    var origin = Foxtrick.util.time.toHT(doc, new Date(2017, 4, 26));
    var msDiff = dateWhenPlayerIs21.getTime() - origin.getTime();
    var dayDiff = Math.floor(msDiff / MSECS_IN_DAY) - 1;

    var daysOffset = dayDiff % WORLD_CUP_DURATION;
    var worldCupOffset = Foxtrick.Math.div(dayDiff, WORLD_CUP_DURATION);
    var worldCupNumber = 26 + worldCupOffset;

    var index = 0;
    for (var i = 0; i < this.MATCHES_OFFSETS.length; i++) {
      if (daysOffset < this.MATCHES_OFFSETS[i]) {
        index = i;
        break;
      }
    }

    var ROUND1 = Foxtrick.L10n.getString("U20LastMatch.round").replace(/%1/, "I");
    var ROUND2 = Foxtrick.L10n.getString("U20LastMatch.round").replace(/%1/, "II");
    var ROUND3 = Foxtrick.L10n.getString("U20LastMatch.round").replace(/%1/, "III");
    var ROUND4 = Foxtrick.L10n.getString("U20LastMatch.round").replace(/%1/, "IV");
    var SEMI = Foxtrick.L10n.getString("U20LastMatch.semi");
    var FINAL = Foxtrick.L10n.getString("U20LastMatch.final");

    var MATCHES_DESCRIPTIONS = [
      ROUND1.replace(/%2/,"1"),
      ROUND1.replace(/%2/,"2"),
      ROUND1.replace(/%2/,"3"),
      ROUND1.replace(/%2/,"4"),
      ROUND1.replace(/%2/,"5"),
      ROUND1.replace(/%2/,"6"),
      ROUND1.replace(/%2/,"7"),
      ROUND1.replace(/%2/,"8"),
      ROUND1.replace(/%2/,"9"),
      ROUND1.replace(/%2/,"10"),
      ROUND1.replace(/%2/,"11"),
      ROUND1.replace(/%2/,"12"),
      ROUND1.replace(/%2/,"13"),
      ROUND1.replace(/%2/,"14"),
      ROUND2.replace(/%2/,"1"),
      ROUND2.replace(/%2/,"2"),
      ROUND2.replace(/%2/,"3"),
      ROUND3.replace(/%2/,"1"),
      ROUND3.replace(/%2/,"2"),
      ROUND3.replace(/%2/,"3"),
      ROUND4.replace(/%2/,"1"),
      ROUND4.replace(/%2/,"2"),
      ROUND4.replace(/%2/,"3"),
      SEMI,
      FINAL
    ];

    return {
      lastMatch: MATCHES_DESCRIPTIONS[index],
      worldCupNumber: worldCupNumber
    };
  },

  run: function(doc) {
    var module = this;
    if (Foxtrick.Pages.Player.wasFired(doc)) return;

    var isYouthPlayerDetailsPage = Foxtrick.isPage(doc, "youthPlayerDetails");
    var isSeniorPlayerDetailsPage = Foxtrick.isPage(doc, "playerDetails");
    var isAllPlayersPage = Foxtrick.isPage(doc, "allPlayers");

    var isYouthEnabled = Foxtrick.Prefs.isModuleOptionEnabled(
      "U20LastMatch",
      "YouthPlayers"
    );
    var isSeniorsEnabled = Foxtrick.Prefs.isModuleOptionEnabled(
      "U20LastMatch",
      "SeniorPlayers"
    );
    var isAllPlayersEnabled = Foxtrick.Prefs.isModuleOptionEnabled(
      "U20LastMatch",
      "AllPlayers"
    )

    // If the option isn't enabled for this page, don't show.
    if (isYouthPlayerDetailsPage && !isYouthEnabled) return;
    if (isSeniorPlayerDetailsPage && !isSeniorsEnabled) return;
    if (isAllPlayersPage && !isAllPlayersEnabled) return;

    if (isYouthPlayerDetailsPage || isSeniorPlayerDetailsPage) {
      var age = Foxtrick.Pages.Player.getAge(doc);
      if (age.years > 20) return;
  
      var result = module.calculate(age, doc);
  
      // Display the U20 Last Match information.
      var table = doc.querySelector(".playerInfo table");
      var row = Foxtrick.insertFeaturedRow(table, module, table.rows.length);
      var title = row.insertCell(0);
      Foxtrick.addClass(row, 'ft-u20-last-match');
      title.textContent = Foxtrick.L10n.getString("U20LastMatch.title");
      var lastMatch = row.insertCell(1);
      lastMatch.textContent = Foxtrick.L10n.getString("U20LastMatch.worldcup");
      lastMatch.textContent += module.romanize(result.worldCupNumber) + " - ";
      lastMatch.textContent += result.lastMatch;
    } else if (isAllPlayersPage) {
      var players = Foxtrick.modules.Core.getPlayerList();
			Foxtrick.forEach(function(player) {
        if (player.age.years > 20) return;
        
        var result = module.calculate(player.age, doc);

        var table = player.playerNode.querySelector('table');
        var container = Foxtrick.createFeaturedElement(doc, module, 'div');
        Foxtrick.addClass(row, 'ft-u20-last-match');
        container.textContent = Foxtrick.L10n.getString("U20LastMatch.title") +
          ' ' + Foxtrick.L10n.getString("U20LastMatch.worldcup") + 
          module.romanize(result.worldCupNumber) + ' - ' + result.lastMatch;

        var before = table.nextSibling;
        before.parentNode.insertBefore(container, before);
			}, players);
    }
  }
};
