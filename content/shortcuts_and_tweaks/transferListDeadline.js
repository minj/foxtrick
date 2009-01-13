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
                    try {
                        var cell = "ctl00_CPMain_dl_ctrl" + j + "_TransferPlayer_lblDeadline";
                        var selltime_elm = doc.getElementById( cell );
                        if  (selltime_elm == null ) {
                            // supporters check
                            cell =  "ctl00_CPMain_lstBids_ctr" + j + "_jsonDeadLine";                    
                            selltime_elm = doc.getElementById( cell );
                        }

                        if (selltime_elm != null ) {
                            var selltime = selltime_elm.innerHTML;
                            ST_date = this._getDatefromCellHTML( selltime );
                            if (ST_date != null ) {
                                var deadline_s = Math.floor( (ST_date.getTime()-HT_date.getTime()) / 1000); //Sec
                                var DeadlineText = this._DeadlineToText (deadline_s);
                                //dump ('\n>>>>>' + DeadlineText + '<<<<<\n');
                                selltime_elm.innerHTML +=  '<br><span style="font-weight:bold; color:#800000">' + DeadlineText + '</span>';
                            }
                        }
                    }
                    catch (e) {
                        dump (e);
                    }
                    j++;
                }
                break;
                
            case 'players' :
                
                this._PlayerDetailsDeatline ( doc );
                break;
                
        }
    },
	
	change : function( page, doc ) {
        switch ( page ) {
              
            case 'players' :
                
                this._PlayerDetailsDeatline ( doc );
                break;
                
        }	
	},
    
     _PlayerDetailsDeatline : function ( doc ) {
        
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

        ST_date = this._getDatefromCellHTML( selltime );
        if (!ST_date) return;
            
        var deadline_s = Math.floor( (ST_date.getTime()-HT_date.getTime()) / 1000); //Sec
            
        var DeadlineText = this._DeadlineToText (deadline_s);
            
        // dump ('\n>>>>>' + DeadlineText + '<<<<<\n');
         selltime_elm.innerHTML +=  '<span id="ft_deadline" style="margin-left:10px; font-weight:bold; color:#800000">(' + DeadlineText + ')</span>';
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
            if (Days > 1) 
                DeadlineText += Days + '&nbsp;' + Foxtrickl10n.getString("TransferlistDeadLine.days") + '&nbsp;'
            else
                DeadlineText += Days + '&nbsp;' + Foxtrickl10n.getString("TransferlistDeadLine.day") + '&nbsp;';
        }
        
        if (( deadline_s >= 3600 ) || ( Days > 0 ))
        {
            Hours = Math.floor(deadline_s/3600);
            deadline_s = deadline_s-Hours*3600;
            DeadlineText += Hours + Foxtrickl10n.getString("TransferlistDeadLine.hours") + '&nbsp;';
        }    
            
        Minutes = Math.floor(deadline_s/60);
        deadline_s = deadline_s-Minutes*60;
        DeadlineText += Minutes + Foxtrickl10n.getString("TransferlistDeadLine.minutes");
        
        return DeadlineText;
    }
};