/**
 * youthskillnotes.js
 * Make your own notes about skills...
 * @Author by smates 
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickYouthSkillNotes = {
    
    MODULE_NAME : "YouthSkillNotes",
	MODULE_CATEGORY : "shortcutsandtweaks",

    init : function() {
        Foxtrick.registerPageHandler( 'YouthPlayer',
                                      FoxtrickYouthSkillNotes );
        Foxtrick.registerPageHandler( 'YouthPlayers',
                                      FoxtrickYouthSkillNotes );
    },

    run : function( page, doc ) {
		switch( page )
        {
        	
            case 'YouthPlayer':
            	//////////////////////////////////////////////////////////////////////////////////////////////////////
				
				
				foxtrick_youthskilltable(doc); //uncomment for greasemonkey

            	
            	
            	
            	
                break;
        }
	},
	
	
	saveSkills : function (ev) {
		var doc = ev.target.ownerDocument;
		var sUrl = Foxtrick.getHref( doc );
		var playerid = sUrl.replace(/.+YouthPlayerID=/i, "").match(/^\d+/)[0];
		FoxtrickPrefs.setString("YouthPlayer." + playerid + ".skillGK", doc.getElementById("YskillGK").value);
		doc.getElementById("spanYskillGK").innerHTML = doc.getElementById("YskillGK").value;
//		dump("save YouthPlayer." + playerid + ".skillGK: "+ doc.getElementById("YskillGK").value + "\n");
		FoxtrickPrefs.setString("YouthPlayer." + playerid + ".skillPM", doc.getElementById("YskillPM").value);
		doc.getElementById("spanYskillPM").innerHTML = doc.getElementById("YskillPM").value;
//		dump("save YouthPlayer." + playerid + ".skillPM: "+ doc.getElementById("YskillPM").value + "\n");
		FoxtrickPrefs.setString("YouthPlayer." + playerid + ".skillPS", doc.getElementById("YskillPS").value);
		doc.getElementById("spanYskillPS").innerHTML = doc.getElementById("YskillPS").value;
//		dump("save YouthPlayer." + playerid + ".skillPS: "+ doc.getElementById("YskillPS").value + "\n");
		FoxtrickPrefs.setString("YouthPlayer." + playerid + ".skillWG", doc.getElementById("YskillWG").value);
		doc.getElementById("spanYskillWG").innerHTML = doc.getElementById("YskillWG").value;
//		dump("save YouthPlayer." + playerid + ".skillWG: "+ doc.getElementById("YskillWG").value + "\n");
		FoxtrickPrefs.setString("YouthPlayer." + playerid + ".skillDF", doc.getElementById("YskillDF").value);
		doc.getElementById("spanYskillDF").innerHTML = doc.getElementById("YskillDF").value;
//		dump("save YouthPlayer." + playerid + ".skillDF: "+ doc.getElementById("YskillDF").value + "\n");
		FoxtrickPrefs.setString("YouthPlayer." + playerid + ".skillSC", doc.getElementById("YskillSC").value);
		doc.getElementById("spanYskillSC").innerHTML = doc.getElementById("YskillSC").value;
//		dump("save YouthPlayer." + playerid + ".skillSC: "+ doc.getElementById("YskillSC").value + "\n");
		FoxtrickPrefs.setString("YouthPlayer." + playerid + ".skillSP", doc.getElementById("YskillSP").value);
		doc.getElementById("spanYskillSP").innerHTML = doc.getElementById("YskillSP").value;
//		dump("save YouthPlayer." + playerid + ".skillSP: "+ doc.getElementById("YskillSP").value + "\n");
	
//		alert("Changes have been saved!");
	}
};

	function isYouthPlayerUrl(href) {
	  return href.search(/YouthPlayer\.aspx/i) > -1;
	}
	
	function isYouthPlayersUrl(href) {
	  return href.search(/YouthPlayers\.aspx/i) > -1;
	}
	
	
	
	function getYouthPlayerSkill(playerid, skill) {
//		dump("getYouthPlayerSkill: " + "YouthPlayer." + playerid + ".skill" + skill + "\n");
	    var ret;
	    try{
	    	ret = FoxtrickPrefs.getString("YouthPlayer." + playerid + ".skill" + skill);
		}
		catch(ex){
			ret = "unknown";
		}
//		dump(ret+"\n");
		return ret;
	}
	
	
	function foxtrick_youthskilltable(doc) {
		var sUrl = Foxtrick.getHref( doc );
	  var playerid = sUrl.replace(/.+YouthPlayerID=/i, "").match(/^\d+/)[0];
	  if (!isYouthPlayerUrl(sUrl)) return;
	   
	  
	  const STR_S_H2 = Foxtrickl10n.getString( "Notes_about_skills");
	  const STR_S_EDIT = Foxtrickl10n.getString("Edit_notes");
	  const STR_S_SAVELINK = Foxtrickl10n.getString("Save_notes");
	  
	  const STR_S_PM = Foxtrickl10n.getString( "Playmaking");
	  const STR_S_WG = Foxtrickl10n.getString( "Winger");
	  const STR_S_SC = Foxtrickl10n.getString( "Scoring");
	  const STR_S_PS = Foxtrickl10n.getString( "Passing");
	  const STR_S_DF = Foxtrickl10n.getString( "Defending");
	  const STR_S_GK = Foxtrickl10n.getString( "Keeper");
	  const STR_S_SP = Foxtrickl10n.getString( "Set pieces");
	  const STR_S_ST = Foxtrickl10n.getString( "Stamina");
	  
	
	  
	  var tabulka = doc.getElementsByTagName ("TABLE")[0].parentNode.nextSibling.nextSibling;
	  
	  var refreshBtn = doc.createElement ("a");
	  refreshBtn.setAttribute("href", "/Club/Players/YouthPlayer.aspx?YouthPlayerID="+playerid);
	  refreshBtn.setAttribute("style", "text-decoration: none; font-weight: none;");
	  
	  refreshBtn.innerHTML = "&nbsp;&nbsp;<img src=\"/Img/icons/arrow_refresh.png\" class=\"refreshIcon\" title=\"Refresh\" alt=\"Refresh\">";
	  
	  
	  var title = document.createElement("h2");
		title.appendChild(document.createTextNode(STR_S_H2));
		title.className = "";
		title.appendChild(refreshBtn);
		
		
	  var divED = doc.createElement ("DIV");
	  divED.setAttribute("class", "alert");
	  
	  divED.setAttribute("id", "divED-foxtrick-youthSkillEditTable");
	  divED.setAttribute("style", "display: none; width: 500px;");
	
	
	  var divobj = document.createElement("div");
		divobj.setAttribute("class","mainBox");
		
		var innerdivobj = document.createElement("div");
		innerdivobj.setAttribute("class","leftBox");
	  
	   var div2 = document.createElement("div");
		div2.setAttribute("class","mainBox");
		
		var div1 = document.createElement("div");
		div1.setAttribute("class","mainBox");
	  
	  var editTable = doc.createElement ("table");
	  editTable.setAttribute("style", "width: 300px");
	  editTable.setAttribute("id", "foxtrick-detailsTable");
	  editTable.setAttribute("class", "thin nowrap");
	  
	  var normalTable = doc.createElement ("table");
	   normalTable.setAttribute("style", "width: 300px");
	   normalTable.setAttribute("id", "foxtrick-detailsTable-noEdit");
	   normalTable.setAttribute("class", "thin nowrap");
	   
	  var tr1 = doc.createElement ("tr");
	  var tr2 = doc.createElement ("tr");
	  var tr3 = doc.createElement ("tr");
	  var tr4 = doc.createElement ("tr");
	  
	  var td1 = doc.createElement ("td");
	  var td2 = doc.createElement ("td");
	  var td3 = doc.createElement ("td");
	  var td4 = doc.createElement ("td");
	  
	  var td5 = doc.createElement ("td");
	  var td6 = doc.createElement ("td");
	  var td7 = doc.createElement ("td");
	  var td8 = doc.createElement ("td");
	  
	  var td9 = doc.createElement ("td");
	  var td10 = doc.createElement ("td");
	  var td11 = doc.createElement ("td");
	  var td12 = doc.createElement ("td");
	  
	  var td13 = doc.createElement ("td");
	  var td14 = doc.createElement ("td");
	  var td15 = doc.createElement ("td");
	  var td16 = doc.createElement ("td");
	  
	  //----------------------------------
	  var Btr1 = doc.createElement ("tr");
	  var Btr2 = doc.createElement ("tr");
	  var Btr3 = doc.createElement ("tr");
	  var Btr4 = doc.createElement ("tr");
	  
	  var Btd1 = doc.createElement ("td");
	  var Btd2 = doc.createElement ("td");
	  var Btd3 = doc.createElement ("td");
	  var Btd4 = doc.createElement ("td");
	  
	  var Btd5 = doc.createElement ("td");
	  var Btd6 = doc.createElement ("td");
	  var Btd7 = doc.createElement ("td");
	  var Btd8 = doc.createElement ("td");
	  
	  var Btd9 = doc.createElement ("td");
	  var Btd10 = doc.createElement ("td");
	  var Btd11 = doc.createElement ("td");
	  var Btd12 = doc.createElement ("td");
	  
	  var Btd13 = doc.createElement ("td");
	  var Btd14 = doc.createElement ("td");
	  var Btd15 = doc.createElement ("td");
	  var Btd16 = doc.createElement ("td");
	  
	  
	  var saveLink = doc.createElement ("a");
	  var br = doc.createElement ("br");
	  var br2 = doc.createElement ("br");
	  var br3 = doc.createElement ("br");
	  saveLink.setAttribute("href", "javascript: void(0); showHide('divED-foxtrick-youthSkillEditTable');showHide('foxtrick-detailsTable-noEdit');");
	  saveLink.addEventListener( "click", FoxtrickYouthSkillNotes.saveSkills, false );
	  saveLink.setAttribute("style", "float: right");
	  saveLink.innerHTML = STR_S_SAVELINK;
	  
	  var showEditLink = doc.createElement ("a");
	  showEditLink.setAttribute("href", "javascript: showHide('divED-foxtrick-youthSkillEditTable');showHide('foxtrick-detailsTable-noEdit');");
//	  showEditLink.setAttribute("style", "margin-top: 30px;position:relative;");
	  showEditLink.innerHTML = STR_S_EDIT;
	  
	
	  var inputST = doc.createElement ("span");
	  inputST.setAttribute("style", "color: green");
	  inputST.innerHTML = Foxtrickl10n.getString("weak");
	  
	  var inputGK = doc.createElement ("input");
	  inputGK.setAttribute("name", "inpGK");
	  inputGK.setAttribute("id", "YskillGK");
	  inputGK.setAttribute("value", getYouthPlayerSkill(playerid, "GK"));
	  inputGK.setAttribute("type", "text");
	  inputGK.setAttribute("maxlength", "20");
	  inputGK.setAttribute("size", "20");
//	  inputGK.addEventListener( "keyup", FoxtrickYouthSkillNotes.saveSkills, false )
//	  inputGK.setAttribute("onkeyup", "savenotes()");
	  
	  var inputPM = doc.createElement ("input");
	  inputPM.setAttribute("name", "inpPM");
	  inputPM.setAttribute("id", "YskillPM");
	  inputPM.setAttribute("value", getYouthPlayerSkill(playerid, "PM"));
	  inputPM.setAttribute("type", "text");
	  inputPM.setAttribute("maxlength", "20");
	  inputPM.setAttribute("size", "20");
//	  inputPM.setAttribute("onkeyup", "savenotes()");
	  
	  var inputPS = doc.createElement ("input");
	  inputPS.setAttribute("name", "inpPS");
	  inputPS.setAttribute("id", "YskillPS");
	  inputPS.setAttribute("value", getYouthPlayerSkill(playerid, "PS"));
	  inputPS.setAttribute("type", "text");
	  inputPS.setAttribute("maxlength", "20");
	  inputPS.setAttribute("size", "20");
//	  inputPS.setAttribute("onkeyup", "savenotes()");
	  
	  var inputWG = doc.createElement ("input");
	  inputWG.setAttribute("name", "inpWG");
	  inputWG.setAttribute("id", "YskillWG");
	  inputWG.setAttribute("value", getYouthPlayerSkill(playerid, "WG"));
	  inputWG.setAttribute("type", "text");
	  inputWG.setAttribute("maxlength", "20");
	  inputWG.setAttribute("size", "20");
//	  inputWG.setAttribute("onkeyup", "savenotes()");
	  
	  var inputDF = doc.createElement ("input");
	  inputDF.setAttribute("name", "inpDF");
	  inputDF.setAttribute("id", "YskillDF");
	  inputDF.setAttribute("value", getYouthPlayerSkill(playerid, "DF"));
	  inputDF.setAttribute("type", "text");
	  inputDF.setAttribute("maxlength", "20");
	  inputDF.setAttribute("size", "20");
//	  inputDF.setAttribute("onkeyup", "savenotes()");
	  
	  var inputSC = doc.createElement ("input");
	  inputSC.setAttribute("name", "inpSC");
	  inputSC.setAttribute("id", "YskillSC");
	  inputSC.setAttribute("value", getYouthPlayerSkill(playerid, "SC"));
	  inputSC.setAttribute("type", "text");
	  inputSC.setAttribute("maxlength", "20");
	  inputSC.setAttribute("size", "20");
//	  inputSC.setAttribute("onkeyup", "savenotes()");
	  
	  var inputSP = doc.createElement ("input");
	  inputSP.setAttribute("name", "inpSP");
	  inputSP.setAttribute("id", "YskillSP");
	  inputSP.setAttribute("value", getYouthPlayerSkill(playerid, "SP"));
	  inputSP.setAttribute("type", "text");
	  inputSP.setAttribute("maxlength", "20");
	  inputSP.setAttribute("size", "20");
//	  inputSP.setAttribute("onkeyup", "savenotes()");
	  
	  
	   /*------------------------*/
	  var spanST = doc.createElement ("span");
	  spanST.setAttribute("id", "spanYskillST");
	  spanST.setAttribute("style", "color: green");
	  spanST.innerHTML = Foxtrickl10n.getString("weak");
	   
	  var spanGK = doc.createElement ("span");
	  spanGK.setAttribute("style", "color: green");
	  spanGK.setAttribute("id", "spanYskillGK");
	  spanGK.innerHTML = getYouthPlayerSkill(playerid, "GK");
	  
	  var spanPM = doc.createElement ("span");
	  spanPM.setAttribute("style", "color: green");
	  spanPM.setAttribute("id", "spanYskillPM");
	  spanPM.innerHTML = getYouthPlayerSkill(playerid, "PM");
	  
	  var spanPS = doc.createElement ("span");
	  spanPS.setAttribute("style", "color: green");
	  spanPS.setAttribute("id", "spanYskillPS");
	  spanPS.innerHTML = getYouthPlayerSkill(playerid, "PS");
	  
	  var spanWG = doc.createElement ("span");
	  spanWG.setAttribute("style", "color: green");
	  spanWG.setAttribute("id", "spanYskillWG");
	  spanWG.innerHTML = getYouthPlayerSkill(playerid, "WG");
	  
	  var spanDF = doc.createElement ("span");
	  spanDF.setAttribute("style", "color: green");
	  spanDF.setAttribute("id", "spanYskillDF");
	  spanDF.innerHTML = getYouthPlayerSkill(playerid, "DF");
	  
	  var spanSC = doc.createElement ("span");
	  spanSC.setAttribute("style", "color: green");
	  spanSC.setAttribute("id", "spanYskillSC");
	  spanSC.innerHTML = getYouthPlayerSkill(playerid, "SC");
	  
	  var spanSP = doc.createElement ("span");
	  spanSP.setAttribute("style", "color: green");
	  spanSP.setAttribute("id", "spanYskillSP");
	  spanSP.innerHTML = getYouthPlayerSkill(playerid, "SP");
	  
	  //radek cislo 1
	  Btd1.innerHTML = STR_S_ST + ":";
	  Btd2.appendChild (spanST);
	  Btd3.innerHTML = STR_S_GK + ":";
	  Btd4.appendChild (spanGK);
	  Btr1.appendChild (Btd1);
	  Btr1.appendChild (Btd2);
	  Btr1.appendChild (Btd3);
	  Btr1.appendChild (Btd4);
	  
	  //radek cislo 2
	  Btd5.innerHTML = STR_S_PM + ":";
	  Btd6.appendChild (spanPM);
	  Btd7.innerHTML = STR_S_PS + ":";
	  Btd8.appendChild (spanPS);
	  Btr2.appendChild (Btd5);
	  Btr2.appendChild (Btd6);
	  Btr2.appendChild (Btd7);
	  Btr2.appendChild (Btd8);
	  
	  //radek cislo 3
	  Btd9.innerHTML = STR_S_WG + ":";
	  Btd10.appendChild (spanWG);
	  Btd11.innerHTML = STR_S_DF + ":";
	  Btd12.appendChild (spanDF);
	  Btr3.appendChild (Btd9);
	  Btr3.appendChild (Btd10);
	  Btr3.appendChild (Btd11);
	  Btr3.appendChild (Btd12);
	  
	  //radek cislo 4
	  Btd13.innerHTML = STR_S_SC + ":";
	  Btd14.appendChild (spanSC);
	  Btd15.innerHTML = STR_S_SP + ":";
	  Btd16.appendChild (spanSP);
	  Btr4.appendChild (Btd13);
	  Btr4.appendChild (Btd14);
	  Btr4.appendChild (Btd15);
	  Btr4.appendChild (Btd16);
	  
	 
	  div1.appendChild(title);
	  normalTable.appendChild (Btr1);
	  normalTable.appendChild (Btr2);
	  normalTable.appendChild (Btr3);
	  normalTable.appendChild (Btr4);
	
	  //normalTable.appendChild (div2);
	  
	  normalTable.appendChild(br);
	  normalTable.appendChild(br2);
	  normalTable.appendChild(showEditLink);
	  
	  
	  
	  /*-------------------------*/
	  //radek cislo 1
	  td1.innerHTML = STR_S_ST + ":";
	  td2.appendChild (inputST);
	  td3.innerHTML = STR_S_GK + ":";
	  td4.appendChild (inputGK);
	  tr1.appendChild (td1);
	  tr1.appendChild (td2);
	  tr1.appendChild (td3);
	  tr1.appendChild (td4);
	  
	  //radek cislo 2
	  td5.innerHTML = STR_S_PM + ":";
	  td6.appendChild (inputPM);
	  td7.innerHTML = STR_S_PS + ":";
	  td8.appendChild (inputPS);
	  tr2.appendChild (td5);
	  tr2.appendChild (td6);
	  tr2.appendChild (td7);
	  tr2.appendChild (td8);
	  
	  //radek cislo 3
	  td9.innerHTML = STR_S_WG + ":";
	  td10.appendChild (inputWG);
	  td11.innerHTML = STR_S_DF + ":";
	  td12.appendChild (inputDF);
	  tr3.appendChild (td9);
	  tr3.appendChild (td10);
	  tr3.appendChild (td11);
	  tr3.appendChild (td12);
	  
	  //radek cislo 4
	  td13.innerHTML = STR_S_SC + ":";
	  td14.appendChild (inputSC);
	  td15.innerHTML = STR_S_SP + ":";
	  td16.appendChild (inputSP);
	  tr4.appendChild (td13);
	  tr4.appendChild (td14);
	  tr4.appendChild (td15);
	  tr4.appendChild (td16);
	  
	  editTable.appendChild (tr1);
	  editTable.appendChild (tr2);
	  editTable.appendChild (tr3);
	  editTable.appendChild (tr4);
	  
	  //innerdivobj.appendChild(title);
//		divobj.appendChild(innerdivobj);
		divobj.appendChild(editTable);
		divobj.appendChild(br);
		divobj.appendChild(saveLink);
		divED.appendChild(divobj);
		
//		div2.appendChild(div1);
//		div2.appendChild(normalTable);
//		div2.appendChild(br3);
//		div2.appendChild(divED);
		
		div2.appendChild(title);
		div2.appendChild(normalTable);
		div2.appendChild(br3);
		div2.appendChild(divED);
		

	  tabulka.parentNode.insertBefore(div2, tabulka.nextSibling);
	 }
	
