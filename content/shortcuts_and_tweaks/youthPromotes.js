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
    


    if ( Math.floor(org_time) < 0 )return 'NaN';
    var joinedBefore = Math.floor(joined / 86400);
    
    var print_D = Math.floor(org_time / 86400);
    //Foxtrick.alert(print_D);
/*
 var asec = 1904-((age*112)+days);// kolik zbyva dni do jeho 17y 0d
 
 
 var bef = joinedBefore+print_D;
 
 
 if (age < 17 && joinedBefore > 111){var pull = 112-days;}
 else if (age < 17 && joinedBefore < 112){var pull = (112-days)+(112-joinedBefore)-2;} 
 else if (age > 16 && joinedBefore > 111){var pull = 0;} 
 else {var pull = (112-joinedBefore);}*/
  
  var nn = (112-joinedBefore)-(1904-((age*112)+days));

  if (nn < 0 && age < 17){var nn = Math.floor((joinedBefore-112)-(1904-((age*112)+days)));}
    if (nn < 0 && age == 15){var nn = Math.floor(1904-((age*112)+days)-(print_D+112));}

  var daysToProm = 1904-((age*112)+days)+nn;
 if (daysToProm < 0 && age > 16){daysToProm_text = "<br /> "+Foxtrickl10n.getString("foxtrick.youthpromotedays.prom_t")+" ";}
 else {daysToProm_text = "<br /> "+Foxtrickl10n.getString('foxtrick.youthpromotedays.prom_d')+" "+daysToProm+" "+Foxtrickl10n.getString("foxtrick.youthpromotedays.days");}
 


return daysToProm_text;
 
//var pull2 = ((age*112)+days+pull)/112;
//pull2 = Math.floor(pull2*100)/100;

    //var pup_y = age+Math.floor((pull+days)/112);
    //var pup_d = Math.round(pull+days);
    
    //if (pup_y > 111){var pup_y = age+1;pup_d=pup_d-112;}
    
    
   // Foxtrick.alert('Mozno preradit:\n'+pup_y+'y and '+pup_d+'d');

    //return pull;

},	

    run : function( page, doc ) {


     

				var allDivs = doc.getElementsByTagName("div");
				

				
				var div = doc.getElementsByClassName('playerInfo')[0];
				var table =	div.getElementsByTagName('table')[0];
					var dateCell = table.getElementsByTagName('td')[5];
					
            var reg = /(\d+)(.*?)(\d+)(.*?)(\d+)(.*?)/i;
            var ar = reg.exec(Foxtrick.substr(dateCell.innerHTML,20,14));

            var joinedDate = ar[0] + '.' + ar[2] + '.' + ar[4] + ' 00.00.01';
/*var row = doc.createElement('tr');

var td1 = doc.createElement('td');
td1.innerHTML = 'Promote:';

var td2 = doc.createElement('td');
td2.innerHTML = 'test2';

row.appendChild(td1);
row.appendChild(td2);

table.appendChild(row);*/
//table.insertBefore(row, table.previousNode);
        //  Foxtrick.alert(joinedDate);
				for(var i = 0; i < allDivs.length; i++) {
				
				if(allDivs[i].className=="byline") {
						

var byline = Foxtrick.trim(allDivs[i].innerHTML);

            var reg = /(\d+)(.*?)(\d+)(.*?)(\d+)(.*?)/i;
            var ar = reg.exec(Foxtrick.substr(byline,30,30));

            var nextbirthday = ar[0] + '.' + ar[2] + '.' + ar[4] + ' 00.00.01';
            
      //Foxtrick.alert(nextbirthday); 
      nextbirthday = Foxtrick.substr(nextbirthday, Foxtrick.strrpos( nextbirthday, ";"), nextbirthday.length);  
//Foxtrick.alert(nextbirthday);
      joinedDate = Foxtrick.substr(joinedDate, Foxtrick.strrpos( joinedDate, ";"), joinedDate.length);         
      //Foxtrick.alert('birthday:\n'+nextbirthday);
      var JT_date = Foxtrick.getDatefromCellHTML(nextbirthday);
      var jtdate = Foxtrick.getDatefromCellHTML(joinedDate);
      //Foxtrick.alert('JT_date\n'+JT_date);
      
var birth_s = Math.floor( (JT_date.getTime() - Foxtrick.HT_date.getTime()) / 1000); //Sec
   var joined_s1 = Math.floor( (Foxtrick.HT_date.getTime() - jtdate.getTime()) / 1000); //Sec
           
           // Foxtrick.alert('birth_s\n'+birth_s);
           //Foxtrick.alert(joined_s1); 
            var JoinedText = 'NaN';
            try {
            
        var reg = /(\d+)(.*?)(\d+)(.*?)(\d+)(.*?)(\d+)(.*?)(\d+)(.*?)/i;
        var ar2 = reg.exec(byline);
          var AgeYears = parseInt(ar2[1]);
          var AgeDays = parseInt(ar2[3]);
        //Foxtrick.alert(AgeYears+'\n'+AgeDays);
            
                JoinedText = this._getPullDate (birth_s,AgeYears,AgeDays,joined_s1);
                allDivs[i].innerHTML += JoinedText;
               /// Foxtrick.alert(JoinedText);
            } 
            catch(ee) {
                dump('  JoinedText >' + ee + '\n');
            }
		
		
		

					}
				}
    
    //var divID = doc.getElementById('ctl00_CPMain_ucYouthPlayerFace_pnlAvatar');
    
    //Foxtrick.alert(divID..innerHTML);
   
    
             
	},
	
	change : function( page, doc ) {
	
	},

};
