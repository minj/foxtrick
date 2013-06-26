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

	//CSS: Foxtrick.InternalPath + 'resources/css/psico-tsi.css',
	IMAGES: {
		UNKNOWN: Foxtrick.InternalPath + 'resources/img/psicotsi/unknown.png',
		OLD: Foxtrick.InternalPath + 'resources/img/psicotsi/old.png',
		LOGO: Foxtrick.InternalPath + 'resources/img/psicotsi/logo.png',
		INJURED: Foxtrick.InternalPath + 'resources/img/psicotsi/injured.png',
		UNDEF_MAINSKILL: Foxtrick.InternalPath + 'resources/img/psicotsi/undef_mainskill.png',
		HIGH_SUBLEVELS: Foxtrick.InternalPath + 'resources/img/psicotsi/high_sublevels.png',
		LOW_SUBLEVELS: Foxtrick.InternalPath + 'resources/img/psicotsi/low_sublevels.png',
	},
	title: 'PsicoTSI Foxtrick Edition',
	/**
	 * @param	{document}	doc
	 */
	run: function(doc) {
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

		var entryPoint;
		var basicSkills = Foxtrick.Pages.Player.getBasicSkills(doc);
		var frm = parseInt(basicSkills.form[0], 10);
		var sta = parseInt(basicSkills.stamina[0], 10);
		var playerAge = Foxtrick.Pages.Player.getAge(doc);
		var age = playerAge.years;
		var currTSI = Foxtrick.Pages.Player.getTsi(doc);
		var currWAGE = parseInt(Foxtrick.Pages.Player.getWage(doc).base *
								Foxtrick.util.currency.getRate(doc), 10);
		var injured = (Foxtrick.Pages.Player.getInjuryWeeks(doc) && true);

		var skills = Foxtrick.Pages.Player.getSkills(doc);
		if (typeof(skills.playmaking) == 'undefined') {
			entryPoint = doc.getElementById('ctl00_ctl00_CPContent_CPMain_updBestLatest');
			this.drawMessage(doc, entryPoint)
			return;
		}

		var boxes = doc.querySelectorAll('#mainBody > .mainBox');
		var idx;
		for (idx = boxes.length - 1; idx > -1; --idx)
			if (boxes[idx].id != 'trainingDetails')
				break;
		if (idx < 1)
			return;
		entryPoint = boxes[idx - 1];

		var pla = skills.playmaking, win = skills.winger, sco = skills.scoring, goa = skills.keeper,
			pas = skills.passing, def = skills.defending, sp = skills.setPieces;
		var playerskills = [frm, sta, pla, win, sco, goa, pas, def, sp];
		var maxSkill = Foxtrick.psico.getMaxSkill(playerskills);
		//halt if player is a Divine or Non - existent
		if (playerskills[maxSkill] == 20 || playerskills[maxSkill] == 0) {
			return;
		}
		var valMaxSkillAvg = 0;
		var valMaxSkillLow = 0;
		var valMaxSkillHigh = 0;

		var valMaxSkillWageLow = 'N/A';
		var valMaxSkillWageAvg = 'N/A';
		var valMaxSkillWageHigh = 'N/A';

		var undef = Foxtrick.psico.undefinedMainSkill(playerskills);
		var limit = 'Medium';
		var isGK = Foxtrick.psico.isGoalkeeper(maxSkill);
		if (!isGK) {
			valMaxSkillAvg = Foxtrick.psico.calcMaxSkill(playerskills, currTSI, 'Avg');
			valMaxSkillLow = Foxtrick.psico.calcMaxSkill(playerskills, currTSI, 'Low');
			valMaxSkillHigh = Foxtrick.psico.calcMaxSkill(playerskills, currTSI, 'High');
		} else {
			valMaxSkillAvg = Foxtrick.psico.calcMaxSkillGK(currTSI, frm, 'Avg');
			valMaxSkillLow = Foxtrick.psico.calcMaxSkillGK(currTSI, frm, 'Low');
			valMaxSkillHigh = Foxtrick.psico.calcMaxSkillGK(currTSI, frm, 'High');
		}
		if (currWAGE >= 270 && !isGK) {
			valMaxSkillWageLow = Foxtrick.psico.simWage(playerskills, currWAGE, age, 'Low');
			valMaxSkillWageAvg = Foxtrick.psico.simWage(playerskills, currWAGE, age, 'Avg');
			valMaxSkillWageHigh = Foxtrick.psico.simWage(playerskills, currWAGE, age, 'High');
		}
		if ((valMaxSkillLow - playerskills[maxSkill] <= 0.1)) {
			limit = 'Low';
		}
		if (valMaxSkillHigh - playerskills[maxSkill] >= 0.8 ||
			valMaxSkillWageHigh - playerskills[maxSkill] >= 0.8) {
			limit = 'High';
		}
		this.drawMessage(doc, entryPoint, isGK, undef, injured, age > 27, maxSkill,
						   valMaxSkillHigh, valMaxSkillAvg, valMaxSkillLow,
						   valMaxSkillWageLow, valMaxSkillWageAvg, valMaxSkillWageHigh, limit);
	},
	/**
	 * @param	{document}	doc
	 */
	runPlayers: function(doc) {
		var module = this;

		Foxtrick.Pages.Players.getPlayerList(doc, function(playerList) {
			for (var i = 0, p; i < playerList.length && (p = playerList[i]); ++i) {

				if (typeof(p.playmaking) == 'undefined') {
					continue;
				}

				var age = p.ageYears;
				var currTSI = p.tsi;
				var currWAGE = parseInt(p.salary / (p.isAbroad ? 1.2 : 1) *
										Foxtrick.util.currency.getRate(doc), 10);
				var injured = (p.injuredWeeks && true);

				var frm = p.form;
				var sta = p.stamina;

				var pla = p.playmaking, win = p.winger, sco = p.scoring, goa = p.keeper,
					pas = p.passing, def = p.defending, sp = p.setPieces;
				var playerskills = [frm, sta, pla, win, sco, goa, pas, def, sp];

				var maxSkill = Foxtrick.psico.getMaxSkill(playerskills);
				//halt if player is a Divine or Non - existent
				if (playerskills[maxSkill] == 20 || playerskills[maxSkill] == 0) {
					return;
				}
				var valMaxSkillAvg = 0;
				var valMaxSkillLow = 0;
				var valMaxSkillHigh = 0;
				var valMaxSkillWageLow = 0;

				var undef = Foxtrick.psico.undefinedMainSkill(playerskills);
				var limit = 'Medium';
				var isGK = Foxtrick.psico.isGoalkeeper(maxSkill);
				if (!isGK) {
					valMaxSkillAvg = Foxtrick.psico.calcMaxSkill(playerskills, currTSI, 'Avg');
					valMaxSkillLow = Foxtrick.psico.calcMaxSkill(playerskills, currTSI, 'Low');
					valMaxSkillHigh = Foxtrick.psico.calcMaxSkill(playerskills, currTSI, 'High');
				} else {
					valMaxSkillAvg = Foxtrick.psico.calcMaxSkillGK(currTSI, frm, 'Avg');
					valMaxSkillLow = Foxtrick.psico.calcMaxSkillGK(currTSI, frm, 'Low');
					valMaxSkillHigh = Foxtrick.psico.calcMaxSkillGK(currTSI, frm, 'High');
				}
				if (currWAGE >= 270 && !isGK) {
					valMaxSkillWageLow = Foxtrick.psico.simWage(playerskills, currWAGE, age, 'Low');
				}
				if ((valMaxSkillLow - playerskills[maxSkill] <= 0.1)) {
					limit = 'Low';
				}
				if (valMaxSkillHigh - playerskills[maxSkill] >= 0.8) {
					limit = 'High';
				}
				module.drawInPlayersPage(doc, i, p.playerNode, undef, injured, age > 27, maxSkill, valMaxSkillHigh, valMaxSkillAvg, valMaxSkillLow, valMaxSkillWageLow, limit);
			}
		}, { teamid: Foxtrick.Pages.All.getTeamId(doc) });

	},
	/**
	 * @param	{document}	doc
	 */
	runTL: function(doc) {
		Foxtrick.log('HI from TL');
	},
	drawMessage: function(doc, entryPoint, isGK, isUndefinedMainskill, isInjured, isOld, maxSkill,
						  valMaxSkillHigh, valMaxSkillAvg, valMaxSkillLow,
						  valMaxSkillWageLow, valMaxSkillWageAvg, valMaxSkillWageHigh, limit) {

		var table = doc.createElement('table');
		var messagesDiv = doc.createElement('div');

		if (typeof(maxSkill) == 'undefined') {
			// Skills not available
			var messageP = doc.createElement('p');
			var imgattr = {
				src: this.IMAGES.UNKNOWN,
				alt: '',
				width: '16',
				height: '16',
				style: 'text-align: center; vertical-align: middle; padding-right: 3px;'
			};
			Foxtrick.addImage(doc, messageP, imgattr);
			messageP.appendChild(doc.createTextNode(Foxtrickl10n.getString('PsicoTSI.SKILL_NOT_AVAIL')));
			messagesDiv.appendChild(messageP);
		}
		else {
			var mainSkillText = '';
			switch (maxSkill) {
				case 2:
					mainSkillText = Foxtrickl10n.getString('Playmaking');
					break;
				case 3:
					mainSkillText = Foxtrickl10n.getString('Winger');
					break;
				case 4:
					mainSkillText = Foxtrickl10n.getString('Scoring');
					break;
				case 5:
					mainSkillText = Foxtrickl10n.getString('Keeper');
					break;
				case 6:
					mainSkillText = Foxtrickl10n.getString('Passing');
					break;
				case 7:
					mainSkillText = Foxtrickl10n.getString('Defending');
					break;
			}

			var isWagePredictionAvailable = !(valMaxSkillWageLow == 'N/A');

			if (Foxtrick.util.layout.isStandard(doc)) {
				Foxtrick.addClass(table,'nowrap alltidMatches');
			}
			else {
				Foxtrick.addClass(table,'alltidMatches');
			}


			var imgattr = {
				alt: '',
				width: '16',
				height: '16',
				style: 'text-align: center; vertical-align: middle; padding-right: 3px;'
			};
			if (isUndefinedMainskill) {
				var messageP = doc.createElement('p');
				imgattr.src = this.IMAGES.UNDEF_MAINSKILL;
				Foxtrick.addImage(doc, messageP, imgattr);
				messageP.appendChild(doc.createTextNode(Foxtrickl10n.getString('PsicoTSI.UNDEF_MAINSKILL')));
				messagesDiv.appendChild(messageP);
			}
			if (isInjured) {
				var messageP = doc.createElement('p');
				imgattr.src = this.IMAGES.INJURED;
				Foxtrick.addImage(doc, messageP, imgattr);
				messageP.appendChild(doc.createTextNode(Foxtrickl10n.getString('PsicoTSI.INJURED')));
				messagesDiv.appendChild(messageP);
			}
			if (isOld) {
				var messageP = doc.createElement('p');
				imgattr.src = this.IMAGES.OLD;
				Foxtrick.addImage(doc, messageP, imgattr);
				messageP.appendChild(doc.createTextNode(Foxtrickl10n.getString('PsicoTSI.OLD')));
				messagesDiv.appendChild(messageP);
			}
			if (!isWagePredictionAvailable) {
				var messageP = doc.createElement('p');
				imgattr.src = this.IMAGES.UNDEF_MAINSKILL;
				Foxtrick.addImage(doc, messageP, imgattr);
				messageP.appendChild(doc.createTextNode(Foxtrickl10n.getString('PsicoTSI.WAGE_PREDICTION_NA')));
				messagesDiv.appendChild(messageP);
			}

			if (limit == 'Low') {
				var messageP = doc.createElement('p');
				imgattr.src = this.IMAGES.LOW_SUBLEVELS;
				Foxtrick.addImage(doc, messageP, imgattr);
				messageP.appendChild(doc.createTextNode(Foxtrickl10n.getString('PsicoTSI.L_LOW')));
				messagesDiv.appendChild(messageP);
			}

			if (limit == 'High') {
				var messageP = doc.createElement('p');
				imgattr.src = this.IMAGES.HIGH_SUBLEVELS,
				Foxtrick.addImage(doc, messageP, imgattr);
				messageP.appendChild(doc.createTextNode(Foxtrickl10n.getString('PsicoTSI.L_HIGH')));
				messagesDiv.appendChild(messageP);
			}

			table.innerHTML= '<tr><th colspan="4" class="center"><b>' +
				mainSkillText.toUpperCase() + '</tr>' +
				'<tr><th colspan="2" class="center"><b>' + Foxtrickl10n.getString('PsicoTSI.TSI_PREDICTION') + '</b></th>' +
				'<th colspan="2" class="center endColumn1"><b>' +
				Foxtrickl10n.getString('PsicoTSI.WAGE_PREDICTION') + ' (' + Foxtrick.util.currency.getSymbol(doc) + ')</b></th></tr>' +
				'<tr><td><b>' + Foxtrickl10n.getString('PsicoTSI.FORM_SUBLEVELS') + '</b></td><td><b>' + Foxtrickl10n.getString('PsicoTSI.PREDICTION') +
				'</td>' +
				'<td class="endColumn1"><b>' + Foxtrickl10n.getString('PsicoTSI.SECONDARIES_SUBLEVELS') +
				 '</b></td><td><b>' + Foxtrickl10n.getString('PsicoTSI.PREDICTION') + '</td></tr>' +
				'<tr><td>' + Foxtrickl10n.getString('PsicoTSI.DECIMALS_HIGH') + '</td><td>' + valMaxSkillHigh + '</td>' +
				'<td class="endColumn1">' + Foxtrickl10n.getString('PsicoTSI.DECIMALS_HIGH') + '</td><td' +
				(!isWagePredictionAvailable ? " class=shy" : "") + '>' + valMaxSkillWageHigh +
				'</td></tr>' +
				'<tr><td>' + Foxtrickl10n.getString('PsicoTSI.DECIMALS_AVG') + '</td><td>' + valMaxSkillAvg + '</td>' +
				'<td class="endColumn1">' + Foxtrickl10n.getString('PsicoTSI.DECIMALS_AVG') + '</td><td' +
				(!isWagePredictionAvailable? " class=shy" : "") + '>' + valMaxSkillWageAvg +
				'</td></tr>' +
				'<tr><td>' + Foxtrickl10n.getString('PsicoTSI.DECIMALS_LOW') + '</td><td>' + valMaxSkillLow + '</td>' +
				'<td class="endColumn1">' + Foxtrickl10n.getString('PsicoTSI.DECIMALS_LOW') + '</td><td' +
				(!isWagePredictionAvailable ? " class=shy" : "") + '>' + valMaxSkillWageLow +
				'</td></tr>';
		}

		var title = doc.createElement('h2');
		title.appendChild(doc.createTextNode(this.title));
		var divobj = Foxtrick.createFeaturedElement(doc, this, 'div');
		Foxtrick.addClass(divobj, 'ft-psico-mainBox');

		divobj.appendChild(title);
		divobj.appendChild(table);
		divobj.appendChild(messagesDiv);

		entryPoint.parentNode.insertBefore(divobj, entryPoint.nextSibling);

	},
	drawInPlayersPage: function(doc, id, entryPoint, isUndefinedMainskill, isInjured, isOld,
								maxSkill, valMaxSkillHigh, valMaxSkillAvg, valMaxSkillLow,
								valMaxSkillWageLow, limit) {

		var players_img = function (src, txt, style) {
			this.src = src;
			if (txt)
				this.alt = this.title = txt;
			if (style)
				this.style = style;
		};
		players_img.prototype = {
			alt: '',
			title: '',
			border: '0',
			width: '16',
			height: '16',
			style: 'padding-right: 3px;',
			src: ''
		};
		var logo = new players_img(this.IMAGES.LOGO, this.title,
								   'vertical-align: middle; padding-right: 5px;');

		var al_div = doc.createElement('div');
		var brElement = doc.createElement('br');
		al_div.appendChild(brElement.cloneNode(true));

		var psicotsi_info = doc.createElement('div');
		Foxtrick.addClass(psicotsi_info, 'hidden');
		psicotsi_info.setAttribute('id', 'ft_psico_info_div_' + id);

		var psicotsi_hide_div = doc.createElement('div');
		var imgWrap = doc.createElement('span');
		psicotsi_hide_div.appendChild(imgWrap);
		Foxtrick.addImage(doc, imgWrap, logo);

		var psicotsi_hide_link = doc.createElement('a');
		psicotsi_hide_link.textContent = this.title;
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
		psicotsi_hide_div.appendChild(psicotsi_hide_link);
		psicotsi_info.appendChild(psicotsi_hide_div);

		var mainSkillText = '';
		switch (maxSkill) {
			case 2:
				mainSkillText = Foxtrickl10n.getString('Playmaking');
				break;
			case 3:
				mainSkillText = Foxtrickl10n.getString('Winger');
				break;
			case 4:
				mainSkillText = Foxtrickl10n.getString('Scoring');
				break;
			case 5:
				mainSkillText = Foxtrickl10n.getString('Keeper');
				break;
			case 6:
				mainSkillText = Foxtrickl10n.getString('Passing');
				break;
			case 7:
				mainSkillText = Foxtrickl10n.getString('Defending');
				break;
		}

		var paragraph = doc.createElement('p');
		var pre = mainSkillText + ' [' + Foxtrickl10n.getString('PsicoTSI.FORM') + '=';
		paragraph.textContent = pre + Foxtrickl10n.getString('PsicoTSI.F_HIGH') + ']=' + valMaxSkillHigh;
		psicotsi_info.appendChild(paragraph);

		paragraph = doc.createElement('p');
		paragraph.textContent = pre + Foxtrickl10n.getString('PsicoTSI.F_AVG') + ']=' + valMaxSkillAvg;
		psicotsi_info.appendChild(paragraph);

		paragraph = doc.createElement('p');
		paragraph.textContent = pre + Foxtrickl10n.getString('PsicoTSI.F_LOW') + ']=' + valMaxSkillAvg;
		psicotsi_info.appendChild(paragraph);

		if (valMaxSkillWageLow && valMaxSkillWageLow != 'N/A') {
			paragraph = doc.createElement('p');
			pre = pre.replace(Foxtrickl10n.getString('PsicoTSI.FORM'),
							  Foxtrickl10n.getString('PsicoTSI.WAGE'));
			paragraph.textContent = pre + Foxtrickl10n.getString('PsicoTSI.DECIMALS_LOW') + ']=' +
				valMaxSkillWageLow;
			psicotsi_info.appendChild(paragraph);
		}

		var psicotsi_show_div = doc.createElement('div');
		psicotsi_show_div.setAttribute('id','ft_psico_show_div_' + id);
		var imgWrap = doc.createElement('span');
		psicotsi_show_div.appendChild(imgWrap);
		Foxtrick.addImage(doc, imgWrap, logo);

		var psicotsi_show_link = doc.createElement('a');
		psicotsi_show_link.textContent = mainSkillText + ' [' + Foxtrickl10n.getString('PsicoTSI.FORM') +
			'=' + Foxtrickl10n.getString('PsicoTSI.F_AVG') + ']=' + valMaxSkillAvg;
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
		var spacer = doc.createElement('span');
		spacer.textContent = String.fromCharCode(160);
		psicotsi_show_div.appendChild(spacer);

		var img = new players_img();
		if (limit == 'Low') {
			img = new players_img(this.IMAGES.LOW_SUBLEVELS,
								  Foxtrickl10n.getString('PsicoTSI.L_LOW'));
			Foxtrick.addImage(doc, psicotsi_info, img);
			Foxtrick.addImage(doc, psicotsi_show_div, img);
		}
		else if (limit == 'High') {
			img = new players_img(this.IMAGES.HIGH_SUBLEVELS,
								 Foxtrickl10n.getString('PsicoTSI.L_HIGH'));
			Foxtrick.addImage(doc, psicotsi_info, img);
			Foxtrick.addImage(doc, psicotsi_show_div, img);
		}
		if (isUndefinedMainskill) {
			img = new players_img(this.IMAGES.UNDEF_MAINSKILL,
								  Foxtrickl10n.getString('PsicoTSI.UNDEF_MAINSKILL'));
			Foxtrick.addImage(doc, psicotsi_info, img);
			Foxtrick.addImage(doc, psicotsi_show_div, img);
		}
		if (isInjured) {
			img = new players_img(this.IMAGES.INJURED,
								  Foxtrickl10n.getString('PsicoTSI.INJURED'));
			Foxtrick.addImage(doc, psicotsi_info, img);
			Foxtrick.addImage(doc, psicotsi_show_div, img);
		}
		if (isOld) {
			img = new players_img(this.IMAGES.OLD,
								  Foxtrickl10n.getString('PsicoTSI.OLD'));
			Foxtrick.addImage(doc, psicotsi_info, img);
			Foxtrick.addImage(doc, psicotsi_show_div, img);
		}

		al_div.appendChild(psicotsi_show_div);
		al_div.appendChild(psicotsi_info);
		entryPoint.appendChild(al_div);
	}
};
