// Bummerland (2048399):	Original idea and GreaseMonkey programming
// CHPP-ste1n (487162):		user2league PHP script + interface to GreaseMonkey script
// 												staff highlighting


function foxtrick_clearUserinfoBranch() {

  var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
  var branch = prefObj.getBranch("foxtrick.userinfo.");

  var aCount = {value:0}; 
  var list = branch.getChildList("", aCount);
  dump ("Foxtrick userinfos saved: #" + list.length + "\n");
  
//  if (list.length > 10000) {
    dump ("Foxtrick: deleting userinfobranch\n");
    branch.deleteBranch("");
//  }
}

foxtrick_clearUserinfoBranch();

function foxtrick_getUserinfoBranch(userid) {
  var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
  return prefObj.getBranch("foxtrick.userinfo." + userid + ".");
}

function foxtrick_saveUserCountry(userid, flag, countryName) {

  var userBranch = foxtrick_getUserinfoBranch(userid);
  userBranch.setCharPref("flag", flag);
  userBranch.setCharPref("countryName", countryName);
  
}


function foxtrick_getUserCountry(userid) {

  var userBranch = foxtrick_getUserinfoBranch(userid);
  if (userBranch.prefHasUserValue("flag")) {
    
    dump ("Foxtrick UserCountry hit: uid=" + userid + "\n");
    
    return { flag : userBranch.getCharPref("flag"),
             name : userBranch.getCharPref("countryName")
           };
  }
  
  dump ("Foxtrick UserCountry miss: uid=" + userid + "\n");
  
  return null;
}


function foxtrick_flagsInConferences(document) {
  
    if (!getShowTweak("flagsInConferences")) return;
  
    var loc = document.location.href;
    if ((loc.search(/cn\.asp/i) == -1) && (loc.search(/cnB\.asp/i) == -1) && !foxtrick_isGuestbookUrl(loc) && !foxtrick_isSupporterListUrl(loc)) return;
   
	var userHash = {};
	
	function addUserLink(uid, a) {
	  if (typeof(userHash[uid]) == 'undefined') userHash[uid]= [];
	  userHash[uid][userHash[uid].length] = a;
	}
	
	var style="";
	var linebreak=false;
	
	if (loc.search(/cn\.asp/i) > -1) {
	  
    	var users = document.evaluate(
    	    "//div[@class='messageHeader']",
    	    document,
    	    null,
    	    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    	    null);
    	    
    	for (i=0; i< users.snapshotLength; i++){
    		var user = users.snapshotItem(i);
    		var as = user.getElementsByTagName('a');
    		
    		for (var j=0; j<as.length; j++) {
    		  var a = as[j];
    		  if (a.getAttribute("href").search(/teamdetails/i) == -1) continue;
    		  
              var fs = a.getElementsByTagName('span');
              var hrefl = a.getAttribute("href");
              var namel = trim(fs[0].textContent);
        		
        		if (getShowTweak("colorStaffNicksInConferences")) {
            		htreg = /^HT-/i;
            		gmreg = /^GM-/i;
            		modreg = /^MOD-/i;
            		chppreg = /^CHPP-/i;
            		lareg = /^LA-/i;
            		if (htreg.test(namel)) {
            			fs[0].innerHTML = "<SPAN style=\"background: red\"><B>" + namel + "</B></SPAN>";
            		} else if (gmreg.test(namel)) {
            			fs[0].innerHTML = "<SPAN style=\"color: black; background: orange\"><B>" + namel + "</B></SPAN>";
            		} else if (modreg.test(namel)) {
            			fs[0].innerHTML = "<SPAN style=\"color: black; background: yellow\"><B>" + namel + "</B></SPAN>";
            		} else if (chppreg.test(namel)) {
            			fs[0].innerHTML = "<SPAN style=\"background: blue\"><B>" + namel + "</B></SPAN>";
            		} else if (lareg.test(namel)) {
            			fs[0].innerHTML = "<SPAN style=\"color: green; background: white\"><B>" + namel + "</B></SPAN>";
                    }
            	}
    
              addUserLink(extractUid(hrefl), a);
          }
    	}

    } else if ( (loc.search(/cnB\.asp/i) > -1) || foxtrick_isGuestbookUrl(loc) || foxtrick_isSupporterListUrl(loc) ) {

		var as = document.links;
		for (var i = 0; i < as.length; i++) {
			var a = as[i];
			h = a.getAttribute("href");
			if (h.substring(0, 23) == "teamDetails.asp?UserID="){
				idreg = /(\d+)/;
				theid = idreg.exec(h);
				addUserLink(theid[1], a);
			}
		}

		style ="margin-right:3px; padding-left:3px; background-repeat: repeat-x; background-position: 0% 50%;";
		style+="-moz-opacity: 0.9; background-image: url(chrome://foxtrick/content/resources/flag_background_grey.png);"
		linebreak = !foxtrick_isGuestbookUrl(loc);

	}
	
	for (var uid in userHash) {
	  foxtrick_attachCountryFlagToUser(uid, userHash[uid], document, style, linebreak);	
	}
		
}

function extractUid(hrefl){
	idreg = /(\d+)/;
	uid = idreg.exec(hrefl.replace(/&/, "?"));
	return uid[1];
}

function foxtrick_attachCountryFlagToUser(uid, linksArray, document, style, linebreak){
	
	var flagspage = "http://flags.alltidhattrick.org/userflags/";
	var linkpage = "http://stats.alltidhattrick.org/user/";
	var target = "_blank";

	// See if we have the Alltid Extension installed. If we do we want to show the 
	//  user profile page as a HT-themed page inside the current frame. This makes
	//  for nicer integration
	var em = Components.classes["@mozilla.org/extensions/manager;1"]
	                   .getService(Components.interfaces.nsIExtensionManager);
	var addon = em.getItemForID("{fd048119-78ee-487f-8fb1-1668d3a6859b}");
	if (addon) {
		var version = addon.version;
		if (version.substr(0,1) >= 2) {
			linkpage = "http://supporter.alltid.org/theme/ht/user/";
			target = "_self";
		}
	}
	
    for (var i=0; i<linksArray.length; i++) {
      var link = linksArray[i];
      var mySpan = document.createElement('span');
	  mySpan.innerHTML = ' <a href="' + linkpage + uid + '" target="' + target + '"><img style="vertical-align: bottom; ' + style + '" src="' + flagspage + uid + '.gif" border="0" height="12" /></a>';
	  
	  if (linebreak) {
	     link.parentNode.appendChild(document.createElement('br'));
	     mySpan.setAttribute("style", "margin-top:2px;");
	     link.parentNode.appendChild(mySpan);
	  } else {
	  
    	  var target = link;
    	  if (link.previousSibling != null) target = link.nextSibling;
    	  
    	  var nextLink = findSibling(link, "A");
    	  if (nextLink != null) {
    	    if (nextLink.href.search(/aboutsupporter/i) > -1) {
    	      target = nextLink.nextSibling;
    	    }
    	  }
    	  
    	  link.parentNode.insertBefore(mySpan, target);
    	  
    	}
    }
	
}
