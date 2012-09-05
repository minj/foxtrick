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
 *		hash: sha1/md5/base64 of "foxtrick_"  + teamId
 * @response (incomplete)
 *		JSON:	
 *
 * current = current skill level
 * cap = the cap of this skill
 * cap_minimal = minimal possible cap for this skill (the real cap is equal or higher)
 * maxed = weather the skill is fully maxed out or not
*/

 Foxtrick.modules["YouthSkills"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ["youthPlayers"],
	CSS : Foxtrick.InternalPath + "resources/css/youth-twins.css",
	NICE: -10, 
	run : function(doc) {
		var UNKNOWNLEVELSYMBOL = "-";

		if (!Foxtrick.isPage('ownYouthPlayers', doc))
			return;

		//this maps HY skill-id to skill
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

		//this maps HY skill-id to the row index in the table (when looking for n-th child, add 1 to the result)
		var rowMap = {
			3: 2,
			4: 3,
			5: 5,
			6: 0,
			7: 4,
			8: 1,
			9: 6
		}

		//skill-coliring has a special case where it will not run when this module is enabled
		//so we need to call skill-coloring manually
		var doSkillColoring = function(doc){
			Foxtrick.modules["SkillColoring"].execute(doc);	
		}

		//retrieve youth skills by teamid
		var getSkillsFromHY = function (callback){
			//api url
			var url = "http://stage.hattrick-youthclub.org/_data_provider/foxtrick/playersYouthSkills";

			var teamId = Foxtrick.modules["Core"].getSelfTeamInfo().teamId;
			
			//assemble param string
			var params = "teamId=" + teamId;
			
			//forceUpdate to avoid getting the cached HY response, use carefully
			params = params + "&app=foxtrick"

			//hash
			params = params + "&hash="+ Foxtrick.encodeBase64( "foxtrick_" + teamId );

			// load and callback
			Foxtrick.util.load.async(url, callback, params);
		}

		var handleHyResponse = function (response, status){
			switch(status){
				case 0:
					Foxtrick.log("YouthSkills: Sending failed", status);
					doSkillColoring(doc);
					return; 
				case 200: 
					Foxtrick.log("YouthSkills: Success", status);
					//Foxtrick.localSet("YouthTwins." + Foxtrick.modules["Core"].getSelfTeamInfo().teamId +".ignoreUntil", -1);
					break;
				case 400:
					Foxtrick.log("YouthSkills: Given data is invalid or incomplete", status, response);
					doSkillColoring(doc);
					return;
				case 404:
					Foxtrick.log("YouthSkills: 404", status);
					//var now = Foxtrick.util.time.getHtTimeStamp(doc) + 59000;
					//var ignoreUntil = now + ignoreHours*60*60*1000;
					//Foxtrick.localSet("YouthTwins." + Foxtrick.modules["Core"].getSelfTeamInfo().teamId +".ignoreUntil", ignoreUntil);
					//Foxtrick.log("YouthTwins: HY is moving servers or is in huge trouble", status);
					//Foxtrick.log("YouthTwins: No requests for " + ignoreHours/24.0 + " day(s).");
					doSkillColoring(doc);
					return;
				case 500:
					Foxtrick.log("YouthSkills: HY is in trouble", status);
					doSkillColoring(doc);
					return; 
				case 503:
					//var now = Foxrtick.util.time.getHtTimeStamp(doc) + 59000;
					//var ignoreUntil = now + ignoreHours*60*60*1000;
					//Foxtrick.localSet("YouthTwins." + Foxtrick.modules["Core"].getSelfTeamInfo().teamId +".ignoreUntil", ignoreUntil);
					//Foxtrick.log("YouthTwins: HY temporarily disabled the feature", status, "");
					//Foxtrick.log("YouthTwins: No requests for " + ignoreHours/24.0 + " day(s).");
					doSkillColoring(doc);
					return; 
				default:
					Foxtrick.log("YouthSkills: HY returned unhandled status", status, response);
					doSkillColoring(doc);
					return;
			}
			
			var json = JSON.parse( response );
			var playerMap = {};
			var playerInfos = doc.getElementsByClassName('playerInfo');
			for(var i = 0; i < playerInfos.length; i++){
				var playerInfo = playerInfos[i];
				var playerId = parseInt(playerInfo.getElementsByTagName("a")[0].href.match(/YouthPlayerID=(\d+)/i)[1]);
				playerMap[playerId] = playerInfos[i];
			}

			var addBars = function(node){
				if(!node)
					return;

				while(node.childNodes.length){
					node.removeChild(node.childNodes[0]);
				}

				if(!node.getElementsByClassName("youthSkillBar")[0])
				{
					var fragment = doc.createDocumentFragment();

					var bars = fragment.appendChild(doc.createElement('div'));
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
				
					bars.appendChild( bar1 );
					bars.appendChild( bar2 );
					node.appendChild(fragment);
				} 
			}

			var setMaxSkill = function(playerId, skill, value){
				var table = playerMap[playerId].getElementsByTagName("tbody")[0];
				var skillentry = table.querySelector("tr:nth-of-type(" + skill + ") > td:nth-of-type(2)");
				var maximg = skillentry.querySelector("img:nth-of-type(1)");
				var offset = 62 + (8-value)*8;
				var style = "background-position: -" + offset + "px 0px";
				maximg.setAttribute("style", style);
				maximg.setAttribute("alt", value + "/8");
				maximg.setAttribute("title", value + "/8");
				
				var gapText = doc.createTextNode(" / ");
				maximg.parentNode.appendChild(gapText);

				if(value){
					var maxLink = doc.createElement("a");
					maxLink.setAttribute("href", "/Help/Rules/AppDenominations.aspx?lt=skill&ll=" + parseInt(value) +"#skill");
					var maxText = doc.createTextNode( value?Foxtrickl10n.getTextByLevel(value):UNKNOWNLEVELSYMBOL );
					Foxtrick.addClass(maxLink, "skill");
					Foxtrick.addClass(maxLink, "ft-youthskills-link"); //used to signal skillcoloring that we manually trigger coloring
					maxLink.appendChild(maxText);
					maximg.parentNode.appendChild(maxLink);
				} else {
					var maxText = doc.createTextNode( UNKNOWNLEVELSYMBOL );
					maximg.parentNode.appendChild(maxText);
				}
			}
			var setCurrentSkill = function(playerId, skill, value, max, maxed){
				var table = playerMap[playerId].getElementsByTagName("tbody")[0];
				var skillentry = table.querySelector("tr:nth-of-type(" + skill + ") > td:nth-of-type(2)");
				var curimg = skillentry.querySelector("img:nth-of-type(2)");
				if(Foxtrick.hasClass(curimg, "youthSkillBar_current") && maxed){
					Foxtrick.removeClass(curimg, "youthSkillBar_current");
					Foxtrick.addClass(curimg, "youthSkillBar_full");
				} else if(Foxtrick.hasClass(curimg, "youthSkillBar_full") && !maxed){
					Foxtrick.removeClass(curimg, "youthSkillBar_full");
					Foxtrick.addClass(curimg, "youthSkillBar_current");
				}
				var width = value?-1 + value*8:0;

				var style = "width:" + width + "px";
				curimg.setAttribute("style", style);
				curimg.setAttribute("alt", value + "/" + max);
				curimg.setAttribute("title", value + "/" + max);

				//generate
				var gapText = doc.createTextNode(" ");
				curimg.parentNode.appendChild(gapText);

				if(value){
					var minLink = doc.createElement("a");
					minLink.setAttribute("href", "/Help/Rules/AppDenominations.aspx?lt=skill&ll=" + parseInt(value) +"#skill");
					Foxtrick.addClass(minLink, "skill");
					Foxtrick.addClass(minLink, "ft-youthskills-link"); //used to signal skillcoloring that we manually trigger coloring
					var minText = doc.createTextNode( value?Foxtrickl10n.getTextByLevel(value):UNKNOWNLEVELSYMBOL );
					minLink.appendChild(minText);
					curimg.parentNode.appendChild(minLink);
				} else {
					var minText = doc.createTextNode( UNKNOWNLEVELSYMBOL );
					curimg.parentNode.appendChild(minText);
				}

			}

			var setSkill = function(playerId, skill, current, max, maxed){
				var table = playerMap[playerId].getElementsByTagName("tbody")[0];
				var skillentry = table.querySelector("tr:nth-of-type(" + skill + ") > td:nth-of-type(2)");
				
				if(!skillentry)
					return;

				addBars(skillentry);
				setCurrentSkill(playerId, skill, current, max, maxed);

				if(!maxed)
					setMaxSkill(playerId, skill, max);
			}

			var start = (new Date).getTime();


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
					var maxed = json[playerID].skills[sk]["maxed"];

					var min = current?current:0;
					var max = cap?cap:cap_minimal?cap_minimal:0;

					if(min || max)
						setSkill(playerID, rowMap[sk]+1, min, max, maxed);
				}
			}

			Foxtrick.log((new Date).getTime() - start + "ms");
			doSkillColoring(doc);
			//last point in time
		}

		//get skills from HY
		Foxtrick.localGet("YouthClub." + Foxtrick.modules["Core"].getSelfTeamInfo().teamId +".isUser", function (isHYUser){
			if(isHYUser)
				getSkillsFromHY(handleHyResponse);
			else
				doSkillColoring(doc);
		});
		
	}
};