from Hattrick.Web import HattrickWeb
from Hattrick.Parsers import MenuParser
from Hattrick.Parsers import DenominationsParser
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
		
		for category in sorted(result[lang]["menu"].iterkeys()):
			cat = doc.createElement(category)
			cat.setAttribute("value", result[lang]["menu"][category])
			language.appendChild(cat)
			
				
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
			dict[lang] = languageStuff
			
		print "writing *.xml"
		createXml(dict)
		#print dict
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
