/**
 * playerbirthday.js
 * show information about past and coming birthdays
 * @author jurosz
 */

 ////////////////////////////////////////////////////////////////////////////////
var FoxtrickPlayerBirthday = {

    MODULE_NAME : "PlayerBirthday",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : true,

    init : function() {
        Foxtrick.registerPageHandler( 'players',
                                        FoxtrickPlayerBirthday );
        Foxtrick.registerPageHandler( 'YouthPlayers',
                                        FoxtrickPlayerBirthday );
   },
    
    run : function( page, doc ) { 
	try {
		var ArrayPlayers = new Array();      // arrays
		var ArrayPlayersLate = new Array();

		var a = 0;      // indexes
		var b = 0;

		var ClassPlayer = doc.getElementsByClassName('playerInfo');

		for (var i = 0; i < ClassPlayer.length; i++) {
			var PlayerName = Array();
      var Player = ClassPlayer[i].getElementsByTagName('a')[0];
      if (Player.getElementsByTagName('img').length > 0) {
        PlayerName[i] = ClassPlayer[i].getElementsByTagName('a')[1];    // player name - if the player is national team player, the first <a> tag is a link to national team containing <img> tags
      } else {
        PlayerName[i] = ClassPlayer[i].getElementsByTagName('a')[0];    // player name
      }
			PlayerInfo = ClassPlayer[i].getElementsByTagName('p')[0].innerHTML;
			if (PlayerInfo.search(/\<br\>/) !=-1) PlayerInfo=PlayerInfo.match(/.+\<br\>/i)[0];       // player info (PlayerAge, form and stamina)
			var reg=/(\d+)\D+(\d+).+/; // regular expression for getting the PlayerAge, works with Czech format, for example "18 let a 11 dní"

			if (PlayerInfo.search(/^\s+TSI/) != -1) PlayerInfo=PlayerInfo.replace(/.+,/,''); // In the language Vlaams, TSI and age are switched. This is a fix for that
			
			var PlayerAge = PlayerInfo.match(reg);

			var regText=/(\d+\D+\d+\s\S+)/; // regular expression for getting the whole PlayerAge string
			
			var TextAgeTmp=String(PlayerInfo.match(regText)[1]).replace(/,/,'');

			if (PlayerAge[2]>105 || PlayerAge[2] == 0) {     // player who will have birthday in 7 days or who have birthday today
				ArrayPlayers[a] = new Array(5); //dump(PlayerName[i]+' '+PlayerAge[2]+'\n');
				ArrayPlayers[a][1] = PlayerName[i];            // player's name
				ArrayPlayers[a][2] = PlayerAge[1];             // player's PlayerAge (years)
				ArrayPlayers[a][3] = PlayerAge[2];             // player's PlayerAge (days)
				ArrayPlayers[a][4] = TextAgeTmp             // player's PlayerAge (days)
				a++;
			}
			if (PlayerAge[2]<7 && PlayerAge[2] > 0) {        // player who had birthday 7 or fewer days ago
				ArrayPlayersLate[b] = new Array(5);
				ArrayPlayersLate[b][1] = PlayerName[i];
				ArrayPlayersLate[b][2] = PlayerAge[1];
				ArrayPlayersLate[b][3] = PlayerAge[2];
				ArrayPlayersLate[b][4] = TextAgeTmp;
				b++;
			}
		}

		ArrayPlayers.sort(sortMultiDimensional);     // sorting of arrays according to days
		ArrayPlayersLate.sort(sortMultiDimensional);

		var parentDiv = doc.createElement("div");
		parentDiv.id = "foxtrick_addactionsbox_parentDiv";

		var newBR = doc.createElement('br');

		var newDiv = doc.createElement("div");   // DIV with players who WILL HAVE birthday
		var newStrong = doc.createElement("strong");
		var newStrongText = doc.createTextNode(Foxtrickl10n.getString( 'foxtrick.tweaks.BirthdayNextWeek' ));
		newStrong.appendChild(newStrongText);
		newDiv.appendChild(newStrong);
		newDiv.appendChild(newBR);

		for (var i = 0; i < ArrayPlayers.length; i++) {
			var player =ArrayPlayers[i][1].cloneNode(true);
			player.setAttribute('style','padding: 2px 0 0 0;');
			newDiv.appendChild(player);
			var newT = doc.createTextNode(ArrayPlayers[i][4]);
			var newSpan = doc.createElement('span');
			newSpan.setAttribute('class',"smallText");
			newSpan.appendChild(newT);
			newDiv.appendChild(newSpan);
			var newBR = doc.createElement('br');
			newDiv.appendChild(newBR);
		}
		if (ArrayPlayers.length>0) parentDiv.appendChild(newDiv);


		var newDivLate = doc.createElement("div");   // DIV with players who HAD birthday
		var newStrongLate = doc.createElement("strong");
		var newStrongTextLate = doc.createTextNode(Foxtrickl10n.getString( 'foxtrick.tweaks.BirthdayLastWeek' ));
		newStrongLate.appendChild(newStrongTextLate);
		var newBR = doc.createElement('br');
		newDivLate.appendChild(newBR);
		newDivLate.appendChild(newStrongLate);
		var newBR = doc.createElement('br');
		newDivLate.appendChild(newBR);

		for (var i = 0; i < ArrayPlayersLate.length; i++) {
			var player =ArrayPlayersLate[i][1].cloneNode(true);
			player.setAttribute('style','padding: 2px 0 0 0;');
			newDivLate.appendChild(player);
			var newT = doc.createTextNode(ArrayPlayersLate[i][4]);
			var newSpan = doc.createElement('span');
			newSpan.setAttribute('class',"smallText");
			newSpan.appendChild(newT);
			newDivLate.appendChild(newSpan);
			var newBR = doc.createElement('br');
			newDivLate.appendChild(newBR);
		}
		
		if (ArrayPlayersLate.length>0) parentDiv.appendChild(newDivLate);
		
		// Append the box to the sidebar
		var newBoxId = "foxtrick_actions_box";
		if (ArrayPlayers.length+ArrayPlayersLate.length>0) Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString( 
			"foxtrick.tweaks.Birthdays" ), parentDiv, newBoxId, "last", "");
	}catch(e) {dump('PlayerBirthday: '+e+'\n');}
	},
	
	change : function( page, doc ) {
	},	
};

function sortMultiDimensional(a,b)
{
    // this should sort the array of players according to days
    return ((a[3] < b[3]) ? -1 : ((a[3] > b[3]) ? 1 : 0));
}
