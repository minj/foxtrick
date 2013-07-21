Codes = {}	
Codes[1]='sv-SE';	#swedish
Codes[2]='en';		#english
Codes[3]='de';		#german
Codes[4]='it';		#italian
Codes[5]='fr';		#french
Codes[6]='es-ES';	#spanish
Codes[7]='no';		#Norsk bokmal
Codes[8]='da';		#danish
Codes[9]='fi';		#finnish
Codes[10]='nl';		#Dutch
Codes[11]='pt-PT';	#Portuguese
Codes[12]='ja';		#japan
Codes[13]='pl';		#Polish
Codes[14]='ru';		#Russian
Codes[15]='zh-CN';	#chinese simplified
Codes[17]='ko';		#korean
Codes[19]='tr';		#Turkish
Codes[22]='ar'; 	#arabic
Codes[23]='ro';		#romanian
Codes[25]='is';		#island
Codes[32]='sr';		#serbian
Codes[33]='hu';		#hungarian
Codes[34]='el';		#greek
Codes[35]='cs';		#czech		
Codes[36]='et';		#Eesti
Codes[37]='lv';		#Latvian, Lettish
Codes[39]='hr';		#croatian
Codes[40]='he';		#hebrew
Codes[43]='bg';		#bulgarian
Codes[45]='sl';		#slovenian
Codes[50]='pt-BR';	#Portuguese Brasil
Codes[51]='es-AR';	#spanish, south-america, using sub-language es-AR for crowdin support
Codes[53]='sk';		#Slovak
Codes[55]='vi';		#vietnamese
Codes[56]='lt';		#Lithuanian
Codes[57]='uk';		#ukranian
Codes[58]='bs';		#Bosanski
Codes[65]='vls';	#Vlaams, netherland
Codes[66]='ca';		#Catalan
Codes[74]='gl';		#Galician
Codes[75]='fa';		#farsi, iranian
Codes[83]='mk';		#Macedonian
Codes[84]='be';		#belarus
Codes[85]='sq';		#Albanian
Codes[87]='mt';		#Maltese, Malta
Codes[90]='ka';		#georgian
Codes[100]='az';	#Azerbaijani 
Codes[103]='es-CR';	#spanish, central america, using sub-language es-MX for crowdin support
Codes[109]='fy-NL';	#Frisian, east-netherland/north germany
Codes[110]='eu';	#Euskara, basque
Codes[111]='lb';	#Letzebuergesch
Codes[113]='fur';	#Furlan, northitaly
Codes[136]='nn-NO';	#Norsk nynorsk

def getAll():
	return Codes

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
