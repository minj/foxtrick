from Hattrick.Web import HattrickWeb
from Hattrick.Parsers import MenuParser
from Hattrick.Parsers import DenominationsParser
from Hattrick.Parsers import MatchDetailParser
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
	
def login(username, password):
	ht = HattrickWeb(username, password)
	
	try:
		try:
			ht.login()
		except Exception as e:
			print 'Exception:', e
			exit(1)
			
		dict = {}
		
		for key in Language.Codes:
			languageStuff = {};
			
			print "Crawling ", Language.getLanguageById(key)
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
			
			#go to a specific match where we exactly know where min, max, low, high ratings occur and read the translations from there
			print "Match Details"
			ht.open("/Club/Matches/match.aspx?MatchId=362716448")
			matchDetailParser = MatchDetailParser.MatchDetailParser()
			matchDetailParser.feed(ht.body)
			
			#this is quite fragile to changes in the HT code, so let's have as many checks as possible to throw and error whenever something might be out of order
			matchDetailResult = matchDetailParser.get();
			if len(matchDetailResult["Team_Home"]) != len(matchDetailResult["Team_Away"]):
				raise Exception("Match details returned uneven results")
			elif len(matchDetailResult["Team_Home"]) != 14:
				raise Exception("Match details returned unexpected amount of ratings", len(matchDetailResult["Team_Home"]))			
				
			ratingSubLevels = {}
			ratingSubLevels["min"] = matchDetailResult["Team_Home"][1];
			ratingSubLevels["low"] = matchDetailResult["Team_Home"][0];
			ratingSubLevels["high"] = matchDetailResult["Team_Home"][2];
			ratingSubLevels["max"] = matchDetailResult["Team_Home"][4];
			
			languageStuff["ratingSubLevels"] = ratingSubLevels
			
			dict[lang] = languageStuff
			
		print "writing *.xml"
		createXml(dict)
		
	except Exception as e:
		print 'Exception:', e
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
