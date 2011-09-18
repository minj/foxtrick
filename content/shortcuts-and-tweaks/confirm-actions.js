/**
 * confirm-actions.js
 * Ask user to confirm before certain actions
 * @author bummerland, larsw84, convincedd, ryanli
 */

Foxtrick.util.module.register({
	MODULE_NAME : "ConfirmActions",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ["playerdetail", "staff"],
	OPTIONS : ["Bid", "TransferList", "NtChange", "StaffChange"],

	run : function(doc) {
		const ids = {
			BID : {
				ALERT_ID : "ctl00_ctl00_CPContent_CPMain_updBid",
				BUTTON_ID : "ctl00_ctl00_CPContent_CPMain_btnBid",
				TEXT_ID : "ctl00_ctl00_CPContent_CPMain_txtBid",
				CONFIRM_ID : "ft-bid-confirm"
			},
			SELL : {
				BUTTON_ID : "ctl00_ctl00_CPContent_CPSidebar_ucOwnerActions_btnSell",
				CANCEL_ID : "ctl00_ctl00_CPContent_CPSidebar_ucOwnerActions_btnSellCancel",
				TEXT_ID : "ctl00_ctl00_CPContent_CPSidebar_ucOwnerActions_txtPrice",
				CONFIRM_ID : "ft-sell-confirm"
			},
			STAFF : {
				SUBMIT_BUTTON_ID : "ctl00_ctl00_CPContent_CPMain_btnStaffAction",
				ACTION_SELECT_ID : "ctl00_ctl00_CPContent_CPMain_ddlStaffAction",
				AMOUNT_TEXT_ID : "ctl00_ctl00_CPContent_CPMain_txtAmount",
				ROLE_SELECT_ID : "ctl00_ctl00_CPContent_CPMain_ddlStaffRole",
				CONFIRM_ID : "ft-staff-confirm"
			}
		};

		// Bid, TransferList, NtChange, StaffChange
		if (Foxtrick.isPage("playerdetail", doc)) {
			if (FoxtrickPrefs.isModuleOptionEnabled("ConfirmActions", "Bid")) {
				var bidButton = doc.getElementById(ids.BID.BUTTON_ID);
				if (bidButton) {
					bidButton.addEventListener("click", function(ev) {
						var doc = ev.target.ownerDocument;
						var bidAlert = doc.getElementById(ids.BID.ALERT_ID);
						var bidButton = doc.getElementById(ids.BID.BUTTON_ID);
						var bidText = doc.getElementById(ids.BID.TEXT_ID);
						var confirm = doc.getElementById(ids.BID.CONFIRM_ID);
						if (bidAlert && bidText && !confirm) {
							var msgTemplate = Foxtrickl10n.getString("foxtrick.bidconfirmation");
							var price = bidText.value
								.split("").reverse().join("")
								.replace(new RegExp("(.{3})(?!$)", "g"), "$1 ")
								.split("").reverse().join("");
							var msg = msgTemplate.replace(/\%s/, price);
							var confirm = Foxtrick.util.note.create(doc, msg,
								[
									{
										type : Foxtrick.util.note.BUTTON_OK,
										listener : function(ev) {
											var doc = ev.target.ownerDocument;
											var bidText = doc.getElementById(ids.BID.TEXT_ID);
											bidText.removeAttribute("disabled");
											var bidButton = doc.getElementById(ids.BID.BUTTON_ID);
											bidButton.click();
										}
									},
									{
										type : Foxtrick.util.note.BUTTON_CANCEL,
										listener : function(ev) {
											var doc = ev.target.ownerDocument;
											var bidButton = doc.getElementById(ids.BID.BUTTON_ID);
											Foxtrick.removeClass(bidButton, "hidden");
											var bidText = doc.getElementById(ids.BID.TEXT_ID);
											bidText.removeAttribute("disabled");
											var confirm = doc.getElementById(ids.BID.CONFIRM_ID);
											confirm.parentNode.removeChild(confirm);
										}
									}
								]);
							confirm.id = ids.BID.CONFIRM_ID;
							bidAlert.getElementsByTagName("div")[0].appendChild(confirm);
							Foxtrick.addClass(bidButton, "hidden");
							bidText.disabled = "disabled";
							ev.preventDefault();
						}
					}, false);
				}
			}
			if (FoxtrickPrefs.isModuleOptionEnabled("ConfirmActions", "TransferList")) {
				var sellButton = doc.getElementById(ids.SELL.BUTTON_ID);
				if (sellButton) {
					sellButton.addEventListener("click", function(ev) {
						var doc = ev.target.ownerDocument;
						var sellButton = doc.getElementById(ids.SELL.BUTTON_ID);
						var cancelButton = doc.getElementById(ids.SELL.CANCEL_ID);
						var sellText = doc.getElementById(ids.SELL.TEXT_ID);
						var confirm = doc.getElementById("ft-sell-confirm");
						if (sellText && !confirm) {
							var msgTemplate = Foxtrickl10n.getString("foxtrick.tlconfirmation");
							var price = sellText.value
								.split("").reverse().join("")
								.replace(new RegExp("(.{3})(?!$)", "g"), "$1 ")
								.split("").reverse().join("");
							var msg = msgTemplate.replace(/\%s/, price);
							var confirm = Foxtrick.util.note.create(doc, msg,
								[
									{
										type : Foxtrick.util.note.BUTTON_OK,
										listener : function(ev) {
											var doc = ev.target.ownerDocument;
											var sellText = doc.getElementById(ids.SELL.TEXT_ID);
											sellText.removeAttribute("disabled");
											var sellButton = doc.getElementById(ids.SELL.BUTTON_ID);
											sellButton.click();
										}
									},
									{
										type : Foxtrick.util.note.BUTTON_CANCEL,
										listener : function(ev) {
											var doc = ev.target.ownerDocument;
											var sellButton = doc.getElementById(ids.SELL.BUTTON_ID);
											Foxtrick.removeClass(sellButton, "hidden");
											var cancelButton = doc.getElementById(ids.SELL.CANCEL_ID);
											Foxtrick.removeClass(cancelButton, "hidden");
											var sellText = doc.getElementById(ids.SELL.TEXT_ID);
											sellText.removeAttribute("disabled");
											var confirm = doc.getElementById(ids.SELL.CONFIRM_ID);
											confirm.parentNode.removeChild(confirm);
										}
									}
								]);
							confirm.id = ids.SELL.CONFIRM_ID;
							sellButton.parentNode.appendChild(confirm);
							Foxtrick.addClass(sellButton, "hidden");
							Foxtrick.addClass(cancelButton, "hidden");
							sellText.disabled = "disabled";
							ev.preventDefault();
						}
					}, false);
				}
			}
			if (FoxtrickPrefs.isModuleOptionEnabled("ConfirmActions", "NtChange")) {
				// one may coach both a U-20 and an NT team
				var submitLink = doc.getElementById("ctl00_ctl00_CPContent_CPSidebar_ucNTCoachOptions_repNTActions_ctl00_lnkNTAction")
					|| doc.getElementById("ctl00_ctl00_CPContent_CPSidebar_ucNTCoachOptions_repNTActions_ctl01_lnkNTAction");
				if (submitLink) {
					var sOnclick = submitLink.href.replace(/javascript\:/, "");
					if (sOnclick.search(/confirm/) == -1){ // already added?
						var sConfirmString = Foxtrickl10n.getString("foxtrick.ntremoveconfirmation");
						sOnclick = "javascript:if(confirm(\"" + sConfirmString + "\")){" + sOnclick + ";}";
						submitLink.href=sOnclick;
					}
				}
			}
		}
		else if (Foxtrick.isPage("staff", doc)) {
			if (FoxtrickPrefs.isModuleOptionEnabled("ConfirmActions", "StaffChange")) {
				var submitButton = doc.getElementById(ids.STAFF.SUBMIT_BUTTON_ID);
				if (submitButton) {
					submitButton.addEventListener("click", function(ev) {
						var doc = ev.target.ownerDocument;
						var submitButton = doc.getElementById(ids.STAFF.SUBMIT_BUTTON_ID);
						var actionSelect = doc.getElementById(ids.STAFF.ACTION_SELECT_ID);
						var amountText = doc.getElementById(ids.STAFF.AMOUNT_TEXT_ID);
						var roleSelect = doc.getElementById(ids.STAFF.ROLE_SELECT_ID);
						var confirm = doc.getElementById(ids.STAFF.CONFIRM_ID);
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
								var confirm = Foxtrick.util.note.create(doc, msg,
									[
										{
											type : Foxtrick.util.note.BUTTON_OK,
											listener : function(ev) {
												var doc = ev.target.ownerDocument;
												var actionSelect = doc.getElementById(ids.STAFF.ACTION_SELECT_ID);
												actionSelect.removeAttribute("disabled");
												var amountText = doc.getElementById(ids.STAFF.AMOUNT_TEXT_ID);
												amountText.removeAttribute("disabled");
												var roleSelect = doc.getElementById(ids.STAFF.ROLE_SELECT_ID);
												roleSelect.removeAttribute("disabled");
												var submitButton = doc.getElementById(ids.STAFF.SUBMIT_BUTTON_ID);
												submitButton.setAttribute("onclick", submitButton.getAttribute("alt-onclick"));
												submitButton.click();
											}
										},
										{
											type : Foxtrick.util.note.BUTTON_CANCEL,
											listener : function(ev) {
												var doc = ev.target.ownerDocument;
												var submitButton = doc.getElementById(ids.STAFF.SUBMIT_BUTTON_ID);
												Foxtrick.removeClass(submitButton, "hidden");
												var actionSelect = doc.getElementById(ids.STAFF.ACTION_SELECT_ID);
												actionSelect.removeAttribute("disabled");
												var amountText = doc.getElementById(ids.STAFF.AMOUNT_TEXT_ID);
												amountText.removeAttribute("disabled");
												var roleSelect = doc.getElementById(ids.STAFF.ROLE_SELECT_ID);
												roleSelect.removeAttribute("disabled");
												var confirm = doc.getElementById(ids.STAFF.CONFIRM_ID);
												confirm.parentNode.removeChild(confirm);
											}
										}
									]);
								confirm.id = ids.STAFF.CONFIRM_ID;
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
	},

	change : function(doc) {
		this.run(doc);
	}
});
