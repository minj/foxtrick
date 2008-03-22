var foxtrick_urlmasks = [/^http:\/\/(www\d*\.){0,1}hattrick\.(org|ws)/i ];
var foxtrick_potentialurlmasks = [/^http:\/\/195\.149\.15\d\.[0-9]*/i, /^http:\/\/193\.34\.18\d\.[0-9]*/i ];

//--------------------------------------------------------------------------- 
   
function isHattrickDocument(doc) {
  
  var href = doc.location.href;
      
  for (var i=0; i<foxtrick_urlmasks.length; i++) {
    if (href.search(foxtrick_urlmasks[i]) > -1) {
      return true;
    } 
  }
  
  // check potential url masks (ip's)
  for (var i=0; i<foxtrick_potentialurlmasks.length; i++) {
    if (href.search(foxtrick_potentialurlmasks[i]) > -1) {
      if (doc.title.search("Hattrick") > -1) {
        var baseurl = href.match(foxtrick_potentialurlmasks[i])[0];
        foxtrick_urlmasks[foxtrick_urlmasks.length] = new RegExp("^" + baseurl)
        return true;
      }
    } 
  }

  return false;

}

function conditionSatisfiedInFrame(doc, regexp) {
   
  if (doc.location.href.search(regexp) > -1 ) {
    return true;
  }
  
  var frames = doc.getElementsByTagName("frame");
  for (var i=0; i<frames.length; i++) {
    if (conditionSatisfiedInFrame(frames[i].contentDocument, regexp)) return true;
  }
  
  return false;

}

function foxtrick_findFrame(doc, regexp) {
   
  if (doc.location.href.search(regexp) > -1 ) {
    return doc;
  }
  
  var frames = doc.getElementsByTagName("frame");
  
  for (var i=0; i<frames.length; i++) {
    var temp = foxtrick_findFrame(frames[i].contentDocument, regexp);
    if (temp != null) return temp;
  }
  
  return null;

}

function getServerNumber(href) {
 return href.match(/\d+/)[0];
}        

//---------------------------------------------------------------------------

function isMatchLineupUrl(href) {
  return href.search(/matchLineup\.asp/i) > -1;
}

function isBookmarksUrl(href) {
  return href.search(/bookmarks\.asp/i) > -1;
}

function isFooterUrl(href) {
  return href.search(/foot\.asp/i) > -1;
}

function isOwnClubUrl(href) {
  return href.search(/\/club\.asp/i) > -1;
}

function isNewsFlashUrl(href) {
  return href.search(/newflash\.asp/i) > -1;
}

function isTransferHistoryUrl(href) {
  return href.search(/transferHistory\.asp/i) > -1;
}

function isMemorableMomentsUrl(href) {
  return href.search(/otherEvents\.asp/i) > -1;
}

function isYouthOverviewUrl(href) {
  return href.search(/YouthOverView\.asp/i) > -1;
}

function isRegionUrl(href) {
  return href.search(/regionDetails\.asp/i) > -1;
}

function foxtrick_isGuestbookUrl(href) {
  return href.search(/viewGuestbook/i) > -1;
}

function foxtrick_isSupporterListUrl(href) {
  return (href.search(/supporter\.asp/i) > -1) && (href.search(/showSupporters/i) > -1);
}

function isAddToHtLiveUrl(href) {
  return href.search(/live\.asp\?actionType=addMatch/i) > -1;
}

function isFlagsUrl(href) {
  return href.search(/teamDetails\.asp\?actionType=viewClubPage/i) > -1;
}

function isChallangespUrl(href) {
  return href.search(/challanges\.asp/i) > -1;
}

function isEconomyUrl(href) {
  return href.search(/economy\.asp/i) > -1;
}

function isMenuUrl(href) {
  return href.search(/menu\.asp/i) > -1;
}

function isMatchOrdersUrl(href) {
  return href.search(/matchOrders\.asp/i) > -1;
}

function isMainPageUrl(href) {
    return href.search(/default\.asp/i) > -1;
}

function isMainConferenceUrl(href) {
    return href.search(/defaultconf\.asp/i) > -1;
}

function isTransferListUrl(href) {
    return href.search(/transferList\.asp/i) > -1;
}

function isMatchListUrl(href) {
    return (href.search(/matches\.asp/i) > -1) && (href.search(/nationalTeamMatches\.asp/i) == -1);
}

function isYouthMatchListUrl(href) {
    return (href.search(/youthmatches\.asp/i) > -1);
}

function isCupMatchListUrl(href) {
    return (href.search(/cupmatches\.asp/i) > -1);
}

function isMatchArchiveUrl(href) {
    return href.search(/matchesArchive\.asp/i) > -1;
}

function isConferenceUrl(href) {
    return href.search(/cn\.asp/i) > -1;
}

function isTeamDetailUrl(href) {
    return (href.search(/teamDetails\.asp/i) > -1) && (href.search(/actionType=viewUser/i) == -1);
}

function isMatchDetailUrl(href) {
    return href.search(/matchdetails\.asp/i) > -1;
}

function isPlayersListUrl(href) {
 return href.search(/players\.asp/i) > -1;
}

function isNationalPlayersListUrl(href) {
  return href.search(/nationalplayers\.asp/i) > -1;
}

function isNationalTeamDetailsUrl(href) {
  return href.search(/nationalTeamDetails\.asp/i) > -1;
}

function foxtrick_isFederationUrl(href) {
 return href.search(/allianceDetails\.asp/i) > -1;
}

function isLeagueDetailUrl(href) {
  return href.match(/leagueDetails\.asp/i) ;
}

function isLeagueFixturesUrl(href) {
  return href.match(/leagueFixtures\.asp/i) ;
}

function isPromotionUrl(href) {
  return href.match(/promotion\.asp/i) ;
}

function isPlayerDetailUrl(href) {
  return href.match(/playerDetails\.asp/i) ;
}

function isTransferCompareUrl(href) {
  return isPlayerDetailUrl(href) && (href.search(/transfercompare/) > -1) ;
}

function isCountryDetailUrl(href) {
  return href.match(/leagueSystemDetails\.asp/i) ;
}

function isTransferSearchForm(href) {
  return href.match(/transfers\.asp/i) ;
}

function getTeamIdFromUrl(url) {
  return url.replace(/.+teamID=/i, "").match(/^\d+/);
}

function getLeagueSystemIdFromUrl(url) {
  return url.replace(/.+leagueSystemID=/i, "").match(/^\d+/);
}

function getLeagueIdFromUrl(url) {
  return url.replace(/.+leagueID=/i, "").match(/^\d+/);
}

function getLeagueOfficeTypeIDFromUrl(url) {
  return url.replace(/.+LeagueOfficeTypeID=/i, "").match(/^\d+/);
}

function getConferenceFolderId(url) {
  return url.replace(/.+folderid=/i, "").match(/^\d+/);
}

function getMatchIdFromUrl(url) {
  return url.replace(/.+matchid=/i, "").match(/^\d+/);
}

function isArenaUrl(href) {
  return href.search(/arenaDetails\.asp/i) > -1;
}


//---------------------------------------------------------------------------

function getLeagueLeveUnitIdFromUrl(url) {
   return url.replace(/.+leagueLevelUnitID=/i, "").match(/^\d+/);
}

//---------------------------------------------------------------------------

function getMatchDetailLinks(doc) {
 
 var links = doc.links;
 
 var linksarray = new Array();
 var counter = 0;
 
 for (var i=0; i<links.length; i++) {
    if (isMatchDetailUrl(links[i].href)) {
        linksarray[counter++] = links[i];
    }
 }
 
 return linksarray;
    
}

//---------------------------------------------------------------------------

function extractLeagueName(doc) {
 
 var links = doc.links;
 
 for (var i=0; i<links.length; i++) {
    if (isCountryDetailUrl(links[i].href)) {
        return trim(links[i].parentNode.lastChild.textContent.replace(/^\s.\s/, ''));
    } 
 }
 
 return null;
    
}

//---------------------------------------------------------------------------

function extractLeagueNameFromTeamPage(doc) {
 
 var links = doc.links;
 
 for (var i=0; i<links.length; i++) {
    if (isLeagueDetailUrl(links[i].href)) {
        return links[i].textContent;
    } 
 }
 
 return null;

}

function adjustStar(image, starsStyle, suffix) {
    
  var filesuffix = ".png";
  if (typeof(starsets[starsStyle]["suffix"]) != 'undefined') {
      filesuffix = "." + starsets[starsStyle]["suffix"];
  }

  if (image.src.match(/star\.gif$/)) {
       image.src = "chrome://foxtrick/content/resources/stars/" + starsStyle + "/star" + suffix + filesuffix;

        if (typeof(starsets[starsStyle]["width"] != undefined)) {
            image.style.width = starsets[starsStyle]["width"];
            image.style.height = starsets[starsStyle]["height"];
        }
       
   } else {
       image.src = "chrome://foxtrick/content/resources/stars/" + starsStyle + "/half" + suffix + filesuffix;
       
        if (typeof(starsets[starsStyle]["width"] != undefined)) {
            image.style.width = starsets[starsStyle]["hwidth"];
            image.style.height = starsets[starsStyle]["hheight"];
        }
   }
};

//---------------------------------------------------------------------------

    function adjustImages(images, segment, count, starsSum) {
        
        if (count == 0) return;
        
        var type = PrefsBranch.getCharPref("starsStyleType");
        var starsStyle = PrefsBranch.getCharPref("starsStyle");

        var maxSuffix = starsets[starsStyle]["number-of-stars"];
        var suffix = 1;
        var groupby = PrefsBranch.getIntPref("starsStyleGroupBy");
        
        if (starsets[starsStyle]["number-of-stars"] == "1") {
             type="add";
         }
        
        switch (type) {
        
          case ("add") :
           {
                var temp = 0;
                for (var offset=0; offset<count; offset++) {
                
                   if (temp == groupby) {
                    if (suffix+1 <= maxSuffix) {
                      suffix++;
                    } else {
                        suffix = 1;
                    }
                    temp = 0;                    
                   }
                   
                   images[segment+offset].setAttribute("title", starsSum + " *");
                   
                   adjustStar(images[segment+offset], starsStyle, suffix);
    
                   temp++;
                }
           } break;
         case ("replace") :
            {
            
            var temp = 0;
        
            for (var offset=0; offset<count; offset++) {
                
               if ((temp == groupby-1) && images[segment+offset].src.match(/star\.gif$/)) {

                   for (var i=1; i<groupby; i++) {
                     images[segment+offset-i].style.display="none";
                   }
                  
                   images[segment+offset].setAttribute("title", starsSum + " *");
                   adjustStar(images[segment+offset], starsStyle, "2");
                   temp = 0;

               } else {
                   images[segment+offset].setAttribute("title", starsSum + " *");
                   adjustStar(images[segment+offset], starsStyle, suffix);                
                   temp++;
               }
            }
            
           }
           break;
    
        case ("merge") :
            {
                var floor = Math.floor(starsSum);
                var half = starsSum - base;
                var zero = false;
                
                var base = starsets[starsStyle]["number-of-stars"];
                if (typeof(starsets[starsStyle]["zero"]) != 'undefined') {
                    base++;
                    zero=true;
                }
                
                var a = Math.floor(floor / base);
                var b = floor % base;
                if (!zero) b++;
                
                var offset = 0;
                if (a>0) {
                    adjustStar(images[segment+offset], starsStyle, a);
                    images[segment+offset].setAttribute("title", starsSum + " *");
                    offset++;
                }
                
                adjustStar(images[segment+offset], starsStyle, b);
                images[segment+offset].setAttribute("title", starsSum + " *");
                offset++;
        
                for (; offset<count; offset++) {
                   if (images[segment+offset].src.search(/half\.gif/i) > -1) {
                      adjustStar(images[segment+offset], starsStyle, 1);
                      images[segment+offset].setAttribute("title", starsSum + " *");
                    } else {
                        images[segment+offset].style.display="none";
                    }
                }
            
           }
           break;
        }    
    }
    

//---------------------------------------------------------------------------

function isStarImage(obj) {
    if (obj == null) return false;
    if (obj.tagName != "IMG") return false;
    return isStarUrl(obj.src);
}

function isStarUrl(url) {
    return (url.search(/star\.gif$/i) > -1) || (url.search(/Praised_half\.gif$/i) > -1) ;
}

function foxtrick_starCounter(doc) {
  if (!isMatchLineupUrl(doc.location.href)) return;

  var notSubstitutedParent = null;
  var totalStars = 0;

  var images = doc.images;
  for (var i=0; i<images.length; i++) {
    var img = images[i];

    if ( img.src.match(/star/i) || img.src.match(/_half\.gif$/i) ) {

      if (notSubstitutedParent == null) {
        notSubstitutedParent = img.parentNode.parentNode.parentNode.parentNode;
      }

      // don't count subsituted players
      if (img.parentNode.parentNode.parentNode.getAttribute("class") != "substitute_holder"
           && (notSubstitutedParent == img.parentNode.parentNode.parentNode.parentNode)) {
        if (img.src.match(/star\.gif$/i)) {
          totalStars+=1;
        } else if (img.src.match(/_half\.gif$/i)) {
          totalStars+=0.5;
        } else if (img.src.match(/star_big\.gif$/i)) {
          totalStars+=5;
        }
      }
      
    }
  }
  
  var target = null;
  
  if (foxtrick_isModernLineup(doc)) {
    var path = "//div[@id='field']";
    var result = doc.evaluate(path,doc.documentElement,null,XPathResult.ANY_TYPE,null);
    var div = result.iterateNext();
    var table = findAncestor(div, "TABLE");
    target = table.rows[1].cells[0].firstChild;
  } else {
    target = findSibling(notSubstitutedParent, "TABLE");
    target = findSibling(notSubstitutedParent, "BR");
  }

  var span = doc.createElement("span");
  span.innerHTML = "<b>" + messageBundle.GetStringFromName("foxtrick.matchlineup.totalstars") + "</b> " + totalStars;
  target.parentNode.insertBefore(span, target);
  target.parentNode.insertBefore(doc.createElement("br"), span);

}

function adjustStars(doc) {
    
    if (!isMatchLineupUrl(doc.location.href) && !isMatchDetailUrl(doc.location.href) && !isPlayersListUrl(doc.location.href)) return;
    if (isMatchLineupUrl(doc.location.href) && foxtrick_isModernLineup(doc)) return;
    
    var changeStars = !PrefsBranch.getBoolPref("useHattrickStars");
    
    var images = doc.images;

    var lastParent = null;
	var count = 0;
	var segment = 0;
	var starsSum = 0;
	
    for (var i=0; i < images.length; i++) {
      if ( images[i].src.match(/star\.gif$/i) || images[i].src.match(/Praised_half\.gif$/i) ) {
  
        if (lastParent == null) {
          lastParent = images[i].parentNode;
          segment = i;
        }

        if (isStarImage(images[i].previousSibling)) {
		  count++;
		  if (images[i].src.match(/star\.gif$/i)) {
		    starsSum=starsSum+1;
		  } else {
		    starsSum=starsSum+0.5
		  }
        } else {
  		  
  		  if (changeStars) adjustImages(images, segment, count, starsSum);

  		  count=1;
  		  segment=i;

  		  if (images[i].src.match(/star\.gif$/i)) {
  		    starsSum=1;
  		  } else {
  		    starsSum=0.5
  		  }
  		  
  		}
  
  		lastParent = images[i].parentNode;		  

      }
    }
    
    if (changeStars) adjustImages(images, segment, count, starsSum);
    
}

    
//---------------------------------------------------------------------------

function foxtrick_getPlayerBranch(playerid) {
  var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
  return prefObj.getBranch("foxtrick.playerinfo." + playerid + ".");
}

