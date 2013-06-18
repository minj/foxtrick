from Hattrick.Web import HattrickWeb
#from Hattrick.Parsers import MenuParser
from Hattrick.Parsers import DenominationsParser
from Hattrick.Parsers import MatchDetailParser
from Hattrick.Parsers import PlayerDetailParser
from Hattrick.Parsers import PlayerPageParser
from Hattrick.Parsers import MatchLineUpParser
from Hattrick import Language
import getpass
from xml.dom.minidom import Document

def createDenominationsXML(doc, languageNode, lang, result):
	#denominations
	rename = {}
	rename["gentleness"] = "agreeability";
	rename["skill"] = "levels";
	
	for category in sorted(result[lang]["denominations"].iterkeys()):
		do_rename = False;
		for renamekey in rename:
			if renamekey == category:
				do_rename = True;
				break;
		
		if do_rename:
			cat = doc.createElement(rename[category])
		else:
			cat = doc.createElement(category)
			
		languageNode.appendChild(cat)
		length = len(result[lang]["denominations"][category])
		for idx, entry in enumerate( result[lang]["denominations"][category] ):
			#print category, , entry
			e = doc.createElement("level")
			e.setAttribute("text", entry)
			e.setAttribute("value", str(length - idx - 1))
			cat.appendChild(e)

def createTacticsXML(doc, languageNode, lang, result):
	#tactics
	cat = doc.createElement("tactics")
	languageNode.appendChild(cat)		
	
	for category in sorted(result[lang]["tactics"].iterkeys()):
		level = doc.createElement("tactic")
		level.setAttribute("value", result[lang]["tactics"][category])
		level.setAttribute("type", category)
		cat.appendChild(level)

def createSpecialtiesXML(doc, languageNode, lang, result):
	#specialties
	cat = doc.createElement("specialties")
	languageNode.appendChild(cat)		
	
	for category in sorted(result[lang]["specialties"].iterkeys()):
		level = doc.createElement("specialty")
		level.setAttribute("value", result[lang]["specialties"][category])
		level.setAttribute("type", category)
		level.setAttribute("short", "")
		cat.appendChild(level)

def createRatingSubLevelsXML(doc, languageNode, lang, result):
	#ratingsublevels
	cat = doc.createElement("ratingSubLevels")
	languageNode.appendChild(cat)		

	for category in result[lang]["ratingSubLevels"].iterkeys():
		level = doc.createElement("sublevel")
		level.setAttribute("text", result[lang]["ratingSubLevels"][category])
		
		if category ==  "min":
			level.setAttribute("value", "0.0");
		elif category ==  "max":
			level.setAttribute("value", "0.75"); 
		elif category ==  "high":
			level.setAttribute("value", "0.50"); 
		elif category ==  "low":
			level.setAttribute("value", "0.25"); 
		else:
			raise Exception("unknown subratings keyword");
		
		cat.appendChild(level)

# def createMenuLinksXML(doc, languageNode, lang, result):
# 	for category in result[lang]["menu"].iterkeys():
# 		cat = doc.createElement(category)
# 		cat.setAttribute("value", result[lang]["menu"][category])
# 		languageNode.appendChild(cat)
		
def createPositionsXML(doc, languageNode, lang, result):
	#positions
	cat = doc.createElement("positions")
	languageNode.appendChild(cat)	
	en = result['en']
	en_positions = en["positions"]
	
	for position in sorted(en["positions"]):
		p = doc.createElement("position")
		p.setAttribute("type", en_positions[position]['long'])
		
		p.setAttribute("short", "");
		for entries in result[lang]["positions"][position]:
			if entries == 'short':
				p.setAttribute("short", result[lang]["positions"][position]['short']);
			if entries == 'long':		
				p.setAttribute("value", result[lang]["positions"][position]['long'])
	
		cat.appendChild(p)

