/**
 * confirmActions.js
 * Ask user to confirm before certain actions
 * @author bummerland, larsw84, convincedd, ryanli
 */

var FoxtrickConfirmActions = {
	MODULE_NAME : "ConfirmActions",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ["playerdetail", "staff"],
	DEFAULT_ENABLED : true,
	OPTIONS : ["Bid", "TransferList", "NtChange", "StaffChange"],
	NEW_AFTER_VERSION : "0.5.1.3",
	LATEST_CHANGE : "Use FoxTrick note for confirmation (not available for NT change).",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,

	init : function() {
	},

	run : function(page, doc) {
		try {
			// Bid, TransferList, NtChange, StaffChange
			if (Foxtrick.isPage(Foxtrick.ht_pages["playerdetail"], doc)) {
				if (Foxtrick.isModuleFeatureEnabled(this, "Bid")) {
					var bidButton = doc.getElementById("ctl00_CPMain_btnBid");
					if (bidButton) {
						bidButton.addEventListener("click", function(ev) {
							var doc = ev.target.ownerDocument;
							var bidAlert = doc.getElementById("ctl00_CPMain_updBid");
							var bidButton = doc.getElementById("ctl00_CPMain_btnBid");
							var bidText = doc.getElementById("ctl00_CPMain_txtBid");
							var confirm = doc.getElementById("ft-bid-confirm");
							if (bidAlert && bidButton && bidText && !confirm) {
								var msgTemplate = Foxtrickl10n.getString("foxtrick.bidconfirmation");
								var price = bidText.value
									.split("").reverse().join("")
									.replace(new RegExp("(.{3})(?!$)", "g"), "$1 ")
									.split("").reverse().join("");
								var msg = msgTemplate.replace(/\%s/, price);
								var confirm = Foxtrick.Note.create(doc, "ft-bid-confirm", msg,
									[
										{
											type : Foxtrick.Note.BUTTON_OK,
											listener : function(ev) {
												var doc = ev.target.ownerDocument;
												var bidText = doc.getElementById("ctl00_CPMain_txtBid");
												bidText.removeAttribute("disabled");
												var bidButton = doc.getElementById("ctl00_CPMain_btnBid");
												bidButton.click();
											}
										},
										{
											type : Foxtrick.Note.BUTTON_CANCEL,
											listener : function(ev) {
												var doc = ev.target.ownerDocument;
												var bidButton = doc.getElementById("ctl00_CPMain_btnBid");
												Foxtrick.removeClass(bidButton, "hidden");
												var bidText = doc.getElementById("ctl00_CPMain_txtBid");
												bidText.removeAttribute("disabled");
												var confirm = doc.getElementById("ft-bid-confirm");
												confirm.parentNode.removeChild(confirm);
											}
										}
									]);
								bidAlert.getElementsByTagName("div")[0].appendChild(confirm);
								Foxtrick.addClass(bidButton, "hidden");
								bidText.disabled = "disabled";
								ev.preventDefault();
							}
						}, false);
					}
				}
				if (Foxtrick.isModuleFeatureEnabled(this, "TransferList")) {
					var sellButton = doc.getElementById("ctl00_CPSidebar_ucOwnerActions_btnSell");
					Foxtrick.dump(sellButton);
					if (sellButton) {
						sellButton.addEventListener("click", function(ev) {
							var doc = ev.target.ownerDocument;
							var sellAlert = doc.getElementById("ctl00_CPSidebar_ucOwnerActions_pnlSell");
							var sellButton = doc.getElementById("ctl00_CPSidebar_ucOwnerActions_btnSell");
							var sellText = doc.getElementById("ctl00_CPSidebar_ucOwnerActions_txtPrice");
							var confirm = doc.getElementById("ft-sell-confirm");
							Foxtrick.dump("To add: " + Boolean(sellAlert && sellButton && sellText && !confirm));
							if (sellAlert && sellButton && sellText && !confirm) {
								var msgTemplate = Foxtrickl10n.getString("foxtrick.tlconfirmation");
								var price = sellText.value
									.split("").reverse().join("")
									.replace(new RegExp("(.{3})(?!$)", "g"), "$1 ")
									.split("").reverse().join("");
								var msg = msgTemplate.replace(/\%s/, price);
								var confirm = Foxtrick.Note.create(doc, "ft-sell-confirm", msg,
									[
										{
											type : Foxtrick.Note.BUTTON_OK,
											listener : function(ev) {
												var doc = ev.target.ownerDocument;
												var sellText = doc.getElementById("ctl00_CPSidebar_ucOwnerActions_txtPrice");
												sellText.removeAttribute("disabled");
												var sellButton = doc.getElementById("ctl00_CPSidebar_ucOwnerActions_btnSell");
												sellButton.click();
											}
										},
										{
											type : Foxtrick.Note.BUTTON_CANCEL,
											listener : function(ev) {
												var doc = ev.target.ownerDocument;
												var sellButton = doc.getElementById("ctl00_CPSidebar_ucOwnerActions_btnSell");
												Foxtrick.removeClass(sellButton, "hidden");
												var sellText = doc.getElementById("ctl00_CPSidebar_ucOwnerActions_txtPrice");
												sellText.removeAttribute("disabled");
												var confirm = doc.getElementById("ft-sell-confirm");
												confirm.parentNode.removeChild(confirm);
											}
										}
									]);
								sellButton.parentNode.appendChild(confirm);
								Foxtrick.addClass(sellButton, "hidden");
								sellText.disabled = "disabled";
								ev.preventDefault();
							}
						}, false);
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
					if (submitButton) {
						submitButton.addEventListener("click", function(ev) {
							var doc = ev.target.ownerDocument;
							var submitButton = doc.getElementById("ctl00_CPMain_btnStaffAction");
							var actionSelect = doc.getElementById("ctl00_CPMain_ddlStaffAction");
							var amountText = doc.getElementById("ctl00_CPMain_txtAmount");
							var roleSelect = doc.getElementById("ctl00_CPMain_ddlStaffRole");
							var confirm = doc.getElementById("ft-staff-confirm");
							var confirmAdded = true;
							if (actionSelect && amountText && roleSelect && !confirm) {
								var actionIndex = parseInt(actionSelect.selectedIndex);
								var amount = amountText.value;
								var roleIndex = parseInt(roleSelect.selectedIndex);
								var roleStr = roleSelect.options[roleIndex].textContent;
								if (!isNaN(amount) && roleIndex !== 0) {
									var msgTemplate;
									if (actionIndex === 0) {
										msgTemplate = Foxtrickl10n.getString("foxtrick.staffconfirmationhire");
									}
									else if (actionIndex === 1) {
										msgTemplate = Foxtrickl10n.getString("foxtrick.staffconfirmationsack");
									}
									var msg = msgTemplate.replace(/\%num/, amount).replace(/\%kind/, roleStr);
									var confirm = Foxtrick.Note.create(doc, "ft-staff-confirm", msg,
										[
											{
												type : Foxtrick.Note.BUTTON_OK,
												listener : function(ev) {
													var doc = ev.target.ownerDocument;
													var confirm = doc.getElementById("ft-staff-confirm");
													var actionSelect = doc.getElementById("ctl00_CPMain_ddlStaffAction");
													actionSelect.removeAttribute("disabled");
													var amountText = doc.getElementById("ctl00_CPMain_txtAmount");
													amountText.removeAttribute("disabled");
													var roleSelect = doc.getElementById("ctl00_CPMain_ddlStaffRole");
													roleSelect.removeAttribute("disabled");
													var submitButton = doc.getElementById("ctl00_CPMain_btnStaffAction");
													submitButton.setAttribute("onclick", submitButton.getAttribute("alt-onclick"));
													submitButton.click();
												}
											},
											{
												type : Foxtrick.Note.BUTTON_CANCEL,
												listener : function(ev) {
													var doc = ev.target.ownerDocument;
													var submitButton = doc.getElementById("ctl00_CPMain_btnStaffAction");
													Foxtrick.removeClass(submitButton, "hidden");
													var actionSelect = doc.getElementById("ctl00_CPMain_ddlStaffAction");
													actionSelect.removeAttribute("disabled");
													var amountText = doc.getElementById("ctl00_CPMain_txtAmount");
													amountText.removeAttribute("disabled");
													var roleSelect = doc.getElementById("ctl00_CPMain_ddlStaffRole");
													roleSelect.removeAttribute("disabled");
													var confirm = doc.getElementById("ft-staff-confirm");
													confirm.parentNode.removeChild(confirm);
												}
											}
										]);
									submitButton.parentNode.appendChild(confirm);
									confirmAdded = true;
									Foxtrick.addClass(submitButton, "hidden");
									actionSelect.disabled = amountText.disabled = roleSelect.disabled = "disabled";
									if (confirmAdded === false) {
										submitButton.setAttribute("onclick", submitButton.getAttribute("alt-onclick"));
										submitButton.click();
									}
									ev.preventDefault();
								}
							}
						}, false);
						// need to store the onclick attribute as alt-onclick
						// to prevent it from being executed right away
						// and use it when needed
						submitButton.setAttribute("alt-onclick", submitButton.getAttribute("onclick"));
						submitButton.removeAttribute("onclick");
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
