/**
 * Transfer list deadline
 * @author spambot
 */

FoxtrickTransferListDeadline = {

    MODULE_NAME : "TransferListDeadline",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    DEFAULT_ENABLED : true,

    init : function() {
        Foxtrick.registerPageHandler('transferListSearchResult', this);
        Foxtrick.registerPageHandler('playerdetail', this);
        Foxtrick.registerPageHandler('transfer', this);
    },

    run : function(page, doc) {

        var httime = doc.getElementById( "time" ).innerHTML;

        HT_date = getDatefromCellHTML( httime );
        if (!HT_date) return;

        switch ( page ) {
            case 'transferListSearchResult' :

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
		HT_date = getDatefromCellHTML( httime );
        if (!HT_date) return;

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
            try {
                var cell = "ctl00_CPMain_lstBids_ctrl"+ j + "_jsonDeadLine";
                var selltime_elm = doc.getElementById( cell );

                if (selltime_elm == null) {
                    var cell = "ctl00_CPMain_dl_ctrl"+ j +"_TransferPlayer_lblDeadline";
                    var selltime_elm = doc.getElementById( cell );
                }

                if (selltime_elm != null ) {
                    var selltime = Foxtrick.trim(selltime_elm.innerHTML);
                    // dump ('\n>>>>>' + selltime + '<<<<<\n');
                    var ST_date = getDatefromCellHTML( selltime );
                    if (ST_date != null ) {
                        var deadline_s = Math.floor( (ST_date.getTime()-HT_date.getTime()) / 1000); //Sec
                        var DeadlineText = TimeDifferenceToText (deadline_s);
                        // dump ('\n>>>>>' + DeadlineText + '<<<<<\n');
                        if (DeadlineText.search("NaN") == -1)
                            selltime_elm.innerHTML +=  '<span class="date smallText" id="ft_deadline" style="margin-left:10px; color:#800000">(' + DeadlineText + ')</span>';
                        else dump('  Could not create deadline (NaN)\n');
                    }
                }
            }
            catch (e) {
                dump (e);
            }
            j++;
        }
    },

    _PlayerDetailsDeatline : function ( doc ) {
        if ( doc.location.href.search(/Player.aspx/i) < 0 ) return;

        try {
            //Check if deadline already set
			var deadline_span = doc.getElementById( "ft_deadline" );
            if  (deadline_span != null ) return;

            var spans = getElementsByClass( "alert", doc );
            if (spans == null) return;

            var selltime_elm = spans[1].getElementsByTagName( "p" )[0];
            if (selltime_elm == null) return;
            var selltime_clone = selltime_elm.cloneNode(true);
            if (selltime_clone == null) return;

            selltimeInner = Foxtrick.trim(selltime_clone.innerHTML);

            var selltime = selltimeInner;

            // suporters check
            var startPos = selltimeInner.search("<a ");

            if(startPos != -1) {
                selltime = selltimeInner.substr(0,startPos);
            }

            selltime = substr(selltime, strrpos( selltime, ";")+1, selltime.length);
            // dump('ST: ' + selltime + '\n');

            ST_date = getDatefromCellHTML( selltime );
            if (!ST_date) return;

            var deadline_s = Math.floor( (ST_date.getTime()-HT_date.getTime()) / 1000); //Sec

            var DeadlineText = TimeDifferenceToText (deadline_s);

            // dump ('\n>>>>>' + DeadlineText + '<<<<<\n');
            if (DeadlineText.search("NaN") == -1)
                selltime_elm.innerHTML +=  '<span class="date smallText" id="ft_deadline" style="margin-left:10px; color:#800000">(' + DeadlineText + ')</span>'
            else dump('  Could not create deadline (NaN)\n');
        } catch (e) {
            dump(e);
        }
    }
};
