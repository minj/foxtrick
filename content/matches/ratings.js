'use strict';
/**
 * matches.js
 * adds ratings to matches page
 * @author taised, Jestar
 */

Foxtrick.modules['Ratings'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match', 'matchOld'],
	OPTIONS: ['HideAverages', 'HatStats', 'HatStatsDetailed', 'LoddarStats', 'PeasoStats',
		'VnukStats', 'HTitaVal', 'GardierStats'],
	ratingDefs: {}, // will be filled in initOptions
	copy: function(div) {
		if (div) {
			return '\n' + Foxtrick.util.htMl.getMarkupFromNode(div);
		}
		return '';
	},
	run: function(doc) {

		var isprematch = (doc.getElementById('ctl00_ctl00_CPContent_CPMain_pnlPreMatch') != null);
		if (isprematch) return;

		var ratingstable = Foxtrick.Pages.Match.getRatingsTable(doc);

		if (ratingstable == null) return;
		if (Foxtrick.Pages.Match.isWalkOver(ratingstable))
			return;
		if (!Foxtrick.Pages.Match.isCorrectLanguage(ratingstable)) { // incorrect language
			var row = Foxtrick.insertFeaturedRow(ratingstable, this, -1);
			var cell = row.insertCell(0);
			cell.setAttribute('colspan', 3);
			cell.textContent = Foxtrickl10n.getString('matches.wronglang');
			return;
		}

		if (!Foxtrick.Pages.Match.hasNewRatings(doc) &&
		    FoxtrickPrefs.isModuleOptionEnabled('Ratings', 'HideAverages')
			&& !Foxtrick.Pages.Match.isYouth(doc)) {
			for (var i = 0; i < 5; ++i) {
				ratingstable.deleteRow(-1);
			}
		}

		var midfieldLevel = [Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[1].cells[1]),
			Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[1].cells[2])];
		var rdefence = [Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[2].cells[1]),
			Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[2].cells[2])];
		var cdefence = [Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[3].cells[1]),
			Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[3].cells[2])];
		var ldefence = [Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[4].cells[1]),
			Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[4].cells[2])];
		var rattack = [Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[5].cells[1]),
			Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[5].cells[2])];
		var cattack = [Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[6].cells[1]),
			Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[6].cells[2])];
		var lattack = [Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[7].cells[1]),
			Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[7].cells[2])];

		var tactics;
		var tacticsLevel;
		if (Foxtrick.Pages.Match.hasIndSetPieces(ratingstable)) {
			tactics = [
				Foxtrick.Pages.Match.getTacticsFromCell(ratingstable.rows[14].cells[1]),
				Foxtrick.Pages.Match.getTacticsFromCell(ratingstable.rows[14].cells[2])
			];
			tacticsLevel = [
				Foxtrick.Pages.Match.getTacticsLevelFromCell(ratingstable.rows[15].cells[1]),
				Foxtrick.Pages.Match.getTacticsLevelFromCell(ratingstable.rows[15].cells[2])
			];
		}
		else  {
			tactics = [
				Foxtrick.Pages.Match.getTacticsFromCell(ratingstable.rows[10].cells[1]),
				Foxtrick.Pages.Match.getTacticsFromCell(ratingstable.rows[10].cells[2])
			];
			tacticsLevel = [
				Foxtrick.Pages.Match.getTacticsLevelFromCell(ratingstable.rows[11].cells[1]),
				Foxtrick.Pages.Match.getTacticsLevelFromCell(ratingstable.rows[11].cells[2])
			];
		}
		//Foxtrick.log('Tactics:[', tactics , '], TacticsLevel:[' ,tacticsLevel ,']');

		// seperator
		var row = ratingstable.insertRow(-1);
		var cell = row.insertCell(0);
		cell.textContent = '\u00a0';

		this.addRatings(doc, ratingstable, midfieldLevel, rdefence, cdefence, ldefence, rattack,
		                cattack, lattack, tactics, tacticsLevel, true);

	},
	addRatings: function(doc, table, mf, rd, cd, ld, ra, ca, la, ta, tl, twoTeams) {
		var defenceLevel = [];
		defenceLevel[0] = ld[0] + cd[0] + rd[0];
		defenceLevel[1] = ld[1] + cd[1] + rd[1];
		var attackLevel = [];
		attackLevel[0] = ra[0] + ca[0] + la[0];
		attackLevel[1] = ra[1] + ca[1] + la[1];

		this.initHtRatings();

		for (var k = 1; k < this.OPTIONS.length; ++k) {
			var selectedRating = this.OPTIONS[k];

			if (!FoxtrickPrefs.isModuleOptionEnabled('Ratings', selectedRating))
				continue;

			var row = Foxtrick.insertFeaturedRow(table, this, -1);
			row.className = 'ft_rating_table_row';

			var cell = row.insertCell(0);
			cell.className = 'ch';
			cell.textContent = this.ratingDefs[selectedRating]['label']();

			for (var i = 0; i <= twoTeams; i++) {
				var cell = row.insertCell(i + 1);

				this.insertRatingsDet(doc, cell, this.ratingDefs[selectedRating], 'defence',
						 Foxtrickl10n.getString('match.ratings.defence'), defenceLevel[i]);
				this.insertRatingsDet(doc, cell, this.ratingDefs[selectedRating], 'special',
						 Foxtrickl10n.getString('match.ratings.defence'),  rd[i], cd[i], ld[i]);

				this.insertRatingsDet(doc, cell, this.ratingDefs[selectedRating], 'midfield',
						 Foxtrickl10n.getString('match.ratings.midfield'), mf[i]);
				this.insertRatingsDet(doc, cell, this.ratingDefs[selectedRating], 'mystyle',
						 Foxtrickl10n.getString('match.ratings.midfield'), mf[i]);

				this.insertRatingsDet(doc, cell, this.ratingDefs[selectedRating], 'attack',
						 Foxtrickl10n.getString('match.ratings.attack'),  attackLevel[i]);
				this.insertRatingsDet(doc, cell, this.ratingDefs[selectedRating], 'special',
						 Foxtrickl10n.getString('match.ratings.attack'),  ra[i], ca[i], la[i]);

				try {
					if (typeof(this.ratingDefs[selectedRating]['total2']) == 'function') {
						if (ta[i] == null) {
							ta[i] = -1;
						}
						if (ta[i] != null) {
							if (cell.textContent.length > 2) {
								cell.appendChild(doc.createElement('br'));
								cell.appendChild(doc.createTextNode(Foxtrickl10n
								                 .getString('match.ratings.total') + ': '));
							}
							var b = cell.appendChild(doc.createElement('b'));
							b.appendChild(this.ratingDefs[selectedRating]['total2'](doc, mf[i],
							              la[i], ca[i], ra[i], ld[i], cd[i], rd[i], ta[i], tl[i]));
						}
					}
					else if (typeof(this.ratingDefs[selectedRating]['total']) == 'function') {
						if (cell.textContent.length > 2) {
							cell.appendChild(doc.createElement('br'));
							cell.appendChild(doc.createTextNode(Foxtrickl10n
							                 .getString('match.ratings.total' ) + ': '));
						}
						var b = cell.appendChild(doc.createElement('b'));
						b.textContent =
							this.ratingDefs[selectedRating]['total'](mf[i], attackLevel[i],
							                                         defenceLevel[i]);
					}
				}
				catch (e) {
					Foxtrick.log('ratings.js error in rating print (' + selectedRating + '): ', e);
				}
			}
		}
	},
	insertRatingsDet: function(doc, cell, rating, ratingType, label, midfieldLevel, attackLevel,
	                            defenceLevel) {
		if (typeof(rating[ratingType]) == 'undefined')
			return;
			if (cell.textContent.length > 2) {
				cell.appendChild(doc.createElement('br'));
			}
		cell.appendChild(doc.createTextNode(label + ': '));
		var b = cell.appendChild(doc.createElement('b'));
		b.textContent = rating[ratingType](midfieldLevel, attackLevel, defenceLevel);
	},

	initHtRatings: function() {
		var ratingDefs = this.ratingDefs;
		ratingDefs['HatStats'] = {
			label: function() { return Foxtrickl10n.getString('ratings.HatStats'); },
			title: function() { return Foxtrickl10n.getString('ratings.HatStats'); },
			total: function(midfieldLevel, attackLevel, defenceLevel) {
				return ratingDefs['HatStatsDetailed'].midfield(midfieldLevel)
					+ ratingDefs['HatStatsDetailed'].attack(attackLevel)
					+ ratingDefs['HatStatsDetailed'].defence(defenceLevel);
			}
		};

		ratingDefs['HatStatsDetailed'] = {
			base: 1.0, weight: 4.0,
			label: function() { return Foxtrickl10n.getString('ratings.HatStats'); },
			title: function() { return Foxtrickl10n.getString('ratings.HatStats'); },

			attack: function(attackLevel) {
				return (3.0 * this.base + this.weight * attackLevel);
			},
			defence: function(defenceLevel) {
				return (3.0 * this.base + this.weight * defenceLevel);
			},
			midfield: function(midfieldLevel) {
				return 3.0 * (this.base + this.weight * midfieldLevel);
			}
		};

		ratingDefs['LoddarStats'] = { base: 1.0, weight: 4.0,
			label: function() { return Foxtrickl10n.getString('ratings.LoddarStats'); },
			title: function() { return Foxtrickl10n.getString('ratings.LoddarStats'); },

			HQ: function(x) {
				return 2.0 * (x / (x + 80));
			},

			total2: function(doc, midfieldLevel,
			                lattack, cattack, rattack,
							ldefence, cdefence, rdefence,
							tactics, tacticsLevel) {
				if (tactics == '-1') {
					var font = doc.createElement('font');
					font.setAttribute('color', '#808080');
					font.textContent='(n/a)';
					return font;
				}
				midfieldLevel = this.base + this.weight * midfieldLevel;
				lattack = this.base + this.weight * lattack;
				cattack = this.base + this.weight * cattack;
				rattack = this.base + this.weight * rattack;

				ldefence = this.base + this.weight * ldefence;
				cdefence = this.base + this.weight * cdefence;
				rdefence = this.base + this.weight * rdefence;

				var MFS = 0.0;

				var VF = 0.47;
				var AF = 1.0 - VF;

				var ZG = 0.37;
				var AG = (1.0 - ZG) / 2.0;

				var KG = 0.25;

				var MFF = MFS + (1 - MFS) * this.HQ(midfieldLevel);

				var KK = 0;
				if (tactics == 'ca') {
					KK = KG * 2 * tacticsLevel / (tacticsLevel + 20);
				}

				var KZG = ZG;
				if (tactics == 'aim') {
					KZG += 0.2 * (tacticsLevel - 1.0) / 19.0 + 0.2;
				} else if (tactics == 'aow') {
					KZG -= 0.2 * (tacticsLevel - 1.0) / 19.0 + 0.2;
				}

				var KAG = (1.0 - KZG) / 2.0;

				var attackValue = (AF + KK) * (KZG * this.HQ(cattack) + KAG * (this.HQ(lattack) +
				                           this.HQ(rattack)));
				var defenceValue = VF * (ZG * this.HQ(cdefence) + AG * (this.HQ(ldefence) +
				                       this.HQ(rdefence)));

				var value = 80 * MFF * (attackValue + defenceValue);

				var rounded = Math.round(value * 100) / 100;

				if (tactics == 'longshots') {
					var font = doc.createElement('font');
					font.setAttribute('color', '#808080');
					font.textContent = rounded;
					return font;
				}
				return doc.createTextNode(rounded);
			}

		};

		ratingDefs['VnukStats'] = { base: 1.0,
			label: function() { return Foxtrickl10n.getString('ratings.VnukStats'); },
			title: function() { return Foxtrickl10n.getString('ratings.VnukStats'); },

			special: function(rattack, cattack, lattack) {
			return this.mystyle(rattack) + ' ' + this.mystyle(cattack)
				+ ' ' + this.mystyle(lattack);
			},

			total: function(midfieldLevel, attackLevel, defenceLevel) {
				return Math.round(100 * (11.0 + 5 * midfieldLevel + attackLevel +
				                  defenceLevel) / 11) / 100;
			},

			mystyle: function(level) {
				var lev = this.base + level;
				var temp = ' ' + lev;
				if (temp.search(/\.25/) > -1) return temp.replace(/\.25/, '-');
				else if (temp.search(/\.5/) > -1)  return temp.replace(/\.5/, '+');
				else if (temp.search(/\.75/) > -1) return temp.replace(/\.75/, '*');
				else return lev + '!';
			}
		};

		ratingDefs['PeasoStats'] = { base: 1.0, weight: 4.0,
			label: function() { return Foxtrickl10n.getString('ratings.PeasoStats'); },
			title: function() { return Foxtrickl10n.getString('ratings.PeasoStats'); },

			total2: function(doc, midfieldLevel, lattack, cattack, rattack,
							ldefence, cdefence, rdefence,
							tactics, tacticsLevel) {

				midfieldLevel = this.base + this.weight * midfieldLevel;
				lattack = this.base + this.weight * lattack;
				cattack = this.base + this.weight * cattack;
				rattack = this.base + this.weight * rattack;

				ldefence = this.base + this.weight * ldefence;
				cdefence = this.base + this.weight * cdefence;
				rdefence = this.base + this.weight * rdefence;

				var value = 0.46 * midfieldLevel +
					0.32 * (0.3 * (lattack + rattack) + 0.4 * cattack) +
					0.22 * (0.3 * (ldefence + rdefence) + 0.4 * cdefence);

				var rounded = Math.round(value * 100) / 100;
				return doc.createTextNode(rounded);

			}
		};

		ratingDefs['HTitaVal'] = { base: 1.0, weight: 4.0,
			label: function() { return Foxtrickl10n.getString('ratings.HTitaVal'); },
			title: function() { return Foxtrickl10n.getString('ratings.HTitaVal'); },

			total2: function(doc, midfieldLevel, lattack, cattack, rattack,
							ldefence, cdefence, rdefence,
							tactics, tacticsLevel) {

				midfieldLevel = this.base + this.weight * midfieldLevel;
				lattack = this.base + this.weight * lattack;
				cattack = this.base + this.weight * cattack;
				rattack = this.base + this.weight * rattack;

				ldefence = this.base + this.weight * ldefence;
				cdefence = this.base + this.weight * cdefence;
				rdefence = this.base + this.weight * rdefence;

				var value = 3 * midfieldLevel +
				0.8 * (lattack + rattack) + 1.4 * cattack +
				0.64 * (ldefence + rdefence) + 1.12 * cdefence;

				var rounded = Math.round(value * 10) / 10;
				return doc.createTextNode(rounded);

			}
		};

		ratingDefs['GardierStats'] = {
			base: 1.0, weight: 4.0,
			label: function() { return Foxtrickl10n.getString('ratings.GardierStats'); },
			title: function() { return Foxtrickl10n.getString('ratings.GardierStats'); },

			total2: function(doc, midfield, leftAtt, centralAtt, rightAtt, leftDef, centralDef,
			                 rightDef, tactics, tacticsLevel) {

				if (tactics == '-1') {
					var font = doc.createElement('font');
					font.setAttribute('color', '#808080');
					font.textContent = '(n/a)';
					return font;
				}
				leftAtt = (this.base + this.weight * leftAtt);
				centralAtt = (this.base + this.weight * centralAtt);
				rightAtt = (this.base + this.weight * rightAtt);

				leftDef = (this.base + this.weight * leftDef);
				centralDef = (this.base + this.weight * centralDef);
				rightDef = (this.base + this.weight * rightDef);

				midfield = (this.base + this.weight * midfield);

				var defense = 0.275 * rightDef + 0.45 * centralDef + 0.275 * leftDef;
				var attack = 0.275 * rightAtt + 0.45 * centralAtt + 0.275 * leftAtt;
				var tempReal = 4.15 * midfield + 2.77 * attack + 2.08 * defense;

				var tempTactica;
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
				if (tactics == 'longshots') {
					var font = doc.createElement('font');
					font.setAttribute('color','#808080');
					font.textContent = rounded;
					return font;
				}
				return doc.createTextNode(rounded);
			}
		};
	}
};
