FoxtrickTransferListSearchFormFiller = {

    backwardCompatibleCodes : {
        "_01" : "ctl00$CPMain$ddlDeadline",
        "_02" : "ctl00$CPMain$ddlAgeMin",
        "_03" : "ctl00$CPMain$ddlAgeMax",
        "_04" : "ctl00$CPMain$ddlSkill1",
        "_05" : "ctl00$CPMain$ddlSkill1Min",
        "_06" : "ctl00$CPMain$ddlSkill1Max",
        "_07" : "ctl00$CPMain$ddlSkill2",
        "_08" : "ctl00$CPMain$ddlSkill2Min",
        "_09" : "ctl00$CPMain$ddlSkill2Max",
        "_10" : "ctl00$CPMain$ddlSkill3",
        "_11" : "ctl00$CPMain$ddlSkill3Min",
        "_12" : "ctl00$CPMain$ddlSkill3Max",
        "_13" : "ctl00$CPMain$ddlSkill4",
        "_14" : "ctl00$CPMain$ddlSkill4Min",
        "_15" : "ctl00$CPMain$ddlSkill4Max",
        "_16" : "ctl00$CPMain$ddlSpecialty",
        "_17" : "ctl00$CPMain$ddlZone",
        "_18" : "ctl00$CPMain$ddlBornIn",
        "_29" : "ctl00_CPMain_txtTSIMin_text",
        "_20" : "ctl00$CPMain$txtTSIMin",
        "_21" : "ctl00_CPMain_txtTSIMin_ClientState",
        "_22" : "ctl00_CPMain_txtTSIMax_text",
        "_23" : "ctl00$CPMain$txtTSIMax",
        "_24" : "ctl00_CPMain_txtTSIMax_ClientState",
        "_25" : "ctl00_CPMain_txtBidMin_text",
        "_26" : "ctl00$CPMain$txtBidMin",
        "_27" : "ctl00_CPMain_txtBidMin_ClientState",
        "_28" : "ctl00_CPMain_txtBidMax_text",
        "_29" : "ctl00$CPMain$txtBidMax",
        "_30" : "ctl00_CPMain_txtBidMax_ClientState",
        "_31" : "ctl00$CPMain$ddlGlobalSkillMax",
        "_32" : "ctl00$CPMain$butSearch"
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
            dump(e);
        }
    },

    findFormElement : function(name, doc) {
        var els = doc.getElementsByName(name);
        if (els.length > 0) return els[0];
        return null;
    }
    
    

};
