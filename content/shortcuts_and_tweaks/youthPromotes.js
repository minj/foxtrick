/*
 * youthPromotes.js
 * Shows days to promote a youth player
 * @Author:  smates
 */

var FoxtrickYouthPromotes = {
    
    MODULE_NAME : "YouthPromotes",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('YouthPlayer'), 
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8.3",
	LASTEST_CHANGE: "Create a stable version of this function.",

    init : function() {
    },


_getPullDate : function(org_time,age,days,joined) {
    

var birthday = (days*86400)+((age*112)*86400);
    if ( Math.floor(org_time) < 0 )return 'NaN';
    var joinedBefore = joined;//Math.floor(joined / 86400); //joined before x days ago
    
    //var print_D = Math.floor(org_time / 86400); //days to 16y 111d

    var plr_y = age;
    var plr_d = days;
    var days_in_team = joinedBefore;
    
    
    for (var i=0; i < 559; i++){
    days_in_team++;
    plr_d++;
    
    if (plr_d == 112)
    {
     plr_d=0;plr_y++;
    }
    
    if (days_in_team > 111 && plr_y > 16)
    {
     break;
    }
    
    }
    var daysToProm = (((plr_y*112)+plr_d)-((age*112)+days))-1;
    
   var daysToProm_text='';
  
 if (daysToProm <= 0) { 
 daysToProm_text = "<br /> "+Foxtrickl10n.getString("foxtrick.youthpromotedays.prom_t")+" ";
 }
 else {
 daysToProm_text = "<br /> "+Foxtrickl10n.getString('foxtrick.youthpromotedays.prom_d')+" "+daysToProm+" "+Foxtrickl10n.getString("foxtrick.youthpromotedays.days");
 }

return daysToProm_text;

},	

    run : function( page, doc ) {

				var allDivs = doc.getElementsByTagName("div");
				
				var div = doc.getElementsByClassName('playerInfo')[0];
				var table =	div.getElementsByTagName('table')[0];
					var dateCell = table.getElementsByTagName('td')[5];
					
            var reg = /(\d+)(.*?)(\d+)(.*?)(\d+)(.*?)/i;
            var ar = reg.exec(Foxtrick.substr(dateCell.innerHTML,20,14));

            var joinedDate = ar[0] + '.' + ar[2] + '.' + ar[4] + ' 00.00.01';

				for(var i = 0; i < allDivs.length; i++) {
				
				if(allDivs[i].className=="byline") {
						

			var byline = Foxtrick.trim(allDivs[i].innerHTML);

            var reg = /(\d+)(.*?)(\d+)(.*?)(\d+)(.*?)/i;
            var ar = reg.exec(Foxtrick.substr(byline,30,30));

            var nextbirthday = ar[0] + '.' + ar[2] + '.' + ar[4] + ' 00.00.01';
            
			//var playerInfo=playerInfo
			var dateCellnums=dateCell.innerHTML.match(/(\d+)/gi);
			//dump(dateCellnums[dateCellnums.length-1]+'\n');
			var daysinclub=dateCellnums[dateCellnums.length-1];
			
      nextbirthday = Foxtrick.substr(nextbirthday, Foxtrick.strrpos( nextbirthday, ";"), nextbirthday.length);  

      joinedDate = Foxtrick.substr(joinedDate, Foxtrick.strrpos( joinedDate, ";"), joinedDate.length);         
      
      var JT_date = Foxtrick.getDatefromCellHTML(nextbirthday);
      var jtdate = Foxtrick.getDatefromCellHTML(joinedDate);

      
		var birth_s = Math.floor( (JT_date.getTime() - Foxtrick.HT_date.getTime()) / 1000); //Sec
		var joined_s1 = Math.floor( (Foxtrick.HT_date.getTime() - jtdate.getTime()) / 1000); //Sec

        var JoinedText = 'NaN';
        try {
            
        var reg = /(\d+)(.*?)(\d+)(.*?)(\d+)(.*?)(\d+)(.*?)(\d+)(.*?)/i;
        var ar2 = reg.exec(byline);
          var AgeYears = parseInt(ar2[1]);
          var AgeDays = parseInt(ar2[3]);

            
                //JoinedText = this._getPullDate (birth_s,AgeYears,AgeDays,joined_s1);
				JoinedText = this._getPullDate (birth_s,AgeYears,AgeDays,daysinclub);
				
                allDivs[i].innerHTML += JoinedText;
 
            } 
            catch(ee) {
                dump('  JoinedText >' + ee + '\n');
            }

					}
				}
           
	},
	
	change : function( page, doc ) {
	
	},

};