function foxtrick_savePlayerFace(playerid, imgFace, imgEyes, imgNose, imgMouth) {
  try {
  	var playerBranch = foxtrick_getPlayerBranch(playerid);

  	playerBranch.setCharPref("face", imgFace);
  	playerBranch.setCharPref("eyes", imgEyes);
  	playerBranch.setCharPref("nose", imgNose);
  	playerBranch.setCharPref("mouth", imgMouth);
  	
  } catch(e) {
    foxtrickdebug(e);
  }
}

function foxtrick_savePlayerDress(playerid, dressHTML) {
  try {
  	var playerBranch = foxtrick_getPlayerBranch(playerid);
  	playerBranch.setCharPref("dressHTML", dressHTML);
  } catch(e) {
    foxtrickdebug(e);
  }
}

//---------------------------------------------------------------------------
function savePlayerCountry(playerid, country) {

    try {
    	var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    	var PlayersBranch = prefObj.getBranch("foxtrick.playerinfo." + playerid + ".");
   	
        PlayersBranch.setCharPref("country", country);
    	
    } catch(e) {}

}


function getPlayerFace(playerid, document, classname) {

    var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    var PlayerBranch = prefObj.getBranch("foxtrick.playerinfo." + playerid + ".");
    
    if (PlayerBranch.prefHasUserValue("face")) {
   
        var nodeBgr = document.createElement("div");
        nodeBgr.className = classname;

        var nodeBgr2 = document.createElement("div");
        nodeBgr2.style.position="relative";
        nodeBgr2.style.left=0;
        nodeBgr2.style.top=0;
        nodeBgr2.style.zIndex=2;
        var imgBg = document.createElement("img");
        nodeBgr2.appendChild(imgBg);
        nodeBgr.appendChild(nodeBgr2);
        
        var nodeFace = document.createElement("div");
        nodeFace.style.position="absolute";
        nodeFace.style.left=0;
        nodeFace.style.top=0;
        nodeFace.style.zIndex=3;
        nodeBgr2.appendChild(nodeFace);
        var imgFace = document.createElement("img");
        nodeFace.appendChild(imgFace);
        
        var nodeEyes = document.createElement("div");
        nodeEyes.style.position="absolute";
        nodeEyes.style.left=0;
        nodeEyes.style.top=0;
        nodeEyes.style.zIndex=5;
        nodeFace.appendChild(nodeEyes);            
        var imgEyes = document.createElement("img");
        nodeEyes.appendChild(imgEyes);
        
        var nodeNose = document.createElement("div");
        nodeNose.style.position="absolute";
        nodeNose.style.left=0;
        nodeNose.style.top=0;
        nodeNose.style.zIndex=4;
        nodeEyes.appendChild(nodeNose);            
        var imgNose = document.createElement("img");
        nodeNose.appendChild(imgNose);
        
        var nodeMouth = document.createElement("div");
        nodeMouth.style.position="absolute";
        nodeMouth.style.left=0;
        nodeMouth.style.top=0;
        nodeMouth.style.zIndex=6;
        nodeNose.appendChild(nodeMouth);            
        var imgMouth = document.createElement("img");
        nodeMouth.appendChild(imgMouth);
        
        imgBg.src = "/Common/Images/Faces/bg.gif";
        foxtrick_adjustPlayerBackground(imgBg, playerid);
        
        imgFace.src="/Common/Images/Faces/" + PlayerBranch.getCharPref("face");
        imgEyes.src="/Common/Images/Faces/" + PlayerBranch.getCharPref("eyes");
        imgMouth.src="/Common/Images/Faces/" + PlayerBranch.getCharPref("mouth");
        imgNose.src="/Common/Images/Faces/" + PlayerBranch.getCharPref("nose");       
        
        return nodeBgr;
        
    } else return null;
    
}

function foxtrick_adjustPlayerBackgrounds(doc) {
  
  if (isPlayersListUrl(doc.location.href) || isPlayerDetailUrl(doc.location.href)) {
    
    var divs = doc.getElementsByTagName("div");
    
    for (var i=0; i<divs.length; i++) {
      if (divs[i].className == "bgr") {
        var face = divs[i];
        var playerhref = isPlayerDetailUrl(doc.location.href) ? doc.location.href : face.nextSibling.nextSibling.href;        
        var playerid = playerhref.replace(/.+playerID=/i, "").match(/^\d+/)[0];

        var bgrImg = face.getElementsByTagName("img")[0];
        foxtrick_adjustPlayerBackground(bgrImg, playerid);
      }
    }
  }

}

function foxtrick_adjustPlayerBackground(imgBg, playerid) {
  
  var country = getPlayerCountry(playerid);
  if (country != null) {
    var flagUrl = "/Common/Images/" + country + "flag.gif";
    
     if (getShowTweak("flagsInPlayerBackground1")) {
       imgBg.src=flagUrl;
     } else
     if (getShowTweak("flagsInPlayerBackground2")) {
       imgBg.src=flagUrl;
       imgBg.style.width = 47;
       imgBg.style.height = 49;
     } else
     if (getShowTweak("flagsInPlayerBackground3")) {
       imgBg.src=flagUrl;
       imgBg.style.width = 30;
       imgBg.style.height = 16;
     }
  }

}

//---------------------------------------------------------------------------

function getPlayerDress(playerid, document) {

    var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    var PlayerBranch = prefObj.getBranch("foxtrick.playerinfo." + playerid + ".");
    
    if (PlayerBranch.prefHasUserValue("dressHTML")) {
        
        var dressHTML = PlayerBranch.getCharPref("dressHTML");
        if (dressHTML == "") return null;
        
        var elem = document.createElement("div");
        elem.innerHTML = dressHTML;
        
        return elem;
        
    } else return null;
    
    
}

//---------------------------------------------------------------------------

function getPlayerCountry(playerid) {
    var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    var PlayerBranch = prefObj.getBranch("foxtrick.playerinfo." + playerid + ".");
    
    if (PlayerBranch.prefHasUserValue("country")) {
        return PlayerBranch.getCharPref("country");
    } else {
        return null;
    }
}

function getPlayerCountryNode(playerid, document) {
  
    var country = getPlayerCountry(playerid);
    if (country != null && country != "") {
        var elem = document.createElement("div");
        var img = document.createElement("img");
        img.src = "/Common/Images/" + country + "flag.gif";
        elem.appendChild(img);
        return elem;
    } else {
        return null;
    }

}


//---------------------------------------------------------------------------

function addPlayerImages(doc, type) {

    var links = doc.links;
    
    addStyleSheet(doc, "chrome://foxtrick/content/resources/css/dress.css");
    addStyleSheet(doc, "chrome://foxtrick/content/resources/css/face.css");
    
    for (var i=0; i < links.length; i++) {
        if ( links[i].href.match(/playerDetail/i)  ) {
            
            var playerid = links[i].href.replace(/.+playerID=/i, "").match(/^\d+/)[0];
            
            if ( (links[i].nextSibling.localName != "BR") && (links[i].nextSibling.localName != "IMG") ) continue;
            
            var playerImageNode = null;

            if (typeof(links[i].imageInserted) == 'undefined') {
                
                var tablecell = links[i].parentNode;                

                // create a container
            
                var container = doc.createElement("div");
                container.className = "foxtrick-faceanddresscontainer";

                // move player info and stars into a div element
                
                var playerinfo = doc.createElement("div");
                playerinfo.className = "foxtrick-playerinfo";
                
                while (tablecell.hasChildNodes()) {
                    var child = tablecell.firstChild;
                    tablecell.removeChild(child);
                    playerinfo.appendChild(child);
                }
                
                switch (type) {
                  case ("faces") : {
                    // add playerface
                    playerFaceNode = getPlayerFace(playerid, doc, "foxtrick-face1");
                    if (playerFaceNode != null) {
                      container.appendChild(playerFaceNode);
                    }
                    
                    playerinfo.className = "foxtrick-playerinfo2";
                    container.appendChild(playerinfo);
                    
                    break;
                  }
                  case ("dresses") : {
                    container.appendChild(playerinfo);
                    
                    playerDressNode = getPlayerDress(playerid, doc);
                    if (playerDressNode != null) {
                        var dressdiv = doc.createElement("div");
                        dressdiv.className = "foxtrick-dress";
                        dressdiv.appendChild(playerDressNode);
                        container.appendChild(dressdiv);
                    }
                    break;
                  }
                  case ("faces-and-dresses") : {
                    // add playerface
                    playerFaceNode = getPlayerFace(playerid, doc, "foxtrick-face2");
                    if (playerFaceNode != null) {
                        container.appendChild(playerFaceNode);
                    }

                    container.appendChild(playerinfo);

                    // add dress
                    playerDressNode = getPlayerDress(playerid, doc);
                    if (playerDressNode != null) {
                        var dressdiv = doc.createElement("div");
                        dressdiv.className = "foxtrick-dress";
                        dressdiv.appendChild(playerDressNode);
                        container.appendChild(dressdiv);
                    }

                    break;
                  }
                  case ("faces-and-flags") : {
                    // add playerface
                    playerFaceNode = getPlayerFace(playerid, doc, "foxtrick-face2");
                    if (playerFaceNode != null) {
                        container.appendChild(playerFaceNode);
                    }

                    container.appendChild(playerinfo);

                    // add country flag

                    countryNode = getPlayerCountryNode(playerid, doc);
                    if (countryNode != null) {
                        var dressdiv = doc.createElement("div");
                        dressdiv.className = "foxtrick-flag foxtrick-flag-right foxtrick-flag-opaque";
                        dressdiv.appendChild(countryNode);
                        container.appendChild(dressdiv);
                    }

                    break;
                  }
                   
                  case ("dresses-and-flags") : {
                    // add country flag
                    countryNode = getPlayerCountryNode(playerid, doc);
                    if (countryNode != null) {
                        var dressdiv = doc.createElement("div");
                        dressdiv.className = "foxtrick-flag foxtrick-flag-left";
                        dressdiv.appendChild(countryNode);
                        container.appendChild(dressdiv);
                    }

                    container.appendChild(playerinfo);

                    // add dress
                    playerDressNode = getPlayerDress(playerid, doc);
                    if (playerDressNode != null) {
                        var dressdiv = doc.createElement("div");
                        dressdiv.className = "foxtrick-dress";
                        dressdiv.appendChild(playerDressNode);
                        container.appendChild(dressdiv);
                    }

                    break;
                  }
                   

                  case ("flags") : {
                    container.appendChild(playerinfo);
                    countryNode = getPlayerCountryNode(playerid, doc);
                    if (countryNode != null) {
                        var dressdiv = doc.createElement("div");
                        dressdiv.className = "foxtrick-flag foxtrick-flag-right";
                        dressdiv.appendChild(countryNode);
                        container.appendChild(dressdiv);
                    }

                    break;
                  }
                }
                
                // and insert the container
                
                tablecell.appendChild(container);
                links[i].imageInserted = "true";
            }
        }
    }
}

//---------------------------------------------------------------------------    
function findTeamId(document) {
  
  var links = document.links;
  
  for (var i=0; i < links.length; i++) {
    if ( links[i].href.match(/teamDetails\.asp/i) ) {
      return getTeamIdFromUrl(links[i].href);
    }
  }
  
  return null;
}

function foxtrick_findNationality(doc) {
  
  var links = doc.links;
  
  for (var i=0; i<links.length; i++) {
    if ( links[i].href.match(/changeLeagueSystem/i) ) {
      return getLeagueSystemIdFromUrl(links[i].href);
    }
  }
  
  return null;

}


//---------------------------------------------------------------------------    
function findConferenceFolderId(document) {
  var links = document.links;
  
  for (var i=0; i < links.length; i++) {
    if ( links[i].href.match(/menuforum\.asp/i) ) {
      return getConferenceFolderId(links[i].href);
    }
  }
  
  return null;
}


//---------------------------------------------------------------------------    
function findCountryId(document) {
  var links = document.links;
  
  for (var i=0; i < links.length; i++) {
    if ( links[i].href.match(/leaguesystemdetails\.asp/i) ) {
      return links[i].href.replace(/.+leagueid=/i, "").match(/^\d+/)[0];
    }
  }
  
  return null;
}

//---------------------------------------------------------------------------    
function findCountryId2(document) {
  var links = document.links;
  
  for (var i=0; i < links.length; i++) {
    if ( links[i].href.match(/leaguesystemid=/i) ) {
      return links[i].href.replace(/.+leaguesystemid=/i, "").match(/^\d+/)[0];
    }
  }
  
  return null;
}


//---------------------------------------------------------------------------    
function findTeamName(doc) {
   try {
     var temp = doc.getElementsByTagName("table")[0].rows[0].cells[0].textContent;
     return trim(temp.substring(11, temp.length));
   } catch (e) {
     return "";
   }
}

function foxtrick_getLinksElement(element, document, links, paddingTop, paddingBottom) {
	var container = document.createElement("p");
	container.style.paddingTop = paddingTop;
	container.style.paddingBottom = paddingBottom;

	for (var i=0; i<links.length; i++) {
		foxtrick_addlink(container, document, links[i]);
		if (i != links.length -1) {
			container.appendChild(document.createTextNode(" "));    
		}
	}
	return container;
}

//---------------------------------------------------------------------------    
function addlinks(element, document, links, paddingTop, paddingBottom) {
	var container = foxtrick_getLinksElement(element, document, links, paddingTop, paddingBottom);

	var firstChild = element.firstChild
	element.insertBefore(container, firstChild);

	if (firstChild.localName == "BR") {
		element.removeChild(firstChild);
	}
	element.externalLinksAdded = "true";
}

//---------------------------------------------------------------------------    
function addlinks2(element, document, links, paddingTop, paddingBottom) {
	var container = foxtrick_getLinksElement(element, document, links, paddingTop, paddingBottom);
	element.parentNode.insertBefore(container, element);
	element.externalLinksAdded = "true";

	if (element.localName == "BR") {
		element.parentNode.removeChild(element);
	}
	removeWhitespaceAndLineBreaksBeforeElement(container);
}

//---------------------------------------------------------------------------    
function addlinks3(element, document, links, paddingTop, paddingBottom) {
	var container = foxtrick_getLinksElement(element, document, links, paddingTop, paddingBottom);
	if (element.nextSibling != null) {
		element.parentNode.insertBefore(container, element.nextSibling);
	} else {
		element.parentNode.appendChild(container);
	}
	element.externalLinksAdded = "true";
	removeWhitespaceAndLineBreaksBeforeElement(container);
}

function removeWhitespaceAndLineBreaksBeforeElement(element) {

  if (element.previousSibling != null) {
    
    var temp = element.previousSibling;
    
    if (temp.nodeType == temp.TEXT_NODE) {
        if (trim(temp.textContent) == '') {
            temp.parentNode.removeChild(temp);
            return removeWhitespaceAndLineBreaksBeforeElement(element);
        }
    }
    
    if (temp.localName == "BR") {
       temp.parentNode.removeChild(temp);
       return removeWhitespaceAndLineBreaksBeforeElement(element);
    }

  }
  
}

function foxtrick_addlink(element, doc, link) {
    var target=element;
    target.appendChild(doc.createTextNode(" "));
    target.appendChild(link.link);
}