def createXml(result, outfile):
	doc = Document()
	
	languages = doc.createElement("languages")
	doc.appendChild(languages)
	for lang in sorted(result.iterkeys()):
		language = doc.createElement("language")
		language.setAttribute("name", lang)
		languages.appendChild(language)
			
		#createMenuLinksXML(doc, language, lang, result)
		createPositionsXML(doc, language, lang, result)
		createRatingSubLevelsXML(doc, language, lang, result)
		createSpecialtiesXML(doc, language, lang, result)
		createTacticsXML(doc, language, lang, result)
		createDenominationsXML(doc, language, lang, result)
			
	file = open( outfile, "w")
	file.write(doc.toprettyxml(indent="	", encoding="utf-8"))
	file.close()
	
	
# XML Stuff over, information aggression comming up
def getSpecialties(ht, players):
	specialties = {}
	for key in players:
		print "\t", "going to specified", key, "player (", players[key], ")"
		ht.open("/Club/Players/Player.aspx?PlayerID=" + players[key])
		playerDetailParser = PlayerDetailParser.PlayerDetailParser()
		playerDetailParser.feed(ht.body)
		result =  playerDetailParser.get()
		if len(result) == 0:
			continue;
			
		if len(result) != 6:
			raise Exception("unexpected player details result")
		else:
			specialties[key] = playerDetailParser.get()[5]
		
	return specialties
	
def getTactics(ht, matches):
	tactics = {}
	for key in matches:
		print "\t", "going to specified", key, "match (", matches[key], ")"
		ht.open("/Club/Matches/Match.aspx?matchID=" + matches[key])
		matchDetailParser = MatchDetailParser.MatchDetailParser()
		matchDetailParser.feed(ht.body)
		result =  matchDetailParser.get()["unclassedRatings"]
		
		try:
			if len(result["Team_Home"]) != len(result["Team_Away"]):
				raise Exception("Match details returned uneven results (getTactics)")
			elif len(result["Team_Home"]) != 2:
				raise Exception("Match details returned unexpected amount of ratings (getTactics)", len(result["Team_Home"]))
		except Exception as e:
			print e, "skipping this match"
			continue;
			
		result = result["Team_Home"]
		if len(result) == 0:
			continue;
			
		if len(result) != 2:
			raise Exception("unexpected match details result (get tactics)")
		else:
			tactics[key] = result[1]
			
	return tactics
	
def getPlayersFromLineUp(ht, teamid, matchid):
	print "\t", 'going to specified Match-Lineup Page','(', 'matchID='+ str(matchid) + '&TeamId=' + str(teamid),' )'
	ht.open('/Club/Matches/MatchLineup.aspx?matchID=' + str(matchid) + '&TeamId=' + str(teamid));
	matchLineUpParser = MatchLineUpParser.MatchLineUpParser()
	matchLineUpParser.feed(ht.body)
	players = matchLineUpParser.get();
	
	return players
	
def getPlayersByTeam(ht, teamid):
	#positions
	print "\t", "going to specified player page","(",teamid,")"
	ht.open('/Club/Players/?TeamID=' + str(teamid));
	playerPageParser = PlayerPageParser.PlayerPageParser()
	playerPageParser.feed(ht.body)
	players = playerPageParser.get();
		
	return players
	
