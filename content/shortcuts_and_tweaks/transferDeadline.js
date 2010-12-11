/**
 * Transfer list deadline
 * @author spambot
 */

FoxtrickTransferDeadline = {

    MODULE_NAME : "TransferDeadline",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('teamPageGeneral','transferSearchResult','playerdetail','transfer'),

    run : function(page, doc) {
        // Check if deadline already set
        if (doc.getElementsByClassName("ft_deadline").length > 0)
            return;

        if (Foxtrick.isPage(Foxtrick.ht_pages["transferSearchResult"], doc))
            this._PlayerListDeadline ( doc, 'span' );
        else if (Foxtrick.isPage(Foxtrick.ht_pages["playerdetail"], doc))
            this._PlayerDetailsDeadline ( doc );
        else if (Foxtrick.isPage(Foxtrick.ht_pages["transfer"], doc))
            this._PlayerListDeadline ( doc, 'div' );
		else if (Foxtrick.isPage(Foxtrick.ht_pages["teamPageGeneral"], doc))
            this._PlayerListDeadline ( doc, 'div' );
    },

	change : function( page, doc ) {
        if (Foxtrick.isPage(Foxtrick.ht_pages["playerdetail"], doc))
            this._PlayerDetailsDeadline (doc);
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

        var htDate = Foxtrick.util.time.getHtDate(doc);

        var div = doc.getElementById( 'ctl00_ctl00_CPContent_CPMain_updBid' );
        if (!div)
            return;
        var alert = div.getElementsByClassName("alert")[0];
        var selltime_elm = alert.getElementsByTagName("p")[0];

        // remove old deadlines
        var oldDeadline = selltime_elm.getElementsByClassName("ft_deadline");
        for (var i = 0; i < oldDeadline.length; ++i)
            oldDeadline[i].parentNode.removeChild(oldDeadline[i]);
        
        var selltime = Foxtrick.trim(selltime_elm.textContent);

        var dateObj = Foxtrick.util.time.getDateFromText(selltime);
        var deadline_s = Math.floor((dateObj.getTime() - htDate.getTime()) / 1000); //Sec

        if (!isNaN(deadline_s) && deadline_s >= 0) {
            var DeadlineText = Foxtrick.util.time.timeDifferenceToText(deadline_s);
            selltime_elm.innerHTML += '<span class="date smallText ft_deadline" style="margin-left:10px; color:#800000">(' + DeadlineText + ')</span>'
        }
    }
};