function addExternalLinksToPlayerDetail(doc) {
    
    if (isPlayerDetailUrl(doc.location.href)) {
        
        var teamid = findTeamId(doc);
        var nationality = foxtrick_findNationality(doc);
        var playerid = doc.location.href.replace(/.+playerID=/i, "").match(/^\d+/)[0];
    
        var form = null, age = null, tsi = null, exp = null;
        
        var infotable = null;
        
        for (var i=0; i < doc.links.length; i++) {
            if ( doc.links[i].href.match(/changeLeagueSystem/i) ) {
                infotable = findAncestor(doc.links[i], "TABLE");
                break;
             }
        }

        if (infotable != null) {        
    
            tsi = infotable.rows[2].cells[1].textContent.replace(/[\s]*/gi, "");
    
            for (var i=0; i < doc.links.length; i++) {
                if ( doc.links[i].href.match(/skillshort/i) ) {
                    form = getSkillLevelFromLink(doc.links[i]);
                    age = doc.links[i].previousSibling.textContent.match(/\d+/)[0];
                    break;
                 }
            }
        }
        
        // healing links
        
        // locate the place for insertion
        
        if (infotable != null) {
       
            var container = infotable.rows[6].cells[1];
            
            if (container.textContent.search(/\d+/) > -1) {
                
                var injuredweeks = container.textContent.match(/\d+/)[0];
 
                var links = getLinks("playerhealinglink", { "playerid": playerid,
                     "form": form, "age" : age, "injuredweeks" : injuredweeks, "tsi" : tsi }, doc );  
                
                for (var j=0; j< links.length; j++) {
                    var linkobj = links[j].link;
    
                    container.appendChild(doc.createTextNode(" "));
                    container.appendChild(linkobj);
                }
            }
        }

        
        if (infotable != null) {
            
            var stamina = 0, goalkeeping = 0, playmaking = 0, passing = 0,
                 winger = 0, defending = 0, scoring = 0, setpieces = 0;
           
            // locate the place for insertion
        
            var temp = doc.links;
            var count = 0;
            
            for (var i=0; i < temp.length; i++) {
                if ( temp[i].href.match(/gameRules\.asp\?find=labels/i) ) {
                    if ( temp[i].href.match(/skill/i) ) {
                        
                        count++;
                        
                        var value = parseInt(getSkillLevelFromLink(temp[i]));
                        if (count == 2) {
                                exp = value;
                                continue;
                        }
                        
                        if (count > 3) {

                            var skill = count - 3;
                            
                            switch (skill) {
                                case 1:
                                    stamina = value
                                    break;
                                case 2:
                                    goalkeeping = value;
                                    
                                    // keeper links
                                    
                                    if (goalkeeping > 3) {
      
                                      // fix for the links appearing on the coach page
                                      if (temp[i-1].href.match(/skill/i)) {
                                      
                                        var container = temp[i].parentNode;
                                        
                                        // keeper links
        
                                        var links = getLinks("keeperlink", { "playerid": playerid, "tsi" : tsi,
                                                                             "form" : form, "goalkeeping" : goalkeeping }, doc );  
                                       
                                        for (var j=0; j< links.length; j++) {
                                            var linkobj = links[j].link;
                                            container.appendChild(doc.createTextNode(" "));
                                            container.appendChild(linkobj);
                                        }
                                      }
                                    }
                                    
                                    break;
                                case 3:
                                    playmaking = value;
                                    break;
                                case 4:
                                    passing = value;
                                    break;
                                case 5:
                                    winger = value;
                                    break;
                                case 6:
                                    defending = value;
                                    break;
                                case 7:
                                    scoring = value;
                                    break;
                                case 8:
                                    setpieces = value;
                                    break;
                                    
                            }
                            skill++;
                        }
    
                    }
                }
            }

        }
        
        
        function addPlayerLinks(doc, links) {

            if (links.length > 0) {
    
                // a link
                for (var i=0; i < doc.links.length; i++) {
                    if ( doc.links[i].href.match(/transferHistory\.asp/i) ) {
                        if (typeof(doc.links[i].parentNode.externalLinksAdded) == 'undefined') {
                            addlinks2(doc.links[i], doc, links, "0px", "0px");
                            break;
                        }
                    }
                }
                
                // or a dropdown link form
                var temp = doc.getElementsByName("LinkForm");
                for (var i=0; i < temp.length; i++) {
                    if (typeof(temp[i].parentNode.externalLinksAdded) == 'undefined') {
                        addlinks2(temp[i], doc, links, "0px", "0px");
                        break;
                    }
                }
            }
        }
        
        // links
        
        var params = [];
        
        if (infotable != null) {
          params = {
                      "teamid": teamid, "playerid": playerid, "nationality": nationality,
                      "tsi" : tsi, "age" : age, "form" : form, "exp" : exp,
                      "stamina" : stamina, "goalkeeping" : goalkeeping, "playmaking" : playmaking,
                      "passing" : passing, "winger" : winger, "defending" : defending,
                      "scoring" : scoring, "setpieces" : setpieces
                   };
          addPlayerLinks(doc, getLinks("playerlink", params, doc ));
          addPlayerLinks(doc, getLinks("transfercomparelink", params, doc ));
                   
        } else {
          params = { "teamid": teamid, "playerid": playerid, "nationality": nationality };
          addPlayerLinks(doc, getLinks("playerlink", params, doc ));
        }

        
        // if exists a match link, link to team's lineup too

        if (getShowShortcut("matchlineup")) {
            
            // in supporter stats - hattrick now includes a match lineup link
            if (doc.location.href.search(/supporterstats/i) == -1) return;

            var matchlinks = getMatchDetailLinks(doc);

            if (doc.location.href.search(/SupporterStats/i) > -1) {
                var teamSelect = doc.getElementsByName("RequestedTeamID")[0];
                teamid = teamSelect.value;
            }

            for (var i=0; i<matchlinks.length; i++) {

              var matchlink = matchlinks[i];

                if (typeof (matchlink.externalLinksAdded) == 'undefined') {

                        var matchid = getMatchIdFromUrl(matchlink.href);

                        var lineuplink = doc.createElement("a");
                        lineuplink.href = "matchLineup.asp?matchID=" + matchid+ "&teamid=" + teamid;
                        lineuplink.appendChild(doc.createTextNode(messageBundle.GetStringFromName("foxtrick.shortcut.matchlineup")));

                        matchlink.parentNode.insertBefore(doc.createTextNode(")"), matchlink.nextSibling);
                        matchlink.parentNode.insertBefore(lineuplink, matchlink.nextSibling);
                        matchlink.parentNode.insertBefore(doc.createTextNode(" ("), matchlink.nextSibling);

                        matchlink.externalLinksAdded = "true";

                }
            }
        }
        

    }
    
}


//---------------------------------------------------------------------------    

function addNewsFeedLinks(doc) {
  
  if (doc.location.href.search(/start\.asp/i)>-1) {
    
    var links = getLinks("newslink", {}, doc );  

    var path = "//h3";
    var result = doc.evaluate(path,doc.documentElement,null,XPathResult.ANY_TYPE,null);
    result.iterateNext();
    var target = findSibling(result.iterateNext(), "BR");
    
    addlinks2(target, doc, links, "0px", "0px");
    
  }
  
}

//---------------------------------------------------------------------------    
function addExternalLinksToCountryDetail(doc) {

    if (isCountryDetailUrl(doc.location.href)) {
           
        var countryid = doc.location.href.replace(/.+leagueID=/i, "").match(/^\d+/)[0];
        var links = getLinks("countrylink", { "countryid": countryid }, doc );  
        
        if (links.length > 0) {

            // a link
        
            var temp = doc.links;
            
            for (var i=0; i < temp.length; i++) {
                if ( temp[i].href.match(/otherEvents\.asp/i) ) {
                    if (typeof(temp[i].parentNode.externalLinksAdded) == 'undefined') {
                        addlinks2(temp[i], doc, links, "0px", "0px");
                        break;
                    }
                }
            }
            
            // or a dropdown link form
            
            var temp = doc.getElementsByName("LinkForm");
            
            for (var i=0; i < temp.length; i++) {
                if (typeof(temp[i].parentNode.externalLinksAdded) == 'undefined') {
                    addlinks2(temp[i], doc, links, "0px", "0px");
                    break;
                }
            }
        }
    }
   
}
//---------------------------------------------------------------------------    

function foxtrick_addExternalLinksToFederationDetail(doc) {
  if (foxtrick_isFederationUrl(doc.location.href)) {
    
      var federationid = doc.location.href.replace(/.+allianceID=/i, "").match(/^\d+/)[0];
      var links = getLinks("federationlink", { "federationid": federationid }, doc );  

      if (links.length > 0) {

          // a link
      
          var temp = doc.links;
          
          for (var i=0; i < temp.length; i++) {
              if ( temp[i].href.match(/allianceRules\.asp/i) ) {
                  if (typeof(temp[i].parentNode.externalLinksAdded) == 'undefined') {
                      addlinks2(temp[i], doc, links, "0px", "0px");
                      break;
                  }
              }
          }
          
          // or a dropdown link form
          
          var temp = doc.getElementsByName("LinkForm");
          
          for (var i=0; i < temp.length; i++) {
              if (typeof(temp[i].parentNode.externalLinksAdded) == 'undefined') {
                  addlinks2(temp[i], doc, links, "0px", "0px");
                  break;
              }
          }
      }
    
  }
}

//---------------------------------------------------------------------------    

function addYouthPullLinks(doc) {
   if (doc.location.href.search(/\/club\.asp/i) > -1) {
        var path = "//h3";
        var result = doc.evaluate(path,doc.documentElement,null,XPathResult.ANY_TYPE,null);
        result.iterateNext();
        result.iterateNext();
        elem = result.iterateNext();
        
        var links = getLinks("youthpulllink", {  }, doc );  
        
        if (links.length > 0) {
          addlinks2(elem, doc, links, "0px", "0px");
        }
    }
}

function addArenaLinks(doc) {
   if (isArenaUrl(doc.location.href)) {
    
        var arenaTable = doc.getElementsByTagName("table")[2];

        var path = "//div[@class='rub2']";
        var result = doc.evaluate(path,doc.documentElement,null,XPathResult.ANY_TYPE,null);
        elem = result.iterateNext();
        
        var links = getLinks("arenalink", { "terraces" : trim(arenaTable.rows[6].cells[1].textContent),
                                            "basic": trim(arenaTable.rows[7].cells[1].textContent),
                                            "roof" : trim(arenaTable.rows[8].cells[1].textContent),
                                            "vip" : trim(arenaTable.rows[9].cells[1].textContent),  }, doc );  
        
        if (links.length > 0) {
          addlinks2(elem, doc, links, "0px", "0px");
        }
    }
}

function addYouthOverviewLinks(doc) {
	if (isYouthOverviewUrl(doc.location.href)) {
		var path = "//a[@id='ctl00_ctl00_CM_CIR_hypChallengeTeam']";
		var result = doc.evaluate(path,doc.documentElement,null,XPathResult.ANY_TYPE,null);
		elem = result.iterateNext();

		var links = getLinks("youthlink", { }, doc );  

		if (links.length > 0) {
			addlinks3(elem, doc, links, "0px", "0px");
		}
	}
}

//---------------------------------------------------------------------------    

function addChallengesLinks(doc) {

    if (isChallangespUrl(doc.location.href)) {
        
        var path = "body/table[1]/tbody/tr[1]/td[4]/h3[2]";
        var elem = doc.evaluate(path,doc.documentElement,null,doc.DOCUMENT_NODE,null).singleNodeValue;
        var links = getLinks("challengeslink", {  }, doc );  

        if (links.length > 0) {
          addlinks2(elem, doc, links, "0px", "0px");
        }
    }
   
}

//---------------------------------------------------------------------------    

function addEconomyLinks(doc) {

    if (isEconomyUrl(doc.location.href)) {
       
        var path = "body/table[1]/tbody/tr[1]/td[2]//table[3]";
        var elem = doc.evaluate(path,doc.documentElement,null,doc.DOCUMENT_NODE,null).singleNodeValue;
        
        var links = getLinks("economylink", {  }, doc );  

        if (links.length > 0) {
          addlinks3(elem, doc, links, "0px", "0px");
        }
    }
   
}

function getSeriesNum(leaguename) {
    if (!leaguename.match(/^[A-Z]+\.\d+/i)) {
         return "1";
    } else {
          return leaguename.match(/\d+/)[0];
    }
}

function getLevelNum(leaguename, countryid) {
    if (leaguename == null || countryid == null) return null;
  
    if (!leaguename.match(/^[A-Z]+\.\d+/i)) {
        
        // sweden
        if (countryid == "1") {
            if (leaguename.match(/^II[a-z]+/)) {
                return "3";
            }
            if (leaguename.match(/^I[a-z]+/)) {
                return "2";
            }
            return "1";
            
        }
        
         return "1";
    } else {
        var temp = foxtrick_romantodecimal(leaguename.match(/[A-Z]+/)[0]);
          
        // sweden
        if (countryid == "1") {
            return temp + 1;
        } else {

            return temp;
        }
    }
}


//---------------------------------------------------------------------------    
function addExternalLinksToTeamDetail(doc) {
  
    var links = null;
  
    if (isNationalTeamDetailsUrl(doc.location.href)) {
      
      links = getLinks("nationalteamlink", { "LeagueID": getLeagueIdFromUrl(doc.location.href),
                                             "LeagueOfficeTypeID": getLeagueOfficeTypeIDFromUrl(doc.location.href),
                                             "TeamID":getTeamIdFromUrl(doc.location.href)
                                           }, doc );
      
    } else if (isTeamDetailUrl(doc.location.href)) {
        
      var teamid = getTeamIdFromUrl(doc.location.href);
      var countryid = findCountryId(doc);
      var teamname = findTeamName(doc);
      var leaguename = extractLeagueNameFromTeamPage(doc);
      var levelnum = getLevelNum(leaguename, countryid);
      
      if (!leaguename.match(/^[A-Z]+\.\d+/i)) {
          leaguename="I";
      } else {
      }
       
      links = getLinks("teamlink", { "teamid": teamid, "teamname": teamname, "countryid" : countryid, "levelnum" : levelnum  }, doc );
        
    } else {
      return;
    }
    
    if (links.length > 0) {
        
      // find a place to insert the link
      
      // a link
      var temp = doc.links;
      
      for (var i=0; i < temp.length; i++) {
        if ( temp[i].href.match(/matches\.asp/i) ) {
          var target = isNationalTeamDetailsUrl(doc.location.href) ? temp[i] : findPreviousSibling(temp[i], "A");
          addlinks2(target, doc, links, "0px", "0px");
          break;
        }
      }
      
      // or a dropdown link form
      var temp = doc.getElementsByName("LinkForm");
      
      for (var i=0; i < temp.length; i++) {
        if (typeof(temp[i].parentNode.externalLinksAdded) == 'undefined') {
          addlinks2(temp[i], doc, links, "0px", "0px");
          break;
        }
      }
    }
    
    
}

function foxtrick_romantodecimal(roman) {
    
    // very very stupid ....
    switch (roman) {
        case ("I"): return 1;
        case ("II"): return 2;
        case ("III"): return 3;
        case ("IV"): return 4;
        case ("V"): return 5;
        case ("VI"): return 6;
        case ("VII"): return 7;        
        case ("VIII"): return 8;
        case ("IX"): return 9;
        case ("X"): return 10;
        default: return null;
    }

}

//---------------------------------------------------------------------------    
function addExternalLinksToLeagueDetail(doc) {
    
     if (isLeagueDetailUrl(doc.location.href)) {
        
        var leagueid = getLeagueLeveUnitIdFromUrl(doc.location.href);
        var countryid = findCountryId(doc);
        
        var leaguename = extractLeagueName(doc);
        var leaguename2 = leaguename;
        var leaguename3 = leaguename;
        
        var seriesnum = getSeriesNum(leaguename);
        var levelnum = getLevelNum(leaguename, countryid);
        
        if (!leaguename.match(/^[A-Z]+\.\d+/i)) {
            leaguename2="I";
            leaguename3="1";
        }
        
        var links = getLinks("leaguelink", { "countryid": countryid, "leagueid": leagueid, 
                                             "levelnum" : levelnum, "seriesnum": seriesnum,
                                             "leaguename" : leaguename, "leaguename2" : leaguename2, "leaguename3" : leaguename3 }, doc );  
        
        if (links.length > 0) {
            
            // find a place to insert the link
            
            // a link
        
            var temp = doc.links;
            
            for (var i=0; i < temp.length; i++) {
                if ( temp[i].href.match(/leagueFixtures\.asp/i) ) {
                   //var target = findPreviousSibling(temp[i], "DIV");
                   var target = temp[i];
                  
                   if (typeof(target.externalLinksAdded) == 'undefined') {
                      addlinks2(target, doc, links, "0px", "0px");
                      break;
                   }
                }
            }
            
            // or a dropdown link form
            
            var temp = doc.getElementsByName("LinkForm");
            
            for (var i=0; i < temp.length; i++) {
                if (typeof(temp[i].parentNode.externalLinksAdded) == 'undefined') {
                    addlinks(temp[i].parentNode, doc, links, "0px", "5px");
                    break;
                }
            }
        }
    }
}

