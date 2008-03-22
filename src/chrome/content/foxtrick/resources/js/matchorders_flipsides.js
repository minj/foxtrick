function foxtrick_flipsides() {

    foxtrick_switchPlayers("RightBack", "LeftBack");
    foxtrick_switchPlayers("InsideBack1", "InsideBack2");
    foxtrick_switchPlayers("InsideMid1", "InsideMid2");
    foxtrick_switchPlayers("LeftWinger", "RightWinger");
    foxtrick_switchPlayers("Forward1", "Forward2");

}



function foxtrick_switchPlayers(pos1, pos2) {
    
    try {
    
        var select1 = getMatchOrdersSelect("beh"+pos1);
        var index1 = select1.options.item(select1.selectedIndex).value;
        var playerselect1 = getMatchOrdersSelect("id"+pos1);
        var playerid1 = playerselect1.options.item(playerselect1.selectedIndex).value;
        
        var select2 = getMatchOrdersSelect("beh"+pos2);
        var index2 = select2.options.item(select2.selectedIndex).value;
        var playerselect2 = getMatchOrdersSelect("id"+pos2);
        var playerid2 = playerselect2.options.item(playerselect2.selectedIndex).value;
      
        playerselect1.value = playerid2;
        playerselect2.value = playerid1;
        
        select1.value = index2;
        select2.value = index1;
    
    } catch (e) {
        alert(e);
    }
    
    
}

