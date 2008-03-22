function foxtrick_modifyDates(doc) {

       if (!getShowTweak("gregorianToHt")) return;

       var pageToModify = false;

       // Transfer compare
       if (isTransferCompareUrl(doc.location.href))
               pageToModify = true;

       // Transfer history (either player or team)
       if (isTransferHistoryUrl(doc.location.href))
               pageToModify = true;

       // Memorable moments
       if (isMemorableMomentsUrl(doc.location.href))
               pageToModify = true;

       if (!pageToModify)
               return;

       var tds = doc.getElementsByTagName("td");
       var dateFormat = foxtrick_dateFormats[PrefsBranch.getCharPref("htDateFormat")];

       for (var i = 0; tds[i] != null; ++i) {
           var delim = dateFormat.delim;
           var regexp = new RegExp("^\\d+\\" + delim + "\\d+\\" + delim + "\\d+", "g");
          
           if (tds[i].innerHTML.match(regexp) != null) {
               tds[i].innerHTML = gregorianToHT(tds[i].innerHTML, dateFormat);
           }
       }
}

function gregorianToHT(date, dateFormat) {

       var months = [];
       var years = [];

       months[1] = 0;
       months[2] = 31;
       months[3] = 59;
       months[4] = 90;
       months[5] = 120;
       months[6] = 151;
       months[7] = 181;
       months[8] = 212;
       months[9] = 243;
       months[10] = 273;
       months[11] = 304;
       months[12] = 334;

       years[0] = 833;         // From 2000
       years[1] = 1199;
       years[2] = 1564;
       years[3] = 1929;
       years[4] = 2294;
       years[5] = 2660;
       years[6] = 3025;
       years[7] = 3390;
       years[8] = 3755;
       years[9] = 4121;
       years[10] = 4486;       // = 2010

       var dateParts = date.split(dateFormat.delim);

       var day = parseInt(dateParts[dateFormat.d],10);
       var month = parseInt(dateParts[dateFormat.m],10);
       var year = parseInt(dateParts[dateFormat.y],10);

       var dayCount = years[year-2000] + months[month] + (day-1);

       // leap day
       if (year % 4 == 0 && month > 2)
               ++dayCount;

       // This function wont work for dates before season 11
       if (dayCount < 1120)
               return htDatePrintFormat(date, -1, -1, -1);

       var htDate = htDatePrintFormat(date, (Math.floor(dayCount/(16*7)) + 1),
                      (Math.floor((dayCount%(16*7))/7) + 1), dayCount%7 + 1);

       return htDate;
}


function htDatePrintFormat(originalDate, season, week, day) {

       // Days go from 1 = Saturday to 7 = Friday

       if (season < 11)
               return originalDate + " (old)";

       return originalDate + " (" + week + "/" + season + ")";
}