//---------------------------------------------------------------------------    

function addMatchViewerLinksToDoc(doc, linkType) {
 
       // find a place to insert the link
        
        // a link

        if (typeof(doc["externalLinksAdded" + linkType]) == 'undefined') {
            
            var teamid;
            try {
                teamid = findTeamId(doc);
            } catch (e) {}

            var matches = doc.links;
            
            for (var i=0; i < matches.length; i++) {
            
                if ( matches[i].href.match(/live\.asp\?actionType\=addMatch/i) ) {
                    var matchid = getMatchIdFromUrl(matches[i].href);
                    var links = getLinks(linkType, { "matchid": matchid, "teamid" : teamid }, doc );  
                    
                    if (matches[i].nextSibling == null) {
                        matches[i].parentNode.appendChild(doc.createTextNode(" "));
                        
                        for (var j=0; j<links.length; j++) {
                            matches[i].parentNode.appendChild(links[j].link);
                            matches[i].parentNode.appendChild(doc.createTextNode(" "));
                        }
                        
                    } else {
                        var temp = doc.createTextNode(" ");
                        
                        matches[i].parentNode.insertBefore(temp, matches[i].nextSibling);
                        
                        for (var j=0; j<links.length; j++) {
                            var linkobj = links[j].link;
                            matches[i].parentNode.insertBefore(linkobj, temp.nextSibling);
                            matches[i].parentNode.insertBefore(doc.createTextNode(" "), linkobj);

                            temp = linkobj;
                        }
                        
                    }
                    
                }
            }
            
            doc["externalLinksAdded" + linkType]="true";
        }
    
    
}

function addMatchViewerLinks(doc, linkType) {
  if (!isMatchListUrl(doc.location.href) && !isUnplayedMatchDetail(doc)) return;
  addMatchViewerLinksToDoc(doc, linkType);
}

function isSupporterLink(href) {
  if (href.match(/addToSupporter/i)) return true;
  if (href.match(/updateLogo/i)) return true;
  return false;
}

function getSupporterStatus(doc) {
    
  if (doc.location.href.match(/menu\.asp/i)) {
  
  var temp = doc.links;
  
  for (var i=0; i < temp.length; i++) {
    if (temp[i].href.match(/notebook\.asp/i))  {
      if (temp[i].firstChild.localName == 'IMG') {
        if (temp[i].firstChild.src.match(/notes/)) {
          isSupporter = true;
          return;
        }
      }
    }
  }
  
  isSupporter = false;
          
  }

}

function foxtrick_isModernLineup(doc) {
  
  var path = "//div[@id='field']";
  var result = doc.evaluate(path,doc.documentElement,null,XPathResult.ANY_TYPE,null);
  if (result.iterateNext() != null) {
    return true;
  } else {
    return false;
  }
}
    
function adjustMatchLineup(doc) {
    
  if (isMatchLineupUrl(doc.location.href)) {
    
    if (!foxtrick_isModernLineup(doc)) {
      
      // mark player positions
      if (PrefsBranch.getCharPref("lineupColoring") != "no") {
        markPlayerPositions(doc);
      }
      
      // add faces/dresses
      var type = PrefsBranch.getCharPref("showFacesOrDresses");
      if ((type != "nothing")  && (isSupporter || (type == "flags"))) {
        addPlayerImages(doc, type);
      }
    }
     
  }

}

//---------------------------------------------------------------------------

function markPlayerPositions(doc) {
    
  var tables = doc.getElementsByTagName("table");
  
  for (var i=0; i<tables.length; i++) {
    var temp = tables[i].getAttribute("background");
    if (temp != null) {
      if (temp.match(/backlawn/)) {
        var rows = tables[i].rows;
        markPlayerPosition(rows, 0,1, "keeper", null);
        markPlayerPosition(rows, 1,0, "wingback", "right");
        markPlayerPosition(rows, 1,1, "centraldefender", "right");
        markPlayerPosition(rows, 1,2, "centraldefender", "left");
        markPlayerPosition(rows, 1,3, "wingback", "left");
        markPlayerPosition(rows, 2,0, "winger", "right");
        markPlayerPosition(rows, 2,1, "midfielder", "right");
        markPlayerPosition(rows, 2,2, "midfielder", "left");
        markPlayerPosition(rows, 2,3, "winger", "left");
        markPlayerPosition(rows, 3,1, "forward", "right");
        markPlayerPosition(rows, 3,2, "forward", "left");
        return;
      }
    }
  }
}

function markPlayerPosition(rows, i, j, position, side) {
    
    var cell = rows.item(i).cells.item(j);
    
    try {
        
        var text = cell.textContent.toLowerCase();
    
        if (text.indexOf(getRepositionText("midfielder")) > -1) {
            return setPlayerPositionClass(cell, "midfielder", null);
        }
        if (text.indexOf(getRepositionText("centraldefender")) > -1) {
            return setPlayerPositionClass(cell, "centraldefender", null);
        }
        if (text.indexOf(getRepositionText("forward")) > -1) {
            return setPlayerPositionClass(cell, "forward", null);
        }
    } catch (e) {
        return;
    }
    
    setPlayerPositionClass(cell, position, side);
    
}

function getIndividialOrder(text, order) {
    try {
         if (text.indexOf(getRepositionText(order)) > -1) {
            return order;
         } else {
            return "";
         }   
    } catch(e) {
        return "";
    }
}

function setPlayerPositionClass(cell, position, side) {
    
    var temp = "";
    var text = cell.textContent.toLowerCase();
    
    temp = temp + getIndividialOrder(text, "normal");    
    temp = temp + getIndividialOrder(text, "offensive");
    temp = temp + getIndividialOrder(text, "defensive");
    temp = temp + getIndividialOrder(text, "towardsmiddle");
    temp = temp + getIndividialOrder(text, "towardswing");
    
    if (temp == "") temp = "normal";
    temp=" foxtrick-" + temp;
    
    if (side != null) temp=temp + " foxtrick-"+side;
    
    cell.className = cell.className + " foxtrick-" + position + temp;
   
}

function getRepositionText(type) {
    
    try {
        var lang = PrefsBranch.getCharPref("htLanguage");
    } catch (e) {
        lang = "en";
    }
 
    var path = "hattricklanguages/language[@name='" + lang + "']/repositioning/reposition[@type=\"" + type + "\"]";
    var obj = htLanguagesXml.evaluate(path,htLanguagesXml,null,htLanguagesXml.DOCUMENT_NODE,null).singleNodeValue;
    
    var temp = obj.attributes.getNamedItem("value").textContent;
    
    return temp.toLowerCase();

}


