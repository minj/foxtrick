/*
Copyright (c) 2010 Re4Ver <psicotsitool@gmail.com>, http://www.aldeaglobal.net/psicotsi/
Copyright (c) 2013 lizardopoli <lizardopoli@gmail.com>, http://psicotsi.sourceforge.net/releases/
Copyright (c) 2013 LA-MJ <4mr.minj@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

'use strict';

/* eslint-disable complexity, no-magic-numbers, max-params */

Foxtrick.modules['PsicoTSI'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['playerDetails', 'players', 'ntPlayers', 'transferSearchResult'],
	OPTIONS: [
		['showOnLeft', 'hideUnderSkills'],
		'enablePlayersPage',
		['enableTLPage', 'displayAsLink'],
	],

	CSS: Foxtrick.InternalPath + 'resources/css/psico-tsi.css',
	IMAGES: {
		SKILL_NOT_AVAIL: Foxtrick.InternalPath + 'resources/img/psicotsi/unknown.png',
		OLD: Foxtrick.InternalPath + 'resources/img/psicotsi/old.png',
		LOGO: Foxtrick.InternalPath + 'resources/img/psicotsi/logo.png',
		INJURED: Foxtrick.InternalPath + 'resources/img/psicotsi/injured.png',
		UNDEF_MAINSKILL: Foxtrick.InternalPath + 'resources/img/psicotsi/undef_mainskill.png',
		WAGE_PREDICTION_NA: Foxtrick.InternalPath + 'resources/img/psicotsi/undef_mainskill.png',
		HIGH_SUBLEVELS: Foxtrick.InternalPath + 'resources/img/psicotsi/high_sublevels.png',
		LOW_SUBLEVELS: Foxtrick.InternalPath + 'resources/img/psicotsi/low_sublevels.png',
	},
	title: 'PsicoTSI Foxtrick Edition',
	skills: [],

	/**
	 * @param	{document}	doc
	 */
	run: function(doc) {
		this.title = Foxtrick.L10n.getString('PsicoTSI.title');
		this.skills = [
			Foxtrick.L10n.getString('Form'),
			Foxtrick.L10n.getString('Stamina'),
			Foxtrick.L10n.getString('Playmaking'),
			Foxtrick.L10n.getString('Winger'),
			Foxtrick.L10n.getString('Scoring'),
			Foxtrick.L10n.getString('Keeper'),
			Foxtrick.L10n.getString('Passing'),
			Foxtrick.L10n.getString('Defending'),
			Foxtrick.L10n.getString('Set_pieces'),
		];
		var module = this;
		Foxtrick.util.currency.detect(doc).then(function() {
			if (Foxtrick.isPage(doc, 'playerDetails'))
				module.runPlayer(doc);
			if (Foxtrick.isPage(doc, 'ownPlayers') &&
				Foxtrick.Prefs.isModuleOptionEnabled('PsicoTSI', 'enablePlayersPage'))
				module.runPlayers(doc);
			if (Foxtrick.isPage(doc, 'transferSearchResult') &&
				Foxtrick.Prefs.isModuleOptionEnabled('PsicoTSI', 'enableTLPage'))
				module.runTL(doc);

		}, function(reason) {
			Foxtrick.log('WARNING: currency.detect aborted:', reason);
		}).catch(Foxtrick.catch(module));

	},

	/**
	 * @param	{document}	doc
	 */
	runPlayer: function(doc) {

		if (Foxtrick.Pages.Player.wasFired(doc))
			return;

		var p = Foxtrick.Pages.Player.getSkills(doc);
		var entryPoint = doc.querySelector('.ownerAndStatusPlayerInfo ~ .flex') ||
			Foxtrick.getMBElement(doc, 'updBestLatest') ||
			Foxtrick.getMBElement(doc, 'updPlayerTabs');

		if (!p) {
			this.drawMessage(doc, entryPoint);
			return;
		}

		p.age = Foxtrick.Pages.Player.getAge(doc);
		if (!p.age)
			return;

		p.tsi = Foxtrick.Pages.Player.getTsi(doc);
		p.salary = Foxtrick.Pages.Player.getWage(doc).base;
		p.specialtyNumber = Foxtrick.Pages.Player.getSpecialtyNumber(doc);
		p.isAbroad = false;

		var attrs = Foxtrick.Pages.Player.getAttributes(doc);
		p.form = attrs.form;
		p.stamina = attrs.stamina;

		var age = p.age.years;
		var injured = Foxtrick.Pages.Player.getInjuryWeeks(doc) && true;

		var pr = this.getPrediction(p, Foxtrick.util.currency.getRate());
		if (!pr)
			return;

		// assuming player skills is the first mainBox
		this.drawMessage(doc, entryPoint, pr.isGK, pr.undef, injured, age > 27, pr.maxSkill,
						 pr.formHigh, pr.formAvg, pr.formLow,
						 pr.wageHigh, pr.wageAvg, pr.wageLow, pr.limit);

	},

	/**
	 * @param	{document}	doc
	 */
	runPlayers: function(doc) {
		var module = this;
		var currRate = Foxtrick.util.currency.getRate();

		Foxtrick.Pages.Players.getPlayerList(doc, function(playerList) {
			if (!playerList)
				return;
			for (var i = 0, p; i < playerList.length && (p = playerList[i]); ++i) {

				var injured = p.injuredWeeks && true;
				var age = p.ageYears;

				var pr = p.psico || module.getPrediction(p, currRate);
				if (!pr)
					continue;

				module.drawInPlayerInfo(doc, i, p.playerNode, pr.undef, injured, age > 27,
				                        pr.maxSkill, pr.formHigh, pr.formAvg, pr.formLow,
				                        pr.wageLow, pr.limit);
			}
		}, { teamId: Foxtrick.Pages.All.getTeamId(doc) });

	},

	/**
	 * @param {document} doc
	 */
	runTL: function(doc) {
		const module = this;
		Foxtrick.util.currency.detect(doc).then(({ rate }) => {

			var useLinks = Foxtrick.Prefs.isModuleOptionEnabled('PsicoTSI', 'displayAsLink');
			var players = Foxtrick.Pages.TransferSearchResults.getPlayerList(doc);
			var playerContainers = doc.getElementById('mainBody')
				.getElementsByClassName('transferPlayerInfo');

			for (let [i, p] of players.entries()) {

				var entry = playerContainers[i];
				var age = p.ageYears;
				var injured = p.injured;

				if (!Foxtrick.hasProp(p, 'keeper') || !age && !Foxtrick.hasProp(p, 'age'))
					continue;

				var pr = module.getPrediction(p, rate);
				if (!pr)
					continue;

				// clear floats
				var div = doc.createElement('div');
				Foxtrick.addClass(div, 'ft-clear-both');
				entry.appendChild(div);

				module.drawInPlayerInfo(doc, i, entry, pr.undef, injured, age > 27,
				                        pr.maxSkill, pr.formHigh, pr.formAvg, pr.formLow,
				                        pr.wageLow, pr.limit, useLinks);

				// move the ruler below psico
				var hr = playerContainers[i].getElementsByClassName('borderSeparator')[0];
				if (hr)
					playerContainers[i].appendChild(hr);
			}
		});
	},

	/**
	 * Get prediction for player object
	 *
	 * Wage prediction needs currRate, use 0 otherwise
	 *
	 * returns prediction object
	 *
	 * { maxSkill, isGK, undef, limit, formLow, formAvg, formHigh, wageLow, wageAvg, wageHigh }
	 *
	 * may be called from other scripts!
	 * @param  {Player} p
	 * @param  {number} [currRate]
	 * @return {PsicoTSIPrediction}
	 */
	getPrediction: function(p, currRate) {
		if (typeof p.playmaking == 'undefined')
			return null;

		let age = p.ageYears || p.age.years;
		let currTSI = p.tsi;
		let currWAGE = currRate ? Math.floor(p.salary / (p.isAbroad ? 1.2 : 1) * currRate) : 0;
		if (p.specialtyNumber) {
			// players with a speciality have a 10% higher salary
			currWAGE = currWAGE * (10 / 11);
		}
		let frm = p.form;
		let sta = p.stamina;

		let pla = p.playmaking, win = p.winger, sco = p.scoring, goa = p.keeper,
			pas = p.passing, def = p.defending, sp = p.setPieces;
		let playerskills = [frm, sta, pla, win, sco, goa, pas, def, sp];

		/** @type {PsicoTSIPrediction} */
		let pr = Foxtrick.psico.getPrediction(playerskills, currTSI, currWAGE, age);
		return pr;
	},

	/**
	 * Draw PsicoTSI prediction table (player page)
	 * @param	{document}	doc
	 * @param	{Element}	entryPoint				the result is added as nextSibling to this
	 * @param	{boolean}	isGK
	 * @param	{boolean}	isUndefinedMainskill
	 * @param	{boolean}	isInjured
	 * @param	{boolean}	isOld
	 * @param	{number}	maxSkill
	 * @param	{number}	formHigh				skill level when form sub is high
	 * @param	{number}	formAvg					average
	 * @param	{number}	formLow					low
	 * @param	{number}	wageHigh				skill level when secondary subs are high
	 * @param	{number}	wageAvg					average or 'N/A'
	 * @param	{number}	wageLow					low or 'N/A'
	 * @param	{string}	limit					'High', 'Medium' or 'Low'
	 */
	drawMessage: function(doc, entryPoint, isGK, isUndefinedMainskill, isInjured, isOld, maxSkill,
	                      formHigh, formAvg, formLow, wageHigh, wageAvg, wageLow, limit) {
		var module = this;

		var table = doc.createElement('table');
		var messagesDiv = doc.createElement('div');
		var imgsOnly = doc.createElement('div');

		var imgattr = {
			alt: '',
			width: '16',
			height: '16',
			class: 'ft-psico-indicator-left',
		};
		var addImage = function(type) {
			var messageP = doc.createElement('p');
			imgattr.title = imgattr['aria-label'] = messageP.textContent =
				Foxtrick.L10n.getString('PsicoTSI.' + type);
			imgattr.src = module.IMAGES[type];
			var imgWrap = doc.createElement('span');
			Foxtrick.addImage(doc, imgWrap, imgattr);
			Foxtrick.addImage(doc, imgsOnly, imgattr);
			messageP.insertBefore(imgWrap, messageP.firstChild);
			messagesDiv.appendChild(messageP);
		};

		var mainSkillText;
		if (typeof maxSkill == 'undefined') {
			// Skills not available
			addImage('SKILL_NOT_AVAIL');
		}
		else {
			mainSkillText = this.skills[maxSkill];

			var isWagePredictionAvailable = wageLow != 'N/A';

			Foxtrick.addClass(table, 'nowrap alltidMatches');

			if (isUndefinedMainskill) {
				addImage('UNDEF_MAINSKILL');
			}
			if (isInjured) {
				addImage('INJURED');
			}
			if (isOld) {
				addImage('OLD');
			}
			if (!isWagePredictionAvailable) {
				addImage('WAGE_PREDICTION_NA');
			}

			if (limit == 'Low') {
				addImage('LOW_SUBLEVELS');
			}

			if (limit == 'High') {
				addImage('HIGH_SUBLEVELS');
			}

			var tbody = doc.createElement('tbody');
			table.appendChild(tbody);
			var tr = doc.createElement('tr');
			var td = doc.createElement('th');
			td.colSpan = 4;
			Foxtrick.addClass(td, 'center');
			td.textContent = mainSkillText.toUpperCase();
			tr.appendChild(td);
			tbody.appendChild(tr);

			tr = doc.createElement('tr');
			td = doc.createElement('th');
			td.colSpan = 2;
			Foxtrick.addClass(td, 'center');
			td.textContent = Foxtrick.L10n.getString('PsicoTSI.TSI_PREDICTION');
			tr.appendChild(td);
			td = doc.createElement('th');
			td.colSpan = 2;
			Foxtrick.addClass(td, 'center endColumn1');
			td.textContent = Foxtrick.L10n.getString('PsicoTSI.WAGE_PREDICTION') + ' (' +
				Foxtrick.util.currency.getSymbol() + ')';
			tr.appendChild(td);
			tbody.appendChild(tr);

			tr = doc.createElement('tr');
			td = doc.createElement('th');
			td.textContent = Foxtrick.L10n.getString('PsicoTSI.FORM_SUBLEVELS');
			tr.appendChild(td);
			td = doc.createElement('th');
			td.textContent = Foxtrick.L10n.getString('PsicoTSI.PREDICTION');
			tr.appendChild(td);
			td = doc.createElement('th');
			Foxtrick.addClass(td, 'endColumn1');
			td.textContent = Foxtrick.L10n.getString('PsicoTSI.SECONDARIES_SUBLEVELS');
			tr.appendChild(td);
			td = doc.createElement('th');
			td.textContent = Foxtrick.L10n.getString('PsicoTSI.PREDICTION');
			tr.appendChild(td);
			tbody.appendChild(tr);

			tr = doc.createElement('tr');
			td = doc.createElement('td');
			td.textContent = Foxtrick.L10n.getString('PsicoTSI.FORM_HIGH');
			tr.appendChild(td);
			td = doc.createElement('td');
			td.textContent = formHigh;
			tr.appendChild(td);
			td = doc.createElement('td');
			Foxtrick.addClass(td, 'endColumn1');
			td.textContent = Foxtrick.L10n.getString('PsicoTSI.DECIMALS_HIGH');
			tr.appendChild(td);
			td = doc.createElement('td');
			if (isWagePredictionAvailable)
				Foxtrick.addClass(td, 'shy');
			td.textContent = wageHigh;
			tr.appendChild(td);
			tbody.appendChild(tr);

			tr = doc.createElement('tr');
			td = doc.createElement('td');
			td.textContent = Foxtrick.L10n.getString('PsicoTSI.FORM_AVG');
			tr.appendChild(td);
			td = doc.createElement('td');
			td.textContent = formAvg;
			tr.appendChild(td);
			td = doc.createElement('td');
			Foxtrick.addClass(td, 'endColumn1');
			td.textContent = Foxtrick.L10n.getString('PsicoTSI.DECIMALS_AVG');
			tr.appendChild(td);
			td = doc.createElement('td');
			if (isWagePredictionAvailable)
				Foxtrick.addClass(td, 'shy');
			td.textContent = wageAvg;
			tr.appendChild(td);
			tbody.appendChild(tr);

			tr = doc.createElement('tr');
			td = doc.createElement('td');
			td.textContent = Foxtrick.L10n.getString('PsicoTSI.FORM_LOW');
			tr.appendChild(td);
			td = doc.createElement('td');
			td.textContent = formLow;
			tr.appendChild(td);
			td = doc.createElement('td');
			Foxtrick.addClass(td, 'endColumn1');
			td.textContent = Foxtrick.L10n.getString('PsicoTSI.DECIMALS_LOW');
			tr.appendChild(td);
			td = doc.createElement('td');
			if (isWagePredictionAvailable)
				Foxtrick.addClass(td, 'shy');
			td.textContent = wageLow;
			tr.appendChild(td);
			tbody.appendChild(tr);

		}

		var onLeft = Foxtrick.Prefs.isModuleOptionEnabled('PsicoTSI', 'showOnLeft');
		var hide = Foxtrick.Prefs.isModuleOptionEnabled('PsicoTSI', 'hideUnderSkills');
		if (!onLeft || !hide) {
			var title = doc.createElement('h2');
			title.appendChild(doc.createTextNode(this.title));
			var divobj = Foxtrick.createFeaturedElement(doc, this, 'div');
			Foxtrick.addClass(divobj, 'ft-psico-mainBox mainBox');

			divobj.appendChild(title);
			divobj.appendChild(table);
			divobj.appendChild(messagesDiv);

			entryPoint.parentNode.insertBefore(divobj, entryPoint.nextSibling);
		}

		if (onLeft) {
			var sidebar = Foxtrick.createFeaturedElement(doc, module, 'div');
			Foxtrick.addClass(sidebar, 'ft-psico-sideBar');

			if (typeof maxSkill != 'undefined') {
				// skills available
				var STR_FORM = Foxtrick.L10n.getString('PsicoTSI.FORM');
				var CurrencyName = Foxtrick.util.currency.getSymbol();

				var head = doc.createElement('p');
				sidebar.appendChild(head);
				var b = doc.createElement('strong');
				head.appendChild(b);
				b.textContent = mainSkillText;
				var formH = doc.createElement('p');
				sidebar.appendChild(formH);
				formH.textContent = '[' + STR_FORM + '+]=' + formHigh + '';
				var formA = doc.createElement('p');
				sidebar.appendChild(formA);
				formA.textContent = '[' + STR_FORM + '~]=' + formAvg + '';
				var formL = doc.createElement('p');
				sidebar.appendChild(formL);
				formL.textContent = '[' + STR_FORM + '-]=' + formLow + '';
				var wageH = doc.createElement('p');
				sidebar.appendChild(wageH);
				wageH.textContent = '[' + CurrencyName + '+]=' + wageHigh + '';
				var wageA = doc.createElement('p');
				sidebar.appendChild(wageA);
				wageA.textContent = '[' + CurrencyName + '~]=' + wageAvg + '';
				var wageL = doc.createElement('p');
				sidebar.appendChild(wageL);
				wageL.textContent = '[' + CurrencyName + '-]=' + wageLow + '';
			}

			sidebar.appendChild(imgsOnly);

			Foxtrick.addBoxToSidebar(doc, module.title, sidebar, 0, true);
		}
	},

	/**
	 * Draw PsicoTSI prediction div in player container (players page, TL results)
	 * @param	{documen}	doc
	 * @param	{string}	id						index to use for conainer IDs
	 * @param	{Element}	entryPoint
	 * @param	{boolean}	isUndefinedMainskill
	 * @param	{boolean}	isInjured
	 * @param	{boolean}	isOld
	 * @param	{Integer}	maxSkill
	 * @param	{number}	formHigh				skill level when form sub is high
	 * @param	{number}	formAvg					average
	 * @param	{number}	formLow					low
	 * @param	{number}	wageLow					skill level when secondary subs are low or 'N/A'
	 * @param	{string}	limit					'High', 'Medium' or 'Low'
	 * @param	{boolean}	displayAsLink
	 */
	drawInPlayerInfo: function(doc, id, entryPoint, isUndefinedMainskill, isInjured, isOld,
	                           maxSkill, formHigh, formAvg, formLow, wageLow,
	                           limit, displayAsLink) {
		var module = this;

		var useLinks = typeof displayAsLink == 'undefined' || displayAsLink;

		var PlayerImg = function(type, title, cls) {
			this.src = module.IMAGES[type];
			var ttl = typeof title == 'undefined' ?
				Foxtrick.L10n.getString('PsicoTSI.' + type) :
				title;

			this.alt = this.title = ttl;
			if (cls)
				this.class = cls;
		};
		PlayerImg.prototype = {
			alt: '',
			title: '',
			border: '0',
			width: '16',
			height: '16',
			class: 'ft-psico-indicator',
			src: '',
		};
		var logo = new PlayerImg('LOGO', this.title, 'ft-psico-indicator-left');

		var wrapper = Foxtrick.createFeaturedElement(doc, this, 'div');
		Foxtrick.addClass(wrapper, 'ft-psico');
		var psicotsiInfo = doc.createElement('div');
		psicotsiInfo.setAttribute('id', 'ft_psico_info_div_' + id);
		if (useLinks)
			Foxtrick.addClass(psicotsiInfo, 'hidden');

		var psicotsiHideDiv = doc.createElement('div');
		Foxtrick.addClass(psicotsiHideDiv, 'ft-psico-hide');
		var imgWrap = doc.createElement('span');
		psicotsiHideDiv.appendChild(imgWrap);
		Foxtrick.addImage(doc, imgWrap, logo);

		var psicotsiHideLink;
		if (useLinks) {
			psicotsiHideLink = doc.createElement('a');
			Foxtrick.addClass(psicotsiHideLink, 'ft-link');
			psicotsiHideLink.setAttribute('show', 'ft_psico_show_div_' + id);
			psicotsiHideLink.setAttribute('hide', 'ft_psico_info_div_' + id);
			Foxtrick.onClick(psicotsiHideLink, function(ev) {
				var document = ev.target.ownerDocument;
				Foxtrick.toggleClass(document.getElementById(ev.target.getAttribute('hide')),
									 'hidden');
				Foxtrick.toggleClass(document.getElementById(ev.target.getAttribute('show')),
									 'hidden');
			});
		}
		else {
			psicotsiHideLink = doc.createElement('strong');
		}

		psicotsiHideLink.textContent = this.title;
		psicotsiHideDiv.appendChild(psicotsiHideLink);
		var spacer = doc.createElement('span');
		spacer.textContent = String.fromCharCode(160);
		psicotsiHideDiv.appendChild(spacer);
		psicotsiInfo.appendChild(psicotsiHideDiv);

		var mainSkillText = this.skills[maxSkill];

		var paragraph = doc.createElement('p');
		var pre = mainSkillText + ' [' + Foxtrick.L10n.getString('PsicoTSI.FORM') + '=';
		paragraph.textContent = pre + Foxtrick.L10n.getString('PsicoTSI.FORM_HIGH') +
								']=' + formHigh;
		psicotsiInfo.appendChild(paragraph);

		paragraph = doc.createElement('p');
		paragraph.textContent = pre + Foxtrick.L10n.getString('PsicoTSI.FORM_AVG') + ']=' + formAvg;
		psicotsiInfo.appendChild(paragraph);

		paragraph = doc.createElement('p');
		paragraph.textContent = pre + Foxtrick.L10n.getString('PsicoTSI.FORM_LOW') + ']=' + formLow;
		psicotsiInfo.appendChild(paragraph);

		if (wageLow && wageLow != 'N/A') {
			paragraph = doc.createElement('p');
			pre = pre.replace(Foxtrick.L10n.getString('PsicoTSI.FORM'),
							  Foxtrick.L10n.getString('PsicoTSI.WAGE'));
			paragraph.textContent = pre + Foxtrick.L10n.getString('PsicoTSI.DECIMALS_LOW') + ']=' +
				wageLow;
			psicotsiInfo.appendChild(paragraph);
			wrapper.setAttribute('data-psico-wage', String(wageLow));
		}

		var psicotsiShowDiv;
		if (useLinks) {
			psicotsiShowDiv = doc.createElement('div');
			psicotsiShowDiv.setAttribute('id', 'ft_psico_show_div_' + id);
			Foxtrick.addClass(psicotsiShowDiv, 'ft-psico-show');
			var logoWrap = doc.createElement('span');
			psicotsiShowDiv.appendChild(logoWrap);
			Foxtrick.addImage(doc, logoWrap, logo);

			var psicotsiShowLink = doc.createElement('a');
			psicotsiShowLink.textContent = mainSkillText + ' [' +
				Foxtrick.L10n.getString('PsicoTSI.FORM') + '=' +
				Foxtrick.L10n.getString('PsicoTSI.FORM_AVG') + ']=' + formAvg;
			Foxtrick.addClass(psicotsiShowLink, 'ft-link');
			psicotsiShowLink.setAttribute('show', 'ft_psico_info_div_' + id);
			psicotsiShowLink.setAttribute('hide', 'ft_psico_show_div_' + id);
			Foxtrick.onClick(psicotsiShowLink, function(ev) {
				var document = ev.target.ownerDocument;
				Foxtrick.toggleClass(document.getElementById(ev.target.getAttribute('hide')),
									 'hidden');
				Foxtrick.toggleClass(document.getElementById(ev.target.getAttribute('show')),
									 'hidden');
			});
			psicotsiShowDiv.appendChild(psicotsiShowLink);
			psicotsiShowDiv.appendChild(Foxtrick.cloneElement(spacer, true));
			wrapper.appendChild(psicotsiShowDiv);
		}

		if (limit == 'Low') {
			let img = new PlayerImg('LOW_SUBLEVELS');
			Foxtrick.addImage(doc, psicotsiHideDiv, img);
			if (useLinks)
				Foxtrick.addImage(doc, psicotsiShowDiv, img);
		}
		else if (limit == 'High') {
			let img = new PlayerImg('HIGH_SUBLEVELS');
			Foxtrick.addImage(doc, psicotsiHideDiv, img);
			if (useLinks)
				Foxtrick.addImage(doc, psicotsiShowDiv, img);
		}
		if (isUndefinedMainskill) {
			let img = new PlayerImg('UNDEF_MAINSKILL');
			Foxtrick.addImage(doc, psicotsiHideDiv, img);
			if (useLinks)
				Foxtrick.addImage(doc, psicotsiShowDiv, img);
		}
		if (isInjured) {
			let img = new PlayerImg('INJURED');
			Foxtrick.addImage(doc, psicotsiHideDiv, img);
			if (useLinks)
				Foxtrick.addImage(doc, psicotsiShowDiv, img);
		}
		if (isOld) {
			let img = new PlayerImg('OLD');
			Foxtrick.addImage(doc, psicotsiHideDiv, img);
			if (useLinks)
				Foxtrick.addImage(doc, psicotsiShowDiv, img);
		}

		wrapper.appendChild(psicotsiInfo);
		wrapper.setAttribute('data-psico-skill', mainSkillText);
		wrapper.setAttribute('data-psico-avg', String(formAvg));
		entryPoint.appendChild(wrapper);
	},
};
