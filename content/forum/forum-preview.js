/**
 * forum-preview.js
 * Foxtrick forum post preview
 * @author spambot
 */

var FoxtrickForumPreview = {
	MODULE_NAME : "ForumPreview",
	MODULE_AUTHOR : "spambot",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : ['forumWritePost','messageWritePost','guestbook','announcements','newsletter','mailnewsletter','forumSettings',"forumModWritePost"],

	_NEW_MESSAGE_WINDOW : 'ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtBody',
	_MAIL_MESSAGE_WINDOW : 'ctl00_ctl00_CPContent_CPMain_ucEditorMain_txtBody',

	run : function(doc) {
		var check_div = doc.getElementById( "forum_preview" );
		if (check_div != null) return;

		try {
			var msg_window=null;
			msg_window = doc.getElementById( 'ctl00_ctl00_CPContent_CPMain_tbNewsBody' ); //mailnewsletter

			if (msg_window == null) {
			   msg_window = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
			}
			if (msg_window == null)
				return;
		}
		catch (e) {
			Foxtrick.log(e);
		}

		// display preview and button above the message window
		var head = doc.getElementsByTagName("head")[0];
		var cssstyle = doc.createElement("style");
		cssstyle.setAttribute("type", "text/css");
		cssstyle.appendChild(doc.createTextNode("#ctl00_ctl00_CPContent_CPMain_btnOK, #ctl00_ctl00_CPContent_CPMain_btnSendNew, #ctl00_ctl00_CPContent_CPMain_btnCancel {font-weight:bold;} #idFTPreview {margin-left:10px;}"));
		//cssstyle.appendChild(doc.createTextNode("#idFTPreview {display:inline-block;float:right;}"));
		head.appendChild(cssstyle);


		var preview_ctrl_div = doc.createElement( "div" );
		preview_ctrl_div.style.marginTop = "1em";

		var button_ok = null;
		var targets = doc.getElementById('mainBody').getElementsByTagName("input");  // Forum
		var target = targets[targets.length-1];

		if (Foxtrick.isPage('forumWritePost', doc))
			button_ok = targets[targets.length-2];
		if (Foxtrick.isPage('guestbook', doc))
			target = null;


		var msg_type = 0;
		//var index =11;

		var index =12;

		if (!target) {
			target=doc.getElementById("ctl00_ctl00_CPContent_CPMain_btnSendNew");  // Mail
			index=6;
			/*index=5;*/
			var msg_type = 1;
		}

		if (!target) {
			target=doc.getElementById("ctl00_ctl00_CPContent_CPMain_btnActionSend");  // Ticket
			if (target) {
				msg_window.setAttribute( "tabindex",  1);
				target.setAttribute( "tabindex",  2);
				index=3; /*index=5;*/
				var msg_type = 2;
			}
		}
		if (!target) {
			target=doc.getElementById("ctl00_ctl00_CPContent_CPMain_btnAdd");  // GB
			if (target) {
				msg_window.setAttribute( "tabindex",  1);
				target.setAttribute( "tabindex",  2);
				index=3; /*index=5;*/
				var msg_type = 3;
			}
		}
		if (!target) {
			target=doc.getElementById("ctl00_ctl00_CPContent_CPMain_btnSendNewsletter");  // newsletter
			if (target) {
				msg_window.setAttribute( "tabindex",  1);
				target.setAttribute( "tabindex",  2);
				index=3; /*index=5;*/
				var msg_type = 5;
			}
		}
		if (!target) {
			target=doc.getElementById("ctl00_ctl00_CPContent_CPMain_btnNewsSend");  // mailnewsletter
			if (target) {
				msg_window.setAttribute( "tabindex",  1);
				target.setAttribute( "tabindex",  2);
				index=3; /*index=5;*/
				var msg_type = 6;
			}
		}
		if (!target) {
			target=doc.getElementById("ctl00_ctl00_CPContent_CPMain_btnEdit");  // AnnouncementEdit
			if (target) {
				msg_window.setAttribute( "tabindex",  1);
				target.setAttribute( "tabindex",  2);
				index=3; /*index=5;*/
				var msg_type = 6;
			}
		}
		if (!target) {
			target=doc.getElementById("ctl00_ctl00_CPContent_CPMain_btnThreadCloseReplyOK");  // forumModWritePost
			if (target) {
				msg_window.setAttribute( "tabindex",  1);
				target.setAttribute( "tabindex",  2);
				index=3; /*index=5;*/
				var msg_type = 7;
			}
		}
		
		//button_ok.setAttribute( "tabindex",  index);
		if (button_ok && Foxtrickl10n.isStringAvailableLocal("forumPreview.send")) button_ok.setAttribute( "value",  Foxtrickl10n.getString( 'forumPreview.send'));
		//if (button_cancel) button_cancel.setAttribute( "tabindex",  "12" );

		if (doc.getElementById('idFTPreview') == null) {
			var new_button = doc.createElement( "input" );
			new_button.setAttribute( "value", Foxtrickl10n.getString( 'preview' ));
			new_button.setAttribute( "title",  Foxtrickl10n.getString( 'show_preview_from_post' ) );
			new_button.setAttribute( "id",  "idFTPreview" );
			new_button.setAttribute( "type",  "button" );
			//new_button.setAttribute( "tabindex",  index-1 );
			new_button.setAttribute( "tabindex",  index);
			//if (msg_type != -1)
			//new_button.setAttribute( "style",  "float:right;");
			new_button.addEventListener( "click", FoxtrickForumPreview._toggleListener, false );
			//button_ok.parentNode.insertBefore(new_button,button_ok);
			target.parentNode.insertBefore(new_button,target.nextSibling);
		}

		msg_window.parentNode.insertBefore( preview_ctrl_div, msg_window );

		var preview_div = doc.createElement( "div" );
		preview_div.id = "forum_preview";
		preview_div.setAttribute( "class", "cfMessageNoAvatar" );
		preview_div.style.display = "none";
		preview_div.style.border = "1px dotted grey";
		//preview_div.style.width = "465px";
		//preview_div.style.width = (msg_window.style.width - 30);
		if (msg_window.style.width=='95%')  preview_div.style.width ='89.5%' ;
		else preview_div.style.width ='93%' ;
		preview_div.style.margin = "5px";
		preview_div.style.padding = "10px";
		preview_div.style.background = "#fcf6df";

		var preview_message = doc.createElement( "div" );
		preview_message.id = "message_preview";
		preview_message.setAttribute( "class", "message" );
		preview_div.appendChild( preview_message );
		
		var divs=doc.getElementById('mainBody').getElementsByTagName('div');
		var i=0,div;
		while (div=divs[i++])
			if (div.className=='HTMLToolbar')
				break;
		if (Foxtrick.isPage("newsletter", doc))
			div = doc.getElementById('ctl00_ctl00_CPContent_CPMain_txtMessage');
		if (Foxtrick.isPage('mailnewsletter', doc))
			div = doc.getElementById('ctl00_ctl00_CPContent_CPMain_tbNewsBody');

		div.parentNode.insertBefore( preview_div,div );
	},

	change : function(doc) {
		var check_div = doc.getElementById( "forum_preview" );
		if (check_div == null)
			this.run(doc);
	},

	_toggleListener : function( ev ) {

		var doc = ev.target.ownerDocument;

		var obj = doc.getElementById('forum_preview');
		if (obj.style.display == 'block') {
			obj.style.display = 'none';
		}
		else if (obj.style.display == 'none') {
			obj.style.display = 'block';
		}

		try {
			var msg_window = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
		}
		catch(e) {
			Foxtrick.dump('FoxtrickForumPreview'+e);
		}

		var prev_div = doc.getElementById( "forum_preview" );

		try {
			if( prev_div.style.display == "none" ) {
				msg_window.removeEventListener( "keyup", FoxtrickForumPreview._preview, false );
				var toolbar = doc.getElementsByClassName("HTMLToolbar");
				for (var i=0;i< toolbar.length;++i) toolbar[i].removeEventListener( "click", FoxtrickForumPreview._preview, false );

			} else {
				msg_window.addEventListener( "keyup", FoxtrickForumPreview._preview, false );
				var toolbar = doc.getElementsByClassName("HTMLToolbar");
				for (var i=0;i< toolbar.length;++i) toolbar[i].addEventListener( "click", FoxtrickForumPreview._preview, false );

				FoxtrickForumPreview._preview( ev );
			}
		} catch(e) {
			Foxtrick.dump (' FoxtrickForumPreview._toggleListener ' + e) ;
		}
	},

	_preview : function ( ev ) {

		var search_single = new Array(

		/\[kitid=(\d+)\]/gi,
		/\[userid=(\d+)\]/gi,
		/\[playerid=(\d+)\]/gi,
		/\[youthplayerid=(\d+)\]/gi,
		/\[teamid=(\d+)\]/gi,
		/\[youthteamid=(\d+)\]/gi,
		/\[matchid=(\d+)\]/gi,
		/\[youthmatchid=(\d+)\]/gi,
		/\[federationid=(\d+)\]/gi,
		/\[message\=(\d+)\.(\d+)\]/gi,
		/\[post\=(\d+)\.(\d+)\]/gi,
		/\[leagueid=(\d+)\]/gi,
		/\[youthleagueid=(\d+)\]/gi,
		/\[link=(.*?)\]/gi,
		/\[articleid=(.*?)\]/gi,

		/\[br\]/gi,
		/\[hr\]/gi
		);

		var search_nested = new Array(
		/\[b\](.*?)\[\/b\]/gi,
		/\[u\](.*?)\[\/u\]/gi,
		/\[i\](.*?)\[\/i\]/gi,

		/\[q\](.*?)\[\/q\]/gi,
		/\[quote\=(.*?)\](.*?)\[\/quote\]/gi,
		/\[q\=(.*?)\](.*?)\[\/q\]/gi,
		/\[q\=(.*?)\](.*?)\[\/q\]/gi,

		/\[spoiler\](.*?)\[\/spoiler\]/gi,

		/\[pre\](.*?)\[\/pre\]/gi,

		/\[table\](.*?)\[\/table\]/gi,
		/\[tr(.*?)\](.*?)\[\/tr\]/gi,
		/\[th([^\]]*?)align=(\w*)([^\]]*)\](.*?)\[\/th\]/gi,
		/\[td([^\]]*?)align=(\w*)([^\]]*)\](.*?)\[\/td\]/gi,
		/\[th(.*?)\](.*?)\[\/th\]/gi,
		/\[td(.*?)\](.*?)\[\/td\]/gi,

		/\<\/td\>\<br \/\>/gi,
		/\<\/th\>\<br \/\>/gi,
		/\<\/tr\>\<br \/\>/gi,
		/\<tr(.*?)\>\<br \/\>/gi,
		/\<tbody\>\<br \/\>/gi,

		/\<\/td\>\<br \/\>/gi,
		/\<\/th\>\<br \/\>/gi,
		/\<\/tr\>\<br \/\>/gi,
		/\<tr(.*?)\>\<br \/\>/gi,
		/\<tbody\>\<br \/\>/gi

		);

		var replace_single = new Array(
		"<a href=\"\/Community\/KitSearch\/\?KitID\=$1\" target=\"\_blank\">($1)</a>",
		"<a href=\"\/Club\/Manager\/\?userId\=$1\" target=\"\_blank\">($1)</a>",
		"<a href=\"\/Club\/Players\/Player\.aspx\?playerId\=$1\" target=\"\_blank\">($1)</a>",
		"<a href=\"\/Club\/Players\/YouthPlayer\.aspx\?YouthPlayerID\=$1\" target=\"\_blank\">($1)</a>",
		"<a href=\"\/Club\/\?TeamID\=$1\" target=\"\_blank\">($1)</a>",
		"<a href=\"\/Club\/Youth\/\?YouthTeamID\=$1\" target=\"\_blank\">($1)</a>",
		"<a href=\"\/Club\/Matches\/Match\.aspx\?matchID\=$1\" target=\"\_blank\">($1)</a>",
		"<a href=\"\/Club\/Matches\/Match\.aspx\?matchID\=$1\&isYouth\=True\" target=\"\_blank\">($1)</a>",
		"<a href=\"\/Community\/Federations\/Federation.aspx\?AllianceID\=$1\" target=\"\_blank\">($1)</a>",
		"<a href=\"\/Forum\/Read\.aspx\?t\=$1\&n\=$2\" target=\"\_blank\">($1.$2)</a>",
		"<a href=\"\/Forum\/Read\.aspx\?t\=$1\&n\=$2\" target=\"\_blank\">($1.$2)</a>",
		"<a href=\"\/World\/Series\/Default\.aspx\?LeagueLevelUnitID\=$1\" target=\"\_blank\">($1)</a>",
		"<a href=\"\/World\/Series\/YouthSeries\.aspx\?YouthLeagueId\=$1\" target=\"\_blank\">($1)</a>",
		"<a href=\"$1\" target=\"\_blank\">($1)</a>",
		"<a href=\"\/Community\/Press\?ArticleID\=$1\" target=\"\_blank\">($1)</a>",

		"<br>",
		"<hr>"
		);

		var replace_nested = new Array(
		"<b>$1</b>",
		"<u>$1</u>",
		"<i>$1</i>",

		"<blockquote class='quote'>$1</blockquote>",
		"<blockquote class='quote'><div class='quoteto'>$1&nbsp;wrote:</div>$2</blockquote>",
		"<blockquote class='quote'><div class='quoteto'>$1&nbsp;wrote:</div>$2</blockquote>",
		"<blockquote class='quote'><div class='quoteto'>$1&nbsp;wrote:</div>$2</blockquote>",

		"<blockquote class='spoiler hidden' style='display:block!important'>$1</blockquote>",

		"<pre>$1</pre>",

		"<table class='htMlTable'><tbody>$1</tbody></table>",
		"<tr $1>$2</tr>",
		"<th $1 class=$2 $3>$4</th>",
		"<td $1 class=$2 $3>$4</td>",
		"<th $1>$2</th>",
		"<td $1>$2</td>",

		"</td>",
		"</th>",
		"</tr>",
		"<tr$1>",

		"<tbody>",
		"</td>",
		"</th>",

		"</tr>",
		"<tr$1>",
		"<tbody>"
		);

		var doc = ev.target.ownerDocument;

		try {
			var msg_window = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
		}
		catch(e) {
			Foxtrick.dump('FoxtrickForumPreview'+e);
		}

		try {
			var prev_div = doc.getElementById( "forum_preview" );
			var text =  String(msg_window.value);

			// format within pre
			text = FoxtrickFormatPostingText.format(text);

			// replace &
			text = text.replace(/\&/g, "&amp;");
			// < with space after is allowed
			text = text.replace(/< /g, "&lt; ");

			// strip links. replace <· with &lt;
			text = text.replace(/<Â·/g,'&lt;'); // who know why that Â is needed there
			text = text.replace(/<·/g,'&lt;'); // i don't, so just lets do both
			text = Foxtrick.stripHTML( text);

			text = text.replace(/\n/g, " <br />");
			text = text.replace(/\r/g, "");

			var nested = ['[q','[b','[i','[u','[spoil','[table','[pre'];
			var count =  0
			for (var i=0; i< nested.length;++i) {
				var count_nested = Foxtrick.substr_count(text, nested[i]);
				count = Math.max(count, count_nested);
			}

			for ( var i = 0; i < search_single.length; i++) {
				text = text.replace(search_single[i],replace_single[i]);
			}

			for (var j = 0; j <= count+1; j++) {
				for ( var i = 0; i < search_nested.length; i++) {
					text = text.replace(search_nested[i],replace_nested[i]);
				}
			}

			// reformat with pre
			text = FoxtrickFormatPostingText.reformat(text);

			prev_div.innerHTML = text;
		}
		catch(e) {
			Foxtrick.log(e);
		}

	}

};
Foxtrick.util.module.register(FoxtrickForumPreview);
