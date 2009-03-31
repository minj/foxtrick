/**
 * forumpreview.js
 * Foxtrick forum post preview
 * @author spambot
 */

var FoxtrickForumPreview = {

    MODULE_NAME : "ForumPreview",
    MODULE_AUTHOR : "spambot",
    MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
    DEFAULT_ENABLED : true,

    _NEW_MESSAGE_WINDOW : 'ctl00_CPMain_ucEditor_tbBody',
    _MAIL_MESSAGE_WINDOW : 'ctl00_CPMain_tbBody',

    init : function() {
        Foxtrick.registerPageHandler( 'forumWritePost', this );
        Foxtrick.registerPageHandler( 'messageWritePost', this );
    },

    run : function( page, doc ) {
        try {
            var msg_window = doc.getElementById( 'ctl00_CPMain_ucEditor_tbBody' );
            if (msg_window == null)
                msg_window = doc.getElementById( 'ctl00_CPMain_tbBody' );
            if (msg_window == null)
                return;
        }
        catch(e) {
            dump('FoxtrickForumPreview'+e);
        }

        // display preview and button above the message window

		var head = doc.getElementsByTagName("head")[0];
        var cssstyle = doc.createElement("style");
        cssstyle.setAttribute("type", "text/css");
		cssstyle.appendChild(doc.createTextNode("#ctl00_CPMain_btnOK, #ctl00_CPMain_btnSendNew {font-weight:bold;}"));
        //cssstyle.appendChild(doc.createTextNode("#idFTPreview {display:inline-block;float:right;}"));
        head.appendChild(cssstyle);
		
		
		var preview_ctrl_div = doc.createElement( "div" );
        preview_ctrl_div.style.marginTop = "1em";

        var button_ok=doc.getElementById("ctl00_CPMain_btnOK");
		var target=doc.getElementById("ctl00_CPMain_btnCancel");
		//var index =11;
		var index =12;
		if (!target) {target=doc.getElementById("ctl00_CPMain_btnSendNew"); index=6;/*index=5;*/}
		//button_ok.setAttribute( "tabindex",  index);
		if (button_ok && Foxtrickl10n.isStringAvailableLocal("sendmessage")) button_ok.setAttribute( "value",  Foxtrickl10n.getString( 'sendmessage'));
		//if (button_cancel) button_cancel.setAttribute( "tabindex",  "12" );
     	
		var new_button = doc.createElement( "input" );
        new_button.setAttribute( "value", Foxtrickl10n.getString( 'preview' ));
        new_button.setAttribute( "title",  Foxtrickl10n.getString( 'show_preview_from_post' ) );
        new_button.setAttribute( "id",  "idFTPreview" );
        new_button.setAttribute( "type",  "button" );
        //new_button.setAttribute( "tabindex",  index-1 );
     	new_button.setAttribute( "tabindex",  index);
     	//new_button.setAttribute( "style",  "float:right;");
     	new_button.addEventListener( "click", FoxtrickForumPreview._toggleListener, false );
        //button_ok.parentNode.insertBefore(new_button,button_ok);
		target.parentNode.insertBefore(new_button,target.nextSibling);
		
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
		while (div=divs[i++]) if (div.className=='HTMLToolbar') break;
        div.parentNode.insertBefore( preview_div,div );

    },

	change : function( page, doc ) {

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
            var msg_window = doc.getElementById( 'ctl00_CPMain_ucEditor_tbBody' );
            if (msg_window == null)
                msg_window = doc.getElementById( 'ctl00_CPMain_tbBody' );
            if (msg_window == null)
                return;
        }
        catch(e) {
            dump('FoxtrickForumPreview'+e);
        }

        var prev_div = doc.getElementById( "forum_preview" );

        try {
            if( prev_div.style.display == "none" ) { 
                msg_window.removeEventListener( "keyup", FoxtrickForumPreview._preview, false );

            } else {  
                msg_window.addEventListener( "keyup", FoxtrickForumPreview._preview, false );
                FoxtrickForumPreview._preview( ev );
            }
        } catch(e) {
            dump (' FoxtrickForumPreview._toggleListener ' + e) ;
        }
	},

    _preview : function ( ev ) {

        search = new Array(

            /\[playerid=(\d+)\]/,
            /\[youthplayerid=(\d+)\]/,
            /\[teamid=(\d+)\]/,
            /\[youthteamid=(\d+)\]/,
            /\[matchid=(\d+)\]/,
            /\[youthmatchid=(\d+)\]/,
            /\[federationid=(\d+)\]/,
            /\[message\=(\d+)\.(\d+)\]/,
            /\[leagueid=(\d+)\]/,
            /\[youthleagueid=(\d+)\]/,
          /\[link=(.*?)\]/,

          /\[q\](.*?)\[\/q\]/,
          /\[quote\=(.*?)\](.*?)\[\/quote\]/,
          /\[q\=(.*?)\](.*?)\[\/q\]/,
          /\[b\](.*?)\[\/b\]/,
          /\[u\](.*?)\[\/u\]/,
          /\[i\](.*?)\[\/i\]/,
          /\[br\]/,
          /\[hr\]/,
          /\[table\](.*?)\[\/table\]/,
          /\[tr\](.*?)\[\/tr\]/,
          /\[td\](.*?)\[\/td\]/
          );

        replace = new Array(
            "<a href=\"\/Club\/Players\/Player\.aspx\?playerId\=$1\" target=\"\_blank\">($1)</a>",
            "<a href=\"\/Club\/Players\/YouthPlayer\.aspx\?YouthPlayerID\=$1\" target=\"\_blank\">($1)</a>",
            "<a href=\"\/Club\/\?TeamID\=$1\" target=\"\_blank\">($1)</a>",
            "<a href=\"\/Club\/Youth\/\?YouthTeamID\=$1\" target=\"\_blank\">($1)</a>",
            "<a href=\"\/Club\/Matches\/Match\.aspx\?matchID\=$1\" target=\"\_blank\">($1)</a>",
            "<a href=\"\/Club\/Matches\/Match\.aspx\?matchID\=$1\&isYouth\=True\" target=\"\_blank\">($1)</a>",
            "<a href=\"\/Community\/Federations\/Federation.aspx\?AllianceID\=$1\" target=\"\_blank\">($1)</a>",
            "<a href=\"\/Forum\/Read\.aspx\?t\=$1\&n\=$2\" target=\"\_blank\">($1.$2)</a>",
            "<a href=\"\/World\/Series\/Default\.aspx\?LeagueLevelUnitID\=$1\" target=\"\_blank\">($1)</a>",
            "<a href=\"\/World\/Series\/YouthSeries\.aspx\?YouthLeagueId\=$1\" target=\"\_blank\">($1)</a>",
          "<a href=\"$1\" target=\"\_blank\">($1)</a>",

          "<span class='quote'>$1</span>",
          "<span class='quote'><b>$1&nbsp;wrote:</b><br>$2</span>",
          "<span class='quote'><b>$1&nbsp;wrote:</b><br>$2</span>",
          "<b>$1</b>",
          "<u>$1</u>",
          "<i>$1</i>",
          "<br>",
          "<hr>",
          "<table><tbody>$1</tbody></table>",
          "<tr>$1</tr>",
          "<td>$1</td>"
        );

        var doc = ev.target.ownerDocument;

        try {
            var msg_window = doc.getElementById( 'ctl00_CPMain_ucEditor_tbBody' );
            if (msg_window == null)
                msg_window = doc.getElementById( 'ctl00_CPMain_tbBody' );
            if (msg_window == null)
                return;
        }
        catch(e) {
            dump('FoxtrickForumPreview'+e);
        }

        try {
            var prev_div = doc.getElementById( "forum_preview" );
            var text = Foxtrick.stripHTML( msg_window.value );

            text = text.replace(/\n/g, "<br />");
            var count = Foxtrick.substr_count(text, '[');
            for (var j = 0; j < count; j++) {
                for ( var i = 0; i < search.length; i++) {
                    text = text.replace(search[i],replace[i]);
                }
            }

            prev_div.innerHTML = text;
        }
        catch(e) {
            dump('FoxtrickForumPreview'+e);
        }

    }

};