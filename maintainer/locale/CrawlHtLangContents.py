from Hattrick.Web import HattrickWeb
from Hattrick.Parsers import MenuParser
from Hattrick.Parsers import DenominationsParser
from Hattrick.Parsers import MatchDetailParser
from Hattrick.Parsers import PlayerDetailParser
from Hattrick import Language

from xml.dom.minidom import Document
def createXml(result):
	doc = Document()

	languages = doc.createElement("languages")
	doc.appendChild(languages)
	for lang in sorted(result.iterkeys()):
		language = doc.createElement("language")
		language.setAttribute("name", lang)
		languages.appendChild(language)
		
		#main menu links
		for category in sorted(result[lang]["menu"].iterkeys()):
			cat = doc.createElement(category)
			cat.setAttribute("value", result[lang]["menu"][category])
			language.appendChild(cat)
			
		#ratingsublevels
		cat = doc.createElement("ratingSubLevels")
		language.appendChild(cat)		
		
		for category in sorted(result[lang]["ratingSubLevels"].iterkeys()):
			level = doc.createElement("level")
			level.setAttribute("text", result[lang]["ratingSubLevels"][category])
			
			if category ==  "min":
				level.setAttribute("index", "0.0");
			elif category ==  "max":
				level.setAttribute("index", "0.75"); 
			elif category ==  "high":
				level.setAttribute("index", "0.50"); 
			elif category ==  "low":
				level.setAttribute("index", "0.25"); 
			else:
				raise Exception("unknown subratings keyword");
			
			cat.appendChild(level)
			
		#specialties
		cat = doc.createElement("specialties")
		language.appendChild(cat)		
		
		for category in sorted(result[lang]["specialties"].iterkeys()):
			level = doc.createElement("specialty")
			level.setAttribute("value", result[lang]["specialties"][category])
			level.setAttribute("type", category)
			level.setAttribute("short", "")
			cat.appendChild(level)
			
		#tactics
		cat = doc.createElement("tactics")
		language.appendChild(cat)		
		
		for category in sorted(result[lang]["tactics"].iterkeys()):
			level = doc.createElement("tactic")
			level.setAttribute("value", result[lang]["tactics"][category])
			level.setAttribute("type", category)
			cat.appendChild(level)
			
		#denominations
		for category in sorted(result[lang]["denominations"].iterkeys()):
			cat = doc.createElement(category)
			language.appendChild(cat)
			index = len(result[lang]["denominations"][category]["names"])-1
			for entry in result[lang]["denominations"][category]["names"]:
				e = doc.createElement("entry")
				e.setAttribute("text", entry)
				e.setAttribute("index", str(index))
				cat.appendChild(e)
				index -= 1
			
	file = open("xml_out.xml", "w")
	file.write(doc.toprettyxml(indent="	", encoding="utf-8"))
	file.close()
	
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
	
def login(username, password):
	ht = HattrickWeb(username, password)
	
	try:
		try:
			ht.login()
		except Exception as e:
			print 'Exception:', e
			exit(1)
			
		dict = {}
		
		index = 0
		for key in Language.Codes:
			languageStuff = {};
			
			index += 1
			print "Crawling ", Language.getLanguageById(key), index, "/", len(Language.Codes)
			ht.setLanguage( key )
			
			print "Main Menu"
			menuParser = MenuParser.MenuParser()
			menuParser.feed(ht.body)
			
			languageStuff["menu"] = menuParser.get();
			
			print "AppDenominations.aspx"
			ht.open("/Help/Rules/AppDenominations.aspx")
			denominationsParser = DenominationsParser.DenominationsParser()
			denominationsParser.feed(ht.body)
			
			lang = Language.getLanguageById(key)
			languageStuff["denominations"] = denominationsParser.get();
			
			# players we know have the required speciality
			players = {"Unpredictable":"323588063",
					"Powerful":"308062307",
					"Quick":"318067207",
					"Technical":"308395915",
					"Head":"317596637",
					"Regainer":"320354435"}
			try:
				languageStuff["specialties"] = getSpecialties(ht, players);
			except:
				print 'Error getting specialties.'
			
			#go to a specific match where we exactly know where min, max, low, high ratings occur and read the translations from there
			print "Match Details"
			print "\t", "going to match with know subratings","( 362716448 )"
			ht.open("/Club/Matches/match.aspx?MatchId=362716448")
			matchDetailParser = MatchDetailParser.MatchDetailParser()
			matchDetailParser.feed(ht.body)
			#this is quite fragile to changes in the HT code, so let's have as many checks as possible to throw and error whenever something might be out of order
			matchDetailResult = matchDetailParser.get();
			matchDetailResult_Text_Ratings = matchDetailResult["textRatings"];
			if len(matchDetailResult_Text_Ratings["Team_Home"]) != len(matchDetailResult_Text_Ratings["Team_Away"]):
				raise Exception("Match details returned uneven results (text ratings)")
			elif len(matchDetailResult_Text_Ratings["Team_Home"]) != 14:
				raise Exception("Match details returned unexpected amount of ratings (text ratings)", len(matchDetailResult_Text_Ratings["Team_Home"]))			
				
			ratingSubLevels = {}
			ratingSubLevels["min"] = matchDetailResult_Text_Ratings["Team_Home"][1];
			ratingSubLevels["low"] = matchDetailResult_Text_Ratings["Team_Home"][0];
			ratingSubLevels["high"] = matchDetailResult_Text_Ratings["Team_Home"][2];
			ratingSubLevels["max"] = matchDetailResult_Text_Ratings["Team_Home"][4];			
			languageStuff["ratingSubLevels"] = ratingSubLevels
			
			# matches where the home team played the desired tactics
			matches = {"normal":"353598577",
					"pressing":"338165777",
					"ca":"362511275",
					"aow":"362716448",
					"aim":"353598573",
					"creatively":"362874929",
					"longshots":"205732724"}
					
			languageStuff["tactics"] = getTactics(ht, matches);
			
			dict[lang] = languageStuff
			
		print "writing *.xml"
		createXml(dict)
		
	except Exception as e:
		print 'Exception:', e
		raise
		exit(1)
			
	except KeyboardInterrupt:
		print 'Aborted by user. Byebye.'
		exit(0)
	

if __name__ == "__main__":
	import os
	import sys
	if len(sys.argv) != 3:
		print "Usage: python", sys.argv[0], "username", "password"
	else:
		login(sys.argv[1],sys.argv[2])	
