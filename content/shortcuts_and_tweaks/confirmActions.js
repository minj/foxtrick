/**
 * confirmActions.js
 * Ask user to confirm before certain actions
 * @author bummerland, larsw84, convincedd
 */

var FoxtrickConfirmActions = {
	MODULE_NAME : "ConfirmActions",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ["playerdetail", "staff"],
	DEFAULT_ENABLED : true,
	OPTIONS : ["Bid", "TransferList", "NtChange", "StaffChange"],
	NEW_AFTER_VERSION: "0.5.1.2",
	LATEST_CHANGE:"Merged to single module",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,

	init : function() {
	},

	run : function(page, doc) {
		try {
			// Bid, TransferList, NtChange, StaffChange
			if (Foxtrick.isPage(Foxtrick.ht_pages["playerdetail"], doc)) {
				if (Foxtrick.isModuleFeatureEnabled(this, "Bid")) {
					var submitButton = doc.getElementById("ctl00_CPMain_btnBid");
					if (submitButton) {
						var sOnclick = submitButton.getAttribute("onClick").replace(/javascript\:/, "");
						if (sOnclick.search(/confirm/) == -1) { // already added?
					   		var sConfirmString = Foxtrickl10n.getString("foxtrick.bidconfirmation");
					   		var sReplace = "document.getElementById('ctl00_CPMain_txtBid').value.split('').reverse().join('').replace(new RegExp('(.{' + 3 + '})(?!$)', 'g'), '$1' + ' ').split('').reverse().join('')";
					   		var sStr = "var str = '"+sConfirmString+"';";
					   		sOnclick = sStr + " if (confirm(str.replace(/\%s/, " + sReplace + "))){" + sOnclick + "} else {return false;}";
					   		submitButton.setAttribute("onClick", sOnclick);
					   	}
					}
				}
				if (Foxtrick.isModuleFeatureEnabled(this, "TransferList")) {
					var submitButton = doc.getElementById("ctl00_CPSidebar_ucOwnerActions_btnSell");
					if (submitButton) {
						var sOnclick = submitButton.getAttribute("onClick").replace(/javascript\:/, "");
						if (sOnclick.search(/confirm/) == -1){ // already added?
							var sConfirmString = Foxtrickl10n.getString("foxtrick.tlconfirmation");
							var sReplace = "document.getElementById('ctl00_CPSidebar_ucOwnerActions_txtPrice').value.split('').reverse().join('').replace(new RegExp('(.{' + 3 + '})(?!$)', 'g'), '$1' + ' ').split('').reverse().join('')";
							var sStr = "var str = \""+sConfirmString+"\";";
							sOnclick = sStr + " if (confirm(str.replace(/\%s/, " + sReplace + "))){" + sOnclick + ";} else {return false;}";
							submitButton.setAttribute("onClick", sOnclick);
						}
					}
				}
				if (Foxtrick.isModuleFeatureEnabled(this, "NtChange")) {
					var submitLink = doc.getElementById("ctl00_CPSidebar_ucNTCoachOptions_repNTActions_ctl00_lnkNTAction");
					if (submitLink){
						var sOnclick = submitLink.href.replace(/javascript\:/, "");
						if (sOnclick.search(/confirm/) == -1){ // already added?
							var sConfirmString = Foxtrickl10n.getString("foxtrick.ntremoveconfirmation");
							sOnclick = "javascript:if(confirm(\"" + sConfirmString + "\")){" + sOnclick + ";}";
							submitLink.href=sOnclick;
						}
					}
				}
			}
			if (Foxtrick.isPage(Foxtrick.ht_pages["staff"], doc)) {
				if (Foxtrick.isModuleFeatureEnabled(this, "StaffChange")) {
					var submitButton = doc.getElementById("ctl00_CPMain_btnStaffAction");
					if (submitButton){
						var sOnclick = submitButton.getAttribute("onClick").replace(/javascript\:/, "");
						if (sOnclick.search(/confirm/) == -1){ // already added?
							var sConfirmString = "var cstr=new Array('"+Foxtrickl10n.getString('foxtrick.staffconfirmationhire')+"','"+Foxtrickl10n.getString('foxtrick.staffconfirmationsack')+"');";
							var numstr = "var num = document.getElementById('ctl00_CPMain_txtAmount').value;";
							var kindindex = "var kindindex = document.getElementById('ctl00_CPMain_ddlStaffRole').selectedIndex;";
							var kindstr = "var kind = document.getElementById('ctl00_CPMain_ddlStaffRole').options[document.getElementById('ctl00_CPMain_ddlStaffRole').selectedIndex].innerHTML;";
							var actionstr = "var action = document.getElementById('ctl00_CPMain_ddlStaffAction').selectedIndex;";
							sOnclick = sConfirmString + numstr + kindstr +kindindex + actionstr + "if(num=='' || kindindex==0) return "+sOnclick+";  if (confirm(cstr[action].replace(/\%num/, num).replace(/\%kind/, kind))){" + sOnclick + ";} else {document.getElementById('ctl00_CPMain_btnStaffAction').removeAttribute('disabled');  return false;}";
							submitButton.setAttribute("onClick", sOnclick);
						}
					}
				}
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	change : function(page, doc) {
		this.run(page, doc);
	}
};
