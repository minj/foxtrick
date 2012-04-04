"use strict";
/* players.js
 * Utilities on players page
 * @author convincedd, ryanli
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
				
				
				while(target.nextSibling && target.nextSibling.tagName == "IMG"){
					target = target.nextSibling;
				}

				var icon_green = Foxtrick.InternalPath + 'resources/img/twin.png';
				var icon_red = Foxtrick.InternalPath + 'resources/img/twin_red.png'; 
				var icon_black = Foxtrick.InternalPath + 'resources/img/twin_black.png'; 

				var possible = parseInt(json.players[playerID].possible);
				var marked = parseInt(json.players[playerID].marked);
				var non = parseInt(json.players[playerID].non);

				var title = "This player has %1 possible twins. You marked "
				for(var k = possible; k > 0; k--){
					if(k <= marked){
						var image = Foxtrick.createImage(doc, { alt: "alt", title: "title", class: "ft-youth-twins-icon", src: icon_green}); 
						target.parentNode.insertBefore(image,target.nextSibling);
					} else if (k <= marked+ non) {
						var image = Foxtrick.createImage(doc, { alt: "alt", title: "title", class: "ft-youth-twins-icon", src: icon_red}); 
						target.parentNode.insertBefore(image,target.nextSibling);
					} else {
						var image = Foxtrick.createImage(doc, { alt: "alt", title: "title", class: "ft-youth-twins-icon", src: icon_black}); 
						target.parentNode.insertBefore(image,target.nextSibling);
					}
				}
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
