/*
 * time.js
 * Utilities for date and time
 */

if (!Foxtrick) Foxtrick = {};
if (!Foxtrick.util) Foxtrick.util = {};

Foxtrick.util.time = {
	gregorianToHT : function(date, weekdayOffset) {
		/*
			Returns HT Week and Season like (15/37)
			date can be like dd.mm.yyyyy or d.m.yy or dd/mm/yy
			separator or leading zero is irrelevant
		*/
		if (date == '') return false;
		date +=' ';
		weekdayOffset = parseInt(weekdayOffset) || 0;
		var reg = /(\d{1,4})(.*?)(\d{1,2})(.*?)(\d{1,4})(.*?)(\d+)(.*?)(\d+)(.*?)/i;
		var ar = reg.exec(date);
		var months = [];
		var years = [];

		months[1] = 0;
		months[2] = months[1] + 31;
		months[3] = months[2] + 28;
		months[4] = months[3] + 31;
		months[5] = months[4] + 30;
		months[6] = months[5] + 31;
		months[7] = months[6] + 30;
		months[8] = months[7] + 31;
		months[9] = months[8] + 31;
		months[10] = months[9] + 30;
		months[11] = months[10] + 31;
		months[12] = months[11] + 30;

		// Check http://www.hattrick.org/Club/History/Default.aspx?teamId=100
		// The season start/end was not really a fixed date.

		years[0] = 830;			// From 2000
		years[1] = years[0] + 366; // leap year
		years[2] = years[1] + 365;
		years[3] = years[2] + 365;
		years[4] = years[3] + 365;
		years[5] = years[4] + 366; // leap year
		years[6] = years[5] + 365;
		years[7] = years[6] + 365;
		years[8] = years[7] + 365;
		years[9] = years[8] + 366; // leap year
		years[10] = years[9] + 365;

		for (var i = 0; i < ar.length; i++) {
			ar[i] = ar[i].replace(/^(0+)/g, '');
		}

		var DATEFORMAT = FoxtrickPrefs.getString("htDateformat");
		if (DATEFORMAT == null) DATEFORMAT = 'ddmmyyyy';

		switch (DATEFORMAT) {
			case 'ddmmyyyy':
				var day = parseInt(ar[1]);
				var month = parseInt(ar[3]);
				var year = parseInt(ar[5]);
				break;
			case 'mmddyyyy':
				var day = parseInt(ar[3]);
				var month = parseInt(ar[1]);
				var year = parseInt(ar[5]);
				break;
			case 'yyyymmdd':
				var day = parseInt(ar[5]);
				var month = parseInt(ar[3]);
				var year = parseInt(ar[1]);
				break;
		}
		var dayCount = years[year-2000] + months[month] + (day) - weekdayOffset;

		// leap year
		if (year % 4 == 0 && month > 2)
			++dayCount;

		var htDate = this.htDatePrintFormat(
						year,
						(Math.floor(dayCount/(16*7)) + 1),
						(Math.floor((dayCount%(16*7))/7) +1),
						dayCount%7 + 1,
						date);
		return htDate;
	},

	htDatePrintFormat : function(year, season, week, day, date) {
		var offset = 0;
		try {
			if (Foxtrick.isModuleFeatureEnabled(FoxtrickHTDateFormat, FoxtrickPrefs.getString("htCountry"))) {
				// try and find the offset
				for (var i in Foxtrick.XMLData.League) {
					if (itemToSearch == FoxtrickHelper.getLeagueDataFromId(i).EnglishName) {
						returnedOffset = FoxtrickHelper.getLeagueDataFromId(1).Season - FoxtrickHelper.getLeagueDataFromId(i).Season; // sweden season - selected
						break;
					}
				}
			}
		}
		catch (e) {
			offset = 0;
		}
		if (year <= 2000)
			return "";
		else
			return "<span id='ft_HTDateFormat'>(" + week + "/" + (Math.floor(season) - offset) + ")</span>";
	},

	getDateFromText : function(text) {
		/*
			Returns Date object for given text.
			Text could be like dd-mm-yyyy, mm-dd-yyyy or yyyy-mm-dd
			according to date format setting,
			trailing minute:second is optional,
			while separator and leading zero are irrelevant.
		*/
		if (!text)
			return null;

		var reLong = /(\d+)\D+(\d+)\D+(\d+)\D+(\d+)\D+(\d+)/;
		var reShort = /(\d+)\D+(\d+)\D+(\d+)/;
		var matches;
		if (text.match(reLong))
			matches = text.match(reLong);
		else if (text.match(reShort))
			matches = text.match(reShort);
		else
			return null;

		const DATEFORMAT = FoxtrickPrefs.getString("htDateformat") || "ddmmyyyy";
		switch (DATEFORMAT) {
			case 'ddmmyyyy':
				var day = matches[1];
				var month = matches[2];
				var year = matches[3];
				break;
			case 'mmddyyyy':
				var day = matches[2];
				var month = matches[1];
				var year = matches[3];
				break;
			case 'yyyymmdd':
				var day = matches[3];
				var month = matches[2];
				var year = matches[1];
				break;
		}
		var hour = (matches.length == 6) ? matches[4] : 0;
		var minute = (matches.length == 6) ? matches[5] : 0;

		var date = new Date(year, month - 1, day, hour, minute);
		return date;
	},

	timeDifferenceToText : function(time_sec, useShort) {
		var org_time = time_sec;
		// Returns the time differnce as DDD days, HHh MMm
		// if useShort, only DDD day(s) will be returned

		var Text = "";
		var Days = 0; var Minutes = 0; var Hours = 0;

		if (Math.floor(time_sec) < 0)
			return 'NaN';

		//days
		if(time_sec >= 86400) {
			Days = Math.floor(time_sec/86400);
			time_sec = time_sec-Days*86400;
			var d1 = Foxtrickl10n.getString("foxtrick.datetimestrings.day");
			var d5 = Foxtrickl10n.getString("foxtrick.datetimestrings.days");
			try {
				//days for slavian numbers (2 3 4)
				var d2 = Foxtrickl10n.getString("foxtrick.datetimestrings.days234");
			} catch(e) {
				d2 = d5;
			}

			Text += Days + '&nbsp;';
			if (Days == 1) // 1 single day
				Text += d1
			else {
				// same word for 2-4 and 0,5-9
				if (d2 == d5)
					Text += d2;
				else {
					var units = Days % 10;
					if (Math.floor((Days % 100) / 10) == 1)
						Text += d5;
					else
						Text += (units==1) ? d1 :(((units > 1) && (units < 5)) ? d2 : d5);
				}
			}
		}
		// only days returned
		if (useShort) {
			var display_option = FoxtrickPrefs.getInt("module." + FoxtrickExtendedPlayerDetails.MODULE_NAME + ".value");
			if (display_option == null) var display_option = 0;
			var PJD_D = Math.floor(org_time / 86400);
			var PJD_W = Math.floor(PJD_D / 7);
			var PJD_S = Math.floor(PJD_D / (16*7));
			var print_S = ''; var print_W = ''; var print_D = '';
			try {
				switch (display_option) { //("SWD", "SW", "SD", "WD", "D")
					case 0: //SWD
						print_S = PJD_S;
						print_W = PJD_W - (print_S * 16);
						print_D = PJD_D - (print_S * 16 * 7) - (print_W * 7);
					break;

					case 1: //SW
						print_S = PJD_S;
						print_W = PJD_W - (print_S * 16);
						break;

					case 2: //SD
						print_S = PJD_S;
						print_D = PJD_D - (print_S * 16 * 7);
					break;

					case 3: //WD
						print_W = PJD_W;
						print_D = PJD_D - (print_W * 7);
					break;

					case 4: //D
						print_D = PJD_D;
					break;
				} // switch
			} // try
			catch (e) { }
			if (print_S == 0) {print_S = '';} else {print_S = '<b>' + print_S + '</b>'+Foxtrickl10n.getString("foxtrick.datetimestrings.short_seasons");}
			if (print_W != 0 && print_S != '') print_S += '&nbsp;';
			if (print_W == 0) {print_W = '';} else {print_W = '<b>' + print_W + '</b>'+Foxtrickl10n.getString("foxtrick.datetimestrings.short_weeks");}
			if (print_D != 0) print_W += '&nbsp;';
			if (print_D == 0 && (print_S != 0 || print_W != 0)) {print_D = '';} else {print_D = '<b>' + print_D + '</b>'+Foxtrickl10n.getString("foxtrick.datetimestrings.short_days");}

			return print_S + print_W + print_D;

			if (Days == 0)
				Text += '0&nbsp;' + Foxtrickl10n.getString("foxtrick.datetimestrings.days");
			return Text;
		}

		//insert white space between days and hours
		if (Text != "") Text += "&nbsp;";

		//hours
		if ((time_sec >= 3600) || (Days > 0))
		{
			Hours = Math.floor(time_sec/3600);
			time_sec = time_sec-Hours*3600;
			Text += Hours + Foxtrickl10n.getString("foxtrick.datetimestrings.hours") + '&nbsp;';
		}

		//minutes
		Minutes = Math.floor(time_sec/60);
		time_sec = time_sec - Minutes * 60;
		Text += Minutes + Foxtrickl10n.getString("foxtrick.datetimestrings.minutes");

		return Text;
	},

	modifyDates : function (doc, useShort, elm, before, after ,weekdayoffset, strip) {
		/*
		Returns HT-Week & Season
		useShort == true => Date is without time.

		don't use span as elm! use next outer nodetype instead
		*/
		var tds = doc.getElementsByTagName(elm);
		for (var i = 0; tds[i] != null; ++i) {
			var node = tds[i];
			if (node.getElementsByTagName('span').length!=0)
				node = node.getElementsByTagName('span')[0];

			// not nested
			if (node.getElementsByTagName(elm).length!=0) {
				continue;
			}

			if (node.id == 'ft_HTDateFormat') return;
			if (!strip) var dt_inner = Foxtrick.trim(node.innerHTML);
			else var dt_inner = Foxtrick.trim(Foxtrick.stripHTML(node.innerHTML));

			if (!Foxtrick.strrpos(dt_inner, "ft_HTDateFormat")) {
				if ((dt_inner.length <= 11 && useShort) || (dt_inner.length <= 17 && !useShort) || strip) {
					var reg = /(\d{1,4})(\W{1})(\d{1,2})(\W{1})(\d{1,4})(.*?)/g;
					var ar = reg.exec(dt_inner);

					if (ar != null) {
						var td_date = ar[1] + '.' + ar[3] + '.' + ar[5] + ' 00.00.01';

						if (Foxtrick.trim(td_date).match(reg) != null && ar[1] != '' && ar[3] != '' && ar[5] != '') {
							if (!strip)
								node.innerHTML = dt_inner + before + Foxtrick.util.time.gregorianToHT(td_date,weekdayoffset) + after;
							else
								node.innerHTML = node.innerHTML + before + Foxtrick.util.time.gregorianToHT(td_date,weekdayoffset) + after;
						}
					}
				}
			}
		}
	}
};
