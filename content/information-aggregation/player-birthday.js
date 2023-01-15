/**
 * player-birthday.js
 * show information about past and coming birthdays
 * @author jurosz, ryanli
 */

'use strict';

Foxtrick.modules.PlayerBirthday = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['allPlayers', 'youthPlayers'],

	/** @param {document} doc */
	run: function(doc) {
		const module = this;
		var DAYS_IN_WEEK = Foxtrick.util.time.DAYS_IN_WEEK;

		// array of players
		var birthdayToday = [];
		var birthdayFuture = [];
		var birthdayPast = [];

		var playerList = Foxtrick.modules.Core.getPlayerList();
		if (!playerList)
			return;

		for (let player of playerList) {
			if (typeof player.age !== 'undefined') {
				if (player.age.days === 0)
					birthdayToday.push(player);
				// eslint-disable-next-line no-magic-numbers
				else if (player.age.days > 105)
					birthdayFuture.push(player);
				else if (player.age.days < DAYS_IN_WEEK)
					birthdayPast.push(player);
			}
		}

		// sorting of arrays according to days and then years
		/**
		 * @param  {Player} a
		 * @param  {Player} b
		 * @return {number}
		 */
		var sort = function(a, b) {
			// TODO refactor
			var maxYears = 10000;
			let aDays = a.age.days * maxYears + a.age.years;
			let bDays = b.age.days * maxYears + b.age.years;
			return aDays - bDays;
		};
		birthdayToday.sort(sort);
		birthdayFuture.sort(sort);
		birthdayPast.sort(sort);

		var parentDiv = Foxtrick.createFeaturedElement(doc, module, 'div');
		parentDiv.id = 'foxtrick_addactionsbox_parentDiv';

		/**
		 * @param {HTMLElement} parent
		 * @param {string} header
		 * @param {Player[]} players
		 */
		var addType = function(parent, header, players) {
			if (players == null || players.length === 0)
				return;

			var list = doc.createElement('ul');

			let div = doc.createElement('div');
			let caption = doc.createElement('h5');
			let captionText = doc.createTextNode(header);
			parent.appendChild(div);
			div.appendChild(caption);
			div.appendChild(list);
			caption.appendChild(captionText);

			for (let player of players) {
				let item = doc.createElement('li');
				let playerLink = Foxtrick.cloneElement(player.nameLink, true);
				let age = doc.createTextNode(' ' + player.ageText);
				list.appendChild(item);
				item.appendChild(playerLink);
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