//---------------------------------------------------------------------------
  function getPlayersInfo(doc) {
     
    if (isPlayersListUrl(doc.location.href) || isPlayerDetailUrl(doc.location.href)) {
      
      var type = PrefsBranch.getCharPref("showFacesOrDresses");
      
      var saveFace = type.indexOf("face") > -1;
      var saveDress = type.indexOf("dress") > -1;
      //var saveCountry = type.indexOf("flag") > -1;
      var saveCountry = true;

      // get faces and dresses only if the option is selected
      if ( ( saveDress || saveFace ) && isSupporter) {
        
        var divs = doc.getElementsByTagName("div");
        
        for (var i=0; i<divs.length; i++) {
            
          if (divs[i].className == "bgr") {
              
            var face = divs[i];
            var playerhref = isPlayerDetailUrl(doc.location.href) ?  doc.location.href : face.nextSibling.nextSibling.href;
            var playerid = playerhref.replace(/.+playerID=/i, "").match(/^\d+/)[0];
             
            try {
              
              // face
              
              if (saveFace) {
                
                var divBg = face.getElementsByTagName("div")[0];
               
                var divFace = divBg.getElementsByTagName("div")[0];
                var divEyes = divFace.getElementsByTagName("div")[0];
                var divNose = divEyes.getElementsByTagName("div")[0];
                var divMouth = divNose.getElementsByTagName("div")[0];
                
                var imgFace = divFace.getElementsByTagName("img")[0].src.replace(/.+Faces\//, "");
                var imgEyes  = divEyes.getElementsByTagName("img")[0].src.replace(/.+Faces\//, "");
                var imgNose  = divNose.getElementsByTagName("img")[0].src.replace(/.+Faces\//, "");
                var imgMouth = divMouth.getElementsByTagName("img")[0].src.replace(/.+Faces\//, "");
                
                foxtrick_savePlayerFace(playerid, imgFace, imgEyes, imgNose, imgMouth);
                
              }
              
              if (saveDress) {
              
                // shirt number
                
                var temp = isPlayerDetailUrl(doc.location.href) ? face.parentNode.parentNode.previousSibling.previousSibling : face.parentNode.previousSibling.previousSibling;
                var dressHTML = "";
    
                if (temp != null) {
                  if (temp.firstChild != null) {
                    if (temp.firstChild.innerHTML) {
                      dressHTML = temp.firstChild.innerHTML.replace(/title=\"[^\"]*\"/gi, "");
                    }
                  }
                }

                foxtrick_savePlayerDress(playerid, dressHTML);
                
              }
              
            } catch (e) {
              foxtrickdebug(e);
            }
          }
        }
      }

      // country
      
      if (saveCountry && isPlayerDetailUrl(doc.location.href)) {
        var country = findCountryId2(doc);
        var playerid = doc.location.href.replace(/.+playerID=/i, "").match(/^\d+/)[0];
        savePlayerCountry(playerid, country);
      }

    }
  }


// --------------------------------------------------

function getTransferSearchFrame(doc) {
    
    var forms = doc.getElementsByTagName("form");
    
    for (var i=0; i<forms.length; i++) {
        if (forms[i].action.match(/transferList\.asp/i)) return forms[i];
    }
    
    var frames = doc.getElementsByTagName("frame");
    
    for (var i=0; i<frames.length; i++) {
        var form = getTransferSearchFrame(frames[i].contentDocument);
        if (form != null) return form;
    }
    
    return null;
    
}

function addStyleSheet(doc, css) {
  
  var path = "head[1]";
  var head = doc.evaluate(path,doc.documentElement,null,doc.DOCUMENT_NODE,null).singleNodeValue;

  var link = doc.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  link.setAttribute("media", "all");
  link.setAttribute("href", css);
  head.appendChild(link);
    
}

function foxtrick_addJavaScript(doc, js) {
    
  var head = doc.getElementsByTagName("head")[0];    

  var script = doc.createElement("script");
  script.setAttribute("language", "JavaScript");
  script.setAttribute("src", js);
  head.appendChild(script);
  
  return script;
    
}

function foxtrick_addJavaScriptCode(doc, code) {
    
  var head = doc.getElementsByTagName("head")[0];    
  var script = doc.createElement("script");
  script.setAttribute("language", "JavaScript");
  script.innerHTML=code;
  head.appendChild(script);
    
}

function foxtrick_addMatchLineupStyleSheets(doc) {
  
  if (!isMatchLineupUrl(doc.location.href)) return;

  // default lineup coloring scheme
  if (PrefsBranch.getCharPref("lineupColoring") == "yes") {
      
    var style = PrefsBranch.getCharPref("lineupColoringStyle");
    addStyleSheet(doc, "chrome://foxtrick/content/resources/css/lineupcolors.css");
    
    if (style == "1") {
      addStyleSheet(doc, "chrome://foxtrick/content/resources/css/lineupcolors2.css");
    } else if (style == "2") {
      addStyleSheet(doc, "chrome://foxtrick/content/resources/css/lineupcolors2.css");
      addStyleSheet(doc, "chrome://foxtrick/content/resources/css/lineupcolors3.css");
    }
      
  }
  
}

function addStyleSheets(doc) {

  // bookmark notes coloring
  if (getShowTweak("bookmarkNotesColoring")) {
    if (isBookmarksUrl(doc.location.href)) {
      addStyleSheet(doc, "chrome://foxtrick/content/resources/css/bookmark_notes.css");
    }
  }

  if (!PrefsBranch.getBoolPref("useHattrickSkin")) {
      var cssSkin = encodeURIComponent(PrefsBranch.getCharPref("cssSkin"));
      var css = "jar:foxtrick://skins/" + cssSkin + "!/userContent.css";
      addStyleSheet(doc, css);
  }
  
  if (isPlayerDetailUrl(doc.location.href)) {
    if (getShowTweak("charactersPresentation1")) {
        addStyleSheet(doc, "chrome://foxtrick/content/resources/personality1/characters.css");    
    } else if (getShowTweak("charactersPresentation2")) {
        addStyleSheet(doc, "chrome://foxtrick/content/resources/personality2/characters.css");    
    }
  }
    
}

//---------------------------------------------------------------------------    
    
function addLeaveConferenceShortCut(doc) {
    
  if (!getShowShortcut("leaveconference")) return;
  
  if (isConferenceUrl(doc.location.href)) {
  
    var folderId = findConferenceFolderId(doc);
    
    var images = doc.getElementsByTagName("img");
    
    for (var i=0; i < images.length; i++) {
      if ( images[i].src.match(/low_prio_big\.gif/i)  ) {
      
        var link = doc.createElement("a");
        link.href = "cn.asp?a=leave&folderid=" + folderId;
        
        var img =  doc.createElement("img");
        img.src = "/common/images/icons/conf/leave.gif";
        
        link.appendChild(img);
        
        var target;
        
        if (images[i].parentNode.localname = "a") {
          target = images[i].parentNode;
        } else {
          target = images[i];
        }
        
        target.parentNode.insertBefore(link, target.nextSibling);
        target.parentNode.insertBefore(doc.createTextNode(" "), target.nextSibling);
      
      }
    
    }
  
  }

}

//------------------------------------------------------------

function isPlayedMatchDetail(doc) {
    
    if (!isMatchDetailUrl(doc.location.href)) return false;
    
    // identify played match by a present match lineup

     var links = doc.links;
     
     for (var i=0; i<links.length; i++) {
        if (isMatchLineupUrl(links[i].href)) return true;
     }
    
    return false;
    
}

//------------------------------------------------------------

function isUnplayedMatchDetail(doc) {
    
    if (!isMatchDetailUrl(doc.location.href)) return false;
    
    // identify played match by a present match lineup
    
     var links = doc.links;
     
     for (var i=0; i<links.length; i++) {
        if (isMatchLineupUrl(links[i].href)) return false;
     }
    
    return true;
    
}


function addPlayedMatchLinks(doc) {
    
    try {
   
     if (isPlayedMatchDetail(doc)) {
        addMatchViewerLinksToDoc(doc, "playedmatchlink");
     }    else {
               if (
                    (isMatchListUrl(doc.location.href) || isMatchArchiveUrl(doc.location.href)) &&
                    !isYouthMatchListUrl(doc.location.href)
                  ) {
                
                    if (typeof(doc["externalLinksAdded" + "playedmatchlink"]) == 'undefined') {
                      
                        var matchLineupStat = new Array();
                        matchLineupStat["teamlineup"] =  { 
                          "url" : "/Common/matchLineup.asp",
                  
                          "playedmatchlink" : { "path"       : "",
                                           "filters"    : new Array(), 
                                           "params"     : { "matchid" : "matchID",
                                                            "teamid" : "teamID" 
                                          }
                                         },
                          "openinthesamewindow" : "",
                          "title" : "Team lineup (match list)",
                          "shorttitle" : "(" + messageBundle.GetStringFromName("foxtrick.shortcut.matchlineup") + ")"
                        };
                      
                        
                        var commonparent = null;
                        
                        var matches = doc.links;
                        
                        var teamid = findTeamId(doc);
                        if (teamid == null) {
                            teamid = getTeamIdFromUrl(doc.location.href)
                        }
                        
                        for (var i=0; i < matches.length; i++) {
                            
                            if ( isMatchDetailUrl(matches[i].href) ) {
                                
                                if (commonparent == null) commonparent = matches[i].parentNode.parentNode.parentNode;
                                
                                var spanContainer = doc.createElement("span");
                                
                                if (matches[i].parentNode.parentNode.parentNode != commonparent) break;
                                
                                var tempLinks = matches[i].parentNode.parentNode.getElementsByTagName("a");
                                var htLiveLinkFound = false;
                                for (var j=0; j<tempLinks.length; j++) {
                                    if (isAddToHtLiveUrl(tempLinks[j].href)) {
                                      htLiveLinkFound = true;
                                      break;
                                    }
                                }
                                
                                if (htLiveLinkFound) break;
                                
                                var matchid = getMatchIdFromUrl(matches[i].href);
                                var links = getLinks("playedmatchlink", { "matchid": matchid, "teamid" : teamid }, doc );  
                                
                                spanContainer.style.paddingLeft="10px";
                                spanContainer.appendChild(doc.createTextNode(" "));
                               
                                if (getShowShortcut("matchlineupmatchlist") && !isCupMatchListUrl(doc.location.href)) {
                                    var links2 = getLinks2(matchLineupStat, "playedmatchlink", { "matchid": matchid, "teamid" : teamid }, doc, true);
                                    
                                    for (var j=0; j<links2.length; j++) {
                                        var linkobj = links2[j].link;
                                        spanContainer.appendChild(linkobj);
                                        spanContainer.appendChild(doc.createTextNode(" "));
                                    }
                                }
                                
                                for (var j=0; j<links.length; j++) {
                                    var linkobj = links[j].link;
                                    spanContainer.appendChild(linkobj);
                                    spanContainer.appendChild(doc.createTextNode(" "));
                                }

                                matches[i].parentNode.nextSibling.nextSibling.colSpan=2;
                                matches[i].parentNode.nextSibling.nextSibling.appendChild(spanContainer);
                                   
                            }
                        }
                        
                        doc["externalLinksAdded" + "playedmatchlink"]="true";
                    }
                    
                }
        
        
        
    }
    
} catch (e) {
    foxtrickdebug (e);
}
     
    
}

function getTactics(tactics) {
    
    try {
        var lang = PrefsBranch.getCharPref("htLanguage");
    } catch (e) {
        lang = "en";
    }
    
    try {
        
        var path = "hattricklanguages/language[@name='" + lang + "']/tactics/tactic[@value=\"" + tactics + "\"]";
        var obj = htLanguagesXml.evaluate(path,htLanguagesXml,null,htLanguagesXml.DOCUMENT_NODE,null).singleNodeValue;
        
        return obj.attributes.getNamedItem("type").textContent;    
    
    } catch (e) {
        return null; 
    }

}


function getLevelFromLink(link) {
    
  var baseValue = parseInt(link.href.replace(/.+labellevel=/i, "").replace(/.+ll=/i, "").match(/^\d+/)) - 1;
  
  if (PrefsBranch.getCharPref("ratingsstyle") == "old") {
    return (baseValue)/2;
  }

  try {
    var lang = PrefsBranch.getCharPref("htLanguage");
  } catch (e) {
    lang = "en";
  }
  
  var subLevel = trim(link.parentNode.textContent.replace(link.textContent, ""));
  var path = "hattricklanguages/language[@name='" + lang + "']/ratingSubLevels/sublevel[@text='" + subLevel + "']";
  var obj = htLanguagesXml.evaluate(path,htLanguagesXml,null,htLanguagesXml.DOCUMENT_NODE,null).singleNodeValue;
  var subLevelValue = parseFloat(obj.attributes.getNamedItem("value").textContent);    
  
  return baseValue+subLevelValue;
    
}

function getTacticsBaseLevelFromLink(link) {
  var baseValue = parseInt(link.href.replace(/.+labellevel=/i, "").match(/^\d+/));
  return baseValue;
}

function findSibling(elem, localName) {
 
  while (elem.nextSibling != null) {
    elem = elem.nextSibling;
    if (elem.localName == localName) return elem;
  }   
  return null;
    
}

function findAncestor(elem, localName) {
 
  while (elem.parentNode != null) {
    elem = elem.parentNode;
    if (elem.localName == localName) return elem;
  }   
  return null;
    
}


function findPreviousSibling(elem, localName) {
 
  while (elem.previousSibling != null) {
    elem = elem.previousSibling;
    if (elem.localName == localName) return elem;
  }   
  return null;
    
}


function addRatings(doc) {
    
    if (!isMatchDetailUrl(doc.location.href)) return;
    
    addStyleSheet(doc, "chrome://foxtrick/content/resources/css/matchgraphs.css");
    foxtrick_addJavaScript(doc, "chrome://foxtrick/content/resources/js/matchgraphs.js");
    
    try {
     var links = doc.links;
     
     var team1data = new Array();
     var team2data = new Array();
     var team1read = false;
     
     var possessiontable = null;
     
     for (var i=0; i<links.length; i++) {
        
        if (isMatchLineupUrl(links[i].href)) {
            
            var teamdata = (!team1read) ? team1data : team2data;
            
            var ratingstable, rowindex;
            
            if (doc.location.href.search(/Youth=True/) == -1) {
                ratingstable = findSibling(links[i], "TABLE")
                rowindex = 0;
            } else {
                ratingstable = findAncestor(links[i], "TABLE");
                rowindex = 2;
            }
            if (possessiontable == null) possessiontable = findPreviousSibling(links[i].parentNode.parentNode.parentNode.parentNode, "TABLE");
            
            var ratings = ratingstable.getElementsByTagName("a");
            
            var temp = ratings.length - 1;

            var tacticsText = trim(ratingstable.rows[rowindex + 1].cells[1].textContent);
            
            var tactics = getTactics(tacticsText);
            var tacticsLevel = 0;
            
            var tacticsLevelLinks = ratingstable.rows[rowindex + 2].cells[1].getElementsByTagName("a");
            if (tacticsLevelLinks.length > 0) {
                tacticsLevel = getTacticsBaseLevelFromLink(tacticsLevelLinks[0]);
            }
            
            var midfieldLevel = getLevelFromLink(ratings[temp-6]);
            teamdata["midfield"] = midfieldLevel;
            teamdata["midfieldText"] = ratings[temp-6].parentNode.textContent;
            
            var rdefence = getLevelFromLink(ratings[temp-5]);
            var cdefence = getLevelFromLink(ratings[temp-4]);
            var ldefence = getLevelFromLink(ratings[temp-3]);
            
            teamdata["rdefence"] = rdefence;
            teamdata["rdefenceText"] = ratings[temp-5].parentNode.textContent;
            teamdata["cdefence"] = cdefence;
            teamdata["cdefenceText"] = ratings[temp-4].parentNode.textContent;
            teamdata["ldefence"] = ldefence;
            teamdata["ldefenceText"] = ratings[temp-3].parentNode.textContent;
            
            var defenceLevel = ldefence + cdefence + rdefence; 
                                
            var rattack = getLevelFromLink(ratings[temp-2]);
            var cattack = getLevelFromLink(ratings[temp-1])                    
            var lattack = getLevelFromLink(ratings[temp-0])                    

            teamdata["rattack"] = rattack;
            teamdata["rattackText"] = ratings[temp-2].parentNode.textContent;
            teamdata["cattack"] = cattack;
            teamdata["cattackText"] = ratings[temp-1].parentNode.textContent;
            teamdata["lattack"] = lattack;
            teamdata["lattackText"] = ratings[temp-0].parentNode.textContent;

            var attackLevel = rattack + cattack + lattack; 
            
            for (var selectedRating in ratingDefs) {
                if (!getShowRating(selectedRating)) continue;

                var row = ratingstable.insertRow(ratingstable.rows.length);
    
                var cell = row.insertCell(0);
                cell.style.paddingTop = 8;
                cell.innerHTML = "<b>" + ratingDefs[selectedRating].label + "</b>";
                cell = row.insertCell(1);
                cell.style.paddingTop = 8;
                
                try {
                    if (typeof (ratingDefs[selectedRating]["total2"]) != 'undefined') {
                        if (tactics != null) {
                        cell.innerHTML = "<b>" + 
                                         ratingDefs[selectedRating]["total2"](midfieldLevel, lattack, cattack, rattack,
                                                                                             ldefence, cdefence, rdefence,
                                                                                             tactics, tacticsLevel
                                                                                             )
                                       + "</b>";
                                    }
                    } else {
                        cell.innerHTML = "<b>" + 
                                         ratingDefs[selectedRating]["total"](midfieldLevel, attackLevel, defenceLevel)
                                       + "</b>";
                    }
                 }
                catch (e) {
                }
                
                insertRatingsRow(ratingstable, ratingDefs[selectedRating], "defence",
                      messageBundle.GetStringFromName("foxtrick.matchdetail.defence"), defenceLevel);
                insertRatingsRow(ratingstable, ratingDefs[selectedRating], "special",
                      messageBundle.GetStringFromName("foxtrick.matchdetail.defence"),  rdefence, cdefence, ldefence);

                insertRatingsRow(ratingstable, ratingDefs[selectedRating], "midfield",
                      messageBundle.GetStringFromName("foxtrick.matchdetail.midfield"), midfieldLevel);
                insertRatingsRow(ratingstable, ratingDefs[selectedRating], "mystyle",
                      messageBundle.GetStringFromName("foxtrick.matchdetail.midfield"), midfieldLevel);
                      
                insertRatingsRow(ratingstable, ratingDefs[selectedRating], "attack",
                      messageBundle.GetStringFromName("foxtrick.matchdetail.attack"),  attackLevel);
                insertRatingsRow(ratingstable, ratingDefs[selectedRating], "special",
                      messageBundle.GetStringFromName("foxtrick.matchdetail.attack"),  rattack, cattack, lattack);

                row = ratingstable.insertRow(ratingstable.rows.length);
                
            }

           team1read = true;

        }


    }

    //extract team colors

     var imgs = possessiontable.getElementsByTagName("img");

     var color1 = "rgb(255,255,255)";
     var color2 = "rgb(0, 0, 0)";
    
    if (PrefsBranch.getCharPref("attackDefenseBars") != "no") {
         
         if (PrefsBranch.getCharPref("attackDefenseBars") == "yes") {
             var showLink = doc.createElement("a");
             showLink.innerHTML = messageBundle.GetStringFromName("foxtrick.matchdetail.moregraphs");
             showLink.className = "foxtrick-showgraphs";
             showLink.id = "foxtrick-showgraphs";
             showLink.href = "javascript:showGraphs();";
        
             var showLinkCell = possessiontable.insertRow(possessiontable.rows.length).insertCell(0);
             showLinkCell.colSpan = "3";
             showLinkCell.align = "center";
             showLinkCell.appendChild(showLink);
         }
        
         var row, cell;
         var pt1, pt2;
         var val1, val2;
         
         var rtext = messageBundle.GetStringFromName("foxtrick.matchdetail.rightshort");
         var ctext = messageBundle.GetStringFromName("foxtrick.matchdetail.centershort");
         var ltext = messageBundle.GetStringFromName("foxtrick.matchdetail.leftshort");

         var div = doc.createElement("div");
         div.className = "foxtrick-graphs";
         div.id = "foxtrick-graphs";
         div.setAttribute("align", "center");
         
         possessiontable.parentNode.insertBefore(div, possessiontable.nextSibling);

         if (PrefsBranch.getCharPref("attackDefenseBars") == "always") {
            div.style.display="block";
         }
                 
         var fgcolor1 = getContrastForegroundColor(color1);
         var fgcolor2 = getContrastForegroundColor(color2);
         
         var tempdiv = doc.createElement("div");
         tempdiv.className = "foxtrick-graphs-table";
         div.appendChild(tempdiv);
         
         row = doc.createElement("div");
         row.className = "foxtrick-graphs-row";
         tempdiv.appendChild(row);

         cell = doc.createElement("div");
         cell.className = "foxtrick-graphs-label";
         cell.innerHTML = messageBundle.GetStringFromName("foxtrick.matchdetail.defence");         
         row.appendChild(cell);

         cell = doc.createElement("div");
         cell.className = "foxtrick-graphs-label";
         cell.innerHTML = messageBundle.GetStringFromName("foxtrick.matchdetail.attack");         
         row.appendChild(cell);

         tempdiv = doc.createElement("div");
         tempdiv.className = "foxtrick-graphs-table";
         div.appendChild(tempdiv);
         
         addGraphRow2(doc, tempdiv, team1data["rdefence"], team2data["lattack"], rtext, ltext, team1data["rdefenceText"], team2data["lattackText"], color1, color2, fgcolor1, fgcolor2);
         addGraphRow2(doc, tempdiv, team1data["cdefence"], team2data["cattack"], ctext, ctext, team1data["cdefenceText"], team2data["cattackText"], color1, color2, fgcolor1, fgcolor2);
         addGraphRow2(doc, tempdiv, team1data["ldefence"], team2data["rattack"], ltext, rtext, team1data["ldefenceText"], team2data["rattackText"], color1, color2, fgcolor1, fgcolor2);

         tempdiv = doc.createElement("div");
         tempdiv.className = "foxtrick-graphs-table";
         div.appendChild(tempdiv);
         
         row = doc.createElement("div");
         row.className = "foxtrick-graphs-row";
         tempdiv.appendChild(row);

         cell = doc.createElement("div");
         cell.className = "foxtrick-graphs-label";
         cell.innerHTML = messageBundle.GetStringFromName("foxtrick.matchdetail.attack");         
         row.appendChild(cell);         
         
         cell = doc.createElement("div");
         cell.className = "foxtrick-graphs-label";
         cell.innerHTML = messageBundle.GetStringFromName("foxtrick.matchdetail.defence");         
         row.appendChild(cell);

         tempdiv = doc.createElement("div");
         tempdiv.className = "foxtrick-graphs-table";
         div.appendChild(tempdiv);

         addGraphRow2(doc, tempdiv, team1data["rattack"], team2data["ldefence"], rtext, ltext, team1data["rattackText"], team2data["ldefenceText"], color1, color2, fgcolor1, fgcolor2);
         addGraphRow2(doc, tempdiv, team1data["cattack"], team2data["cdefence"], ctext, ctext, team1data["cattackText"], team2data["cdefenceText"], color1, color2, fgcolor1, fgcolor2);
         addGraphRow2(doc, tempdiv, team1data["lattack"], team2data["rdefence"], ltext, rtext, team1data["lattackText"], team2data["rdefenceText"], color1, color2, fgcolor1, fgcolor2);
         
     }
     
     if (getShowTweak("matchDetailPlayerColoring")) {
        matchDetailPlayerColoring(doc, color1, color2);
     }


    } catch (e) {
        foxtrickdebug(e);
    }

}

function displayableRatingLevel(val) {
    
    if (PrefsBranch.getCharPref("ratingsstyle") == "old") {
        return (val-1)*2 + 1;
    }
    
     if (val.search(/\./i) == -1) return val + "--";
     val = val.replace(/\.75/i, "++");
     val = val.replace(/\.5/i, "+");
     val = val.replace(/\.25/i, "-");
     
     return val;
    
}


function addGraphRow2(doc, div, val1, val2, text1, text2, tooltip1, tooltip2,
                     color1, color2, fgcolor1, fgcolor2) {
    
     var div, span;
     var cellwidth=50;
     
     var dispval1 = displayableRatingLevel((val1+1)+"");
     var dispval2 = displayableRatingLevel((val2+1)+"");
     
     row = doc.createElement("div");
     row.className = "foxtrick-graphs-row";
     div.appendChild(row);
     
     pt1 = Math.round(100*val1/(val1+val2));
     pt2 = 100 - pt1;
     
     cell = doc.createElement("div");
     cell.className = "foxtrick-graphs-cell";
     cell.innerHTML = pt1 + "%";
     row.appendChild(cell);
     
     cell = doc.createElement("div");
     row.appendChild(cell);
     cell.className = "foxtrick-graphs-left-bar";

     var innercellA = doc.createElement("div");
     innercellA.className = "foxtrick-graphs-bar-container";
     innercellA.style.backgroundColor = color1;
     cell.appendChild(innercellA);
     
     var innercellB = doc.createElement("div");
     innercellB.className = "foxtrick-graphs-bar-inner";
     innercellB.style.backgroundColor = color2;
     innercellA.appendChild(innercellB);
     
     span = doc.createElement("span");
     span.innerHTML = "&nbsp;"; 
     innercellA.appendChild(span);

     var innercellC = doc.createElement("div");
     innercellC.className = "foxtrick-graphs-bar-values";
     innercellA.appendChild(innercellC);
     innercellC.innerHTML = text1 + " " + dispval1; 
     innercellC.style.color = fgcolor1;
     
     var val = Math.round((pt1/50)*cellwidth);
     val = val;
    
     innercellB.style.left = val;
     innercellB.style.width = (50-val > 0) ? 50-val  : 0;
     
     cell.title = tooltip1;
  
     cell = doc.createElement("div");
     row.appendChild(cell);
     cell.className = "foxtrick-graphs-right-bar";
     cell.style.backgroundColor = color2;
     val = Math.round((pt2/50)*cellwidth);
     val = (cellwidth-val);

     innercellA = doc.createElement("div");
     innercellA.className = "foxtrick-graphs-bar-container";
     innercellA.style.backgroundColor = color2;
     cell.appendChild(innercellA);

     innercellB = doc.createElement("div");
     innercellB.className = "foxtrick-graphs-bar-inner";
     innercellB.style.backgroundColor = color1;
     innercellB.style.width = val > 0 ? val : 0;
     innercellA.appendChild(innercellB);

     span = doc.createElement("span");
     span.innerHTML = "&nbsp;"; 
     innercellA.appendChild(span);

     innercellC = doc.createElement("div");
     innercellC.className = "foxtrick-graphs-bar-values";
     innercellA.appendChild(innercellC);
     innercellC.innerHTML = dispval2 + " " + text2; 
     innercellC.style.textAlign = "right";
     innercellC.style.color = fgcolor2;

     cell.title = tooltip2;
     
     //
     cell = doc.createElement("div");
     cell.className = "foxtrick-graphs-cell";
     cell.innerHTML = pt2 + "%";
     row.appendChild(cell);
    
}


function getRatingsRow(rating, midfieldLevel, attackLevel, defenceLevel) {

  var cells = "";
  
  for (var key in ratingDefs) {
    cells = cells + "<td style='padding: 0; margin: 0; border: 0;'>" +
    ratingDefs[key][rating](midfieldLevel, attackLevel, defenceLevel) + "</td>";
  }
  
  return cells;

}

function insertRatingsRow(table, rating, ratingType, label, midfieldLevel, attackLevel, defenceLevel) {
    
  if (typeof(rating[ratingType]) == 'undefined') return;
  
  var row = table.insertRow(table.rows.length);
  
  row.insertCell(0).innerHTML = label;
  row.insertCell(1).innerHTML= "<b>" + rating[ratingType](midfieldLevel, attackLevel, defenceLevel) + " </b>";
            
}


function trim(arg) {
  return arg.replace(/^\s+/, "").replace(/\s+$/, '');
}

function adjustFrameSizes(doc) {
  
 if (isMainPageUrl(doc.location.href)) {

   var path = "frameset/frameset/frameset[0]";
   var obj = doc.evaluate(path,doc,null,doc.DOCUMENT_NODE,null);

   var frames = doc.getElementsByTagName("frameset");

   if (PrefsBranch.getBoolPref("resizeMainFrame")) {
      var width = PrefsBranch.getIntPref("mainFrameWidth");
      frames[0].cols = "*, " + width + ", *";
   }

   if (PrefsBranch.getBoolPref("hideLogoFrame")) {
     frames[1].rows = "0,*,1";
   }

   if (PrefsBranch.getBoolPref("resizeMenuFrame")) {
     var width = PrefsBranch.getIntPref("menuFrameWidth");

     if (frames[2].cols.match(/^\d/)) {
       frames[2].cols = width + ", *";  
     } else {
       frames[2].cols = "*, " + width;  
     }

   }
 }
 
 if (isMenuUrl(doc.location.href)) {

   if (PrefsBranch.getBoolPref("resizeMenuFrame")) {
     var width = PrefsBranch.getIntPref("menuFrameWidth");
     
     var tables = doc.getElementsByTagName("table");
     
     tables[0].width=width - 7;
     
     for (var i=1; i<tables.length; i++) {
       tables[i].width=width - 9;
     }

   }
 }

 

  if (isMainConferenceUrl(doc.location.href)) {
    var frames = doc.getElementsByTagName("frameset");    

    if (PrefsBranch.getBoolPref("resizeMainFrame")) {
      var width = PrefsBranch.getIntPref("mainFrameWidth");
      frames[0].cols = "*, " + width + ", *";
    }
    
    if (PrefsBranch.getBoolPref("hideLogoFrame")) {
      frames[1].rows = "0,*";
    }
  }

}

function removeLinksToRules(doc) {
  if (getShowTweak("nolinkstorules")) {
    removeLinks(doc, /gameRules\.asp\?find=labels/i);
  }
}

function removeLinksToTeams(doc) {
  if (getShowTweak("hideteamlinksintransferlist")) {
    if (isTransferListUrl(doc.location.href)) {    
      removeLinks(doc, /teamDetails\.asp/i);
    }
  }
}


function removeLinks(doc, regexp) {
    
  var links = doc.links;
  var linkstoremove = new Array();
  var counter = 0;
  
  for (var i=0; i<links.length; i++) {
    if (links[i].href.search(regexp) > -1) {
      linkstoremove[counter++] = links[i];
    }
  }
  
  for (var i=0; i<linkstoremove.length; i++) {
    var replacement = doc.createElement("span");
    replacement.setAttribute("title", linkstoremove[i].getAttribute("title"));
    
    while (linkstoremove[i].firstChild) {
      replacement.appendChild(linkstoremove[i].firstChild);            
    }
    
    linkstoremove[i].parentNode.replaceChild(replacement, linkstoremove[i]);
  }

}

function getSkillLevelFromLink(link) {
  var value = link.href.replace(/.+(ll|labellevel)=/i, "").match(/^\d+/);   
  return value;
}

function addLevelNumbers(doc) {
    
  if (getShowTweak("addSkillLevelNumberTooltips")) {
  
    var links = doc.links;
    
    for (var i=0; i<links.length; i++) {
      if (links[i].href.search(/gameRules\.asp\?find=labels&(lt|labeltype)=skill&(ll|labellevel)/i) > -1) {
        links[i].setAttribute("title", links[i].textContent + " = " + getSkillLevelFromLink(links[i]));
      }
    }
  }

}

function createMatchOrdersTableBoxes(doc) {
    
    var tables = doc.getElementsByTagName("table");    
    for (var i=0; i<tables.length; i++) {
        var temp = tables[i].getAttribute("background");
        if (temp != null) {
            if (temp.match(/backlawn/)) {
                
                var rows = tables[i].rows;
                
                // formation box
                
                if (PrefsBranch.getBoolPref("showFormationBox")) {
                  
                    addStyleSheet(doc, "chrome://foxtrick/content/resources/css/formationbox.css");                  
                
                    var cell = rows[0].cells[2];                
                    
                    var div = doc.createElement("div");
                    div.className = "foxtrick-matchordersbox";
                    
                    var span = doc.createElement("span");
                    span.innerHTML = 
                     messageBundle.GetStringFromName("foxtrick.matchorders.formation") + ": ";
                    div.appendChild(span);
                    
                    span = doc.createElement("span");
                    span.id = "foxtrick-formationinfo";
                    div.appendChild(span);
                    div.appendChild(doc.createElement("br"));
                    
                    span = doc.createElement("span");
                    span.id = "foxtrick-formationinfo-players-cd";
                    div.appendChild(span);
                    
                    span = doc.createElement("span");
                    span.innerHTML = " " + messageBundle.GetStringFromName("foxtrick.matchorders.formationcds") +", ";
                    div.appendChild(span);
    
                    span = doc.createElement("span");
                    span.id = "foxtrick-formationinfo-players-im";
                    div.appendChild(span);
    
                    span = doc.createElement("span");
                    span.innerHTML = " " + messageBundle.GetStringFromName("foxtrick.matchorders.formationims") +", ";
                    div.appendChild(span);
    
                    span = doc.createElement("span");
                    span.id = "foxtrick-formationinfo-players-fwd";
                    div.appendChild(span);
    
                    span = doc.createElement("span");
                    span.innerHTML = " " + messageBundle.GetStringFromName("foxtrick.matchorders.formationforwards");
                    div.appendChild(span);
                    
                    cell.appendChild(div);
                
                }
                
                // flipsides box
                
                if (getShowTweak("flipsides")) {
                  var cell = rows[3].cells[3];
                    
                  var div = doc.createElement("div");
                  div.className = "foxtrick-matchordersbox";
                    
                  var flipsides = doc.createElement("a");
                  flipsides.innerHTML = messageBundle.GetStringFromName("foxtrick.matchorders.flipsides");
                  flipsides.href="javascript:foxtrick_flipsides()";
                  div.appendChild(flipsides);
                   
                  cell.appendChild(div);
               }

             }
        }
    }
}

function adjustMatchOrders(doc) {
    
  try {
    
    if (!isMatchOrdersUrl(doc.location.href)) return;
    
    foxtrick_addJavaScript(doc, "chrome://foxtrick/content/resources/js/matchorders.js");
    foxtrick_addJavaScript(doc, "chrome://foxtrick/content/resources/js/matchorders_flipsides.js");
    
    addStyleSheet(doc, "chrome://foxtrick/content/resources/css/matchorders.css");
    addStyleSheet(doc, "chrome://foxtrick/content/resources/css/dress.css");
    addStyleSheet(doc, "chrome://foxtrick/content/resources/css/face.css");
    
    createMatchOrdersTableBoxes(doc);

    var form = doc.forms.namedItem('matchOrders');
    
            
    // formation confirmation box
    
    if (getShowTweak("formationConfirmation")) {
        var mesg = messageBundle.GetStringFromName("foxtrick.formationconfirmation");
        mesg = mesg.replace("\r", "\\r").replace("\n", "\\n");
        form.setAttribute("onsubmit", "return formationconfirm('" + mesg + "');");
    }
    
    var createdFaces = new Array();
    
    var facesArchive = null;
    
    for (var i=0; i< form.elements.length; i++) {
        var select = form.elements.item(i);
        
        if (select.getAttribute("onclick")) {
            select.setAttribute("onclick", select.getAttribute("onclick") + "; computeFormation();");
        }
        
        select.setAttribute("onchange", select.getAttribute("onchange") + "; computeFormation();");
        
        if (select.name.match(/^beh/i)) {
            
            // repositioning orders
            
            continue;
            
            select.style.display="none";
            
            var div = doc.createElement("div");
            
            var arrowDiv = doc.createElement("div");
            arrowDiv.className = "foxtrick-leftarrow";
            arrowDiv.setAttribute ("onclick", "foxtrick_shiftPositionLeft('" + select.name + "'); computeFormation();" )
            arrowDiv.innerHTML = "&larr;";
            div.appendChild(arrowDiv);
            
            arrowDiv = doc.createElement("div");
            arrowDiv.className = "foxtrick-rightarrow";
            arrowDiv.setAttribute ("onclick", "foxtrick_shiftPositionRight('" + select.name + "'); computeFormation();" )
            arrowDiv.innerHTML = "&rarr;";
            div.appendChild(arrowDiv);
            
            var reposTextDiv = doc.createElement("div");
            reposTextDiv.className = "foxtrick-repostext";
            reposTextDiv.id = "foxtrick-reposition-" + select.name;
            reposTextDiv.innerHTML = select.options.item(select.selectedIndex).text;
            div.appendChild(reposTextDiv);
            
            select.parentNode.appendChild(div);
            
        } else if (select.name.match(/^id/i)) {
            
            continue;
            
            var div = doc.createElement("div");
            select.parentNode.appendChild(div);
            
            var playerContainer = doc.createElement("div");
            div.appendChild(playerContainer);

            var arrowDiv = doc.createElement("div");
            arrowDiv.className = "foxtrick-leftarrow";
            arrowDiv.setAttribute ("onclick", "foxtrick_shiftPlayerLeft('" + select.name + "');" )
            arrowDiv.innerHTML = "&larr;";
            div.appendChild(arrowDiv);
            
            arrowDiv = doc.createElement("div");
            arrowDiv.className = "foxtrick-rightarrow";
            arrowDiv.setAttribute ("onclick", "foxtrick_shiftPlayerRight('" + select.name + "');" )
            arrowDiv.innerHTML = "&rarr;";
            div.appendChild(arrowDiv);
            
            var option = select.options.item(select.selectedIndex);            
            var playerid = option.value;
            if (playerid == "0") continue;
/*            
            if (facesArchive == null) {
                
                var archiveDiv = doc.createElement("div");
                archiveDiv.style.display = "none";
                select.parentNode.appendChild(archiveDiv);

                for (var j=0; j<select.options.length; j++) {
                    var option = select.options[j];
                    var playerid = option.value;
                    var face = getPlayerFace(playerid, doc, "foxtrick-face1");
                    
                    if (face != null) {
                        face.id = "foxtrick-facearchive-" + playerid;
                        archiveDiv.appendChild(face);
                    }
                }
            }
            */
            
            var face = getPlayerFace(playerid, doc, "foxtrick-face1");
                
            if (face != null) {
                face.id = "foxtrick-" + select.name + "-" + playerid;
                playerContainer.appendChild(face);
                
            }
        }
    }
    
  } catch (e) {
    throw(e);
  }
    
}

function addTransferFormFilters(doc) {
    
   if (!isTransferSearchForm(doc.location.href)) return;
    
   foxtrick_addJavaScript(doc, "chrome://foxtrick/content/resources/js/transferform.js");   
   
   var links = doc.links;
   
   for (var k=0; k< links.length; k++) {
    
     if (links[k].href.search(/cheatreport\.asp/i) > -1) {
        
        var div = doc.createElement("div");
        
        links[k].parentNode.appendChild(div);
        
        var temp = doc.createElement("h3");
        temp.innerHTML = "Foxtrick Filters";
        div.appendChild(temp);

        div.style.paddingTop="8px";
        
        temp = doc.createElement("p");
        div.appendChild(temp);

         // filters
         
         var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
         var branch = prefObj.getBranch("foxtrick.formfiller.");
         
         var aCount = {value:0}; 
         
         var list = branch.getChildList("", aCount);
         list.sort();
         
         if (aCount.value>0) {
            for (var i=0; i< list.length; i++) {
              var link = doc.createElement("a");
              var filter = getTransferSearchFormFilter(list[i]);
              link.href = "javascript:fillTransferSearchForm2('" + filter +  "', document);";
              link.innerHTML = list[i];
              temp.appendChild(link);
              temp.appendChild(doc.createElement("br"));
            }
         }

       break;        
     }
  }

}

function getTransferSearchFormFilter(filterName) {
  var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
  var branch = prefObj.getBranch("foxtrick.formfiller.");
  return branch.getCharPref(filterName);
}

function addCoachLinks(doc) {
    
 if (doc.location.href.search(/training\.asp\?actionType=newTrainer/i) > -1 ) {
    
    for (var i=0; i<doc.links.length; i++) {
        if (doc.links[i].href.search(/training\.asp\?actionType=newTrainerPlayer/i) > -1) {

            var links = getLinks("coachlink", {  }, doc );  
            
            if (links.length > 0) {
                  addlinks3(doc.links[i], doc, links, "0px", "0px");
            }
        
         break;   
        }
        
    }
 }
    
}

function medalSets(doc) {
    
    if (PrefsBranch.getBoolPref("useHattrickMedals")) return;
    
    var set = foxtrick_getCharPref("medalSet");
    if (!set) return;

    var medalSet = encodeURIComponent(set);
    
    var images = doc.images;
    
    var medals = { "Trofe-01.gif" : "Cup",
                   "Trofe-02.gif" : "League",
                   "P1_purple.gif" : "1",
                   "P1_blue.gif" : "2",
                   "P1_green.gif" : "3",
                   "P1_red.gif" : "4",
                   "P1_orange.gif" : "5",
                   "P1_brown.gif" : "6",
                   "P1_dblue.gif" : "7",
                   "P1_pink.gif" : "8",
                   "P1_dgreen.gif" : "9",
                   "P1_black.gif" : "10",
                   "P1_lblue.gif" : "11"
                };
                
    if (isCountryDetailUrl(doc.location.href)) {
        medals = { "P1_purple.gif" : "W1",
                   "P2_purple.gif" : "W2",
                   "P3_purple.gif" : "W3",
                   "P1_blue.gif" : "U1",
                   "P2_blue.gif" : "U2",
                   "P3_blue.gif" : "U3"
                };        
    }
    
    var suffix = ".jpg";
    var base = "jar:foxtrick://medals/" + medalSet + "!/";
    
    var suffix;
    
    try{
    
        var temp = getMedalsDirectory();
        if (temp == null) return;
        temp.appendRelativePath(medalSet);
        var urlCreator = Components.classes["@mozilla.org/network/protocol;1?name=file"].getService(Components.interfaces.nsIFileProtocolHandler);
        var url = urlCreator.getURLSpecFromFile(temp);
        var skinInfoBundle = srGetStrBundle("jar:" + url + "!/info.properties");
        suffix = skinInfoBundle.GetStringFromName("suffix");
        
    } catch(e) {
        suffix = ".jpg";
    }

    for (var i=0; i<images.length; i++) {
        var img = images[i];
        if (img.src.search(/Trophy/i) > -1) {
            
            var temp = img.src.replace(/.+Trophy\//i, "");
            var medal = medals[temp];
            
            if (typeof(medal) != 'undefined') {
                img.src = base+medal+suffix;
            }
        }

    }

}

function bookmarkColor(link, regexp, title, color) {

   if (title.search(regexp) > -1) {
      link.childNodes[0].src = "chrome://foxtrick/content/resources/notes/" + color + ".png";
      title = title.replace(regexp, "");
   }
   
   return title;
    
}


//by Brzi_
function tlConfirmationBox(doc) {

    if (!isPlayerDetailUrl(doc.location.href)) return;
    if (!getShowTweak("tlconfirmation")) return;
    var f = doc.forms[1];
	if (!f.elements.namedItem("startbid")) return; //wrong form    

    foxtrick_addJavaScript(doc, "chrome://foxtrick/content/resources/js/tlconfirm.js");
   
    var mesg = messageBundle.GetStringFromName("foxtrick.tlconfirmation");
    mesg = mesg.replace("\r", "\\r").replace("\n", "\\n");
	var tlwarning = messageBundle.GetStringFromName("foxtrick.tlwarning");
	tlwarning = tlwarning.replace("\r", "\\r").replace("\n", "\\n");
    f.setAttribute("onsubmit", "return tlconfirm('" + mesg +"','" + tlwarning + "');");
    
}

// by Catalyst2950
function bidConfirmationBox(doc) {
    if (!isPlayerDetailUrl(doc.location.href)) return;
    if (!getShowTweak("bidconfirmation")) return;
    var f = doc.forms[0];
	if (!f.elements.namedItem("bid")) return; //wrong form
	
    foxtrick_addJavaScript(doc, "chrome://foxtrick/content/resources/js/bidconfirm.js");
   
    var mesg = messageBundle.GetStringFromName("foxtrick.bidconfirmation");
    mesg = mesg.replace("\r", "\\r").replace("\n", "\\n");
    f.setAttribute("onsubmit", "return bidconfirm('" + mesg + "');");
    
}

function convertGoogleCoordinate(val) {
    var x = (val.match(/\d+/i)[0].replace(/^0+/, ""));
    if (x == "") x = 0;
    var y = (val.match(/\d+\'/)[0].replace(/\'/, ""));
    if (y == "") x = 0;    
    
    x= parseInt(x);
    y= parseInt(y);
    
    return x + y/60;
}

function foxtrick_googleMaps(doc) {
    
 if (!isRegionUrl(doc.location.href)) return;
 
 foxtrick_addJavaScript(doc, "chrome://foxtrick/content/resources/js/googlemaps.js");
    
  var table = doc.getElementsByTagName("table")[2]; 
  
  var val1 = table.rows[5].cells[1].textContent;
  var val2 = table.rows[6].cells[1].textContent;
  
  var latit = convertGoogleCoordinate(val1);
  if (val1.search(/N/i) == -1) latit = -latit;
  
  var longi = convertGoogleCoordinate(val2);
  if (val2.search(/E/i) == -1) longi = -longi;
   
   var maplink = doc.createElement("a");
   maplink.innerHTML = "Google maps";
   maplink.href = "javascript:gmapopener('" + encodeURIComponent(latit) + "','" + encodeURIComponent(longi) + "');";
    
   var row = table.insertRow(table.rows.length);      
   var cell = row.insertCell(0);
   cell.appendChild(maplink);
    
}

//----------------------------------------------------

function bookmarksAdjustment(doc) {
    
 if (!isBookmarksUrl(doc.location.href)) return;
 
 addStyleSheet(doc, "chrome://foxtrick/content/resources/css/bookmark_comments.css");
 
 for (var i=0; i<doc.links.length; i++) {
    
    var link = doc.links[i];
    
    if (link.href.search(/addComment/i) > -1) {
        
        var title = link.childNodes[0].getAttribute("title");
        if (title != "") {
            
           title = bookmarkColor(link, /\[aqua\]/i, title, "aqua");
           title = bookmarkColor(link, /\[black\]/i, title, "black");
           title = bookmarkColor(link, /\[blue\]/i, title, "blue");
           title = bookmarkColor(link, /\[brown\]/i, title, "brown");
           title = bookmarkColor(link, /\[darkpurple\]/i, title, "darkpurple");
           title = bookmarkColor(link, /\[green\]/i, title, "green");
           title = bookmarkColor(link, /\[lightblue\]/i, title, "lightblue");
           title = bookmarkColor(link, /\[lightgreen\]/i, title, "lightgreen");
           title = bookmarkColor(link, /\[orange\]/i, title, "orange");
           title = bookmarkColor(link, /\[pink\]/i, title, "pink");
           title = bookmarkColor(link, /\[purple\]/i, title, "purple");
           title = bookmarkColor(link, /\[red\]/i, title, "red");
           title = bookmarkColor(link, /\[white\]/i, title, "white");
           title = bookmarkColor(link, /\[yellow\]/i, title, "yellow");

           if (getShowTweak("bookmarkscommentsdisplay")) {
              var playerrow = link.parentNode.parentNode;
              var row = doc.createElement("tr");
              var cell = doc.createElement("td");
              cell.colSpan = "3";
              cell.className = "foxtrick-bookmarkcomment";
              cell.innerHTML=title;
              row.appendChild(cell);
              playerrow.parentNode.insertBefore(row, playerrow.nextSibling);
           }
        }
        
    }

 }
    
}

function confSignatureTweak(doc) {
    
 if (!isConferenceUrl(doc.location.href)) return;    
 if (!getShowTweak("signaturetoggle")) return;
 

  addStyleSheet(doc, "chrome://foxtrick/content/resources/css/conference.css");
  foxtrick_addJavaScript(doc, "chrome://foxtrick/content/resources/js/conference.js");

  var path = "//div[@class='messageWrapper']/div[@class='signature']";
  var result = doc.evaluate(path,doc.documentElement,null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,null);
  for (var i=0; i< result.snapshotLength; i++) {
  	 var div = result.snapshotItem(i);
      
     div.style.display="none";   
     
     div.id = "foxtrick-signature-"+i;
     
     var showSig = doc.createElement("a");
     showSig.className="foxtrick-signaturetoggle";
     showSig.innerHTML = messageBundle.GetStringFromName("foxtrick.conferences.signaturetoggle");
     showSig.href = "javascript:toggleSignature(" + i + ");";
    
     var target = findSibling(div.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode, "DIV");
     target.insertBefore(showSig, target.firstChild);
 }
    
}

function getContrastForegroundColor(col) {
 
 var regexp = new RegExp("\\d+", "g");
 
 var r = regexp.exec(col)[0];
 var g = regexp.exec(col)[0];
 var b = regexp.exec(col)[0];
 
 var colors = new Array(new Array(0,0,0),
                        new Array(51,0,0),
                        new Array(0,0,51),
                        new Array(255,255,255),
                        new Array(153,255,255),
                        new Array(153,255,255),
                        new Array(255,153,255)
 );
 
 for (var i=0; i<colors.length; i++) {
  var color = colors[i];
    if (colorContrastTest(color[0],color[1],color[2], r,g,b)) {  
      return "rgb(" + color[0] + "," + color[1] + "," + color[2] +")";
    }
 }
 
 // not good, let's return white
 
 return "#FFFFFF";
    
}



// see http://www.w3.org/TR/AERT#color-contrast

function colorContrastTest(r1,g1,b1, r2,g2,b2) {
    
    var val1 = Math.abs(colorBrightness(r1,g1,b1) - colorBrightness(r2,g2,b2));
    
    // 125
    if (val1 < 125) {
     return false;   
    }

    var val2 = Math.abs(Math.max(r1,r2) - Math.min(r1,r2)) + (Math.max(g1,g2) - Math.min(g1,g2)) +
              (Math.max(b1,b2) - Math.min(b1,b2));
              
    if (val2 < 500) return false;
    
    return true;
    
}


function colorBrightness(r,g,b) {
  return (r*299 + g*587 + b*114)/1000;
}


// by wurmi
function matchDetailPlayerColoring(document, color1, color2) {
    
    if (!isMatchDetailUrl(document.location.href)) return;
   
    function styleLink(link, linkBgColor, linkFgColor) {
        
        var style;
        
        if (linkFgColor != null) {
          style = "{color: " + linkFgColor + " !important; font-weight: bold; text-decoration: none;}";
        } else {
          style =  "{color: " + getContrastForegroundColor(linkBgColor) + " !important; background: " +
          linkBgColor + " !important; padding: 0px 3px; border: gray 1px solid; text-decoration: none;}";
        }

        link.setAttribute("style", style);

    }


    var fcolor1 = null, fcolor2 = null;

    var tables = document.getElementsByTagName("TABLE");

    var teamA = tables[1].rows[0].cells[0].childNodes[10].nodeValue;
    var teamB = tables[1].rows[0].cells[0].childNodes[13].nodeValue;

    // Team B

    while (teamA.lastIndexOf(" - ") > -1) {
    	teamA = teamA.replace(/ - /, ", ");
    }

    var indexOfColon = teamA.lastIndexOf(": ");
    teamA = teamA.substring(indexOfColon+2, teamA.length-1);
    teamA = ", " + teamA;

    var playersOfTeamA = new Array(11);

    var index = 0;

    while (teamA.lastIndexOf(", ") > -1) {
    	var lastIndex = teamA.lastIndexOf(", ");
    	var newPlayerName = teamA.substring(lastIndex, teamA.length); 
    	newPlayerName = newPlayerName.replace(/, /, "");	

    	teamA = teamA.substring(0, lastIndex);
    	if (index < 11) {
    	    if (trim(newPlayerName) != "") {
    		    playersOfTeamA[index] = newPlayerName;
    		}
    	}
    	index++;
    }


    // Team B

    while (teamB.lastIndexOf(" - ") > -1) {
    	teamB = teamB.replace(/ - /, ", ");
    }

    indexOfColon = teamB.lastIndexOf(": ");
    teamB = teamB.substring(indexOfColon+2, teamB.length-1);
    teamB = ", " + teamB;
    
    var playersOfTeamB = new Array(11);
    
    index = 0;
    
    while (teamB.lastIndexOf(", ") > -1) {
    	lastIndex = teamB.lastIndexOf(", ");
    	newPlayerName = teamB.substring(lastIndex, teamB.length); 
    	newPlayerName = newPlayerName.replace(/, /, "");	
    	
    	teamB = teamB.substring(0, lastIndex);
    	if (index < 11) {
    	    if (trim(newPlayerName) != "") {
    		    playersOfTeamB[index] = newPlayerName;
    		}
    	}
    	index++;
    }
    
    
    // setting color for player's links
    
    var links = document.links;
    
    for (var g=0; g<links.length; g++) {
    	var linkTitle = links[g].textContent;
    	if (linkTitle != "") {
    		for (var j=0; j<playersOfTeamA.length; j++) { 
    			var lastIndexOfPlayer = linkTitle.lastIndexOf(playersOfTeamA[j]);
    			if (lastIndexOfPlayer > -1) {
    				styleLink(links[g], color1, fcolor1);
    				links[g].className += " foxtrick-colored-player";
    				break;
    			}
    		}
    		for (var j=0; j<playersOfTeamB.length; j++) { 
    			lastIndexOfPlayer = linkTitle.lastIndexOf(playersOfTeamB[j]);
    			if (lastIndexOfPlayer > -1) {
    				styleLink(links[g], color2, fcolor2);
    				links[g].className += " foxtrick-colored-player";
    				break;
    			}
    		}
    	}
    }	
    
    
    for (var g=0; g<links.length; g++) {
        var link = links[g];
        if (isPlayerDetailUrl(link.href) && (link.className.search(/foxtrick-colored-player/) == -1))  {
    		if (g>0 && links[(g-1)].style.backgroundColor != "" && links[(g-1)].textContent != "") {
    			newPlayer = links[g].textContent;
    			var newStyle = links[(g-1)].getAttribute("style");
    			for (var l=0; l<links.length; l++) {
    				if (links[l].textContent == newPlayer) {
                        links[l].setAttribute("style", newStyle);
                        links[l].className += " foxtrick-colored-player";    				    
    				}
    			}
    		} 	
    	}
    }
    
}





//---------------------------------------------------------------------------

// number formatter
// http://www.sitepoint.com/forums/showthread.php?t=129182

String.prototype.group = function( chr, size )
{
	if ( typeof chr == 'undefined' ) chr = ",";
	if ( typeof size == 'undefined' ) size = 3;
	return this.split( '' ).reverse().join( '' ).replace( new RegExp( "(.{" + size + "})(?!$)", "g" ), "$1" + chr ).split( '' ).reverse().join( '' );
}

function foxtrick_formatNumber(val) {
  return (val + "").group(" ");
}


function foxtrick_averageTransferPrice(doc)	{
    
    if (!isTransferCompareUrl(doc.location.href)) return;
   	if (!getShowTweak("transferCompareAveragePrice")) return;

    var table = doc.getElementsByTagName("table")[3];
    var count=table.rows.length-1;
    var totalPrice = 0;
    
    for (var i = 1; i<table.rows.length; i++) {
      if(table.rows[i].cells[2].innerHTML.match(/br/i)) {
        totalPrice+= parseInt(table.rows[i].cells[2].lastChild.textContent.replace(/\s/g, ""));
      }
    }
    
    if (count>0) {
        
        var currency = trim(table.rows[1].cells[2].textContent.match(/\D+$/)[0]);
        var row = table.insertRow(table.rows.length);
        var cell = row.insertCell(0);
        cell.setAttribute("style", "text-align: center; font-weight: bold");
        cell.colSpan= 2;
        cell.innerHTML=messageBundle.GetStringFromName("foxtrick.playertransfercompare.avgprice");
        cell = row.insertCell(1);
        var avgPrice = Math.round(totalPrice/count)+"";
        cell.innerHTML = avgPrice.group(" ") + " " + currency;
    }
}

/*
function markOwnplayersBySkill(doc) {
  
  if (!isPlayersListUrl(doc.location.href)) return;
  
  var links = doc.links;
  
  for (var i=0; i<links.length - 1; i++) {
    
    if (isPlayerDetailUrl(links[i].href) && !isPlayerDetailUrl(links[i+1].href)) {  
      var skillsTable = findSibling(links[i], "TABLE");
      if (skillsTable == null) {
        skillsTable = findSibling(findAncestor(links[i], "TABLE"), "TABLE");
      }
      
      function tmpSkill(r,c) {
        return parseInt(getSkillLevelFromLink(skillsTable.rows[r].cells[c].firstChild));
      }
      
      var skills = { keeper : tmpSkill(0,3),
                     pm : tmpSkill(1,1),
                     w  : tmpSkill(2,1),
                     def: tmpSkill(2,3),
                     scr: tmpSkill(3,1)
                   };

      function tmpGetPlayerClass(skills) {
        var bestSkill = null, bestSkillLevel = 5;
        for (skill in skills) {
          if (skills[skill] > bestSkillLevel) {
            bestSkillLevel = skills[skill];
            bestSkill = skill;
          }
        }
        return bestSkill;
      }
      
      //alert(links[i].textContent + "\n" + tmpGetPlayerClass(skills));
      
    }

            
  }
  
}

 */ 


function adjustPages(event)	{
    
  var doc = event.originalTarget;
  
  try {
    if (doc.nodeType != doc.DOCUMENT_NODE) {
      doc = doc.ownerDocument;
    }
  } catch (e) {
    foxtrickdebug(e);
  }
  
  try {

    var href = doc.location.href;    	
 
    if (isHattrickDocument(doc)) {

      var time=new Date();      

      callFoxtrickFunctions(foxtrick_functions, doc);

      var now=new Date();      
      
      dump("Foxtrick: ");
      dump((now.getSeconds() - time.getSeconds())*1000+now.getMilliseconds()  - time.getMilliseconds());
      dump("\n");
    
      try {
        addMatchViewerLinks(doc, "matchlink");
        
        if (isMatchListUrl(doc.location.href)) {
          addMatchViewerLinksToDoc(doc, "nextmatchlink");
        }
      } catch (e) {
        foxtrickdebug (e);
      }
    }
  
  } catch (e) {
    foxtrickdebug(e);
  }

}

function callFoxtrickFunction(func, doc) {
  try {
    func(doc);   
  } catch (e) {
    foxtrickdebug(e);
  }
}

function callFoxtrickFunctions(funcs, doc) {
  for (var i=0; i<funcs.length; i++) {
    callFoxtrickFunction(funcs[i], doc);
  }
}


var foxtrick_ShutdownObserver = {
  observe: function(subject,topic,data){

    try {
        
        dump("bla");
        
        return;
    
        var fileOutputStream = 
             Components.classes["@mozilla.org/network/file-output-stream;1"]
             .createInstance(Components.interfaces.nsIFileOutputStream);
    
        var dirLocator = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
        var xmlFile = dirLocator.get("ProfD", Components.interfaces.nsILocalFile);
        xmlFile.appendRelativePath("FoxTrick");
        xmlFile.appendRelativePath("players.xml");
    
        if ( !xmlFile.exists() ) xmlFile.create(xmlFile.NORMAL_FILE_TYPE, 0666);
             
        fileOutputStream.init(xmlFile , 2 , 0x200 , false );
    
        var xmlSerializer = new XMLSerializer();
        xmlSerializer.serializeToStream (window.document, fileOutputStream, "utf-8");
        var string = xmlSerializer.serializeToString (window.document);
    
     } catch (e) { alert(e); }
    
  }
    
};

try {
    
//    var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
//     observerService.addObserver(foxtrick_ShutdownObserver,"quit-application",false);
        
    //observerService.addObserver(foxtrick_ShutdownObserver,"xpcom-shutdown",false);


} catch (e) {
    foxtrickdebug (e);
}



function foxtrick_setStatusBarVisibility() {
  document.getElementById("foxtrick-status-bar").setAttribute("hidden", !PrefsBranch.getBoolPref("foxtrickInStatusBar"));
}


function getPlayerFaceCanvas(playerid, doc,div) {

    var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    var PlayerBranch = prefObj.getBranch("foxtrick.playerinfo." + playerid + ".");
    
    if (PlayerBranch.prefHasUserValue("face")) {
      
        var canvas = doc.createElement("canvas");
        canvas.setAttribute("width", "23");
        canvas.setAttribute("height", "19");

        var ctx = canvas.getContext('2d');

        // set transparency value
        //ctx.globalAlpha = 0.2;
        
        function drawImage(src, ctx) {
          var img = new Image();
          img.src = src;
          img.onload = function(){ctx.drawImage(img,0,0);}        
        }
        
        var prefix = "http://www.hattrick.org/Common/Images/Faces/"
        
        drawImage(prefix+ "bg.gif",ctx);
        drawImage(prefix+ PlayerBranch.getCharPref("face"),ctx);
        drawImage(prefix+ PlayerBranch.getCharPref("eyes"),ctx);
        drawImage(prefix+ PlayerBranch.getCharPref("mouth"),ctx);
        drawImage(prefix+ PlayerBranch.getCharPref("nose"),ctx);
              
        ctx.scale(0.45,0.45);
        
        return canvas;
        
    } else return null;
    
}


function getMatchOrdersTable(doc) {
    
    var tables = doc.getElementsByTagName("table");    
    for (var i=0; i<tables.length; i++) {
        var temp = tables[i].getAttribute("background");
        if (temp != null) {
            if (temp.match(/backlawn/)) {
                return tables[i];
            }
        }
    }
    
}

function extractPlayerList(doc) {
    var form = doc.forms.namedItem('matchOrders');
    var select = form.elements.namedItem('idKeeper');
    
    var i = select.options.length - 1;
    var playerlist = new Array();
    
    while (i>=0 && select.options[i].textContent != '') {
        
        if (select.options[i].textContent != '') {
            
            var playerName = trim(select.options[i].textContent.replace(/\d+/, ''));
            var playerNumber = select.options[i].textContent.match(/\d+/, '');
            playerNumber = (playerNumber != null) ? playerNumber[0] : "";
            var playerid = select.options[i].value;
            
            playerlist[playerid] = {"name" : playerName, "number" : playerNumber, "id" : playerid };
            
        }
      
      i--;
    }
    
    return playerlist;
    
    
}

function createPlayerDiv(doc, playerinfo) {
    var div = doc.createElement("div");
    var divid = "foxtrick-player-" + playerinfo["id"];
    div.setAttribute("style","display:table");
    div.id = divid;
    
    var temp = "";
    
    if (playerinfo["number"]) temp += "<b>" + playerinfo["number"] + "</b> ";
    temp += playerinfo["name"];
    div.innerHTML = "<div style=\"display:table-cell\">"+temp+"</div>";
    div.className = "foxtrick-playercontainer";

    foxtrick_addJavaScriptCode(doc, "function createPlayerDraggable"+ playerinfo["id"]+"() {try {new Draggable('" + divid + "',{revert:true}); } catch(e) {setTimeout('createPlayerDraggable"+ playerinfo["id"]+"();',200);}};  createPlayerDraggable"+ playerinfo["id"]+"();");
    
    return div;

}

function getTextRepresentionOfLevel(level) {
 
     try {
        var lang = PrefsBranch.getCharPref("htLanguage");
    } catch (e) {
        lang = "en";
    }
    
    var base = Math.ceil(Math.floor(level)/4);
    var temp = Math.floor(level) - (base-1)*4 - 1;
    temp = temp/4;
    
    var path = "hattricklanguages/language[@name='" + lang + "']/levels/level[@value='" + base + "']";
    var obj = htLanguagesXml.evaluate(path,htLanguagesXml,null,htLanguagesXml.DOCUMENT_NODE,null).singleNodeValue;
    
    var textvalue = obj.attributes.getNamedItem("text").textContent;
    
    return textvalue;
    
}

// -----------

function foxtrick_canCreatePlayerAd(doc) {

    var frameDoc = foxtrick_findFrame(doc, /playerDetails\.asp/i);
    if (frameDoc != null) {
        return true;
    }
    return false;
        
}


// --

function getPlayerAd() {
    var doc = window._content.document;
    doc = foxtrick_findFrame(doc, /playerDetails\.asp/i);
    createPlayerAd(doc);
}

function createPlayerAd(doc) {
    
    try {

        var ad="";
        
        var path = "//h1[1]";
        var obj = doc.evaluate(path,doc.documentElement,null,doc.DOCUMENT_NODE,null).singleNodeValue;
        
        // name and playerid
        
        for (var i=0; i< obj.childNodes.length; i++) {
            var child = obj.childNodes[i];
            // a stupid check for a text node
            if (child.localName == null) {
                ad += child.textContent;
            }
        }
        
        ad = (trim(ad.replace(/\((\d+)\)/, "[playerid=$1]")));
        ad += "\n";

        //age and form
        var range = doc.createRange();
        range.setStartAfter(obj);
        range.setEndAfter(obj.parentNode);
        ad += trim(range.toString().replace(/\t/gi, "").replace(/\n{3,}/gi, "\n").replace(/:(.*)/, ": [b]$1[/b]"));
        
        obj = findAncestor(obj, "TABLE");
    
        // personality + speciality
        
        var range = doc.createRange();
        range.setStartAfter(obj);
        var end = findSibling(obj, "TABLE");
        range.setEndBefore(end);
        ad += range.toString().replace(/\t/gi, "").replace(/\n{3,}/gi, "\n").replace(/:(.*)/, ": [b]$1[/b]");
        ad += "\n";
        
        // country, TSI wage, etc.
        var table = findSibling(obj, "TABLE");
        ad += trim(table.rows[0].cells[0].textContent) + "\t" + trim(table.rows[0].cells[1].textContent) + "\n";
        ad += trim(table.rows[1].cells[0].textContent) + "\t" + "[b]" + trim(table.rows[1].cells[1].textContent) + "[/b]" + "\n";
        ad += trim(table.rows[2].cells[0].textContent) + "\t" + trim(table.rows[2].cells[1].textContent) + "\n";
        ad += trim(table.rows[3].cells[0].textContent) + "\t" + trim(table.rows[3].cells[1].textContent) + "\n";
        ad += "\n";
    
        // skills
        var skillsTable = findSibling(table, "TABLE");
        
        function getAdjustedSkillLevelTextForAd(link) {
            var skillLevel = getSkillLevelFromLink(link);
            if (skillLevel == 5) {
                return "[i]" + link.textContent  + "[/i]";
            }
            if (skillLevel > 5) {
                return "[b]" + link.textContent  + "[/b]";
            }
            return link.textContent;
        }
        
        
        for (var i=0; i<skillsTable.rows.length; i++) {
            var row = skillsTable.rows[i];
            ad += trim(row.cells[0].textContent);
            ad += "\t";
            ad += getAdjustedSkillLevelTextForAd(row.cells[1].firstChild);
            ad += "\t";
            ad += trim(row.cells[2].textContent);
            ad += "\t";
            ad += getAdjustedSkillLevelTextForAd(row.cells[3].firstChild);
            
            ad += "\n";
        }
        
        foxtrick_putTextToClipboard(ad);

    } catch (e) {
        alert(e);
    }
    
}

function foxtrick_putTextToClipboard(text) {
	var clipboard = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
	clipboard.copyString(text);
}

// slider alerts
// (windows only)

function foxtrick_showEventAlert(doc){
    
  if (!isNewsFlashUrl(doc.location.href)) return;
  
  try {
    var expreg = new RegExp ( 'href="(.*)" target="main" class="messBold">(.+)</a>', "igm" );
    var scriptsrc = doc.getElementsByTagName("script")[0].text;
    
    var tmp = expreg.exec(scriptsrc);
    
    if (tmp != null) {
      if (tmp[1] != "myHattrick.asp") {
        if (PrefsBranch.getBoolPref("alertSlider")) {
            foxtrick_showAlert(tmp[2]);
        }
        if (PrefsBranch.getBoolPref("alertSliderGrowl")) {
            foxtrick_showAlertGrowl(tmp[2]);
        }
        if (PrefsBranch.getBoolPref("alertSound")) {
           try {
             foxtrick_playSound(PrefsBranch.getCharPref("alertSoundUrl"));
           } catch (e) {
             foxtrickdebug(e);
           }
        }
      }
    }
  } catch(e) {
//    alert(e);
  }
}    

function foxtrick_showAlert(text) {
  try{
    var alertsService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
    var img = "http://hattrick.org/favicon.ico";
    var title = "Hattrick.org";
    var clickable = false;
    alertsService.showAlertNotification(img, title, text, clickable, "", null);
  } catch (e) {}
}

function foxtrick_showAlertGrowl(text) {
	try {
		var grn = Components.classes["@growl.info/notifications;1"].getService(Components.interfaces.grINotifications);
		var img = "http://hattrick.org/favicon.ico";
		var title = "Hattrick.org";
		grn.sendNotification(title, img, title, text, null);
	} catch (e) {}
}

//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
//---------------------------------------------------------------------------

var isSupporter = false;

var foxtrick_functions = 
      [ adjustFrameSizes,
        foxtrick_addMatchLineupStyleSheets,
        addStyleSheets,
        getSupporterStatus,
        //markOwnplayersBySkill,
        addExternalLinksToPlayerDetail,
        addExternalLinksToLeagueDetail,
        addExternalLinksToTeamDetail,
        addExternalLinksToCountryDetail,
        addNewsFeedLinks,
        addYouthPullLinks,
        addChallengesLinks,
        addEconomyLinks,
        addPlayedMatchLinks,
        getPlayersInfo,
        foxtrick_starCounter,
        adjustStars,
        adjustMatchLineup,
        addLeaveConferenceShortCut,
        addLevelNumbers,
        addRatings,
        adjustMatchOrders,
        addCoachLinks,
        addTransferFormFilters,
        medalSets,
        bookmarksAdjustment,
        bidConfirmationBox,
        tlConfirmationBox,
        foxtrick_googleMaps,
        matchincome,
        confSignatureTweak,
        playerListStats,
        goalDifference,
        foxtrick_seriesHistoryGraph,
        flagsInCountriesList,
        foxtrick_averageTransferPrice,
        removeLinksToRules,
        removeLinksToTeams,
        economicalDifference,
        playerDetailCountryFlag,
        foxtrick_showEventAlert,
        foxtrick_specialists,
//        economistsCalculator,
        foxtrick_modifyDates,
        foxtrick_addTeamLinkPopups,
		foxtrick_FlagsCounter,
		foxtrick_MedianTransferPrice,
		foxtrick_addPostTemplates,
		foxtrick_flagsInConferences,
		//foxtrick_colorStaffNicksInConferences,
		foxtrick_adjustPlayerBackgrounds,
		foxtrick_addExternalLinksToFederationDetail,
		teamLogoBelow,
		addArenaLinks,
		addYouthOverviewLinks
      ];


// create stats Hash

var foxtrickStatsHash = new Array();
for (key in stats) {
  var stat = stats[key];
  for (prop in stat) {
    if (prop.match(/link/)) {
      if (typeof(foxtrickStatsHash[prop]) == 'undefined') {
       foxtrickStatsHash[prop] = new Array();
      }
      foxtrickStatsHash[prop][key] = stat;
    }
  }
}

//

window.addEventListener('DOMContentLoaded', adjustPages, false);
window.addEventListener("load", foxtrick_setStatusBarVisibility, false);
