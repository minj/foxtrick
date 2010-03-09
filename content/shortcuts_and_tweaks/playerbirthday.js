/**
 * playerbirthday.js
 * show information about past and coming birthdays
 * @author jurosz
 */

 ////////////////////////////////////////////////////////////////////////////////
var FoxtrickPlayerBirthday = {

    MODULE_NAME : "PlayerBirthday",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('players','YouthPlayers'),
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8.9",
	LATEST_CHANGE:"Birthdaybox fixed for russian lang",

	init : function() {
	},

    run : function( page, doc ) {
	try {
		// array of players
		var birthdayToday = new Array();
		var birthdayFuture = new Array();
		var birthdayPast = new Array();

		var ClassPlayer = doc.getElementsByClassName('playerInfo');

		for (var i = 0; i < ClassPlayer.length; i++) {
			var player = {};
			// player name - if the player is national team player, the first <a> tag is a link to national team containing <img> tags
			var playerTag = ClassPlayer[i].getElementsByTagName('a')[0];
			if (playerTag.getElementsByTagName('img').length > 0) {
				player.playerName = ClassPlayer[i].getElementsByTagName('a')[1];    
			}
			else {
				player.playerName = ClassPlayer[i].getElementsByTagName('a')[0];
			}
			var playerInfo = ClassPlayer[i].getElementsByTagName('p')[0].innerHTML;
			if (playerInfo.search(/\<br\>/) != -1) { // player info (PlayerAge, form and stamina)
				playerInfo = playerInfo.substring(0, playerInfo.search(/\<br\>/)); // we need the first occurence
			}
			if (playerInfo.search(/^\s*TSI/) != -1) {
				playerInfo = playerInfo.replace(/.+,/,''); // In the language Vlaams, TSI and age are switched. This is a fix for that
			}
			var reg = /(\d+)\D+(\d+).+/; // regular expression for getting the PlayerAge, works with Czech format, for example "18 let a 11 dní"

			player.years = playerInfo.match(reg)[1];
			player.days = playerInfo.match(reg)[2];

			var regText=/(\d+\D+\d+\s\S+)/; // regular expression for getting the whole PlayerAge string
			var regTextRus=/(\D+\d+\D+\d+)/; // regular expression for getting the whole PlayerAge string, for rusian

			try {
				player.age = String(playerInfo.match(regText)[1]).replace(/,/,''); // try to get full age string
			}
			catch(e) {
				player.age=String(playerInfo.match(regTextRus)[1]).replace(/,/,''); // if not get russian version ie strings before the number
				//Foxtrick.dump('get russian age string '+player+'\n');				
			}

			if (player.days >= 0) {
				if (player.days == 0) { // players who have birthday today
					birthdayToday.push(player);
				}
				else if (player.days > 105) { // player who will have birthday in 7 days
					birthdayFuture.push(player);
				}
				else if (player.days < 7) { // player who had birthday 7 or fewer days ago
					birthdayPast.push(player);
				}
			}
		}

		// sorting of arrays according to days
		birthdayFuture.sort(this.sortByDays);
		birthdayPast.sort(this.sortByDays);

		var parentDiv = doc.createElement("div");
		parentDiv.id = "foxtrick_addactionsbox_parentDiv";

		FoxtrickPlayerBirthday.addType(parentDiv, Foxtrickl10n.getString('foxtrick.tweaks.BirthdayToday'), birthdayToday, doc);
		FoxtrickPlayerBirthday.addType(parentDiv, Foxtrickl10n.getString('foxtrick.tweaks.BirthdayNextWeek'), birthdayFuture, doc);
		FoxtrickPlayerBirthday.addType(parentDiv, Foxtrickl10n.getString('foxtrick.tweaks.BirthdayLastWeek'), birthdayPast, doc);

		// Append the box to the sidebar
		var newBoxId = "foxtrick_birthday_box";
		if (birthdayToday.length + birthdayFuture.length + birthdayPast.length > 0) {
			Foxtrick.addBoxToSidebar(doc, Foxtrickl10n.getString("foxtrick.tweaks.Birthdays"), parentDiv, newBoxId, "last", "");
		}
	}
	catch(e) {
		Foxtrick.dump('PlayerBirthday: ' + e + '\n');}
	},

	change : function( page, doc ) {
	},

	sortByDays : function (a, b) {
		// this should sort the array of players according to days
		return ((a.days < b.days) ? -1 : ((a.days > b.days) ? 1 : 0));
	},

	addType : function(parent, header, players, doc) {
		if (!players.length)
			return;
		var div = doc.createElement("div");
		var caption = doc.createElement("h5");
		var captionText = doc.createTextNode(header);
		var list = doc.createElement("ul");
		parent.appendChild(div);
		div.appendChild(caption);
		div.appendChild(list);
		caption.appendChild(captionText);

		for (var i in players) {
			var item = doc.createElement("li");
			var player = players[i].playerName.cloneNode(true);
			var age = doc.createTextNode(players[i].age);
			list.appendChild(item);
			item.appendChild(player);
			item.appendChild(age);
		}
	}
};
