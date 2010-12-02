/**
 * Transfer list deadline
 * @author spambot
 */

FoxtrickTransferDeadline = {

    MODULE_NAME : "TransferDeadline",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('transferSearchResult','playerdetail','transfer'),

    run : function(page, doc) {
        switch (page) {
            case 'transferSearchResult' :
                this._PlayerListDeadline ( doc, 'span' );
                break;

            case 'playerdetail' :
                this._PlayerDetailsDeadline ( doc );
                break;

            case 'transfer' :
                this._PlayerListDeadline ( doc, 'div' );
                break;
        }
    },

	change : function( page, doc ) {
        switch ( page ) {
            case 'playerdetail' :
                this._PlayerDetailsDeadline ( doc );
                break;
        }
	},

    _PlayerListDeadline : function (doc, element) {
        var htDate = Foxtrick.util.time.getHtDate(doc);
        var ended = false;
        for (var i = 0; !ended; ++i) {
            var cell = doc.getElementById("ctl00_ctl00_CPContent_CPMain_lstBids_ctrl"+ i + "_jsonDeadLine")
                || doc.getElementById("ctl00_ctl00_CPContent_CPMain_dl_ctrl"+ i +"_TransferPlayer_lblDeadline");
            ended = !cell;

            if (!ended) {
                var deadline = cell.textContent;
                var dateObj = Foxtrick.util.time.getDateFromText(deadline);
                if (dateObj) {
                    var deadline_s = Math.floor((dateObj.getTime() - htDate.getTime()) / 1000); //Sec
                    if (!isNaN(deadline_s) && deadline_s >= 0) {
                        var DeadlineText = Foxtrick.util.time.timeDifferenceToText(deadline_s);
                        cell.innerHTML += '<span class="date smallText ft_deadline" style="margin-left:10px; color:#800000">(' + DeadlineText + ')</span>';
                    }
                }
            }
        }
    },

    _PlayerDetailsDeadline : function ( doc ) {
        if ( doc.location.href.search(/Player.aspx/i) < 0 ) return;

        // Check if deadline already set
		var deadline_span = doc.getElementsByClassName("ft_deadline");
        if (deadline_span.length > 0)
            return;

        var htDate = Foxtrick.util.time.getHtDate(doc);

        var div = doc.getElementById( 'ctl00_ctl00_CPContent_CPMain_updBid' );
        var spans = div.getElementsByClassName("alert");
        var selltime_elm = spans[0].getElementsByTagName("p")[0];
        var selltime_clone = selltime_elm.cloneNode(true);

        var selltimeInner = Foxtrick.trim(selltime_clone.innerHTML);

        var selltime = selltimeInner;

        // suporters check
        var startPos = selltimeInner.search("<a ");

        if(startPos != -1) {
            selltime = selltimeInner.substr(0,startPos);
        }

        selltime = Foxtrick.substr(selltime, Foxtrick.strrpos( selltime, ";")+1, selltime.length);
        // Foxtrick.dump('ST: ' + selltime + '\n');

        var dateObj = Foxtrick.util.time.getDateFromText(selltime);
        var deadline_s = Math.floor((dateObj.getTime() - htDate.getTime()) / 1000); //Sec

        if (!isNaN(deadline_s) && deadline_s >= 0) {
            var DeadlineText = Foxtrick.util.time.timeDifferenceToText(deadline_s);
            selltime_elm.innerHTML += '<span class="date smallText ft_deadline" style="margin-left:10px; color:#800000">(' + DeadlineText + ')</span>'
        }
    }
};
