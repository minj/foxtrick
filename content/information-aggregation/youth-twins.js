"use strict";
/* youth-twins.js
 * Displays twin information for youth squad players using an API supplied by HY.
 * @author CatzHoek, HY backend/API by MackShot
 */

 Foxtrick.modules["YouthTwins"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ["YouthPlayers"],
	CSS : Foxtrick.InternalPath + "resources/css/youth-twins.css",
	OPTIONS : ["debug", "forceupdate", ["FakeUser", "HYUser", "HYForeigner"]],
	run : function(doc) { 
		var getYouthPlayerList = function (teamId, callback){
			var args = [];
			args.push(["file", "youthplayerlist"]);
			args.push(["youthTeamID", teamId]);
			args.push(["actionType", "details"]);
			args.push(["version", "1.0"]);
			Foxtrick.util.api.retrieve(doc, args,{ cache_lifetime:'session'}, callback);
		}
		var getYouthAvatars = function (callback){
			var args = [];
			args.push(["file", "youthavatars"]);
			args.push(["actionType", "1.0"]);
			Foxtrick.util.api.retrieve(doc, args,{ cache_lifetime:'session'}, callback);
		}
		//params
		//teamid : Current Foxtrick user
		//forceUpdate: Force HY to update, avoid!
		//debug: Fakes a reponse where twins will be present
		//callback: function to be called after HY was queried
		var getTwinsFromHY = function (teamid, forceupdate, debug, userType, callback){
			getYouthPlayerList(teamid, function(playerlist) {
				getYouthAvatars(function(avatars){
					var pl = encodeURIComponent((new XMLSerializer()).serializeToString(playerlist));
					var av = encodeURIComponent((new XMLSerializer()).serializeToString(avatars));
					var url = "http://stage.hattrick-youthclub.org/_admin/twins.php";
					var params = "players=" + pl + "&avatars=" + av;
					if(forceupdate)
						params = params + "&forceUpdate=1"

					//debug: Fakes a reponse where twins and such will be present
					if(debug)
						params = params + "&debug=1"

					//ability to fake if one guy is a hy user or not
					if(userType == "user")
						params = params + "&isHyUser=1"
					else if(userType == "foreigner")
						params = params + "&isHyUser=0"	
					else {
						//HY determines on its own
					}

					var http = new XMLHttpRequest();
					http.open("POST", url, true);

					//Send the proper header information along with the request
					http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

					//Call a function when the state changes.
					http.onreadystatechange = function() {
						if(http.readyState == 4){
							if(http.status == 200) {
								// 200, everything is fine
								callback(http.responseText);
							} else if(http.status == 400){
								// 400 with 2 different cases
								// - given data is not valid
								// - not all data is given
								// response json
								callback(null) 
							} else if(http.status == 404){
								// 404... HY is probably moving servers
								// or they are just 404ing
								callback(null)
							} else if(http.status == 500){
								// 500, HY is having problems
								callback(null)
							} else if(http.status == 503){
								// 503 service was temporarily disabled by HY
								callback(null)
							} else {
								callback(null)
							}
						}
					}
					http.send(params);
				});	
			});
		}
		var handleHyResponse = function (response){
			if(!response)
				return;

			var json = JSON.parse( response );
			var isHYuser = json.isHyUser;

			var playerInfos = doc.getElementsByClassName("playerInfo");
			for(var i = 0; i < playerInfos.length; i++){
				var playerInfo = playerInfos[i];
				var target = playerInfo.getElementsByTagName("b")[0];
				var playerID = playerInfo.getElementsByTagName("a")[0].href.match(/YouthPlayerID=(\d+)/i)[1];
				
				//new player pulled, needs a forceUpdate
				if(json.players[playerID] === undefined){
					Foxtrick.log("New player pulled", playerID);
					continue;
				}

				//icons for representation
				var icon_green = Foxtrick.InternalPath + 'resources/img/twin.png';
				var icon_red = Foxtrick.InternalPath + 'resources/img/twin_red.png'; 
				var icon_yellow = Foxtrick.InternalPath + 'resources/img/twin_yellow.png'; 

				//amounts of twins by category, for non hattrick youthclub users marked and non are not present
				var possible = parseInt(json.players[playerID].possible);
				var marked = isHYuser?parseInt(json.players[playerID].marked):0;
				var non = isHYuser?parseInt(json.players[playerID].non):0;
				var missing = possible - marked - non;
				
				if(isHYuser)
					var title = "This player has %1 possible twins.\nConfirmed twins: %2\nNon twins: %3\nUndecided: %4"
				else
					var title = "This player has %1 possible twins.\nYou could find out more about this player's potential using hattrick youthclub."
						
				title = title.replace("%1", possible).replace("%2", marked).replace("%3", non).replace("%4", missing)
				//repeat twin icon in representative color according to amount of twin category
				
				var container = Foxtrick.createFeaturedElement(doc, this, "div");
				Foxtrick.addClass(container, "ft-youth-twins-container");
				container.setAttribute("title", title);
				container.setAttribute("alt", title);

				//add icons according to amount of occurance
				var addIcons = function (parent, limit, alt, className, src){
					for(var k = 0; k < limit; k++){
						var image = Foxtrick.createImage(doc, { alt: alt, class: className, src: src}); 
						parent.appendChild(image);
					}
				}
				addIcons(container, marked, "Marked as Twin", "ft-youth-twins-icon", icon_green);
				addIcons(container, missing, "Not marked yet or undecided", "ft-youth-twins-icon", icon_yellow);
				addIcons(container, non, "Marked as Non-Twin", "ft-youth-twins-icon", icon_red);

				target.parentNode.insertBefore(container,target.nextSibling)
			}
		}
		var teamid = doc.location.href.match(/teamid=(\d+)/i)[1];

		//temporary debug settings
		var debug = FoxtrickPrefs.isModuleOptionEnabled("YouthTwins", "debug");

		var userType = "auto";

		var forceUpdate = FoxtrickPrefs.isModuleOptionEnabled("YouthTwins", "forceupdate");
		if(FoxtrickPrefs.isModuleOptionEnabled("YouthTwins", "FakeUser")){
			var forceUser = FoxtrickPrefs.isModuleOptionEnabled("YouthTwins", "HYUser");
			if(forceUser)
				userType = "user";
			var forceNonUser = FoxtrickPrefs.isModuleOptionEnabled("YouthTwins", "HYForeigner");
			if(forceNonUser)
				userType = "foreigner";
		}
		//teamid, forceUpdate, Debug, Callback	
		getTwinsFromHY(teamid, forceUpdate, debug, userType, handleHyResponse);
	
	}
};
