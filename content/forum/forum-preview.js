/**
 * forum-preview.js
 * area for forum post preview
 * @author spambot
 */

'use strict';

Foxtrick.modules.ForumPreview = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: [
		'forumWritePost', 'messageWritePost', 'guestbook', 'announcementsWrite',
		'newsLetter', 'mailNewsLetter', 'ntNewsLetter', 'helpContact',
		'forumSettings', 'forumModWritePost', 'ticket',
	],
	NICE: 1, // after ForumYouthIcons
	CSS: Foxtrick.InternalPath + 'resources/css/forum-preview.css',

	/* eslint-disable complexity */

	/** @param {document} doc */
	run: function(doc) {
		const module = this;

		/** @param {HTMLElement} previewDiv */
		var preview = function(previewDiv) {
			/** @type {[RegExp, string][]} */
			var singleReplace = [
				[/\[kitid=(\d+)\]/gi,
					"<a href='/Community/KitSearch/?KitID=$1' target='_blank'>($1)</a>"],
				[/\[userid=(\d+)\]/gi,
					"<a href='/Club/Manager/?userId=$1' target='_blank'>($1)</a>"],
				[/\[playerid=(\d+)\]/gi,
					"<a href='/Club/Players/Player.aspx?playerId=$1' target='_blank'>($1)</a>"],
				[/\[youthplayerid=(\d+)\]/gi,
					"<a href='/Club/Players/YouthPlayer.aspx?YouthPlayerID=$1' " +
						"target='_blank'>($1)</a>"],
				[/\[teamid=(\d+)\]/gi,
					"<a href='/Club/?TeamID=$1' target='_blank'>($1)</a>"],
				[/\[ntteamid=(\d+)\]/gi,
					"<a href='/Club/NationalTeam/NationalTeam.aspx?TeamID=$1' " +
						"target='_blank'>($1)</a>"],
				[/\[youthteamid=(\d+)\]/gi,
					"<a href='/Club/Youth/?YouthTeamID=$1' target='_blank'>($1)</a>"],
				[/\[matchid=(\d+)\]/gi,
					"<a href='/Club/Matches/Match.aspx?matchID=$1' target='_blank'>($1)</a>"],
				[/\[youthmatchid=(\d+)\]/gi,
					"<a href='/Club/Matches/Match.aspx?matchID=$1&SourceSystem=Youth' " +
						"target='_blank'>($1)</a>"],
				[/\[tournamentmatchid=(\d+)\]/gi,
					"<a href='/Club/Matches/Match.aspx?matchID=$1&SourceSystem=HTOIntegrated' " +
						"target='_blank'>($1)</a>"],
				[/\[federationid=(\d+)\]/gi,
					"<a href='/Community/Federations/Federation.aspx?AllianceID=$1' " +
						"target='_blank'>($1)</a>"],
				[/\[message=(\d+)\.(\d+)\]/gi,
					"<a href='/Forum/Read.aspx?t=$1&n=$2' target='_blank'>($1.$2)</a>"],
				[/\[post=(\d+)\.(\d+)\]/gi,
					"<a href='/Forum/Read.aspx?t=$1&n=$2' target='_blank'>($1.$2)</a>"],
				[/\[leagueid=(\d+)\]/gi,
					"<a href='/World/Series/?LeagueLevelUnitID=$1' " +
						"target='_blank'>($1)</a>"],
				[/\[youthleagueid=(\d+)\]/gi,
					"<a href='/World/Series/YouthSeries.aspx?YouthLeagueId=$1' " +
						"target='_blank'>($1)</a>"],
				[/\[tournamentid=(\d+)\]/gi,
					"<a href='/Community/Tournaments/Tournament.aspx?tournamentId=$1' " +
						"target='_blank'>($1)</a>"],
				[/\[link=(.*?)\]/gi,
					"<a href='$1' target='_blank' rel='noopener'>($1)</a>"],
				[/\[articleid=(.*?)\]/gi,
					"<a href='/Community/Press?ArticleID=$1' target='_blank'>($1)</a>"],
				[/\[br\]/gi, '<br>'],
				[/\[hr\]/gi, '<hr>'],
			];

			let quote = Foxtrick.L10n.getString('quote.author.wrote');

			/** @type {[RegExp, string][]} */
			var nestedReplace = [
				[/\[b\](.*?)\[\/b\]/gi, '<b>$1</b>'],
				[/\[u\](.*?)\[\/u\]/gi, '<u>$1</u>'],
				[/\[i\](.*?)\[\/i\]/gi, '<i>$1</i>'],
				[/\[q\](.*?)\[\/q\]/gi, "<blockquote class='quote'>$1</blockquote>"],
				[/\[quote=(.*?)\](.*?)\[\/quote\]/gi,
					`<blockquote class='quote'><div class='quoteto'>$1&nbsp;${quote}</div>` +
						'$2</blockquote>'],
				[/\[q=(.*?)\](.*?)\[\/q\]/gi,
					`<blockquote class='quote'><div class='quoteto'>$1&nbsp;${quote}</div>` +
						'$2</blockquote>'],
				[/\[q=(.*?)\](.*?)\[\/q\]/gi,
					`<blockquote class='quote'><div class='quoteto'>$1&nbsp;${quote}</div>` +
						'$2</blockquote>'],
				[/\[spoiler\](.*?)\[\/spoiler\]/gi,
					"<blockquote class='spoiler hidden' style='display:block!important'>" +
						'$1</blockquote>'],
				[/\[pre\](.*?)\[\/pre\]/gi,
					'<pre>$1</pre>'],
				[/\[table\](.*?)\[\/table\]/gi,
					"<table class='htMlTable'><tbody>$1</tbody></table>"],
				[/\[tr(.*?)\](.*?)\[\/tr\]/gi,
					'<tr $1>$2</tr>'],
				[/\[th([^\]]*?)align=(\w*)([^\]]*)\](.*?)\[\/th\]/gi,
					"<th $1 class='$2' $3>$4</th>"],
				[/\[td([^\]]*?)align=(\w*)([^\]]*)\](.*?)\[\/td\]/gi,
					"<td $1 class='$2' $3>$4</td>"],
				[/\[th(.*?)\](.*?)\[\/th\]/gi, '<th $1>$2</th>'],
				[/\[td(.*?)\](.*?)\[\/td\]/gi, '<td $1>$2</td>'],
				[/<br \/>\s*<\/td>/gi, '<br/></td>'],
				[/<br \/>\s*<\/th>/gi, '<br/></th>'],
				[/<\/td>\s*<br \/>/gi, '</td>'],
				[/<\/th>\s*<br \/>/gi, '</th>'],
				[/<\/tr>\s*<br \/>/gi, '</tr>'],
				[/<tr([^>]*?)>\s*<br \/>/gi, '<tr$1>'],
				[/<tbody>\s*<br \/>/gi, '<tbody>'],
				[/<\/td>\s*<br \/>/gi, '</td>'],
				[/<\/th>\s*<br \/>/gi, '</th>'],
				[/<\/tr>\s*<br \/>/gi, '</tr>'],
				[/<tr([^>]*?)>\s*<br \/>/gi, '<tr$1>'],
				[/<tbody>\s*<br \/>/gi, '<tbody>'],
			];

			/** @type {HTMLTextAreaElement} */
			var msgWindow = doc.querySelector('#mainBody textarea');

			try {
				var text = msgWindow.value;

				// escape HTML for preview
				text = text.replace(/&/g, '&amp;');
				text = text.replace(/</g, '&lt;');

				// format within pre
				text = Foxtrick.escapePre(text);

				text = text.replace(/\n/g, '<br />');
				text = text.replace(/\r/g, '');

				let nested = ['[q', '[b', '[i', '[u', '[spoil', '[table', '[pre'];

				let counts = /** @type {number[]} */ (
					nested.map(n => Foxtrick.substr_count(text, n))
				);
				let count = Math.max(0, ...counts);

				for (let [needle, replacement] of singleReplace)
					text = text.replace(needle, replacement);

				for (let j = 0; j <= count + 1; j++) {
					for (let [needle, replacement] of nestedReplace)
						text = text.replace(needle, replacement);
				}

				// remove HT-ML escaping but leave HTML
				text = Foxtrick.unescapePre(text);

				let previewMessage = doc.createElement('div');
				previewMessage.id = 'message_preview';
				previewMessage.className = 'message';
				Foxtrick.util.sanitize.addHTML(doc, text, previewMessage);

				let oldPreview = previewDiv.querySelector('#message_preview');
				previewDiv.replaceChild(previewMessage, oldPreview);
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		/**
		 * @param  {HTMLElement} previewDiv
		 * @return {Listener<HTMLInputElement, MouseEvent>}
		 */
		var toggleListener = function(previewDiv) {
			/** @type {WeakMap<Element, ()=>void>} */
			const REMOVE_MAP = new WeakMap();
			const NO_OP = () => {};

			return function toggle() {
				Foxtrick.toggleClass(previewDiv, 'hidden');
				let msgWindow = doc.querySelector('#mainBody textarea');

				try {
					if (Foxtrick.hasClass(previewDiv, 'hidden')) {
						(REMOVE_MAP.get(msgWindow) || NO_OP)();

						let toolbars = doc.querySelectorAll('.HTMLToolbar');
						for (let toolbar of toolbars)
							(REMOVE_MAP.get(toolbar) || NO_OP)();
					}
					else {
						let listener = () => preview(previewDiv);
						let rem = Foxtrick.listen(msgWindow, 'input', listener);
						REMOVE_MAP.set(msgWindow, rem);

						let toolbars = doc.querySelectorAll('.HTMLToolbar');
						for (let toolbar of toolbars) {
							let rem = Foxtrick.listen(toolbar, 'click', listener);
							REMOVE_MAP.set(toolbar, rem);
						}

						listener();
					}
				}
				catch (e) {
					Foxtrick.log('kForumPreview.toggle', e);
				}
			};
		};

		var msgWindow = Foxtrick.getMBElement(doc, 'tbNewsBody') ||
			doc.querySelector('#mainBody textarea');

		if (msgWindow == null)
			return;

		{
			let previewDiv = doc.getElementById('ft-forum-preview-area');
			if (previewDiv != null)
				return;

			let previewCtrlDiv = doc.createElement('div');
			previewCtrlDiv.style.marginTop = '1em';
			Foxtrick.insertBefore(previewCtrlDiv, msgWindow);
		}

		var previewDiv = Foxtrick.createFeaturedElement(doc, module, 'div');
		previewDiv.id = 'ft-forum-preview-area';
		previewDiv.className = 'cfMessageNoAvatar hidden';
		previewDiv.style.border = '1px dotted grey';
		if (msgWindow.style.width == '95%')
			previewDiv.style.width = '89.5%';
		else
			previewDiv.style.width = '93%';
		previewDiv.style.margin = '5px';
		previewDiv.style.padding = '10px';
		previewDiv.style.background = '#fcf6df';

		{
			let previewMessage = doc.createElement('div');
			previewMessage.id = 'message_preview';
			previewMessage.className = 'message';
			previewDiv.appendChild(previewMessage);

			let at = doc.querySelector('.HTMLToolbar');
			if (!at) {
				if (Foxtrick.isPage(doc, 'newsLetter') || Foxtrick.isPage(doc, 'ntNewsLetter'))
					at = Foxtrick.getMBElement(doc, 'txtMessage');
				if (Foxtrick.isPage(doc, 'mailNewsLetter'))
					at = Foxtrick.getMBElement(doc, 'tbNewsBody');
			}

			if (!at)
				return;

			Foxtrick.insertBefore(previewDiv, at);
		}

		if (doc.getElementById('foxtrick-forum-preview-button'))
			return;

		let target = module.getButtonTarget(msgWindow);
		if (!target)
			return;

		{
			let context = msgWindow.closest('.info, .boxBody');
			let htButtons = context.querySelectorAll('.hattrick-ml-preview-button');
			let unhandled = Foxtrick.nth(e => !e.matches('.ft-replaced'), htButtons);
			if (unhandled)
				Foxtrick.addClass(unhandled, 'ft-replaced');
		}
		{
			msgWindow.tabIndex = msgWindow.tabIndex || 1;
			target.tabIndex = msgWindow.tabIndex + 1;

			let newButton = doc.createElement('input');
			newButton.value = Foxtrick.L10n.getString('ForumPreview.preview');
			newButton.title = Foxtrick.L10n.getString('ForumPreview.preview.title');
			newButton.id = 'foxtrick-forum-preview-button';
			newButton.type = 'button';
			newButton = Foxtrick.makeFeaturedElement(newButton, module);
			Foxtrick.onClick(newButton, toggleListener(previewDiv));
			newButton.tabIndex = target.tabIndex + 1;

			Foxtrick.insertAfter(newButton, target);
		}

		let toolbars = doc.querySelectorAll('.HTMLToolbar');
		for (let toolbar of toolbars) {
			for (let button of toolbar.children) {
				if (button.hasAttribute('onclick') && !button.hasAttribute('tabindex')) {
					button.setAttribute('tabindex', '0');
					button.setAttribute('role', 'button');
				}
			}
		}
	},

	/**
	 * Detect button layout and set up tabindices
	 *
	 * @param  {HTMLElement}      area message text area
	 * @return {HTMLInputElement}      element to insert after
	 */
	getButtonTarget(area) {
		let doc = area.ownerDocument;
		let scope = area.closest('.info, .boxBody');

		if (Foxtrick.isPage(doc, 'forumWritePost')) {
			let buttonOk = Foxtrick.getButton(scope, 'OK');
			if (buttonOk && Foxtrick.L10n.isStringAvailableLocal('ForumPreview.send'))
				buttonOk.value = Foxtrick.L10n.getString('ForumPreview.send');
		}

		return Foxtrick.getSubmitButton(scope);
	},

	/** @param {document} doc */
	change: function(doc) {
		const module = this;

		let previewDiv = doc.getElementById('ft-forum-preview-area');
		if (previewDiv == null)
			module.run(doc);
	},
};
