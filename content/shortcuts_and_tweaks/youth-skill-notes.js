/**
 * youth-skill-notes.js
 * Make your own notes about skills...
 * @Authors:  smates, larsw84
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickYouthSkillNotes = {

    MODULE_NAME : "YouthSkillNotes",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('YouthPlayer','YouthPlayers'),
    OPTIONS : new Array("OnlyOwnTeam"),

    run : function( page, doc ) {

		var ownteamid = FoxtrickHelper.getOwnTeamId();
		var teamid = FoxtrickHelper.findTeamId(doc.getElementById('content').getElementsByTagName('div')[0]);
		var is_ownteam = (ownteamid==teamid);

		if (!is_ownteam && Foxtrick.isModuleFeatureEnabled( FoxtrickYouthSkillNotes, "OnlyOwnTeam" )) return;


		switch( page )
        {
            case 'YouthPlayer':
            	//////////////////////////////////////////////////////////////////////////////////////////////////////
				var sUrl = Foxtrick.getHref( doc );
				var playerid = sUrl.replace(/.+YouthPlayerID=/i, "").match(/^\d+/)[0];
				var allDivs = doc.getElementsByTagName("div");
				//var tabulka = doc.getElementsByTagName ("TABLE")[0].parentNode.nextSibling.nextSibling;
				for(var i = 0; i < allDivs.length; i++) {
					if(allDivs[i].className=="separator") {
						this.foxtrick_youthskilltable( doc, page, playerid, allDivs[i] );
					}
				}
                break;
			case 'YouthPlayers':

				if (!Foxtrick.isStandardLayout(doc)) Foxtrick.addStyleSheet( doc, Foxtrick.ResourcePath+"resources/css/youthskill_simple.css" );
				var faceCardOn=false;
				var allDivs = doc.getElementsByTagName("div");
				for(var i = 0; i < allDivs.length; i++) {
					if (allDivs[i].className=="faceCard") faceCardOn=true;
					if(allDivs[i].className=="playerInfo") {
						var a = allDivs[i].getElementsByTagName("a")[0];
						var startPos = a.href.search("=")+1;
						var endPos = a.href.search("&");
						var diff = endPos - startPos;
						var playerid = a.href.substr(startPos,diff);
						this.foxtrick_youthskilltable( doc, page, playerid, allDivs[i],faceCardOn );
					}
				}
				break;
        }
	},

	saveSkills : function (ev) {
		var doc = ev.target.ownerDocument;
		var playerid = ev.target.getAttribute("name");
		FoxtrickPrefs.setString("YouthPlayer." + playerid + ".skillGK",
			doc.getElementById("YskillGK"+playerid).value);
		doc.getElementById("spanYskillGK"+playerid).innerHTML =
			doc.getElementById("YskillGK"+playerid).value;
//		Foxtrick.dump("save YouthPlayer." + playerid + ".skillGK: "+ doc.getElementById("YskillGK").value + "\n");
		FoxtrickPrefs.setString("YouthPlayer." + playerid + ".skillPM",
			doc.getElementById("YskillPM"+playerid).value);
		doc.getElementById("spanYskillPM"+playerid).innerHTML =
			doc.getElementById("YskillPM"+playerid).value;
//		Foxtrick.dump("save YouthPlayer." + playerid + ".skillPM: "+ doc.getElementById("YskillPM").value + "\n");
		FoxtrickPrefs.setString("YouthPlayer." + playerid + ".skillPS",
			doc.getElementById("YskillPS"+playerid).value);
		doc.getElementById("spanYskillPS"+playerid).innerHTML =
			doc.getElementById("YskillPS"+playerid).value;
//		Foxtrick.dump("save YouthPlayer." + playerid + ".skillPS: "+ doc.getElementById("YskillPS").value + "\n");
		FoxtrickPrefs.setString("YouthPlayer." + playerid + ".skillWG",
			doc.getElementById("YskillWG"+playerid).value);
		doc.getElementById("spanYskillWG"+playerid).innerHTML =
			doc.getElementById("YskillWG"+playerid).value;
//		Foxtrick.dump("save YouthPlayer." + playerid + ".skillWG: "+ doc.getElementById("YskillWG").value + "\n");
		FoxtrickPrefs.setString("YouthPlayer." + playerid + ".skillDF",
			doc.getElementById("YskillDF"+playerid).value);
		doc.getElementById("spanYskillDF"+playerid).innerHTML =
			doc.getElementById("YskillDF"+playerid).value;
//		Foxtrick.dump("save YouthPlayer." + playerid + ".skillDF: "+ doc.getElementById("YskillDF").value + "\n");
		FoxtrickPrefs.setString("YouthPlayer." + playerid + ".skillSC",
			doc.getElementById("YskillSC"+playerid).value);
		doc.getElementById("spanYskillSC"+playerid).innerHTML =
			doc.getElementById("YskillSC"+playerid).value;
//		Foxtrick.dump("save YouthPlayer." + playerid + ".skillSC: "+ doc.getElementById("YskillSC").value + "\n");
		FoxtrickPrefs.setString("YouthPlayer." + playerid + ".skillSP",
			doc.getElementById("YskillSP"+playerid).value);
		doc.getElementById("spanYskillSP"+playerid).innerHTML =
			doc.getElementById("YskillSP"+playerid).value;
//		Foxtrick.dump("save YouthPlayer." + playerid + ".skillSP: "+ doc.getElementById("YskillSP").value + "\n");

//		alert("Changes have been saved!");
	},

	isYouthPlayerUrl:function (href) {
	  return href.search(/YouthPlayer\.aspx/i) > -1;
	},


	getYouthPlayerSkill : function(playerid, skill) {
//		Foxtrick.dump("getYouthPlayerSkill: " + "YouthPlayer." + playerid + ".skill" + skill + "\n");
	    var ret;
	    try{
	    	ret = FoxtrickPrefs.getString("YouthPlayer." + playerid + ".skill" + skill);
		}
		catch(ex){
			ret = "unknown";
		}
//		Foxtrick.dump(ret+"\n");
		return ret;
	},

	foxtrick_youthskilltable :function ( doc, page, playerid, reference,faceCardOn ) {

		const STR_S_H2 = Foxtrickl10n.getString( "Notes_about_skills");
		const STR_S_EDIT = Foxtrickl10n.getString("Edit_notes");
		const STR_S_SAVELINK = Foxtrickl10n.getString("Save_notes");

		const STR_S_PM = Foxtrickl10n.getString( "Playmaking");
		const STR_S_WG = Foxtrickl10n.getString( "Winger");
		const STR_S_SC = Foxtrickl10n.getString( "Scoring");
		const STR_S_PS = Foxtrickl10n.getString( "Passing");
		const STR_S_DF = Foxtrickl10n.getString( "Defending");
		const STR_S_GK = Foxtrickl10n.getString( "Keeper");
		const STR_S_SP = Foxtrickl10n.getString( "Set_pieces");
		const STR_S_ST = Foxtrickl10n.getString( "Stamina");


	    if( page == 'YouthPlayer' ) {
			var refreshBtn = doc.createElement("a");
				refreshBtn.setAttribute("href","/Club/Players/YouthPlayer.aspx"
				+ "?YouthPlayerID="+playerid);
			refreshBtn.setAttribute("style", "text-decoration: none; "
				+ "font-weight: none;");
			refreshBtn.innerHTML="&nbsp;&nbsp;<img src=\"/Img/icons/arrow_"
				+ "refresh.png\" class=\"refreshIcon\" title=\"Refresh\""
				+ "alt=\"Refresh\">";

			var title = doc.createElement("h2");
			title.appendChild(doc.createTextNode(STR_S_H2));
			title.appendChild(refreshBtn);
		}

		var divEDId = "divED-foxtrick-youthSkillEditTable-"+playerid;
		var divtwoId = "foxtrick-ysn-divtwo-"+playerid;

		var divED = doc.createElement ("DIV");
		divED.setAttribute("class", "alert");
		divED.setAttribute("id", divEDId );
		divED.setAttribute("style", "display: none; width: 500px; float:left;");


		var divobj = doc.createElement("div");
		var div2 = doc.createElement("div");
		var div1 = doc.createElement("div");
		divobj.setAttribute("class","mainBox");
		div2.setAttribute("class","mainBox");
		div2.setAttribute("id", divtwoId);
		div1.setAttribute("class","mainBox");

		if( page == 'YouthPlayers')	{
			var float_dir="float:left;";
			if (Foxtrick.isRTLLayout ( doc ) ) float_dir="float:right;";
			var style = float_dir+"padding:10px 5px 0 10px; width:95%";
			if (faceCardOn) style = float_dir+"padding:10px 5px 0 10px; width:72%";
			var tablestyle="width:95%";
			if (!Foxtrick.isStandardLayout(doc))  {
				var tdstyle='';
				if (faceCardOn) {
					 style = float_dir+"padding:10px 5px 0 10px; width:295px";
					 tablestyle= "width:295px"
					 tdstyle = float_dir+"div.youthnotes .mainBox td { width:70px !important;}"
				}
				else  {
					style =  float_dir+"padding:10px 5px 0 10px; width:415px";
					tablestyle= "width:415px"
					tdstyle = "div.youthnotes .mainBox td { width:100px !important;}"
				}
				//Foxtrick.addStyleSheet( doc, tdstyle);
				var head = doc.getElementsByTagName("head")[0];
                var cssstyle = doc.createElement("style");
                cssstyle.setAttribute("type", "text/css");
				cssstyle.appendChild(doc.createTextNode(tdstyle));
                head.appendChild(cssstyle);

			}
			divobj.setAttribute("style",style);
			div2.setAttribute("style",style);
			div1.setAttribute("style",style);
		}

		var innerdivobj = doc.createElement("div");
		innerdivobj.setAttribute("class","leftBox");

	  var editTable = doc.createElement ("table");
	  editTable.setAttribute("style", "width: 405px");
	  editTable.setAttribute("id", "foxtrick-detailsTable-"+playerid);
	  editTable.setAttribute("class", "thin nowrap");

	  var normalTable = doc.createElement ("table");
	   normalTable.setAttribute("style", tablestyle );
	   normalTable.setAttribute("id", "foxtrick-detailsTable-noEdit-"+playerid);
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
	  saveLink.setAttribute("href", "javascript: void(0); showHide('" + divEDId
		+"');showHide('foxtrick-detailsTable-noEdit-"+playerid+"');");
	  saveLink.setAttribute("name", playerid);
	  saveLink.addEventListener( "click", FoxtrickYouthSkillNotes.saveSkills, false );
	  saveLink.setAttribute("style", "float: right");
	  saveLink.innerHTML = STR_S_SAVELINK;

	  var showEditLink = doc.createElement ("a");
	  showEditLink.setAttribute("href", "javascript: showHide('" + divEDId
		+ "');showHide('foxtrick-detailsTable-noEdit-"+playerid+"');");
//	  showEditLink.setAttribute("style", "margin-top: 30px;position:relative;");
	  showEditLink.innerHTML = STR_S_EDIT;


	  var inputST = doc.createElement ("span");
	  inputST.setAttribute("style", "color: green");
	  inputST.innerHTML = Foxtrickl10n.getString("weak");

	  var inputGK = doc.createElement ("input");
	  inputGK.setAttribute("name", "inpGK");
	  inputGK.setAttribute("id", "YskillGK"+playerid);
	  inputGK.setAttribute("value", this.getYouthPlayerSkill(playerid, "GK"));
	  inputGK.setAttribute("type", "text");
	  inputGK.setAttribute("maxlength", "20");
	  inputGK.setAttribute("size", "20");
//	  inputGK.addEventListener( "keyup", FoxtrickYouthSkillNotes.saveSkills, false )
//	  inputGK.setAttribute("onkeyup", "savenotes()");

	  var inputPM = doc.createElement ("input");
	  inputPM.setAttribute("name", "inpPM");
	  inputPM.setAttribute("id", "YskillPM"+playerid);
	  inputPM.setAttribute("value", this.getYouthPlayerSkill(playerid, "PM"));
	  inputPM.setAttribute("type", "text");
	  inputPM.setAttribute("maxlength", "20");
	  inputPM.setAttribute("size", "20");
//	  inputPM.setAttribute("onkeyup", "savenotes()");

	  var inputPS = doc.createElement ("input");
	  inputPS.setAttribute("name", "inpPS");
	  inputPS.setAttribute("id", "YskillPS"+playerid);
	  inputPS.setAttribute("value", this.getYouthPlayerSkill(playerid, "PS"));
	  inputPS.setAttribute("type", "text");
	  inputPS.setAttribute("maxlength", "20");
	  inputPS.setAttribute("size", "20");
//	  inputPS.setAttribute("onkeyup", "savenotes()");

	  var inputWG = doc.createElement ("input");
	  inputWG.setAttribute("name", "inpWG");
	  inputWG.setAttribute("id", "YskillWG"+playerid);
	  inputWG.setAttribute("value", this.getYouthPlayerSkill(playerid, "WG"));
	  inputWG.setAttribute("type", "text");
	  inputWG.setAttribute("maxlength", "20");
	  inputWG.setAttribute("size", "20");
//	  inputWG.setAttribute("onkeyup", "savenotes()");

	  var inputDF = doc.createElement ("input");
	  inputDF.setAttribute("name", "inpDF");
	  inputDF.setAttribute("id", "YskillDF"+playerid);
	  inputDF.setAttribute("value", this.getYouthPlayerSkill(playerid, "DF"));
	  inputDF.setAttribute("type", "text");
	  inputDF.setAttribute("maxlength", "20");
	  inputDF.setAttribute("size", "20");
//	  inputDF.setAttribute("onkeyup", "savenotes()");

	  var inputSC = doc.createElement ("input");
	  inputSC.setAttribute("name", "inpSC");
	  inputSC.setAttribute("id", "YskillSC"+playerid);
	  inputSC.setAttribute("value", this.getYouthPlayerSkill(playerid, "SC"));
	  inputSC.setAttribute("type", "text");
	  inputSC.setAttribute("maxlength", "20");
	  inputSC.setAttribute("size", "20");
//	  inputSC.setAttribute("onkeyup", "savenotes()");

	  var inputSP = doc.createElement ("input");
	  inputSP.setAttribute("name", "inpSP");
	  inputSP.setAttribute("id", "YskillSP"+playerid);
	  inputSP.setAttribute("value", this.getYouthPlayerSkill(playerid, "SP"));
	  inputSP.setAttribute("type", "text");
	  inputSP.setAttribute("maxlength", "20");
	  inputSP.setAttribute("size", "20");
//	  inputSP.setAttribute("onkeyup", "savenotes()");


	   /*------------------------*/
	  var spanST = doc.createElement ("span");
	  spanST.setAttribute("id", "spanYskillST"+playerid);
	  spanST.setAttribute("style", "color: green");
	  spanST.innerHTML = Foxtrickl10n.getString("weak");

	  var spanGK = doc.createElement ("span");
	  spanGK.setAttribute("style", "color: green");
	  spanGK.setAttribute("id", "spanYskillGK"+playerid);
	  spanGK.innerHTML = this.getYouthPlayerSkill(playerid, "GK");

	  var spanPM = doc.createElement ("span");
	  spanPM.setAttribute("style", "color: green");
	  spanPM.setAttribute("id", "spanYskillPM"+playerid);
	  spanPM.innerHTML = this.getYouthPlayerSkill(playerid, "PM");

	  var spanPS = doc.createElement ("span");
	  spanPS.setAttribute("style", "color: green");
	  spanPS.setAttribute("id", "spanYskillPS"+playerid);
	  spanPS.innerHTML = this.getYouthPlayerSkill(playerid, "PS");

	  var spanWG = doc.createElement ("span");
	  spanWG.setAttribute("style", "color: green");
	  spanWG.setAttribute("id", "spanYskillWG"+playerid);
	  spanWG.innerHTML = this.getYouthPlayerSkill(playerid, "WG");

	  var spanDF = doc.createElement ("span");
	  spanDF.setAttribute("style", "color: green");
	  spanDF.setAttribute("id", "spanYskillDF"+playerid);
	  spanDF.innerHTML = this.getYouthPlayerSkill(playerid, "DF");

	  var spanSC = doc.createElement ("span");
	  spanSC.setAttribute("style", "color: green");
	  spanSC.setAttribute("id", "spanYskillSC"+playerid);
	  spanSC.innerHTML = this.getYouthPlayerSkill(playerid, "SC");

	  var spanSP = doc.createElement ("span");
	  spanSP.setAttribute("style", "color: green");
	  spanSP.setAttribute("id", "spanYskillSP"+playerid);
	  spanSP.innerHTML = this.getYouthPlayerSkill(playerid, "SP");

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

	  if( page == "YouthPlayer" ) {
		div1.appendChild(title);
	  }
	  normalTable.appendChild (Btr1);
	  normalTable.appendChild (Btr2);
	  normalTable.appendChild (Btr3);
	  normalTable.appendChild (Btr4);

	  //normalTable.appendChild (div2);




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

		if( page == "YouthPlayer" ) {
			div2.appendChild(title);
		}
		div2.appendChild(normalTable);

		//normalTable.appendChild(br);
		div2.appendChild(showEditLink);
		if (!Foxtrick.isStandardLayout(doc)) {
			div2.appendChild(br2);
			div2.appendChild(br3);
		//div2.appendChild(divED);
		}
		var notesdiv=doc.createElement('div');
		notesdiv.setAttribute('class','youthnotes');
		reference.parentNode.insertBefore(notesdiv, reference.nextSibling)

		if( !doc.getElementById( divtwoId ) ) {
			notesdiv.appendChild(div2);
		}
		if( !doc.getElementById( divEDId ) ) {
			notesdiv.appendChild(divED);
		}
		var notesdiv=doc.createElement('div');
		reference.parentNode.insertBefore(notesdiv, reference.nextSibling)

	 }
};
