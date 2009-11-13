FoxtrickMatchOrders = {

    SELECT_PREFIX : 'ctl00_CPMain_ply',
    PLAYER_SUFFIX : '_ddlPlayerName',
    ORDER_SUFFIX : '_ddlBehaviour',

    getPlayerSelect : function(position) {
        return document.getElementById(this.SELECT_PREFIX + position + this.PLAYER_SUFFIX);
    },
    
    getPlayerExtraOrderSelect : function(position) {
        return document.getElementById(this.SELECT_PREFIX + position + this.ORDER_SUFFIX);
    },
    
    flipSides : function() {
        try {
            this.switchPlayers("LeftBack", "RightBack");
            this.switchPlayers("Def1", "Def2");
            this.switchPlayers("Mid1", "Mid2");
            this.switchPlayers("LeftWing", "RightWing");
            this.switchPlayers("Forward1", "Forward2");
        } catch (e) {
            Foxtrick.alert(e);
        }
    },
    
    switchPlayers : function(pos1, pos2) {
        var select1 = this.getPlayerExtraOrderSelect(pos1);
        var index1 = select1.options.item(select1.selectedIndex).value;
        var playerselect1 = this.getPlayerSelect(pos1);
        var playerid1 = playerselect1.options.item(playerselect1.selectedIndex).value;
        
        var select2 = this.getPlayerExtraOrderSelect(pos2);
        var index2 = select2.options.item(select2.selectedIndex).value;
        var playerselect2 = this.getPlayerSelect(pos2);
        var playerid2 = playerselect2.options.item(playerselect2.selectedIndex).value;
      
        playerselect1.value = playerid2;
        playerselect2.value = playerid1;
        
        select1.value = index2;
        select2.value = index1;
    },
    
    isNoExperienceFormation : function(vals, def, mid, att) {
        if (( def == 2) && (mid == 5) && (att == 3)) return true;
        if (( def == 5) && (mid == 2) && (att == 3)) return true;
        if (( def == 5) && (mid == 5) && (att == 0)) return true;
        if (( def == 2) && (mid == 5) && (att == 3)) return true;
        return false;
    },
    
    extractPlayerPosition : function(position, vals, defaultPos, baseclass) {
        var extraOrderSelect = this.getPlayerExtraOrderSelect(position);
        var value = extraOrderSelect.options.item(extraOrderSelect.selectedIndex).value;
        
        var playerSelect = this.getPlayerSelect(position);
        var playerId = playerSelect.options.item(playerSelect.selectedIndex).value;
        
        if (playerId == 0) return;
    
        if (value == "5") {
            vals["fwd"]++;
        } else if (value == "6") {
            vals["im"]++;
        } else if (value == "7") {
            vals["cd"]++;
        } else {
            vals[defaultPos]++;
        }
    },
    
    updateFormationBox : function() {
        try {
            var vals = {"gk" : 0, "wb": 0, "cd": 0, "w": 0, "im": 0, "fwd" : 0 };
        
            var select = this.getPlayerSelect("Keeper");
            var playerid = select.options.item(select.selectedIndex).value;
            if (playerid != 0) { vals["gk"]++; }
            
            this.extractPlayerPosition("RightBack", vals, "wb");
            this.extractPlayerPosition("Def1", vals, "cd");
            this.extractPlayerPosition("Def2", vals, "cd");
            this.extractPlayerPosition("LeftBack", vals, "wb");
            this.extractPlayerPosition("RightWing", vals, "w");
            this.extractPlayerPosition("Mid1", vals, "im");
            this.extractPlayerPosition("Mid2", vals, "im");    
            this.extractPlayerPosition("LeftWing", vals, "w");
            this.extractPlayerPosition("Forward1", vals, "fwd");
            this.extractPlayerPosition("Forward2", vals, "fwd");
            
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
            } else if (this.isNoExperienceFormation(vals, def, mid, att)) {
                document.getElementById("foxtrick-formationinfo").className = "foxtrick-noformationexperience";
                return 1;
            } else {
                document.getElementById("foxtrick-formationinfo").className = "";
                return 0;
            }

        } catch (e) {
            Foxtrick.dump("Foxtrick FoxtrickMatchOrders module updateFormationBox() exception\n  " + e + '\n');
        }
    }

};
