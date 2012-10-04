'use strict';
/**
 * forum-preview.js
 * area for forum post preview
 * @author spambot
 */

Foxtrick.modules['ForumPreview'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: [
		'forumWritePost', 'messageWritePost', 'guestbook', 'announcements', 'newsLetter',
		'mailNewsLetter', 'forumSettings', 'forumModWritePost'
	],
	CSS: Foxtrick.InternalPath + 'resources/css/forum-preview.css',

	_NEW_MESSAGE_WINDOW: 'ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtBody',
	_MAIL_MESSAGE_WINDOW: 'ctl00_ctl00_CPContent_CPMain_ucEditorMain_txtBody',

	run: function(doc) {
		var preview = function() {
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
				[/\[message\=(\d+)\.(\d+)\]/gi,
					"<a href='/Forum/Read.aspx?t=$1&n=$2' target='_blank'>($1.$2)</a>"],
				[/\[post\=(\d+)\.(\d+)\]/gi,
					"<a href='/Forum/Read.aspx?t=$1&n=$2' target='_blank'>($1.$2)</a>"],
				[/\[leagueid=(\d+)\]/gi,
					"<a href='/World/Series/Default.aspx?LeagueLevelUnitID=$1' " +
						"target='_blank'>($1)</a>"],
				[/\[youthleagueid=(\d+)\]/gi,
					"<a href='/World/Series/YouthSeries.aspx?YouthLeagueId=$1' " +
						"target='_blank'>($1)</a>"],
				[/\[tournamentid=(\d+)\]/gi,
					"<a href='/Community/Tournaments/Tournament.aspx?tournamentId=$1' " +
						"target='_blank'>($1)</a>"],
				[/\[link=(.*?)\]/gi,
					"<a href='$1' target='_blank'>($1)</a>"],
				[/\[articleid=(.*?)\]/gi,
					"<a href='/Community/Press?ArticleID=$1' target='_blank'>($1)</a>"],
				[/\[br\]/gi, '<br>'],
				[/\[hr\]/gi, '<hr>']
			];

			var nestedReplace = [
				[/\[b\](.*?)\[\/b\]/gi, '<b>$1</b>'],
				[/\[u\](.*?)\[\/u\]/gi, '<u>$1</u>'],
				[/\[i\](.*?)\[\/i\]/gi, '<i>$1</i>'],
				[/\[q\](.*?)\[\/q\]/gi, "<blockquote class='quote'>$1</blockquote>"],
				[/\[quote\=(.*?)\](.*?)\[\/quote\]/gi,
					"<blockquote class='quote'><div class='quoteto'>$1&nbsp;wrote:</div>" +
						'$2</blockquote>'],
				[/\[q\=(.*?)\](.*?)\[\/q\]/gi,
					"<blockquote class='quote'><div class='quoteto'>$1&nbsp;wrote:</div>" +
						'$2</blockquote>'],
				[/\[q\=(.*?)\](.*?)\[\/q\]/gi,
					"<blockquote class='quote'><div class='quoteto'>$1&nbsp;wrote:</div>" +
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
				[/\<br \/\>\s*\<\/td\>/gi, '<br/></td>'],
				[/\<br \/\>\s*\<\/th\>/gi, '<br/></th>'],
				[/\<\/td\>\s*\<br \/\>/gi, '</td>'],
				[/\<\/th\>\s*\<br \/\>/gi, '</th>'],
				[/\<\/tr\>\s*\<br \/\>/gi, '</tr>'],
				[/\<tr([^\>]*?)\>\s*\<br \/\>/gi, '<tr$1>'],
				[/\<tbody\>\s*\<br \/\>/gi, '<tbody>'],
				[/\<\/td\>\s*\<br \/\>/gi, '</td>'],
				[/\<\/th\>\s*\<br \/\>/gi, '</th>'],
				[/\<\/tr\>\s*\<br \/\>/gi, '</tr>'],
				[/\<tr([^\>]*?)\>\s*\<br \/\>/gi, '<tr$1>'],
				[/\<tbody\>\s*\<br \/\>/gi, '<tbody>']
			];

			try {
				var msg_window = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
			}
			catch (e) {
				Foxtrick.dump('FoxtrickForumPreview' + e);
			}

			try {
				var prev_div = doc.getElementById('ft-forum-preview-area');
				var text = String(msg_window.value);

				var formatter = Foxtrick.modules['FormatPostingText'];

				// format within pre
				text = formatter.format(text);

				// replace &
				text = text.replace(/\&/g, '&amp;');
				// < with space after is allowed
				text = text.replace(/< /g, '&lt; ');

				// strip links. replace <· with &lt;
				text = text.replace(/<Â·/g, '&lt;');
				// who know why that Â is needed there. i think that happens at times
				// with uft8 vs ansi
				text = text.replace(/<·/g, '&lt;'); // i don't, so just lets do both
				text = Foxtrick.stripHTML(text);

				text = text.replace(/\n/g, ' <br />');
				text = text.replace(/\r/g, '');

				var nested = ['[q', '[b', '[i', '[u', '[spoil', '[table', '[pre'];
				var count = 0;
				for (var i = 0; i < nested.length; ++i) {
					var count_nested = Foxtrick.substr_count(text, nested[i]);
					count = Math.max(count, count_nested);
				}

				for (var i = 0; i < singleReplace.length; i++) {
					text = text.replace(singleReplace[i][0], singleReplace[i][1]);
				}

				for (var j = 0; j <= count + 1; j++) {
					for (var i = 0; i < nestedReplace.length; i++) {
						text = text.replace(nestedReplace[i][0], nestedReplace[i][1]);
					}
				}

				// reformat with pre
				text = formatter.reformat(text);

				var preview_message = doc.createElement('div');
				preview_message.id = 'message_preview';
				preview_message.setAttribute('class', 'message');

				Foxtrick.util.sanitize.addHTML(doc, text, preview_message);
				preview_div.replaceChild(preview_message, preview_div.firstChild);
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		var toggleListener = function() {
			var prev_div = doc.getElementById('ft-forum-preview-area');
			Foxtrick.toggleClass(prev_div, 'hidden');

			try {
				var msg_window = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
			}
			catch (e) {
				Foxtrick.log('FoxtrickForumPreview', e);
			}

			try {
				if (Foxtrick.hasClass(prev_div, 'hidden')) {
					msg_window.removeEventListener('keyup', preview, false);
					var toolbar = doc.getElementsByClassName('HTMLToolbar');
					for (var i = 0; i < toolbar.length; ++i)
						toolbar[i].removeEventListener('click', preview, false);

				} else {
					Foxtrick.listen(msg_window, 'keyup', preview, false);
					var toolbar = doc.getElementsByClassName('HTMLToolbar');
					for (var i = 0; i < toolbar.length; ++i)
						Foxtrick.onClick(toolbar[i], preview);

					preview();
				}
			} catch (e) {
				Foxtrick.dump('FoxtrickForumPreview._toggleListener' + e);
			}
		};

		var check_div = doc.getElementById('ft-forum-preview-area');
		if (check_div != null) return;

		try {
			var msg_window = null;
			msg_window = doc.getElementById('ctl00_ctl00_CPContent_CPMain_tbNewsBody');
			//mailnewsletter

			if (msg_window == null) {
				msg_window = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
			}
			if (msg_window == null)
				return;
		}
		catch (e) {
			Foxtrick.log(e);
		}

		var preview_ctrl_div = doc.createElement('div');
		preview_ctrl_div.style.marginTop = '1em';

		var button_ok = null;
		var targets = doc.getElementById('mainBody').getElementsByTagName('input');  // Forum
		var target = targets[targets.length - 1];

		if (Foxtrick.isPage('forumWritePost', doc))
			button_ok = targets[targets.length - 2];
		if (Foxtrick.isPage('guestbook', doc))
			target = null;


		var msg_type = 0;
		//var index =11;

		var index = 12;

		if (!target) {
			target = doc.getElementById('ctl00_ctl00_CPContent_CPMain_btnSendNew');  // Mail
			index = 6;
			/*index=5;*/
			var msg_type = 1;
		}

		if (!target) {
			target = doc.getElementById('ctl00_ctl00_CPContent_CPMain_btnActionSend');  // Ticket
			if (target) {
				msg_window.setAttribute('tabindex', 1);
				target.setAttribute('tabindex', 2);
				index = 3; /*index=5;*/
				var msg_type = 2;
			}
		}
		if (!target) {
			target = doc.getElementById('ctl00_ctl00_CPContent_CPMain_btnAdd');  // GB
			if (target) {
				msg_window.setAttribute('tabindex', 1);
				target.setAttribute('tabindex', 2);
				index = 3; /*index=5;*/
				var msg_type = 3;
			}
		}
		if (!target) {
			target = doc.getElementById('ctl00_ctl00_CPContent_CPMain_btnSendNewsletter');
			// newsletter
			if (target) {
				msg_window.setAttribute('tabindex', 1);
				target.setAttribute('tabindex', 2);
				index = 3; /*index=5;*/
				var msg_type = 5;
			}
		}
		if (!target) {
			target = doc.getElementById('ctl00_ctl00_CPContent_CPMain_btnNewsSend');
			// mailnewsletter
			if (target) {
				msg_window.setAttribute('tabindex', 1);
				target.setAttribute('tabindex', 2);
				index = 3; /*index=5;*/
				var msg_type = 6;
			}
		}
		if (!target) {
			target = doc.getElementById('ctl00_ctl00_CPContent_CPMain_btnEdit');  // AnnouncementEdit
			if (target) {
				msg_window.setAttribute('tabindex', 1);
				target.setAttribute('tabindex', 2);
				index = 3; /*index=5;*/
				var msg_type = 6;
			}
		}
		if (!target) {
			target = doc.getElementById('ctl00_ctl00_CPContent_CPMain_btnThreadCloseReplyOK');
			// forumModWritePost
			if (target) {
				msg_window.setAttribute('tabindex', 1);
				target.setAttribute('tabindex', 2);
				index = 3; /*index=5;*/
				var msg_type = 7;
			}
		}


		if (doc.getElementById('ft-forum-preview-button') == null) {
			//button_ok.setAttribute('tabindex',  index);
			if (button_ok && Foxtrickl10n.isStringAvailableLocal('ForumPreview.send'))
				button_ok.setAttribute('value', Foxtrickl10n.getString('ForumPreview.send'));

			//if (button_cancel) button_cancel.setAttribute('tabindex',  '12');
			var new_button = doc.createElement('input');
			new_button.setAttribute('value', Foxtrickl10n.getString('ForumPreview.preview'));
			new_button.setAttribute('title', Foxtrickl10n.getString('ForumPreview.preview.title'));
			new_button.setAttribute('id', 'ft-forum-preview-button');
			new_button.setAttribute('type', 'button');
			new_button = Foxtrick.makeFeaturedElement(new_button, this);
			new_button.setAttribute('tabindex', index);
			//if (msg_type != -1)
			//new_button.setAttribute('style',  'float:right;');
			Foxtrick.onClick(new_button, toggleListener);
			//button_ok.parentNode.insertBefore(new_button,button_ok);
			target.parentNode.insertBefore(new_button, target.nextSibling);
		}

		msg_window.parentNode.insertBefore(preview_ctrl_div, msg_window);

		var preview_div = Foxtrick.createFeaturedElement(doc, this, 'div');
		preview_div.id = 'ft-forum-preview-area';
		preview_div.setAttribute('class', 'cfMessageNoAvatar hidden');
		preview_div.style.border = '1px dotted grey';
		if (msg_window.style.width == '95%')
			preview_div.style.width = '89.5%';
		else
			preview_div.style.width = '93%';
		preview_div.style.margin = '5px';
		preview_div.style.padding = '10px';
		preview_div.style.background = '#fcf6df';

		var preview_message = doc.createElement('div');
		preview_message.id = 'message_preview';
		preview_message.setAttribute('class', 'message');
		preview_div.appendChild(preview_message);

		var divs = doc.getElementById('mainBody').getElementsByTagName('div');
		var i = 0, div;
		while (div = divs[i++])
			if (div.className == 'HTMLToolbar')
				break;
		if (Foxtrick.isPage('newsLetter', doc))
			div = doc.getElementById('ctl00_ctl00_CPContent_CPMain_txtMessage');
		if (Foxtrick.isPage('mailNewsLetter', doc))
			div = doc.getElementById('ctl00_ctl00_CPContent_CPMain_tbNewsBody');

		div.parentNode.insertBefore(preview_div, div);
	},

	change: function(doc) {
		var check_div = doc.getElementById('ft-forum-preview-area');
		if (check_div == null)
			this.run(doc);
	}
};
