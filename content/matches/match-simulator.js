"use strict";
/**
 * match-simulator.js
 * compare to other teams and simulate matches using htms 
 * @author convinced
 */

Foxtrick.util.module.register({
	MODULE_NAME : "MatchSimulator",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : ['matchOrder'],
	RADIO_OPTIONS : ["RatingsOnTop","RatingsBellow","RatingsRight"],
	CSS : Foxtrick.InternalPath + "resources/css/match-simulator.css",

	run : function(doc) { 
		var displayOption = FoxtrickPrefs.getInt("module.MatchSimulator.value");
		var fieldOverlay = doc.getElementById('fieldOverlay');
		if (displayOption == 1)
			Foxtrick.addClass(fieldOverlay, 'displayBellow');
		else if (displayOption == 2)
			Foxtrick.addClass(fieldOverlay, 'displayRight');

		// ratings and tactic for predicted and for selected others team match
		var currentRatings = new Array(9), currentRatingsOther = new Array(9), teamNames =  new Array(2), isHome;
		
		// updating or adding htms prediction based on rating prediction and seleted match of another team
		var updateHTMSPrediction = function() {
			// create or unhide overlayHTMS
			var overlayHTMS = doc.getElementById('overlayHTMS');
			if (!overlayHTMS) {
				overlayHTMS = doc.createElement('div');
				overlayHTMS.id = "overlayHTMS";
				doc.getElementById('fieldOverlay').appendChild(overlayHTMS);
			}
			else Foxtrick.removeClass(overlayHTMS,'hidden');

			// clear 'previous prediction', if there
			var overlayHTMSPrevious = doc.getElementById('overlayHTMSPrevious');
			if (overlayHTMSPrevious) 
				overlayHTMSPrevious.parentNode.removeChild(overlayHTMSPrevious);

			// move current prediction, if there, to previous. else create current 
			var overlayHTMSCurrent = doc.getElementById('overlayHTMSCurrent')
			if (overlayHTMSCurrent) {
				overlayHTMSPrevious = overlayHTMSCurrent.cloneNode(true);
				overlayHTMSPrevious.id = "overlayHTMSPrevious";
				var table = overlayHTMSPrevious.getElementsByTagName('table')[0];
				if (table) {
					table.id = 'htmstablePrevious';
					var h2 = overlayHTMSPrevious.getElementsByTagName('h2')[0];
					h2.textContent = Foxtrickl10n.getString("matchOrder.previousPrediction");
					var link = overlayHTMSPrevious.getElementsByTagName('a')[0];
					link.parentNode.removeChild(link);
				}
				overlayHTMS.appendChild(overlayHTMSPrevious);
				overlayHTMSCurrent.textContent = '';
			}
			else {
				overlayHTMSCurrent = doc.createElement('div');
				overlayHTMSCurrent.id = "overlayHTMSCurrent";
				overlayHTMS.appendChild(overlayHTMSCurrent);
			}

			// if has number from other match, collect and submit them to htms. else clear overlay
			if (currentRatingsOther[0] != undefined) {
				var tacticAbbr = ["", "pressing", "ca", "aim", "aow", "cre", "long"];
				var midfieldLevel = [ currentRatings[3], currentRatingsOther[3] ];
				var rdefence = [ currentRatings[0], currentRatingsOther[6] ];
				var cdefence = [ currentRatings[1], currentRatingsOther[5] ];
				var ldefence = [ currentRatings[2], currentRatingsOther[4] ];
				var rattack = [ currentRatings[4], currentRatingsOther[2] ];
				var cattack = [ currentRatings[5], currentRatingsOther[1] ];
				var lattack = [ currentRatings[6], currentRatingsOther[0] ];
				
				var tactics = [ tacticAbbr[currentRatings[7]], tacticAbbr[currentRatingsOther[7]] ];
				var tacticsLevel = [ currentRatings[8], currentRatingsOther[8] ];
				Foxtrick.util.module.get('HTMSPrediction').insertPrediction(doc,overlayHTMSCurrent, midfieldLevel, rdefence, cdefence, ldefence, rattack, cattack, lattack, tactics, tacticsLevel,teamNames);
			}
			else {
				if (overlayHTMS)
					overlayHTMS.textContent = '';
			}
		};
		
		
		var showLevelNumbers = function(ev) { 
			// only listen to rating prediction changes
			if ( !Foxtrick.hasClass(ev.target.parentNode, 'posLabel') ) 
				return;
			
			var overlayRatings = fieldOverlay.getElementsByClassName('overlayRatings');
			var posLabel = fieldOverlay.getElementsByClassName('posLabel');
			
			// get some tactics etc lables for common use
			var speechLevelDiv = doc.getElementsByClassName('speechLevel')[0].cloneNode(true);
			var speechLevelTitle = speechLevelDiv.innerHTML.split('<select')[0].replace(/\s\s+/g,' ');
			var teamtacticsDiv = doc.getElementById('tactics').cloneNode(true);
			teamtacticsDiv.removeChild(teamtacticsDiv.getElementsByClassName('speechLevel')[0]);
			teamtacticsDiv.removeChild(teamtacticsDiv.getElementsByTagName('select')[0]);
			var teamtacticsTitle = teamtacticsDiv.innerHTML.replace(/\<[^\>]+?\>/g,'').replace(/\s\s+/g,' ');

			// change bars to represent percentage of ratings comparision between predicted ratings and selected other teams match ratings
			// and update HTMSPrediction
			var updateBarsAndHTMSPrediction = function() {
				updateHTMSPrediction();
				
				var percentImage = fieldOverlay.getElementsByClassName('percentImage');
				for (var i=0; i<percentImage.length; ++i ){
					if (currentRatingsOther[i] != undefined) {
						var percent = currentRatings[i]  / (currentRatings[i] + currentRatingsOther[i])
						var title =  Math.floor(percent*100)+'%'
						var barPos = Math.floor( -235 + (235-116) * percent );
						percentImage[i].style.backgroundPosition = barPos + 'px';
						percentImage[i].title = title;
						percentImage[i].alt = title;
						percentImage[i].style.display = 'inline'
						if (percentImage[i].nextSibling.className != 'percentNumber') {
							var div = doc.createElement('div');
							div.textContent = title;
							div.className = 'percentNumber';
							percentImage[i].parentNode.insertBefore(div, percentImage[i].nextSibling);
						}
						else {
							var div = percentImage[i].nextSibling;
							div.textContent = title;
							
							var diff = Math.floor(percent*100) - Math.floor(Number(div.getAttribute('percent'))*100);
							var span = doc.createElement('span');
							span.textContent = ' ('+diff+'%)';
							if (diff < 0) {
								span.className = "colorLower percentChange";
								div.appendChild(span);
							}
							else if (diff > 0) {
								span.className = "colorHigher percentChange";
								div.appendChild(span);
							}
						}
						div.setAttribute('percent', percent);
					}
					else {
						if (percentImage[i].nextSibling.className == 'percentNumber') {
							var div = percentImage[i].nextSibling;
							div.parentNode.removeChild(div);
						}
						percentImage[i].style.display = 'none'
					}
				}
			};
			
			var copyRatings = function(ev) {
				var text = '';
				
				// the teams. highlight own team
				var h2 = doc.getElementById('mainWrapper').getElementsByTagName('h2')[0];
				var thisTeam = h2.getElementsByTagName('a')[0].textContent;
				var bothTeams = h2.getElementsByTagName('a')[1].textContent.replace(thisTeam, '[b]' + thisTeam + '[/b]');
				text += bothTeams;
				
				// match link
				var matchid = Foxtrick.util.id.getMatchIdFromUrl(doc.location.href);
				text += ' [matchid=' + matchid + ']'+'\n';
				
				// formation
				var formations = Foxtrick.stripHTML(doc.getElementById('formations').innerHTML);
				text += formations +'\n';
				
				// pic/mots
				var speechLevel_select = doc.getElementById('speechLevel');
				var speechLevel = speechLevel_select.options[speechLevel_select.selectedIndex].textContent;
				text += speechLevelTitle;
				text += '[u]' + speechLevel + '[/u]\n';
				
				// tactics
				var teamtactics_select = doc.getElementById('teamtactics');
				var tactics = teamtactics_select.options[teamtactics_select.selectedIndex].textContent;
				text += teamtacticsTitle;
				text += '[u]'+tactics +'[/u] / ';
				text += doc.getElementById('tacticLevelLabel').textContent+'\n\n';

				// add other match info if appropriate
				var matchSelect = doc.getElementById('matchSelect');
				if (matchSelect) {
					var otherMatchId = matchSelect.value;
					if (otherMatchId > 0) {
						text += Foxtrickl10n.getString('matchOrder.comparedTo')+'\n';
						text += matchSelect.options[matchSelect.selectedIndex].textContent + ' [matchid=' + otherMatchId + ']\n';
						text += doc.getElementById('tacticLevelLabelOther').textContent+'\n\n';
					}
				}

				// ratings
				text += '[table][tr][th colspan=3 align=center]' + doc.getElementById('calcRatings').value + '[/th][/tr]\n';
				for (var i=0,count=0; i< overlayRatings.length-1;++i) {
					
					if (i==0 || i==6 || i==8) {
						// new rows for defence, mid, attack
						text += '[tr]'
					}
					if (i==6) {
						// midfield
						text += '[td colspan=3 align=center]' 
					} else if (i%2==0) {
							// posLabel
							text += '[td align=center]' 
					} else {
						// ratings. add to same cell
					}
					
					if (Foxtrick.hasClass(overlayRatings[i],'posLabel')) {
						// sector label
						text += '[b]'+overlayRatings[i].textContent+'[/b]\n';
					}
					else {
						// sector rating
						text += overlayRatings[i].textContent + '\n';
						text += doc.getElementById('ft-full-level' + count++).textContent + '\n';

						// add other teams ratings if appropriate
						if (otherMatchId && otherMatchId > 0) {
							var ratingInnerBox = overlayRatings[i].parentNode;
							text += '[q]' + ratingInnerBox.getElementsByClassName('percentNumber')[0].textContent + '[/q]';
							var divs = ratingInnerBox.getElementsByClassName('otherWrapper')[0].getElementsByTagName('div');
							text += '[b]' + divs[0].textContent + '[/b]\n';
							text += divs[1].textContent + '\n';
							text += divs[2].textContent + '\n';
						}
						text += '[/td]';
					}
					if (i==5 || i==7 || i==13) {
						text += '[/tr]'
					}
				}
				text += '[/table]';
				
				// copy htms prediction. 
				var overlayHTMS = doc.getElementById('overlayHTMSCurrent');
				if (overlayHTMS) {
					text += Foxtrick.util.module.get('HTMSPrediction').copy(overlayHTMS);
				}
				
				Foxtrick.copyStringToClipboard(text);
				var note = Foxtrick.util.note.add(doc, doc.getElementById('mainBody').firstChild, "ft-ratings-copy-note", Foxtrickl10n.getString("CopyRatings.copied"), null, true);
			};
			
			// get levels from ratings text and display them
			var ratingInnerBoxs = doc.getElementsByClassName('ratingInnerBox');
			for (var i=0; i< ratingInnerBoxs.length; ++i) {
				var overlayRating = ratingInnerBoxs[i].getElementsByClassName('overlayRatings')[1];
				var text = overlayRating.textContent;
				var fullLevel = Foxtrickl10n.getLevelFromText(text);
				if (fullLevel) { 
					var levelText ='['+fullLevel.toFixed(2)+']';
					var id = 'ft-full-level' + i;
					if (currentRatings[i] !== undefined) { 
						var div = doc.getElementById(id);
						div.textContent = levelText;
						var diff = fullLevel-currentRatings[i];
						var span = doc.createElement('span');
						span.textContent = ' ('+diff.toFixed(2)+')';
						if (diff < 0) {
							span.className = "colorLower ratingChange";
							div.appendChild(span);
						}
						else if (diff > 0) {
							span.className = "colorHigher ratingChange";
							div.appendChild(span);
						}
					}
					else {
						var div = doc.createElement('div');
						div.id = id;
						div.className = "overlayRatingsNum";
						div.textContent = levelText;
					}
					ratingInnerBoxs[i].insertBefore(div, overlayRating.nextSibling);
					currentRatings[i] = fullLevel;
				}
			}
			// store tactics for htms
			var teamtactics_select = doc.getElementById('teamtactics');
			currentRatings[7] = teamtactics_select.selectedIndex;
			if (teamtactics_select.selectedIndex!=0) {
				currentRatings[8] = tacticLevelLabel.getElementsByTagName('a')[0].href.match(/\d+/)[0];
			}
			
			// remove other changes for clearity
			var otherChange = fieldOverlay.getElementsByClassName('otherChange');
			for (var j=0; j<otherChange.length; ++j ){
				otherChange[j].textContent = ''
			}
			
			updateBarsAndHTMSPrediction();
			
			// keep it visible till closed
			Foxtrick.addClass(fieldOverlay,'visible');
				
			// opened first time
			if (!doc.getElementById('copyRatingsButton')) {
				// close button tweaked.
				var hideOverlay = function(ev) {
					Foxtrick.removeClass(fieldOverlay,'visible');
					var overlayHTMS = doc.getElementById('overlayHTMS');
					if (overlayHTMS) 
						Foxtrick.addClass(overlayHTMS,'hidden');
				};
				Foxtrick.listen(doc.getElementById('closeOverlay'), 'click', hideOverlay, false);

				// add copy button
				var copyButton = doc.createElement('input');
				copyButton.type = 'button';
				copyButton.value = Foxtrickl10n.getString('Copy');
				copyButton.id = 'copyRatingsButton';
				copyButton.setAttribute('style','float: left; position: absolute; bottom: 0px; left: 10px;');
				fieldOverlay.appendChild(copyButton);
				Foxtrick.listen(copyButton, 'click', copyRatings, false);
				
				// display selection of matches to compare to
				// first, get team id of other team 
				var loadingOtherMatches = Foxtrick.util.note.createLoading(doc);
				doc.getElementById("overlayHTMS").appendChild(loadingOtherMatches);
				
				var matchid = Foxtrick.util.id.getMatchIdFromUrl(doc.location.href);
				var orderMatchArgs = [
					["file", "matchdetails"],
					["matchID", matchid]
				];
				Foxtrick.util.api.retrieve(doc, orderMatchArgs, {cache_lifetime:'session'},
				function(orderMatchXml, errorText) {
					if (errorText) {
						if (loadingOtherMatches)
							loadingOtherMatches.parentNode.removeChild(loadingOtherMatches);
						Foxtrick.log(errorText);
						return;
					}
					// determine otherTeamId
					var HomeTeamID = Number(orderMatchXml.getElementsByTagName('HomeTeamID')[0].textContent);
					var AwayTeamID = Number(orderMatchXml.getElementsByTagName('AwayTeamID')[0].textContent);
					var h2 = doc.getElementById('mainWrapper').getElementsByTagName('h2')[0];
					var thisTeamID = Foxtrick.util.id.getTeamIdFromUrl(h2.getElementsByTagName('a')[0].href);
					if (thisTeamID == HomeTeamID ) {
						isHome = true;
						var otherTeamID = AwayTeamID;
						teamNames[0] = orderMatchXml.getElementsByTagName('HomeTeamName')[0].textContent;
						teamNames[1] = orderMatchXml.getElementsByTagName('AwayTeamName')[0].textContent;
					}
					else {
						isHome = false;
						var otherTeamID = HomeTeamID;
						teamNames[1] = orderMatchXml.getElementsByTagName('HomeTeamName')[0].textContent;
						teamNames[0] = orderMatchXml.getElementsByTagName('AwayTeamName')[0].textContent;
					}
					
					// now get other teams matches
					var otherMatchesArgs = [
						["file", "matchesarchive"],
						["teamID", otherTeamID]
					];
					Foxtrick.util.api.retrieve(doc, otherMatchesArgs, {cache_lifetime:'session'},
					function(otherMatchesXml, errorText) {
						if (loadingOtherMatches)
								loadingOtherMatches.parentNode.removeChild(loadingOtherMatches);
						if (errorText) {
							Foxtrick.log(errorText);
							return;
						}

						var getMatchDetails = function(selectedMatchid, isNew) {
							// get selected match
							var loadingMatch = Foxtrick.util.note.createLoading(doc);
							var overlayHTMS = doc.getElementById("overlayHTMS");
							overlayHTMS.insertBefore(loadingMatch, overlayHTMS.firstChild);
							var selectedMatchArgs = [
								["file", "matchdetails"],
								["matchID", selectedMatchid]
							];
							Foxtrick.util.api.retrieve(doc, selectedMatchArgs, {cache_lifetime:'session'},
							function(selectedMatchXML, errorText) {
								if (loadingMatch)
										loadingMatch.parentNode.removeChild(loadingMatch);
								if (errorText) {
									Foxtrick.log(errorText);
									return;
								}

								// update match select
								if (isNew) {
									var option = doc.createElement('option');
									option.value = selectedMatchXML.getElementsByTagName('MatchID')[0].textContent;
									var MatchDate = Foxtrick.util.time.buildDate( Foxtrick.util.time.getDateFromText(selectedMatchXML.getElementsByTagName('MatchDate')[0].textContent, 'yyyy-mm-dd') );
									option.textContent = MatchDate
														+ ' : ' + selectedMatchXML.getElementsByTagName('HomeTeamName')[0].textContent
														+ ' ' + selectedMatchXML.getElementsByTagName('HomeGoals')[0].textContent
														+ ' - ' + selectedMatchXML.getElementsByTagName('AwayGoals')[0].textContent
														+ ' ' + selectedMatchXML.getElementsByTagName('AwayTeamName')[0].textContent;
									select.appendChild(option);
									select.selectedIndex = select.options.length-1;
								}
								
								// select team node
								Foxtrick.log(selectedMatchXML);
								var HomeTeamID =  Number(selectedMatchXML.getElementsByTagName('HomeTeamID')[0].textContent);
								var AwayTeamID =  Number(selectedMatchXML.getElementsByTagName('AwayTeamID')[0].textContent);
								if (otherTeamID == HomeTeamID) {
									var teamNode =  selectedMatchXML.getElementsByTagName('HomeTeam')[0];
									teamNames[1] = selectedMatchXML.getElementsByTagName('HomeTeamName')[0].textContent;
								}
								else if (otherTeamID == AwayTeamID) {
									var teamNode =  selectedMatchXML.getElementsByTagName('AwayTeam')[0];
									teamNames[1] = selectedMatchXML.getElementsByTagName('AwayTeamName')[0].textContent;
								}
								else if (isHome) {
									var teamNode =  selectedMatchXML.getElementsByTagName('AwayTeam')[0];
									teamNames[1] = selectedMatchXML.getElementsByTagName('AwayTeamName')[0].textContent;
								}
								else {
									var teamNode =  selectedMatchXML.getElementsByTagName('HomeTeam')[0];
									teamNames[1] = selectedMatchXML.getElementsByTagName('HomeTeamName')[0].textContent;
								}

								// get ratings
								var selectedratings = [ 
									{type:'RatingLeftAtt'},
									{type:'RatingMidAtt'},
									{type:'RatingRightAtt'},
									{type:'RatingMidfield'},
									{type:'RatingLeftDef'},
									{type:'RatingMidDef'},
									{type:'RatingLeftDef'},
									{type:'TacticType'},
									{type:'TacticSkill'}
								];
								
								// get ratings and ratings text
								for (var i=0; i<selectedratings.length;++i) {
									var htvalue = Number(teamNode.getElementsByTagName(selectedratings[i].type)[0].textContent);
									if (selectedratings[i].type == 'TacticType') {
										selectedratings[i].value = htvalue;
										selectedratings[i].text = Foxtrickl10n.getTacticById(htvalue);
									}
									else if (selectedratings[i].type == 'TacticSkill') {
										selectedratings[i].value = htvalue;
										selectedratings[i].text = Foxtrickl10n.getLevelByTypeAndValue('levels', htvalue);
									}
									else {
										// adjust scale. non-existant has no sublevels
										selectedratings[i].value = htvalue /4;
										if (selectedratings[i].value != 0)  
											selectedratings[i].value += 0.75;
										
										selectedratings[i].text = Foxtrickl10n.getFullLevelByValue(selectedratings[i].value);
									}
								}
								
								// display other teams ratings
								var ratingInnerBoxs = doc.getElementsByClassName('ratingInnerBox');
								for (var i=0; i< ratingInnerBoxs.length; ++i) {
									
									var fullLevel = selectedratings[i].value;
									var levelText ='['+fullLevel.toFixed(2)+']';
									
									var id = 'ft-full-level-other' + i;
									if (currentRatingsOther[i] !== undefined) { 
										// there was another match selected before. show ratings and differences
										var div = doc.getElementById(id);
										div.textContent = levelText;
										var diff = fullLevel - currentRatingsOther[i];
										var span = doc.createElement('span');
										span.textContent = ' ('+diff.toFixed(2)+')';
										if (diff < 0) {
											span.className = "colorLower otherChange";
											div.appendChild(span);
										}
										else if (diff > 0) {
											span.className = "colorHigher otherChange";
											div.appendChild(span);
										}
										var label = ratingInnerBoxs[i].getElementsByClassName('posLabelOther')[0];
										var overlayRatingOther = ratingInnerBoxs[i].getElementsByClassName('overlayRatingsOther')[0];
									}
									else {
										// no other match ratings had been shown. add other ratings containers and the ratings
										var otherWrapper = doc.createElement('div');
										otherWrapper.className = 'otherWrapper';
										
										var label = doc.createElement('div');
										label.className = 'posLabelOther';
										otherWrapper.appendChild(label);
										label.textContent = posLabel[6-i].textContent;
									
										var overlayRatingOther = doc.createElement('div');
										overlayRatingOther.className = 'overlayRatingsOther';
										otherWrapper.appendChild(overlayRatingOther);
								
										var div = doc.createElement('div');
										div.id = id;
										div.className = 'overlayRatingsNumOther';
										div.textContent = levelText;
										otherWrapper.appendChild(div)
										
										ratingInnerBoxs[i].appendChild(otherWrapper);
									}
									overlayRatingOther.textContent = selectedratings[i].text;
									
									currentRatingsOther[i] = fullLevel;
								}
								
								// add tactics
								var tacticLevelLabelOther = doc.getElementById('tacticLevelLabelOther');
								if (!tacticLevelLabelOther) {
									var tacticLevelLabelOther = doc.createElement('div');
									tacticLevelLabelOther.id = 'tacticLevelLabelOther';
									
									var tacticLevelLabel = doc.getElementById('tacticLevelLabel');
									tacticLevelLabel.parentNode.insertBefore(tacticLevelLabelOther, tacticLevelLabel.nextSibling);
								}
								var tacticLevelLabelTitle = doc.getElementById('tacticLevelLabel').textContent.split(':')[0];
								currentRatingsOther[7] = selectedratings[7].value;
								currentRatingsOther[8] = selectedratings[8].value;
								
								tacticLevelLabelOther.textContent = teamtacticsTitle
																+ selectedratings[7].text 
																+ ' / ' + tacticLevelLabelTitle + ': '
																+ selectedratings[8].text
																+ ' (' + selectedratings[8].value + ')';
								
								// remove my rating changes for clearity
								var ratingChange = fieldOverlay.getElementsByClassName('ratingChange');
								for (var j=0; j<ratingChange.length; ++j ){
									ratingChange[j].textContent = ''
								}
								
								updateBarsAndHTMSPrediction();
							});
						};
						

						var select = doc.createElement('select');
						select.id = 'matchSelect';
						var option = doc.createElement('option');
						option.value = -1;
						option.textContent = Foxtrickl10n.getString ('matchOrder.noMatchSelected');
						select.appendChild(option);

						var option = doc.createElement('option');
						option.value = 0;
						option.textContent = Foxtrickl10n.getString ('matchOrder.AddMatchManually');
						select.appendChild(option);

						var otherMatchesNodes = otherMatchesXml.getElementsByTagName('Match');
						for (var i=0; i<otherMatchesNodes.length; ++i) {
							
							// not friendlies for now to keep it clean
							var MatchType = Number(otherMatchesNodes[i].getElementsByTagName('MatchType')[0].textContent);
							if (MatchType == 4 || MatchType == 5 || MatchType == 8 || MatchType == 9)
								continue;
								
							var option = doc.createElement('option');
							option.value = otherMatchesNodes[i].getElementsByTagName('MatchID')[0].textContent;
							var MatchDate = Foxtrick.util.time.buildDate( Foxtrick.util.time.getDateFromText(otherMatchesNodes[i].getElementsByTagName('MatchDate')[0].textContent, 'yyyy-mm-dd') );
							option.textContent = MatchDate
												+ ' : ' + otherMatchesNodes[i].getElementsByTagName('HomeTeamName')[0].textContent
												+ ' ' + otherMatchesNodes[i].getElementsByTagName('HomeGoals')[0].textContent
												+ ' - ' + otherMatchesNodes[i].getElementsByTagName('AwayGoals')[0].textContent
												+ ' ' + otherMatchesNodes[i].getElementsByTagName('AwayTeamName')[0].textContent;
							select.appendChild(option);
							
						}
						
						// on selecting a match, matchid and get ratings if appropriate
						var onMatchSelect = function(ev) {
							var selectedMatchid = Number(select.value);
							
							// if no match selected, cleanup old ratings display
							// reset currentRatingsOther, so percentBars and htms gets cleaned as well
							if (selectedMatchid == -1) {
								var otherWrappers = fieldOverlay.getElementsByClassName('otherWrapper'), otherWrapper, count=0;
								while (otherWrapper = otherWrappers[0]) {
									otherWrapper.parentNode.removeChild(otherWrapper);
									currentRatingsOther[count++] = undefined;
								} 
								var tacticLevelLabelOther = doc.getElementById('tacticLevelLabelOther');
								tacticLevelLabelOther.parentNode.removeChild(tacticLevelLabelOther);
								
								updateBarsAndHTMSPrediction();
								return;
							}
							// add a matchid manually
							else if (selectedMatchid == 0) {
								Foxtrick.addClass(ev.target,'hidden');
								var addMatchDiv = doc.getElementById('addMatchDiv');
								Foxtrick.removeClass(addMatchDiv,'hidden');
								return;
							}
							
							getMatchDetails(selectedMatchid);
						};

						select.setAttribute('style','float: left; position: absolute; bottom: 0px; left: 100px;');
						Foxtrick.listen(select, 'change', onMatchSelect, false); 
						fieldOverlay.appendChild(select);
						
						// manual add a match
						var addMatchDiv = doc.createElement('addMatchDiv');
						addMatchDiv.setAttribute('style','float: left; position: absolute; bottom: 0px; left: 100px;');
						addMatchDiv.className = 'hidden';
						addMatchDiv.id = 'addMatchDiv';
						fieldOverlay.appendChild(addMatchDiv);
						
						var addMatchText = doc.createElement('input');
						addMatchText.id = 'addMatchText';
						addMatchText.type = 'text';
						addMatchDiv.appendChild(addMatchText);
						
						var addMatchButtonOk = doc.createElement('input');
						addMatchButtonOk.id = 'addMatchButton';
						addMatchButtonOk.type = 'button';
						addMatchButtonOk.value = Foxtrickl10n.getString('button.add');
						addMatchDiv.appendChild(addMatchButtonOk);
						
						var addMatch = function (ev) {
							var matchid = Number(addMatchText.value);
							getMatchDetails(matchid, true);
							
							Foxtrick.addClass(addMatchDiv,'hidden');
							Foxtrick.removeClass(select,'hidden');
						}
						Foxtrick.listen(addMatchButtonOk, 'click', addMatch, false); 
						
						var addMatchButtonCancel = doc.createElement('input');
						addMatchButtonCancel.id = 'addMatchButtonCancel';
						addMatchButtonCancel.type = 'button';
						addMatchButtonCancel.value = Foxtrickl10n.getString('button.cancel');
						addMatchDiv.appendChild(addMatchButtonCancel);
						
						var addMatchCancel = function (ev) {
							Foxtrick.addClass(addMatchDiv,'hidden');
							Foxtrick.removeClass(select,'hidden');
							select.selectedIndex = 0;
							onMatchSelect();
						}
						Foxtrick.listen(addMatchButtonCancel, 'click', addMatchCancel, false); 
					});
				});
			}
		};
		var fieldOverlay = doc.getElementById('fieldOverlay');
		Foxtrick.addMutationEventListener(fieldOverlay, "DOMNodeInserted", showLevelNumbers, false);
	}
});
