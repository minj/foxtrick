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
  DATE_CUTOFFS: [
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
    for (var i = 0; i < this.DATE_CUTOFFS.length; i++) {
      if (daysOffset < this.DATE_CUTOFFS[i]) {
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

    // Load the Match descriptions array.
    var MATCHES_DESCRIPTIONS = [];
    for (var i=1; i<15; i++) {
      MATCHES_DESCRIPTIONS.push(ROUND1.replace(/%2/,String(i)));
    }
    for (var i=1; i<4; i++) {
      MATCHES_DESCRIPTIONS.push(ROUND2.replace(/%2/,String(i)));
    }
    for (var i=1; i<4; i++) {
      MATCHES_DESCRIPTIONS.push(ROUND3.replace(/%2/,String(i)));
    }
    for (var i=1; i<4; i++) {
      MATCHES_DESCRIPTIONS.push(ROUND4.replace(/%2/,String(i)));
    }
    MATCHES_DESCRIPTIONS.push(SEMI);
    MATCHES_DESCRIPTIONS.push(FINAL);

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
      var lastMatchText = Foxtrick.L10n.getString("U20LastMatch.templateWithTable");
      lastMatchText = lastMatchText.replace(/%1/,Foxtrick.L10n.getString("U20LastMatch.worldcup"));
      lastMatchText = lastMatchText.replace(/%2/,Foxtrick.decToRoman(result.worldCupNumber));
      lastMatchText = lastMatchText.replace(/%3/,result.lastMatch);
      lastMatch.textContent = lastMatchText;
    } else if (isAllPlayersPage) {
      var players = Foxtrick.modules.Core.getPlayerList();
			Foxtrick.forEach(function(player) {
        if (player.age.years > 20) return;
        
        var result = module.calculate(player.age, doc);

        var table = player.playerNode.querySelector('table');
        var container = Foxtrick.createFeaturedElement(doc, module, 'div');
        Foxtrick.addClass(row, 'ft-u20-last-match');
        var containerText = Foxtrick.L10n.getString("U20LastMatch.templateWithoutTable");
        containerText = containerText.replace(/%1/,Foxtrick.L10n.getString("U20LastMatch.title"));
        containerText = containerText.replace(/%2/,Foxtrick.L10n.getString("U20LastMatch.worldcup"));
        containerText = containerText.replace(/%3/,Foxtrick.decToRoman(result.worldCupNumber));
        containerText = containerText.replace(/%4/,result.lastMatch);
        container.textContent = containerText;
        var before = table.nextSibling;
        before.parentNode.insertBefore(container, before);
			}, players);
    }
  }
};
