/**
 * seasonstats.js
 * Foxtrick add stats to match archive
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickSeasonStats = {
	
    MODULE_NAME : "SeasonStats",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('matchesarchiv','matches'), 
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8",
	LASTEST_CHANGE:"Added season select box",
	CSS:"chrome://foxtrick/content/resources/css/seasonstats.css",
	
	_season:-1,
	
    init : function() {
    },

    run : function( page, doc ) {
	try  {
	
		// ----------------------------- season select box ---------------------------------
	
		// get current season
		if (doc.location.href.search(/\/archive/i)==-1) {
			var as = doc.getElementById('sidebar').getElementsByTagName('a');
			for (var i=0;i<as.length;++i) { 
				if (as[i].href.search(/\/archive/i)!=-1) {
					this._season = as[i].href.match(/season=(\d+)/i)[1];
					return;
				}
			}
			return;
		}
			
		// get range of local seasons
		var selected_season = doc.location.href.match(/season=(\d+)/i)[1];
		var season_diff = this._season - selected_season;	
		
		var selected_local_season = doc.getElementById('mainBody').getElementsByTagName('h2')[0].innerHTML.match(/\d+/i);
		var local_season = parseInt(selected_local_season) + season_diff;
		
		// add season select box
		var selectbox = doc.createElement("select"); 
		selectbox.setAttribute("id","ft_season_selectboxID");
		if (Foxtrick.isStandardLayout(doc)) selectbox.setAttribute("style","float:right; margin-top:20px;");
		else  selectbox.setAttribute("style","float:right");

		
		selectbox.addEventListener('change',this.SelectBox_Select,false);
		this.SelectBox_Select.doc=doc;
		
		s=this._season;
		for (var ls=local_season;ls>0;--ls) {		
			var option = doc.createElement("option");
            option.setAttribute("value",s);
            option.innerHTML=ls;
            selectbox.appendChild(option);
			--s;
        }
		selectbox.value=selected_season;
        doc.getElementById('mainBody').insertBefore(selectbox,doc.getElementById('ctl00_CPMain_ddlMatchType'));        
	    
		
		// ------------------------------ season stats --------------------------------------
		
		var TeamName=FoxtrickHelper.extractTeamName(doc.getElementById('mainWrapper')).substr(0,15).replace(/\W/g,''); 
		
		var sum_matches=new Array(12);
		for (var i = 0; i < sum_matches.length; ++i)
			sum_matches[i] = {'type':"",'num':0,'won':0,'lost':0,'draw':0,'goal0':0,'goal1':0};

		var matchestable = doc.getElementById('mainBody').getElementsByTagName('table')[0];
		for (var i=0;i<matchestable.rows.length;++i) { 
			//dump(TeamName+' '+matchestable.rows[i].cells[2].getElementsByTagName('a')[0].title+' '+matchestable.rows[i].cells[2].getElementsByTagName('a')[0].title.search(TeamName)+'\n');
			var type=0;
			if (matchestable.rows[i].cells[1].getElementsByTagName('img')[0].className=='matchLeague') type=0;
			else if (matchestable.rows[i].cells[1].getElementsByTagName('img')[0].className=='matchFriendly') type=1;
			else if (matchestable.rows[i].cells[1].getElementsByTagName('img')[0].className=='matchCup') type=2;
			else if (matchestable.rows[i].cells[1].getElementsByTagName('img')[0].className=='matchMasters') type=3;
			var ishome = matchestable.rows[i].cells[2].getElementsByTagName('a')[0].title.replace(/\W/g,'').search(TeamName)==0?1:2;
			var iswon = matchestable.rows[i].cells[3].getElementsByTagName('span')[0].className=='won'; 
			var islost = matchestable.rows[i].cells[3].getElementsByTagName('span')[0].className=='lost'; 
			var isdraw = matchestable.rows[i].cells[3].getElementsByTagName('span')[0].className=='draw'; 
			var goals = matchestable.rows[i].cells[3].getElementsByTagName('strong')[0].innerHTML.match(/\d+/g); 
			var goals0=parseInt(goals[0]);
			var goals1=parseInt(goals[1]);
			if (ishome==2) { // away. own goals second
				goals0=parseInt(goals[1]);
				goals1=parseInt(goals[0]);
			}
			sum_matches[type*3]["type"] = matchestable.rows[i].cells[1].getElementsByTagName('img')[0].title ;			
			sum_matches[type*3]["num"]++;
			if (iswon) sum_matches[type*3]["won"]++;
			if (islost) sum_matches[type*3]["lost"]++;
			if (isdraw) sum_matches[type*3]["draw"]++;
			sum_matches[type*3]["goal0"]+=goals0;
			sum_matches[type*3]["goal1"]+=goals1;
						
			sum_matches[type*3+ishome]["num"]++;
			if (iswon) sum_matches[type*3+ishome]["won"]++;
			if (islost) sum_matches[type*3+ishome]["lost"]++;
			if (isdraw) sum_matches[type*3+ishome]["draw"]++;
			sum_matches[type*3+ishome]["goal0"]+=goals0;
			sum_matches[type*3+ishome]["goal1"]+=goals1;
		}
		
		var ownBoxBody = doc.createElement("div");
		var header = Foxtrickl10n.getString("foxtrick.seasonstats.boxheader" );
		var ownBoxId = "foxtrick_seasonstats_box";
		var ownBoxBodyId = "foxtrick_seasonstats_content";
		ownBoxBody.setAttribute( "id", ownBoxBodyId );
                                
		for (var type=0;type<4;++type) {
			if (!sum_matches[type*3]["type"]) continue;
			var head=doc.createElement('strong');
			
			if (type==0) head.innerHTML=Foxtrickl10n.getString("foxtrick.seasonstats.league" );
			else if (type==1) head.innerHTML=Foxtrickl10n.getString("foxtrick.seasonstats.friendly" );
			else if (type==2) head.innerHTML=Foxtrickl10n.getString("foxtrick.seasonstats.cup" );
			else  head.innerHTML=Foxtrickl10n.getString("foxtrick.seasonstats.masters" );
			
			ownBoxBody.appendChild(head);
			var table=doc.createElement('table');
			ownBoxBody.appendChild(table);
			var tbody=doc.createElement('tbody');
			table.appendChild(tbody);

			var tr=doc.createElement('tr');			
			tbody.appendChild(tr);
			var th=doc.createElement('th');
			tr.appendChild(th);
			var th=doc.createElement('th');
			th.setAttribute('class','right ft_seasonstats_td ft_seasonstats_border_left');
			th.innerHTML=Foxtrickl10n.getString("foxtrick.seasonstats.played" )+'&nbsp;';
			tr.appendChild(th);
			var th=doc.createElement('th');
			th.setAttribute('class','right ft_seasonstats_td ft_seasonstats_border_left');
			th.innerHTML=Foxtrickl10n.getString("foxtrick.seasonstats.won" )+'&nbsp;';
			tr.appendChild(th);
			var th=doc.createElement('th');
			th.setAttribute('class','right ft_seasonstats_td');
			th.innerHTML=Foxtrickl10n.getString("foxtrick.seasonstats.draw" )+'&nbsp;';
			tr.appendChild(th);
			var th=doc.createElement('th');
			th.setAttribute('class','right ft_seasonstats_td');
			th.innerHTML=Foxtrickl10n.getString("foxtrick.seasonstats.lost" )+'&nbsp;';
			tr.appendChild(th);
			var th=doc.createElement('th');
			th.setAttribute('class','right ft_seasonstats_td ft_seasonstats_border_left');
			th.innerHTML=Foxtrickl10n.getString("foxtrick.seasonstats.goalplus" )+'&nbsp;';
			tr.appendChild(th);
			var th=doc.createElement('th');
			th.setAttribute('class','right ft_seasonstats_td');
			th.innerHTML=Foxtrickl10n.getString("foxtrick.seasonstats.goalminus" )+'&nbsp;';
			tr.appendChild(th);
			var th=doc.createElement('th');
			th.setAttribute('class','right ft_seasonstats_td');
			th.innerHTML=Foxtrickl10n.getString("foxtrick.seasonstats.goaldiff" )+'&nbsp;';
			tr.appendChild(th);

			for (var k=0;k<3;++k) {
			var tr=doc.createElement('tr');
			tbody.appendChild(tr);
			var td=doc.createElement('td');
			td.setAttribute('class','right ft_seasonstats_td');
			if (k==0) td.innerHTML=Foxtrickl10n.getString("foxtrick.seasonstats.total" );
			else if (k==1) td.innerHTML=Foxtrickl10n.getString("foxtrick.seasonstats.home" );
			else td.innerHTML=Foxtrickl10n.getString("foxtrick.seasonstats.away" );
			td.innerHTML +='&nbsp;'
			tr.appendChild(td);
			var td=doc.createElement('td');
			td.setAttribute('class','right ft_seasonstats_td ft_seasonstats_border_left');
			td.innerHTML=sum_matches[type*3+k]["num"]+'&nbsp;';
			tr.appendChild(td);
			var td=doc.createElement('td');
			td.setAttribute('class','right ft_seasonstats_td ft_seasonstats_border_left');
			td.innerHTML=sum_matches[type*3+k]["won"]+'&nbsp;';
			tr.appendChild(td);
			var td=doc.createElement('td');
			td.setAttribute('class','right ft_seasonstats_td');
			td.innerHTML=sum_matches[type*3+k]["draw"]+'&nbsp;';
			tr.appendChild(td);
			var td=doc.createElement('td');
			td.setAttribute('class','right ft_seasonstats_td');
			td.innerHTML=sum_matches[type*3+k]["lost"]+'&nbsp;';
			tr.appendChild(td);
			var td=doc.createElement('td');
			td.setAttribute('class','right ft_seasonstats_td ft_seasonstats_border_left');
			td.innerHTML=sum_matches[type*3+k]["goal0"]+'&nbsp;';
			tr.appendChild(td);
			var td=doc.createElement('td');
			td.setAttribute('class','right ft_seasonstats_td');
			td.innerHTML=sum_matches[type*3+k]["goal1"]+'&nbsp;';
			tr.appendChild(td);
			var td=doc.createElement('td');
			td.setAttribute('class','right ft_seasonstats_td');
			td.innerHTML=sum_matches[type*3+k]["goal0"]-sum_matches[type*3+k]["goal1"]+'&nbsp;';
			tr.appendChild(td);
			}
			
			var br=doc.createElement('br');
			ownBoxBody.appendChild(br);			
		}
		
		Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "last", "");
			    
	}
	catch (e) {dump("FoxtrickSeasonStats->"+e);}		
	},
	
	change : function( page, doc ) {
	},
	
	SelectBox_Select : function(evt) {
	try {
		var doc=FoxtrickSeasonStats.SelectBox_Select.doc;
		doc.location.href=doc.location.href.replace(/season=\d+/,'season='+evt["target"]["value"]);						
	} catch (e) {dump("FoxtrickTeamSelectBox_Select: "+e+'\n');}
	},		
};

