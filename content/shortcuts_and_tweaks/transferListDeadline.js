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
        Foxtrick.registerPageHandler('transfersTeam', this);
        Foxtrick.registerPageHandler('TransfersPlayer', this);
        Foxtrick.registerPageHandler('matches', this);
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
                this._Player_Joined ( doc );
                this._Player_Bonus (doc);
                break;
                
            case 'transfer' :
                
                this._PlayerListDeatline ( doc, 'div' );
                break;
                
            case 'transfersTeam' :
                this._modifyDates ( doc, true );
                break;
            
            case 'TransfersPlayer' :
                this._modifyDates ( doc, true );
                break;                

            case 'matches' :
                this._modifyDates ( doc );
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
                        var DeadlineText = this._DeadlineToText (deadline_s);
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
                
            var DeadlineText = this._DeadlineToText (deadline_s);
                
            // dump ('\n>>>>>' + DeadlineText + '<<<<<\n');
            if (DeadlineText.search("NaN") == -1)
                selltime_elm.innerHTML +=  '<span class="date smallText" id="ft_deadline" style="margin-left:10px; color:#800000">(' + DeadlineText + ')</span>'
            else dump('  Could not create deadline (NaN)\n'); 
        } catch (e) {
            dump(e);
        }
    },
            

    _Player_Joined  : function ( doc ) {        
        // Player in team since...
        try {
            var joined_elm = getElementsByClass( "shy", doc )[0];
            if (joined_elm == null) return;
            
            joinedtimeInner = Foxtrick.trim(joined_elm.innerHTML);
            
            var reg = /(\d+)(.*?)(\d+)(.*?)(\d+)(.*?)/i;
            var ar = reg.exec(joinedtimeInner);
            
            var joinedtime = ar[0] + '.' + ar[2] + '.' + ar[4] + ' 00.00.01';
            
            joinedtime = substr(joinedtime, strrpos( joinedtime, ";"), joinedtime.length);

            // dump('  Joindate: ' + joinedtime + '\n');
            // dump('  HT Week: ' + this._gregorianToHT(joinedtime) + '\n');

            var ht_week = gregorianToHT(joinedtime);
            
            JT_date = getDatefromCellHTML( joinedtime );
            if (!JT_date) return;
            
            var joined_s = Math.floor( (HT_date.getTime() - JT_date.getTime()) / 1000); //Sec
                
            var JoinedText = this._DeadlineToText (joined_s , true);
                
            if (JoinedText.search("NaN") == -1) {
                part1 = substr(joined_elm.innerHTML, 0, strrpos( joined_elm.innerHTML, ")"));
                part1 = part1.replace('(', '<br><span class="date smallText" id ="ft_since">(');
                joined_elm.innerHTML = part1 + ' '+ ht_week + ', ' + JoinedText + ')</span>';
            }
            else dump('  Could not create jointime (NaN)\n'); 
        } catch (e) {
            dump(e);
        }
    },
        
    _Player_Bonus  : function ( doc ) {        
        // Player in team since...
        try {
            var div = doc.getElementById( 'ctl00_CPMain_pnlplayerInfo' );
            var table_elm = div.getElementsByTagName( "td" );
            if (table_elm.length == 0) return;
            
            for ( var i = 0; i < table_elm.length; i++) {
                var table_inner = Foxtrick.trim(table_elm[i].innerHTML);
                try {
                    if (strrpos( table_inner, "%") > 0 ) {
                        var table_elm_bonus = table_elm[i];
                        break;
                    }
                }
                catch(e) {dump('    >' + e + '\n');}
            }
            if (table_elm_bonus == null) return;
            table_inner = Foxtrick.trim(table_elm_bonus.innerHTML);

            var part = substr(table_inner, 0, table_inner.lastIndexOf("&nbsp;"));

            var part_1_save = part;
            var part_2_save = substr(table_inner, table_inner.lastIndexOf("&nbsp;") + 6, table_inner.length );

            part = Math.floor(parseInt(part.replace('&nbsp;', '')) / 1.2);
            part = ReturnFormatedValue (part, ' ');
                           
            if (part != 'NaN') table_elm_bonus.innerHTML = part_1_save + '&nbsp;<span class="smallText" style="color:#666666;>(' + part + ')</span>&nbsp;' + part_2_save;

        } catch (e) {
            dump('  PlayerBonus: ' + e + '\n');
        }
    },
        
    _DeadlineToText : function( deadline_s, short ) {       
        /*
        Returns the time as DDD days, HHh MMm
        if short, only DDD days will be returned
        */
        var DeadlineText = "";
        var Years = 0; var Days = 0; var Minutes = 0; var Hours = 0;

        if ( Math.floor(deadline_s) < 0 ) 
            return 'NaN';
        
        if(deadline_s >= 86400)
        {
            Days = Math.floor(deadline_s/86400);
            deadline_s = deadline_s-Days*86400;
            if (Days > 1) 
                DeadlineText += Days + '&nbsp;' + Foxtrickl10n.getString("TransferlistDeadLine.days")
            else
                DeadlineText += Days + '&nbsp;' + Foxtrickl10n.getString("TransferlistDeadLine.day");
        }
        if (short) return DeadlineText;
        
        if (DeadlineText != "") DeadlineText += "&nbsp;";
        
        
        if (( deadline_s >= 3600 ) || ( Days > 0 ))
        {
            Hours = Math.floor(deadline_s/3600);
            deadline_s = deadline_s-Hours*3600;
            DeadlineText += Hours + Foxtrickl10n.getString("TransferlistDeadLine.hours") + '&nbsp;';
        }    
            
        Minutes = Math.floor(deadline_s/60);
        deadline_s = deadline_s-Minutes*60;
        DeadlineText += Minutes + Foxtrickl10n.getString("TransferlistDeadLine.minutes");
        
        return DeadlineText
    },
 
    _modifyDates : function ( doc, short ) {
        /*
        Returns HT-Week & Season
        short == true => Date is without time.
        */
        var tds = doc.getElementsByTagName("td");
        for (var i = 0; tds[i] != null; ++i) {
            dt_inner = Foxtrick.trim(tds[i].innerHTML);
            if ( (dt_inner.length <= 10 && short ) || (dt_inner.length <= 16 && !short ) ) {
                // dump (i + ' - ' + dt_inner + '\n' );
                var reg = /^(\d+)(.*?)(\d+)(.*?)(\d{4})(.*?)/g;
                var ar = reg.exec(dt_inner);
            
                if (ar != null) {
                    // dump (i + ' ====> ' + ar + '\n');
                    var td_date = ar[0] + '.' + ar[2] + '.' + ar[4] + ' 00.00.01';
                
                    if (Foxtrick.trim(td_date).match(reg) != null) {
                        tds[i].innerHTML = dt_inner + '&nbsp;' + gregorianToHT(td_date);
                    }
                }
            }
        }
    }
};