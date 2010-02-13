/**
 * Formates the match report.
 *  * @author spambot
 */

FoxtrickMatchReportFormat = {
	MODULE_NAME : "MatchReportFormat",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : new Array('match','teamPageAny','myhattrick'), 
	ONPAGEPREF_PAGE : 'match', 
    DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.5.0.3",
	LATEST_CHANGE:"OwnYouthteam detection included",	
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : new Array( "#5555FF", //Text My team name     0
											 "#9F0202",  //Text Home team name   1
                                             "#16029F",  //Text Away team name   2
                                             "#E3E9FF",  //BG My Team            3
                                             "#FFE8E8",  //BG Home               4
                                             "#E0EFE0",  //BG Away               5
                                             "0",        //borders_normal        6
                                             "0",        //borders_goal          7
                                             "#9DCF9B",  //border_color_non_goal 8
                                             "#AAAAFF",  //border_color_goal my  9
                                             "#9F0202",      //border_color_goal home 10
                                             "#5555FF",     //border_color_goal away 11
                                             "#F5F5F5",  //normal text 12
                                             "#E0E0E0"   //helf time text 13
										),
	OPTIONS : new Array("Text_My_Team", "Text_Home", "Text_Away", "BG_My_Team", "BG_Home", "BG_Away", "border_width_normal", "border_width_goal", "border_color_non_goal", "border_color_goal_my", "border_color_goal_home", "border_color_goal_away", "normaltext", "half_time"),

    UNKNOWN_COLOUR : "#F0F0F0",

	NEW_AFTER_VERSION: "0.4.8.2",
	LATEST_CHANGE:"some format of match report for better reading",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
 	//OPTIONS : new Array("DefaultShow"),
	OwnYouthTeamId: null,
	
	init : function() {
    },

  
    run : function( page, doc ) {
		// get first youthteam id, assume its your own
		if (page=='teamPageAny')  {
			if  (this.OwnYouthTeamId==null) this.OwnYouthTeamId = FoxtrickHelper.findYouthTeamId(doc.getElementById('ctl00_pnlSubMenu'));
			return;
		}
        if (page=='myhattrick') {
			this.OwnYouthTeamId = null;
			return;
		}

		var isarchivedmatch = (doc.getElementById("ctl00_CPMain_lblMatchInfo")==null);
		if (!isarchivedmatch) return;

		var isyouth=false;
		var as = doc.getElementById("mainBody").getElementsByTagName('a');
		for (var i=0;i<as.length;i++) {
			if (as[i].href.search(/YouthArenaID/i)!=-1) {isyouth=true;break;}
			else if (as[i].href.search(/ArenaID/i)!=-1) {isyouth=false;break;}
		}

        var div = doc.getElementById('mainBody');
        var div_check = Foxtrick.getElementsByClass('ft_mR_format', div);
        if  (div_check.length > 0) return;

        Foxtrick.addJavaScript(doc, Foxtrick.ResourcePath+"resources/js/MatchReport.js");
        
        //Retrieve teams id
		var myTeamId=FoxtrickHelper.findTeamId(doc.getElementById('teamLinks'));
		if (isyouth) myTeamId = this.OwnYouthTeamId;
		var table = doc.getElementById('mainBody').getElementsByTagName('table')[0];
		if (!table) return;  // match not finished
		var HomeTeamId=FoxtrickHelper.findTeamId(table.rows[0].cells[1]);
		var AwayTeamId=FoxtrickHelper.findTeamId(table.rows[0].cells[2]);

		 Foxtrick.dump ('ownteam: '+myTeamId+' isyouth:'+isyouth+'\n');
		 Foxtrick.dump ('HomeTeamId: '+HomeTeamId+'\n');
		 Foxtrick.dump ('AwayTeamId: '+AwayTeamId+'\n');

        var headder = doc.getElementsByTagName('h1')[0].innerHTML;
        
        headder=Foxtrick.trim(headder);
        var start = Foxtrick.strrpos(headder, '<span>(') +7;
        var end = Foxtrick.strrpos(headder, ')</span>');

        var gameid = headder.substr(start, end-start);

		//Retrieve style parameters
       var txt_col_my = this._getPrefs( 0 );
         var txt_col_hm = this._getPrefs( 1 );
         var txt_col_aw = this._getPrefs( 2 );
       var bg_col_my = this._getPrefs( 3 );
         var bg_col_hm = this._getPrefs( 4 );
         var bg_col_aw = this._getPrefs( 5 );
         var borders_normal = this._getPrefs( 6 );
         var borders_goal = this._getPrefs( 7 );
         var border_color = this._getPrefs( 8 );
       var border_color_my = this._getPrefs( 9 );
         var border_color_hm = this._getPrefs( 10 );
         var border_color_aw = this._getPrefs( 11 );
         var text_normal = this._getPrefs( 12 );
         var text_dark = this._getPrefs( 13 );

		 var youthstr='';
		 if (isyouth) youthstr='&isYouth=True';
        //Replace myTeam colour
		if (HomeTeamId == myTeamId) {
            bg_col_hm = bg_col_my;
            border_color_hm = border_color_my;
            txt_col_hm = txt_col_my;
            table.rows[0].cells[1].innerHTML = '<a style="color:' + txt_col_my + ';" href="/Club/Matches/MatchLineup.aspx?MatchID=' + gameid + '&TeamID=' + HomeTeamId + youthstr + '">' + table.rows[0].cells[1].textContent +'</a>';
            table.rows[0].cells[2].innerHTML = '<a style="color:' + txt_col_aw + ';" href="/Club/Matches/MatchLineup.aspx?MatchID=' + gameid + '&TeamID=' + AwayTeamId + youthstr + '">' + table.rows[0].cells[2].textContent +'</a>';
        }
		else if (AwayTeamId == myTeamId) {
            bg_col_aw = bg_col_my;
            border_color_aw = border_color_my;
            txt_col_aw = txt_col_my;
            table.rows[0].cells[1].innerHTML = '<a style="color:' + txt_col_hm + ';" href="/Club/Matches/MatchLineup.aspx?MatchID=' + gameid + '&TeamID=' + HomeTeamId + youthstr + '">' + table.rows[0].cells[1].textContent +'</a>';
            table.rows[0].cells[2].innerHTML = '<a style="color:' + txt_col_my + ';" href="/Club/Matches/MatchLineup.aspx?MatchID=' + gameid + '&TeamID=' + AwayTeamId + youthstr + '">' + table.rows[0].cells[2].textContent +'</a>';
        }

		// color ratings
		var head = doc.getElementsByTagName("head")[0];
        var style = doc.createElement("style");
        style.setAttribute("type", "text/css");
		var zaw =
			'#aspnetForm[action*="Match.aspx?matchID="] div.mainBox td+td {'
			+'background:'+bg_col_hm+';border-bottom:1px solid '+border_color_hm+';border-collapse:separate;}'
			+'#aspnetForm[action*="Match.aspx?matchID="] div.mainBox td+td+td {'
			+'background:'+bg_col_aw+';border-bottom:1px solid '+border_color_aw+';border-collapse:separate;}'
			+'#aspnetForm[action*="Match.aspx?matchID="] div.mainBox td {padding-left:2px;}';
		style.appendChild(doc.createTextNode(zaw));
		//head.appendChild(style);
        //Foxtrick.dump(zaw+'\n');
        
        var links = div.getElementsByTagName('a');
        var supporter = false;
        for (var i=0; i < links.length; i++) {
//            Foxtrick.dump('i:' + i + ':' + links[i].href + ': '+ supporter + '\n' );
            if (links[i].href.search('Book') > 0) {
                supporter = true;
                break;
            }
        }

        var div_inner = Foxtrick.getElementsByClass('', div)[3];
        if (!supporter) div_inner = Foxtrick.getElementsByClass('', div)[2];
        // Foxtrick.dump(' >'+ div_inner.innerHTML + ' < \n');
        var start = div_inner.innerHTML.indexOf('<br><br>');
        var end = div_inner.innerHTML.indexOf('<div class="separator">');

        
        var part = new Array('','','');
        part[0] = div_inner.innerHTML.substr(0, start);

        part[1] = div_inner.innerHTML.substr(start, end-start);
        var dummy = part[1].split('<br><br>');
        // Foxtrick.alert('ft: '+ dummy[1]);

        part[0] += '' + dummy[0] + '<br><br>' + dummy[1] + '<br>';
        part[1] = '';
        for (var i = 2; i< dummy.length; i++) {
            part[1] += dummy[i] + '<br><br>';
        }


        part[2] = div_inner.innerHTML.substr(end, div_inner.innerHTML.length-end );
        // Foxtrick.dump('start[' + start + '|' + end + ']');
        // Foxtrick.dump(part[1]);
        part[1] = this.nl2br(part[1]);

        var search = new Array(
//            /\=(\d+)/g,
            /\-(\d{1,3})/g,
            /\s(\d{1,3})/g,
            /(\s{5,})/g,
            /\<br \/\>br\<br \/\>br/g
            // /\<br\>(.{5,})\<br\>/i
            );
        var replace = new Array(
//            "=$1&formatted",
            "-<span class='ft_mR_format' style='font-weight:bold;color:black'>$1</span>",
            "<span class='ft_mR_format' style='font-weight:bold;color:black'> $1</span>",
            "br",
            "<br>\n"
            // "<div>$1</div>"
            );
        
        part[0] = part[0].replace(/ (\d{1,2})\-(\d{1,2})\-(\d{1,2})\./g," <span class='ft_mR_format' style='font-weight:bold;color:black'>$1</span>-<span class='ft_mR_format' style='font-weight:bold;color:black'>$2</span>-<span class='ft_mR_format' style='font-weight:bold;color:black'>$3</span>.");
        part[0] = part[0].replace(/ (\d{1,2})\-(\d{1,2})\-(\d{1,2})\ /g," <span class='ft_mR_format' style='font-weight:bold;color:black'>$1</span>-<span class='ft_mR_format' style='font-weight:bold;color:black'>$2</span>-<span class='ft_mR_format' style='font-weight:bold;color:black'>$3</span> ");
        part[0] = part[0].replace(/ (\d{1,2})\-(\d{1,2})\-(\d{1,2})\-/g," <span class='ft_mR_format' style='font-weight:bold;color:black'>$1</span>-<span class='ft_mR_format' style='font-weight:bold;color:black'>$2</span>-<span class='ft_mR_format' style='font-weight:bold;color:black'>$3</span>-");
		part[0] = part[0].replace(/ (\d{1,2})\-(\d{1,2})\-(\d{1,2})\,/g," <span class='ft_mR_format' style='font-weight:bold;color:black'>$1</span>-<span class='ft_mR_format' style='font-weight:bold;color:black'>$2</span>-<span class='ft_mR_format' style='font-weight:bold;color:black'>$3</span>,");		
        //Foxtrick.dump(Foxtrick.var_dump(part[1]));
        part[1] = part[1].replace(/(\d{1,2})\!\ Gäste\ (\d{1,2})/g,"$1 - $2"); //ITALIAN LA's work...
        part[1] = part[1].replace(/(\d{1,2})\ a\ (\d{1,2})/g,"$1 - $2"); //ITALIAN LA's work...
        part[1] = part[1].replace(/(\d{1,2}):(\d{1,2})/g,"$1 - $2"); //CESTINA LA's work...		
        part[1] = part[1].replace(/(\d{1,2})\ [\u043F][\u0440][\u0435][\u043C][\u0430]\ (\d{1,2})/g,"$1 - $2"); //SERBIAN LA's work...
        //Foxtrick.dump(Foxtrick.var_dump(part[1]));
        for (var i = 0; i<search.length; i++) {
            part[1] = part[1].replace(search[i],replace[i]);
        }

        dummy = (part[0] + part[1]).split('\n');

        part[1]= '';
        var stage = 0;
        var fulltext = 0;
        var marg = '';
        var bg = '';
        var padd = '';
        var next = 0;
        var player = false;
        for (var i=0; i<dummy.length;i++) {
            marg='margin-top:10px;'
            padd='padding:2px; border:' + borders_normal+ 'px solid ' + border_color + '; ';
            if (i%2 ==1) {bg = text_normal + '; ';} else {bg = text_normal + '; ';}
            dummy[i] =Foxtrick.trim(dummy[i]);
            if  (dummy[i] == '<br>') dummy[i] = '';
            if ( (!(dummy[i].indexOf('<br><br>')<0) && fulltext > 2) || (i > dummy.length-3)) {
                if (dummy[i].indexOf('/Players/')<0) bg = text_dark + '; ';
                marg = 'margin-top:10px; margin-bottom:30px; ';
                if (dummy[i].indexOf('/Players/')>0) marg = 'margin-top:30px; margin-bottom:10px; ';
            }
            dummy[i] = dummy[i].replace(/\<br\>/g, '');
            if (dummy[i] != '') {
                //Foxtrick.dump(i + ' [' + dummy[i] + ']\n');
                if (dummy[i].split(' - ').length == 2 && stage == 0) { //headder
                    // Foxtrick.dump('TEAMS FOUND\n');
                    var names = dummy[i].split(' - ');
                    var team1 = names[0].split('  ')[0];
                    var team2 = names[1].split('  ')[1];
                    stage = 1;
                    //Foxtrick.dump('TEAMS [' + team1 + '|' + team2 + ']\n');
                }
                if (stage==1 && dummy[i].indexOf('<span>(')!=-1) {
                    // Foxtrick.dump('MATCHID\n');
                    dummy[i] = dummy[i].replace(/\<span\>\(/,'<span> (');
                }
                if (dummy[i].indexOf('/Arena/') != -1) stage +=1;

                if (stage>1) { //full report
                    if (dummy[i].indexOf(team1) > -1 && !(dummy[i].indexOf('/Arena/') > -1)) {
                        fulltext++;
                        dummy[i] = dummy[i].replace(team1 + ' ', '<span "style="font-weight:bold; color:'+ txt_col_hm +'">' + team1 + ' </span>');
                        dummy[i] = dummy[i].replace(' ' + team1, '<span style="font-weight:bold; color:'+ txt_col_hm +'"> ' + team1 + '</span>');
                        if (fulltext <= 2) bg= text_dark + '; ';
                    }
                    if (dummy[i].indexOf(team2) > -1 && !(dummy[i].indexOf('/Arena/') > -1)) {
                        fulltext++;
                        dummy[i] = dummy[i].replace(team2 + ' ', '<span style="font-weight:bold; color:'+ txt_col_aw +'">' + team2 + ' </span>');
                        dummy[i] = dummy[i].replace(' ' + team2, '<span style="font-weight:bold; color:'+ txt_col_aw +'"> ' + team2 + '</span>');
                        if (fulltext <= 2) {
                            bg= text_dark + '; ';
                            next = i+2;
                            //Foxtrick.dump('>>>' + next + '\n');
                        }
                    }
                    if (next == i) marg = 'margin-top:10px; margin-bottom:40px; '

                    part[1] += '<div id="ft_mR_div_' + i + '" style="'+ marg+' background:' + bg + padd +'">' + dummy[i] + '</div>\n\n';
                }
                else part[1] += dummy[i] + '\n\n';
            }
            // else Foxtrick.dump(i + ' DROPED ' + dummy[i] + ']\n');
        }
        div_inner.innerHTML = part[1] + part[2];

        var standing = new Array(0,0);
        var reg = /\ (\d{1,2})\-(\d{1,2})(.*?)/i;
        var divs = div.getElementsByTagName('div');
        
        if (!isyouth) var scoreboard = doc.getElementById('sidebar').getElementsByTagName('table')[2];
        else var scoreboard = doc.getElementById('sidebar').getElementsByTagName('table')[1];
        
        
        //scoreboard.parentNode.setAttribute('style', '-moz-border-radius: 5px; -webkit-border-radius: 5px; border: 1px solid #000; padding: 10px; padding:2px;width:184px;z-Index:1000;background-color:white;position:absolute;top:'+scoreboard.parentNode.offsetTop+'px; left:'+scoreboard.parentNode.offsetLeft+'px;');
        scoreboard.parentNode.id = 'scoreboard';
        //scoreboard.parentNode.onmousedown = "startDrag(this)";
        var myTable = new Array();
        
        var tblbody = scoreboard.tBodies[0];
            for (var ti=0; ti<tblbody.rows.length; ti++) {
                if (tblbody.rows[ti].cells[2]) {
                    var tbldummy = new Array(
                        Foxtrick.trim(tblbody.rows[ti].cells[0].innerHTML),
                        Foxtrick.trim(tblbody.rows[ti].cells[1].innerHTML),
                        Foxtrick.trim(tblbody.rows[ti].cells[2].innerHTML)
                    );
                    myTable.push(tbldummy);
                }
            }
        
        myTable = myTable.sort(this._mySort);

        try{
            while(tblbody.rows.length>0) {
                tblbody.deleteRow(0);
            }
                var last_min = 200;
                for (var ti = (myTable.length-1); ti >= 0; ti--) {
                    if (true) {
                    
                      var minute = parseInt(myTable[ti][2]);
                      var line = ((last_min > 45 && minute <= 45) || (last_min > 90 && minute <= 90) || (last_min > 105 && minute <= 105));
                      if (line) {
                        if (tblbody.rows.length > 0){
                            var TR = tblbody.insertRow(0);                        
                            var TD1 = doc.createElement("td");
                            TD1.setAttribute('colspan', 3);
                            TD1.className = 'center';
                            TD1.innerHTML= '<div style="height: 3px; background-image:url(Img.axd?res=Matches&amp;img=separator.gif); background-repeat: repeat-x;"></div>';
                            TR.appendChild(TD1);
                        }
                        last_min = minute;
                      }
                      var TR = tblbody.insertRow(0);
                      var TD1 = doc.createElement("td");
                      if(myTable[ti][0].search('gif') > -1) {
                        var dummy_txt = doc.createElement("div")
                        //dummy_txt = myTable[ti][1].split('playerId=')[1].split("title=\"")[1].split("\">")[0];
                        //Foxtrick.dump('\n' + dummy_txt + '\n');
                        //TD1.innerHTML= '<span style="cursor:pointer; white-space:nowrap;" onclick=gotoEvent(\''+ (dummy_txt) +'\',' + parseInt(myTable[ti][2]) + ')>' + myTable[ti][0] + '</span>';
                        TD1.innerHTML= '<span style="cursor:pointer; white-space:nowrap;" onclick=gotoEvent(' + minute + ')>' + myTable[ti][0] + '</span>';
                      } else {
                        TD1.innerHTML= myTable[ti][0];}
                      TD1.className = 'center';
                      
                      var TD2 = doc.createElement("td");
                      TD2.innerHTML= myTable[ti][1];
                      var TD3 = doc.createElement("td");
                      TD3.innerHTML= myTable[ti][2];

                      TR.appendChild(TD1);
                      TR.appendChild(TD2);
                      TR.appendChild(TD3);
                      
                      var TR = tblbody.insertRow(0);
                      
                      var TD1 = doc.createElement("td");
                      TD1.innerHTML= '';
                      TD1.setAttribute('style', 'padding:1px;');
                      
                      TR.appendChild(TD1);
                      
                      
                      //tblbody.rows[ti].cells[0].className = 'center';
                    }
                }
        } catch(tableerror) {Foxtrick.dump(tableerror);}
        //Foxtrick.dump(scoreboard.innerHTML);
        Foxtrick.dump('<b>BEGIN GOALs</b>\n');
        for (var i=0; i < divs.length; i++) {
            // Foxtrick.dump(i + ': ' + divs[i].textContent + '\n\n');
            
            var text = divs[i].textContent;
            var toreplace = /\ \-\ /g;
            text = text.replace(/(\d{1,2})\ -\ (\d{1,2})/g,"$1-$2");
            //text = text.replace(toreplace, '-');
            //Foxtrick.dump( i + ': ' + text + '\n');
            var score = reg.exec(text);
            
            if (divs[i].innerHTML.search(team1) > -1) start_g = 6; else start_g = 7;
            if (score && i > start_g) {
                Foxtrick.dump('- detected @' + divs[i].id + ' [' + score + '] old: [' + standing + ']\n');
                if (score[1] > standing[0]) {
                    standing[0]++;
                    divs[i].style.border = borders_goal+ 'px solid ' + border_color_hm;
                    // Foxtrick.dump (borders_goal+ 'px solid ' + border_color_hm  + ';\n');
					divs[i].style.background = bg_col_hm;

                    var scorerep = standing[0] + '-' + standing[1];
                    scoreboard.innerHTML = scoreboard.innerHTML.replace(scorerep,'<span onclick="gotoElmentID(\''+divs[i].id+'\');" style="cursor:pointer; white-space:nowrap;"><b>'+standing[0]+'</b>&nbsp;-&nbsp;'+standing[1]+'</span>');
                    Foxtrick.dump('  GOAL for TEAM 1\n');
                }
                else if (score[2] > standing[1]) {
                    standing[1]++;
                    divs[i].style.border = borders_goal+ 'px solid ' + border_color_aw;
                    // Foxtrick.dump (borders_goal+ 'px solid ' + border_color_aw  + ';\n');
					divs[i].style.background = bg_col_aw;
                    
                    var scorerep = standing[0] + '-' + standing[1];
                    scoreboard.innerHTML = scoreboard.innerHTML.replace(scorerep,'<span onclick="gotoElmentID(\''+divs[i].id+'\');" style="cursor:pointer; white-space:nowrap;">'+standing[0]+'&nbsp;-&nbsp;<b>'+standing[1]+'</b></span>');
                    Foxtrick.dump('  GOAL for TEAM 2\n');
                }
                else Foxtrick.dump('  NO GOAL\n');
            }

        }
        Foxtrick.dump('<b>END OF GOALs</b>\n');
        var headder = doc.getElementsByTagName('h1')[0];
        headder.setAttribute( 'style', 'color:black');
        headder.innerHTML = headder.innerHTML.replace(team1, '<span style="font-weight:bold; font-size:1em; color:'+ txt_col_hm +'">' + team1 + '</span>');
        headder.innerHTML = headder.innerHTML.replace(team2, '<span style="font-weight:bold; font-size:1em; color:'+ txt_col_aw +'">' + team2 + '</span>');
        
        var sidebar = doc.getElementById('sidebar');
        var links = sidebar.getElementsByTagName('a');
        for (var i=0; i < links.length; i++) {
//            Foxtrick.dump('i:' + i + ':' + links[i].href + ': '+ supporter + '\n' );
            if (links[i].href.search('TeamID=' + HomeTeamId) > 0) {
                links[i].setAttribute('style', 'color:' + txt_col_hm);
            }
            if (links[i].href.search('TeamID=' + AwayTeamId) > 0) {
                links[i].setAttribute('style', 'color:' + txt_col_aw);
            }            
        }

    },

	change : function( page, doc ) {
        var div_check = Foxtrick.getElementsByClass('ft_mR_format', doc);
        if  (div_check.length > 0) return;
    },
    nl2br : function(text) {
        text = escape(text);
		var re_nlchar='';
        if(text.indexOf('%0D%0A') > -1){
            re_nlchar = /%0D%0A/g ;
        }else if(text.indexOf('%0A') > -1){
            re_nlchar = /%0A/g ;
        }else if(text.indexOf('%0D') > -1){
            re_nlchar = /%0D/g ;
        }
        return unescape( text.replace(re_nlchar,'<br />') );
    },

    _getPrefs : function( value ) {
        var dummy = '';

        if (Foxtrick.isModuleFeatureEnabled( this, this.OPTIONS[value])) {
            dummy = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + this.OPTIONS[value] + '_text');
        }
        if (!dummy) dummy = this.OPTION_TEXTS_DEFAULT_VALUES[value];        
        // Foxtrick.dump('Pref_[' + value + '] - [' + dummy + '] "' + this.OPTIONS[value] + '" returned\n');
        return dummy;
    },
    
    _mySort : function(a, b) {
        var tmp1 = parseInt( a[2] );
        var tmp2 = parseInt( b[2] );
        return tmp1 > tmp2 ? 1 :
            tmp1 < tmp2 ? -1 :
            a[2] > b[2] ? 1 :
            a[2] < b[2] ? -1 :
            0;
    }
};