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
        Foxtrick.registerPageHandler('players', this);
    },

    run : function(page, doc) {
    
        var httime = doc.getElementById( "time" ).innerHTML;

        HT_date = this._getDatefromCellHTML( httime );
        if (!HT_date) return;
        
        switch ( page ) {
            case 'transferListSearchResult' :
                
                var spans = doc.getElementsByTagName('span');
                var j = 0;
                for (var i=0; i<spans.length; i++) {
                    cell = "ctl00_CPMain_dl_ctrl" + j + "_TransferPlayer_lblDeadline";
                    var selltime_elm = doc.getElementById( cell );
                    if  (selltime_elm == null ) return;

                    var selltime = selltime_elm.innerHTML;
                    
                    ST_date = this._getDatefromCellHTML( selltime );
                    if (!ST_date) return;
                    
                    var deadline_s = Math.floor( (ST_date.getTime()-HT_date.getTime()) / 1000); //Sec
                    
                    var DeadlineText = this._DeadlineToText (deadline_s);
                    
                    //dump ('\n>>>>>' + DeadlineText + '<<<<<\n');
                    selltime_elm.innerHTML +=  '<br><span style="font-weight:bold; color:#800000">' + DeadlineText + '</span>';
                    j++;
                }
                break;
                
            case 'players' :
                
                var spans = getElementsByClass( "alert", doc );
                if (spans == null) break;
                
                var selltime_elm = spans[1].getElementsByTagName( "p" );
                if (selltime_elm[0] == null) break;
                
                selltime = Foxtrick.trim(selltime_elm[0].innerHTML);
                
                selltime = substr(selltime, strrpos( selltime, ";")+1, selltime.length);
                // dump('ST: ' + selltime + '\n');

                ST_date = this._getDatefromCellHTML( selltime );
                    if (!ST_date) break;
                    
                    var deadline_s = Math.floor( (ST_date.getTime()-HT_date.getTime()) / 1000); //Sec
                    
                    var DeadlineText = this._DeadlineToText (deadline_s);
                    
                    // dump ('\n>>>>>' + DeadlineText + '<<<<<\n');
                    selltime_elm[0].innerHTML +=  '<span style="margin-left:10px; font-weight:bold; color:#800000">(' + DeadlineText + ')</span>';

                break;
        }
    },
	
	change : function( page, doc ) {
	
	},
    
    _getDatefromCellHTML : function( cell ) {
        if (cell == '') return false;
            var SY = cell.substr(6,4);
            var SM = cell.substr(3,2);
            var SD = cell.substr(0,2);
            var SH = cell.substr(11,2);
            var SMn = cell.substr(14,2);
            var SS = '00';
            // dump('\nSELLTIME:' + cell + ':' + SY + '-' + (SM) + '-' + SD + '-' + SH + '-' + SMn + '-' + SS + '!\n');
            var CellDate = new Date(SY, SM-1, SD, SH, SMn, SS);
        return CellDate;
    },
        
    _DeadlineToText : function( deadline_s ) {        
        var DeadlineText = "";
        var Days = 0; var Minutes = 0; var Hours = 0;
        
        if(deadline_s >= 86400)
        {
            Days = Math.floor(deadline_s/86400);
            deadline_s = deadline_s-Days*86400;
            DeadlineText += Days + "d ";
        }
        
        if (( deadline_s >= 3600 ) || ( Days > 0 ))
        {
            Hours = Math.floor(deadline_s/3600);
            deadline_s = deadline_s-Hours*3600;
            DeadlineText += Hours + "h ";
        }    
            
        Minutes = Math.floor(deadline_s/60);
        deadline_s = deadline_s-Minutes*60;
        DeadlineText += Minutes + "m";
        
        return DeadlineText;
    }
};