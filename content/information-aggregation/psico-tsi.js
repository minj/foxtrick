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

Foxtrick.modules['PsicoTSI'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['playerDetails', 'players', 'ntPlayers', 'transferSearchResult'],
	OPTIONS: ['enablePlayersPage', ['enableTLPage', 'displayAsLink']],

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
		this.title = Foxtrickl10n.getString('PsicoTSI.title');
		this.skills = [
			Foxtrickl10n.getString('Form'),
			Foxtrickl10n.getString('Stamina'),
			Foxtrickl10n.getString('Playmaking'),
			Foxtrickl10n.getString('Winger'),
			Foxtrickl10n.getString('Scoring'),
			Foxtrickl10n.getString('Keeper'),
			Foxtrickl10n.getString('Passing'),
			Foxtrickl10n.getString('Defending'),
			Foxtrickl10n.getString('Set_pieces'),
		];
		var module = this;
		Foxtrick.util.currency.establish(doc, function() {
			if (Foxtrick.isPage(doc, 'playerDetails'))
				module.runPlayer(doc);
			if ((Foxtrick.isPage(doc, 'players') || Foxtrick.isPage(doc, 'ntPlayers')) &&
				FoxtrickPrefs.isModuleOptionEnabled('PsicoTSI', 'enablePlayersPage'))
				module.runPlayers(doc);
			if (Foxtrick.isPage(doc, 'transferSearchResult') &&
				FoxtrickPrefs.isModuleOptionEnabled('PsicoTSI', 'enableTLPage'))
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

		if (typeof (p.playmaking) == 'undefined') {
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

		var pr = this.getPrediction(p, Foxtrick.util.currency.getRate(doc));
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
		var currRate = Foxtrick.util.currency.getRate(doc);

		Foxtrick.Pages.Players.getPlayerList(doc, function(playerList) {
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
		var useLinks = FoxtrickPrefs.isModuleOptionEnabled('PsicoTSI', 'displayAsLink');
		var players = Foxtrick.Pages.TransferSearchResults.getPlayerList(doc);
		var playerContainers = doc.getElementById('mainBody')
			.getElementsByClassName('transferPlayerInfo');
		var cellId = 0;
		for (var i = 0, p; i < players.length && (p = players[i]); ++i) {
			// if the following container does not exist
			// the player is sold and skills aren't visible
			if (!playerContainers[i].getElementsByClassName('transferPlayerCharacteristics').length)
				continue;

			var age = p.age.years;
			var injured = p.injured;

			var pr = p.psico || this.getPrediction(p, 0);
			if (!pr)
				continue;

			this.drawInPlayerInfo(doc, i, playerContainers[i], pr.undef, injured, age > 27,
								  pr.maxSkill, pr.formHigh, pr.formAvg, pr.formLow, 'N/A',
								  pr.limit, useLinks);
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

		var imgattr = {
			alt: '',
			width: '16',
			height: '16',
			class: 'ft-psico-indicator-left'
		};
		var addImage = function(type) {
			var messageP = doc.createElement('p');
			messageP.textContent = Foxtrickl10n.getString('PsicoTSI.' + type);
			imgattr.src = module.IMAGES[type];
			var imgWrap = doc.createElement('span');
			Foxtrick.addImage(doc, imgWrap, imgattr);
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

			if (Foxtrick.util.layout.isStandard(doc)) {
				Foxtrick.addClass(table, 'nowrap alltidMatches');
			}
			else {
				Foxtrick.addClass(table, 'alltidMatches');
			}

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

			table.innerHTML= '<tr><th colspan="4" class="center"><b>' +
				mainSkillText.toUpperCase() + '</tr>' +
				'<tr><th colspan="2" class="center"><b>' +
				Foxtrickl10n.getString('PsicoTSI.TSI_PREDICTION') + '</b></th>' +
				'<th colspan="2" class="center endColumn1"><b>' +
				Foxtrickl10n.getString('PsicoTSI.WAGE_PREDICTION') + ' (' +
				Foxtrick.util.currency.getSymbol(doc) + ')</b></th></tr>' +
				'<tr><td><b>' + Foxtrickl10n.getString('PsicoTSI.FORM_SUBLEVELS') +
				'</b></td><td><b>' + Foxtrickl10n.getString('PsicoTSI.PREDICTION') + '</td>' +
				'<td class="endColumn1"><b>' +
				Foxtrickl10n.getString('PsicoTSI.SECONDARIES_SUBLEVELS') +
				'</b></td><td><b>' + Foxtrickl10n.getString('PsicoTSI.PREDICTION') + '</td></tr>' +
				'<tr><td>' + Foxtrickl10n.getString('PsicoTSI.DECIMALS_HIGH') + '</td><td>' +
				formHigh + '</td>' + '<td class="endColumn1">' +
				Foxtrickl10n.getString('PsicoTSI.DECIMALS_HIGH') + '</td><td' +
				(!isWagePredictionAvailable ? ' class="shy"' : '') + '>' + wageHigh + '</td></tr>' +
				'<tr><td>' + Foxtrickl10n.getString('PsicoTSI.DECIMALS_AVG') + '</td><td>' +
				formAvg + '</td>' + '<td class="endColumn1">' +
				Foxtrickl10n.getString('PsicoTSI.DECIMALS_AVG') + '</td><td' +
				(!isWagePredictionAvailable? ' class="shy"' : '') + '>' + wageAvg + '</td></tr>' +
				'<tr><td>' + Foxtrickl10n.getString('PsicoTSI.DECIMALS_LOW') + '</td><td>' +
				formLow + '</td>' + '<td class="endColumn1">' +
				Foxtrickl10n.getString('PsicoTSI.DECIMALS_LOW') + '</td><td' +
				(!isWagePredictionAvailable ? ' class="shy"' : '') + '>' + wageLow + '</td></tr>';
		}

		var title = doc.createElement('h2');
		title.appendChild(doc.createTextNode(this.title));
		var divobj = Foxtrick.createFeaturedElement(doc, this, 'div');
		Foxtrick.addClass(divobj, 'ft-psico-mainBox mainBox');

		divobj.appendChild(title);
		divobj.appendChild(table);
		divobj.appendChild(messagesDiv);

		entryPoint.parentNode.insertBefore(divobj, entryPoint.nextSibling);

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
				title = Foxtrickl10n.getString('PsicoTSI.' + type);
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
		var pre = mainSkillText + ' [' + Foxtrickl10n.getString('PsicoTSI.FORM') + '=';
		paragraph.textContent = pre + Foxtrickl10n.getString('PsicoTSI.FORM_HIGH') + ']=' + formHigh;
		psicotsi_info.appendChild(paragraph);

		paragraph = doc.createElement('p');
		paragraph.textContent = pre + Foxtrickl10n.getString('PsicoTSI.FORM_AVG') + ']=' + formAvg;
		psicotsi_info.appendChild(paragraph);

		paragraph = doc.createElement('p');
		paragraph.textContent = pre + Foxtrickl10n.getString('PsicoTSI.FORM_LOW') + ']=' + formLow;
		psicotsi_info.appendChild(paragraph);

		if (wageLow && wageLow != 'N/A') {
			paragraph = doc.createElement('p');
			pre = pre.replace(Foxtrickl10n.getString('PsicoTSI.FORM'),
							  Foxtrickl10n.getString('PsicoTSI.WAGE'));
			paragraph.textContent = pre + Foxtrickl10n.getString('PsicoTSI.DECIMALS_LOW') + ']=' +
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
				Foxtrickl10n.getString('PsicoTSI.FORM') + '=' +
				Foxtrickl10n.getString('PsicoTSI.FORM_AVG') + ']=' + formAvg;
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
