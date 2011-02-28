/**
 * matches.js
 * adds ratings to matches page
 * @author taised, Jestar
 */
////////////////////////////////////////////////////////////////////////////////
Foxtrick.Ratings = {

	MODULE_NAME : "Ratings",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : new Array('match'),
	OPTIONS : new Array ("hatstats", "hatstatstotal", "loddarstats", "peasostats", "vnukstats", "htitavals", "gardierstats", "hatstatsOnRatings"),
	ratingDefs :  {}, // will be filled in initOptions

	init : function() {
		this.initHtRatings();
	},

	run : function( page, doc ) {
		var ratingsArray=new Array ("hatstats", "hatstatstotal", "loddarstats", "peasostats", "vnukstats", "htitavals", "gardierstats");
		
		var isprematch = (doc.getElementById("ctl00_ctl00_CPContent_CPMain_pnlPreMatch")!=null);
		if (isprematch) return;

		var ratingstable = Foxtrick.Matches._getRatingsTable(doc);
		if (ratingstable == null) return;
		if (Foxtrick.Matches._isWalkOver(ratingstable)) return;
		if (!Foxtrick.Matches._isCorrectLanguage(ratingstable)) { // incorrect language
			var row = ratingstable.insertRow(8);
			var cell = row.insertCell(0);
			cell.setAttribute("colspan" , 3);
			cell.innerHTML = Foxtrickl10n.getString( "foxtrick.matches.wronglang" );
			return;
		}

		var midfieldLevel=new Array(Foxtrick.Matches._getStatFromCell(ratingstable.rows[1].cells[1]), Foxtrick.Matches._getStatFromCell(ratingstable.rows[1].cells[2]));
		var rdefence=new Array(Foxtrick.Matches._getStatFromCell(ratingstable.rows[2].cells[1]), Foxtrick.Matches._getStatFromCell(ratingstable.rows[2].cells[2]));
		var cdefence=new Array(Foxtrick.Matches._getStatFromCell(ratingstable.rows[3].cells[1]), Foxtrick.Matches._getStatFromCell(ratingstable.rows[3].cells[2]));
		var ldefence=new Array(Foxtrick.Matches._getStatFromCell(ratingstable.rows[4].cells[1]), Foxtrick.Matches._getStatFromCell(ratingstable.rows[4].cells[2]));
		var rattack=new Array(Foxtrick.Matches._getStatFromCell(ratingstable.rows[5].cells[1]), Foxtrick.Matches._getStatFromCell(ratingstable.rows[5].cells[2]));
		var cattack=new Array(Foxtrick.Matches._getStatFromCell(ratingstable.rows[6].cells[1]), Foxtrick.Matches._getStatFromCell(ratingstable.rows[6].cells[2]));
		var lattack=new Array(Foxtrick.Matches._getStatFromCell(ratingstable.rows[7].cells[1]), Foxtrick.Matches._getStatFromCell(ratingstable.rows[7].cells[2]));
		
		var tactics;
		var tacticsLevel;
		if (ratingstable.rows.length > 12) {
			tactics=new Array(Foxtrick.Matches._getTacticsFromCell(ratingstable.rows[14].cells[1]), Foxtrick.Matches._getTacticsFromCell(ratingstable.rows[14].cells[2]));
			tacticsLevel=new Array(Foxtrick.Matches._getTacticsLevelFromCell(ratingstable.rows[15].cells[1]), Foxtrick.Matches._getTacticsLevelFromCell(ratingstable.rows[15].cells[2]));
		}
		else  {
			tactics=new Array(Foxtrick.Matches._getTacticsFromCell(ratingstable.rows[10].cells[1]), Foxtrick.Matches._getTacticsFromCell(ratingstable.rows[10].cells[2]));
			tacticsLevel=new Array(Foxtrick.Matches._getTacticsLevelFromCell(ratingstable.rows[11].cells[1]), Foxtrick.Matches._getTacticsLevelFromCell(ratingstable.rows[11].cells[2]));
		}
		//Foxtrick.dump('Tactics:['+ tactics + '], TacticsLevel:[' +tacticsLevel +']'+ '\n');

		var defenceLevel = new Array();
		defenceLevel[0]=ldefence[0] + cdefence[0] + rdefence[0];
		defenceLevel[1]=ldefence[1] + cdefence[1] + rdefence[1];
		var attackLevel = new Array();
		attackLevel[0]= rattack[0] + cattack[0] + lattack[0];
		attackLevel[1]= rattack[1] + cattack[1] + lattack[1];
		for (var k=ratingsArray.length-1; k>=0; --k) {
			var selectedRating = ratingsArray[k];
			//Foxtrick.dump(selectedRating+'\n');
			if (!Foxtrick.isModuleFeatureEnabled( this, selectedRating)) continue;

			var row = ratingstable.insertRow(8);
			// to be added if needed by foxlinks
			//row.className='ft_rating_table_row';

			var cell = row.insertCell(0);
			cell.className='ch';
			cell.innerHTML = this.ratingDefs[selectedRating]["label"]();

			for (var i=0;i<2;i++) {
				var cell = row.insertCell(i+1);
				
				this.insertRatingsDet(cell, this.ratingDefs[selectedRating], "defence",
						 Foxtrickl10n.getString( "foxtrick.matchdetail.defence" ), defenceLevel[i]);
				this.insertRatingsDet(cell, this.ratingDefs[selectedRating], "special",
						 Foxtrickl10n.getString( "foxtrick.matchdetail.defence" ),  rdefence[i], cdefence[i], ldefence[i]);

				this.insertRatingsDet(cell, this.ratingDefs[selectedRating], "midfield",
						 Foxtrickl10n.getString( "foxtrick.matchdetail.midfield" ), midfieldLevel[i]);
				this.insertRatingsDet(cell, this.ratingDefs[selectedRating], "mystyle",
						 Foxtrickl10n.getString( "foxtrick.matchdetail.midfield" ), midfieldLevel[i]);

				this.insertRatingsDet(cell, this.ratingDefs[selectedRating], "attack",
						 Foxtrickl10n.getString( "foxtrick.matchdetail.attack" ),  attackLevel[i]);
				this.insertRatingsDet(cell, this.ratingDefs[selectedRating], "special",
						 Foxtrickl10n.getString( "foxtrick.matchdetail.attack" ),  rattack[i], cattack[i], lattack[i]);
				
				try {
					if (typeof (this.ratingDefs[selectedRating]["total2"]) != 'undefined') {
						if (tactics[i] == null) {
							tactics[i] = -1;
						}
						if (tactics[i] != null) {
							if (cell.innerHTML.length>2) {
								cell.innerHTML+="<br />"+Foxtrickl10n.getString( "foxtrick.matchdetail.total" )+": ";
							}
							cell.innerHTML += "<b>" +
												this.ratingDefs[selectedRating]["total2"](midfieldLevel[i], lattack[i], cattack[i], rattack[i],
																									ldefence[i], cdefence[i], rdefence[i],
																									tactics[i], tacticsLevel[i]
																									)
											+ "</b>";
						}
					} else {
						if (cell.innerHTML.length>2) {
							cell.innerHTML+="<br />"+Foxtrickl10n.getString( "foxtrick.matchdetail.total" )+": ";
						}
						cell.innerHTML += "<b>" +
											this.ratingDefs[selectedRating]["total"](midfieldLevel[i], attackLevel[i], defenceLevel[i])
										+ "</b>";
					}
				} catch (e) {
					Foxtrick.dump('ratings.js error in rating print ('+selectedRating+'): '+e+"\n");
				}				
			}
		}
		
		//Finally adding hatstatsOnRatings
		if (Foxtrick.isModuleFeatureEnabled(this, "hatstatsOnRatings")) {
			for (var j=1;j<3;j++) {
				for (var i=1;i<8;i++) {
					var tempvalue=Foxtrick.Matches._getStatFromCell(ratingstable.rows[i].cells[j]);
					if (i==1) {
						//midfield have to be multiplied by 3
						tempvalue=(tempvalue*4+1)*3;
					}
					else {
						tempvalue=tempvalue*4+3;
					}
					ratingstable.rows[i].cells[j].innerHTML+=" ("+tempvalue+")";
				}
			}
		}
	},


	insertRatingsDet: function (cell, rating, ratingType, label, midfieldLevel, attackLevel, defenceLevel) {
		if (typeof(rating[ratingType]) == 'undefined') return;
		if (cell.innerHTML.length>2) {
			cell.innerHTML+="<br />"
		}
		cell.innerHTML+=label+": <b>" + rating[ratingType](midfieldLevel, attackLevel, defenceLevel) + "</b>";
	},

	initHtRatings: function () {
		this.ratingDefs=new Array();

		this.ratingDefs["hatstats"] = {	base : 1.0, weight : 4.0,
			label : function(){return Foxtrickl10n.getString('HatStatsDetailed');},
			title : function(){return Foxtrickl10n.getString('HatStatsDetailed');},

			attack : function(attackLevel) {
				return (3.0*this.base + this.weight*attackLevel);
			},
			defence : function(defenceLevel) {
				return (3.0*this.base + this.weight*defenceLevel);
			},
			midfield : function(midfieldLevel) {
				return 3.0*(this.base + this.weight*midfieldLevel);
			},
			total: function(midfieldLevel, attackLevel, defenceLevel) {
				return this.attack(attackLevel)+
					this.defence(defenceLevel)+
					this.midfield(midfieldLevel);
			}
		};

		this.ratingDefs["hatstatstotal"] = {
			label : function(){return Foxtrickl10n.getString("HatStatsTotalOnly");},
			title : function(){return Foxtrickl10n.getString("HatStatsTotalOnly");},
			total: function(midfieldLevel, attackLevel, defenceLevel) {
				return Foxtrick.Ratings.ratingDefs["hatstats"].total(midfieldLevel, attackLevel, defenceLevel);
			}
		};

		this.ratingDefs["loddarstats"] = {	base : 1.0, weight : 4.0,
			label : function(){return "LoddarStats";},
			title : function(){return "LoddarStats";},

			HQ : function(x) {
				return 2.0*(x/(x+80));
			},

			total2: function( midfieldLevel, lattack, cattack, rattack,
											ldefence, cdefence, rdefence,
										tactics, tacticsLevel ) {
				if (tactics == '-1') return '<font color="#808080">(n/a)</font>';
				midfieldLevel = this.base + this.weight*midfieldLevel;
				lattack = this.base + this.weight*lattack;
				cattack = this.base + this.weight*cattack;
				rattack = this.base + this.weight*rattack;

				ldefence = this.base + this.weight*ldefence;
				cdefence = this.base + this.weight*cdefence;
				rdefence = this.base + this.weight*rdefence;

				var MFS = 0.0;

				var VF = 0.47;
				var AF = 1.0 - VF;

				var ZG = 0.37;
				var AG = (1.0 - ZG)/2.0;

				var KG = 0.25;

				var MFF = MFS + (1-MFS)*this.HQ(midfieldLevel);

				var KK = 0;
				if (tactics == 'ca') {
					KK = KG*2*tacticsLevel/(tacticsLevel+20);
				}

				var KZG = ZG;
				if (tactics == 'aim') {
					KZG += 0.2*(tacticsLevel - 1.0)/19.0 + 0.2;
				} else if (tactics == 'aow') {
					KZG -= 0.2*(tacticsLevel - 1.0)/19.0 + 0.2;
				}

				var KAG = (1.0 - KZG) / 2.0;

				var attackValue = (AF+KK)*(KZG*this.HQ(cattack) + KAG*(this.HQ(lattack) + this.HQ(rattack)));
				var defenceValue = VF*(ZG*this.HQ(cdefence) + AG*(this.HQ(ldefence) + this.HQ(rdefence)) );

				var value = 80*MFF*(attackValue + defenceValue);

				var rounded = Math.round(value*100)/100;

				if (tactics == 'longshots') return '<font color="#808080">' + rounded + '</font>';

				return rounded;
			}

		 };



		this.ratingDefs["vnukstats"] = { base : 1.0,
			label : function(){return "Vnukstats";},
			title : function(){return "Vnukstats";},

			special : function(rattack, cattack, lattack) {
			return this.mystyle(rattack) + " " + this.mystyle(cattack)
				+ " " + this.mystyle(lattack);
			},

			total: function(midfieldLevel, attackLevel, defenceLevel) {
				return Math.round(100*(11.0 + 5*midfieldLevel + attackLevel + defenceLevel)/11)/100;
			},

			mystyle: function(level) {
				var lev = this.base+level;
				var temp = " " + lev;
				if (temp.search(/\.25/) > -1) return temp.replace(/\.25/,"-");
				else if (temp.search(/\.5/) > -1)  return temp.replace(/\.5/, "+");
				else if (temp.search(/\.75/) > -1) return temp.replace(/\.75/, "*");
				else return lev+"!";
			}
		};

		this.ratingDefs["peasostats"] = {	base : 1.0, weight : 4.0,
			label : function(){return "PStats";},
			title : function(){return "PStats";},

			total2: function( midfieldLevel, lattack, cattack, rattack,
											ldefence, cdefence, rdefence,
										tactics, tacticsLevel ) {

				midfieldLevel = this.base + this.weight*midfieldLevel;
				lattack = this.base + this.weight*lattack;
				cattack = this.base + this.weight*cattack;
				rattack = this.base + this.weight*rattack;

				ldefence = this.base + this.weight*ldefence;
				cdefence = this.base + this.weight*cdefence;
				rdefence = this.base + this.weight*rdefence;

				var value = 0.46*midfieldLevel +
				0.32*(0.3*(lattack+rattack) + 0.4*cattack) +
				0.22*(0.3*(ldefence+rdefence) + 0.4*cdefence);

				var rounded = Math.round(value*100)/100;
				return rounded;

			}
		};

		this.ratingDefs["htitavals"] = {	base : 1.0, weight : 4.0,
			label : function(){return "HTitaVal";},
			title : function(){return "HTitaVal";},

			total2: function( midfieldLevel, lattack, cattack, rattack,
											ldefence, cdefence, rdefence,
										tactics, tacticsLevel ) {

				midfieldLevel = this.base + this.weight*midfieldLevel;
				lattack = this.base + this.weight*lattack;
				cattack = this.base + this.weight*cattack;
				rattack = this.base + this.weight*rattack;

				ldefence = this.base + this.weight*ldefence;
				cdefence = this.base + this.weight*cdefence;
				rdefence = this.base + this.weight*rdefence;

				var value = 3*midfieldLevel +
				0.8*(lattack+rattack) + 1.4*cattack +
				0.64*(ldefence+rdefence) + 1.12*cdefence;

				var rounded = Math.round(value*10)/10;
				return rounded;

			}
		};

		this.ratingDefs["gardierstats"] = {
			base : 1.0, weight : 4.0,
			label : function(){return "GardierStats";},
			title : function(){return "GardierStats";},

			total2: function(midfield, leftAtt, centralAtt, rightAtt, leftDef, centralDef, rightDef, tactics, tacticsLevel) {

				if (tactics == '-1') return '<font color="#808080">(n/a)</font>';

				leftAtt = (this.base + this.weight*leftAtt);
				centralAtt = (this.base + this.weight*centralAtt);
				rightAtt = (this.base + this.weight*rightAtt);

				leftDef = (this.base + this.weight*leftDef);
				centralDef = (this.base + this.weight*centralDef);
				rightDef = (this.base + this.weight*rightDef);

				midfield = (this.base + this.weight*midfield);

				var defense = 0.275*rightDef + 0.45*centralDef + 0.275*leftDef;
				var attack = 0.275*rightAtt + 0.45*centralAtt + 0.275*leftAtt;
				var tempReal = 4.15*midfield + 2.77*attack + 2.08*defense;

				if (tactics == 'ca') {
				tempTactica= (tacticsLevel * defense) / 10;
				} else if (tactics == 'aim') {
				tempTactica= (tacticsLevel * centralAtt) / 7;
				} else if (tactics == 'aow') {
				tempTactica= (tacticsLevel * (rightAtt + leftAtt) / 2) / 7;
				} else {
				tempTactica= tempReal / 9;
				}

				var value = tempReal + tempTactica;
				var rounded = Math.round(value);
				if (tactics == 'longshots') return '<font color="#808080">' + rounded + '</font>';
				return rounded;
			}
		};
	}
};
