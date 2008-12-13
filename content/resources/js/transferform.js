FoxtrickTransferListSearchFormFiller = {

    backwardCompatibleCodes : {
        "deadlineID" : "ctl00$CPMain$ddlDeadline",
        "LeagueID" : "ctl00$CPMain$ddlZone",
        "CountryID" : "ctl00$CPMain$ddlBornIn",  
        "minAge" : "ctl00$CPMain$ddlAgeMin",
        "maxAge" : "ctl00$CPMain$ddlAgeMax",
        "specialty": "ctl00$CPMain$ddlSpecialty",
        "minValue" : "ctl00_CPMain_txtTSIMin",
        "maxValue" : "ctl00_CPMain_txtTSIMin",
        "SkillType1" : "ctl00$CPMain$ddlSkill1",
        "SkillMin1" : "ctl00$CPMain$ddlSkill1Min",
        "SkillMax1" : "ctl00$CPMain$ddlSkill1Max",
        "SkillType2" : "ctl00$CPMain$ddlSkill2",
        "SkillMin2" : "ctl00$CPMain$ddlSkill2Min",
        "SkillMax2" : "ctl00$CPMain$ddlSkill2Max",
        "SkillType3" : "ctl00$CPMain$ddlSkill3",
        "SkillMin3" : "ctl00$CPMain$ddlSkill3Min",
        "SkillMax3" : "ctl00$CPMain$ddlSkill3Max",
        "SkillType4" : "ctl00$CPMain$ddlSkill4",
        "SkillMin4" : "ctl00$CPMain$ddlSkill4Min",
        "SkillMax4" : "ctl00$CPMain$ddlSkill4Max",
        "minBid" : "ctl00_CPMain_txtBidMin_wrapper",
        "maxBid" : "ctl00_CPMain_txtBidMax_wrapper",
        "SortOrder" : "ctl00$CPMain$rdSort"
    },

    fillForm : function(filter, doc) {
    
        try {
        
            // parse it
            var myDomParser = new DOMParser();
            var obj = myDomParser.parseFromString(filter, "text/xml");
            
            var root = obj.firstChild;
            
            for (var i=0; i<root.childNodes.length; i++) {
                var name = root.childNodes[i].childNodes[0].textContent;
                
                var value;
                if (root.childNodes[i].childNodes[1].childNodes.length >0) {
                    value = root.childNodes[i].childNodes[1].textContent;               
                } else {
                    value="";
                }
                
                // set the value in form
                var el = this.findFormElement(name, doc);
                if (el == null) {
                    var subst = this.backwardCompatibleCodes[name];
                    if (typeof(subst) != 'undefined') {
                        el = this.findFormElement(subst, doc);
                    }
                }
                if (el != null && el.type != "radio") {
                    el.value=value;
                }
            }
        } catch (e) {
            alert (e);
        }
    },

    findFormElement : function(name, doc) {
        var els = doc.getElementsByName(name);
        if (els.length > 0) return els[0];
        return null;
    }

};