def translatePositions( source ):
	
	en = source['en']
	# Position names taken from a teams player overview
	lookup_players = {}
	en_players = en['players']
	for player in en_players:
		if 'lastposition' not in player:
			continue;
			
		if player['lastposition'] == 'Keeper':
			lookup_players[player['lastposition']] = player['id']
		elif player['lastposition'] == 'Central defender':
			lookup_players[player['lastposition']] = player['id']
		elif player['lastposition'] == 'Wing back':
			lookup_players[player['lastposition']] = player['id']
		elif player['lastposition'] == 'Inner midfielder':
			lookup_players[player['lastposition']] = player['id']
		elif player['lastposition'] == 'Winger':
			lookup_players[player['lastposition']] = player['id']
		elif player['lastposition'] == 'Forward':
			lookup_players[player['lastposition']] = player['id']
			
	# position abbreviations
	# WB and WI are not supported because the lineup page makes a difference wether a
	# player played on the right or the left
	lookup_lineup = {}
	en_lineup = en['lineup']
	for player in en_lineup:
		if player['position_abbr'] == 'GK':
			lookup_lineup[player['position_abbr']] = player['id']
		elif player['position_abbr'] == 'CD':
			lookup_lineup[player['position_abbr']] = player['id']
		#elif player['position_abbr'] == 'WB':
		#	lookup_lineup[player['position_abbr']] = player['id']
		elif player['position_abbr'] == 'IM':
			lookup_lineup[player['position_abbr']] = player['id']
		#elif player['position_abbr'] == 'WI':
		#	lookup_lineup[player['position_abbr']] = player['id']
		elif player['position_abbr'] == 'FW':
			lookup_lineup[player['position_abbr']] = player['id']

	for language in source:
		languageDict = {}
		for position in lookup_players:
			position_player = lookup_players[position]
			for player in source[language]['players']:
				if player['id'] == position_player:
					translated = player['lastposition']
					languageDict[position] = {'long': translated }
					continue;
			
		# map english shortcuts to english full versions so we can access them later
		map = {}
		map["GK"] = "Keeper";
		map["CD"] = "Central defender";
		map["IM"] = "Inner midfielder";
		map["FW"] = "Forward";
		
		for position in lookup_lineup:
			position_player = lookup_lineup[position]
			for player in source[language]['lineup']:
				if player['id'] == position_player:
					translated = player['position_abbr']
					languageDict[map[position]]['short'] = translated
					continue;
		
		source[language]['positions'] = languageDict
		source[language]['players'] = None; #delete players
		source[language]['lineup'] = None; #delete players
		
	return source
	
	
def login(username, password):
	#use stage for now
	ht = HattrickWeb(username, password, stage=False)
	try:
		ht.login()
	except Exception as e:
		print e
		return False, None
	
	return True, ht;
			
