"use strict";
/* youth-twins.js
 * Displays twin information for youth squad players using an API supplied by HY.
 * @author CatzHoek, HY backend/API by MackShot
 *
 * @Interface:
 * 		Url: http://www.hattrick-youthclub.org/_admin/twins.php
 * @params:
 * 		forceUpdate (optional):
 *			no param requred but send = 1 for safety reasons
 *			forces HY to recalculate results, should only be used after a new player was pulled onto the youth squad or if it is really required
 * 		debug (optional):
 *			no param requred but send = 1 for safety reasons
 *			force ht to return a random result so developers can check stuff without having actual twins
 *		players:
 *			urlencoded version of youthplayerlist chpp file v1.0 with actiontype = "details"
 *		avatars:
 *			urlencoded version of youthavatars chpp file v1.0
 *		isHyUser (0/1) (optional):
 *			used to simulate HY users or non-HY users for debugging purposes
 *			if not present HY will find out the correct value itself
 *
 * @response
 *		JSON:
 *			isHyUser (true / false)
 *				the user is using HY already
 *			players: (dictionary)
 *				list of players
 *				non: number of possible twins marked as non-twin
 *				marked: number of possible twins marked as twin
 *				possible: total number of possible twins
 *			fetchTime: 
 *				Unix timestamp of the feteched information
 *			lifeTime:
 *				LifeTime of the information in seconds, avoid further requests until fetchTime+lifeTime is met, new pulls to the youth team are a valid reason to disrespect and use forceUpdate. *
 */

 Foxtrick.modules["YouthTwins"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ["YouthPlayers"],
	CSS : Foxtrick.InternalPath + "resources/css/youth-twins.css",
	//OPTIONS : ["debug", "forceupdate"],
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
			args.push(["version", "1.0"]);
			Foxtrick.util.api.retrieve(doc, args,{ cache_lifetime:'session'}, callback);
		}
		//params
		//teamid : Current Foxtrick user
		//forceUpdate: Force HY to update, avoid!
		//debug: Fakes a reponse where twins will be present
		//callback: function to be called after HY was queried
		var getTwinsFromHY = function (teamid, forceupdate, debug, callback, errorFunc){
			getYouthPlayerList(teamid, function(playerlist) {
				getYouthAvatars(function(avatars){
					//urlencode xml files
					var pl = encodeURIComponent((new XMLSerializer()).serializeToString(playerlist));
					var av = encodeURIComponent((new XMLSerializer()).serializeToString(avatars));
					
					//api url
					var url = "http://www.hattrick-youthclub.org/_admin/twins.php";
					
					//assemble param string
					var params = "players=" + pl + "&avatars=" + av;
					
					//forceUpdate to avoid getting the cached HY response, use carefully
					if(forceupdate)
						params = params + "&forceUpdate=1"

					//debug: Fakes a random reponse where twins will be present
					if(debug)
						params = params + "&debug=1"

					//ability to fake if the user is a hy user or not, influeces response of "marked and non"
					if(userType == "user")
						params = params + "&isHyUser=1"
					else if(userType == "foreigner")
						params = params + "&isHyUser=0"	
					else {
						//HY determines on its own
					}

					//build actual request
					var http = new XMLHttpRequest();
					http.open("POST", url, true);

					//Send the proper header information along with the request
					http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

					//Call a function when the state changes.
					http.onreadystatechange = function() {
						if(http.readyState == 4){
							if(http.status == 200) {
								// 200, everything is fine
								if(callback)
									callback(http.responseText);
							} else if(http.status == 400){
								// 400 with 2 different cases
								// - given data is not valid
								// - not all data is given
								// response json
								if(errorFunc)
									errorFunc(http) 
							} else if(http.status == 404){
								// 404... HY is probably moving servers
								// or they are just 404ing
								if(errorFunc)
									errorFunc(http) 
							} else if(http.status == 500){
								// 500, HY is having problems
								if(errorFunc)
									errorFunc(http) 
							} else if(http.status == 503){
								// 503 service was temporarily disabled by HY
								if(errorFunc)
									errorFunc(http) 
							} else {
								if(errorFunc)
									errorFunc(http) 
							}
						}
					}
					//go!
					http.send(params);
				});	
			});
		}
		var handleHyResponse = function (response){
			if(!response)
				return;

			//save response as pref
			FoxtrickPrefs.set("YouthTwins.lastResponse", response);

			var json = JSON.parse( response );
			var isHYuser = json.isHyUser;

			var playerInfos = doc.getElementsByClassName("playerInfo");
			for(var i = 0; i < playerInfos.length; i++){
				var playerInfo = playerInfos[i];

				//find spot to place the images
				var target = playerInfo.getElementsByTagName("b")[0];
				
				//get playerid
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
				
				var l10n_possible_twins =Foxtrickl10n.getString("YouthTwins.possibleTwins", possible).replace("%1", possible);
				var l10n_marked_twins = Foxtrickl10n.getString("YouthTwins.markedTwins").replace("%1", marked);
				var l10n_non_twins = Foxtrickl10n.getString("YouthTwins.nonTwins").replace("%1", non);
				var l10n_undecided_twins = Foxtrickl10n.getString("YouthTwins.undecidedTwins").replace("%1", missing);
				var l10n_non_hy_user = Foxtrickl10n.getString("YouthTwins.nonHyUser");

				if(isHYuser)
					var title = " " + l10n_possible_twins + "\n " + l10n_marked_twins + "\n " + l10n_non_twins + "\n " + l10n_undecided_twins;
				else
					var title = " " + l10n_possible_twins + "\n " + l10n_non_hy_user;
					//var title = "This player has %1 possible twins.\n You could find out more about this player's potential using hattrick youthclub."
				
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
				addIcons(container, marked, l10n_marked_twins, "ft-youth-twins-icon", icon_green);
				addIcons(container, missing, l10n_undecided_twins, "ft-youth-twins-icon", icon_yellow);
				addIcons(container, non, l10n_non_twins, "ft-youth-twins-icon", icon_red);

				//add the whole stuff to the site
				target.parentNode.insertBefore(container,target.nextSibling)
			}
		}
		var errorHandling = function (http){
			Foxtrick.log("error", http.status)
		}

		var teamid = doc.location.href.match(/teamid=(\d+)/i)[1];

		//temporary debug settings
		//var debug = FoxtrickPrefs.isModuleOptionEnabled("YouthTwins", "debug");
		//var forceUpdate = FoxtrickPrefs.isModuleOptionEnabled("YouthTwins", "forceupdate");

		//get last saved result from
		var saved = FoxtrickPrefs.get("YouthTwins.lastResponse");

		//noting saved, probably a fresh install, force request
		if(saved === null){
			Foxtrick.log("No save found ... Updating from HY");
			getTwinsFromHY(teamid, false, false, handleHyResponse, errorHandling);
		}		
		else {
			var json = JSON.parse( saved );
			var fetchTime = json.fetchTime;
			var lifeTime = json.lifeTime;
			var now = (new Date()).getTime();
			if(now > fetchTime && now < fetchTime + lifeTime){
				Foxtrick.log("Using cached response");
				handleHyResponse(saved);
			} else if(now > fetchTime + lifeTime) {
				Foxtrick.log("Updating from HY");
				getTwinsFromHY(teamid, false, false, handleHyResponse, errorHandling);
			} else 
				Foxtrick.log("Dear time traveler, we welcome you!");	
		}
		
	}
};
