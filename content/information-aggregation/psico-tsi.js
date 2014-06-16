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
		Foxtrick.util.currency.establish(doc, function() {
			if (Foxtrick.isPage(doc, 'playerDetails'))
				module.runPlayer(doc);
			if ((Foxtrick.isPage(doc, 'players') || Foxtrick.isPage(doc, 'ntPlayers')) &&
				Foxtrick.Prefs.isModuleOptionEnabled('PsicoTSI', 'enablePlayersPage'))
				module.runPlayers(doc);
			if (Foxtrick.isPage(doc, 'transferSearchResult') &&
				Foxtrick.Prefs.isModuleOptionEnabled('PsicoTSI', 'enableTLPage'))
				module.runTL(doc);
		});
	},
	/**
	 * @param	{document}	doc
	 */
	runPlayer: function(doc) {

		if (!doc.getElementsByClassName('playerInfo').length)
			return;

		var p = Foxtrick.Pages.Player.getSkills(doc);

		if (!p) {
			this.drawMessage(doc, doc.getElementById('ctl00_ctl00_CPContent_CPMain_updBestLatest'));
			return;
		}

		p.age = Foxtrick.Pages.Player.getAge(doc);
		p.tsi = Foxtrick.Pages.Player.getTsi(doc);
		p.salary = Foxtrick.Pages.Player.getWage(doc).base;
		p.isAbroad = false;

		var basicSkills = Foxtrick.Pages.Player.getBasicSkills(doc);
		p.form = parseInt(basicSkills.form[0], 10);
		p.stamina = parseInt(basicSkills.stamina[0], 10);

		var age = p.age.years;
		var injured = Foxtrick.Pages.Player.getInjuryWeeks(doc) && true;

		var pr = this.getPrediction(p, Foxtrick.util.currency.getRate());
		if (!pr)
			return;

		// assuming player skills is the first mainBox
		var entryPoint = doc.querySelector('#mainBody > .mainBox');

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

				var injured = (p.injuredWeeks && true);
				var age = p.ageYears;

				var pr = p.psico || module.getPrediction(p, currRate);
				if (!pr)
					continue;

				module.drawInPlayerInfo(doc, i, p.playerNode, pr.undef, injured, age > 27,
										pr.maxSkill, pr.formHigh, pr.formAvg, pr.formLow,
										pr.wageLow, pr.limit);
			}
		}, { teamid: Foxtrick.Pages.All.getTeamId(doc) });

	},
	/**
	 * @param	{document}	doc
	 */
	runTL: function(doc) {
		var useLinks = Foxtrick.Prefs.isModuleOptionEnabled('PsicoTSI', 'displayAsLink');
		var players = Foxtrick.Pages.TransferSearchResults.getPlayerList(doc);
		var playerContainers = doc.getElementById('mainBody')
			.getElementsByClassName('transferPlayerInfo');
		var cellId = 0;
		for (var i = 0, p; i < players.length && (p = players[i]); ++i) {

			var entry = playerContainers[i];

			// if the following container does not exist
			// the player is sold and skills aren't visible
			if (!entry.getElementsByClassName('transferPlayerCharacteristics').length)
				continue;

			var age = p.age.years;
			var injured = p.injured;

			var pr = p.psico || this.getPrediction(p, 0);
			if (!pr)
				continue;

			// clear floats
			var div = doc.createElement('div');
			Foxtrick.addClass(div, 'ft-clear-both');
			entry.appendChild(div);

			this.drawInPlayerInfo(doc, i, entry, pr.undef, injured, age > 27,
								  pr.maxSkill, pr.formHigh, pr.formAvg, pr.formLow, 'N/A',
								  pr.limit, useLinks);

			// move the ruler below psico
			var hr = playerContainers[i].getElementsByClassName('borderSeparator')[0];
			if (hr)
				playerContainers[i].appendChild(hr);
		}
	},
	/**
	 * Loops through playerlist and adds psico, psicoTSI, psicoTitle properties
	 * currRate is needed for wage prediction, use 0 otherwise
	 * may be called from other scripts!
	 * @param	{Array}	playerList
	 * @param	{Number}	currRate
	 */
	loopPlayerList: function(playerList, currRate) {
		for (var i = 0, p; i < playerList.length && (p = playerList[i]); ++i) {
			if (typeof(p.playmaking) == 'undefined') {
				continue;
			}

			var pr = this.getPrediction(p, currRate);
			if (!pr)
				continue;

			p.psicoTSI = pr.formAvg;
			p.psicoTitle = this.skills[pr.maxSkill];
			p.psico = pr;
		}
	},
	/**
	 * Get prediction for player object
	 * Wage prediction needs currRate, use 0 otherwise
	 * returns prediction object
	 * { maxSkill, isGK, undef, limit, formLow, formAvg, formHigh, wageLow, wageAvg, wageHigh }
	 * may be called from other scripts!
	 * @param	{Object}	p
	 * @param	{Number}	currRate
	 * @returns	{Object}
	 */
	getPrediction: function(p, currRate) {
		if (typeof(p.playmaking) == 'undefined') {
			return null;
		}

		var age = p.ageYears || p.age.years;
		var currTSI = p.tsi;
		var currWAGE = (currRate) ? parseInt(p.salary / (p.isAbroad ? 1.2 : 1) * currRate, 10) : 0;

		var frm = p.form;
		var sta = p.stamina;

		var pla = p.playmaking, win = p.winger, sco = p.scoring, goa = p.keeper,
			pas = p.passing, def = p.defending, sp = p.setPieces;
		var playerskills = [frm, sta, pla, win, sco, goa, pas, def, sp];

		var pr = Foxtrick.psico.getPrediction(playerskills, currTSI, currWAGE, age);
		return pr;
	},
	/**
	 * Draw PsicoTSI prediction table (player page)
	 * @param	{documen}	doc
	 * @param	{element}	entryPoint				the result is added as nextSibling to this
	 * @param	{Boolean}	isGK
	 * @param	{Boolean}	isUndefinedMainskill
	 * @param	{Boolean}	isInjured
	 * @param	{Boolean}	isOld
	 * @param	{Integer}	maxSkill
	 * @param	{Number}	formHigh				skill level when form sub is high
	 * @param	{Number}	formAvg					average
	 * @param	{Number}	formLow					low
	 * @param	{Number}	wageHigh				skill level when secondary subs are high
	 * @param	{Number}	wageAvg					average or 'N/A'
	 * @param	{Number}	wageLow					low or 'N/A'
	 * @param	{String}	limit					'High', 'Medium' or 'Low'
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
			class: 'ft-psico-indicator-left'
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

		if (typeof (maxSkill) == 'undefined') {
			// Skills not available
			addImage('SKILL_NOT_AVAIL');
		}
		else {
			var mainSkillText = this.skills[maxSkill];

			var isWagePredictionAvailable = (wageLow != 'N/A');

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

			if (typeof (maxSkill) != 'undefined') {
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
	 * @param	{String}	id						index to use for conainer IDs
	 * @param	{element}	entryPoint
	 * @param	{Boolean}	isUndefinedMainskill
	 * @param	{Boolean}	isInjured
	 * @param	{Boolean}	isOld
	 * @param	{Integer}	maxSkill
	 * @param	{Number}	formHigh				skill level when form sub is high
	 * @param	{Number}	formAvg					average
	 * @param	{Number}	formLow					low
	 * @param	{Number}	wageLow					skill level when secondary subs are low or 'N/A'
	 * @param	{String}	limit					'High', 'Medium' or 'Low'
	 * @param	{Boolean}	displayAsLink
	 */
	drawInPlayerInfo: function(doc, id, entryPoint, isUndefinedMainskill, isInjured, isOld,
								maxSkill, formHigh, formAvg, formLow, wageLow, limit, displayAsLink) {
		var module = this;

		var useLinks = (typeof (displayAsLink) == 'undefined' || displayAsLink);

		var players_img = function(type, title, cls) {
			this.src = module.IMAGES[type];
			if (typeof (title) == 'undefined')
				title = Foxtrick.L10n.getString('PsicoTSI.' + type);
			this.alt = this.title = title;
			if (cls)
				this.class = cls;
		};
		players_img.prototype = {
			alt: '',
			title: '',
			border: '0',
			width: '16',
			height: '16',
			class: 'ft-psico-indicator',
			src: ''
		};
		var logo = new players_img('LOGO', this.title, 'ft-psico-indicator-left');

		var al_div = Foxtrick.createFeaturedElement(doc, this, 'div');
		Foxtrick.addClass(al_div, 'ft-psico');
		var psicotsi_info = doc.createElement('div');
		psicotsi_info.setAttribute('id', 'ft_psico_info_div_' + id);
		if (useLinks)
			Foxtrick.addClass(psicotsi_info, 'hidden');

		var psicotsi_hide_div = doc.createElement('div');
		Foxtrick.addClass(psicotsi_hide_div, 'ft-psico-hide');
		var imgWrap = doc.createElement('span');
		psicotsi_hide_div.appendChild(imgWrap);
		Foxtrick.addImage(doc, imgWrap, logo);

		var psicotsi_hide_link;
		if (useLinks) {
			psicotsi_hide_link = doc.createElement('a');
			Foxtrick.addClass(psicotsi_hide_link, 'ft-link');
			psicotsi_hide_link.setAttribute('show', 'ft_psico_show_div_' + id);
			psicotsi_hide_link.setAttribute('hide', 'ft_psico_info_div_' + id);
			Foxtrick.onClick(psicotsi_hide_link, function(ev) {
				var document = ev.target.ownerDocument;
				Foxtrick.toggleClass(document.getElementById(ev.target.getAttribute('hide')),
									 'hidden');
				Foxtrick.toggleClass(document.getElementById(ev.target.getAttribute('show')),
									 'hidden');
			});
		}
		else
			psicotsi_hide_link = doc.createElement('strong');
		psicotsi_hide_link.textContent = this.title;
		psicotsi_hide_div.appendChild(psicotsi_hide_link);
		var spacer = doc.createElement('span');
		spacer.textContent = String.fromCharCode(160);
		psicotsi_hide_div.appendChild(spacer);
		psicotsi_info.appendChild(psicotsi_hide_div);

		var mainSkillText = this.skills[maxSkill];

		var paragraph = doc.createElement('p');
		var pre = mainSkillText + ' [' + Foxtrick.L10n.getString('PsicoTSI.FORM') + '=';
		paragraph.textContent = pre + Foxtrick.L10n.getString('PsicoTSI.FORM_HIGH') + ']=' + formHigh;
		psicotsi_info.appendChild(paragraph);

		paragraph = doc.createElement('p');
		paragraph.textContent = pre + Foxtrick.L10n.getString('PsicoTSI.FORM_AVG') + ']=' + formAvg;
		psicotsi_info.appendChild(paragraph);

		paragraph = doc.createElement('p');
		paragraph.textContent = pre + Foxtrick.L10n.getString('PsicoTSI.FORM_LOW') + ']=' + formLow;
		psicotsi_info.appendChild(paragraph);

		if (wageLow && wageLow != 'N/A') {
			paragraph = doc.createElement('p');
			pre = pre.replace(Foxtrick.L10n.getString('PsicoTSI.FORM'),
							  Foxtrick.L10n.getString('PsicoTSI.WAGE'));
			paragraph.textContent = pre + Foxtrick.L10n.getString('PsicoTSI.DECIMALS_LOW') + ']=' +
				wageLow;
			psicotsi_info.appendChild(paragraph);
		}

		if (useLinks) {
			var psicotsi_show_div = doc.createElement('div');
			psicotsi_show_div.setAttribute('id', 'ft_psico_show_div_' + id);
			Foxtrick.addClass(psicotsi_show_div, 'ft-psico-show');
			var imgWrap = doc.createElement('span');
			psicotsi_show_div.appendChild(imgWrap);
			Foxtrick.addImage(doc, imgWrap, logo);

			var psicotsi_show_link = doc.createElement('a');
			psicotsi_show_link.textContent = mainSkillText + ' [' +
				Foxtrick.L10n.getString('PsicoTSI.FORM') + '=' +
				Foxtrick.L10n.getString('PsicoTSI.FORM_AVG') + ']=' + formAvg;
			Foxtrick.addClass(psicotsi_show_link, 'ft-link');
			psicotsi_show_link.setAttribute('show', 'ft_psico_info_div_' + id);
			psicotsi_show_link.setAttribute('hide', 'ft_psico_show_div_' + id);
			Foxtrick.onClick(psicotsi_show_link, function(ev) {
				var document = ev.target.ownerDocument;
				Foxtrick.toggleClass(document.getElementById(ev.target.getAttribute('hide')),
									 'hidden');
				Foxtrick.toggleClass(document.getElementById(ev.target.getAttribute('show')),
									 'hidden');
			});
			psicotsi_show_div.appendChild(psicotsi_show_link);
			psicotsi_show_div.appendChild(spacer.cloneNode(true));
			al_div.appendChild(psicotsi_show_div);
		}

		var img = logo;
		if (limit == 'Low') {
			img = new players_img('LOW_SUBLEVELS');
			Foxtrick.addImage(doc, psicotsi_hide_div, img);
			if (useLinks)
				Foxtrick.addImage(doc, psicotsi_show_div, img);
		}
		else if (limit == 'High') {
			img = new players_img('HIGH_SUBLEVELS');
			Foxtrick.addImage(doc, psicotsi_hide_div, img);
			if (useLinks)
				Foxtrick.addImage(doc, psicotsi_show_div, img);
		}
		if (isUndefinedMainskill) {
			img = new players_img('UNDEF_MAINSKILL');
			Foxtrick.addImage(doc, psicotsi_hide_div, img);
			if (useLinks)
				Foxtrick.addImage(doc, psicotsi_show_div, img);
		}
		if (isInjured) {
			img = new players_img('INJURED');
			Foxtrick.addImage(doc, psicotsi_hide_div, img);
			if (useLinks)
				Foxtrick.addImage(doc, psicotsi_show_div, img);
		}
		if (isOld) {
			img = new players_img('OLD');
			Foxtrick.addImage(doc, psicotsi_hide_div, img);
			if (useLinks)
				Foxtrick.addImage(doc, psicotsi_show_div, img);
		}

		al_div.appendChild(psicotsi_info);
		entryPoint.appendChild(al_div);
	}
};
