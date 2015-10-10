Codes = {}
Codes[1] = 'sv-SE'    # Swedish
Codes[2] = 'en-GB'    # English
Codes[3] = 'de'       # German
Codes[4] = 'it'       # Italian
Codes[5] = 'fr'       # French
Codes[6] = 'es-ES'    # Spanish
Codes[7] = 'no'       # Norsk bokmal
Codes[8] = 'da'       # Danish
Codes[9] = 'fi'       # Finnish
Codes[10] = 'nl'      # Dutch
Codes[11] = 'pt-PT'   # Portuguese
Codes[12] = 'ja'      # Japan
Codes[13] = 'pl'      # Polish
Codes[14] = 'ru'      # Russian
Codes[15] = 'zh-CN'   # Chinese simplified
Codes[17] = 'ko'      # Korean
Codes[19] = 'tr'      # TurkishCodes = {}
Codes[22] = 'ar'      # Arabic
Codes[23] = 'ro'      # Romanian
Codes[25] = 'is'      # Island
Codes[32] = 'sr'      # Serbian
Codes[33] = 'hu'      # Hungarian
Codes[34] = 'el'      # Greek
Codes[35] = 'cs'      # Czech
Codes[36] = 'et'      # Eesti
Codes[37] = 'lv'      # Latvian, Lettish
Codes[38] = 'id'      # Indonesian
Codes[39] = 'hr'      # Croatian
Codes[40] = 'he'      # Hebrew
Codes[43] = 'bg'      # Bulgarian
Codes[45] = 'sl'      # Slovenian
Codes[50] = 'pt-BR'   # Portuguese Brasil
Codes[51] = 'es-AR'   # Spanish, south-america, using sub-language es-AR for crowdin support
Codes[53] = 'sk'      # Slovak
Codes[55] = 'vi'      # Vietnamese
Codes[56] = 'lt'      # Lithuanian
Codes[57] = 'uk'      # Ukranian
Codes[58] = 'bs'      # Bosanski
Codes[65] = 'vls-BE'  # Vlaams, netherland
Codes[66] = 'ca'      # Catalan
Codes[74] = 'gl'      # Galician
Codes[75] = 'fa'      # Farsi, iranian
Codes[83] = 'mk'      # Macedonian
Codes[84] = 'be'      # Belarus
Codes[85] = 'sq'      # Albanian
Codes[87] = 'mt'      # Maltese, Malta
Codes[90] = 'ka'      # Georgian
Codes[100] = 'az'     # Azerbaijani
Codes[103] = 'es-CR'  # Spanish, central america, using sub-language es-MX for crowdin support
Codes[109] = 'fy-NL'  # Frisian, east-netherland/north germany
Codes[110] = 'eu'     # Euskara, basque
Codes[111] = 'lb'     # Letzebuergesch
Codes[113] = 'fur-IT'    #Furlan, northitaly
Codes[136] = 'nn-NO'  # Norsk nynorsk
Codes[151] = 'en-US'  # English (US)

def getAll():
    return Codes

def getIdByLanguage(language):
    for key in Codes:
        if Codes[key].lower() == language.lower():
            return key

    return None

def getLanguageById(lang_id):
    for key in Codes:
        if key == lang_id:
            return Codes[lang_id]

    return None