def crawl(ht, language_id_list = Language.Codes, outfile = 'crawled.xml'):
	try:	
		dict = {}
		index = 0
		
		for key in language_id_list:
			languageStuff = {};
			
			index += 1
			print "Crawling ", Language.getLanguageById(key), index, "/", len( language_id_list )
			ht.setLanguage( key )
			
			#print "Main Menu"
			#menuParser = MenuParser.MenuParser()
			#menuParser.feed(ht.body)
			
			#languageStuff["menu"] = menuParser.get();
			
			print "AppDenominations.aspx"
			ht.open("/Help/Rules/AppDenominations.aspx")
			denominationsParser = DenominationsParser.DenominationsParser()
			denominationsParser.feed(ht.body)
			
			lang = Language.getLanguageById(key)
			languageStuff["denominations"] = denominationsParser.get();
			
			print "Specialties"
			try:
				languageStuff["specialties"] = getSpecialties(ht, specialty_players);
			except:
				print 'Error getting specialties.'
			
			#go to a specific match where we exactly know where min, max, low, high ratings occur and read the translations from there
			print "Match Details"
			print "\t", "going to match with known subratings","(",str(sublevel_match['MatchId']),")"
			ht.open("/Club/Matches/match.aspx?MatchId=" + str(sublevel_match['MatchId']))
			matchDetailParser = MatchDetailParser.MatchDetailParser()
			matchDetailParser.feed(ht.body)
			#this is quite fragile to changes in the HT code, so let's have as many checks as possible to throw and error whenever something might be out of order
			matchDetailResult = matchDetailParser.get();
			matchDetailResult_Text_Ratings = matchDetailResult["textRatings"];
			if len(matchDetailResult_Text_Ratings["Team_Home"]) != len(matchDetailResult_Text_Ratings["Team_Away"]):
				raise Exception("Match details returned uneven results (text ratings)")
			elif len(matchDetailResult_Text_Ratings["Team_Home"]) != 14:
				raise Exception("Match details returned unexpected amount of ratings (text ratings)", len(matchDetailResult_Text_Ratings["Team_Home"]))			
			
			#define positions of min. low high max. here
			ratingSubLevels = {}
			ratingSubLevels["min"] = matchDetailResult_Text_Ratings["Team_Home"][sublevel_match['order'][0]];
			ratingSubLevels["low"] = matchDetailResult_Text_Ratings["Team_Home"][sublevel_match['order'][1]];
			ratingSubLevels["high"] = matchDetailResult_Text_Ratings["Team_Home"][sublevel_match['order'][2]];
			ratingSubLevels["max"] = matchDetailResult_Text_Ratings["Team_Home"][sublevel_match['order'][3]];			
			languageStuff["ratingSubLevels"] = ratingSubLevels
			
			print "Tactics"		
			languageStuff["tactics"] = getTactics(ht, tactic_matches);
			
			print "Positions"
			languageStuff['players'] = getPlayersByTeam(ht, all_positions_match_team)
			
			tId = position_abbreviation_lineup['TeamId']
			mId = position_abbreviation_lineup['MatchId']
			languageStuff['lineup'] = getPlayersFromLineUp(ht, tId, mId)
			
			dict[lang] = languageStuff
		
		#get position translations
		dict = translatePositions( dict )
			
		print "writing *.xml"
		createXml(dict, outfile)
		
	except Exception as e:
		print 'Exception:', e
		raise
		exit(1)
			
	except KeyboardInterrupt:
		print 'Aborted by user. Byebye.'
		exit(0)
	

# matches where the home team played the desired tactics
tactic_matches = {"normal":"353598577",
		"pressing":"338165777",
		"ca":"362511275",
		"aow":"362716448",
		"aim":"353598573",
		"creatively":"362874929",
		"longshots":"205732724"}
		
# players we know have the required speciality
specialty_players = {"Unpredictable":"323588063",
		"Powerful":"308062307",
		"Quick":"318067207",
		"Technical":"308395915",
		"Head":"317596637",
		"Regainer":"320354435"}
	
#teamid of a team where all positions are displayed in the "last match date" area 
#all_positions_match_team = 132905

#sublevel match
#id to a match where the hometeam had min. low high max. ratings
# @ matchid
# @ order, array of 4, index of where hometeam reached min.,low, high, max. in this order
sublevel_match = {'MatchId':362716448, 'order':[1,0,2,4]}

# combination of teamid / matchid for a lineup where all positions are shown
# -keeper, inner mf, wingback, winger, forward, center defender
position_abbreviation_lineup = {'TeamId':822514, 'MatchId':353598578}
		
if __name__ == "__main__":
	import os
	import sys
	
	user = raw_input("Login: ");
	pw = getpass.getpass("Password:");
	outfile = raw_input("Outfile (*.xml): ");
	print "Locale code (\"all\" for all)"
	locales = raw_input("Seperate by whitespace to specify multiple languages: ").split()
	all_positions_match_team = raw_input("TeamId where all positions have been played in last match (like bots always do): ")
	
	locales_array = []
	
	if "en" not in locales and "all" not in locales:
		print "Adding 'en' since it's required for positions and such"
		locales_array.append( Language.getIdByLanguage( "en" ) )
		
	for loc in locales:
		if loc.lower() == "all":
			locales_array = Language.getAll()
			break;
		else:
			locales_array.append( Language.getIdByLanguage( loc ) );
	
	success = False
	success, ht = login( user, pw )
	
	while not success:
		user = raw_input("Login:");
		pw = raw_input("Password:");
		success, ht = login( user, pw )
		
	crawl(ht, locales_array, outfile)