/**
 * Transfer list deadline
 * @author spambot
 */

FoxtrickTransferDeadline = {

    MODULE_NAME : "TransferDeadline",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('transferSearchResult','playerdetail','transfer'),

    run : function(page, doc) {
        var httime = doc.getElementById( "time" ).innerHTML;

        Foxtrick.HT_date = Foxtrick.util.time.getDateFromText( httime );
        if (!Foxtrick.HT_date) return;

        switch ( page ) {
            case 'transferSearchResult' :

                this._PlayerListDeatline ( doc, 'span' );
                break;

            case 'playerdetail' :

                this._PlayerDetailsDeatline ( doc );
                break;

            case 'transfer' :

                this._PlayerListDeatline ( doc, 'div' );
                break;
        }
    },

	change : function( page, doc ) {
		var httime = doc.getElementById( "time" ).innerHTML;
		Foxtrick.HT_date = Foxtrick.util.time.getDateFromText( httime );
        if (!Foxtrick.HT_date) return;

        switch ( page ) {
            case 'playerdetail' :
                this._PlayerDetailsDeatline ( doc );
                break;
        }
	},

    _PlayerListDeatline : function ( doc, element ) {
        var spans = doc.getElementsByTagName( element );
        var j = 0;
        for (var i=0; i<spans.length; i++) {
            var cell = "ctl00_ctl00_CPContent_CPMain_lstBids_ctrl"+ j + "_jsonDeadLine";
            var selltime_elm = doc.getElementById( cell );

            if (selltime_elm == null) {
                var cell = "ctl00_ctl00_CPContent_CPMain_dl_ctrl"+ j +"_TransferPlayer_lblDeadline";
                var selltime_elm = doc.getElementById( cell );
            }

            if (selltime_elm != null ) {
                var selltime = Foxtrick.trim(selltime_elm.innerHTML);
                // Foxtrick.dump ('\n>>>>>' + selltime + '<<<<<\n');
                var ST_date = Foxtrick.util.time.getDateFromText( selltime );
                if (ST_date != null) {
                    var deadline_s = Math.floor( (ST_date.getTime()-Foxtrick.HT_date.getTime()) / 1000); //Sec
                    if (!isNaN(deadline_s) && deadline_s >= 0) {
                        var DeadlineText = Foxtrick.util.time.timeDifferenceToText(deadline_s);
                        selltime_elm.innerHTML +=  '<span class="date smallText" id="ft_deadline" style="margin-left:10px; color:#800000">(' + DeadlineText + ')</span>';
                    }
                }
            }
            j++;
        }
    },

    _PlayerDetailsDeatline : function ( doc ) {
        if ( doc.location.href.search(/Player.aspx/i) < 0 ) return;

        //Check if deadline already set
		var deadline_span = doc.getElementById( "ft_deadline" );
        if  (deadline_span != null ) return;

        var div = doc.getElementById( 'ctl00_ctl00_CPContent_CPMain_updBid' );
        if (div == null ) return;

        var spans = div.getElementsByClassName("alert");
        if (spans.length == 0) return;

        var selltime_elm = spans[0].getElementsByTagName( "p" )[0];

        if (selltime_elm == null) return;
        var selltime_clone = selltime_elm.cloneNode(true);
        if (selltime_clone == null) return;

        var selltimeInner = Foxtrick.trim(selltime_clone.innerHTML);

        var selltime = selltimeInner;

        // suporters check
        var startPos = selltimeInner.search("<a ");

        if(startPos != -1) {
            selltime = selltimeInner.substr(0,startPos);
        }

        selltime = Foxtrick.substr(selltime, Foxtrick.strrpos( selltime, ";")+1, selltime.length);
        // Foxtrick.dump('ST: ' + selltime + '\n');

        var ST_date = Foxtrick.util.time.getDateFromText( selltime );
        if (!ST_date) return;

        var deadline_s = Math.floor( (ST_date.getTime()-Foxtrick.HT_date.getTime()) / 1000); //Sec

        if (!isNaN(deadline_s) && deadline_s >= 0) {
            var DeadlineText = Foxtrick.util.time.timeDifferenceToText (deadline_s);
            selltime_elm.innerHTML +=  '<span class="date smallText" id="ft_deadline" style="margin-left:10px; color:#800000">(' + DeadlineText + ')</span>'
        }
    }
};
