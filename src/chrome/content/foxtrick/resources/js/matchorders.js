
//-----------------------------------------------------
//-----------------------------------------------------
//-----------------------------------------------------

 function foxtrick_shiftPositionLeft(selectName) {
    
    try {
    
    var form = document.forms.namedItem('matchOrders');
    var select = form.elements.namedItem(selectName);
    
    if (select.selectedIndex == 0) {
        return;
        select.selectedIndex = select.options.length-1;
    } else {  
        select.selectedIndex--;
    }
    
    var div = document.getElementById('foxtrick-reposition-' + selectName);
    div.innerHTML = select.options.item(select.selectedIndex).text;
    
    computeFormation();
    
   } catch (e) {
    alert(e);
   }
    
 }

//-----------------------------------------------------
//-----------------------------------------------------
//-----------------------------------------------------
 
function foxtrick_shiftPositionRight(selectName) {
    
    try {
    
    var form = document.forms.namedItem('matchOrders');
    var select = form.elements.namedItem(selectName);
    
    if (select.selectedIndex == select.options.length-1) {
        return;
        select.selectedIndex = 0;
    } else {  
        select.selectedIndex++;
    }
    
    var div = document.getElementById('foxtrick-reposition-' + selectName);
    div.innerHTML = select.options.item(select.selectedIndex).text;
    
    computeFormation();
    
   } catch (e) {
    alert(e);
   }
    
 }
 
//-----------------------------------------------------
//-----------------------------------------------------
//-----------------------------------------------------

 function foxtrick_shiftPlayerLeft(selectName) {
    
    try {
    
    var form = document.forms.namedItem('matchOrders');
    var select = form.elements.namedItem(selectName);
    
    if (select.selectedIndex == 0) {
        select.selectedIndex = select.options.length-1;
    } else {  
        select.selectedIndex--;
    }
    
    var playerid = select.options.item(select.selectedIndex).value;
    
    var div = document.getElementById('foxtrick-facearchive-' + playerid);
    
    var clonedFace = div.cloneNode(true);
    
    select.parentNode.appendChild(clonedFace);
    clonedFace.style.display = "block" ;
    
    
   } catch (e) {
    alert(e);
   }
    
 }


//-----------------------------------------------------
//-----------------------------------------------------
//-----------------------------------------------------

function computeFormation() {
    
    try {
    
    var vals = {"gk" : 0, "wb": 0, "cd": 0, "w": 0, "im": 0, "fwd" : 0 };

    var select = getMatchOrdersSelect("idKeeper");
    var playerid = select.options.item(select.selectedIndex).value;
    if (playerid != 0) { vals["gk"]++; }
    
    playerPosition("RightBack", vals, "wb", "wingback");
    playerPosition("InsideBack1", vals, "cd", "centraldefender");
    playerPosition("InsideBack2", vals, "cd", "centraldefender");
    playerPosition("LeftBack", vals, "wb", "wingback");
    playerPosition("RightWinger", vals, "w", "winger");
    playerPosition("InsideMid1", vals, "im", "midfielder");
    playerPosition("InsideMid2", vals, "im", "midfielder");    
    playerPosition("LeftWinger", vals, "w", "winger");
    playerPosition("Forward1", vals, "fwd", "forward");
    playerPosition("Forward2", vals, "fwd", "forward");
    
    var def = vals["wb"] + vals["cd"];
    var mid = vals["w"] + vals["im"];
    var att = vals["fwd"];
    
    document.getElementById("foxtrick-formationinfo").innerHTML = def + "-" + mid + "-" + att;
    document.getElementById("foxtrick-formationinfo-players-cd").innerHTML = vals["cd"];
    document.getElementById("foxtrick-formationinfo-players-im").innerHTML = vals["im"];
    document.getElementById("foxtrick-formationinfo-players-fwd").innerHTML = vals["fwd"];
    
    var totalPlayers = def+mid+att + vals["gk"];
    
    if ((vals["cd"] > 3) || (vals["im"] > 3) || (vals["fwd"] > 3) || (totalPlayers != 11)) {
        document.getElementById("foxtrick-formationinfo").className = "foxtrick-badformation";
        return 2;
    } else if (noformationexperience(vals, def, mid, att)) {
        document.getElementById("foxtrick-formationinfo").className = "foxtrick-noformationexperience";
        return 1;
    } else {
        document.getElementById("foxtrick-formationinfo").className = "";
        return 0;
    }
    
    } catch (e) {
    }
 
     
}

function formationconfirm(mesg) {
    
     var f = document.forms[0];
     
     var formation = computeFormation();
     var text = document.getElementById("foxtrick-formationinfo").textContent;
     mesg = mesg.replace("%s", text);     
     
     if (formation == 2) {
         if (confirm(mesg)) {
            // OK then :)
            return true;
         } else {
            return false;
         }
    }

}


function noformationexperience(vals, def, mid, att) {
    
    // 2-5-3
    if (( def == 2) && (mid == 5) && (att == 3)) return true;
    // 5-2-3
    if (( def == 5) && (mid == 2) && (att == 3)) return true;
    // 5-5-0
    if (( def == 5) && (mid == 5) && (att == 0)) return true;
    // 2-5-3
    if (( def == 2) && (mid == 5) && (att == 3)) return true;
  
    return false;
}


function playerPosition(selectName, vals, def, baseclass) {
    
    baseclass = "foxtrick-" + baseclass;
    
    var select = getMatchOrdersSelect("beh"+selectName);
    var value = select.options.item(select.selectedIndex).value;
    
    var playerselect = getMatchOrdersSelect("id"+selectName);
    var playerid = playerselect.options.item(playerselect.selectedIndex).value;
    
    if (playerid == 0) return;
    
    playerselect.className = "";

    if (value == "0") {
        playerselect.className = baseclass + " " + "foxtrick-normal";
        vals[def]++;        
    } else if (value == "1") {
        playerselect.className = baseclass + " " + "foxtrick-offensive";
        vals[def]++;        
    } else if (value == "2") {
        playerselect.className = baseclass + " " + "foxtrick-defensive";
        vals[def]++;        
    } else if (value == "3") {
        playerselect.className = baseclass + " " + "foxtrick-towardsmiddle";
        vals[def]++;        
    } else if (value == "4") {
        playerselect.className = baseclass + " " + "foxtrick-towardswing";
        vals[def]++;        
    } else if (value == "5") {
        playerselect.className = "foxtrick-forward";
        vals["fwd"]++;
    } else if (value == "6") {
        playerselect.className = "foxtrick-midfielder";
        vals["im"]++;
    } else if (value == "7") {
        playerselect.className = "foxtrick-centraldefender";
        vals["cd"]++;
    } else {
        vals[def]++;
    }
    
}

function getMatchOrdersSelect(selectName) {
    return document.forms.namedItem('matchOrders').elements.namedItem(selectName);
}



///

computeFormation();