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
    },

    run : function(page, doc) {
    
        var httime = doc.getElementById( "time" ).innerHTML;
        var HY = httime.substr(6,4);
        var HM = httime.substr(3,2);
        var HD = httime.substr(0,2);
        var HH = httime.substr(11,2);
        var HMn = httime.substr(14,2);
        var HS = '00';
        // dump('\nHTTIME:' + httime + ':' + HY + '-' + (HM) + '-' + HD + '-' + HH + '-' + HMn + '-' + HH + '!\n');
        var HT_date = new Date(HY, HM-1, HD, HH, HMn, HS);

        var spans = doc.getElementsByTagName('span');
        var j = 0;
        for (var i=0; i<spans.length; i++) {
            cell = "ctl00_CPMain_dl_ctrl" + j + "_TransferPlayer_lblDeadline";
            var selltime_elm = doc.getElementById( cell );
            if  (selltime_elm == null ) break;

            var selltime = selltime_elm.innerHTML;
            
            var SY = selltime.substr(6,4);
            var SM = selltime.substr(3,2);
            var SD = selltime.substr(0,2);
            var SH = selltime.substr(11,2);
            var SMn = selltime.substr(14,2);
            var SS = '00';
            // dump('\nSELLTIME:' + selltime + ':' + SY + '-' + (SM) + '-' + SD + '-' + SH + '-' + SMn + '-' + SS + '!\n');
            var ST_date = new Date(SY, SM-1, SD, SH, SMn, SS);

            var deadline_s = Math.floor( (ST_date.getTime()-HT_date.getTime()) / 1000); //Sec
            //dump ('\n>>>>>' + deadline_s + '<<<<<\n');
            var DeadlineText = "<br>";
            if(deadline_s >= 86400)
            {
                var Days = Math.floor(deadline_s/86400);
                deadline_s = deadline_s-Days*86400;

                if(Days > 1 )
                {
                    DeadlineText += Days + "d ";
                }
            }

            if(deadline_s >= 3600)
            {
                var Hours = Math.floor(deadline_s/3600);
                deadline_s = deadline_s-Hours*3600;
                DeadlineText += Hours + "h ";
                
            }
            if(deadline_s >= 60)
            {
                var Minutes = Math.floor(deadline_s/60);
                deadline_s = deadline_s-Minutes*60;
                DeadlineText += Minutes + "m ";
            }
            //dump ('\n>>>>>' + DeadlineText + '<<<<<\n');
            selltime_elm.innerHTML +=  '<span style="margin-left:10px; font-weight:bold; color:#800000">' + DeadlineText + '</span>';
            j++;
        }
    },
	
	change : function( page, doc ) {
	
	}
};