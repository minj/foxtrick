var ratingDefs = new Array();

ratingDefs["vnukstats"] = { base : 1.0,
                            label : "Vnukstats",
                            title : "Vnukstats",
                            
                         special : function(rattack, cattack, lattack) {
                                                    return this.mystyle(rattack) + " " + this.mystyle(cattack)
                                                     + " " + this.mystyle(lattack);
                                                   },
                                                   
                         total: function(midfieldLevel, attackLevel, defenceLevel) {
                                                    return Math.round(100*(11.0 + 5*midfieldLevel + attackLevel + defenceLevel)/11)/100;
                                    },
                                                    
                         mystyle: function(level) {
                            var lev = this.base+level;
                            var temp = lev + " ";
                            if (temp.search(/\./) > -1) {
                                if (temp.search(/\.25/) > -1) return temp.replace(/\.25/,"-");
                                if (temp.search(/\.5/) > -1)  return temp.replace(/\.5/, "+");
                                if (temp.search(/\.75/) > -1) return temp.replace(/\.75/, "*");
                                
                            } else {
                                return lev+"!";
                            } 
                            
                         }
                       };


                       
ratingDefs["hatstats"] = {   base : 1.0, weight : 4.0, 
                         label : "HatStats",
                         title : "HatStats",
                            
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

ratingDefs["hatstatsold"] = {   
                         
                         label : "HatStats (old)",
                         title : "HatStats (old)",
                            
                         attack : function(attackLevel) {
                                                     return Math.round(100*ratingDefs["hatstats"].attack(attackLevel)/6.0)/100;
                                                   },
                         defence : function(defenceLevel) {
                                                    return Math.round(100*ratingDefs["hatstats"].defence(defenceLevel)/6.0)/100;
                                                },
                         midfield : function(midfieldLevel) {
                                                    return Math.round(100*ratingDefs["hatstats"].midfield(midfieldLevel)/6.0)/100;
                                                        },
                         total: function(midfieldLevel, attackLevel, defenceLevel) {
                                                    return Math.round(100*ratingDefs["hatstats"].total(midfieldLevel, attackLevel, defenceLevel)/18.0)/100;
                                                    }
                       };


ratingDefs["hatstatstotal"] = { label : "HatStats",
                                 title : "HatStats Total only",
                         total: function(midfieldLevel, attackLevel, defenceLevel) {
                                     return ratingDefs["hatstats"].total(midfieldLevel, attackLevel, defenceLevel);
                                }
                       };

                       
ratingDefs["ahpoints"] = {   base : 1.0, weight : 4.0, 
                         label : "AH-poeng",
                         title : "AH-poeng",
                            
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
                                           this.defence( defenceLevel)+
                                           this.midfield(midfieldLevel);
                                }
                       };


ratingDefs["loddarstats"] = {   base : 1.0, weight : 4.0, 
                         label : "LoddarStats",
                         title : "LoddarStats",

                         HQ : function(x) {
                            return 2.0*(x/(x+80));
                         },

                         total2: function( midfieldLevel, lattack, cattack, rattack,
                                                         ldefence, cdefence, rdefence,
                                                        tactics, tacticsLevel
                         ) {

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
                                dump("LoddarStats: " + value);

                                var rounded = Math.round(value*100)/100;

                                //return rounded + " " + getTextRepresentionOfLevel(rounded);
                                return rounded;

                             }

                      };

ratingDefs["peasostats"] = {   base : 1.0, weight : 4.0, 
                         label : "PStats",
                         title : "PStats",
                            
                         total2: function( midfieldLevel, lattack, cattack, rattack,
                                                         ldefence, cdefence, rdefence,
                                                        tactics, tacticsLevel
                         ) {
                            
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


ratingDefs["htitavals"] = {   base : 1.0, weight : 4.0, 
                         label : "HTitaVal",
                         title : "HTitaVal",
                            
                         total2: function( midfieldLevel, lattack, cattack, rattack,
                                                         ldefence, cdefence, rdefence,
                                                        tactics, tacticsLevel
                         ) {
                            
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


ratingDefs["gardierstats"] = {
   base : 1.0, weight : 4.0, 
   label : "GardierStats",
   title : "GardierStats",

   total2: function(midfield, leftAtt, centralAtt, rightAtt, leftDef, centralDef, rightDef, tactics, tacticsLevel) {
                            
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
     return rounded;

   }
 };
 
 /*
ratingDefs["arrating"] = {   base : 1.0, weight : 4.0, 
                         label : "ARating",
                         title : "ARating",
                            
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
*/