"use strict";
/* youth-skills.js
 * Displays twin information for youth squad players using an API supplied by HY.
 * @author CatzHoek, HY backend/API by MackShot
 *
 * @Interface:
 * 		Url: http://stage.hattrick-youthclub.org/_data_provider/foxtrick/playersYouthSkills
 * @params:
 *		//params send via http "POST"
 * 		teamId: teamId
 * 		app: foxtrick
 *		hash: base64 of "foxtrick_"  + teamId
 * @response
 *		JSON:
 *			isHyUser (true / false)
 *				the user is using HY already
 *			players: (dictionary)
 *				list of players
 *				non: number of possible twins marked as non-twin (not present if isHyUser = false)
 *				marked: number of possible twins marked as twin (not present if isHyUser = false)
 *				possible: total number of possible twins
 *			fetchTime: 
 *				Unix timestamp of the feteched information in seconds
 *			lifeTime:
 *				LifeTime of the information in seconds, avoid further requests until fetchTime+lifeTime is met, new pulls to the youth team are a valid reason to disrespect and use forceUpdate. *
 */

 Foxtrick.modules["YouthSkills"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ["youthPlayers"],
	//OPTIONS : ["HideInfoLink"],
	CSS : Foxtrick.InternalPath + "resources/css/youth-twins.css",
	NICE: -10, 
	run : function(doc) {
		var ignoreHours = 24;

		if (!Foxtrick.isPage('ownYouthPlayers', doc))
			return;

		var skillMap = {
			3: 'playmaking',
			4: 'winger',
			5: 'scoring',
			6: 'keeper',
			7: 'passing',
			8: 'defending',
			9: 'set pieces',
			10: 'experience'
		}

		var rowMap = {
			3: 2,
			4: 3,
			5: 5,
			6: 0,
			7: 4,
			8: 1,
			9: 6
		}
		
		/**
		* current = current skill level
		* current_maximal = maximal possible current skill level (the real level is equal or lower)
		* cap = the cap of this skill
		* cap_minimal = minimal possible cap for this skill (the real cap is equal or higher)
		* maxed = weather the skill is fully maxed out or not
		*/

		var getSkillsFromHY = function (callback){
					//api url
					var url = "http://stage.hattrick-youthclub.org/_data_provider/foxtrick/playersYouthSkills";
					
					//assemble param string
					var params = "teamId=" + Foxtrick.modules["Core"].getSelfTeamInfo().teamId;

					Foxtrick.log(Foxtrick.modules["Core"].getSelfTeamInfo().teamId);
					
					//forceUpdate to avoid getting the cached HY response, use carefully
					params = params + "&app=foxtrick"

					//hash
					params = params + "&hash="+ Foxtrick.encodeBase64( "foxtrick_" + Foxtrick.modules["Core"].getSelfTeamInfo().teamId );

					// load and callback
					Foxtrick.util.load.async(url, callback, params);
		}
		var handleHyResponse = function (response, status){
			switch(status){
				case 0:
					Foxtrick.log("YouthSkills: Sending failed", status);
					return; 
				case 200: 
					Foxtrick.log("YouthSkills: Success", status);
					//Foxtrick.localSet("YouthTwins." + Foxtrick.modules["Core"].getSelfTeamInfo().teamId +".ignoreUntil", -1);
					break;
				case 400:
					Foxtrick.log("YouthSkills: Given data is invalid or incomplete", status, response);
					return;
				case 404:
					Foxtrick.log("YouthSkills: 404", status);
					//var now = Foxtrick.util.time.getHtTimeStamp(doc) + 59000;
					//var ignoreUntil = now + ignoreHours*60*60*1000;
					//Foxtrick.localSet("YouthTwins." + Foxtrick.modules["Core"].getSelfTeamInfo().teamId +".ignoreUntil", ignoreUntil);
					//Foxtrick.log("YouthTwins: HY is moving servers or is in huge trouble", status);
					//Foxtrick.log("YouthTwins: No requests for " + ignoreHours/24.0 + " day(s).");
					return;
				case 500:
					Foxtrick.log("YouthSkills: HY is in trouble", status);
					return; 
				case 503:
					//var now = Foxrtick.util.time.getHtTimeStamp(doc) + 59000;
					//var ignoreUntil = now + ignoreHours*60*60*1000;
					//Foxtrick.localSet("YouthTwins." + Foxtrick.modules["Core"].getSelfTeamInfo().teamId +".ignoreUntil", ignoreUntil);
					//Foxtrick.log("YouthTwins: HY temporarily disabled the feature", status, "");
					//Foxtrick.log("YouthTwins: No requests for " + ignoreHours/24.0 + " day(s).");
					return; 
				default:
					Foxtrick.log("YouthSkills: HY returned unhandled status", status, response);
					return;
			}
			
			var json = JSON.parse( response );

			Foxtrick.log(response);
			var playerMap = {};
			var playerInfos = doc.getElementsByClassName("playerInfo");
			for(var i = 0; i < playerInfos.length; i++){
				var playerInfo = playerInfos[i];
				var playerId = parseInt(playerInfo.getElementsByTagName("a")[0].href.match(/YouthPlayerID=(\d+)/i)[1]);
				playerMap[playerId] = playerInfos[i];
			}

			var addBars = function(node){
				while(node.childNodes.length){
					node.removeChild(node.childNodes[0]);
					//bars.appendChild(node.childNodes[0]);
				}

				if(!node.getElementsByClassName("youthSkillBar")[0])
				{
					var bars = Foxtrick.createFeaturedElement(doc, Foxtrick.modules.YouthSkills, 'div'); 
					Foxtrick.addClass(bars, "youthSkillBar");

					var bar1 = doc.createElement("img");
					bar1.setAttribute("src", "/App_Themes/Standard/youthSkillBar/back.png");
					bar1.setAttribute("alt", "x/y");
					bar1.setAttribute("title", "x/y");
					bar1.setAttribute("style", "background-position: -126px 0px");
					Foxtrick.addClass(bar1, "youthSkillBar_max");

					var bar2 = doc.createElement("img");
					bar2.setAttribute("src", "/Img/icons/transparent.gif");
					bar2.setAttribute("alt", "x/y");
					bar2.setAttribute("title", "x/y");
					bar2.setAttribute("style", "width: 0px");
					Foxtrick.addClass(bar2, "youthSkillBar_current");

					bars.appendChild(bar1);
					bars.appendChild(bar2);
					while(node.childNodes.length){
						node.removeChild(node.childNodes[0]);
						//bars.appendChild(node.childNodes[0]);
					}
					node.appendChild(bars);
				} 
			}

			var setMaxSkill = function(playerId, skill, value){
				var table = playerMap[playerId].getElementsByTagName("tbody")[0];
				var skillentry = table.querySelector("tr:nth-of-type(" + skill + ") > td:nth-of-type(2)");
				var img = skillentry.querySelector("img:nth-of-type(1)");
				var offset = 62 + (8-value)*8;
				var style = "background-position: -" + offset + "px 0px";
				img.setAttribute("style", style);
				img.setAttribute("alt", value + "/8");
				img.setAttribute("title", value + "/8");

				//
				var minLink = doc.createElement("a");
				minLink.setAttribute("href", "/Help/Rules/AppDenominations.aspx?lt=skill&ll=" + parseInt(value) +"#skill");
				var minText = doc.createTextNode(Foxtrickl10n.getTextByLevel(value));
				Foxtrick.addClass(minLink, "skill");
				Foxtrick.addClass(minLink, "ft-youthskills-link"); //used to signal skillcoloring that we manually trigger coloring
				minLink.appendChild(minText);
				img.parentNode.appendChild(minLink);
			}
			var setCurrentSkill = function(playerId, skill, value, max, maxed){
				var table = playerMap[playerId].getElementsByTagName("tbody")[0];
				var skillentry = table.querySelector("tr:nth-of-type(" + skill + ") > td:nth-of-type(2)");
				var img = skillentry.querySelector("img:nth-of-type(2)");
				if(Foxtrick.hasClass(img, "youthSkillBar_current") && maxed){
					Foxtrick.removeClass(img, "youthSkillBar_current");
					Foxtrick.addClass(img, "youthSkillBar_full");
				} else if(Foxtrick.hasClass(img, "youthSkillBar_full") && !maxed){
					Foxtrick.removeClass(img, "youthSkillBar_full");
					Foxtrick.addClass(img, "youthSkillBar_current");
				}
				var width = value?-1 + value*8:0;

				var style = "width:" + width + "px";
				img.setAttribute("style", style);
				img.setAttribute("alt", value + "/" + max);
				img.setAttribute("title", value + "/" + max);

				//
				var gapText = doc.createTextNode(" ");
				img.parentNode.appendChild(gapText);

				var minLink = doc.createElement("a");
				minLink.setAttribute("href", "/Help/Rules/AppDenominations.aspx?lt=skill&ll=" + parseInt(value) +"#skill");
				Foxtrick.addClass(minLink, "skill");
				Foxtrick.addClass(minLink, "ft-youthskills-link"); //used to signal skillcoloring that we manually trigger coloring
				var minText = doc.createTextNode(Foxtrickl10n.getTextByLevel(value));
				minLink.appendChild(minText);
				img.parentNode.appendChild(minLink);

				var gapText = doc.createTextNode(" / ");
				img.parentNode.appendChild(gapText);
			}

			var setSkill = function(playerId, skill, current, max, maxed){
				var table = playerMap[playerId].getElementsByTagName("tbody")[0];
				var skillentry = table.querySelector("tr:nth-of-type(" + skill + ") > td:nth-of-type(2)");
				addBars(skillentry);
				setCurrentSkill(playerId, skill, current, max, maxed);
				setMaxSkill(playerId, skill, max);
			}


			var playerInfos = doc.getElementsByClassName("playerInfo");
			for(var i = 0; i < playerInfos.length; i++){
				var playerInfo = playerInfos[i];

				//get playerid
				var playerID = parseInt(playerInfo.getElementsByTagName("a")[0].href.match(/YouthPlayerID=(\d+)/i)[1]);

				for(var sk in json[playerID].skills){
					if(sk == 10)
						continue;

					var cap = json[playerID].skills[sk]["cap"];
					var cap_minimal = json[playerID].skills[sk]["cap_minimal"];
					var current = json[playerID].skills[sk]["current"];
					var current_maximal = json[playerID].skills[sk]["cap_minimal"];
					var maxed = json[playerID].skills[sk]["maxed"];

					var min = current?current:current_maximal?current_maximal:0;
					var max = cap?cap:cap_minimal?cap_minimal:0;
					setSkill(playerID, rowMap[sk]+1, min, max, maxed);
				}
			}
			Foxtrick.modules["SkillColoring"].run(doc);
			//last point in time
		}
		getSkillsFromHY(handleHyResponse);
	}
};