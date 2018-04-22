"use strict";
/*
 * u20-lastmatch.js
 * Shows which would be the last official u20 match of a certain player.
 * @Author: rferromoreno
 */

Foxtrick.modules["U20LastMatch"] = {
  MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
  PAGES: ["youthPlayerDetails", "playerDetails", "allPlayers"],
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

    var MATCHES_DESCRIPTIONS = [
      Foxtrick.L10n.getString("U20LastMatch.round1") + " - #1",
      Foxtrick.L10n.getString("U20LastMatch.round1") + " - #2",
      Foxtrick.L10n.getString("U20LastMatch.round1") + " - #3",
      Foxtrick.L10n.getString("U20LastMatch.round1") + " - #4",
      Foxtrick.L10n.getString("U20LastMatch.round1") + " - #5",
      Foxtrick.L10n.getString("U20LastMatch.round1") + " - #6",
      Foxtrick.L10n.getString("U20LastMatch.round1") + " - #7",
      Foxtrick.L10n.getString("U20LastMatch.round1") + " - #8",
      Foxtrick.L10n.getString("U20LastMatch.round1") + " - #9",
      Foxtrick.L10n.getString("U20LastMatch.round1") + " - #10",
      Foxtrick.L10n.getString("U20LastMatch.round1") + " - #11",
      Foxtrick.L10n.getString("U20LastMatch.round1") + " - #12",
      Foxtrick.L10n.getString("U20LastMatch.round1") + " - #13",
      Foxtrick.L10n.getString("U20LastMatch.round1") + " - #14",
      Foxtrick.L10n.getString("U20LastMatch.round2") + " - #1",
      Foxtrick.L10n.getString("U20LastMatch.round2") + " - #2",
      Foxtrick.L10n.getString("U20LastMatch.round2") + " - #3",
      Foxtrick.L10n.getString("U20LastMatch.round3") + " - #1",
      Foxtrick.L10n.getString("U20LastMatch.round3") + " - #2",
      Foxtrick.L10n.getString("U20LastMatch.round3") + " - #3",
      Foxtrick.L10n.getString("U20LastMatch.round4") + " - #1",
      Foxtrick.L10n.getString("U20LastMatch.round4") + " - #2",
      Foxtrick.L10n.getString("U20LastMatch.round4") + " - #3",
      Foxtrick.L10n.getString("U20LastMatch.semi"),
      Foxtrick.L10n.getString("U20LastMatch.final")
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
      "YouthPlayersDetails"
    );
    var isSeniorsEnabled = Foxtrick.Prefs.isModuleOptionEnabled(
      "U20LastMatch",
      "SeniorPlayersDetails"
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
