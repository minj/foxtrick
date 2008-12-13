function foxtrick_getPlayerSelect(position) {
    return document.getElementById('ctl00_CPMain_ply' + position + '_ddlPlayerName');
}

function foxtrick_getPlayerExtraOrder(position) {
    return document.getElementById('ctl00_CPMain_ply' + position + '_ddlBehaviour');
}

//computeFormation();

function foxtrick_flipsides() {
    try {
        foxtrick_switchPlayers("LeftBack", "RightBack");
        foxtrick_switchPlayers("Def1", "Def2");
        foxtrick_switchPlayers("Mid1", "Mid2");
        foxtrick_switchPlayers("LeftWing", "RightWing");
        foxtrick_switchPlayers("Forward1", "Forward2");
    } catch (e) {
        alert(e);
    }
}

function foxtrick_switchPlayers(pos1, pos2) {
    
    var select1 = foxtrick_getPlayerExtraOrder(pos1);
    var index1 = select1.options.item(select1.selectedIndex).value;
    var playerselect1 = foxtrick_getPlayerSelect(pos1);
    var playerid1 = playerselect1.options.item(playerselect1.selectedIndex).value;
    
    var select2 = foxtrick_getPlayerExtraOrder(pos2);
    var index2 = select2.options.item(select2.selectedIndex).value;
    var playerselect2 = foxtrick_getPlayerSelect(pos2);
    var playerid2 = playerselect2.options.item(playerselect2.selectedIndex).value;
  
    playerselect1.value = playerid2;
    playerselect2.value = playerid1;
    
    select1.value = index2;
    select2.value = index1;
    
}