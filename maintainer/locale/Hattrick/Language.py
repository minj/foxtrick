Codes = {}	
Codes[1]='se';	
Codes[2]='en';
Codes[3]='de';
Codes[4]='it';
Codes[5]='fr';
Codes[6]='es';
Codes[7]='no';
Codes[8]='dk';
Codes[9]='fi';
Codes[10]='nl';
Codes[11]='pt';
Codes[13]='pl';
Codes[14]='ru';
Codes[15]='zh_CN';
Codes[17]='ko';
Codes[19]='tr';
Codes[22]='ar';
Codes[23]='ro';
Codes[32]='sr';
Codes[33]='hu';
Codes[34]='gr';
Codes[35]='cs';
#Codes[35]='cz';
Codes[36]='ee';
Codes[37]='lv';
Codes[39]='hr';
Codes[40]='he_IL';
Codes[43]='bg';
Codes[45]='sl';
Codes[50]='pt_BR';
Codes[51]='es_SU';
Codes[53]='sk';
Codes[55]='vi';
Codes[56]='lt';
Codes[57]='ua';
Codes[58]='bs';
Codes[65]='nl_BE';
Codes[66]='ca';
Codes[74]='gl_ES';
Codes[75]='fa';
Codes[83]='mk';
Codes[84]='be';
Codes[85]='sq';
Codes[103]='es_ca';
Codes[109]='fy';
Codes[110]='eu_ES';
Codes[111]='lb_LU';
Codes[113]='fur';

def getIdByLanguage(language):
	for key in Codes:
		if Codes[key].lower() == language.lower():
			return key
			
	return None
		
def getLanguageById(id):
	for key in Codes:
		if key == id:
			return Codes[id]

	return None