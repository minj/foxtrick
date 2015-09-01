'use strict';
/**
 * forum-youth-icons.js
 * Foxtrick forum post youth icons
 * @author spambot
 */

Foxtrick.modules['ForumYouthIcons'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: [
		'forumWritePost', 'messageWritePost', 'guestbook',
		'announcementsWrite', 'forumSettings', 'newsLetter', 'mailNewsLetter', 'ntNewsLetter',
		'forumModWritePost', 'ticket', 'helpContact',
	],
	OPTIONS: [
		'q', 'user_id', 'kit_id', 'article_id', 'line_br', 'clock', 'spoiler',
		'pre', 'table', 'symbols', 'youth_player', 'youth_team', 'youth_match',
		'youth_series', 'debug', 'settings', 'enlarge_input', 'tournament',
		'tournament_match'
	],
	OPTION_EDITS: true,
	OPTION_EDITS_DISABLED_LIST: null,

	CSS: Foxtrick.InternalPath + 'resources/css/forum-youth-icons.css',

	OPTION_FUNC: function() {
		this.OPTION_EDITS_DISABLED_LIST = new Array(this.OPTIONS.length);
		for (var i = 0; i < this.OPTIONS.length; ++i) {
			if (this.OPTIONS[i] !== 'symbols')
				this.OPTION_EDITS_DISABLED_LIST[i] = true;
			else
				this.OPTION_EDITS_DISABLED_LIST[i] = false;
		}
	},

	run: function(doc) {
		var MAIN = Foxtrick.getMainIDPrefix();
		var HMLtxtBody = MAIN + 'ucHattrickMLEditor_txtBody';
		var HMLtxtRemLen = MAIN + 'ucHattrickMLEditor_txtRemLen';
		var PrefsHMLtxtBody = MAIN + 'ucForumPreferences_ucHattrickMLEditor_txtBody';
		var PrefsHMLtxtRemLen = MAIN + 'ucForumPreferences_ucHattrickMLEditor_txtRemLen';
		var EMtxtBody = MAIN + 'ucEditorMain_txtBody';
		var EMtxtRemLen = MAIN + 'ucEditorMain_txtRemLen';
		var AEtxtBody = MAIN + 'ucActionEditor_txtBody';
		var AEtxtRemLen = MAIN + 'ucActionEditor_txtRemLen';
		var txtMsg = MAIN + 'txtMessage';
		var txtCL = MAIN + 'txtCharsLeft';
		var tbNewsBody = MAIN + 'tbNewsBody';
		var fields = [
			// Forum
			{
				page: 'forumWritePost',
				textarea: HMLtxtBody,
				counterfield: HMLtxtRemLen,
				length: 3900,
				add_quote: false,
			},
			// ForumMOD
			{
				page: 'forumModWritePost',
				textarea: HMLtxtBody,
				counterfield: HMLtxtRemLen,
				length: 3900,
				add_quote: false,
			},
			// mail
			{
				page: 'messageWritePost',
				textarea: EMtxtBody,
				counterfield: EMtxtRemLen,
				length: 1000,
				add_quote: false,
			},
			// newsletter
			{
				page: 'newsLetter',
				textarea: txtMsg,
				counterfield: txtCL,
				length: 1000,
				add_quote: false,
			},
			// newsletter
			{
				page: 'mailNewsLetter',
				textarea: tbNewsBody,
				counterfield: txtCL,
				length: 1000,
				add_quote: false,
			},
			// newsletter
			{
				page: 'ntNewsLetter',
				textarea: txtMsg,
				counterfield: txtCL,
				length: 1000,
				add_quote: false,
			},
			// GB
			{
				page: 'guestbook',
				textarea: HMLtxtBody,
				counterfield: HMLtxtRemLen,
				length: 300,
				add_quote: false,
			},
			// PA
			{
				page: 'announcementsWrite',
				textarea: HMLtxtBody,
				counterfield: HMLtxtRemLen,
				length: 1000,
				add_quote: true,
			},
			// ticket
			{
				page: 'ticket',
				textarea: AEtxtBody,
				counterfield: AEtxtRemLen,
				length: 2950,
				add_quote: false,
			},
			// contact
			{
				page: 'helpContact',
				textarea: HMLtxtBody,
				counterfield: HMLtxtRemLen,
				length: 2950,
				add_quote: false,
			},
			// signatur
			{
				page: 'forumSettings',
				textarea: PrefsHMLtxtBody,
				counterfield: PrefsHMLtxtRemLen,
				length: 500,
				add_quote: false,
			},
		];
		var icons = [
			{
				type: 'q',
				icon_class: 'ft_q',
				image: 'format_q.png',
				string: 'q',
				tags: '[q]qqq[/q]',
				replace_text: 'qqq',
				alt: 'f_quote2',
			},
			{
				type: 'line_br',
				icon_class: 'ft_br',
				image: 'format_br.png',
				string: 'br',
				tags: '[br]',
			},
			{
				type: 'user_id',
				icon_class: 'ft_uid',
				image: 'format_user.png',
				string: 'user',
				tags: '[userid=xxx]',
				replace_text: 'xxx',
			},
			{
				type: 'kit_id',
				icon_class: 'ft_kit',
				image: 'format_kit.png',
				string: 'kit',
				tags: '[kitid=xxx]',
				replace_text: 'xxx',
			},
			{
				type: 'article_id',
				icon_class: 'ft_aid',
				image: 'format_article.png',
				string: 'article',
				tags: '[articleid=xxx]',
				replace_text: 'xxx',
			},
			{
				type: 'clock',
				icon_class: 'ft_clock',
				image: 'format_clock.png',
				string: 'clock',
				tags: 'time',
			},
			{
				type: 'spoiler',
				icon_class: 'ft_spoiler',
				image: 'format_spoiler.png',
				string: 'spoiler',
				tags: '[spoiler]yyy[/spoiler]',
				replace_text: 'yyy',
			},
			{
				type: 'pre',
				icon_class: 'ft_pre',
				image: 'format_pre.png',
				string: 'pre',
				tags: '[pre]zzz[/pre]',
				replace_text: 'zzz',
			},
			{
				type: 'table',
				icon_class: 'ft_table',
				image: 'format_table.png',
				string: 'table',
				tags: '[table][tr][td]ttt[/td][/tr][/table]',
				replace_text: 'ttt',
				versions: [
					' ',
					Foxtrick.L10n.getString('ForumSpecialBBCode.tableSeparator.tab'),
					Foxtrick.L10n.getString('ForumSpecialBBCode.tableSeparator.custom'),
				],
				versions_string: 'tableSeparator',
			},
			{
				type: 'symbols',
				icon_class: 'ft_symbol',
				image: 'format_symbol.png',
				string: 'symbols',
				tags: 'symbol',
				versions: [],
				versions_string: 'forumSymbol',
			},
		];
		// insert SymbolArray, backslash to escape,
		var symbolsText = Foxtrick.Prefs.getString('module.ForumYouthIcons.symbols_text');
		// sim lookbehind: stupid JS why u no support it?!
		var split = symbolsText.split('').reverse().join('').split(/;(?!\\)/).reverse();
		for (var i = 0; i < split.length; ++i) {
			var fixed = split[i].split('').reverse().join('').replace(/\\;/g, ';');
			icons[9].versions.push(fixed);
		}

		var youthicons = [
			{
				type: 'youth_player',
				icon_class: 'f_player',
				string: 'youthplayerid',
				tags: '[youthplayerid=xxx]',
				replace_text: 'xxx',
			},
			{
				type: 'youth_team',
				icon_class: 'f_team',
				string: 'youthteamid',
				tags: '[youthteamid=xxx]',
				replace_text: 'xxx',
			},
			{
				type: 'youth_match',
				icon_class: 'f_match',
				string: 'youthmatchid',
				tags: '[youthmatchid=xxx]',
				replace_text: 'xxx',
			},
			{
				type: 'youth_series',
				icon_class: 'f_series',
				string: 'youthseries',
				tags: '[youthleagueid=xxx]',
				replace_text: 'xxx',
			},
		];

		var tournamenticons = [
			{
				type: 'tournament',
				icon_class: 'ft_tournament',
				string: 'tournamentid',
				tags: '[tournamentid=xxx]',
				replace_text: 'xxx',
			},
			{
				type: 'tournament_match',
				icon_class: 'f_match',
				string: 'tournamentmatchid',
				tags: '[tournamentmatchid=xxx]',
				replace_text: 'xxx',
			},
		];

		var othericons = [
			{
				type: 'debug',
				icon_class: 'f_debug',
				image: 'format_debug.png',
				string: 'debug',
				tags: 'debug',
			},
			{
				type: 'settings',
				icon_class: 'f_settings',
				image: 'format_settings.png',
				string: 'settings',
				tags: 'settings',
			},
		];
		var mainicons = [
			{
				icon_class: 'f_quote2',
				string: '[q]qqq[/q]',
				tags: '[q]qqq[/q]',
				replace_text: 'qqq',
				alt: 'f_quote2',
			},
			{
				icon_class: 'f_bold',
				string: '[b]qqq[/b]',
				tags: '[b]qqq[/b]',
				replace_text: 'qqq',
				alt: 'f_bold',
			},
			{
				icon_class: 'f_italic',
				string: '[i]qqq[/i]',
				tags: '[i]qqq[/i]',
				replace_text: 'qqq',
				alt: 'f_italic',
			},
			{
				icon_class: 'f_ul',
				string: '[u]qqq[/u]',
				tags: '[u]qqq[/u]',
				replace_text: 'qqq',
				alt: 'f_ul',
			},
			{
				icon_class: 'f_hr',
				string: 'hr',
				tags: '[hr]',
				alt: 'f_hr',
			},
			{
				icon_class: 'f_player',
				string: '[playerID=xxx]',
				tags: '[playerID=xxx]',
				replace_text: 'xxx',
				alt: 'f_player',
			},
			{
				icon_class: 'f_team',
				string: '[teamID=xxx]',
				tags: '[teamID=xxx]',
				replace_text: 'xxx',
				alt: 'f_team',
			},
			{
				icon_class: 'f_match',
				string: '[matchID=xxx]',
				tags: '[matchID=xxx]',
				replace_text: 'xxx',
				alt: 'f_match',
			},
			{
				icon_class: 'f_fed',
				string: '[federationID=xxx]',
				tags: '[federationID=xxx]',
				replace_text: 'xxx',
				alt: 'f_fed',
			},
			{
				icon_class: 'f_message',
				string: '[post==xxx.yy]',
				tags: '[post=xxx.yy]',
				replace_text: 'xxx.yy',
				alt: 'f_message'
			},
			{
				icon_class: 'f_series',
				string: '[leagueID=xxx]',
				tags: '[leagueID=xxx]',
				replace_text: 'xxx',
				alt: 'f_series',
			},
			{
				icon_class: 'f_www',
				string: '[link=xxx]',
				tags: '[link=xxx]',
				replace_text: 'xxx',
				alt: 'f_www',
			}
		];


		var addClick = function(ev) {
			try {
				var queryPrompt = Foxtrick.L10n.getString('ForumSpecialBBCode.enterSeparator');
				var custom = Foxtrick.L10n.getString('ForumSpecialBBCode.tableSeparator.custom');
				var version = ev.target.getAttribute('version');
				var versionStr = ev.target.getAttribute('version_string');
				if (version) {
					Foxtrick.log(versionStr, ' ', version);
					if (version == custom) {
						version = prompt(queryPrompt);
						Foxtrick.log('custom_separator: ', version);
						if (version === null || version === '')
							return;
					}
					Foxtrick.Prefs.setString(versionStr, version);
					var parent_id = ev.target.getAttribute('parent_id');
					var parent = doc.getElementById(parent_id);
					parent.setAttribute('version', version);
					parent.title = parent.getAttribute('title_raw').replace(/%s/, version);
				}
				Foxtrick.any(function(f) {
					if (Foxtrick.isPage(doc, f.page)) {
						var tags = ev.target.getAttribute('tags');
						var text = ev.target.getAttribute('replace_Text');
						clickHandler(f.textarea, tags, text, f.counterfield, f.length);
						return true;
					}
					return false;
				}, fields);
			}
			catch (e) {
				Foxtrick.log('addClick error: ', e, 'target: ', ev.target);
			}
		};

		// var show_main = Foxtrick.any(function(option) {
		// 	return Foxtrick.Prefs.isModuleOptionEnabled('ForumYouthIcons', option);
		// }, ['user_id', 'kit_id', 'article_id', 'line_br', 'clock', 'spoiler']);
		var show_youth = Foxtrick.any(function(option) {
			return Foxtrick.Prefs.isModuleOptionEnabled('ForumYouthIcons', option);
		}, ['youth_player', 'youth_team', 'youth_match', 'youth_series']);
		var show_tournament = Foxtrick.any(function(option) {
			return Foxtrick.Prefs.isModuleOptionEnabled('ForumYouthIcons', option);
		}, ['tournament', 'tournament_match']);
		var show_other = Foxtrick.any(function(option) {
			return Foxtrick.Prefs.isModuleOptionEnabled('ForumYouthIcons', option);
		}, ['debug', 'settings']);
		var enlarge = Foxtrick.Prefs.isModuleOptionEnabled('ForumYouthIcons', 'enlarge_input');

		var LABEL_ID = 'ft_youth_icons';
		if (doc.getElementById(LABEL_ID))
			return;
		var textarea = doc.getElementsByTagName('textarea')[0];
		if (!textarea)
			return;

		var anchor, textbox, newimage;
		if (Foxtrick.isPage(doc, 'newsLetter') ||
		    Foxtrick.isPage(doc, 'mailNewsLetter') ||
		    Foxtrick.isPage(doc, 'ntNewsLetter')) {

			if (Foxtrick.isPage(doc, 'newsLetter') || Foxtrick.isPage(doc, 'ntNewsLetter'))
				textbox = txtMsg;
			if (Foxtrick.isPage(doc, 'mailNewsLetter'))
				textbox = MAIN + 'tbNewsBody';

			anchor = doc.getElementById(textbox);

			if (Foxtrick.isPage(doc, 'newsLetter') || Foxtrick.isPage(doc, 'ntNewsLetter')) {
				if (enlarge) {
					anchor.setAttribute('rows', '20');
					anchor.setAttribute('cols', '50');
				}
			}
			if (Foxtrick.isPage(doc, 'mailNewsLetter')) {
				var counter = doc.getElementsByName('remlennews')[0];
				counter.id = txtCL;
				anchor.setAttribute('rows', '20');
				anchor.setAttribute('cols', '50');
			}

			var cont = doc.createElement('div');
			cont.setAttribute('class', 'HTMLToolbar');
			for (var i = 0; i < mainicons.length; i++) {
				newimage = doc.createElement('img');
				newimage.src = '/Img/Icons/transparent.gif';
				Foxtrick.onClick(newimage, addClick);
				newimage.setAttribute('tags', mainicons[i].tags);
				if (mainicons[i].replace_text)
					newimage.setAttribute('replace_text', mainicons[i].replace_text);
				newimage.setAttribute('class', mainicons[i].icon_class);
				newimage.title = mainicons[i].string;
				newimage = Foxtrick.makeFeaturedElement(newimage, this);
				cont.appendChild(newimage);
			}

			anchor.parentNode.insertBefore(cont, anchor);
		}

		if (Foxtrick.isPage(doc, 'forumWritePost') && enlarge) {
			//anchor = doc.getElementById(HMLtxtBody);
			anchor = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
			anchor.style.height = '300px';
		}

		if (Foxtrick.isPage(doc, 'forumModWritePost') && enlarge) {
			//anchor = doc.getElementById(HMLtxtBody);
			anchor = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
			anchor.style.height = '300px';
		}

		if (Foxtrick.isPage(doc, 'announcementsWrite') && enlarge) {
			anchor = doc.getElementById(HMLtxtBody);
			if (anchor)
				anchor.style.height = '300px';
		}
		var toolbars = doc.getElementsByClassName('HTMLToolbar');
		if (!toolbars[0])
			return;

		// polls have two toolbars. we want the later for now
		var toolbar = toolbars.length === 1 ? toolbars[0] : toolbars[1];
		toolbar.setAttribute('style', 'float:left; margin-right:3px;');

		if (Foxtrick.isPage(doc, 'guestbook'))
			try {
				textbox = doc.getElementById(HMLtxtBody);
				textbox.setAttribute('style', 'height:100px; width: 98%;');
			}
			catch (e) {
				Foxtrick.log('YouthIcons: textbox not found', e);
			}

		// Set styles of all buttons
		var nextElement = toolbar.firstChild;
		while (nextElement) {
			try {
				if (nextElement.id == MAIN + 'ucHattrickMLEditor_pnlTags' ||
					 nextElement.id == MAIN + 'ucActionEditor_pnlTags' ||
					 nextElement.id == MAIN + 'ucEditorMain_pnlTags' ||
					 new RegExp(MAIN + 'uc').test(nextElement.id) ||
					 nextElement.href) {
						Foxtrick.addClass(nextElement, 'hidden');
				}
				nextElement = nextElement.nextSibling;
			}
			catch (e) {
				nextElement = nextElement.nextSibling;
			}
		}


		// simple test if new icons are set up by HTs
		var target = toolbar.lastChild;
		var tooldivs = toolbar.getElementsByTagName('img');
		for (var i = 0; i < tooldivs.length; i++) {
			if (tooldivs[i].className == 'f_ul') {
				target = tooldivs[i];
				break;
			}
		}
		target = target.nextSibling;

		var clickHandler =
		  function(textareaId, openingTag, replaceText, fieldCounterId, maxLength) {
		  	var tab = Foxtrick.L10n.getString('ForumSpecialBBCode.tableSeparator.tab');
		  	var separator = Foxtrick.Prefs.getString('tableSeparator');

			var ta = doc.getElementById(textareaId);
			var fieldCounter = doc.getElementById(fieldCounterId);
			if (ta) {
				// link tags
				if (replaceText) {
					var s = Foxtrick.getSelection(ta);
					var newText = (s.selectionLength > 0) ?
						openingTag.replace(replaceText, s.selectedText) : openingTag;

					Foxtrick.log('selectedText: ', s.selectedText);
					Foxtrick.log('newText: ', newText);

					if (replaceText == 'ttt') {
						// table

						Foxtrick.log('separator', separator);

						if (separator == tab)
							separator = '\t';

						separator = Foxtrick.strToRe(separator);

						if (separator == ' ')
							separator = ' +';

						// make the table
						var myReg = new RegExp(separator, 'g');
						newText = newText.replace(myReg, '[/td][td]');
						newText = newText.replace(/\n/g, '[/td][/tr][tr][td]');

						// add some colspan for too short rows
						var rows = newText.split('[/tr]').slice(0, -1);
						var cellCts = Foxtrick.map(function(row) {
							return row.split('[/td]').length - 1;
						}, rows);
						var max_cells = Math.max.apply(null, cellCts);

						rows = Foxtrick.map(function(row, i) {
							var colCt = cellCts[i];
							var missing_col = max_cells - colCt;
							if (missing_col !== 0) {
								var last_td = rows[i].lastIndexOf('[td');
								row = row.slice(0, last_td + 3) +
									' colspan=' + (missing_col + 1) +
									row.slice(last_td + 3);
							}
							return row;
						}, rows);

						// always add header for first row
						rows[0] = rows[0].replace(/\[\/?b\]/g, '').replace(/td\]/g, 'th]');

						newText = rows.join('[/tr]');
						newText += '[/tr][/table]';

						if (s.selectionLength === 0)
							newText = '[table][tr][td]cell1[/td][td]cell2[/td][/tr]' +
								'[tr][td]cell3[/td][td]cell4[/td][/tr][/table]';

						// some formating
						newText = newText.replace(/table\]/g, 'table]\n').
							replace(/\/tr\]/g, '/tr]\n').
							replace(/\[td/g, '[td').
							replace(/\[\/td\]/g, '[/td]').
							replace(/\[th/g, '[th').
							replace(/\[\/th\]/g, '[/th]');
					}

					if (ta.selectionStart || ta.selectionStart == '0') {
						// Mozilla
						var st = ta.scrollTop;
						ta.value = s.textBeforeSelection + newText + s.textAfterSelection;
						ta.scrollTop = st;

						if ((openingTag.indexOf(' ') > 0) &&
						    (openingTag.indexOf(' ') < openingTag.length - 1)) {
							ta.selectionStart = s.selectionStart + openingTag.indexOf('=') + 1;
							ta.selectionEnd = ta.selectionStart + openingTag.indexOf(' ') -
								openingTag.indexOf('=') - 1;
						}

						// MessageID
						else {
							if (s.selectionLength === 0) {
								ta.selectionStart = s.selectionStart + openingTag.indexOf('=') + 1;
								ta.selectionEnd = ta.selectionStart + openingTag.indexOf(']') -
									openingTag.indexOf('=') - 1;
							}
							else {
								ta.selectionStart = s.selectionStart + newText.length;
								ta.selectionEnd = ta.selectionStart;
							}
							if (replaceText == 'yyy' && s.selectionLength === 0) {
								ta.selectionStart = s.selectionStart + 9;
								ta.selectionEnd = ta.selectionStart + 3;
							}
							if (replaceText == 'zzz' && s.selectionLength === 0) {
								ta.selectionStart = s.selectionStart + 5;
								ta.selectionEnd = ta.selectionStart + 3;
							}
							if (replaceText == 'qqq' && s.selectionLength === 0) {
								ta.selectionStart = s.selectionStart + 3;
								ta.selectionEnd = ta.selectionStart + 3;
							}
							if (replaceText == 'ttt' && s.selectionLength === 0) {
								ta.selectionStart = s.selectionStart + 17;
								ta.selectionEnd = ta.selectionStart + 5;
							}
						}

					}
					else {
						// Others
						ta.value += newText;
					}
				}
				// tags that just add and don't replace
				else {
					// HR
					var s = Foxtrick.getSelection(ta);

					var insertText = function(text) {
						// Mozilla
						if (ta.selectionStart || ta.selectionStart == '0') {
							var st = ta.scrollTop;
							ta.value = s.textBeforeSelection + s.selectedText + text +
								s.textAfterSelection;
							ta.scrollTop = st;

							ta.selectionStart = s.selectionEnd + text.length;
							ta.selectionEnd = ta.selectionStart;
						}

						// IE
						else if (document.selection) {
							var IESel = document.selection.createRange();
							IESel.text = s.selectedText + text;
							IESel.select();
						}

						// Others
						else {
							ta.value += text;
						}
					};

					if (openingTag == 'time') {
						// time
						openingTag = doc.getElementById('time').textContent;
					}
					else if (openingTag == 'symbol') {
						// symbols
						openingTag = Foxtrick.Prefs.getString('forumSymbol');
					}
					else if (openingTag == 'debug') {
						var ensureLength = function(str) {
							var MAX_LENGTH = 3500;
							if (str.length > MAX_LENGTH)
								str = str.substr(str.length - MAX_LENGTH);
							return str;
						};
						if (Foxtrick.arch === 'Sandboxed' || Foxtrick.platform == 'Android') {
							Foxtrick.SB.ext.sendRequest({ req: 'getDebugLog' },
							  function(n) {
							  	var header = Foxtrick.log.header(doc);
							  	var log = ensureLength(n.log);
							  	var text = header + '\n' + log;
								insertText(text);
								textCounter(ta, fieldCounter, maxLength);
							});
							return;
						}
						else {
							openingTag = Foxtrick.log.header(doc) + '\n' +
								ensureLength(Foxtrick.debugLogStorage);
						}
					}
					else if (openingTag == 'settings') {
						var opts = {
							format: '%key:%value',
							skipFiles: true,
						};
						var userPrefsText = Foxtrick.Prefs.save(opts);
						var userPrefsTextArray = userPrefsText.split('\n');
						openingTag = '';
						for (var i = 0; i < userPrefsTextArray.length; ++i)
							openingTag += userPrefsTextArray[i].substr(0, 240) + '\n';
					}

					insertText(openingTag);
				}
			}
			textCounter(ta, fieldCounter, maxLength);
		};
		var textCounter = function(field, countfield, maxlimit) {
			var text = field.value.replace(/[\r]/g, '').length;
			var text2 = field.value.replace(/[\r\n]/g, '').length; // Count without \n\r
			var diff = text - text2;
			countfield.value = maxlimit - (text2 + diff * 2);
		};

		// add quote tag
		if (Foxtrick.Prefs.isModuleOptionEnabled('ForumYouthIcons', icons[0].type)) {
			for (var j = 0; j < fields.length; j++) {
				var page = fields[j].page;
				if (Foxtrick.isPage(doc, page) && fields[j].add_quote === true) {
					newimage = doc.createElement('img');
					newimage.src = '/Img/Icons/transparent.gif';
					Foxtrick.onClick(newimage, addClick);
					newimage.setAttribute('tags', icons[0].tags);
					if (icons[0].replace_text)
						newimage.setAttribute('replace_text', icons[0].replace_text);
					newimage.setAttribute('class', icons[0].icon_class);
					newimage.title =
						Foxtrick.L10n.getString('ForumSpecialBBCode.' + icons[0].string);
					newimage = Foxtrick.makeFeaturedElement(newimage, this);
					toolbar.insertBefore(newimage, toolbar.getElementsByTagName('img')[0]);
				}
			}
		}
		for (var i = 1; i < icons.length; i++) {
			if (Foxtrick.Prefs.isModuleOptionEnabled('ForumYouthIcons', icons[i].type)) {
				if (!icons[i].alt || !doc.getElementsByClassName(icons[i].alt).length) {
					newimage = doc.createElement('img');
					newimage.src = '/Img/Icons/transparent.gif';
					Foxtrick.onClick(newimage, addClick);
					newimage.setAttribute('tags', icons[i].tags);
					if (icons[i].replace_text)
						newimage.setAttribute('replace_text', icons[i].replace_text);
					newimage.setAttribute('class', icons[i].icon_class);
					newimage.title =
						Foxtrick.L10n.getString('ForumSpecialBBCode.' + icons[i].string);
					newimage = Foxtrick.makeFeaturedElement(newimage, this);

					if (icons[i].versions) {
						var span = doc.createElement('div');
						span.className = 'ft-pop-up-container icon';
						span.appendChild(newimage);

						var list = doc.createElement('ul');
						list.className = 'ft-pop';
						list.setAttribute('style', 'margin-top:-5px;');
						for (var j = 0; j < icons[i].versions.length; ++j) {
							var item = doc.createElement('li');
							var link = doc.createElement('span');
							Foxtrick.onClick(link, addClick);
							link.setAttribute('tags', icons[i].tags);
							if (icons[i].replace_text)
								link.setAttribute('replace_text', icons[i].replace_text);
							link.setAttribute('version', icons[i].versions[j]);
							var vrsStr = Foxtrick.L10n.getString('ForumSpecialBBCode.' +
							                                     icons[i].versions_string);
							link.textContent = vrsStr.replace(/%s/, icons[i].versions[j]);
							link.setAttribute('parent_id', icons[i].icon_class + '_id');
							link.setAttribute('version_string', icons[i].versions_string);
							item.appendChild(link);
							list.appendChild(item);
						}
						newimage.setAttribute('title_raw', newimage.title);
						var vrsStrPref = Foxtrick.Prefs.getString(icons[i].versions_string);
						newimage.title = newimage.title.replace(/%s/, vrsStrPref);
						newimage.id = icons[i].icon_class + '_id';
						newimage.setAttribute('parent_id', icons[i].icon_class + '_id');
						newimage.setAttribute('version', vrsStrPref);
						newimage.setAttribute('version_string', icons[i].versions_string);

						span.appendChild(list);
						toolbar.insertBefore(span, target);
					}
					else
						toolbar.insertBefore(newimage, target);
				}
			}
		}

		var toolbar_label = Foxtrick.createFeaturedElement(doc, this, 'div');
		toolbar_label.textContent = Foxtrick.L10n.getString('ForumYouthIcons.toolbar.main');
		toolbar.insertBefore(toolbar_label, toolbar.firstChild);

		// Set styles of next siblings
		nextElement = toolbar.nextSibling;
		while (nextElement) {
			try {
				if (!/^ctl00_/.test(nextElement.id)) {
					nextElement.setAttribute('style', 'clear:both;');
				}
				nextElement = nextElement.nextSibling;
			}
			catch (e) {
				nextElement = nextElement.nextSibling;
			}
		}

		// if (show_other || true) {
		var otherbar = Foxtrick.createFeaturedElement(doc, this, 'div');
		otherbar.setAttribute('class', 'HTMLToolbar');
		otherbar.setAttribute('style', 'float:right;');

		var otherbar_label = doc.createElement('div');
		otherbar_label.id = 'ft_other_icons';
		otherbar_label.textContent = Foxtrick.L10n.getString('ForumYouthIcons.toolbar.other');
		if (!show_other)
			otherbar_label.className = 'hidden';
		otherbar.appendChild(otherbar_label);

		for (var i = 0; i < othericons.length; i++) {
			if (Foxtrick.Prefs.isModuleOptionEnabled('ForumYouthIcons', othericons[i].type)) {
				newimage = doc.createElement('img');
				newimage.src = '/Img/Icons/transparent.gif';
				Foxtrick.onClick(newimage, addClick);
				newimage.setAttribute('tags', othericons[i].tags);
				if (othericons[i].replace_text)
					newimage.setAttribute('replace_text', othericons[i].replace_text);
				newimage.setAttribute('class', othericons[i].icon_class);
				newimage.title =
					Foxtrick.L10n.getString('ForumYouthIcons.' + othericons[i].string);
				newimage = Foxtrick.makeFeaturedElement(newimage, this);
				otherbar.appendChild(newimage);
			}
		}

		var head = toolbar.parentNode;
		head.insertBefore(otherbar, toolbar.nextSibling);
		// }

		// if (show_youth || true) {
		var youthbar = Foxtrick.createFeaturedElement(doc, this, 'div');
		youthbar.setAttribute('class', 'HTMLToolbar');
		youthbar.setAttribute('style', 'float:left;');

		var youthbar_label = doc.createElement('div');
		youthbar_label.id = LABEL_ID;
		youthbar_label.textContent = Foxtrick.L10n.getString('ForumYouthIcons.toolbar.youth');
		if (!show_youth)
			youthbar_label.className = 'hidden';
		youthbar.appendChild(youthbar_label);

		for (var i = 0; i < youthicons.length; i++) {
			if (Foxtrick.Prefs.isModuleOptionEnabled('ForumYouthIcons', youthicons[i].type)) {
				newimage = doc.createElement('img');
				newimage.src = '/Img/Icons/transparent.gif';
				Foxtrick.onClick(newimage, addClick);
				newimage.setAttribute('tags', youthicons[i].tags);
				if (youthicons[i].replace_text)
					newimage.setAttribute('replace_text', youthicons[i].replace_text);
				newimage.setAttribute('class', youthicons[i].icon_class);
				newimage.title =
					Foxtrick.L10n.getString('ForumYouthIcons.' + youthicons[i].string);
				newimage = Foxtrick.makeFeaturedElement(newimage, this);
				youthbar.appendChild(newimage);
			}
		}

		head = toolbar.parentNode;
		head.insertBefore(youthbar, toolbar.nextSibling);
		// }

		// if (show_tournament || true) {
		var tournamentbar = Foxtrick.createFeaturedElement(doc, this, 'div');
		tournamentbar.setAttribute('class', 'HTMLToolbar');
		tournamentbar.setAttribute('style', 'float:left;');

		var tournamentbar_label = doc.createElement('div');
		tournamentbar_label.id = 'ft_tournament_icons';
		tournamentbar_label.textContent =
			Foxtrick.L10n.getString('ForumYouthIcons.toolbar.tournament');
		if (!show_tournament)
			tournamentbar_label.className = 'hidden';
		tournamentbar.appendChild(tournamentbar_label);

		for (var i = 0; i < tournamenticons.length; i++) {
			if (Foxtrick.Prefs.isModuleOptionEnabled('ForumYouthIcons', tournamenticons[i].type)) {
				newimage = doc.createElement('img');
				newimage.src = '/Img/Icons/transparent.gif';
				Foxtrick.onClick(newimage, addClick);
				newimage.setAttribute('tags', tournamenticons[i].tags);
				if (tournamenticons[i].replace_text)
					newimage.setAttribute('replace_text', tournamenticons[i].replace_text);
				newimage.setAttribute('class', tournamenticons[i].icon_class);
				newimage.title =
					Foxtrick.L10n.getString('ForumYouthIcons.' + tournamenticons[i].string);
				newimage = Foxtrick.makeFeaturedElement(newimage, this);
				tournamentbar.appendChild(newimage);
			}
		}

		head = toolbar.parentNode;
		head.insertBefore(tournamentbar, toolbar.nextSibling);
		// }
	},

	change: function(doc) {
		this.run(doc);
	}
};
