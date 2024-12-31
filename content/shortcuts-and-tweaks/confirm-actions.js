/**
 * confirm-actions.js
 * Ask user to confirm before certain actions
 * @author bummerland, larsw84, convincedd, ryanli
 */

'use strict';

Foxtrick.modules.ConfirmActions = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['playerDetails'],
	OPTIONS: ['Bid', 'TransferList', 'NtChange'],

	get ID() {
		const MAIN = Foxtrick.getMainIDPrefix();
		return {
			BID: {
				ALERT_ID: MAIN + 'updBid',
				BUTTON_ID: MAIN + 'btnBid',
				TEXT_ID: [MAIN + 'txtBid', MAIN + 'txtMaxBid'],
				CONFIRM_ID: 'ft-bid-confirm',
			},
			SELL: {
				BUTTON_ID: 'ctl00_ctl00_CPContent_CPSidebar_ucOwnerActions_btnSell',
				CANCEL_ID: 'ctl00_ctl00_CPContent_CPSidebar_ucOwnerActions_btnSellCancel',
				TEXT_ID: 'ctl00_ctl00_CPContent_CPSidebar_ucOwnerActions_txtPrice',
				CONFIRM_ID: 'ft-sell-confirm',
			},
			STAFF: {
				SUBMIT_BUTTON_ID: MAIN + 'btnStaffAction',
				ACTION_SELECT_ID: MAIN + 'ddlStaffAction',
				AMOUNT_TEXT_ID: MAIN + 'txtAmount',
				ROLE_SELECT_ID: MAIN + 'ddlStaffRole',
				CONFIRM_ID: 'ft-staff-confirm',
			},
		};
	},

	/**
	 * @param {document} doc
	 */
	run: function(doc) {
		const module = this;

		// Bid, TransferList, NtChange, StaffChange
		if (!Foxtrick.isPage(doc, 'playerDetails'))
			return;

		if (Foxtrick.Pages.Player.wasFired(doc))
			return;

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'Bid'))
			module.confirmBid(doc);

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'TransferList'))
			module.confirmTL(doc);

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'NtChange'))
			module.confirmNT(doc);
	},

	/** @param {document} doc */
	change: function(doc) {
		this.run(doc);
	},

	/** @param {document} doc */
	confirmNT: function(doc) {
		const module = this;

		// one may coach both a U-21 and an NT team
		let ntId =
			'ctl00_ctl00_CPContent_CPSidebar_ucNTCoachOptions_repNTActions_ctl00_lnkNTAction';
		let u21Id =
			'ctl00_ctl00_CPContent_CPSidebar_ucNTCoachOptions_repNTActions_ctl01_lnkNTAction';

		let submitLink = doc.getElementById(ntId) || doc.getElementById(u21Id);
		if (!submitLink)
			return;

		submitLink = Foxtrick.makeFeaturedElement(submitLink, module);

		// add a confirm to webpage's javascript link
		Foxtrick.onClick(submitLink, function() {
			// eslint-disable-next-line no-alert
			if (!confirm(Foxtrick.L10n.getString('ConfirmActions.ntremove')))
				return false;

			return true;
		});
	},

	/** @param {document} doc */
	confirmTL: function(doc) {
		const module = this;
		const ID = module.ID;
		const NBSP_CODE = 160;
		const NBSP = String.fromCharCode(NBSP_CODE);

		let sellButton = doc.getElementById(ID.SELL.BUTTON_ID);
		if (!sellButton)
			return;

		sellButton = Foxtrick.makeFeaturedElement(sellButton, module);

		/** @type {NoteButton[]} */
		var buttons = [
			{
				type: Foxtrick.util.note.BUTTONS.OK,
				listener: function() {
					let doc = this.ownerDocument;
					let sellText = doc.getElementById(ID.SELL.TEXT_ID);
					sellText.removeAttribute('disabled');
					let sellButton = doc.getElementById(ID.SELL.BUTTON_ID);
					sellButton.click();
				},
			},
			{
				type: Foxtrick.util.note.BUTTONS.CANCEL,
				listener: function() {
					let doc = this.ownerDocument;
					let sellButton = doc.getElementById(ID.SELL.BUTTON_ID);
					Foxtrick.removeClass(sellButton, 'hidden');
					let cancelButton = doc.getElementById(ID.SELL.CANCEL_ID);
					Foxtrick.removeClass(cancelButton, 'hidden');
					let sellText = doc.getElementById(ID.SELL.TEXT_ID);
					sellText.removeAttribute('disabled');
					let confirm = doc.getElementById(ID.SELL.CONFIRM_ID);
					confirm.parentNode.removeChild(confirm);
				},
			},
		];

		Foxtrick.onClick(sellButton, function() {
			// eslint-disable-next-line no-invalid-this
			let doc = this.ownerDocument;
			let sellButton = doc.getElementById(ID.SELL.BUTTON_ID);
			let cancelButton = doc.getElementById(ID.SELL.CANCEL_ID);

			/** @type {HTMLInputElement} */
			let sellText = doc.querySelector(`#${ID.SELL.TEXT_ID}`);
			let confirm = doc.getElementById('ft-sell-confirm');
			if (sellText && !confirm) {
				let msgTemplate = Foxtrick.L10n.getString('ConfirmActions.transferlist');
				let price = sellText.value.replace(/\s/g,'').replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
				let msg = msgTemplate.replace(/%s/, price);
				let msgPara = doc.createElement('p');
				if (Foxtrick.util.layout.hasMultipleTeams(doc)) {
					let cont = doc.createElement('strong');
					cont.textContent = Foxtrick.modules.Core.TEAM.teamName + ': ';
					msgPara.appendChild(cont);
				}
				msgPara.appendChild(doc.createTextNode(msg));

				let target = sellButton.parentElement;
				let id = ID.SELL.CONFIRM_ID;
				Foxtrick.util.note.add(doc, msgPara, id, { buttons, to: target });
				Foxtrick.addClass(sellButton, 'hidden');
				Foxtrick.addClass(cancelButton, 'hidden');

				sellText.disabled = true;

				return false;
			}

			return true;
		});
	},

	/** @param {document} doc */
	confirmBid: function(doc) {
		const module = this;
		const ID = module.ID;
		const NBSP_CODE = 160;
		const NBSP = String.fromCharCode(NBSP_CODE);

		let bidButton = doc.getElementById(ID.BID.BUTTON_ID);
		if (!bidButton)
			return;

		bidButton = Foxtrick.makeFeaturedElement(bidButton, module);

		/** @type {NoteButton[]} */
		var buttons = [
			{
				type: Foxtrick.util.note.BUTTONS.OK,
				listener: function() {
					let doc = this.ownerDocument;

					/** @type {HTMLInputElement[]} */
					let bidText = ID.BID.TEXT_ID.map(id => doc.querySelector(`#${id}`));

					if (bidText[0])
						bidText[0].removeAttribute('disabled');
					if (bidText[1])
						bidText[1].removeAttribute('disabled');

					let bidButton = doc.getElementById(ID.BID.BUTTON_ID);
					bidButton.click();
				},
			},
			{
				type: Foxtrick.util.note.BUTTONS.CANCEL,
				listener: function() {
					let doc = this.ownerDocument;
					let bidButton = doc.getElementById(ID.BID.BUTTON_ID);
					Foxtrick.removeClass(bidButton, 'hidden');

					/** @type {HTMLInputElement[]} */
					let bidText = ID.BID.TEXT_ID.map(id => doc.querySelector(`#${id}`));

					if (bidText[0])
						bidText[0].removeAttribute('disabled');
					if (bidText[1])
						bidText[1].removeAttribute('disabled');

					let confirm = doc.getElementById(ID.BID.CONFIRM_ID);
					confirm.parentNode.removeChild(confirm);
				},
			},
		];

		Foxtrick.onClick(bidButton, function() {
			// eslint-disable-next-line no-invalid-this
			let doc = this.ownerDocument;
			let bidAlert = doc.getElementById(ID.BID.ALERT_ID);
			let bidButton = doc.getElementById(ID.BID.BUTTON_ID);

			/** @type {HTMLInputElement[]} */
			let bidText = ID.BID.TEXT_ID.map(id => doc.querySelector(`#${id}`));

			let confirm = doc.getElementById(ID.BID.CONFIRM_ID);
			if (bidAlert && (bidText[0] || bidText[1]) && !confirm) {
				let msgTemplate = Foxtrick.L10n.getString('ConfirmActions.bid');
				let value = bidText[1] && bidText[1].value ||
					bidText[0] && bidText[0].value;

				let price = value.split('').reverse().join('');
				price = price.replace(/(.{3})(?!$)/g, '$1' + NBSP);
				price = price.split('').reverse().join('');

				let msg = msgTemplate.replace(/%s/, price);
				let msgPara = doc.createElement('p');
				if (Foxtrick.util.layout.hasMultipleTeams(doc)) {
					let cont = doc.createElement('strong');
					cont.textContent = Foxtrick.modules.Core.TEAM.teamName + ': ';
					msgPara.appendChild(cont);
				}
				msgPara.appendChild(doc.createTextNode(msg));

				let target = bidAlert.querySelector('div');
				let id = ID.BID.CONFIRM_ID;
				Foxtrick.util.note.add(doc, msgPara, id, { buttons, to: target });
				Foxtrick.addClass(bidButton, 'hidden');

				if (bidText[0])
					bidText[0].setAttribute('disabled', 'disabled');
				if (bidText[1])
					bidText[1].setAttribute('disabled', 'disabled');

				return false;
			}
			return true;
		});
	},
};
