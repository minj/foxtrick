function teamLogoBelow ( document ) {
    if (!isTeamDetailUrl(document.location.href)) return;
	if (!getShowTweak("teamLogoBelow")) return;

	var path = "body/table[1]/tbody/tr[1]/td[2]/table[1]/tbody/tr[1]/td[1]/table[2]/tbody/tr[1]/td[2]/table[1]/tbody/tr[1]/td[1]";
	var elem = document.evaluate(path,document.documentElement,null,document.DOCUMENT_NODE,null).singleNodeValue;
	elem.setAttribute("style", "display:block;Overflow: visible;z-index:-1");
	var path = "body/table[1]/tbody/tr[1]/td[2]/table[1]/tbody/tr[1]/td[1]/table[2]/tbody/tr[1]/td[2]";
	var elem = document.evaluate(path,document.documentElement,null,document.DOCUMENT_NODE,null).singleNodeValue;
	elem.setAttribute("width", "180px");
	elem.setAttribute("align", "left");
	var path = "body/table[1]/tbody/tr[1]/td[2]/table[1]/tbody/tr[1]/td[1]/table[2]/tbody/tr[1]/td[2]/table[1]";
	var elem = document.evaluate(path,document.documentElement,null,document.DOCUMENT_NODE,null).singleNodeValue;
	elem.setAttribute("align", "left");	
}

function economicalDifference ( document ) {
  
    if (!isEconomyUrl(document.location.href)) return;
    if (!getShowTweak("economicalDifference")) return;

	var tableLast;
    var tableCurr;
    var j = 0;
    var bodies = document.getElementsByTagName("tbody");

    //find correct tables
    for (var i = 0; i < bodies.length; i++) {
        if (j==0 && bodies[i].rows.length==10) {
            j=1;
            tableCurr = bodies[i];
        }
        else if (j==1 && bodies[i].rows.length==10) {
            tableLast = bodies[i];
            break;
        }
    };
    
    var path = "body/table[1]/tbody/tr[1]/td[2]";
    var elem = document.evaluate(path,document.documentElement,null,document.DOCUMENT_NODE,null).singleNodeValue;
    
    var newTabDiff = elem.appendChild ( tableCurr.parentNode.cloneNode(true) );
    
    newTabDiff.setAttribute("style", "margin-bottom: 10px");
    var newRowsDiff = newTabDiff.tBodies[0].rows;

    newRowsDiff[0].cells[0].innerHTML = '<div class="RUB2">' + messageBundle.GetStringFromName("foxtrick.economicaldifference.balance") + '</div><br />';

    function extractAmount(cell) {
        return parseInt(cell.textContent.replace(/\s*/g, ""));
    }
    
    function getColorStyle(val) {
       if (val < 0) {
         return 'style="color: #CC0000"';
       } else if (val > 0) {
         return 'style="color: #267F30"';
       }
       return '';
    }

    for (var i = 2; i < 9; i++) {
        if ((i != 6) && (i != 7)) {
           lastWeekVal = extractAmount(tableLast.rows[i].cells[1]);
           thisWeekVal = extractAmount(tableCurr.rows[i].cells[1]);
           resultDiff = thisWeekVal - lastWeekVal;
	       resultSum = thisWeekVal + lastWeekVal;
           resultDiff = '<span ' + getColorStyle(resultDiff) + '>' + String(resultDiff).group(' ', 3) + '</span>';
           resultSum = String(resultSum).group(' ', 3);
           newRowsDiff[i].cells[1].innerHTML = resultDiff + "<br />" + resultSum ;
        };
        lastWeekVal = extractAmount(tableLast.rows[i].cells[4]);
        thisWeekVal = extractAmount(tableCurr.rows[i].cells[4]);
        resultDiff = thisWeekVal - lastWeekVal;
	    resultSum = thisWeekVal + lastWeekVal;
        resultDiff = '<span ' + getColorStyle(-resultDiff) + '>' + String(resultDiff).group(' ', 3) + '</span>';
        resultSum = String(resultSum).group(' ', 3);
        newRowsDiff[i].cells[4].innerHTML = resultDiff + "<br />" + resultSum;
    };

    lastWeekVal = extractAmount(tableLast.rows[9].cells[1]);
    thisWeekVal = extractAmount(tableCurr.rows[9].cells[1]);

    resultDiff = thisWeekVal - lastWeekVal;
    resultSum = thisWeekVal + lastWeekVal;

    resultDiff = '<span ' + getColorStyle(resultDiff) + '>' + String(resultDiff).group(' ', 3) + '</span>';
    resultSum = '<span ' + getColorStyle(resultSum) + '>' + String(resultSum).group(' ', 3) + '</span>';
	newRowsDiff[9].cells[1].innerHTML = "<b>" + resultDiff + "<br />" + resultSum + "</b>";
	
	newRowsDiff[0].cells[0].firstChild.setAttribute("style", "padding-bottom: 0px !important;margin-bottom: 0px !important;");

}


