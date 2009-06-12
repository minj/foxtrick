/**
 * forumpreview.js
 * Foxtrick forum post preview
 * @author spambot
 */

var FoxtrickForumPreview = {

    MODULE_NAME : "ForumPreview",
    MODULE_AUTHOR : "spambot",
    MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forumWritePost','messageWritePost','guestbook','announcements','ads'), 
    DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8.1",	
	LASTEST_CHANGE:"Changed quotes",
	
    _NEW_MESSAGE_WINDOW : 'ctl00_CPMain_ucHattrickMLEditor_txtBody',
    _MAIL_MESSAGE_WINDOW : 'ctl00_CPMain_ucEditorMain_txtBody',

    init : function() {
    },

    run : function( page, doc ) {
        
        try {
            var msg_window = doc.getElementById( 'ctl00_CPMain_ucHattrickMLEditor_txtBody' ); //forum / PA
            if (msg_window == null)
                msg_window = doc.getElementById( 'ctl00_CPMain_ucEditorMain_txtBody' ); //mail
            if (msg_window == null)
                msg_window = doc.getElementById( 'ctl00_CPMain_ucActionEditor_txtBody' ); //ticket
            if (msg_window == null)
                msg_window = doc.getElementById( 'ctl00_CPMain_txtInsert' ); //ads                
            if (msg_window == null)
                return;
        }
        catch(e) {
            dump('n' + 'FoxtrickForumPreview' + e + '\n');
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
		var target = doc.getElementById("ctl00_CPMain_btnCancel");  // Forum
        var msg_type = 0; 
		//var index =11;
		
        var index =12;
		
        if (!target) {
                target=doc.getElementById("ctl00_CPMain_btnSendNew");  // Mail
                index=6;
                /*index=5;*/ 
                var msg_type = 1;
            } 
        
        if (!target) {
                target=doc.getElementById("ctl00_CPMain_btnActionSend");  // Ticket
                if (target) {
                    msg_window.setAttribute( "tabindex",  1);
                    target.setAttribute( "tabindex",  2);
                    index=3; /*index=5;*/ 
                    var msg_type = 2;
                }
            } 
        if (!target) {
                target=doc.getElementById("ctl00_CPMain_btnAdd");  // GB
                if (target) {
                    msg_window.setAttribute( "tabindex",  1);                
                    target.setAttribute( "tabindex",  2);
                    index=3; /*index=5;*/ 
                    var msg_type = 3;
                }
        }
        if (!target) {
                target=doc.getElementById("ctl00_CPMain_btnCreateInsert");  // ads
                if (target) {
                    msg_window.setAttribute( "tabindex",  1);                
                    target.setAttribute( "tabindex",  2);
                    index=3; /*index=5;*/ 
                    var msg_type = 3;
                }
        }
        dump('\n ==> Message Type ' + msg_type + '\n');
        
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
        //if (msg_type != -1) 
        new_button.setAttribute( "style", "margin-left:10px;");
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
        if (page == 'ads') div = doc.getElementById('ctl00_CPMain_txtInsert');
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
            var msg_window = doc.getElementById( 'ctl00_CPMain_ucHattrickMLEditor_txtBody' ); //forum
            if (msg_window == null)
                msg_window = doc.getElementById( 'ctl00_CPMain_ucEditorMain_txtBody' ); //mail
            if (msg_window == null)
                msg_window = doc.getElementById( 'ctl00_CPMain_ucActionEditor_txtBody' ); //ticket                
            if (msg_window == null)
                msg_window = doc.getElementById( 'ctl00_CPMain_txtInsert' ); //ads                
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

        var search = new Array(

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

          /\[q\](.*?)\[\/q\]/gi,
          /\[quote\=(.*?)\](.*?)\[\/quote\]/gi,
          /\[q\=(.*?)\](.*?)\[\/q\]/gi,
          /\[b\](.*?)\[\/b\]/gi,
          /\[u\](.*?)\[\/u\]/gi,
          /\[i\](.*?)\[\/i\]/gi,
          /\[br\]/gi,
          /\[hr\]/gi,
          
          /\[table\](.*?)\[\/table\]/gi,
          /\[th(.*?)\](.*?)\[\/th\]/gi,
          /\[tr(.*?)\](.*?)\[\/tr\]/gi,
          /\[td(.*?)\](.*?)\[\/td\]/gi,
          
          /\<\/td\>\<br \/\>/gi,
          /\<\/th\>\<br \/\>/gi,
          /\<\/tr\>\<br \/\>/gi,
          /\<tr(.*?)\>\<br \/\>/gi,
          /\<tbody\>\<br \/\>/gi
        );

        var replace = new Array(
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

          "<blockquote class='quote'>$1</blockquote>",
          "<blockquote class='quote'><div class='quoteto'>$1&nbsp;wrote:</div>$2</blockquote>",
          "<blockquote class='quote'><div class='quoteto'>$1&nbsp;wrote:</div>$2</blockquote>",
          "<b>$1</b>",
          "<u>$1</u>",
          "<i>$1</i>",
          "<br>",
          "<hr>",
          
          "<table class='htMlTable'><tbody>$1</tbody></table>",
          "<th $1>$2</th>",
          "<tr $1>$2</tr>",
          "<td $1>$2</td>",
          
          "</td>",
          "</th>",
          "</tr>",
          "<tr$1>",
          "<tbody>"
        );

        var doc = ev.target.ownerDocument;

        try {
            var msg_window = doc.getElementById( 'ctl00_CPMain_ucHattrickMLEditor_txtBody' ); //forum
            if (msg_window == null)
                msg_window = doc.getElementById( 'ctl00_CPMain_ucEditorMain_txtBody' ); //mail 
            if (msg_window == null)
                msg_window = doc.getElementById( 'ctl00_CPMain_ucActionEditor_txtBody' ); //ticket                
            if (msg_window == null)
                msg_window = doc.getElementById( 'ctl00_CPMain_txtInsert' ); //ads                
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
            for (var j = 0; j <= 0; j++) {
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