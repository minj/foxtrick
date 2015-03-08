'use strict';
/**
 * confirm-actions.js
 * Ask user to confirm before certain actions
 * @author bummerland, larsw84, convincedd, ryanli
 */

Foxtrick.modules['ConfirmActions'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['playerDetails'],
	OPTIONS: ['Bid', 'TransferList', 'NtChange'],

	/**
	 * @param	{document}	doc
	 */
	run: function(doc) {
		var MAIN = Foxtrick.getMainIDPrefix();
		var ids = {
			BID: {
				ALERT_ID: MAIN + 'updBid',
				BUTTON_ID: MAIN + 'btnBid',
				TEXT_ID: [MAIN + 'txtBid', MAIN + 'txtMaxBid'],
				CONFIRM_ID: 'ft-bid-confirm'
			},
			SELL: {
				BUTTON_ID: 'ctl00_ctl00_CPContent_CPSidebar_ucOwnerActions_btnSell',
				CANCEL_ID: 'ctl00_ctl00_CPContent_CPSidebar_ucOwnerActions_btnSellCancel',
				TEXT_ID: 'ctl00_ctl00_CPContent_CPSidebar_ucOwnerActions_txtPrice',
				CONFIRM_ID: 'ft-sell-confirm'
			},
			STAFF: {
				SUBMIT_BUTTON_ID: MAIN + 'btnStaffAction',
				ACTION_SELECT_ID: MAIN + 'ddlStaffAction',
				AMOUNT_TEXT_ID: MAIN + 'txtAmount',
				ROLE_SELECT_ID: MAIN + 'ddlStaffRole',
				CONFIRM_ID: 'ft-staff-confirm'
			}
		};

		// Bid, TransferList, NtChange, StaffChange
		if (Foxtrick.isPage(doc, 'playerDetails')) {
			if (Foxtrick.Pages.Player.wasFired(doc))
				return;

			if (Foxtrick.Prefs.isModuleOptionEnabled('ConfirmActions', 'Bid')) {
				var bidButton = doc.getElementById(ids.BID.BUTTON_ID);
				if (bidButton) {
					bidButton = Foxtrick.makeFeaturedElement(bidButton, this);
					Foxtrick.onClick(bidButton, function(ev) {
						var doc = ev.target.ownerDocument;
						var bidAlert = doc.getElementById(ids.BID.ALERT_ID);
						var bidButton = doc.getElementById(ids.BID.BUTTON_ID);
						var bidText = [doc.getElementById(ids.BID.TEXT_ID[0]),
									   doc.getElementById(ids.BID.TEXT_ID[1])];
						var confirm = doc.getElementById(ids.BID.CONFIRM_ID);
						if (bidAlert && (bidText[0] || bidText[1]) && !confirm) {
							var msgTemplate = Foxtrick.L10n.getString('ConfirmActions.bid');
							var value = bidText[1] && bidText[1].value ||
								bidText[0] && bidText[0].value;
							var price = value.split('').reverse().join('').
								replace(/(.{3})(?!$)/g, '$1' + String.fromCharCode(160)).
								split('').reverse().join('');

							var msg = msgTemplate.replace(/\%s/, price);
							var msgPara = doc.createElement('p');
							if (Foxtrick.util.layout.hasMultipleTeams(doc)) {
								var cont = doc.createElement('strong');
								cont.textContent =
									Foxtrick.modules.Core.TEAM.teamName + ': ';
								msgPara.appendChild(cont);
							}
							msgPara.appendChild(doc.createTextNode(msg));
							var buttons = [
								{
									type: Foxtrick.util.note.BUTTON_OK,
									listener: function(ev) {
										var doc = ev.target.ownerDocument;
										var bidText = [
											doc.getElementById(ids.BID.TEXT_ID[0]),
											doc.getElementById(ids.BID.TEXT_ID[1])
										];
										if (bidText[0])
											bidText[0].removeAttribute('disabled');
										if (bidText[1])
											bidText[1].removeAttribute('disabled');
										var bidButton = doc.getElementById(ids.BID.BUTTON_ID);
										bidButton.click();
									}
								},
								{
									type: Foxtrick.util.note.BUTTON_CANCEL,
									listener: function(ev) {
										var doc = ev.target.ownerDocument;
										var bidButton = doc.getElementById(ids.BID.BUTTON_ID);
										Foxtrick.removeClass(bidButton, 'hidden');
										var bidText = [
											doc.getElementById(ids.BID.TEXT_ID[0]),
											doc.getElementById(ids.BID.TEXT_ID[1])
										];
										if (bidText[0])
											bidText[0].removeAttribute('disabled');
										if (bidText[1])
											bidText[1].removeAttribute('disabled');
										var confirm = doc.getElementById(ids.BID.CONFIRM_ID);
										confirm.parentNode.removeChild(confirm);
									}
								}
							];
							var target = bidAlert.getElementsByTagName('div')[0];
							Foxtrick.util.note.add(doc, msgPara, ids.BID.CONFIRM_ID,
							                       { buttons: buttons, to: target });
							Foxtrick.addClass(bidButton, 'hidden');
							if (bidText[0])
								bidText[0].setAttribute('disabled', 'disabled');
							if (bidText[1])
								bidText[1].setAttribute('disabled', 'disabled');
							ev.preventDefault();
						}
					});
				}
			}
			if (Foxtrick.Prefs.isModuleOptionEnabled('ConfirmActions', 'TransferList')) {
				var sellButton = doc.getElementById(ids.SELL.BUTTON_ID);
				if (sellButton) {
					sellButton = Foxtrick.makeFeaturedElement(sellButton, this);
					Foxtrick.onClick(sellButton, function(ev) {
						var doc = ev.target.ownerDocument;
						var sellButton = doc.getElementById(ids.SELL.BUTTON_ID);
						var cancelButton = doc.getElementById(ids.SELL.CANCEL_ID);
						var sellText = doc.getElementById(ids.SELL.TEXT_ID);
						var confirm = doc.getElementById('ft-sell-confirm');
						if (sellText && !confirm) {
							var msgTemplate =
								Foxtrick.L10n.getString('ConfirmActions.transferlist');
							var price = sellText.value.split('').reverse().join('').
								replace(/(.{3})(?!$)/g, '$1' + String.fromCharCode(160)).
								split('').reverse().join('');

							var msg = msgTemplate.replace(/\%s/, price);
							var msgPara = doc.createElement('p');
							if (Foxtrick.util.layout.hasMultipleTeams(doc)) {
								var cont = doc.createElement('strong');
								cont.textContent =
									Foxtrick.modules.Core.TEAM.teamName + ': ';
								msgPara.appendChild(cont);
							}
							msgPara.appendChild(doc.createTextNode(msg));
							var buttons = [
								{
									type: Foxtrick.util.note.BUTTON_OK,
									listener: function(ev) {
										var doc = ev.target.ownerDocument;
										var sellText = doc.getElementById(ids.SELL.TEXT_ID);
										sellText.removeAttribute('disabled');
										var sellButton = doc.getElementById(ids.SELL.BUTTON_ID);
										sellButton.click();
									}
								},
								{
									type: Foxtrick.util.note.BUTTON_CANCEL,
									listener: function(ev) {
										var doc = ev.target.ownerDocument;
										var sellButton = doc.getElementById(ids.SELL.BUTTON_ID);
										Foxtrick.removeClass(sellButton, 'hidden');
										var cancelButton = doc.getElementById(ids.SELL.CANCEL_ID);
										Foxtrick.removeClass(cancelButton, 'hidden');
										var sellText = doc.getElementById(ids.SELL.TEXT_ID);
										sellText.removeAttribute('disabled');
										var confirm = doc.getElementById(ids.SELL.CONFIRM_ID);
										confirm.parentNode.removeChild(confirm);
									}
								}
							];
							var target = sellButton.parentNode;
							Foxtrick.util.note.add(doc, msgPara, ids.SELL.CONFIRM_ID,
							                       { buttons: buttons, to: target });
							Foxtrick.addClass(sellButton, 'hidden');
							Foxtrick.addClass(cancelButton, 'hidden');
							sellText.disabled = 'disabled';
							ev.preventDefault();
						}
					});
				}
			}
			if (Foxtrick.Prefs.isModuleOptionEnabled('ConfirmActions', 'NtChange')) {
				// one may coach both a U-20 and an NT team
				var ntId = 'ctl00_ctl00_CPContent_CPSidebar_' +
					'ucNTCoachOptions_repNTActions_ctl00_lnkNTAction';
				var u20Id = 'ctl00_ctl00_CPContent_CPSidebar_' +
					'ucNTCoachOptions_repNTActions_ctl01_lnkNTAction';
				var submitLink = doc.getElementById(ntId) || doc.getElementById(u20Id);
				if (submitLink) {
					submitLink = Foxtrick.makeFeaturedElement(submitLink, this);
					// add a confirm to webpage's javascript link
					Foxtrick.onClick(submitLink, function(ev) {
						if (!confirm(Foxtrick.L10n.getString('ConfirmActions.ntremove')))
							ev.preventDefault();
					});
				}
			}
		}
	},

	change: function(doc) {
		this.run(doc);
	}
};
