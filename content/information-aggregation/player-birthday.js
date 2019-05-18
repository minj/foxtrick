/**
 * player-birthday.js
 * show information about past and coming birthdays
 * @author jurosz, ryanli
 */

'use strict';

Foxtrick.modules['PlayerBirthday'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['allPlayers', 'youthPlayers'],

	run: function(doc) {
		var DAYS_IN_WEEK = Foxtrick.util.time.DAYS_IN_WEEK;

		// array of players
		var birthdayToday = [];
		var birthdayFuture = [];
		var birthdayPast = [];

		var playerList = Foxtrick.modules.Core.getPlayerList();

		for (var i = 0; i < playerList.length; ++i) {
			if (typeof playerList[i].age !== 'undefined') {
				if (playerList[i].age.days === 0) {
					birthdayToday.push(playerList[i]);
				}
				else if (playerList[i].age.days > 105) {
					birthdayFuture.push(playerList[i]);
				}
				else if (playerList[i].age.days < DAYS_IN_WEEK) {
					birthdayPast.push(playerList[i]);
				}
			}
		}

		// sorting of arrays according to days and then years
		var sort = function(a, b) {
			var maxYears = 10000;
			return a.age.days * maxYears + a.age.years - (b.age.days * maxYears + b.age.years);
		};
		birthdayToday.sort(sort);
		birthdayFuture.sort(sort);
		birthdayPast.sort(sort);

		var parentDiv = Foxtrick.createFeaturedElement(doc, this, 'div');
		parentDiv.id = 'foxtrick_addactionsbox_parentDiv';

		var addType = function(parent, header, players) {
			if (players == null || players.length === 0)
				return;

			var div = doc.createElement('div');
			var caption = doc.createElement('h5');
			var captionText = doc.createTextNode(header);
			var list = doc.createElement('ul');
			parent.appendChild(div);
			div.appendChild(caption);
			div.appendChild(list);
			caption.appendChild(captionText);

			for (var i = 0; i < players.length; ++i) {
				var item = doc.createElement('li');
				var player = players[i].nameLink.cloneNode(true);
				var age = doc.createTextNode(' ' + players[i].ageText);
				list.appendChild(item);
				item.appendChild(player);
				item.appendChild(age);
			}
		};

		let today = Foxtrick.L10n.getString('PlayerBirthday.BirthdayToday');
		let nextWeek = Foxtrick.L10n.getString('PlayerBirthday.BirthdayNextWeek');
		let lastWeek = Foxtrick.L10n.getString('PlayerBirthday.BirthdayLastWeek');
		addType(parentDiv, today, birthdayToday);
		addType(parentDiv, nextWeek, birthdayFuture);
		addType(parentDiv, lastWeek, birthdayPast);

		// Append the box to the sidebar
		if (birthdayToday.length + birthdayFuture.length + birthdayPast.length > 0) {
			let header = Foxtrick.L10n.getString('PlayerBirthday.boxheader');
			Foxtrick.addBoxToSidebar(doc, header, parentDiv, 10);
		}
	},
};