function foxtrick_addPostTemplates( document ) {
    if (!getShowTweak("addPostTemplates")) return;
    
    function isForumCreatePostUrl(href) {
        return ((href.search(/cn\.asp\?a=ed/i) > -1) || 
		(href.search(/cn\.asp\?a=r/i) > -1) || 
		(href.search(/cn\.asp\?action=newmessage/i) > -1) ||
		(href.search(/cn\.asp\?a=closethreadandreply/i) > -1));
    }
    if (!isForumCreatePostUrl(document.location.href)) return;
    function makeEntities( text ) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/\n/g, "[br]");
    }

    function getCustomMessage(index , useShort) {
        var currText = new Array(foxtrick_getIntCharPref("forumTemplate1"),
                                 foxtrick_getIntCharPref("forumTemplate2"),
                                 foxtrick_getIntCharPref("forumTemplate3"),
                                 foxtrick_getIntCharPref("forumTemplate4"),
                                 foxtrick_getIntCharPref("forumTemplate5"),
                                 foxtrick_getIntCharPref("forumTemplate6"),
                                 foxtrick_getIntCharPref("forumTemplate7"),
                                 foxtrick_getIntCharPref("forumTemplate8"),
                                 foxtrick_getIntCharPref("forumTemplate9"),
                                 foxtrick_getIntCharPref("forumTemplate10"));
        if (useShort==true) {
    		if (currText[index].length > 50) {
    			retVal = makeEntities(currText[index].substr(0,46)) + " ...";
            } else {
                retVal = makeEntities (currText[index].substr(0, 50));
            }
    		return retVal;
    	}
    	else {
    		return makeEntities(currText[index]);
    	}
    }

    var thisTextArea = document.getElementsByTagName ("textarea")[0];
    var element = (thisTextArea.name == 'replytext') ? "document.forms.replyform.replytext" : "document.forms.newform.text";
    
    
	var myTable = document.createElement("table");
	var messCnt=0;
	for ( var i=0;i<10;i++) {
		if (! PrefsBranch.getBoolPref("useForumTemplate"+ (i+1)) ) continue;
		var cellText = "<a href=\"javascript:void()\" onClick=\"insertAtCursor(" + element + ",\'" + getCustomMessage(i) + "\')\">" + getCustomMessage(i, true) + "</a>";
		if (messCnt++ % 2 == 0) {
      		var row = myTable.insertRow(-1);
        }
    	var cell = row.insertCell(-1);
		cell.innerHTML = cellText;
	}
	thisTextArea.parentNode.insertBefore (myTable,thisTextArea);
    // forum message links
    if (PrefsBranch.getBoolPref("useForumLinksMenu")) {
	var thisTextArea = document.getElementsByTagName ("textarea")[0];
	var element = (thisTextArea.name == 'replytext') ? "document.forms.replyform.replytext" : "document.forms.newform.text";
	var lastImg = document.getElementsByName ("HT-meny_12")[0];
	var newDropBox = document.createElement ("select");
	var datatext = foxtrick_getIntCharPref("forumLinksMenu");
	var stringTab = datatext.split("\n");
	var outputStringTmp = "";
	var outputStringNew = false;
	for (i=0;i<stringTab.length;i++) {
		if (stringTab[i].charAt(0)=="#" || stringTab[i].length==0) continue;
		if (outputStringNew==false) {
			outputStringNew = true;
			outputStringTmp += "<option value='[message=" + stringTab[i].replace(/ /g, "") + "]'>";
		}
		else {
			outputStringTmp += stringTab[i] + "</option>";
			outputStringNew = false;
		}
	}	
	newDropBox.innerHTML="<option value='[message=xxx]'>Empty</option>" + outputStringTmp;
	newDropBox.setAttribute("name","threadsDropBox");
	lastImg.parentNode.insertBefore (newDropBox,lastImg.nextSibling);
	lastImg.setAttribute("onClick","insertAtCursor(" + element + ", document.getElementsByName(\"threadsDropBox\")[0].value)");
    }
}

